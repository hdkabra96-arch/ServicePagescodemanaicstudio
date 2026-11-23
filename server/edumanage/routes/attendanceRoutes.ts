import express from 'express';
import { generateEduId, getEduManageDb } from '../db.ts';
import {
  AuthenticatedEduRequest,
  requireEduAuth,
  requireEduRole,
  writeEduAuditLog
} from '../security.ts';
import type {
  MonthlyAttendanceRow,
  StudentAttendanceEntry,
  StudentAttendanceHistoryItem
} from '../../../src/types/edumanage.ts';

const VALID_ATT_STATUSES = new Set(['present', 'absent', 'late', 'excused']);

function getCurrentSessionId(db: ReturnType<typeof getEduManageDb>): string {
  const row = db
    .prepare('SELECT id FROM academic_sessions ORDER BY is_current DESC, start_date DESC LIMIT 1')
    .get() as any;
  if (!row) throw new Error('No active academic session found.');
  return row.id;
}

export function createEduManageAttendanceRouter(): express.Router {
  const router = express.Router();

  // Class-wise daily student attendance register
  router.get(
    '/attendance/students',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin', 'principal', 'teacher']),
    (req, res) => {
      const db = getEduManageDb();
      const classId = String(req.query.classId || '').trim();
      const sectionId = String(req.query.sectionId || '').trim();
      const dateStr = String(req.query.date || new Date().toISOString().slice(0, 10)).trim();

      if (!classId || !sectionId) {
        return res.status(400).json({
          success: false,
          message: 'classId and sectionId query parameters are required.'
        });
      }

      const rows = db
        .prepare(`
          SELECT s.id AS student_id,
                 s.admission_number,
                 s.roll_number,
                 s.first_name,
                 s.last_name,
                 s.current_class_id,
                 s.current_section_id,
                 sa.id AS att_id,
                 sa.status AS att_status,
                 sa.remarks AS att_remarks
          FROM students s
          LEFT JOIN student_attendance sa
            ON sa.student_id = s.id AND sa.attendance_date = ?
          WHERE s.current_class_id = ?
            AND s.current_section_id = ?
            AND s.status = 'active'
          ORDER BY CAST(s.roll_number AS INTEGER) ASC, s.roll_number ASC, s.first_name ASC
        `)
        .all(dateStr, classId, sectionId) as any[];

      const data: StudentAttendanceEntry[] = rows.map((r) => ({
        attendanceId: r.att_id || undefined,
        studentId: r.student_id,
        admissionNumber: r.admission_number,
        rollNumber: r.roll_number || '',
        studentName: `${r.first_name} ${r.last_name}`.trim(),
        classId: r.current_class_id,
        sectionId: r.current_section_id,
        attendanceDate: dateStr,
        status: (r.att_status || 'present') as StudentAttendanceEntry['status'],
        remarks: r.att_remarks || '',
        marked: Boolean(r.att_id)
      }));

      return res.json({ success: true, data });
    }
  );

  // Bulk upsert daily student attendance for a class/section
  router.post(
    '/attendance/students',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin', 'principal', 'teacher']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const classId = String(req.body?.classId || '').trim();
      const sectionId = String(req.body?.sectionId || '').trim();
      const dateStr = String(req.body?.date || new Date().toISOString().slice(0, 10)).trim();
      const entries = Array.isArray(req.body?.entries) ? req.body.entries : [];

      if (!classId || !sectionId || !dateStr || entries.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'classId, sectionId, date, and at least one attendance entry are required.'
        });
      }

      const secCheck = db
        .prepare('SELECT id FROM sections WHERE id = ? AND class_id = ?')
        .get(sectionId, classId);
      if (!secCheck) {
        return res.status(400).json({
          success: false,
          message: 'Selected section does not belong to the chosen class.'
        });
      }

      for (const e of entries) {
        if (!e?.studentId || !VALID_ATT_STATUSES.has(String(e?.status || ''))) {
          return res.status(400).json({
            success: false,
            message: 'Every attendance entry requires a valid studentId and status.'
          });
        }
      }

      const sessionId = getCurrentSessionId(db);
      const tx = db.transaction(() => {
        const upsert = db.prepare(`
          INSERT INTO student_attendance (
            id, student_id, class_id, section_id, session_id, attendance_date, status, remarks, marked_by, is_demo
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
          ON CONFLICT(student_id, attendance_date) DO UPDATE SET
            class_id = excluded.class_id,
            section_id = excluded.section_id,
            status = excluded.status,
            remarks = excluded.remarks,
            marked_by = excluded.marked_by,
            is_demo = 0
        `);

        for (const e of entries) {
          upsert.run(
            generateEduId('edu_att'),
            String(e.studentId),
            classId,
            sectionId,
            sessionId,
            dateStr,
            String(e.status),
            String(e.remarks || '').trim(),
            req.eduUser!.id
          );
        }
      });
      tx();

      const presentCount = entries.filter((e: any) => e.status === 'present' || e.status === 'late').length;
      writeEduAuditLog({
        req,
        action: 'STUDENT_ATTENDANCE_MARKED',
        module: 'attendance',
        entityId: sectionId,
        details: { classId, sectionId, date: dateStr, total: entries.length, presentCount }
      });

      return res.json({
        success: true,
        message: `Attendance saved for ${dateStr} (${presentCount}/${entries.length} present/late).`,
        data: { date: dateStr, total: entries.length, presentCount }
      });
    }
  );

  // Monthly attendance summary report per student (live SQL aggregation)
  router.get(
    '/attendance/monthly',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin', 'principal', 'teacher', 'accountant']),
    (req, res) => {
      const db = getEduManageDb();
      const month = String(req.query.month || new Date().toISOString().slice(0, 7)).trim();
      const classId = String(req.query.classId || '').trim();
      const sectionId = String(req.query.sectionId || '').trim();

      if (!/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ success: false, message: 'Month must use YYYY-MM format.' });
      }

      const where: string[] = ["s.status = 'active'"];
      const params: unknown[] = [`${month}%`];

      if (classId) {
        where.push('s.current_class_id = ?');
        params.push(classId);
      }
      if (sectionId) {
        where.push('s.current_section_id = ?');
        params.push(sectionId);
      }

      const rows = db
        .prepare(`
          SELECT s.id AS student_id,
                 s.admission_number,
                 s.roll_number,
                 s.first_name,
                 s.last_name,
                 c.name AS class_name,
                 sec.name AS section_name,
                 SUM(CASE WHEN sa.status = 'present' THEN 1 ELSE 0 END) AS present_days,
                 SUM(CASE WHEN sa.status = 'absent' THEN 1 ELSE 0 END) AS absent_days,
                 SUM(CASE WHEN sa.status = 'late' THEN 1 ELSE 0 END) AS late_days,
                 SUM(CASE WHEN sa.status = 'excused' THEN 1 ELSE 0 END) AS excused_days,
                 COUNT(sa.id) AS total_marked
          FROM students s
          JOIN classes c ON c.id = s.current_class_id
          JOIN sections sec ON sec.id = s.current_section_id
          LEFT JOIN student_attendance sa
            ON sa.student_id = s.id AND sa.attendance_date LIKE ?
          WHERE ${where.join(' AND ')}
          GROUP BY s.id
          ORDER BY c.numeric_order ASC, sec.name ASC, CAST(s.roll_number AS INTEGER) ASC, s.first_name ASC
        `)
        .all(...params) as any[];

      const students: MonthlyAttendanceRow[] = rows.map((r) => {
        const present = Number(r.present_days || 0);
        const late = Number(r.late_days || 0);
        const absent = Number(r.absent_days || 0);
        const excused = Number(r.excused_days || 0);
        const total = Number(r.total_marked || 0);
        return {
          studentId: r.student_id,
          admissionNumber: r.admission_number,
          rollNumber: r.roll_number || '',
          studentName: `${r.first_name} ${r.last_name}`.trim(),
          className: r.class_name,
          sectionName: r.section_name,
          presentDays: present,
          absentDays: absent,
          lateDays: late,
          excusedDays: excused,
          totalMarked: total,
          attendancePct: total > 0 ? Math.round(((present + late) / total) * 100) : 0
        };
      });

      const withData = students.filter((s) => s.totalMarked > 0);
      const averagePct =
        withData.length > 0
          ? Math.round(withData.reduce((sum, s) => sum + s.attendancePct, 0) / withData.length)
          : 0;

      return res.json({
        success: true,
        data: { month, averagePct, students }
      });
    }
  );

  // Student individual attendance history (scoped strictly for student/parent roles)
  router.get('/attendance/student/:studentId', requireEduAuth, (req: AuthenticatedEduRequest, res) => {
    const db = getEduManageDb();
    const studentId = req.params.studentId;
    const user = req.eduUser!;

    const student = db
      .prepare(`
        SELECT s.*, p.user_id AS parent_user_id
        FROM students s
        LEFT JOIN parents p ON p.id = s.parent_id
        WHERE s.id = ?
      `)
      .get(studentId) as any;

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    if (user.role === 'student' && student.user_id !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Students can only view their own attendance history.'
      });
    }
    if (user.role === 'parent' && student.parent_user_id !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Parents can only view attendance history for their linked children.'
      });
    }
    if (!['super_admin', 'school_admin', 'principal', 'teacher', 'student', 'parent'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Not permitted to view attendance history.' });
    }

    const rows = db
      .prepare(`
        SELECT sa.*, c.name AS class_name, sec.name AS section_name
        FROM student_attendance sa
        JOIN classes c ON c.id = sa.class_id
        JOIN sections sec ON sec.id = sa.section_id
        WHERE sa.student_id = ?
        ORDER BY sa.attendance_date DESC
        LIMIT 60
      `)
      .all(studentId) as any[];

    const history: StudentAttendanceHistoryItem[] = rows.map((r) => ({
      id: r.id,
      attendanceDate: r.attendance_date,
      status: r.status,
      remarks: r.remarks || '',
      className: r.class_name,
      sectionName: r.section_name
    }));

    const totalDays = history.length;
    const presentDays = history.filter((h) => h.status === 'present').length;
    const lateDays = history.filter((h) => h.status === 'late').length;
    const absentDays = history.filter((h) => h.status === 'absent').length;
    const excusedDays = history.filter((h) => h.status === 'excused').length;

    return res.json({
      success: true,
      data: {
        studentId,
        studentName: `${student.first_name} ${student.last_name}`.trim(),
        summary: {
          totalDays,
          presentDays,
          lateDays,
          absentDays,
          excusedDays,
          percentage: totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 0
        },
        history
      }
    });
  });

  return router;
}

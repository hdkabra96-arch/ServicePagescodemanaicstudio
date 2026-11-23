import express from 'express';
import { generateEduId, getEduManageDb } from '../db.ts';
import {
  AuthenticatedEduRequest,
  hashEduPasswordSync,
  requireEduAuth,
  requireEduRole,
  writeEduAuditLog
} from '../security.ts';
import type {
  TeacherAllocationRecord,
  TeacherAttendanceRecord,
  TeacherDetailRecord,
  TeacherRecord
} from '../../../src/types/edumanage.ts';

const VALID_EMPLOYMENT_TYPES = new Set(['full_time', 'part_time', 'visiting']);
const VALID_TEACHER_STATUSES = new Set(['active', 'on_leave', 'resigned']);
const VALID_ATT_STATUSES = new Set(['present', 'absent', 'late', 'half_day', 'on_leave']);

function getCurrentSessionId(db: ReturnType<typeof getEduManageDb>): string {
  const row = db
    .prepare('SELECT id FROM academic_sessions ORDER BY is_current DESC, start_date DESC LIMIT 1')
    .get() as any;
  if (!row) throw new Error('No academic session configured.');
  return row.id;
}

function generateEmployeeId(db: ReturnType<typeof getEduManageDb>): string {
  const countRow = db.prepare('SELECT COUNT(*) AS cnt FROM teachers').get() as any;
  let seq = Number(countRow?.cnt || 0) + 1;
  while (true) {
    const candidate = `EMP-${String(seq).padStart(3, '0')}`;
    const dup = db.prepare('SELECT id FROM teachers WHERE employee_id = ?').get(candidate);
    if (!dup) return candidate;
    seq += 1;
  }
}

function buildTeacherRecords(
  db: ReturnType<typeof getEduManageDb>,
  includeSalary: boolean,
  filter?: { q?: string; department?: string; status?: string; teacherId?: string }
): TeacherRecord[] {
  const todayStr = new Date().toISOString().slice(0, 10);
  const where: string[] = [];
  const params: unknown[] = [todayStr];

  if (filter?.teacherId) {
    where.push('t.id = ?');
    params.push(filter.teacherId);
  }
  if (filter?.q) {
    where.push(`(
      LOWER(u.full_name) LIKE ?
      OR LOWER(t.employee_id) LIKE ?
      OR LOWER(u.email) LIKE ?
      OR LOWER(t.department) LIKE ?
      OR LOWER(t.designation) LIKE ?
    )`);
    const like = `%${filter.q.toLowerCase()}%`;
    params.push(like, like, like, like, like);
  }
  if (filter?.department) {
    where.push('LOWER(t.department) = LOWER(?)');
    params.push(filter.department);
  }
  if (filter?.status && VALID_TEACHER_STATUSES.has(filter.status)) {
    where.push('t.status = ?');
    params.push(filter.status);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  const rows = db
    .prepare(`
      SELECT t.*,
             u.full_name,
             u.email,
             u.phone,
             (SELECT ta.status FROM teacher_attendance ta WHERE ta.teacher_id = t.id AND ta.attendance_date = ? LIMIT 1) AS today_att_status
      FROM teachers t
      JOIN users u ON u.id = t.user_id
      ${whereSql}
      ORDER BY t.employee_id ASC
    `)
    .all(...params) as any[];

  const allocRows = db
    .prepare(`
      SELECT tsa.*,
             c.name AS class_name,
             sec.name AS section_name,
             sub.code AS subject_code,
             sub.name AS subject_name,
             sess.name AS session_name
      FROM teacher_subject_allocations tsa
      JOIN classes c ON c.id = tsa.class_id
      JOIN sections sec ON sec.id = tsa.section_id
      JOIN subjects sub ON sub.id = tsa.subject_id
      JOIN academic_sessions sess ON sess.id = tsa.session_id
      ORDER BY c.numeric_order ASC, sec.name ASC, sub.name ASC
    `)
    .all() as any[];

  const allocByTeacher = new Map<string, TeacherAllocationRecord[]>();
  for (const a of allocRows) {
    const list = allocByTeacher.get(a.teacher_id) || [];
    list.push({
      id: a.id,
      teacherId: a.teacher_id,
      classId: a.class_id,
      className: a.class_name,
      sectionId: a.section_id,
      sectionName: a.section_name,
      subjectId: a.subject_id,
      subjectCode: a.subject_code,
      subjectName: a.subject_name,
      sessionId: a.session_id,
      sessionName: a.session_name
    });
    allocByTeacher.set(a.teacher_id, list);
  }

  const homeroomRows = db
    .prepare(`
      SELECT sec.id AS section_id, sec.name AS section_name, sec.class_teacher_id, c.name AS class_name
      FROM sections sec
      JOIN classes c ON c.id = sec.class_id
      WHERE sec.class_teacher_id IS NOT NULL
    `)
    .all() as any[];

  const homeroomByTeacher = new Map<string, { sectionId: string; className: string; sectionName: string }[]>();
  for (const hr of homeroomRows) {
    const list = homeroomByTeacher.get(hr.class_teacher_id) || [];
    list.push({
      sectionId: hr.section_id,
      className: hr.class_name,
      sectionName: hr.section_name
    });
    homeroomByTeacher.set(hr.class_teacher_id, list);
  }

  return rows.map((r) => {
    const allocations = allocByTeacher.get(r.id) || [];
    return {
      id: r.id,
      userId: r.user_id,
      employeeId: r.employee_id,
      fullName: r.full_name,
      email: r.email,
      phone: r.phone || '',
      designation: r.designation,
      department: r.department,
      qualification: r.qualification || '',
      experienceYears: Number(r.experience_years || 0),
      joiningDate: r.joining_date,
      salaryMonthly: includeSalary ? Number(r.salary_monthly || 0) : null,
      employmentType: r.employment_type,
      status: r.status,
      todayAttendanceStatus: r.today_att_status || null,
      allocationsCount: allocations.length,
      allocations,
      homeroomSections: homeroomByTeacher.get(r.id) || [],
      isDemo: Boolean(r.is_demo),
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  });
}

export function createEduManageTeacherRouter(): express.Router {
  const router = express.Router();

  // Daily teacher attendance register (GET)
  router.get(
    '/teachers/attendance/daily',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin', 'principal']),
    (req, res) => {
      const db = getEduManageDb();
      const dateStr = String(req.query.date || new Date().toISOString().slice(0, 10)).trim();

      const rows = db
        .prepare(`
          SELECT t.id AS teacher_id,
                 t.employee_id,
                 t.department,
                 t.designation,
                 u.full_name AS teacher_name,
                 ta.id AS att_id,
                 ta.status AS att_status,
                 ta.check_in_time,
                 ta.check_out_time,
                 ta.remarks
          FROM teachers t
          JOIN users u ON u.id = t.user_id
          LEFT JOIN teacher_attendance ta ON ta.teacher_id = t.id AND ta.attendance_date = ?
          WHERE t.status != 'resigned'
          ORDER BY t.employee_id ASC
        `)
        .all(dateStr) as any[];

      const data: TeacherAttendanceRecord[] = rows.map((r) => ({
        id: r.att_id || undefined,
        teacherId: r.teacher_id,
        employeeId: r.employee_id,
        teacherName: r.teacher_name,
        department: r.department,
        designation: r.designation,
        attendanceDate: dateStr,
        status: r.att_status || 'present',
        checkInTime: r.check_in_time || '08:00',
        checkOutTime: r.check_out_time || '',
        remarks: r.remarks || ''
      }));

      return res.json({ success: true, data });
    }
  );

  // Save daily teacher attendance register (bulk upsert in transaction)
  router.post(
    '/teachers/attendance/daily',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin', 'principal']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const dateStr = String(req.body?.date || new Date().toISOString().slice(0, 10)).trim();
      const entries = Array.isArray(req.body?.entries) ? req.body.entries : [];

      if (!dateStr || entries.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Attendance date and at least one teacher entry are required.'
        });
      }

      for (const entry of entries) {
        if (!entry?.teacherId || !VALID_ATT_STATUSES.has(String(entry?.status || ''))) {
          return res.status(400).json({
            success: false,
            message: 'Each attendance row must specify a valid teacherId and status.'
          });
        }
      }

      const tx = db.transaction(() => {
        const upsert = db.prepare(`
          INSERT INTO teacher_attendance (
            id, teacher_id, attendance_date, status, check_in_time, check_out_time, remarks, marked_by, is_demo
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
          ON CONFLICT(teacher_id, attendance_date) DO UPDATE SET
            status = excluded.status,
            check_in_time = excluded.check_in_time,
            check_out_time = excluded.check_out_time,
            remarks = excluded.remarks,
            marked_by = excluded.marked_by,
            is_demo = 0
        `);

        for (const entry of entries) {
          upsert.run(
            generateEduId('edu_tatt'),
            String(entry.teacherId),
            dateStr,
            String(entry.status),
            entry.checkInTime ? String(entry.checkInTime).trim() : null,
            entry.checkOutTime ? String(entry.checkOutTime).trim() : null,
            String(entry.remarks || '').trim(),
            req.eduUser!.id
          );
        }
      });
      tx();

      writeEduAuditLog({
        req,
        action: 'TEACHER_ATTENDANCE_SAVED',
        module: 'teachers',
        details: { date: dateStr, count: entries.length }
      });

      return res.json({
        success: true,
        message: `Teacher attendance saved for ${dateStr} (${entries.length} faculty records).`,
        data: { date: dateStr, count: entries.length }
      });
    }
  );

  // List & filter teachers
  router.get(
    '/teachers',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin', 'principal', 'teacher', 'accountant']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const role = req.eduUser!.role;
      const includeSalary = ['super_admin', 'school_admin', 'principal', 'accountant'].includes(role);
      const data = buildTeacherRecords(db, includeSalary, {
        q: String(req.query.q || '').trim(),
        department: String(req.query.department || '').trim(),
        status: String(req.query.status || '').trim()
      });
      return res.json({ success: true, data });
    }
  );

  // Single teacher profile + attendance history
  router.get(
    '/teachers/:id',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin', 'principal', 'teacher', 'accountant']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const includeSalary = ['super_admin', 'school_admin', 'principal', 'accountant'].includes(
        req.eduUser!.role
      );
      const list = buildTeacherRecords(db, includeSalary, { teacherId: req.params.id });
      if (list.length === 0) {
        return res.status(404).json({ success: false, message: 'Teacher record not found.' });
      }

      const attRows = db
        .prepare(`
          SELECT * FROM teacher_attendance
          WHERE teacher_id = ?
          ORDER BY attendance_date DESC
          LIMIT 20
        `)
        .all(req.params.id) as any[];

      const detail: TeacherDetailRecord = {
        ...list[0],
        recentAttendance: attRows.map((a) => ({
          id: a.id,
          teacherId: a.teacher_id,
          attendanceDate: a.attendance_date,
          status: a.status,
          checkInTime: a.check_in_time || '',
          checkOutTime: a.check_out_time || '',
          remarks: a.remarks || ''
        }))
      };

      return res.json({ success: true, data: detail });
    }
  );

  // Register a new teacher (transactional user + teacher profile)
  router.post(
    '/teachers',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const body = req.body || {};

      const fullName = String(body.fullName || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const phone = String(body.phone || '').trim();
      const designation = String(body.designation || 'Subject Teacher').trim() || 'Subject Teacher';
      const department = String(body.department || 'Academics').trim() || 'Academics';
      const qualification = String(body.qualification || '').trim();
      const experienceYears = Math.max(0, Number(body.experienceYears || 0));
      const joiningDate = String(body.joiningDate || new Date().toISOString().slice(0, 10)).trim();
      const salaryMonthly = Math.max(0, Number(body.salaryMonthly || 0));
      const employmentType = String(body.employmentType || 'full_time').trim();
      const portalPassword = String(body.portalPassword || 'EduTeacher@2026!');
      const requestedEmpId = String(body.employeeId || '').trim().toUpperCase();

      if (!fullName || !email) {
        return res.status(400).json({ success: false, message: 'Full name and email are required.' });
      }
      if (!VALID_EMPLOYMENT_TYPES.has(employmentType)) {
        return res.status(400).json({ success: false, message: 'Invalid employment type.' });
      }
      if (portalPassword.length < 8) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
      }
      if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
        return res.status(409).json({ success: false, message: `Email "${email}" is already registered.` });
      }

      const employeeId = requestedEmpId || generateEmployeeId(db);
      if (db.prepare('SELECT id FROM teachers WHERE employee_id = ?').get(employeeId)) {
        return res.status(409).json({
          success: false,
          message: `Employee ID "${employeeId}" is already assigned.`
        });
      }

      const nowIso = new Date().toISOString();
      const userId = generateEduId('edu_u_tch');
      const teacherId = generateEduId('edu_t');

      const tx = db.transaction(() => {
        db.prepare(`
          INSERT INTO users (id, full_name, email, phone, password_hash, role_code, avatar_url, is_active, is_demo, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 'teacher', '', 1, 0, ?, ?)
        `).run(userId, fullName, email, phone, hashEduPasswordSync(portalPassword), nowIso, nowIso);

        db.prepare(`
          INSERT INTO teachers (
            id, user_id, employee_id, designation, department, qualification, experience_years,
            joining_date, salary_monthly, employment_type, status, is_demo, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 0, ?, ?)
        `).run(
          teacherId,
          userId,
          employeeId,
          designation,
          department,
          qualification,
          experienceYears,
          joiningDate,
          salaryMonthly,
          employmentType,
          nowIso,
          nowIso
        );
      });
      tx();

      writeEduAuditLog({
        req,
        action: 'TEACHER_ONBOARDED',
        module: 'teachers',
        entityId: teacherId,
        details: { employeeId, fullName, department, designation }
      });

      const created = buildTeacherRecords(db, true, { teacherId })[0];
      return res.status(201).json({
        success: true,
        message: `Teacher ${fullName} onboarded (${employeeId}).`,
        data: created
      });
    }
  );

  // Update teacher profile & employment details
  router.patch(
    '/teachers/:id',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const existing = db.prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id) as any;
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Teacher not found.' });
      }
      const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(existing.user_id) as any;

      const body = req.body || {};
      const fullName = body.fullName !== undefined ? String(body.fullName).trim() : userRow.full_name;
      if (!fullName) {
        return res.status(400).json({ success: false, message: 'Teacher name cannot be empty.' });
      }

      const employmentType =
        body.employmentType !== undefined ? String(body.employmentType).trim() : existing.employment_type;
      if (!VALID_EMPLOYMENT_TYPES.has(employmentType)) {
        return res.status(400).json({ success: false, message: 'Invalid employment type.' });
      }

      const status = body.status !== undefined ? String(body.status).trim() : existing.status;
      if (!VALID_TEACHER_STATUSES.has(status)) {
        return res.status(400).json({ success: false, message: 'Invalid teacher status.' });
      }

      const salaryMonthly =
        body.salaryMonthly !== undefined ? Math.max(0, Number(body.salaryMonthly)) : existing.salary_monthly;
      const experienceYears =
        body.experienceYears !== undefined ? Math.max(0, Number(body.experienceYears)) : existing.experience_years;
      const nowIso = new Date().toISOString();

      const tx = db.transaction(() => {
        db.prepare(`
          UPDATE teachers
          SET designation = ?,
              department = ?,
              qualification = ?,
              experience_years = ?,
              joining_date = ?,
              salary_monthly = ?,
              employment_type = ?,
              status = ?,
              updated_at = ?
          WHERE id = ?
        `).run(
          body.designation !== undefined ? String(body.designation).trim() : existing.designation,
          body.department !== undefined ? String(body.department).trim() : existing.department,
          body.qualification !== undefined ? String(body.qualification).trim() : existing.qualification,
          experienceYears,
          body.joiningDate !== undefined ? String(body.joiningDate).trim() : existing.joining_date,
          salaryMonthly,
          employmentType,
          status,
          nowIso,
          existing.id
        );

        const isActive = status === 'resigned' ? 0 : 1;
        db.prepare('UPDATE users SET full_name = ?, phone = ?, is_active = ?, updated_at = ? WHERE id = ?').run(
          fullName,
          body.phone !== undefined ? String(body.phone).trim() : userRow.phone,
          isActive,
          nowIso,
          existing.user_id
        );

        if (status === 'resigned') {
          db.prepare('DELETE FROM sessions WHERE user_id = ?').run(existing.user_id);
        }
      });
      tx();

      writeEduAuditLog({
        req,
        action: 'TEACHER_UPDATED',
        module: 'teachers',
        entityId: existing.id,
        details: { employeeId: existing.employee_id, status }
      });

      const updated = buildTeacherRecords(db, true, { teacherId: existing.id })[0];
      return res.json({ success: true, message: 'Teacher profile updated.', data: updated });
    }
  );

  // Allocate subject + class + section to teacher (optionally set as Class Teacher)
  router.post(
    '/teachers/:id/allocations',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin', 'principal']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const teacher = db.prepare('SELECT id, employee_id FROM teachers WHERE id = ?').get(req.params.id) as any;
      if (!teacher) {
        return res.status(404).json({ success: false, message: 'Teacher not found.' });
      }

      const classId = String(req.body?.classId || '').trim();
      const sectionId = String(req.body?.sectionId || '').trim();
      const subjectId = String(req.body?.subjectId || '').trim();
      const setAsClassTeacher = Boolean(req.body?.setAsClassTeacher);
      const sessionId = getCurrentSessionId(db);

      if (!classId || !sectionId || !subjectId) {
        return res.status(400).json({
          success: false,
          message: 'Class, section, and subject are required for allocation.'
        });
      }

      const secRow = db
        .prepare('SELECT id FROM sections WHERE id = ? AND class_id = ?')
        .get(sectionId, classId);
      if (!secRow) {
        return res.status(400).json({
          success: false,
          message: 'Selected section does not belong to the chosen class.'
        });
      }
      if (!db.prepare('SELECT id FROM subjects WHERE id = ?').get(subjectId)) {
        return res.status(400).json({ success: false, message: 'Subject not found.' });
      }

      const dup = db
        .prepare(`
          SELECT id FROM teacher_subject_allocations
          WHERE teacher_id = ? AND section_id = ? AND subject_id = ? AND session_id = ?
        `)
        .get(teacher.id, sectionId, subjectId, sessionId);
      if (dup) {
        return res.status(409).json({
          success: false,
          message: 'This teacher is already allocated to that subject and section for the active session.'
        });
      }

      const allocId = generateEduId('edu_tsa');
      const tx = db.transaction(() => {
        db.prepare(`
          INSERT INTO teacher_subject_allocations (id, teacher_id, class_id, section_id, subject_id, session_id, is_demo)
          VALUES (?, ?, ?, ?, ?, ?, 0)
        `).run(allocId, teacher.id, classId, sectionId, subjectId, sessionId);

        if (setAsClassTeacher) {
          db.prepare('UPDATE sections SET class_teacher_id = ? WHERE id = ?').run(teacher.id, sectionId);
        }
      });
      tx();

      writeEduAuditLog({
        req,
        action: 'TEACHER_ALLOCATION_ADDED',
        module: 'teachers',
        entityId: allocId,
        details: { teacherId: teacher.id, classId, sectionId, subjectId, setAsClassTeacher }
      });

      const updated = buildTeacherRecords(db, true, { teacherId: teacher.id })[0];
      return res.status(201).json({
        success: true,
        message: 'Subject and class allocation saved.',
        data: updated
      });
    }
  );

  // Remove subject-class allocation
  router.delete(
    '/teachers/:id/allocations/:allocationId',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin', 'principal']),
    (req, res) => {
      const db = getEduManageDb();
      const info = db
        .prepare('DELETE FROM teacher_subject_allocations WHERE id = ? AND teacher_id = ?')
        .run(req.params.allocationId, req.params.id);
      if (info.changes === 0) {
        return res.status(404).json({ success: false, message: 'Allocation not found.' });
      }
      return res.json({ success: true, message: 'Allocation removed.', data: null });
    }
  );

  return router;
}

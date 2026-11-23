import express from 'express';
import { generateEduId, getEduManageDb } from '../db.ts';
import {
  AuthenticatedEduRequest,
  requireEduAuth,
  requireEduRole,
  writeEduAuditLog
} from '../security.ts';
import type { DayOfWeek, TimetableSlotRecord } from '../../../src/types/edumanage.ts';

const VALID_DAYS = new Set<DayOfWeek>([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday'
]);

const DAY_ORDER_SQL = `
  CASE tt.day_of_week
    WHEN 'monday' THEN 1
    WHEN 'tuesday' THEN 2
    WHEN 'wednesday' THEN 3
    WHEN 'thursday' THEN 4
    WHEN 'friday' THEN 5
    WHEN 'saturday' THEN 6
    ELSE 7
  END
`;

function getCurrentSessionId(db: ReturnType<typeof getEduManageDb>): string {
  const row = db
    .prepare('SELECT id FROM academic_sessions ORDER BY is_current DESC, start_date DESC LIMIT 1')
    .get() as any;
  if (!row) throw new Error('No active academic session found.');
  return row.id;
}

function mapTimetableRow(r: any): TimetableSlotRecord {
  return {
    id: r.id,
    sessionId: r.session_id,
    classId: r.class_id,
    className: r.class_name,
    sectionId: r.section_id,
    sectionName: r.section_name,
    subjectId: r.subject_id,
    subjectCode: r.subject_code,
    subjectName: r.subject_name,
    teacherId: r.teacher_id,
    teacherName: r.teacher_name,
    dayOfWeek: r.day_of_week as DayOfWeek,
    periodNumber: Number(r.period_number),
    startTime: r.start_time,
    endTime: r.end_time,
    roomNumber: r.room_number || '',
    isDemo: Boolean(r.is_demo)
  };
}

export function createEduManageTimetableRouter(): express.Router {
  const router = express.Router();

  // Fetch class timetable or teacher timetable (auto-scoped for student role)
  router.get('/timetables', requireEduAuth, (req: AuthenticatedEduRequest, res) => {
    const db = getEduManageDb();
    const sessionId = getCurrentSessionId(db);
    const user = req.eduUser!;

    let classId = String(req.query.classId || '').trim();
    let sectionId = String(req.query.sectionId || '').trim();
    let teacherId = String(req.query.teacherId || '').trim();

    if (user.role === 'student') {
      const stu = db
        .prepare('SELECT current_class_id, current_section_id FROM students WHERE user_id = ?')
        .get(user.id) as any;
      if (!stu) return res.json({ success: true, data: [] });
      classId = stu.current_class_id;
      sectionId = stu.current_section_id;
      teacherId = '';
    } else if (user.role === 'teacher' && !classId && !sectionId && !teacherId) {
      const tch = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(user.id) as any;
      if (tch) teacherId = tch.id;
    }

    const where: string[] = ['tt.session_id = ?'];
    const params: unknown[] = [sessionId];

    if (classId) {
      where.push('tt.class_id = ?');
      params.push(classId);
    }
    if (sectionId) {
      where.push('tt.section_id = ?');
      params.push(sectionId);
    }
    if (teacherId) {
      where.push('tt.teacher_id = ?');
      params.push(teacherId);
    }

    const rows = db
      .prepare(`
        SELECT tt.*,
               c.name AS class_name,
               sec.name AS section_name,
               sub.code AS subject_code,
               sub.name AS subject_name,
               u.full_name AS teacher_name
        FROM timetables tt
        JOIN classes c ON c.id = tt.class_id
        JOIN sections sec ON sec.id = tt.section_id
        JOIN subjects sub ON sub.id = tt.subject_id
        JOIN teachers t ON t.id = tt.teacher_id
        JOIN users u ON u.id = t.user_id
        WHERE ${where.join(' AND ')}
        ORDER BY ${DAY_ORDER_SQL} ASC, tt.period_number ASC
      `)
      .all(...params) as any[];

    return res.json({ success: true, data: rows.map(mapTimetableRow) });
  });

  // Create timetable slot with 3-way Schedule Conflict Detection (Section, Teacher, Room)
  router.post(
    '/timetables',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin', 'principal']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const body = req.body || {};
      const sessionId = getCurrentSessionId(db);

      const classId = String(body.classId || '').trim();
      const sectionId = String(body.sectionId || '').trim();
      const subjectId = String(body.subjectId || '').trim();
      const teacherId = String(body.teacherId || '').trim();
      const dayOfWeek = String(body.dayOfWeek || '').trim().toLowerCase() as DayOfWeek;
      const periodNumber = Number(body.periodNumber);
      const startTime = String(body.startTime || '').trim();
      const endTime = String(body.endTime || '').trim();
      const roomNumber = String(body.roomNumber || '').trim();

      if (!classId || !sectionId || !subjectId || !teacherId || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: 'Class, section, subject, teacher, start time, and end time are required.'
        });
      }
      if (!VALID_DAYS.has(dayOfWeek)) {
        return res.status(400).json({ success: false, message: 'Invalid day of week.' });
      }
      if (!Number.isInteger(periodNumber) || periodNumber < 1 || periodNumber > 8) {
        return res.status(400).json({ success: false, message: 'Period number must be between 1 and 8.' });
      }
      if (startTime >= endTime) {
        return res.status(400).json({ success: false, message: 'End time must be after start time.' });
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

      // 1. Section Conflict Check
      const sectionClash = db
        .prepare(`
          SELECT tt.id, sub.name AS subject_name, u.full_name AS teacher_name
          FROM timetables tt
          JOIN subjects sub ON sub.id = tt.subject_id
          JOIN teachers t ON t.id = tt.teacher_id
          JOIN users u ON u.id = t.user_id
          WHERE tt.session_id = ? AND tt.section_id = ? AND tt.day_of_week = ? AND tt.period_number = ?
          LIMIT 1
        `)
        .get(sessionId, sectionId, dayOfWeek, periodNumber) as any;

      if (sectionClash) {
        return res.status(409).json({
          success: false,
          conflictType: 'section',
          message: `Schedule conflict: This section already has ${sectionClash.subject_name} with ${sectionClash.teacher_name} on ${dayOfWeek} Period ${periodNumber}.`
        });
      }

      // 2. Teacher Conflict Check
      const teacherClash = db
        .prepare(`
          SELECT tt.id, c.name AS class_name, sec.name AS section_name, sub.name AS subject_name
          FROM timetables tt
          JOIN classes c ON c.id = tt.class_id
          JOIN sections sec ON sec.id = tt.section_id
          JOIN subjects sub ON sub.id = tt.subject_id
          WHERE tt.session_id = ? AND tt.teacher_id = ? AND tt.day_of_week = ? AND tt.period_number = ?
          LIMIT 1
        `)
        .get(sessionId, teacherId, dayOfWeek, periodNumber) as any;

      if (teacherClash) {
        return res.status(409).json({
          success: false,
          conflictType: 'teacher',
          message: `Teacher schedule conflict: Selected teacher is already assigned to ${teacherClash.class_name} Sec ${teacherClash.section_name} (${teacherClash.subject_name}) on ${dayOfWeek} Period ${periodNumber}.`
        });
      }

      // 3. Room Conflict Check (when roomNumber provided)
      if (roomNumber) {
        const roomClash = db
          .prepare(`
            SELECT tt.id, c.name AS class_name, sec.name AS section_name, sub.name AS subject_name
            FROM timetables tt
            JOIN classes c ON c.id = tt.class_id
            JOIN sections sec ON sec.id = tt.section_id
            JOIN subjects sub ON sub.id = tt.subject_id
            WHERE tt.session_id = ?
              AND LOWER(TRIM(tt.room_number)) = LOWER(?)
              AND tt.day_of_week = ?
              AND tt.period_number = ?
            LIMIT 1
          `)
          .get(sessionId, roomNumber, dayOfWeek, periodNumber) as any;

        if (roomClash) {
          return res.status(409).json({
            success: false,
            conflictType: 'room',
            message: `Room conflict: "${roomNumber}" is already occupied by ${roomClash.class_name} Sec ${roomClash.section_name} (${roomClash.subject_name}) on ${dayOfWeek} Period ${periodNumber}.`
          });
        }
      }

      const id = generateEduId('edu_tt');
      db.prepare(`
        INSERT INTO timetables (
          id, session_id, class_id, section_id, subject_id, teacher_id,
          day_of_week, period_number, start_time, end_time, room_number, is_demo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `).run(
        id,
        sessionId,
        classId,
        sectionId,
        subjectId,
        teacherId,
        dayOfWeek,
        periodNumber,
        startTime,
        endTime,
        roomNumber
      );

      writeEduAuditLog({
        req,
        action: 'TIMETABLE_SLOT_CREATED',
        module: 'timetables',
        entityId: id,
        details: { classId, sectionId, teacherId, dayOfWeek, periodNumber, roomNumber }
      });

      const createdRow = db
        .prepare(`
          SELECT tt.*,
                 c.name AS class_name,
                 sec.name AS section_name,
                 sub.code AS subject_code,
                 sub.name AS subject_name,
                 u.full_name AS teacher_name
          FROM timetables tt
          JOIN classes c ON c.id = tt.class_id
          JOIN sections sec ON sec.id = tt.section_id
          JOIN subjects sub ON sub.id = tt.subject_id
          JOIN teachers t ON t.id = tt.teacher_id
          JOIN users u ON u.id = t.user_id
          WHERE tt.id = ?
        `)
        .get(id) as any;

      return res.status(201).json({
        success: true,
        message: 'Timetable slot added without conflicts.',
        data: mapTimetableRow(createdRow)
      });
    }
  );

  // Delete timetable slot
  router.delete(
    '/timetables/:id',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin', 'principal']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const info = db.prepare('DELETE FROM timetables WHERE id = ?').run(req.params.id);
      if (info.changes === 0) {
        return res.status(404).json({ success: false, message: 'Timetable slot not found.' });
      }
      writeEduAuditLog({
        req,
        action: 'TIMETABLE_SLOT_REMOVED',
        module: 'timetables',
        entityId: req.params.id
      });
      return res.json({ success: true, message: 'Timetable slot removed.', data: null });
    }
  );

  return router;
}

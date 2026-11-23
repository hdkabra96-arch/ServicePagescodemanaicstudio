import express from 'express';
import { generateEduId, getEduManageDb } from '../db.ts';
import {
  AuthenticatedEduRequest,
  isSafeEduHttpUrl,
  requireEduAuth,
  requireEduRole,
  writeEduAuditLog
} from '../security.ts';
import type { HomeworkRecord, HomeworkSubmissionRecord } from '../../../src/types/edumanage.ts';

function getCurrentSessionId(db: ReturnType<typeof getEduManageDb>): string {
  const row = db
    .prepare('SELECT id FROM academic_sessions ORDER BY is_current DESC, start_date DESC LIMIT 1')
    .get() as any;
  if (!row) throw new Error('No active academic session found.');
  return row.id;
}

export function createEduManageHomeworkRouter(): express.Router {
  const router = express.Router();

  // List homework assignments (role-scoped for students & parents)
  router.get('/homework', requireEduAuth, (req: AuthenticatedEduRequest, res) => {
    const db = getEduManageDb();
    const user = req.eduUser!;

    let classId = String(req.query.classId || '').trim();
    let sectionId = String(req.query.sectionId || '').trim();
    const subjectId = String(req.query.subjectId || '').trim();
    const status = String(req.query.status || '').trim();

    let currentStudentId: string | null = null;
    let parentSectionIds: string[] = [];

    if (user.role === 'student') {
      const stu = db
        .prepare('SELECT id, current_class_id, current_section_id FROM students WHERE user_id = ?')
        .get(user.id) as any;
      if (!stu) return res.json({ success: true, data: [] });
      currentStudentId = stu.id;
      classId = stu.current_class_id;
      sectionId = stu.current_section_id;
    } else if (user.role === 'parent') {
      const children = db
        .prepare(`
          SELECT s.current_section_id
          FROM students s
          JOIN parents p ON p.id = s.parent_id
          WHERE p.user_id = ? AND s.status = 'active'
        `)
        .all(user.id) as any[];
      parentSectionIds = Array.from(new Set(children.map((c) => c.current_section_id)));
      if (parentSectionIds.length === 0) return res.json({ success: true, data: [] });
    }

    const where: string[] = [];
    const params: unknown[] = [];

    if (classId) {
      where.push('h.class_id = ?');
      params.push(classId);
    }
    if (sectionId) {
      where.push('h.section_id = ?');
      params.push(sectionId);
    }
    if (parentSectionIds.length > 0 && !sectionId) {
      const placeholders = parentSectionIds.map(() => '?').join(', ');
      where.push(`h.section_id IN (${placeholders})`);
      params.push(...parentSectionIds);
    }
    if (subjectId) {
      where.push('h.subject_id = ?');
      params.push(subjectId);
    }
    if (status === 'active' || status === 'closed') {
      where.push('h.status = ?');
      params.push(status);
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const rows = db
      .prepare(`
        SELECT h.*,
               c.name AS class_name,
               sec.name AS section_name,
               sub.code AS subject_code,
               sub.name AS subject_name,
               u.full_name AS teacher_name,
               (SELECT COUNT(*) FROM students st WHERE st.current_section_id = h.section_id AND st.status = 'active') AS total_students,
               (SELECT COUNT(*) FROM homework_submissions hs WHERE hs.homework_id = h.id) AS submitted_count,
               (SELECT COUNT(*) FROM homework_submissions hs WHERE hs.homework_id = h.id AND hs.status = 'graded') AS graded_count
        FROM homework h
        JOIN classes c ON c.id = h.class_id
        JOIN sections sec ON sec.id = h.section_id
        JOIN subjects sub ON sub.id = h.subject_id
        JOIN teachers t ON t.id = h.teacher_id
        JOIN users u ON u.id = t.user_id
        ${whereSql}
        ORDER BY h.due_date DESC, h.created_at DESC
      `)
      .all(...params) as any[];

    const mySubsMap = new Map<string, any>();
    if (currentStudentId) {
      const subRows = db
        .prepare('SELECT * FROM homework_submissions WHERE student_id = ?')
        .all(currentStudentId) as any[];
      for (const sr of subRows) {
        mySubsMap.set(sr.homework_id, sr);
      }
    }

    const data: HomeworkRecord[] = rows.map((r) => {
      const mySub = currentStudentId ? mySubsMap.get(r.id) : null;
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
        title: r.title,
        description: r.description || '',
        dueDate: r.due_date,
        maxScore: Number(r.max_score || 20),
        attachmentUrl: r.attachment_url || '',
        status: r.status,
        totalStudents: Number(r.total_students || 0),
        submittedCount: Number(r.submitted_count || 0),
        gradedCount: Number(r.graded_count || 0),
        mySubmission: mySub
          ? {
              id: mySub.id,
              submissionText: mySub.submission_text || '',
              attachmentUrl: mySub.attachment_url || '',
              submittedAt: mySub.submitted_at,
              status: mySub.status,
              score: mySub.score !== null && mySub.score !== undefined ? Number(mySub.score) : null,
              teacherFeedback: mySub.teacher_feedback || '',
              gradedAt: mySub.graded_at || null
            }
          : null,
        isDemo: Boolean(r.is_demo),
        createdAt: r.created_at
      };
    });

    return res.json({ success: true, data });
  });

  // Create new homework assignment (Teacher, Principal, Admin)
  router.post(
    '/homework',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin', 'principal', 'teacher']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const body = req.body || {};

      const classId = String(body.classId || '').trim();
      const sectionId = String(body.sectionId || '').trim();
      const subjectId = String(body.subjectId || '').trim();
      const title = String(body.title || '').trim();
      const description = String(body.description || '').trim();
      const dueDate = String(body.dueDate || '').trim();
      const maxScore = Math.max(1, Number(body.maxScore || 20));
      const attachmentUrl = String(body.attachmentUrl || '').trim();

      if (!classId || !sectionId || !subjectId || !title || !dueDate) {
        return res.status(400).json({
          success: false,
          message: 'Class, section, subject, title, and due date are required.'
        });
      }
      if (!isSafeEduHttpUrl(attachmentUrl)) {
        return res.status(400).json({
          success: false,
          message: 'Attachment URL must use http://, https://, or a relative path.'
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

      let teacherId = String(body.teacherId || '').trim();
      if (req.eduUser!.role === 'teacher') {
        const ownTeacher = db
          .prepare('SELECT id FROM teachers WHERE user_id = ?')
          .get(req.eduUser!.id) as any;
        if (!ownTeacher) {
          return res.status(403).json({ success: false, message: 'Teacher profile not linked.' });
        }
        teacherId = ownTeacher.id;
      } else if (!teacherId) {
        const firstTch = db.prepare("SELECT id FROM teachers WHERE status = 'active' LIMIT 1").get() as any;
        if (!firstTch) {
          return res.status(400).json({ success: false, message: 'Select an assigning teacher.' });
        }
        teacherId = firstTch.id;
      }

      const id = generateEduId('edu_hw');
      const sessionId = getCurrentSessionId(db);
      const nowIso = new Date().toISOString();

      db.prepare(`
        INSERT INTO homework (
          id, session_id, class_id, section_id, subject_id, teacher_id,
          title, description, due_date, max_score, attachment_url, status, is_demo, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 0, ?)
      `).run(
        id,
        sessionId,
        classId,
        sectionId,
        subjectId,
        teacherId,
        title,
        description,
        dueDate,
        maxScore,
        attachmentUrl,
        nowIso
      );

      writeEduAuditLog({
        req,
        action: 'HOMEWORK_CREATED',
        module: 'homework',
        entityId: id,
        details: { title, classId, sectionId, dueDate }
      });

      return res.status(201).json({
        success: true,
        message: `Assignment "${title}" published.`,
        data: { id, title, dueDate, maxScore, status: 'active' }
      });
    }
  );

  // Toggle assignment status (active / closed)
  router.patch(
    '/homework/:id/status',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin', 'principal', 'teacher']),
    (req, res) => {
      const db = getEduManageDb();
      const status = String(req.body?.status || '').trim();
      if (status !== 'active' && status !== 'closed') {
        return res.status(400).json({ success: false, message: 'Status must be active or closed.' });
      }
      const info = db.prepare('UPDATE homework SET status = ? WHERE id = ?').run(status, req.params.id);
      if (info.changes === 0) {
        return res.status(404).json({ success: false, message: 'Assignment not found.' });
      }
      return res.json({ success: true, message: `Assignment marked ${status}.`, data: { status } });
    }
  );

  // List all students & submissions for an assignment (Teacher / Admin / Principal)
  router.get(
    '/homework/:id/submissions',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin', 'principal', 'teacher']),
    (req, res) => {
      const db = getEduManageDb();
      const hw = db.prepare('SELECT * FROM homework WHERE id = ?').get(req.params.id) as any;
      if (!hw) {
        return res.status(404).json({ success: false, message: 'Assignment not found.' });
      }

      const rows = db
        .prepare(`
          SELECT s.id AS student_id,
                 s.admission_number,
                 s.roll_number,
                 s.first_name,
                 s.last_name,
                 hs.id AS sub_id,
                 hs.submission_text,
                 hs.attachment_url,
                 hs.submitted_at,
                 hs.status AS sub_status,
                 hs.score,
                 hs.teacher_feedback,
                 hs.graded_at,
                 gu.full_name AS graded_by_name
          FROM students s
          LEFT JOIN homework_submissions hs
            ON hs.student_id = s.id AND hs.homework_id = ?
          LEFT JOIN users gu ON gu.id = hs.graded_by
          WHERE s.current_section_id = ? AND s.status = 'active'
          ORDER BY CAST(s.roll_number AS INTEGER) ASC, s.first_name ASC
        `)
        .all(hw.id, hw.section_id) as any[];

      const data: HomeworkSubmissionRecord[] = rows.map((r) => ({
        id: r.sub_id || null,
        homeworkId: hw.id,
        studentId: r.student_id,
        admissionNumber: r.admission_number,
        rollNumber: r.roll_number || '',
        studentName: `${r.first_name} ${r.last_name}`.trim(),
        submissionText: r.submission_text || '',
        attachmentUrl: r.attachment_url || '',
        submittedAt: r.submitted_at || null,
        status: (r.sub_status || 'pending') as HomeworkSubmissionRecord['status'],
        score: r.score !== null && r.score !== undefined ? Number(r.score) : null,
        teacherFeedback: r.teacher_feedback || '',
        gradedByName: r.graded_by_name || null,
        gradedAt: r.graded_at || null
      }));

      return res.json({ success: true, data });
    }
  );

  // Student submits an assignment
  router.post(
    '/homework/:id/submit',
    requireEduAuth,
    requireEduRole(['student']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const hw = db.prepare('SELECT * FROM homework WHERE id = ?').get(req.params.id) as any;
      if (!hw) {
        return res.status(404).json({ success: false, message: 'Assignment not found.' });
      }
      if (hw.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'This assignment is closed and no longer accepting submissions.'
        });
      }

      const student = db
        .prepare('SELECT id, current_section_id FROM students WHERE user_id = ? AND status = ?')
        .get(req.eduUser!.id, 'active') as any;
      if (!student) {
        return res.status(403).json({ success: false, message: 'Active student profile required.' });
      }
      if (student.current_section_id !== hw.section_id) {
        return res.status(403).json({
          success: false,
          message: 'You can only submit assignments assigned to your class and section.'
        });
      }

      const submissionText = String(req.body?.submissionText || '').trim();
      const attachmentUrl = String(req.body?.attachmentUrl || '').trim();
      if (!submissionText) {
        return res.status(400).json({
          success: false,
          message: 'Enter your submission response or notes before submitting.'
        });
      }
      if (!isSafeEduHttpUrl(attachmentUrl)) {
        return res.status(400).json({
          success: false,
          message: 'Attachment URL must use http://, https://, or a relative path.'
        });
      }

      const nowIso = new Date().toISOString();
      const todayDate = nowIso.slice(0, 10);
      const subStatus = todayDate > hw.due_date ? 'late' : 'submitted';
      const existing = db
        .prepare('SELECT id FROM homework_submissions WHERE homework_id = ? AND student_id = ?')
        .get(hw.id, student.id) as any;

      let subId = existing?.id || generateEduId('edu_hwsub');
      if (existing) {
        db.prepare(`
          UPDATE homework_submissions
          SET submission_text = ?, attachment_url = ?, submitted_at = ?, status = ?, is_demo = 0
          WHERE id = ?
        `).run(submissionText, attachmentUrl, nowIso, subStatus, subId);
      } else {
        db.prepare(`
          INSERT INTO homework_submissions (
            id, homework_id, student_id, submission_text, attachment_url, submitted_at, status, is_demo
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)
        `).run(subId, hw.id, student.id, submissionText, attachmentUrl, nowIso, subStatus);
      }

      return res.status(201).json({
        success: true,
        message: subStatus === 'late' ? 'Assignment submitted (marked late).' : 'Assignment submitted.',
        data: {
          id: subId,
          homeworkId: hw.id,
          studentId: student.id,
          submissionText,
          attachmentUrl,
          submittedAt: nowIso,
          status: subStatus
        }
      });
    }
  );

  // Teacher evaluates / grades a student's submission
  router.patch(
    '/homework/:id/submissions/:submissionId/grade',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin', 'principal', 'teacher']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const hw = db.prepare('SELECT id, max_score FROM homework WHERE id = ?').get(req.params.id) as any;
      if (!hw) {
        return res.status(404).json({ success: false, message: 'Assignment not found.' });
      }

      const sub = db
        .prepare('SELECT * FROM homework_submissions WHERE id = ? AND homework_id = ?')
        .get(req.params.submissionId, hw.id) as any;
      if (!sub) {
        return res.status(404).json({ success: false, message: 'Submission record not found.' });
      }

      const score = Number(req.body?.score);
      const teacherFeedback = String(req.body?.teacherFeedback || '').trim();
      if (!Number.isFinite(score) || score < 0 || score > Number(hw.max_score)) {
        return res.status(400).json({
          success: false,
          message: `Score must be between 0 and ${hw.max_score}.`
        });
      }

      const nowIso = new Date().toISOString();
      db.prepare(`
        UPDATE homework_submissions
        SET score = ?, teacher_feedback = ?, status = 'graded', graded_by = ?, graded_at = ?, is_demo = 0
        WHERE id = ?
      `).run(score, teacherFeedback, req.eduUser!.id, nowIso, sub.id);

      writeEduAuditLog({
        req,
        action: 'HOMEWORK_GRADED',
        module: 'homework',
        entityId: sub.id,
        details: { homeworkId: hw.id, studentId: sub.student_id, score, maxScore: hw.max_score }
      });

      return res.json({
        success: true,
        message: 'Assignment evaluated and feedback saved.',
        data: {
          id: sub.id,
          score,
          teacherFeedback,
          status: 'graded',
          gradedAt: nowIso
        }
      });
    }
  );

  return router;
}

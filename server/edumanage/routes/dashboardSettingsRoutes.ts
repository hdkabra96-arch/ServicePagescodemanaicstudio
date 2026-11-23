import express from 'express';
import {
  generateEduId,
  getEduManageDb,
  getSchoolSettings
} from '../db.ts';
import {
  AuthenticatedEduRequest,
  isSafeEduHttpUrl,
  requireEduAuth,
  requireEduRole,
  writeEduAuditLog
} from '../security.ts';
import { getEduManageDashboard } from '../services/dashboardService.ts';
import type {
  AcademicSession,
  AnnouncementRecord,
  SchoolClass,
  SubjectRecord
} from '../../../src/types/edumanage.ts';

export function createEduManageDashboardSettingsRouter(): express.Router {
  const router = express.Router();

  // Live SQL Dashboard
  router.get('/dashboard', requireEduAuth, (req: AuthenticatedEduRequest, res) => {
    const data = getEduManageDashboard(req.eduUser!.role);
    return res.json({ success: true, data });
  });

  // Announcements
  router.get('/announcements', requireEduAuth, (req: AuthenticatedEduRequest, res) => {
    const db = getEduManageDb();
    const role = req.eduUser!.role;
    const audienceFilter =
      role === 'student'
        ? "('all', 'students')"
        : role === 'parent'
        ? "('all', 'parents')"
        : role === 'teacher'
        ? "('all', 'teachers', 'staff')"
        : "('all', 'teachers', 'students', 'parents', 'staff')";

    const rows = db
      .prepare(`
        SELECT a.*, u.full_name AS published_by_name, c.name AS target_class_name
        FROM announcements a
        LEFT JOIN users u ON u.id = a.published_by
        LEFT JOIN classes c ON c.id = a.target_class_id
        WHERE a.audience IN ${audienceFilter}
        ORDER BY a.created_at DESC
        LIMIT 30
      `)
      .all() as any[];

    const data: AnnouncementRecord[] = rows.map((a) => ({
      id: a.id,
      title: a.title,
      message: a.message,
      audience: a.audience,
      targetClassId: a.target_class_id || null,
      targetClassName: a.target_class_name || null,
      priority: a.priority,
      publishedBy: a.published_by,
      publishedByName: a.published_by_name || 'Administration',
      isDemo: Boolean(a.is_demo),
      createdAt: a.created_at
    }));

    return res.json({ success: true, data });
  });

  router.post(
    '/announcements',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin', 'principal', 'teacher', 'accountant', 'librarian']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const title = String(req.body?.title || '').trim();
      const message = String(req.body?.message || '').trim();
      const audience = String(req.body?.audience || 'all').trim();
      const priority = String(req.body?.priority || 'normal').trim();
      const targetClassId = req.body?.targetClassId ? String(req.body.targetClassId) : null;

      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: 'Announcement title and message are required.'
        });
      }
      if (!['all', 'teachers', 'students', 'parents', 'staff'].includes(audience)) {
        return res.status(400).json({ success: false, message: 'Invalid announcement audience.' });
      }
      if (!['normal', 'important', 'urgent'].includes(priority)) {
        return res.status(400).json({ success: false, message: 'Invalid priority.' });
      }

      const id = generateEduId('edu_ann');
      const nowIso = new Date().toISOString();
      db.prepare(`
        INSERT INTO announcements (id, title, message, audience, target_class_id, priority, published_by, is_demo, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
      `).run(id, title, message, audience, targetClassId, priority, req.eduUser!.id, nowIso);

      writeEduAuditLog({
        req,
        action: 'ANNOUNCEMENT_PUBLISHED',
        module: 'announcements',
        entityId: id,
        details: { title, audience, priority }
      });

      return res.status(201).json({
        success: true,
        message: 'Announcement published.',
        data: {
          id,
          title,
          message,
          audience,
          targetClassId,
          priority,
          publishedBy: req.eduUser!.id,
          publishedByName: req.eduUser!.fullName,
          isDemo: false,
          createdAt: nowIso
        }
      });
    }
  );

  router.delete(
    '/announcements/:id',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin', 'principal']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const info = db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
      if (info.changes === 0) {
        return res.status(404).json({ success: false, message: 'Announcement not found.' });
      }
      return res.json({ success: true, message: 'Announcement deleted.', data: null });
    }
  );

  // Audit Logs (Super Admin, School Admin, Principal)
  router.get(
    '/audit-logs',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin', 'principal']),
    (_req, res) => {
      const db = getEduManageDb();
      const rows = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 80').all() as any[];
      const data = rows.map((r) => {
        let details: Record<string, unknown> = {};
        try {
          details = JSON.parse(r.details_json || '{}');
        } catch {
          details = {};
        }
        return {
          id: r.id,
          userId: r.user_id || null,
          actorName: r.actor_name,
          actorRole: r.actor_role,
          action: r.action,
          module: r.module,
          entityId: r.entity_id || null,
          details,
          ipAddress: r.ip_address || '',
          isDemo: Boolean(r.is_demo),
          createdAt: r.created_at
        };
      });
      return res.json({ success: true, data });
    }
  );

  // School Settings (Read all authenticated; Update Super Admin / School Admin)
  router.get('/settings', requireEduAuth, (_req, res) => {
    return res.json({ success: true, data: getSchoolSettings() });
  });

  router.patch(
    '/settings',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const current = getSchoolSettings();
      const body = req.body || {};

      const schoolName =
        body.schoolName !== undefined ? String(body.schoolName).trim() : current.schoolName;
      if (!schoolName) {
        return res.status(400).json({ success: false, message: 'School name cannot be empty.' });
      }

      const logoUrl = body.logoUrl !== undefined ? String(body.logoUrl).trim() : current.logoUrl;
      const website = body.website !== undefined ? String(body.website).trim() : current.website;
      if (!isSafeEduHttpUrl(logoUrl) || !isSafeEduHttpUrl(website)) {
        return res.status(400).json({
          success: false,
          message: 'Logo and website URLs must use http://, https://, or a relative path.'
        });
      }

      const finePerDay =
        body.finePerDay !== undefined ? Number(body.finePerDay) : current.finePerDay;
      if (!Number.isFinite(finePerDay) || finePerDay < 0 || finePerDay > 500) {
        return res.status(400).json({
          success: false,
          message: 'Library overdue fine per day must be between 0 and 500.'
        });
      }

      const gradingScale = Array.isArray(body.gradingScale) && body.gradingScale.length > 0
        ? body.gradingScale
        : current.gradingScale;

      const nowIso = new Date().toISOString();
      db.prepare(`
        UPDATE school_settings
        SET school_name = ?,
            board_affiliation = ?,
            affiliation_code = ?,
            logo_url = ?,
            address = ?,
            city = ?,
            phone = ?,
            email = ?,
            website = ?,
            currency_code = ?,
            currency_symbol = ?,
            receipt_prefix = ?,
            grading_scale_json = ?,
            fine_per_day = ?,
            updated_at = ?
        WHERE id = ?
      `).run(
        schoolName,
        body.boardAffiliation !== undefined ? String(body.boardAffiliation).trim() : current.boardAffiliation,
        body.affiliationCode !== undefined ? String(body.affiliationCode).trim() : current.affiliationCode,
        logoUrl,
        body.address !== undefined ? String(body.address).trim() : current.address,
        body.city !== undefined ? String(body.city).trim() : current.city,
        body.phone !== undefined ? String(body.phone).trim() : current.phone,
        body.email !== undefined ? String(body.email).trim() : current.email,
        website,
        body.currencyCode !== undefined ? String(body.currencyCode).trim() : current.currencyCode,
        body.currencySymbol !== undefined ? String(body.currencySymbol).trim() : current.currencySymbol,
        body.receiptPrefix !== undefined ? String(body.receiptPrefix).trim() : current.receiptPrefix,
        JSON.stringify(gradingScale),
        finePerDay,
        nowIso,
        current.id
      );

      writeEduAuditLog({
        req,
        action: 'SETTINGS_UPDATED',
        module: 'settings',
        entityId: current.id,
        details: { schoolName }
      });

      return res.json({
        success: true,
        message: 'School settings updated.',
        data: getSchoolSettings()
      });
    }
  );

  // Academic Sessions
  router.get('/sessions', requireEduAuth, (_req, res) => {
    const db = getEduManageDb();
    const rows = db.prepare('SELECT * FROM academic_sessions ORDER BY start_date DESC').all() as any[];
    const data: AcademicSession[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      startDate: r.start_date,
      endDate: r.end_date,
      isCurrent: Boolean(r.is_current),
      isDemo: Boolean(r.is_demo),
      createdAt: r.created_at
    }));
    return res.json({ success: true, data });
  });

  router.post(
    '/sessions',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const name = String(req.body?.name || '').trim();
      const startDate = String(req.body?.startDate || '').trim();
      const endDate = String(req.body?.endDate || '').trim();
      const makeCurrent = Boolean(req.body?.isCurrent);

      if (!name || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Session name, start date, and end date are required.'
        });
      }

      const dup = db.prepare('SELECT id FROM academic_sessions WHERE name = ?').get(name);
      if (dup) {
        return res.status(409).json({ success: false, message: 'Academic session already exists.' });
      }

      const id = generateEduId('edu_sess');
      const nowIso = new Date().toISOString();
      const tx = db.transaction(() => {
        if (makeCurrent) {
          db.prepare('UPDATE academic_sessions SET is_current = 0').run();
        }
        db.prepare(`
          INSERT INTO academic_sessions (id, name, start_date, end_date, is_current, is_demo, created_at)
          VALUES (?, ?, ?, ?, ?, 0, ?)
        `).run(id, name, startDate, endDate, makeCurrent ? 1 : 0, nowIso);
      });
      tx();

      writeEduAuditLog({
        req,
        action: 'SESSION_CREATED',
        module: 'settings',
        entityId: id,
        details: { name, makeCurrent }
      });

      return res.status(201).json({
        success: true,
        message: `Academic session "${name}" created.`,
        data: { id, name, startDate, endDate, isCurrent: makeCurrent, isDemo: false, createdAt: nowIso }
      });
    }
  );

  router.patch(
    '/sessions/:id/activate',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const target = db.prepare('SELECT * FROM academic_sessions WHERE id = ?').get(req.params.id) as any;
      if (!target) {
        return res.status(404).json({ success: false, message: 'Academic session not found.' });
      }
      const tx = db.transaction(() => {
        db.prepare('UPDATE academic_sessions SET is_current = 0').run();
        db.prepare('UPDATE academic_sessions SET is_current = 1 WHERE id = ?').run(req.params.id);
      });
      tx();
      return res.json({
        success: true,
        message: `Active session switched to ${target.name}.`,
        data: {
          id: target.id,
          name: target.name,
          startDate: target.start_date,
          endDate: target.end_date,
          isCurrent: true,
          isDemo: Boolean(target.is_demo),
          createdAt: target.created_at
        }
      });
    }
  );

  // Classes & Sections
  router.get('/classes', requireEduAuth, (_req, res) => {
    const db = getEduManageDb();
    const classRows = db.prepare('SELECT * FROM classes ORDER BY numeric_order ASC, name ASC').all() as any[];
    const sectionRows = db
      .prepare(`
        SELECT s.*,
               u.full_name AS teacher_name,
               (SELECT COUNT(*) FROM students st WHERE st.current_section_id = s.id AND st.status = 'active') AS student_count
        FROM sections s
        LEFT JOIN teachers t ON t.id = s.class_teacher_id
        LEFT JOIN users u ON u.id = t.user_id
        ORDER BY s.name ASC
      `)
      .all() as any[];

    const sectionsByClass = new Map<string, SchoolClass['sections']>();
    for (const s of sectionRows) {
      const list = sectionsByClass.get(s.class_id) || [];
      list.push({
        id: s.id,
        classId: s.class_id,
        name: s.name,
        roomNumber: s.room_number || '',
        capacity: Number(s.capacity || 40),
        classTeacherId: s.class_teacher_id || null,
        classTeacherName: s.teacher_name || null,
        studentCount: Number(s.student_count || 0),
        isDemo: Boolean(s.is_demo)
      });
      sectionsByClass.set(s.class_id, list);
    }

    const data: SchoolClass[] = classRows.map((c) => {
      const sections = sectionsByClass.get(c.id) || [];
      return {
        id: c.id,
        name: c.name,
        numericOrder: Number(c.numeric_order || 1),
        stream: c.stream || 'General',
        isActive: Boolean(c.is_active),
        isDemo: Boolean(c.is_demo),
        studentCount: sections.reduce((sum, sec) => sum + (sec.studentCount || 0), 0),
        sections
      };
    });

    return res.json({ success: true, data });
  });

  router.post(
    '/classes',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const name = String(req.body?.name || '').trim();
      const numericOrder = Math.max(1, Number(req.body?.numericOrder || 1));
      const stream = String(req.body?.stream || 'General').trim() || 'General';
      const defaultSection = String(req.body?.defaultSection || 'A').trim() || 'A';
      const roomNumber = String(req.body?.roomNumber || '').trim();

      if (!name) {
        return res.status(400).json({ success: false, message: 'Class name is required.' });
      }
      const dup = db.prepare('SELECT id FROM classes WHERE name = ?').get(name);
      if (dup) {
        return res.status(409).json({ success: false, message: 'A class with this name already exists.' });
      }

      const classId = generateEduId('edu_cls');
      const secId = generateEduId('edu_sec');
      const tx = db.transaction(() => {
        db.prepare(
          'INSERT INTO classes (id, name, numeric_order, stream, is_active, is_demo) VALUES (?, ?, ?, ?, 1, 0)'
        ).run(classId, name, numericOrder, stream);
        db.prepare(
          'INSERT INTO sections (id, class_id, name, room_number, capacity, class_teacher_id, is_demo) VALUES (?, ?, ?, ?, 40, NULL, 0)'
        ).run(secId, classId, defaultSection, roomNumber);
      });
      tx();

      writeEduAuditLog({
        req,
        action: 'CLASS_CREATED',
        module: 'settings',
        entityId: classId,
        details: { name, stream, defaultSection }
      });

      return res.status(201).json({
        success: true,
        message: `Class "${name}" created with Section ${defaultSection}.`,
        data: {
          id: classId,
          name,
          numericOrder,
          stream,
          isActive: true,
          isDemo: false,
          studentCount: 0,
          sections: [
            {
              id: secId,
              classId,
              name: defaultSection,
              roomNumber,
              capacity: 40,
              classTeacherId: null,
              classTeacherName: null,
              studentCount: 0,
              isDemo: false
            }
          ]
        }
      });
    }
  );

  router.post(
    '/classes/:id/sections',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const cls = db.prepare('SELECT id FROM classes WHERE id = ?').get(req.params.id);
      if (!cls) {
        return res.status(404).json({ success: false, message: 'Class not found.' });
      }

      const name = String(req.body?.name || '').trim().toUpperCase();
      const roomNumber = String(req.body?.roomNumber || '').trim();
      const capacity = Math.max(1, Number(req.body?.capacity || 40));

      if (!name) {
        return res.status(400).json({ success: false, message: 'Section name is required.' });
      }
      const dup = db
        .prepare('SELECT id FROM sections WHERE class_id = ? AND name = ?')
        .get(req.params.id, name);
      if (dup) {
        return res.status(409).json({ success: false, message: `Section ${name} already exists.` });
      }

      const secId = generateEduId('edu_sec');
      db.prepare(
        'INSERT INTO sections (id, class_id, name, room_number, capacity, class_teacher_id, is_demo) VALUES (?, ?, ?, ?, ?, NULL, 0)'
      ).run(secId, req.params.id, name, roomNumber, capacity);

      return res.status(201).json({
        success: true,
        message: `Section ${name} added.`,
        data: {
          id: secId,
          classId: req.params.id,
          name,
          roomNumber,
          capacity,
          classTeacherId: null,
          classTeacherName: null,
          studentCount: 0,
          isDemo: false
        }
      });
    }
  );

  // Subjects
  router.get('/subjects', requireEduAuth, (_req, res) => {
    const db = getEduManageDb();
    const rows = db.prepare('SELECT * FROM subjects ORDER BY department ASC, name ASC').all() as any[];
    const data: SubjectRecord[] = rows.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      department: r.department,
      subjectType: r.subject_type,
      maxMarksDefault: Number(r.max_marks_default || 100),
      passMarksDefault: Number(r.pass_marks_default || 33),
      isDemo: Boolean(r.is_demo)
    }));
    return res.json({ success: true, data });
  });

  router.post(
    '/subjects',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin', 'principal']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const code = String(req.body?.code || '').trim().toUpperCase();
      const name = String(req.body?.name || '').trim();
      const department = String(req.body?.department || 'Core').trim() || 'Core';
      const subjectType = String(req.body?.subjectType || 'theory').trim();
      const maxMarksDefault = Math.max(10, Number(req.body?.maxMarksDefault || 100));
      const passMarksDefault = Math.max(0, Number(req.body?.passMarksDefault || 33));

      if (!code || !name) {
        return res.status(400).json({ success: false, message: 'Subject code and name are required.' });
      }
      if (!['theory', 'practical', 'elective'].includes(subjectType)) {
        return res.status(400).json({ success: false, message: 'Invalid subject type.' });
      }
      if (passMarksDefault > maxMarksDefault) {
        return res.status(400).json({
          success: false,
          message: 'Pass marks cannot exceed maximum marks.'
        });
      }

      const dup = db.prepare('SELECT id FROM subjects WHERE code = ?').get(code);
      if (dup) {
        return res.status(409).json({ success: false, message: 'Subject code already exists.' });
      }

      const id = generateEduId('edu_sub');
      db.prepare(`
        INSERT INTO subjects (id, code, name, department, subject_type, max_marks_default, pass_marks_default, is_demo)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
      `).run(id, code, name, department, subjectType, maxMarksDefault, passMarksDefault);

      writeEduAuditLog({
        req,
        action: 'SUBJECT_CREATED',
        module: 'settings',
        entityId: id,
        details: { code, name }
      });

      return res.status(201).json({
        success: true,
        message: `Subject "${name}" (${code}) added.`,
        data: {
          id,
          code,
          name,
          department,
          subjectType,
          maxMarksDefault,
          passMarksDefault,
          isDemo: false
        }
      });
    }
  );

  router.delete(
    '/subjects/:id',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin']),
    (req, res) => {
      const db = getEduManageDb();
      try {
        const info = db.prepare('DELETE FROM subjects WHERE id = ?').run(req.params.id);
        if (info.changes === 0) {
          return res.status(404).json({ success: false, message: 'Subject not found.' });
        }
        return res.json({ success: true, message: 'Subject removed.', data: null });
      } catch {
        return res.status(409).json({
          success: false,
          message: 'Cannot delete a subject linked to existing exams, timetables, or homework.'
        });
      }
    }
  );

  return router;
}

import express from 'express';
import { generateEduId, getEduManageDb } from '../db.ts';
import {
  AuthenticatedEduRequest,
  hashEduPasswordSync,
  isSafeEduHttpUrl,
  requireEduAuth,
  requireEduRole,
  writeEduAuditLog
} from '../security.ts';
import type {
  ParentSummary,
  StudentDetailRecord,
  StudentDocumentRecord,
  StudentRecord
} from '../../../src/types/edumanage.ts';

const VALID_GENDERS = new Set(['male', 'female', 'other']);
const VALID_STUDENT_STATUSES = new Set(['active', 'promoted', 'transferred', 'graduated', 'inactive']);
const VALID_DOC_CATEGORIES = new Set([
  'birth_certificate',
  'transfer_certificate',
  'id_proof',
  'report_card',
  'medical',
  'other'
]);
const VALID_RELATIONS = new Set(['father', 'mother', 'guardian']);

function parseDocumentsJson(raw: string | null | undefined): StudentDocumentRecord[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((d: any, idx: number) => ({
      id: String(d?.id || `doc_${idx + 1}`),
      name: String(d?.name || 'Document'),
      category: VALID_DOC_CATEGORIES.has(d?.category) ? d.category : 'other',
      url: String(d?.url || ''),
      verified: Boolean(d?.verified),
      uploadedAt: String(d?.uploadedAt || new Date().toISOString())
    }));
  } catch {
    return [];
  }
}

function getCurrentSessionId(db: ReturnType<typeof getEduManageDb>): string {
  const row = db
    .prepare('SELECT id FROM academic_sessions ORDER BY is_current DESC, start_date DESC LIMIT 1')
    .get() as any;
  if (!row) {
    throw new Error('No academic session configured.');
  }
  return row.id;
}

function generateAdmissionNumber(db: ReturnType<typeof getEduManageDb>): string {
  const year = new Date().getFullYear();
  const countRow = db.prepare('SELECT COUNT(*) AS cnt FROM students').get() as any;
  let seq = Number(countRow?.cnt || 0) + 1;
  while (true) {
    const candidate = `MA-${year}-${String(seq).padStart(3, '0')}`;
    const existing = db.prepare('SELECT id FROM students WHERE admission_number = ?').get(candidate);
    if (!existing) return candidate;
    seq += 1;
  }
}

function mapStudentRow(row: any): StudentRecord {
  const presentDays = Number(row.att_present || 0);
  const totalDays = Number(row.att_total || 0);
  return {
    id: row.id,
    userId: row.user_id,
    admissionNumber: row.admission_number,
    rollNumber: row.roll_number || '',
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: `${row.first_name} ${row.last_name}`.trim(),
    dateOfBirth: row.date_of_birth || '',
    gender: row.gender,
    bloodGroup: row.blood_group || '',
    phone: row.phone || '',
    email: row.email || '',
    address: row.address || '',
    parentId: row.parent_id || null,
    parentName: row.parent_name || null,
    parentPhone: row.parent_phone || null,
    parentRelation: row.parent_relation || null,
    currentClassId: row.current_class_id,
    currentClassName: row.class_name || '',
    currentSectionId: row.current_section_id,
    currentSectionName: row.section_name || '',
    admissionDate: row.admission_date,
    status: row.status,
    transferNotes: row.transfer_notes || '',
    documents: parseDocumentsJson(row.documents_json),
    attendancePct: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : null,
    isDemo: Boolean(row.is_demo),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function fetchStudentById(db: ReturnType<typeof getEduManageDb>, studentId: string): StudentDetailRecord | null {
  const row = db
    .prepare(`
      SELECT s.*,
             c.name AS class_name,
             sec.name AS section_name,
             p.guardian_name AS parent_name,
             p.phone AS parent_phone,
             p.relation AS parent_relation,
             (SELECT COUNT(*) FROM student_attendance sa WHERE sa.student_id = s.id) AS att_total,
             (SELECT COUNT(*) FROM student_attendance sa WHERE sa.student_id = s.id AND sa.status IN ('present', 'late')) AS att_present
      FROM students s
      JOIN classes c ON c.id = s.current_class_id
      JOIN sections sec ON sec.id = s.current_section_id
      LEFT JOIN parents p ON p.id = s.parent_id
      WHERE s.id = ?
    `)
    .get(studentId) as any;

  if (!row) return null;
  const base = mapStudentRow(row);

  let parent: ParentSummary | null = null;
  if (row.parent_id) {
    const pRow = db.prepare('SELECT * FROM parents WHERE id = ?').get(row.parent_id) as any;
    if (pRow) {
      parent = {
        id: pRow.id,
        userId: pRow.user_id,
        guardianName: pRow.guardian_name,
        relation: pRow.relation,
        phone: pRow.phone,
        altPhone: pRow.alt_phone || '',
        email: pRow.email || '',
        occupation: pRow.occupation || '',
        address: pRow.address || ''
      };
    }
  }

  const enrollmentRows = db
    .prepare(`
      SELECT se.*, sess.name AS session_name, c.name AS class_name, sec.name AS section_name
      FROM student_enrollments se
      JOIN academic_sessions sess ON sess.id = se.session_id
      JOIN classes c ON c.id = se.class_id
      JOIN sections sec ON sec.id = se.section_id
      WHERE se.student_id = ?
      ORDER BY sess.start_date DESC, se.created_at DESC
    `)
    .all(studentId) as any[];

  const attAgg = db
    .prepare(`
      SELECT
        COUNT(*) AS total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) AS absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) AS late_days
      FROM student_attendance
      WHERE student_id = ?
    `)
    .get(studentId) as any;

  const totalDays = Number(attAgg?.total_days || 0);
  const presentDays = Number(attAgg?.present_days || 0);
  const absentDays = Number(attAgg?.absent_days || 0);
  const lateDays = Number(attAgg?.late_days || 0);

  const marksRows = db
    .prepare(`
      SELECT e.name AS exam_name, sub.name AS subject_name, sm.marks_obtained, es.max_marks, sm.grade
      FROM student_marks sm
      JOIN examinations e ON e.id = sm.examination_id
      JOIN examination_subjects es ON es.id = sm.exam_subject_id
      JOIN subjects sub ON sub.id = es.subject_id
      WHERE sm.student_id = ?
      ORDER BY e.start_date DESC, sub.name ASC
      LIMIT 12
    `)
    .all(studentId) as any[];

  return {
    ...base,
    parent,
    enrollments: enrollmentRows.map((e) => ({
      id: e.id,
      sessionId: e.session_id,
      sessionName: e.session_name,
      classId: e.class_id,
      className: e.class_name,
      sectionId: e.section_id,
      sectionName: e.section_name,
      rollNumber: e.roll_number || '',
      enrollmentStatus: e.enrollment_status,
      remarks: e.remarks || '',
      createdAt: e.created_at
    })),
    attendanceSummary: {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      percentage: totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 0
    },
    recentMarks: marksRows.map((m) => ({
      examName: m.exam_name,
      subjectName: m.subject_name,
      marksObtained: Number(m.marks_obtained || 0),
      maxMarks: Number(m.max_marks || 100),
      grade: m.grade || ''
    }))
  };
}

export function createEduManageStudentRouter(): express.Router {
  const router = express.Router();

  // List parents for admission linking
  router.get(
    '/parents',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin', 'principal', 'teacher', 'accountant']),
    (_req, res) => {
      const db = getEduManageDb();
      const rows = db.prepare('SELECT * FROM parents ORDER BY guardian_name ASC').all() as any[];
      const data: ParentSummary[] = rows.map((p) => ({
        id: p.id,
        userId: p.user_id,
        guardianName: p.guardian_name,
        relation: p.relation,
        phone: p.phone,
        altPhone: p.alt_phone || '',
        email: p.email || '',
        occupation: p.occupation || '',
        address: p.address || ''
      }));
      return res.json({ success: true, data });
    }
  );

  // List & search students
  router.get(
    '/students',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin', 'principal', 'teacher', 'accountant', 'librarian']),
    (req, res) => {
      const db = getEduManageDb();
      const q = String(req.query.q || '').trim().toLowerCase();
      const classId = String(req.query.classId || '').trim();
      const sectionId = String(req.query.sectionId || '').trim();
      const status = String(req.query.status || '').trim();

      const where: string[] = [];
      const params: unknown[] = [];

      if (q) {
        where.push(`(
          LOWER(s.first_name || ' ' || s.last_name) LIKE ?
          OR LOWER(s.admission_number) LIKE ?
          OR LOWER(s.email) LIKE ?
          OR LOWER(COALESCE(p.guardian_name, '')) LIKE ?
          OR LOWER(COALESCE(p.phone, '')) LIKE ?
        )`);
        const like = `%${q}%`;
        params.push(like, like, like, like, like);
      }
      if (classId) {
        where.push('s.current_class_id = ?');
        params.push(classId);
      }
      if (sectionId) {
        where.push('s.current_section_id = ?');
        params.push(sectionId);
      }
      if (status && VALID_STUDENT_STATUSES.has(status)) {
        where.push('s.status = ?');
        params.push(status);
      }

      const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
      const rows = db
        .prepare(`
          SELECT s.*,
                 c.name AS class_name,
                 c.numeric_order AS class_order,
                 sec.name AS section_name,
                 p.guardian_name AS parent_name,
                 p.phone AS parent_phone,
                 p.relation AS parent_relation,
                 (SELECT COUNT(*) FROM student_attendance sa WHERE sa.student_id = s.id) AS att_total,
                 (SELECT COUNT(*) FROM student_attendance sa WHERE sa.student_id = s.id AND sa.status IN ('present', 'late')) AS att_present
          FROM students s
          JOIN classes c ON c.id = s.current_class_id
          JOIN sections sec ON sec.id = s.current_section_id
          LEFT JOIN parents p ON p.id = s.parent_id
          ${whereSql}
          ORDER BY c.numeric_order ASC, sec.name ASC, s.roll_number ASC, s.first_name ASC
        `)
        .all(...params) as any[];

      return res.json({ success: true, data: rows.map(mapStudentRow) });
    }
  );

  // Student dossier details
  router.get(
    '/students/:id',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin', 'principal', 'teacher', 'accountant', 'librarian']),
    (req, res) => {
      const db = getEduManageDb();
      const detail = fetchStudentById(db, req.params.id);
      if (!detail) {
        return res.status(404).json({ success: false, message: 'Student record not found.' });
      }
      return res.json({ success: true, data: detail });
    }
  );

  // Register / Admit a new student (transactional: student user + optional parent user + enrollment)
  router.post(
    '/students',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const body = req.body || {};

      const firstName = String(body.firstName || '').trim();
      const lastName = String(body.lastName || '').trim();
      const classId = String(body.classId || '').trim();
      const sectionId = String(body.sectionId || '').trim();
      const gender = String(body.gender || 'other').trim().toLowerCase();
      const dateOfBirth = String(body.dateOfBirth || '').trim();
      const bloodGroup = String(body.bloodGroup || '').trim();
      const phone = String(body.phone || '').trim();
      const address = String(body.address || '').trim();
      const rollNumber = String(body.rollNumber || '').trim();
      const admissionDate = String(body.admissionDate || new Date().toISOString().slice(0, 10)).trim();
      const requestedAdmissionNo = String(body.admissionNumber || '').trim().toUpperCase();
      const portalPassword = String(body.portalPassword || 'EduStudent@2026!');

      if (!firstName || !lastName) {
        return res.status(400).json({ success: false, message: 'Student first and last name are required.' });
      }
      if (!classId || !sectionId) {
        return res.status(400).json({ success: false, message: 'Class and section allocation are required.' });
      }
      if (!VALID_GENDERS.has(gender)) {
        return res.status(400).json({ success: false, message: 'Invalid gender selection.' });
      }
      if (portalPassword.length < 8) {
        return res.status(400).json({ success: false, message: 'Portal password must be at least 8 characters.' });
      }

      const sectionRow = db
        .prepare('SELECT id, class_id FROM sections WHERE id = ? AND class_id = ?')
        .get(sectionId, classId);
      if (!sectionRow) {
        return res.status(400).json({
          success: false,
          message: 'Selected section does not belong to the chosen class.'
        });
      }

      const admissionNumber = requestedAdmissionNo || generateAdmissionNumber(db);
      if (db.prepare('SELECT id FROM students WHERE admission_number = ?').get(admissionNumber)) {
        return res.status(409).json({
          success: false,
          message: `Admission number "${admissionNumber}" is already assigned.`
        });
      }

      const emailInput = String(body.email || '').trim().toLowerCase();
      const studentEmail =
        emailInput || `${admissionNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}@meridian.edu`;
      if (db.prepare('SELECT id FROM users WHERE email = ?').get(studentEmail)) {
        return res.status(409).json({
          success: false,
          message: `Email "${studentEmail}" is already registered to another user.`
        });
      }

      let resolvedParentId: string | null = body.parentId ? String(body.parentId).trim() : null;
      const newParent = body.newParent && typeof body.newParent === 'object' ? body.newParent : null;

      if (resolvedParentId) {
        const existingParent = db.prepare('SELECT id FROM parents WHERE id = ?').get(resolvedParentId);
        if (!existingParent) {
          return res.status(400).json({ success: false, message: 'Selected parent record does not exist.' });
        }
      } else if (newParent && String(newParent.guardianName || '').trim()) {
        const parentEmail = String(newParent.email || '').trim().toLowerCase();
        if (parentEmail && db.prepare('SELECT id FROM users WHERE email = ?').get(parentEmail)) {
          return res.status(409).json({
            success: false,
            message: `Parent email "${parentEmail}" is already in use.`
          });
        }
      }

      const nowIso = new Date().toISOString();
      const studentUserId = generateEduId('edu_u_stu');
      const studentId = generateEduId('edu_s');
      const sessionId = getCurrentSessionId(db);

      const tx = db.transaction(() => {
        if (!resolvedParentId && newParent && String(newParent.guardianName || '').trim()) {
          const guardianName = String(newParent.guardianName).trim();
          const relationRaw = String(newParent.relation || 'father').trim().toLowerCase();
          const relation = VALID_RELATIONS.has(relationRaw) ? relationRaw : 'guardian';
          const parentPhone = String(newParent.phone || phone || '9800000000').trim();
          const parentEmail =
            String(newParent.email || '').trim().toLowerCase() ||
            `parent.${admissionNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}@meridian.edu`;
          const parentPassword = String(newParent.portalPassword || 'EduParent@2026!');

          const parentUserId = generateEduId('edu_u_par');
          resolvedParentId = generateEduId('edu_p');

          db.prepare(`
            INSERT INTO users (id, full_name, email, phone, password_hash, role_code, avatar_url, is_active, is_demo, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'parent', '', 1, 0, ?, ?)
          `).run(
            parentUserId,
            guardianName,
            parentEmail,
            parentPhone,
            hashEduPasswordSync(parentPassword),
            nowIso,
            nowIso
          );

          db.prepare(`
            INSERT INTO parents (id, user_id, guardian_name, relation, phone, alt_phone, email, occupation, address, is_demo, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
          `).run(
            resolvedParentId,
            parentUserId,
            guardianName,
            relation,
            parentPhone,
            String(newParent.altPhone || '').trim(),
            parentEmail,
            String(newParent.occupation || '').trim(),
            String(newParent.address || address).trim(),
            nowIso
          );
        }

        db.prepare(`
          INSERT INTO users (id, full_name, email, phone, password_hash, role_code, avatar_url, is_active, is_demo, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 'student', '', 1, 0, ?, ?)
        `).run(
          studentUserId,
          `${firstName} ${lastName}`.trim(),
          studentEmail,
          phone,
          hashEduPasswordSync(portalPassword),
          nowIso,
          nowIso
        );

        db.prepare(`
          INSERT INTO students (
            id, user_id, admission_number, roll_number, first_name, last_name, date_of_birth, gender,
            blood_group, phone, email, address, parent_id, current_class_id, current_section_id,
            admission_date, status, transfer_notes, documents_json, is_demo, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', '', '[]', 0, ?, ?)
        `).run(
          studentId,
          studentUserId,
          admissionNumber,
          rollNumber,
          firstName,
          lastName,
          dateOfBirth,
          gender,
          bloodGroup,
          phone,
          studentEmail,
          address,
          resolvedParentId,
          classId,
          sectionId,
          admissionDate,
          nowIso,
          nowIso
        );

        db.prepare(`
          INSERT INTO student_enrollments (
            id, student_id, session_id, class_id, section_id, roll_number, enrollment_status, remarks, is_demo, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, 'enrolled', 'Initial admission', 0, ?)
        `).run(
          generateEduId('edu_enr'),
          studentId,
          sessionId,
          classId,
          sectionId,
          rollNumber,
          nowIso
        );
      });

      tx();

      writeEduAuditLog({
        req,
        action: 'STUDENT_ADMITTED',
        module: 'students',
        entityId: studentId,
        details: { admissionNumber, fullName: `${firstName} ${lastName}`, classId, sectionId }
      });

      return res.status(201).json({
        success: true,
        message: `Student ${firstName} ${lastName} admitted (${admissionNumber}).`,
        data: fetchStudentById(db, studentId)
      });
    }
  );

  // Update student profile & class/section allocation
  router.patch(
    '/students/:id',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const existing = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id) as any;
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Student not found.' });
      }

      const body = req.body || {};
      const firstName = body.firstName !== undefined ? String(body.firstName).trim() : existing.first_name;
      const lastName = body.lastName !== undefined ? String(body.lastName).trim() : existing.last_name;
      if (!firstName || !lastName) {
        return res.status(400).json({ success: false, message: 'First and last name cannot be empty.' });
      }

      const classId = body.classId !== undefined ? String(body.classId).trim() : existing.current_class_id;
      const sectionId = body.sectionId !== undefined ? String(body.sectionId).trim() : existing.current_section_id;
      const secCheck = db
        .prepare('SELECT id FROM sections WHERE id = ? AND class_id = ?')
        .get(sectionId, classId);
      if (!secCheck) {
        return res.status(400).json({
          success: false,
          message: 'Selected section does not belong to the chosen class.'
        });
      }

      const gender = body.gender !== undefined ? String(body.gender).trim().toLowerCase() : existing.gender;
      if (!VALID_GENDERS.has(gender)) {
        return res.status(400).json({ success: false, message: 'Invalid gender.' });
      }

      const status = body.status !== undefined ? String(body.status).trim() : existing.status;
      if (!VALID_STUDENT_STATUSES.has(status)) {
        return res.status(400).json({ success: false, message: 'Invalid student status.' });
      }

      const parentId =
        body.parentId !== undefined ? (body.parentId ? String(body.parentId).trim() : null) : existing.parent_id;
      if (parentId && !db.prepare('SELECT id FROM parents WHERE id = ?').get(parentId)) {
        return res.status(400).json({ success: false, message: 'Linked parent record not found.' });
      }

      const rollNumber = body.rollNumber !== undefined ? String(body.rollNumber).trim() : existing.roll_number;
      const nowIso = new Date().toISOString();
      const sessionId = getCurrentSessionId(db);

      const tx = db.transaction(() => {
        db.prepare(`
          UPDATE students
          SET first_name = ?,
              last_name = ?,
              roll_number = ?,
              date_of_birth = ?,
              gender = ?,
              blood_group = ?,
              phone = ?,
              address = ?,
              parent_id = ?,
              current_class_id = ?,
              current_section_id = ?,
              status = ?,
              updated_at = ?
          WHERE id = ?
        `).run(
          firstName,
          lastName,
          rollNumber,
          body.dateOfBirth !== undefined ? String(body.dateOfBirth).trim() : existing.date_of_birth,
          gender,
          body.bloodGroup !== undefined ? String(body.bloodGroup).trim() : existing.blood_group,
          body.phone !== undefined ? String(body.phone).trim() : existing.phone,
          body.address !== undefined ? String(body.address).trim() : existing.address,
          parentId,
          classId,
          sectionId,
          status,
          nowIso,
          existing.id
        );

        db.prepare('UPDATE users SET full_name = ?, phone = ?, updated_at = ? WHERE id = ?').run(
          `${firstName} ${lastName}`.trim(),
          body.phone !== undefined ? String(body.phone).trim() : existing.phone,
          nowIso,
          existing.user_id
        );

        db.prepare(`
          UPDATE student_enrollments
          SET class_id = ?, section_id = ?, roll_number = ?
          WHERE student_id = ? AND session_id = ?
        `).run(classId, sectionId, rollNumber, existing.id, sessionId);
      });
      tx();

      writeEduAuditLog({
        req,
        action: 'STUDENT_UPDATED',
        module: 'students',
        entityId: existing.id,
        details: { admissionNumber: existing.admission_number, classId, sectionId, status }
      });

      return res.json({
        success: true,
        message: 'Student profile updated.',
        data: fetchStudentById(db, existing.id)
      });
    }
  );

  // Add student document record
  router.post(
    '/students/:id/documents',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const existing = db.prepare('SELECT id, documents_json FROM students WHERE id = ?').get(req.params.id) as any;
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Student not found.' });
      }

      const name = String(req.body?.name || '').trim();
      const category = String(req.body?.category || 'other').trim();
      const url = String(req.body?.url || '').trim();
      const verified = Boolean(req.body?.verified);

      if (!name) {
        return res.status(400).json({ success: false, message: 'Document title is required.' });
      }
      if (!VALID_DOC_CATEGORIES.has(category)) {
        return res.status(400).json({ success: false, message: 'Invalid document category.' });
      }
      if (!isSafeEduHttpUrl(url)) {
        return res.status(400).json({
          success: false,
          message: 'Document reference URL must use http://, https://, or a relative path.'
        });
      }

      const docs = parseDocumentsJson(existing.documents_json);
      const newDoc: StudentDocumentRecord = {
        id: generateEduId('edu_doc'),
        name,
        category: category as StudentDocumentRecord['category'],
        url,
        verified,
        uploadedAt: new Date().toISOString()
      };
      docs.push(newDoc);

      db.prepare('UPDATE students SET documents_json = ?, updated_at = ? WHERE id = ?').run(
        JSON.stringify(docs),
        new Date().toISOString(),
        existing.id
      );

      return res.status(201).json({
        success: true,
        message: 'Document recorded on student profile.',
        data: newDoc
      });
    }
  );

  // Remove student document record
  router.delete(
    '/students/:id/documents/:docId',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin']),
    (req, res) => {
      const db = getEduManageDb();
      const existing = db.prepare('SELECT id, documents_json FROM students WHERE id = ?').get(req.params.id) as any;
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Student not found.' });
      }

      const docs = parseDocumentsJson(existing.documents_json);
      const nextDocs = docs.filter((d) => d.id !== req.params.docId);
      if (nextDocs.length === docs.length) {
        return res.status(404).json({ success: false, message: 'Document not found.' });
      }

      db.prepare('UPDATE students SET documents_json = ?, updated_at = ? WHERE id = ?').run(
        JSON.stringify(nextDocs),
        new Date().toISOString(),
        existing.id
      );

      return res.json({ success: true, message: 'Document removed.', data: null });
    }
  );

  // Promote student to a new class & section (records academic enrollment history)
  router.post(
    '/students/:id/promote',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin', 'principal']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id) as any;
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found.' });
      }
      if (student.status === 'transferred') {
        return res.status(400).json({
          success: false,
          message: 'Transferred students cannot be promoted.'
        });
      }

      const targetClassId = String(req.body?.targetClassId || '').trim();
      const targetSectionId = String(req.body?.targetSectionId || '').trim();
      const targetSessionId = String(req.body?.targetSessionId || getCurrentSessionId(db)).trim();
      const newRollNumber = String(req.body?.newRollNumber || student.roll_number || '').trim();
      const remarks = String(req.body?.remarks || 'Promoted to next grade').trim();

      if (!targetClassId || !targetSectionId) {
        return res.status(400).json({
          success: false,
          message: 'Target class and section are required for promotion.'
        });
      }

      const secCheck = db
        .prepare('SELECT id FROM sections WHERE id = ? AND class_id = ?')
        .get(targetSectionId, targetClassId);
      if (!secCheck) {
        return res.status(400).json({
          success: false,
          message: 'Target section does not belong to target class.'
        });
      }
      const sessCheck = db.prepare('SELECT id FROM academic_sessions WHERE id = ?').get(targetSessionId);
      if (!sessCheck) {
        return res.status(400).json({ success: false, message: 'Target academic session not found.' });
      }

      const nowIso = new Date().toISOString();
      const tx = db.transaction(() => {
        db.prepare(`
          UPDATE students
          SET current_class_id = ?,
              current_section_id = ?,
              roll_number = ?,
              status = 'active',
              updated_at = ?
          WHERE id = ?
        `).run(targetClassId, targetSectionId, newRollNumber, nowIso, student.id);

        const existingEnr = db
          .prepare('SELECT id FROM student_enrollments WHERE student_id = ? AND session_id = ?')
          .get(student.id, targetSessionId) as any;

        if (existingEnr) {
          db.prepare(`
            UPDATE student_enrollments
            SET class_id = ?, section_id = ?, roll_number = ?, enrollment_status = 'promoted', remarks = ?
            WHERE id = ?
          `).run(targetClassId, targetSectionId, newRollNumber, remarks, existingEnr.id);
        } else {
          db.prepare(`
            INSERT INTO student_enrollments (
              id, student_id, session_id, class_id, section_id, roll_number, enrollment_status, remarks, is_demo, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, 'promoted', ?, 0, ?)
          `).run(
            generateEduId('edu_enr'),
            student.id,
            targetSessionId,
            targetClassId,
            targetSectionId,
            newRollNumber,
            remarks,
            nowIso
          );
        }
      });
      tx();

      writeEduAuditLog({
        req,
        action: 'STUDENT_PROMOTED',
        module: 'students',
        entityId: student.id,
        details: { admissionNumber: student.admission_number, targetClassId, targetSectionId, targetSessionId }
      });

      return res.json({
        success: true,
        message: 'Student promoted successfully.',
        data: fetchStudentById(db, student.id)
      });
    }
  );

  // Issue Transfer Certificate (TC) & revoke student login sessions
  router.post(
    '/students/:id/transfer',
    requireEduAuth,
    requireEduRole(['super_admin', 'school_admin', 'principal']),
    (req: AuthenticatedEduRequest, res) => {
      const db = getEduManageDb();
      const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id) as any;
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found.' });
      }

      const reason = String(req.body?.reason || '').trim();
      const destinationSchool = String(req.body?.destinationSchool || '').trim();
      const tcNumber = String(req.body?.tcNumber || `TC-${new Date().getFullYear()}-${student.admission_number}`).trim();
      const transferDate = String(req.body?.transferDate || new Date().toISOString().slice(0, 10)).trim();

      if (!reason) {
        return res.status(400).json({ success: false, message: 'Transfer reason is required.' });
      }

      const transferSummary = `TC #${tcNumber} (${transferDate}) · ${reason}${
        destinationSchool ? ` · Destination: ${destinationSchool}` : ''
      }`;
      const nowIso = new Date().toISOString();
      const sessionId = getCurrentSessionId(db);

      const tx = db.transaction(() => {
        db.prepare(`
          UPDATE students
          SET status = 'transferred', transfer_notes = ?, updated_at = ?
          WHERE id = ?
        `).run(transferSummary, nowIso, student.id);

        db.prepare(`
          UPDATE student_enrollments
          SET enrollment_status = 'transferred', remarks = ?
          WHERE student_id = ? AND session_id = ?
        `).run(transferSummary, student.id, sessionId);

        db.prepare('UPDATE users SET is_active = 0, updated_at = ? WHERE id = ?').run(
          nowIso,
          student.user_id
        );
        db.prepare('DELETE FROM sessions WHERE user_id = ?').run(student.user_id);
      });
      tx();

      writeEduAuditLog({
        req,
        action: 'STUDENT_TRANSFERRED',
        module: 'students',
        entityId: student.id,
        details: { admissionNumber: student.admission_number, tcNumber, destinationSchool }
      });

      return res.json({
        success: true,
        message: `Transfer Certificate (${tcNumber}) issued.`,
        data: fetchStudentById(db, student.id)
      });
    }
  );

  return router;
}

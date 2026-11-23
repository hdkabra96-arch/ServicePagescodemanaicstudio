import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import http from 'node:http';
import { closeEduManageDb, getEduManageDb } from '../../server/edumanage/db.ts';
import { createEduManageRouter } from '../../server/edumanage/routes/index.ts';
import { resetEduRateLimitStore } from '../../server/edumanage/security.ts';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edumanage-phase3-'));
const dbFile = path.join(tmpDir, 'edumanage-p3.db');
process.env.EDUMANAGE_DB_PATH = dbFile;

let server: http.Server;
let baseUrl = '';

async function apiFetch(
  endpoint: string,
  options: { method?: string; token?: string; body?: unknown } = {}
) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const res = await fetch(`${baseUrl}/api/edumanage${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function loginAs(email: string, password: string): Promise<string> {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email, password }
  });
  assert.equal(res.status, 200, `Expected login success for ${email}`);
  return res.json.data.token as string;
}

test.before(async () => {
  closeEduManageDb();
  resetEduRateLimitStore();
  getEduManageDb();

  const app = express();
  app.use(express.json({ limit: '256kb' }));
  app.use('/api/edumanage', createEduManageRouter());

  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address() as { port: number };
      baseUrl = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  closeEduManageDb();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('1. Student registration with new parent, real student login, search/filter & document CRUD', async () => {
  const adminToken = await loginAs('admin@edumanage.demo', 'EduAdmin@2026!');

  const classesRes = await apiFetch('/classes', { token: adminToken });
  assert.equal(classesRes.status, 200);
  const cls1 = classesRes.json.data[0];
  const sec1 = cls1.sections[0];

  // Admit student with brand new guardian
  const admitRes = await apiFetch('/students', {
    method: 'POST',
    token: adminToken,
    body: {
      firstName: 'Kavya',
      lastName: 'Trivedi',
      rollNumber: '42',
      gender: 'female',
      dateOfBirth: '2011-04-12',
      bloodGroup: 'A+',
      phone: '9825011223',
      email: 'kavya.trivedi@meridian.edu',
      address: '14 Satellite Road, Ahmedabad',
      classId: cls1.id,
      sectionId: sec1.id,
      portalPassword: 'KavyaLogin@2026!',
      newParent: {
        guardianName: 'Nitin Trivedi',
        relation: 'father',
        phone: '9825099887',
        email: 'nitin.trivedi@example.com',
        occupation: 'Chartered Accountant'
      }
    }
  });
  assert.equal(admitRes.status, 201);
  const student = admitRes.json.data;
  assert.ok(student.admissionNumber.startsWith('MA-'));
  assert.equal(student.parent?.guardianName, 'Nitin Trivedi');
  assert.equal(student.isDemo, false);
  assert.equal(student.enrollments.length, 1);

  // Verify newly admitted student can actually sign in with salted scrypt password
  const studentLogin = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email: 'kavya.trivedi@meridian.edu', password: 'KavyaLogin@2026!' }
  });
  assert.equal(studentLogin.status, 200);
  assert.equal(studentLogin.json.data.user.role, 'student');

  // Search & class filter
  const searchRes = await apiFetch(`/students?q=Kavya&classId=${cls1.id}`, { token: adminToken });
  assert.equal(searchRes.status, 200);
  assert.equal(searchRes.json.data.length, 1);
  assert.equal(searchRes.json.data[0].id, student.id);

  // Document unsafe URL rejection + valid add + delete
  const badDoc = await apiFetch(`/students/${student.id}/documents`, {
    method: 'POST',
    token: adminToken,
    body: { name: 'Bad Link', category: 'other', url: 'javascript:alert(1)' }
  });
  assert.equal(badDoc.status, 400);

  const addDoc = await apiFetch(`/students/${student.id}/documents`, {
    method: 'POST',
    token: adminToken,
    body: {
      name: 'Municipal Birth Certificate',
      category: 'birth_certificate',
      url: 'https://docs.meridian.edu/birth-kavya.pdf',
      verified: true
    }
  });
  assert.equal(addDoc.status, 201);
  const docId = addDoc.json.data.id;

  const delDoc = await apiFetch(`/students/${student.id}/documents/${docId}`, {
    method: 'DELETE',
    token: adminToken
  });
  assert.equal(delDoc.status, 200);
});

test('2. Student promotion & Transfer Certificate (TC) revoke student portal session', async () => {
  const principalToken = await loginAs('principal@edumanage.demo', 'EduPrincipal@2026!');
  const adminToken = await loginAs('admin@edumanage.demo', 'EduAdmin@2026!');

  const classesRes = await apiFetch('/classes', { token: adminToken });
  const classes = classesRes.json.data;
  const targetCls = classes[classes.length - 1];
  const targetSec = targetCls.sections[0];

  // Find Kavya created in test 1
  const listRes = await apiFetch('/students?q=Kavya', { token: adminToken });
  const kavya = listRes.json.data[0];
  assert.ok(kavya);

  // Sign Kavya in before transfer so we verify session revocation
  const kavyaToken = await loginAs('kavya.trivedi@meridian.edu', 'KavyaLogin@2026!');

  // Principal promotes Kavya to target class
  const promoteRes = await apiFetch(`/students/${kavya.id}/promote`, {
    method: 'POST',
    token: principalToken,
    body: {
      targetClassId: targetCls.id,
      targetSectionId: targetSec.id,
      newRollNumber: '09',
      remarks: 'Honors promotion'
    }
  });
  assert.equal(promoteRes.status, 200);
  assert.equal(promoteRes.json.data.currentClassId, targetCls.id);
  assert.equal(promoteRes.json.data.rollNumber, '09');

  // Issue Transfer Certificate
  const tcRes = await apiFetch(`/students/${kavya.id}/transfer`, {
    method: 'POST',
    token: principalToken,
    body: {
      reason: 'Family relocation to Mumbai',
      destinationSchool: 'Bombay International School',
      tcNumber: 'TC-2026-KAVYA'
    }
  });
  assert.equal(tcRes.status, 200);
  assert.equal(tcRes.json.data.status, 'transferred');
  assert.ok(tcRes.json.data.transferNotes.includes('TC-2026-KAVYA'));

  // Active student session must be immediately revoked & re-login blocked
  const meAfterTc = await apiFetch('/auth/me', { token: kavyaToken });
  assert.equal(meAfterTc.status, 401);

  const reloginAfterTc = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email: 'kavya.trivedi@meridian.edu', password: 'KavyaLogin@2026!' }
  });
  assert.equal(reloginAfterTc.status, 403);
});

test('3. Teacher onboarding, subject/class allocation, daily attendance register, and resignation lockout', async () => {
  const adminToken = await loginAs('admin@edumanage.demo', 'EduAdmin@2026!');
  const principalToken = await loginAs('principal@edumanage.demo', 'EduPrincipal@2026!');

  // Onboard new teacher
  const createRes = await apiFetch('/teachers', {
    method: 'POST',
    token: adminToken,
    body: {
      fullName: 'Prof. Vikramaditya Nair',
      email: 'vikram.nair@meridian.edu',
      phone: '9879012345',
      designation: 'Senior Lecturer',
      department: 'Physics',
      qualification: 'M.Sc. Physics, B.Ed.',
      experienceYears: 11,
      salaryMonthly: 68000,
      employmentType: 'full_time',
      portalPassword: 'VikramTeach@2026!'
    }
  });
  assert.equal(createRes.status, 201);
  const teacher = createRes.json.data;
  assert.ok(teacher.employeeId.startsWith('EMP-'));

  // Verify new teacher authenticates cleanly
  const teacherToken = await loginAs('vikram.nair@meridian.edu', 'VikramTeach@2026!');

  // Allocate class + section + subject and assign as Class Teacher
  const classesRes = await apiFetch('/classes', { token: adminToken });
  const subjectsRes = await apiFetch('/subjects', { token: adminToken });
  const cls = classesRes.json.data[0];
  const sec = cls.sections[0];
  const sub = subjectsRes.json.data[0];

  const allocRes = await apiFetch(`/teachers/${teacher.id}/allocations`, {
    method: 'POST',
    token: principalToken,
    body: {
      classId: cls.id,
      sectionId: sec.id,
      subjectId: sub.id,
      setAsClassTeacher: true
    }
  });
  assert.equal(allocRes.status, 201);
  assert.equal(allocRes.json.data.allocations.length, 1);
  assert.ok(allocRes.json.data.homeroomSections.some((h: any) => h.sectionId === sec.id));

  // Duplicate allocation must return 409
  const dupAlloc = await apiFetch(`/teachers/${teacher.id}/allocations`, {
    method: 'POST',
    token: principalToken,
    body: { classId: cls.id, sectionId: sec.id, subjectId: sub.id }
  });
  assert.equal(dupAlloc.status, 409);

  // Daily teacher attendance register save & read back
  const today = new Date().toISOString().slice(0, 10);
  const saveAtt = await apiFetch('/teachers/attendance/daily', {
    method: 'POST',
    token: principalToken,
    body: {
      date: today,
      entries: [
        { teacherId: teacher.id, status: 'present', checkInTime: '07:55', remarks: 'On time' }
      ]
    }
  });
  assert.equal(saveAtt.status, 200);

  const detailRes = await apiFetch(`/teachers/${teacher.id}`, { token: adminToken });
  assert.equal(detailRes.status, 200);
  assert.equal(detailRes.json.data.todayAttendanceStatus, 'present');

  // Marking teacher resigned must immediately revoke their session
  const resignRes = await apiFetch(`/teachers/${teacher.id}`, {
    method: 'PATCH',
    token: adminToken,
    body: { status: 'resigned' }
  });
  assert.equal(resignRes.status, 200);

  const teacherMeAfterResign = await apiFetch('/auth/me', { token: teacherToken });
  assert.equal(teacherMeAfterResign.status, 401);
});

test('4. Strict RBAC enforcement on Student & Teacher directories and mutations', async () => {
  const teacherToken = await loginAs('teacher@edumanage.demo', 'EduTeacher@2026!');
  const studentToken = await loginAs('student@edumanage.demo', 'EduStudent@2026!');
  const parentToken = await loginAs('parent@edumanage.demo', 'EduParent@2026!');

  // Students and parents cannot browse full school student/teacher directories
  assert.equal((await apiFetch('/students', { token: studentToken })).status, 403);
  assert.equal((await apiFetch('/students', { token: parentToken })).status, 403);
  assert.equal((await apiFetch('/teachers', { token: studentToken })).status, 403);
  assert.equal((await apiFetch('/teachers', { token: parentToken })).status, 403);

  // Teacher can view student & teacher directories, but salary is redacted and mutations are forbidden
  const teacherViewTeachers = await apiFetch('/teachers', { token: teacherToken });
  assert.equal(teacherViewTeachers.status, 200);
  assert.equal(teacherViewTeachers.json.data[0].salaryMonthly, null, 'Teacher role must not see colleagues salaries');

  const teacherAdmit = await apiFetch('/students', {
    method: 'POST',
    token: teacherToken,
    body: { firstName: 'Unauthorized', lastName: 'User', classId: 'x', sectionId: 'y' }
  });
  assert.equal(teacherAdmit.status, 403);

  const teacherCreateFaculty = await apiFetch('/teachers', {
    method: 'POST',
    token: teacherToken,
    body: { fullName: 'Unauthorized', email: 'unauth@meridian.edu' }
  });
  assert.equal(teacherCreateFaculty.status, 403);

  const teacherDailyAtt = await apiFetch('/teachers/attendance/daily', { token: teacherToken });
  assert.equal(teacherDailyAtt.status, 403);
});

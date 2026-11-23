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

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edumanage-phase4-'));
const dbFile = path.join(tmpDir, 'edumanage-p4.db');
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
  assert.equal(res.status, 200, `Login failed for ${email}`);
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

test('1. Class-wise daily attendance marking, monthly SQL aggregation, and student/parent history privacy', async () => {
  const teacherToken = await loginAs('teacher@edumanage.demo', 'EduTeacher@2026!');
  const studentToken = await loginAs('student@edumanage.demo', 'EduStudent@2026!');

  const classesRes = await apiFetch('/classes', { token: teacherToken });
  const cls10 = classesRes.json.data.find((c: any) => c.id === 'edu_cls_10') || classesRes.json.data[0];
  const sec10a = cls10.sections[0];

  const targetDate = '2026-10-15';
  const regBefore = await apiFetch(
    `/attendance/students?classId=${cls10.id}&sectionId=${sec10a.id}&date=${targetDate}`,
    { token: teacherToken }
  );
  assert.equal(regBefore.status, 200);
  assert.ok(regBefore.json.data.length >= 2);

  // Mark attendance: first student present, second student absent
  const entries = regBefore.json.data.map((row: any, idx: number) => ({
    studentId: row.studentId,
    status: idx === 0 ? 'present' : 'absent',
    remarks: idx === 0 ? 'On time' : 'Informed sick leave'
  }));

  const saveRes = await apiFetch('/attendance/students', {
    method: 'POST',
    token: teacherToken,
    body: { classId: cls10.id, sectionId: sec10a.id, date: targetDate, entries }
  });
  assert.equal(saveRes.status, 200);
  assert.equal(saveRes.json.data.total, entries.length);

  // Verify monthly SQL aggregation reflects saved register
  const monthlyRes = await apiFetch(
    `/attendance/monthly?month=2026-10&classId=${cls10.id}&sectionId=${sec10a.id}`,
    { token: teacherToken }
  );
  assert.equal(monthlyRes.status, 200);
  const firstStudentRow = monthlyRes.json.data.students.find(
    (s: any) => s.studentId === entries[0].studentId
  );
  assert.ok(firstStudentRow);
  assert.ok(firstStudentRow.presentDays >= 1);

  // Student can view own history, but is blocked from viewing another student's history
  const ownHistory = await apiFetch('/attendance/student/edu_s_1', { token: studentToken });
  assert.equal(ownHistory.status, 200);
  assert.ok(ownHistory.json.data.history.length >= 1);

  const otherHistory = await apiFetch('/attendance/student/edu_s_2', { token: studentToken });
  assert.equal(otherHistory.status, 403);
});

test('2. Timetable 3-way schedule conflict detection (section, teacher, room) and RBAC enforcement', async () => {
  const adminToken = await loginAs('admin@edumanage.demo', 'EduAdmin@2026!');
  const teacherToken = await loginAs('teacher@edumanage.demo', 'EduTeacher@2026!');

  const classesRes = await apiFetch('/classes', { token: adminToken });
  const teachersRes = await apiFetch('/teachers', { token: adminToken });
  const subjectsRes = await apiFetch('/subjects', { token: adminToken });

  const clsA = classesRes.json.data[0];
  const secA = clsA.sections[0];
  const clsB = classesRes.json.data[1];
  const secB = clsB.sections[0];
  const tch1 = teachersRes.json.data[0];
  const tch2 = teachersRes.json.data[1];
  const sub1 = subjectsRes.json.data[0];
  const sub2 = subjectsRes.json.data[1];

  // Create valid Friday Period 5 slot
  const validSlot = await apiFetch('/timetables', {
    method: 'POST',
    token: adminToken,
    body: {
      classId: clsA.id,
      sectionId: secA.id,
      subjectId: sub1.id,
      teacherId: tch1.id,
      dayOfWeek: 'friday',
      periodNumber: 5,
      startTime: '12:15',
      endTime: '13:00',
      roomNumber: 'Physics Lab 2'
    }
  });
  assert.equal(validSlot.status, 201);
  const createdSlotId = validSlot.json.data.id;

  // Conflict 1: Same section, same day/period -> 409
  const sectionClash = await apiFetch('/timetables', {
    method: 'POST',
    token: adminToken,
    body: {
      classId: clsA.id,
      sectionId: secA.id,
      subjectId: sub2.id,
      teacherId: tch2.id,
      dayOfWeek: 'friday',
      periodNumber: 5,
      startTime: '12:15',
      endTime: '13:00',
      roomNumber: 'Room 105'
    }
  });
  assert.equal(sectionClash.status, 409);
  assert.equal(sectionClash.json.conflictType, 'section');

  // Conflict 2: Different section, SAME teacher -> 409
  const teacherClash = await apiFetch('/timetables', {
    method: 'POST',
    token: adminToken,
    body: {
      classId: clsB.id,
      sectionId: secB.id,
      subjectId: sub1.id,
      teacherId: tch1.id,
      dayOfWeek: 'friday',
      periodNumber: 5,
      startTime: '12:15',
      endTime: '13:00',
      roomNumber: 'Room 105'
    }
  });
  assert.equal(teacherClash.status, 409);
  assert.equal(teacherClash.json.conflictType, 'teacher');

  // Conflict 3: Different section & teacher, SAME room -> 409
  const roomClash = await apiFetch('/timetables', {
    method: 'POST',
    token: adminToken,
    body: {
      classId: clsB.id,
      sectionId: secB.id,
      subjectId: sub2.id,
      teacherId: tch2.id,
      dayOfWeek: 'friday',
      periodNumber: 5,
      startTime: '12:15',
      endTime: '13:00',
      roomNumber: 'Physics Lab 2'
    }
  });
  assert.equal(roomClash.status, 409);
  assert.equal(roomClash.json.conflictType, 'room');

  // Teacher cannot mutate timetable
  const teacherCreateAttempt = await apiFetch('/timetables', {
    method: 'POST',
    token: teacherToken,
    body: {
      classId: clsB.id,
      sectionId: secB.id,
      subjectId: sub2.id,
      teacherId: tch2.id,
      dayOfWeek: 'friday',
      periodNumber: 6,
      startTime: '13:05',
      endTime: '13:50'
    }
  });
  assert.equal(teacherCreateAttempt.status, 403);

  // Admin deletes slot cleanly
  const delSlot = await apiFetch(`/timetables/${createdSlotId}`, {
    method: 'DELETE',
    token: adminToken
  });
  assert.equal(delSlot.status, 200);
});

test('3. Homework lifecycle: teacher creates, student submits, teacher grades, max-score & URL guards enforced', async () => {
  const teacherToken = await loginAs('teacher@edumanage.demo', 'EduTeacher@2026!');
  const studentToken = await loginAs('student@edumanage.demo', 'EduStudent@2026!');

  // Student edu_s_1 is in edu_cls_10 / edu_sec_10a
  const createHw = await apiFetch('/homework', {
    method: 'POST',
    token: teacherToken,
    body: {
      classId: 'edu_cls_10',
      sectionId: 'edu_sec_10a',
      subjectId: 'edu_sub_math',
      title: 'Trigonometric Identities Worksheet',
      description: 'Prove identities 1 through 8 with step-by-step derivations.',
      dueDate: '2026-12-15',
      maxScore: 25
    }
  });
  assert.equal(createHw.status, 201);
  const hwId = createHw.json.data.id;

  // Reject unsafe javascript: URL in student submission
  const badSubmit = await apiFetch(`/homework/${hwId}/submit`, {
    method: 'POST',
    token: studentToken,
    body: {
      submissionText: 'Completed solutions',
      attachmentUrl: 'javascript:alert(1)'
    }
  });
  assert.equal(badSubmit.status, 400);

  // Valid student submission
  const submitRes = await apiFetch(`/homework/${hwId}/submit`, {
    method: 'POST',
    token: studentToken,
    body: {
      submissionText: 'Solved all 8 trigonometric identities using Pythagorean relations.',
      attachmentUrl: 'https://docs.meridian.edu/hw-trig-aarav.pdf'
    }
  });
  assert.equal(submitRes.status, 201);
  const subId = submitRes.json.data.id;

  // Teacher cannot grade above maxScore
  const overScore = await apiFetch(`/homework/${hwId}/submissions/${subId}/grade`, {
    method: 'PATCH',
    token: teacherToken,
    body: { score: 30, teacherFeedback: 'Too high' }
  });
  assert.equal(overScore.status, 400);

  // Valid teacher grade & feedback
  const gradeRes = await apiFetch(`/homework/${hwId}/submissions/${subId}/grade`, {
    method: 'PATCH',
    token: teacherToken,
    body: { score: 24, teacherFeedback: 'Clear proofs and neat presentation.' }
  });
  assert.equal(gradeRes.status, 200);
  assert.equal(gradeRes.json.data.score, 24);

  // Student sees graded score and feedback in homework feed
  const studentHwFeed = await apiFetch('/homework', { token: studentToken });
  assert.equal(studentHwFeed.status, 200);
  const gradedItem = studentHwFeed.json.data.find((h: any) => h.id === hwId);
  assert.ok(gradedItem);
  assert.equal(gradedItem.mySubmission.status, 'graded');
  assert.equal(gradedItem.mySubmission.score, 24);
  assert.equal(gradedItem.mySubmission.teacherFeedback, 'Clear proofs and neat presentation.');
});

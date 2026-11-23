import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import http from 'node:http';
import {
  closeEduManageDb,
  EDUMANAGE_DEMO_ACCOUNTS,
  getEduManageDb
} from '../../server/edumanage/db.ts';
import { createEduManageRouter } from '../../server/edumanage/routes/index.ts';
import { resetEduRateLimitStore } from '../../server/edumanage/security.ts';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edumanage-phase2-'));
const dbFile = path.join(tmpDir, 'edumanage-test.db');
process.env.EDUMANAGE_DB_PATH = dbFile;

let server: http.Server;
let baseUrl = '';

async function apiFetch(
  endpoint: string,
  options: {
    method?: string;
    token?: string;
    cookie?: string;
    origin?: string;
    body?: unknown;
  } = {}
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.cookie) headers.Cookie = options.cookie;
  if (options.origin) headers.Origin = options.origin;

  const res = await fetch(`${baseUrl}/api/edumanage${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, headers: res.headers, json };
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

test('1. Normalized 33-table schema, foreign keys, and Meridian Academy demo seed integrity', () => {
  const db = getEduManageDb();
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
    .all() as { name: string }[];
  const tableNames = new Set(tables.map((t) => t.name));

  const requiredTables = [
    'school_settings',
    'roles',
    'permissions',
    'role_permissions',
    'users',
    'sessions',
    'audit_logs',
    'academic_sessions',
    'classes',
    'teachers',
    'sections',
    'subjects',
    'teacher_subject_allocations',
    'parents',
    'students',
    'student_enrollments',
    'student_attendance',
    'teacher_attendance',
    'examinations',
    'examination_subjects',
    'student_marks',
    'fee_categories',
    'fee_structures',
    'student_fees',
    'fee_payments',
    'timetables',
    'homework',
    'homework_submissions',
    'books',
    'book_issues',
    'vehicles',
    'transport_routes',
    'student_transport_allocations',
    'announcements'
  ];

  for (const tbl of requiredTables) {
    assert.ok(tableNames.has(tbl), `Missing expected EduManage table: ${tbl}`);
  }

  const fkViolations = db.prepare('PRAGMA foreign_key_check').all();
  assert.equal(fkViolations.length, 0, 'Database must have zero foreign key violations');

  const demoStudents = (db.prepare('SELECT COUNT(*) AS cnt FROM students WHERE is_demo = 1').get() as any).cnt;
  const demoTeachers = (db.prepare('SELECT COUNT(*) AS cnt FROM teachers WHERE is_demo = 1').get() as any).cnt;
  const demoRoles = (db.prepare('SELECT COUNT(*) AS cnt FROM roles').get() as any).cnt;

  assert.equal(demoRoles, 8);
  assert.ok(demoStudents >= 10, 'Expected at least 10 seeded demo students');
  assert.ok(demoTeachers >= 6, 'Expected at least 6 seeded demo teachers');
});

test('2. Salted scrypt authentication, HttpOnly session cookie, /auth/me, and logout revocation', async () => {
  const demoList = await apiFetch('/auth/demo-accounts');
  assert.equal(demoList.status, 200);
  assert.equal(demoList.json.data.accounts.length, 8);

  const badLogin = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email: 'superadmin@edumanage.demo', password: 'WrongPassword!' }
  });
  assert.equal(badLogin.status, 401);

  const login = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email: 'superadmin@edumanage.demo', password: 'EduSuper@2026!' }
  });
  assert.equal(login.status, 200);
  assert.ok(login.json.data.token);
  assert.equal(login.json.data.user.role, 'super_admin');
  const setCookie = login.headers.get('set-cookie') || '';
  assert.ok(setCookie.includes('cm_edumanage_session='), 'Must set HttpOnly session cookie');
  assert.ok(setCookie.includes('HttpOnly'), 'Session cookie must include HttpOnly');

  const token = login.json.data.token as string;
  const me = await apiFetch('/auth/me', { token });
  assert.equal(me.status, 200);
  assert.equal(me.json.data.user.email, 'superadmin@edumanage.demo');
  assert.equal(me.json.data.permissions.canResetDemo, true);

  const logout = await apiFetch('/auth/logout', { method: 'POST', token });
  assert.equal(logout.status, 200);

  const meAfterLogout = await apiFetch('/auth/me', { token });
  assert.equal(meAfterLogout.status, 401, 'Revoked session token must be rejected immediately');
});

test('3. All 8 institutional roles authenticate and RBAC enforces strict boundaries', async () => {
  const tokens = new Map<string, string>();
  for (const acc of EDUMANAGE_DEMO_ACCOUNTS) {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: { email: acc.email, password: acc.demoPassword }
    });
    assert.equal(res.status, 200, `Role ${acc.role} failed to authenticate`);
    assert.equal(res.json.data.user.role, acc.role);
    tokens.set(acc.role, res.json.data.token);
  }

  // Student and Parent cannot update school settings, view audit logs, or reset demo data
  for (const restrictedRole of ['student', 'parent', 'teacher', 'librarian']) {
    const token = tokens.get(restrictedRole)!;
    const patchSettings = await apiFetch('/settings', {
      method: 'PATCH',
      token,
      body: { schoolName: 'Unauthorized Rename' }
    });
    assert.equal(patchSettings.status, 403, `${restrictedRole} must not modify school settings`);

    const resetAttempt = await apiFetch('/demo/reset', { method: 'POST', token });
    assert.equal(resetAttempt.status, 403, `${restrictedRole} must not trigger demo reset`);

    const auditAttempt = await apiFetch('/audit-logs', { token });
    assert.equal(auditAttempt.status, 403, `${restrictedRole} must not read audit logs`);
  }

  // Principal can read audit logs but cannot reset demo data
  const principalToken = tokens.get('principal')!;
  const principalAudit = await apiFetch('/audit-logs', { token: principalToken });
  assert.equal(principalAudit.status, 200);
  const principalReset = await apiFetch('/demo/reset', { method: 'POST', token: principalToken });
  assert.equal(principalReset.status, 403);
});

test('4. Live SQL dashboard calculates real counts and CSRF blocks cross-origin cookie mutations', async () => {
  const login = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email: 'admin@edumanage.demo', password: 'EduAdmin@2026!' }
  });
  const token = login.json.data.token as string;
  const rawCookie = (login.headers.get('set-cookie') || '').split(';')[0];

  const dashBefore = await apiFetch('/dashboard', { token });
  assert.equal(dashBefore.status, 200);
  const kpis = dashBefore.json.data.kpis;
  assert.ok(kpis.totalStudents >= 10);
  assert.ok(kpis.totalTeachers >= 6);
  assert.ok(kpis.totalClasses >= 5);
  assert.ok(kpis.feeCollectedTotal > 0);
  assert.ok(dashBefore.json.data.attendanceTrend.length > 0);
  assert.ok(dashBefore.json.data.academicPerformanceByClass.length > 0);
  assert.ok(dashBefore.json.data.feeBreakdownByCategory.length > 0);

  // Publish an announcement and verify dashboard reflects it immediately
  const createNotice = await apiFetch('/announcements', {
    method: 'POST',
    token,
    body: {
      title: 'Annual Sports Meet Trials',
      message: 'House trials begin Friday at 8:30 AM on the main athletics track.',
      audience: 'all',
      priority: 'important'
    }
  });
  assert.equal(createNotice.status, 201);

  const dashAfter = await apiFetch('/dashboard', { token });
  assert.ok(
    dashAfter.json.data.announcements.some((a: any) => a.title === 'Annual Sports Meet Trials'),
    'Live dashboard must reflect newly inserted announcement'
  );

  // Cross-origin cookie mutation must be blocked by CSRF guard
  const csrfBlocked = await apiFetch('/announcements', {
    method: 'POST',
    cookie: rawCookie,
    origin: 'https://evil-attacker.example',
    body: { title: 'CSRF', message: 'Blocked', audience: 'all', priority: 'normal' }
  });
  assert.equal(csrfBlocked.status, 403, 'Cross-origin cookie-auth POST must be rejected');
});

test('5. Settings CRUD, unsafe URL rejection, and transactional Demo Reset preserving active session', async () => {
  const login = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email: 'superadmin@edumanage.demo', password: 'EduSuper@2026!' }
  });
  const token = login.json.data.token as string;

  // Reject unsafe javascript: URL in settings
  const unsafeUrl = await apiFetch('/settings', {
    method: 'PATCH',
    token,
    body: { website: 'javascript:alert(1)' }
  });
  assert.equal(unsafeUrl.status, 400);

  // Valid settings update + new class + new subject + new session
  const updatedSettings = await apiFetch('/settings', {
    method: 'PATCH',
    token,
    body: { schoolName: 'Meridian Global School', finePerDay: 15 }
  });
  assert.equal(updatedSettings.status, 200);
  assert.equal(updatedSettings.json.data.schoolName, 'Meridian Global School');
  assert.equal(updatedSettings.json.data.finePerDay, 15);

  const newCls = await apiFetch('/classes', {
    method: 'POST',
    token,
    body: { name: 'Class 12', numericOrder: 12, stream: 'Science', defaultSection: 'A', roomNumber: 'R-401' }
  });
  assert.equal(newCls.status, 201);

  const newSec = await apiFetch(`/classes/${newCls.json.data.id}/sections`, {
    method: 'POST',
    token,
    body: { name: 'B', roomNumber: 'R-402', capacity: 35 }
  });
  assert.equal(newSec.status, 201);

  const newSub = await apiFetch('/subjects', {
    method: 'POST',
    token,
    body: { code: 'BIO12', name: 'Biology', department: 'Sciences', subjectType: 'theory' }
  });
  assert.equal(newSub.status, 201);

  // Trigger transactional Demo Reset and confirm original Meridian Academy state returns & session stays valid
  const reset = await apiFetch('/demo/reset', { method: 'POST', token });
  assert.equal(reset.status, 200);
  const freshToken = reset.json.data.token as string;
  assert.ok(freshToken, 'Demo reset must reissue an active session token for acting admin');
  assert.equal(reset.json.data.school.schoolName, 'Meridian Academy');

  const classesAfterReset = await apiFetch('/classes', { token: freshToken });
  assert.equal(classesAfterReset.status, 200);
  assert.ok(
    !classesAfterReset.json.data.some((c: any) => c.name === 'Class 12'),
    'Non-demo test class must be cleared by demo reset'
  );
});

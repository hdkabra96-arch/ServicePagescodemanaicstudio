import Database from 'better-sqlite3';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  EduManageDemoAccount,
  GradingScaleRule,
  SchoolSettings
} from '../../src/types/edumanage.ts';
import { hashEduPasswordSync } from './security.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const DATA_DIR = path.join(ROOT_DIR, 'data');

export const DEFAULT_GRADING_SCALE: GradingScaleRule[] = [
  { grade: 'A1', minPct: 91, maxPct: 100, remark: 'Outstanding' },
  { grade: 'A2', minPct: 81, maxPct: 90.99, remark: 'Excellent' },
  { grade: 'B1', minPct: 71, maxPct: 80.99, remark: 'Very Good' },
  { grade: 'B2', minPct: 61, maxPct: 70.99, remark: 'Good' },
  { grade: 'C1', minPct: 51, maxPct: 60.99, remark: 'Satisfactory' },
  { grade: 'C2', minPct: 41, maxPct: 50.99, remark: 'Needs Practice' },
  { grade: 'D', minPct: 33, maxPct: 40.99, remark: 'Pass' },
  { grade: 'E', minPct: 0, maxPct: 32.99, remark: 'Needs Improvement' }
];

export const EDUMANAGE_DEMO_ACCOUNTS: EduManageDemoAccount[] = [
  {
    role: 'super_admin',
    label: 'Super Administrator',
    fullName: 'Dr. Arvind Deshmukh',
    email: 'superadmin@edumanage.demo',
    demoPassword: 'EduSuper@2026!',
    workspaceTitle: 'Executive ERP Command Center',
    highlights: 'Full institutional control, all 14 modules, audit logs, school settings & demo reset'
  },
  {
    role: 'school_admin',
    label: 'School Administrator',
    fullName: 'Neha Kulkarni',
    email: 'admin@edumanage.demo',
    demoPassword: 'EduAdmin@2026!',
    workspaceTitle: 'School Administration Console',
    highlights: 'Admissions, classes & sections, staff records, timetables, transport & settings'
  },
  {
    role: 'principal',
    label: 'Principal',
    fullName: 'Prof. Rajeshwari Iyer',
    email: 'principal@edumanage.demo',
    demoPassword: 'EduPrincipal@2026!',
    workspaceTitle: 'Academic Leadership Dashboard',
    highlights: 'Academic analytics, attendance oversight, promotions, exam publishing & notices'
  },
  {
    role: 'teacher',
    label: 'Teacher',
    fullName: 'Siddharth Menon',
    email: 'teacher@edumanage.demo',
    demoPassword: 'EduTeacher@2026!',
    workspaceTitle: 'Faculty Academic Workspace',
    highlights: 'Class attendance marking, homework creation & grading, timetable & exam marks'
  },
  {
    role: 'accountant',
    label: 'Accountant',
    fullName: 'Manish Agarwal',
    email: 'accountant@edumanage.demo',
    demoPassword: 'EduAccount@2026!',
    workspaceTitle: 'Finance & Fee Collection Desk',
    highlights: 'Fee structures, installment dues, receipt generation, transport fees & fee reports'
  },
  {
    role: 'librarian',
    label: 'Librarian',
    fullName: 'Kavita Krishnan',
    email: 'librarian@edumanage.demo',
    demoPassword: 'EduLibrary@2026!',
    workspaceTitle: 'Library Circulation Console',
    highlights: 'Book catalog, ISBN tracking, issue/return circulation & automated overdue fines'
  },
  {
    role: 'student',
    label: 'Student',
    fullName: 'Aarav Sharma',
    email: 'student@edumanage.demo',
    demoPassword: 'EduStudent@2026!',
    workspaceTitle: 'Student Academic Portal',
    highlights: 'Personal timetable, attendance history, homework submission & published report cards'
  },
  {
    role: 'parent',
    label: 'Parent',
    fullName: 'Sunil Sharma',
    email: 'parent@edumanage.demo',
    demoPassword: 'EduParent@2026!',
    workspaceTitle: 'Parent Family Portal',
    highlights: 'Linked child attendance, exam results, fee ledger & receipts, homework & notices'
  }
];

let eduDbInstance: Database.Database | null = null;
let currentEduDbPath: string | null = null;

export function generateEduId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}

export function mapSchoolSettingsRow(row: any): SchoolSettings {
  let gradingScale = DEFAULT_GRADING_SCALE;
  try {
    const parsed = JSON.parse(row.grading_scale_json || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) gradingScale = parsed;
  } catch {
    gradingScale = DEFAULT_GRADING_SCALE;
  }

  return {
    id: row.id,
    schoolName: row.school_name,
    boardAffiliation: row.board_affiliation || 'CBSE',
    affiliationCode: row.affiliation_code || '',
    logoUrl: row.logo_url || '',
    address: row.address || '',
    city: row.city || '',
    phone: row.phone || '',
    email: row.email || '',
    website: row.website || '',
    currencyCode: row.currency_code || 'INR',
    currencySymbol: row.currency_symbol || '₹',
    receiptPrefix: row.receipt_prefix || 'MA-FEE',
    gradingScale,
    finePerDay: Number(row.fine_per_day || 5),
    demoMode: Boolean(row.demo_mode),
    updatedAt: row.updated_at
  };
}

export function getSchoolSettings(): SchoolSettings {
  const db = getEduManageDb();
  const row = db.prepare('SELECT * FROM school_settings LIMIT 1').get();
  return mapSchoolSettingsRow(row);
}

export function initializeEduManageSchema(db: Database.Database): void {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS school_settings (
      id TEXT PRIMARY KEY,
      school_name TEXT NOT NULL,
      board_affiliation TEXT NOT NULL DEFAULT 'CBSE',
      affiliation_code TEXT NOT NULL DEFAULT '',
      logo_url TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      website TEXT NOT NULL DEFAULT '',
      currency_code TEXT NOT NULL DEFAULT 'INR',
      currency_symbol TEXT NOT NULL DEFAULT '₹',
      receipt_prefix TEXT NOT NULL DEFAULT 'MA-FEE',
      grading_scale_json TEXT NOT NULL DEFAULT '[]',
      fine_per_day REAL NOT NULL DEFAULT 5.0 CHECK (fine_per_day >= 0),
      demo_mode INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      module TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
      PRIMARY KEY (role_id, permission_id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      phone TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL,
      role_code TEXT NOT NULL REFERENCES roles(code) ON DELETE RESTRICT,
      avatar_url TEXT NOT NULL DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1,
      is_demo INTEGER NOT NULL DEFAULT 0,
      last_login_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      ip_address TEXT,
      user_agent TEXT,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_edu_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_edu_sessions_exp ON sessions(expires_at);

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      actor_name TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      entity_id TEXT,
      details_json TEXT NOT NULL DEFAULT '{}',
      ip_address TEXT NOT NULL DEFAULT '',
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_edu_audit_created ON audit_logs(created_at DESC);

    CREATE TABLE IF NOT EXISTS academic_sessions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      is_current INTEGER NOT NULL DEFAULT 0,
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE COLLATE NOCASE,
      numeric_order INTEGER NOT NULL DEFAULT 1,
      stream TEXT NOT NULL DEFAULT 'General',
      is_active INTEGER NOT NULL DEFAULT 1,
      is_demo INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      employee_id TEXT NOT NULL UNIQUE COLLATE NOCASE,
      designation TEXT NOT NULL DEFAULT 'Subject Teacher',
      department TEXT NOT NULL DEFAULT 'Academics',
      qualification TEXT NOT NULL DEFAULT '',
      experience_years INTEGER NOT NULL DEFAULT 0 CHECK (experience_years >= 0),
      joining_date TEXT NOT NULL,
      salary_monthly REAL NOT NULL DEFAULT 0 CHECK (salary_monthly >= 0),
      employment_type TEXT NOT NULL DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'visiting')),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'resigned')),
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sections (
      id TEXT PRIMARY KEY,
      class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      room_number TEXT NOT NULL DEFAULT '',
      capacity INTEGER NOT NULL DEFAULT 40 CHECK (capacity >= 1),
      class_teacher_id TEXT REFERENCES teachers(id) ON DELETE SET NULL,
      is_demo INTEGER NOT NULL DEFAULT 0,
      UNIQUE (class_id, name)
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name TEXT NOT NULL,
      department TEXT NOT NULL DEFAULT 'Core',
      subject_type TEXT NOT NULL DEFAULT 'theory' CHECK (subject_type IN ('theory', 'practical', 'elective')),
      max_marks_default INTEGER NOT NULL DEFAULT 100 CHECK (max_marks_default >= 1),
      pass_marks_default INTEGER NOT NULL DEFAULT 33 CHECK (pass_marks_default >= 0),
      is_demo INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS teacher_subject_allocations (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
      class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      section_id TEXT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
      subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      session_id TEXT NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
      is_demo INTEGER NOT NULL DEFAULT 0,
      UNIQUE (teacher_id, section_id, subject_id, session_id)
    );

    CREATE TABLE IF NOT EXISTS parents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      guardian_name TEXT NOT NULL,
      relation TEXT NOT NULL DEFAULT 'father' CHECK (relation IN ('father', 'mother', 'guardian')),
      phone TEXT NOT NULL,
      alt_phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      occupation TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      admission_number TEXT NOT NULL UNIQUE COLLATE NOCASE,
      roll_number TEXT NOT NULL DEFAULT '',
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_of_birth TEXT NOT NULL DEFAULT '',
      gender TEXT NOT NULL DEFAULT 'other' CHECK (gender IN ('male', 'female', 'other')),
      blood_group TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      parent_id TEXT REFERENCES parents(id) ON DELETE SET NULL,
      current_class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
      current_section_id TEXT NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,
      admission_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'promoted', 'transferred', 'graduated', 'inactive')),
      transfer_notes TEXT NOT NULL DEFAULT '',
      documents_json TEXT NOT NULL DEFAULT '[]',
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_edu_students_class ON students(current_class_id, current_section_id);
    CREATE INDEX IF NOT EXISTS idx_edu_students_parent ON students(parent_id);

    CREATE TABLE IF NOT EXISTS student_enrollments (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      session_id TEXT NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
      class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
      section_id TEXT NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,
      roll_number TEXT NOT NULL DEFAULT '',
      enrollment_status TEXT NOT NULL DEFAULT 'enrolled' CHECK (enrollment_status IN ('enrolled', 'promoted', 'detained', 'transferred')),
      remarks TEXT NOT NULL DEFAULT '',
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      UNIQUE (student_id, session_id)
    );

    CREATE TABLE IF NOT EXISTS student_attendance (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
      section_id TEXT NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,
      session_id TEXT NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
      attendance_date TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
      remarks TEXT NOT NULL DEFAULT '',
      marked_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      is_demo INTEGER NOT NULL DEFAULT 0,
      UNIQUE (student_id, attendance_date)
    );
    CREATE INDEX IF NOT EXISTS idx_edu_stu_att_date ON student_attendance(attendance_date, class_id);

    CREATE TABLE IF NOT EXISTS teacher_attendance (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
      attendance_date TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'half_day', 'on_leave')),
      check_in_time TEXT,
      check_out_time TEXT,
      remarks TEXT NOT NULL DEFAULT '',
      marked_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      is_demo INTEGER NOT NULL DEFAULT 0,
      UNIQUE (teacher_id, attendance_date)
    );

    CREATE TABLE IF NOT EXISTS examinations (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      exam_type TEXT NOT NULL CHECK (exam_type IN ('unit_test', 'mid_term', 'final', 'practical')),
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'published')),
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS examination_subjects (
      id TEXT PRIMARY KEY,
      examination_id TEXT NOT NULL REFERENCES examinations(id) ON DELETE CASCADE,
      class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
      exam_date TEXT NOT NULL,
      start_time TEXT NOT NULL DEFAULT '09:30',
      end_time TEXT NOT NULL DEFAULT '12:30',
      room_number TEXT NOT NULL DEFAULT 'Hall A',
      max_marks INTEGER NOT NULL DEFAULT 100 CHECK (max_marks >= 1),
      pass_marks INTEGER NOT NULL DEFAULT 33 CHECK (pass_marks >= 0),
      is_demo INTEGER NOT NULL DEFAULT 0,
      UNIQUE (examination_id, class_id, subject_id)
    );

    CREATE TABLE IF NOT EXISTS student_marks (
      id TEXT PRIMARY KEY,
      examination_id TEXT NOT NULL REFERENCES examinations(id) ON DELETE CASCADE,
      exam_subject_id TEXT NOT NULL REFERENCES examination_subjects(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      marks_obtained REAL NOT NULL DEFAULT 0 CHECK (marks_obtained >= 0),
      is_absent INTEGER NOT NULL DEFAULT 0,
      grade TEXT NOT NULL DEFAULT '',
      remarks TEXT NOT NULL DEFAULT '',
      entered_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      is_demo INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      UNIQUE (exam_subject_id, student_id)
    );
    CREATE INDEX IF NOT EXISTS idx_edu_marks_exam ON student_marks(examination_id, student_id);

    CREATE TABLE IF NOT EXISTS fee_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE COLLATE NOCASE,
      description TEXT NOT NULL DEFAULT '',
      is_recurring INTEGER NOT NULL DEFAULT 1,
      is_demo INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS fee_structures (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
      class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES fee_categories(id) ON DELETE RESTRICT,
      amount REAL NOT NULL CHECK (amount >= 0),
      frequency TEXT NOT NULL DEFAULT 'quarterly' CHECK (frequency IN ('monthly', 'quarterly', 'annual', 'one_time')),
      due_day INTEGER NOT NULL DEFAULT 10 CHECK (due_day >= 1 AND due_day <= 28),
      is_demo INTEGER NOT NULL DEFAULT 0,
      UNIQUE (session_id, class_id, category_id)
    );

    CREATE TABLE IF NOT EXISTS student_fees (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      session_id TEXT NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
      fee_structure_id TEXT REFERENCES fee_structures(id) ON DELETE SET NULL,
      category_name TEXT NOT NULL,
      installment_label TEXT NOT NULL,
      due_date TEXT NOT NULL,
      total_amount REAL NOT NULL CHECK (total_amount >= 0),
      discount_amount REAL NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
      paid_amount REAL NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
      status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid', 'overdue')),
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_edu_student_fees_student ON student_fees(student_id, status);

    CREATE TABLE IF NOT EXISTS fee_payments (
      id TEXT PRIMARY KEY,
      receipt_number TEXT NOT NULL UNIQUE COLLATE NOCASE,
      student_fee_id TEXT NOT NULL REFERENCES student_fees(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      amount_paid REAL NOT NULL CHECK (amount_paid > 0),
      payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'upi', 'bank_transfer', 'cheque')),
      reference_number TEXT NOT NULL DEFAULT '',
      collected_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      paid_at TEXT NOT NULL,
      remarks TEXT NOT NULL DEFAULT '',
      is_demo INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS timetables (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
      class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      section_id TEXT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
      subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
      teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE RESTRICT,
      day_of_week TEXT NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')),
      period_number INTEGER NOT NULL CHECK (period_number >= 1 AND period_number <= 8),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      room_number TEXT NOT NULL DEFAULT '',
      is_demo INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_edu_timetable_sec ON timetables(session_id, section_id, day_of_week);
    CREATE INDEX IF NOT EXISTS idx_edu_timetable_tch ON timetables(session_id, teacher_id, day_of_week);

    CREATE TABLE IF NOT EXISTS homework (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
      class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      section_id TEXT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
      subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
      teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE RESTRICT,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      due_date TEXT NOT NULL,
      max_score INTEGER NOT NULL DEFAULT 20 CHECK (max_score >= 1),
      attachment_url TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS homework_submissions (
      id TEXT PRIMARY KEY,
      homework_id TEXT NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      submission_text TEXT NOT NULL DEFAULT '',
      attachment_url TEXT NOT NULL DEFAULT '',
      submitted_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'late', 'graded')),
      score REAL,
      teacher_feedback TEXT NOT NULL DEFAULT '',
      graded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
      graded_at TEXT,
      is_demo INTEGER NOT NULL DEFAULT 0,
      UNIQUE (homework_id, student_id)
    );

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      isbn TEXT NOT NULL UNIQUE COLLATE NOCASE,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Academic',
      publisher TEXT NOT NULL DEFAULT '',
      shelf_location TEXT NOT NULL DEFAULT '',
      total_copies INTEGER NOT NULL DEFAULT 1 CHECK (total_copies >= 1),
      available_copies INTEGER NOT NULL DEFAULT 1 CHECK (available_copies >= 0 AND available_copies <= total_copies),
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS book_issues (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
      borrower_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      student_id TEXT REFERENCES students(id) ON DELETE SET NULL,
      issued_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      issue_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      return_date TEXT,
      fine_amount REAL NOT NULL DEFAULT 0 CHECK (fine_amount >= 0),
      fine_paid INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'returned', 'overdue', 'lost')),
      remarks TEXT NOT NULL DEFAULT '',
      is_demo INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      vehicle_number TEXT NOT NULL UNIQUE COLLATE NOCASE,
      vehicle_type TEXT NOT NULL DEFAULT 'bus' CHECK (vehicle_type IN ('bus', 'van', 'minibus')),
      capacity INTEGER NOT NULL DEFAULT 40 CHECK (capacity >= 1),
      driver_name TEXT NOT NULL,
      driver_phone TEXT NOT NULL,
      driver_license TEXT NOT NULL DEFAULT '',
      attendant_name TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
      is_demo INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS transport_routes (
      id TEXT PRIMARY KEY,
      route_code TEXT NOT NULL UNIQUE COLLATE NOCASE,
      route_name TEXT NOT NULL,
      vehicle_id TEXT REFERENCES vehicles(id) ON DELETE SET NULL,
      stops_json TEXT NOT NULL DEFAULT '[]',
      monthly_fee REAL NOT NULL DEFAULT 0 CHECK (monthly_fee >= 0),
      morning_pickup_time TEXT NOT NULL DEFAULT '07:15',
      afternoon_drop_time TEXT NOT NULL DEFAULT '15:10',
      is_active INTEGER NOT NULL DEFAULT 1,
      is_demo INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS student_transport_allocations (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
      route_id TEXT NOT NULL REFERENCES transport_routes(id) ON DELETE RESTRICT,
      stop_name TEXT NOT NULL,
      monthly_fee REAL NOT NULL DEFAULT 0 CHECK (monthly_fee >= 0),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
      assigned_at TEXT NOT NULL,
      is_demo INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      audience TEXT NOT NULL DEFAULT 'all' CHECK (audience IN ('all', 'teachers', 'students', 'parents', 'staff')),
      target_class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
      priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
      published_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);
}

export function seedEduManageDemoData(db: Database.Database): void {
  const now = new Date();
  const nowIso = now.toISOString();
  const dayStr = (offsetDays: number) =>
    new Date(now.getTime() + offsetDays * 86400000).toISOString().slice(0, 10);
  const daysAgoIso = (offsetDays: number, hour = 10) => {
    const d = new Date(now.getTime() + offsetDays * 86400000);
    d.setHours(hour, 15, 0, 0);
    return d.toISOString();
  };

  const tx = db.transaction(() => {
    // 1. School Settings
    db.prepare(`
      INSERT INTO school_settings (
        id, school_name, board_affiliation, affiliation_code, logo_url,
        address, city, phone, email, website, currency_code, currency_symbol,
        receipt_prefix, grading_scale_json, fine_per_day, demo_mode, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      'edu_settings_main',
      'Meridian Academy',
      'CBSE',
      '2130842',
      '',
      'Plot 18, Knowledge Park Avenue, SG Highway',
      'Ahmedabad, Gujarat 380054',
      '+91 79 2685 4400',
      'office@meridianacademy.demo',
      'https://meridianacademy.demo',
      'INR',
      '₹',
      'MA-26',
      JSON.stringify(DEFAULT_GRADING_SCALE),
      10,
      nowIso
    );

    // 2. Roles & Permissions
    const roleDefs = [
      ['role_super_admin', 'super_admin', 'Super Administrator', 'Full ERP governance and settings control'],
      ['role_school_admin', 'school_admin', 'School Administrator', 'Daily operations, admissions and scheduling'],
      ['role_principal', 'principal', 'Principal', 'Academic performance, promotions and exam governance'],
      ['role_teacher', 'teacher', 'Teacher', 'Class attendance, homework and marks entry'],
      ['role_accountant', 'accountant', 'Accountant', 'Fee structures, collections and financial receipts'],
      ['role_librarian', 'librarian', 'Librarian', 'Book catalog, circulation and fine tracking'],
      ['role_student', 'student', 'Student', 'Personal academic timetable, homework and report cards'],
      ['role_parent', 'parent', 'Parent', 'Linked child monitoring, fees and school notices']
    ];
    const insertRole = db.prepare('INSERT INTO roles (id, code, name, description) VALUES (?, ?, ?, ?)');
    for (const r of roleDefs) insertRole.run(...r);

    const permDefs = [
      ['perm_dashboard', 'dashboard.view', 'dashboard', 'View institutional dashboard'],
      ['perm_students', 'students.manage', 'students', 'Manage student admissions & records'],
      ['perm_teachers', 'teachers.manage', 'teachers', 'Manage teacher profiles & allocations'],
      ['perm_attendance', 'attendance.mark', 'attendance', 'Mark student & teacher attendance'],
      ['perm_timetable', 'timetable.manage', 'timetable', 'Manage class & teacher schedules'],
      ['perm_homework', 'homework.manage', 'homework', 'Create and grade assignments'],
      ['perm_exams', 'exams.manage', 'exams', 'Manage exams, marks & report cards'],
      ['perm_fees', 'fees.manage', 'fees', 'Manage fee structures, dues & receipts'],
      ['perm_library', 'library.manage', 'library', 'Manage books, issues & fines'],
      ['perm_transport', 'transport.manage', 'transport', 'Manage vehicles & transport routes'],
      ['perm_reports', 'reports.view', 'reports', 'View & export institutional reports'],
      ['perm_settings', 'settings.manage', 'settings', 'Update school settings & demo reset']
    ];
    const insertPerm = db.prepare('INSERT INTO permissions (id, code, module, description) VALUES (?, ?, ?, ?)');
    for (const p of permDefs) insertPerm.run(...p);

    const insertRP = db.prepare('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)');
    for (const p of permDefs) {
      insertRP.run('role_super_admin', p[0]);
      insertRP.run('role_school_admin', p[0]);
    }
    for (const p of ['perm_dashboard', 'perm_students', 'perm_teachers', 'perm_attendance', 'perm_timetable', 'perm_exams', 'perm_reports']) {
      insertRP.run('role_principal', p);
    }
    for (const p of ['perm_dashboard', 'perm_attendance', 'perm_homework', 'perm_exams', 'perm_reports']) {
      insertRP.run('role_teacher', p);
    }
    for (const p of ['perm_dashboard', 'perm_fees', 'perm_transport', 'perm_reports']) {
      insertRP.run('role_accountant', p);
    }
    for (const p of ['perm_dashboard', 'perm_library', 'perm_reports']) {
      insertRP.run('role_librarian', p);
    }

    // 3. Users (8 primary demo accounts + additional realistic staff/parents/students)
    const insertUser = db.prepare(`
      INSERT INTO users (id, full_name, email, phone, password_hash, role_code, avatar_url, is_active, is_demo, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, '', 1, 1, ?, ?)
    `);

    const primaryIds: Record<string, string> = {
      super_admin: 'edu_u_superadmin',
      school_admin: 'edu_u_admin',
      principal: 'edu_u_principal',
      teacher: 'edu_u_teacher1',
      accountant: 'edu_u_accountant',
      librarian: 'edu_u_librarian',
      student: 'edu_u_student1',
      parent: 'edu_u_parent1'
    };

    for (const acc of EDUMANAGE_DEMO_ACCOUNTS) {
      insertUser.run(
        primaryIds[acc.role],
        acc.fullName,
        acc.email,
        '+91 98250 11000',
        hashEduPasswordSync(acc.demoPassword),
        acc.role,
        nowIso,
        nowIso
      );
    }

    // Reuse pre-hashed demo password for extra background demo users (keeps seed super fast)
    const extraTeacherHash = hashEduPasswordSync('EduTeacher@2026!');
    const extraParentHash = hashEduPasswordSync('EduParent@2026!');
    const extraStudentHash = hashEduPasswordSync('EduStudent@2026!');

    const extraTeachers = [
      ['edu_u_teacher2', 'Ananya Chatterjee', 'ananya.chatterjee@edumanage.demo', '+91 98250 22002'],
      ['edu_u_teacher3', 'Vikramjit Gill', 'vikramjit.gill@edumanage.demo', '+91 98250 22003'],
      ['edu_u_teacher4', 'Meenakshi Sundaram', 'meenakshi.s@edumanage.demo', '+91 98250 22004'],
      ['edu_u_teacher5', 'Rohan Deshpande', 'rohan.d@edumanage.demo', '+91 98250 22005'],
      ['edu_u_teacher6', 'Farida Merchant', 'farida.m@edumanage.demo', '+91 98250 22006']
    ];
    for (const [uid, name, email, phone] of extraTeachers) {
      insertUser.run(uid, name, email, phone, extraTeacherHash, 'teacher', nowIso, nowIso);
    }

    const extraParents = [
      ['edu_u_parent2', 'Meera Patel', 'meera.patel@edumanage.demo', '+91 98250 33002'],
      ['edu_u_parent3', 'Rakesh Verma', 'rakesh.verma@edumanage.demo', '+91 98250 33003'],
      ['edu_u_parent4', 'Shalini Nair', 'shalini.nair@edumanage.demo', '+91 98250 33004'],
      ['edu_u_parent5', 'Imran Siddiqui', 'imran.s@edumanage.demo', '+91 98250 33005'],
      ['edu_u_parent6', 'Deepak Joshi', 'deepak.joshi@edumanage.demo', '+91 98250 33006']
    ];
    for (const [uid, name, email, phone] of extraParents) {
      insertUser.run(uid, name, email, phone, extraParentHash, 'parent', nowIso, nowIso);
    }

    const extraStudents = [
      ['edu_u_student2', 'Diya Patel', 'diya.patel@edumanage.demo', '+91 98250 44002'],
      ['edu_u_student3', 'Kabir Verma', 'kabir.verma@edumanage.demo', '+91 98250 44003'],
      ['edu_u_student4', 'Anika Nair', 'anika.nair@edumanage.demo', '+91 98250 44004'],
      ['edu_u_student5', 'Zayan Siddiqui', 'zayan.s@edumanage.demo', '+91 98250 44005'],
      ['edu_u_student6', 'Prisha Joshi', 'prisha.joshi@edumanage.demo', '+91 98250 44006'],
      ['edu_u_student7', 'Vihaan Sharma', 'vihaan.sharma@edumanage.demo', '+91 98250 44007'],
      ['edu_u_student8', 'Rhea Patel', 'rhea.patel@edumanage.demo', '+91 98250 44008'],
      ['edu_u_student9', 'Arjun Verma', 'arjun.verma@edumanage.demo', '+91 98250 44009'],
      ['edu_u_student10', 'Ishita Nair', 'ishita.nair@edumanage.demo', '+91 98250 44010']
    ];
    for (const [uid, name, email, phone] of extraStudents) {
      insertUser.run(uid, name, email, phone, extraStudentHash, 'student', nowIso, nowIso);
    }

    // 4. Academic Sessions
    db.prepare(`
      INSERT INTO academic_sessions (id, name, start_date, end_date, is_current, is_demo, created_at)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `).run('edu_sess_2526', '2025-26', '2025-04-01', '2026-03-31', 0, daysAgoIso(-365));
    db.prepare(`
      INSERT INTO academic_sessions (id, name, start_date, end_date, is_current, is_demo, created_at)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `).run('edu_sess_2627', '2026-27', '2026-04-01', '2027-03-31', 1, nowIso);

    // 5. Classes
    const classDefs = [
      ['edu_cls_6', 'Grade 6', 6, 'General'],
      ['edu_cls_8', 'Grade 8', 8, 'General'],
      ['edu_cls_9', 'Grade 9', 9, 'General'],
      ['edu_cls_10', 'Grade 10', 10, 'General'],
      ['edu_cls_12s', 'Grade 12 Science', 12, 'Science']
    ];
    const insertClass = db.prepare(
      'INSERT INTO classes (id, name, numeric_order, stream, is_active, is_demo) VALUES (?, ?, ?, ?, 1, 1)'
    );
    for (const c of classDefs) insertClass.run(...c);

    // 6. Teachers
    const teacherDefs = [
      ['edu_t_1', 'edu_u_teacher1', 'EMP-101', 'Senior Mathematics Faculty', 'Mathematics', 'M.Sc. Mathematics, B.Ed.', 9, '2019-06-10', 68000],
      ['edu_t_2', 'edu_u_teacher2', 'EMP-102', 'Science Head', 'Science', 'M.Sc. Physics, B.Ed.', 11, '2018-04-05', 74000],
      ['edu_t_3', 'edu_u_teacher3', 'EMP-103', 'English Literature Faculty', 'Languages', 'M.A. English, B.Ed.', 7, '2021-07-01', 61000],
      ['edu_t_4', 'edu_u_teacher4', 'EMP-104', 'Computer Science Lead', 'Computer Science', 'M.Tech CSE', 6, '2022-04-12', 70000],
      ['edu_t_5', 'edu_u_teacher5', 'EMP-105', 'Social Studies Faculty', 'Humanities', 'M.A. History, B.Ed.', 8, '2020-06-15', 59000],
      ['edu_t_6', 'edu_u_teacher6', 'EMP-106', 'Chemistry Faculty', 'Science', 'M.Sc. Chemistry, B.Ed.', 5, '2023-04-03', 62000]
    ];
    const insertTeacher = db.prepare(`
      INSERT INTO teachers (
        id, user_id, employee_id, designation, department, qualification,
        experience_years, joining_date, salary_monthly, employment_type, status, is_demo, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'full_time', 'active', 1, ?, ?)
    `);
    for (const t of teacherDefs) insertTeacher.run(...t, nowIso, nowIso);

    // 7. Sections
    const sectionDefs = [
      ['edu_sec_6a', 'edu_cls_6', 'A', 'Room 104', 36, 'edu_t_5'],
      ['edu_sec_8a', 'edu_cls_8', 'A', 'Room 201', 38, 'edu_t_3'],
      ['edu_sec_9a', 'edu_cls_9', 'A', 'Room 204', 40, 'edu_t_4'],
      ['edu_sec_10a', 'edu_cls_10', 'A', 'Room 301', 40, 'edu_t_1'],
      ['edu_sec_10b', 'edu_cls_10', 'B', 'Room 302', 40, 'edu_t_2'],
      ['edu_sec_12sa', 'edu_cls_12s', 'A', 'Lab Wing 401', 35, 'edu_t_6']
    ];
    const insertSection = db.prepare(
      'INSERT INTO sections (id, class_id, name, room_number, capacity, class_teacher_id, is_demo) VALUES (?, ?, ?, ?, ?, ?, 1)'
    );
    for (const s of sectionDefs) insertSection.run(...s);

    // 8. Subjects
    const subjectDefs = [
      ['edu_sub_math', 'MATH-101', 'Mathematics', 'Mathematics', 'theory', 100, 33],
      ['edu_sub_sci', 'SCI-102', 'Science', 'Science', 'theory', 100, 33],
      ['edu_sub_eng', 'ENG-103', 'English Literature', 'Languages', 'theory', 100, 33],
      ['edu_sub_cs', 'CS-104', 'Computer Science', 'Computer Science', 'practical', 100, 33],
      ['edu_sub_sst', 'SST-105', 'Social Science', 'Humanities', 'theory', 100, 33],
      ['edu_sub_phy', 'PHY-201', 'Physics', 'Science', 'theory', 100, 33],
      ['edu_sub_chem', 'CHEM-202', 'Chemistry', 'Science', 'practical', 100, 33]
    ];
    const insertSubject = db.prepare(`
      INSERT INTO subjects (id, code, name, department, subject_type, max_marks_default, pass_marks_default, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);
    for (const sub of subjectDefs) insertSubject.run(...sub);

    // Teacher-Subject Allocations
    const allocs = [
      ['edu_alloc_1', 'edu_t_1', 'edu_cls_10', 'edu_sec_10a', 'edu_sub_math'],
      ['edu_alloc_2', 'edu_t_1', 'edu_cls_10', 'edu_sec_10b', 'edu_sub_math'],
      ['edu_alloc_3', 'edu_t_2', 'edu_cls_10', 'edu_sec_10a', 'edu_sub_sci'],
      ['edu_alloc_4', 'edu_t_3', 'edu_cls_10', 'edu_sec_10a', 'edu_sub_eng'],
      ['edu_alloc_5', 'edu_t_4', 'edu_cls_10', 'edu_sec_10a', 'edu_sub_cs'],
      ['edu_alloc_6', 'edu_t_5', 'edu_cls_9', 'edu_sec_9a', 'edu_sub_sst'],
      ['edu_alloc_7', 'edu_t_6', 'edu_cls_12s', 'edu_sec_12sa', 'edu_sub_chem'],
      ['edu_alloc_8', 'edu_t_2', 'edu_cls_12s', 'edu_sec_12sa', 'edu_sub_phy']
    ];
    const insertAlloc = db.prepare(`
      INSERT INTO teacher_subject_allocations (id, teacher_id, class_id, section_id, subject_id, session_id, is_demo)
      VALUES (?, ?, ?, ?, ?, 'edu_sess_2627', 1)
    `);
    for (const a of allocs) insertAlloc.run(...a);

    // 9. Parents
    const parentDefs = [
      ['edu_p_1', 'edu_u_parent1', 'Sunil Sharma', 'father', '+91 98250 33001', 'parent@edumanage.demo', 'Chartered Accountant', '24 Satellite Gardens, Ahmedabad'],
      ['edu_p_2', 'edu_u_parent2', 'Meera Patel', 'mother', '+91 98250 33002', 'meera.patel@edumanage.demo', 'Architect', '11 Bodakdev Enclave, Ahmedabad'],
      ['edu_p_3', 'edu_u_parent3', 'Rakesh Verma', 'father', '+91 98250 33003', 'rakesh.verma@edumanage.demo', 'Senior Engineer', '88 Prahlad Nagar, Ahmedabad'],
      ['edu_p_4', 'edu_u_parent4', 'Shalini Nair', 'mother', '+91 98250 33004', 'shalini.nair@edumanage.demo', 'Pediatrician', '5B Science City Road, Ahmedabad'],
      ['edu_p_5', 'edu_u_parent5', 'Imran Siddiqui', 'father', '+91 98250 33005', 'imran.s@edumanage.demo', 'Business Owner', '19 Navrangpura, Ahmedabad'],
      ['edu_p_6', 'edu_u_parent6', 'Deepak Joshi', 'father', '+91 98250 33006', 'deepak.joshi@edumanage.demo', 'Bank Manager', '42 Thaltej Cross, Ahmedabad']
    ];
    const insertParent = db.prepare(`
      INSERT INTO parents (id, user_id, guardian_name, relation, phone, email, occupation, address, is_demo, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);
    for (const p of parentDefs) insertParent.run(...p, nowIso);

    // 10. Students (10 realistic students across Grades 6, 8, 9, 10, 12; Sunil Sharma has 2 children: Aarav & Vihaan)
    const studentDefs = [
      ['edu_s_1', 'edu_u_student1', 'MA-2026-001', '10A-01', 'Aarav', 'Sharma', '2011-05-14', 'male', 'B+', '+91 98250 44001', 'student@edumanage.demo', '24 Satellite Gardens, Ahmedabad', 'edu_p_1', 'edu_cls_10', 'edu_sec_10a', '2021-04-10'],
      ['edu_s_2', 'edu_u_student2', 'MA-2026-002', '10A-02', 'Diya', 'Patel', '2011-08-22', 'female', 'O+', '+91 98250 44002', 'diya.patel@edumanage.demo', '11 Bodakdev Enclave, Ahmedabad', 'edu_p_2', 'edu_cls_10', 'edu_sec_10a', '2021-04-12'],
      ['edu_s_3', 'edu_u_student3', 'MA-2026-003', '10A-03', 'Kabir', 'Verma', '2011-03-09', 'male', 'A+', '+91 98250 44003', 'kabir.verma@edumanage.demo', '88 Prahlad Nagar, Ahmedabad', 'edu_p_3', 'edu_cls_10', 'edu_sec_10a', '2022-04-06'],
      ['edu_s_4', 'edu_u_student4', 'MA-2026-004', '10B-01', 'Anika', 'Nair', '2011-11-18', 'female', 'AB+', '+91 98250 44004', 'anika.nair@edumanage.demo', '5B Science City Road, Ahmedabad', 'edu_p_4', 'edu_cls_10', 'edu_sec_10b', '2021-04-15'],
      ['edu_s_5', 'edu_u_student5', 'MA-2026-005', '9A-01', 'Zayan', 'Siddiqui', '2012-01-27', 'male', 'B+', '+91 98250 44005', 'zayan.s@edumanage.demo', '19 Navrangpura, Ahmedabad', 'edu_p_5', 'edu_cls_9', 'edu_sec_9a', '2022-04-08'],
      ['edu_s_6', 'edu_u_student6', 'MA-2026-006', '9A-02', 'Prisha', 'Joshi', '2012-07-04', 'female', 'O-', '+91 98250 44006', 'prisha.joshi@edumanage.demo', '42 Thaltej Cross, Ahmedabad', 'edu_p_6', 'edu_cls_9', 'edu_sec_9a', '2022-04-11'],
      ['edu_s_7', 'edu_u_student7', 'MA-2026-007', '8A-01', 'Vihaan', 'Sharma', '2013-09-19', 'male', 'B+', '+91 98250 44007', 'vihaan.sharma@edumanage.demo', '24 Satellite Gardens, Ahmedabad', 'edu_p_1', 'edu_cls_8', 'edu_sec_8a', '2023-04-05'],
      ['edu_s_8', 'edu_u_student8', 'MA-2026-008', '8A-02', 'Rhea', 'Patel', '2013-12-02', 'female', 'O+', '+91 98250 44008', 'rhea.patel@edumanage.demo', '11 Bodakdev Enclave, Ahmedabad', 'edu_p_2', 'edu_cls_8', 'edu_sec_8a', '2023-04-07'],
      ['edu_s_9', 'edu_u_student9', 'MA-2026-009', '12S-01', 'Arjun', 'Verma', '2009-04-16', 'male', 'A+', '+91 98250 44009', 'arjun.verma@edumanage.demo', '88 Prahlad Nagar, Ahmedabad', 'edu_p_3', 'edu_cls_12s', 'edu_sec_12sa', '2019-04-09'],
      ['edu_s_10', 'edu_u_student10', 'MA-2026-010', '6A-01', 'Ishita', 'Nair', '2015-02-28', 'female', 'AB+', '+91 98250 44010', 'ishita.nair@edumanage.demo', '5B Science City Road, Ahmedabad', 'edu_p_4', 'edu_cls_6', 'edu_sec_6a', '2024-04-04']
    ];
    const insertStudent = db.prepare(`
      INSERT INTO students (
        id, user_id, admission_number, roll_number, first_name, last_name, date_of_birth,
        gender, blood_group, phone, email, address, parent_id, current_class_id, current_section_id,
        admission_date, status, transfer_notes, documents_json, is_demo, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', '', ?, 1, ?, ?)
    `);
    const insertEnrollment = db.prepare(`
      INSERT INTO student_enrollments (
        id, student_id, session_id, class_id, section_id, roll_number, enrollment_status, remarks, is_demo, created_at
      ) VALUES (?, ?, 'edu_sess_2627', ?, ?, ?, 'enrolled', 'Active academic enrollment', 1, ?)
    `);
    const defaultDocs = JSON.stringify([
      { name: 'Birth Certificate', verified: true },
      { name: 'Previous Transfer Certificate', verified: true },
      { name: 'Student ID Photograph', verified: true }
    ]);

    for (const s of studentDefs) {
      insertStudent.run(...s, defaultDocs, nowIso, nowIso);
      insertEnrollment.run(`edu_enr_${s[0]}`, s[0], s[13], s[14], s[3], nowIso);
    }

    // 11. Student & Teacher Attendance (past 5 days including today)
    const insertStuAtt = db.prepare(`
      INSERT INTO student_attendance (
        id, student_id, class_id, section_id, session_id, attendance_date, status, remarks, marked_by, is_demo
      ) VALUES (?, ?, ?, ?, 'edu_sess_2627', ?, ?, '', 'edu_u_teacher1', 1)
    `);
    for (let d = -4; d <= 0; d++) {
      const dateVal = dayStr(d);
      studentDefs.forEach((s, idx) => {
        let status: 'present' | 'absent' | 'late' = 'present';
        if ((idx + Math.abs(d)) % 9 === 0) status = 'absent';
        else if ((idx + Math.abs(d)) % 11 === 0) status = 'late';
        insertStuAtt.run(`edu_att_${s[0]}_${d + 5}`, s[0], s[13], s[14], dateVal, status);
      });
    }

    const insertTchAtt = db.prepare(`
      INSERT INTO teacher_attendance (
        id, teacher_id, attendance_date, status, check_in_time, check_out_time, remarks, marked_by, is_demo
      ) VALUES (?, ?, ?, ?, '07:50', NULL, '', 'edu_u_admin', 1)
    `);
    teacherDefs.forEach((t, idx) => {
      insertTchAtt.run(`edu_tatt_${t[0]}`, t[0], dayStr(0), idx === 5 ? 'late' : 'present');
    });

    // 12. Timetable (Conflict-free Grade 10-A & Grade 9-A sample slots)
    const ttSlots = [
      ['edu_tt_1', 'edu_cls_10', 'edu_sec_10a', 'edu_sub_math', 'edu_t_1', 'monday', 1, '08:15', '09:00', 'Room 301'],
      ['edu_tt_2', 'edu_cls_10', 'edu_sec_10a', 'edu_sub_sci', 'edu_t_2', 'monday', 2, '09:05', '09:50', 'Room 301'],
      ['edu_tt_3', 'edu_cls_10', 'edu_sec_10a', 'edu_sub_eng', 'edu_t_3', 'monday', 3, '10:05', '10:50', 'Room 301'],
      ['edu_tt_4', 'edu_cls_10', 'edu_sec_10a', 'edu_sub_cs', 'edu_t_4', 'monday', 4, '10:55', '11:40', 'CS Lab 1'],
      ['edu_tt_5', 'edu_cls_10', 'edu_sec_10a', 'edu_sub_math', 'edu_t_1', 'tuesday', 1, '08:15', '09:00', 'Room 301'],
      ['edu_tt_6', 'edu_cls_10', 'edu_sec_10a', 'edu_sub_eng', 'edu_t_3', 'tuesday', 2, '09:05', '09:50', 'Room 301'],
      ['edu_tt_7', 'edu_cls_9', 'edu_sec_9a', 'edu_sub_sst', 'edu_t_5', 'monday', 1, '08:15', '09:00', 'Room 204'],
      ['edu_tt_8', 'edu_cls_9', 'edu_sec_9a', 'edu_sub_math', 'edu_t_1', 'monday', 2, '09:05', '09:50', 'Room 204']
    ];
    const insertTT = db.prepare(`
      INSERT INTO timetables (
        id, session_id, class_id, section_id, subject_id, teacher_id, day_of_week, period_number, start_time, end_time, room_number, is_demo
      ) VALUES (?, 'edu_sess_2627', ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);
    for (const slot of ttSlots) insertTT.run(...slot);

    // 13. Homework & Submissions
    db.prepare(`
      INSERT INTO homework (id, session_id, class_id, section_id, subject_id, teacher_id, title, description, due_date, max_score, status, is_demo, created_at)
      VALUES (?, 'edu_sess_2627', ?, ?, ?, ?, ?, ?, ?, 20, 'active', 1, ?)
    `).run(
      'edu_hw_1',
      'edu_cls_10',
      'edu_sec_10a',
      'edu_sub_math',
      'edu_t_1',
      'Quadratic Equations — Exercise 4.3',
      'Solve problems 1 to 10 showing discriminant steps clearly.',
      dayStr(3),
      daysAgoIso(-2)
    );
    db.prepare(`
      INSERT INTO homework (id, session_id, class_id, section_id, subject_id, teacher_id, title, description, due_date, max_score, status, is_demo, created_at)
      VALUES (?, 'edu_sess_2627', ?, ?, ?, ?, ?, ?, ?, 25, 'active', 1, ?)
    `).run(
      'edu_hw_2',
      'edu_cls_10',
      'edu_sec_10a',
      'edu_sub_sci',
      'edu_t_2',
      'Refraction & Ray Diagrams Lab Sheet',
      'Draw labeled ray diagrams for concave and convex lenses with focal calculations.',
      dayStr(5),
      daysAgoIso(-1)
    );
    db.prepare(`
      INSERT INTO homework_submissions (id, homework_id, student_id, submission_text, submitted_at, status, score, teacher_feedback, graded_by, graded_at, is_demo)
      VALUES ('edu_hwsub_1', 'edu_hw_1', 'edu_s_1', 'Completed all 10 quadratic problems with verified roots.', ?, 'graded', 19, 'Neat derivations and accurate factorization.', 'edu_u_teacher1', ?, 1)
    `).run(daysAgoIso(-1, 16), daysAgoIso(0, 9));

    // 14. Examinations, Exam Subjects & Student Marks
    db.prepare(`
      INSERT INTO examinations (id, session_id, name, exam_type, start_date, end_date, status, is_demo, created_at)
      VALUES ('edu_exam_mid', 'edu_sess_2627', 'Mid-Term Examination 2026', 'mid_term', ?, ?, 'published', 1, ?)
    `).run(dayStr(-20), dayStr(-12), daysAgoIso(-25));
    db.prepare(`
      INSERT INTO examinations (id, session_id, name, exam_type, start_date, end_date, status, is_demo, created_at)
      VALUES ('edu_exam_final', 'edu_sess_2627', 'Term II Assessment 2027', 'final', ?, ?, 'scheduled', 1, ?)
    `).run(dayStr(28), dayStr(38), daysAgoIso(-5));

    const examSubs = [
      ['edu_es_10_math', 'edu_exam_mid', 'edu_cls_10', 'edu_sub_math', dayStr(-20), 100, 33],
      ['edu_es_10_sci', 'edu_exam_mid', 'edu_cls_10', 'edu_sub_sci', dayStr(-18), 100, 33],
      ['edu_es_10_eng', 'edu_exam_mid', 'edu_cls_10', 'edu_sub_eng', dayStr(-16), 100, 33],
      ['edu_es_10_cs', 'edu_exam_mid', 'edu_cls_10', 'edu_sub_cs', dayStr(-14), 100, 33],
      ['edu_es_9_math', 'edu_exam_mid', 'edu_cls_9', 'edu_sub_math', dayStr(-20), 100, 33],
      ['edu_es_9_sst', 'edu_exam_mid', 'edu_cls_9', 'edu_sub_sst', dayStr(-17), 100, 33],
      ['edu_es_8_math', 'edu_exam_mid', 'edu_cls_8', 'edu_sub_math', dayStr(-19), 100, 33],
      ['edu_es_12_phy', 'edu_exam_mid', 'edu_cls_12s', 'edu_sub_phy', dayStr(-18), 100, 33],
      ['edu_es_12_chem', 'edu_exam_mid', 'edu_cls_12s', 'edu_sub_chem', dayStr(-15), 100, 33]
    ];
    const insertES = db.prepare(`
      INSERT INTO examination_subjects (id, examination_id, class_id, subject_id, exam_date, max_marks, pass_marks, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);
    for (const es of examSubs) insertES.run(...es);

    const marksData: [string, string, string, number, string][] = [
      ['edu_es_10_math', 'edu_s_1', 'edu_exam_mid', 94, 'A1'],
      ['edu_es_10_sci', 'edu_s_1', 'edu_exam_mid', 89, 'A2'],
      ['edu_es_10_eng', 'edu_s_1', 'edu_exam_mid', 86, 'A2'],
      ['edu_es_10_cs', 'edu_s_1', 'edu_exam_mid', 96, 'A1'],
      ['edu_es_10_math', 'edu_s_2', 'edu_exam_mid', 91, 'A1'],
      ['edu_es_10_sci', 'edu_s_2', 'edu_exam_mid', 93, 'A1'],
      ['edu_es_10_eng', 'edu_s_2', 'edu_exam_mid', 90, 'A2'],
      ['edu_es_10_cs', 'edu_s_2', 'edu_exam_mid', 88, 'A2'],
      ['edu_es_10_math', 'edu_s_3', 'edu_exam_mid', 76, 'B1'],
      ['edu_es_10_sci', 'edu_s_3', 'edu_exam_mid', 72, 'B1'],
      ['edu_es_10_eng', 'edu_s_3', 'edu_exam_mid', 79, 'B1'],
      ['edu_es_10_cs', 'edu_s_3', 'edu_exam_mid', 82, 'A2'],
      ['edu_es_10_math', 'edu_s_4', 'edu_exam_mid', 85, 'A2'],
      ['edu_es_10_sci', 'edu_s_4', 'edu_exam_mid', 81, 'A2'],
      ['edu_es_9_math', 'edu_s_5', 'edu_exam_mid', 80, 'B1'],
      ['edu_es_9_sst', 'edu_s_5', 'edu_exam_mid', 84, 'A2'],
      ['edu_es_9_math', 'edu_s_6', 'edu_exam_mid', 88, 'A2'],
      ['edu_es_9_sst', 'edu_s_6', 'edu_exam_mid', 91, 'A1'],
      ['edu_es_8_math', 'edu_s_7', 'edu_exam_mid', 87, 'A2'],
      ['edu_es_8_math', 'edu_s_8', 'edu_exam_mid', 78, 'B1'],
      ['edu_es_12_phy', 'edu_s_9', 'edu_exam_mid', 92, 'A1'],
      ['edu_es_12_chem', 'edu_s_9', 'edu_exam_mid', 89, 'A2']
    ];
    const insertMark = db.prepare(`
      INSERT INTO student_marks (id, examination_id, exam_subject_id, student_id, marks_obtained, is_absent, grade, remarks, entered_by, is_demo, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, ?, 'Evaluated', 'edu_u_teacher1', 1, ?)
    `);
    marksData.forEach(([esId, stuId, exId, score, grade], i) => {
      insertMark.run(`edu_mk_${i + 1}`, exId, esId, stuId, score, grade, daysAgoIso(-10));
    });

    // 15. Fees (Categories, Structures, Student Fees & Payments)
    const feeCats = [
      ['edu_fc_tuition', 'Tuition Fee', 'TUI', 'Quarterly academic tuition', 1],
      ['edu_fc_lab', 'Science & STEM Lab Fee', 'LAB', 'Laboratory equipment & consumables', 1],
      ['edu_fc_transport', 'Transport Fee', 'TRN', 'School bus transport service', 1],
      ['edu_fc_exam', 'Examination Fee', 'EXM', 'Board & term assessment fee', 0]
    ];
    const insertFC = db.prepare(
      'INSERT INTO fee_categories (id, name, code, description, is_recurring, is_demo) VALUES (?, ?, ?, ?, ?, 1)'
    );
    for (const fc of feeCats) insertFC.run(...fc);

    const feeStructs = [
      ['edu_fs_10_tui', 'edu_cls_10', 'edu_fc_tuition', 18500, 'quarterly'],
      ['edu_fs_10_lab', 'edu_cls_10', 'edu_fc_lab', 3500, 'annual'],
      ['edu_fs_9_tui', 'edu_cls_9', 'edu_fc_tuition', 16500, 'quarterly'],
      ['edu_fs_8_tui', 'edu_cls_8', 'edu_fc_tuition', 14500, 'quarterly'],
      ['edu_fs_12_tui', 'edu_cls_12s', 'edu_fc_tuition', 22000, 'quarterly'],
      ['edu_fs_6_tui', 'edu_cls_6', 'edu_fc_tuition', 12500, 'quarterly']
    ];
    const insertFS = db.prepare(`
      INSERT INTO fee_structures (id, session_id, class_id, category_id, amount, frequency, due_day, is_demo)
      VALUES (?, 'edu_sess_2627', ?, ?, ?, ?, 10, 1)
    `);
    for (const fsRow of feeStructs) insertFS.run(...fsRow);

    const studentFeeDefs: [string, string, string | null, string, string, string, number, number, string][] = [
      ['edu_sf_1', 'edu_s_1', 'edu_fs_10_tui', 'Tuition Fee', 'Term 1 · Q1', dayStr(-15), 18500, 18500, 'paid'],
      ['edu_sf_2', 'edu_s_1', 'edu_fs_10_lab', 'Science & STEM Lab Fee', 'Annual Lab', dayStr(12), 3500, 0, 'unpaid'],
      ['edu_sf_3', 'edu_s_2', 'edu_fs_10_tui', 'Tuition Fee', 'Term 1 · Q1', dayStr(-15), 18500, 18500, 'paid'],
      ['edu_sf_4', 'edu_s_3', 'edu_fs_10_tui', 'Tuition Fee', 'Term 1 · Q1', dayStr(-5), 18500, 10000, 'partial'],
      ['edu_sf_5', 'edu_s_4', 'edu_fs_10_tui', 'Tuition Fee', 'Term 1 · Q1', dayStr(-10), 18500, 18500, 'paid'],
      ['edu_sf_6', 'edu_s_5', 'edu_fs_9_tui', 'Tuition Fee', 'Term 1 · Q1', dayStr(-12), 16500, 16500, 'paid'],
      ['edu_sf_7', 'edu_s_6', 'edu_fs_9_tui', 'Tuition Fee', 'Term 1 · Q1', dayStr(8), 16500, 0, 'unpaid'],
      ['edu_sf_8', 'edu_s_7', 'edu_fs_8_tui', 'Tuition Fee', 'Term 1 · Q1', dayStr(-15), 14500, 14500, 'paid'],
      ['edu_sf_9', 'edu_s_8', 'edu_fs_8_tui', 'Tuition Fee', 'Term 1 · Q1', dayStr(-2), 14500, 0, 'overdue'],
      ['edu_sf_10', 'edu_s_9', 'edu_fs_12_tui', 'Tuition Fee', 'Term 1 · Q1', dayStr(-18), 22000, 22000, 'paid'],
      ['edu_sf_11', 'edu_s_10', 'edu_fs_6_tui', 'Tuition Fee', 'Term 1 · Q1', dayStr(10), 12500, 12500, 'paid'],
      ['edu_sf_12', 'edu_s_1', null, 'Transport Fee', 'Quarter 1 Bus', dayStr(-10), 4500, 4500, 'paid']
    ];
    const insertSF = db.prepare(`
      INSERT INTO student_fees (
        id, student_id, session_id, fee_structure_id, category_name, installment_label,
        due_date, total_amount, discount_amount, paid_amount, status, is_demo, created_at, updated_at
      ) VALUES (?, ?, 'edu_sess_2627', ?, ?, ?, ?, ?, 0, ?, ?, 1, ?, ?)
    `);
    const insertFP = db.prepare(`
      INSERT INTO fee_payments (
        id, receipt_number, student_fee_id, student_id, amount_paid, payment_method, reference_number, collected_by, paid_at, remarks, is_demo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'edu_u_accountant', ?, 'Demo payment receipt', 1)
    `);
    const payMethods = ['upi', 'card', 'bank_transfer', 'cash'];
    studentFeeDefs.forEach((sf, i) => {
      insertSF.run(sf[0], sf[1], sf[2], sf[3], sf[4], sf[5], sf[6], sf[7], sf[8], daysAgoIso(-20), nowIso);
      if (sf[7] > 0) {
        insertFP.run(
          `edu_fp_${i + 1}`,
          `MA-26-${String(1001 + i)}`,
          sf[0],
          sf[1],
          sf[7],
          payMethods[i % payMethods.length],
          `TXN-EDU-${4400 + i}`,
          daysAgoIso(-14 + (i % 10), 11)
        );
      }
    });

    // 16. Library Books & Issues
    const bookDefs = [
      ['edu_bk_1', '978-81-7450-634-4', 'NCERT Mathematics Class X', 'NCERT Panel', 'Mathematics', 'NCERT', 'Rack A-1', 12, 11],
      ['edu_bk_2', '978-0-13-468599-1', 'Concepts of Physics Vol. 1', 'H.C. Verma', 'Science', 'Bharati Bhawan', 'Rack B-2', 8, 7],
      ['edu_bk_3', '978-0-14-143951-8', 'Pride and Prejudice', 'Jane Austen', 'Literature', 'Penguin', 'Rack C-4', 6, 6],
      ['edu_bk_4', '978-1-492-05635-5', 'Python Crash Course', 'Eric Matthes', 'Computer Science', 'No Starch', 'Rack D-1', 5, 4],
      ['edu_bk_5', '978-81-7992-232-3', 'Wings of Fire', 'A.P.J. Abdul Kalam', 'Biography', 'Universities Press', 'Rack C-1', 7, 7],
      ['edu_bk_6', '978-0-19-807746-6', 'Oxford School Atlas', 'Oxford Editorial', 'Reference', 'Oxford Press', 'Rack E-3', 10, 10]
    ];
    const insertBook = db.prepare(`
      INSERT INTO books (id, isbn, title, author, category, publisher, shelf_location, total_copies, available_copies, is_demo, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);
    for (const b of bookDefs) insertBook.run(...b, nowIso);

    db.prepare(`
      INSERT INTO book_issues (id, book_id, borrower_user_id, student_id, issued_by, issue_date, due_date, return_date, fine_amount, fine_paid, status, remarks, is_demo)
      VALUES ('edu_bi_1', 'edu_bk_1', 'edu_u_student1', 'edu_s_1', 'edu_u_librarian', ?, ?, NULL, 0, 0, 'issued', 'Regular 14-day loan', 1)
    `).run(dayStr(-5), dayStr(9));
    db.prepare(`
      INSERT INTO book_issues (id, book_id, borrower_user_id, student_id, issued_by, issue_date, due_date, return_date, fine_amount, fine_paid, status, remarks, is_demo)
      VALUES ('edu_bi_2', 'edu_bk_4', 'edu_u_student2', 'edu_s_2', 'edu_u_librarian', ?, ?, NULL, 40, 0, 'overdue', '4 days overdue', 1)
    `).run(dayStr(-18), dayStr(-4));
    db.prepare(`
      INSERT INTO book_issues (id, book_id, borrower_user_id, student_id, issued_by, issue_date, due_date, return_date, fine_amount, fine_paid, status, remarks, is_demo)
      VALUES ('edu_bi_3', 'edu_bk_2', 'edu_u_student9', 'edu_s_9', 'edu_u_librarian', ?, ?, NULL, 0, 0, 'issued', 'Board prep reference', 1)
    `).run(dayStr(-3), dayStr(11));

    // 17. Transport Vehicles, Routes & Allocations
    const vehicleDefs = [
      ['edu_v_1', 'GJ-01-MA-4401', 'bus', 42, 'Ramesh Bhai Parmar', '+91 98250 77001', 'GJ0120140098123', 'Suresh Solanki'],
      ['edu_v_2', 'GJ-01-MA-4402', 'bus', 42, 'Mahesh Patel', '+91 98250 77002', 'GJ0120150044210', 'Kiran Rathod'],
      ['edu_v_3', 'GJ-01-MA-4403', 'minibus', 24, 'Harish Chauhan', '+91 98250 77003', 'GJ0120160077891', 'Nitin Gohil']
    ];
    const insertVehicle = db.prepare(`
      INSERT INTO vehicles (id, vehicle_number, vehicle_type, capacity, driver_name, driver_phone, driver_license, attendant_name, status, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', 1)
    `);
    for (const v of vehicleDefs) insertVehicle.run(...v);

    const routeDefs = [
      ['edu_rt_1', 'RT-WEST-01', 'Satellite · Prahlad Nagar Express', 'edu_v_1', JSON.stringify(['Satellite Gardens', 'Jodhpur Cross', 'Prahlad Nagar', 'Meridian Campus']), 1500, '07:10', '15:15'],
      ['edu_rt_2', 'RT-NORTH-02', 'Bodakdev · Science City Loop', 'edu_v_2', JSON.stringify(['Bodakdev Enclave', 'Thaltej Cross', 'Science City Road', 'Meridian Campus']), 1650, '07:05', '15:20'],
      ['edu_rt_3', 'RT-CENTRAL-03', 'Navrangpura · CG Road Shuttle', 'edu_v_3', JSON.stringify(['Navrangpura', 'Commerce Six Roads', 'SG Highway', 'Meridian Campus']), 1400, '07:20', '15:05']
    ];
    const insertRoute = db.prepare(`
      INSERT INTO transport_routes (id, route_code, route_name, vehicle_id, stops_json, monthly_fee, morning_pickup_time, afternoon_drop_time, is_active, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
    `);
    for (const rt of routeDefs) insertRoute.run(...rt);

    const trAllocs = [
      ['edu_tra_1', 'edu_s_1', 'edu_rt_1', 'Satellite Gardens', 1500],
      ['edu_tra_2', 'edu_s_7', 'edu_rt_1', 'Satellite Gardens', 1500],
      ['edu_tra_3', 'edu_s_2', 'edu_rt_2', 'Bodakdev Enclave', 1650],
      ['edu_tra_4', 'edu_s_4', 'edu_rt_2', 'Science City Road', 1650],
      ['edu_tra_5', 'edu_s_5', 'edu_rt_3', 'Navrangpura', 1400]
    ];
    const insertTrAlloc = db.prepare(`
      INSERT INTO student_transport_allocations (id, student_id, route_id, stop_name, monthly_fee, status, assigned_at, is_demo)
      VALUES (?, ?, ?, ?, ?, 'active', ?, 1)
    `);
    for (const ta of trAllocs) insertTrAlloc.run(...ta, nowIso);

    // 18. School Announcements
    const annDefs = [
      ['edu_ann_1', 'Mid-Term Examination Results Published', 'Grade 8, 9, 10 & 12 Mid-Term report cards are now live in Student and Parent portals.', 'all', 'important', 'edu_u_principal', daysAgoIso(-2, 11)],
      ['edu_ann_2', 'Annual Science & Robotics Exhibition', 'Students of Grades 6–12 may register project teams with Science Faculty by Friday.', 'students', 'normal', 'edu_u_teacher2', daysAgoIso(-1, 14)],
      ['edu_ann_3', 'Parent-Teacher Conference This Saturday', 'PTM timings: 09:00 AM to 01:00 PM in respective homerooms. Please bring student diary.', 'parents', 'urgent', 'edu_u_principal', daysAgoIso(0, 8)],
      ['edu_ann_4', 'Term 1 Fee Settlement Reminder', 'Parents with pending lab or tuition installments are requested to clear dues before the 15th.', 'parents', 'important', 'edu_u_accountant', daysAgoIso(0, 9)]
    ];
    const insertAnn = db.prepare(`
      INSERT INTO announcements (id, title, message, audience, target_class_id, priority, published_by, is_demo, created_at)
      VALUES (?, ?, ?, ?, NULL, ?, ?, 1, ?)
    `);
    for (const a of annDefs) insertAnn.run(...a);

    // 19. Initial Audit Logs
    const auditDefs = [
      ['edu_log_1', 'edu_u_principal', 'Prof. Rajeshwari Iyer', 'principal', 'EXAM_PUBLISHED', 'examinations', 'edu_exam_mid', '{"exam":"Mid-Term Examination 2026"}', daysAgoIso(-2, 11)],
      ['edu_log_2', 'edu_u_accountant', 'Manish Agarwal', 'accountant', 'FEE_RECEIPT_ISSUED', 'fees', 'edu_fp_1', '{"receipt":"MA-26-1001","amount":18500}', daysAgoIso(-1, 12)],
      ['edu_log_3', 'edu_u_teacher1', 'Siddharth Menon', 'teacher', 'ATTENDANCE_MARKED', 'attendance', 'edu_sec_10a', '{"class":"Grade 10-A","marked":10}', daysAgoIso(0, 8)],
      ['edu_log_4', 'edu_u_librarian', 'Kavita Krishnan', 'librarian', 'BOOK_ISSUED', 'library', 'edu_bi_3', '{"book":"Concepts of Physics Vol. 1"}', daysAgoIso(0, 9)]
    ];
    const insertAudit = db.prepare(`
      INSERT INTO audit_logs (id, user_id, actor_name, actor_role, action, module, entity_id, details_json, ip_address, is_demo, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, '127.0.0.1', 1, ?)
    `);
    for (const al of auditDefs) insertAudit.run(...al);
  });

  tx();
}

export function getEduManageDb(customPath?: string): Database.Database {
  const targetPath =
    customPath ||
    process.env.EDUMANAGE_DB_PATH ||
    path.join(DATA_DIR, 'edumanage.db');

  if (eduDbInstance && currentEduDbPath === targetPath) {
    return eduDbInstance;
  }

  if (eduDbInstance) {
    try {
      eduDbInstance.close();
    } catch {
      // ignore close error
    }
    eduDbInstance = null;
  }

  if (targetPath !== ':memory:') {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new Database(targetPath);
  initializeEduManageSchema(db);

  const settingsCount = (db.prepare('SELECT COUNT(*) AS c FROM school_settings').get() as any).c;
  if (settingsCount === 0) {
    seedEduManageDemoData(db);
  }

  eduDbInstance = db;
  currentEduDbPath = targetPath;
  return db;
}

export function closeEduManageDb() {
  if (eduDbInstance) {
    try {
      eduDbInstance.close();
    } catch {
      // ignore already closed
    }
    eduDbInstance = null;
    currentEduDbPath = null;
  }
}

export function resetEduManageDemoData(): {
  students: number;
  teachers: number;
  classes: number;
  books: number;
} {
  const db = getEduManageDb();

  const tablesToClear = [
    'announcements',
    'student_transport_allocations',
    'transport_routes',
    'vehicles',
    'book_issues',
    'books',
    'homework_submissions',
    'homework',
    'timetables',
    'fee_payments',
    'student_fees',
    'fee_structures',
    'fee_categories',
    'student_marks',
    'examination_subjects',
    'examinations',
    'teacher_attendance',
    'student_attendance',
    'student_enrollments',
    'students',
    'parents',
    'teacher_subject_allocations',
    'subjects',
    'sections',
    'teachers',
    'classes',
    'academic_sessions',
    'audit_logs',
    'sessions',
    'users',
    'role_permissions',
    'permissions',
    'roles',
    'school_settings'
  ];

  const tx = db.transaction(() => {
    for (const tbl of tablesToClear) {
      db.prepare(`DELETE FROM ${tbl}`).run();
    }
  });
  tx();

  seedEduManageDemoData(db);

  return {
    students: Number((db.prepare('SELECT COUNT(*) AS c FROM students').get() as any).c),
    teachers: Number((db.prepare('SELECT COUNT(*) AS c FROM teachers').get() as any).c),
    classes: Number((db.prepare('SELECT COUNT(*) AS c FROM classes').get() as any).c),
    books: Number((db.prepare('SELECT COUNT(*) AS c FROM books').get() as any).c)
  };
}

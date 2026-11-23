# PROJECT #2 — EDUMANAGE (SCHOOL MANAGEMENT ERP)
## Phase 1: Architecture, Database Schema, REST API Contract, RBAC & UI/UX Design Plan

**Studio:** Codemaniac Studio · Business Web Applications Portfolio (App 02 of 11)  
**Product Name:** EduManage — School Management ERP Web Application  
**Default Demo Institution:** Meridian Academy (CBSE · Affiliation No. 2130842 · Academic Session 2026–27)  
**Route Entry:** `/edumanage` (plus Web Application Portfolio Option #2 in Codemaniac Studio)  
**API Prefix:** `/api/edumanage/*`  
**Isolated Preview Database:** `data/edumanage.db` (SQLite WAL with strict `PRAGMA foreign_keys = ON`)  
**Production Database:** `docs/edumanage/postgres-schema.sql` (PostgreSQL 15+ / Supabase with Row-Level Security)

---

## 1. High-Level API-First Architecture

EduManage follows an API-first layered architecture cleanly separated from Codemaniac Studio (`/`), the SaaS platform (`/saas`), and RestoFlow (`/restoflow`). Every domain workflow lives in server-side business services so future Android and iOS apps can reuse `/api/edumanage/*` directly via `Authorization: Bearer <token>` while the web app uses `HttpOnly` session cookies + CSRF origin checks.

```text
┌───────────────────────────────────────────────────────────────────────────┐
│  FRONTEND LAYER (React 19 + TypeScript + Tailwind CSS + Recharts + jsPDF) │
│  • EduManageLandingView (Product Overview & Institution Showcase)         │
│  • EduManageLoginView (8-Role Demo Autofill + Real Server Auth)           │
│  • Role Workspaces:                                                       │
│      - Super Admin / School Admin / Principal Executive ERP Console       │
│      - Teacher Academic Workspace (Classes, Attendance, Homework, Marks)  │
│      - Accountant Finance Workspace (Fee Structures, Receipts, Arrears)   │
│      - Librarian Workspace (Catalog, ISBN, Issue/Return, Auto-Fines)      │
│      - Student Portal (Self Timetable, Attendance, Homework, Results)     │
│      - Parent Portal (Linked Children, Attendance, Fees, Results, Alerts) │
└─────────────────────────────────┬─────────────────────────────────────────┘
                                  │ Typed REST Client (src/api/edumanageClient.ts)
                                  │ JSON Envelope: { success, data, message, meta? }
┌─────────────────────────────────▼─────────────────────────────────────────┐
│  REST API LAYER (Express Routers mounted at /api/edumanage/*)             │
│  13 Modular Routers + Auth Middleware + 8-Role RBAC + Rate Limiter        │
│  auth · dashboard · settings · students · teachers · attendance           │
│  timetable · homework · exams · fees · library · transport · portals      │
│  reports · announcements · audit                                          │
└─────────────────────────────────┬─────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼─────────────────────────────────────────┐
│  BUSINESS LOGIC / SERVICE LAYER (server/edumanage/services/*)             │
│  • dashboardService     (Live SQL KPIs, Attendance %, Fee Rollups, Charts)│
│  • academicService      (Promotions, Transfers, Conflict-Free Timetables) │
│  • examService          (Grade Rules, %, Class Ranking, Report Card Data) │
│  • feeService           (Class Structures, Installments, Receipts, Dues)  │
│  • libraryService       (Atomic Stock Copy Check, Overdue Fine Calc)      │
│  • reportService        (Student/Attendance/Fee/Exam/Teacher SQL Reports) │
└─────────────────────────────────┬─────────────────────────────────────────┘
                                  │ Parameterized SQL + ACID Transactions
┌─────────────────────────────────▼─────────────────────────────────────────┐
│  DATABASE LAYER                                                           │
│  • Preview/Dev:  data/edumanage.db (better-sqlite3 WAL + FK enforcement)  │
│  • Production:   docs/edumanage/postgres-schema.sql (PostgreSQL + RLS)    │
│  • Demo Safety:  is_demo=1 on seeded records, is_demo=0 on new records    │
│                  + Transactional Reset preserving active Admin session    │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Normalized Relational Database Schema (32 Tables)

All tables use strict foreign key constraints, `CHECK` guards, `UNIQUE` composite keys, performance indexes, and `is_demo` isolation.

### A. Institution, Auth & RBAC (6 Tables)
1. **`school_settings`** — `id`, `school_name`, `board_affiliation` (`CBSE`/`GSEB`/`ICSE`/`IB`), `affiliation_code`, `logo_url`, `address`, `city`, `phone`, `email`, `website`, `currency_code`, `currency_symbol`, `receipt_prefix`, `grading_scale_json`, `fine_per_day`, `demo_mode`, `updated_at`
2. **`roles`** — `id`, `code` (`super_admin`, `school_admin`, `principal`, `teacher`, `accountant`, `librarian`, `student`, `parent`), `name`, `description`
3. **`permissions`** — `id`, `code`, `module`, `description` + junction **`role_permissions`** (`role_id`, `permission_id`)
4. **`users`** — `id`, `full_name`, `email` (UNIQUE), `phone`, `password_hash` (salted `scrypt`), `role_code` (FK → `roles.code`), `avatar_url`, `is_active`, `is_demo`, `last_login_at`, `created_at`, `updated_at`
5. **`sessions`** — `id`, `user_id` (FK → `users.id` CASCADE), `token_hash` (SHA-256 UNIQUE), `ip_address`, `user_agent`, `expires_at`, `created_at`
6. **`audit_logs`** — `id`, `user_id` (FK → `users.id` SET NULL), `actor_name`, `actor_role`, `action`, `module`, `entity_id`, `details_json`, `ip_address`, `is_demo`, `created_at`

### B. Academic Structure & People (10 Tables)
7. **`academic_sessions`** — `id`, `name` (e.g., `2026-27`, UNIQUE), `start_date`, `end_date`, `is_current`, `is_demo`, `created_at`
8. **`classes`** — `id`, `name` (e.g., `Grade 10`), `numeric_order`, `stream` (`General`/`Science`/`Commerce`), `is_active`, `is_demo`
9. **`sections`** — `id`, `class_id` (FK → `classes.id` CASCADE), `name` (`A`, `B`, `C`), `room_number`, `capacity`, `class_teacher_id` (FK → `teachers.id` SET NULL), `is_demo`, UNIQUE(`class_id`, `name`)
10. **`subjects`** — `id`, `code` (UNIQUE), `name`, `department`, `subject_type` (`theory`/`practical`/`elective`), `max_marks_default`, `pass_marks_default`, `is_demo`
11. **`teachers`** — `id`, `user_id` (FK → `users.id` CASCADE UNIQUE), `employee_id` (UNIQUE), `designation`, `department`, `qualification`, `experience_years`, `joining_date`, `salary_monthly`, `employment_type` (`full_time`/`part_time`/`visiting`), `status` (`active`/`on_leave`/`resigned`), `is_demo`, `created_at`, `updated_at`
12. **`teacher_subject_allocations`** — `id`, `teacher_id` (FK → `teachers.id` CASCADE), `class_id` (FK → `classes.id` CASCADE), `section_id` (FK → `sections.id` CASCADE), `subject_id` (FK → `subjects.id` CASCADE), `session_id` (FK → `academic_sessions.id` CASCADE), `is_demo`, UNIQUE(`teacher_id`, `section_id`, `subject_id`, `session_id`)
13. **`parents`** — `id`, `user_id` (FK → `users.id` CASCADE UNIQUE), `guardian_name`, `relation` (`father`/`mother`/`guardian`), `phone`, `alt_phone`, `email`, `occupation`, `address`, `is_demo`, `created_at`
14. **`students`** — `id`, `user_id` (FK → `users.id` CASCADE UNIQUE), `admission_number` (UNIQUE), `roll_number`, `first_name`, `last_name`, `date_of_birth`, `gender`, `blood_group`, `phone`, `email`, `address`, `parent_id` (FK → `parents.id` SET NULL), `current_class_id` (FK → `classes.id`), `current_section_id` (FK → `sections.id`), `admission_date`, `status` (`active`/`promoted`/`transferred`/`graduated`/`inactive`), `transfer_notes`, `documents_json`, `is_demo`, `created_at`, `updated_at`
15. **`student_enrollments`** — `id`, `student_id` (FK → `students.id` CASCADE), `session_id` (FK → `academic_sessions.id` CASCADE), `class_id` (FK → `classes.id`), `section_id` (FK → `sections.id`), `roll_number`, `enrollment_status` (`enrolled`/`promoted`/`detained`/`transferred`), `remarks`, `is_demo`, `created_at`, UNIQUE(`student_id`, `session_id`)
16. **`announcements`** — `id`, `title`, `message`, `audience` (`all`/`teachers`/`students`/`parents`/`staff`), `target_class_id` (nullable FK → `classes.id`), `priority` (`normal`/`important`/`urgent`), `published_by` (FK → `users.id`), `is_demo`, `created_at`

### C. Attendance, Timetable & Homework (5 Tables)
17. **`student_attendance`** — `id`, `student_id` (FK → `students.id` CASCADE), `class_id` (FK → `classes.id`), `section_id` (FK → `sections.id`), `session_id` (FK → `academic_sessions.id`), `attendance_date`, `status` (`present`/`absent`/`late`/`excused`), `remarks`, `marked_by` (FK → `users.id`), `is_demo`, UNIQUE(`student_id`, `attendance_date`)
18. **`teacher_attendance`** — `id`, `teacher_id` (FK → `teachers.id` CASCADE), `attendance_date`, `status` (`present`/`absent`/`late`/`half_day`/`on_leave`), `check_in_time`, `check_out_time`, `remarks`, `marked_by` (FK → `users.id`), `is_demo`, UNIQUE(`teacher_id`, `attendance_date`)
19. **`timetables`** — `id`, `session_id` (FK → `academic_sessions.id`), `class_id` (FK → `classes.id`), `section_id` (FK → `sections.id`), `subject_id` (FK → `subjects.id`), `teacher_id` (FK → `teachers.id`), `day_of_week` (`monday`..`saturday`), `period_number` (1..8), `start_time`, `end_time`, `room_number`, `is_demo` *(Conflict validation enforces zero double-booking on section+day+period, teacher+day+period, and room+day+period)*
20. **`homework`** — `id`, `session_id` (FK → `academic_sessions.id`), `class_id` (FK → `classes.id`), `section_id` (FK → `sections.id`), `subject_id` (FK → `subjects.id`), `teacher_id` (FK → `teachers.id`), `title`, `description`, `due_date`, `max_score`, `attachment_url`, `status` (`active`/`closed`), `is_demo`, `created_at`
21. **`homework_submissions`** — `id`, `homework_id` (FK → `homework.id` CASCADE), `student_id` (FK → `students.id` CASCADE), `submission_text`, `attachment_url`, `submitted_at`, `status` (`submitted`/`late`/`graded`), `score`, `teacher_feedback`, `graded_by` (FK → `users.id`), `graded_at`, `is_demo`, UNIQUE(`homework_id`, `student_id`)

### D. Examinations & Report Cards (3 Tables)
22. **`examinations`** — `id`, `session_id` (FK → `academic_sessions.id`), `name` (e.g., `Mid-Term Examination 2026`), `exam_type` (`unit_test`/`mid_term`/`final`/`practical`), `start_date`, `end_date`, `status` (`scheduled`/`ongoing`/`published`), `is_demo`, `created_at`
23. **`examination_subjects`** — `id`, `examination_id` (FK → `examinations.id` CASCADE), `class_id` (FK → `classes.id`), `subject_id` (FK → `subjects.id`), `exam_date`, `start_time`, `end_time`, `room_number`, `max_marks`, `pass_marks`, `is_demo`, UNIQUE(`examination_id`, `class_id`, `subject_id`)
24. **`student_marks`** — `id`, `examination_id` (FK → `examinations.id` CASCADE), `exam_subject_id` (FK → `examination_subjects.id` CASCADE), `student_id` (FK → `students.id` CASCADE), `marks_obtained`, `is_absent`, `grade`, `remarks`, `entered_by` (FK → `users.id`), `is_demo`, `updated_at`, UNIQUE(`exam_subject_id`, `student_id`)

### E. Fees & Accounting (4 Tables)
25. **`fee_categories`** — `id`, `name` (e.g., `Tuition Fee`, `Lab Fee`, `Exam Fee`, `Transport Fee`), `code` (UNIQUE), `description`, `is_recurring`, `is_demo`
26. **`fee_structures`** — `id`, `session_id` (FK → `academic_sessions.id`), `class_id` (FK → `classes.id`), `category_id` (FK → `fee_categories.id`), `amount`, `frequency` (`monthly`/`quarterly`/`annual`/`one_time`), `due_day`, `is_demo`, UNIQUE(`session_id`, `class_id`, `category_id`)
27. **`student_fees`** — `id`, `student_id` (FK → `students.id` CASCADE), `session_id` (FK → `academic_sessions.id`), `fee_structure_id` (FK → `fee_structures.id` SET NULL), `category_name`, `installment_label` (e.g., `Term 1 · Q1`), `due_date`, `total_amount`, `discount_amount`, `paid_amount`, `status` (`unpaid`/`partial`/`paid`/`overdue`), `is_demo`, `created_at`, `updated_at`
28. **`fee_payments`** — `id`, `receipt_number` (UNIQUE), `student_fee_id` (FK → `student_fees.id` CASCADE), `student_id` (FK → `students.id` CASCADE), `amount_paid`, `payment_method` (`cash`/`card`/`upi`/`bank_transfer`/`cheque`), `reference_number`, `collected_by` (FK → `users.id`), `paid_at`, `remarks`, `is_demo`

### F. Library & Transport (5 Tables)
29. **`books`** — `id`, `isbn` (UNIQUE), `title`, `author`, `category`, `publisher`, `shelf_location`, `total_copies`, `available_copies` (CHECK `>= 0 AND <= total_copies`), `is_demo`, `created_at`
30. **`book_issues`** — `id`, `book_id` (FK → `books.id` RESTRICT), `borrower_user_id` (FK → `users.id`), `student_id` (nullable FK → `students.id`), `issued_by` (FK → `users.id`), `issue_date`, `due_date`, `return_date`, `fine_amount`, `fine_paid`, `status` (`issued`/`returned`/`overdue`/`lost`), `remarks`, `is_demo`
31. **`vehicles`** — `id`, `vehicle_number` (UNIQUE), `vehicle_type` (`bus`/`van`/`minibus`), `capacity`, `driver_name`, `driver_phone`, `driver_license`, `attendant_name`, `status` (`active`/`maintenance`/`inactive`), `is_demo`
32. **`transport_routes`** — `id`, `route_code` (UNIQUE), `route_name`, `vehicle_id` (FK → `vehicles.id` SET NULL), `stops_json`, `monthly_fee`, `morning_pickup_time`, `afternoon_drop_time`, `is_active`, `is_demo`
33. **`student_transport_allocations`** — `id`, `student_id` (FK → `students.id` CASCADE UNIQUE), `route_id` (FK → `transport_routes.id` RESTRICT), `stop_name`, `monthly_fee`, `status` (`active`/`paused`), `assigned_at`, `is_demo`

---

## 3. Eight-Role RBAC & Record-Level Access Matrix

| Module | Super Admin | School Admin | Principal | Teacher | Accountant | Librarian | Student | Parent |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Executive Dashboard** | Full | Full | Full | Class Scope | Finance KPI | Library KPI | Self Portal | Child Portal |
| **Students (CRUD / Promote / Transfer)** | Full | Full | View + Promote | View Assigned | View Fees | View | Self Only | Own Child Only |
| **Teachers (CRUD / Allocation)** | Full | Full | View + Allocate | Self Profile | View | — | — | — |
| **Attendance (Student & Teacher)** | Full | Full | Full + Reports | Mark Assigned | — | — | Self History | Own Child Only |
| **Timetable & Conflict Check** | Full | Full | Full | Own + Class | — | — | Own Class | Own Child Class |
| **Homework & Grading** | Full | Full | View | Create + Grade | — | — | Submit Own | View Child |
| **Examinations & Report Cards** | Full | Full | Full + Publish | Enter Marks | — | — | Published Self | Published Child |
| **Fees, Receipts & Dues** | Full | Full | View Summary | — | Full CRUD + Collect | — | View Own | View Child + Receipt |
| **Library (Books, Issues, Fines)** | Full | Full | View | View Catalog | View Fines | Full CRUD | Own Loans | Own Child Loans |
| **Transport (Vehicles & Routes)** | Full | Full | View | — | Transport Fees | — | Own Route | Own Child Route |
| **Announcements** | Full | Full | Full | Class Notice | Fee Notice | Notice | Read | Read |
| **Reports & PDF/Excel Exports** | All | All | Academic + Att | Class Reports | Fee Reports | Library | Own Report Card | Child Report Card |
| **School Settings & Demo Reset** | Full + Reset | Full + Reset | Read | — | — | — | — | — |
| **Audit Logs** | Full | Full | View | — | — | — | — | — |

---

## 4. Complete REST API Contract (`/api/edumanage/*`)

All responses use `{ success: boolean, data: T, message?: string }`.

- **Auth & Demo**:
  - `GET /auth/demo-accounts`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /demo/reset`
- **Dashboard, Announcements & Audit**:
  - `GET /dashboard`, `GET/POST/DELETE /announcements`, `GET /audit-logs`
- **School Settings & Academic Setup**:
  - `GET/PATCH /settings`, `GET/POST /sessions`, `PATCH /sessions/:id/activate`, `GET/POST/DELETE /classes`, `POST /classes/:id/sections`, `GET/POST/DELETE /subjects`
- **Students**:
  - `GET /students` (`?search=&classId=&sectionId=&status=`), `GET /students/:id` (profile + parent + enrollments + attendance % + fee balance + marks), `POST /students`, `PATCH /students/:id`, `POST /students/:id/promote`, `POST /students/:id/transfer`
- **Teachers**:
  - `GET /teachers`, `GET /teachers/:id`, `POST /teachers`, `PATCH /teachers/:id`, `POST /teachers/:id/allocations`, `DELETE /teachers/allocations/:allocationId`
- **Attendance**:
  - `GET /attendance/students?classId=&sectionId=&date=`, `POST /attendance/students/bulk`, `GET /attendance/students/monthly?classId=&month=`, `GET /attendance/teachers?date=`, `POST /attendance/teachers/bulk`
- **Timetable**:
  - `GET /timetable?classId=&sectionId=&teacherId=`, `POST /timetable` (with real-time section/teacher/room conflict detection returning `409 Conflict`), `DELETE /timetable/:id`
- **Homework & Assignments**:
  - `GET /homework`, `POST /homework`, `PATCH /homework/:id`, `GET /homework/:id/submissions`, `POST /homework/:id/submit` (Student), `PATCH /homework/submissions/:subId/grade` (Teacher)
- **Examinations & Report Cards**:
  - `GET/POST /exams`, `PATCH /exams/:id/status`, `POST /exams/:id/subjects`, `GET /exams/:id/marks?classId=&subjectId=`, `POST /exams/:id/marks/bulk`, `GET /exams/:id/leaderboard?classId=`, `GET /exams/:id/report-card/:studentId`
- **Fees & Payments**:
  - `GET/POST /fees/categories`, `GET/POST /fees/structures`, `POST /fees/allocate`, `GET /fees/students?classId=&status=&search=`, `POST /fees/payments` (server-authoritative receipt generation), `GET /fees/payments`, `GET /fees/receipts/:paymentId`
- **Library**:
  - `GET/POST/PATCH/DELETE /library/books`, `GET /library/issues`, `POST /library/issues` (atomic copy decrement), `POST /library/issues/:id/return` (auto overdue fine calculation + copy increment)
- **Transport**:
  - `GET/POST/PATCH/DELETE /transport/vehicles`, `GET/POST/PATCH/DELETE /transport/routes`, `GET/POST/DELETE /transport/allocations`
- **Dedicated Role Portals**:
  - `GET /portal/student` (strictly scoped to signed-in student)
  - `GET /portal/parent` (strictly scoped to signed-in parent's linked children)
- **Reports**:
  - `GET /reports?type=students|attendance|fees|exams|teachers&classId=&month=&examId=`

---

## 5. Distinctive UI/UX Visual Identity (Zero Overlap with RestoFlow)

EduManage uses an authoritative **Academic Precision** aesthetic tailored for CBSE/GSEB/International school boards:

| Token | Hex | Usage |
| :--- | :--- | :--- |
| **Primary (Academic Cobalt)** | `#1769AA` | Primary buttons, active navigation rail, KPI highlights, report card headers |
| **Secondary (Sky Azure)** | `#5BB6F5` | Secondary data series, subtle badges, chart gradients, focus accents |
| **Canvas Background (Soft Ice)** | `#F5FAFF` | Application workspace canvas — crisp, bright, high readability for long admin shifts |
| **Card Surface** | `#FFFFFF` | Elevated cards with subtle `#DCEAF7` cool-slate hairline borders |
| **Primary Typography (Deep Ink)** | `#102A43` | Headings, table figures, tabular numbers (`tabular-nums`) |
| **Accent (Teal Emerald)** | `#16A085` | Attendance present indicators, paid fee status, pass/distinction badges, Excel export |
| **Alert Tokens** | `#D97706` / `#DC2626` | Late/pending installments (Amber) · Absent/overdue fines/conflicts (Crimson) |

- **Layout Architecture**: Clean light-slate + deep-cobalt `#0F2942` vertical sidebar (collapsible mobile drawer), crisp white top utility bar with active Academic Session badge (`2026–27`), quick **Switch Role** demo presenter menu (all 8 roles), and structured tabular data grids.

---

## 6. Folder Structure

```text
server/edumanage/
├── db.ts                      # 33-table SQLite schema + Meridian Academy demo seed + reset
├── security.ts                # scrypt auth, sessions, CSRF guard, rate limiter, 8-role RBAC
├── services/
│   ├── dashboardService.ts    # Live SQL dashboard KPIs & academic/fee charts
│   ├── academicService.ts     # Promotions, transfers, timetable conflict detector
│   ├── examService.ts         # Marks grading, percentage, rank & report card engine
│   ├── feeService.ts          # Fee allocation, payment ledger & receipts
│   ├── libraryService.ts      # Atomic book stock & overdue fine calculation
│   └── reportService.ts       # Multi-domain SQL reporting engine
└── routes/
    ├── index.ts
    ├── authRoutes.ts
    ├── dashboardSettingsRoutes.ts
    ├── studentTeacherRoutes.ts
    ├── attendanceTimetableHomeworkRoutes.ts
    ├── examRoutes.ts
    ├── feeLibraryTransportRoutes.ts
    ├── portalRoutes.ts
    └── reportRoutes.ts

src/
├── types/edumanage.ts
├── api/edumanageClient.ts
├── utils/edumanageExports.ts  # PDF Report Cards, Fee Receipts & Multi-Sheet Excel Exports
└── components/edumanage/
    ├── EduManageApp.tsx
    ├── EduManageLandingView.tsx
    ├── EduManageLoginView.tsx
    ├── EduManageDashboardView.tsx
    ├── EduManageStudentsView.tsx
    ├── EduManageTeachersView.tsx
    ├── EduManageAttendanceView.tsx
    ├── EduManageTimetableView.tsx
    ├── EduManageHomeworkView.tsx
    ├── EduManageExamsView.tsx
    ├── EduManageFeesView.tsx
    ├── EduManageLibraryView.tsx
    ├── EduManageTransportView.tsx
    ├── EduManageStudentPortalView.tsx
    ├── EduManageParentPortalView.tsx
    ├── EduManageReportsView.tsx
    └── EduManageSettingsView.tsx

docs/edumanage/
├── PHASE1_ARCHITECTURE.md
├── postgres-schema.sql        # Phase 8 PostgreSQL / Supabase DDL + RLS
└── DEPLOYMENT.md              # Phase 8 Setup & Deployment Guide

tests/edumanage/
└── phase2..phase8 integration & security suites
```

---

## 7. 8-Phase Development Roadmap

| Phase | Scope & Deliverables | Verification Gate |
| :---: | :--- | :--- |
| **Phase 1** | Architecture, 33-table normalized schema, relationships, API contract, 8-role RBAC, UI/UX design system | Blueprint saved & approved by user |
| **Phase 2** | Isolated `data/edumanage.db` + Meridian Academy demo seed, 8-role `scrypt` auth & RBAC, Landing Page, Login Page, live SQL Admin Dashboard, School Settings, Demo Reset & Web Apps catalog integration | Integration tests + `vite build` + `tsc --noEmit` |
| **Phase 3** | Student Management (registration, admission no., parent link, documents, academic history, promotion, transfer, filters) & Teacher Management (employee ID, subject/class allocations, employment info) | CRUD + promotion/transfer integration tests + build/lint |
| **Phase 4** | Attendance Management (daily class bulk marking, monthly reports, teacher attendance), Timetable Management (class/teacher views + real-time room/teacher/section conflict detection), Homework & Submissions | Conflict-guard & grading tests + build/lint |
| **Phase 5** | Examination Management (schedules, subject marks entry, auto grade & percentage, class ranking, printable PDF Report Cards) | Marks/ranking/grade accuracy tests + build/lint |
| **Phase 6** | Fees Management (categories, structures, installments, payment collection, pending dues, printable PDF receipts), Library (books, ISBN, issue/return, auto overdue fines), Transport (vehicles, drivers, routes, allocations) | Atomic stock/payment/fine tests + build/lint |
| **Phase 7** | Dedicated **Parent Portal** (linked children only: attendance, results, fees, homework, announcements) & **Student Portal** (personal dashboard, timetable, attendance, homework submission, exam results) | Cross-student/cross-parent ownership isolation tests |
| **Phase 8** | Multi-domain Reports & Analytics (Student, Attendance, Fees, Exams, Teachers) with **PDF & Excel exports**, Production PostgreSQL/Supabase RLS schema, Deployment Guide, full security audit & zero-regression verification | Full EduManage + RestoFlow + Studio test pass |

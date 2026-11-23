import { getEduManageDb } from '../db.ts';
import type {
  AcademicSession,
  AnnouncementRecord,
  AuditLogRecord,
  EduManageDashboardData,
  EduManageRole
} from '../../../src/types/edumanage.ts';

const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;

export function getEduManageDashboard(role: EduManageRole): EduManageDashboardData {
  const db = getEduManageDb();
  const todayStr = new Date().toISOString().slice(0, 10);

  const sessionRow = db
    .prepare('SELECT * FROM academic_sessions ORDER BY is_current DESC, start_date DESC LIMIT 1')
    .get() as any;

  const activeSession: AcademicSession | null = sessionRow
    ? {
        id: sessionRow.id,
        name: sessionRow.name,
        startDate: sessionRow.start_date,
        endDate: sessionRow.end_date,
        isCurrent: Boolean(sessionRow.is_current),
        isDemo: Boolean(sessionRow.is_demo),
        createdAt: sessionRow.created_at
      }
    : null;

  const totalStudents = Number(
    (db.prepare("SELECT COUNT(*) AS c FROM students WHERE status = 'active'").get() as any)?.c || 0
  );
  const totalTeachers = Number(
    (db.prepare("SELECT COUNT(*) AS c FROM teachers WHERE status = 'active'").get() as any)?.c || 0
  );
  const totalClasses = Number(
    (db.prepare('SELECT COUNT(*) AS c FROM classes WHERE is_active = 1').get() as any)?.c || 0
  );
  const totalSections = Number(
    (db.prepare('SELECT COUNT(*) AS c FROM sections').get() as any)?.c || 0
  );

  // Today's student attendance
  const attToday = db
    .prepare(`
      SELECT
        COUNT(*) AS marked,
        SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END) AS present_cnt,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) AS absent_cnt
      FROM student_attendance
      WHERE attendance_date = ?
    `)
    .get(todayStr) as any;

  const todayMarkedCount = Number(attToday?.marked || 0);
  const todayPresentCount = Number(attToday?.present_cnt || 0);
  const todayAbsentCount = Number(attToday?.absent_cnt || 0);
  const todayAttendancePct =
    todayMarkedCount > 0 ? round1((todayPresentCount / todayMarkedCount) * 100) : 0;

  // Fee totals from live student_fees ledger
  const feeAgg = db
    .prepare(`
      SELECT
        COALESCE(SUM(paid_amount), 0) AS collected,
        COALESCE(SUM(MAX(0, total_amount - discount_amount - paid_amount)), 0) AS pending,
        COALESCE(SUM(total_amount - discount_amount), 0) AS net_billed
      FROM student_fees
    `)
    .get() as any;

  const feeCollectedTotal = round2(Number(feeAgg?.collected || 0));
  const pendingFeesTotal = round2(Number(feeAgg?.pending || 0));
  const netBilled = Number(feeAgg?.net_billed || 0);
  const collectionRatePct = netBilled > 0 ? round1((feeCollectedTotal / netBilled) * 100) : 0;

  // Examinations, Library & Transport KPIs
  const upcomingExamsCount = Number(
    (
      db
        .prepare("SELECT COUNT(*) AS c FROM examinations WHERE status IN ('scheduled', 'ongoing')")
        .get() as any
    )?.c || 0
  );
  const activeBooksIssued = Number(
    (
      db
        .prepare("SELECT COUNT(*) AS c FROM book_issues WHERE status IN ('issued', 'overdue')")
        .get() as any
    )?.c || 0
  );
  const overdueBooksCount = Number(
    (
      db
        .prepare(
          "SELECT COUNT(*) AS c FROM book_issues WHERE status = 'overdue' OR (status = 'issued' AND due_date < ?)"
        )
        .get(todayStr) as any
    )?.c || 0
  );
  const activeTransportRoutes = Number(
    (db.prepare('SELECT COUNT(*) AS c FROM transport_routes WHERE is_active = 1').get() as any)?.c || 0
  );

  // 7-day attendance trend
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 6 * 86400000).toISOString().slice(0, 10);
  const trendRows = db
    .prepare(`
      SELECT
        attendance_date,
        COUNT(*) AS marked,
        SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END) AS present_cnt
      FROM student_attendance
      WHERE attendance_date >= ?
      GROUP BY attendance_date
      ORDER BY attendance_date ASC
    `)
    .all(sevenDaysAgo) as any[];
  const trendMap = new Map(trendRows.map((r) => [String(r.attendance_date), r]));

  const attendanceTrend: EduManageDashboardData['attendanceTrend'] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    const row = trendMap.get(key);
    const marked = Number(row?.marked || 0);
    const present = Number(row?.present_cnt || 0);
    attendanceTrend.push({
      date: key,
      label,
      presentPct: marked > 0 ? round1((present / marked) * 100) : 0,
      presentCount: present,
      totalMarked: marked
    });
  }

  // Academic performance by class (live SQL from student_marks + examination_subjects)
  const perfRows = db
    .prepare(`
      SELECT
        c.name AS class_name,
        c.numeric_order,
        COUNT(DISTINCT sm.student_id) AS students_evaluated,
        AVG(CASE WHEN es.max_marks > 0 THEN (sm.marks_obtained * 100.0 / es.max_marks) ELSE 0 END) AS avg_pct,
        AVG(CASE WHEN sm.is_absent = 0 AND sm.marks_obtained >= es.pass_marks THEN 100.0 ELSE 0.0 END) AS pass_rate
      FROM student_marks sm
      JOIN examination_subjects es ON es.id = sm.exam_subject_id
      JOIN classes c ON c.id = es.class_id
      GROUP BY c.id
      ORDER BY c.numeric_order ASC
    `)
    .all() as any[];

  const academicPerformanceByClass = perfRows.map((r) => ({
    className: r.class_name,
    avgPct: round1(Number(r.avg_pct || 0)),
    passRatePct: round1(Number(r.pass_rate || 0)),
    studentsEvaluated: Number(r.students_evaluated || 0)
  }));

  // Fee collection breakdown by category
  const feeCatRows = db
    .prepare(`
      SELECT
        category_name AS category,
        COALESCE(SUM(paid_amount), 0) AS collected,
        COALESCE(SUM(MAX(0, total_amount - discount_amount - paid_amount)), 0) AS pending
      FROM student_fees
      GROUP BY category_name
      ORDER BY collected DESC
    `)
    .all() as any[];

  const feeBreakdownByCategory = feeCatRows.map((r) => ({
    category: r.category,
    collected: round2(Number(r.collected || 0)),
    pending: round2(Number(r.pending || 0))
  }));

  // Upcoming & recent examinations
  const examRows = db
    .prepare(`
      SELECT
        e.*,
        (SELECT COUNT(*) FROM examination_subjects es WHERE es.examination_id = e.id) AS subject_count
      FROM examinations e
      ORDER BY e.start_date DESC
      LIMIT 5
    `)
    .all() as any[];

  const upcomingExams = examRows.map((e) => ({
    id: e.id,
    name: e.name,
    examType: e.exam_type,
    startDate: e.start_date,
    endDate: e.end_date,
    status: e.status,
    subjectCount: Number(e.subject_count || 0)
  }));

  // Recent audit activities
  const logRows = db
    .prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 8')
    .all() as any[];

  const recentActivities: AuditLogRecord[] = logRows.map((r) => {
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(r.details_json || '{}');
    } catch {
      parsed = {};
    }
    return {
      id: r.id,
      userId: r.user_id || null,
      actorName: r.actor_name,
      actorRole: r.actor_role,
      action: r.action,
      module: r.module,
      entityId: r.entity_id || null,
      details: parsed,
      ipAddress: r.ip_address || '',
      isDemo: Boolean(r.is_demo),
      createdAt: r.created_at
    };
  });

  // Announcements filtered by role audience
  const audienceFilter =
    role === 'student'
      ? "('all', 'students')"
      : role === 'parent'
      ? "('all', 'parents')"
      : role === 'teacher'
      ? "('all', 'teachers', 'staff')"
      : "('all', 'teachers', 'students', 'parents', 'staff')";

  const annRows = db
    .prepare(`
      SELECT a.*, u.full_name AS published_by_name, c.name AS target_class_name
      FROM announcements a
      LEFT JOIN users u ON u.id = a.published_by
      LEFT JOIN classes c ON c.id = a.target_class_id
      WHERE a.audience IN ${audienceFilter}
      ORDER BY a.created_at DESC
      LIMIT 6
    `)
    .all() as any[];

  const announcements: AnnouncementRecord[] = annRows.map((a) => ({
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

  return {
    activeSession,
    kpis: {
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSections,
      todayAttendancePct,
      todayPresentCount,
      todayAbsentCount,
      todayMarkedCount,
      feeCollectedTotal,
      pendingFeesTotal,
      collectionRatePct,
      upcomingExamsCount,
      activeBooksIssued,
      overdueBooksCount,
      activeTransportRoutes
    },
    attendanceTrend,
    academicPerformanceByClass,
    feeBreakdownByCategory,
    upcomingExams,
    recentActivities,
    announcements
  };
}

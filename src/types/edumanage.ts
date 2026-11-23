export type EduManageRole =
  | 'super_admin'
  | 'school_admin'
  | 'principal'
  | 'teacher'
  | 'accountant'
  | 'librarian'
  | 'student'
  | 'parent';

export interface EduManageUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: EduManageRole;
  avatarUrl: string;
  isActive: boolean;
  isDemo: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface EduManagePermissions {
  canViewAdminDashboard: boolean;
  canManageStudents: boolean;
  canPromoteStudents: boolean;
  canManageTeachers: boolean;
  canMarkAttendance: boolean;
  canManageTimetable: boolean;
  canManageHomework: boolean;
  canSubmitHomework: boolean;
  canManageExams: boolean;
  canEnterMarks: boolean;
  canManageFees: boolean;
  canManageLibrary: boolean;
  canManageTransport: boolean;
  canManageAnnouncements: boolean;
  canViewReports: boolean;
  canViewAuditLogs: boolean;
  canManageSettings: boolean;
  canResetDemo: boolean;
  isStudentPortal: boolean;
  isParentPortal: boolean;
}

export interface EduManageDemoAccount {
  role: EduManageRole;
  label: string;
  fullName: string;
  email: string;
  demoPassword: string;
  workspaceTitle: string;
  highlights: string;
}

export interface GradingScaleRule {
  grade: string;
  minPct: number;
  maxPct: number;
  remark: string;
}

export interface SchoolSettings {
  id: string;
  schoolName: string;
  boardAffiliation: string;
  affiliationCode: string;
  logoUrl: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  currencyCode: string;
  currencySymbol: string;
  receiptPrefix: string;
  gradingScale: GradingScaleRule[];
  finePerDay: number;
  demoMode: boolean;
  updatedAt: string;
}

export interface AcademicSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isDemo: boolean;
  createdAt: string;
}

export interface SchoolSection {
  id: string;
  classId: string;
  className?: string;
  name: string;
  roomNumber: string;
  capacity: number;
  classTeacherId: string | null;
  classTeacherName?: string | null;
  studentCount?: number;
  isDemo: boolean;
}

export interface SchoolClass {
  id: string;
  name: string;
  numericOrder: number;
  stream: string;
  isActive: boolean;
  isDemo: boolean;
  studentCount?: number;
  sections: SchoolSection[];
}

export interface SubjectRecord {
  id: string;
  code: string;
  name: string;
  department: string;
  subjectType: 'theory' | 'practical' | 'elective';
  maxMarksDefault: number;
  passMarksDefault: number;
  isDemo: boolean;
}

export interface AnnouncementRecord {
  id: string;
  title: string;
  message: string;
  audience: 'all' | 'teachers' | 'students' | 'parents' | 'staff';
  targetClassId: string | null;
  targetClassName?: string | null;
  priority: 'normal' | 'important' | 'urgent';
  publishedBy: string;
  publishedByName?: string;
  isDemo: boolean;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  userId: string | null;
  actorName: string;
  actorRole: string;
  action: string;
  module: string;
  entityId: string | null;
  details: Record<string, unknown>;
  ipAddress: string;
  isDemo: boolean;
  createdAt: string;
}

export interface EduManageDashboardData {
  activeSession: AcademicSession | null;
  kpis: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalSections: number;
    todayAttendancePct: number;
    todayPresentCount: number;
    todayAbsentCount: number;
    todayMarkedCount: number;
    feeCollectedTotal: number;
    pendingFeesTotal: number;
    collectionRatePct: number;
    upcomingExamsCount: number;
    activeBooksIssued: number;
    overdueBooksCount: number;
    activeTransportRoutes: number;
  };
  attendanceTrend: {
    date: string;
    label: string;
    presentPct: number;
    presentCount: number;
    totalMarked: number;
  }[];
  academicPerformanceByClass: {
    className: string;
    avgPct: number;
    passRatePct: number;
    studentsEvaluated: number;
  }[];
  feeBreakdownByCategory: {
    category: string;
    collected: number;
    pending: number;
  }[];
  upcomingExams: {
    id: string;
    name: string;
    examType: string;
    startDate: string;
    endDate: string;
    status: string;
    subjectCount: number;
  }[];
  recentActivities: AuditLogRecord[];
  announcements: AnnouncementRecord[];
}

export interface StudentDocumentRecord {
  id: string;
  name: string;
  category: 'birth_certificate' | 'transfer_certificate' | 'id_proof' | 'report_card' | 'medical' | 'other';
  url: string;
  verified: boolean;
  uploadedAt: string;
}

export interface ParentSummary {
  id: string;
  userId: string;
  guardianName: string;
  relation: 'father' | 'mother' | 'guardian';
  phone: string;
  altPhone: string;
  email: string;
  occupation: string;
  address: string;
}

export interface StudentEnrollmentHistory {
  id: string;
  sessionId: string;
  sessionName: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  rollNumber: string;
  enrollmentStatus: 'enrolled' | 'promoted' | 'detained' | 'transferred';
  remarks: string;
  createdAt: string;
}

export interface StudentRecord {
  id: string;
  userId: string;
  admissionNumber: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  parentId: string | null;
  parentName: string | null;
  parentPhone: string | null;
  parentRelation: string | null;
  currentClassId: string;
  currentClassName: string;
  currentSectionId: string;
  currentSectionName: string;
  admissionDate: string;
  status: 'active' | 'promoted' | 'transferred' | 'graduated' | 'inactive';
  transferNotes: string;
  documents: StudentDocumentRecord[];
  attendancePct: number | null;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentDetailRecord extends StudentRecord {
  parent: ParentSummary | null;
  enrollments: StudentEnrollmentHistory[];
  attendanceSummary: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    percentage: number;
  };
  recentMarks: {
    examName: string;
    subjectName: string;
    marksObtained: number;
    maxMarks: number;
    grade: string;
  }[];
}

export interface TeacherAllocationRecord {
  id: string;
  teacherId: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  sessionId: string;
  sessionName: string;
}

export interface TeacherAttendanceRecord {
  id?: string;
  teacherId: string;
  employeeId?: string;
  teacherName?: string;
  department?: string;
  designation?: string;
  attendanceDate: string;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
  checkInTime: string;
  checkOutTime: string;
  remarks: string;
}

export interface TeacherRecord {
  id: string;
  userId: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  qualification: string;
  experienceYears: number;
  joiningDate: string;
  salaryMonthly: number | null;
  employmentType: 'full_time' | 'part_time' | 'visiting';
  status: 'active' | 'on_leave' | 'resigned';
  todayAttendanceStatus: string | null;
  allocationsCount: number;
  allocations: TeacherAllocationRecord[];
  homeroomSections: { sectionId: string; className: string; sectionName: string }[];
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherDetailRecord extends TeacherRecord {
  recentAttendance: TeacherAttendanceRecord[];
}

export interface StudentAttendanceEntry {
  attendanceId?: string;
  studentId: string;
  admissionNumber: string;
  rollNumber: string;
  studentName: string;
  classId: string;
  sectionId: string;
  attendanceDate: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks: string;
  marked: boolean;
}

export interface MonthlyAttendanceRow {
  studentId: string;
  admissionNumber: string;
  rollNumber: string;
  studentName: string;
  className: string;
  sectionName: string;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  totalMarked: number;
  attendancePct: number;
}

export interface StudentAttendanceHistoryItem {
  id: string;
  attendanceDate: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks: string;
  className: string;
  sectionName: string;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface TimetableSlotRecord {
  id: string;
  sessionId: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  dayOfWeek: DayOfWeek;
  periodNumber: number;
  startTime: string;
  endTime: string;
  roomNumber: string;
  isDemo: boolean;
}

export interface HomeworkSubmissionRecord {
  id: string | null;
  homeworkId: string;
  studentId: string;
  admissionNumber: string;
  rollNumber: string;
  studentName: string;
  submissionText: string;
  attachmentUrl: string;
  submittedAt: string | null;
  status: 'pending' | 'submitted' | 'late' | 'graded';
  score: number | null;
  teacherFeedback: string;
  gradedByName: string | null;
  gradedAt: string | null;
}

export interface HomeworkRecord {
  id: string;
  sessionId: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  attachmentUrl: string;
  status: 'active' | 'closed';
  totalStudents: number;
  submittedCount: number;
  gradedCount: number;
  mySubmission?: {
    id: string;
    submissionText: string;
    attachmentUrl: string;
    submittedAt: string;
    status: 'submitted' | 'late' | 'graded';
    score: number | null;
    teacherFeedback: string;
    gradedAt: string | null;
  } | null;
  isDemo: boolean;
  createdAt: string;
}



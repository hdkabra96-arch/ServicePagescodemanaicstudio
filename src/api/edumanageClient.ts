import type {
  AcademicSession,
  AnnouncementRecord,
  AuditLogRecord,
  DayOfWeek,
  EduManageDashboardData,
  EduManageDemoAccount,
  EduManagePermissions,
  EduManageUser,
  HomeworkRecord,
  HomeworkSubmissionRecord,
  MonthlyAttendanceRow,
  ParentSummary,
  SchoolClass,
  SchoolSection,
  SchoolSettings,
  StudentAttendanceEntry,
  StudentAttendanceHistoryItem,
  StudentDetailRecord,
  StudentDocumentRecord,
  StudentRecord,
  SubjectRecord,
  TeacherAttendanceRecord,
  TeacherDetailRecord,
  TeacherRecord,
  TimetableSlotRecord
} from '../types/edumanage';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Keep auth token strictly in memory (never localStorage); HttpOnly cookie persists across reloads.
let inMemoryEduToken: string | null = null;

export function setEduManageToken(token: string | null) {
  inMemoryEduToken = token;
}

export function getEduManageToken(): string | null {
  return inMemoryEduToken;
}

async function eduRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  };
  if (inMemoryEduToken) {
    headers.Authorization = `Bearer ${inMemoryEduToken}`;
  }

  const res = await fetch(`/api/edumanage${path}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  const payload = (await res.json().catch(() => ({}))) as ApiResponse<T>;
  if (!res.ok || payload.success === false) {
    throw new Error(payload.message || `Request failed (${res.status})`);
  }
  return payload.data as T;
}

export interface EduAuthPayload {
  token?: string;
  expiresAt?: string;
  user: EduManageUser;
  permissions: EduManagePermissions;
  school: SchoolSettings;
  activeSessionName?: string;
}

export const eduManageApi = {
  // Auth & Demo Accounts
  getDemoAccounts() {
    return eduRequest<{
      schoolName: string;
      boardAffiliation: string;
      demoMode: boolean;
      accounts: EduManageDemoAccount[];
    }>('/auth/demo-accounts');
  },

  async login(email: string, password: string): Promise<EduAuthPayload> {
    const data = await eduRequest<EduAuthPayload>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) {
      setEduManageToken(data.token);
    }
    return data;
  },

  async logout(): Promise<void> {
    try {
      await eduRequest<null>('/auth/logout', { method: 'POST' });
    } finally {
      setEduManageToken(null);
    }
  },

  getMe() {
    return eduRequest<EduAuthPayload>('/auth/me');
  },

  async resetDemoData() {
    const data = await eduRequest<{
      token: string | null;
      user: EduManageUser;
      permissions: EduManagePermissions;
      school: SchoolSettings;
      restoredCounts: Record<string, number>;
    }>('/demo/reset', { method: 'POST' });
    if (data.token) {
      setEduManageToken(data.token);
    }
    return data;
  },

  // Live SQL Dashboard
  getDashboard() {
    return eduRequest<EduManageDashboardData>('/dashboard');
  },

  // Announcements
  getAnnouncements() {
    return eduRequest<AnnouncementRecord[]>('/announcements');
  },

  createAnnouncement(payload: {
    title: string;
    message: string;
    audience: AnnouncementRecord['audience'];
    priority: AnnouncementRecord['priority'];
    targetClassId?: string | null;
  }) {
    return eduRequest<AnnouncementRecord>('/announcements', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  deleteAnnouncement(id: string) {
    return eduRequest<null>(`/announcements/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  // Audit Logs
  getAuditLogs() {
    return eduRequest<AuditLogRecord[]>('/audit-logs');
  },

  // School Settings
  getSettings() {
    return eduRequest<SchoolSettings>('/settings');
  },

  updateSettings(payload: Partial<SchoolSettings>) {
    return eduRequest<SchoolSettings>('/settings', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  // Academic Sessions
  getSessions() {
    return eduRequest<AcademicSession[]>('/sessions');
  },

  createSession(payload: {
    name: string;
    startDate: string;
    endDate: string;
    isCurrent?: boolean;
  }) {
    return eduRequest<AcademicSession>('/sessions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  activateSession(id: string) {
    return eduRequest<AcademicSession>(`/sessions/${encodeURIComponent(id)}/activate`, {
      method: 'PATCH'
    });
  },

  // Classes & Sections
  getClasses() {
    return eduRequest<SchoolClass[]>('/classes');
  },

  createClass(payload: {
    name: string;
    numericOrder: number;
    stream?: string;
    defaultSection?: string;
    roomNumber?: string;
  }) {
    return eduRequest<SchoolClass>('/classes', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  addSection(
    classId: string,
    payload: { name: string; roomNumber?: string; capacity?: number }
  ) {
    return eduRequest<SchoolSection>(`/classes/${encodeURIComponent(classId)}/sections`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Subjects
  getSubjects() {
    return eduRequest<SubjectRecord[]>('/subjects');
  },

  createSubject(payload: {
    code: string;
    name: string;
    department?: string;
    subjectType?: 'theory' | 'practical' | 'elective';
    maxMarksDefault?: number;
    passMarksDefault?: number;
  }) {
    return eduRequest<SubjectRecord>('/subjects', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  deleteSubject(id: string) {
    return eduRequest<null>(`/subjects/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  // --- Phase 3: Student & Parent Management ---
  getParents() {
    return eduRequest<ParentSummary[]>('/parents');
  },

  getStudents(params?: { q?: string; classId?: string; sectionId?: string; status?: string }) {
    const qs = new URLSearchParams();
    if (params?.q) qs.set('q', params.q);
    if (params?.classId) qs.set('classId', params.classId);
    if (params?.sectionId) qs.set('sectionId', params.sectionId);
    if (params?.status) qs.set('status', params.status);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return eduRequest<StudentRecord[]>(`/students${suffix}`);
  },

  getStudentDetail(id: string) {
    return eduRequest<StudentDetailRecord>(`/students/${encodeURIComponent(id)}`);
  },

  createStudent(payload: {
    firstName: string;
    lastName: string;
    admissionNumber?: string;
    rollNumber?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    bloodGroup?: string;
    phone?: string;
    email?: string;
    address?: string;
    classId: string;
    sectionId: string;
    admissionDate?: string;
    portalPassword?: string;
    parentId?: string | null;
    newParent?: {
      guardianName: string;
      relation: 'father' | 'mother' | 'guardian';
      phone: string;
      email?: string;
      occupation?: string;
      address?: string;
    };
  }) {
    return eduRequest<StudentDetailRecord>('/students', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateStudent(
    id: string,
    payload: {
      firstName?: string;
      lastName?: string;
      rollNumber?: string;
      dateOfBirth?: string;
      gender?: 'male' | 'female' | 'other';
      bloodGroup?: string;
      phone?: string;
      address?: string;
      parentId?: string | null;
      classId?: string;
      sectionId?: string;
      status?: StudentRecord['status'];
    }
  ) {
    return eduRequest<StudentDetailRecord>(`/students/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  addStudentDocument(
    studentId: string,
    payload: {
      name: string;
      category: StudentDocumentRecord['category'];
      url?: string;
      verified?: boolean;
    }
  ) {
    return eduRequest<StudentDocumentRecord>(
      `/students/${encodeURIComponent(studentId)}/documents`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
  },

  deleteStudentDocument(studentId: string, docId: string) {
    return eduRequest<null>(
      `/students/${encodeURIComponent(studentId)}/documents/${encodeURIComponent(docId)}`,
      { method: 'DELETE' }
    );
  },

  promoteStudent(
    studentId: string,
    payload: {
      targetClassId: string;
      targetSectionId: string;
      targetSessionId?: string;
      newRollNumber?: string;
      remarks?: string;
    }
  ) {
    return eduRequest<StudentDetailRecord>(
      `/students/${encodeURIComponent(studentId)}/promote`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
  },

  transferStudent(
    studentId: string,
    payload: {
      reason: string;
      destinationSchool?: string;
      tcNumber?: string;
      transferDate?: string;
    }
  ) {
    return eduRequest<StudentDetailRecord>(
      `/students/${encodeURIComponent(studentId)}/transfer`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
  },

  // --- Phase 3: Teacher Management ---
  getTeachers(params?: { q?: string; department?: string; status?: string }) {
    const qs = new URLSearchParams();
    if (params?.q) qs.set('q', params.q);
    if (params?.department) qs.set('department', params.department);
    if (params?.status) qs.set('status', params.status);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return eduRequest<TeacherRecord[]>(`/teachers${suffix}`);
  },

  getTeacherDetail(id: string) {
    return eduRequest<TeacherDetailRecord>(`/teachers/${encodeURIComponent(id)}`);
  },

  createTeacher(payload: {
    fullName: string;
    email: string;
    phone?: string;
    employeeId?: string;
    designation?: string;
    department?: string;
    qualification?: string;
    experienceYears?: number;
    joiningDate?: string;
    salaryMonthly?: number;
    employmentType?: 'full_time' | 'part_time' | 'visiting';
    portalPassword?: string;
  }) {
    return eduRequest<TeacherRecord>('/teachers', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateTeacher(
    id: string,
    payload: {
      fullName?: string;
      phone?: string;
      designation?: string;
      department?: string;
      qualification?: string;
      experienceYears?: number;
      joiningDate?: string;
      salaryMonthly?: number;
      employmentType?: 'full_time' | 'part_time' | 'visiting';
      status?: 'active' | 'on_leave' | 'resigned';
    }
  ) {
    return eduRequest<TeacherRecord>(`/teachers/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  addTeacherAllocation(
    teacherId: string,
    payload: {
      classId: string;
      sectionId: string;
      subjectId: string;
      setAsClassTeacher?: boolean;
    }
  ) {
    return eduRequest<TeacherRecord>(
      `/teachers/${encodeURIComponent(teacherId)}/allocations`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
  },

  removeTeacherAllocation(teacherId: string, allocationId: string) {
    return eduRequest<null>(
      `/teachers/${encodeURIComponent(teacherId)}/allocations/${encodeURIComponent(allocationId)}`,
      { method: 'DELETE' }
    );
  },

  getDailyTeacherAttendance(date: string) {
    return eduRequest<TeacherAttendanceRecord[]>(
      `/teachers/attendance/daily?date=${encodeURIComponent(date)}`
    );
  },

  saveDailyTeacherAttendance(
    date: string,
    entries: {
      teacherId: string;
      status: TeacherAttendanceRecord['status'];
      checkInTime?: string;
      checkOutTime?: string;
      remarks?: string;
    }[]
  ) {
    return eduRequest<{ date: string; count: number }>('/teachers/attendance/daily', {
      method: 'POST',
      body: JSON.stringify({ date, entries })
    });
  },

  // --- Phase 4: Attendance Management ---
  getStudentDailyAttendance(classId: string, sectionId: string, date: string) {
    const qs = new URLSearchParams({ classId, sectionId, date });
    return eduRequest<StudentAttendanceEntry[]>(`/attendance/students?${qs.toString()}`);
  },

  saveStudentDailyAttendance(payload: {
    classId: string;
    sectionId: string;
    date: string;
    entries: {
      studentId: string;
      status: StudentAttendanceEntry['status'];
      remarks?: string;
    }[];
  }) {
    return eduRequest<{ date: string; total: number; presentCount: number }>(
      '/attendance/students',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
  },

  getMonthlyAttendanceReport(params: { month: string; classId?: string; sectionId?: string }) {
    const qs = new URLSearchParams({ month: params.month });
    if (params.classId) qs.set('classId', params.classId);
    if (params.sectionId) qs.set('sectionId', params.sectionId);
    return eduRequest<{
      month: string;
      averagePct: number;
      students: MonthlyAttendanceRow[];
    }>(`/attendance/monthly?${qs.toString()}`);
  },

  getStudentAttendanceHistory(studentId: string) {
    return eduRequest<{
      studentId: string;
      studentName: string;
      summary: {
        totalDays: number;
        presentDays: number;
        lateDays: number;
        absentDays: number;
        excusedDays: number;
        percentage: number;
      };
      history: StudentAttendanceHistoryItem[];
    }>(`/attendance/student/${encodeURIComponent(studentId)}`);
  },

  // --- Phase 4: Timetable Management ---
  getTimetables(params?: { classId?: string; sectionId?: string; teacherId?: string }) {
    const qs = new URLSearchParams();
    if (params?.classId) qs.set('classId', params.classId);
    if (params?.sectionId) qs.set('sectionId', params.sectionId);
    if (params?.teacherId) qs.set('teacherId', params.teacherId);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return eduRequest<TimetableSlotRecord[]>(`/timetables${suffix}`);
  },

  createTimetableSlot(payload: {
    classId: string;
    sectionId: string;
    subjectId: string;
    teacherId: string;
    dayOfWeek: DayOfWeek;
    periodNumber: number;
    startTime: string;
    endTime: string;
    roomNumber?: string;
  }) {
    return eduRequest<TimetableSlotRecord>('/timetables', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  deleteTimetableSlot(id: string) {
    return eduRequest<null>(`/timetables/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  // --- Phase 4: Homework & Assignments ---
  getHomework(params?: {
    classId?: string;
    sectionId?: string;
    subjectId?: string;
    status?: string;
  }) {
    const qs = new URLSearchParams();
    if (params?.classId) qs.set('classId', params.classId);
    if (params?.sectionId) qs.set('sectionId', params.sectionId);
    if (params?.subjectId) qs.set('subjectId', params.subjectId);
    if (params?.status) qs.set('status', params.status);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return eduRequest<HomeworkRecord[]>(`/homework${suffix}`);
  },

  createHomework(payload: {
    classId: string;
    sectionId: string;
    subjectId: string;
    teacherId?: string;
    title: string;
    description?: string;
    dueDate: string;
    maxScore?: number;
    attachmentUrl?: string;
  }) {
    return eduRequest<{ id: string; title: string; dueDate: string; maxScore: number; status: string }>(
      '/homework',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
  },

  updateHomeworkStatus(id: string, status: 'active' | 'closed') {
    return eduRequest<{ status: string }>(`/homework/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  getHomeworkSubmissions(homeworkId: string) {
    return eduRequest<HomeworkSubmissionRecord[]>(
      `/homework/${encodeURIComponent(homeworkId)}/submissions`
    );
  },

  submitHomework(
    homeworkId: string,
    payload: { submissionText: string; attachmentUrl?: string }
  ) {
    return eduRequest<{
      id: string;
      homeworkId: string;
      studentId: string;
      submissionText: string;
      status: string;
    }>(`/homework/${encodeURIComponent(homeworkId)}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  gradeHomeworkSubmission(
    homeworkId: string,
    submissionId: string,
    payload: { score: number; teacherFeedback?: string }
  ) {
    return eduRequest<{ id: string; score: number; teacherFeedback: string; status: string }>(
      `/homework/${encodeURIComponent(homeworkId)}/submissions/${encodeURIComponent(submissionId)}/grade`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }
    );
  }
};

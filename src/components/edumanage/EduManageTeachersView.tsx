import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpenCheck,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  UserPlus,
  X
} from 'lucide-react';
import { eduManageApi } from '../../api/edumanageClient';
import type {
  EduManagePermissions,
  SchoolClass,
  SchoolSettings,
  SubjectRecord,
  TeacherAttendanceRecord,
  TeacherDetailRecord,
  TeacherRecord
} from '../../types/edumanage';

interface EduManageTeachersViewProps {
  permissions: EduManagePermissions;
  school: SchoolSettings;
  onDataMutated?: () => void;
}

type TeacherWorkspaceTab = 'directory' | 'attendance';
type TeacherModalTab = 'profile' | 'allocations' | 'attendance';

export const EduManageTeachersView: React.FC<EduManageTeachersViewProps> = ({
  permissions,
  school,
  onDataMutated
}) => {
  const [workspaceTab, setWorkspaceTab] = useState<TeacherWorkspaceTab>('directory');
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Onboard Teacher Modal
  const [addOpen, setAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [addForm, setAddForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    employeeId: '',
    designation: 'Subject Teacher',
    department: 'Mathematics',
    qualification: 'M.Sc., B.Ed.',
    experienceYears: 4,
    joiningDate: new Date().toISOString().slice(0, 10),
    salaryMonthly: 48000,
    employmentType: 'full_time' as 'full_time' | 'part_time' | 'visiting',
    portalPassword: 'EduTeacher@2026!'
  });

  // Teacher Detail Modal
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherDetailRecord | null>(null);
  const [modalTab, setModalTab] = useState<TeacherModalTab>('profile');
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    designation: '',
    department: '',
    qualification: '',
    experienceYears: 0,
    joiningDate: '',
    salaryMonthly: 0,
    employmentType: 'full_time' as 'full_time' | 'part_time' | 'visiting',
    status: 'active' as 'active' | 'on_leave' | 'resigned'
  });

  // Allocation Form
  const [allocClassId, setAllocClassId] = useState('');
  const [allocSectionId, setAllocSectionId] = useState('');
  const [allocSubjectId, setAllocSubjectId] = useState('');
  const [setAsClassTeacher, setSetAsClassTeacher] = useState(false);

  // Daily Attendance Register
  const [attDate, setAttDate] = useState(new Date().toISOString().slice(0, 10));
  const [attEntries, setAttEntries] = useState<TeacherAttendanceRecord[]>([]);
  const [loadingAtt, setLoadingAtt] = useState(false);

  const canManageAttendance = permissions.canManageTeachers || permissions.canViewAuditLogs;
  const sym = school.currencySymbol || '₹';

  const loadMeta = useCallback(async () => {
    try {
      const [clsList, subList] = await Promise.all([
        eduManageApi.getClasses(),
        eduManageApi.getSubjects()
      ]);
      setClasses(clsList);
      setSubjects(subList);
      if (clsList.length > 0 && !allocClassId) {
        setAllocClassId(clsList[0].id);
        setAllocSectionId(clsList[0].sections[0]?.id || '');
      }
      if (subList.length > 0 && !allocSubjectId) {
        setAllocSubjectId(subList[0].id);
      }
    } catch {
      // handled gracefully
    }
  }, [allocClassId, allocSubjectId]);

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const list = await eduManageApi.getTeachers({
        q: searchQuery.trim() || undefined,
        department: filterDept || undefined,
        status: filterStatus || undefined
      });
      setTeachers(list);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to load faculty directory.' });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterDept, filterStatus]);

  const loadDailyAttendance = useCallback(
    async (dateStr: string) => {
      if (!canManageAttendance) return;
      setLoadingAtt(true);
      try {
        const list = await eduManageApi.getDailyTeacherAttendance(dateStr);
        setAttEntries(list);
      } catch (err: any) {
        setFeedback({ type: 'error', text: err?.message || 'Unable to load teacher attendance register.' });
      } finally {
        setLoadingAtt(false);
      }
    },
    [canManageAttendance]
  );

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTeachers();
    }, 150);
    return () => clearTimeout(timer);
  }, [loadTeachers]);

  useEffect(() => {
    if (workspaceTab === 'attendance') {
      loadDailyAttendance(attDate);
    }
  }, [workspaceTab, attDate, loadDailyAttendance]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach((t) => {
      if (t.department) set.add(t.department);
    });
    return Array.from(set).sort();
  }, [teachers]);

  const allocSections = useMemo(() => {
    const cls = classes.find((c) => c.id === allocClassId);
    return cls?.sections || [];
  }, [classes, allocClassId]);

  const openTeacherProfile = async (teacherId: string, tab: TeacherModalTab = 'profile') => {
    setModalTab(tab);
    try {
      const detail = await eduManageApi.getTeacherDetail(teacherId);
      setSelectedTeacher(detail);
      setEditForm({
        fullName: detail.fullName,
        phone: detail.phone,
        designation: detail.designation,
        department: detail.department,
        qualification: detail.qualification,
        experienceYears: detail.experienceYears,
        joiningDate: detail.joiningDate,
        salaryMonthly: detail.salaryMonthly ?? 0,
        employmentType: detail.employmentType,
        status: detail.status
      });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to load teacher profile.' });
    }
  };

  const handleOnboardTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSaving(true);
    try {
      const created = await eduManageApi.createTeacher({
        fullName: addForm.fullName.trim(),
        email: addForm.email.trim(),
        phone: addForm.phone.trim(),
        employeeId: addForm.employeeId.trim() || undefined,
        designation: addForm.designation.trim(),
        department: addForm.department.trim(),
        qualification: addForm.qualification.trim(),
        experienceYears: Number(addForm.experienceYears) || 0,
        joiningDate: addForm.joiningDate,
        salaryMonthly: Number(addForm.salaryMonthly) || 0,
        employmentType: addForm.employmentType,
        portalPassword: addForm.portalPassword
      });
      setAddOpen(false);
      setAddForm((prev) => ({
        ...prev,
        fullName: '',
        email: '',
        phone: '',
        employeeId: ''
      }));
      await loadTeachers();
      onDataMutated?.();
      setFeedback({
        type: 'success',
        text: `Onboarded ${created.fullName} (${created.employeeId}) in ${created.department}.`
      });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to register teacher.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    setFeedback(null);
    setIsSaving(true);
    try {
      await eduManageApi.updateTeacher(selectedTeacher.id, {
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim(),
        designation: editForm.designation.trim(),
        department: editForm.department.trim(),
        qualification: editForm.qualification.trim(),
        experienceYears: Number(editForm.experienceYears) || 0,
        joiningDate: editForm.joiningDate,
        salaryMonthly: Number(editForm.salaryMonthly) || 0,
        employmentType: editForm.employmentType,
        status: editForm.status
      });
      await openTeacherProfile(selectedTeacher.id, 'profile');
      await loadTeachers();
      onDataMutated?.();
      setFeedback({ type: 'success', text: 'Teacher employment profile updated.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to update teacher profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher || !allocClassId || !allocSectionId || !allocSubjectId) return;
    setFeedback(null);
    setIsSaving(true);
    try {
      await eduManageApi.addTeacherAllocation(selectedTeacher.id, {
        classId: allocClassId,
        sectionId: allocSectionId,
        subjectId: allocSubjectId,
        setAsClassTeacher
      });
      setSetAsClassTeacher(false);
      await openTeacherProfile(selectedTeacher.id, 'allocations');
      await loadTeachers();
      setFeedback({ type: 'success', text: 'Subject and class allocation assigned.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to assign allocation.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAllocation = async (allocId: string) => {
    if (!selectedTeacher) return;
    setFeedback(null);
    try {
      await eduManageApi.removeTeacherAllocation(selectedTeacher.id, allocId);
      await openTeacherProfile(selectedTeacher.id, 'allocations');
      await loadTeachers();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to remove allocation.' });
    }
  };

  const handleSaveDailyAttendance = async () => {
    if (attEntries.length === 0) return;
    setFeedback(null);
    setIsSaving(true);
    try {
      await eduManageApi.saveDailyTeacherAttendance(
        attDate,
        attEntries.map((row) => ({
          teacherId: row.teacherId,
          status: row.status,
          checkInTime: row.checkInTime,
          checkOutTime: row.checkOutTime,
          remarks: row.remarks
        }))
      );
      await loadTeachers();
      setFeedback({
        type: 'success',
        text: `Saved faculty attendance register for ${attDate} (${attEntries.length} teachers).`
      });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to save teacher attendance.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43] tracking-tight">Teacher Management</h1>
          <p className="text-xs text-[#486581] mt-0.5">
            Faculty onboarding, employee IDs, subject &amp; class allocations, employment profiles,
            and daily attendance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {canManageAttendance && (
            <div className="flex items-center bg-white border border-[#DCEAF7] rounded-lg p-1 text-xs">
              <button
                onClick={() => setWorkspaceTab('directory')}
                className={`px-3 py-1 rounded-md font-semibold cursor-pointer ${
                  workspaceTab === 'directory'
                    ? 'bg-[#1769AA] text-white'
                    : 'text-[#486581] hover:text-[#102A43]'
                }`}
              >
                Faculty Directory
              </button>
              <button
                onClick={() => setWorkspaceTab('attendance')}
                className={`px-3 py-1 rounded-md font-semibold cursor-pointer ${
                  workspaceTab === 'attendance'
                    ? 'bg-[#1769AA] text-white'
                    : 'text-[#486581] hover:text-[#102A43]'
                }`}
              >
                Teacher Attendance
              </button>
            </div>
          )}

          {permissions.canManageTeachers && (
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1769AA] hover:bg-[#12558C] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Teacher</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
              : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {workspaceTab === 'directory' && (
        <>
          {/* Filter Controls */}
          <div className="bg-white border border-[#DCEAF7] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-[#829AB1] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by teacher name, Employee ID, department, or email..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
              />
            </div>
            <div className="sm:col-span-3">
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-3 flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="resigned">Resigned</option>
              </select>
              <button
                onClick={loadTeachers}
                disabled={loading}
                className="px-3 py-2 rounded-lg border border-[#DCEAF7] hover:bg-[#F5FAFF] text-[#486581] cursor-pointer"
                title="Refresh list"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Faculty Table */}
          <div className="bg-white border border-[#DCEAF7] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5FAFF] border-b border-[#DCEAF7] text-[11px] font-semibold uppercase tracking-wider text-[#627D98]">
                    <th className="py-3 px-4">Emp ID</th>
                    <th className="py-3 px-4">Faculty Member</th>
                    <th className="py-3 px-4">Department &amp; Role</th>
                    <th className="py-3 px-4">Subject &amp; Class Load</th>
                    <th className="py-3 px-4">Today</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF4FB] text-xs">
                  {teachers.map((t) => (
                    <tr key={t.id} className="hover:bg-[#FAFDFE]">
                      <td className="py-3 px-4 font-mono font-semibold text-[#1769AA] whitespace-nowrap">
                        {t.employeeId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#102A43]">{t.fullName}</div>
                        <div className="text-[11px] text-[#627D98]">
                          {t.qualification || t.email} · {t.experienceYears} yrs exp
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#102A43]">{t.department}</div>
                        <div className="text-[11px] text-[#627D98]">{t.designation}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[#334E68] font-medium tabular-nums">
                          {t.allocationsCount} subject{t.allocationsCount === 1 ? '' : 's'} assigned
                        </div>
                        {t.homeroomSections.length > 0 && (
                          <div className="text-[11px] text-[#16A085]">
                            Class Teacher:{' '}
                            {t.homeroomSections
                              .map((hr) => `${hr.className}-${hr.sectionName}`)
                              .join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 capitalize">
                        {t.todayAttendanceStatus ? (
                          <span
                            className={`font-semibold ${
                              t.todayAttendanceStatus === 'present'
                                ? 'text-[#16A085]'
                                : t.todayAttendanceStatus === 'late'
                                ? 'text-[#D97706]'
                                : 'text-[#DC2626]'
                            }`}
                          >
                            {t.todayAttendanceStatus.replace(/_/g, ' ')}
                          </span>
                        ) : (
                          <span className="text-[#829AB1]">Unmarked</span>
                        )}
                      </td>
                      <td className="py-3 px-4 capitalize">
                        <span
                          className={`font-semibold ${
                            t.status === 'active'
                              ? 'text-[#16A085]'
                              : t.status === 'on_leave'
                              ? 'text-[#D97706]'
                              : 'text-[#DC2626]'
                          }`}
                        >
                          {t.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => openTeacherProfile(t.id, 'profile')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#CBDCEB] hover:border-[#1769AA] text-[#1769AA] font-semibold text-xs cursor-pointer"
                        >
                          <span>Manage</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && teachers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-[#627D98]">
                        No faculty records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Daily Teacher Attendance Tab */}
      {workspaceTab === 'attendance' && canManageAttendance && (
        <div className="bg-white border border-[#DCEAF7] rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EDF4FB] pb-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-[#16A085]" />
              <div>
                <h2 className="text-sm font-bold text-[#102A43]">Daily Faculty Attendance Register</h2>
                <p className="text-xs text-[#627D98]">
                  Mark attendance, check-in times, and remarks for active teachers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <input
                type="date"
                value={attDate}
                onChange={(e) => setAttDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[#CBDCEB] text-xs"
              />
              <button
                onClick={handleSaveDailyAttendance}
                disabled={isSaving || loadingAtt}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1769AA] hover:bg-[#12558C] text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Register'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F5FAFF] border-b border-[#DCEAF7] text-[11px] font-semibold uppercase tracking-wider text-[#627D98]">
                  <th className="py-2.5 px-3">Emp ID</th>
                  <th className="py-2.5 px-3">Teacher</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Check-In</th>
                  <th className="py-2.5 px-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF4FB]">
                {attEntries.map((row, idx) => (
                  <tr key={row.teacherId}>
                    <td className="py-2.5 px-3 font-mono font-semibold text-[#1769AA]">
                      {row.employeeId}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#102A43]">{row.teacherName}</div>
                      <div className="text-[11px] text-[#627D98]">{row.department}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={row.status}
                        onChange={(e) => {
                          const next = [...attEntries];
                          next[idx] = {
                            ...row,
                            status: e.target.value as TeacherAttendanceRecord['status']
                          };
                          setAttEntries(next);
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-[#CBDCEB] bg-white text-xs"
                      >
                        <option value="present">Present</option>
                        <option value="late">Late</option>
                        <option value="half_day">Half Day</option>
                        <option value="on_leave">On Leave</option>
                        <option value="absent">Absent</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="time"
                        value={row.checkInTime}
                        onChange={(e) => {
                          const next = [...attEntries];
                          next[idx] = { ...row, checkInTime: e.target.value };
                          setAttEntries(next);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-[#CBDCEB] text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={row.remarks}
                        onChange={(e) => {
                          const next = [...attEntries];
                          next[idx] = { ...row, remarks: e.target.value };
                          setAttEntries(next);
                        }}
                        placeholder="Optional note"
                        className="w-full px-2.5 py-1 rounded-lg border border-[#CBDCEB] text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 bg-[#102A43]/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#DCEAF7] rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-xl my-8">
            <div className="flex items-center justify-between border-b border-[#EDF4FB] pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#1769AA]" />
                <h2 className="text-base font-bold text-[#102A43]">Register New Teacher</h2>
              </div>
              <button onClick={() => setAddOpen(false)} className="p-1 text-[#627D98] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOnboardTeacher} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addForm.fullName}
                    onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">
                    Employee ID (Auto if blank)
                  </label>
                  <input
                    type="text"
                    value={addForm.employeeId}
                    onChange={(e) => setAddForm({ ...addForm, employeeId: e.target.value })}
                    placeholder="EMP-007"
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Department</label>
                  <input
                    type="text"
                    value={addForm.department}
                    onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Designation</label>
                  <input
                    type="text"
                    value={addForm.designation}
                    onChange={(e) => setAddForm({ ...addForm, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Qualification</label>
                  <input
                    type="text"
                    value={addForm.qualification}
                    onChange={(e) => setAddForm({ ...addForm, qualification: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Phone</label>
                  <input
                    type="text"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min={0}
                    value={addForm.experienceYears}
                    onChange={(e) => setAddForm({ ...addForm, experienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">
                    Monthly Salary ({sym})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={addForm.salaryMonthly}
                    onChange={(e) => setAddForm({ ...addForm, salaryMonthly: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Employment Type</label>
                  <select
                    value={addForm.employmentType}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        employmentType: e.target.value as 'full_time' | 'part_time' | 'visiting'
                      })
                    }
                    className="w-full px-2.5 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white"
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="visiting">Visiting Faculty</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={addForm.joiningDate}
                    onChange={(e) => setAddForm({ ...addForm, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Portal Password *</label>
                  <input
                    type="text"
                    required
                    minLength={8}
                    value={addForm.portalPassword}
                    onChange={(e) => setAddForm({ ...addForm, portalPassword: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#EDF4FB]">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#CBDCEB] text-xs font-semibold text-[#486581] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-[#1769AA] hover:bg-[#12558C] text-white text-xs font-semibold cursor-pointer"
                >
                  {isSaving ? 'Registering...' : 'Register Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Profile & Allocation Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 bg-[#102A43]/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#DCEAF7] rounded-2xl w-full max-w-3xl p-6 space-y-5 shadow-xl my-8">
            <div className="flex items-start justify-between gap-3 border-b border-[#EDF4FB] pb-4">
              <div>
                <div className="text-xs font-mono font-semibold text-[#1769AA]">
                  {selectedTeacher.employeeId} · {selectedTeacher.department}
                </div>
                <h2 className="text-xl font-bold text-[#102A43] mt-0.5">{selectedTeacher.fullName}</h2>
                <div className="text-xs text-[#627D98] mt-0.5">
                  {selectedTeacher.designation} · {selectedTeacher.email}
                </div>
              </div>
              <button
                onClick={() => setSelectedTeacher(null)}
                className="p-1.5 text-[#627D98] hover:text-[#102A43] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-[#EDF4FB] pb-3 text-xs">
              {(
                [
                  ['profile', 'Employment Profile'],
                  ['allocations', `Subject & Class Allocations (${selectedTeacher.allocations.length})`],
                  ['attendance', 'Attendance History']
                ] as [TeacherModalTab, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setModalTab(id)}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold cursor-pointer ${
                    modalTab === id
                      ? 'bg-[#1769AA] text-white'
                      : 'bg-[#F5FAFF] text-[#486581] hover:bg-[#E6F2FC]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {modalTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#334E68] mb-1">Full Name</label>
                    <input
                      type="text"
                      disabled={!permissions.canManageTeachers}
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs disabled:bg-[#F5FAFF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#334E68] mb-1">Designation</label>
                    <input
                      type="text"
                      disabled={!permissions.canManageTeachers}
                      value={editForm.designation}
                      onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs disabled:bg-[#F5FAFF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#334E68] mb-1">Department</label>
                    <input
                      type="text"
                      disabled={!permissions.canManageTeachers}
                      value={editForm.department}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs disabled:bg-[#F5FAFF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#334E68] mb-1">Qualification</label>
                    <input
                      type="text"
                      disabled={!permissions.canManageTeachers}
                      value={editForm.qualification}
                      onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs disabled:bg-[#F5FAFF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#334E68] mb-1">Experience (Years)</label>
                    <input
                      type="number"
                      min={0}
                      disabled={!permissions.canManageTeachers}
                      value={editForm.experienceYears}
                      onChange={(e) => setEditForm({ ...editForm, experienceYears: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs tabular-nums disabled:bg-[#F5FAFF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#334E68] mb-1">Employment Type</label>
                    <select
                      disabled={!permissions.canManageTeachers}
                      value={editForm.employmentType}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          employmentType: e.target.value as 'full_time' | 'part_time' | 'visiting'
                        })
                      }
                      className="w-full px-2.5 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white disabled:bg-[#F5FAFF]"
                    >
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="visiting">Visiting</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#334E68] mb-1">Phone</label>
                    <input
                      type="text"
                      disabled={!permissions.canManageTeachers}
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs disabled:bg-[#F5FAFF]"
                    />
                  </div>
                  {selectedTeacher.salaryMonthly !== null && (
                    <div>
                      <label className="block text-xs font-semibold text-[#334E68] mb-1">
                        Monthly Salary ({sym})
                      </label>
                      <input
                        type="number"
                        min={0}
                        disabled={!permissions.canManageTeachers}
                        value={editForm.salaryMonthly}
                        onChange={(e) => setEditForm({ ...editForm, salaryMonthly: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs tabular-nums disabled:bg-[#F5FAFF]"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-[#334E68] mb-1">Employment Status</label>
                    <select
                      disabled={!permissions.canManageTeachers}
                      value={editForm.status}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          status: e.target.value as 'active' | 'on_leave' | 'resigned'
                        })
                      }
                      className="w-full px-2.5 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white disabled:bg-[#F5FAFF]"
                    >
                      <option value="active">Active</option>
                      <option value="on_leave">On Leave</option>
                      <option value="resigned">Resigned</option>
                    </select>
                  </div>
                </div>

                {permissions.canManageTeachers && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 rounded-lg bg-[#1769AA] hover:bg-[#12558C] text-white text-xs font-semibold cursor-pointer"
                    >
                      {isSaving ? 'Saving...' : 'Save Employment Profile'}
                    </button>
                  </div>
                )}
              </form>
            )}

            {modalTab === 'allocations' && (
              <div className="space-y-4">
                <div className="border border-[#DCEAF7] rounded-xl divide-y divide-[#EDF4FB] text-xs">
                  {selectedTeacher.allocations.map((alloc) => (
                    <div key={alloc.id} className="p-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <BookOpenCheck className="w-4 h-4 text-[#1769AA] shrink-0" />
                        <div>
                          <div className="font-semibold text-[#102A43]">
                            {alloc.subjectName} ({alloc.subjectCode})
                          </div>
                          <div className="text-[11px] text-[#627D98]">
                            {alloc.className} · Section {alloc.sectionName} · Session {alloc.sessionName}
                          </div>
                        </div>
                      </div>
                      {canManageAttendance && (
                        <button
                          onClick={() => handleRemoveAllocation(alloc.id)}
                          className="p-1.5 text-[#829AB1] hover:text-[#DC2626] cursor-pointer"
                          title="Remove allocation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {selectedTeacher.allocations.length === 0 && (
                    <div className="p-6 text-center text-xs text-[#627D98]">
                      No subject-class allocations assigned yet.
                    </div>
                  )}
                </div>

                {canManageAttendance && (
                  <form
                    onSubmit={handleAddAllocation}
                    className="bg-[#F5FAFF] border border-[#DCEAF7] rounded-xl p-4 space-y-3"
                  >
                    <div className="text-xs font-bold text-[#102A43]">Assign Subject &amp; Class</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <select
                        value={allocClassId}
                        onChange={(e) => {
                          const cls = classes.find((c) => c.id === e.target.value);
                          setAllocClassId(e.target.value);
                          setAllocSectionId(cls?.sections[0]?.id || '');
                        }}
                        className="px-2.5 py-2 rounded-lg border border-[#CBDCEB] bg-white text-xs"
                      >
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={allocSectionId}
                        onChange={(e) => setAllocSectionId(e.target.value)}
                        className="px-2.5 py-2 rounded-lg border border-[#CBDCEB] bg-white text-xs"
                      >
                        {allocSections.map((sec) => (
                          <option key={sec.id} value={sec.id}>
                            Section {sec.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={allocSubjectId}
                        onChange={(e) => setAllocSubjectId(e.target.value)}
                        className="px-2.5 py-2 rounded-lg border border-[#CBDCEB] bg-white text-xs"
                      >
                        {subjects.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name} ({sub.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="inline-flex items-center gap-2 text-xs text-[#334E68]">
                        <input
                          type="checkbox"
                          checked={setAsClassTeacher}
                          onChange={(e) => setSetAsClassTeacher(e.target.checked)}
                        />
                        <span>Also designate as Class Teacher for this section</span>
                      </label>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-[#1769AA] text-white text-xs font-semibold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Assign</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {modalTab === 'attendance' && (
              <div className="border border-[#DCEAF7] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#F5FAFF] border-b border-[#DCEAF7] text-[11px] text-[#627D98]">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Check-In</th>
                      <th className="py-2.5 px-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDF4FB]">
                    {selectedTeacher.recentAttendance.map((att) => (
                      <tr key={att.id || att.attendanceDate}>
                        <td className="py-2.5 px-3 tabular-nums font-medium text-[#102A43]">
                          {att.attendanceDate}
                        </td>
                        <td className="py-2.5 px-3 capitalize font-semibold text-[#16A085]">
                          {att.status.replace(/_/g, ' ')}
                        </td>
                        <td className="py-2.5 px-3 tabular-nums text-[#486581]">
                          {att.checkInTime || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-[#627D98]">{att.remarks || '—'}</td>
                      </tr>
                    ))}
                    {selectedTeacher.recentAttendance.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-[#627D98]">
                          No attendance history logged yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

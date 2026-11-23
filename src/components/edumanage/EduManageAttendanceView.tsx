import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  CheckCheck,
  CheckCircle2,
  ClipboardCheck,
  History,
  RefreshCw,
  Save,
  X
} from 'lucide-react';
import { eduManageApi } from '../../api/edumanageClient';
import type {
  EduManagePermissions,
  MonthlyAttendanceRow,
  SchoolClass,
  StudentAttendanceEntry,
  StudentAttendanceHistoryItem
} from '../../types/edumanage';

interface EduManageAttendanceViewProps {
  permissions: EduManagePermissions;
  onDataMutated?: () => void;
}

type AttendanceTab = 'daily' | 'monthly';

export const EduManageAttendanceView: React.FC<EduManageAttendanceViewProps> = ({
  permissions,
  onDataMutated
}) => {
  const [activeTab, setActiveTab] = useState<AttendanceTab>('daily');
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 10));
  const [monthStr, setMonthStr] = useState(new Date().toISOString().slice(0, 7));

  const [dailyEntries, setDailyEntries] = useState<StudentAttendanceEntry[]>([]);
  const [monthlyRows, setMonthlyRows] = useState<MonthlyAttendanceRow[]>([]);
  const [monthlyAveragePct, setMonthlyAveragePct] = useState(0);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Student History Modal
  const [historyModal, setHistoryModal] = useState<{
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
  } | null>(null);

  useEffect(() => {
    eduManageApi
      .getClasses()
      .then((clsList) => {
        setClasses(clsList);
        if (clsList.length > 0) {
          setSelectedClassId(clsList[0].id);
          setSelectedSectionId(clsList[0].sections[0]?.id || '');
        }
      })
      .catch(() => {
        // handled below
      });
  }, []);

  const activeSections = useMemo(() => {
    const cls = classes.find((c) => c.id === selectedClassId);
    return cls?.sections || [];
  }, [classes, selectedClassId]);

  const loadDailyRegister = useCallback(async () => {
    if (!selectedClassId || !selectedSectionId) return;
    setLoading(true);
    try {
      const list = await eduManageApi.getStudentDailyAttendance(
        selectedClassId,
        selectedSectionId,
        dateStr
      );
      setDailyEntries(list);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to load daily register.' });
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, selectedSectionId, dateStr]);

  const loadMonthlyReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eduManageApi.getMonthlyAttendanceReport({
        month: monthStr,
        classId: selectedClassId || undefined,
        sectionId: selectedSectionId || undefined
      });
      setMonthlyRows(res.students);
      setMonthlyAveragePct(res.averagePct);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to load monthly report.' });
    } finally {
      setLoading(false);
    }
  }, [monthStr, selectedClassId, selectedSectionId]);

  useEffect(() => {
    if (activeTab === 'daily') {
      loadDailyRegister();
    } else {
      loadMonthlyReport();
    }
  }, [activeTab, loadDailyRegister, loadMonthlyReport]);

  const markAllStatus = (status: StudentAttendanceEntry['status']) => {
    setDailyEntries((prev) => prev.map((row) => ({ ...row, status })));
  };

  const handleSaveDaily = async () => {
    if (!selectedClassId || !selectedSectionId || dailyEntries.length === 0) return;
    setFeedback(null);
    setSaving(true);
    try {
      const res = await eduManageApi.saveStudentDailyAttendance({
        classId: selectedClassId,
        sectionId: selectedSectionId,
        date: dateStr,
        entries: dailyEntries.map((e) => ({
          studentId: e.studentId,
          status: e.status,
          remarks: e.remarks
        }))
      });
      await loadDailyRegister();
      onDataMutated?.();
      setFeedback({
        type: 'success',
        text: `Attendance register saved for ${res.date}: ${res.presentCount}/${res.total} present or late.`
      });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Failed to save attendance.' });
    } finally {
      setSaving(false);
    }
  };

  const openStudentHistory = async (studentId: string) => {
    try {
      const res = await eduManageApi.getStudentAttendanceHistory(studentId);
      setHistoryModal({
        studentName: res.studentName,
        summary: res.summary,
        history: res.history
      });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to load student history.' });
    }
  };

  const dailySummary = useMemo(() => {
    const present = dailyEntries.filter((e) => e.status === 'present').length;
    const late = dailyEntries.filter((e) => e.status === 'late').length;
    const absent = dailyEntries.filter((e) => e.status === 'absent').length;
    const excused = dailyEntries.filter((e) => e.status === 'excused').length;
    return { present, late, absent, excused };
  }, [dailyEntries]);

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43] tracking-tight">Attendance Management</h1>
          <p className="text-xs text-[#486581] mt-0.5">
            Class-wise daily attendance registers, monthly roll-up summaries, and individual student
            attendance history.
          </p>
        </div>

        <div className="flex items-center bg-white border border-[#DCEAF7] rounded-lg p-1 text-xs self-start">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3.5 py-1.5 rounded-md font-semibold cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-[#1769AA] text-white'
                : 'text-[#486581] hover:text-[#102A43]'
            }`}
          >
            Daily Register
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-3.5 py-1.5 rounded-md font-semibold cursor-pointer ${
              activeTab === 'monthly'
                ? 'bg-[#1769AA] text-white'
                : 'text-[#486581] hover:text-[#102A43]'
            }`}
          >
            Monthly Report
          </button>
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
          <button onClick={() => setFeedback(null)} className="cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-[#DCEAF7] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
        <div className="lg:col-span-3">
          <label className="block text-[11px] font-semibold text-[#627D98] mb-1">Class</label>
          <select
            value={selectedClassId}
            onChange={(e) => {
              const cls = classes.find((c) => c.id === e.target.value);
              setSelectedClassId(e.target.value);
              setSelectedSectionId(cls?.sections[0]?.id || '');
            }}
            className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white"
          >
            {activeTab === 'monthly' && <option value="">All Classes</option>}
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-3">
          <label className="block text-[11px] font-semibold text-[#627D98] mb-1">Section</label>
          <select
            value={selectedSectionId}
            disabled={!selectedClassId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white disabled:bg-[#F5FAFF]"
          >
            {activeTab === 'monthly' && <option value="">All Sections</option>}
            {activeSections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                Section {sec.name}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-3">
          <label className="block text-[11px] font-semibold text-[#627D98] mb-1">
            {activeTab === 'daily' ? 'Attendance Date' : 'Report Month'}
          </label>
          {activeTab === 'daily' ? (
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
            />
          ) : (
            <input
              type="month"
              value={monthStr}
              onChange={(e) => setMonthStr(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
            />
          )}
        </div>

        <div className="lg:col-span-3 flex items-center justify-end gap-2">
          <button
            onClick={activeTab === 'daily' ? loadDailyRegister : loadMonthlyReport}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#DCEAF7] hover:bg-[#F5FAFF] text-xs font-semibold text-[#486581] cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>
          {activeTab === 'daily' && permissions.canMarkAttendance && (
            <button
              onClick={handleSaveDaily}
              disabled={saving || dailyEntries.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1769AA] hover:bg-[#12558C] text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Register'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Daily Register */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#DCEAF7] rounded-xl px-4 py-3 text-xs">
            <div className="flex flex-wrap items-center gap-5 tabular-nums">
              <span className="font-semibold text-[#16A085]">Present: {dailySummary.present}</span>
              <span className="font-semibold text-[#D97706]">Late: {dailySummary.late}</span>
              <span className="font-semibold text-[#DC2626]">Absent: {dailySummary.absent}</span>
              <span className="font-semibold text-[#1769AA]">Excused: {dailySummary.excused}</span>
            </div>

            {permissions.canMarkAttendance && dailyEntries.length > 0 && (
              <button
                type="button"
                onClick={() => markAllStatus('present')}
                className="inline-flex items-center gap-1.5 text-[#16A085] font-semibold hover:underline cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark All Present</span>
              </button>
            )}
          </div>

          <div className="bg-white border border-[#DCEAF7] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F5FAFF] border-b border-[#DCEAF7] text-[11px] font-semibold uppercase tracking-wider text-[#627D98]">
                    <th className="py-3 px-4">Roll / Adm #</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Attendance Status</th>
                    <th className="py-3 px-4">Remarks</th>
                    <th className="py-3 px-4 text-right">History</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF4FB]">
                  {dailyEntries.map((row, idx) => (
                    <tr key={row.studentId} className="hover:bg-[#FAFDFE]">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-[#102A43] tabular-nums">
                          Roll {row.rollNumber || '—'}
                        </div>
                        <div className="text-[11px] font-mono text-[#627D98]">
                          {row.admissionNumber}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#102A43]">{row.studentName}</td>
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1.5">
                          {(['present', 'absent', 'late', 'excused'] as const).map((st) => {
                            const active = row.status === st;
                            const activeStyle =
                              st === 'present'
                                ? 'bg-[#16A085] text-white border-[#16A085]'
                                : st === 'absent'
                                ? 'bg-[#DC2626] text-white border-[#DC2626]'
                                : st === 'late'
                                ? 'bg-[#D97706] text-white border-[#D97706]'
                                : 'bg-[#1769AA] text-white border-[#1769AA]';
                            return (
                              <button
                                key={st}
                                type="button"
                                disabled={!permissions.canMarkAttendance}
                                onClick={() => {
                                  const next = [...dailyEntries];
                                  next[idx] = { ...row, status: st };
                                  setDailyEntries(next);
                                }}
                                className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold capitalize transition-colors cursor-pointer ${
                                  active
                                    ? activeStyle
                                    : 'bg-white text-[#486581] border-[#CBDCEB] hover:border-[#1769AA]'
                                }`}
                              >
                                {st}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          disabled={!permissions.canMarkAttendance}
                          value={row.remarks}
                          onChange={(e) => {
                            const next = [...dailyEntries];
                            next[idx] = { ...row, remarks: e.target.value };
                            setDailyEntries(next);
                          }}
                          placeholder="Optional note (e.g., medical leave)"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#CBDCEB] text-xs disabled:bg-[#F5FAFF]"
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openStudentHistory(row.studentId)}
                          className="inline-flex items-center gap-1 text-[#1769AA] font-semibold hover:underline cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>Log</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && dailyEntries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-[#627D98]">
                        No active students enrolled in this class section.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Monthly Report */}
      {activeTab === 'monthly' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#DCEAF7] rounded-xl px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CalendarDays className="w-4.5 h-4.5 text-[#1769AA]" />
              <div>
                <div className="text-sm font-bold text-[#102A43]">
                  Monthly Attendance Summary ({monthStr})
                </div>
                <div className="text-xs text-[#627D98]">
                  Aggregated directly from saved daily registers
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-[#627D98]">Average Attendance</div>
              <div className="text-2xl font-bold text-[#16A085] tabular-nums">
                {monthlyAveragePct}%
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#DCEAF7] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F5FAFF] border-b border-[#DCEAF7] text-[11px] font-semibold uppercase tracking-wider text-[#627D98]">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4 text-right">Present</th>
                    <th className="py-3 px-4 text-right">Late</th>
                    <th className="py-3 px-4 text-right">Absent</th>
                    <th className="py-3 px-4 text-right">Excused</th>
                    <th className="py-3 px-4 text-right">Rate %</th>
                    <th className="py-3 px-4 text-right">History</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF4FB] tabular-nums">
                  {monthlyRows.map((row) => (
                    <tr key={row.studentId} className="hover:bg-[#FAFDFE]">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#102A43]">{row.studentName}</div>
                        <div className="text-[11px] font-mono text-[#627D98]">
                          {row.admissionNumber}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#486581]">
                        {row.className} · Sec {row.sectionName}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-[#16A085]">
                        {row.presentDays}
                      </td>
                      <td className="py-3 px-4 text-right text-[#D97706]">{row.lateDays}</td>
                      <td className="py-3 px-4 text-right text-[#DC2626]">{row.absentDays}</td>
                      <td className="py-3 px-4 text-right text-[#1769AA]">{row.excusedDays}</td>
                      <td className="py-3 px-4 text-right font-bold">
                        <span
                          className={
                            row.totalMarked === 0
                              ? 'text-[#829AB1]'
                              : row.attendancePct >= 75
                              ? 'text-[#16A085]'
                              : 'text-[#DC2626]'
                          }
                        >
                          {row.totalMarked > 0 ? `${row.attendancePct}%` : '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openStudentHistory(row.studentId)}
                          className="text-[#1769AA] font-semibold hover:underline cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Student Attendance History Modal */}
      {historyModal && (
        <div className="fixed inset-0 z-50 bg-[#102A43]/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#DCEAF7] rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-xl my-8">
            <div className="flex items-start justify-between border-b border-[#EDF4FB] pb-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-[#1769AA]" />
                <div>
                  <h2 className="text-base font-bold text-[#102A43]">{historyModal.studentName}</h2>
                  <p className="text-xs text-[#627D98] tabular-nums">
                    Overall {historyModal.summary.percentage}% · {historyModal.summary.presentDays}{' '}
                    present, {historyModal.summary.lateDays} late, {historyModal.summary.absentDays}{' '}
                    absent
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHistoryModal(null)}
                className="p-1 text-[#627D98] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto border border-[#DCEAF7] rounded-xl divide-y divide-[#EDF4FB] text-xs">
              {historyModal.history.map((item) => (
                <div key={item.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold text-[#102A43] tabular-nums">
                      {item.attendanceDate}
                    </div>
                    <div className="text-[11px] text-[#627D98]">
                      {item.className} Sec {item.sectionName}
                      {item.remarks ? ` · ${item.remarks}` : ''}
                    </div>
                  </div>
                  <span
                    className={`font-semibold capitalize ${
                      item.status === 'present'
                        ? 'text-[#16A085]'
                        : item.status === 'absent'
                        ? 'text-[#DC2626]'
                        : item.status === 'late'
                        ? 'text-[#D97706]'
                        : 'text-[#1769AA]'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
              {historyModal.history.length === 0 && (
                <div className="p-6 text-center text-[#627D98]">No attendance records yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

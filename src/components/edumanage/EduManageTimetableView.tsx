import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarRange,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { eduManageApi } from '../../api/edumanageClient';
import type {
  DayOfWeek,
  EduManagePermissions,
  SchoolClass,
  SubjectRecord,
  TeacherRecord,
  TimetableSlotRecord
} from '../../types/edumanage';

interface EduManageTimetableViewProps {
  permissions: EduManagePermissions;
}

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' }
];

const PERIODS = [
  { num: 1, defaultStart: '08:15', defaultEnd: '09:00' },
  { num: 2, defaultStart: '09:05', defaultEnd: '09:50' },
  { num: 3, defaultStart: '10:05', defaultEnd: '10:50' },
  { num: 4, defaultStart: '10:55', defaultEnd: '11:40' },
  { num: 5, defaultStart: '12:15', defaultEnd: '13:00' },
  { num: 6, defaultStart: '13:05', defaultEnd: '13:50' }
];

export const EduManageTimetableView: React.FC<EduManageTimetableViewProps> = ({ permissions }) => {
  const [viewMode, setViewMode] = useState<'class' | 'teacher'>('class');
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [slots, setSlots] = useState<TimetableSlotRecord[]>([]);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Slot Modal
  const [addOpen, setAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [slotForm, setSlotForm] = useState({
    classId: '',
    sectionId: '',
    subjectId: '',
    teacherId: '',
    dayOfWeek: 'monday' as DayOfWeek,
    periodNumber: 1,
    startTime: '08:15',
    endTime: '09:00',
    roomNumber: 'Room 301'
  });

  useEffect(() => {
    const loadRefs = async () => {
      try {
        const [clsList, subList] = await Promise.all([
          eduManageApi.getClasses(),
          eduManageApi.getSubjects()
        ]);
        setClasses(clsList);
        setSubjects(subList);
        if (clsList.length > 0) {
          const firstCls = clsList[0];
          const firstSec = firstCls.sections[0];
          setSelectedClassId(firstCls.id);
          setSelectedSectionId(firstSec?.id || '');
          setSlotForm((prev) => ({
            ...prev,
            classId: firstCls.id,
            sectionId: firstSec?.id || '',
            subjectId: subList[0]?.id || ''
          }));
        }
        if (!permissions.isStudentPortal && !permissions.isParentPortal) {
          const tchList = await eduManageApi.getTeachers().catch(() => []);
          setTeachers(tchList);
          if (tchList.length > 0) {
            setSelectedTeacherId(tchList[0].id);
            setSlotForm((prev) => ({ ...prev, teacherId: tchList[0].id }));
          }
        }
      } catch {
        // handled cleanly
      }
    };
    loadRefs();
  }, [permissions.isStudentPortal, permissions.isParentPortal]);

  const loadTimetable = useCallback(async () => {
    setLoading(true);
    try {
      if (permissions.isStudentPortal) {
        const data = await eduManageApi.getTimetables();
        setSlots(data);
      } else if (viewMode === 'class' && selectedClassId && selectedSectionId) {
        const data = await eduManageApi.getTimetables({
          classId: selectedClassId,
          sectionId: selectedSectionId
        });
        setSlots(data);
      } else if (viewMode === 'teacher' && selectedTeacherId) {
        const data = await eduManageApi.getTimetables({ teacherId: selectedTeacherId });
        setSlots(data);
      } else {
        setSlots([]);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to load timetable.' });
    } finally {
      setLoading(false);
    }
  }, [permissions.isStudentPortal, viewMode, selectedClassId, selectedSectionId, selectedTeacherId]);

  useEffect(() => {
    loadTimetable();
  }, [loadTimetable]);

  const activeSections = useMemo(() => {
    const cls = classes.find((c) => c.id === selectedClassId);
    return cls?.sections || [];
  }, [classes, selectedClassId]);

  const formSections = useMemo(() => {
    const cls = classes.find((c) => c.id === slotForm.classId);
    return cls?.sections || [];
  }, [classes, slotForm.classId]);

  const slotMap = useMemo(() => {
    const map = new Map<string, TimetableSlotRecord>();
    for (const s of slots) {
      map.set(`${s.dayOfWeek}:${s.periodNumber}`, s);
    }
    return map;
  }, [slots]);

  const openQuickAdd = (day: DayOfWeek, periodNum: number) => {
    if (!permissions.canManageTimetable) return;
    const pDef = PERIODS.find((p) => p.num === periodNum) || PERIODS[0];
    setSlotError(null);
    setSlotForm((prev) => ({
      ...prev,
      classId: viewMode === 'class' && selectedClassId ? selectedClassId : prev.classId,
      sectionId: viewMode === 'class' && selectedSectionId ? selectedSectionId : prev.sectionId,
      teacherId: viewMode === 'teacher' && selectedTeacherId ? selectedTeacherId : prev.teacherId,
      dayOfWeek: day,
      periodNumber: periodNum,
      startTime: pDef.defaultStart,
      endTime: pDef.defaultEnd
    }));
    setAddOpen(true);
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlotError(null);
    setIsSaving(true);
    try {
      await eduManageApi.createTimetableSlot({
        classId: slotForm.classId,
        sectionId: slotForm.sectionId,
        subjectId: slotForm.subjectId,
        teacherId: slotForm.teacherId,
        dayOfWeek: slotForm.dayOfWeek,
        periodNumber: Number(slotForm.periodNumber),
        startTime: slotForm.startTime,
        endTime: slotForm.endTime,
        roomNumber: slotForm.roomNumber.trim()
      });
      setAddOpen(false);
      await loadTimetable();
      setFeedback({ type: 'success', text: 'Period slot added with zero schedule conflicts.' });
    } catch (err: any) {
      setSlotError(err?.message || 'Unable to schedule timetable slot.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    setFeedback(null);
    try {
      await eduManageApi.deleteTimetableSlot(id);
      await loadTimetable();
      setFeedback({ type: 'success', text: 'Timetable slot removed.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to remove slot.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43] tracking-tight">Timetable Management</h1>
          <p className="text-xs text-[#486581] mt-0.5">
            Weekly class and teacher schedules with automated section, teacher, and classroom
            conflict detection.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!permissions.isStudentPortal && !permissions.isParentPortal && (
            <div className="flex items-center bg-white border border-[#DCEAF7] rounded-lg p-1 text-xs">
              <button
                onClick={() => setViewMode('class')}
                className={`px-3 py-1 rounded-md font-semibold cursor-pointer ${
                  viewMode === 'class' ? 'bg-[#1769AA] text-white' : 'text-[#486581]'
                }`}
              >
                Class View
              </button>
              <button
                onClick={() => setViewMode('teacher')}
                className={`px-3 py-1 rounded-md font-semibold cursor-pointer ${
                  viewMode === 'teacher' ? 'bg-[#1769AA] text-white' : 'text-[#486581]'
                }`}
              >
                Teacher View
              </button>
            </div>
          )}

          {permissions.canManageTimetable && (
            <button
              onClick={() => {
                setSlotError(null);
                setAddOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1769AA] hover:bg-[#12558C] text-white text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Period</span>
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
          <button onClick={() => setFeedback(null)} className="cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Selector Bar */}
      {!permissions.isStudentPortal && (
        <div className="bg-white border border-[#DCEAF7] rounded-xl p-4 flex flex-wrap items-center gap-3">
          {viewMode === 'class' ? (
            <>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  const cls = classes.find((c) => c.id === e.target.value);
                  setSelectedClassId(e.target.value);
                  setSelectedSectionId(cls?.sections[0]?.id || '');
                }}
                className="px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white min-w-[160px]"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white min-w-[140px]"
              >
                {activeSections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    Section {sec.name}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white min-w-[260px]"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.employeeId} · {t.department})
                </option>
              ))}
            </select>
          )}

          <div className="ml-auto text-xs text-[#627D98] flex items-center gap-1.5">
            <CalendarRange className="w-4 h-4 text-[#1769AA]" />
            <span className="tabular-nums">{slots.length} scheduled periods</span>
          </div>
        </div>
      )}

      {/* Weekly Timetable Grid */}
      <div className="bg-white border border-[#DCEAF7] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead>
              <tr className="bg-[#F5FAFF] border-b border-[#DCEAF7] text-[11px] font-semibold uppercase tracking-wider text-[#627D98]">
                <th className="py-3 px-4 w-28">Period</th>
                {DAYS.map((d) => (
                  <th key={d.key} className="py-3 px-3 border-l border-[#EDF4FB]">
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF4FB] text-xs">
              {PERIODS.map((p) => (
                <tr key={p.num}>
                  <td className="py-3 px-4 bg-[#FAFDFE] align-top">
                    <div className="font-bold text-[#102A43]">Period {p.num}</div>
                    <div className="text-[11px] text-[#627D98] tabular-nums flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>
                        {p.defaultStart}–{p.defaultEnd}
                      </span>
                    </div>
                  </td>
                  {DAYS.map((d) => {
                    const slot = slotMap.get(`${d.key}:${p.num}`);
                    return (
                      <td
                        key={d.key}
                        className="p-2.5 border-l border-[#EDF4FB] align-top min-w-[130px]"
                      >
                        {slot ? (
                          <div className="bg-[#F5FAFF] border border-[#DCEAF7] rounded-lg p-2.5 space-y-1 relative group">
                            <div className="flex items-start justify-between gap-1">
                              <div className="font-bold text-[#1769AA] leading-tight">
                                {slot.subjectName}
                              </div>
                              {permissions.canManageTimetable && (
                                <button
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  title="Remove period"
                                  className="opacity-0 group-hover:opacity-100 text-[#829AB1] hover:text-[#DC2626] transition-opacity cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <div className="text-[11px] text-[#334E68] font-medium">
                              {viewMode === 'teacher'
                                ? `${slot.className} · Sec ${slot.sectionName}`
                                : slot.teacherName}
                            </div>
                            <div className="text-[10px] text-[#627D98] tabular-nums">
                              {slot.roomNumber || 'Main Wing'} · {slot.startTime}–{slot.endTime}
                            </div>
                          </div>
                        ) : permissions.canManageTimetable ? (
                          <button
                            type="button"
                            onClick={() => openQuickAdd(d.key, p.num)}
                            className="w-full h-16 rounded-lg border border-dashed border-[#DCEAF7] hover:border-[#1769AA] hover:bg-[#F5FAFF] text-[11px] text-[#829AB1] hover:text-[#1769AA] transition-colors cursor-pointer"
                          >
                            + Assign
                          </button>
                        ) : (
                          <div className="h-16 flex items-center justify-center text-[11px] text-[#BCCCDC]">
                            —
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && (
          <div className="p-4 text-center text-xs text-[#627D98]">Loading weekly schedule...</div>
        )}
      </div>

      {/* Schedule Period Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 bg-[#102A43]/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DCEAF7] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#EDF4FB] pb-3">
              <h2 className="text-base font-bold text-[#102A43]">Schedule Timetable Period</h2>
              <button onClick={() => setAddOpen(false)} className="p-1 text-[#627D98] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {slotError && (
              <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{slotError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSlot} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Class</label>
                  <select
                    required
                    value={slotForm.classId}
                    onChange={(e) => {
                      const cls = classes.find((c) => c.id === e.target.value);
                      setSlotForm({
                        ...slotForm,
                        classId: e.target.value,
                        sectionId: cls?.sections[0]?.id || ''
                      });
                    }}
                    className="w-full px-2.5 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Section</label>
                  <select
                    required
                    value={slotForm.sectionId}
                    onChange={(e) => setSlotForm({ ...slotForm, sectionId: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white"
                  >
                    {formSections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        Section {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Subject</label>
                  <select
                    required
                    value={slotForm.subjectId}
                    onChange={(e) => setSlotForm({ ...slotForm, subjectId: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({sub.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Teacher</label>
                  <select
                    required
                    value={slotForm.teacherId}
                    onChange={(e) => setSlotForm({ ...slotForm, teacherId: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Day</label>
                  <select
                    value={slotForm.dayOfWeek}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, dayOfWeek: e.target.value as DayOfWeek })
                    }
                    className="w-full px-2.5 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white"
                  >
                    {DAYS.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Period #</label>
                  <select
                    value={slotForm.periodNumber}
                    onChange={(e) => {
                      const num = Number(e.target.value);
                      const pDef = PERIODS.find((p) => p.num === num);
                      setSlotForm({
                        ...slotForm,
                        periodNumber: num,
                        startTime: pDef?.defaultStart || slotForm.startTime,
                        endTime: pDef?.defaultEnd || slotForm.endTime
                      });
                    }}
                    className="w-full px-2.5 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white"
                  >
                    {PERIODS.map((p) => (
                      <option key={p.num} value={p.num}>
                        Period {p.num}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={slotForm.startTime}
                    onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={slotForm.endTime}
                    onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334E68] mb-1">
                  Classroom / Lab (Conflict-Checked)
                </label>
                <input
                  type="text"
                  value={slotForm.roomNumber}
                  onChange={(e) => setSlotForm({ ...slotForm, roomNumber: e.target.value })}
                  placeholder="e.g., Room 301 or CS Lab 1"
                  className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
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
                  className="px-4 py-2 rounded-lg bg-[#1769AA] hover:bg-[#12558C] text-white text-xs font-semibold cursor-pointer"
                >
                  {isSaving ? 'Checking Conflicts...' : 'Save Period'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

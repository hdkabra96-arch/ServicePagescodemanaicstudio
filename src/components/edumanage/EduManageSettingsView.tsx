import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BookMarked,
  Building2,
  CalendarRange,
  CheckCircle2,
  Plus,
  RotateCcw,
  Save,
  Trash2
} from 'lucide-react';
import { eduManageApi } from '../../api/edumanageClient';
import type {
  AcademicSession,
  EduManagePermissions,
  SchoolClass,
  SchoolSettings,
  SubjectRecord
} from '../../types/edumanage';

interface EduManageSettingsViewProps {
  school: SchoolSettings;
  permissions: EduManagePermissions;
  onSchoolUpdated: (updated: SchoolSettings) => void;
  onDemoResetCompleted: () => Promise<void>;
}

export const EduManageSettingsView: React.FC<EduManageSettingsViewProps> = ({
  school,
  permissions,
  onSchoolUpdated,
  onDemoResetCompleted
}) => {
  const [form, setForm] = useState<SchoolSettings>(school);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Add Session form
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionStart, setNewSessionStart] = useState('2027-04-01');
  const [newSessionEnd, setNewSessionEnd] = useState('2028-03-31');

  // Add Class form
  const [newClassName, setNewClassName] = useState('');
  const [newClassOrder, setNewClassOrder] = useState(11);
  const [newClassStream, setNewClassStream] = useState('General');
  const [newClassSection, setNewClassSection] = useState('A');
  const [newClassRoom, setNewClassRoom] = useState('');

  // Add Section inline
  const [addingSectionForClass, setAddingSectionForClass] = useState<string | null>(null);
  const [sectionNameInput, setSectionNameInput] = useState('B');
  const [sectionRoomInput, setSectionRoomInput] = useState('');

  // Add Subject form
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubDept, setNewSubDept] = useState('Core');
  const [newSubType, setNewSubType] = useState<'theory' | 'practical' | 'elective'>('theory');

  // Transactional Demo Reset confirmation (inline — never window.confirm)
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [isResettingDemo, setIsResettingDemo] = useState(false);

  useEffect(() => {
    setForm(school);
  }, [school]);

  const loadStructure = async () => {
    setLoadingLists(true);
    try {
      const [sessList, classList, subList] = await Promise.all([
        eduManageApi.getSessions(),
        eduManageApi.getClasses(),
        eduManageApi.getSubjects()
      ]);
      setSessions(sessList);
      setClasses(classList);
      setSubjects(subList);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Failed to load academic setup.' });
    } finally {
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    loadStructure();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSavingProfile(true);
    try {
      const updated = await eduManageApi.updateSettings({
        schoolName: form.schoolName,
        boardAffiliation: form.boardAffiliation,
        affiliationCode: form.affiliationCode,
        logoUrl: form.logoUrl,
        address: form.address,
        city: form.city,
        phone: form.phone,
        email: form.email,
        website: form.website,
        receiptPrefix: form.receiptPrefix,
        finePerDay: Number(form.finePerDay)
      });
      onSchoolUpdated(updated);
      setFeedback({ type: 'success', text: 'School profile and academic configuration saved.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to save school settings.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;
    setFeedback(null);
    try {
      await eduManageApi.createSession({
        name: newSessionName.trim(),
        startDate: newSessionStart,
        endDate: newSessionEnd,
        isCurrent: false
      });
      setNewSessionName('');
      await loadStructure();
      setFeedback({ type: 'success', text: 'Academic session added.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to create session.' });
    }
  };

  const handleActivateSession = async (id: string) => {
    setFeedback(null);
    try {
      await eduManageApi.activateSession(id);
      await loadStructure();
      setFeedback({ type: 'success', text: 'Active academic session updated.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Failed to switch session.' });
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    setFeedback(null);
    try {
      await eduManageApi.createClass({
        name: newClassName.trim(),
        numericOrder: Number(newClassOrder) || 1,
        stream: newClassStream,
        defaultSection: newClassSection.trim() || 'A',
        roomNumber: newClassRoom.trim()
      });
      setNewClassName('');
      setNewClassRoom('');
      await loadStructure();
      setFeedback({ type: 'success', text: 'Class created with initial section.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to add class.' });
    }
  };

  const handleAddSection = async (classId: string) => {
    if (!sectionNameInput.trim()) return;
    setFeedback(null);
    try {
      await eduManageApi.addSection(classId, {
        name: sectionNameInput.trim().toUpperCase(),
        roomNumber: sectionRoomInput.trim()
      });
      setAddingSectionForClass(null);
      setSectionNameInput('B');
      setSectionRoomInput('');
      await loadStructure();
      setFeedback({ type: 'success', text: 'Section added to class.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to add section.' });
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCode.trim() || !newSubName.trim()) return;
    setFeedback(null);
    try {
      await eduManageApi.createSubject({
        code: newSubCode.trim().toUpperCase(),
        name: newSubName.trim(),
        department: newSubDept.trim() || 'Core',
        subjectType: newSubType
      });
      setNewSubCode('');
      setNewSubName('');
      await loadStructure();
      setFeedback({ type: 'success', text: 'Subject registered in curriculum.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to add subject.' });
    }
  };

  const handleDeleteSubject = async (id: string) => {
    setFeedback(null);
    try {
      await eduManageApi.deleteSubject(id);
      await loadStructure();
      setFeedback({ type: 'success', text: 'Subject removed.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Cannot remove linked subject.' });
    }
  };

  const handleConfirmDemoReset = async () => {
    setFeedback(null);
    setIsResettingDemo(true);
    try {
      await onDemoResetCompleted();
      await loadStructure();
      setConfirmResetOpen(false);
      setFeedback({
        type: 'success',
        text: 'Meridian Academy demo records restored cleanly to initial sample state.'
      });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Demo reset failed.' });
    } finally {
      setIsResettingDemo(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#102A43] tracking-tight">School Settings</h1>
        <p className="text-xs text-[#486581] mt-0.5">
          Institutional profile, academic sessions, classes &amp; sections, curriculum subjects,
          grading scale, and demo data management.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
              : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* 1. Institutional Profile Form */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-white border border-[#DCEAF7] rounded-xl p-6 space-y-5"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#EDF4FB] pb-4">
          <div>
            <h2 className="text-sm font-bold text-[#102A43]">Institution Profile &amp; Policies</h2>
            <p className="text-xs text-[#627D98] mt-0.5">
              Printed on report cards, fee receipts, and parent circulars
            </p>
          </div>
          {permissions.canManageSettings && (
            <button
              type="submit"
              disabled={isSavingProfile}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1769AA] hover:bg-[#12558C] text-white text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingProfile ? 'Saving...' : 'Save Changes'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#334E68] mb-1">School Name</label>
            <input
              type="text"
              required
              disabled={!permissions.canManageSettings}
              value={form.schoolName}
              onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-sm disabled:bg-[#F5FAFF]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#334E68] mb-1">Board Affiliation</label>
            <input
              type="text"
              disabled={!permissions.canManageSettings}
              value={form.boardAffiliation}
              onChange={(e) => setForm({ ...form, boardAffiliation: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-sm disabled:bg-[#F5FAFF]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#334E68] mb-1">Affiliation Code</label>
            <input
              type="text"
              disabled={!permissions.canManageSettings}
              value={form.affiliationCode}
              onChange={(e) => setForm({ ...form, affiliationCode: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-sm disabled:bg-[#F5FAFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#334E68] mb-1">Contact Email</label>
            <input
              type="email"
              disabled={!permissions.canManageSettings}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-sm disabled:bg-[#F5FAFF]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#334E68] mb-1">Phone Number</label>
            <input
              type="text"
              disabled={!permissions.canManageSettings}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-sm disabled:bg-[#F5FAFF]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#334E68] mb-1">City</label>
            <input
              type="text"
              disabled={!permissions.canManageSettings}
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-sm disabled:bg-[#F5FAFF]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#334E68] mb-1">Campus Address</label>
            <input
              type="text"
              disabled={!permissions.canManageSettings}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-sm disabled:bg-[#F5FAFF]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#334E68] mb-1">Website URL</label>
            <input
              type="text"
              disabled={!permissions.canManageSettings}
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://school.edu"
              className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-sm disabled:bg-[#F5FAFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#334E68] mb-1">Receipt Prefix</label>
            <input
              type="text"
              disabled={!permissions.canManageSettings}
              value={form.receiptPrefix}
              onChange={(e) => setForm({ ...form, receiptPrefix: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-sm font-mono disabled:bg-[#F5FAFF]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#334E68] mb-1">
              Library Overdue Fine / Day ({form.currencySymbol})
            </label>
            <input
              type="number"
              min={0}
              max={500}
              disabled={!permissions.canManageSettings}
              value={form.finePerDay}
              onChange={(e) => setForm({ ...form, finePerDay: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-sm tabular-nums disabled:bg-[#F5FAFF]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#334E68] mb-1">School Logo URL (Optional)</label>
            <input
              type="text"
              disabled={!permissions.canManageSettings}
              value={form.logoUrl}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-sm disabled:bg-[#F5FAFF]"
            />
          </div>
        </div>

        {/* Grading Scale Table */}
        <div className="pt-4 border-t border-[#EDF4FB]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#627D98] mb-2.5">
            Configured Examination Grading Scale
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {form.gradingScale.map((rule) => (
              <div
                key={rule.grade}
                className="bg-[#F5FAFF] border border-[#DCEAF7] rounded-lg px-3 py-2 text-center"
              >
                <div className="text-sm font-bold text-[#1769AA]">{rule.grade}</div>
                <div className="text-[11px] font-medium text-[#334E68] tabular-nums">
                  {rule.minPct}%–{rule.maxPct}%
                </div>
                <div className="text-[10px] text-[#627D98] truncate">{rule.remark}</div>
              </div>
            ))}
          </div>
        </div>
      </form>

      {/* 2. Academic Sessions + Classes & Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Academic Sessions */}
        <div className="lg:col-span-5 bg-white border border-[#DCEAF7] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <CalendarRange className="w-4 h-4 text-[#1769AA]" />
            <h2 className="text-sm font-bold text-[#102A43]">Academic Sessions</h2>
          </div>

          <div className="divide-y divide-[#EDF4FB]">
            {sessions.map((s) => (
              <div key={s.id} className="py-2.5 flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-[#102A43] flex items-center gap-2">
                    <span>{s.name}</span>
                    {s.isCurrent && (
                      <span className="text-[11px] font-bold text-[#16A085]">Active</span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#627D98] tabular-nums">
                    {s.startDate} to {s.endDate}
                  </div>
                </div>
                {!s.isCurrent && permissions.canManageSettings && (
                  <button
                    type="button"
                    onClick={() => handleActivateSession(s.id)}
                    className="px-2.5 py-1 rounded-lg border border-[#CBDCEB] hover:border-[#1769AA] text-[11px] font-semibold text-[#1769AA] cursor-pointer"
                  >
                    Set Active
                  </button>
                )}
              </div>
            ))}
          </div>

          {permissions.canManageSettings && (
            <form onSubmit={handleCreateSession} className="pt-3 border-t border-[#EDF4FB] space-y-2.5">
              <div className="text-xs font-semibold text-[#334E68]">Add New Session</div>
              <input
                type="text"
                required
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="e.g., 2027-28"
                className="w-full px-3 py-1.5 rounded-lg border border-[#CBDCEB] text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={newSessionStart}
                  onChange={(e) => setNewSessionStart(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#CBDCEB] text-xs"
                />
                <input
                  type="date"
                  value={newSessionEnd}
                  onChange={(e) => setNewSessionEnd(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#CBDCEB] text-xs"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1769AA] text-white text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Session</span>
              </button>
            </form>
          )}
        </div>

        {/* Classes & Sections */}
        <div className="lg:col-span-7 bg-white border border-[#DCEAF7] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1769AA]" />
              <h2 className="text-sm font-bold text-[#102A43]">Classes &amp; Sections</h2>
            </div>
            <span className="text-xs text-[#627D98] tabular-nums">
              {loadingLists ? 'Loading...' : `${classes.length} classes`}
            </span>
          </div>

          <div className="divide-y divide-[#EDF4FB]">
            {classes.map((cls) => (
              <div key={cls.id} className="py-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-sm font-semibold text-[#102A43]">{cls.name}</span>
                    <span className="text-xs text-[#627D98] ml-2">
                      {cls.stream} · {cls.studentCount || 0} students
                    </span>
                  </div>
                  {permissions.canManageSettings && (
                    <button
                      type="button"
                      onClick={() =>
                        setAddingSectionForClass(addingSectionForClass === cls.id ? null : cls.id)
                      }
                      className="text-xs font-semibold text-[#1769AA] hover:underline cursor-pointer"
                    >
                      + Add Section
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-[#334E68]">
                  {cls.sections.map((sec) => (
                    <span
                      key={sec.id}
                      className="px-2.5 py-1 rounded-md bg-[#F5FAFF] border border-[#DCEAF7] tabular-nums"
                    >
                      Sec {sec.name}
                      {sec.roomNumber ? ` (${sec.roomNumber})` : ''} · {sec.studentCount || 0}/
                      {sec.capacity}
                    </span>
                  ))}
                </div>

                {addingSectionForClass === cls.id && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={sectionNameInput}
                      onChange={(e) => setSectionNameInput(e.target.value)}
                      placeholder="Section (e.g., B)"
                      className="w-28 px-2.5 py-1 rounded-lg border border-[#CBDCEB] text-xs"
                    />
                    <input
                      type="text"
                      value={sectionRoomInput}
                      onChange={(e) => setSectionRoomInput(e.target.value)}
                      placeholder="Room (e.g., R-204)"
                      className="w-32 px-2.5 py-1 rounded-lg border border-[#CBDCEB] text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSection(cls.id)}
                      className="px-3 py-1 rounded-lg bg-[#16A085] text-white text-xs font-semibold cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {permissions.canManageSettings && (
            <form
              onSubmit={handleCreateClass}
              className="pt-3 border-t border-[#EDF4FB] grid grid-cols-2 sm:grid-cols-5 gap-2"
            >
              <input
                type="text"
                required
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Class name (Class 11)"
                className="col-span-2 px-3 py-1.5 rounded-lg border border-[#CBDCEB] text-xs"
              />
              <input
                type="number"
                min={1}
                value={newClassOrder}
                onChange={(e) => setNewClassOrder(Number(e.target.value))}
                placeholder="Order"
                className="px-2.5 py-1.5 rounded-lg border border-[#CBDCEB] text-xs tabular-nums"
              />
              <input
                type="text"
                value={newClassStream}
                onChange={(e) => setNewClassStream(e.target.value)}
                placeholder="Stream"
                className="px-2.5 py-1.5 rounded-lg border border-[#CBDCEB] text-xs"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[#1769AA] text-white text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 3. Curriculum Subjects */}
      <div className="bg-white border border-[#DCEAF7] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-[#16A085]" />
            <h2 className="text-sm font-bold text-[#102A43]">Curriculum Subjects</h2>
          </div>
          <span className="text-xs text-[#627D98] tabular-nums">{subjects.length} subjects</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E6F0FA] text-[11px] font-semibold uppercase tracking-wider text-[#627D98]">
                <th className="py-2 pr-3">Code</th>
                <th className="py-2 px-3">Subject Name</th>
                <th className="py-2 px-3">Department</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3 text-right">Max / Pass</th>
                {permissions.canManageSettings && <th className="py-2 pl-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF4FB] text-xs">
              {subjects.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#FAFDFE]">
                  <td className="py-2.5 pr-3 font-mono font-semibold text-[#1769AA]">{sub.code}</td>
                  <td className="py-2.5 px-3 font-semibold text-[#102A43]">{sub.name}</td>
                  <td className="py-2.5 px-3 text-[#486581]">{sub.department}</td>
                  <td className="py-2.5 px-3 capitalize text-[#486581]">{sub.subjectType}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-[#334E68]">
                    {sub.maxMarksDefault} / {sub.passMarksDefault}
                  </td>
                  {permissions.canManageSettings && (
                    <td className="py-2.5 pl-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteSubject(sub.id)}
                        className="p-1 text-[#829AB1] hover:text-[#DC2626] cursor-pointer"
                        title="Remove subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {permissions.canManageSettings && (
          <form
            onSubmit={handleCreateSubject}
            className="pt-3 border-t border-[#EDF4FB] grid grid-cols-1 sm:grid-cols-5 gap-2.5"
          >
            <input
              type="text"
              required
              value={newSubCode}
              onChange={(e) => setNewSubCode(e.target.value)}
              placeholder="Code (e.g., BIO101)"
              className="px-3 py-1.5 rounded-lg border border-[#CBDCEB] text-xs font-mono"
            />
            <input
              type="text"
              required
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              placeholder="Subject name"
              className="px-3 py-1.5 rounded-lg border border-[#CBDCEB] text-xs"
            />
            <input
              type="text"
              value={newSubDept}
              onChange={(e) => setNewSubDept(e.target.value)}
              placeholder="Department"
              className="px-3 py-1.5 rounded-lg border border-[#CBDCEB] text-xs"
            />
            <select
              value={newSubType}
              onChange={(e) => setNewSubType(e.target.value as 'theory' | 'practical' | 'elective')}
              className="px-2.5 py-1.5 rounded-lg border border-[#CBDCEB] text-xs bg-white"
            >
              <option value="theory">Theory</option>
              <option value="practical">Practical</option>
              <option value="elective">Elective</option>
            </select>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1769AA] text-white text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Subject</span>
            </button>
          </form>
        )}
      </div>

      {/* 4. Transactional Demo Data Reset (Super Admin & School Admin only) */}
      {permissions.canResetDemo && (
        <div className="bg-white border border-[#DCEAF7] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <h2 className="text-sm font-bold text-[#102A43]">Reset Demonstration Environment</h2>
            <p className="text-xs text-[#486581] leading-relaxed">
              Restore Meridian Academy&apos;s sample students, teachers, attendance registers, exams,
              fees, library circulation, and transport routes back to a clean presentation state.
              Your active admin session remains signed in.
            </p>
          </div>

          {!confirmResetOpen ? (
            <button
              type="button"
              onClick={() => setConfirmResetOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA] text-xs font-semibold shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Demo Data</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                disabled={isResettingDemo}
                className="px-3.5 py-2 rounded-lg border border-[#CBDCEB] text-xs font-semibold text-[#486581] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDemoReset}
                disabled={isResettingDemo}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResettingDemo ? 'animate-spin' : ''}`} />
                <span>{isResettingDemo ? 'Restoring...' : 'Confirm Reset'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

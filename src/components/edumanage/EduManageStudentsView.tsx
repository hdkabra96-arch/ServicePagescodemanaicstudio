import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  FileCheck2,
  FileText,
  GraduationCap,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import { eduManageApi } from '../../api/edumanageClient';
import type {
  AcademicSession,
  EduManagePermissions,
  ParentSummary,
  SchoolClass,
  StudentDetailRecord,
  StudentDocumentRecord,
  StudentRecord
} from '../../types/edumanage';

interface EduManageStudentsViewProps {
  permissions: EduManagePermissions;
  onDataMutated?: () => void;
}

type DetailTab = 'profile' | 'documents' | 'history' | 'actions';

export const EduManageStudentsView: React.FC<EduManageStudentsViewProps> = ({
  permissions,
  onDataMutated
}) => {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [parents, setParents] = useState<ParentSummary[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClassId, setFilterClassId] = useState('');
  const [filterSectionId, setFilterSectionId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Registration Modal
  const [admitOpen, setAdmitOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parentMode, setParentMode] = useState<'existing' | 'new'>('new');
  const [admitForm, setAdmitForm] = useState({
    firstName: '',
    lastName: '',
    admissionNumber: '',
    rollNumber: '',
    dateOfBirth: '2012-06-15',
    gender: 'female' as 'male' | 'female' | 'other',
    bloodGroup: 'O+',
    phone: '',
    email: '',
    address: '',
    classId: '',
    sectionId: '',
    admissionDate: new Date().toISOString().slice(0, 10),
    portalPassword: 'EduStudent@2026!',
    parentId: '',
    guardianName: '',
    guardianRelation: 'father' as 'father' | 'mother' | 'guardian',
    guardianPhone: '',
    guardianEmail: '',
    guardianOccupation: ''
  });

  // Student Detail Modal
  const [selectedStudent, setSelectedStudent] = useState<StudentDetailRecord | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('profile');
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Edit Profile form
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    rollNumber: '',
    dateOfBirth: '',
    gender: 'other' as 'male' | 'female' | 'other',
    bloodGroup: '',
    phone: '',
    address: '',
    classId: '',
    sectionId: '',
    parentId: ''
  });

  // Document form
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState<StudentDocumentRecord['category']>('birth_certificate');
  const [docUrl, setDocUrl] = useState('');
  const [docVerified, setDocVerified] = useState(true);

  // Promotion form
  const [promoteClassId, setPromoteClassId] = useState('');
  const [promoteSectionId, setPromoteSectionId] = useState('');
  const [promoteSessionId, setPromoteSessionId] = useState('');
  const [promoteRoll, setPromoteRoll] = useState('');
  const [promoteRemarks, setPromoteRemarks] = useState('Promoted on academic merit');

  // Transfer Certificate form
  const [transferReason, setTransferReason] = useState('');
  const [transferDestination, setTransferDestination] = useState('');
  const [transferTcNo, setTransferTcNo] = useState('');
  const [confirmTransferOpen, setConfirmTransferOpen] = useState(false);

  const loadMeta = useCallback(async () => {
    try {
      const [clsList, sessList] = await Promise.all([
        eduManageApi.getClasses(),
        eduManageApi.getSessions()
      ]);
      setClasses(clsList);
      setSessions(sessList);
      if (clsList.length > 0 && !admitForm.classId) {
        const firstCls = clsList[0];
        const firstSec = firstCls.sections[0];
        setAdmitForm((prev) => ({
          ...prev,
          classId: prev.classId || firstCls.id,
          sectionId: prev.sectionId || firstSec?.id || ''
        }));
      }
      if (permissions.canManageStudents || permissions.canPromoteStudents) {
        const pList = await eduManageApi.getParents().catch(() => []);
        setParents(pList);
      }
    } catch {
      // handled in list load
    }
  }, [permissions.canManageStudents, permissions.canPromoteStudents]);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const list = await eduManageApi.getStudents({
        q: searchQuery.trim() || undefined,
        classId: filterClassId || undefined,
        sectionId: filterSectionId || undefined,
        status: filterStatus || undefined
      });
      setStudents(list);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Failed to load student directory.' });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterClassId, filterSectionId, filterStatus]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStudents();
    }, 150);
    return () => clearTimeout(timer);
  }, [loadStudents]);

  const filterSections = useMemo(() => {
    const cls = classes.find((c) => c.id === filterClassId);
    return cls?.sections || [];
  }, [classes, filterClassId]);

  const admitSections = useMemo(() => {
    const cls = classes.find((c) => c.id === admitForm.classId);
    return cls?.sections || [];
  }, [classes, admitForm.classId]);

  const editSections = useMemo(() => {
    const cls = classes.find((c) => c.id === editForm.classId);
    return cls?.sections || [];
  }, [classes, editForm.classId]);

  const promoteSections = useMemo(() => {
    const cls = classes.find((c) => c.id === promoteClassId);
    return cls?.sections || [];
  }, [classes, promoteClassId]);

  const openStudentProfile = async (studentId: string, initialTab: DetailTab = 'profile') => {
    setLoadingDetail(true);
    setDetailTab(initialTab);
    setConfirmTransferOpen(false);
    try {
      const detail = await eduManageApi.getStudentDetail(studentId);
      setSelectedStudent(detail);
      setEditForm({
        firstName: detail.firstName,
        lastName: detail.lastName,
        rollNumber: detail.rollNumber,
        dateOfBirth: detail.dateOfBirth,
        gender: detail.gender,
        bloodGroup: detail.bloodGroup,
        phone: detail.phone,
        address: detail.address,
        classId: detail.currentClassId,
        sectionId: detail.currentSectionId,
        parentId: detail.parentId || ''
      });
      setPromoteClassId(detail.currentClassId);
      setPromoteSectionId(detail.currentSectionId);
      setPromoteRoll(detail.rollNumber);
      const currentSess = sessions.find((s) => s.isCurrent) || sessions[0];
      setPromoteSessionId(currentSess?.id || '');
      setTransferReason('');
      setTransferDestination('');
      setTransferTcNo(`TC-${new Date().getFullYear()}-${detail.admissionNumber}`);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to load student profile.' });
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAdmitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSaving(true);
    try {
      const created = await eduManageApi.createStudent({
        firstName: admitForm.firstName.trim(),
        lastName: admitForm.lastName.trim(),
        admissionNumber: admitForm.admissionNumber.trim() || undefined,
        rollNumber: admitForm.rollNumber.trim() || undefined,
        dateOfBirth: admitForm.dateOfBirth,
        gender: admitForm.gender,
        bloodGroup: admitForm.bloodGroup,
        phone: admitForm.phone.trim(),
        email: admitForm.email.trim() || undefined,
        address: admitForm.address.trim(),
        classId: admitForm.classId,
        sectionId: admitForm.sectionId,
        admissionDate: admitForm.admissionDate,
        portalPassword: admitForm.portalPassword,
        parentId: parentMode === 'existing' ? admitForm.parentId || null : null,
        newParent:
          parentMode === 'new' && admitForm.guardianName.trim()
            ? {
                guardianName: admitForm.guardianName.trim(),
                relation: admitForm.guardianRelation,
                phone: admitForm.guardianPhone.trim() || admitForm.phone.trim() || '9800000000',
                email: admitForm.guardianEmail.trim() || undefined,
                occupation: admitForm.guardianOccupation.trim(),
                address: admitForm.address.trim()
              }
            : undefined
      });
      setAdmitOpen(false);
      setAdmitForm((prev) => ({
        ...prev,
        firstName: '',
        lastName: '',
        admissionNumber: '',
        rollNumber: '',
        phone: '',
        email: '',
        address: '',
        guardianName: '',
        guardianPhone: '',
        guardianEmail: '',
        guardianOccupation: ''
      }));
      await Promise.all([loadStudents(), loadMeta()]);
      onDataMutated?.();
      setFeedback({
        type: 'success',
        text: `Admitted ${created.fullName} (${created.admissionNumber}) into ${created.currentClassName} - Sec ${created.currentSectionName}.`
      });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to admit student.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setFeedback(null);
    setIsSaving(true);
    try {
      const updated = await eduManageApi.updateStudent(selectedStudent.id, {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        rollNumber: editForm.rollNumber.trim(),
        dateOfBirth: editForm.dateOfBirth,
        gender: editForm.gender,
        bloodGroup: editForm.bloodGroup,
        phone: editForm.phone.trim(),
        address: editForm.address.trim(),
        classId: editForm.classId,
        sectionId: editForm.sectionId,
        parentId: editForm.parentId || null
      });
      setSelectedStudent(updated);
      await loadStudents();
      onDataMutated?.();
      setFeedback({ type: 'success', text: `Updated profile for ${updated.fullName}.` });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to update student profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !docName.trim()) return;
    setFeedback(null);
    try {
      await eduManageApi.addStudentDocument(selectedStudent.id, {
        name: docName.trim(),
        category: docCategory,
        url: docUrl.trim(),
        verified: docVerified
      });
      setDocName('');
      setDocUrl('');
      await openStudentProfile(selectedStudent.id, 'documents');
      await loadStudents();
      setFeedback({ type: 'success', text: 'Document saved to student dossier.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to add document.' });
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!selectedStudent) return;
    setFeedback(null);
    try {
      await eduManageApi.deleteStudentDocument(selectedStudent.id, docId);
      await openStudentProfile(selectedStudent.id, 'documents');
      await loadStudents();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to delete document.' });
    }
  };

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setFeedback(null);
    setIsSaving(true);
    try {
      const updated = await eduManageApi.promoteStudent(selectedStudent.id, {
        targetClassId: promoteClassId,
        targetSectionId: promoteSectionId,
        targetSessionId: promoteSessionId || undefined,
        newRollNumber: promoteRoll.trim() || undefined,
        remarks: promoteRemarks.trim()
      });
      setSelectedStudent(updated);
      await loadStudents();
      onDataMutated?.();
      setFeedback({
        type: 'success',
        text: `${updated.fullName} promoted to ${updated.currentClassName} - Sec ${updated.currentSectionName}.`
      });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Promotion failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedStudent || !transferReason.trim()) {
      setFeedback({ type: 'error', text: 'Enter a transfer reason before issuing a Transfer Certificate.' });
      return;
    }
    setFeedback(null);
    setIsSaving(true);
    try {
      const updated = await eduManageApi.transferStudent(selectedStudent.id, {
        reason: transferReason.trim(),
        destinationSchool: transferDestination.trim(),
        tcNumber: transferTcNo.trim()
      });
      setSelectedStudent(updated);
      setConfirmTransferOpen(false);
      await loadStudents();
      onDataMutated?.();
      setFeedback({
        type: 'success',
        text: `Transfer Certificate issued for ${updated.fullName}. Student portal login deactivated.`
      });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Transfer failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  const activeCount = students.filter((s) => s.status === 'active').length;
  const transferredCount = students.filter((s) => s.status === 'transferred').length;

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43] tracking-tight">Student Management</h1>
          <p className="text-xs text-[#486581] mt-0.5">
            Admissions, class &amp; section allocation, guardian mapping, documents, promotions, and
            transfer certificates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadStudents}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-[#F0F7FE] text-[#334E68] border border-[#DCEAF7] text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {permissions.canManageStudents && (
            <button
              onClick={() => setAdmitOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1769AA] hover:bg-[#12558C] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Admit Student</span>
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
          <button
            onClick={() => setFeedback(null)}
            className="text-current opacity-70 hover:opacity-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#DCEAF7] rounded-xl p-4">
          <div className="text-xs font-medium text-[#627D98]">Filtered Students</div>
          <div className="text-2xl font-bold text-[#102A43] tabular-nums mt-1">{students.length}</div>
        </div>
        <div className="bg-white border border-[#DCEAF7] rounded-xl p-4">
          <div className="text-xs font-medium text-[#627D98]">Active Enrollment</div>
          <div className="text-2xl font-bold text-[#16A085] tabular-nums mt-1">{activeCount}</div>
        </div>
        <div className="bg-white border border-[#DCEAF7] rounded-xl p-4">
          <div className="text-xs font-medium text-[#627D98]">Active Classes</div>
          <div className="text-2xl font-bold text-[#1769AA] tabular-nums mt-1">{classes.length}</div>
        </div>
        <div className="bg-white border border-[#DCEAF7] rounded-xl p-4">
          <div className="text-xs font-medium text-[#627D98]">Transferred / TC Issued</div>
          <div className="text-2xl font-bold text-[#486581] tabular-nums mt-1">{transferredCount}</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-[#DCEAF7] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-5 relative">
          <Search className="w-4 h-4 text-[#829AB1] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, admission #, email, or parent..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#CBDCEB] text-xs text-[#102A43] focus:outline-none focus:border-[#1769AA]"
          />
        </div>
        <div className="lg:col-span-3">
          <select
            value={filterClassId}
            onChange={(e) => {
              setFilterClassId(e.target.value);
              setFilterSectionId('');
            }}
            className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white text-[#102A43]"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="lg:col-span-2">
          <select
            value={filterSectionId}
            disabled={!filterClassId}
            onChange={(e) => setFilterSectionId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white text-[#102A43] disabled:bg-[#F5FAFF]"
          >
            <option value="">All Sections</option>
            {filterSections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                Section {sec.name}
              </option>
            ))}
          </select>
        </div>
        <div className="lg:col-span-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white text-[#102A43]"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="promoted">Promoted</option>
            <option value="transferred">Transferred</option>
            <option value="graduated">Graduated</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-[#DCEAF7] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5FAFF] border-b border-[#DCEAF7] text-[11px] font-semibold uppercase tracking-wider text-[#627D98]">
                <th className="py-3 px-4">Admission #</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class &amp; Section</th>
                <th className="py-3 px-4">Parent / Guardian</th>
                <th className="py-3 px-4 text-right">Attendance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF4FB] text-xs">
              {students.map((st) => (
                <tr key={st.id} className="hover:bg-[#FAFDFE]">
                  <td className="py-3 px-4 font-mono font-semibold text-[#1769AA] whitespace-nowrap">
                    {st.admissionNumber}
                    {st.rollNumber && (
                      <div className="text-[11px] font-sans font-normal text-[#627D98]">
                        Roll {st.rollNumber}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#102A43]">{st.fullName}</div>
                    <div className="text-[11px] text-[#627D98]">{st.email}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-[#334E68] font-medium">
                    {st.currentClassName} · Sec {st.currentSectionName}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-[#102A43]">{st.parentName || 'Not linked'}</div>
                    {st.parentPhone && (
                      <div className="text-[11px] text-[#627D98] tabular-nums">{st.parentPhone}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-semibold">
                    {st.attendancePct !== null ? (
                      <span className={st.attendancePct >= 75 ? 'text-[#16A085]' : 'text-[#D97706]'}>
                        {st.attendancePct}%
                      </span>
                    ) : (
                      <span className="text-[#829AB1]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-semibold capitalize ${
                        st.status === 'active'
                          ? 'text-[#16A085]'
                          : st.status === 'transferred'
                          ? 'text-[#DC2626]'
                          : 'text-[#1769AA]'
                      }`}
                    >
                      {st.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => openStudentProfile(st.id, 'profile')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#CBDCEB] hover:border-[#1769AA] text-[#1769AA] font-semibold text-xs cursor-pointer"
                    >
                      <span>Profile</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && students.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#627D98]">
                    No students match the selected search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admit Student Modal */}
      {admitOpen && (
        <div className="fixed inset-0 z-50 bg-[#102A43]/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#DCEAF7] rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-xl my-8">
            <div className="flex items-center justify-between border-b border-[#EDF4FB] pb-3">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-[#1769AA]" />
                <h2 className="text-base font-bold text-[#102A43]">New Student Admission</h2>
              </div>
              <button
                onClick={() => setAdmitOpen(false)}
                className="p-1 text-[#627D98] hover:text-[#102A43] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdmitSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={admitForm.firstName}
                    onChange={(e) => setAdmitForm({ ...admitForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={admitForm.lastName}
                    onChange={(e) => setAdmitForm({ ...admitForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">
                    Admission # (Auto if blank)
                  </label>
                  <input
                    type="text"
                    value={admitForm.admissionNumber}
                    onChange={(e) => setAdmitForm({ ...admitForm, admissionNumber: e.target.value })}
                    placeholder="MA-2026-011"
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Class *</label>
                  <select
                    required
                    value={admitForm.classId}
                    onChange={(e) => {
                      const cls = classes.find((c) => c.id === e.target.value);
                      setAdmitForm({
                        ...admitForm,
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
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Section *</label>
                  <select
                    required
                    value={admitForm.sectionId}
                    onChange={(e) => setAdmitForm({ ...admitForm, sectionId: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white"
                  >
                    {admitSections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        Sec {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={admitForm.rollNumber}
                    onChange={(e) => setAdmitForm({ ...admitForm, rollNumber: e.target.value })}
                    placeholder="11"
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Gender</label>
                  <select
                    value={admitForm.gender}
                    onChange={(e) =>
                      setAdmitForm({ ...admitForm, gender: e.target.value as 'male' | 'female' | 'other' })
                    }
                    className="w-full px-2.5 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={admitForm.dateOfBirth}
                    onChange={(e) => setAdmitForm({ ...admitForm, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Student Email (Optional)</label>
                  <input
                    type="email"
                    value={admitForm.email}
                    onChange={(e) => setAdmitForm({ ...admitForm, email: e.target.value })}
                    placeholder="Auto-generated if blank"
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={admitForm.bloodGroup}
                    onChange={(e) => setAdmitForm({ ...admitForm, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={admitForm.address}
                    onChange={(e) => setAdmitForm({ ...admitForm, address: e.target.value })}
                    placeholder="Street, Locality, City"
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Portal Login Password</label>
                  <input
                    type="text"
                    required
                    minLength={8}
                    value={admitForm.portalPassword}
                    onChange={(e) => setAdmitForm({ ...admitForm, portalPassword: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs font-mono"
                  />
                </div>
              </div>

              {/* Parent / Guardian Linking */}
              <div className="pt-3 border-t border-[#EDF4FB] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#102A43]">
                    <Users className="w-4 h-4 text-[#16A085]" />
                    <span>Parent / Guardian Information</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setParentMode('new')}
                      className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                        parentMode === 'new'
                          ? 'bg-[#1769AA] text-white'
                          : 'bg-[#F5FAFF] text-[#486581]'
                      }`}
                    >
                      New Guardian
                    </button>
                    <button
                      type="button"
                      onClick={() => setParentMode('existing')}
                      className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                        parentMode === 'existing'
                          ? 'bg-[#1769AA] text-white'
                          : 'bg-[#F5FAFF] text-[#486581]'
                      }`}
                    >
                      Link Existing
                    </button>
                  </div>
                </div>

                {parentMode === 'existing' ? (
                  <select
                    value={admitForm.parentId}
                    onChange={(e) => setAdmitForm({ ...admitForm, parentId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white"
                  >
                    <option value="">Select existing parent account...</option>
                    {parents.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.guardianName} ({p.relation}) · {p.phone}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={admitForm.guardianName}
                      onChange={(e) => setAdmitForm({ ...admitForm, guardianName: e.target.value })}
                      placeholder="Guardian Full Name"
                      className="px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                    />
                    <select
                      value={admitForm.guardianRelation}
                      onChange={(e) =>
                        setAdmitForm({
                          ...admitForm,
                          guardianRelation: e.target.value as 'father' | 'mother' | 'guardian'
                        })
                      }
                      className="px-2.5 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white"
                    >
                      <option value="father">Father</option>
                      <option value="mother">Mother</option>
                      <option value="guardian">Guardian</option>
                    </select>
                    <input
                      type="text"
                      value={admitForm.guardianPhone}
                      onChange={(e) => setAdmitForm({ ...admitForm, guardianPhone: e.target.value })}
                      placeholder="Guardian Mobile"
                      className="px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                    />
                    <input
                      type="email"
                      value={admitForm.guardianEmail}
                      onChange={(e) => setAdmitForm({ ...admitForm, guardianEmail: e.target.value })}
                      placeholder="Guardian Email (optional)"
                      className="sm:col-span-2 px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                    />
                    <input
                      type="text"
                      value={admitForm.guardianOccupation}
                      onChange={(e) => setAdmitForm({ ...admitForm, guardianOccupation: e.target.value })}
                      placeholder="Occupation"
                      className="px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#EDF4FB]">
                <button
                  type="button"
                  onClick={() => setAdmitOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#CBDCEB] text-xs font-semibold text-[#486581] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-[#1769AA] hover:bg-[#12558C] text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
                >
                  {isSaving ? 'Registering...' : 'Complete Admission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Profile Dossier Modal */}
      {(selectedStudent || loadingDetail) && (
        <div className="fixed inset-0 z-50 bg-[#102A43]/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#DCEAF7] rounded-2xl w-full max-w-3xl p-6 space-y-5 shadow-xl my-8">
            {loadingDetail && !selectedStudent ? (
              <div className="py-10 text-center text-xs text-[#627D98]">Loading student profile...</div>
            ) : (
              selectedStudent && (
                <>
                  <div className="flex items-start justify-between gap-3 border-b border-[#EDF4FB] pb-4">
                    <div>
                      <div className="text-xs font-mono font-semibold text-[#1769AA]">
                        {selectedStudent.admissionNumber} · {selectedStudent.currentClassName} Sec{' '}
                        {selectedStudent.currentSectionName}
                      </div>
                      <h2 className="text-xl font-bold text-[#102A43] mt-0.5">
                        {selectedStudent.fullName}
                      </h2>
                      <div className="text-xs text-[#627D98] mt-0.5">
                        Status: <span className="capitalize font-semibold">{selectedStudent.status}</span> ·
                        Admitted {selectedStudent.admissionDate}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedStudent(null)}
                      className="p-1.5 text-[#627D98] hover:text-[#102A43] cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Tabs */}
                  <div className="flex flex-wrap gap-2 border-b border-[#EDF4FB] pb-3 text-xs">
                    {(
                      [
                        ['profile', 'Profile & Parent'],
                        ['documents', `Documents (${selectedStudent.documents.length})`],
                        ['history', 'Academic History'],
                        ...(permissions.canPromoteStudents ? [['actions', 'Promote / Transfer']] : [])
                      ] as [DetailTab, string][]
                    ).map(([tabId, label]) => (
                      <button
                        key={tabId}
                        onClick={() => setDetailTab(tabId)}
                        className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                          detailTab === tabId
                            ? 'bg-[#1769AA] text-white'
                            : 'bg-[#F5FAFF] text-[#486581] hover:bg-[#E6F2FC]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Tab 1: Profile & Parent */}
                  {detailTab === 'profile' && (
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-[#334E68] mb-1">First Name</label>
                          <input
                            type="text"
                            disabled={!permissions.canManageStudents}
                            value={editForm.firstName}
                            onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs disabled:bg-[#F5FAFF]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#334E68] mb-1">Last Name</label>
                          <input
                            type="text"
                            disabled={!permissions.canManageStudents}
                            value={editForm.lastName}
                            onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs disabled:bg-[#F5FAFF]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#334E68] mb-1">Roll Number</label>
                          <input
                            type="text"
                            disabled={!permissions.canManageStudents}
                            value={editForm.rollNumber}
                            onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs disabled:bg-[#F5FAFF]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#334E68] mb-1">Class</label>
                          <select
                            disabled={!permissions.canManageStudents}
                            value={editForm.classId}
                            onChange={(e) => {
                              const cls = classes.find((c) => c.id === e.target.value);
                              setEditForm({
                                ...editForm,
                                classId: e.target.value,
                                sectionId: cls?.sections[0]?.id || ''
                              });
                            }}
                            className="w-full px-2.5 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white disabled:bg-[#F5FAFF]"
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
                            disabled={!permissions.canManageStudents}
                            value={editForm.sectionId}
                            onChange={(e) => setEditForm({ ...editForm, sectionId: e.target.value })}
                            className="w-full px-2.5 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white disabled:bg-[#F5FAFF]"
                          >
                            {editSections.map((sec) => (
                              <option key={sec.id} value={sec.id}>
                                Section {sec.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#334E68] mb-1">Blood Group</label>
                          <input
                            type="text"
                            disabled={!permissions.canManageStudents}
                            value={editForm.bloodGroup}
                            onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs disabled:bg-[#F5FAFF]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#334E68] mb-1">Date of Birth</label>
                          <input
                            type="date"
                            disabled={!permissions.canManageStudents}
                            value={editForm.dateOfBirth}
                            onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs disabled:bg-[#F5FAFF]"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-[#334E68] mb-1">Address</label>
                          <input
                            type="text"
                            disabled={!permissions.canManageStudents}
                            value={editForm.address}
                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs disabled:bg-[#F5FAFF]"
                          />
                        </div>
                      </div>

                      {/* Linked Parent Summary */}
                      <div className="bg-[#F5FAFF] border border-[#DCEAF7] rounded-xl p-4 space-y-2">
                        <div className="text-xs font-bold text-[#102A43]">Linked Parent / Guardian</div>
                        {selectedStudent.parent ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#334E68]">
                            <div>
                              <span className="text-[#627D98]">Name:</span>{' '}
                              <span className="font-semibold">{selectedStudent.parent.guardianName}</span> (
                              {selectedStudent.parent.relation})
                            </div>
                            <div>
                              <span className="text-[#627D98]">Phone:</span>{' '}
                              <span className="tabular-nums">{selectedStudent.parent.phone}</span>
                            </div>
                            <div>
                              <span className="text-[#627D98]">Occupation:</span>{' '}
                              {selectedStudent.parent.occupation || '—'}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-[#627D98]">No guardian linked yet.</div>
                        )}
                      </div>

                      {selectedStudent.transferNotes && (
                        <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B]">
                          <strong>Transfer Record:</strong> {selectedStudent.transferNotes}
                        </div>
                      )}

                      {permissions.canManageStudents && (
                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={isSaving}
                            className="px-4 py-2 rounded-lg bg-[#1769AA] hover:bg-[#12558C] text-white text-xs font-semibold cursor-pointer"
                          >
                            {isSaving ? 'Saving...' : 'Save Profile Changes'}
                          </button>
                        </div>
                      )}
                    </form>
                  )}

                  {/* Tab 2: Student Documents */}
                  {detailTab === 'documents' && (
                    <div className="space-y-4">
                      <div className="divide-y divide-[#EDF4FB] border border-[#DCEAF7] rounded-xl">
                        {selectedStudent.documents.map((doc) => (
                          <div key={doc.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {doc.verified ? (
                                <FileCheck2 className="w-4 h-4 text-[#16A085] shrink-0" />
                              ) : (
                                <FileText className="w-4 h-4 text-[#1769AA] shrink-0" />
                              )}
                              <div className="min-w-0">
                                <div className="font-semibold text-[#102A43] truncate">{doc.name}</div>
                                <div className="text-[11px] text-[#627D98] capitalize">
                                  {doc.category.replace(/_/g, ' ')} ·{' '}
                                  {doc.verified ? 'Verified' : 'Pending Verification'}
                                </div>
                              </div>
                            </div>
                            {permissions.canManageStudents && (
                              <button
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="p-1.5 text-[#829AB1] hover:text-[#DC2626] cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        {selectedStudent.documents.length === 0 && (
                          <div className="p-6 text-center text-xs text-[#627D98]">
                            No student documents recorded yet.
                          </div>
                        )}
                      </div>

                      {permissions.canManageStudents && (
                        <form
                          onSubmit={handleAddDocument}
                          className="bg-[#F5FAFF] border border-[#DCEAF7] rounded-xl p-4 space-y-3"
                        >
                          <div className="text-xs font-bold text-[#102A43]">Add Student Document Record</div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <input
                              type="text"
                              required
                              value={docName}
                              onChange={(e) => setDocName(e.target.value)}
                              placeholder="Document Title (e.g., Birth Certificate)"
                              className="px-3 py-1.5 rounded-lg border border-[#CBDCEB] bg-white text-xs"
                            />
                            <select
                              value={docCategory}
                              onChange={(e) =>
                                setDocCategory(e.target.value as StudentDocumentRecord['category'])
                              }
                              className="px-2.5 py-1.5 rounded-lg border border-[#CBDCEB] bg-white text-xs"
                            >
                              <option value="birth_certificate">Birth Certificate</option>
                              <option value="transfer_certificate">Transfer Certificate</option>
                              <option value="id_proof">Aadhaar / ID Proof</option>
                              <option value="report_card">Previous Report Card</option>
                              <option value="medical">Medical Fitness</option>
                              <option value="other">Other</option>
                            </select>
                            <input
                              type="text"
                              value={docUrl}
                              onChange={(e) => setDocUrl(e.target.value)}
                              placeholder="Reference URL (optional)"
                              className="px-3 py-1.5 rounded-lg border border-[#CBDCEB] bg-white text-xs"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="inline-flex items-center gap-2 text-xs text-[#334E68]">
                              <input
                                type="checkbox"
                                checked={docVerified}
                                onChange={(e) => setDocVerified(e.target.checked)}
                              />
                              <span>Originals verified by admissions office</span>
                            </label>
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-[#1769AA] text-white text-xs font-semibold cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Document</span>
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {/* Tab 3: Academic History */}
                  {detailTab === 'history' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#F5FAFF] border border-[#DCEAF7] rounded-xl p-3.5">
                          <div className="text-[11px] text-[#627D98]">Attendance Rate</div>
                          <div className="text-xl font-bold text-[#16A085] tabular-nums mt-0.5">
                            {selectedStudent.attendanceSummary.percentage}%
                          </div>
                          <div className="text-[11px] text-[#486581] tabular-nums">
                            {selectedStudent.attendanceSummary.presentDays} present /{' '}
                            {selectedStudent.attendanceSummary.totalDays} days
                          </div>
                        </div>
                        <div className="bg-[#F5FAFF] border border-[#DCEAF7] rounded-xl p-3.5">
                          <div className="text-[11px] text-[#627D98]">Late / Absent</div>
                          <div className="text-xl font-bold text-[#102A43] tabular-nums mt-0.5">
                            {selectedStudent.attendanceSummary.lateDays} /{' '}
                            {selectedStudent.attendanceSummary.absentDays}
                          </div>
                        </div>
                        <div className="bg-[#F5FAFF] border border-[#DCEAF7] rounded-xl p-3.5">
                          <div className="text-[11px] text-[#627D98]">Evaluated Subjects</div>
                          <div className="text-xl font-bold text-[#1769AA] tabular-nums mt-0.5">
                            {selectedStudent.recentMarks.length}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#627D98] mb-2">
                          Session Enrollment Timeline
                        </h3>
                        <div className="border border-[#DCEAF7] rounded-xl divide-y divide-[#EDF4FB] text-xs">
                          {selectedStudent.enrollments.map((enr) => (
                            <div key={enr.id} className="p-3 flex items-center justify-between gap-2">
                              <div>
                                <div className="font-semibold text-[#102A43]">
                                  Session {enr.sessionName} · {enr.className} - Sec {enr.sectionName}
                                </div>
                                <div className="text-[11px] text-[#627D98]">
                                  Roll {enr.rollNumber || '—'} · {enr.remarks || 'Enrolled'}
                                </div>
                              </div>
                              <span className="font-semibold capitalize text-[#1769AA]">
                                {enr.enrollmentStatus}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedStudent.recentMarks.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#627D98] mb-2">
                            Recent Examination Performance
                          </h3>
                          <div className="border border-[#DCEAF7] rounded-xl overflow-hidden">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="bg-[#F5FAFF] border-b border-[#DCEAF7] text-[11px] text-[#627D98]">
                                  <th className="py-2 px-3">Examination</th>
                                  <th className="py-2 px-3">Subject</th>
                                  <th className="py-2 px-3 text-right">Marks</th>
                                  <th className="py-2 px-3 text-right">Grade</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#EDF4FB]">
                                {selectedStudent.recentMarks.map((mk, idx) => (
                                  <tr key={idx}>
                                    <td className="py-2 px-3 text-[#486581]">{mk.examName}</td>
                                    <td className="py-2 px-3 font-medium text-[#102A43]">{mk.subjectName}</td>
                                    <td className="py-2 px-3 text-right tabular-nums">
                                      {mk.marksObtained} / {mk.maxMarks}
                                    </td>
                                    <td className="py-2 px-3 text-right font-bold text-[#16A085]">
                                      {mk.grade}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 4: Promote / Transfer */}
                  {detailTab === 'actions' && permissions.canPromoteStudents && (
                    <div className="space-y-5">
                      <form
                        onSubmit={handlePromote}
                        className="bg-[#F5FAFF] border border-[#DCEAF7] rounded-xl p-4 space-y-3"
                      >
                        <div className="text-xs font-bold text-[#102A43]">Promote Student to Next Class</div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                          <select
                            value={promoteClassId}
                            onChange={(e) => {
                              const cls = classes.find((c) => c.id === e.target.value);
                              setPromoteClassId(e.target.value);
                              setPromoteSectionId(cls?.sections[0]?.id || '');
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
                            value={promoteSectionId}
                            onChange={(e) => setPromoteSectionId(e.target.value)}
                            className="px-2.5 py-2 rounded-lg border border-[#CBDCEB] bg-white text-xs"
                          >
                            {promoteSections.map((sec) => (
                              <option key={sec.id} value={sec.id}>
                                Section {sec.name}
                              </option>
                            ))}
                          </select>
                          <select
                            value={promoteSessionId}
                            onChange={(e) => setPromoteSessionId(e.target.value)}
                            className="px-2.5 py-2 rounded-lg border border-[#CBDCEB] bg-white text-xs"
                          >
                            {sessions.map((s) => (
                              <option key={s.id} value={s.id}>
                                Session {s.name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={promoteRoll}
                            onChange={(e) => setPromoteRoll(e.target.value)}
                            placeholder="New Roll #"
                            className="px-2.5 py-2 rounded-lg border border-[#CBDCEB] bg-white text-xs"
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <input
                            type="text"
                            value={promoteRemarks}
                            onChange={(e) => setPromoteRemarks(e.target.value)}
                            placeholder="Promotion remarks"
                            className="flex-1 px-3 py-2 rounded-lg border border-[#CBDCEB] bg-white text-xs"
                          />
                          <button
                            type="submit"
                            disabled={isSaving || selectedStudent.status === 'transferred'}
                            className="px-4 py-2 rounded-lg bg-[#16A085] hover:bg-[#138770] text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                          >
                            Promote Student
                          </button>
                        </div>
                      </form>

                      <div className="bg-white border border-[#FECACA] rounded-xl p-4 space-y-3">
                        <div className="text-xs font-bold text-[#991B1B]">
                          Issue Student Transfer Certificate (TC)
                        </div>
                        <p className="text-xs text-[#486581]">
                          Marks student status as Transferred, logs the TC number in academic history,
                          and immediately deactivates the student&apos;s portal login.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <input
                            type="text"
                            value={transferTcNo}
                            onChange={(e) => setTransferTcNo(e.target.value)}
                            placeholder="TC Number"
                            className="px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs font-mono"
                          />
                          <input
                            type="text"
                            value={transferDestination}
                            onChange={(e) => setTransferDestination(e.target.value)}
                            placeholder="Destination School"
                            className="px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                          />
                          <input
                            type="text"
                            value={transferReason}
                            onChange={(e) => setTransferReason(e.target.value)}
                            placeholder="Transfer Reason *"
                            className="px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                          />
                        </div>

                        {!confirmTransferOpen ? (
                          <button
                            type="button"
                            disabled={selectedStudent.status === 'transferred'}
                            onClick={() => setConfirmTransferOpen(true)}
                            className="px-4 py-2 rounded-lg bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA] text-xs font-semibold disabled:opacity-50 cursor-pointer"
                          >
                            Issue Transfer Certificate
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmTransferOpen(false)}
                              className="px-3 py-1.5 rounded-lg border border-[#CBDCEB] text-xs font-semibold text-[#486581] cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={handleTransfer}
                              className="px-4 py-1.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold cursor-pointer"
                            >
                              Confirm Student Transfer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

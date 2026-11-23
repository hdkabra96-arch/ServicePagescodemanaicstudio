import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  NotebookPen,
  Plus,
  RefreshCw,
  Send,
  X
} from 'lucide-react';
import { eduManageApi } from '../../api/edumanageClient';
import type {
  EduManagePermissions,
  HomeworkRecord,
  HomeworkSubmissionRecord,
  SchoolClass,
  SubjectRecord
} from '../../types/edumanage';

interface EduManageHomeworkViewProps {
  permissions: EduManagePermissions;
}

export const EduManageHomeworkView: React.FC<EduManageHomeworkViewProps> = ({ permissions }) => {
  const [homeworkList, setHomeworkList] = useState<HomeworkRecord[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [filterClassId, setFilterClassId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create Homework Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hwForm, setHwForm] = useState({
    classId: '',
    sectionId: '',
    subjectId: '',
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    maxScore: 20,
    attachmentUrl: ''
  });

  // Teacher Grading Modal
  const [gradingHw, setGradingHw] = useState<HomeworkRecord | null>(null);
  const [submissions, setSubmissions] = useState<HomeworkSubmissionRecord[]>([]);
  const [gradeInputs, setGradeInputs] = useState<Record<string, { score: string; feedback: string }>>({});

  // Student Submission Modal
  const [submittingHw, setSubmittingHw] = useState<HomeworkRecord | null>(null);
  const [subText, setSubText] = useState('');
  const [subAttachment, setSubAttachment] = useState('');

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
          setHwForm((prev) => ({
            ...prev,
            classId: prev.classId || clsList[0].id,
            sectionId: prev.sectionId || clsList[0].sections[0]?.id || '',
            subjectId: prev.subjectId || subList[0]?.id || ''
          }));
        }
      } catch {
        // ignore
      }
    };
    loadRefs();
  }, []);

  const loadHomework = useCallback(async () => {
    setLoading(true);
    try {
      const list = await eduManageApi.getHomework({
        classId: filterClassId || undefined,
        status: filterStatus || undefined
      });
      setHomeworkList(list);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to load assignments.' });
    } finally {
      setLoading(false);
    }
  }, [filterClassId, filterStatus]);

  useEffect(() => {
    loadHomework();
  }, [loadHomework]);

  const formSections = useMemo(() => {
    const cls = classes.find((c) => c.id === hwForm.classId);
    return cls?.sections || [];
  }, [classes, hwForm.classId]);

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSaving(true);
    try {
      await eduManageApi.createHomework({
        classId: hwForm.classId,
        sectionId: hwForm.sectionId,
        subjectId: hwForm.subjectId,
        title: hwForm.title.trim(),
        description: hwForm.description.trim(),
        dueDate: hwForm.dueDate,
        maxScore: Number(hwForm.maxScore) || 20,
        attachmentUrl: hwForm.attachmentUrl.trim() || undefined
      });
      setCreateOpen(false);
      setHwForm((prev) => ({ ...prev, title: '', description: '', attachmentUrl: '' }));
      await loadHomework();
      setFeedback({ type: 'success', text: 'Assignment published to class section.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to create assignment.' });
    } finally {
      setIsSaving(false);
    }
  };

  const openSubmissionsModal = async (hw: HomeworkRecord) => {
    setGradingHw(hw);
    try {
      const list = await eduManageApi.getHomeworkSubmissions(hw.id);
      setSubmissions(list);
      const inputs: Record<string, { score: string; feedback: string }> = {};
      for (const s of list) {
        if (s.id) {
          inputs[s.id] = {
            score: s.score !== null ? String(s.score) : '',
            feedback: s.teacherFeedback || ''
          };
        }
      }
      setGradeInputs(inputs);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to load submissions.' });
    }
  };

  const handleGrade = async (subId: string) => {
    if (!gradingHw) return;
    const input = gradeInputs[subId];
    if (!input || input.score === '') return;
    setFeedback(null);
    try {
      await eduManageApi.gradeHomeworkSubmission(gradingHw.id, subId, {
        score: Number(input.score),
        teacherFeedback: input.feedback
      });
      await openSubmissionsModal(gradingHw);
      await loadHomework();
      setFeedback({ type: 'success', text: 'Evaluation score and feedback saved.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Unable to save grade.' });
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingHw || !subText.trim()) return;
    setFeedback(null);
    setIsSaving(true);
    try {
      await eduManageApi.submitHomework(submittingHw.id, {
        submissionText: subText.trim(),
        attachmentUrl: subAttachment.trim() || undefined
      });
      setSubmittingHw(null);
      setSubText('');
      setSubAttachment('');
      await loadHomework();
      setFeedback({ type: 'success', text: 'Your assignment submission has been recorded.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Submission failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (hw: HomeworkRecord) => {
    const nextStatus = hw.status === 'active' ? 'closed' : 'active';
    try {
      await eduManageApi.updateHomeworkStatus(hw.id, nextStatus);
      await loadHomework();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Failed to update assignment status.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43] tracking-tight">
            Homework &amp; Assignments
          </h1>
          <p className="text-xs text-[#486581] mt-0.5">
            {permissions.isStudentPortal
              ? 'View class assignments, submit your work before deadlines, and review teacher feedback.'
              : 'Create subject assignments, track student submissions, and record evaluation scores.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadHomework}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#DCEAF7] text-xs font-semibold text-[#486581] cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {permissions.canManageHomework && (
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1769AA] hover:bg-[#12558C] text-white text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Homework</span>
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

      {/* Filter Bar */}
      {!permissions.isStudentPortal && !permissions.isParentPortal && (
        <div className="bg-white border border-[#DCEAF7] rounded-xl p-4 flex flex-wrap gap-3">
          <select
            value={filterClassId}
            onChange={(e) => setFilterClassId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white min-w-[160px]"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white min-w-[140px]"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      )}

      {/* Assignment Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {homeworkList.map((hw) => (
          <div
            key={hw.id}
            className="bg-white border border-[#DCEAF7] rounded-xl p-5 flex flex-col justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#1769AA]">
                    {hw.subjectName} · {hw.className} Sec {hw.sectionName}
                  </div>
                  <h2 className="text-base font-bold text-[#102A43] mt-0.5">{hw.title}</h2>
                </div>
                <span
                  className={`text-[11px] font-bold uppercase ${
                    hw.status === 'active' ? 'text-[#16A085]' : 'text-[#627D98]'
                  }`}
                >
                  {hw.status}
                </span>
              </div>

              {hw.description && (
                <p className="text-xs text-[#486581] leading-relaxed">{hw.description}</p>
              )}

              <div className="text-[11px] text-[#627D98] flex flex-wrap gap-x-4 gap-y-1 pt-1 tabular-nums">
                <span>
                  Due: <strong className="text-[#102A43]">{hw.dueDate}</strong>
                </span>
                <span>Max Marks: {hw.maxScore}</span>
                <span>Teacher: {hw.teacherName}</span>
              </div>

              {/* Student Personal Submission Feedback */}
              {permissions.isStudentPortal && hw.mySubmission && (
                <div className="mt-2 p-3 rounded-lg bg-[#F5FAFF] border border-[#DCEAF7] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#102A43] capitalize">
                      Submission: {hw.mySubmission.status}
                    </span>
                    {hw.mySubmission.score !== null && (
                      <span className="font-bold text-[#16A085] tabular-nums">
                        Score: {hw.mySubmission.score} / {hw.maxScore}
                      </span>
                    )}
                  </div>
                  <p className="text-[#486581]">{hw.mySubmission.submissionText}</p>
                  {hw.mySubmission.teacherFeedback && (
                    <div className="text-[11px] text-[#1769AA] pt-1 border-t border-[#E6F0FA]">
                      Teacher Feedback: {hw.mySubmission.teacherFeedback}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#EDF4FB] flex items-center justify-between gap-2 text-xs">
              {permissions.canManageHomework ? (
                <>
                  <div className="text-[#486581] tabular-nums">
                    <strong>{hw.submittedCount}</strong>/{hw.totalStudents} submitted ·{' '}
                    <strong className="text-[#16A085]">{hw.gradedCount}</strong> graded
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(hw)}
                      className="px-2.5 py-1.5 rounded-lg border border-[#CBDCEB] text-[#486581] font-semibold cursor-pointer"
                    >
                      {hw.status === 'active' ? 'Close' : 'Reopen'}
                    </button>
                    <button
                      onClick={() => openSubmissionsModal(hw)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1769AA] hover:bg-[#12558C] text-white font-semibold cursor-pointer"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      <span>Evaluate</span>
                    </button>
                  </div>
                </>
              ) : permissions.canSubmitHomework ? (
                <>
                  <span className="text-[#627D98]">
                    {hw.mySubmission ? 'Submitted' : 'Awaiting your submission'}
                  </span>
                  {hw.status === 'active' && (
                    <button
                      onClick={() => {
                        setSubmittingHw(hw);
                        setSubText(hw.mySubmission?.submissionText || '');
                        setSubAttachment(hw.mySubmission?.attachmentUrl || '');
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1769AA] hover:bg-[#12558C] text-white font-semibold cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{hw.mySubmission ? 'Update Submission' : 'Submit Work'}</span>
                    </button>
                  )}
                </>
              ) : (
                <span className="text-[#627D98]">
                  Submissions: {hw.submittedCount}/{hw.totalStudents}
                </span>
              )}
            </div>
          </div>
        ))}
        {!loading && homeworkList.length === 0 && (
          <div className="lg:col-span-2 bg-white border border-[#DCEAF7] rounded-xl p-10 text-center text-xs text-[#627D98]">
            No homework assignments found for the selected filter.
          </div>
        )}
      </div>

      {/* Create Assignment Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 bg-[#102A43]/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DCEAF7] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#EDF4FB] pb-3">
              <div className="flex items-center gap-2">
                <NotebookPen className="w-5 h-5 text-[#1769AA]" />
                <h2 className="text-base font-bold text-[#102A43]">Assign New Homework</h2>
              </div>
              <button onClick={() => setCreateOpen(false)} className="p-1 text-[#627D98] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateHomework} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Class</label>
                  <select
                    value={hwForm.classId}
                    onChange={(e) => {
                      const cls = classes.find((c) => c.id === e.target.value);
                      setHwForm({
                        ...hwForm,
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
                    value={hwForm.sectionId}
                    onChange={(e) => setHwForm({ ...hwForm, sectionId: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white"
                  >
                    {formSections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        Sec {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Subject</label>
                  <select
                    value={hwForm.subjectId}
                    onChange={(e) => setHwForm({ ...hwForm, subjectId: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg border border-[#CBDCEB] text-xs bg-white"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334E68] mb-1">Assignment Title *</label>
                <input
                  type="text"
                  required
                  value={hwForm.title}
                  onChange={(e) => setHwForm({ ...hwForm, title: e.target.value })}
                  placeholder="e.g., Chapter 6 Trigonometry Practice Sheet"
                  className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334E68] mb-1">Instructions</label>
                <textarea
                  rows={3}
                  value={hwForm.description}
                  onChange={(e) => setHwForm({ ...hwForm, description: e.target.value })}
                  placeholder="Describe exercise questions, expectations, and submission format..."
                  className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={hwForm.dueDate}
                    onChange={(e) => setHwForm({ ...hwForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Max Score</label>
                  <input
                    type="number"
                    min={1}
                    value={hwForm.maxScore}
                    onChange={(e) => setHwForm({ ...hwForm, maxScore: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs tabular-nums"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#CBDCEB] text-xs font-semibold text-[#486581] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg bg-[#1769AA] hover:bg-[#12558C] text-white text-xs font-semibold cursor-pointer"
                >
                  {isSaving ? 'Publishing...' : 'Publish Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Evaluation & Submissions Modal */}
      {gradingHw && (
        <div className="fixed inset-0 z-50 bg-[#102A43]/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#DCEAF7] rounded-2xl w-full max-w-3xl p-6 space-y-4 shadow-xl my-8">
            <div className="flex items-start justify-between border-b border-[#EDF4FB] pb-3">
              <div>
                <div className="text-xs font-semibold text-[#1769AA]">
                  {gradingHw.subjectName} · {gradingHw.className} Sec {gradingHw.sectionName}
                </div>
                <h2 className="text-base font-bold text-[#102A43]">{gradingHw.title}</h2>
                <div className="text-[11px] text-[#627D98] tabular-nums">
                  Due {gradingHw.dueDate} · Max Score {gradingHw.maxScore}
                </div>
              </div>
              <button onClick={() => setGradingHw(null)} className="p-1 text-[#627D98] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto divide-y divide-[#EDF4FB] border border-[#DCEAF7] rounded-xl text-xs">
              {submissions.map((sub) => (
                <div key={sub.studentId} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-[#102A43]">{sub.studentName}</span>
                      <span className="text-[11px] text-[#627D98] ml-2 font-mono">
                        Roll {sub.rollNumber || '—'} · {sub.admissionNumber}
                      </span>
                    </div>
                    <span
                      className={`font-semibold capitalize ${
                        sub.status === 'graded'
                          ? 'text-[#16A085]'
                          : sub.status === 'submitted'
                          ? 'text-[#1769AA]'
                          : sub.status === 'late'
                          ? 'text-[#D97706]'
                          : 'text-[#829AB1]'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>

                  {sub.id ? (
                    <>
                      <div className="bg-[#F5FAFF] border border-[#DCEAF7] rounded-lg p-3 text-[#334E68]">
                        {sub.submissionText}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <input
                          type="number"
                          min={0}
                          max={gradingHw.maxScore}
                          placeholder={`Score / ${gradingHw.maxScore}`}
                          value={gradeInputs[sub.id]?.score ?? ''}
                          onChange={(e) =>
                            setGradeInputs((prev) => ({
                              ...prev,
                              [sub.id!]: {
                                score: e.target.value,
                                feedback: prev[sub.id!]?.feedback || ''
                              }
                            }))
                          }
                          className="sm:col-span-3 px-2.5 py-1.5 rounded-lg border border-[#CBDCEB] text-xs tabular-nums"
                        />
                        <input
                          type="text"
                          placeholder="Teacher feedback remarks..."
                          value={gradeInputs[sub.id]?.feedback ?? ''}
                          onChange={(e) =>
                            setGradeInputs((prev) => ({
                              ...prev,
                              [sub.id!]: {
                                score: prev[sub.id!]?.score || '',
                                feedback: e.target.value
                              }
                            }))
                          }
                          className="sm:col-span-7 px-2.5 py-1.5 rounded-lg border border-[#CBDCEB] text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleGrade(sub.id!)}
                          className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-[#16A085] hover:bg-[#138770] text-white font-semibold cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-[11px] text-[#829AB1]">Not submitted yet.</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Student Submission Modal */}
      {submittingHw && (
        <div className="fixed inset-0 z-50 bg-[#102A43]/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DCEAF7] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#EDF4FB] pb-3">
              <div>
                <h2 className="text-base font-bold text-[#102A43]">Submit Assignment</h2>
                <p className="text-xs text-[#627D98]">{submittingHw.title}</p>
              </div>
              <button onClick={() => setSubmittingHw(null)} className="p-1 text-[#627D98] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#334E68] mb-1">
                  Your Answer / Submission Notes *
                </label>
                <textarea
                  rows={5}
                  required
                  value={subText}
                  onChange={(e) => setSubText(e.target.value)}
                  placeholder="Write your completed solution or summary..."
                  className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#334E68] mb-1">
                  Worksheet / Document Link (Optional)
                </label>
                <input
                  type="text"
                  value={subAttachment}
                  onChange={(e) => setSubAttachment(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittingHw(null)}
                  className="px-4 py-2 rounded-lg border border-[#CBDCEB] text-xs font-semibold text-[#486581] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg bg-[#1769AA] hover:bg-[#12558C] text-white text-xs font-semibold cursor-pointer"
                >
                  {isSaving ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

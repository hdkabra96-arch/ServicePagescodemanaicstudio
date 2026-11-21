import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X
} from 'lucide-react';
import { saasApi, SaasApiError } from '../../services/saasApi';
import type { SaasMember, SaasOrganization, SaasProject, SaasTask, SaasUser } from '../../types/saas';

interface SaasTasksViewProps {
  org: SaasOrganization;
  user: SaasUser;
  onDataMutated: () => void;
}

const PRIORITY_STYLE: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-[#EBF6FF] text-[#1769AA]',
  high: 'bg-amber-50 text-amber-800',
  urgent: 'bg-rose-50 text-rose-700'
};

export const SaasTasksView: React.FC<SaasTasksViewProps> = ({ org, user, onDataMutated }) => {
  const role = org.memberRole || 'member';
  const canDelete = role === 'admin' || role === 'manager';

  const [tasks, setTasks] = useState<SaasTask[]>([]);
  const [projectsList, setProjectsList] = useState<SaasProject[]>([]);
  const [membersList, setMembersList] = useState<SaasMember[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [onlyMine, setOnlyMine] = useState(false);
  const [sortBy, setSortBy] = useState('due_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SaasTask | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    projectId: '',
    title: '',
    description: '',
    status: 'todo' as SaasTask['status'],
    priority: 'medium' as SaasTask['priority'],
    assigneeId: '',
    dueDate: '',
    estimatedHours: '4'
  });

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await saasApi.getTasks(org.id, {
        search: search.trim() || undefined,
        status: statusFilter,
        priority: priorityFilter,
        projectId: projectFilter,
        assigneeId: onlyMine ? 'me' : undefined,
        sortBy,
        sortDir,
        page,
        limit: 10
      });
      setTasks(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof SaasApiError ? err.message : 'Unable to load tasks.');
    } finally {
      setIsLoading(false);
    }
  }, [org.id, search, statusFilter, priorityFilter, projectFilter, onlyMine, sortBy, sortDir, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTasks();
    }, 180);
    return () => clearTimeout(timer);
  }, [loadTasks]);

  useEffect(() => {
    Promise.all([
      saasApi.getProjects(org.id, { limit: 50 }),
      saasApi.getMembers(org.id)
    ])
      .then(([pRes, mRes]) => {
        setProjectsList(pRes.data);
        setMembersList(mRes.data);
      })
      .catch(() => {
        // non-blocking
      });
  }, [org.id]);

  const openCreateModal = () => {
    setEditing(null);
    setFormError('');
    setForm({
      projectId: projectsList[0]?.id || '',
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assigneeId: user.id,
      dueDate: '',
      estimatedHours: '4'
    });
    setModalOpen(true);
  };

  const openEditModal = (t: SaasTask) => {
    setEditing(t);
    setFormError('');
    setForm({
      projectId: t.projectId,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      assigneeId: t.assigneeId || '',
      dueDate: t.dueDate || '',
      estimatedHours: String(t.estimatedHours)
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        projectId: form.projectId,
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        priority: form.priority,
        assigneeId: form.assigneeId || null,
        dueDate: form.dueDate || null,
        estimatedHours: Number(form.estimatedHours || 0)
      };
      if (editing) {
        const res = await saasApi.updateTask(org.id, editing.id, payload);
        setBanner({ type: 'success', text: res.message });
      } else {
        const res = await saasApi.createTask(org.id, payload);
        setBanner({ type: 'success', text: res.message });
      }
      setModalOpen(false);
      await loadTasks();
      onDataMutated();
    } catch (err) {
      setFormError(err instanceof SaasApiError ? err.message : 'Unable to save task.');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatus = async (task: SaasTask, nextStatus: SaasTask['status']) => {
    setBanner(null);
    try {
      await saasApi.updateTask(org.id, task.id, { status: nextStatus });
      await loadTasks();
      onDataMutated();
    } catch (err) {
      setBanner({
        type: 'error',
        text: err instanceof SaasApiError ? err.message : 'Unable to update task status.'
      });
    }
  };

  const handleDelete = async (taskId: string) => {
    setBanner(null);
    try {
      const res = await saasApi.deleteTask(org.id, taskId);
      setBanner({ type: 'success', text: res.message });
      setConfirmDeleteId(null);
      await loadTasks();
      onDataMutated();
    } catch (err) {
      setBanner({
        type: 'error',
        text: err instanceof SaasApiError ? err.message : 'Unable to delete task.'
      });
    }
  };

  const canEditTask = (t: SaasTask) => role === 'admin' || role === 'manager' || !t.assigneeId || t.assigneeId === user.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#1769AA]">Execution Queue</p>
          <h1 className="text-2xl font-extrabold text-[#102A43] mt-0.5">Tasks & Deliverables</h1>
          <p className="text-sm text-[#486581] mt-1">
            Assign sprint deliverables, update status transitions live, and monitor workload across projects.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          disabled={projectsList.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1769AA] hover:bg-[#12558C] disabled:opacity-50 text-white text-xs font-bold shadow-sm shadow-[#1769AA]/20 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {projectsList.length === 0 && !isLoading && (
        <div className="p-4 rounded-xl bg-[#EEF7FF] border border-[#CBE2F6] text-xs font-semibold text-[#1769AA]">
          Create at least one Project before adding deliverables to your task queue.
        </div>
      )}

      {banner && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 border ${
            banner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {banner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{banner.text}</span>
          </div>
          <button type="button" onClick={() => setBanner(null)} className="cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search / Filter / Sort Bar */}
      <div className="bg-white rounded-2xl border border-[#D8ECFB] p-4 shadow-xs flex flex-col xl:flex-row gap-3 xl:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#627D98] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search tasks, description, or project..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm text-[#102A43]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setOnlyMine((v) => !v);
              setPage(1);
            }}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
              onlyMine
                ? 'bg-[#1769AA] text-white border-[#1769AA]'
                : 'bg-[#FAFDFE] text-[#334E68] border-[#CBE2F6] hover:bg-[#EEF7FF]'
            }`}
          >
            Assigned to Me
          </button>

          <select
            value={projectFilter}
            onChange={(e) => {
              setProjectFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-xs font-semibold text-[#102A43]"
          >
            <option value="all">All Projects</option>
            {projectsList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-xs font-semibold text-[#102A43]"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">In Review</option>
            <option value="done">Done</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-xs font-semibold text-[#102A43]"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={`${sortBy}:${sortDir}`}
            onChange={(e) => {
              const [col, dir] = e.target.value.split(':');
              setSortBy(col);
              setSortDir(dir as 'asc' | 'desc');
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-xs font-semibold text-[#102A43]"
          >
            <option value="due_date:asc">Nearest Due Date</option>
            <option value="priority:asc">Highest Priority</option>
            <option value="updated_at:desc">Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-2xl border border-[#D8ECFB] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-[#627D98] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#1769AA]" />
            <span>Loading tasks...</span>
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-[#102A43]">{error}</p>
            <button
              type="button"
              onClick={loadTasks}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1769AA] text-white text-xs font-bold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center">
            <CheckSquare className="w-9 h-9 text-[#5BB6F5] mx-auto mb-2.5" />
            <h3 className="text-sm font-extrabold text-[#102A43]">No tasks match your view</h3>
            <p className="text-xs text-[#627D98] mt-1">Adjust filters or create a new deliverable task.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5FAFF] text-[11px] font-bold uppercase tracking-wider text-[#627D98] border-b border-[#E6F2FC]">
                  <th className="py-3 px-6">Task & Project</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Due / Est.</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF6FD] text-sm">
                {tasks.map((t) => {
                  const editable = canEditTask(t);
                  return (
                    <tr key={t.id} className="hover:bg-[#F9FCFF]">
                      <td className="py-3.5 px-6">
                        <p className={`font-bold ${t.status === 'done' ? 'line-through text-[#627D98]' : 'text-[#102A43]'}`}>
                          {t.title}
                        </p>
                        <p className="text-xs text-[#1769AA] font-medium mt-0.5">{t.projectName}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-[#334E68]">{t.assigneeName}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            PRIORITY_STYLE[t.priority] || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {editable ? (
                          <select
                            value={t.status}
                            onChange={(e) => handleQuickStatus(t, e.target.value as SaasTask['status'])}
                            className="px-2.5 py-1 rounded-lg border border-[#CBE2F6] bg-white text-xs font-bold text-[#102A43]"
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">In Review</option>
                            <option value="done">Done</option>
                          </select>
                        ) : (
                          <span className="text-xs font-bold text-[#486581] capitalize">{t.status.replace('_', ' ')}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs text-[#486581] tabular-nums">
                        <p className="font-semibold text-[#102A43]">{t.dueDate || 'No due date'}</p>
                        <p className="inline-flex items-center gap-1 text-[11px] text-[#627D98]">
                          <Clock className="w-3 h-3" />
                          {t.estimatedHours}h
                        </p>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        {confirmDeleteId === t.id ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDelete(t.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1">
                            {editable && (
                              <button
                                type="button"
                                onClick={() => openEditModal(t)}
                                className="p-1.5 rounded-lg text-[#1769AA] hover:bg-[#EBF6FF] cursor-pointer"
                                title="Edit task"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(t.id)}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Delete task"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-3.5 border-t border-[#E6F2FC] flex items-center justify-between text-xs">
          <span className="text-[#627D98] tabular-nums">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} tasks)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#CBE2F6] bg-white disabled:opacity-40 font-bold text-[#102A43] cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#CBE2F6] bg-white disabled:opacity-40 font-bold text-[#102A43] cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit Task Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#102A43]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D4E8FA] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-[#E6F2FC] flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#102A43]">
                {editing ? 'Edit Task' : 'Create Deliverable Task'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-[#627D98] hover:bg-[#F0F7FF] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Implement tenant webhook signing"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Project</label>
                  <select
                    required
                    value={form.projectId}
                    onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                  >
                    {projectsList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Assignee</label>
                  <select
                    value={form.assigneeId}
                    onChange={(e) => setForm((f) => ({ ...f, assigneeId: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                  >
                    <option value="">Unassigned</option>
                    {membersList.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as SaasTask['priority'] }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as SaasTask['status'] }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    step={0.5}
                    value={form.estimatedHours}
                    onChange={(e) => setForm((f) => ({ ...f, estimatedHours: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm tabular-nums"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Details</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#CBE2F6] text-xs font-bold text-[#486581] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1769AA] hover:bg-[#12558C] disabled:opacity-60 text-white text-xs font-bold cursor-pointer"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editing ? 'Save Task' : 'Create Task'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

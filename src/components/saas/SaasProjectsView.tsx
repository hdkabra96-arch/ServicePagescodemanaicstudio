import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X
} from 'lucide-react';
import { saasApi, SaasApiError } from '../../services/saasApi';
import type { SaasClient, SaasMember, SaasOrganization, SaasProject } from '../../types/saas';
import { exportSheetsToExcel, exportTableToPdf } from '../../utils/saasExports';

interface SaasProjectsViewProps {
  org: SaasOrganization;
  onDataMutated: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  planning: 'Planning',
  in_progress: 'In Progress',
  review: 'In Review',
  launched: 'Launched',
  on_hold: 'On Hold'
};

const STATUS_STYLE: Record<string, string> = {
  planning: 'bg-sky-50 text-[#1769AA] border-sky-200',
  in_progress: 'bg-[#E6F6FF] text-[#0E5A94] border-[#B4E1FA]',
  review: 'bg-amber-50 text-amber-800 border-amber-200',
  launched: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  on_hold: 'bg-slate-100 text-slate-600 border-slate-200'
};

const PRIORITY_STYLE: Record<string, string> = {
  low: 'text-slate-600 bg-slate-100',
  medium: 'text-[#1769AA] bg-[#EBF6FF]',
  high: 'text-amber-800 bg-amber-50',
  urgent: 'text-rose-700 bg-rose-50'
};

function formatInr(v: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(v);
}

export const SaasProjectsView: React.FC<SaasProjectsViewProps> = ({ org, onDataMutated }) => {
  const role = org.memberRole || 'member';
  const canWrite = role === 'admin' || role === 'manager';
  const canDelete = role === 'admin';

  const [projects, setProjects] = useState<SaasProject[]>([]);
  const [clientsList, setClientsList] = useState<SaasClient[]>([]);
  const [membersList, setMembersList] = useState<SaasMember[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 1 });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SaasProject | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    name: '',
    code: '',
    clientId: '',
    ownerId: '',
    category: 'SaaS Platform',
    status: 'planning' as SaasProject['status'],
    priority: 'medium' as SaasProject['priority'],
    budget: '250000',
    spent: '0',
    progress: '0',
    dueDate: '',
    description: ''
  });

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await saasApi.getProjects(org.id, {
        search: search.trim() || undefined,
        status: statusFilter,
        priority: priorityFilter,
        sortBy,
        sortDir,
        page,
        limit: 8
      });
      setProjects(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof SaasApiError ? err.message : 'Unable to load projects.');
    } finally {
      setIsLoading(false);
    }
  }, [org.id, search, statusFilter, priorityFilter, sortBy, sortDir, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProjects();
    }, 180);
    return () => clearTimeout(timer);
  }, [loadProjects]);

  useEffect(() => {
    Promise.all([
      saasApi.getClients(org.id, { limit: 50 }),
      saasApi.getMembers(org.id)
    ])
      .then(([cRes, mRes]) => {
        setClientsList(cRes.data);
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
      name: '',
      code: '',
      clientId: clientsList[0]?.id || '',
      ownerId: membersList[0]?.userId || '',
      category: 'SaaS Platform',
      status: 'planning',
      priority: 'medium',
      budget: '350000',
      spent: '0',
      progress: '10',
      dueDate: '',
      description: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (prj: SaasProject) => {
    setEditing(prj);
    setFormError('');
    setForm({
      name: prj.name,
      code: prj.code,
      clientId: prj.clientId || '',
      ownerId: prj.ownerId,
      category: prj.category,
      status: prj.status,
      priority: prj.priority,
      budget: String(prj.budget),
      spent: String(prj.spent),
      progress: String(prj.progress),
      dueDate: prj.dueDate || '',
      description: prj.description
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim() || undefined,
        clientId: form.clientId || null,
        ownerId: form.ownerId || undefined,
        category: form.category.trim(),
        status: form.status,
        priority: form.priority,
        budget: Number(form.budget || 0),
        spent: Number(form.spent || 0),
        progress: Number(form.progress || 0),
        dueDate: form.dueDate || null,
        description: form.description.trim()
      };
      if (editing) {
        const res = await saasApi.updateProject(org.id, editing.id, payload);
        setBanner({ type: 'success', text: res.message });
      } else {
        const res = await saasApi.createProject(org.id, payload);
        setBanner({ type: 'success', text: res.message });
      }
      setModalOpen(false);
      await loadProjects();
      onDataMutated();
    } catch (err) {
      setFormError(err instanceof SaasApiError ? err.message : 'Unable to save project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    setBanner(null);
    try {
      const res = await saasApi.deleteProject(org.id, projectId);
      setBanner({ type: 'success', text: res.message });
      setConfirmDeleteId(null);
      await loadProjects();
      onDataMutated();
    } catch (err) {
      setBanner({
        type: 'error',
        text: err instanceof SaasApiError ? err.message : 'Unable to delete project.'
      });
    }
  };

  const handleExportPdf = () => {
    exportTableToPdf({
      title: 'Projects Portfolio Report',
      subtitle: `Filtered projects (${pagination.total} total)`,
      workspaceName: org.name,
      fileNamePrefix: `${org.slug}-projects`,
      columns: ['Code', 'Project', 'Client', 'Status', 'Progress', 'Budget (INR)', 'Spent (INR)', 'Due Date'],
      rows: projects.map((p) => [
        p.code,
        p.name,
        p.clientName || 'Internal',
        STATUS_LABELS[p.status] || p.status,
        `${p.progress}%`,
        formatInr(p.budget),
        formatInr(p.spent),
        p.dueDate || '—'
      ])
    });
  };

  const handleExportExcel = () => {
    exportSheetsToExcel({
      fileNamePrefix: `${org.slug}-projects`,
      sheets: [
        {
          sheetName: 'Projects',
          rows: projects.map((p) => ({
            Code: p.code,
            Project: p.name,
            Client: p.clientName || 'Internal',
            Owner: p.ownerName || '',
            Category: p.category,
            Status: p.status,
            Priority: p.priority,
            Progress_Pct: p.progress,
            Budget_INR: p.budget,
            Spent_INR: p.spent,
            Due_Date: p.dueDate || ''
          }))
        }
      ]
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#1769AA]">Delivery Pipeline</p>
          <h1 className="text-2xl font-extrabold text-[#102A43] mt-0.5">Projects Portfolio</h1>
          <p className="text-sm text-[#486581] mt-1">
            Track SaaS product builds, budgets, client assignments, and release timelines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-[#486581] bg-white border border-[#D8ECFB] px-3 py-2 rounded-xl tabular-nums">
            Quota: {org.usage?.projects ?? pagination.total} / {org.limits?.maxProjects ?? 10}
          </span>
          <button
            type="button"
            disabled={projects.length === 0}
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#EEF7FF] disabled:opacity-40 border border-[#CBE2F6] text-xs font-bold text-[#1769AA] cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
          <button
            type="button"
            disabled={projects.length === 0}
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#EEF7FF] disabled:opacity-40 border border-[#CBE2F6] text-xs font-bold text-[#1769AA] cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
          {canWrite && (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1769AA] hover:bg-[#12558C] text-white text-xs font-bold shadow-sm shadow-[#1769AA]/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          )}
        </div>
      </div>

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

      <div className="bg-white rounded-2xl border border-[#D8ECFB] p-4 shadow-xs flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#627D98] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search project name, code, category, or client..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm text-[#102A43]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-xs font-semibold text-[#102A43]"
          >
            <option value="all">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="review">In Review</option>
            <option value="launched">Launched</option>
            <option value="on_hold">On Hold</option>
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
            <option value="updated_at:desc">Recently Updated</option>
            <option value="due_date:asc">Nearest Due Date</option>
            <option value="progress:desc">Highest Progress</option>
            <option value="budget:desc">Highest Budget</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#D8ECFB] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-[#627D98] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#1769AA]" />
            <span>Loading projects...</span>
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-[#102A43]">{error}</p>
            <button
              type="button"
              onClick={loadProjects}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1769AA] text-white text-xs font-bold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center">
            <FolderKanban className="w-9 h-9 text-[#5BB6F5] mx-auto mb-2.5" />
            <h3 className="text-sm font-extrabold text-[#102A43]">No projects found</h3>
            <p className="text-xs text-[#627D98] mt-1">
              Create your first project to organize tasks, milestones, and client budgets.
            </p>
            {canWrite && (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1769AA] text-white text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5FAFF] text-[11px] font-bold uppercase tracking-wider text-[#627D98] border-b border-[#E6F2FC]">
                  <th className="py-3 px-6">Project</th>
                  <th className="py-3 px-4">Client & Lead</th>
                  <th className="py-3 px-4">Status / Priority</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4 text-right">Budget / Spent</th>
                  {(canWrite || canDelete) && <th className="py-3 px-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF6FD] text-sm">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F9FCFF]">
                    <td className="py-3.5 px-6">
                      <p className="font-bold text-[#102A43]">{p.name}</p>
                      <p className="text-xs text-[#627D98]">
                        <span className="font-mono font-semibold text-[#1769AA]">{p.code}</span> · {p.category}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-xs font-bold text-[#334E68]">{p.clientName}</p>
                      <p className="text-[11px] text-[#627D98]">Owner: {p.ownerName}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
                            STATUS_STYLE[p.status] || 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {STATUS_LABELS[p.status] || p.status}
                        </span>
                        <span
                          className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            PRIORITY_STYLE[p.priority] || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {p.priority}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-[#E6F2FC] overflow-hidden">
                          <div className="h-full rounded-full bg-[#1769AA]" style={{ width: `${p.progress}%` }} />
                        </div>
                        <span className="text-xs font-bold text-[#102A43] tabular-nums">{p.progress}%</span>
                      </div>
                      {p.dueDate && <p className="text-[11px] text-[#627D98] mt-0.5 tabular-nums">Due {p.dueDate}</p>}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums">
                      <p className="text-xs font-extrabold text-[#102A43]">{formatInr(p.budget)}</p>
                      <p className="text-[11px] text-[#627D98]">Spent {formatInr(p.spent)}</p>
                    </td>
                    {(canWrite || canDelete) && (
                      <td className="py-3.5 px-6 text-right">
                        {confirmDeleteId === p.id ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDelete(p.id)}
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
                            {canWrite && (
                              <button
                                type="button"
                                onClick={() => openEditModal(p)}
                                className="p-1.5 rounded-lg text-[#1769AA] hover:bg-[#EBF6FF] cursor-pointer"
                                title="Edit project"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(p.id)}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Delete project"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-3.5 border-t border-[#E6F2FC] flex items-center justify-between text-xs">
          <span className="text-[#627D98] tabular-nums">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#102A43]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D4E8FA] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-[#E6F2FC] flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#102A43]">
                {editing ? 'Edit Project' : 'Launch New Project'}
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
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Project Name</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Cloud Billing Portal v2"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Project Code (Optional)</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                    placeholder="e.g. CMS-210"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Client Account</label>
                  <select
                    value={form.clientId}
                    onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                  >
                    <option value="">Internal Workspace Project</option>
                    {clientsList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Project Owner</label>
                  <select
                    value={form.ownerId}
                    onChange={(e) => setForm((f) => ({ ...f, ownerId: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                  >
                    {membersList.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.fullName} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as SaasProject['status'] }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                  >
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="launched">Launched</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as SaasProject['priority'] }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Budget (INR)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.budget}
                    onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Spent (INR)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.spent}
                    onChange={(e) => setForm((f) => ({ ...f, spent: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Completion ({form.progress}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={form.progress}
                    onChange={(e) => setForm((f) => ({ ...f, progress: e.target.value }))}
                    className="w-full accent-[#1769AA] mt-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Target Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Scope & Description</label>
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
                  <span>{editing ? 'Save Project' : 'Create Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

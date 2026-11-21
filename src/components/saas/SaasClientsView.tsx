import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileSpreadsheet,
  FileText,
  Loader2,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X
} from 'lucide-react';
import { saasApi, SaasApiError } from '../../services/saasApi';
import type { SaasClient, SaasOrganization } from '../../types/saas';
import { exportSheetsToExcel, exportTableToPdf } from '../../utils/saasExports';

interface SaasClientsViewProps {
  org: SaasOrganization;
  onDataMutated: () => void;
}

const STATUS_STYLE: Record<string, string> = {
  lead: 'bg-sky-50 text-[#1769AA] border-sky-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paused: 'bg-amber-50 text-amber-800 border-amber-200',
  churned: 'bg-rose-50 text-rose-700 border-rose-200'
};

const TIER_STYLE: Record<string, string> = {
  standard: 'bg-slate-100 text-slate-700',
  priority: 'bg-[#E6F6FF] text-[#1769AA]',
  enterprise: 'bg-[#102A43] text-white'
};

function formatInr(v: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(v);
}

export const SaasClientsView: React.FC<SaasClientsViewProps> = ({ org, onDataMutated }) => {
  const role = org.memberRole || 'member';
  const canWrite = role === 'admin' || role === 'manager';
  const canDelete = role === 'admin';

  const [clients, setClients] = useState<SaasClient[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SaasClient | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    industry: 'Technology & SaaS',
    tier: 'standard' as SaasClient['tier'],
    status: 'active' as SaasClient['status'],
    monthlyRetainer: '0',
    notes: ''
  });

  const loadClients = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await saasApi.getClients(org.id, {
        search: search.trim() || undefined,
        status: statusFilter,
        tier: tierFilter,
        sortBy,
        sortDir,
        page,
        limit: 8
      });
      setClients(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof SaasApiError ? err.message : 'Unable to load clients.');
    } finally {
      setIsLoading(false);
    }
  }, [org.id, search, statusFilter, tierFilter, sortBy, sortDir, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadClients();
    }, 180);
    return () => clearTimeout(timer);
  }, [loadClients]);

  const openCreateModal = () => {
    setEditing(null);
    setFormError('');
    setForm({
      companyName: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      industry: 'Technology & SaaS',
      tier: 'standard',
      status: 'active',
      monthlyRetainer: '50000',
      notes: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (client: SaasClient) => {
    setEditing(client);
    setFormError('');
    setForm({
      companyName: client.companyName,
      contactName: client.contactName,
      contactEmail: client.contactEmail,
      contactPhone: client.contactPhone,
      industry: client.industry,
      tier: client.tier,
      status: client.status,
      monthlyRetainer: String(client.monthlyRetainer),
      notes: client.notes
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        companyName: form.companyName.trim(),
        contactName: form.contactName.trim(),
        contactEmail: form.contactEmail.trim(),
        contactPhone: form.contactPhone.trim(),
        industry: form.industry.trim(),
        tier: form.tier,
        status: form.status,
        monthlyRetainer: Number(form.monthlyRetainer || 0),
        notes: form.notes.trim()
      };
      if (editing) {
        const res = await saasApi.updateClient(org.id, editing.id, payload);
        setBanner({ type: 'success', text: res.message });
      } else {
        const res = await saasApi.createClient(org.id, payload);
        setBanner({ type: 'success', text: res.message });
      }
      setModalOpen(false);
      await loadClients();
      onDataMutated();
    } catch (err) {
      setFormError(err instanceof SaasApiError ? err.message : 'Unable to save client.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (clientId: string) => {
    setBanner(null);
    try {
      const res = await saasApi.deleteClient(org.id, clientId);
      setBanner({ type: 'success', text: res.message });
      setConfirmDeleteId(null);
      await loadClients();
      onDataMutated();
    } catch (err) {
      setBanner({
        type: 'error',
        text: err instanceof SaasApiError ? err.message : 'Unable to delete client.'
      });
    }
  };

  const pageRetainerSum = clients.reduce((sum, c) => sum + c.monthlyRetainer, 0);

  const handleExportPdf = () => {
    exportTableToPdf({
      title: 'Clients CRM Directory',
      subtitle: `Filtered client roster (${pagination.total} total)`,
      workspaceName: org.name,
      fileNamePrefix: `${org.slug}-clients`,
      columns: ['Company', 'Industry', 'Contact', 'Email', 'Tier', 'Status', 'Retainer (INR)'],
      rows: clients.map((c) => [
        c.companyName,
        c.industry,
        c.contactName,
        c.contactEmail,
        c.tier.toUpperCase(),
        c.status.toUpperCase(),
        formatInr(c.monthlyRetainer)
      ])
    });
  };

  const handleExportExcel = () => {
    exportSheetsToExcel({
      fileNamePrefix: `${org.slug}-clients`,
      sheets: [
        {
          sheetName: 'Clients',
          rows: clients.map((c) => ({
            Company: c.companyName,
            Industry: c.industry,
            Contact: c.contactName,
            Email: c.contactEmail,
            Phone: c.contactPhone,
            Tier: c.tier,
            Status: c.status,
            Monthly_Retainer_INR: c.monthlyRetainer,
            Notes: c.notes
          }))
        }
      ]
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#1769AA]">CRM & Accounts</p>
          <h1 className="text-2xl font-extrabold text-[#102A43] mt-0.5">Clients Directory</h1>
          <p className="text-sm text-[#486581] mt-1">
            Manage tenant client accounts, monthly retainers, and account health for{' '}
            <span className="font-semibold text-[#102A43]">{org.name}</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-[#486581] bg-white border border-[#D8ECFB] px-3 py-2 rounded-xl tabular-nums">
            Quota: {org.usage?.clients ?? pagination.total} / {org.limits?.maxClients ?? 15}
          </span>
          <button
            type="button"
            disabled={clients.length === 0}
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#EEF7FF] disabled:opacity-40 border border-[#CBE2F6] text-xs font-bold text-[#1769AA] cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
          <button
            type="button"
            disabled={clients.length === 0}
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
              <span>Add Client</span>
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

      {/* Search, Filter & Sort Toolbar */}
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
            placeholder="Search company, contact, email, or industry..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm text-[#102A43] focus:outline-hidden focus:ring-2 focus:ring-[#5BB6F5]/40 focus:border-[#1769AA]"
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
            <option value="active">Active</option>
            <option value="lead">Lead</option>
            <option value="paused">Paused</option>
            <option value="churned">Churned</option>
          </select>

          <select
            value={tierFilter}
            onChange={(e) => {
              setTierFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-xs font-semibold text-[#102A43]"
          >
            <option value="all">All Tiers</option>
            <option value="enterprise">Enterprise</option>
            <option value="priority">Priority</option>
            <option value="standard">Standard</option>
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
            <option value="created_at:desc">Newest First</option>
            <option value="company_name:asc">Company A–Z</option>
            <option value="monthly_retainer:desc">Highest Retainer</option>
            <option value="monthly_retainer:asc">Lowest Retainer</option>
          </select>
        </div>
      </div>

      {/* Clients Table Card */}
      <div className="bg-white rounded-2xl border border-[#D8ECFB] shadow-xs overflow-hidden">
        <div className="px-6 py-3.5 bg-[#F8FBFF] border-b border-[#E6F2FC] flex items-center justify-between text-xs">
          <span className="font-bold text-[#486581] tabular-nums">
            Showing {clients.length} of {pagination.total} clients
          </span>
          <span className="font-bold text-[#1769AA] tabular-nums">
            Page Retainer Value: {formatInr(pageRetainerSum)} / mo
          </span>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-sm text-[#627D98] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#1769AA]" />
            <span>Loading clients from database...</span>
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-[#102A43]">{error}</p>
            <button
              type="button"
              onClick={loadClients}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1769AA] text-white text-xs font-bold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="w-9 h-9 text-[#5BB6F5] mx-auto mb-2.5" />
            <h3 className="text-sm font-extrabold text-[#102A43]">No matching clients found</h3>
            <p className="text-xs text-[#627D98] mt-1">
              {search || statusFilter !== 'all' || tierFilter !== 'all'
                ? 'Try clearing your search or filters.'
                : 'Add your first client account to track retainers and projects.'}
            </p>
            {canWrite && (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1769AA] text-white text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Client</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5FAFF] text-[11px] font-bold uppercase tracking-wider text-[#627D98] border-b border-[#E6F2FC]">
                  <th className="py-3 px-6">Company & Industry</th>
                  <th className="py-3 px-4">Primary Contact</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Monthly Retainer</th>
                  {(canWrite || canDelete) && <th className="py-3 px-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF6FD] text-sm">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F9FCFF] transition-colors">
                    <td className="py-3.5 px-6">
                      <p className="font-bold text-[#102A43]">{c.companyName}</p>
                      <p className="text-xs text-[#627D98]">{c.industry}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-xs font-bold text-[#334E68]">{c.contactName}</p>
                      <div className="flex items-center gap-3 text-[11px] text-[#627D98] mt-0.5">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {c.contactEmail}
                        </span>
                        {c.contactPhone && (
                          <span className="hidden sm:inline-flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {c.contactPhone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          TIER_STYLE[c.tier] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.tier}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block text-[11px] font-bold capitalize px-2.5 py-0.5 rounded-md border ${
                          STATUS_STYLE[c.status] || 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-[#102A43] tabular-nums">
                      {formatInr(c.monthlyRetainer)}
                    </td>
                    {(canWrite || canDelete) && (
                      <td className="py-3.5 px-6 text-right">
                        {confirmDeleteId === c.id ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDelete(c.id)}
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
                                onClick={() => openEditModal(c)}
                                className="p-1.5 rounded-lg text-[#1769AA] hover:bg-[#EBF6FF] cursor-pointer"
                                title="Edit client"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(c.id)}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Delete client"
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

        {/* Pagination Footer */}
        <div className="px-6 py-3.5 border-t border-[#E6F2FC] flex items-center justify-between text-xs">
          <span className="text-[#627D98] tabular-nums">
            Page {pagination.page} of {pagination.totalPages}
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

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#102A43]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D4E8FA] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-[#E6F2FC] flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#102A43]">
                {editing ? 'Edit Client Account' : 'Add New Client'}
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
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={form.companyName}
                    onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                    placeholder="e.g. Horizon FinTech Pvt Ltd"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={form.contactName}
                    onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={form.contactEmail}
                    onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Phone</label>
                  <input
                    type="text"
                    value={form.contactPhone}
                    onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Industry</label>
                  <input
                    type="text"
                    value={form.industry}
                    onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Account Tier</label>
                  <select
                    value={form.tier}
                    onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value as SaasClient['tier'] }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                  >
                    <option value="standard">Standard</option>
                    <option value="priority">Priority</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as SaasClient['status'] }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                  >
                    <option value="lead">Lead</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="churned">Churned</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Monthly Retainer (INR)</label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={form.monthlyRetainer}
                    onChange={(e) => setForm((f) => ({ ...f, monthlyRetainer: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm tabular-nums"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Account Notes</label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
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
                  <span>{editing ? 'Save Changes' : 'Create Client'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

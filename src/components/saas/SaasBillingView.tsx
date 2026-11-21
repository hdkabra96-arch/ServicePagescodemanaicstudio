import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  Edit3,
  FileSpreadsheet,
  FileText,
  Loader2,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  X
} from 'lucide-react';
import { saasApi, SaasApiError, type SubscriptionPayload } from '../../services/saasApi';
import type {
  PlanDefinition,
  SaasClient,
  SaasInvoice,
  SaasOrganization,
  SubscriptionPlanId
} from '../../types/saas';
import {
  exportSheetsToExcel,
  exportSingleInvoicePdf,
  exportTableToPdf
} from '../../utils/saasExports';

interface SaasBillingViewProps {
  org: SaasOrganization;
  onDataMutated: () => void;
}

type BillingSubTab = 'invoices' | 'subscription';

const STATUS_STYLE: Record<SaasInvoice['status'], string> = {
  paid: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  sent: 'text-[#1769AA] bg-sky-50 border-sky-200',
  overdue: 'text-rose-700 bg-rose-50 border-rose-200',
  draft: 'text-[#486581] bg-slate-50 border-slate-200',
  void: 'text-slate-500 bg-slate-100 border-slate-200 line-through'
};

const PLAN_AUDIENCE: Record<SubscriptionPlanId, string> = {
  starter: 'For early-stage teams launching their first client workspaces',
  growth: 'For growing agencies and studios managing active client pipelines',
  enterprise: 'For scaling multi-client operations needing high tenant quotas'
};

function formatMoney(amount: number, currency = 'INR'): string {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('en-IN')}`;
  }
}

function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const SaasBillingView: React.FC<SaasBillingViewProps> = ({ org, onDataMutated }) => {
  const role = org.memberRole || 'member';
  const canWriteInvoices = role === 'admin' || role === 'manager';
  const isAdmin = role === 'admin';

  const [subTab, setSubTab] = useState<BillingSubTab>('invoices');
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Invoices state
  const [invoices, setInvoices] = useState<SaasInvoice[]>([]);
  const [summary, setSummary] = useState({ paidTotal: 0, sentTotal: 0, overdueTotal: 0, draftTotal: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('issued_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [invoicesError, setInvoicesError] = useState('');
  const [clients, setClients] = useState<SaasClient[]>([]);

  // Invoice Modal & Inline actions
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SaasInvoice | null>(null);
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const defaultDueStr = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

  const [form, setForm] = useState({
    clientId: '',
    invoiceNumber: '',
    title: '',
    amount: '',
    currency: 'INR',
    status: 'sent' as SaasInvoice['status'],
    issuedAt: todayStr,
    dueAt: defaultDueStr,
    paymentMethod: 'Bank Transfer / UPI',
    notes: ''
  });

  // Subscription state
  const [subscription, setSubscription] = useState<SubscriptionPayload | null>(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [subError, setSubError] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlanTarget, setSelectedPlanTarget] = useState<PlanDefinition | null>(null);
  const [planPaymentMethod, setPlanPaymentMethod] = useState('Corporate Card / UPI');
  const [changingPlan, setChangingPlan] = useState(false);
  const [planModalError, setPlanModalError] = useState('');

  const loadInvoices = useCallback(async () => {
    setLoadingInvoices(true);
    setInvoicesError('');
    try {
      const res = await saasApi.getInvoices(org.id, {
        search: search.trim() || undefined,
        status: statusFilter,
        sortBy,
        sortDir,
        page,
        limit: 10
      });
      setInvoices(res.data);
      setSummary(res.summary);
      setPagination(res.pagination);
    } catch (err) {
      setInvoicesError(err instanceof SaasApiError ? err.message : 'Unable to load workspace invoices.');
    } finally {
      setLoadingInvoices(false);
    }
  }, [org.id, search, statusFilter, sortBy, sortDir, page]);

  const loadSubscription = useCallback(async () => {
    setLoadingSub(true);
    setSubError('');
    try {
      const res = await saasApi.getSubscription(org.id);
      setSubscription(res.data);
    } catch (err) {
      setSubError(err instanceof SaasApiError ? err.message : 'Unable to load subscription details.');
    } finally {
      setLoadingSub(false);
    }
  }, [org.id]);

  const loadClientsList = useCallback(async () => {
    try {
      const res = await saasApi.getClients(org.id, { limit: 50, sortBy: 'company_name', sortDir: 'asc' });
      setClients(res.data);
    } catch {
      // ignore non-critical dropdown preload error
    }
  }, [org.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadInvoices();
    }, 160);
    return () => clearTimeout(t);
  }, [loadInvoices]);

  useEffect(() => {
    loadSubscription();
    loadClientsList();
  }, [loadSubscription, loadClientsList]);

  const openCreateModal = () => {
    setEditing(null);
    setFormError('');
    setForm({
      clientId: '',
      invoiceNumber: '',
      title: '',
      amount: '',
      currency: 'INR',
      status: 'sent',
      issuedAt: new Date().toISOString().slice(0, 10),
      dueAt: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      paymentMethod: 'Bank Transfer / UPI',
      notes: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (inv: SaasInvoice) => {
    setEditing(inv);
    setFormError('');
    setForm({
      clientId: inv.clientId || '',
      invoiceNumber: inv.invoiceNumber,
      title: inv.title,
      amount: String(inv.amount),
      currency: inv.currency || 'INR',
      status: inv.status,
      issuedAt: inv.issuedAt,
      dueAt: inv.dueAt,
      paymentMethod: inv.paymentMethod || 'Bank Transfer / UPI',
      notes: inv.notes || ''
    });
    setModalOpen(true);
  };

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInvoice(true);
    setFormError('');
    try {
      const payload: Partial<SaasInvoice> = {
        clientId: form.clientId || null,
        title: form.title.trim(),
        amount: Number(form.amount),
        currency: form.currency,
        status: form.status,
        issuedAt: form.issuedAt,
        dueAt: form.dueAt,
        paymentMethod: form.paymentMethod.trim() || 'Bank Transfer / UPI',
        notes: form.notes.trim()
      };
      if (!editing && form.invoiceNumber.trim()) {
        payload.invoiceNumber = form.invoiceNumber.trim().toUpperCase();
      }

      if (editing) {
        const res = await saasApi.updateInvoice(org.id, editing.id, payload);
        setBanner({ type: 'success', text: res.message });
      } else {
        const res = await saasApi.createInvoice(org.id, payload);
        setBanner({ type: 'success', text: res.message });
      }
      setModalOpen(false);
      await loadInvoices();
      onDataMutated();
    } catch (err) {
      setFormError(err instanceof SaasApiError ? err.message : 'Unable to save invoice.');
    } finally {
      setSavingInvoice(false);
    }
  };

  const handleMarkPaid = async (inv: SaasInvoice) => {
    setMarkingPaidId(inv.id);
    setBanner(null);
    try {
      await saasApi.updateInvoice(org.id, inv.id, { status: 'paid' });
      setBanner({ type: 'success', text: `Invoice ${inv.invoiceNumber} marked as Paid.` });
      await loadInvoices();
      onDataMutated();
    } catch (err) {
      setBanner({
        type: 'error',
        text: err instanceof SaasApiError ? err.message : 'Unable to update invoice status.'
      });
    } finally {
      setMarkingPaidId(null);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    setBanner(null);
    try {
      const res = await saasApi.deleteInvoice(org.id, invoiceId);
      setBanner({ type: 'success', text: res.message });
      setConfirmDeleteId(null);
      await loadInvoices();
      onDataMutated();
    } catch (err) {
      setBanner({
        type: 'error',
        text: err instanceof SaasApiError ? err.message : 'Unable to delete invoice.'
      });
      setConfirmDeleteId(null);
    }
  };

  const handleExportPdf = () => {
    exportTableToPdf({
      title: 'Invoices & Receivables Ledger',
      subtitle: `Filtered billing records (${pagination.total} total)`,
      workspaceName: org.name,
      fileNamePrefix: `${org.slug}-invoices`,
      summaryMetrics: [
        { label: 'Paid Revenue', value: formatMoney(summary.paidTotal) },
        { label: 'Sent / Pending', value: formatMoney(summary.sentTotal) },
        { label: 'Overdue', value: formatMoney(summary.overdueTotal) },
        { label: 'Drafts', value: formatMoney(summary.draftTotal) }
      ],
      columns: ['Invoice No.', 'Client', 'Description', 'Issued', 'Due', 'Status', 'Amount'],
      rows: invoices.map((i) => [
        i.invoiceNumber,
        i.clientName || 'Direct Workspace Billing',
        i.title,
        i.issuedAt,
        i.dueAt,
        i.status.toUpperCase(),
        formatMoney(i.amount, i.currency)
      ])
    });
  };

  const handleExportExcel = () => {
    exportSheetsToExcel({
      fileNamePrefix: `${org.slug}-invoices`,
      sheets: [
        {
          sheetName: 'Invoices',
          rows: invoices.map((i) => ({
            Invoice_Number: i.invoiceNumber,
            Client: i.clientName || 'Direct Workspace Billing',
            Title: i.title,
            Currency: i.currency,
            Amount: i.amount,
            Status: i.status,
            Issued_At: i.issuedAt,
            Due_At: i.dueAt,
            Paid_At: i.paidAt || '',
            Payment_Method: i.paymentMethod,
            Notes: i.notes
          }))
        }
      ]
    });
  };

  const handleConfirmPlanChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanTarget) return;
    setChangingPlan(true);
    setPlanModalError('');
    try {
      const res = await saasApi.changeSubscriptionPlan(org.id, {
        planId: selectedPlanTarget.id,
        billingCycle,
        paymentMethod: planPaymentMethod.trim() || 'Workspace Billing Invoice'
      });
      setBanner({ type: 'success', text: res.message });
      setSelectedPlanTarget(null);
      await Promise.all([loadSubscription(), loadInvoices()]);
      onDataMutated();
    } catch (err) {
      setPlanModalError(err instanceof SaasApiError ? err.message : 'Unable to switch subscription plan.');
    } finally {
      setChangingPlan(false);
    }
  };

  const getCyclePrice = (plan: PlanDefinition) =>
    billingCycle === 'annual' ? Math.round(plan.monthlyPriceInr * 12 * 0.8) : plan.monthlyPriceInr;

  const getMonthlyEquivalent = (plan: PlanDefinition) =>
    billingCycle === 'annual' ? Math.round(plan.monthlyPriceInr * 0.8) : plan.monthlyPriceInr;

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tab Control */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#1769AA]">Revenue & Subscription Operations</p>
          <h1 className="text-2xl font-extrabold text-[#102A43] mt-0.5">Billing & Subscription Plans</h1>
          <p className="text-sm text-[#486581] mt-1">
            Issue client invoices, record payments, download PDF receipts, and govern tenant quotas for{' '}
            <span className="font-semibold text-[#102A43]">{org.name}</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white border border-[#D8ECFB]">
            <button
              type="button"
              onClick={() => setSubTab('invoices')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                subTab === 'invoices'
                  ? 'bg-[#1769AA] text-white shadow-xs'
                  : 'text-[#486581] hover:text-[#102A43] hover:bg-[#F5FAFF]'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Invoices & Receivables</span>
            </button>
            <button
              type="button"
              onClick={() => setSubTab('subscription')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                subTab === 'subscription'
                  ? 'bg-[#1769AA] text-white shadow-xs'
                  : 'text-[#486581] hover:text-[#102A43] hover:bg-[#F5FAFF]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Subscription & Quotas</span>
            </button>
          </div>

          {subTab === 'invoices' && canWriteInvoices && (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1769AA] hover:bg-[#12558C] text-white text-xs font-bold shadow-sm shadow-[#1769AA]/20 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Invoice</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
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
          <button type="button" onClick={() => setBanner(null)} className="cursor-pointer" aria-label="Dismiss notice">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 1: INVOICES & RECEIVABLES
      ===================================================================== */}
      {subTab === 'invoices' && (
        <div className="space-y-6">
          {/* 4 Live SQL Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-[#D8ECFB] p-5">
              <p className="text-xs font-semibold text-[#486581]">Paid Revenue</p>
              <p className="text-2xl font-extrabold text-[#102A43] mt-1.5 tabular-nums">
                {formatMoney(summary.paidTotal)}
              </p>
              <p className="text-xs text-emerald-700 font-medium mt-1">Settled invoices</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#D8ECFB] p-5">
              <p className="text-xs font-semibold text-[#486581]">Sent / Pending</p>
              <p className="text-2xl font-extrabold text-[#102A43] mt-1.5 tabular-nums">
                {formatMoney(summary.sentTotal)}
              </p>
              <p className="text-xs text-[#1769AA] font-medium mt-1">Awaiting payment</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#D8ECFB] p-5">
              <p className="text-xs font-semibold text-[#486581]">Overdue Balance</p>
              <p className="text-2xl font-extrabold text-[#102A43] mt-1.5 tabular-nums">
                {formatMoney(summary.overdueTotal)}
              </p>
              <p className="text-xs text-rose-700 font-medium mt-1">Action required</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#D8ECFB] p-5">
              <p className="text-xs font-semibold text-[#486581]">Draft Pipeline</p>
              <p className="text-2xl font-extrabold text-[#102A43] mt-1.5 tabular-nums">
                {formatMoney(summary.draftTotal)}
              </p>
              <p className="text-xs text-[#627D98] font-medium mt-1">Unissued drafts</p>
            </div>
          </div>

          {/* Search, Filter, Sort & Export Toolbar */}
          <div className="bg-white rounded-2xl border border-[#D8ECFB] p-4 flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#627D98] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search invoice number, title, or client..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm text-[#102A43] focus:outline-hidden focus:ring-2 focus:ring-[#5BB6F5]/40 focus:border-[#1769AA]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter invoices by status"
                className="px-3 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-xs font-semibold text-[#102A43]"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="sent">Sent</option>
                <option value="overdue">Overdue</option>
                <option value="draft">Draft</option>
                <option value="void">Void</option>
              </select>

              <select
                value={`${sortBy}:${sortDir}`}
                onChange={(e) => {
                  const [col, dir] = e.target.value.split(':');
                  setSortBy(col);
                  setSortDir(dir as 'asc' | 'desc');
                  setPage(1);
                }}
                aria-label="Sort invoices"
                className="px-3 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-xs font-semibold text-[#102A43]"
              >
                <option value="issued_at:desc">Newest Issued</option>
                <option value="due_at:asc">Earliest Due Date</option>
                <option value="amount:desc">Highest Amount</option>
                <option value="amount:asc">Lowest Amount</option>
                <option value="status:asc">Status A–Z</option>
              </select>

              <button
                type="button"
                disabled={invoices.length === 0}
                onClick={handleExportPdf}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#EEF7FF] disabled:opacity-40 border border-[#CBE2F6] text-xs font-bold text-[#1769AA] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>

              <button
                type="button"
                disabled={invoices.length === 0}
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#EEF7FF] disabled:opacity-40 border border-[#CBE2F6] text-xs font-bold text-[#1769AA] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-2xl border border-[#D8ECFB] overflow-hidden">
            <div className="px-6 py-3.5 bg-[#F8FBFF] border-b border-[#E6F2FC] flex items-center justify-between text-xs">
              <span className="font-bold text-[#486581] tabular-nums">
                Showing {invoices.length} of {pagination.total} invoices
              </span>
              <span className="text-[#627D98]">
                Paid invoices are locked from deletion for audit compliance
              </span>
            </div>

            {loadingInvoices ? (
              <div className="p-10 text-center text-sm text-[#627D98] flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#1769AA]" />
                <span>Loading billing ledger...</span>
              </div>
            ) : invoicesError ? (
              <div className="p-10 text-center">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-[#102A43]">{invoicesError}</p>
                <button
                  type="button"
                  onClick={loadInvoices}
                  className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1769AA] text-white text-xs font-bold cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            ) : invoices.length === 0 ? (
              <div className="p-12 text-center">
                <Receipt className="w-9 h-9 text-[#5BB6F5] mx-auto mb-2.5" />
                <h3 className="text-sm font-extrabold text-[#102A43]">No invoices found</h3>
                <p className="text-xs text-[#627D98] mt-1">
                  {search || statusFilter !== 'all'
                    ? 'Try clearing your search term or status filter.'
                    : 'Issue your first client invoice to begin tracking revenue and receipts.'}
                </p>
                {canWriteInvoices && (
                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1769AA] text-white text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Issue First Invoice</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F5FAFF] text-[11px] font-bold uppercase tracking-wider text-[#627D98] border-b border-[#E6F2FC]">
                      <th className="py-3 px-6">Invoice & Description</th>
                      <th className="py-3 px-4">Client / Method</th>
                      <th className="py-3 px-4">Issued / Due</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDF6FD] text-sm">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-[#F9FCFF] transition-colors">
                        <td className="py-3.5 px-6">
                          <p className="font-mono text-xs font-bold text-[#1769AA]">{inv.invoiceNumber}</p>
                          <p className="font-bold text-[#102A43] mt-0.5">{inv.title}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-xs font-bold text-[#334E68]">
                            {inv.clientName || 'Direct Workspace Billing'}
                          </p>
                          <p className="text-[11px] text-[#627D98] mt-0.5">{inv.paymentMethod}</p>
                        </td>
                        <td className="py-3.5 px-4 text-xs tabular-nums">
                          <p className="text-[#334E68] font-medium">Issued: {formatDateShort(inv.issuedAt)}</p>
                          <p className="text-[#627D98] mt-0.5">
                            {inv.paidAt ? `Paid: ${formatDateShort(inv.paidAt)}` : `Due: ${formatDateShort(inv.dueAt)}`}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block text-[11px] font-bold capitalize px-2.5 py-0.5 rounded-md border ${
                              STATUS_STYLE[inv.status]
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-[#102A43] tabular-nums whitespace-nowrap">
                          {formatMoney(inv.amount, inv.currency)}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          {confirmDeleteId === inv.id ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleDeleteInvoice(inv.id)}
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
                              {canWriteInvoices && inv.status !== 'paid' && inv.status !== 'void' && (
                                <button
                                  type="button"
                                  disabled={markingPaidId === inv.id}
                                  onClick={() => handleMarkPaid(inv)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold border border-emerald-200 whitespace-nowrap cursor-pointer"
                                  title="Mark invoice as Paid"
                                >
                                  {markingPaidId === inv.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="w-3 h-3" />
                                  )}
                                  <span>Mark Paid</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  exportSingleInvoicePdf({
                                    workspaceName: org.name,
                                    billingEmail: org.billingEmail,
                                    invoiceNumber: inv.invoiceNumber,
                                    title: inv.title,
                                    clientName: inv.clientName || 'Direct Workspace Billing',
                                    amount: inv.amount,
                                    currency: inv.currency,
                                    status: inv.status,
                                    issuedAt: inv.issuedAt,
                                    dueAt: inv.dueAt,
                                    paidAt: inv.paidAt,
                                    paymentMethod: inv.paymentMethod,
                                    notes: inv.notes
                                  })
                                }
                                className="p-1.5 rounded-lg text-[#1769AA] hover:bg-[#EBF6FF] cursor-pointer"
                                title="Download PDF Receipt"
                                aria-label={`Download PDF receipt for ${inv.invoiceNumber}`}
                              >
                                <Download className="w-4 h-4" />
                              </button>

                              {canWriteInvoices && (
                                <button
                                  type="button"
                                  onClick={() => openEditModal(inv)}
                                  className="p-1.5 rounded-lg text-[#486581] hover:bg-[#F0F7FF] hover:text-[#1769AA] cursor-pointer"
                                  title="Edit invoice"
                                  aria-label={`Edit ${inv.invoiceNumber}`}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              )}

                              {isAdmin && inv.status !== 'paid' && (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(inv.id)}
                                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                                  title="Delete invoice"
                                  aria-label={`Delete ${inv.invoiceNumber}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
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
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 2: SUBSCRIPTION PLANS & USAGE QUOTAS
      ===================================================================== */}
      {subTab === 'subscription' && (
        <div className="space-y-6">
          {loadingSub ? (
            <div className="bg-white rounded-2xl border border-[#D8ECFB] p-12 text-center text-sm text-[#627D98] flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#1769AA]" />
              <span>Loading subscription & tenant quotas...</span>
            </div>
          ) : subError || !subscription ? (
            <div className="bg-white rounded-2xl border border-[#D8ECFB] p-10 text-center">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-[#102A43]">{subError || 'Unable to load subscription.'}</p>
              <button
                type="button"
                onClick={loadSubscription}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1769AA] text-white text-xs font-bold cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          ) : (
            <>
              {/* Active Plan & Live Usage Quotas Card */}
              <div className="bg-white rounded-2xl border border-[#D8ECFB] p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#E6F2FC]">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#627D98]">
                      <span className="font-bold text-[#1769AA] uppercase">{subscription.activePlan.name} Plan</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize font-semibold text-emerald-700">{subscription.subscriptionStatus}</span>
                      <span aria-hidden="true">·</span>
                      <span>Renews {formatDateShort(subscription.currentPeriodEnd)}</span>
                    </div>
                    <h2 className="text-xl font-extrabold text-[#102A43] mt-1">
                      {formatMoney(subscription.activePlan.monthlyPriceInr)}
                      <span className="text-sm font-medium text-[#627D98]"> / month base tier</span>
                    </h2>
                    <p className="text-xs text-[#486581] mt-1">
                      Billing contact: <span className="font-semibold text-[#102A43]">{subscription.billingEmail}</span>
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 max-w-md bg-[#F5FAFF] border border-[#D4E8FA] rounded-xl px-4 py-3 text-xs text-[#334E68]">
                    <ShieldCheck className="w-4 h-4 text-[#1769AA] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#102A43]">
                        {subscription.paymentGatewayConfigured
                          ? 'External Payment Gateway Connected'
                          : 'Internal Billing Ledger Mode'}
                      </p>
                      <p className="text-[#486581] mt-0.5 leading-relaxed">
                        {subscription.paymentGatewayConfigured
                          ? 'Live Stripe/Razorpay credentials are configured in server environment variables.'
                          : 'Plan transitions atomically update tenant quotas, write an audit entry, and generate a paid subscription invoice receipt. Add STRIPE_SECRET_KEY or RAZORPAY_KEY_ID in production env to charge cards automatically.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Live SQL Usage Progress Meters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    {
                      label: 'Team Seats',
                      used: subscription.usage.members.used,
                      limit: subscription.usage.members.limit
                    },
                    {
                      label: 'Clients CRM',
                      used: subscription.usage.clients.used,
                      limit: subscription.usage.clients.limit
                    },
                    {
                      label: 'Projects Portfolio',
                      used: subscription.usage.projects.used,
                      limit: subscription.usage.projects.limit
                    }
                  ].map((meter) => {
                    const pct = Math.min(100, Math.round((meter.used / Math.max(1, meter.limit)) * 100));
                    const barColor =
                      pct >= 90 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-[#1769AA]';
                    return (
                      <div key={meter.label} className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#334E68]">{meter.label}</span>
                          <span className="font-extrabold text-[#102A43] tabular-nums">
                            {meter.used} / {meter.limit} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-[#EAF5FF] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Billing Cycle Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#102A43]">Compare & Switch Workspace Plans</h3>
                  <p className="text-xs text-[#486581] mt-0.5">
                    {isAdmin
                      ? 'Downgrades are automatically validated against current workspace usage to protect live data.'
                      : 'Only workspace Admins can change subscription plans. Contact your Admin to upgrade quotas.'}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white border border-[#D8ECFB] self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                      billingCycle === 'monthly'
                        ? 'bg-[#1769AA] text-white'
                        : 'text-[#486581] hover:text-[#102A43]'
                    }`}
                  >
                    Monthly Billing
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('annual')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                      billingCycle === 'annual'
                        ? 'bg-[#1769AA] text-white'
                        : 'text-[#486581] hover:text-[#102A43]'
                    }`}
                  >
                    Annual (Save 20%)
                  </button>
                </div>
              </div>

              {/* 3 Plan Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {subscription.plans.map((plan) => {
                  const isCurrent = plan.id === subscription.planId;
                  const monthlyEq = getMonthlyEquivalent(plan);
                  const cycleTotal = getCyclePrice(plan);

                  return (
                    <div
                      key={plan.id}
                      className={`bg-white rounded-2xl p-6 flex flex-col justify-between border transition-colors ${
                        isCurrent
                          ? 'border-[#1769AA] ring-2 ring-[#5BB6F5]/30'
                          : 'border-[#D8ECFB] hover:border-[#5BB6F5]'
                      }`}
                    >
                      <div className="space-y-5">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-lg font-extrabold text-[#102A43]">{plan.name}</h4>
                            {isCurrent && (
                              <span className="text-xs font-bold text-[#1769AA]">Current Plan</span>
                            )}
                          </div>
                          <p className="text-xs text-[#486581] mt-1 leading-relaxed">
                            {PLAN_AUDIENCE[plan.id]}
                          </p>
                        </div>

                        <div>
                          <p className="text-3xl font-extrabold text-[#102A43] tabular-nums">
                            {formatMoney(monthlyEq)}
                            <span className="text-xs font-semibold text-[#627D98]"> / mo</span>
                          </p>
                          <p className="text-xs text-[#627D98] mt-1 tabular-nums">
                            {billingCycle === 'annual'
                              ? `Billed ${formatMoney(cycleTotal)} yearly (20% savings)`
                              : `Approx. $${plan.monthlyPriceUsd} USD / month`}
                          </p>
                        </div>

                        {/* Concrete Quota Matrix */}
                        <div className="py-3.5 border-y border-[#E6F2FC] grid grid-cols-2 gap-y-2 text-xs">
                          <span className="text-[#627D98]">Team Seats</span>
                          <span className="text-right font-bold text-[#102A43] tabular-nums">
                            Up to {plan.maxMembers}
                          </span>
                          <span className="text-[#627D98]">Client Accounts</span>
                          <span className="text-right font-bold text-[#102A43] tabular-nums">
                            Up to {plan.maxClients}
                          </span>
                          <span className="text-[#627D98]">Active Projects</span>
                          <span className="text-right font-bold text-[#102A43] tabular-nums">
                            Up to {plan.maxProjects}
                          </span>
                          <span className="text-[#627D98]">Cloud Storage</span>
                          <span className="text-right font-bold text-[#102A43] tabular-nums">
                            {plan.maxStorageMb >= 1024
                              ? `${Math.round(plan.maxStorageMb / 1024)} GB`
                              : `${plan.maxStorageMb} MB`}
                          </span>
                        </div>

                        {/* Feature List */}
                        <ul className="space-y-2 text-xs text-[#334E68]">
                          {plan.features.map((feat) => (
                            <li key={feat} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-[#1769AA] shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-6">
                        {isCurrent ? (
                          <button
                            type="button"
                            disabled
                            className="w-full py-2.5 px-4 rounded-xl bg-[#EEF7FF] text-[#1769AA] text-xs font-bold cursor-default"
                          >
                            Active Workspace Plan
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={!isAdmin}
                            onClick={() => {
                              setPlanModalError('');
                              setSelectedPlanTarget(plan);
                            }}
                            className={`w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors ${
                              isAdmin
                                ? 'bg-[#1769AA] hover:bg-[#12558C] text-white cursor-pointer'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <span>
                              {plan.monthlyPriceInr > subscription.activePlan.monthlyPriceInr
                                ? `Upgrade to ${plan.name}`
                                : `Switch to ${plan.name}`}
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* =====================================================================
          MODAL 1: CREATE / EDIT INVOICE
      ===================================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#102A43]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D4E8FA] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-[#E6F2FC] flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#102A43]">
                {editing ? `Edit Invoice ${editing.invoiceNumber}` : 'Issue New Invoice'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-[#627D98] hover:bg-[#F0F7FF] cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Invoice Description / Title</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Monthly Cloud Platform Retainer — Nov 2026"
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
                    <option value="">Direct Workspace Billing</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                </div>

                {!editing && (
                  <div>
                    <label className="block text-xs font-bold text-[#334E68] mb-1">
                      Invoice No. <span className="font-normal text-[#627D98]">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={form.invoiceNumber}
                      onChange={(e) => setForm((f) => ({ ...f, invoiceNumber: e.target.value }))}
                      placeholder="Auto-generated if blank"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Amount</label>
                  <input
                    type="number"
                    required
                    min={1}
                    step="any"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="50000"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as SaasInvoice['status'] }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="void">Void</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Payment Method</label>
                  <input
                    type="text"
                    value={form.paymentMethod}
                    onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Issued Date</label>
                  <input
                    type="date"
                    value={form.issuedAt}
                    onChange={(e) => setForm((f) => ({ ...f, issuedAt: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Due Date</label>
                  <input
                    type="date"
                    value={form.dueAt}
                    onChange={(e) => setForm((f) => ({ ...f, dueAt: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm tabular-nums"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#334E68] mb-1">Invoice Notes</label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Payment instructions, milestone reference, or GST/tax details..."
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
                  disabled={savingInvoice}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1769AA] hover:bg-[#12558C] disabled:opacity-60 text-white text-xs font-bold cursor-pointer"
                >
                  {savingInvoice && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editing ? 'Save Invoice' : 'Issue Invoice'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: CONFIRM SUBSCRIPTION PLAN CHANGE
      ===================================================================== */}
      {selectedPlanTarget && subscription && (
        <div className="fixed inset-0 z-50 bg-[#102A43]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D4E8FA] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E6F2FC] flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#102A43]">
                Confirm Plan Change — {selectedPlanTarget.name}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedPlanTarget(null)}
                className="p-1.5 rounded-lg text-[#627D98] hover:bg-[#F0F7FF] cursor-pointer"
                aria-label="Close plan modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPlanChange} className="p-6 space-y-4">
              {planModalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{planModalError}</span>
                </div>
              )}

              <div className="p-4 rounded-xl bg-[#F5FAFF] border border-[#D4E8FA] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#627D98]">Plan Transition</span>
                  <span className="font-bold text-[#102A43]">
                    {subscription.activePlan.name} → {selectedPlanTarget.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#627D98]">Billing Cycle</span>
                  <span className="font-bold text-[#102A43] capitalize">{billingCycle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#627D98]">New Quotas</span>
                  <span className="font-bold text-[#102A43] tabular-nums">
                    {selectedPlanTarget.maxMembers} seats · {selectedPlanTarget.maxClients} clients ·{' '}
                    {selectedPlanTarget.maxProjects} projects
                  </span>
                </div>
                <div className="pt-2 mt-2 border-t border-[#D4E8FA] flex justify-between text-sm">
                  <span className="font-bold text-[#334E68]">Receipt Amount</span>
                  <span className="font-extrabold text-[#1769AA] tabular-nums">
                    {formatMoney(getCyclePrice(selectedPlanTarget))}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334E68] mb-1">Billing Payment Method</label>
                <select
                  value={planPaymentMethod}
                  onChange={(e) => setPlanPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#CBE2F6] bg-[#FAFDFE] text-sm"
                >
                  <option value="Corporate Card / UPI">Corporate Card / UPI</option>
                  <option value="NEFT / Wire Transfer">NEFT / Wire Transfer</option>
                  <option value="Workspace Billing Invoice">Workspace Billing Invoice</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlanTarget(null)}
                  className="px-4 py-2 rounded-xl border border-[#CBE2F6] text-xs font-bold text-[#486581] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPlan}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1769AA] hover:bg-[#12558C] disabled:opacity-60 text-white text-xs font-bold cursor-pointer"
                >
                  {changingPlan && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm & Activate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

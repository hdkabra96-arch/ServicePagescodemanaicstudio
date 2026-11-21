import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  IndianRupee,
  Loader2,
  RefreshCw,
  TrendingUp,
  Users
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { AnalyticsPayload, saasApi, SaasApiError } from '../../services/saasApi';
import type { SaasOrganization } from '../../types/saas';
import { exportSheetsToExcel, exportTableToPdf } from '../../utils/saasExports';

interface SaasAnalyticsViewProps {
  org: SaasOrganization;
}

function formatInr(v: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(v);
}

export const SaasAnalyticsView: React.FC<SaasAnalyticsViewProps> = ({ org }) => {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportNotice, setExportNotice] = useState('');

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await saasApi.getAnalytics(org.id);
      setData(res.data);
    } catch (err) {
      setError(err instanceof SaasApiError ? err.message : 'Unable to load analytics.');
    } finally {
      setIsLoading(false);
    }
  }, [org.id]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleExportPdf = () => {
    if (!data) return;
    exportTableToPdf({
      title: 'Executive Analytics & Delivery Report',
      subtitle: 'Live SQL Portfolio & Revenue Summary',
      workspaceName: org.name,
      fileNamePrefix: `${org.slug}-analytics-report`,
      summaryMetrics: [
        { label: 'Collection Rate', value: `${data.summary.collectionRatePct}%` },
        { label: 'Paid Revenue', value: formatInr(data.summary.paidTotal) },
        { label: 'Budget Utilization', value: `${data.summary.budgetUtilizationPct}%` },
        { label: 'Task Completion', value: `${data.summary.taskCompletionRatePct}%` }
      ],
      columns: ['Project Code', 'Project Name', 'Status', 'Progress', 'Budget (INR)', 'Spent (INR)'],
      rows: data.projectBudgetComparison.map((p) => [
        p.code,
        p.name,
        p.status,
        `${p.progress}%`,
        formatInr(p.budget),
        formatInr(p.spent)
      ])
    });
    setExportNotice('PDF Executive Report downloaded.');
    setTimeout(() => setExportNotice(''), 3000);
  };

  const handleExportExcel = () => {
    if (!data) return;
    exportSheetsToExcel({
      fileNamePrefix: `${org.slug}-analytics-workbook`,
      sheets: [
        {
          sheetName: 'Executive Summary',
          rows: [
            { Metric: 'Collection Rate (%)', Value: data.summary.collectionRatePct },
            { Metric: 'Paid Revenue (INR)', Value: data.summary.paidTotal },
            { Metric: 'Open Receivables (INR)', Value: data.summary.openTotal },
            { Metric: 'Overdue Receivables (INR)', Value: data.summary.overdueTotal },
            { Metric: 'Budget Utilization (%)', Value: data.summary.budgetUtilizationPct },
            { Metric: 'Task Completion Rate (%)', Value: data.summary.taskCompletionRatePct },
            { Metric: 'Average Active Retainer (INR)', Value: data.summary.avgActiveRetainer },
            { Metric: 'Total Estimated Task Hours', Value: data.summary.totalEstimatedHours }
          ]
        },
        {
          sheetName: 'Monthly Revenue',
          rows: data.revenueTrend.map((r) => ({
            Month: r.month,
            Collected_INR: r.collected,
            Sent_INR: r.sent,
            Overdue_INR: r.overdue
          }))
        },
        {
          sheetName: 'Project Budgets',
          rows: data.projectBudgetComparison.map((p) => ({
            Code: p.code,
            Project: p.name,
            Status: p.status,
            Progress_Pct: p.progress,
            Budget_INR: p.budget,
            Spent_INR: p.spent
          }))
        },
        {
          sheetName: 'Team Workload',
          rows: data.teamWorkload.map((t) => ({
            Member: t.memberName,
            Role: t.role,
            Total_Tasks: t.totalTasks,
            Completed_Tasks: t.completedTasks,
            Open_Tasks: t.openTasks,
            Estimated_Hours: t.estimatedHours
          }))
        }
      ]
    });
    setExportNotice('Multi-sheet Excel (.xlsx) workbook downloaded.');
    setTimeout(() => setExportNotice(''), 3000);
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-sm text-[#627D98] flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#1769AA]" />
        <span>Computing live SQL analytics...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-10 text-center max-w-lg mx-auto">
        <AlertCircle className="w-9 h-9 text-rose-500 mx-auto mb-2" />
        <p className="text-sm font-bold text-[#102A43]">{error || 'Unable to load analytics.'}</p>
        <button
          type="button"
          onClick={loadAnalytics}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1769AA] text-white text-xs font-bold cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const s = data.summary;

  return (
    <div className="space-y-6">
      {/* Header + Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#1769AA]">Intelligence & Reporting</p>
          <h1 className="text-2xl font-extrabold text-[#102A43] mt-0.5">Analytics & Executive Reports</h1>
          <p className="text-sm text-[#486581] mt-1">
            Real-time financial, portfolio, and team throughput metrics computed directly from {org.name}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#EEF7FF] border border-[#CBE2F6] text-xs font-bold text-[#1769AA] cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1769AA] hover:bg-[#12558C] text-white text-xs font-bold shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Download className="w-4 h-4 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 4 Executive Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#D8ECFB] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#486581]">Invoice Collection Rate</span>
            <IndianRupee className="w-4 h-4 text-[#1769AA]" />
          </div>
          <p className="text-2xl font-extrabold text-[#102A43] tabular-nums mt-2.5">{s.collectionRatePct}%</p>
          <p className="text-xs text-[#627D98] mt-1 tabular-nums">{formatInr(s.paidTotal)} collected</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#D8ECFB] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#486581]">Budget Utilization</span>
            <BarChart3 className="w-4 h-4 text-[#1769AA]" />
          </div>
          <p className="text-2xl font-extrabold text-[#102A43] tabular-nums mt-2.5">{s.budgetUtilizationPct}%</p>
          <p className="text-xs text-[#627D98] mt-1">Across active & launched projects</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#D8ECFB] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#486581]">Task Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#102A43] tabular-nums mt-2.5">{s.taskCompletionRatePct}%</p>
          <p className="text-xs text-[#627D98] mt-1 tabular-nums">{s.totalEstimatedHours} total estimated hrs</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#D8ECFB] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#486581]">Avg Active Retainer</span>
            <TrendingUp className="w-4 h-4 text-[#28C7FA]" />
          </div>
          <p className="text-2xl font-extrabold text-[#102A43] tabular-nums mt-2.5">
            {formatInr(s.avgActiveRetainer)}
          </p>
          <p className="text-xs text-[#627D98] mt-1">Per active retainer account</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Collection Trend */}
        <div className="bg-white rounded-2xl border border-[#D8ECFB] p-6 shadow-xs">
          <h2 className="text-base font-extrabold text-[#102A43]">Monthly Billing Breakdown</h2>
          <p className="text-xs text-[#627D98] mt-0.5 mb-4">Collected vs sent & overdue invoices by issue month</p>
          {data.revenueTrend.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-[#627D98] bg-[#F8FBFF] rounded-xl border border-dashed border-[#CFE4F7]">
              No invoice history recorded yet.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6F2FC" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#627D98' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#627D98' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                  />
                  <Tooltip formatter={(val: any) => formatInr(Number(val || 0))} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="collected" name="Collected" stroke="#1769AA" fill="#5BB6F5" fillOpacity={0.28} strokeWidth={2.2} />
                  <Area type="monotone" dataKey="sent" name="Sent" stroke="#28C7FA" fill="#28C7FA" fillOpacity={0.18} strokeWidth={2} />
                  <Area type="monotone" dataKey="overdue" name="Overdue" stroke="#E11D48" fill="#FB7185" fillOpacity={0.18} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Project Budget vs Spent */}
        <div className="bg-white rounded-2xl border border-[#D8ECFB] p-6 shadow-xs">
          <h2 className="text-base font-extrabold text-[#102A43]">Project Budget vs Actual Spend</h2>
          <p className="text-xs text-[#627D98] mt-0.5 mb-4">Live financial comparison by project code</p>
          {data.projectBudgetComparison.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-[#627D98] bg-[#F8FBFF] rounded-xl border border-dashed border-[#CFE4F7]">
              No projects recorded yet.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.projectBudgetComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6F2FC" vertical={false} />
                  <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#627D98' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#627D98' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                  />
                  <Tooltip formatter={(val: any) => formatInr(Number(val || 0))} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="budget" name="Budget" fill="#5BB6F5" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="spent" name="Spent" fill="#1769AA" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Client Retainers by Industry */}
        <div className="bg-white rounded-2xl border border-[#D8ECFB] p-6 shadow-xs">
          <h2 className="text-base font-extrabold text-[#102A43]">Retainer Value by Industry</h2>
          <p className="text-xs text-[#627D98] mt-0.5 mb-4">Monthly recurring revenue distribution across verticals</p>
          {data.clientsByIndustry.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-[#627D98] bg-[#F8FBFF] rounded-xl border border-dashed border-[#CFE4F7]">
              Add clients to view industry breakdown.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.clientsByIndustry} layout="vertical" margin={{ left: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6F2FC" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#627D98' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="industry"
                    width={100}
                    tick={{ fontSize: 11, fill: '#334E68' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip formatter={(val: any) => formatInr(Number(val || 0))} />
                  <Bar dataKey="retainerTotal" name="Monthly Retainer" fill="#28C7FA" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Team Task Delivery Throughput */}
        <div className="bg-white rounded-2xl border border-[#D8ECFB] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-[#102A43]">Team Task Workload</h2>
              <p className="text-xs text-[#627D98] mt-0.5">Open vs completed tasks assigned per team member</p>
            </div>
            <Users className="w-4 h-4 text-[#5BB6F5]" />
          </div>
          {data.teamWorkload.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-[#627D98] bg-[#F8FBFF] rounded-xl border border-dashed border-[#CFE4F7]">
              No team workload data yet.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.teamWorkload}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6F2FC" vertical={false} />
                  <XAxis dataKey="memberName" tick={{ fontSize: 11, fill: '#627D98' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#627D98' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="completedTasks" name="Completed" stackId="a" fill="#1769AA" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="openTasks" name="Open" stackId="a" fill="#5BB6F5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

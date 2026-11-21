import React, { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Clock,
  FolderKanban,
  IndianRupee,
  RefreshCw,
  Shield,
  TrendingUp,
  Users
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { DashboardPayload, saasApi, SaasApiError } from '../../services/saasApi';
import type { SaasOrganization, SaasUser } from '../../types/saas';

interface SaasDashboardViewProps {
  org: SaasOrganization;
  user: SaasUser;
  onOpenTeamSettings: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  planning: 'Planning',
  in_progress: 'In Progress',
  review: 'In Review',
  launched: 'Launched',
  on_hold: 'On Hold',
  todo: 'To Do',
  done: 'Done'
};

const STATUS_BADGE_STYLES: Record<string, string> = {
  planning: 'bg-sky-50 text-[#1769AA] border-sky-200',
  in_progress: 'bg-[#E6F6FF] text-[#0E5A94] border-[#B4E1FA]',
  review: 'bg-amber-50 text-amber-800 border-amber-200',
  launched: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  on_hold: 'bg-slate-100 text-slate-600 border-slate-200',
  todo: 'bg-slate-100 text-slate-700 border-slate-200',
  done: 'bg-emerald-50 text-emerald-700 border-emerald-200'
};

function formatCurrencyInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const SaasDashboardView: React.FC<SaasDashboardViewProps> = ({
  org,
  user,
  onOpenTeamSettings
}) => {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await saasApi.getDashboard(org.id);
      setData(res.data);
    } catch (err) {
      setError(err instanceof SaasApiError ? err.message : 'Unable to load workspace analytics.');
    } finally {
      setIsLoading(false);
    }
  }, [org.id]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white border border-[#DCEEFB]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 rounded-2xl bg-white border border-[#DCEEFB]" />
          <div className="h-72 rounded-2xl bg-white border border-[#DCEEFB]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-[#102A43]">Unable to Load Dashboard</h3>
        <p className="text-sm text-[#486581] mt-1 mb-5">{error || 'No dashboard metrics returned.'}</p>
        <button
          type="button"
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1769AA] text-white text-xs font-bold hover:bg-[#12558C] cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Query</span>
        </button>
      </div>
    );
  }

  const isPrivileged = data.role === 'admin' || data.role === 'manager';
  const k = data.kpis;

  const projectChartData = data.charts.projectsByStatus.map((row) => ({
    name: STATUS_LABELS[row.status] || row.status,
    count: row.count
  }));

  const usageMeters = [
    { label: 'Team Seats', used: data.usage.members.used, limit: data.usage.members.limit },
    { label: 'Client Accounts', used: data.usage.clients.used, limit: data.usage.clients.limit },
    { label: 'Active Projects', used: data.usage.projects.used, limit: data.usage.projects.limit }
  ];

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#1769AA]">
            {isPrivileged ? 'Executive Workspace Overview' : 'My Workspace Overview'}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A43] tracking-tight mt-0.5">
            Welcome back, {user.fullName.split(' ')[0]}
          </h1>
          <p className="text-sm text-[#486581] mt-1">
            Live metrics for <span className="font-semibold text-[#102A43]">{org.name}</span> — synced directly from
            your tenant database.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadDashboard}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-[#EEF7FF] border border-[#CFE4F7] text-xs font-bold text-[#1769AA] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
          {isPrivileged && (
            <button
              type="button"
              onClick={onOpenTeamSettings}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1769AA] hover:bg-[#12558C] text-white text-xs font-bold shadow-sm shadow-[#1769AA]/20 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Manage Team</span>
            </button>
          )}
        </div>
      </div>

      {/* Role-Aware KPI Cards (100% SQL Aggregated) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isPrivileged ? (
          <>
            <div className="bg-white rounded-2xl p-5 border border-[#D8ECFB] shadow-xs hover:shadow-md hover:shadow-sky-900/5 transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#486581]">Collected Revenue</span>
                <div className="w-9 h-9 rounded-xl bg-[#EBF6FF] text-[#1769AA] flex items-center justify-center">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-[#102A43] tabular-nums mt-3">
                {formatCurrencyInr(k.paidRevenue)}
              </p>
              <p className="text-xs text-[#627D98] mt-1.5 tabular-nums">
                {formatCurrencyInr(k.pendingReceivables)} pending ({k.overdueInvoices} overdue)
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#D8ECFB] shadow-xs hover:shadow-md hover:shadow-sky-900/5 transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#486581]">Active Retainer MRR</span>
                <div className="w-9 h-9 rounded-xl bg-[#E7FAFF] text-[#0E7490] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-[#102A43] tabular-nums mt-3">
                {formatCurrencyInr(k.monthlyRetainerMrr)}
              </p>
              <p className="text-xs text-[#627D98] mt-1.5 tabular-nums">
                {k.activeClients} active of {k.totalClients} total clients
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#D8ECFB] shadow-xs hover:shadow-md hover:shadow-sky-900/5 transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#486581]">Active Projects</span>
                <div className="w-9 h-9 rounded-xl bg-[#EBF6FF] text-[#1769AA] flex items-center justify-center">
                  <FolderKanban className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-[#102A43] tabular-nums mt-3">{k.activeProjects}</p>
              <p className="text-xs text-[#627D98] mt-1.5 tabular-nums">
                {k.avgProjectProgress}% avg completion · {k.launchedProjects} launched
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#D8ECFB] shadow-xs hover:shadow-md hover:shadow-sky-900/5 transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#486581]">Open Deliverables</span>
                <div className="w-9 h-9 rounded-xl bg-[#EBF6FF] text-[#1769AA] flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-[#102A43] tabular-nums mt-3">{k.openTasks}</p>
              <p className="text-xs text-[#627D98] mt-1.5 tabular-nums">
                {k.completedTasks} completed across {k.teamMembers} team members
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-2xl p-5 border border-[#D8ECFB] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#486581]">My Open Tasks</span>
                <div className="w-9 h-9 rounded-xl bg-[#EBF6FF] text-[#1769AA] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-[#102A43] tabular-nums mt-3">{k.myOpenTasks}</p>
              <p className="text-xs text-[#627D98] mt-1.5">Assigned directly to you</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#D8ECFB] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#486581]">Active Projects</span>
                <div className="w-9 h-9 rounded-xl bg-[#EBF6FF] text-[#1769AA] flex items-center justify-center">
                  <FolderKanban className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-[#102A43] tabular-nums mt-3">{k.activeProjects}</p>
              <p className="text-xs text-[#627D98] mt-1.5 tabular-nums">{k.avgProjectProgress}% avg workspace progress</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#D8ECFB] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#486581]">Tasks Completed</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-[#102A43] tabular-nums mt-3">{k.completedTasks}</p>
              <p className="text-xs text-[#627D98] mt-1.5 tabular-nums">Of {k.totalTasks} total workspace tasks</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#D8ECFB] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#486581]">Workspace Team</span>
                <div className="w-9 h-9 rounded-xl bg-[#EBF6FF] text-[#1769AA] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-[#102A43] tabular-nums mt-3">{k.teamMembers}</p>
              <p className="text-xs text-[#627D98] mt-1.5">Collaborators in {org.name}</p>
            </div>
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Receivables Chart (Admin/Manager) or Project Pipeline (Member) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D8ECFB] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-extrabold text-[#102A43]">
                {isPrivileged ? 'Invoice Revenue vs Receivables' : 'Workspace Project Pipeline'}
              </h2>
              <p className="text-xs text-[#627D98] mt-0.5">
                {isPrivileged
                  ? 'Monthly collected and outstanding billing grouped from tenant invoices'
                  : 'Live project counts grouped by delivery stage'}
              </p>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1769AA] bg-[#EBF6FF] px-2.5 py-1 rounded-lg">
              Live SQL
            </span>
          </div>

          {isPrivileged ? (
            data.charts.revenueByMonth.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.charts.revenueByMonth} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="saasCollectedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1769AA" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#5BB6F5" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="saasPendingGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#28C7FA" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#28C7FA" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E6F2FC" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#627D98' }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#627D98' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                    />
                    <Tooltip
                      formatter={(val: any) => formatCurrencyInr(Number(val || 0))}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #D6E9FA',
                        fontSize: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="collected"
                      name="Collected"
                      stroke="#1769AA"
                      strokeWidth={2.5}
                      fill="url(#saasCollectedGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="pending"
                      name="Pending"
                      stroke="#28C7FA"
                      strokeWidth={2}
                      fill="url(#saasPendingGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center bg-[#F8FBFF] rounded-xl border border-dashed border-[#CFE4F7] px-6">
                <Briefcase className="w-8 h-8 text-[#5BB6F5] mb-2" />
                <p className="text-sm font-bold text-[#102A43]">No billing records yet</p>
                <p className="text-xs text-[#627D98] mt-1 max-w-sm">
                  Your new workspace starts clean. Revenue trends will populate automatically as invoices are created.
                </p>
              </div>
            )
          ) : projectChartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectChartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6F2FC" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#627D98' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#627D98' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #D6E9FA',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="count" name="Projects" fill="#5BB6F5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center bg-[#F8FBFF] rounded-xl border border-dashed border-[#CFE4F7]">
              <FolderKanban className="w-8 h-8 text-[#5BB6F5] mb-2" />
              <p className="text-sm font-bold text-[#102A43]">No active projects in this workspace</p>
            </div>
          )}
        </div>

        {/* Plan Usage & Capacity Card */}
        <div className="bg-white rounded-2xl border border-[#D8ECFB] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#102A43]">Plan Capacity</h2>
                <p className="text-xs text-[#627D98] mt-0.5">
                  Active tier: <span className="font-bold text-[#1769AA] uppercase">{org.planId}</span>
                </p>
              </div>
              <Shield className="w-5 h-5 text-[#5BB6F5]" />
            </div>

            <div className="space-y-4 mt-5">
              {usageMeters.map((m) => {
                const pct = Math.min(100, Math.round((m.used / Math.max(1, m.limit)) * 100));
                return (
                  <div key={m.label}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-[#334E68]">{m.label}</span>
                      <span className="font-bold text-[#102A43] tabular-nums">
                        {m.used} / {m.limit}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#EBF5FF] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 90 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-[#5BB6F5]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E6F2FC]">
            <div className="flex items-center justify-between text-xs text-[#627D98]">
              <span>Renewal Date</span>
              <span className="font-semibold text-[#102A43] tabular-nums">
                {formatRelativeDate(org.currentPeriodEnd)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#627D98] mt-1.5">
              <span>Your Role</span>
              <span className="font-bold uppercase text-[#1769AA]">{data.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Active Projects Table + Recent Audit Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#D8ECFB] shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E6F2FC] flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#102A43]">Active Workspace Projects</h2>
              <p className="text-xs text-[#627D98]">Latest tenant deliverables and completion progress</p>
            </div>
            <span className="text-xs font-bold text-[#486581] tabular-nums">
              {data.recentProjects.length} shown
            </span>
          </div>

          {data.recentProjects.length === 0 ? (
            <div className="p-10 text-center">
              <FolderKanban className="w-8 h-8 text-[#5BB6F5] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#102A43]">No projects created yet</p>
              <p className="text-xs text-[#627D98] mt-1">
                Projects created for this tenant workspace will appear here with real-time progress tracking.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5FAFF] text-[11px] font-bold uppercase tracking-wider text-[#627D98] border-b border-[#E6F2FC]">
                    <th className="py-3 px-6">Project</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Progress</th>
                    <th className="py-3 px-6 text-right">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF6FD] text-sm">
                  {data.recentProjects.map((prj) => (
                    <tr key={prj.id} className="hover:bg-[#F9FCFF] transition-colors">
                      <td className="py-3.5 px-6">
                        <p className="font-bold text-[#102A43]">{prj.name}</p>
                        <p className="text-xs text-[#627D98] font-mono">{prj.code}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-[#334E68]">{prj.clientName}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
                            STATUS_BADGE_STYLES[prj.status] || 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {STATUS_LABELS[prj.status] || prj.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-[#E6F2FC] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#1769AA]"
                              style={{ width: `${prj.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-[#102A43] tabular-nums">{prj.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-right text-xs text-[#486581] tabular-nums">
                        {prj.dueDate ? formatRelativeDate(prj.dueDate) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Audit Trail */}
        <div className="bg-white rounded-2xl border border-[#D8ECFB] shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E6F2FC] flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#102A43]">Recent Activity</h2>
              <p className="text-xs text-[#627D98]">Recorded workspace audit trail</p>
            </div>
            <Activity className="w-4 h-4 text-[#5BB6F5]" />
          </div>

          {data.recentActivity.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#627D98]">No activity events recorded yet.</div>
          ) : (
            <div className="divide-y divide-[#EDF6FD]">
              {data.recentActivity.map((item) => (
                <div key={item.id} className="px-6 py-3.5">
                  <p className="text-xs font-semibold text-[#102A43] leading-snug">{item.summary}</p>
                  <div className="flex items-center justify-between gap-2 mt-1.5 text-[11px] text-[#627D98]">
                    <span className="truncate">{item.actorEmail}</span>
                    <span className="shrink-0 tabular-nums">{formatRelativeDate(item.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

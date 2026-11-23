import React, { useState } from 'react';
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
import {
  BookOpen,
  Building2,
  Bus,
  CalendarClock,
  ClipboardCheck,
  GraduationCap,
  IndianRupee,
  Megaphone,
  Plus,
  RefreshCw,
  Trash2,
  Users,
  X
} from 'lucide-react';
import type {
  AnnouncementRecord,
  EduManageDashboardData,
  EduManagePermissions,
  SchoolSettings
} from '../../types/edumanage';

interface EduManageDashboardViewProps {
  dashboard: EduManageDashboardData | null;
  school: SchoolSettings;
  permissions: EduManagePermissions;
  isLoading: boolean;
  onRefresh: () => void;
  onPublishAnnouncement: (payload: {
    title: string;
    message: string;
    audience: AnnouncementRecord['audience'];
    priority: AnnouncementRecord['priority'];
  }) => Promise<void>;
  onDeleteAnnouncement: (id: string) => Promise<void>;
}

function formatInr(amount: number, symbol: string): string {
  return `${symbol}${Math.round(amount).toLocaleString('en-IN')}`;
}

export const EduManageDashboardView: React.FC<EduManageDashboardViewProps> = ({
  dashboard,
  school,
  permissions,
  isLoading,
  onRefresh,
  onPublishAnnouncement,
  onDeleteAnnouncement
}) => {
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [noticeAudience, setNoticeAudience] = useState<AnnouncementRecord['audience']>('all');
  const [noticePriority, setNoticePriority] = useState<AnnouncementRecord['priority']>('normal');
  const [noticeError, setNoticeError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const sym = school.currencySymbol || '₹';

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setNoticeError(null);
    if (!noticeTitle.trim() || !noticeMessage.trim()) {
      setNoticeError('Enter both a title and notice message.');
      return;
    }
    setIsPublishing(true);
    try {
      await onPublishAnnouncement({
        title: noticeTitle.trim(),
        message: noticeMessage.trim(),
        audience: noticeAudience,
        priority: noticePriority
      });
      setNoticeTitle('');
      setNoticeMessage('');
      setNoticeAudience('all');
      setNoticePriority('normal');
      setShowNoticeModal(false);
    } catch (err: any) {
      setNoticeError(err?.message || 'Failed to publish announcement.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading && !dashboard) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white border border-[#DCEAF7] rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-white border border-[#DCEAF7] rounded-xl" />
          <div className="h-72 bg-white border border-[#DCEAF7] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="bg-white border border-[#DCEAF7] rounded-xl p-8 text-center">
        <p className="text-sm text-[#486581]">Unable to load live school dashboard.</p>
        <button
          onClick={onRefresh}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1769AA] text-white text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const { kpis } = dashboard;

  return (
    <div className="space-y-6">
      {/* Page Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43] tracking-tight">
            Campus Operations Dashboard
          </h1>
          <p className="text-xs text-[#486581] mt-0.5">
            {school.schoolName} · {school.boardAffiliation} · Active Session{' '}
            <span className="font-semibold text-[#1769AA]">
              {dashboard.activeSession?.name || '2026-27'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {permissions.canManageAnnouncements && (
            <button
              onClick={() => setShowNoticeModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1769AA] hover:bg-[#12558C] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish Notice</span>
            </button>
          )}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-[#F0F7FE] text-[#334E68] border border-[#DCEAF7] text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid — 4 Core Institutional Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-[#DCEAF7] rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#627D98]">Active Students</span>
            <GraduationCap className="w-4.5 h-4.5 text-[#1769AA]" />
          </div>
          <div className="text-3xl font-bold text-[#102A43] tabular-nums mt-2">
            {kpis.totalStudents}
          </div>
          <div className="text-xs text-[#486581] mt-1.5">
            {kpis.totalClasses} classes · {kpis.totalSections} sections
          </div>
        </div>

        <div className="bg-white border border-[#DCEAF7] rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#627D98]">Faculty &amp; Teachers</span>
            <Users className="w-4.5 h-4.5 text-[#1769AA]" />
          </div>
          <div className="text-3xl font-bold text-[#102A43] tabular-nums mt-2">
            {kpis.totalTeachers}
          </div>
          <div className="text-xs text-[#486581] mt-1.5">
            Active teaching staff assigned
          </div>
        </div>

        <div className="bg-white border border-[#DCEAF7] rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#627D98]">Today&apos;s Attendance</span>
            <ClipboardCheck className="w-4.5 h-4.5 text-[#16A085]" />
          </div>
          <div className="text-3xl font-bold text-[#16A085] tabular-nums mt-2">
            {kpis.todayAttendancePct}%
          </div>
          <div className="text-xs text-[#486581] mt-1.5 tabular-nums">
            {kpis.todayPresentCount} present · {kpis.todayAbsentCount} absent
          </div>
        </div>

        <div className="bg-white border border-[#DCEAF7] rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#627D98]">Fee Collection</span>
            <IndianRupee className="w-4.5 h-4.5 text-[#1769AA]" />
          </div>
          <div className="text-3xl font-bold text-[#102A43] tabular-nums mt-2">
            {formatInr(kpis.feeCollectedTotal, sym)}
          </div>
          <div className="text-xs text-[#486581] mt-1.5 tabular-nums">
            Pending {formatInr(kpis.pendingFeesTotal, sym)} · {kpis.collectionRatePct}% recovered
          </div>
        </div>
      </div>

      {/* Secondary Campus Operations Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#DCEAF7] rounded-xl px-4 py-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-[#627D98]">Classes &amp; Sections</div>
            <div className="text-lg font-bold text-[#102A43] tabular-nums mt-0.5">
              {kpis.totalClasses} / {kpis.totalSections}
            </div>
          </div>
          <Building2 className="w-4.5 h-4.5 text-[#5BB6F5]" />
        </div>

        <div className="bg-white border border-[#DCEAF7] rounded-xl px-4 py-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-[#627D98]">Upcoming Exams</div>
            <div className="text-lg font-bold text-[#102A43] tabular-nums mt-0.5">
              {kpis.upcomingExamsCount}
            </div>
          </div>
          <CalendarClock className="w-4.5 h-4.5 text-[#1769AA]" />
        </div>

        <div className="bg-white border border-[#DCEAF7] rounded-xl px-4 py-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-[#627D98]">Library Issued</div>
            <div className="text-lg font-bold text-[#102A43] tabular-nums mt-0.5">
              {kpis.activeBooksIssued}{' '}
              <span className="text-xs font-medium text-[#D97706]">
                ({kpis.overdueBooksCount} overdue)
              </span>
            </div>
          </div>
          <BookOpen className="w-4.5 h-4.5 text-[#16A085]" />
        </div>

        <div className="bg-white border border-[#DCEAF7] rounded-xl px-4 py-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-[#627D98]">Transport Routes</div>
            <div className="text-lg font-bold text-[#102A43] tabular-nums mt-0.5">
              {kpis.activeTransportRoutes} active
            </div>
          </div>
          <Bus className="w-4.5 h-4.5 text-[#1769AA]" />
        </div>
      </div>

      {/* Analytics Charts Row 1: Attendance Trend + Class Academic Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#DCEAF7] rounded-xl p-5">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-[#102A43]">Attendance Trend (Recent Days)</h2>
            <p className="text-xs text-[#627D98] mt-0.5">
              Daily percentage of students marked present or late across active classes
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.attendanceTrend} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="eduAttendanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A085" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#16A085" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6F0FA" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#486581' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#486581' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'Attendance']}
                  contentStyle={{ borderRadius: 10, borderColor: '#DCEAF7', fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="presentPct"
                  stroke="#16A085"
                  strokeWidth={2.5}
                  fill="url(#eduAttendanceGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-[#DCEAF7] rounded-xl p-5">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-[#102A43]">Academic Performance by Class</h2>
            <p className="text-xs text-[#627D98] mt-0.5">
              Average score &amp; pass percentage from evaluated examinations
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.academicPerformanceByClass} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6F0FA" vertical={false} />
                <XAxis dataKey="className" tick={{ fontSize: 11, fill: '#486581' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#486581' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value}%`,
                    name === 'avgPct' ? 'Avg Score' : 'Pass Rate'
                  ]}
                  contentStyle={{ borderRadius: 10, borderColor: '#DCEAF7', fontSize: 12 }}
                />
                <Legend
                  formatter={(val) => (val === 'avgPct' ? 'Average Score %' : 'Pass Rate %')}
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Bar dataKey="avgPct" fill="#1769AA" radius={[5, 5, 0, 0]} maxBarSize={32} />
                <Bar dataKey="passRatePct" fill="#5BB6F5" radius={[5, 5, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analytics Row 2: Fee Breakdown + Upcoming Examinations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white border border-[#DCEAF7] rounded-xl p-5">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-[#102A43]">Fee Collection vs Pending by Category</h2>
            <p className="text-xs text-[#627D98] mt-0.5">
              Real-time reconciliation across tuition, transport, and laboratory dues
            </p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.feeBreakdownByCategory} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6F0FA" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#486581' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#486581' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    formatInr(Number(value), sym),
                    name === 'collected' ? 'Collected' : 'Pending'
                  ]}
                  contentStyle={{ borderRadius: 10, borderColor: '#DCEAF7', fontSize: 12 }}
                />
                <Legend
                  formatter={(val) => (val === 'collected' ? 'Collected' : 'Pending Dues')}
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Bar dataKey="collected" fill="#16A085" radius={[5, 5, 0, 0]} maxBarSize={32} />
                <Bar dataKey="pending" fill="#F59E0B" radius={[5, 5, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white border border-[#DCEAF7] rounded-xl p-5">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-[#102A43]">Examination Schedule</h2>
            <p className="text-xs text-[#627D98] mt-0.5">
              Scheduled and recently published school examinations
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E6F0FA] text-[11px] font-semibold uppercase tracking-wider text-[#627D98]">
                  <th className="py-2.5 pr-3">Examination</th>
                  <th className="py-2.5 px-3">Dates</th>
                  <th className="py-2.5 px-3 text-right">Subjects</th>
                  <th className="py-2.5 pl-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF4FB] text-xs">
                {dashboard.upcomingExams.map((ex) => (
                  <tr key={ex.id} className="hover:bg-[#FAFDFE]">
                    <td className="py-3 pr-3 font-semibold text-[#102A43]">{ex.name}</td>
                    <td className="py-3 px-3 text-[#486581] tabular-nums whitespace-nowrap">
                      {ex.startDate} to {ex.endDate}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-[#334E68]">
                      {ex.subjectCount}
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <span
                        className={`font-semibold capitalize ${
                          ex.status === 'published'
                            ? 'text-[#16A085]'
                            : ex.status === 'scheduled'
                            ? 'text-[#1769AA]'
                            : 'text-[#486581]'
                        }`}
                      >
                        {ex.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {dashboard.upcomingExams.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#627D98]">
                      No examinations scheduled yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Announcements + Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-[#DCEAF7] rounded-xl p-5">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#1769AA]" />
              <h2 className="text-sm font-bold text-[#102A43]">School Notice Board</h2>
            </div>
            <span className="text-xs text-[#627D98] tabular-nums">
              {dashboard.announcements.length} notices
            </span>
          </div>

          <div className="divide-y divide-[#EDF4FB]">
            {dashboard.announcements.map((notice) => (
              <div key={notice.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-sm font-semibold text-[#102A43]">{notice.title}</span>
                    {notice.priority === 'urgent' && (
                      <span className="text-[11px] font-bold text-[#DC2626] uppercase">Urgent</span>
                    )}
                    {notice.priority === 'important' && (
                      <span className="text-[11px] font-bold text-[#D97706] uppercase">Important</span>
                    )}
                  </div>
                  <p className="text-xs text-[#486581] leading-relaxed">{notice.message}</p>
                  <div className="text-[11px] text-[#829AB1]">
                    Audience: <span className="capitalize text-[#486581]">{notice.audience}</span> ·
                    Posted by {notice.publishedByName}
                  </div>
                </div>
                {permissions.canViewAuditLogs && (
                  <button
                    onClick={() => onDeleteAnnouncement(notice.id)}
                    title="Delete notice"
                    className="p-1.5 rounded-lg text-[#829AB1] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            {dashboard.announcements.length === 0 && (
              <p className="text-xs text-[#627D98] py-4 text-center">
                No notices published for your role yet.
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-[#DCEAF7] rounded-xl p-5">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-[#102A43]">Recent Campus Activity</h2>
            <p className="text-xs text-[#627D98] mt-0.5">Live audit trail of key operations</p>
          </div>
          <div className="divide-y divide-[#EDF4FB]">
            {dashboard.recentActivities.map((act) => (
              <div key={act.id} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#102A43] truncate">
                    {act.action.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] text-[#829AB1] capitalize shrink-0">
                    {act.module}
                  </span>
                </div>
                <div className="text-[11px] text-[#627D98] mt-0.5">
                  {act.actorName} ({act.actorRole.replace(/_/g, ' ')})
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Publish Announcement Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 bg-[#102A43]/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DCEAF7] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#102A43]">Publish School Notice</h3>
              <button
                onClick={() => setShowNoticeModal(false)}
                className="p-1 rounded-lg text-[#627D98] hover:text-[#102A43] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {noticeError && (
              <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B]">
                {noticeError}
              </div>
            )}

            <form onSubmit={handlePublish} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#334E68] mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g., Inter-House Science Exhibition Schedule"
                  className="w-full px-3.5 py-2 rounded-lg border border-[#CBDCEB] text-sm focus:outline-none focus:border-[#1769AA]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Audience</label>
                  <select
                    value={noticeAudience}
                    onChange={(e) => setNoticeAudience(e.target.value as AnnouncementRecord['audience'])}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-sm bg-white focus:outline-none focus:border-[#1769AA]"
                  >
                    <option value="all">All Campus</option>
                    <option value="parents">Parents</option>
                    <option value="students">Students</option>
                    <option value="teachers">Teachers</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334E68] mb-1">Priority</label>
                  <select
                    value={noticePriority}
                    onChange={(e) => setNoticePriority(e.target.value as AnnouncementRecord['priority'])}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBDCEB] text-sm bg-white focus:outline-none focus:border-[#1769AA]"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334E68] mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  placeholder="Write the official school circular details..."
                  className="w-full px-3.5 py-2 rounded-lg border border-[#CBDCEB] text-sm focus:outline-none focus:border-[#1769AA]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#CBDCEB] text-xs font-semibold text-[#486581] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-4 py-2 rounded-lg bg-[#1769AA] hover:bg-[#12558C] text-white text-xs font-semibold disabled:opacity-60 cursor-pointer"
                >
                  {isPublishing ? 'Publishing...' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Briefcase,
  CalendarRange,
  ChevronDown,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  NotebookPen,
  Settings,
  Shield,
  Users,
  X
} from 'lucide-react';
import { eduManageApi } from '../../api/edumanageClient';
import type {
  AnnouncementRecord,
  AuditLogRecord,
  EduManageDashboardData,
  EduManageDemoAccount,
  EduManagePermissions,
  EduManageUser,
  SchoolSettings
} from '../../types/edumanage';
import { EduManageLandingView } from './EduManageLandingView';
import { EduManageLoginView } from './EduManageLoginView';
import { EduManageDashboardView } from './EduManageDashboardView';
import { EduManageSettingsView } from './EduManageSettingsView';
import { EduManageStudentsView } from './EduManageStudentsView';
import { EduManageTeachersView } from './EduManageTeachersView';
import { EduManageAttendanceView } from './EduManageAttendanceView';
import { EduManageTimetableView } from './EduManageTimetableView';
import { EduManageHomeworkView } from './EduManageHomeworkView';

interface EduManageAppProps {
  onBackToStudio: () => void;
}

type EduSurface = 'landing' | 'login' | 'workspace';
type EduTab =
  | 'dashboard'
  | 'students'
  | 'teachers'
  | 'attendance'
  | 'timetable'
  | 'homework'
  | 'announcements'
  | 'audit-logs'
  | 'settings';

export const EduManageApp: React.FC<EduManageAppProps> = ({ onBackToStudio }) => {
  const [surface, setSurface] = useState<EduSurface>('landing');
  const [activeTab, setActiveTab] = useState<EduTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const [demoAccounts, setDemoAccounts] = useState<EduManageDemoAccount[]>([]);
  const [demoSchoolMeta, setDemoSchoolMeta] = useState({
    schoolName: 'Meridian Academy',
    boardAffiliation: 'CBSE Affiliated'
  });

  const [user, setUser] = useState<EduManageUser | null>(null);
  const [permissions, setPermissions] = useState<EduManagePermissions | null>(null);
  const [school, setSchool] = useState<SchoolSettings | null>(null);
  const [activeSessionName, setActiveSessionName] = useState('2026-27');

  const [dashboard, setDashboard] = useState<EduManageDashboardData | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);

  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  const fetchWorkspaceData = useCallback(async (perms: EduManagePermissions) => {
    setIsLoadingDashboard(true);
    try {
      const [dash, notices] = await Promise.all([
        eduManageApi.getDashboard(),
        eduManageApi.getAnnouncements()
      ]);
      setDashboard(dash);
      setAnnouncements(notices);
      if (dash.activeSession?.name) {
        setActiveSessionName(dash.activeSession.name);
      }
      if (perms.canViewAuditLogs) {
        const logs = await eduManageApi.getAuditLogs();
        setAuditLogs(logs);
      } else {
        setAuditLogs([]);
      }
    } catch {
      // handled per view
    } finally {
      setIsLoadingDashboard(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const demoMeta = await eduManageApi.getDemoAccounts();
        if (active) {
          setDemoAccounts(demoMeta.accounts || []);
          setDemoSchoolMeta({
            schoolName: demoMeta.schoolName,
            boardAffiliation: demoMeta.boardAffiliation
          });
        }
      } catch {
        // ignore
      }

      try {
        const me = await eduManageApi.getMe();
        if (active && me?.user) {
          setUser(me.user);
          setPermissions(me.permissions);
          setSchool(me.school);
          if (me.activeSessionName) setActiveSessionName(me.activeSessionName);
          setSurface('workspace');
          await fetchWorkspaceData(me.permissions);
        }
      } catch {
        // Not logged in yet; stay on landing
      } finally {
        if (active) setIsCheckingSession(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [fetchWorkspaceData]);

  const handleLogin = async (email: string, password: string) => {
    const auth = await eduManageApi.login(email, password);
    setUser(auth.user);
    setPermissions(auth.permissions);
    setSchool(auth.school);
    setActiveTab('dashboard');
    setSurface('workspace');
    setRoleSwitcherOpen(false);
    await fetchWorkspaceData(auth.permissions);
  };

  const handleQuickDemoLogin = async (account: EduManageDemoAccount) => {
    setIsSwitchingRole(true);
    try {
      await handleLogin(account.email, account.demoPassword);
    } finally {
      setIsSwitchingRole(false);
    }
  };

  const handleLogout = async () => {
    await eduManageApi.logout();
    setUser(null);
    setPermissions(null);
    setDashboard(null);
    setAnnouncements([]);
    setAuditLogs([]);
    setRoleSwitcherOpen(false);
    setSurface('login');
  };

  const handlePublishAnnouncement = async (payload: {
    title: string;
    message: string;
    audience: AnnouncementRecord['audience'];
    priority: AnnouncementRecord['priority'];
  }) => {
    await eduManageApi.createAnnouncement(payload);
    if (permissions) {
      await fetchWorkspaceData(permissions);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    await eduManageApi.deleteAnnouncement(id);
    if (permissions) {
      await fetchWorkspaceData(permissions);
    }
  };

  const handleDemoResetCompleted = async () => {
    const res = await eduManageApi.resetDemoData();
    setUser(res.user);
    setPermissions(res.permissions);
    setSchool(res.school);
    await fetchWorkspaceData(res.permissions);
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#F5FAFF] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-semibold text-[#1769AA]">
          <GraduationCap className="w-5 h-5 animate-pulse" />
          <span>Loading EduManage School ERP...</span>
        </div>
      </div>
    );
  }

  if (surface === 'landing' || !user || !permissions || !school) {
    if (surface === 'login') {
      return (
        <EduManageLoginView
          schoolName={demoSchoolMeta.schoolName}
          boardAffiliation={demoSchoolMeta.boardAffiliation}
          demoAccounts={demoAccounts}
          onLogin={handleLogin}
          onBackToLanding={() => setSurface('landing')}
        />
      );
    }
    return (
      <EduManageLandingView
        schoolName={demoSchoolMeta.schoolName}
        boardAffiliation={demoSchoolMeta.boardAffiliation}
        demoAccounts={demoAccounts}
        isLoadingDemo={isSwitchingRole}
        onOpenLogin={() => setSurface('login')}
        onQuickDemoLogin={handleQuickDemoLogin}
        onBackToStudio={onBackToStudio}
      />
    );
  }

  const canViewStudents = !permissions.isStudentPortal && !permissions.isParentPortal;
  const canViewTeachers =
    !permissions.isStudentPortal && !permissions.isParentPortal && user.role !== 'librarian';
  const canViewAttendance = permissions.canMarkAttendance || user.role === 'accountant';
  const canViewTimetable =
    permissions.canManageTimetable ||
    user.role === 'teacher' ||
    permissions.isStudentPortal;
  const canViewHomework =
    permissions.canManageHomework || permissions.isStudentPortal || permissions.isParentPortal;

  const navItems: { id: EduTab; label: string; icon: React.ComponentType<{ className?: string }>; visible: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, visible: true },
    { id: 'students', label: 'Students', icon: Users, visible: canViewStudents },
    { id: 'teachers', label: 'Teachers', icon: Briefcase, visible: canViewTeachers },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck, visible: canViewAttendance },
    { id: 'timetable', label: 'Timetable', icon: CalendarRange, visible: canViewTimetable },
    { id: 'homework', label: 'Homework', icon: NotebookPen, visible: canViewHomework },
    { id: 'announcements', label: 'Notice Board', icon: Megaphone, visible: true },
    { id: 'audit-logs', label: 'Audit Logs', icon: Shield, visible: permissions.canViewAuditLogs },
    { id: 'settings', label: 'School Settings', icon: Settings, visible: true }
  ];

  const visibleNavItems = navItems.filter((item) => item.visible);

  return (
    <div className="min-h-screen bg-[#F5FAFF] text-[#102A43] flex">
      {/* Desktop Institutional Sidebar — Deep Cobalt Navy (#0F2942) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-[#0F2942] text-white shrink-0">
        <div className="h-16 px-5 border-b border-[#1E3D5C] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#1769AA] text-white flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold tracking-tight truncate">EduManage</div>
            <div className="text-[11px] text-[#9FB3C8] truncate">{school.schoolName}</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#1769AA] text-white'
                    : 'text-[#BCCCDC] hover:bg-[#193A59] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#1E3D5C] space-y-2.5">
          <div className="text-[11px] text-[#9FB3C8]">
            Signed in as <span className="text-white font-semibold">{user.fullName}</span>
            <div className="capitalize text-[#5BB6F5]">{user.role.replace(/_/g, ' ')}</div>
          </div>
          <button
            onClick={onBackToStudio}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#BCCCDC] hover:bg-[#193A59] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Codemaniac Studio</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-64 bg-[#0F2942] text-white flex flex-col h-full shadow-2xl">
            <div className="h-16 px-4 border-b border-[#1E3D5C] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-[#5BB6F5]" />
                <span className="font-bold text-sm">EduManage</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-[#BCCCDC] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium cursor-pointer ${
                      active ? 'bg-[#1769AA] text-white' : 'text-[#BCCCDC] hover:bg-[#193A59]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-[#1E3D5C]">
              <button
                onClick={onBackToStudio}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#BCCCDC] hover:bg-[#193A59] cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Studio</span>
              </button>
            </div>
          </div>
          <div
            className="flex-1 bg-[#102A43]/40"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Clean Top Utility Bar */}
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-[#DCEAF7] px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#486581] hover:bg-[#F5FAFF] cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="text-sm font-bold text-[#102A43] truncate">{school.schoolName}</div>
              <div className="text-[11px] text-[#627D98] truncate">
                Session {activeSessionName} · {school.boardAffiliation}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Role Switcher for Client Demonstrations */}
            <div className="relative">
              <button
                onClick={() => setRoleSwitcherOpen((prev) => !prev)}
                disabled={isSwitchingRole}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F5FAFF] hover:bg-[#E6F2FC] border border-[#DCEAF7] text-xs font-semibold text-[#102A43] transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-[#1769AA]" />
                <span className="capitalize hidden sm:inline">
                  {user.role.replace(/_/g, ' ')}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#627D98]" />
              </button>

              {roleSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-[#DCEAF7] rounded-xl shadow-lg p-2 z-40">
                  <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#627D98] border-b border-[#EDF4FB] mb-1">
                    Switch Demo Role (Live Auth)
                  </div>
                  <div className="max-h-80 overflow-y-auto space-y-0.5">
                    {demoAccounts.map((acc) => (
                      <button
                        key={acc.role}
                        onClick={() => handleQuickDemoLogin(acc)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                          acc.role === user.role
                            ? 'bg-[#F0F7FE] text-[#1769AA] font-semibold'
                            : 'hover:bg-[#F5FAFF] text-[#334E68]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{acc.label}</span>
                          {acc.role === user.role && (
                            <span className="text-[10px] text-[#16A085] font-bold">Active</span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#627D98] font-normal">{acc.fullName}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCEAF7] hover:border-[#FCA5A5] hover:text-[#B91C1C] text-xs font-semibold text-[#486581] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Active Module Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {activeTab === 'dashboard' && (
            <EduManageDashboardView
              dashboard={dashboard}
              school={school}
              permissions={permissions}
              isLoading={isLoadingDashboard}
              onRefresh={() => fetchWorkspaceData(permissions)}
              onPublishAnnouncement={handlePublishAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
            />
          )}

          {activeTab === 'students' && canViewStudents && (
            <EduManageStudentsView
              permissions={permissions}
              onDataMutated={() => fetchWorkspaceData(permissions)}
            />
          )}

          {activeTab === 'teachers' && canViewTeachers && (
            <EduManageTeachersView
              permissions={permissions}
              school={school}
              onDataMutated={() => fetchWorkspaceData(permissions)}
            />
          )}

          {activeTab === 'attendance' && canViewAttendance && (
            <EduManageAttendanceView
              permissions={permissions}
              onDataMutated={() => fetchWorkspaceData(permissions)}
            />
          )}

          {activeTab === 'timetable' && canViewTimetable && (
            <EduManageTimetableView permissions={permissions} />
          )}

          {activeTab === 'homework' && canViewHomework && (
            <EduManageHomeworkView permissions={permissions} />
          )}

          {activeTab === 'announcements' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-[#102A43] tracking-tight">
                  School Notice Board
                </h1>
                <p className="text-xs text-[#486581] mt-0.5">
                  Official circulars filtered for your role ({user.role.replace(/_/g, ' ')})
                </p>
              </div>
              <div className="bg-white border border-[#DCEAF7] rounded-xl divide-y divide-[#EDF4FB]">
                {announcements.map((a) => (
                  <div key={a.id} className="p-5 space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-sm font-bold text-[#102A43]">{a.title}</h2>
                      <span className="text-[11px] font-semibold uppercase text-[#1769AA]">
                        {a.audience} · {a.priority}
                      </span>
                    </div>
                    <p className="text-xs text-[#486581] leading-relaxed">{a.message}</p>
                    <div className="text-[11px] text-[#829AB1]">
                      Published by {a.publishedByName} · {new Date(a.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
                {announcements.length === 0 && (
                  <div className="p-8 text-center text-xs text-[#627D98]">
                    No announcements available.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'audit-logs' && permissions.canViewAuditLogs && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-[#102A43] tracking-tight">
                  System Audit Logs
                </h1>
                <p className="text-xs text-[#486581] mt-0.5">
                  Server-recorded administrative, authentication, and academic actions
                </p>
              </div>

              <div className="bg-white border border-[#DCEAF7] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F5FAFF] border-b border-[#DCEAF7] text-[11px] font-semibold uppercase tracking-wider text-[#627D98]">
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Actor</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Module</th>
                        <th className="py-3 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDF4FB] text-xs">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-[#FAFDFE]">
                          <td className="py-2.5 px-4 text-[#627D98] tabular-nums whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-[#102A43]">
                            {log.actorName}
                          </td>
                          <td className="py-2.5 px-4 capitalize text-[#486581]">
                            {log.actorRole.replace(/_/g, ' ')}
                          </td>
                          <td className="py-2.5 px-4 capitalize text-[#1769AA] font-medium">
                            {log.module}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-[11px] text-[#334E68]">
                            {log.action}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <EduManageSettingsView
              school={school}
              permissions={permissions}
              onSchoolUpdated={(updated) => setSchool(updated)}
              onDemoResetCompleted={handleDemoResetCompleted}
            />
          )}
        </main>
      </div>
    </div>
  );
};

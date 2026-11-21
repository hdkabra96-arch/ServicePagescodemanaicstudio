import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  CheckCheck,
  CheckSquare,
  ChevronDown,
  FolderKanban,
  History,
  Layers,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Shield,
  UserCog,
  Users,
  X
} from 'lucide-react';
import { SaasAuthProvider, useSaasAuth } from '../../context/SaasAuthContext';
import { saasApi } from '../../services/saasApi';
import type { SaasNotification } from '../../types/saas';
import { SaasAuthView } from './SaasAuthView';
import { SaasDashboardView } from './SaasDashboardView';
import { SaasProfileView } from './SaasProfileView';
import { SaasClientsView } from './SaasClientsView';
import { SaasProjectsView } from './SaasProjectsView';
import { SaasTasksView } from './SaasTasksView';
import { SaasAnalyticsView } from './SaasAnalyticsView';
import { SaasAuditLogsView } from './SaasAuditLogsView';

type SaasNavTab = 'dashboard' | 'clients' | 'projects' | 'tasks' | 'analytics' | 'audit' | 'team' | 'profile';

interface SaasPlatformAppProps {
  onBackToStudio: () => void;
}

const SaasShellInner: React.FC<SaasPlatformAppProps> = ({ onBackToStudio }) => {
  const { user, organizations, activeOrg, isLoadingSession, setActiveOrgId, logout, refreshSession } = useSaasAuth();
  const [activeTab, setActiveTab] = useState<SaasNavTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState<SaasNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!activeOrg) return;
    try {
      const res = await saasApi.getNotifications(activeOrg.id);
      setNotifications(res.data);
      setUnreadCount(res.unreadCount);
    } catch {
      // ignore transient notification polling errors
    }
  }, [activeOrg]);

  useEffect(() => {
    if (user && activeOrg) {
      fetchNotifications();
    }
  }, [user, activeOrg, fetchNotifications]);

  const handleMarkRead = async (notifId: string) => {
    if (!activeOrg) return;
    try {
      await saasApi.markNotificationRead(activeOrg.id, notifId);
      await fetchNotifications();
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    if (!activeOrg) return;
    try {
      await saasApi.markAllNotificationsRead(activeOrg.id);
      await fetchNotifications();
    } catch {
      // ignore
    }
  };

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-[#F5FAFF] text-[#102A43] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#1769AA] animate-spin" />
        <p className="text-sm font-semibold text-[#486581]">Verifying workspace session...</p>
      </div>
    );
  }

  if (!user || !activeOrg) {
    return <SaasAuthView onBackToStudio={onBackToStudio} />;
  }

  const navItems: Array<{ id: SaasNavTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients CRM', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'tasks', label: 'Tasks & Sprints', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'audit', label: 'Audit Logs', icon: History },
    { id: 'team', label: 'Workspaces & Team', icon: Users },
    { id: 'profile', label: 'Profile & Security', icon: UserCog }
  ];

  const tabTitles: Record<SaasNavTab, string> = {
    dashboard: 'Overview',
    clients: 'Clients CRM',
    projects: 'Projects Portfolio',
    tasks: 'Tasks & Deliverables',
    analytics: 'Analytics & Reports',
    audit: 'Audit Logs Ledger',
    team: 'Workspaces & Team',
    profile: 'Profile & Security'
  };

  const roleLabel = activeOrg.memberRole || user.role;

  return (
    <div className="min-h-screen bg-[#F5FAFF] text-[#102A43] flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#102A43]/35 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-68 bg-white border-r border-[#D8ECFB] flex flex-col justify-between transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 flex flex-col gap-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1769AA] to-[#5BB6F5] flex items-center justify-center shadow-sm shadow-[#1769AA]/20">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-[#102A43] leading-none tracking-tight">CODEMANIAC</p>
                <p className="text-[10px] font-bold text-[#1769AA] tracking-widest uppercase mt-1">SaaS Cloud</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#627D98] hover:bg-[#F0F7FF] cursor-pointer"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Tenant Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOrgMenuOpen((v) => !v)}
              className="w-full p-3 rounded-xl bg-[#F5FAFF] hover:bg-[#EAF5FF] border border-[#D4E8FA] flex items-center justify-between gap-2 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#CBE2F6] text-[#1769AA] flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-[#102A43] truncate">{activeOrg.name}</p>
                  <p className="text-[10px] font-bold uppercase text-[#1769AA]">{activeOrg.planId} Plan</p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-[#627D98] shrink-0" />
            </button>

            {orgMenuOpen && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl border border-[#D4E8FA] shadow-lg py-1.5 z-20">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => {
                      setActiveOrgId(org.id);
                      setOrgMenuOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-[#F5FAFF] cursor-pointer ${
                      org.id === activeOrg.id ? 'font-bold text-[#1769AA] bg-[#EEF7FF]' : 'text-[#334E68]'
                    }`}
                  >
                    <span className="truncate">{org.name}</span>
                    <span className="text-[10px] uppercase text-[#627D98] ml-2">{org.memberRole}</span>
                  </button>
                ))}
                <div className="border-t border-[#E6F2FC] mt-1 pt-1 px-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOrgMenuOpen(false);
                      setActiveTab('team');
                      setSidebarOpen(false);
                    }}
                    className="w-full px-2 py-1.5 rounded-lg text-xs font-bold text-[#1769AA] hover:bg-[#EEF7FF] text-left cursor-pointer"
                  >
                    + Manage / Create Workspaces
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary Nav Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1769AA] text-white shadow-sm shadow-[#1769AA]/25'
                      : 'text-[#486581] hover:bg-[#F0F7FF] hover:text-[#102A43]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#28C7FA]' : 'text-[#627D98]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Footer */}
        <div className="p-4 border-t border-[#E6F2FC] space-y-2">
          <button
            type="button"
            onClick={onBackToStudio}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#1769AA] bg-[#F0F7FF] hover:bg-[#E1F1FF] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Codemaniac Studio</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#627D98] hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Glassmorphic Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/85 backdrop-blur-md border-b border-[#D8ECFB] px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#334E68] hover:bg-[#F0F7FF] cursor-pointer"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#627D98]">
              <span className="font-bold text-[#102A43]">{activeOrg.name}</span>
              <span>/</span>
              <span className="font-semibold text-[#1769AA]">{tabTitles[activeTab]}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Role Tag */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F0F7FF] border border-[#D4E8FA] text-xs font-bold text-[#1769AA] uppercase">
              <Shield className="w-3.5 h-3.5" />
              <span>{roleLabel}</span>
            </div>

            {/* Live Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                className="relative p-2 rounded-xl bg-white hover:bg-[#F0F7FF] border border-[#D8ECFB] text-[#334E68] transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#1769AA] text-white text-[10px] font-extrabold flex items-center justify-center tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#D4E8FA] shadow-xl z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#E6F2FC] flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#102A43]">Notifications ({unreadCount} unread)</span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1769AA] hover:underline cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[#EDF6FD]">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#627D98]">You are all caught up.</div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => handleMarkRead(n.id)}
                          className={`w-full text-left px-4 py-3 hover:bg-[#F5FAFF] transition-colors cursor-pointer ${
                            n.isRead ? 'bg-white' : 'bg-[#F0F8FF]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold text-[#102A43]">{n.title}</p>
                            {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#28C7FA] shrink-0 mt-1" />}
                          </div>
                          <p className="text-xs text-[#486581] mt-0.5 leading-relaxed">{n.message}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-xl bg-white hover:bg-[#F0F7FF] border border-[#D8ECFB] transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1769AA] to-[#5BB6F5] text-white text-xs font-extrabold flex items-center justify-center">
                {user.avatarInitials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-[#102A43] leading-tight">{user.fullName}</p>
                <p className="text-[10px] text-[#627D98] leading-tight">{user.jobTitle}</p>
              </div>
            </button>
          </div>
        </header>

        {/* Active View Surface */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <SaasDashboardView
              org={activeOrg}
              user={user}
              onOpenTeamSettings={() => setActiveTab('team')}
            />
          )}
          {activeTab === 'clients' && (
            <SaasClientsView
              org={activeOrg}
              onDataMutated={() => {
                refreshSession();
                fetchNotifications();
              }}
            />
          )}
          {activeTab === 'projects' && (
            <SaasProjectsView
              org={activeOrg}
              onDataMutated={() => {
                refreshSession();
                fetchNotifications();
              }}
            />
          )}
          {activeTab === 'tasks' && (
            <SaasTasksView
              org={activeOrg}
              user={user}
              onDataMutated={() => {
                refreshSession();
                fetchNotifications();
              }}
            />
          )}
          {activeTab === 'analytics' && <SaasAnalyticsView org={activeOrg} />}
          {activeTab === 'audit' && <SaasAuditLogsView org={activeOrg} />}
          {activeTab === 'team' && <SaasProfileView section="team" />}
          {activeTab === 'profile' && <SaasProfileView section="profile" />}
        </main>
      </div>
    </div>
  );
};

export const SaasPlatformApp: React.FC<SaasPlatformAppProps> = ({ onBackToStudio }) => {
  return (
    <SaasAuthProvider>
      <SaasShellInner onBackToStudio={onBackToStudio} />
    </SaasAuthProvider>
  );
};

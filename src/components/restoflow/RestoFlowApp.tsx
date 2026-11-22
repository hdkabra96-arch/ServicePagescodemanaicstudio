import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Bell,
  BookOpen,
  CheckCheck,
  ChefHat,
  ClipboardList,
  CreditCard,
  Flame,
  HeartHandshake,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Package,
  Scale,
  Settings,
  UserCheck,
  Users,
  UtensilsCrossed,
  X
} from 'lucide-react';
import { restoFlowApi } from '../../api/restoflowClient';
import type {
  RestaurantSettings,
  RestoFlowDashboardData,
  RestoFlowDemoAccountInfo,
  RestoFlowNotification,
  RestoFlowRole,
  RestoFlowRolePermissions,
  RestoFlowUser
} from '../../types/restoflow';
import { RestoFlowLandingView } from './RestoFlowLandingView';
import { RestoFlowLoginView } from './RestoFlowLoginView';
import { RestoFlowDashboardView } from './RestoFlowDashboardView';
import { RestoFlowSettingsView } from './RestoFlowSettingsView';
import { RestoFlowPosView } from './RestoFlowPosView';
import { RestoFlowWaiterView } from './RestoFlowWaiterView';
import { RestoFlowKdsView } from './RestoFlowKdsView';
import { RestoFlowMenuView } from './RestoFlowMenuView';
import { RestoFlowOrdersView } from './RestoFlowOrdersView';
import { RestoFlowInventoryView } from './RestoFlowInventoryView';
import { RestoFlowRecipesView } from './RestoFlowRecipesView';
import { RestoFlowCustomersView } from './RestoFlowCustomersView';
import { RestoFlowStaffView } from './RestoFlowStaffView';
import { RestoFlowReportsView } from './RestoFlowReportsView';

interface RestoFlowAppProps {
  onBackToStudio: () => void;
  initialMode?: 'landing' | 'login';
}

type RestoFlowTab =
  | 'dashboard'
  | 'pos'
  | 'tables'
  | 'kds'
  | 'orders'
  | 'menu'
  | 'inventory'
  | 'recipes'
  | 'customers'
  | 'staff'
  | 'reports'
  | 'settings';

function getDefaultTabForRole(role: RestoFlowRole): RestoFlowTab {
  if (role === 'cashier') return 'pos';
  if (role === 'waiter') return 'tables';
  if (role === 'kitchen') return 'kds';
  if (role === 'inventory_manager') return 'inventory';
  return 'dashboard';
}

const ROLE_LABELS: Record<RestoFlowRole, string> = {
  owner: 'Owner',
  manager: 'Manager',
  cashier: 'Cashier',
  waiter: 'Waiter',
  kitchen: 'Kitchen',
  inventory_manager: 'Inventory Mgr'
};

export const RestoFlowApp: React.FC<RestoFlowAppProps> = ({
  onBackToStudio,
  initialMode = 'landing'
}) => {
  const [screen, setScreen] = useState<'checking' | 'landing' | 'login' | 'workspace'>('checking');
  const [preselectRole, setPreselectRole] = useState<RestoFlowRole | undefined>(undefined);

  const [user, setUser] = useState<RestoFlowUser | null>(null);
  const [permissions, setPermissions] = useState<RestoFlowRolePermissions | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantSettings | null>(null);
  const [activeTab, setActiveTab] = useState<RestoFlowTab>('dashboard');

  const [dashboardData, setDashboardData] = useState<RestoFlowDashboardData | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  const [notifications, setNotifications] = useState<RestoFlowNotification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Quick role-switch popover for client presentations
  const [demoAccounts, setDemoAccounts] = useState<RestoFlowDemoAccountInfo[]>([]);
  const [roleSwitchOpen, setRoleSwitchOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState<string | null>(null);

  const loadWorkspaceData = useCallback(async () => {
    setIsLoadingDashboard(true);
    try {
      const [dashRes, notifRes] = await Promise.all([
        restoFlowApi.getDashboard(),
        restoFlowApi.getNotifications()
      ]);
      setDashboardData(dashRes.data);
      setNotifications(notifRes.data);
    } catch {
      // handled in UI state
    } finally {
      setIsLoadingDashboard(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    restoFlowApi
      .getMe()
      .then((res) => {
        if (!active) return;
        setUser(res.data.user);
        setPermissions(res.data.permissions);
        setRestaurant(res.data.restaurant);
        setActiveTab(getDefaultTabForRole(res.data.user.role));
        setScreen('workspace');
      })
      .catch(() => {
        if (!active) return;
        setScreen(initialMode === 'login' ? 'login' : 'landing');
      });

    restoFlowApi
      .getDemoAccounts()
      .then((res) => {
        if (active) setDemoAccounts(res.data.accounts);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [initialMode]);

  useEffect(() => {
    if (screen === 'workspace' && user) {
      loadWorkspaceData();
    }
  }, [screen, user, loadWorkspaceData]);

  const handleLoginSuccess = (payload: {
    user: RestoFlowUser;
    permissions: RestoFlowRolePermissions;
    restaurant: RestaurantSettings;
  }) => {
    setUser(payload.user);
    setPermissions(payload.permissions);
    setRestaurant(payload.restaurant);
    setActiveTab(getDefaultTabForRole(payload.user.role));
    setScreen('workspace');
  };

  const handleQuickSwitchRole = async (acc: RestoFlowDemoAccountInfo) => {
    setSwitchingRole(acc.role);
    try {
      const res = await restoFlowApi.login(acc.email, acc.demoPassword);
      setUser(res.data.user);
      setPermissions(res.data.permissions);
      setRestaurant(res.data.restaurant);
      setRoleSwitchOpen(false);
      setActiveTab(getDefaultTabForRole(res.data.user.role));
    } finally {
      setSwitchingRole(null);
    }
  };

  const handleLogout = async () => {
    await restoFlowApi.logout();
    setUser(null);
    setPermissions(null);
    setDashboardData(null);
    setScreen('login');
  };

  const handleMarkAllRead = async () => {
    await restoFlowApi.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  if (screen === 'checking') {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-semibold text-[#1C1917]">
          <Loader2 className="w-5 h-5 animate-spin text-[#EA580C]" />
          <span>Loading RestoFlow...</span>
        </div>
      </div>
    );
  }

  if (screen === 'landing') {
    return (
      <RestoFlowLandingView
        onOpenLogin={(role) => {
          setPreselectRole(role);
          setScreen('login');
        }}
        onBackToStudio={onBackToStudio}
      />
    );
  }

  if (screen === 'login' || !user || !permissions || !restaurant) {
    return (
      <RestoFlowLoginView
        initialRole={preselectRole}
        onLoginSuccess={handleLoginSuccess}
        onBackToLanding={() => setScreen('landing')}
      />
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const allNavItems: {
    id: RestoFlowTab;
    label: string;
    icon: React.ElementType;
    visible: boolean;
  }[] = [
    { id: 'dashboard', label: 'Live Dashboard', icon: LayoutDashboard, visible: true },
    { id: 'pos', label: 'POS Billing', icon: CreditCard, visible: permissions.canUsePos },
    {
      id: 'tables',
      label: 'Floor & Tables',
      icon: UtensilsCrossed,
      visible: ['owner', 'manager', 'waiter', 'cashier'].includes(user.role)
    },
    {
      id: 'kds',
      label: 'Kitchen Display (KDS)',
      icon: ChefHat,
      visible: ['owner', 'manager', 'kitchen', 'waiter'].includes(user.role)
    },
    {
      id: 'orders',
      label: 'Orders Ledger',
      icon: ClipboardList,
      visible: ['owner', 'manager', 'cashier', 'waiter'].includes(user.role)
    },
    {
      id: 'menu',
      label: 'Menu & 86',
      icon: BookOpen,
      visible: ['owner', 'manager', 'kitchen', 'cashier', 'waiter'].includes(user.role)
    },
    {
      id: 'inventory',
      label: 'Inventory & Stock',
      icon: Package,
      visible: ['owner', 'manager', 'inventory_manager', 'kitchen'].includes(user.role)
    },
    {
      id: 'recipes',
      label: 'Recipes & Costing',
      icon: Scale,
      visible: ['owner', 'manager', 'inventory_manager', 'kitchen'].includes(user.role)
    },
    {
      id: 'customers',
      label: 'Customers & Loyalty',
      icon: HeartHandshake,
      visible: ['owner', 'manager', 'cashier', 'waiter'].includes(user.role)
    },
    {
      id: 'staff',
      label: 'Staff & Shifts',
      icon: Users,
      visible: true
    },
    {
      id: 'reports',
      label: 'Reports & Exports',
      icon: BarChart3,
      visible: ['owner', 'manager', 'cashier', 'inventory_manager'].includes(user.role)
    },
    {
      id: 'settings',
      label: 'Restaurant Settings',
      icon: Settings,
      visible: ['owner', 'manager'].includes(user.role)
    }
  ];

  const navItems = allNavItems.filter((item) => item.visible);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E293B] flex">
      {/* Desktop Charcoal Sidebar */}
      <aside className="hidden lg:flex lg:w-64 bg-[#1C1917] text-white flex-col justify-between shrink-0 border-r border-[#292524]">
        <div className="p-5 space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EA580C] text-white flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-base leading-none tracking-tight">RestoFlow</div>
              <div className="text-[11px] text-[#A8A29E] truncate mt-1">{restaurant.name}</div>
            </div>
          </div>

          {/* Active Role Pill */}
          <div className="bg-[#292524] border border-[#3F3A36] rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#10B981]">
                {ROLE_LABELS[user.role]}
              </span>
              {user.isDemo && (
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#EA580C]/20 text-[#FB923C]">
                  Demo
                </span>
              )}
            </div>
            <div className="text-xs font-bold text-white mt-1 truncate">{user.fullName}</div>
            <div className="text-[11px] text-[#A8A29E] truncate">{user.station}</div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                    active
                      ? 'bg-[#EA580C] text-white'
                      : 'text-[#D6D3D1] hover:bg-[#292524] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#292524] space-y-2">
          <button
            onClick={() => setScreen('landing')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#D6D3D1] hover:bg-[#292524] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Product Overview</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-300 hover:bg-red-950/50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-68 bg-[#1C1917] text-white p-5 flex flex-col justify-between shadow-2xl">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EA580C] flex items-center justify-center">
                    <Flame className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-extrabold">RestoFlow</span>
                </div>
                <button onClick={() => setMobileNavOpen(false)} className="text-[#A8A29E] p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileNavOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold ${
                        activeTab === item.id ? 'bg-[#EA580C] text-white' : 'text-[#D6D3D1]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="space-y-2 border-t border-[#292524] pt-4">
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  setScreen('landing');
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#D6D3D1]"
              >
                Product Overview
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-xs font-bold text-red-300"
              >
                Sign Out
              </button>
            </div>
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileNavOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Utility Bar */}
        <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-[#E7E0D6] px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#1C1917] hover:bg-[#F6F1E7]"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-xs sm:text-sm font-bold text-[#1C1917] truncate">
              {restaurant.name}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Switch Demo Role Popover */}
            <div className="relative">
              <button
                onClick={() => {
                  setRoleSwitchOpen((prev) => !prev);
                  setNotifOpen(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF7ED] border border-[#FED7AA] text-[#C2410C] text-xs font-bold hover:bg-[#FFEDD5] transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Switch Role:</span>
                <span>{ROLE_LABELS[user.role]}</span>
              </button>

              {roleSwitchOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E7E0D6] rounded-xl shadow-xl p-2 z-40">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    Demo Role Switcher (Real Server Auth)
                  </div>
                  <div className="space-y-1">
                    {demoAccounts.map((acc) => (
                      <button
                        key={acc.role}
                        disabled={switchingRole !== null}
                        onClick={() => handleQuickSwitchRole(acc)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                          acc.role === user.role
                            ? 'bg-[#FFF7ED] text-[#EA580C] font-bold'
                            : 'hover:bg-[#FDFBF7] text-[#1E293B]'
                        }`}
                      >
                        <div>
                          <div className="font-bold">{acc.label}</div>
                          <div className="text-[10px] text-[#64748B]">{acc.fullName}</div>
                        </div>
                        {switchingRole === acc.role && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#EA580C]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen((prev) => !prev);
                  setRoleSwitchOpen(false);
                }}
                className="relative p-2 rounded-lg border border-[#E7E0D6] bg-white hover:bg-[#FDFBF7] text-[#1C1917]"
                aria-label="Operational Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EA580C] text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E7E0D6] rounded-xl shadow-xl overflow-hidden z-40">
                  <div className="px-4 py-3 border-b border-[#EFEAE2] flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#1C1917]">Role Alerts</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-bold text-[#EA580C] hover:underline inline-flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#F1ECE4]">
                    {notifications.length === 0 ? (
                      <div className="p-5 text-center text-xs text-[#64748B]">
                        No alerts for this role.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 text-xs ${n.isRead ? 'bg-white' : 'bg-[#FFF7ED]/60'}`}
                        >
                          <div className="font-bold text-[#1C1917]">{n.title}</div>
                          <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onBackToStudio}
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#1C1917] px-2.5 py-1.5 rounded-lg border border-[#E7E0D6]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Studio</span>
            </button>
          </div>
        </header>

        {/* Active View */}
        <main
          className={`flex-1 w-full mx-auto ${
            activeTab === 'kds'
              ? 'p-4 sm:p-6 bg-[#1C1917] max-w-none'
              : 'p-4 sm:p-6 lg:p-8 max-w-7xl'
          }`}
        >
          {activeTab === 'dashboard' && (
            <RestoFlowDashboardView
              user={user}
              restaurant={restaurant}
              data={dashboardData}
              isLoading={isLoadingDashboard}
              onRefresh={loadWorkspaceData}
              onOpenSettings={() => {
                if (['owner', 'manager'].includes(user.role)) {
                  setActiveTab('settings');
                }
              }}
            />
          )}

          {activeTab === 'pos' && permissions.canUsePos && (
            <RestoFlowPosView
              restaurant={restaurant}
              onOrderMutated={loadWorkspaceData}
            />
          )}

          {activeTab === 'tables' && ['owner', 'manager', 'waiter', 'cashier'].includes(user.role) && (
            <RestoFlowWaiterView
              restaurant={restaurant}
              permissions={permissions}
              onOrderMutated={loadWorkspaceData}
            />
          )}

          {activeTab === 'kds' && ['owner', 'manager', 'kitchen', 'waiter'].includes(user.role) && (
            <RestoFlowKdsView
              user={user}
              onOrderMutated={loadWorkspaceData}
            />
          )}

          {activeTab === 'orders' && ['owner', 'manager', 'cashier', 'waiter'].includes(user.role) && (
            <RestoFlowOrdersView
              restaurant={restaurant}
              permissions={permissions}
              onOrderMutated={loadWorkspaceData}
            />
          )}

          {activeTab === 'menu' && ['owner', 'manager', 'kitchen', 'cashier', 'waiter'].includes(user.role) && (
            <RestoFlowMenuView
              restaurant={restaurant}
              permissions={permissions}
            />
          )}

          {activeTab === 'inventory' && ['owner', 'manager', 'inventory_manager', 'kitchen'].includes(user.role) && (
            <RestoFlowInventoryView
              user={user}
              restaurant={restaurant}
              permissions={permissions}
              onInventoryMutated={loadWorkspaceData}
            />
          )}

          {activeTab === 'recipes' && ['owner', 'manager', 'inventory_manager', 'kitchen'].includes(user.role) && (
            <RestoFlowRecipesView
              restaurant={restaurant}
              permissions={permissions}
              onRecipeMutated={loadWorkspaceData}
            />
          )}

          {activeTab === 'customers' && ['owner', 'manager', 'cashier', 'waiter'].includes(user.role) && (
            <RestoFlowCustomersView
              restaurant={restaurant}
              permissions={permissions}
            />
          )}

          {activeTab === 'staff' && (
            <RestoFlowStaffView
              user={user}
              permissions={permissions}
            />
          )}

          {activeTab === 'reports' && ['owner', 'manager', 'cashier', 'inventory_manager'].includes(user.role) && (
            <RestoFlowReportsView
              restaurant={restaurant}
              permissions={permissions}
            />
          )}

          {activeTab === 'settings' && ['owner', 'manager'].includes(user.role) && (
            <RestoFlowSettingsView
              user={user}
              permissions={permissions}
              restaurant={restaurant}
              onRestaurantUpdated={(updated) => setRestaurant(updated)}
              onDemoResetCompleted={(restored) => {
                setRestaurant(restored);
                loadWorkspaceData();
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};

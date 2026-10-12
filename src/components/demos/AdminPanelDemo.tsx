import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  UserCheck,
  BarChart3,
  Settings,
  Bell,
  Search,
  CheckCircle,
  Clock,
  Truck,
  Plus,
  Shield,
  Filter,
  Download,
  Sliders,
  Sparkles
} from 'lucide-react';
import { TemplateItem } from '../../types';
import {
  useThemeCustomizer,
  DemoControlBar,
  DemoCustomizerDrawer,
  FloatingCustomizeButton,
  ThemeCustomizerState
} from './DemoThemeCustomizer';

interface AdminPanelDemoProps {
  template: TemplateItem;
  onBack: () => void;
  onUseDesign: (template: TemplateItem, customData?: ThemeCustomizerState) => void;
}

export const AdminPanelDemo: React.FC<AdminPanelDemoProps> = ({
  template,
  onBack,
  onUseDesign
}) => {
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'users' | 'products' | 'orders' | 'settings'>('dashboard');
  const [orders, setOrders] = useState([
    { id: '#001234', customer: 'Rajesh Sharma', status: 'New Order', amount: '₹4,500', time: '10 mins ago', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: '#001235', customer: 'Priya Patel', status: 'Processing', amount: '₹3,200', time: '1 hour ago', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: '#001236', customer: 'Amit Verma', status: 'Shipped', amount: '₹1,850', time: '3 hours ago', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
    { id: '#001237', customer: 'Sunita Rao', status: 'Delivered', amount: '₹8,900', time: 'Yesterday', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ]);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    customization,
    drawerOpen,
    setDrawerOpen,
    applyPalette,
    updateField,
    resetToDefault,
    getRadiusClass,
    getFontFamilyClass,
    calculateEstimate
  } = useThemeCustomizer(template, {
    brandName: 'Nexus Operations',
    primaryColor: '#7C3AED',
    accentColor: '#C084FC',
    paletteId: 'purple'
  });

  const monogram = customization.brandName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'NX';

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col ${getFontFamilyClass()}`}>
      
      {/* Top Demo Notification Banner */}
      {customization.showPromoBanner && (
        <div
          className="text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 transition-colors"
          style={{ backgroundColor: customization.primaryColor }}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>
            Live Web Application Demo: {customization.brandName} Portal with customized primary palette & operational controls.
          </span>
        </div>
      )}

      {/* Control Bar */}
      <DemoControlBar
        template={template}
        customization={customization}
        onBack={onBack}
        onOpenCustomizer={() => setDrawerOpen(true)}
        onApplyPalette={applyPalette}
        onUseDesign={onUseDesign}
      />

      {/* Slide-over Theme Customizer Drawer */}
      <DemoCustomizerDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        template={template}
        customization={customization}
        onApplyPalette={applyPalette}
        onUpdateField={updateField}
        onReset={resetToDefault}
        onUseDesign={onUseDesign}
      />

      {/* Floating Customize Button */}
      <FloatingCustomizeButton
        onOpen={() => setDrawerOpen(true)}
        primaryColor={customization.primaryColor}
      />

      {/* Admin Panel Container */}
      <div className="flex-1 bg-slate-950 p-4 sm:p-6 lg:p-8 flex flex-col">
        <div className={`max-w-7xl mx-auto w-full bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[640px] ${getRadiusClass('card')}`}>
          
          {/* Admin Sidebar */}
          <aside className="w-full md:w-60 bg-slate-950/80 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
            <div>
              {/* Monogram Brand */}
              <div className="flex items-center gap-2.5 px-3 py-3 mb-6 border-b border-slate-800/80">
                <div
                  className={`w-8 h-8 flex items-center justify-center font-extrabold text-white text-xs shadow-md ${getRadiusClass('input')}`}
                  style={{ backgroundColor: customization.primaryColor }}
                >
                  {monogram}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-white tracking-wide truncate">
                    {customization.brandName}
                  </div>
                  <div className="text-[10px] text-slate-400">Admin Control v2.4</div>
                </div>
              </div>

              {/* Menu links */}
              <nav className="space-y-1 text-xs font-medium">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                  { id: 'users', label: 'Users', icon: Users },
                  { id: 'products', label: 'Products', icon: Package },
                  { id: 'orders', label: 'Orders', icon: ShoppingCart },
                  { id: 'settings', label: 'Settings', icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveMenu(item.id as any)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all ${getRadiusClass('btn')} ${
                        isActive
                          ? 'text-white font-bold shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                      style={{
                        backgroundColor: isActive ? customization.primaryColor : undefined
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Current user card in sidebar */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2.5 px-2">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white border border-slate-600">
                AD
              </div>
              <div className="text-left truncate">
                <div className="text-xs font-bold text-white truncate">Administrator</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Online</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Admin Main Body */}
          <main className="flex-1 bg-slate-900 flex flex-col overflow-y-auto">
            
            {/* Top Toolbar */}
            <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders, clients, or analytics..."
                  className="bg-transparent text-xs text-white placeholder-slate-400 focus:outline-hidden w-full"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors relative"
                  >
                    <Bell className="w-4 h-4" />
                    <span
                      className="absolute top-1 right-1 w-2 h-2 rounded-full"
                      style={{ backgroundColor: customization.primaryColor }}
                    />
                  </button>

                  {notificationOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-3 z-30 text-xs">
                      <div className="font-bold text-white pb-2 border-b border-slate-700">Notifications</div>
                      <div className="space-y-2 py-2">
                        <div className="text-slate-300">
                          <span style={{ color: customization.primaryColor }} className="font-semibold">New Order:</span> Rajesh Sharma placed #001234
                        </div>
                        <div className="text-slate-300">
                          <span className="text-emerald-400 font-semibold">Stock Alert:</span> 28 items low on stock
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setDrawerOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-orange-400" />
                  <span>Theme Config</span>
                </button>
              </div>
            </header>

            {/* Dashboard Workspace */}
            <div className="p-6 space-y-6">
              
              {/* 4 KPI Cards */}
              {customization.showStats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  <div className={`bg-slate-950 p-4 border border-slate-800 flex flex-col justify-between ${getRadiusClass('input')}`}>
                    <span className="text-xs text-slate-400 font-medium">Total Users</span>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-2xl font-black text-white font-mono">1,248</span>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        +12%
                      </span>
                    </div>
                  </div>

                  <div className={`bg-slate-950 p-4 border border-slate-800 flex flex-col justify-between ${getRadiusClass('input')}`}>
                    <span className="text-xs text-slate-400 font-medium">Total Orders</span>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-2xl font-black text-white font-mono">320</span>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        +8%
                      </span>
                    </div>
                  </div>

                  <div className={`bg-slate-950 p-4 border border-slate-800 flex flex-col justify-between ${getRadiusClass('input')}`}>
                    <span className="text-xs text-slate-400 font-medium">Monthly Revenue</span>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-2xl font-black text-white font-mono">₹2,45,000</span>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        +15%
                      </span>
                    </div>
                  </div>

                  <div className={`bg-slate-950 p-4 border border-slate-800 flex flex-col justify-between ${getRadiusClass('input')}`}>
                    <span className="text-xs text-slate-400 font-medium">Low Stock</span>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-2xl font-black text-white font-mono">28</span>
                      <span className="text-xs font-bold text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded">
                        -5%
                      </span>
                    </div>
                  </div>

                </div>
              )}

              {/* Chart & Recent Orders Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Sales Overview Chart (SVG) */}
                <div className={`lg:col-span-7 bg-slate-950 p-5 border border-slate-800 space-y-4 ${getRadiusClass('card')}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">Gross Sales Performance</h4>
                      <p className="text-[11px] text-slate-400">Monthly metric analysis for {customization.brandName}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg text-[10px] font-semibold text-slate-300">
                      <span
                        className="text-white px-2 py-0.5 rounded"
                        style={{ backgroundColor: customization.primaryColor }}
                      >
                        2026
                      </span>
                      <span className="px-2 py-0.5">Monthly</span>
                    </div>
                  </div>

                  {/* SVG Chart Graphic */}
                  <div className="h-44 w-full relative pt-4">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                      <defs>
                        <linearGradient id="chartGradAdmin" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={customization.primaryColor} stopOpacity="0.4" />
                          <stop offset="100%" stopColor={customization.primaryColor} stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 20,120 Q 80,95 140,80 T 260,60 T 380,35 T 480,20 L 480,140 L 20,140 Z"
                        fill="url(#chartGradAdmin)"
                      />
                      <path
                        d="M 20,120 Q 80,95 140,80 T 260,60 T 380,35 T 480,20"
                        fill="none"
                        stroke={customization.primaryColor}
                        strokeWidth="3.5"
                      />
                      <circle cx="20" cy="120" r="4" fill={customization.primaryColor} />
                      <circle cx="140" cy="80" r="4" fill={customization.primaryColor} />
                      <circle cx="260" cy="60" r="4" fill={customization.primaryColor} />
                      <circle cx="380" cy="35" r="4" fill={customization.primaryColor} />
                      <circle cx="480" cy="20" r="5" fill="#FFFFFF" stroke={customization.primaryColor} strokeWidth="2" />
                    </svg>

                    <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                      <span>Jan</span>
                      <span>Feb</span>
                      <span>Mar</span>
                      <span>Apr</span>
                      <span>May</span>
                      <span>Jun</span>
                      <span>Jul</span>
                    </div>
                  </div>
                </div>

                {/* Recent Orders Table */}
                <div className={`lg:col-span-5 bg-slate-950 p-5 border border-slate-800 space-y-3 ${getRadiusClass('card')}`}>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h4 className="font-bold text-white text-sm">Recent Transactions</h4>
                    <span
                      style={{ color: customization.primaryColor }}
                      className="text-[11px] font-semibold cursor-pointer hover:underline"
                    >
                      View All
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {orders.map((o) => (
                      <div
                        key={o.id}
                        className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                      >
                        <div>
                          <div className="font-mono font-bold" style={{ color: customization.primaryColor }}>
                            {o.id}
                          </div>
                          <div className="text-slate-300 text-[11px] font-medium">{o.customer}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-white">{o.amount}</div>
                          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${o.badge}`}>
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </main>

        </div>

        {/* Explore Key Features */}
        <div className="max-w-7xl mx-auto w-full mt-10">
          <h3 className="text-lg font-bold text-white mb-4">Explore Key Features</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            
            <div className={`bg-slate-900 border border-slate-800 p-4 text-left ${getRadiusClass('input')}`}>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                style={{ backgroundColor: `${customization.primaryColor}25`, color: customization.primaryColor }}
              >
                <Users className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-white text-xs">User Management</h5>
              <p className="text-[11px] text-slate-400 mt-1">Add, edit and manage user roles.</p>
            </div>

            <div className={`bg-slate-900 border border-slate-800 p-4 text-left ${getRadiusClass('input')}`}>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                style={{ backgroundColor: `${customization.primaryColor}25`, color: customization.primaryColor }}
              >
                <Package className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-white text-xs">Product Management</h5>
              <p className="text-[11px] text-slate-400 mt-1">Manage stock and price tables.</p>
            </div>

            <div className={`bg-slate-900 border border-slate-800 p-4 text-left ${getRadiusClass('input')}`}>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                style={{ backgroundColor: `${customization.primaryColor}25`, color: customization.primaryColor }}
              >
                <ShoppingCart className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-white text-xs">Order Management</h5>
              <p className="text-[11px] text-slate-400 mt-1">Track and process fulfillment.</p>
            </div>

            <div className={`bg-slate-900 border border-slate-800 p-4 text-left ${getRadiusClass('input')}`}>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                style={{ backgroundColor: `${customization.primaryColor}25`, color: customization.primaryColor }}
              >
                <BarChart3 className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-white text-xs">Reports & Analytics</h5>
              <p className="text-[11px] text-slate-400 mt-1">Detailed exports & telemetry.</p>
            </div>

            <div className={`bg-slate-900 border border-slate-800 p-4 text-left ${getRadiusClass('input')}`}>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                style={{ backgroundColor: `${customization.primaryColor}25`, color: customization.primaryColor }}
              >
                <Shield className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-white text-xs">Role-Based Access</h5>
              <p className="text-[11px] text-slate-400 mt-1">Control admin & staff limits.</p>
            </div>

            <div className={`bg-slate-900 border border-slate-800 p-4 text-left ${getRadiusClass('input')}`}>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                style={{ backgroundColor: `${customization.primaryColor}25`, color: customization.primaryColor }}
              >
                <Settings className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-white text-xs">Settings & Config</h5>
              <p className="text-[11px] text-slate-400 mt-1">Full brand configuration.</p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

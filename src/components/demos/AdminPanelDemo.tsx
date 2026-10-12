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
  Download
} from 'lucide-react';
import { TemplateItem } from '../../types';

interface AdminPanelDemoProps {
  template: TemplateItem;
  onBack: () => void;
  onUseDesign: (template: TemplateItem) => void;
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      
      {/* Top Demo Notification Banner */}
      <div className="bg-indigo-600 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
        <span>Live Web Application Demo: Test sidebar modules, order updates, and realistic dashboard metrics.</span>
      </div>

      {/* Control Bar */}
      <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Templates</span>
          </button>
          <div>
            <span className="font-bold text-white text-sm">{template.name}</span>
            <span className="text-slate-400 text-xs ml-2">({template.templateCode})</span>
          </div>
        </div>

        <button
          onClick={() => onUseDesign(template)}
          className="flex items-center gap-2 bg-[#F95700] hover:bg-[#EA4D00] text-white px-5 py-2 rounded-full font-bold text-xs shadow-lg shadow-orange-500/30 transition-all transform hover:scale-105"
        >
          <span>Use This Concept</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Admin Panel Container */}
      <div className="flex-1 bg-slate-950 p-4 sm:p-6 lg:p-8 flex flex-col">
        <div className="max-w-7xl mx-auto w-full bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[640px]">
          
          {/* Admin Sidebar */}
          <aside className="w-full md:w-60 bg-slate-950/80 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
            <div>
              {/* Monogram Brand */}
              <div className="flex items-center gap-2.5 px-3 py-3 mb-6 border-b border-slate-800/80">
                <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-extrabold text-white text-xs">
                  CM
                </div>
                <div>
                  <div className="text-xs font-bold text-white tracking-wide">CODEMANIAC</div>
                  <div className="text-[10px] text-slate-400">Admin Control v2.4</div>
                </div>
              </div>

              {/* Menu links */}
              <nav className="space-y-1 text-xs font-medium">
                <button
                  onClick={() => setActiveMenu('dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    activeMenu === 'dashboard'
                      ? 'bg-orange-600 text-white font-bold shadow-md shadow-orange-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveMenu('users')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    activeMenu === 'users'
                      ? 'bg-orange-600 text-white font-bold shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </button>

                <button
                  onClick={() => setActiveMenu('products')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    activeMenu === 'products'
                      ? 'bg-orange-600 text-white font-bold shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Products</span>
                </button>

                <button
                  onClick={() => setActiveMenu('orders')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    activeMenu === 'orders'
                      ? 'bg-orange-600 text-white font-bold shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Orders</span>
                </button>

                <button
                  onClick={() => setActiveMenu('settings')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    activeMenu === 'settings'
                      ? 'bg-orange-600 text-white font-bold shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
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
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500" />
                  </button>

                  {notificationOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-3 z-30 text-xs">
                      <div className="font-bold text-white pb-2 border-b border-slate-700">Notifications</div>
                      <div className="space-y-2 py-2">
                        <div className="text-slate-300">
                          <span className="text-orange-400 font-semibold">New Order:</span> Rajesh Sharma placed #001234
                        </div>
                        <div className="text-slate-300">
                          <span className="text-emerald-400 font-semibold">Stock Alert:</span> 28 items low on stock
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-300 font-medium">Production Database</span>
                </div>
              </div>
            </header>

            {/* Dashboard Workspace */}
            <div className="p-6 space-y-6">
              
              {/* 4 KPI Cards (matches Image 6) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <span className="text-xs text-slate-400 font-medium">Total Users</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-white font-mono">1,248</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                      +12%
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <span className="text-xs text-slate-400 font-medium">Total Orders</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-white font-mono">320</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                      +8%
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <span className="text-xs text-slate-400 font-medium">Revenue</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-white font-mono">₹2,45,000</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                      +15%
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <span className="text-xs text-slate-400 font-medium">Low Stock</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-white font-mono">28</span>
                    <span className="text-xs font-bold text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded">
                      -5%
                    </span>
                  </div>
                </div>

              </div>

              {/* Chart & Recent Orders Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Sales Overview Chart (SVG) */}
                <div className="lg:col-span-7 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">Sales Overview</h4>
                      <p className="text-[11px] text-slate-400">Monthly gross transaction value</p>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg text-[10px] font-semibold text-slate-300">
                      <span className="bg-orange-600 text-white px-2 py-0.5 rounded">2026</span>
                      <span className="px-2 py-0.5">Monthly</span>
                    </div>
                  </div>

                  {/* SVG Chart Graphic */}
                  <div className="h-44 w-full relative pt-4">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#EA580C" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#EA580C" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 20,120 Q 80,95 140,80 T 260,60 T 380,35 T 480,20 L 480,140 L 20,140 Z"
                        fill="url(#chartGrad)"
                      />
                      <path
                        d="M 20,120 Q 80,95 140,80 T 260,60 T 380,35 T 480,20"
                        fill="none"
                        stroke="#EA580C"
                        strokeWidth="3.5"
                      />
                      {/* Data Dots */}
                      <circle cx="20" cy="120" r="4" fill="#F97316" />
                      <circle cx="140" cy="80" r="4" fill="#F97316" />
                      <circle cx="260" cy="60" r="4" fill="#F97316" />
                      <circle cx="380" cy="35" r="4" fill="#F97316" />
                      <circle cx="480" cy="20" r="5" fill="#FFFFFF" stroke="#EA580C" strokeWidth="2" />
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
                <div className="lg:col-span-5 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h4 className="font-bold text-white text-sm">Recent Orders</h4>
                    <span className="text-[11px] font-semibold text-orange-400 cursor-pointer hover:underline">
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
                          <div className="font-mono font-bold text-orange-400">{o.id}</div>
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

        {/* Explore Key Features (Matches Image 6) */}
        <div className="max-w-7xl mx-auto w-full mt-10">
          <h3 className="text-lg font-bold text-white mb-4">Explore Key Features</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left">
              <div className="w-8 h-8 rounded-lg bg-blue-900/60 text-blue-400 flex items-center justify-center mb-2">
                <Users className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-white text-xs">User Management</h5>
              <p className="text-[11px] text-slate-400 mt-1">Add, edit and manage user roles.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left">
              <div className="w-8 h-8 rounded-lg bg-indigo-900/60 text-indigo-400 flex items-center justify-center mb-2">
                <Package className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-white text-xs">Product Management</h5>
              <p className="text-[11px] text-slate-400 mt-1">Manage stock and price tables.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left">
              <div className="w-8 h-8 rounded-lg bg-emerald-900/60 text-emerald-400 flex items-center justify-center mb-2">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-white text-xs">Order Management</h5>
              <p className="text-[11px] text-slate-400 mt-1">Track and process fulfillment.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left">
              <div className="w-8 h-8 rounded-lg bg-amber-900/60 text-amber-400 flex items-center justify-center mb-2">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-white text-xs">Reports & Analytics</h5>
              <p className="text-[11px] text-slate-400 mt-1">Detailed exports & telemetry.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left">
              <div className="w-8 h-8 rounded-lg bg-teal-900/60 text-teal-400 flex items-center justify-center mb-2">
                <Shield className="w-4 h-4" />
              </div>
              <h5 className="font-bold text-white text-xs">Role-Based Access</h5>
              <p className="text-[11px] text-slate-400 mt-1">Control admin & staff limits.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left">
              <div className="w-8 h-8 rounded-lg bg-purple-900/60 text-purple-400 flex items-center justify-center mb-2">
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

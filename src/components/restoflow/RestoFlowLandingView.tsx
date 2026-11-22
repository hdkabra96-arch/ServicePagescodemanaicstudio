import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  ChefHat,
  ClipboardList,
  CreditCard,
  Flame,
  LayoutGrid,
  Package,
  Receipt,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  UtensilsCrossed
} from 'lucide-react';
import heroDiningImg from '../../assets/images/restoflow_hero_dining_1795276336641.jpg';
import type { RestoFlowRole } from '../../types/restoflow';

interface RestoFlowLandingViewProps {
  onOpenLogin: (preselectRole?: RestoFlowRole) => void;
  onBackToStudio: () => void;
}

const ROLE_CARDS: {
  role: RestoFlowRole;
  title: string;
  subtitle: string;
  summary: string;
  accent: string;
}[] = [
  {
    role: 'owner',
    title: 'Restaurant Owner',
    subtitle: 'Executive P&L & Control',
    summary: 'Live revenue trends, food cost margins, full 12-module access, tax & receipt settings.',
    accent: 'border-l-[#EA580C]'
  },
  {
    role: 'manager',
    title: 'Restaurant Manager',
    subtitle: 'Floor & Shift Operations',
    summary: 'Live dining occupancy, staff attendance & shifts, order approvals, and low-stock alerts.',
    accent: 'border-l-[#1C1917]'
  },
  {
    role: 'cashier',
    title: 'Cashier (POS)',
    subtitle: 'High-Speed Billing Register',
    summary: 'Cart modifiers, discounts, GST calculation, hold & resume orders, split payments, receipts.',
    accent: 'border-l-[#10B981]'
  },
  {
    role: 'waiter',
    title: 'Waiter / Floor Captain',
    subtitle: 'Table-Side Service',
    summary: 'Interactive floor plan, table transfer & merge, instant kitchen firing, ready-to-serve alerts.',
    accent: 'border-l-[#D97706]'
  },
  {
    role: 'kitchen',
    title: 'Kitchen Staff (KDS)',
    subtitle: 'Dark Charcoal Display',
    summary: 'High-contrast live ticket board, elapsed prep timers, station routing, and bump workflow.',
    accent: 'border-l-[#EF4444]'
  },
  {
    role: 'inventory_manager',
    title: 'Inventory Manager',
    subtitle: 'Stock, Suppliers & Costing',
    summary: 'Stock in/out ledger, wastage tracking, purchase orders, low-stock alerts & recipe food cost %.',
    accent: 'border-l-[#059669]'
  }
];

const MODULES = [
  { icon: BarChart3, title: 'Executive Dashboard', desc: 'Real-time sales, order throughput, table occupancy, and 7-day revenue analytics.' },
  { icon: CreditCard, title: 'POS Billing Terminal', desc: 'Fast item selection, discounts, GST math, split payments, hold/resume, and printable receipts.' },
  { icon: UtensilsCrossed, title: 'Menu & Modifiers', desc: 'Categories, veg/non-veg tags, variants, add-ons, station routing, and instant 86 availability.' },
  { icon: LayoutGrid, title: 'Floor & Table Control', desc: 'Section layouts, reservations, occupied tracking, table transfer, and party merging.' },
  { icon: ClipboardList, title: 'Unified Order Engine', desc: 'Dine-in, takeaway, and delivery order lifecycles with full history and reason-tracked cancellations.' },
  { icon: ChefHat, title: 'Kitchen Display (KDS)', desc: 'Dedicated dark-mode ticket screen with live prep timers and automatic waiter ready notifications.' },
  { icon: Package, title: 'Inventory & Suppliers', desc: 'Ingredient stock-in/out, purchase orders, low-stock alerts, and kitchen wastage logging.' },
  { icon: Flame, title: 'Recipe Cost Engine', desc: 'Map dishes to live ingredient prices for automatic recipe cost and food cost percentage.' },
  { icon: Users, title: 'Customers & Loyalty', desc: 'Guest directory, dining history, automatic loyalty points, and verified meal ratings.' },
  { icon: ShieldCheck, title: 'Staff, Shifts & Attendance', desc: '6-role permissions matrix, daily clock-in/out logs, and shift scheduling by station.' },
  { icon: Receipt, title: 'Reports & Exports', desc: 'Daily, weekly, and monthly sales, product mix, payment splits, plus PDF & Excel downloads.' },
  { icon: Settings, title: 'Restaurant Configuration', desc: 'Store profile, GSTIN, tax & service charge rules, receipt templates, and one-click demo reset.' }
];

export const RestoFlowLandingView: React.FC<RestoFlowLandingViewProps> = ({
  onOpenLogin,
  onBackToStudio
}) => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E293B] font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E7E0D6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToStudio}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#1C1917] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Codemaniac Studio</span>
            </button>
            <span className="h-4 w-px bg-[#E7E0D6]" />
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#1C1917] text-[#EA580C] flex items-center justify-center shadow-xs">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-[#1C1917] text-base tracking-tight leading-none">
                  RestoFlow
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-[#EA580C] mt-0.5">
                  Restaurant POS &amp; Ops
                </div>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#475569]">
            <a href="#roles" className="hover:text-[#EA580C] transition-colors">6 Role Workspaces</a>
            <a href="#modules" className="hover:text-[#EA580C] transition-colors">12 Core Modules</a>
            <a href="#architecture" className="hover:text-[#EA580C] transition-colors">API-First Stack</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenLogin('owner')}
              className="hidden sm:inline-flex items-center text-sm font-semibold text-[#1C1917] hover:text-[#EA580C] px-3 py-2 transition-colors"
            >
              Staff Login
            </button>
            <button
              onClick={() => onOpenLogin('owner')}
              className="inline-flex items-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-bold px-5 py-2.5 rounded-lg shadow-sm transition-all"
            >
              <span>Launch Live Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Editorial Hospitality Hero */}
      <section className="relative bg-[#1C1917] text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroDiningImg}
            alt="Saffron and Ember Kitchen dining room powered by RestoFlow"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C1917] via-[#1C1917]/90 to-[#1C1917]/45" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#FB923C]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Codemaniac Studio Portfolio · Project 01</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight leading-[1.08] text-white">
                Commercial Restaurant POS, Kitchen Display &amp; Inventory in One System.
              </h1>

              <p className="text-base sm:text-lg text-[#D6D3D1] leading-relaxed max-w-2xl">
                Built for fine-dining restaurants, cafes, hotels, and cloud kitchens. Experience
                <span className="text-white font-semibold"> Saffron &amp; Ember Kitchen</span> running
                live on real relational SQL data across 6 role-tailored workspaces.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onOpenLogin('owner')}
                  className="inline-flex items-center gap-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-sm px-7 py-3.5 rounded-lg shadow-lg shadow-orange-950/40 transition-all"
                >
                  <span>Open Owner Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenLogin('cashier')}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold text-sm px-6 py-3.5 rounded-lg backdrop-blur-xs transition-all"
                >
                  <span>Try Staff Role Login</span>
                </button>
              </div>

              {/* Clean Fact Strip (no floating pills) */}
              <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <div className="text-2xl font-extrabold font-mono text-white">6</div>
                  <div className="text-xs text-[#A8A29E] mt-0.5">Role-Based Interfaces</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold font-mono text-[#10B981]">12</div>
                  <div className="text-xs text-[#A8A29E] mt-0.5">Live Business Modules</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold font-mono text-[#FB923C]">21</div>
                  <div className="text-xs text-[#A8A29E] mt-0.5">Normalized SQL Tables</div>
                </div>
              </div>
            </div>

            {/* Right Framed Architectural Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-[#292524] border border-[#3F3A36] rounded-2xl overflow-hidden shadow-2xl">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={heroDiningImg}
                    alt="Saffron and Ember Kitchen"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917] via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-widest text-[#10B981]">
                        Live Showcase Restaurant
                      </div>
                      <div className="text-lg font-extrabold text-white">
                        Saffron &amp; Ember Kitchen
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-white bg-[#EA580C] px-2.5 py-1 rounded">
                      12 Tables
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#1C1917] border border-[#3F3A36] rounded-lg p-3">
                      <div className="text-[#A8A29E]">Menu Catalog</div>
                      <div className="font-mono font-bold text-white text-sm mt-1">16 Dishes · 6 Cat.</div>
                    </div>
                    <div className="bg-[#1C1917] border border-[#3F3A36] rounded-lg p-3">
                      <div className="text-[#A8A29E]">Demo Safeguards</div>
                      <div className="font-mono font-bold text-[#10B981] text-sm mt-1">Isolated &amp; Resettable</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenLogin('owner')}
                    className="w-full py-2.5 px-4 bg-[#FDFBF7] hover:bg-white text-[#1C1917] font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Explore Live Database Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#EA580C]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Role-Specific Interfaces Section */}
      <section id="roles" className="py-18 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#EA580C]">
              Role-Tailored Experiences
            </div>
            <h2 className="text-3xl font-extrabold text-[#1C1917] tracking-tight mt-1">
              Six Dedicated Staff Workspaces
            </h2>
          </div>
          <p className="text-sm text-[#64748B] max-w-md">
            Click any role below to sign in with its isolated demo account and verify server-enforced permissions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ROLE_CARDS.map((card) => (
            <button
              key={card.role}
              onClick={() => onOpenLogin(card.role)}
              className={`text-left bg-white border border-[#E7E0D6] border-l-4 ${card.accent} rounded-xl p-6 hover:shadow-md hover:border-[#EA580C]/50 transition-all group flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-extrabold text-[#1C1917] group-hover:text-[#EA580C] transition-colors">
                    {card.title}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#EA580C] group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-xs font-semibold text-[#64748B] mt-0.5">{card.subtitle}</div>
                <p className="text-xs text-[#475569] leading-relaxed mt-3">{card.summary}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F1ECE4] text-[11px] font-bold text-[#EA580C]">
                Sign in as {card.title} &rarr;
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 12 Core Modules Grid */}
      <section id="modules" className="py-18 bg-white border-y border-[#E7E0D6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#10B981]">
              End-to-End Hospitality Suite
            </div>
            <h2 className="text-3xl font-extrabold text-[#1C1917] tracking-tight mt-1">
              All 12 Operational Modules Under One Roof
            </h2>
            <p className="text-sm text-[#64748B] mt-2">
              Every counter, dining room table, kitchen station, and storeroom shelf stays synchronized in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.title}
                  className="bg-[#FDFBF7] border border-[#E7E0D6] rounded-xl p-5 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#FFF7ED] border border-[#FED7AA] text-[#EA580C] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1C1917]">{mod.title}</h3>
                    <p className="text-xs text-[#64748B] leading-relaxed mt-1">{mod.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* API-First & Client Customization Strip */}
      <section id="architecture" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1C1917] text-white rounded-2xl p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#10B981]">
              <Smartphone className="w-4 h-4" />
              <span>API-First · Ready for Future Android &amp; iOS Apps</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Decoupled REST Backend &amp; PostgreSQL / Supabase Production Schema
            </h2>
            <p className="text-sm text-[#D6D3D1] leading-relaxed">
              Business rules — GST tax math, split billing, table merges, stock deductions, and recipe food-cost
              percentages — run purely on the Express API layer. Future waiter handhelds or KDS tablets plug directly
              into <code className="text-[#FB923C] font-mono">/api/restoflow/*</code>.
            </p>
          </div>
          <div className="lg:col-span-4 flex lg:justify-end">
            <button
              onClick={() => onOpenLogin('owner')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-sm px-6 py-3.5 rounded-lg transition-colors"
            >
              <span>Enter Demo Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E7E0D6] py-6 text-center text-xs text-[#64748B]">
        RestoFlow — Commercial Restaurant Management Application by{' '}
        <button onClick={onBackToStudio} className="font-bold text-[#1C1917] hover:text-[#EA580C]">
          Codemaniac Studio
        </button>
        . All showcase records are isolated demo data and can be reset anytime.
      </footer>
    </div>
  );
};

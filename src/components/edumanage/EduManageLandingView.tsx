import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bus,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileSpreadsheet,
  GraduationCap,
  IndianRupee,
  LayoutDashboard,
  NotebookPen,
  ShieldCheck,
  Users
} from 'lucide-react';
import type { EduManageDemoAccount } from '../../types/edumanage';

interface EduManageLandingViewProps {
  schoolName: string;
  boardAffiliation: string;
  demoAccounts: EduManageDemoAccount[];
  isLoadingDemo: boolean;
  onOpenLogin: () => void;
  onQuickDemoLogin: (account: EduManageDemoAccount) => void;
  onBackToStudio: () => void;
}

const MODULE_OVERVIEW = [
  {
    icon: LayoutDashboard,
    title: 'Executive School Dashboard',
    desc: 'Live SQL metrics for enrollment, attendance trends, class exam averages, and fee recovery.'
  },
  {
    icon: Users,
    title: 'Students & Faculty Directory',
    desc: 'Admissions, guardian mapping, class-section allocation, promotions, transfers, and teacher rosters.'
  },
  {
    icon: ClipboardCheck,
    title: 'Attendance & Timetables',
    desc: 'Class-wise daily attendance registers, monthly trends, room scheduling, and clash detection.'
  },
  {
    icon: GraduationCap,
    title: 'Examinations & Report Cards',
    desc: 'Subject marks entry, CBSE/GSEB grade calculation, class ranking, and printable PDF report cards.'
  },
  {
    icon: IndianRupee,
    title: 'Fee Structures & Receipts',
    desc: 'Category-wise fee plans, installments, instant payment receipts, and overdue tracking.'
  },
  {
    icon: NotebookPen,
    title: 'Homework & Evaluation',
    desc: 'Subject assignments with deadlines, student submission tracking, and teacher grading remarks.'
  },
  {
    icon: BookOpen,
    title: 'Library Circulation',
    desc: 'ISBN catalog, book issue and return desk, due date tracking, and automated late fine calculation.'
  },
  {
    icon: Bus,
    title: 'Transport Fleet & Routes',
    desc: 'School buses, drivers, route stops, student route allocation, and transport fee records.'
  }
];

export const EduManageLandingView: React.FC<EduManageLandingViewProps> = ({
  schoolName,
  boardAffiliation,
  demoAccounts,
  isLoadingDemo,
  onOpenLogin,
  onQuickDemoLogin,
  onBackToStudio
}) => {
  return (
    <div className="min-h-screen bg-[#F5FAFF] text-[#102A43]">
      {/* Institutional Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[#DCEAF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBackToStudio}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#486581] hover:text-[#1769AA] transition-colors shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Codemaniac Studio</span>
            </button>
            <span className="text-[#BCCCDC] select-none">/</span>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#1769AA] text-white flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold tracking-tight text-[#102A43] leading-tight truncate">
                  EduManage
                </div>
                <div className="text-[11px] text-[#486581] truncate">
                  School Management ERP
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1769AA] hover:bg-[#12558C] text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              <span>Sign In to ERP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Institutional Hero */}
      <section className="bg-white border-b border-[#DCEAF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1769AA]">
                CBSE · GSEB · International Schools · Colleges · Coaching Institutes
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-[#102A43] tracking-tight leading-[1.1]">
                One Unified Operating System for Modern Schools
              </h1>

              <p className="text-base sm:text-lg text-[#486581] leading-relaxed max-w-2xl">
                Manage admissions, daily attendance, conflict-free timetables, examinations, fee
                collection, library circulation, transport fleets, and dedicated parent &amp; student
                portals from a single database-backed workspace.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#1769AA] hover:bg-[#12558C] text-white font-semibold text-sm transition-colors cursor-pointer"
                >
                  <span>Open School Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                {demoAccounts[0] && (
                  <button
                    onClick={() => onQuickDemoLogin(demoAccounts[0])}
                    disabled={isLoadingDemo}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#F5FAFF] hover:bg-[#E6F2FC] text-[#1769AA] border border-[#BFDDF7] font-semibold text-sm transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    <span>Launch Admin Demo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Clean unboxed institutional metrics strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-[#E6F0FA]">
                <div>
                  <div className="text-2xl font-bold text-[#102A43] tabular-nums">8</div>
                  <div className="text-xs text-[#627D98] mt-0.5">Role-Based Portals</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#102A43] tabular-nums">14</div>
                  <div className="text-xs text-[#627D98] mt-0.5">Integrated Modules</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#16A085] tabular-nums">33</div>
                  <div className="text-xs text-[#627D98] mt-0.5">Normalized SQL Tables</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#1769AA] tabular-nums">API-First</div>
                  <div className="text-xs text-[#627D98] mt-0.5">Web &amp; Future Mobile</div>
                </div>
              </div>
            </div>

            {/* Live Demo School Card */}
            <div className="lg:col-span-5">
              <div className="bg-[#F5FAFF] border border-[#DCEAF7] rounded-2xl p-6 space-y-5">
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#DCEAF7]">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-[#16A085]">
                      Live Demonstration Campus
                    </div>
                    <h2 className="text-xl font-bold text-[#102A43] mt-1">{schoolName}</h2>
                    <div className="text-xs text-[#486581] mt-0.5">
                      {boardAffiliation} · Academic Session 2026–27
                    </div>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-[#1769AA] shrink-0" />
                </div>

                <div className="space-y-3 text-sm text-[#334E68]">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#16A085] mt-0.5 shrink-0" />
                    <span>Pre-populated with real classes, faculty, students, attendance registers, exams, fees, library &amp; buses</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#16A085] mt-0.5 shrink-0" />
                    <span>All analytics calculated directly from live relational database queries — zero static numbers</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#16A085] mt-0.5 shrink-0" />
                    <span>One-click transactional Demo Data Reset for clean client walkthroughs</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-[#486581] border-t border-[#DCEAF7]">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-[#1769AA]" />
                    <span>Session 2026–27 Active</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#16A085]" />
                    <span>PDF &amp; Excel Ready</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instant Role-Based Demo Access Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1769AA]">
              Role-Based Access Control
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#102A43] mt-1">
              Launch Any of the 8 Institutional Roles
            </h2>
          </div>
          <p className="text-sm text-[#486581] max-w-md">
            Every role signs in through real server-side authentication and receives only the
            modules, data, and controls permitted by policy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {demoAccounts.map((acc) => (
            <button
              key={acc.role}
              onClick={() => onQuickDemoLogin(acc)}
              disabled={isLoadingDemo}
              className="text-left bg-white hover:bg-[#F8FBFF] border border-[#DCEAF7] hover:border-[#1769AA] rounded-xl p-5 transition-all flex flex-col justify-between gap-4 group cursor-pointer disabled:opacity-60"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1769AA]">
                    {acc.label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#829AB1] group-hover:text-[#1769AA] group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
                <div className="text-base font-bold text-[#102A43]">{acc.fullName}</div>
                <div className="text-xs text-[#627D98] leading-relaxed">{acc.highlights}</div>
              </div>

              <div className="pt-3 border-t border-[#EDF4FB] flex items-center justify-between text-[11px] text-[#486581]">
                <span className="truncate font-mono">{acc.email}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Core ERP Modules Overview */}
      <section className="bg-white border-t border-[#DCEAF7] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#16A085]">
              Complete Academic &amp; Administrative Suite
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#102A43] mt-1">
              Built for End-to-End Campus Operations
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {MODULE_OVERVIEW.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.title}
                  className="bg-[#F5FAFF] border border-[#DCEAF7] rounded-xl p-5 space-y-2.5"
                >
                  <div className="w-9 h-9 rounded-lg bg-white border border-[#DCEAF7] text-[#1769AA] flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#102A43]">{mod.title}</h3>
                  <p className="text-xs text-[#486581] leading-relaxed">{mod.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

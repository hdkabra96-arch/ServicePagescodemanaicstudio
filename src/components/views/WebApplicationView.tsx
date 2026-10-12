import React, { useState } from 'react';
import {
  ArrowRight,
  Settings,
  BarChart3,
  UserCheck,
  Calendar,
  Receipt,
  GraduationCap,
  ShieldCheck,
  Lock,
  Database,
  Users,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { TemplateItem } from '../../types';
import { ALL_TEMPLATES, WEB_APP_SOLUTIONS } from '../../data/servicesData';
import { Breadcrumbs } from '../Breadcrumbs';

interface WebApplicationViewProps {
  onBack: () => void;
  onLivePreview: (template: TemplateItem) => void;
  onUseDesign: (template: TemplateItem) => void;
  onStartProject: (requirementContext?: string) => void;
}

export const WebApplicationView: React.FC<WebApplicationViewProps> = ({
  onBack,
  onLivePreview,
  onUseDesign,
  onStartProject
}) => {
  const [activeTab, setActiveTab] = useState<string>('All');

  const webAppTemplates = ALL_TEMPLATES.filter(
    (t) =>
      t.previewType === 'admin-panel' ||
      t.previewType === 'booking' ||
      t.previewType === 'student'
  );

  const filterTabs = ['All', 'Modern', 'Minimal', 'Professional', 'Dark Mode', 'Industry Specific'];

  const filteredTemplates = webAppTemplates.filter((t) => {
    if (activeTab === 'All') return true;
    return (
      t.industryTag.toLowerCase() === activeTab.toLowerCase() ||
      t.tags.some((tag) => tag.toLowerCase() === activeTab.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-16">
      
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: onBack },
          { label: 'Service', onClick: onBack },
          { label: 'Web Application Development', active: true }
        ]}
      />

      {/* Hero Section matching Reference Image 5 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF6F0] to-[#FAF8F5] pt-2 pb-16 border-b border-orange-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-orange-300 bg-orange-50/80 text-orange-600 text-xs font-bold tracking-wider uppercase">
                <span>WEB APPLICATION DEVELOPMENT</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Powerful Web Applications{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#F59E0B]">
                  Built for Your Business
                </span>
              </h1>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
                We create secure, scalable and intuitive web applications that streamline workflows, manage data and help your business grow.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onStartProject('Web Application Development')}
                  className="flex items-center gap-2.5 bg-[#F95700] hover:bg-[#EA4D00] text-white px-7 py-3.5 rounded-full font-bold text-sm shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Start Your Project</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('working-demos');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3.5 rounded-full font-semibold text-sm border border-slate-200 shadow-xs"
                >
                  <span>Explore Demos</span>
                  <ArrowRight className="w-4 h-4 text-orange-600" />
                </button>
              </div>
            </div>

            {/* Right: Mockup Image */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative max-w-[520px] w-full">
                <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-950">
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80"
                    alt="Web Application Dashboard"
                    className="w-full aspect-16/10 object-cover"
                  />
                  <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-t border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-white">Full-Stack Custom Web Application</div>
                      <div className="text-[11px] text-orange-400">Node.js, PostgreSQL, Auth & REST API</div>
                    </div>
                    <span className="text-xs font-mono font-bold bg-orange-600 px-2.5 py-1 rounded">
                      Live Demos
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* 4 Trust Badges */}
          <div className="mt-14 pt-8 border-t border-slate-200/80 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Custom Functionality</div>
                <div className="text-slate-500 text-xs">Tailored to Your Needs</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Secure Access</div>
                <div className="text-slate-500 text-xs">Data Security First</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Data-Driven</div>
                <div className="text-slate-500 text-xs">Insights & Efficiency</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Ongoing Support</div>
                <div className="text-slate-500 text-xs">Even After Launch</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Web Application Solutions (6 Cards matching Reference Image 5) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900">
            Web Application <span className="text-[#F95700]">Solutions</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Custom web applications designed to solve real business problems.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {WEB_APP_SOLUTIONS.map((sol) => (
            <div
              key={sol.id}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                  <Settings className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">{sol.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{sol.desc}</p>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => {
                    const match = webAppTemplates[0];
                    if (match) onLivePreview(match);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:gap-2.5 transition-all"
                >
                  <span>View Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Explore Working Demos Section (matching Reference Image 5) */}
      <section id="working-demos" className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900">
              Explore <span className="text-[#F95700]">Working Demos</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Try our live web application demos and see how your solution can look and work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Demo 1: Business Analytics Dashboard */}
            <div className="bg-slate-900 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="aspect-16/10 bg-slate-950 overflow-hidden relative">
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80"
                    alt="Analytics Dashboard"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-blue-600 text-[10px] font-bold px-2 py-0.5 rounded">
                    Admin & Analytics
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-extrabold text-base text-white">Business Analytics Dashboard</h3>
                  <p className="text-xs text-slate-400">
                    A complete business dashboard with analytics, financial reports and team management tools.
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 grid grid-cols-2 gap-3 border-t border-slate-800 mt-2">
                <button
                  onClick={() => onLivePreview(webAppTemplates[0])}
                  className="py-2.5 px-3 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Preview Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUseDesign(webAppTemplates[0])}
                  className="py-2.5 px-3 rounded-xl bg-[#F95700] hover:bg-[#EA4D00] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Use This Concept</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Demo 2: Booking Management System */}
            <div className="bg-slate-900 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="aspect-16/10 bg-slate-950 overflow-hidden relative">
                  <img
                    src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&auto=format&fit=crop&q=80"
                    alt="Booking System"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-cyan-600 text-[10px] font-bold px-2 py-0.5 rounded">
                    Calendar & Booking
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-extrabold text-base text-white">Booking Management System</h3>
                  <p className="text-xs text-slate-400">
                    Online booking, appointment scheduling and customer management system with reminders.
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 grid grid-cols-2 gap-3 border-t border-slate-800 mt-2">
                <button
                  onClick={() => onLivePreview(webAppTemplates[3])}
                  className="py-2.5 px-3 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Preview Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUseDesign(webAppTemplates[3])}
                  className="py-2.5 px-3 rounded-xl bg-[#F95700] hover:bg-[#EA4D00] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Use This Concept</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Demo 3: Student Management Portal */}
            <div className="bg-slate-900 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="aspect-16/10 bg-slate-950 overflow-hidden relative">
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80"
                    alt="Student Management"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-amber-600 text-[10px] font-bold px-2 py-0.5 rounded">
                    EdTech Portal
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-extrabold text-base text-white">Student Management Portal</h3>
                  <p className="text-xs text-slate-400">
                    Manage students, courses, daily attendance, fees and academic operations in one place.
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 grid grid-cols-2 gap-3 border-t border-slate-800 mt-2">
                <button
                  onClick={() => onLivePreview(webAppTemplates[4])}
                  className="py-2.5 px-3 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Preview Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUseDesign(webAppTemplates[4])}
                  className="py-2.5 px-3 rounded-xl bg-[#F95700] hover:bg-[#EA4D00] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Use This Concept</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Choose Your Admin Panel Design (Templates Grid from Image 6 Step 2) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
            ADMIN PANEL DEMOS
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Choose Your <span className="text-[#F95700]">Admin Panel Design</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Explore professionally designed admin panel templates. Select a design that fits your business.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 text-xs font-semibold no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredTemplates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-orange-300 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-16/10 overflow-hidden bg-slate-900">
                  <img
                    src={tmpl.thumbnail}
                    alt={tmpl.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-3 right-3 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    {tmpl.templateCode}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                      {tmpl.industryTag}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {tmpl.serviceCategory}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg">
                    {tmpl.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {tmpl.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 grid grid-cols-2 gap-3 border-t border-slate-50 mt-2">
                <button
                  onClick={() => onLivePreview(tmpl)}
                  className="py-2.5 px-3 rounded-xl border border-slate-300 hover:border-orange-500 text-slate-700 hover:text-orange-600 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Live Preview</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUseDesign(tmpl)}
                  className="py-2.5 px-3 rounded-xl bg-[#F95700] hover:bg-[#EA4D00] text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Use This Design</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Built Around Your Workflow (4 Cards from Image 5) */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Built Around <span className="text-[#F95700]">Your Workflow</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Key features that make your web application powerful, scalable and efficient.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">User Authentication</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Secure login, multi-user access and role permissions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Database Integration</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Reliable data storage with smooth third-party integration.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Role-Based Access</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Different access levels for admins, staff and users.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Reports & Automation</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automated reports, notifications and workflow automation.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

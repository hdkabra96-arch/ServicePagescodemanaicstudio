import React, { useState } from 'react';
import {
  ArrowRight,
  Settings,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  User,
  FileText,
  BookOpen,
  Briefcase,
  Home,
  CheckCircle2
} from 'lucide-react';
import { TemplateItem } from '../../types';
import { ALL_TEMPLATES } from '../../data/servicesData';
import { Breadcrumbs } from '../Breadcrumbs';

interface CustomWebsitesViewProps {
  onBack: () => void;
  onLivePreview: (template: TemplateItem) => void;
  onUseDesign: (template: TemplateItem) => void;
  onStartProject: (requirementContext?: string) => void;
}

export const CustomWebsitesView: React.FC<CustomWebsitesViewProps> = ({
  onBack,
  onLivePreview,
  onUseDesign,
  onStartProject
}) => {
  const [activeTab, setActiveTab] = useState('All');

  const filterTabs = ['All', 'Corporate', 'Agency', 'Consulting', 'Startup', 'Local Business'];

  const customTemplates = ALL_TEMPLATES.filter(
    (t) => t.previewType === 'corporate' || t.previewType === 'website'
  );

  const filteredTemplates = customTemplates.filter((t) => {
    if (activeTab === 'All') return true;
    return (
      t.industryTag.toLowerCase() === activeTab.toLowerCase() ||
      t.tags.some((tag) => tag.toLowerCase() === activeTab.toLowerCase())
    );
  });

  const websiteTypes = [
    { title: 'Business Website', sub: 'Corporate & Company', icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Portfolio Website', sub: 'Showcase Your Work', icon: User, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Landing Page', sub: 'Single Page Website', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Blog Website', sub: 'Content & News', icon: BookOpen, color: 'text-sky-600', bg: 'bg-sky-50' },
    { title: 'Personal Website', sub: 'Profile & Resume', icon: User, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: 'Service Website', sub: 'Consulting & Agency', icon: Sparkles, color: 'text-teal-600', bg: 'bg-teal-50' },
    { title: 'Real Estate Website', sub: 'Property Listings', icon: Home, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Custom Website', sub: 'Any Unique Requirement', icon: Settings, color: 'text-pink-600', bg: 'bg-pink-50' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-16">
      
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: onBack },
          { label: 'Service', onClick: onBack },
          { label: 'Custom Website', active: true }
        ]}
      />

      {/* Hero Section matching Reference Image 10 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF6F0] to-[#FAF8F5] pt-2 pb-16 border-b border-orange-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-orange-300 bg-orange-50/80 text-orange-600 text-xs font-bold tracking-wider uppercase">
                <span>CUSTOM WEBSITE SOLUTIONS</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Unique Websites{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#F59E0B]">
                  Tailored to Your Business Needs
                </span>
              </h1>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
                Get a fully customized website designed to match your brand, goals and audience. From creative design to advanced functionality, we build websites that make a lasting impression.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onStartProject('Custom Website Project')}
                  className="flex items-center gap-2.5 bg-[#F95700] hover:bg-[#EA4D00] text-white px-7 py-3.5 rounded-full font-bold text-sm shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Start Your Project</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('custom-templates');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3.5 rounded-full font-semibold text-sm border border-slate-200 shadow-xs"
                >
                  <span>View Our Work</span>
                  <ArrowRight className="w-4 h-4 text-orange-600" />
                </button>
              </div>
            </div>

            {/* Right: Mockup Illustration */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative max-w-[480px] w-full">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-950">
                  <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80"
                    alt="Custom Web Architecture"
                    className="w-full aspect-16/10 object-cover"
                  />
                  <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-t border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-white">Nexora Modern Corporate Template</div>
                      <div className="text-[11px] text-orange-400">Interactive live estimate calculator</div>
                    </div>
                    <span className="text-xs font-mono font-bold bg-orange-600 px-2.5 py-1 rounded">
                      Demo Live
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
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Custom Design</div>
                <div className="text-slate-500 text-xs">Tailored to Your Brand</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Modern & Responsive</div>
                <div className="text-slate-500 text-xs">All Devices Friendly</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">SEO Optimized</div>
                <div className="text-slate-500 text-xs">Better Search Visibility</div>
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

      {/* Choose Your Website Type (8 Cards matching Reference Image 10) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900">
            Choose Your <span className="text-[#F95700]">Website Type</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Select the type of website you want to build.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {websiteTypes.map((type, i) => {
            const Icon = type.icon;
            return (
              <div
                key={i}
                onClick={() => onStartProject(`Custom ${type.title}`)}
                className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-orange-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${type.bg} ${type.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-orange-50 hover:text-orange-600">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{type.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{type.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Templates Section (matching Reference Image 10) */}
      <section id="custom-templates" className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              CUSTOM WEBSITE TEMPLATES
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Business Website <span className="text-[#F95700]">Templates</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Explore our professionally designed business website templates. Select a design that matches your brand.
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

        </div>
      </section>

    </div>
  );
};

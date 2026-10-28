import React, { useState } from 'react';
import {
  ArrowRight,
  Smartphone,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  Layers,
  Wrench,
  Radio,
  ChevronRight
} from 'lucide-react';
import { TemplateItem } from '../../types';
import { ALL_TEMPLATES } from '../../data/servicesData';
import { Breadcrumbs } from '../Breadcrumbs';

interface AppDevelopmentViewProps {
  onBack: () => void;
  onSelectPlatform: (platform: 'android' | 'ios' | 'all') => void;
  onLivePreview: (template: TemplateItem) => void;
  onUseDesign: (template: TemplateItem) => void;
  onStartProject: (requirementContext?: string) => void;
}

export const AppDevelopmentView: React.FC<AppDevelopmentViewProps> = ({
  onBack,
  onSelectPlatform,
  onLivePreview,
  onUseDesign,
  onStartProject
}) => {
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios'>('android');
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('All');

  const filterTabs = ['All', 'Business', 'E-commerce', 'Food & Delivery', 'Education', 'Healthcare', 'Travel'];

  const mobileTemplates = ALL_TEMPLATES.filter((t) => t.previewType === 'mobile-app');

  const filteredTemplates = mobileTemplates.filter((t) => {
    const platformMatch = t.platform ? t.platform === activePlatform : true;
    if (!platformMatch) return false;
    if (activeCategoryTab === 'All') return true;
    return (
      t.industryTag.toLowerCase() === activeCategoryTab.toLowerCase() ||
      t.tags.some((tag) => tag.toLowerCase() === activeCategoryTab.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-16">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: onBack },
          { label: 'Service', onClick: onBack },
          { label: 'App Development', active: true }
        ]}
      />

      {/* Hero Section matching Reference Image 8 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF6F0] to-[#FAF8F5] pt-2 pb-16 border-b border-orange-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-orange-300 bg-orange-50/80 text-orange-600 text-xs font-bold tracking-wider uppercase">
                <span>APP DEVELOPMENT</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Turn Your Ideas Into{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#F59E0B]">
                  Powerful Mobile Apps
                </span>
              </h1>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
                We design and develop high performance mobile applications for Android and iOS. From concept to launch, we help you build apps that users love.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onStartProject(`Mobile App Development (${activePlatform.toUpperCase()})`)}
                  className="flex items-center gap-2.5 bg-[#F95700] hover:bg-[#EA4D00] text-white px-7 py-3.5 rounded-full font-bold text-sm shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Discuss Your Idea</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onSelectPlatform('all')}
                  className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3.5 rounded-full font-semibold text-sm border border-slate-200 shadow-xs"
                >
                  <span>Browse All Android & iOS Templates</span>
                  <ArrowRight className="w-4 h-4 text-orange-600" />
                </button>
              </div>
            </div>

            {/* Right: Mockup Illustration */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative max-w-[480px] w-full">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-950">
                  <img
                    src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80"
                    alt="Mobile App Development"
                    className="w-full aspect-16/10 object-cover"
                  />
                  <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-t border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-white">Android & iOS App Prototypes</div>
                      <div className="text-[11px] text-orange-400">Interactive live screen navigator</div>
                    </div>
                    <button
                      onClick={() => onSelectPlatform('all')}
                      className="text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <span>Explore Demos</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Trust Badges */}
          <div className="mt-14 pt-8 border-t border-slate-200/80 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Custom App Solutions</div>
                <div className="text-slate-500 text-xs">Tailored to Your Business</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Modern UI/UX</div>
                <div className="text-slate-500 text-xs">User-Friendly Design</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Secure & Scalable</div>
                <div className="text-slate-500 text-xs">High Performance</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">End-to-End Support</div>
                <div className="text-slate-500 text-xs">From Idea to Launch</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Choose Your Platform Section (matching Reference Image 8) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Choose Your <span className="text-[#F95700]">Platform</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Select Android or iOS to view all dedicated templates, interactive prototypes, and samples.
            </p>
          </div>

          <button
            onClick={() => onSelectPlatform('all')}
            className="flex items-center gap-2 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-4 py-2 rounded-xl border border-orange-200 self-start sm:self-auto transition-colors"
          >
            <span>View All Mobile Templates (Both Platforms)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Android Card */}
          <div
            onClick={() => onSelectPlatform('android')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSelectPlatform('android');
            }}
            className="p-6 sm:p-8 rounded-3xl border-2 border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/20 shadow-xs hover:shadow-2xl cursor-pointer transition-all duration-300 flex items-center justify-between group transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                <span className="text-3xl">🤖</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 text-xl group-hover:text-emerald-700 transition-colors">
                    Android App Development
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    6 Templates
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
                  Click here to open the Android templates & samples page. Explore business, delivery, and booking apps.
                </p>
                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                  <span>Open Android Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          {/* iOS Card */}
          <div
            onClick={() => onSelectPlatform('ios')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSelectPlatform('ios');
            }}
            className="p-6 sm:p-8 rounded-3xl border-2 border-slate-200 hover:border-indigo-500 bg-white hover:bg-indigo-50/20 shadow-xs hover:shadow-2xl cursor-pointer transition-all duration-300 flex items-center justify-between group transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                <span className="text-3xl">🍏</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 text-xl group-hover:text-indigo-700 transition-colors">
                    iOS App Development
                  </h3>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    6 Templates
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
                  Click here to open the iOS templates & samples page. Explore Cupertino style apps, Apple Pay, & FaceID.
                </p>
                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                  <span>Open iOS Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </section>

      {/* App Templates Section */}
      <section id="app-templates" className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                {activePlatform.toUpperCase()} APP TEMPLATES
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {activePlatform === 'android' ? 'Android' : 'iOS'} App{' '}
                <span className="text-[#F95700]">Templates</span>
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Explore ready-made mobile app designs. Select a design and test the live phone preview.
              </p>
            </div>

            {/* Platform toggle right on this section */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                onClick={() => setActivePlatform('android')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activePlatform === 'android'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🤖 Android</span>
              </button>
              <button
                onClick={() => setActivePlatform('ios')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activePlatform === 'ios'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🍏 iOS</span>
              </button>
              <button
                onClick={() => onSelectPlatform(activePlatform)}
                className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-orange-600 hover:underline"
              >
                <span>Full Page</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 text-xs font-semibold no-scrollbar">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCategoryTab(tab)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeCategoryTab === tab
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
                    <div
                      className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                        activePlatform === 'ios' ? 'bg-indigo-600' : 'bg-emerald-600'
                      }`}
                    >
                      {activePlatform === 'ios' ? '🍏 iOS' : '🤖 Android'}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                        {tmpl.industryTag}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {activePlatform.toUpperCase()}
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
                    onClick={() => onLivePreview({ ...tmpl, platform: activePlatform })}
                    className="py-2.5 px-3 rounded-xl border border-slate-300 hover:border-orange-500 text-slate-700 hover:text-orange-600 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>View Demo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onUseDesign({ ...tmpl, platform: activePlatform })}
                    className="py-2.5 px-3 rounded-xl bg-[#F95700] hover:bg-[#EA4D00] text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Use This Design</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Direct link to dedicated page */}
          <div className="mt-10 text-center">
            <button
              onClick={() => onSelectPlatform(activePlatform)}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-full text-xs font-bold transition-all shadow-sm"
            >
              <span>View Dedicated {activePlatform === 'ios' ? 'iOS' : 'Android'} Templates Page</span>
              <ArrowRight className="w-4 h-4 text-orange-400" />
            </button>
          </div>
        </div>
      </section>

      {/* What We Offer Strip (4 Cards matching Reference Image 8) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl font-extrabold text-slate-900 mb-8">What We Offer</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Custom App Design & Dev</h4>
            <p className="text-xs text-slate-500">Native UI/UX flow built for iOS & Android.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">API Integration</h4>
            <p className="text-xs text-slate-500">High concurrency backend data sync.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Third-Party Services</h4>
            <p className="text-xs text-slate-500">Payment, Push, SMS, and Maps grounding.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">App Maintenance & Support</h4>
            <p className="text-xs text-slate-500">App store review guidelines and store uploads.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

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
  onLivePreview: (template: TemplateItem) => void;
  onUseDesign: (template: TemplateItem) => void;
  onStartProject: (requirementContext?: string) => void;
}

export const AppDevelopmentView: React.FC<AppDevelopmentViewProps> = ({
  onBack,
  onLivePreview,
  onUseDesign,
  onStartProject
}) => {
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios'>('android');
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('All');

  const filterTabs = ['All', 'Business', 'E-commerce', 'Food & Delivery', 'Education', 'Healthcare', 'Travel'];

  const mobileTemplates = ALL_TEMPLATES.filter((t) => t.previewType === 'mobile-app');

  const filteredTemplates = mobileTemplates.filter((t) => {
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
                  onClick={() => {
                    const el = document.getElementById('app-templates');
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
                    src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80"
                    alt="Mobile App Development"
                    className="w-full aspect-16/10 object-cover"
                  />
                  <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-t border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-white">Android & iOS App Prototypes</div>
                      <div className="text-[11px] text-orange-400">Interactive live screen navigator</div>
                    </div>
                    <span className="text-xs font-mono font-bold bg-orange-600 px-2.5 py-1 rounded">
                      Playground
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
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900">
            Choose Your <span className="text-[#F95700]">Platform</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Select the platform you want to build your mobile application for.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Android Card */}
          <div
            onClick={() => setActivePlatform('android')}
            className={`p-6 sm:p-8 rounded-3xl border cursor-pointer transition-all flex items-center justify-between ${
              activePlatform === 'android'
                ? 'border-emerald-500 bg-white shadow-lg ring-2 ring-emerald-200'
                : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <span className="text-3xl">🤖</span>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-xl">Android App Development</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Build feature-rich Android apps for a wide range of devices on Google Play.
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          {/* iOS Card */}
          <div
            onClick={() => setActivePlatform('ios')}
            className={`p-6 sm:p-8 rounded-3xl border cursor-pointer transition-all flex items-center justify-between ${
              activePlatform === 'ios'
                ? 'border-indigo-500 bg-white shadow-lg ring-2 ring-indigo-200'
                : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <span className="text-3xl">🍏</span>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-xl">iOS App Development</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  High-quality iOS apps with modern Swift/SwiftUI design and performance.
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

        </div>
      </section>

      {/* App Templates Section */}
      <section id="app-templates" className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              {activePlatform.toUpperCase()} APP TEMPLATES
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {activePlatform === 'android' ? 'Android' : 'iOS'} App <span className="text-[#F95700]">Templates</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Explore ready-made mobile app designs. Select a design and test the live phone preview.
            </p>
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
                    onClick={() => onLivePreview(tmpl)}
                    className="py-2.5 px-3 rounded-xl border border-slate-300 hover:border-orange-500 text-slate-700 hover:text-orange-600 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>View Demo</span>
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

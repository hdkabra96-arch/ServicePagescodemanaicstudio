import React, { useState } from 'react';
import {
  ArrowRight,
  Globe,
  BarChart3,
  User,
  FileText,
  ShoppingCart,
  GraduationCap,
  BookOpen,
  Settings,
  ShieldCheck,
  Users,
  Clock,
  Headphones,
  Laptop,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Smartphone,
  Zap,
  Search,
  Lock,
  Sliders
} from 'lucide-react';
import { TemplateItem, PageView } from '../../types';
import { ALL_TEMPLATES, WEBSITE_SOLUTIONS } from '../../data/servicesData';
import { Breadcrumbs } from '../Breadcrumbs';

interface WebsiteDevelopmentViewProps {
  onBack: () => void;
  onLivePreview: (template: TemplateItem) => void;
  onUseDesign: (template: TemplateItem) => void;
  onStartProject: (requirementContext?: string) => void;
}

export const WebsiteDevelopmentView: React.FC<WebsiteDevelopmentViewProps> = ({
  onBack,
  onLivePreview,
  onUseDesign,
  onStartProject
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Business Websites');
  const [activeFilterTab, setActiveFilterTab] = useState<string>('All');

  const filterTabs = [
    'All',
    'Corporate',
    'Local Business',
    'Service Provider',
    'Consultant',
    'Restaurant',
    'Real Estate',
    'Healthcare'
  ];

  const websiteTemplates = ALL_TEMPLATES.filter((t) => t.previewType === 'website');

  const filteredTemplates = websiteTemplates.filter((t) => {
    if (activeFilterTab === 'All') return true;
    return (
      t.industryTag.toLowerCase() === activeFilterTab.toLowerCase() ||
      t.tags.some((tag) => tag.toLowerCase() === activeFilterTab.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-16">
      
      {/* Breadcrumbs matching Reference Image 2 */}
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: onBack },
          { label: 'Service', onClick: onBack },
          { label: 'Website Development', active: true }
        ]}
      />

      {/* Hero Section matching Reference Image 2 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF6F0] to-[#FAF8F5] pt-2 pb-16 border-b border-orange-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-orange-300 bg-orange-50/80 text-orange-600 text-xs font-bold tracking-wider uppercase">
                <span>WEBSITE DEVELOPMENT</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Websites That Turn{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#F59E0B]">
                  Visitors Into Customers
                </span>
              </h1>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
                We design and develop fast, responsive and professional websites tailored to your business, brand and goals.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onStartProject('Website Development Custom Solution')}
                  className="flex items-center gap-2.5 bg-[#F95700] hover:bg-[#EA4D00] text-white px-7 py-3.5 rounded-full font-bold text-sm shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Start Your Project</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('templates-section');
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
              <div className="relative max-w-[500px] w-full">
                <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80"
                    alt="Website Development Workspace"
                    className="w-full aspect-16/10 object-cover"
                  />
                  <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-t border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-white">Modern Corporate & Business Templates</div>
                      <div className="text-[11px] text-orange-400">Tested on mobile, tablet & desktop</div>
                    </div>
                    <span className="text-xs font-mono font-bold bg-orange-600 px-2.5 py-1 rounded">
                      Live Previews
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
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-sm">100%</div>
                <div className="text-slate-500 text-xs">Client Satisfaction</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Custom Solutions</div>
                <div className="text-slate-500 text-xs">Tailored to Your Needs</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">On-Time Delivery</div>
                <div className="text-slate-500 text-xs">Reliable & Professional</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Ongoing Support</div>
                <div className="text-slate-500 text-xs">Even After Launch</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Website Solutions for Every Need (8 Cards from Reference Image 2 & 4) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-3">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Website Solutions <span className="text-[#F95700]">for Every Need</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Select any website type below to inspect templates and interactive designs.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium italic">
            Choose the right type of website for your business.
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {WEBSITE_SOLUTIONS.map((sol) => (
            <div
              key={sol.id}
              onClick={() => setSelectedCategory(sol.name)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                selectedCategory === sol.name
                  ? 'border-orange-500 bg-white shadow-md ring-2 ring-orange-200'
                  : 'border-slate-100 bg-white hover:border-orange-200 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-orange-50 hover:text-orange-600">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {sol.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {sol.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Templates Section (matching Reference Image 3 Step 2) */}
      <section id="templates-section" className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-left mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              BUSINESS WEBSITE TEMPLATES
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Choose Your Business <span className="text-[#F95700]">Website Design</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl">
              Explore our professionally designed business website templates. Select a design you like and we will customize it for your business.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 text-xs font-semibold no-scrollbar">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilterTab(tab)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeFilterTab === tab
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Templates Grid (6 Cards from Reference Image 3 Step 2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-orange-300 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                    <img
                      src={tmpl.thumbnail}
                      alt={tmpl.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
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

                    <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-orange-600 transition-colors">
                      {tmpl.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {tmpl.description}
                    </p>
                  </div>
                </div>

                {/* Dual Action Buttons (matching Reference Image 3 Step 2) */}
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

      {/* Everything You Need for a Professional Website (6 Feature Cards from Image 2) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900">
            Everything You Need for a <span className="text-[#F95700]">Professional Website</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Features that make your website successful, secure, and conversion-ready.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Responsive Design</h4>
              <p className="text-xs text-slate-500 mt-1">Works beautifully on desktop, tablet, and mobile browsers.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Modern UI/UX</h4>
              <p className="text-xs text-slate-500 mt-1">Clean and engaging typography and user experience.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Fast Performance</h4>
              <p className="text-xs text-slate-500 mt-1">Optimized for speed and sub-second load times.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">SEO Friendly</h4>
              <p className="text-xs text-slate-500 mt-1">Structured with search-engine-friendly practices and schemas.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Secure & Reliable</h4>
              <p className="text-xs text-slate-500 mt-1">Built with HTTPS security, sanitization, and 99.9% uptime.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Easy to Manage</h4>
              <p className="text-xs text-slate-500 mt-1">CMS/admin functionality whenever you need to update content.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Free Consultation Banner matching Image 2 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="rounded-3xl bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#111827] border border-orange-500/20 p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <span className="text-orange-400 font-bold text-xs uppercase tracking-widest">
              LET'S BUILD YOUR WEBSITE
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-1">
              Every Business Has <span className="text-orange-400">Different Requirements.</span>
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-lg">
              Tell us what you need and we'll provide the right customized web solution.
            </p>
          </div>
          <button
            onClick={() => onStartProject('Website Consultation')}
            className="bg-[#F95700] hover:bg-[#EA4D00] text-white px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm shadow-md shadow-orange-500/30 whitespace-nowrap"
          >
            Get a Free Consultation &rarr;
          </button>
        </div>
      </div>

    </div>
  );
};

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
  onSelectCategory: (categoryId: string) => void;
  onLivePreview: (template: TemplateItem) => void;
  onUseDesign: (template: TemplateItem) => void;
  onStartProject: (requirementContext?: string) => void;
}

export const WebsiteDevelopmentView: React.FC<WebsiteDevelopmentViewProps> = ({
  onBack,
  onSelectCategory,
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

            {/* Right: Multi-Aesthetic Bespoke Showcase Collage */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 relative rounded-xl overflow-hidden border border-slate-200 shadow-lg bg-[#1C1714]">
                  <img
                    src="/src/assets/images/hero_luxury_estate_1795231129293.jpg"
                    alt="Vallon Estates bespoke architectural real estate website"
                    referrerPolicy="no-referrer"
                    className="w-full aspect-16/9 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                  <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between text-white">
                    <div>
                      <p className="text-[11px] font-mono uppercase tracking-wider text-slate-300">Vallon Estates · Luxury Realty</p>
                      <p className="text-sm font-semibold">Architectural Concrete &amp; Interactive Mortgage Desk</p>
                    </div>
                    <span className="text-xs font-mono text-white/90 shrink-0">Live</span>
                  </div>
                </div>

                <div className="col-span-6 relative rounded-xl overflow-hidden border border-slate-200 shadow-md bg-[#1C1714]">
                  <img
                    src="/src/assets/images/hero_fine_dining_1795231129012.jpg"
                    alt="Osteria Brasa candlelit hospitality website"
                    referrerPolicy="no-referrer"
                    className="w-full aspect-4/3 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <p className="text-xs font-semibold leading-tight">Osteria Brasa</p>
                    <p className="text-[10px] text-amber-200/90">Fine Dining · Table Booking</p>
                  </div>
                </div>

                <div className="col-span-6 relative rounded-xl overflow-hidden border border-slate-200 shadow-md bg-[#1B4332]">
                  <img
                    src="/src/assets/images/hero_medical_clinic_1795231128255.jpg"
                    alt="Arcadia Health Nordic private clinic website"
                    referrerPolicy="no-referrer"
                    className="w-full aspect-4/3 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <p className="text-xs font-semibold leading-tight">Arcadia Health</p>
                    <p className="text-[10px] text-emerald-200/90">Nordic Clinic · Slot Picker</p>
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

      {/* Website Solutions for Every Need */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-3">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight" style={{ textWrap: 'balance' }}>
              Website Solutions <span className="text-[#F95700]">for Every Industry</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Each category is engineered with its own visual system, typography, and conversion workflow.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            8 specialized website architectures
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WEBSITE_SOLUTIONS.map((sol) => {
            const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
              Globe,
              BarChart3,
              User,
              FileText,
              ShoppingCart,
              GraduationCap,
              BookOpen,
              Settings
            };
            const paletteMap: Record<string, { bg: string; text: string; hoverBorder: string }> = {
              orange: { bg: 'bg-orange-50', text: 'text-orange-700', hoverBorder: 'hover:border-orange-500' },
              blue: { bg: 'bg-sky-50', text: 'text-sky-800', hoverBorder: 'hover:border-sky-600' },
              pink: { bg: 'bg-rose-50', text: 'text-rose-700', hoverBorder: 'hover:border-rose-500' },
              teal: { bg: 'bg-teal-50', text: 'text-teal-800', hoverBorder: 'hover:border-teal-600' },
              purple: { bg: 'bg-indigo-50', text: 'text-indigo-700', hoverBorder: 'hover:border-indigo-600' },
              amber: { bg: 'bg-amber-50', text: 'text-amber-800', hoverBorder: 'hover:border-amber-600' },
              sky: { bg: 'bg-slate-100', text: 'text-slate-800', hoverBorder: 'hover:border-slate-700' },
              rose: { bg: 'bg-emerald-50', text: 'text-emerald-800', hoverBorder: 'hover:border-emerald-600' }
            };
            const IconComp = iconMap[sol.icon] || Globe;
            const pal = paletteMap[sol.color] || paletteMap.orange;

            return (
              <div
                key={sol.id}
                onClick={() => onSelectCategory(sol.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onSelectCategory(sol.id);
                }}
                className={`p-6 rounded-xl border border-slate-200 ${pal.hoverBorder} bg-white hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between group`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-11 h-11 rounded-lg ${pal.bg} ${pal.text} flex items-center justify-center`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {sol.name}
                  </h3>
                  {(sol as any).badge && (
                    <p className="text-xs font-semibold text-orange-600 mt-1">
                      {(sol as any).badge}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {sol.desc}
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-slate-800 group-hover:text-orange-600 transition-colors">
                    <span>Explore Designs</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Flagship Custom Website Showcase */}
      <section id="templates-section" className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">
                Bespoke Live Websites
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1" style={{ textWrap: 'balance' }}>
                Distinctive Designs Built for <span className="text-[#F95700]">Real Businesses</span>
              </h2>
              <p className="text-slate-600 text-sm mt-2 max-w-2xl leading-relaxed">
                Every website below is a complete, original experience with its own color system, typography, layout architecture, and live interactive booking or calculator workflow — never a recycled theme.
              </p>
            </div>
          </div>

          {/* Interactive Filter Controls */}
          <div className="inline-flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl mb-10">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilterTab(tab)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeFilterTab === tab
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Bespoke Project Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTemplates.map((tmpl) => {
              const designProfiles: Record<string, { style: string; capability: string; swatches: string[]; surface: string }> = {
                'BIZ-001': { style: 'Swiss Technical Grid', capability: 'Live ROI Calculator & Licensing', swatches: ['#FFFFFF', '#090D16', '#1D4ED8'], surface: 'bg-[#F8FAFC]' },
                'BIZ-002': { style: 'Milan Monochrome Editorial', capability: 'Case Study Lightbox & Brief', swatches: ['#F5F4F0', '#0A0A0A', '#E12D1E'], surface: 'bg-[#F5F4F0]' },
                'BIZ-003': { style: 'Heritage Navy & Limestone', capability: 'Practice Matrix & Global Desk', swatches: ['#F6F4EF', '#0C1B2A', '#9A7B4F'], surface: 'bg-[#F6F4EF]' },
                'BIZ-004': { style: 'Candlelit Parchment Serif', capability: 'Dietary Menu & Table Booking', swatches: ['#F7F3EC', '#1C1714', '#B44B27'], surface: 'bg-[#F7F3EC]' },
                'BIZ-005': { style: 'Architectural Concrete', capability: 'Property Filter & Mortgage Calc', swatches: ['#F4F5F6', '#0D131A', '#1F4E46'], surface: 'bg-[#F4F5F6]' },
                'BIZ-006': { style: 'Nordic Botanical Ivory', capability: 'Same-Day Doctor Slot Booking', swatches: ['#FBFBF8', '#1B4332', '#EEF4F0'], surface: 'bg-[#F3F7F4]' },
                'PORT-001': { style: 'Limestone Monograph', capability: 'Grid & Archival Spec Ledger', swatches: ['#ECEAE4', '#141413', '#8C6239'], surface: 'bg-[#ECEAE4]' },
                'PORT-002': { style: 'Editorial Creative Reel', capability: 'Discipline Filter & Lightbox', swatches: ['#F5F4F0', '#0A0A0A', '#E12D1E'], surface: 'bg-[#F5F4F0]' },
                'PORT-003': { style: 'Spatial Gallery Edition', capability: 'Material Swatches & Dossiers', swatches: ['#ECEAE4', '#141413', '#8C6239'], surface: 'bg-[#ECEAE4]' },
                'BLOG-001': { style: 'Newsprint Broadsheet', capability: 'Article Reader & Sections', swatches: ['#FAF8F3', '#141414', '#9E1B1B'], surface: 'bg-[#FAF8F3]' },
                'EDU-002': { style: 'Collegiate Forest & Gold', capability: 'Program Finder & Campus Visit', swatches: ['#F8F7F2', '#0F3D2E', '#B5892F'], surface: 'bg-[#F8F7F2]' }
              };

              const profile =
                designProfiles[tmpl.templateCode] ||
                (tmpl.templateCode.startsWith('BLOG')
                  ? designProfiles['BLOG-001']
                  : tmpl.templateCode.startsWith('EDU')
                  ? designProfiles['EDU-002']
                  : tmpl.templateCode.startsWith('PORT')
                  ? designProfiles['PORT-001']
                  : designProfiles['BIZ-001']);

              return (
                <article
                  key={tmpl.id}
                  className="group bg-white rounded-xl border border-slate-200 hover:border-slate-400 transition-all duration-200 overflow-hidden flex flex-col justify-between hover:shadow-lg"
                >
                  <div>
                    {/* Bespoke Full-Bleed Preview Frame */}
                    <div
                      onClick={() => onLivePreview(tmpl)}
                      className="relative aspect-16/10 overflow-hidden bg-slate-900 cursor-pointer"
                    >
                      <img
                        src={tmpl.thumbnail}
                        alt={tmpl.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                      {/* Bottom overlay showing genuine theme palette & style */}
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2 text-white">
                        <span className="text-xs font-medium tracking-tight truncate">
                          {profile.style}
                        </span>
                        <div className="flex items-center gap-1 shrink-0" title="Website Color System">
                          {profile.swatches.map((hex) => (
                            <span
                              key={hex}
                              className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-xs"
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Clean Unboxed Metadata + Copy */}
                    <div className={`p-6 space-y-2.5 ${profile.surface} border-b border-slate-200/70`}>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <span className="text-slate-900 font-semibold">{tmpl.industryTag}</span>
                        <span aria-hidden="true">·</span>
                        <span>{tmpl.serviceCategory}</span>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-lg tracking-tight leading-snug">
                        {tmpl.name}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {tmpl.description}
                      </p>

                      <p className="text-xs font-semibold text-slate-800 pt-1">
                        Interactive: <span className="font-normal text-slate-600">{profile.capability}</span>
                      </p>
                    </div>
                  </div>

                  {/* Clean Action Row */}
                  <div className="p-4 bg-white grid grid-cols-2 gap-3">
                    <button
                      onClick={() => onLivePreview(tmpl)}
                      className="py-2.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <span>Open Live Site</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onUseDesign(tmpl)}
                      className="py-2.5 px-3 rounded-lg border border-slate-300 hover:border-orange-600 hover:text-orange-600 text-slate-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <span>Book This Style</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              );
            })}
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

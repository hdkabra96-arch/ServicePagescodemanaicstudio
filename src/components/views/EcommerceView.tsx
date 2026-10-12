import React, { useState } from 'react';
import {
  ArrowRight,
  ShoppingCart,
  ShieldCheck,
  CreditCard,
  Package,
  Layers,
  Wrench,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { TemplateItem } from '../../types';
import { ALL_TEMPLATES } from '../../data/servicesData';
import { Breadcrumbs } from '../Breadcrumbs';

interface EcommerceViewProps {
  onBack: () => void;
  onSelectCategory?: (categoryId: string) => void;
  onLivePreview: (template: TemplateItem) => void;
  onUseDesign: (template: TemplateItem) => void;
  onStartProject: (requirementContext?: string) => void;
}

export const EcommerceView: React.FC<EcommerceViewProps> = ({
  onBack,
  onSelectCategory,
  onLivePreview,
  onUseDesign,
  onStartProject
}) => {
  const [activeTab, setActiveTab] = useState('All');

  const filterTabs = ['All', 'Fashion', 'Electronics', 'Grocery', 'Furniture', 'Beauty', 'Multi-Vendor'];

  const ecomTemplates = ALL_TEMPLATES.filter((t) => t.previewType === 'ecommerce');

  const filteredTemplates = ecomTemplates.filter((t) => {
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
          { label: 'E-commerce Solutions', active: true }
        ]}
      />

      {/* Hero Section matching Reference Image 9 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF6F0] to-[#FAF8F5] pt-2 pb-16 border-b border-orange-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-orange-300 bg-orange-50/80 text-orange-600 text-xs font-bold tracking-wider uppercase">
                <span>E-COMMERCE SOLUTIONS</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Build Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#F59E0B]">
                  Online Store with Confidence
                </span>
              </h1>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
                We design and develop high-performing e-commerce websites that help you sell products online and grow your business.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onStartProject('E-commerce Store Project')}
                  className="flex items-center gap-2.5 bg-[#F95700] hover:bg-[#EA4D00] text-white px-7 py-3.5 rounded-full font-bold text-sm shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Start Your Project</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('ecom-templates');
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
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80"
                    alt="E-commerce Storefront"
                    className="w-full aspect-16/10 object-cover"
                  />
                  <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-t border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-white">Full E-commerce Architecture</div>
                      <div className="text-[11px] text-orange-400">Cart, Payment Gateway & Order Pipeline</div>
                    </div>
                    <span className="text-xs font-mono font-bold bg-orange-600 px-2.5 py-1 rounded">
                      Live Store Demo
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
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Modern Design</div>
                <div className="text-slate-500 text-xs">Tailored to Your Brand</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Secure Payment</div>
                <div className="text-slate-500 text-xs">Seamless Integration</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Easy Product Management</div>
                <div className="text-slate-500 text-xs">Inventory & Variants</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Mobile Responsive</div>
                <div className="text-slate-500 text-xs">& SEO Friendly</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Choose Your Solution (4 Solution Cards matching Reference Image 9) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900">
            Choose Your <span className="text-[#F95700]">Solution</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Select the type of e-commerce website you want to build.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { id: 'multi-vendor', title: 'Multi-Vendor Marketplace', icon: '🏪', desc: 'Allow multiple sellers to list products and receive automated split commissions.' },
            { id: 'single-vendor', title: 'Single Vendor Online Store', icon: '🛒', desc: 'Direct-to-consumer store for your brand with full control over inventory.' },
            { id: 'niche-store', title: 'Niche Store (Fashion / Food)', icon: '🛍️', desc: 'Specialized layout tuned for apparel, culinary, or luxury lifestyle.' },
            { id: 'custom-ecommerce', title: 'Custom E-commerce Solution', icon: '⚙️', desc: 'Bespoke checkout, subscription models, and B2B wholesale portals.' },
          ].map((sol) => (
            <div
              key={sol.id}
              onClick={() => {
                if (onSelectCategory) {
                  onSelectCategory(sol.id);
                } else {
                  onStartProject(sol.title);
                }
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if (onSelectCategory) onSelectCategory(sol.id);
                }
              }}
              className="bg-white p-6 rounded-2xl border-2 border-slate-100 hover:border-orange-500 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group transform hover:-translate-y-1"
            >
              <div>
                <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">{sol.icon}</span>
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-orange-600 transition-colors">{sol.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{sol.desc}</p>
              </div>
              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-orange-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>Explore Templates</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Templates Section (matching Reference Image 9) */}
      <section id="ecom-templates" className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              STORE TEMPLATES
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              E-commerce Website <span className="text-[#F95700]">Templates</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Explore our ready-made e-commerce website designs. Choose a template that matches your business.
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-orange-300 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-4/3 overflow-hidden bg-slate-900">
                    <img
                      src={tmpl.thumbnail}
                      alt={tmpl.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                      {tmpl.templateCode}
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                      {tmpl.industryTag}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base">{tmpl.name}</h3>
                    <p className="text-xs text-slate-500 leading-snug line-clamp-2">{tmpl.description}</p>
                  </div>
                </div>

                <div className="p-4 pt-0 grid grid-cols-2 gap-2 border-t border-slate-50 mt-2">
                  <button
                    onClick={() => onLivePreview(tmpl)}
                    className="py-2 px-2.5 rounded-lg border border-slate-300 hover:border-orange-500 text-slate-700 hover:text-orange-600 font-bold text-[11px] transition-all flex items-center justify-center gap-1"
                  >
                    <span>Live Preview</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onUseDesign(tmpl)}
                    className="py-2 px-2.5 rounded-lg bg-[#F95700] hover:bg-[#EA4D00] text-white font-bold text-[11px] shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1"
                  >
                    <span>Use Design</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* What We Offer (5 items from Image 9) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl font-extrabold text-slate-900 mb-8">What We Offer</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <Wrench className="w-6 h-6 text-orange-600" />
            <h4 className="font-bold text-slate-900 text-xs">Custom Design & Dev</h4>
            <p className="text-[11px] text-slate-500">Bespoke store themes tailored to convert.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <h4 className="font-bold text-slate-900 text-xs">Payment Gateway</h4>
            <p className="text-[11px] text-slate-500">Razorpay, Stripe, UPI & Net Banking.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <Package className="w-6 h-6 text-emerald-600" />
            <h4 className="font-bold text-slate-900 text-xs">Product & Orders</h4>
            <p className="text-[11px] text-slate-500">Barcode, stock alerts & shipping labels.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <Layers className="w-6 h-6 text-purple-600" />
            <h4 className="font-bold text-slate-900 text-xs">3rd-Party Integrations</h4>
            <p className="text-[11px] text-slate-500">Shiprocket, WhatsApp & ERP systems.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <ShieldCheck className="w-6 h-6 text-rose-600" />
            <h4 className="font-bold text-slate-900 text-xs">Ongoing Maintenance</h4>
            <p className="text-[11px] text-slate-500">Speed monitoring and security audits.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

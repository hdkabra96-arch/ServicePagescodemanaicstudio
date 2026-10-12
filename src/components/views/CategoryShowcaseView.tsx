import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Globe,
  BarChart3,
  User,
  FileText,
  ShoppingCart,
  GraduationCap,
  BookOpen,
  Settings,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Receipt,
  UserCheck,
  Smartphone,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Sliders
} from 'lucide-react';
import { TemplateItem, PageView } from '../../types';
import {
  ALL_TEMPLATES,
  WEBSITE_SOLUTIONS,
  WEB_APP_SOLUTIONS
} from '../../data/servicesData';
import { Breadcrumbs } from '../Breadcrumbs';

interface CategoryShowcaseViewProps {
  categoryId: string; // e.g. 'business', 'admin-panel', 'crm', 'multi-vendor', 'corporate', etc.
  parentService: string; // 'website-development' | 'web-application' | 'ecommerce' | 'custom-websites' | 'app-development'
  onBack: () => void;
  onSelectCategory: (categoryId: string) => void;
  onLivePreview: (template: TemplateItem) => void;
  onUseDesign: (template: TemplateItem) => void;
  onStartProject: (context?: string) => void;
}

// Master list of all categorized metadata across the platform
const ALL_CATEGORY_DEFINITIONS = [
  // Website Development Categories
  {
    id: 'business',
    name: 'Business Websites',
    parent: 'website-development',
    parentName: 'Website Development',
    icon: Globe,
    desc: 'High-converting, responsive websites tailored for professional businesses, service agencies, and corporate brands.',
    badge: '6 Professional Templates'
  },
  {
    id: 'corporate',
    name: 'Corporate Websites',
    parent: 'website-development',
    parentName: 'Website Development',
    icon: BarChart3,
    desc: 'Authoritative online portals for enterprises, industrial groups, financial advisory, and investment partnerships.',
    badge: '4 Enterprise Templates'
  },
  {
    id: 'portfolio',
    name: 'Portfolio Websites',
    parent: 'website-development',
    parentName: 'Website Development',
    icon: User,
    desc: 'Stunning visual portfolios and showcase layouts for design studios, architects, creative freelancers, and digital creators.',
    badge: '4 Showcase Templates'
  },
  {
    id: 'landing',
    name: 'Landing Pages',
    parent: 'website-development',
    parentName: 'Website Development',
    icon: FileText,
    desc: 'High-octane sales and lead-capture landing pages for SaaS launches, mobile apps, events, and PPC campaigns.',
    badge: '4 High-Conversion Templates'
  },
  {
    id: 'educational',
    name: 'Educational Websites',
    parent: 'website-development',
    parentName: 'Website Development',
    icon: GraduationCap,
    desc: 'Modern online learning portals, school websites, university departments, and coding bootcamp admission funnels.',
    badge: '4 Learning Templates'
  },
  {
    id: 'blog',
    name: 'Blog & Content Websites',
    parent: 'website-development',
    parentName: 'Website Development',
    icon: BookOpen,
    desc: 'Fast, SEO-optimized editorial magazines, news hubs, lifestyle journals, and culinary publications.',
    badge: '4 Editorial Templates'
  },
  {
    id: 'realestate',
    name: 'Real Estate Websites',
    parent: 'website-development',
    parentName: 'Website Development',
    icon: Globe,
    desc: 'Luxury property listings with interactive map filters, virtual walkthroughs, floorplan viewers, and broker desks.',
    badge: '3 Realty Templates'
  },
  {
    id: 'restaurant',
    name: 'Restaurant & Food Websites',
    parent: 'website-development',
    parentName: 'Website Development',
    icon: Globe,
    desc: 'Appetizing visual menus, table reservation calendars, chef showcases, and online ordering integrations.',
    badge: '3 Dining Templates'
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Clinic',
    parent: 'website-development',
    parentName: 'Website Development',
    icon: ShieldCheck,
    desc: 'Patient-centric clinic portals with doctor appointment rosters, digital OPD queues, and emergency call lines.',
    badge: '3 Clinic Templates'
  },
  {
    id: 'custom',
    name: 'Custom Websites',
    parent: 'website-development',
    parentName: 'Website Development',
    icon: Settings,
    desc: 'Bespoke custom-coded web architectures tailored from scratch for unique digital business concepts.',
    badge: '6 Custom Templates'
  },

  // Web Application Development Categories
  {
    id: 'admin-panel',
    name: 'Admin Panels & Dashboards',
    parent: 'web-application',
    parentName: 'Web Application Development',
    icon: Settings,
    desc: 'Complete operational command centers with role-based user management, live revenue metrics, orders, and system logs.',
    badge: '3 Working Demos'
  },
  {
    id: 'dashboard',
    name: 'Dashboard Development',
    parent: 'web-application',
    parentName: 'Web Application Development',
    icon: BarChart3,
    desc: 'Interactive business telemetry, KPI visualizers, real-time analytics, fleet tracking, and financial graphs.',
    badge: '3 Data Demos'
  },
  {
    id: 'crm',
    name: 'CRM Systems',
    parent: 'web-application',
    parentName: 'Web Application Development',
    icon: UserCheck,
    desc: 'Customer Relationship Management with deal pipelines, lead activity timelines, WhatsApp automation, and agent scores.',
    badge: '3 CRM Templates'
  },
  {
    id: 'booking',
    name: 'Booking Systems',
    parent: 'web-application',
    parentName: 'Web Application Development',
    icon: Calendar,
    desc: 'Automated appointment calendars, staff shift rosters, token queue screens, and deposit payment processing.',
    badge: '3 Booking Demos'
  },
  {
    id: 'billing',
    name: 'Billing & Invoicing Systems',
    parent: 'web-application',
    parentName: 'Web Application Development',
    icon: Receipt,
    desc: 'Automated GST invoice generation, recurring SaaS subscriptions, point-of-sale fast checkout, and overdue payment alerts.',
    badge: '3 Billing Engines'
  },
  {
    id: 'student-mgmt',
    name: 'Student Management Systems',
    parent: 'web-application',
    parentName: 'Web Application Development',
    icon: GraduationCap,
    desc: 'University campus ERP, coaching academy batch schedulers, attendance tracking, and parent progress report cards.',
    badge: '3 School LMS Demos'
  },

  // E-commerce Solutions Categories
  {
    id: 'ecommerce',
    name: 'E-commerce Solutions',
    parent: 'ecommerce',
    parentName: 'E-commerce Solutions',
    icon: ShoppingCart,
    desc: 'Conversion-focused digital storefronts with seamless payment gateways, cart management, and inventory tracking.',
    badge: '8 Store Templates'
  },
  {
    id: 'multi-vendor',
    name: 'Multi-Vendor Marketplace',
    parent: 'ecommerce',
    parentName: 'E-commerce Solutions',
    icon: ShoppingCart,
    desc: 'Independent merchant platforms with separate seller portals, automated commission splits, and unified customer checkout.',
    badge: 'Marketplace Ready'
  },
  {
    id: 'single-vendor',
    name: 'Single Vendor D2C Store',
    parent: 'ecommerce',
    parentName: 'E-commerce Solutions',
    icon: ShoppingCart,
    desc: 'Direct-to-consumer flagship storefronts with 1-click checkout, bundle discounts, and Instagram shop integration.',
    badge: 'D2C Brand Flagship'
  },
  {
    id: 'niche-store',
    name: 'Niche Stores (Fashion & Luxury)',
    parent: 'ecommerce',
    parentName: 'E-commerce Solutions',
    icon: ShoppingCart,
    desc: 'Specialized aesthetic layouts for fashion, jewelry, organic grocery, and Scandinavian furniture.',
    badge: '4 Niche Designs'
  },
  {
    id: 'custom-ecommerce',
    name: 'Custom B2B E-commerce',
    parent: 'ecommerce',
    parentName: 'E-commerce Solutions',
    icon: Settings,
    desc: 'Bespoke wholesale portals with tiered volume pricing, bulk CSV upload, purchase orders, and net-30 terms.',
    badge: 'B2B Enterprise Portal'
  },

  // Custom Websites Categories
  {
    id: 'custom-websites',
    name: 'Custom Websites',
    parent: 'custom-websites',
    parentName: 'Custom Websites',
    icon: Settings,
    desc: 'Bespoke digital architecture built ground-up for unique brand identities, startups, and specialized business logic.',
    badge: '6 Custom Blueprints'
  },
  {
    id: 'startup',
    name: 'Startup & Tech Websites',
    parent: 'custom-websites',
    parentName: 'Custom Websites',
    icon: Sparkles,
    desc: 'High-growth tech ventures with investor dashboards, product waitlists, dark mode aesthetics, and API sandboxes.',
    badge: 'Tech & SaaS Ready'
  }
];

export const CategoryShowcaseView: React.FC<CategoryShowcaseViewProps> = ({
  categoryId,
  parentService,
  onBack,
  onSelectCategory,
  onLivePreview,
  onUseDesign,
  onStartProject
}) => {
  const [activeTagFilter, setActiveTagFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Find category metadata
  const currentCategoryMeta = useMemo(() => {
    const found = ALL_CATEGORY_DEFINITIONS.find(
      (c) =>
        c.id.toLowerCase() === categoryId.toLowerCase() ||
        c.name.toLowerCase().includes(categoryId.toLowerCase()) ||
        categoryId.toLowerCase().includes(c.id.toLowerCase())
    );

    if (found) return found;

    // Fallback based on parentService
    if (parentService === 'web-application') {
      return ALL_CATEGORY_DEFINITIONS.find((c) => c.id === 'admin-panel') || ALL_CATEGORY_DEFINITIONS[10];
    }
    if (parentService === 'ecommerce') {
      return ALL_CATEGORY_DEFINITIONS.find((c) => c.id === 'ecommerce') || ALL_CATEGORY_DEFINITIONS[16];
    }
    if (parentService === 'custom-websites') {
      return ALL_CATEGORY_DEFINITIONS.find((c) => c.id === 'custom') || ALL_CATEGORY_DEFINITIONS[9];
    }
    return ALL_CATEGORY_DEFINITIONS[0];
  }, [categoryId, parentService]);

  // Sibling categories in the same parent group for quick switching
  const siblingCategories = useMemo(() => {
    const parent = currentCategoryMeta.parent || parentService;
    const siblings = ALL_CATEGORY_DEFINITIONS.filter(
      (c) => c.parent === parent || (parentService && c.parent === parentService)
    );
    return siblings.length > 0 ? siblings : ALL_CATEGORY_DEFINITIONS.slice(0, 8);
  }, [currentCategoryMeta, parentService]);

  // Match all templates that belong to this category
  const categoryTemplates = useMemo(() => {
    const catId = currentCategoryMeta.id.toLowerCase();
    const catName = currentCategoryMeta.name.toLowerCase();

    return ALL_TEMPLATES.filter((t) => {
      const serviceCat = (t.serviceCategory || '').toLowerCase();
      const indTag = (t.industryTag || '').toLowerCase();
      const tags = (t.tags || []).map((tg) => tg.toLowerCase());
      const name = t.name.toLowerCase();
      const code = t.templateCode.toLowerCase();

      // Explicit ID matching
      if (catId === 'business') {
        return code.startsWith('biz-') || serviceCat.includes('business') || tags.includes('business');
      }
      if (catId === 'corporate') {
        return code.startsWith('corp-') || serviceCat.includes('corporate') || tags.includes('corporate');
      }
      if (catId === 'portfolio') {
        return code.startsWith('port-') || serviceCat.includes('portfolio') || tags.includes('portfolio');
      }
      if (catId === 'landing') {
        return code.startsWith('land-') || serviceCat.includes('landing') || tags.includes('landing');
      }
      if (catId === 'educational' || catId === 'education') {
        return code.startsWith('edu-') || serviceCat.includes('educational') || tags.includes('educational') || tags.includes('education');
      }
      if (catId === 'blog') {
        return code.startsWith('blog-') || serviceCat.includes('blog') || tags.includes('blog');
      }
      if (catId === 'realestate') {
        return indTag.includes('real estate') || tags.includes('real estate') || name.includes('estate') || name.includes('real');
      }
      if (catId === 'restaurant') {
        return indTag.includes('restaurant') || tags.includes('restaurant') || name.includes('restaurant') || name.includes('cafe') || name.includes('culinary');
      }
      if (catId === 'healthcare') {
        return indTag.includes('healthcare') || tags.includes('healthcare') || tags.includes('clinic') || name.includes('health') || name.includes('care');
      }
      if (catId === 'custom' || catId === 'custom-websites') {
        return code.startsWith('cust-') || serviceCat.includes('custom') || tags.includes('custom');
      }
      if (catId === 'admin-panel') {
        return code.startsWith('ap-') || serviceCat.includes('admin') || tags.includes('admin');
      }
      if (catId === 'dashboard') {
        return code.startsWith('dash-') || serviceCat.includes('dashboard') || tags.includes('dashboard');
      }
      if (catId === 'crm') {
        return code.startsWith('crm-') || serviceCat.includes('crm') || tags.includes('crm');
      }
      if (catId === 'booking') {
        return code.startsWith('bk-') || serviceCat.includes('booking') || tags.includes('booking') || t.previewType === 'booking';
      }
      if (catId === 'billing') {
        return code.startsWith('bill-') || serviceCat.includes('billing') || tags.includes('billing');
      }
      if (catId === 'student-mgmt' || catId === 'student') {
        return code.startsWith('st-') || serviceCat.includes('student') || tags.includes('student') || t.previewType === 'student';
      }
      if (catId === 'ecommerce') {
        return code.startsWith('ecom-') || serviceCat.includes('ecommerce') || serviceCat.includes('e-commerce') || t.previewType === 'ecommerce';
      }
      if (catId === 'multi-vendor') {
        return tags.includes('multi-vendor') || name.includes('multi-vendor') || name.includes('marketplace') || code.includes('05');
      }
      if (catId === 'single-vendor') {
        return tags.includes('single-vendor') || name.includes('d2c') || name.includes('brand flagship') || code.includes('06');
      }
      if (catId === 'niche-store') {
        return tags.includes('niche-store') || tags.includes('niche') || name.includes('luxury') || name.includes('jewelry') || code.includes('07') || code.includes('01');
      }
      if (catId === 'custom-ecommerce') {
        return tags.includes('custom-ecommerce') || tags.includes('wholesale') || tags.includes('b2b') || code.includes('08');
      }
      if (catId === 'startup') {
        return tags.includes('startup') || name.includes('startup') || indTag.includes('startup');
      }

      // General fallback
      return (
        serviceCat.includes(catId) ||
        indTag.includes(catId) ||
        tags.includes(catId) ||
        name.includes(catId)
      );
    });
  }, [currentCategoryMeta]);

  // Extract unique filter tags for this category
  const filterTabs = useMemo(() => {
    const tagSet = new Set<string>();
    tagSet.add('All');
    categoryTemplates.forEach((t) => {
      if (t.industryTag) tagSet.add(t.industryTag);
      (t.tags || []).forEach((tg) => {
        if (tg.length > 2 && tg.length < 20) tagSet.add(tg);
      });
    });
    return Array.from(tagSet).slice(0, 8);
  }, [categoryTemplates]);

  // Filter templates by tag and search query
  const filteredTemplates = useMemo(() => {
    return categoryTemplates.filter((t) => {
      const matchesTag =
        activeTagFilter === 'All' ||
        t.industryTag.toLowerCase() === activeTagFilter.toLowerCase() ||
        (t.tags || []).some((tg) => tg.toLowerCase() === activeTagFilter.toLowerCase());

      const matchesSearch =
        !searchQuery.trim() ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.templateCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesTag && matchesSearch;
    });
  }, [categoryTemplates, activeTagFilter, searchQuery]);

  const CategoryIcon = currentCategoryMeta.icon;

  const getParentServiceLabel = () => {
    switch (parentService) {
      case 'web-application':
        return 'Web Application Development';
      case 'ecommerce':
        return 'E-commerce Solutions';
      case 'custom-websites':
        return 'Custom Websites';
      case 'app-development':
        return 'App Development';
      case 'website-development':
      default:
        return 'Website Development';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      
      {/* Dynamic Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: onBack },
          { label: 'Services', onClick: onBack },
          { label: getParentServiceLabel(), onClick: onBack },
          { label: currentCategoryMeta.name, active: true }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        
        {/* Category Header Hero Banner */}
        <div className="bg-gradient-to-br from-[#FFFDF9] via-[#FAF6F0] to-[#FFF5EB] rounded-3xl p-6 sm:p-10 border border-orange-200/80 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-orange-300 bg-white text-orange-600 text-xs font-bold tracking-wider uppercase shadow-xs">
                  <CategoryIcon className="w-3.5 h-3.5" />
                  <span>{currentCategoryMeta.name}</span>
                </div>
                <span className="text-xs font-semibold text-orange-700 bg-orange-100/80 px-3 py-1 rounded-full">
                  {currentCategoryMeta.badge || `${categoryTemplates.length} Templates Available`}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {currentCategoryMeta.name}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#F59E0B]">
                  Templates & Working Demos
                </span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {currentCategoryMeta.desc} Click <strong>“Live Preview”</strong> on any template below to test the fully working interactive application demo with sample data, or click <strong>“Use This Design”</strong> to request customization with instant studio estimates.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                onClick={() => onStartProject(`${currentCategoryMeta.name} Project`)}
                className="flex items-center justify-center gap-2.5 bg-[#F95700] hover:bg-[#EA4D00] text-white px-7 py-3.5 rounded-full font-bold text-sm shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <span>Start {currentCategoryMeta.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onBack}
                className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-full font-semibold text-xs border border-slate-200 shadow-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to {getParentServiceLabel()}</span>
              </button>
            </div>

          </div>
        </div>

        {/* Quick Category Switcher Tabs */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-orange-600" />
              <span>Browse Categories in {getParentServiceLabel()}:</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Showing <strong className="text-slate-900">{filteredTemplates.length}</strong> of {categoryTemplates.length} templates
            </span>
          </div>

          <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-2 overflow-x-auto no-scrollbar">
            {siblingCategories.map((cat) => {
              const isActive = cat.id.toLowerCase() === currentCategoryMeta.id.toLowerCase();
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    setActiveTagFilter('All');
                    setSearchQuery('');
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Sub-Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          
          {/* Sub-tag filter buttons */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTagFilter(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeTagFilter === tab
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates or features..."
              className="w-full bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

        </div>

        {/* Templates Grid with Variety */}
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-orange-400 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group transform hover:-translate-y-1"
              >
                <div>
                  
                  {/* Thumbnail Banner with badges */}
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-900">
                    <img
                      src={tmpl.thumbnail}
                      alt={tmpl.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Template Code badge */}
                    <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-md shadow-xs border border-white/10">
                      {tmpl.templateCode}
                    </div>

                    {/* Category pill */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs border border-slate-200">
                      <Sparkles className="w-3 h-3 text-orange-600" />
                      <span>{tmpl.serviceCategory}</span>
                    </div>

                    {/* Live Preview Overlay on Hover */}
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="flex items-center gap-1.5 bg-white text-slate-900 px-4 py-2 rounded-full text-xs font-bold shadow-xl">
                        <Eye className="w-3.5 h-3.5 text-orange-600" />
                        <span>Click Live Preview</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-3">
                    
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200">
                        {tmpl.industryTag}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {tmpl.previewType.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-orange-600 transition-colors leading-snug">
                      {tmpl.name}
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {tmpl.description}
                    </p>

                    {/* Key features checklist */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-700">Included Features:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {tmpl.features.slice(0, 3).map((feat, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium text-slate-600 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-[130px]">{feat}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Dual Interactive Working Buttons */}
                <div className="p-6 pt-0 border-t border-slate-100 flex items-center gap-2 mt-4">
                  <button
                    onClick={() => onLivePreview(tmpl)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#F95700] hover:text-[#EA4D00] text-xs font-bold border border-orange-200 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Preview</span>
                  </button>

                  <button
                    onClick={() => onUseDesign(tmpl)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#F95700] hover:bg-[#EA4D00] text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <span>Use Design</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-xl mx-auto my-8">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-extrabold text-slate-900 text-lg">No matching templates found</h3>
            <p className="text-slate-500 text-xs mt-1 mb-6">
              We can build any bespoke {currentCategoryMeta.name} from scratch tailored exactly to your specification.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setActiveTagFilter('All');
                  setSearchQuery('');
                }}
                className="px-5 py-2.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={() => onStartProject(`Custom ${currentCategoryMeta.name}`)}
                className="px-6 py-2.5 rounded-full bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-colors"
              >
                Start Custom Project
              </button>
            </div>
          </div>
        )}

        {/* Bottom Banner: Custom Request Guarantee */}
        <div className="mt-16 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
              NEED SPECIFIC CUSTOMIZATION?
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900">
              Can't find the exact {currentCategoryMeta.name.toLowerCase()} design?
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              We customize any template or build completely bespoke systems from scratch with database integration, payment gateways, and custom branding.
            </p>
          </div>

          <button
            onClick={() => onStartProject(`Custom ${currentCategoryMeta.name} Requirement`)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-7 py-3.5 rounded-full font-bold text-xs shrink-0 self-start md:self-auto transition-colors"
          >
            <span>Request Custom Build</span>
            <ArrowRight className="w-4 h-4 text-orange-400" />
          </button>
        </div>

      </div>
    </div>
  );
};

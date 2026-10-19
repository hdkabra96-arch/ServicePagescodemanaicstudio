import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Sliders,
  Eye,
  Globe,
  Layers,
  Check,
  RotateCcw,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Star,
  Zap,
  Tag
} from 'lucide-react';
import { BusinessTemplateItem } from '../../types';
import { BUSINESS_TEMPLATES, TIER_DEFINITIONS, NAVIGATION_STYLES } from '../../data/businessTemplates';
import { PreviewToolbar, ViewportMode } from './PreviewToolbar';
import { BusinessTemplateRenderer } from '../demos/business/BusinessTemplateRenderer';
import { Breadcrumbs } from '../Breadcrumbs';

interface BusinessTemplateGalleryViewProps {
  onBack: () => void;
  onUseDesign: (template: BusinessTemplateItem) => void;
  onStartProject: (context?: string) => void;
}

export const BusinessTemplateGalleryView: React.FC<BusinessTemplateGalleryViewProps> = ({
  onBack,
  onUseDesign,
  onStartProject
}) => {
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedNavStyle, setSelectedNavStyle] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'number' | 'price-asc' | 'price-desc' | 'speed'>('number');

  // Live preview mode state
  const [previewTemplate, setPreviewTemplate] = useState<BusinessTemplateItem | null>(null);
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [currentPage, setCurrentPage] = useState<string>('');

  // Compute available pages for active preview template
  const templatePages = useMemo(() => {
    if (!previewTemplate) return [];
    const num = parseInt((previewTemplate.templateNumber || previewTemplate.templateCode || '').replace(/\D/g, ''), 10);
    switch (num) {
      case 1:
        return [
          { id: 'home', label: 'Home' },
          { id: 'services', label: 'Services' },
          { id: 'about', label: 'About' },
          { id: 'pricing', label: 'Pricing' },
          { id: 'contact', label: 'Contact' }
        ];
      case 2:
        return [
          { id: 'home', label: 'Home' },
          { id: 'services', label: 'Services' },
          { id: 'hours', label: 'Hours & Location' },
          { id: 'reviews', label: 'Reviews' },
          { id: 'estimate', label: 'Book Appointment' }
        ];
      case 3:
        return [
          { id: 'home', label: 'Home' },
          { id: 'services', label: 'Services' },
          { id: 'works', label: 'Selected Works' },
          { id: 'studio', label: 'About Atelier' },
          { id: 'contact', label: 'Start Project' }
        ];
      case 4:
        return [
          { id: 'home', label: 'Overview' },
          { id: 'practices', label: 'Practices' },
          { id: 'process', label: '4-Step Process' },
          { id: 'testimonials', label: 'Testimonials' },
          { id: 'contact', label: 'Consultation' }
        ];
      case 5:
        return [
          { id: 'home', label: 'Overview' },
          { id: 'expertise', label: 'Expertise' },
          { id: 'advisory', label: 'Advisory Formats' },
          { id: 'credentials', label: 'Credentials' },
          { id: 'apply', label: 'Apply' }
        ];
      case 6:
        return [
          { id: 'platform', label: 'Platform' },
          { id: 'treasury', label: 'Treasury API' },
          { id: 'security', label: 'Security Vault' },
          { id: 'company', label: 'Company' },
          { id: 'sandbox', label: 'Request Sandbox' }
        ];
      case 7:
        return [
          { id: 'manifesto', label: 'Manifesto' },
          { id: 'pillars', label: 'Pillars' },
          { id: 'works', label: 'Case Studies' },
          { id: 'contact', label: 'Start Mandate' }
        ];
      case 8:
        return [
          { id: 'front', label: 'Front Page' },
          { id: 'essays', label: 'Essays' },
          { id: 'practices', label: 'Advisory Practices' },
          { id: 'directorate', label: 'Directorate' },
          { id: 'inquiry', label: 'Private Briefing' }
        ];
      case 9:
        return [
          { id: 'overview', label: 'Overview' },
          { id: 'features', label: 'Features' },
          { id: 'telemetry', label: 'Live Telemetry' },
          { id: 'pricing', label: 'Pricing Plans' }
        ];
      case 10:
        return [
          { id: 'overview', label: 'Overview' },
          { id: 'logistics', label: 'Harbor Logistics' },
          { id: 'fleet', label: 'Fleet Telemetry' },
          { id: 'certs', label: 'Certifications' },
          { id: 'rfp', label: 'Submit RFP' }
        ];
      case 11:
        return [
          { id: 'overview', label: '1. Overview' },
          { id: 'sovereign', label: '2. Sovereign Trusts' },
          { id: 'family-office', label: '3. Family Office' },
          { id: 'credentials', label: '4. Credentials' },
          { id: 'consultation', label: '5. Consultation' }
        ];
      case 12:
        return [
          { id: 'briefing', label: '1. Executive Briefing' },
          { id: 'mandates', label: '2. M&A Mandates' },
          { id: 'metrics', label: '3. Market Telemetry' },
          { id: 'governance', label: '4. Governance' },
          { id: 'contact', label: '5. Consultation' }
        ];
      case 13:
        return [
          { id: 'atelier', label: '1. Atelier Home' },
          { id: 'editions', label: '2. Limited Editions' },
          { id: 'heritage', label: '3. Heritage' },
          { id: 'acquisitions', label: '4. Acquisitions' },
          { id: 'contact', label: '5. Private Client' }
        ];
      case 14:
        return [
          { id: 'overview', label: '1. Overview' },
          { id: 'monographs', label: '2. Monographs' },
          { id: 'materiality', label: '3. Materiality' },
          { id: 'studios', label: '4. Studios' },
          { id: 'contact', label: '5. Submit RFQ' }
        ];
      case 15:
        return [
          { id: 'optics', label: '1. Photonic Optics' },
          { id: 'waveguides', label: '2. Waveguides' },
          { id: 'cleanroom', label: '3. Cleanroom' },
          { id: 'standards', label: '4. Standards' },
          { id: 'inquire', label: '5. Inquire' }
        ];
      case 16:
        return [
          { id: 'model', label: '1. 3D Engine' },
          { id: 'specs', label: '2. Telemetry' },
          { id: 'mesh', label: '3. Quantum Mesh' },
          { id: 'kinematics', label: '4. Kinematics' },
          { id: 'sdk', label: '5. Enterprise SDK' },
          { id: 'benchmarks', label: '6. Benchmarks' },
          { id: 'showcase', label: '7. Deployments' },
          { id: 'hardware', label: '8. Sensor Suite' },
          { id: 'sandbox', label: '9. 3D Sandbox' },
          { id: 'licensing', label: '10. Dev Kit' }
        ];
      case 17:
        return [
          { id: 'reel', label: '1. Director Reel' },
          { id: 'commercials', label: '2. Commercials' },
          { id: 'narrative', label: '3. Narrative Films' },
          { id: 'vfx', label: '4. Motion VFX' },
          { id: 'audio', label: '5. Atmos Sound' },
          { id: 'crew', label: '6. Directors & Crew' },
          { id: 'awards', label: '7. Festival Awards' },
          { id: 'roster', label: '8. Brand Roster' },
          { id: 'studios', label: '9. Soundstages' },
          { id: 'commission', label: '10. Direct Booking' }
        ];
      case 18:
        return [
          { id: 'terminal', label: '1. Command Center' },
          { id: 'grid', label: '2. Network Grid' },
          { id: 'vault', label: '3. Quantum Vault' },
          { id: 'telemetry', label: '4. Threat Telemetry' },
          { id: 'edge', label: '5. Edge Nodes' },
          { id: 'sla', label: '6. 45s SLA' },
          { id: 'compliance', label: '7. SOC2 Compliance' },
          { id: 'intel', label: '8. Threat Intel' },
          { id: 'api', label: '9. API Docs' },
          { id: 'provision', label: '10. Provision Cluster' }
        ];
      case 19:
        return [
          { id: 'orbit', label: '1. Celestial Hub' },
          { id: 'nodes', label: '2. Satellite Fleet' },
          { id: 'constellation', label: '3. Optical Links' },
          { id: 'downlink', label: '4. Laser Downlink' },
          { id: 'command', label: '5. Mission Flight' },
          { id: 'cislunar', label: '6. Cislunar Relay' },
          { id: 'algorithms', label: '7. Edge Space AI' },
          { id: 'ground', label: '8. Ground Stations' },
          { id: 'simulation', label: '9. Orbit Simulator' },
          { id: 'launch', label: '10. Launch Mandate' }
        ];
      case 20:
        return [
          { id: 'canvas', label: '1. Spatial Canvas' },
          { id: 'environments', label: '2. Volumetric Twins' },
          { id: 'haptics', label: '3. Haptic Feedback' },
          { id: 'acoustics', label: '4. Ray-Traced Audio' },
          { id: 'gestures', label: '5. Biometric Gestures' },
          { id: 'industrial', label: '6. Industrial Twins' },
          { id: 'cases', label: '7. Enterprise HQs' },
          { id: 'hardware', label: '8. 6DoF Hardware' },
          { id: 'ergonomics', label: '9. Ergonomics' },
          { id: 'consultation', label: '10. Consultation Desk' }
        ];
      default:
        return [
          { id: 'home', label: 'Home' },
          { id: 'services', label: 'Services' },
          { id: 'about', label: 'About' },
          { id: 'pricing', label: 'Pricing' },
          { id: 'contact', label: 'Contact' }
        ];
    }
  }, [previewTemplate]);

  // Extract all unique industry tags across the 20 templates
  const allIndustryTags = useMemo(() => {
    const tags = new Set<string>();
    tags.add('all');
    BUSINESS_TEMPLATES.forEach((t) => {
      if (t.industryTag) tags.add(t.industryTag);
    });
    return Array.from(tags);
  }, []);

  // Filter and sort the 20 templates
  const filteredTemplates = useMemo(() => {
    return BUSINESS_TEMPLATES.filter((tmpl) => {
      // Tier filter
      const matchesTier = selectedTier === 'all' || tmpl.tier === selectedTier;

      // Tag filter
      const matchesTag = selectedTag === 'all' || tmpl.industryTag === selectedTag;

      // Nav style filter
      const matchesNav =
        selectedNavStyle === 'all' ||
        selectedNavStyle === 'All Navigation Styles' ||
        tmpl.navigationStyle === selectedNavStyle;

      // Search query
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        tmpl.name.toLowerCase().includes(q) ||
        tmpl.templateCode.toLowerCase().includes(q) ||
        tmpl.sampleBusinessName.toLowerCase().includes(q) ||
        tmpl.tagline.toLowerCase().includes(q) ||
        tmpl.description.toLowerCase().includes(q) ||
        tmpl.features.some((f) => f.toLowerCase().includes(q)) ||
        tmpl.tags.some((tag) => tag.toLowerCase().includes(q));

      return matchesTier && matchesTag && matchesNav && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') {
        const pA = parseInt(a.estimatedPrice.replace(/\D/g, '').slice(0, 4) || '0', 10);
        const pB = parseInt(b.estimatedPrice.replace(/\D/g, '').slice(0, 4) || '0', 10);
        return pA - pB;
      }
      if (sortBy === 'price-desc') {
        const pA = parseInt(a.estimatedPrice.replace(/\D/g, '').slice(0, 4) || '0', 10);
        const pB = parseInt(b.estimatedPrice.replace(/\D/g, '').slice(0, 4) || '0', 10);
        return pB - pA;
      }
      if (sortBy === 'speed') {
        const dA = parseInt(a.deliveryDays.replace(/\D/g, '').slice(0, 2) || '0', 10);
        const dB = parseInt(b.deliveryDays.replace(/\D/g, '').slice(0, 2) || '0', 10);
        return dA - dB;
      }
      return parseInt(a.templateNumber, 10) - parseInt(b.templateNumber, 10);
    });
  }, [selectedTier, selectedTag, selectedNavStyle, searchQuery, sortBy]);

  const activeTierMeta = useMemo(() => {
    return TIER_DEFINITIONS.find((t) => t.id === selectedTier) || TIER_DEFINITIONS[0];
  }, [selectedTier]);

  const getTierColorClass = (tier: string) => {
    switch (tier) {
      case 'ultra-premium':
        return 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white';
      case 'premium':
        return 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white';
      case 'mid-range':
        return 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white';
      case 'basic':
      default:
        return 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white';
    }
  };

  // If a template is being previewed in immersive mode
  if (previewTemplate) {
    const activePageId = currentPage || (templatePages[0]?.id ?? '');

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <PreviewToolbar
          template={previewTemplate}
          viewport={viewport}
          onViewportChange={(vp) => setViewport(vp)}
          onBackToGallery={() => {
            setPreviewTemplate(null);
            setCurrentPage('');
          }}
          onUseDesign={(tmpl) => {
            setPreviewTemplate(null);
            setCurrentPage('');
            onUseDesign(tmpl);
          }}
        />

        {/* Interactive Multi-Page Navigation Bar */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs overflow-x-auto gap-4 shrink-0 shadow-lg">
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200 uppercase tracking-wider">LIVE PAGES:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {templatePages.map((page) => (
              <button
                key={page.id}
                onClick={() => setCurrentPage(page.id)}
                className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap text-xs flex items-center gap-1.5 ${
                  activePageId === page.id
                    ? 'bg-orange-600 text-white shadow-md ring-2 ring-orange-500/40'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span>{page.label}</span>
                {activePageId === page.id && <span className="text-[10px] text-orange-200">●</span>}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono shrink-0">
            <span>Click any tab to test multi-page routing</span>
          </div>
        </div>

        {/* Viewport Render Area */}
        <div className="flex-1 overflow-auto flex justify-center items-start p-0 sm:p-4 bg-slate-950">
          <div
            className={`w-full transition-all duration-300 shadow-2xl ${
              viewport === 'desktop'
                ? 'max-w-full'
                : viewport === 'tablet'
                ? 'max-w-[768px] my-6 rounded-2xl overflow-hidden border-8 border-slate-800'
                : 'max-w-[390px] my-6 rounded-[36px] overflow-hidden border-[10px] border-slate-800'
            }`}
          >
            <BusinessTemplateRenderer
              template={previewTemplate}
              activePage={activePageId}
              onPageChange={(page) => setCurrentPage(page)}
              onUseDesign={(tmpl) => {
                setPreviewTemplate(null);
                setCurrentPage('');
                onUseDesign(tmpl);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 text-slate-800 font-sans selection:bg-orange-500 selection:text-white">
      {/* Breadcrumbs Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: onBack },
          { label: 'Website Development', onClick: onBack },
          { label: 'Business Websites (20 Unique Demos)', active: true }
        ]}
      />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#FFFDF9] via-[#FAF6F0] to-[#FAF8F5] pt-4 pb-14 border-b border-orange-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-orange-300 bg-orange-50/80 text-orange-600 text-xs font-bold tracking-wider uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CATEGORY 01: BUSINESS WEBSITES &bull; 20 UNIQUE PRODUCTION DEMOS</span>
            </div>

            <button
              onClick={() => onStartProject('Custom Business Website Architecture')}
              className="px-5 py-2 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold tracking-wide shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Custom Build Inquiry</span>
              <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
            </button>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              20 Unique Business Websites{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#F59E0B]">
                Crafted for High Conversion.
              </span>
            </h1>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              Every single template features a distinct color topography, background treatment, typography system, layout composition, and interactive modules. Explore all 4 tiers from lightweight starters to immersive signature web experiences.
            </p>
          </div>

          {/* 4 Tier Overview Pills */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {TIER_DEFINITIONS.filter((t) => t.id !== 'all').map((tier) => (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedTier === tier.id
                    ? 'border-orange-500 bg-orange-50/30 shadow-md ring-2 ring-orange-500/20'
                    : 'border-slate-200/80 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-500">{tier.tag}</span>
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-100/70 px-2 py-0.5 rounded-md">{tier.badge}</span>
                </div>
                <div className="font-extrabold text-slate-900 text-sm mt-1">{tier.label.split(':')[1] || tier.label}</div>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">{tier.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Filter and Gallery Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Tier Tabs Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
          {TIER_DEFINITIONS.map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                selectedTier === tier.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <span>{tier.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  selectedTier === tier.id ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tier.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search, Tag & Navigation Filters */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates, industries, features, or colors..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-orange-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Industry Tag Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-orange-500 capitalize"
              >
                <option value="all">All Industries</option>
                {allIndustryTags.filter((t) => t !== 'all').map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            {/* Navigation Style Dropdown */}
            <div className="md:col-span-2">
              <select
                value={selectedNavStyle}
                onChange={(e) => setSelectedNavStyle(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-orange-500"
              >
                {NAVIGATION_STYLES.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-orange-500"
              >
                <option value="number">Sort: Template #</option>
                <option value="speed">Delivery: Fastest</option>
              </select>
            </div>
          </div>

          {/* Active Filter summary & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div>
              Showing <strong className="text-slate-900">{filteredTemplates.length}</strong> of{' '}
              <strong className="text-slate-900">20</strong> unique business website templates
            </div>

            {(selectedTier !== 'all' || selectedTag !== 'all' || selectedNavStyle !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedTier('all');
                  setSelectedTag('all');
                  setSelectedNavStyle('all');
                  setSearchQuery('');
                }}
                className="flex items-center gap-1 text-orange-600 hover:text-orange-700 font-bold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* 20 Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-2xl border-2 border-slate-200/80 hover:border-orange-500 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden group transform hover:-translate-y-1"
            >
              {/* Card Header & Thumbnail */}
              <div className="relative aspect-16/10 overflow-hidden bg-slate-900">
                <img
                  src={template.thumbnail}
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Overlaid Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                  <span className="font-mono text-xs font-black bg-slate-950/85 text-white px-2.5 py-1 rounded-md shadow-md border border-white/10">
                    {template.templateCode}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md ${getTierColorClass(
                      template.tier
                    )}`}
                  >
                    {template.tierLabel}
                  </span>
                </div>

                {/* Dominant Palette Chip Swatch */}
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/85 backdrop-blur-xs border border-white/10 text-[11px] text-white font-mono">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs"
                    style={{ backgroundColor: template.dominantBackground }}
                  />
                  <span className="truncate max-w-[160px]">{template.dominantBackgroundName}</span>
                </div>

                {/* Quick Live Preview Overlay Trigger */}
                <button
                  onClick={() => setPreviewTemplate(template)}
                  className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs backdrop-blur-[2px] z-20"
                >
                  <Eye className="w-4 h-4 text-orange-400" />
                  <span>Launch Live Interactive Demo</span>
                </button>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-600">
                        {template.industryTag}
                      </span>
                      <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-orange-600 transition-colors leading-snug">
                        {template.name}
                      </h3>
                      <div className="text-xs font-bold text-slate-700">{template.sampleBusinessName}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {template.tagline}
                  </p>

                  {/* Typography & Nav Style Tags */}
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {template.typographySystem.split('(')[0]}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {template.navigationStyle.split(' ')[0]} Nav
                    </span>
                  </div>

                  {/* 3 Core Feature Bullets */}
                  <div className="pt-2 space-y-1.5">
                    {template.features.slice(0, 3).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Architecture & Timeline Footer */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">PAGE ARCHITECTURE</div>
                      <div className="font-extrabold text-slate-900 text-xs mt-0.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                        <span>{template.estimatedPrice}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">DELIVERY TIMELINE</div>
                      <div className="font-bold text-orange-600 text-xs mt-0.5">{template.deliveryDays}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => setPreviewTemplate(template)}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-orange-500" />
                      <span>Live Demo</span>
                    </button>

                    <button
                      onClick={() => onUseDesign(template)}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#F95700] hover:bg-[#EA4D00] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all transform hover:-translate-y-0.5"
                    >
                      <span>Use Design</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty Search Fallback */}
        {filteredTemplates.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <Search className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No matching business website templates found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your search query, clearing filters, or switching to "All Tiers" to explore the full library.
            </p>
            <button
              onClick={() => {
                setSelectedTier('all');
                setSelectedTag('all');
                setSelectedNavStyle('all');
                setSearchQuery('');
              }}
              className="mt-2 px-5 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

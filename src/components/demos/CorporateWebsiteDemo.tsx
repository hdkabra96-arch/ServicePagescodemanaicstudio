import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  CheckCircle2,
  Calculator,
  Sliders,
  Globe,
  Building2,
  FileText,
  Users,
  Award,
  Phone,
  Mail,
  MapPin,
  Send,
  Check,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { TemplateItem } from '../../types';
import {
  useThemeCustomizer,
  DemoControlBar,
  DemoCustomizerDrawer,
  FloatingCustomizeButton,
  ThemeCustomizerState
} from './DemoThemeCustomizer';

interface CorporateWebsiteDemoProps {
  template: TemplateItem;
  onBack: () => void;
  onUseDesign: (template: TemplateItem, customData?: ThemeCustomizerState) => void;
}

type CorporatePage = 'home' | 'about' | 'services' | 'portfolio' | 'governance' | 'contact';

export const CorporateWebsiteDemo: React.FC<CorporateWebsiteDemoProps> = ({
  template,
  onBack,
  onUseDesign
}) => {
  const [activePage, setActivePage] = useState<CorporatePage>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [estimatedPages, setEstimatedPages] = useState(6);
  const [needsEcommerce, setNeedsEcommerce] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    interest: 'Enterprise Digital Transformation',
    message: ''
  });

  const {
    customization,
    drawerOpen,
    setDrawerOpen,
    applyPalette,
    randomizeTopography,
    updateField,
    resetToDefault,
    getRadiusClass,
    getFontFamilyClass,
    getFontSizeScaleClass,
    getCardClasses,
    getCardStyle,
    getPrimaryButtonStyle,
    getBadgeStyle,
    calculateEstimate
  } = useThemeCustomizer(template, {
    brandName: template.name.includes('Corporate') || template.name.includes('Enterprise') ? template.name : 'Nexora Enterprise Capital'
  });

  const calculatedQuote = (estimatedPages * 3500) + (needsEcommerce ? 15000 : 0);

  const navigateToPage = (p: CorporatePage) => {
    setActivePage(p);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const corporateNav = [
    { id: 'home' as CorporatePage, label: 'Home' },
    { id: 'about' as CorporatePage, label: 'About Us' },
    { id: 'services' as CorporatePage, label: 'Services & Advisory' },
    { id: 'portfolio' as CorporatePage, label: 'Case Studies' },
    { id: 'governance' as CorporatePage, label: 'Governance & ESG' },
    { id: 'contact' as CorporatePage, label: 'Contact Us' }
  ];

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 flex flex-col ${getFontFamilyClass()}`}>
      
      {/* Top Banner */}
      {customization.showPromoBanner && (
        <div
          className="text-white text-xs font-semibold py-2 px-4 text-center transition-colors flex items-center justify-center gap-2 sticky top-0 z-40"
          style={{ backgroundColor: customization.primaryColor }}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>
            Live Corporate Architecture: <strong>{customization.brandName}</strong> • Full multi-page navigation active with dynamic color topography.
          </span>
        </div>
      )}

      {/* Control Bar */}
      <DemoControlBar
        template={template}
        customization={customization}
        onBack={onBack}
        onOpenCustomizer={() => setDrawerOpen(true)}
        onApplyPalette={applyPalette}
        onUpdateField={updateField}
        onUseDesign={onUseDesign}
      />

      {/* Slide-over Theme Customizer Drawer */}
      <DemoCustomizerDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        template={template}
        customization={customization}
        onApplyPalette={applyPalette}
        onRandomize={randomizeTopography}
        onUpdateField={updateField}
        onReset={resetToDefault}
        onUseDesign={onUseDesign}
      />

      {/* Floating Customize Button */}
      <FloatingCustomizeButton
        onOpen={() => setDrawerOpen(true)}
        primaryColor={customization.primaryColor}
      />

      {/* Interior */}
      <div
        className={`flex-1 transition-colors flex flex-col ${
          customization.themeMode === 'dark'
            ? 'bg-slate-950 text-slate-100'
            : customization.themeMode === 'dim'
            ? 'bg-slate-900 text-slate-100'
            : 'bg-white text-slate-800'
        }`}
      >
        
        {/* Navigation */}
        <header
          className={`border-b px-6 py-4 flex items-center justify-between sticky top-12 z-30 backdrop-blur-md transition-colors ${
            customization.themeMode === 'light'
              ? 'bg-white/95 border-slate-100'
              : 'bg-slate-950/95 border-slate-800'
          }`}
        >
          <button
            onClick={() => navigateToPage('home')}
            className="text-xl font-black tracking-tight flex items-center gap-1 focus:outline-hidden"
          >
            <span>{customization.brandName}</span>
            <span style={{ color: customization.primaryColor }}>.</span>
          </button>

          {/* Desktop Nav */}
          <nav
            className={`hidden md:flex items-center space-x-2 text-xs font-semibold`}
          >
            {corporateNav.map((item) => (
              <button
                key={item.id}
                onClick={() => navigateToPage(item.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activePage === item.id
                    ? 'text-white shadow-xs font-bold'
                    : customization.themeMode === 'light'
                    ? 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                style={{
                  backgroundColor: activePage === item.id ? customization.primaryColor : undefined
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onUseDesign(template, customization)}
              className={`font-bold transition-all hover:opacity-90 px-4 py-2 ${getRadiusClass('btn')} ${getFontSizeScaleClass('btn')}`}
              style={getPrimaryButtonStyle()}
            >
              {customization.ctaText || 'Partner With Us'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden border-b p-4 space-y-1 ${
              customization.themeMode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            {corporateNav.map((item) => (
              <button
                key={item.id}
                onClick={() => navigateToPage(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold ${
                  activePage === item.id
                    ? 'text-white'
                    : customization.themeMode === 'light'
                    ? 'text-slate-700 hover:bg-slate-200'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
                style={{
                  backgroundColor: activePage === item.id ? customization.primaryColor : undefined
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Prominent Page Switcher Header Strip */}
        <div
          className={`border-b px-6 py-2 flex items-center justify-between text-xs overflow-x-auto ${
            customization.themeMode === 'light'
              ? 'bg-slate-50 border-slate-200 text-slate-600'
              : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
              Corporate Pages:
            </span>
            <div className="flex items-center gap-1">
              {corporateNav.map((n) => (
                <button
                  key={n.id}
                  onClick={() => navigateToPage(n.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    activePage === n.id ? 'text-white shadow-xs' : 'hover:text-slate-200'
                  }`}
                  style={{
                    backgroundColor: activePage === n.id ? customization.primaryColor : undefined
                  }}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="hidden sm:flex items-center gap-1 font-bold text-[11px] hover:underline shrink-0"
            style={{ color: customization.primaryColor }}
          >
            <Sliders className="w-3 h-3" />
            <span>Customize Palette & Typography</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: HOME */}
        {/* ============================================================== */}
        {activePage === 'home' && (
          <div className="animate-in fade-in duration-200">
            {/* Hero Section */}
            <section className="py-16 px-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-4">
                {customization.showBadges && (
                  <span
                    className={`uppercase tracking-wider border inline-block ${getRadiusClass('badge')} ${getFontSizeScaleClass('badge')}`}
                    style={getBadgeStyle()}
                  >
                    ★ Enterprise Excellence & Scale
                  </span>
                )}

                <h1 className={`${getFontSizeScaleClass('hero-title')} leading-tight font-extrabold`}>
                  Strategic Digital Infrastructure
                </h1>
                <p className={`text-slate-400 max-w-xl ${getFontSizeScaleClass('body')}`}>
                  {customization.tagline ||
                    'Empowering global enterprise organizations with resilient software architectures, institutional security, and continuous innovation.'}
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => onUseDesign(template, customization)}
                    className={`font-bold transition-all hover:opacity-90 px-6 py-3.5 ${getRadiusClass('btn')} ${getFontSizeScaleClass('btn')}`}
                    style={getPrimaryButtonStyle()}
                  >
                    {customization.ctaText || 'Explore Solutions'} &rarr;
                  </button>
                  <button
                    onClick={() => navigateToPage('about')}
                    className={`px-5 py-3.5 border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors`}
                  >
                    Our Governance & History
                  </button>
                </div>
              </div>

              {/* Enterprise Interactive Estimator */}
              <div
                className={getCardClasses('p-8 space-y-6 shadow-xl')}
                style={getCardStyle()}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                  <h3 className="font-extrabold text-base text-white">Enterprise Scope Simulator</h3>
                  <Calculator className="w-5 h-5" style={{ color: customization.primaryColor }} />
                </div>
                
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold mb-1 text-slate-300">
                      <span>Core Functional Modules</span>
                      <span className="font-bold text-white">{estimatedPages} Modules</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="15"
                      value={estimatedPages}
                      onChange={(e) => setEstimatedPages(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      style={{ accentColor: customization.primaryColor }}
                    />
                  </div>

                  <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 cursor-pointer">
                    <span className="text-slate-300 font-medium">B2B Transactional Portal & Invoicing</span>
                    <input
                      type="checkbox"
                      checked={needsEcommerce}
                      onChange={(e) => setNeedsEcommerce(e.target.checked)}
                      className="rounded-sm w-4 h-4"
                      style={{ accentColor: customization.primaryColor }}
                    />
                  </label>
                </div>

                <div
                  className="p-4 rounded-xl border flex items-center justify-between"
                  style={{
                    backgroundColor: `${customization.primaryColor}12`,
                    borderColor: `${customization.primaryColor}35`
                  }}
                >
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Budget Baseline
                    </div>
                    <div className="text-2xl font-black text-white">
                      ${calculatedQuote.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Target Delivery
                    </div>
                    <div className="text-sm font-bold text-slate-200">
                      Enterprise Sprint (3-4 wks)
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onUseDesign(template, customization)}
                  className={`w-full py-3 text-xs font-bold text-white shadow-md hover:opacity-95 transition-opacity ${getRadiusClass('btn')}`}
                  style={{ backgroundColor: customization.primaryColor }}
                >
                  Adopt This Corporate Blueprint &rarr;
                </button>
              </div>
            </section>

            {/* Global Pillars */}
            <section
              className={`py-16 px-8 ${
                customization.themeMode === 'light' ? 'bg-slate-50' : 'bg-slate-900/50'
              }`}
            >
              <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center max-w-xl mx-auto">
                  <h2 className="text-2xl font-black">Enterprise Pillars</h2>
                  <p className="text-xs text-slate-400 mt-1">Foundational tenets driving institutional resilience.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { title: 'Global Compliance & Audit', desc: 'Compliant with SOC-2 Type II, GDPR, HIPAA, and ISO-27001 data standards.' },
                    { title: 'Deterministic Microservices', desc: 'Containerized architectures engineered for 99.999% high-availability uptime.' },
                    { title: 'Executive ESG Reporting', desc: 'Transparent sustainability telemetry and climate impact audits built into workflows.' }
                  ].map((p, idx) => (
                    <div
                      key={idx}
                      className={getCardClasses('p-6 space-y-3')}
                      style={getCardStyle()}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                        style={{ backgroundColor: `${customization.primaryColor}20`, color: customization.primaryColor }}
                      >
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-sm text-white">{p.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: ABOUT US */}
        {/* ============================================================== */}
        {activePage === 'about' && (
          <div className="animate-in fade-in duration-200 max-w-6xl mx-auto w-full px-8 py-12 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span
                className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border inline-block"
                style={{
                  color: customization.primaryColor,
                  borderColor: `${customization.primaryColor}30`,
                  backgroundColor: `${customization.primaryColor}10`
                }}
              >
                About {customization.brandName}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Decades of Leadership in Enterprise Technology
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Operating across 14 global jurisdictions, delivering mission-critical web applications for Fortune 500 corporations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  <strong>{customization.brandName}</strong> was established to provide institutional entities with dependable, audited software architecture.
                </p>
                <p>
                  We oversee digital transformation mandates exceeding $500M in combined transaction volume, ensuring data sovereignty, sub-second latency, and uncompromising fault tolerance.
                </p>
                <div className="pt-2 flex items-center gap-4 text-xs font-bold text-white">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" style={{ color: customization.primaryColor }} />
                    <span>Global Tier-1 Infrastructure</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" style={{ color: customization.primaryColor }} />
                    <span>SEC & GDPR Compliance</span>
                  </div>
                </div>
              </div>

              <div
                className={getCardClasses('p-6 space-y-4')}
                style={getCardStyle()}
              >
                <h4 className="font-bold text-sm text-white">Corporate Governance Board</h4>
                <div className="space-y-3 text-xs">
                  {[
                    { name: 'Sir Arthur Wellesley', title: 'Chairman of the Supervisory Board' },
                    { name: 'Dr. Evelyn Zhang', title: 'Chief Risk & Cybersecurity Officer' },
                    { name: 'Marcus Sterling', title: 'Global Managing Partner' }
                  ].map((lead, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40">
                      <span className="font-bold text-white">{lead.name}</span>
                      <span className="text-slate-400 text-[11px]">{lead.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: SERVICES */}
        {/* ============================================================== */}
        {activePage === 'services' && (
          <div className="animate-in fade-in duration-200 max-w-6xl mx-auto w-full px-8 py-12 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span
                className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border inline-block"
                style={{
                  color: customization.primaryColor,
                  borderColor: `${customization.primaryColor}30`,
                  backgroundColor: `${customization.primaryColor}10`
                }}
              >
                Advisory & Systems
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Enterprise Solutions Portfolio
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Tailored engineering frameworks for large-scale institutional deployments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Institutional Cloud Migrations', desc: 'Secure transitions from legacy mainframe servers to resilient Kubernetes clusters with zero business downtime.' },
                { title: 'Enterprise Data Governance', desc: 'Automated data classification, audit logs, GDPR erasure pipelines, and cryptographic key management.' },
                { title: 'Transactional Portals', desc: 'Multi-million transaction handling systems with integrated wire clearing, automated reconciliation, and ERP bridges.' }
              ].map((s, idx) => (
                <div
                  key={idx}
                  className={getCardClasses('p-6 space-y-4 flex flex-col justify-between')}
                  style={getCardStyle()}
                >
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-base text-white">{s.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                  </div>
                  <button
                    onClick={() => navigateToPage('contact')}
                    className="text-xs font-bold flex items-center gap-1 hover:underline"
                    style={{ color: customization.primaryColor }}
                  >
                    <span>Request Briefing</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: PORTFOLIO */}
        {/* ============================================================== */}
        {activePage === 'portfolio' && (
          <div className="animate-in fade-in duration-200 max-w-6xl mx-auto w-full px-8 py-12 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span
                className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border inline-block"
                style={{
                  color: customization.primaryColor,
                  borderColor: `${customization.primaryColor}30`,
                  backgroundColor: `${customization.primaryColor}10`
                }}
              >
                Proven Impact
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Institutional Case Studies
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Verifiable metrics achieved for sovereign wealth funds, banking conglomerates, and healthcare consortiums.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: 'Nordic Sovereign Asset Gateway', client: 'Scandinavian Pension Fund', metric: '$24B Monitored Assets', desc: 'Secure reporting terminal providing real-time multi-currency valuation and ESG compliance scoring.' },
                { title: 'Global Cold-Chain Logistics Cloud', client: 'Apex BioLogistics Inc.', metric: '100% Traceability SLA', desc: 'IoT sensor telemetry platform managing temperature-controlled pharmaceuticals across 80 international ports.' }
              ].map((cs, i) => (
                <div
                  key={i}
                  className={getCardClasses('p-6 space-y-4')}
                  style={getCardStyle()}
                >
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{cs.client}</div>
                  <h3 className="font-extrabold text-lg text-white">{cs.title}</h3>
                  <div
                    className="text-xs font-bold inline-block px-2.5 py-1 rounded-md"
                    style={{ backgroundColor: `${customization.primaryColor}20`, color: customization.primaryColor }}
                  >
                    Impact: {cs.metric}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{cs.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: GOVERNANCE & ESG */}
        {/* ============================================================== */}
        {activePage === 'governance' && (
          <div className="animate-in fade-in duration-200 max-w-6xl mx-auto w-full px-8 py-12 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span
                className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border inline-block"
                style={{
                  color: customization.primaryColor,
                  borderColor: `${customization.primaryColor}30`,
                  backgroundColor: `${customization.primaryColor}10`
                }}
              >
                Sustainability & Integrity
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Governance, Risk & ESG Oversight
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Pioneering carbon-neutral cloud infrastructure and ethical data governance standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Carbon Neutral Cloud', stat: 'Net Zero by 2028', desc: '100% of our production cloud clusters operate on renewable green data centers.' },
                { title: 'Zero Trust Architecture', stat: 'Zero Breaches', desc: 'Continuous identity authentication and encrypted memory enclaves for sensitive financial data.' },
                { title: 'Ethical Supply Chains', stat: '100% Audited', desc: 'All software dependencies and hardware partners undergo rigorous modern slavery audits.' }
              ].map((g, idx) => (
                <div
                  key={idx}
                  className={getCardClasses('p-6 space-y-3')}
                  style={getCardStyle()}
                >
                  <h3 className="font-bold text-sm text-white">{g.title}</h3>
                  <div className="text-xl font-black" style={{ color: customization.primaryColor }}>{g.stat}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{g.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: CONTACT */}
        {/* ============================================================== */}
        {activePage === 'contact' && (
          <div className="animate-in fade-in duration-200 max-w-6xl mx-auto w-full px-8 py-12 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span
                className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border inline-block"
                style={{
                  color: customization.primaryColor,
                  borderColor: `${customization.primaryColor}30`,
                  backgroundColor: `${customization.primaryColor}10`
                }}
              >
                Executive Contact
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Institutional Inquiries & Advisory
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Direct channel to the executive partners of {customization.brandName}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h3 className="font-extrabold text-base text-white">Global Headquarters</h3>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                    <strong className="text-white block font-bold mb-1">New York Corporate Office</strong>
                    <span>One World Trade Center, Floor 72, New York, NY 10007</span>
                    <span className="block mt-1 text-slate-400">ir-us@{customization.brandName.toLowerCase().replace(/[^a-z]/g, '')}.com</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                    <strong className="text-white block font-bold mb-1">London EMEA Hub</strong>
                    <span>30 St Mary Axe (The Gherkin), London EC3A 8EP, United Kingdom</span>
                    <span className="block mt-1 text-slate-400">ir-uk@{customization.brandName.toLowerCase().replace(/[^a-z]/g, '')}.com</span>
                  </div>
                </div>
              </div>

              <div
                className={getCardClasses('p-6 space-y-4')}
                style={getCardStyle()}
              >
                <h3 className="font-extrabold text-base text-white">Submit Confidential RFP / Inquiry</h3>
                {contactSubmitted ? (
                  <div
                    className="p-6 rounded-xl border text-center space-y-2"
                    style={{ backgroundColor: `${customization.primaryColor}15`, borderColor: `${customization.primaryColor}40` }}
                  >
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                    <h4 className="font-bold text-white text-sm">Inquiry Logged</h4>
                    <p className="text-xs text-slate-300">Thank you. An institutional advisor will contact {contactForm.name} shortly.</p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setContactSubmitted(true);
                    }}
                    className="space-y-3 text-xs"
                  >
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Full Name & Corporate Title</label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className={`w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg`}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Corporate Email</label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className={`w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg`}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Organization / Entity Name</label>
                      <input
                        type="text"
                        required
                        value={contactForm.company}
                        onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                        className={`w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg`}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Scope of Inquiry</label>
                      <textarea
                        rows={3}
                        required
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder="Brief summary of institutional objectives..."
                        className={`w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg`}
                      />
                    </div>
                    <button
                      type="submit"
                      className={`w-full py-2.5 font-bold text-xs text-white shadow-md rounded-lg`}
                      style={{ backgroundColor: customization.primaryColor }}
                    >
                      Transmit Executive Brief &rarr;
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

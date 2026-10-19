import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Play,
  CheckCircle,
  Smartphone,
  Sparkles,
  Sliders,
  Shield,
  Phone,
  Mail,
  X,
  Building2,
  CheckCircle2,
  Globe,
  Users,
  Award,
  TrendingUp,
  Star,
  MessageSquare,
  Calendar,
  ChevronRight,
  MapPin,
  Clock,
  Send,
  Check,
  ExternalLink,
  FileText,
  Layers,
  Search,
  Menu,
  HelpCircle,
  DollarSign
} from 'lucide-react';
import { TemplateItem } from '../../types';
import {
  useThemeCustomizer,
  DemoControlBar,
  DemoCustomizerDrawer,
  FloatingCustomizeButton,
  ThemeCustomizerState
} from './DemoThemeCustomizer';

interface BusinessProDemoProps {
  template: TemplateItem;
  onBack: () => void;
  onUseDesign: (template: TemplateItem, customData?: ThemeCustomizerState) => void;
}

type WebsiteDemoPage = 'home' | 'about' | 'services' | 'portfolio' | 'pricing' | 'contact';

export const BusinessProDemo: React.FC<BusinessProDemoProps> = ({
  template,
  onBack,
  onUseDesign
}) => {
  const [activePage, setActivePage] = useState<WebsiteDemoPage>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<any | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [portfolioFilter, setPortfolioFilter] = useState<'all' | 'web' | 'mobile' | 'saas' | 'ecommerce'>('all');
  
  // Interactive Contact form state
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Enterprise Web Application',
    budget: '$10k - $25k',
    message: ''
  });

  // Interactive Live Estimator on Home
  const [estPages, setEstPages] = useState(5);
  const [estHasCms, setEstHasCms] = useState(true);
  const [estHasAuth, setEstHasAuth] = useState(false);
  const [estHasPayments, setEstHasPayments] = useState(false);
  
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
    brandName: template.name.includes('Business') || template.name.includes('Pro') ? template.name : 'Apex Dynamic Growth Pro'
  });

  const estimate = calculateEstimate();

  const brandInitials = customization.brandName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'BP';

  // Dynamic live price calculation for the embedded estimator
  const liveEstimatedCost = 
    1499 + 
    (estPages * 250) + 
    (estHasCms ? 450 : 0) + 
    (estHasAuth ? 800 : 0) + 
    (estHasPayments ? 950 : 0);

  const liveDeliveryDays = 7 + Math.ceil(estPages * 1.5) + (estHasPayments ? 4 : 0);

  const navigateToPage = (page: WebsiteDemoPage) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email) return;
    setContactSubmitted(true);
    setTimeout(() => {
      // Keep it in submitted state with feedback
    }, 500);
  };

  const navLinks: { id: WebsiteDemoPage; label: string; badge?: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'services', label: 'Services' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'pricing', label: 'Pricing', badge: 'Popular' },
    { id: 'contact', label: 'Contact Us' }
  ];

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 flex flex-col ${getFontFamilyClass()}`}>
      
      {/* Top Demo Notification Banner */}
      {customization.showPromoBanner && (
        <div
          className="text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 transition-colors sticky top-0 z-40"
          style={{ backgroundColor: customization.primaryColor }}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>
            Live Interactive Preview: <strong>{customization.brandName}</strong> • Full multi-page website navigation & dynamic color topography active.
          </span>
        </div>
      )}

      {/* Unified Top Control Bar */}
      <DemoControlBar
        template={template}
        customization={customization}
        onBack={onBack}
        onOpenCustomizer={() => setDrawerOpen(true)}
        onApplyPalette={applyPalette}
        onUpdateField={updateField}
        onUseDesign={onUseDesign}
      />

      {/* Demo Customizer Slide-over Drawer */}
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

      {/* Floating Customize Theme Button */}
      <FloatingCustomizeButton
        onOpen={() => setDrawerOpen(true)}
        primaryColor={customization.primaryColor}
      />

      {/* Website Live Preview Canvas */}
      <div
        className={`flex-1 transition-colors flex flex-col ${
          customization.themeMode === 'dark'
            ? 'bg-slate-950 text-slate-100'
            : customization.themeMode === 'dim'
            ? 'bg-slate-900 text-slate-100'
            : 'bg-white text-slate-800'
        }`}
      >
        
        {/* Demo Navbar */}
        <header
          className={`border-b px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-12 z-30 transition-colors backdrop-blur-md ${
            customization.themeMode === 'light'
              ? 'bg-white/95 border-slate-200 text-slate-900'
              : 'bg-slate-950/95 border-slate-800 text-white'
          }`}
        >
          {/* Brand Logo & Name */}
          <button
            onClick={() => navigateToPage('home')}
            className="flex items-center gap-3 text-left focus:outline-hidden group"
          >
            <div
              className={`w-9 h-9 flex items-center justify-center font-black text-white text-sm shadow-md transition-transform group-hover:scale-105 ${getRadiusClass('input')}`}
              style={{ backgroundColor: customization.primaryColor }}
            >
              {brandInitials}
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight leading-tight">
                {customization.brandName}
              </span>
              <span
                className="text-[10px] font-bold tracking-widest uppercase"
                style={{ color: customization.primaryColor }}
              >
                {template.industryTag || 'Digital Solutions'}
              </span>
            </div>
          </button>

          {/* Desktop Multi-Page Navigation Bar */}
          <nav className="hidden lg:flex items-center space-x-1 sm:space-x-2">
            {navLinks.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateToPage(item.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all relative flex items-center gap-1.5 ${
                    isActive
                      ? 'text-white shadow-xs'
                      : customization.themeMode === 'light'
                      ? 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                  style={{
                    backgroundColor: isActive ? customization.primaryColor : undefined
                  }}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className="text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase tracking-wider"
                      style={{
                        backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : `${customization.primaryColor}20`,
                        color: isActive ? '#FFFFFF' : customization.primaryColor
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigateToPage('contact')}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                customization.themeMode === 'light'
                  ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Phone className="w-3.5 h-3.5" style={{ color: customization.primaryColor }} />
              <span>Talk to Us</span>
            </button>

            <button
              onClick={() => onUseDesign(template, customization)}
              className={`text-white px-4 py-2 text-xs font-bold shadow-md transition-all hover:opacity-90 flex items-center gap-1.5 ${getRadiusClass('btn')}`}
              style={{ backgroundColor: customization.primaryColor }}
            >
              <span>{customization.ctaText || 'Get Started'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Nav Drawer dropdown */}
        {mobileMenuOpen && (
          <div
            className={`lg:hidden border-b px-4 py-3 space-y-1 transition-colors ${
              customization.themeMode === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              Website Pages
            </div>
            {navLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => navigateToPage(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between ${
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
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20 text-white font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Prominent Page Switcher Bar (Ensures User Clearly Sees Every Working Page) */}
        <div
          className={`border-b px-4 sm:px-8 py-2 flex items-center justify-between overflow-x-auto text-xs transition-colors ${
            customization.themeMode === 'light'
              ? 'bg-slate-50 border-slate-200 text-slate-600'
              : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" style={{ color: customization.primaryColor }} />
              <span>Live Website Pages:</span>
            </span>
            <div className="flex items-center gap-1">
              {navLinks.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => navigateToPage(tab.id)}
                  className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-all flex items-center gap-1 ${
                    activePage === tab.id
                      ? 'text-white shadow-xs'
                      : 'hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                  style={{
                    backgroundColor: activePage === tab.id ? customization.primaryColor : undefined
                  }}
                >
                  <span>{tab.label}</span>
                  {activePage === tab.id && <Check className="w-3 h-3 ml-0.5" />}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 shrink-0 text-[11px]">
            <span className="text-slate-400">
              Active Topography: <strong className="text-slate-200">{customization.paletteId.toUpperCase()}</strong> •{' '}
              <strong className="text-slate-200">{customization.fontStyleName}</strong>
            </span>
            <button
              onClick={() => setDrawerOpen(true)}
              className="font-bold flex items-center gap-1 hover:underline"
              style={{ color: customization.primaryColor }}
            >
              <Sliders className="w-3 h-3" />
              <span>Customize Colors</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* PAGE 1: HOME PAGE */}
        {/* ============================================================== */}
        {activePage === 'home' && (
          <div className="animate-in fade-in duration-200">
            
            {/* Hero Section */}
            <section
              className={`relative py-16 sm:py-24 px-6 overflow-hidden ${
                customization.themeMode === 'light' ? 'bg-slate-950 text-white' : 'bg-slate-900 text-white'
              }`}
            >
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                <div className="lg:col-span-7 space-y-6">
                  {customization.showBadges && (
                    <span
                      className={`font-bold uppercase tracking-widest px-3 py-1 border inline-block ${getRadiusClass('badge')} ${getFontSizeScaleClass('badge')}`}
                      style={getBadgeStyle()}
                    >
                      ★ Next-Gen Web & App Architecture
                    </span>
                  )}

                  <h1 className={`${getFontSizeScaleClass('hero-title')} leading-tight tracking-tight`}>
                    {customization.brandName}{' '}
                    <span
                      className="text-transparent bg-clip-text"
                      style={{
                        backgroundImage: `linear-gradient(to right, ${customization.primaryColor}, ${customization.accentColor})`
                      }}
                    >
                      Digital Excellence
                    </span>
                  </h1>

                  <p className={`text-slate-300 leading-relaxed max-w-xl ${getFontSizeScaleClass('body')}`}>
                    {customization.tagline ||
                      'We craft lightning-fast web applications, conversion-driven websites, and high-performance digital platforms tailored to fuel your growth.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      onClick={() => onUseDesign(template, customization)}
                      className={`text-white px-7 py-3.5 font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-2 ${getRadiusClass('btn')} ${getFontSizeScaleClass('btn')}`}
                      style={getPrimaryButtonStyle()}
                    >
                      <span>{customization.ctaText || 'Launch Project'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setVideoModalOpen(true)}
                      className={`px-5 py-3.5 border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-white font-bold transition-colors flex items-center gap-2 ${getRadiusClass('btn')} ${getFontSizeScaleClass('btn')}`}
                    >
                      <Play
                        className="w-4 h-4"
                        style={{ fill: customization.primaryColor, color: customization.primaryColor }}
                      />
                      <span>Watch Product Video</span>
                    </button>
                  </div>

                  {/* Trust metrics */}
                  <div className="pt-6 grid grid-cols-3 gap-6 border-t border-slate-800/80">
                    <div>
                      <div className="text-xl sm:text-2xl font-black text-white">99.98%</div>
                      <div className="text-[11px] text-slate-400">Guaranteed Uptime</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-black text-white">350+</div>
                      <div className="text-[11px] text-slate-400">Projects Shipped</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-black text-white">&lt;1.2s</div>
                      <div className="text-[11px] text-slate-400">LCP Core Web Vital</div>
                    </div>
                  </div>
                </div>

                {/* Right Interactive Card: Live Real-Time Cost Estimator */}
                <div className="lg:col-span-5">
                  <div
                    className={getCardClasses('p-6 sm:p-8 space-y-6 shadow-2xl relative backdrop-blur-md')}
                    style={getCardStyle()}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                      <div>
                        <span
                          className={`font-black uppercase tracking-wider px-2 py-0.5 rounded-sm text-[10px] inline-block mb-1`}
                          style={{
                            backgroundColor: `${customization.primaryColor}25`,
                            color: customization.primaryColor
                          }}
                        >
                          Real-time Cost Simulator
                        </span>
                        <h3 className="font-extrabold text-base text-white">Project Estimator</h3>
                      </div>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                        style={{ backgroundColor: `${customization.primaryColor}20`, color: customization.primaryColor }}
                      >
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Sliders and Toggles */}
                    <div className="space-y-4 text-xs">
                      <div>
                        <div className="flex justify-between font-semibold mb-1 text-slate-300">
                          <span>Estimated Pages / Screens</span>
                          <span className="font-bold text-white">{estPages} Pages</span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="20"
                          value={estPages}
                          onChange={(e) => setEstPages(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                          style={{ accentColor: customization.primaryColor }}
                        />
                      </div>

                      <div className="space-y-2 pt-1">
                        <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 cursor-pointer hover:bg-slate-800/70">
                          <span className="text-slate-300 font-medium">Headless CMS / Blog Publishing</span>
                          <input
                            type="checkbox"
                            checked={estHasCms}
                            onChange={(e) => setEstHasCms(e.target.checked)}
                            className="rounded-sm accent-orange-500 w-4 h-4"
                            style={{ accentColor: customization.primaryColor }}
                          />
                        </label>
                        <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 cursor-pointer hover:bg-slate-800/70">
                          <span className="text-slate-300 font-medium">User Authentication & Portal</span>
                          <input
                            type="checkbox"
                            checked={estHasAuth}
                            onChange={(e) => setEstHasAuth(e.target.checked)}
                            className="rounded-sm accent-orange-500 w-4 h-4"
                            style={{ accentColor: customization.primaryColor }}
                          />
                        </label>
                        <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 cursor-pointer hover:bg-slate-800/70">
                          <span className="text-slate-300 font-medium">Stripe / Razorpay Payment Gateway</span>
                          <input
                            type="checkbox"
                            checked={estHasPayments}
                            onChange={(e) => setEstHasPayments(e.target.checked)}
                            className="rounded-sm accent-orange-500 w-4 h-4"
                            style={{ accentColor: customization.primaryColor }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Calculated Outcome */}
                    <div
                      className={`p-4 rounded-xl border flex items-center justify-between`}
                      style={{
                        backgroundColor: `${customization.primaryColor}12`,
                        borderColor: `${customization.primaryColor}35`
                      }}
                    >
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Project Estimate
                        </div>
                        <div className="text-2xl font-black text-white">
                          ${liveEstimatedCost.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Delivery Time
                        </div>
                        <div className="text-sm font-bold text-slate-200">
                          ~{liveDeliveryDays} Business Days
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onUseDesign(template, customization)}
                      className={`w-full py-3 text-center text-xs font-bold text-white shadow-md transition-all hover:opacity-95 ${getRadiusClass('btn')}`}
                      style={{ backgroundColor: customization.primaryColor }}
                    >
                      Lock In This Quote &rarr;
                    </button>
                  </div>
                </div>

              </div>
            </section>

            {/* Core Solutions Grid */}
            <section
              className={`py-16 px-6 ${
                customization.themeMode === 'light' ? 'bg-white' : 'bg-slate-950'
              }`}
            >
              <div className="max-w-6xl mx-auto space-y-12">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <span
                    className={`font-black text-xs uppercase tracking-widest px-3 py-1 rounded-full border inline-block`}
                    style={{
                      color: customization.primaryColor,
                      borderColor: `${customization.primaryColor}30`,
                      backgroundColor: `${customization.primaryColor}10`
                    }}
                  >
                    What We Build
                  </span>
                  <h2 className={`${getFontSizeScaleClass('heading-xl')} font-extrabold tracking-tight`}>
                    Tailored Solutions by {customization.brandName}
                  </h2>
                  <p className={`text-slate-500 ${getFontSizeScaleClass('body')}`}>
                    High-impact architectures engineered to captivate audiences and maximize revenue.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      title: 'Corporate Branding & Web',
                      img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500&auto=format&fit=crop&q=80',
                      desc: 'Distinctive visual identities and high-converting marketing websites.'
                    },
                    {
                      title: 'Web Applications & SaaS',
                      img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=80',
                      desc: 'Full-stack portals, internal admin tools, and workflow automation.'
                    },
                    {
                      title: 'Mobile App Ecosystems',
                      img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&auto=format&fit=crop&q=80',
                      desc: 'iOS and Android native apps built with fluid animations and offline sync.'
                    },
                    {
                      title: 'Cloud & Infrastructure',
                      img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80',
                      desc: 'Serverless deployment, automated CI/CD, and global CDN edge routing.'
                    }
                  ].map((serv, i) => (
                    <div
                      key={i}
                      className={getCardClasses('overflow-hidden transition-all hover:scale-[1.02] flex flex-col justify-between')}
                      style={getCardStyle()}
                    >
                      <div className="aspect-16/10 bg-slate-100 overflow-hidden relative">
                        <img src={serv.img} alt={serv.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                      </div>
                      <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-sm tracking-tight">{serv.title}</h3>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{serv.desc}</p>
                        </div>
                        <button
                          onClick={() => navigateToPage('services')}
                          className="text-xs font-bold flex items-center gap-1 pt-3 hover:underline"
                          style={{ color: customization.primaryColor }}
                        >
                          <span>Explore Services</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Callout Strip to other pages */}
                <div
                  className={`p-6 sm:p-8 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-6`}
                  style={{
                    backgroundColor: `${customization.primaryColor}08`,
                    borderColor: `${customization.primaryColor}25`
                  }}
                >
                  <div className="space-y-1 text-center sm:text-left">
                    <h4 className="font-extrabold text-base text-white">
                      Want to see all pages and capabilities?
                    </h4>
                    <p className="text-xs text-slate-400">
                      Browse our About Us story, deep Portfolio case studies, transparent Pricing tiers, or direct Contact.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={() => navigateToPage('portfolio')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${
                        customization.themeMode === 'light'
                          ? 'border-slate-300 text-slate-700 hover:bg-slate-200'
                          : 'border-slate-700 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      View Portfolio &rarr;
                    </button>
                    <button
                      onClick={() => navigateToPage('pricing')}
                      className={`px-5 py-2 rounded-lg text-xs font-bold text-white shadow-md hover:opacity-90 transition-opacity`}
                      style={{ backgroundColor: customization.primaryColor }}
                    >
                      View Pricing & Plans
                    </button>
                  </div>
                </div>

              </div>
            </section>

          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 2: ABOUT US */}
        {/* ============================================================== */}
        {activePage === 'about' && (
          <div className="animate-in fade-in duration-200 max-w-6xl mx-auto w-full px-6 py-12 space-y-16">
            
            {/* Header intro */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span
                className={`font-black text-xs uppercase tracking-widest px-3 py-1 rounded-full border inline-block`}
                style={{
                  color: customization.primaryColor,
                  borderColor: `${customization.primaryColor}30`,
                  backgroundColor: `${customization.primaryColor}10`
                }}
              >
                About {customization.brandName}
              </span>
              <h1 className={`${getFontSizeScaleClass('hero-title')} font-extrabold tracking-tight`}>
                Engineering Digital Architecture with Passion
              </h1>
              <p className={`text-slate-400 ${getFontSizeScaleClass('body')}`}>
                Founded with a mission to bridge high-end design craftsmanship with enterprise engineering speed.
              </p>
            </div>

            {/* Story & Mission Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Our Origin Story</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Born to eliminate clunky digital experiences.
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  At <strong>{customization.brandName}</strong>, we believe every business deserves a digital identity that commands authority and inspires trust. Whether building an interactive software product, an omni-channel e-commerce storefront, or a high-converting corporate website, we treat your business as our own.
                </p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Our engineering team deploys clean TypeScript, reactive micro-interactions, responsive CSS frameworks, and resilient cloud architectures tested against global traffic surges.
                </p>
                
                <div className="pt-2 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" style={{ color: customization.primaryColor }} />
                    <span className="text-xs font-bold">100% Code Ownership</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" style={{ color: customization.primaryColor }} />
                    <span className="text-xs font-bold">ISO-27001 Security Standard</span>
                  </div>
                </div>
              </div>

              <div
                className={getCardClasses('p-8 space-y-6 relative overflow-hidden')}
                style={getCardStyle()}
              >
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Our Core Principles</div>
                <div className="space-y-4">
                  {[
                    { title: 'Zero AI Slop & Human Craft', desc: 'Every layout is designed for humans by world-class software engineers.' },
                    { title: 'Extreme Velocity', desc: 'Working interactive prototypes in 48 hours. Production launch in days.' },
                    { title: 'Transparent Collaboration', desc: 'Direct Slack / WhatsApp channel with lead architects and real-time updates.' },
                    { title: 'Performance First', desc: 'Sub-second page speeds guaranteed with perfect Core Web Vitals.' }
                  ].map((p, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                        style={{
                          backgroundColor: `${customization.primaryColor}20`,
                          color: customization.primaryColor
                        }}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{p.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Leadership & Engineering Team */}
            <div className="space-y-8">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">Meet the Architects</h3>
                <p className="text-xs text-slate-400">The experienced minds building the future of {customization.brandName}.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: 'Alexandros Thorne', role: 'Founder & Chief Architect', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', bio: 'Former Senior Staff Engineer at Stripe with 12+ years building enterprise scale platforms.' },
                  { name: 'Elena Rostova', role: 'VP of Product Design', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80', bio: 'Award-winning UI/UX director passionate about typographic hierarchy and motion systems.' },
                  { name: 'Devon Vance', role: 'Head of Cloud & Security', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', bio: 'Specialist in high-availability Kubernetes clusters, DDoS resilience, and zero-trust auth.' },
                  { name: 'Meera Patel', role: 'Principal Frontend Lead', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80', bio: 'React core contributor and specialist in web animation physics and accessibility.' }
                ].map((m, i) => (
                  <div
                    key={i}
                    className={getCardClasses('overflow-hidden p-4 space-y-3 text-center')}
                    style={getCardStyle()}
                  >
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-slate-700">
                      <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{m.name}</h4>
                      <p
                        className="text-[11px] font-semibold mt-0.5"
                        style={{ color: customization.primaryColor }}
                      >
                        {m.role}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{m.bio}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom CTA on About */}
            <div className="text-center pt-8 border-t border-slate-800">
              <button
                onClick={() => navigateToPage('contact')}
                className={`px-8 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 ${getRadiusClass('btn')}`}
                style={{ backgroundColor: customization.primaryColor }}
              >
                Schedule a Call with Our Leadership &rarr;
              </button>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 3: SERVICES */}
        {/* ============================================================== */}
        {activePage === 'services' && (
          <div className="animate-in fade-in duration-200 max-w-6xl mx-auto w-full px-6 py-12 space-y-16">
            
            {/* Header intro */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span
                className={`font-black text-xs uppercase tracking-widest px-3 py-1 rounded-full border inline-block`}
                style={{
                  color: customization.primaryColor,
                  borderColor: `${customization.primaryColor}30`,
                  backgroundColor: `${customization.primaryColor}10`
                }}
              >
                Comprehensive Offerings
              </span>
              <h1 className={`${getFontSizeScaleClass('hero-title')} font-extrabold tracking-tight`}>
                Enterprise Digital Capabilities
              </h1>
              <p className={`text-slate-400 ${getFontSizeScaleClass('body')}`}>
                From bespoke web experiences to complex transactional engines, discover what {customization.brandName} delivers.
              </p>
            </div>

            {/* Service Detailed Catalog */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  id: 's-web',
                  name: 'Custom Web Development',
                  tag: 'Flagship Service',
                  priceFrom: 'Starting at $1,800',
                  turnaround: '5 - 10 Business Days',
                  desc: 'High-speed, SEO-hardened responsive websites tailored for business credibility, brand authority, and customer conversion.',
                  features: [
                    'Bespoke visual theme & topography system',
                    'Mobile & Tablet pixel-perfect layout',
                    'Interactive lead capture & quoting forms',
                    'SEO metadata, schema & Core Web Vitals optimization',
                    'Full CMS integration (Sanity / Strapi / Custom)'
                  ]
                },
                {
                  id: 's-webapp',
                  name: 'Web Application Development',
                  tag: 'Scalable Systems',
                  priceFrom: 'Starting at $3,500',
                  turnaround: '10 - 20 Business Days',
                  desc: 'Complex dashboards, customer portals, internal workflow management, and real-time operational databases.',
                  features: [
                    'Multi-role permissions & secure JWT auth',
                    'Interactive real-time data charts & reporting',
                    'Automated PDF invoicing & billing sync',
                    'Third-party REST & GraphQL API connectors',
                    'PostgreSQL / Firebase persistent cloud storage'
                  ]
                },
                {
                  id: 's-mobile',
                  name: 'Native Mobile Apps',
                  tag: 'iOS & Android',
                  priceFrom: 'Starting at $4,200',
                  turnaround: '15 - 25 Business Days',
                  desc: 'Cross-platform and native mobile apps engineered with 60fps animations, biometric authentication, and offline capability.',
                  features: [
                    'App Store & Google Play deployment support',
                    'Push notifications & geofencing triggers',
                    'Apple Pay, Google Pay & UPI checkout',
                    'Offline local storage with cloud synchronization',
                    'Deep-linking & social login flows'
                  ]
                },
                {
                  id: 's-ecom',
                  name: 'E-commerce Architecture',
                  tag: 'Revenue Engines',
                  priceFrom: 'Starting at $2,900',
                  turnaround: '7 - 14 Business Days',
                  desc: 'Conversion-obsessed storefronts with frictionless multi-currency checkout, dynamic discounts, and inventory management.',
                  features: [
                    'Lightning-fast cart & 1-tap checkout drawer',
                    'Stripe, PayPal & Razorpay automated webhooks',
                    'Variant selectors & live inventory tracking',
                    'Order tracking & automated email dispatch',
                    'Abandoned cart recovery automations'
                  ]
                },
                {
                  id: 's-cloud',
                  name: 'Cloud & Infrastructure DevOps',
                  tag: 'High Availability',
                  priceFrom: 'Starting at $1,200',
                  turnaround: '3 - 7 Business Days',
                  desc: 'Zero-downtime server setup, Docker containers, multi-region CDN routing, automated database backups, and DDoS defense.',
                  features: [
                    'Vercel, AWS & Google Cloud edge setups',
                    'Automated Git-triggered CI/CD pipelines',
                    'SSL certificates & DNS firewall configuration',
                    'Real-time uptime & performance telemetry',
                    'Database encryption at rest and in transit'
                  ]
                },
                {
                  id: 's-seo',
                  name: 'Technical SEO & Performance',
                  tag: 'Visibility & Traffic',
                  priceFrom: 'Starting at $950',
                  turnaround: '3 - 5 Business Days',
                  desc: 'Audit and elevate your existing website to achieve top Google rankings and 95+ Google PageSpeed Insights scores.',
                  features: [
                    'Comprehensive lighthouse performance tuning',
                    'JSON-LD rich snippet schema implementation',
                    'Semantic HTML5 structure overhaul',
                    'Image WebP compression & edge caching',
                    'Sitemap.xml & robots.txt search engine audit'
                  ]
                }
              ].map((s) => (
                <div
                  key={s.id}
                  className={getCardClasses('p-6 space-y-6 flex flex-col justify-between')}
                  style={getCardStyle()}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${customization.primaryColor}20`,
                          color: customization.primaryColor
                        }}
                      >
                        {s.tag}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">{s.turnaround}</span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base tracking-tight">{s.name}</h3>
                      <div className="text-xs font-bold text-slate-200 mt-0.5">{s.priceFrom}</div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>

                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <div className="text-[11px] font-bold text-slate-300">Deliverables include:</div>
                      {s.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-[11px] text-slate-400">
                          <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: customization.primaryColor }} />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        setContactForm((prev) => ({ ...prev, service: s.name }));
                        navigateToPage('contact');
                      }}
                      className={`w-full py-2.5 text-xs font-bold text-white shadow-xs transition-transform hover:scale-[1.02] flex items-center justify-center gap-1.5 ${getRadiusClass('btn')}`}
                      style={{ backgroundColor: customization.primaryColor }}
                    >
                      <span>Inquire About This Service</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Process Steps */}
            <div className="py-8 space-y-8">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">Our 4-Step Engineering Sprint</h3>
                <p className="text-xs text-slate-400">How we turn concepts into bulletproof production software.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { step: '01', title: 'Discovery & Blueprint', desc: 'Requirements analysis, architectural diagrams, and interactive clickable prototypes.' },
                  { step: '02', title: 'Design & Topography', desc: 'Color topography, typography pairing, component variants, and responsive mockups.' },
                  { step: '03', title: 'Full-Stack Build', desc: 'Clean TypeScript codebase, database schemas, API endpoints, and QA testing.' },
                  { step: '04', title: 'Deploy & Support', desc: 'DNS propagation, SSL provisioning, edge caching, and post-launch maintenance.' }
                ].map((st) => (
                  <div
                    key={st.step}
                    className={getCardClasses('p-5 space-y-3 relative')}
                    style={getCardStyle()}
                  >
                    <div
                      className="text-2xl font-black"
                      style={{ color: customization.primaryColor }}
                    >
                      {st.step}
                    </div>
                    <h4 className="font-bold text-sm">{st.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 4: PORTFOLIO / CASE STUDIES */}
        {/* ============================================================== */}
        {activePage === 'portfolio' && (
          <div className="animate-in fade-in duration-200 max-w-6xl mx-auto w-full px-6 py-12 space-y-12">
            
            {/* Header intro */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span
                className={`font-black text-xs uppercase tracking-widest px-3 py-1 rounded-full border inline-block`}
                style={{
                  color: customization.primaryColor,
                  borderColor: `${customization.primaryColor}30`,
                  backgroundColor: `${customization.primaryColor}10`
                }}
              >
                Our Work
              </span>
              <h1 className={`${getFontSizeScaleClass('hero-title')} font-extrabold tracking-tight`}>
                Featured Client Deployments
              </h1>
              <p className={`text-slate-400 ${getFontSizeScaleClass('body')}`}>
                Explore projects crafted by {customization.brandName} across industries worldwide.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { id: 'all', label: 'All Projects' },
                { id: 'web', label: 'Web Applications' },
                { id: 'mobile', label: 'Mobile Apps' },
                { id: 'saas', label: 'SaaS Platforms' },
                { id: 'ecommerce', label: 'E-commerce' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setPortfolioFilter(f.id as any)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    portfolioFilter === f.id
                      ? 'text-white shadow-md'
                      : customization.themeMode === 'light'
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  style={{
                    backgroundColor: portfolioFilter === f.id ? customization.primaryColor : undefined
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  id: 'p-1',
                  category: 'web',
                  categoryLabel: 'Web Application',
                  title: 'Aura Logistics AI Cloud',
                  client: 'Aura Freight Global',
                  metric: '+340% Fleet Efficiency',
                  img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
                  tech: ['React 19', 'TypeScript', 'Node.js', 'PostgreSQL'],
                  desc: 'Real-time multi-carrier shipment telemetry dashboard handling 50k daily active waybills with automated route optimizations.'
                },
                {
                  id: 'p-2',
                  category: 'ecommerce',
                  categoryLabel: 'E-commerce',
                  title: 'Maison Luxe Haute Horlogerie',
                  client: 'Geneva Luxury Watch Co.',
                  metric: '$4.2M Online Sales in Q1',
                  img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
                  tech: ['Next.js', 'Stripe Elements', 'Tailwind CSS', 'Redis'],
                  desc: 'Ultra-luxury timepiece showcase featuring 3D product customizer, private concierge booking, and instant Apple Pay checkout.'
                },
                {
                  id: 'p-3',
                  category: 'mobile',
                  categoryLabel: 'Mobile App',
                  title: 'PulseFit Pro iOS & Android',
                  client: 'FitLabs Athletic Inc.',
                  metric: '4.9★ (42k App Reviews)',
                  img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
                  tech: ['React Native', 'HealthKit API', 'WebSocket', 'GraphQL'],
                  desc: 'Personalized workout tracking with Apple Watch biometric synchronization, macro logging, and live community leaderboards.'
                },
                {
                  id: 'p-4',
                  category: 'saas',
                  categoryLabel: 'SaaS Platform',
                  title: 'FinSphere Capital Terminal',
                  client: 'FinSphere Wealth Management',
                  metric: '&lt;12ms Query Latency',
                  img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80',
                  tech: ['TypeScript', 'FastAPI', 'TimescaleDB', 'Docker'],
                  desc: 'Institutional financial analytics workstation monitoring global equities, forex hedging, and real-time risk indicators.'
                },
                {
                  id: 'p-5',
                  category: 'web',
                  categoryLabel: 'Corporate Web',
                  title: 'Veritas Law & Governance',
                  client: 'Veritas LLP Partners',
                  metric: '+280% Qualified Client Inquiries',
                  img: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
                  tech: ['React', 'Tailwind', 'Headless CMS', 'Cloudflare'],
                  desc: 'Prestigious corporate presence with secure client document vaults, lawyer scheduling calendars, and legal insight hubs.'
                },
                {
                  id: 'p-6',
                  category: 'saas',
                  categoryLabel: 'SaaS Platform',
                  title: 'EduPulse Academy LMS',
                  client: 'Global Edutech Alliance',
                  metric: '180k Enrolled Students',
                  img: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&auto=format&fit=crop&q=80',
                  tech: ['React', 'Node.js', 'AWS S3 Video', 'MongoDB'],
                  desc: 'Comprehensive learning management system featuring interactive video quizzes, gradebooks, and instant certificate issuance.'
                }
              ]
                .filter((p) => portfolioFilter === 'all' || p.category === portfolioFilter)
                .map((project) => (
                  <div
                    key={project.id}
                    className={getCardClasses('overflow-hidden flex flex-col justify-between group')}
                    style={getCardStyle()}
                  >
                    <div>
                      <div className="aspect-16/10 overflow-hidden relative bg-slate-800">
                        <img
                          src={project.img}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3">
                          <span
                            className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white backdrop-blur-md"
                            style={{ backgroundColor: customization.primaryColor }}
                          >
                            {project.categoryLabel}
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <span className="text-[11px] font-extrabold bg-slate-900/90 text-white px-2.5 py-1 rounded-md backdrop-blur-md">
                            {project.metric}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 space-y-2.5">
                        <div className="text-[11px] font-bold text-slate-400">{project.client}</div>
                        <h3 className="font-extrabold text-base tracking-tight">{project.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{project.desc}</p>

                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {project.tech.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <button
                        onClick={() => setSelectedCaseStudy(project)}
                        className={`w-full py-2 text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                          customization.themeMode === 'light'
                            ? 'border-slate-300 text-slate-800 hover:bg-slate-100'
                            : 'border-slate-700 text-slate-200 hover:bg-slate-800'
                        } ${getRadiusClass('btn')}`}
                      >
                        <span>View Project Breakdown</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Case Study Modal */}
            {selectedCaseStudy && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-white space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm"
                        style={{ backgroundColor: `${customization.primaryColor}25`, color: customization.primaryColor }}
                      >
                        {selectedCaseStudy.categoryLabel}
                      </span>
                      <h3 className="font-black text-lg mt-1">{selectedCaseStudy.title}</h3>
                    </div>
                    <button
                      onClick={() => setSelectedCaseStudy(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="aspect-16/9 rounded-xl overflow-hidden bg-slate-800">
                    <img
                      src={selectedCaseStudy.img}
                      alt={selectedCaseStudy.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="text-slate-300 leading-relaxed">{selectedCaseStudy.desc}</p>
                    <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                      <span className="text-slate-400">Core Client Impact:</span>
                      <strong className="text-white font-bold">{selectedCaseStudy.metric}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      onClick={() => setSelectedCaseStudy(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCaseStudy(null);
                        navigateToPage('contact');
                      }}
                      className="px-6 py-2 text-xs font-bold text-white rounded-lg shadow-md"
                      style={{ backgroundColor: customization.primaryColor }}
                    >
                      Build a Similar Project
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 5: PRICING & PLANS */}
        {/* ============================================================== */}
        {activePage === 'pricing' && (
          <div className="animate-in fade-in duration-200 max-w-6xl mx-auto w-full px-6 py-12 space-y-16">
            
            {/* Header intro */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span
                className={`font-black text-xs uppercase tracking-widest px-3 py-1 rounded-full border inline-block`}
                style={{
                  color: customization.primaryColor,
                  borderColor: `${customization.primaryColor}30`,
                  backgroundColor: `${customization.primaryColor}10`
                }}
              >
                Clear, Predictable Pricing
              </span>
              <h1 className={`${getFontSizeScaleClass('hero-title')} font-extrabold tracking-tight`}>
                Investment Tiers Tailored for You
              </h1>
              <p className={`text-slate-400 ${getFontSizeScaleClass('body')}`}>
                Transparent packages with zero hidden fees. Choose monthly flexibility or annual savings.
              </p>

              {/* Monthly / Annual Toggle */}
              <div className="pt-4 flex items-center justify-center gap-3">
                <span
                  className={`text-xs font-bold cursor-pointer ${
                    billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'
                  }`}
                  onClick={() => setBillingCycle('monthly')}
                >
                  Monthly Billing
                </span>
                <button
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                  className="w-12 h-6 rounded-full p-1 bg-slate-800 transition-colors relative"
                  style={{ backgroundColor: billingCycle === 'annual' ? customization.primaryColor : undefined }}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span
                  className={`text-xs font-bold cursor-pointer flex items-center gap-1.5 ${
                    billingCycle === 'annual' ? 'text-white' : 'text-slate-500'
                  }`}
                  onClick={() => setBillingCycle('annual')}
                >
                  <span>Annual Billing</span>
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase"
                    style={{
                      backgroundColor: `${customization.primaryColor}25`,
                      color: customization.primaryColor
                    }}
                  >
                    Save 20%
                  </span>
                </span>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {[
                {
                  id: 'plan-starter',
                  name: 'Startup Foundation',
                  badge: 'For Fast Launch',
                  monthlyPrice: 1499,
                  annualPrice: 1199,
                  desc: 'Perfect for new ventures and emerging brands needing a clean, high-speed web presence.',
                  isPopular: false,
                  features: [
                    'Up to 5 Custom Responsive Pages',
                    'Mobile & Tablet Optimization',
                    'Contact & Quote Capture Forms',
                    'Basic Technical SEO & Schema',
                    'Vercel / Cloudflare Edge Hosting',
                    '14 Days Post-Launch Support'
                  ]
                },
                {
                  id: 'plan-growth',
                  name: 'Growth Pro Accelerator',
                  badge: 'Most Popular',
                  monthlyPrice: 3299,
                  annualPrice: 2639,
                  desc: 'Engineered for scaling businesses requiring dynamic web apps, portals, or full e-commerce.',
                  isPopular: true,
                  features: [
                    'Up to 15 Screens / Dynamic Pages',
                    'Interactive Dashboard / Admin Panel',
                    'User Authentication & Secure Auth',
                    'Stripe / Payment Gateway Integration',
                    'Headless CMS Publishing Engine',
                    'Real-time Database (PostgreSQL/Firebase)',
                    'Core Web Vitals & Speed Hardening',
                    '60 Days Dedicated Engineering Support'
                  ]
                },
                {
                  id: 'plan-enterprise',
                  name: 'Enterprise Bespoke',
                  badge: 'Custom Architecture',
                  monthlyPrice: 6999,
                  annualPrice: 5599,
                  desc: 'Complete software ecosystem for multi-brand enterprises, native apps, and heavy traffic.',
                  isPopular: false,
                  features: [
                    'Unlimited Custom Architectural Modules',
                    'Native iOS & Android Mobile Apps',
                    'High-Availability Cloud Microservices',
                    'Custom REST & GraphQL Endpoints',
                    'Automated CI/CD Pipelines & DevOps',
                    'ISO-27001 Security Audit & Hardening',
                    'Dedicated Lead Architect on Slack',
                    '24/7 SLA Priority Guarantee'
                  ]
                }
              ].map((plan) => {
                const currentPrice = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
                return (
                  <div
                    key={plan.id}
                    className={getCardClasses(
                      `p-6 sm:p-8 space-y-6 flex flex-col justify-between relative ${
                        plan.isPopular ? 'border-2 shadow-2xl scale-[1.02]' : ''
                      }`
                    )}
                    style={{
                      ...getCardStyle(),
                      borderColor: plan.isPopular ? customization.primaryColor : undefined
                    }}
                  >
                    {plan.isPopular && (
                      <div
                        className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-white px-4 py-1 rounded-full shadow-md"
                        style={{ backgroundColor: customization.primaryColor }}
                      >
                        ★ Most Selected Design
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          {plan.badge}
                        </span>
                        <h3 className="text-xl font-black mt-1 tracking-tight">{plan.name}</h3>
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                          ${currentPrice.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">/ month</span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">{plan.desc}</p>

                      <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
                        <div className="text-[11px] font-bold text-slate-300">Package Includes:</div>
                        {plan.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                            <CheckCircle2
                              className="w-4 h-4 shrink-0 mt-0.5"
                              style={{ color: customization.primaryColor }}
                            />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-800/80">
                      <button
                        onClick={() => {
                          setContactForm((prev) => ({
                            ...prev,
                            service: `${plan.name} (${billingCycle.toUpperCase()})`
                          }));
                          navigateToPage('contact');
                        }}
                        className={`w-full py-3 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 ${
                          plan.isPopular
                            ? 'text-white hover:opacity-95'
                            : 'border border-slate-700 bg-slate-800 text-white hover:bg-slate-700'
                        } ${getRadiusClass('btn')}`}
                        style={{
                          backgroundColor: plan.isPopular ? customization.primaryColor : undefined
                        }}
                      >
                        <span>Choose {plan.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pricing FAQ Accordion */}
            <div className="max-w-3xl mx-auto space-y-6 pt-8">
              <div className="text-center space-y-1">
                <h3 className="text-xl font-extrabold tracking-tight">Frequently Asked Questions</h3>
                <p className="text-xs text-slate-400">Everything you need to know about billing and ownership.</p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    q: 'Do I own 100% of the code and design intellectual property?',
                    a: 'Yes, absolutely. Upon final payment, all intellectual property, source code repositories, design Figma tokens, and credentials belong entirely to you with no ongoing licensing fees.'
                  },
                  {
                    q: 'How fast can our project go live?',
                    a: 'Standard website deliverables ship within 5-10 business days. Complex web applications typically take 15-20 business days with working sprints delivered continuously.'
                  },
                  {
                    q: 'Can we customize the colors, typography and layout after launch?',
                    a: 'Yes! Our architectures are built on structured design token files and CMS models, allowing you to update brand palettes, fonts, copy, and media in seconds without developer assistance.'
                  },
                  {
                    q: 'What payment methods do you accept?',
                    a: 'We accept Stripe, all major international credit cards, ACH wire transfers, and Razorpay for Indian UPI and net banking.'
                  }
                ].map((faq, i) => (
                  <div
                    key={i}
                    className={getCardClasses('p-4 space-y-1.5')}
                    style={getCardStyle()}
                  >
                    <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                      <HelpCircle className="w-3.5 h-3.5 shrink-0" style={{ color: customization.primaryColor }} />
                      <span>{faq.q}</span>
                    </h4>
                    <p className="text-xs text-slate-400 pl-5 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 6: CONTACT US */}
        {/* ============================================================== */}
        {activePage === 'contact' && (
          <div className="animate-in fade-in duration-200 max-w-6xl mx-auto w-full px-6 py-12 space-y-12">
            
            {/* Header intro */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span
                className={`font-black text-xs uppercase tracking-widest px-3 py-1 rounded-full border inline-block`}
                style={{
                  color: customization.primaryColor,
                  borderColor: `${customization.primaryColor}30`,
                  backgroundColor: `${customization.primaryColor}10`
                }}
              >
                Get In Touch
              </span>
              <h1 className={`${getFontSizeScaleClass('hero-title')} font-extrabold tracking-tight`}>
                Start Your Project with {customization.brandName}
              </h1>
              <p className={`text-slate-400 ${getFontSizeScaleClass('body')}`}>
                Have a new project or need a quote? Reach our lead software engineering team today.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Left Column: Direct Contact Info & Interactive Simulated Map */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Contact channels */}
                <div className="space-y-4">
                  <div
                    className={getCardClasses('p-5 flex items-start gap-3.5')}
                    style={getCardStyle()}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${customization.primaryColor}20`,
                        color: customization.primaryColor
                      }}
                    >
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Direct Email</h4>
                      <p className="text-xs text-slate-400">hello@{customization.brandName.toLowerCase().replace(/[^a-z]/g, '')}.com</p>
                      <span className="text-[10px] text-emerald-400 font-semibold">Average reply time: under 2 hours</span>
                    </div>
                  </div>

                  <div
                    className={getCardClasses('p-5 flex items-start gap-3.5')}
                    style={getCardStyle()}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${customization.primaryColor}20`,
                        color: customization.primaryColor
                      }}
                    >
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Phone & WhatsApp Direct</h4>
                      <p className="text-xs text-slate-400">+1 (800) 849-2910 / +91 98765 43210</p>
                      <span className="text-[10px] text-slate-400 font-medium">Monday – Friday: 9am – 8pm EST</span>
                    </div>
                  </div>

                  <div
                    className={getCardClasses('p-5 flex items-start gap-3.5')}
                    style={getCardStyle()}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${customization.primaryColor}20`,
                        color: customization.primaryColor
                      }}
                    >
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Headquarters & Tech Hubs</h4>
                      <p className="text-xs text-slate-400">548 Market St, Suite 39201, San Francisco, CA</p>
                      <p className="text-xs text-slate-400">Additional offices: London UK • Bengaluru IN</p>
                    </div>
                  </div>
                </div>

                {/* Simulated Interactive Map */}
                <div
                  className={getCardClasses('p-5 space-y-3 overflow-hidden')}
                  style={getCardStyle()}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" style={{ color: customization.primaryColor }} />
                      <span>Global Engineering Presence</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">● All Systems Online</span>
                  </div>

                  {/* Visual Map Canvas */}
                  <div className="aspect-16/9 bg-slate-950 rounded-xl relative overflow-hidden border border-slate-800 flex items-center justify-center">
                    {/* Grid lines */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
                    
                    {/* Location Markers */}
                    <div className="absolute left-[20%] top-[40%] flex flex-col items-center group cursor-pointer">
                      <div className="w-3.5 h-3.5 rounded-full bg-orange-500 animate-ping absolute" />
                      <div
                        className="w-3.5 h-3.5 rounded-full shadow-lg relative flex items-center justify-center text-[8px] font-bold text-white"
                        style={{ backgroundColor: customization.primaryColor }}
                      >
                        SF
                      </div>
                      <span className="text-[9px] font-bold text-slate-300 mt-1 bg-slate-900/80 px-1 rounded-sm">
                        San Francisco
                      </span>
                    </div>

                    <div className="absolute left-[50%] top-[30%] flex flex-col items-center group cursor-pointer">
                      <div
                        className="w-3.5 h-3.5 rounded-full shadow-lg relative flex items-center justify-center text-[8px] font-bold text-white"
                        style={{ backgroundColor: customization.primaryColor }}
                      >
                        LDN
                      </div>
                      <span className="text-[9px] font-bold text-slate-300 mt-1 bg-slate-900/80 px-1 rounded-sm">
                        London
                      </span>
                    </div>

                    <div className="absolute left-[70%] top-[55%] flex flex-col items-center group cursor-pointer">
                      <div
                        className="w-3.5 h-3.5 rounded-full shadow-lg relative flex items-center justify-center text-[8px] font-bold text-white"
                        style={{ backgroundColor: customization.primaryColor }}
                      >
                        BLR
                      </div>
                      <span className="text-[9px] font-bold text-slate-300 mt-1 bg-slate-900/80 px-1 rounded-sm">
                        Bengaluru
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 absolute bottom-2 left-3">
                      High availability global team coverage 24/7
                    </p>
                  </div>
                </div>

              </div>

              {/* Right Column: Working Interactive Form */}
              <div className="lg:col-span-7">
                <div
                  className={getCardClasses('p-6 sm:p-8 space-y-6 shadow-xl')}
                  style={getCardStyle()}
                >
                  <div>
                    <h3 className="text-xl font-black text-white">Send Us a Direct Message</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Fill out this quick form and our lead solutions architect will evaluate your specifications.
                    </p>
                  </div>

                  {contactSubmitted ? (
                    <div
                      className="p-8 rounded-xl border text-center space-y-4 animate-in zoom-in-95 duration-200"
                      style={{
                        backgroundColor: `${customization.primaryColor}15`,
                        borderColor: `${customization.primaryColor}40`
                      }}
                    >
                      <div
                        className="w-14 h-14 rounded-full mx-auto flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: customization.primaryColor, color: '#FFFFFF' }}
                      >
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-black text-white">Inquiry Received Successfully!</h4>
                        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                          Thank you <strong>{contactForm.name}</strong>. Our technical architecture team for{' '}
                          <strong>{customization.brandName}</strong> has logged your request for{' '}
                          <em>{contactForm.service}</em>. We will reach you at{' '}
                          <span className="font-mono font-bold text-white">{contactForm.email}</span> shortly.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setContactSubmitted(false);
                          setContactForm({
                            name: '',
                            email: '',
                            phone: '',
                            service: 'Enterprise Web Application',
                            budget: '$10k - $25k',
                            message: ''
                          });
                        }}
                        className={`px-5 py-2 text-xs font-bold border border-slate-700 bg-slate-800 text-white hover:bg-slate-700 transition-colors ${getRadiusClass('btn')}`}
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-300">Your Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="Johnathan Davis"
                            value={contactForm.name}
                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                            className={`w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 text-white focus:outline-hidden focus:border-orange-500 transition-colors ${getRadiusClass('input')}`}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-300">Work Email Address *</label>
                          <input
                            type="email"
                            required
                            placeholder="john@enterprise.com"
                            value={contactForm.email}
                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                            className={`w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 text-white focus:outline-hidden focus:border-orange-500 transition-colors ${getRadiusClass('input')}`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-300">Phone / WhatsApp Number</label>
                          <input
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={contactForm.phone}
                            onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                            className={`w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 text-white focus:outline-hidden focus:border-orange-500 transition-colors ${getRadiusClass('input')}`}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-300">Estimated Budget Range</label>
                          <select
                            value={contactForm.budget}
                            onChange={(e) => setContactForm({ ...contactForm, budget: e.target.value })}
                            className={`w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 text-white focus:outline-hidden focus:border-orange-500 transition-colors ${getRadiusClass('input')}`}
                          >
                            <option value="Under $5k">Under $5k (Sprint / Landing Page)</option>
                            <option value="$5k - $10k">$5k - $10k (Custom Website)</option>
                            <option value="$10k - $25k">$10k - $25k (Full Web App / Portal)</option>
                            <option value="$25k+">$25k+ (Enterprise Ecosystem)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-300">Service Required</label>
                        <select
                          value={contactForm.service}
                          onChange={(e) => setContactForm({ ...contactForm, service: e.target.value })}
                          className={`w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 text-white focus:outline-hidden focus:border-orange-500 transition-colors ${getRadiusClass('input')}`}
                        >
                          <option value="Enterprise Web Application">Enterprise Web Application</option>
                          <option value="Custom Business Website">Custom Business Website</option>
                          <option value="iOS & Android Mobile App">iOS & Android Mobile App</option>
                          <option value="E-Commerce Storefront">E-Commerce Storefront</option>
                          <option value="Cloud Infrastructure & DevOps">Cloud Infrastructure & DevOps</option>
                          <option value="Technical SEO & Performance Audit">Technical SEO & Performance Audit</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-300">Project Overview & Objectives</label>
                        <textarea
                          rows={4}
                          placeholder="Tell us about your target audience, timeline constraints, or specific feature requirements..."
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          className={`w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 text-white focus:outline-hidden focus:border-orange-500 transition-colors ${getRadiusClass('input')}`}
                        />
                      </div>

                      <button
                        type="submit"
                        className={`w-full py-3.5 font-bold text-sm text-white shadow-lg transition-transform hover:scale-[1.01] flex items-center justify-center gap-2 ${getRadiusClass('btn')}`}
                        style={{ backgroundColor: customization.primaryColor }}
                      >
                        <Send className="w-4 h-4" />
                        <span>Send Project Brief to {customization.brandName} &rarr;</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Global Demo Website Footer */}
        <footer
          className={`mt-auto border-t py-12 px-6 transition-colors ${
            customization.themeMode === 'light'
              ? 'bg-slate-100 border-slate-200 text-slate-700'
              : 'bg-slate-950 border-slate-900 text-slate-400'
          }`}
        >
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 flex items-center justify-center font-black text-white text-xs ${getRadiusClass('input')}`}
                  style={{ backgroundColor: customization.primaryColor }}
                >
                  {brandInitials}
                </div>
                <span className="font-extrabold text-base tracking-tight text-white">
                  {customization.brandName}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {customization.tagline || 'Next-generation web development and scalable digital architectures.'}
              </p>
              <div className="text-[11px] text-slate-500">
                &copy; {new Date().getFullYear()} {customization.brandName}. All rights reserved.
              </div>
            </div>

            <div>
              <h5 className="font-bold text-xs uppercase tracking-wider text-slate-200 mb-3">Website Pages</h5>
              <ul className="space-y-2 text-xs">
                {navLinks.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => navigateToPage(p.id)}
                      className={`hover:underline flex items-center gap-1 ${
                        activePage === p.id ? 'font-bold text-white' : 'text-slate-400'
                      }`}
                      style={{ color: activePage === p.id ? customization.primaryColor : undefined }}
                    >
                      <span>{p.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-xs uppercase tracking-wider text-slate-200 mb-3">Design Topography</h5>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>Active Palette: <strong className="text-white">{customization.paletteId.toUpperCase()}</strong></li>
                <li>Primary: <span className="font-mono text-white">{customization.primaryColor}</span></li>
                <li>Accent: <span className="font-mono text-white">{customization.accentColor}</span></li>
                <li>Font: <span className="text-white">{customization.fontStyleName}</span></li>
                <li>Scale: <span className="text-white capitalize">{customization.fontSizeScale}</span></li>
              </ul>
              <button
                onClick={() => setDrawerOpen(true)}
                className="mt-3 text-xs font-bold hover:underline flex items-center gap-1"
                style={{ color: customization.primaryColor }}
              >
                <Sliders className="w-3 h-3" />
                <span>Customize Topography</span>
              </button>
            </div>

            <div>
              <h5 className="font-bold text-xs uppercase tracking-wider text-slate-200 mb-3">Adopt This Design</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Love this exact configuration? Submit your enquiry and our team will build it for you.
              </p>
              <button
                onClick={() => onUseDesign(template, customization)}
                className={`mt-4 w-full py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 ${getRadiusClass('btn')}`}
                style={{ backgroundColor: customization.primaryColor }}
              >
                Use This Design &rarr;
              </button>
            </div>
          </div>
        </footer>

      </div>

      {/* Video Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 rounded-2xl max-w-xl w-full p-6 text-white space-y-4 border border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">{customization.brandName} - Video Overview</h3>
              <button onClick={() => setVideoModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-16/9 bg-slate-800 rounded-xl flex items-center justify-center flex-col gap-2 p-6 text-center border border-slate-700">
              <Play
                className="w-12 h-12 animate-pulse"
                style={{ color: customization.primaryColor, fill: customization.primaryColor }}
              />
              <p className="text-sm font-semibold text-slate-200">Sample Video Stream Preview</p>
              <p className="text-xs text-slate-400">
                Embed YouTube, Vimeo, or HTML5 MP4 promotional videos directly in this section.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setVideoModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-700"
              >
                Close Video
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

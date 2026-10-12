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
  CheckCircle2
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

export const BusinessProDemo: React.FC<BusinessProDemoProps> = ({
  template,
  onBack,
  onUseDesign
}) => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  
  const {
    customization,
    drawerOpen,
    setDrawerOpen,
    applyPalette,
    updateField,
    resetToDefault,
    getRadiusClass,
    getFontFamilyClass,
    calculateEstimate
  } = useThemeCustomizer(template);

  const estimate = calculateEstimate();

  const brandInitials = customization.brandName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'BP';

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 flex flex-col ${getFontFamilyClass()}`}>
      
      {/* Top Demo Notification Banner (can be toggled in Customizer) */}
      {customization.showPromoBanner && (
        <div
          className="text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 transition-colors"
          style={{ backgroundColor: customization.primaryColor }}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>
            Interactive Live Demo: Customize brand name, theme colors & font with live real-time preview!
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
        onUseDesign={onUseDesign}
      />

      {/* Demo Customizer Slide-over Drawer */}
      <DemoCustomizerDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        template={template}
        customization={customization}
        onApplyPalette={applyPalette}
        onUpdateField={updateField}
        onReset={resetToDefault}
        onUseDesign={onUseDesign}
      />

      {/* Floating Customize Theme Button */}
      <FloatingCustomizeButton
        onOpen={() => setDrawerOpen(true)}
        primaryColor={customization.primaryColor}
      />

      {/* Demo Website Interior */}
      <div
        className={`flex-1 transition-colors ${
          customization.themeMode === 'dark'
            ? 'bg-slate-950 text-slate-100'
            : customization.themeMode === 'dim'
            ? 'bg-slate-900 text-slate-100'
            : 'bg-white text-slate-800'
        }`}
      >
        
        {/* Demo Navbar */}
        <header
          className={`border-b px-6 py-4 flex items-center justify-between sticky top-12 z-20 transition-colors ${
            customization.themeMode === 'light'
              ? 'bg-white/95 border-slate-200 text-slate-900 backdrop-blur-md'
              : 'bg-slate-950/95 border-slate-800 text-white backdrop-blur-md'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 flex items-center justify-center font-black text-white text-sm shadow-md ${getRadiusClass('input')}`}
              style={{ backgroundColor: customization.primaryColor }}
            >
              {brandInitials}
            </div>
            <span className="font-extrabold text-lg tracking-tight">
              {customization.brandName}
            </span>
          </div>

          <nav
            className={`hidden md:flex items-center space-x-6 text-xs font-semibold ${
              customization.themeMode === 'light' ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            <a href="#home" style={{ color: customization.primaryColor }}>Home</a>
            <a href="#about" className="hover:opacity-75">About</a>
            <a href="#services" className="hover:opacity-75">Services</a>
            <a href="#portfolio" className="hover:opacity-75">Portfolio</a>
            <a href="#contact" className="hover:opacity-75">Contact</a>
          </nav>

          <button
            onClick={() => onUseDesign(template, customization)}
            className={`text-white px-4 py-2 text-xs font-bold shadow-md transition-all hover:opacity-90 ${getRadiusClass('btn')}`}
            style={{ backgroundColor: customization.primaryColor }}
          >
            {customization.ctaText}
          </button>
        </header>

        {/* Hero Section */}
        <section
          className={`relative py-20 px-6 overflow-hidden ${
            customization.themeMode === 'light' ? 'bg-slate-950 text-white' : 'bg-slate-900 text-white'
          }`}
        >
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              {customization.showBadges && (
                <span
                  className="font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full border inline-block"
                  style={{
                    color: customization.accentColor,
                    borderColor: `${customization.accentColor}40`,
                    backgroundColor: `${customization.accentColor}15`
                  }}
                >
                  ★ Enterprise Web Architecture
                </span>
              )}

              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
                {customization.brandName}{' '}
                <span
                  className="text-transparent bg-clip-text"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${customization.primaryColor}, ${customization.accentColor})`
                  }}
                >
                  Digital Solutions
                </span>
              </h1>

              <p className="text-slate-300 text-base leading-relaxed max-w-xl">
                {customization.tagline}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onUseDesign(template, customization)}
                  className={`text-white px-6 py-3 font-bold text-xs flex items-center gap-2 shadow-lg transition-transform hover:scale-105 ${getRadiusClass('btn')}`}
                  style={{ backgroundColor: customization.primaryColor }}
                >
                  <span>{customization.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setVideoModalOpen(true)}
                  className={`flex items-center gap-2.5 px-5 py-3 bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:bg-slate-800 ${getRadiusClass('btn')}`}
                >
                  <Play
                    className="w-3.5 h-3.5"
                    style={{ color: customization.accentColor, fill: customization.accentColor }}
                  />
                  <span>Watch Video Overview</span>
                </button>
              </div>

              {/* Live customization pill indicator */}
              <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
                <span>Theme Active:</span>
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: customization.primaryColor }}
                />
                <span className="font-mono text-white text-[11px] font-bold">
                  {customization.primaryColor}
                </span>
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="underline hover:text-white ml-2 text-[11px]"
                >
                  Change Color
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div
                className={`relative overflow-hidden shadow-2xl border border-slate-800 aspect-4/3 ${getRadiusClass('card')}`}
              >
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80"
                  alt="Modern Office Building"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                  <div>
                    <div
                      className="text-xs font-mono font-bold"
                      style={{ color: customization.accentColor }}
                    >
                      {customization.brandName} Head Office
                    </div>
                    <div className="text-white font-bold text-sm">
                      Empowering Next-Gen Digital Workflows
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 3 Pillars strip */}
        {customization.showBadges && (
          <section
            className={`border-b py-6 px-6 ${
              customization.themeMode === 'light'
                ? 'bg-slate-50 border-slate-200'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 flex items-center justify-center shrink-0 ${getRadiusClass('input')}`}
                  style={{
                    backgroundColor: `${customization.primaryColor}20`,
                    color: customization.primaryColor
                  }}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Custom Branded Colors</h4>
                  <p className="text-xs text-slate-500">Live preview with your color palette</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 flex items-center justify-center shrink-0 ${getRadiusClass('input')}`}
                  style={{
                    backgroundColor: `${customization.primaryColor}20`,
                    color: customization.primaryColor
                  }}
                >
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Fully Responsive</h4>
                  <p className="text-xs text-slate-500">Pixel-perfect across all screen sizes</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 flex items-center justify-center shrink-0 ${getRadiusClass('input')}`}
                  style={{
                    backgroundColor: `${customization.primaryColor}20`,
                    color: customization.primaryColor
                  }}
                >
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Tailored Typography</h4>
                  <p className="text-xs text-slate-500">Selected font & curved corners applied</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Our Services Section with Sample Data */}
        <section
          className={`py-16 px-6 ${
            customization.themeMode === 'light' ? 'bg-white' : 'bg-slate-950'
          }`}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Solutions by {customization.brandName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Everything you need to launch and scale your business online with measurable results.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Corporate Branding', img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500&auto=format&fit=crop&q=80', desc: 'Distinctive visual identities and cohesive brand guidelines.' },
                { title: 'Web Development', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=80', desc: 'High-speed web pages tuned for customer conversion.' },
                { title: 'Strategic Advisory', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop&q=80', desc: 'Go-to-market strategies and digital market research.' },
                { title: 'Cloud Infrastructure', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80', desc: 'Scalable server hosting with 99.9% uptime guarantees.' },
              ].map((serv, i) => (
                <div
                  key={i}
                  className={`border overflow-hidden transition-all hover:shadow-lg ${getRadiusClass('card')} ${
                    customization.themeMode === 'light'
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="aspect-16/10 bg-slate-100 overflow-hidden">
                    <img src={serv.img} alt={serv.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 space-y-1.5">
                    <h3 className="font-bold text-sm">{serv.title}</h3>
                    <p className="text-xs text-slate-500">{serv.desc}</p>
                    <button
                      onClick={() => setDrawerOpen(true)}
                      className="text-[11px] font-bold flex items-center gap-1 pt-1"
                      style={{ color: customization.primaryColor }}
                    >
                      <span>Customize module</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Contact & Customization Box inside demo */}
            <div
              className={`mt-16 p-8 border ${getRadiusClass('card')} ${
                customization.themeMode === 'light'
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="max-w-2xl mx-auto text-center space-y-4">
                <span
                  className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border inline-block"
                  style={{
                    color: customization.primaryColor,
                    borderColor: `${customization.primaryColor}40`,
                    backgroundColor: `${customization.primaryColor}15`
                  }}
                >
                  Estimated Quote: {estimate.price} • {estimate.days}
                </span>

                <h3 className="text-xl sm:text-2xl font-bold">
                  Like this customized style for {customization.brandName}?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                  We will build this exact layout with your chosen primary color (<span className="font-mono font-bold">{customization.primaryColor}</span>), logo, and backend features.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setDrawerOpen(true)}
                    className={`px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 ${getRadiusClass('btn')}`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Fine-tune Colors & Brand</span>
                  </button>
                  <button
                    onClick={() => onUseDesign(template, customization)}
                    className={`text-white px-8 py-3 font-bold text-sm shadow-lg transition-transform hover:scale-105 ${getRadiusClass('btn')}`}
                    style={{ backgroundColor: customization.primaryColor }}
                  >
                    Use This Design for My Project &rarr;
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

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
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 z-30 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
        <div className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: customization.primaryColor }}
          />
          <div>
            <h4 className="font-extrabold text-white text-xs sm:text-sm">
              {customization.brandName} ({template.templateCode})
            </h4>
            <p className="text-[11px] text-slate-400">
              Primary: <span className="font-mono text-white">{customization.primaryColor}</span> • Font: <span className="capitalize">{customization.fontFamily}</span> • Corners: <span className="capitalize">{customization.borderRadius}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={() => setDrawerOpen(true)}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-orange-400" />
            <span>Customize</span>
          </button>
          <button
            onClick={() => onUseDesign(template, customization)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-white px-5 py-1.5 rounded-xl font-bold text-xs shadow-lg transition-transform hover:scale-105"
            style={{ backgroundColor: customization.primaryColor }}
          >
            <span>Use This Design</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};

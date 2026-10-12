import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, Zap, Layers, CheckCircle2, Calculator, Sliders } from 'lucide-react';
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

export const CorporateWebsiteDemo: React.FC<CorporateWebsiteDemoProps> = ({
  template,
  onBack,
  onUseDesign
}) => {
  const [estimatedPages, setEstimatedPages] = useState(6);
  const [needsEcommerce, setNeedsEcommerce] = useState(false);

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
  } = useThemeCustomizer(template, {
    brandName: 'Nexora Digital',
    primaryColor: '#2563EB',
    accentColor: '#38BDF8',
    paletteId: 'blue'
  });

  const calculatedQuote = (estimatedPages * 3500) + (needsEcommerce ? 15000 : 0);

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 flex flex-col ${getFontFamilyClass()}`}>
      
      {/* Top Banner */}
      {customization.showPromoBanner && (
        <div
          className="text-white text-xs font-semibold py-2 px-4 text-center transition-colors flex items-center justify-center gap-2"
          style={{ backgroundColor: customization.primaryColor }}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>
            Live Custom Website Preview: {customization.brandName} Corporate Architecture with customizable colors & real-time quote calculator.
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
        onUseDesign={onUseDesign}
      />

      {/* Slide-over Theme Customizer Drawer */}
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

      {/* Floating Customize Button */}
      <FloatingCustomizeButton
        onOpen={() => setDrawerOpen(true)}
        primaryColor={customization.primaryColor}
      />

      {/* Interior */}
      <div
        className={`flex-1 transition-colors ${
          customization.themeMode === 'dark'
            ? 'bg-slate-950 text-slate-100'
            : customization.themeMode === 'dim'
            ? 'bg-slate-900 text-slate-100'
            : 'bg-white text-slate-900'
        }`}
      >
        
        {/* Header */}
        <header
          className={`border-b px-8 py-4 flex items-center justify-between sticky top-12 z-20 backdrop-blur-md ${
            customization.themeMode === 'light'
              ? 'bg-white/95 border-slate-100'
              : 'bg-slate-950/95 border-slate-800'
          }`}
        >
          <div className="text-xl font-black tracking-tight flex items-center gap-1">
            <span>{customization.brandName}</span>
            <span style={{ color: customization.primaryColor }}>.</span>
          </div>

          <nav
            className={`hidden md:flex items-center space-x-6 text-xs font-semibold ${
              customization.themeMode === 'light' ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            <span style={{ color: customization.primaryColor }}>Home</span>
            <span className="hover:opacity-75">About</span>
            <span className="hover:opacity-75">Services</span>
            <span className="hover:opacity-75">Portfolio</span>
            <span className="hover:opacity-75">Blog</span>
            <span className="hover:opacity-75">Contact</span>
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
        <section className="py-16 px-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            {customization.showBadges && (
              <span
                className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border inline-block"
                style={{
                  color: customization.primaryColor,
                  borderColor: `${customization.primaryColor}40`,
                  backgroundColor: `${customization.primaryColor}15`
                }}
              >
                ★ Tailored for {customization.brandName}
              </span>
            )}

            <h1 className="text-4xl sm:text-5xl font-black leading-tight">
              Build Your Business Future
            </h1>
            <p className="text-slate-500 text-base leading-relaxed">
              {customization.tagline}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onUseDesign(template, customization)}
                className={`text-white px-6 py-3 text-xs font-bold shadow-md transition-transform hover:scale-105 ${getRadiusClass('btn')}`}
                style={{ backgroundColor: customization.primaryColor }}
              >
                {customization.ctaText} &rarr;
              </button>
              <button
                onClick={() => setDrawerOpen(true)}
                className={`border px-6 py-3 text-xs font-bold transition-colors ${getRadiusClass('btn')} ${
                  customization.themeMode === 'light'
                    ? 'border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100'
                    : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                }`}
              >
                Customize Colors
              </button>
            </div>
          </div>

          <div className={`overflow-hidden shadow-xl border border-slate-200/50 ${getRadiusClass('card')}`}>
            <img
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80"
              alt="Nexora Corporate Building"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Interactive Quote Estimator Widget */}
        <section
          className={`py-12 px-8 border-y ${
            customization.themeMode === 'light'
              ? 'bg-slate-50 border-slate-100'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div
            className={`max-w-3xl mx-auto p-6 border shadow-sm space-y-5 ${getRadiusClass('card')} ${
              customization.themeMode === 'light'
                ? 'bg-white border-slate-200'
                : 'bg-slate-950 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 flex items-center justify-center ${getRadiusClass('input')}`}
                style={{
                  backgroundColor: `${customization.primaryColor}20`,
                  color: customization.primaryColor
                }}
              >
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">Instant Scope & Budget Estimator</h3>
                <p className="text-xs text-slate-500">
                  Calculate instant estimate and turnaround for {customization.brandName}.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-semibold">
                <span>Number of Custom Pages: {estimatedPages} pages</span>
                <span className="font-mono font-bold" style={{ color: customization.primaryColor }}>
                  ₹{(estimatedPages * 3500).toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={estimatedPages}
                onChange={(e) => setEstimatedPages(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: customization.primaryColor }}
              />

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="ecom-check"
                  checked={needsEcommerce}
                  onChange={(e) => setNeedsEcommerce(e.target.checked)}
                  className="rounded w-4 h-4 cursor-pointer"
                  style={{ accentColor: customization.primaryColor }}
                />
                <label htmlFor="ecom-check" className="text-xs font-medium cursor-pointer">
                  Include Integrated Payment Gateway & Cart (+₹15,000)
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 block">Estimated Project Investment:</span>
                <span className="text-2xl font-black font-mono">
                  ₹{calculatedQuote.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-emerald-500 block font-semibold">
                  Estimated Timeline: {estimatedPages + 4} - {estimatedPages + 7} Business Days
                </span>
              </div>
              <button
                onClick={() => onUseDesign(template, customization)}
                className={`text-white px-6 py-2.5 font-bold text-xs shadow-md transition-transform hover:scale-105 ${getRadiusClass('btn')}`}
                style={{ backgroundColor: customization.primaryColor }}
              >
                Proceed With This Estimate &rarr;
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

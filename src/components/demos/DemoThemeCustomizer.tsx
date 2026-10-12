import React, { useState } from 'react';
import {
  Palette,
  Sliders,
  Type,
  Maximize2,
  RefreshCw,
  Check,
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Sun,
  Moon,
  Layers,
  Clock,
  DollarSign,
  CheckCircle2,
  Settings,
  Store,
  Smartphone,
  Eye
} from 'lucide-react';
import { TemplateItem } from '../../types';

export interface ThemeCustomizerState {
  brandName: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  paletteId: string;
  fontFamily: 'sans' | 'serif' | 'mono' | 'rounded';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  themeMode: 'light' | 'dark' | 'dim';
  ctaText: string;
  showPromoBanner: boolean;
  showBadges: boolean;
  showStats: boolean;
}

export interface ColorPalettePreset {
  id: string;
  name: string;
  primary: string;
  accent: string;
  badge: string;
}

export const COLOR_PALETTES: ColorPalettePreset[] = [
  { id: 'orange', name: 'Sunset Flame', primary: '#F95700', accent: '#FB923C', badge: 'High Energy' },
  { id: 'blue', name: 'Electric Blue', primary: '#2563EB', accent: '#38BDF8', badge: 'Corporate Tech' },
  { id: 'emerald', name: 'Emerald Growth', primary: '#059669', accent: '#34D399', badge: 'Fintech & Health' },
  { id: 'purple', name: 'Cyber Violet', primary: '#7C3AED', accent: '#C084FC', badge: 'Creative SaaS' },
  { id: 'crimson', name: 'Crimson Luxe', primary: '#E11D48', accent: '#FB7185', badge: 'Luxury & Retail' },
  { id: 'gold', name: 'Amber Gold', primary: '#D97706', accent: '#FBBF24', badge: 'Hospitality & Food' },
  { id: 'teal', name: 'Ocean Teal', primary: '#0D9488', accent: '#2DD4BF', badge: 'Medical & Clean' },
  { id: 'navy', name: 'Royal Navy', primary: '#1E3A8A', accent: '#F59E0B', badge: 'Enterprise Law' },
  { id: 'slate', name: 'Minimal Slate', primary: '#0F172A', accent: '#64748B', badge: 'Monochrome Luxe' },
  { id: 'rose', name: 'Neon Rose', primary: '#DB2777', accent: '#F472B6', badge: 'Modern Brand' }
];

export const useThemeCustomizer = (template: TemplateItem, defaultOverrides?: Partial<ThemeCustomizerState>) => {
  // Generate intelligent default brand name based on template
  const defaultBrand = defaultOverrides?.brandName || 
    (template.name.toLowerCase().includes('food') ? 'FoodSprint' :
     template.name.toLowerCase().includes('fitness') ? 'FitTrack Pro' :
     template.name.toLowerCase().includes('ecommerce') || template.name.toLowerCase().includes('store') ? 'ShopSphere' :
     template.name.toLowerCase().includes('admin') ? 'Nexus Dashboard' :
     template.name.toLowerCase().includes('booking') ? 'Schedulr Pro' :
     template.name.toLowerCase().includes('student') ? 'EduPulse Academy' :
     template.name.toLowerCase().includes('corporate') ? 'Nexora Global' : 'Apex Dynamic');

  const defaultTagline = defaultOverrides?.tagline ||
    (template.name.toLowerCase().includes('food') ? 'Fast, delicious food delivered straight to your doorstep.' :
     template.name.toLowerCase().includes('fitness') ? 'Transform your body with smart workout guidance.' :
     template.name.toLowerCase().includes('ecommerce') ? 'Curated premium collections for modern lifestyles.' :
     template.name.toLowerCase().includes('admin') ? 'Real-time analytics and intelligent operations control.' :
     template.name.toLowerCase().includes('booking') ? 'Effortless automated appointment scheduling 24/7.' :
     template.name.toLowerCase().includes('student') ? 'Comprehensive campus and student management platform.' :
     'Empowering modern brands with scalable digital architecture.');

  const [state, setState] = useState<ThemeCustomizerState>({
    brandName: defaultBrand,
    tagline: defaultTagline,
    primaryColor: defaultOverrides?.primaryColor || '#F95700',
    accentColor: defaultOverrides?.accentColor || '#FB923C',
    paletteId: defaultOverrides?.paletteId || 'orange',
    fontFamily: defaultOverrides?.fontFamily || 'sans',
    borderRadius: defaultOverrides?.borderRadius || 'md',
    themeMode: defaultOverrides?.themeMode || 'light',
    ctaText: defaultOverrides?.ctaText || 'Get Started Now',
    showPromoBanner: defaultOverrides?.showPromoBanner !== undefined ? defaultOverrides.showPromoBanner : true,
    showBadges: defaultOverrides?.showBadges !== undefined ? defaultOverrides.showBadges : true,
    showStats: defaultOverrides?.showStats !== undefined ? defaultOverrides.showStats : true
  });

  const [drawerOpen, setDrawerOpen] = useState(false);

  const applyPalette = (palette: ColorPalettePreset) => {
    setState((prev) => ({
      ...prev,
      paletteId: palette.id,
      primaryColor: palette.primary,
      accentColor: palette.accent
    }));
  };

  const updateField = <K extends keyof ThemeCustomizerState>(field: K, value: ThemeCustomizerState[K]) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  const resetToDefault = () => {
    setState({
      brandName: defaultBrand,
      tagline: defaultTagline,
      primaryColor: '#F95700',
      accentColor: '#FB923C',
      paletteId: 'orange',
      fontFamily: 'sans',
      borderRadius: 'md',
      themeMode: 'light',
      ctaText: 'Get Started Now',
      showPromoBanner: true,
      showBadges: true,
      showStats: true
    });
  };

  // Helper classes and styles
  const getRadiusClass = (type: 'btn' | 'card' | 'input' = 'btn') => {
    switch (state.borderRadius) {
      case 'none': return 'rounded-none';
      case 'sm': return 'rounded-md';
      case 'md': return type === 'card' ? 'rounded-2xl' : 'rounded-xl';
      case 'lg': return type === 'card' ? 'rounded-3xl' : 'rounded-2xl';
      case 'full': return type === 'card' ? 'rounded-3xl' : 'rounded-full';
      default: return 'rounded-xl';
    }
  };

  const getFontFamilyClass = () => {
    switch (state.fontFamily) {
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      case 'rounded': return 'font-sans tracking-wide';
      case 'sans':
      default: return 'font-sans';
    }
  };

  // Estimated build quote & timeline based on customizations
  const calculateEstimate = () => {
    let basePrice = 18000;
    let baseDays = 8;
    if (template.previewType === 'mobile-app') {
      basePrice = 32000;
      baseDays = 14;
    } else if (template.previewType === 'ecommerce') {
      basePrice = 28000;
      baseDays = 12;
    } else if (template.previewType === 'admin-panel' || template.previewType === 'student' || template.previewType === 'booking') {
      basePrice = 25000;
      baseDays = 10;
    }

    if (state.themeMode === 'dark') {
      basePrice += 2000;
      baseDays += 1;
    }
    return {
      price: `₹${basePrice.toLocaleString('en-IN')}`,
      days: `${baseDays} - ${baseDays + 4} business days`,
      featuresCount: (state.showStats ? 1 : 0) + (state.showBadges ? 1 : 0) + (state.showPromoBanner ? 1 : 0) + 5
    };
  };

  return {
    customization: state,
    drawerOpen,
    setDrawerOpen,
    applyPalette,
    updateField,
    resetToDefault,
    getRadiusClass,
    getFontFamilyClass,
    calculateEstimate
  };
};

interface DemoControlBarProps {
  template: TemplateItem;
  customization: ThemeCustomizerState;
  onBack: () => void;
  onOpenCustomizer: () => void;
  onApplyPalette: (palette: ColorPalettePreset) => void;
  onUseDesign: (template: TemplateItem, customData?: ThemeCustomizerState) => void;
  titleSuffix?: string;
  platformToggle?: React.ReactNode;
}

export const DemoControlBar: React.FC<DemoControlBarProps> = ({
  template,
  customization,
  onBack,
  onOpenCustomizer,
  onApplyPalette,
  onUseDesign,
  titleSuffix,
  platformToggle
}) => {
  return (
    <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
      
      {/* Left: Back button & Template info */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all hover:scale-[1.02]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-xs sm:text-sm tracking-tight truncate max-w-[140px] sm:max-w-[220px]">
                {customization.brandName || template.name}
              </span>
              <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                {template.templateCode}
              </span>
              {titleSuffix && (
                <span className="hidden md:inline-block text-[11px] text-slate-400 font-mono">
                  {titleSuffix}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
              {template.serviceCategory}
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Quick Color Swatches Bar */}
      <div className="flex items-center gap-2">
        {platformToggle}

        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:inline mr-1">
            Palette:
          </span>
          <div className="flex items-center gap-1.5">
            {COLOR_PALETTES.slice(0, 7).map((p) => {
              const isActive = customization.primaryColor.toLowerCase() === p.primary.toLowerCase();
              return (
                <button
                  key={p.id}
                  onClick={() => onApplyPalette(p)}
                  title={`${p.name} (${p.badge})`}
                  className={`w-5 h-5 rounded-full transition-all flex items-center justify-center ${
                    isActive
                      ? 'ring-2 ring-white scale-110 shadow-sm'
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: p.primary }}
                >
                  {isActive && <Check className="w-3 h-3 text-white drop-shadow" />}
                </button>
              );
            })}
          </div>

          {/* Quick Custom Color Picker */}
          <label
            title="Choose Any Custom Color"
            className="w-5 h-5 rounded-full border border-dashed border-slate-500 flex items-center justify-center cursor-pointer hover:border-white transition-colors relative overflow-hidden"
            style={{ backgroundColor: customization.primaryColor }}
          >
            <input
              type="color"
              value={customization.primaryColor}
              onChange={(e) => {
                onApplyPalette({
                  id: 'custom',
                  name: 'Custom Pick',
                  primary: e.target.value,
                  accent: customization.accentColor,
                  badge: 'Custom'
                });
              }}
              className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
            />
          </label>
        </div>
      </div>

      {/* Right: Customize Theme Button & Use This Design CTA */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCustomizer}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 hover:border-slate-500 transition-all shadow-sm group"
        >
          <div
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: customization.primaryColor }}
          />
          <Sliders className="w-3.5 h-3.5 text-orange-400 group-hover:rotate-45 transition-transform" />
          <span>Customize Theme</span>
        </button>

        <button
          onClick={() => onUseDesign(template, customization)}
          className="flex items-center gap-1.5 text-white px-4 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: customization.primaryColor }}
        >
          <span>Use Design</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};

interface DemoCustomizerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  template: TemplateItem;
  customization: ThemeCustomizerState;
  onApplyPalette: (palette: ColorPalettePreset) => void;
  onUpdateField: <K extends keyof ThemeCustomizerState>(field: K, value: ThemeCustomizerState[K]) => void;
  onReset: () => void;
  onUseDesign: (template: TemplateItem, customData?: ThemeCustomizerState) => void;
}

export const DemoCustomizerDrawer: React.FC<DemoCustomizerDrawerProps> = ({
  isOpen,
  onClose,
  template,
  customization,
  onApplyPalette,
  onUpdateField,
  onReset,
  onUseDesign
}) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'brand' | 'style' | 'estimate'>('colors');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full z-10 text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: customization.primaryColor }}
            >
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>Customize Theme & App</span>
                <span className="text-[10px] font-mono bg-slate-800 text-orange-400 px-1.5 py-0.5 rounded font-bold">
                  LIVE
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Change colors, brand, and layout with instant preview
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Customizer Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-3 pt-2 gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-all ${
              activeTab === 'colors'
                ? 'bg-slate-900 text-white border-t-2'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
            style={{ borderTopColor: activeTab === 'colors' ? customization.primaryColor : 'transparent' }}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Colors</span>
          </button>

          <button
            onClick={() => setActiveTab('brand')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-all ${
              activeTab === 'brand'
                ? 'bg-slate-900 text-white border-t-2'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
            style={{ borderTopColor: activeTab === 'brand' ? customization.primaryColor : 'transparent' }}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Brand</span>
          </button>

          <button
            onClick={() => setActiveTab('style')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-all ${
              activeTab === 'style'
                ? 'bg-slate-900 text-white border-t-2'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
            style={{ borderTopColor: activeTab === 'style' ? customization.primaryColor : 'transparent' }}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Style</span>
          </button>

          <button
            onClick={() => setActiveTab('estimate')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-all ${
              activeTab === 'estimate'
                ? 'bg-slate-900 text-white border-t-2'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
            style={{ borderTopColor: activeTab === 'estimate' ? customization.primaryColor : 'transparent' }}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Quote & Days</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          
          {/* TAB 1: COLORS */}
          {activeTab === 'colors' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Preset Palettes */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                  Curated Brand Palettes (1-Click Apply)
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {COLOR_PALETTES.map((p) => {
                    const isSelected = customization.primaryColor.toLowerCase() === p.primary.toLowerCase();
                    return (
                      <button
                        key={p.id}
                        onClick={() => onApplyPalette(p)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-slate-800 border-white shadow-md scale-[1.02]'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="truncate">{p.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">{p.badge}</span>
                        </div>
                        <div className="flex items-center -space-x-1 shrink-0 ml-2">
                          <span
                            className="w-4 h-4 rounded-full border border-slate-900 shadow-xs"
                            style={{ backgroundColor: p.primary }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-slate-900 shadow-xs"
                            style={{ backgroundColor: p.accent }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Hex Color Pickers */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-orange-400" />
                  <span>Custom Color Specification</span>
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Primary Brand Color
                    </label>
                    <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-700">
                      <input
                        type="color"
                        value={customization.primaryColor}
                        onChange={(e) => onUpdateField('primaryColor', e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={customization.primaryColor}
                        onChange={(e) => onUpdateField('primaryColor', e.target.value)}
                        className="w-full bg-transparent text-xs font-mono font-bold text-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Accent / Highlight
                    </label>
                    <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-700">
                      <input
                        type="color"
                        value={customization.accentColor}
                        onChange={(e) => onUpdateField('accentColor', e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={customization.accentColor}
                        onChange={(e) => onUpdateField('accentColor', e.target.value)}
                        className="w-full bg-transparent text-xs font-mono font-bold text-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Surface Mode Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Canvas Background Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['light', 'dim', 'dark'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => onUpdateField('themeMode', mode)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize flex items-center justify-center gap-1.5 transition-all ${
                        customization.themeMode === mode
                          ? 'bg-slate-800 text-white border-orange-500 shadow-sm'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {mode === 'light' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                      <span>{mode}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: BRAND & CONTENT */}
          {activeTab === 'brand' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Business / Application Name
                </label>
                <input
                  type="text"
                  value={customization.brandName}
                  onChange={(e) => onUpdateField('brandName', e.target.value)}
                  placeholder="e.g. Medico Care, UrbanDine, TechScale"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden font-semibold transition-colors"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Replaces the logo and title across the live sample instantly.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Hero Tagline / Heading
                </label>
                <textarea
                  rows={2}
                  value={customization.tagline}
                  onChange={(e) => onUpdateField('tagline', e.target.value)}
                  placeholder="Describe your value proposition"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Main Button / Call-To-Action Text
                </label>
                <input
                  type="text"
                  value={customization.ctaText}
                  onChange={(e) => onUpdateField('ctaText', e.target.value)}
                  placeholder="e.g. Book Consultation, Shop Now, Download App"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden transition-colors"
                />
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Personalized Requirement Context</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  When you submit a project request, your custom branding and tailored messaging will automatically be attached to the scope!
                </p>
              </div>

            </div>
          )}

          {/* TAB 3: STYLE & LAYOUT */}
          {activeTab === 'style' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Typography */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Typography Font Family
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'sans', label: 'Modern Sans', preview: 'Inter / Clean System', fontClass: 'font-sans' },
                    { id: 'serif', label: 'Editorial Serif', preview: 'Luxury / Corporate', fontClass: 'font-serif' },
                    { id: 'mono', label: 'Tech Mono', preview: 'Developer / Metrics', fontClass: 'font-mono' },
                    { id: 'rounded', label: 'Modern Rounded', preview: 'Friendly / Consumer', fontClass: 'font-sans tracking-wide' }
                  ].map((font) => (
                    <button
                      key={font.id}
                      onClick={() => onUpdateField('fontFamily', font.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        customization.fontFamily === font.id
                          ? 'bg-slate-800 border-white text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className={`text-xs font-bold ${font.fontClass}`}>{font.label}</div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{font.preview}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Corner Radius */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Border Radius / Corner Shape
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: 'none', label: 'Sharp', radius: 'rounded-none' },
                    { id: 'sm', label: 'Subtle', radius: 'rounded-md' },
                    { id: 'md', label: 'Curved', radius: 'rounded-xl' },
                    { id: 'lg', label: 'Soft', radius: 'rounded-2xl' },
                    { id: 'full', label: 'Pill', radius: 'rounded-full' }
                  ].map((rad) => (
                    <button
                      key={rad.id}
                      onClick={() => onUpdateField('borderRadius', rad.id as any)}
                      className={`p-2 border text-center transition-all ${rad.radius} ${
                        customization.borderRadius === rad.id
                          ? 'bg-slate-800 border-white text-white font-bold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white text-xs'
                      }`}
                    >
                      <span className="text-[11px] block">{rad.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Module Toggles */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white block">
                  Toggle Sample Modules & Sections
                </span>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-slate-300">Show Top Promo & Notification Banner</span>
                  <input
                    type="checkbox"
                    checked={customization.showPromoBanner}
                    onChange={(e) => onUpdateField('showPromoBanner', e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-slate-300">Show Trust Badges & Guarantee Pills</span>
                  <input
                    type="checkbox"
                    checked={customization.showBadges}
                    onChange={(e) => onUpdateField('showBadges', e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-slate-300">Show Live Metrics & Counter Cards</span>
                  <input
                    type="checkbox"
                    checked={customization.showStats}
                    onChange={(e) => onUpdateField('showStats', e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>

            </div>
          )}

          {/* TAB 4: ESTIMATE & TIMELINE */}
          {activeTab === 'estimate' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                    Build Cost & Timeline
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                    Transparent Pricing
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Estimated Budget</span>
                    <div className="text-xl font-black font-mono text-white mt-1">
                      {template.previewType === 'mobile-app'
                        ? '₹32,000 – ₹45,000'
                        : template.previewType === 'ecommerce'
                        ? '₹24,000 – ₹38,000'
                        : '₹14,000 – ₹26,000'}
                    </div>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Fixed milestone quotes</span>
                  </div>

                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Build & Launch Time</span>
                    <div className="text-xl font-black font-mono text-white mt-1">
                      {template.previewType === 'mobile-app' ? '12 – 16 Days' : '7 – 12 Days'}
                    </div>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Full staging QA preview</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="text-[11px] font-bold text-slate-300">What's Included:</div>
                  <div className="space-y-1.5 text-slate-400 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Custom color scheme ({customization.primaryColor})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Branded logo & headline: "{customization.brandName}"</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Responsive mobile & desktop design with source code</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Fast turnaround with 30-day post launch bug-free warranty</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                💡 Clicking <strong>"Use My Custom Design"</strong> transfers your chosen colors, brand name, and requirements directly to our development team.
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/95 flex items-center justify-between gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onUseDesign(template, customization);
            }}
            className="flex-1 flex items-center justify-center gap-2 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all hover:scale-[1.02] active:scale-95"
            style={{ backgroundColor: customization.primaryColor }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Use My Custom Design</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};

export const FloatingCustomizeButton: React.FC<{
  onOpen: () => void;
  primaryColor: string;
}> = ({ onOpen, primaryColor }) => {
  return (
    <button
      onClick={onOpen}
      title="Customize Theme & App"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 text-white px-4 py-3 rounded-full font-bold text-xs shadow-2xl transition-all hover:scale-105 active:scale-95 border border-white/20 backdrop-blur-md"
      style={{ backgroundColor: primaryColor }}
    >
      <Sliders className="w-4 h-4 animate-spin-slow" />
      <span>Customize Theme</span>
      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
    </button>
  );
};

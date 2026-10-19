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
  Eye,
  Copy,
  Shuffle,
  ShieldCheck,
  CheckSquare,
  Square
} from 'lucide-react';
import { TemplateItem } from '../../types';

export interface ColorPalettePreset {
  id: string;
  name: string;
  categoryTag: string;
  badge: string;
  primary: string;
  accent: string;
  secondary: string;
  surfaceTint: string;
  borderTint: string;
  gradient: string;
  fontFamily: 'sans' | 'serif' | 'mono' | 'rounded' | 'display';
  fontStyleName: string;
  fontSizeScale: 'compact' | 'balanced' | 'prominent' | 'editorial';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  cardVariant: 'glass' | 'solid' | 'bordered' | 'elevated';
  buttonVariant: 'gradient' | 'solid-glow' | 'outline-bold' | 'minimal-pill';
  shadowVariant: 'subtle' | 'crisp' | 'neon-glow' | 'deep-ambient';
  themeMode: 'light' | 'dark' | 'dim';
  contrastText: string;
}

export interface ThemeCustomizerState {
  brandName: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  secondaryColor: string;
  surfaceTint: string;
  borderTint: string;
  paletteId: string;
  fontFamily: 'sans' | 'serif' | 'mono' | 'rounded' | 'display';
  fontStyleName: string;
  fontSizeScale: 'compact' | 'balanced' | 'prominent' | 'editorial';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  cardVariant: 'glass' | 'solid' | 'bordered' | 'elevated';
  buttonVariant: 'gradient' | 'solid-glow' | 'outline-bold' | 'minimal-pill';
  shadowVariant: 'subtle' | 'crisp' | 'neon-glow' | 'deep-ambient';
  themeMode: 'light' | 'dark' | 'dim';
  ctaText: string;
  showPromoBanner: boolean;
  showBadges: boolean;
  showStats: boolean;
}

export const COLOR_PALETTES: ColorPalettePreset[] = [
  {
    id: 'crimson',
    name: 'Crimson Luxe',
    categoryTag: 'Luxury & Fashion Retail',
    badge: 'High Fashion & E-Com',
    primary: '#E11D48',
    accent: '#FB7185',
    secondary: '#881337',
    surfaceTint: 'rgba(225, 29, 72, 0.08)',
    borderTint: 'rgba(225, 29, 72, 0.28)',
    gradient: 'from-rose-600 via-rose-500 to-pink-500',
    fontFamily: 'serif',
    fontStyleName: 'Playfair Luxe Editorial Serif',
    fontSizeScale: 'editorial',
    borderRadius: 'lg',
    cardVariant: 'elevated',
    buttonVariant: 'solid-glow',
    shadowVariant: 'deep-ambient',
    themeMode: 'light',
    contrastText: '#FFFFFF'
  },
  {
    id: 'navy',
    name: 'Royal Sapphire',
    categoryTag: 'Enterprise & Legal',
    badge: 'Corporate Authority',
    primary: '#1E3A8A',
    accent: '#F59E0B',
    secondary: '#0F172A',
    surfaceTint: 'rgba(30, 58, 138, 0.08)',
    borderTint: 'rgba(30, 58, 138, 0.28)',
    gradient: 'from-blue-900 via-indigo-900 to-slate-900',
    fontFamily: 'sans',
    fontStyleName: 'Plus Jakarta Executive Sans',
    fontSizeScale: 'balanced',
    borderRadius: 'sm',
    cardVariant: 'bordered',
    buttonVariant: 'gradient',
    shadowVariant: 'crisp',
    themeMode: 'dark',
    contrastText: '#FFFFFF'
  },
  {
    id: 'purple',
    name: 'Cyber Violet',
    categoryTag: 'AI SaaS & DevTools',
    badge: 'Modern SaaS & Ops',
    primary: '#7C3AED',
    accent: '#06B6D4',
    secondary: '#4C1D95',
    surfaceTint: 'rgba(124, 58, 237, 0.09)',
    borderTint: 'rgba(124, 58, 237, 0.32)',
    gradient: 'from-purple-600 via-violet-600 to-cyan-500',
    fontFamily: 'mono',
    fontStyleName: 'JetBrains Tech Telemetry Mono',
    fontSizeScale: 'compact',
    borderRadius: 'md',
    cardVariant: 'glass',
    buttonVariant: 'solid-glow',
    shadowVariant: 'neon-glow',
    themeMode: 'dark',
    contrastText: '#FFFFFF'
  },
  {
    id: 'teal',
    name: 'Oceanic Mint',
    categoryTag: 'Medical & Wellness',
    badge: 'Healthcare & Booking',
    primary: '#0D9488',
    accent: '#2DD4BF',
    secondary: '#134E4A',
    surfaceTint: 'rgba(13, 148, 136, 0.08)',
    borderTint: 'rgba(13, 148, 136, 0.28)',
    gradient: 'from-teal-600 via-teal-500 to-cyan-400',
    fontFamily: 'rounded',
    fontStyleName: 'Outfit Soft Rounded',
    fontSizeScale: 'balanced',
    borderRadius: 'lg',
    cardVariant: 'glass',
    buttonVariant: 'solid-glow',
    shadowVariant: 'subtle',
    themeMode: 'light',
    contrastText: '#FFFFFF'
  },
  {
    id: 'emerald',
    name: 'Emerald Growth',
    categoryTag: 'Fintech & Fitness',
    badge: 'Athletic & High Growth',
    primary: '#059669',
    accent: '#84CC16',
    secondary: '#064E3B',
    surfaceTint: 'rgba(5, 150, 105, 0.08)',
    borderTint: 'rgba(5, 150, 105, 0.28)',
    gradient: 'from-emerald-600 via-teal-500 to-lime-400',
    fontFamily: 'display',
    fontStyleName: 'Space Grotesk Kinetic Display',
    fontSizeScale: 'prominent',
    borderRadius: 'md',
    cardVariant: 'glass',
    buttonVariant: 'solid-glow',
    shadowVariant: 'neon-glow',
    themeMode: 'dark',
    contrastText: '#FFFFFF'
  },
  {
    id: 'gold',
    name: 'Amber Heritage',
    categoryTag: 'Academics & Dining',
    badge: 'Education & Hospitality',
    primary: '#D97706',
    accent: '#FBBF24',
    secondary: '#78350F',
    surfaceTint: 'rgba(217, 119, 6, 0.08)',
    borderTint: 'rgba(217, 119, 6, 0.28)',
    gradient: 'from-amber-600 via-amber-500 to-yellow-400',
    fontFamily: 'serif',
    fontStyleName: 'Classic Academic Serif',
    fontSizeScale: 'prominent',
    borderRadius: 'md',
    cardVariant: 'bordered',
    buttonVariant: 'gradient',
    shadowVariant: 'subtle',
    themeMode: 'light',
    contrastText: '#FFFFFF'
  },
  {
    id: 'orange',
    name: 'Sunset Ember',
    categoryTag: 'Agency & Food Sprint',
    badge: 'High Energy Impact',
    primary: '#F95700',
    accent: '#FB923C',
    secondary: '#7C2D12',
    surfaceTint: 'rgba(249, 87, 0, 0.08)',
    borderTint: 'rgba(249, 87, 0, 0.28)',
    gradient: 'from-orange-500 via-amber-500 to-red-500',
    fontFamily: 'display',
    fontStyleName: 'Space Grotesk High Impact',
    fontSizeScale: 'prominent',
    borderRadius: 'md',
    cardVariant: 'elevated',
    buttonVariant: 'gradient',
    shadowVariant: 'deep-ambient',
    themeMode: 'light',
    contrastText: '#FFFFFF'
  },
  {
    id: 'blue',
    name: 'Electric Cobalt',
    categoryTag: 'Enterprise Tech & Cloud',
    badge: 'Cloud & Infrastructure',
    primary: '#2563EB',
    accent: '#38BDF8',
    secondary: '#1E3A8A',
    surfaceTint: 'rgba(37, 99, 235, 0.08)',
    borderTint: 'rgba(37, 99, 235, 0.28)',
    gradient: 'from-blue-600 via-indigo-600 to-sky-400',
    fontFamily: 'sans',
    fontStyleName: 'Plus Jakarta Clean Sans',
    fontSizeScale: 'balanced',
    borderRadius: 'sm',
    cardVariant: 'bordered',
    buttonVariant: 'solid-glow',
    shadowVariant: 'crisp',
    themeMode: 'dark',
    contrastText: '#FFFFFF'
  },
  {
    id: 'obsidian',
    name: 'Obsidian Monolith',
    categoryTag: 'Minimalist Architecture',
    badge: 'Monochrome Luxe',
    primary: '#0F172A',
    accent: '#94A3B8',
    secondary: '#020617',
    surfaceTint: 'rgba(255, 255, 255, 0.04)',
    borderTint: 'rgba(255, 255, 255, 0.16)',
    gradient: 'from-slate-900 via-slate-800 to-zinc-900',
    fontFamily: 'display',
    fontStyleName: 'Architectural Minimal Display',
    fontSizeScale: 'editorial',
    borderRadius: 'none',
    cardVariant: 'bordered',
    buttonVariant: 'outline-bold',
    shadowVariant: 'crisp',
    themeMode: 'dark',
    contrastText: '#FFFFFF'
  },
  {
    id: 'rose',
    name: 'Neon Cyber Rose',
    categoryTag: 'Gen-Z Social & Creator',
    badge: 'Vibrant Lifestyle',
    primary: '#DB2777',
    accent: '#F472B6',
    secondary: '#70073B',
    surfaceTint: 'rgba(219, 39, 119, 0.08)',
    borderTint: 'rgba(219, 39, 119, 0.28)',
    gradient: 'from-pink-600 via-rose-500 to-purple-500',
    fontFamily: 'rounded',
    fontStyleName: 'Outfit Friendly Rounded',
    fontSizeScale: 'prominent',
    borderRadius: 'full',
    cardVariant: 'glass',
    buttonVariant: 'minimal-pill',
    shadowVariant: 'neon-glow',
    themeMode: 'light',
    contrastText: '#FFFFFF'
  }
];

// Determine the signature default topography for any template
export const getTemplateSignaturePreset = (template: TemplateItem): ColorPalettePreset => {
  const pType = template.previewType;
  const name = template.name.toLowerCase();
  const cat = (template.serviceCategory || '').toLowerCase();
  const ind = (template.industryTag || '').toLowerCase();
  const tags = (template.tags || []).join(' ').toLowerCase();
  const text = `${name} ${cat} ${ind} ${tags}`;

  if (pType === 'ecommerce' || text.includes('e-com') || text.includes('shop') || text.includes('fashion') || text.includes('store') || text.includes('retail')) {
    return COLOR_PALETTES.find((p) => p.id === 'crimson') || COLOR_PALETTES[0];
  }
  if (pType === 'admin-panel' || text.includes('admin') || text.includes('dashboard') || text.includes('saas') || text.includes('ops') || text.includes('nexus')) {
    return COLOR_PALETTES.find((p) => p.id === 'purple') || COLOR_PALETTES[2];
  }
  if (pType === 'booking' || text.includes('book') || text.includes('medic') || text.includes('clinic') || text.includes('hospital') || text.includes('doctor')) {
    return COLOR_PALETTES.find((p) => p.id === 'teal') || COLOR_PALETTES[3];
  }
  if (pType === 'student' || text.includes('student') || text.includes('school') || text.includes('academy') || text.includes('campus') || text.includes('edu')) {
    return COLOR_PALETTES.find((p) => p.id === 'gold') || COLOR_PALETTES[5];
  }
  if (pType === 'corporate' || text.includes('corp') || text.includes('law') || text.includes('finance') || text.includes('nexora')) {
    return COLOR_PALETTES.find((p) => p.id === 'navy') || COLOR_PALETTES[1];
  }
  if (pType === 'mobile-app') {
    if (text.includes('fit') || text.includes('workout') || text.includes('gym')) {
      return COLOR_PALETTES.find((p) => p.id === 'emerald') || COLOR_PALETTES[4];
    }
    if (text.includes('food') || text.includes('dine') || text.includes('delivery')) {
      return COLOR_PALETTES.find((p) => p.id === 'orange') || COLOR_PALETTES[6];
    }
    if (text.includes('shop') || text.includes('cloth') || text.includes('shoe')) {
      return COLOR_PALETTES.find((p) => p.id === 'crimson') || COLOR_PALETTES[0];
    }
    return template.platform === 'ios'
      ? (COLOR_PALETTES.find((p) => p.id === 'blue') || COLOR_PALETTES[7])
      : (COLOR_PALETTES.find((p) => p.id === 'emerald') || COLOR_PALETTES[4]);
  }
  if (text.includes('agency') || text.includes('event') || text.includes('lead') || text.includes('summit')) {
    return COLOR_PALETTES.find((p) => p.id === 'orange') || COLOR_PALETTES[6];
  }
  return COLOR_PALETTES.find((p) => p.id === 'blue') || COLOR_PALETTES[7];
};

export const useThemeCustomizer = (template: TemplateItem, defaultOverrides?: Partial<ThemeCustomizerState>) => {
  const signaturePreset = getTemplateSignaturePreset(template);

  // Generate intelligent default brand name based on template
  const defaultBrand = defaultOverrides?.brandName || 
    (template.name.toLowerCase().includes('food') ? 'FoodSprint Prime' :
     template.name.toLowerCase().includes('fitness') ? 'FitPulse Athletic' :
     template.name.toLowerCase().includes('ecommerce') || template.name.toLowerCase().includes('store') ? 'Velvet & Co. Luxe' :
     template.name.toLowerCase().includes('admin') ? 'Nexus Operations Hub' :
     template.name.toLowerCase().includes('booking') ? 'Schedulr Healthcare' :
     template.name.toLowerCase().includes('student') ? 'EduPulse Global Academy' :
     template.name.toLowerCase().includes('corporate') ? 'Nexora Enterprise Capital' : 
     template.name.replace(/\s*\(Android\s*App\)|\s*\(iOS\s*App\)/gi, '').trim() || 'Codemaniac Enterprise');

  const defaultTagline = defaultOverrides?.tagline ||
    (template.name.toLowerCase().includes('food') ? 'Artisan chef-curated meals & quick delivery straight to you.' :
     template.name.toLowerCase().includes('fitness') ? 'Push athletic boundaries with live heart rate telemetry & smart workouts.' :
     template.name.toLowerCase().includes('ecommerce') ? 'Couture collections, high-fashion apparel & bespoke craftsmanship.' :
     template.name.toLowerCase().includes('admin') ? 'Real-time telemetry, automated pipelines & cross-region observability.' :
     template.name.toLowerCase().includes('booking') ? 'Seamless 24/7 calendar booking, verified specialists & SMS reminders.' :
     template.name.toLowerCase().includes('student') ? 'Comprehensive institutional campus portal, real-time grades & attendance.' :
     'Architecting high-scale digital platforms for forward-thinking enterprises.');

  const [state, setState] = useState<ThemeCustomizerState>({
    brandName: defaultBrand,
    tagline: defaultTagline,
    primaryColor: defaultOverrides?.primaryColor || signaturePreset.primary,
    accentColor: defaultOverrides?.accentColor || signaturePreset.accent,
    secondaryColor: defaultOverrides?.secondaryColor || signaturePreset.secondary,
    surfaceTint: defaultOverrides?.surfaceTint || signaturePreset.surfaceTint,
    borderTint: defaultOverrides?.borderTint || signaturePreset.borderTint,
    paletteId: defaultOverrides?.paletteId || signaturePreset.id,
    fontFamily: defaultOverrides?.fontFamily || signaturePreset.fontFamily,
    fontStyleName: defaultOverrides?.fontStyleName || signaturePreset.fontStyleName,
    fontSizeScale: defaultOverrides?.fontSizeScale || signaturePreset.fontSizeScale,
    borderRadius: defaultOverrides?.borderRadius || signaturePreset.borderRadius,
    cardVariant: defaultOverrides?.cardVariant || signaturePreset.cardVariant,
    buttonVariant: defaultOverrides?.buttonVariant || signaturePreset.buttonVariant,
    shadowVariant: defaultOverrides?.shadowVariant || signaturePreset.shadowVariant,
    themeMode: defaultOverrides?.themeMode || signaturePreset.themeMode,
    ctaText: defaultOverrides?.ctaText || 'Get Started Now',
    showPromoBanner: defaultOverrides?.showPromoBanner !== undefined ? defaultOverrides.showPromoBanner : true,
    showBadges: defaultOverrides?.showBadges !== undefined ? defaultOverrides.showBadges : true,
    showStats: defaultOverrides?.showStats !== undefined ? defaultOverrides.showStats : true
  });

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Apply a full design topography preset (changes colors, typography, scale, geometry & variants together)
  const applyPalette = (palette: ColorPalettePreset) => {
    setState((prev) => ({
      ...prev,
      paletteId: palette.id,
      primaryColor: palette.primary,
      accentColor: palette.accent,
      secondaryColor: palette.secondary,
      surfaceTint: palette.surfaceTint,
      borderTint: palette.borderTint,
      fontFamily: palette.fontFamily,
      fontStyleName: palette.fontStyleName,
      fontSizeScale: palette.fontSizeScale,
      borderRadius: palette.borderRadius,
      cardVariant: palette.cardVariant,
      buttonVariant: palette.buttonVariant,
      shadowVariant: palette.shadowVariant,
      themeMode: palette.themeMode
    }));
  };

  const updateField = <K extends keyof ThemeCustomizerState>(field: K, value: ThemeCustomizerState[K]) => {
    setState((prev) => {
      const next = { ...prev, [field]: value };
      // When user updates primary color manually, recalculate harmonized surface & border tints
      if (field === 'primaryColor' && typeof value === 'string') {
        const hex = value.replace('#', '');
        if (hex.length === 6) {
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          next.surfaceTint = `rgba(${r}, ${g}, ${b}, 0.08)`;
          next.borderTint = `rgba(${r}, ${g}, ${b}, 0.28)`;
        }
      }
      return next;
    });
  };

  const randomizeTopography = () => {
    const randomIndex = Math.floor(Math.random() * COLOR_PALETTES.length);
    const chosen = COLOR_PALETTES[randomIndex];
    applyPalette(chosen);
  };

  const resetToDefault = () => {
    setState({
      brandName: defaultBrand,
      tagline: defaultTagline,
      primaryColor: signaturePreset.primary,
      accentColor: signaturePreset.accent,
      secondaryColor: signaturePreset.secondary,
      surfaceTint: signaturePreset.surfaceTint,
      borderTint: signaturePreset.borderTint,
      paletteId: signaturePreset.id,
      fontFamily: signaturePreset.fontFamily,
      fontStyleName: signaturePreset.fontStyleName,
      fontSizeScale: signaturePreset.fontSizeScale,
      borderRadius: signaturePreset.borderRadius,
      cardVariant: signaturePreset.cardVariant,
      buttonVariant: signaturePreset.buttonVariant,
      shadowVariant: signaturePreset.shadowVariant,
      themeMode: signaturePreset.themeMode,
      ctaText: 'Get Started Now',
      showPromoBanner: true,
      showBadges: true,
      showStats: true
    });
  };

  // Helper classes for Typography Topography
  const getFontFamilyClass = (target: 'all' | 'heading' | 'body' | 'mono' = 'all') => {
    if (target === 'mono') return 'font-tech-mono';
    switch (state.fontFamily) {
      case 'serif':
        return 'font-luxe-serif';
      case 'mono':
        return 'font-tech-mono';
      case 'display':
        return 'font-display-modern';
      case 'rounded':
        return 'font-rounded-soft';
      case 'sans':
      default:
        return 'font-sans-clean';
    }
  };

  // Dynamic Scale Classes for all elements
  const getFontSizeScaleClass = (slot: 'hero-title' | 'heading-xl' | 'heading-lg' | 'heading-md' | 'body' | 'caption' | 'btn' | 'badge') => {
    const scale = state.fontSizeScale;
    switch (slot) {
      case 'hero-title':
        if (scale === 'compact') return 'text-3xl sm:text-4xl font-extrabold tracking-tight';
        if (scale === 'prominent') return 'text-5xl sm:text-6xl font-black tracking-tight leading-none';
        if (scale === 'editorial') return 'text-5xl sm:text-7xl font-medium tracking-tight italic';
        return 'text-4xl sm:text-5xl font-extrabold tracking-tight'; // balanced

      case 'heading-xl':
        if (scale === 'compact') return 'text-xl sm:text-2xl font-bold tracking-tight';
        if (scale === 'prominent') return 'text-3xl sm:text-4xl font-black tracking-tight';
        if (scale === 'editorial') return 'text-3xl sm:text-4xl font-semibold italic';
        return 'text-2xl sm:text-3xl font-extrabold tracking-tight'; // balanced

      case 'heading-lg':
        if (scale === 'compact') return 'text-lg sm:text-xl font-bold';
        if (scale === 'prominent') return 'text-2xl sm:text-3xl font-black';
        if (scale === 'editorial') return 'text-2xl sm:text-3xl font-medium italic';
        return 'text-xl sm:text-2xl font-bold'; // balanced

      case 'heading-md':
        if (scale === 'compact') return 'text-base sm:text-lg font-bold';
        if (scale === 'prominent') return 'text-xl sm:text-2xl font-black';
        if (scale === 'editorial') return 'text-lg sm:text-xl font-medium';
        return 'text-lg sm:text-xl font-bold'; // balanced

      case 'body':
        if (scale === 'compact') return 'text-xs leading-relaxed';
        if (scale === 'prominent') return 'text-base leading-relaxed';
        if (scale === 'editorial') return 'text-base sm:text-lg leading-loose';
        return 'text-sm leading-relaxed'; // balanced

      case 'caption':
        if (scale === 'compact') return 'text-[10px] leading-tight';
        if (scale === 'prominent') return 'text-xs leading-normal';
        if (scale === 'editorial') return 'text-xs sm:text-sm tracking-wider uppercase';
        return 'text-[11px] leading-normal'; // balanced

      case 'btn':
        if (scale === 'compact') return 'text-xs py-1.5 px-3 font-semibold';
        if (scale === 'prominent') return 'text-sm sm:text-base py-3 px-6 font-extrabold shadow-md';
        if (scale === 'editorial') return 'text-xs sm:text-sm py-2.5 px-6 font-bold uppercase tracking-widest';
        return 'text-xs sm:text-sm py-2 px-4 font-bold'; // balanced

      case 'badge':
        if (scale === 'compact') return 'text-[10px] px-2 py-0.5 font-bold';
        if (scale === 'prominent') return 'text-xs px-3 py-1 font-black';
        if (scale === 'editorial') return 'text-[11px] px-3 py-1 font-semibold uppercase tracking-wider';
        return 'text-xs px-2.5 py-0.5 font-bold'; // balanced
    }
  };

  // Helper classes for Corner Geometry
  const getRadiusClass = (type: 'btn' | 'card' | 'input' | 'badge' = 'btn') => {
    switch (state.borderRadius) {
      case 'none':
        return 'rounded-none';
      case 'sm':
        return type === 'card' ? 'rounded-lg' : type === 'badge' ? 'rounded-sm' : 'rounded-md';
      case 'md':
        return type === 'card' ? 'rounded-2xl' : type === 'badge' ? 'rounded-md' : 'rounded-xl';
      case 'lg':
        return type === 'card' ? 'rounded-3xl' : type === 'badge' ? 'rounded-lg' : 'rounded-2xl';
      case 'full':
        return type === 'card' ? 'rounded-3xl' : 'rounded-full';
      default:
        return 'rounded-xl';
    }
  };

  // Card Variant Classes
  const getCardClasses = (additional: string = '') => {
    const rad = getRadiusClass('card');
    let variantClass = '';
    switch (state.cardVariant) {
      case 'glass':
        variantClass = 'backdrop-blur-md border shadow-lg';
        break;
      case 'bordered':
        variantClass = 'border-2 shadow-sm';
        break;
      case 'elevated':
        variantClass = 'border shadow-2xl';
        break;
      case 'solid':
      default:
        variantClass = 'border shadow-md';
        break;
    }
    return `${rad} ${variantClass} ${additional}`;
  };

  // Card Inline Style
  const getCardStyle = () => {
    return {
      borderColor: state.borderTint,
      backgroundColor: state.themeMode === 'light' ? '#FFFFFF' : state.themeMode === 'dim' ? '#0F172A' : '#030712'
    };
  };

  // Button Inline Style
  const getPrimaryButtonStyle = () => {
    if (state.buttonVariant === 'outline-bold') {
      return {
        borderColor: state.primaryColor,
        borderWidth: '2px',
        color: state.primaryColor,
        backgroundColor: 'transparent'
      };
    }
    const glow = state.shadowVariant === 'neon-glow'
      ? `0 0 20px -3px ${state.primaryColor}80`
      : state.shadowVariant === 'deep-ambient'
      ? `0 15px 30px -10px ${state.primaryColor}60`
      : state.shadowVariant === 'crisp'
      ? `3px 3px 0px 0px ${state.accentColor}`
      : `0 4px 12px -2px ${state.primaryColor}40`;

    return {
      backgroundColor: state.primaryColor,
      color: '#FFFFFF',
      boxShadow: glow
    };
  };

  const getBadgeStyle = () => {
    return {
      backgroundColor: state.surfaceTint,
      color: state.primaryColor,
      borderColor: state.borderTint
    };
  };

  // Summary representation
  const getTopographySummary = () => {
    const p = COLOR_PALETTES.find((pal) => pal.id === state.paletteId) || COLOR_PALETTES[0];
    return `${p.name} • ${p.fontStyleName.split(' ')[0]} • ${state.fontSizeScale.toUpperCase()}`;
  };

  // CSS variables generator
  const generateCssVariables = () => {
    return `:root {
  --theme-primary: ${state.primaryColor};
  --theme-accent: ${state.accentColor};
  --theme-secondary: ${state.secondaryColor};
  --theme-surface-tint: ${state.surfaceTint};
  --theme-border-tint: ${state.borderTint};
  --theme-font-family: ${
    state.fontFamily === 'serif' ? "'Playfair Display', serif" :
    state.fontFamily === 'mono' ? "'JetBrains Mono', monospace" :
    state.fontFamily === 'display' ? "'Space Grotesk', sans-serif" :
    state.fontFamily === 'rounded' ? "'Outfit', sans-serif" :
    "'Plus Jakarta Sans', sans-serif"
  };
  --theme-radius: ${state.borderRadius === 'none' ? '0px' : state.borderRadius === 'sm' ? '6px' : state.borderRadius === 'md' ? '12px' : state.borderRadius === 'lg' ? '20px' : '9999px'};
  --theme-scale: ${state.fontSizeScale};
}`;
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
    randomizeTopography,
    updateField,
    resetToDefault,
    getFontFamilyClass,
    getFontSizeScaleClass,
    getRadiusClass,
    getCardClasses,
    getCardStyle,
    getPrimaryButtonStyle,
    getBadgeStyle,
    getTopographySummary,
    generateCssVariables,
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
  onUpdateField?: <K extends keyof ThemeCustomizerState>(field: K, value: ThemeCustomizerState[K]) => void;
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
  onUpdateField,
  titleSuffix,
  platformToggle
}) => {
  const currentPalette = COLOR_PALETTES.find((p) => p.id === customization.paletteId) || COLOR_PALETTES[0];

  return (
    <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
      
      {/* Left: Back button & Template info + Topography Tag */}
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
              <span className="font-extrabold text-white text-xs sm:text-sm tracking-tight truncate max-w-[130px] sm:max-w-[200px]">
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
            
            {/* Active Theme Topography Pill */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: customization.primaryColor }}
              />
              <span className="text-[10px] font-semibold text-slate-300 truncate max-w-[210px] flex items-center gap-1">
                <span className="text-white font-bold">{currentPalette.name}</span>
                <span className="text-slate-500">•</span>
                <span className="capitalize text-slate-400">{customization.fontFamily}</span>
                <span className="text-slate-500">•</span>
                <span className="uppercase text-[9px] text-slate-400 font-mono">{customization.fontSizeScale}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Quick Palette & Typography Swatches Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {platformToggle}

        {/* Quick Palettes Swatches */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:inline mr-1">
            Topography:
          </span>
          <div className="flex items-center gap-1.5">
            {COLOR_PALETTES.slice(0, 8).map((p) => {
              const isActive = customization.paletteId === p.id || customization.primaryColor.toLowerCase() === p.primary.toLowerCase();
              return (
                <button
                  key={p.id}
                  onClick={() => onApplyPalette(p)}
                  title={`${p.name} Topography (${p.fontStyleName} • ${p.badge})`}
                  className={`w-5 h-5 rounded-full transition-all flex items-center justify-center ${
                    isActive
                      ? 'ring-2 ring-white scale-110 shadow-md'
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
            title="Pick Custom Primary Brand Color"
            className="w-5 h-5 rounded-full border border-dashed border-slate-500 flex items-center justify-center cursor-pointer hover:border-white transition-colors relative overflow-hidden"
            style={{ backgroundColor: customization.primaryColor }}
          >
            <input
              type="color"
              value={customization.primaryColor}
              onChange={(e) => {
                if (onUpdateField) {
                  onUpdateField('primaryColor', e.target.value);
                } else {
                  onApplyPalette({
                    ...currentPalette,
                    id: 'custom',
                    name: 'Custom Theme',
                    primary: e.target.value
                  });
                }
              }}
              className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
            />
          </label>
        </div>

        {/* Quick Typography Switcher directly on the bar */}
        {onUpdateField && (
          <div className="hidden xl:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl text-[10px] font-bold text-slate-300">
            <span className="text-slate-500 px-1.5 uppercase font-mono text-[9px]">Font:</span>
            {(['sans', 'serif', 'mono', 'display', 'rounded'] as const).map((f) => (
              <button
                key={f}
                onClick={() => onUpdateField('fontFamily', f)}
                className={`px-2 py-0.5 rounded-md capitalize transition-all ${
                  customization.fontFamily === f
                    ? 'bg-slate-800 text-white shadow-xs font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                style={{
                  color: customization.fontFamily === f ? customization.primaryColor : undefined
                }}
              >
                {f}
              </button>
            ))}
          </div>
        )}

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
          <span className="hidden sm:inline">Customize Theme & Styles</span>
          <span className="sm:hidden">Theme</span>
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
  onRandomize?: () => void;
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
  onRandomize,
  onUpdateField,
  onReset,
  onUseDesign
}) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'variants' | 'brand' | 'tokens' | 'estimate'>('colors');
  const [copiedTokens, setCopiedTokens] = useState(false);

  if (!isOpen) return null;

  const handleCopyCss = () => {
    const css = `:root {
  --primary-color: ${customization.primaryColor};
  --accent-color: ${customization.accentColor};
  --secondary-color: ${customization.secondaryColor};
  --surface-tint: ${customization.surfaceTint};
  --border-tint: ${customization.borderTint};
  --font-family: ${customization.fontFamily};
  --font-scale: ${customization.fontSizeScale};
  --border-radius: ${customization.borderRadius};
  --card-variant: ${customization.cardVariant};
  --button-variant: ${customization.buttonVariant};
}`;
    navigator.clipboard.writeText(css);
    setCopiedTokens(true);
    setTimeout(() => setCopiedTokens(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full z-10 text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md shrink-0"
              style={{ backgroundColor: customization.primaryColor }}
            >
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>Theme & Topography Studio</span>
                <span className="text-[10px] font-mono bg-slate-800 text-orange-400 px-1.5 py-0.5 rounded font-bold">
                  LIVE
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Colors, font styles, sizes, and corner variants update in real time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onRandomize && (
              <button
                onClick={onRandomize}
                title="Surprise Me (Randomize Harmonized Topography)"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px] font-semibold"
              >
                <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Shuffle</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Customizer Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/70 px-3 pt-2 gap-1 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg shrink-0 transition-all ${
              activeTab === 'colors'
                ? 'bg-slate-900 text-white border-t-2'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
            style={{ borderTopColor: activeTab === 'colors' ? customization.primaryColor : 'transparent' }}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Topography</span>
          </button>

          <button
            onClick={() => setActiveTab('typography')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg shrink-0 transition-all ${
              activeTab === 'typography'
                ? 'bg-slate-900 text-white border-t-2'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
            style={{ borderTopColor: activeTab === 'typography' ? customization.primaryColor : 'transparent' }}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Typography & Size</span>
          </button>

          <button
            onClick={() => setActiveTab('variants')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg shrink-0 transition-all ${
              activeTab === 'variants'
                ? 'bg-slate-900 text-white border-t-2'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
            style={{ borderTopColor: activeTab === 'variants' ? customization.primaryColor : 'transparent' }}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Corners & Cards</span>
          </button>

          <button
            onClick={() => setActiveTab('brand')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg shrink-0 transition-all ${
              activeTab === 'brand'
                ? 'bg-slate-900 text-white border-t-2'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
            style={{ borderTopColor: activeTab === 'brand' ? customization.primaryColor : 'transparent' }}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Brand Copy</span>
          </button>

          <button
            onClick={() => setActiveTab('tokens')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg shrink-0 transition-all ${
              activeTab === 'tokens'
                ? 'bg-slate-900 text-white border-t-2'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
            style={{ borderTopColor: activeTab === 'tokens' ? customization.primaryColor : 'transparent' }}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>CSS Tokens</span>
          </button>

          <button
            onClick={() => setActiveTab('estimate')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg shrink-0 transition-all ${
              activeTab === 'estimate'
                ? 'bg-slate-900 text-white border-t-2'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
            style={{ borderTopColor: activeTab === 'estimate' ? customization.primaryColor : 'transparent' }}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Quote</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          
          {/* TAB 1: COLOR TOPOGRAPHY */}
          {activeTab === 'colors' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Presets List */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Curated Topography Systems (1-Click)
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Syncs colors, typography & variants
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {COLOR_PALETTES.map((p) => {
                    const isSelected = customization.paletteId === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => onApplyPalette(p)}
                        className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                          isSelected
                            ? 'bg-slate-800 border-white shadow-lg scale-[1.02]'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-black text-white truncate group-hover:text-amber-300 transition-colors">
                            {p.name}
                          </span>
                          <div className="flex items-center -space-x-1 shrink-0">
                            <span
                              className="w-4 h-4 rounded-full border border-slate-900 shadow-xs"
                              style={{ backgroundColor: p.primary }}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-slate-900 shadow-xs"
                              style={{ backgroundColor: p.accent }}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-slate-900 shadow-xs"
                              style={{ backgroundColor: p.secondary }}
                            />
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-400 space-y-0.5">
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="capitalize">{p.fontStyleName.split(' ')[0]}</span>
                            <span className="font-mono text-[9px] uppercase bg-slate-900 px-1 rounded text-slate-300">
                              {p.fontSizeScale}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-500 block truncate">{p.badge}</span>
                        </div>

                        {isSelected && (
                          <div
                            className="absolute top-0 right-0 w-2 h-full"
                            style={{ backgroundColor: p.primary }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Hex Color Pickers */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-orange-400" />
                    <span>Custom Color Precision</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Auto-computes harmonized surface tints</span>
                </div>

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
                      Accent / Contrast Color
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

              {/* Surface Canvas Mode */}
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
                          ? 'bg-slate-800 text-white border-white shadow-sm'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {mode === 'light' ? (
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                      ) : mode === 'dim' ? (
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      ) : (
                        <Moon className="w-3.5 h-3.5 text-purple-400" />
                      )}
                      <span>{mode}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TYPOGRAPHY & SIZE SCALE */}
          {activeTab === 'typography' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Font Family Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                  Select Typography Pairing
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    {
                      id: 'sans',
                      label: 'Plus Jakarta Sans',
                      style: 'Clean Corporate & Modern SaaS',
                      sample: 'Transform Your Digital Architecture With High Velocity',
                      fontClass: 'font-sans-clean'
                    },
                    {
                      id: 'serif',
                      label: 'Playfair Luxe Editorial Serif',
                      style: 'Haute Horlogerie, Fashion, Luxury & Academics',
                      sample: 'Bespoke Craftsmanship & Prestigious Global Experiences',
                      fontClass: 'font-luxe-serif'
                    },
                    {
                      id: 'mono',
                      label: 'JetBrains Tech Mono',
                      style: 'Developer Portals, Cloud Metrics & Observability',
                      sample: 'SYSTEM_STATUS: 99.99% UP | LATENCY: 12ms',
                      fontClass: 'font-tech-mono'
                    },
                    {
                      id: 'display',
                      label: 'Space Grotesk Kinetic Display',
                      style: 'High-Impact Creative Agencies & Kinetic Startups',
                      sample: 'Bold Ideas Built For High-Performing Enterprises',
                      fontClass: 'font-display-modern'
                    },
                    {
                      id: 'rounded',
                      label: 'Outfit Soft Rounded',
                      style: 'Friendly Consumer Apps, Food Delivery & Healthcare',
                      sample: 'Delicious food & wellness delivered with care everyday',
                      fontClass: 'font-rounded-soft'
                    }
                  ].map((font) => (
                    <button
                      key={font.id}
                      onClick={() => onUpdateField('fontFamily', font.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        customization.fontFamily === font.id
                          ? 'bg-slate-800 border-white text-white shadow-md'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                          {font.label}
                          {customization.fontFamily === font.id && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                        </span>
                        <span className="text-[10px] text-slate-500">{font.style}</span>
                      </div>
                      <div className={`text-xs ${font.fontClass} text-slate-300 mt-1`}>
                        "{font.sample}"
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Scale */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Typography Size Scale & Density
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'compact', label: 'Compact', desc: '85% Dense (Dashboards & Data)' },
                    { id: 'balanced', label: 'Balanced', desc: '100% Standard Web Scale' },
                    { id: 'prominent', label: 'Prominent', desc: '115% High-Impact Headlines' },
                    { id: 'editorial', label: 'Editorial', desc: '130% Spacious Luxury' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onUpdateField('fontSizeScale', s.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        customization.fontSizeScale === s.id
                          ? 'bg-slate-800 border-white text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold capitalize">{s.label}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: CORNERS, CARDS & BUTTON VARIANTS */}
          {activeTab === 'variants' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Corner Radius */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Corner Geometry (Border Radius)
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: 'none', label: 'Sharp', radius: 'rounded-none', desc: '0px Architectural' },
                    { id: 'sm', label: 'Subtle', radius: 'rounded-md', desc: '6px Modern' },
                    { id: 'md', label: 'Curved', radius: 'rounded-xl', desc: '12px Squircle' },
                    { id: 'lg', label: 'Soft', radius: 'rounded-2xl', desc: '20px Smooth' },
                    { id: 'full', label: 'Pill', radius: 'rounded-full', desc: '9999px Full' }
                  ].map((rad) => (
                    <button
                      key={rad.id}
                      onClick={() => onUpdateField('borderRadius', rad.id as any)}
                      className={`p-2 border text-center transition-all ${rad.radius} ${
                        customization.borderRadius === rad.id
                          ? 'bg-slate-800 border-white text-white font-bold shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white text-xs'
                      }`}
                    >
                      <span className="text-[11px] block">{rad.label}</span>
                      <span className="text-[8px] text-slate-500 hidden sm:block">{rad.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Surface Variant */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Card Surface Variant
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'glass', label: 'Frosted Glass', desc: 'Backdrop blur & ambient light' },
                    { id: 'bordered', label: 'High-Contrast Border', desc: 'Crisp technical borders' },
                    { id: 'elevated', label: '3D Elevated', desc: 'Deep drop-shadow depth' },
                    { id: 'solid', label: 'Minimal Solid', desc: 'Clean slate backdrop' }
                  ].map((cv) => (
                    <button
                      key={cv.id}
                      onClick={() => onUpdateField('cardVariant', cv.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        customization.cardVariant === cv.id
                          ? 'bg-slate-800 border-white text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{cv.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{cv.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Button Variant */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Primary Button Style Variant
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'solid-glow', label: 'Vibrant Glow', desc: 'Color matched ambient glow' },
                    { id: 'gradient', label: 'Gradient Flow', desc: 'Primary into accent flow' },
                    { id: 'outline-bold', label: 'High-Contrast Outline', desc: 'Sharp 2px border' },
                    { id: 'minimal-pill', label: 'Modern Pill', desc: 'Soft full-rounded action' }
                  ].map((bv) => (
                    <button
                      key={bv.id}
                      onClick={() => onUpdateField('buttonVariant', bv.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        customization.buttonVariant === bv.id
                          ? 'bg-slate-800 border-white text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{bv.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{bv.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Module Toggles */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white block">
                  Toggle Live Preview Elements
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

          {/* TAB 4: BRAND & CONTENT */}
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
                  <span>Integrated Project Handover</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  When you submit a project request, your exact colors, typography styles, scale, and custom copy are automatically attached so our developers build exactly what you previewed!
                </p>
              </div>

            </div>
          )}

          {/* TAB 5: CSS DESIGN TOKENS EXPORTER */}
          {activeTab === 'tokens' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white">Live Design Tokens Specification</h3>
                  <p className="text-[10px] text-slate-400">Exportable CSS design tokens generated in real-time</p>
                </div>
                <button
                  onClick={handleCopyCss}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 transition-all hover:scale-105"
                >
                  {copiedTokens ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTokens ? 'Copied!' : 'Copy CSS'}</span>
                </button>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 overflow-x-auto">
                <div className="text-slate-500">/* Live Design System Variables */</div>
                <div><span className="text-purple-400">--theme-primary:</span> <span className="text-amber-300">{customization.primaryColor}</span>;</div>
                <div><span className="text-purple-400">--theme-accent:</span> <span className="text-amber-300">{customization.accentColor}</span>;</div>
                <div><span className="text-purple-400">--theme-secondary:</span> <span className="text-amber-300">{customization.secondaryColor}</span>;</div>
                <div><span className="text-purple-400">--theme-surface-tint:</span> <span className="text-emerald-300">{customization.surfaceTint}</span>;</div>
                <div><span className="text-purple-400">--theme-border-tint:</span> <span className="text-emerald-300">{customization.borderTint}</span>;</div>
                <div><span className="text-purple-400">--theme-font-family:</span> <span className="text-cyan-300">"{customization.fontFamily}"</span>;</div>
                <div><span className="text-purple-400">--theme-font-scale:</span> <span className="text-cyan-300">"{customization.fontSizeScale}"</span>;</div>
                <div><span className="text-purple-400">--theme-corner-radius:</span> <span className="text-cyan-300">"{customization.borderRadius}"</span>;</div>
                <div><span className="text-purple-400">--theme-card-variant:</span> <span className="text-cyan-300">"{customization.cardVariant}"</span>;</div>
                <div><span className="text-purple-400">--theme-button-variant:</span> <span className="text-cyan-300">"{customization.buttonVariant}"</span>;</div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Active Architecture:</span>
                <span className="font-bold text-white">{template.name} ({template.templateCode})</span>
              </div>
            </div>
          )}

          {/* TAB 6: ESTIMATE & TIMELINE */}
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
                      <span>Custom color topography ({customization.primaryColor} / {customization.accentColor})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Typography system: {customization.fontFamily} ({customization.fontSizeScale} scale)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Branded logo & headline: "{customization.brandName}"</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Responsive mobile & desktop design with complete source code</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                💡 Clicking <strong>"Use My Custom Design"</strong> transfers your chosen colors, typography, and requirements directly to our development team.
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
      title="Customize Theme & Topography"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 text-white px-4 py-3 rounded-full font-bold text-xs shadow-2xl transition-all hover:scale-105 active:scale-95 border border-white/20 backdrop-blur-md"
      style={{ backgroundColor: primaryColor }}
    >
      <Sliders className="w-4 h-4 animate-spin-slow" />
      <span>Customize Theme</span>
      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
    </button>
  );
};

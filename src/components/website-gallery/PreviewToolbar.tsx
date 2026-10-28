import React from 'react';
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Sparkles,
  Check,
  Maximize2
} from 'lucide-react';
import { BusinessTemplateItem } from '../../types';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

interface PreviewToolbarProps {
  template: BusinessTemplateItem;
  viewport: ViewportMode;
  onViewportChange: (vp: ViewportMode) => void;
  onBackToGallery: () => void;
  onUseDesign: (template: BusinessTemplateItem) => void;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
  template,
  viewport,
  onViewportChange,
  onBackToGallery,
  onUseDesign
}) => {
  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'ultra-premium':
        return 'bg-gradient-to-r from-rose-500 to-amber-500 text-white';
      case 'premium':
        return 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white';
      case 'mid-range':
        return 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white';
      case 'basic':
      default:
        return 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white px-4 py-2.5 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Return to Gallery + Template Title & Tier */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onBackToGallery}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-colors border border-slate-700/60"
            title="Return to Business Website Template Gallery"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Gallery</span>
            <span className="sm:hidden">Gallery</span>
          </button>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-orange-400 font-bold hidden md:inline">
              {template.templateCode}
            </span>
            <span className="font-extrabold text-sm text-white tracking-tight truncate max-w-[140px] sm:max-w-[220px]">
              {template.name}
            </span>
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs shrink-0 ${getTierBadgeColor(
                template.tier
              )}`}
            >
              {template.tierLabel}
            </span>
          </div>
        </div>

        {/* Center: Viewport Switcher (Desktop / Tablet / Mobile) */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => onViewportChange('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              viewport === 'desktop'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Desktop Preview (100% / 1440px)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>

          <button
            onClick={() => onViewportChange('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              viewport === 'tablet'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Tablet Preview (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet (768px)</span>
          </button>

          <button
            onClick={() => onViewportChange('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              viewport === 'mobile'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Mobile Preview (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile (375px)</span>
          </button>
        </div>

        {/* Right: Background info & "Use This Design" CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-300 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
            <span
              className="w-3 h-3 rounded-full border border-slate-600 shrink-0"
              style={{ backgroundColor: template.dominantBackground }}
            />
            <span className="truncate max-w-[150px]">
              {template.dominantBackgroundName}
            </span>
          </div>

          <button
            onClick={() => onUseDesign(template)}
            className="flex items-center gap-1.5 bg-[#F95700] hover:bg-[#EA4D00] text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg font-bold text-xs shadow-md shadow-orange-500/25 transition-all transform hover:scale-[1.02] active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Use This Design</span>
          </button>
        </div>

      </div>
    </header>
  );
};

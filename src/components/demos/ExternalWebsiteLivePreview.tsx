import React, { useState } from 'react';
import {
  ArrowLeft, ExternalLink, RefreshCw, Monitor, Tablet, Smartphone,
  CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Globe, ShoppingCart
} from 'lucide-react';
import { TemplateItem } from '../../types';

interface ExternalWebsiteLivePreviewProps {
  template: TemplateItem;
  onBack: () => void;
  onUseDesign: (template: TemplateItem) => void;
}

export const ExternalWebsiteLivePreview: React.FC<ExternalWebsiteLivePreviewProps> = ({
  template,
  onBack,
  onUseDesign
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const targetUrl = template.externalUrl || 'https://ecommercewebsite1-alpha.vercel.app/';

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Interactive Toolbar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 h-16 flex items-center justify-between gap-4 shrink-0 shadow-md">
        
        {/* Left: Back & Project Identity */}
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          <button
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium shrink-0"
            title="Return to Catalog"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="h-5 w-px bg-slate-800 shrink-0" />

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center font-bold text-white shadow-md shadow-emerald-900/30 shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base text-white tracking-tight truncate">
                  {template.name}
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live on {template.platformHost || 'Vercel'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate hidden sm:block">
                {targetUrl}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Device Viewport Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setViewport('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewport === 'desktop'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Desktop View (100% Full Width)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Desktop</span>
          </button>

          <button
            onClick={() => setViewport('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewport === 'tablet'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Tablet View (768px Width)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tablet</span>
          </button>

          <button
            onClick={() => setViewport('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewport === 'mobile'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Mobile View (390px Width)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mobile</span>
          </button>
        </div>

        {/* Right: Actions (Refresh, Open New Tab, Use Design) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            onClick={handleRefresh}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Reload Frame"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            title="Open in a new browser window"
          >
            <span>Open in Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => onUseDesign(template)}
            className="flex items-center gap-1.5 bg-[#F95700] hover:bg-[#EA4D00] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Use This Design</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Sub-bar showing direct URL & quick information */}
      <div className="bg-slate-900/80 border-b border-slate-800/80 px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-300 font-medium">Live Production Deployment:</span>
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline font-mono text-[11px] truncate max-w-xs sm:max-w-md"
          >
            {targetUrl}
          </a>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Frame Active</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">
            Fully test cart, catalog, & mobile layouts
          </span>
        </div>
      </div>

      {/* Main Viewport Render Area */}
      <main className="flex-1 bg-slate-950 flex flex-col items-center justify-start p-2 sm:p-6 overflow-auto">
        <div
          className={`w-full transition-all duration-300 relative flex flex-col ${
            viewport === 'desktop'
              ? 'max-w-full h-[calc(100vh-130px)] rounded-xl overflow-hidden border border-slate-800 shadow-2xl'
              : viewport === 'tablet'
              ? 'max-w-[768px] h-[calc(100vh-140px)] rounded-[28px] overflow-hidden border-[10px] border-slate-800 shadow-2xl my-2'
              : 'max-w-[390px] h-[calc(100vh-140px)] rounded-[38px] overflow-hidden border-[12px] border-slate-800 shadow-2xl my-2'
          }`}
        >
          {/* Mobile/Tablet Speaker Bar Decoration */}
          {viewport !== 'desktop' && (
            <div className="bg-slate-900 h-6 w-full flex items-center justify-center shrink-0 border-b border-slate-800/60">
              <div className="w-16 h-1.5 rounded-full bg-slate-700/80" />
            </div>
          )}

          {/* Iframe Loading Skeleton */}
          {isLoading && (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-10 text-xs text-slate-400">
              <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
              <div className="text-center space-y-1">
                <p className="font-semibold text-slate-200">Loading live site from Vercel...</p>
                <p className="text-[11px] text-slate-500 font-mono">{targetUrl}</p>
              </div>
            </div>
          )}

          {/* Live Website Iframe */}
          <iframe
            key={iframeKey}
            src={targetUrl}
            title={template.name}
            onLoad={() => setIsLoading(false)}
            className="w-full flex-1 bg-white border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />

          {/* Fallback bottom bar */}
          <div className="bg-slate-900/90 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
            <span>
              If this site restricts iframe embedding in your browser,{' '}
              <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline font-semibold"
              >
                click here to open in new tab ↗
              </a>
            </span>
            <button
              onClick={() => onUseDesign(template)}
              className="text-orange-400 font-semibold hover:underline"
            >
              Get this website built for you &rarr;
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

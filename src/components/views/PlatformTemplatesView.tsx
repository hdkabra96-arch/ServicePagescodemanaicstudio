import React, { useState } from 'react';
import {
  ArrowRight,
  Smartphone,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ChevronRight,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { TemplateItem } from '../../types';
import { ALL_TEMPLATES } from '../../data/servicesData';
import { Breadcrumbs } from '../Breadcrumbs';

interface PlatformTemplatesViewProps {
  platform: 'android' | 'ios' | 'all';
  onBack: () => void;
  onSwitchPlatform: (newPlatform: 'android' | 'ios' | 'all') => void;
  onLivePreview: (template: TemplateItem) => void;
  onUseDesign: (template: TemplateItem) => void;
}

export const PlatformTemplatesView: React.FC<PlatformTemplatesViewProps> = ({
  platform = 'android',
  onBack,
  onSwitchPlatform,
  onLivePreview,
  onUseDesign
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<'android' | 'ios' | 'all'>(platform);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('All');

  // Sync internal state if prop changes
  React.useEffect(() => {
    setSelectedPlatform(platform);
  }, [platform]);

  const handlePlatformTabChange = (plat: 'android' | 'ios' | 'all') => {
    setSelectedPlatform(plat);
    onSwitchPlatform(plat);
  };

  const filterTabs = [
    'All',
    'Business',
    'E-commerce',
    'Food & Delivery',
    'Education',
    'Healthcare',
    'Lifestyle',
    'Travel',
    'Booking'
  ];

  // Get templates matching the chosen platform filter
  const platformTemplates = ALL_TEMPLATES.filter((t) => {
    if (t.previewType !== 'mobile-app') return false;
    if (selectedPlatform === 'all') return true;
    return t.platform === selectedPlatform;
  });

  const filteredTemplates = platformTemplates.filter((t) => {
    if (activeCategoryTab === 'All') return true;
    return (
      t.industryTag.toLowerCase() === activeCategoryTab.toLowerCase() ||
      t.tags.some((tag) => tag.toLowerCase() === activeCategoryTab.toLowerCase())
    );
  });

  const androidCount = ALL_TEMPLATES.filter((t) => t.previewType === 'mobile-app' && t.platform === 'android').length;
  const iosCount = ALL_TEMPLATES.filter((t) => t.previewType === 'mobile-app' && t.platform === 'ios').length;

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      {/* Breadcrumbs matching Service Page 8 Step 2 */}
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: onBack },
          { label: 'Service', onClick: onBack },
          { label: 'App Development', onClick: onBack },
          {
            label:
              selectedPlatform === 'ios'
                ? 'iOS App Templates'
                : selectedPlatform === 'android'
                ? 'Android App Templates'
                : 'All Mobile Templates',
            active: true
          }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {/* Header Block matching Reference Image 8 Step 2 */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6 pb-6 border-b border-slate-200/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-300 bg-orange-50/80 text-orange-600 text-xs font-bold tracking-wider uppercase mb-3">
              <span>
                {selectedPlatform === 'ios'
                  ? 'APPLE IOS TEMPLATES & SAMPLES'
                  : selectedPlatform === 'android'
                  ? 'GOOGLE ANDROID TEMPLATES & SAMPLES'
                  : 'ANDROID & IOS MOBILE TEMPLATES'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {selectedPlatform === 'ios'
                ? 'iOS App'
                : selectedPlatform === 'android'
                ? 'Android App'
                : 'Android & iOS App'}{' '}
              <span className="text-[#F95700]">Templates & Demos</span>
            </h1>

            <p className="text-slate-600 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              Explore our ready-made mobile app designs and live smartphone prototypes. Select any template to test the interactive phone demo or use it to launch your mobile project.
            </p>
          </div>

          {/* Platform Filter Switcher Buttons (Both Android and iOS accessible) */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs">
            <button
              onClick={() => handlePlatformTabChange('all')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedPlatform === 'all'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>🌐 All ({androidCount + iosCount})</span>
            </button>

            <button
              onClick={() => handlePlatformTabChange('android')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedPlatform === 'android'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60'
              }`}
            >
              <span className="text-sm">🤖</span>
              <span>Android ({androidCount})</span>
            </button>

            <button
              onClick={() => handlePlatformTabChange('ios')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedPlatform === 'ios'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/60'
              }`}
            >
              <span className="text-sm">🍏</span>
              <span>iOS ({iosCount})</span>
            </button>
          </div>
        </div>

        {/* Quick Back to App Development & Sub-navigation bar */}
        <div className="flex items-center justify-between mb-6 pb-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>&larr; Back to App Development Overview</span>
          </button>

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900">{filteredTemplates.length}</span> templates
          </div>
        </div>

        {/* Filter Category Tabs matching Reference Image 8 Step 2 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 text-xs font-semibold no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveCategoryTab(tab)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                activeCategoryTab === tab
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-200 hover:bg-orange-50/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Templates Grid matching Reference Image 8 Step 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredTemplates.map((tmpl) => {
            const isIos = tmpl.platform === 'ios';
            return (
              <div
                key={tmpl.id}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-orange-400 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail & Platform Tag */}
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-900">
                    <img
                      src={tmpl.thumbnail}
                      alt={tmpl.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-md shadow-xs">
                      {tmpl.templateCode}
                    </div>
                    <div
                      className={`absolute top-3 left-3 backdrop-blur-xs text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs ${
                        isIos
                          ? 'bg-indigo-600/90 text-white'
                          : 'bg-emerald-600/90 text-white'
                      }`}
                    >
                      <span>{isIos ? '🍏' : '🤖'}</span>
                      <span>{isIos ? 'iOS (Apple)' : 'Android (Google)'}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200">
                        {tmpl.industryTag}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {tmpl.serviceCategory}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-orange-600 transition-colors">
                      {tmpl.name}
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {tmpl.description}
                    </p>

                    {/* Features strip */}
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {tmpl.features.slice(0, 3).map((f, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100"
                        >
                          &bull; {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dual Action Buttons matching Step 2 */}
                <div className="p-6 pt-0 grid grid-cols-2 gap-3 border-t border-slate-50 mt-2">
                  <button
                    onClick={() => onLivePreview(tmpl)}
                    className="py-2.5 px-3 rounded-xl border border-slate-300 hover:border-orange-500 text-slate-700 hover:text-orange-600 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>View Demo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onUseDesign(tmpl)}
                    className="py-2.5 px-3 rounded-xl bg-[#F95700] hover:bg-[#EA4D00] text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Use This Design</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="font-extrabold text-slate-900 text-base">
              Need a custom mobile app for both Android and iOS?
            </h4>
            <p className="text-xs text-slate-500">
              Tell us your custom features, APIs, and timeline requirements. We provide complete cross-platform & native architecture.
            </p>
          </div>

          <button
            onClick={() =>
              onUseDesign({
                id: `custom-app-${selectedPlatform}`,
                templateCode: selectedPlatform === 'ios' ? 'IOS-CUSTOM' : 'AND-CUSTOM',
                name: `Custom ${
                  selectedPlatform === 'ios'
                    ? 'iOS'
                    : selectedPlatform === 'android'
                    ? 'Android'
                    : 'Cross-Platform'
                } Mobile App`,
                serviceCategory: 'Mobile App',
                industryTag: 'Custom',
                description: `Bespoke mobile application developed to your exact requirements with clean architecture.`,
                previewType: 'mobile-app',
                imagePlaceholderGradient: 'from-orange-600 to-amber-600',
                thumbnail:
                  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80',
                features: ['Custom Native Architecture', 'Backend API Sync', 'App Store & Play Store Setup'],
                platform: selectedPlatform === 'all' ? 'android' : selectedPlatform,
                tags: ['Mobile App', 'Custom']
              })
            }
            className="bg-[#F95700] hover:bg-[#EA4D00] text-white px-7 py-3 rounded-full font-bold text-xs shadow-md whitespace-nowrap hover:scale-105 transition-transform"
          >
            Start Your Custom App Project &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

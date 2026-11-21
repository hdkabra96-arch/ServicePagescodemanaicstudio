import React, { useState } from 'react';
import { ArrowLeft, Monitor, Tablet, Smartphone, ArrowRight } from 'lucide-react';
import { TemplateItem } from '../../types';
import {
  OsteriaBrasaDemo,
  VallonEstatesDemo,
  ArcadiaHealthDemo
} from './signature/SignatureHospitalityAndRealty';
import {
  StudioVestigioDemo,
  AlderVanceDemo,
  AtelierKomaDemo,
  VanguardSystemsDemo,
  MeridianEditorialDemo,
  CollegiateAcademyDemo
} from './signature/SignatureStudioAndEnterprise';

interface SignatureWebsiteShowcaseProps {
  template: TemplateItem;
  onBack: () => void;
  onUseDesign: (template: TemplateItem) => void;
}

export const SignatureWebsiteShowcase: React.FC<SignatureWebsiteShowcaseProps> = ({
  template,
  onBack,
  onUseDesign
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const resolveDemo = () => {
    const code = (template.templateCode || '').toUpperCase();
    const industry = (template.industryTag || '').toLowerCase();
    const name = (template.name || '').toLowerCase();

    if (code === 'BIZ-004' || industry.includes('restaurant') || name.includes('brasa') || name.includes('culinary')) {
      return {
        label: 'Warm Linen · Candlelit Serif Hospitality',
        component: <OsteriaBrasaDemo template={template} onRequestQuote={onUseDesign} />
      };
    }

    if (code === 'BIZ-005' || industry.includes('real estate') || name.includes('vallon')) {
      return {
        label: 'Architectural Concrete · Private Brokerage',
        component: <VallonEstatesDemo template={template} onRequestQuote={onUseDesign} />
      };
    }

    if (code === 'BIZ-006' || industry.includes('health') || name.includes('arcadia')) {
      return {
        label: 'Nordic Botanical · Private Medical Clinic',
        component: <ArcadiaHealthDemo template={template} onRequestQuote={onUseDesign} />
      };
    }

    if (
      code === 'BIZ-002' ||
      code === 'PORT-002' ||
      code === 'PORT-004' ||
      industry.includes('creative') ||
      industry.includes('freelancer') ||
      industry.includes('creator')
    ) {
      return {
        label: 'Monochrome Swiss Editorial · Vermilion Accent',
        component: <StudioVestigioDemo template={template} onRequestQuote={onUseDesign} />
      };
    }

    if (code === 'BIZ-003' || industry.includes('consultant') || industry.includes('finance')) {
      return {
        label: 'Heritage Navy & Limestone · Quiet Luxury Advisory',
        component: <AlderVanceDemo template={template} onRequestQuote={onUseDesign} />
      };
    }

    if (code === 'PORT-001' || code === 'PORT-003' || industry.includes('architecture') || industry.includes('design agency')) {
      return {
        label: 'Raw Limestone Monograph · Spatial Gallery',
        component: <AtelierKomaDemo template={template} onRequestQuote={onUseDesign} />
      };
    }

    if (code.startsWith('BLOG') || template.serviceCategory.toLowerCase().includes('blog')) {
      return {
        label: 'Newsprint Broadsheet · Editorial Crimson',
        component: <MeridianEditorialDemo template={template} onRequestQuote={onUseDesign} />
      };
    }

    if (code.startsWith('EDU') || template.serviceCategory.toLowerCase().includes('educational')) {
      return {
        label: 'Collegiate Forest & Gold · Campus Portal',
        component: <CollegiateAcademyDemo template={template} onRequestQuote={onUseDesign} />
      };
    }

    return {
      label: 'Swiss Technical White · Precision Cobalt B2B',
      component: <VanguardSystemsDemo template={template} onRequestQuote={onUseDesign} />
    };
  };

  const resolved = resolveDemo();

  return (
    <div className="min-h-screen bg-[#111317] flex flex-col">
      {/* Unobtrusive Studio Showcase Bar */}
      <div className="sticky top-0 z-50 bg-[#111317]/95 backdrop-blur-md border-b border-white/10 text-white px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Showcase</span>
          </button>

          <span className="h-4 w-px bg-white/15 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2 text-xs truncate">
            <span className="font-semibold text-white truncate">{template.name}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 truncate">{resolved.label}</span>
          </div>
        </div>

        {/* Viewport Switcher */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1 shrink-0">
          {(
            [
              { id: 'desktop', icon: Monitor, label: 'Desktop' },
              { id: 'tablet', icon: Tablet, label: 'Tablet' },
              { id: 'mobile', icon: Smartphone, label: 'Mobile' }
            ] as const
          ).map((device) => {
            const Icon = device.icon;
            return (
              <button
                key={device.id}
                onClick={() => setViewport(device.id)}
                title={`${device.label} Preview`}
                className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  viewport === device.id ? 'bg-white text-[#111317]' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{device.label}</span>
              </button>
            );
          })}
        </div>

        {/* Request CTA */}
        <button
          onClick={() => onUseDesign(template)}
          className="inline-flex items-center gap-1.5 bg-[#F95700] hover:bg-[#EA4D00] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          <span>Request This Design</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Live Website Canvas */}
      <div className="flex-1 flex justify-center items-start bg-[#181B20] overflow-x-hidden">
        <div
          className={`w-full transition-all duration-300 bg-white ${
            viewport === 'desktop'
              ? 'max-w-full'
              : viewport === 'tablet'
              ? 'max-w-[780px] my-6 rounded-2xl overflow-hidden shadow-2xl ring-8 ring-white/10'
              : 'max-w-[395px] my-6 rounded-[32px] overflow-hidden shadow-2xl ring-8 ring-white/10'
          }`}
        >
          {resolved.component}
        </div>
      </div>
    </div>
  );
};

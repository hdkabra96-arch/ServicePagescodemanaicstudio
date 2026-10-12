import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, Zap, Layers, CheckCircle2, Calculator } from 'lucide-react';
import { TemplateItem } from '../../types';

interface CorporateWebsiteDemoProps {
  template: TemplateItem;
  onBack: () => void;
  onUseDesign: (template: TemplateItem) => void;
}

export const CorporateWebsiteDemo: React.FC<CorporateWebsiteDemoProps> = ({
  template,
  onBack,
  onUseDesign
}) => {
  const [estimatedPages, setEstimatedPages] = useState(5);
  const [needsEcommerce, setNeedsEcommerce] = useState(false);

  const calculatedQuote = (estimatedPages * 3500) + (needsEcommerce ? 15000 : 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <div className="bg-blue-600 text-white text-xs font-semibold py-2 px-4 text-center">
        Live Custom Website Preview: Nexora Modern Corporate Architecture with dynamic interactive features.
      </div>

      <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Templates</span>
        </button>
        <span className="font-bold text-white text-sm">{template.name} ({template.templateCode})</span>
        <button
          onClick={() => onUseDesign(template)}
          className="bg-[#F95700] hover:bg-[#EA4D00] text-white px-5 py-2 rounded-full font-bold text-xs"
        >
          Use This Design &rarr;
        </button>
      </div>

      <div className="flex-1 bg-white text-slate-900">
        
        {/* Nexora Header */}
        <header className="border-b border-slate-100 px-8 py-4 flex items-center justify-between">
          <div className="text-xl font-black tracking-tight text-slate-900">
            Nexora<span className="text-blue-600">.</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
            <span className="text-blue-600">Home</span>
            <span>About</span>
            <span>Services</span>
            <span>Portfolio</span>
            <span>Blog</span>
            <span>Contact</span>
          </nav>
          <button
            onClick={() => onUseDesign(template)}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold"
          >
            Get a Quote
          </button>
        </header>

        {/* Hero Section */}
        <section className="py-16 px-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
              Build Your Business Future
            </h1>
            <p className="text-slate-600 text-base leading-relaxed">
              With Innovative Digital Solutions. We help businesses create stunning websites, web applications and digital solutions that drive growth.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => onUseDesign(template)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-xs font-bold shadow-md"
              >
                Get Started &rarr;
              </button>
              <button
                onClick={() => onUseDesign(template)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-6 py-3 rounded-lg text-xs font-bold"
              >
                Our Services
              </button>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-100">
            <img
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80"
              alt="Nexora Corporate Building"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Interactive Quote Estimator Widget */}
        <section className="py-12 px-8 bg-slate-50 border-y border-slate-100">
          <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Interactive Project Estimator</h3>
                <p className="text-xs text-slate-500">Calculate instant estimate for this custom architecture.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Number of Custom Pages: {estimatedPages} pages</span>
                <span className="font-mono text-blue-600">₹{(estimatedPages * 3500).toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={estimatedPages}
                onChange={(e) => setEstimatedPages(Number(e.target.value))}
                className="w-full accent-blue-600"
              />

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="ecom-check"
                  checked={needsEcommerce}
                  onChange={(e) => setNeedsEcommerce(e.target.checked)}
                  className="rounded text-blue-600 w-4 h-4"
                />
                <label htmlFor="ecom-check" className="text-xs text-slate-700 font-medium">
                  Include Integrated Payment Gateway & Cart (+₹15,000)
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Estimated Project Investment:</span>
                <span className="text-2xl font-black font-mono text-slate-900">₹{calculatedQuote.toLocaleString('en-IN')}</span>
              </div>
              <button
                onClick={() => onUseDesign(template)}
                className="bg-[#F95700] hover:bg-[#EA4D00] text-white px-6 py-2.5 rounded-full font-bold text-xs shadow-md"
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

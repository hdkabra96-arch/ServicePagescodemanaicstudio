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
  X
} from 'lucide-react';
import { TemplateItem } from '../../types';

interface BusinessProDemoProps {
  template: TemplateItem;
  onBack: () => void;
  onUseDesign: (template: TemplateItem) => void;
}

export const BusinessProDemo: React.FC<BusinessProDemoProps> = ({
  template,
  onBack,
  onUseDesign
}) => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'strategy' | 'marketing' | 'tech'>('all');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      
      {/* Top Demo Notification Banner (as in screenshot 3) */}
      <div className="bg-blue-600 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
        <span>This is a demo website. All content and images are sample data and can be customized for your business.</span>
      </div>

      {/* Sticky Top Control Bar */}
      <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Designs</span>
          </button>
          <div className="hidden sm:block">
            <span className="font-bold text-white text-sm">{template.name}</span>
            <span className="text-slate-400 text-xs ml-2">({template.templateCode})</span>
          </div>
        </div>

        <button
          onClick={() => onUseDesign(template)}
          className="flex items-center gap-2 bg-[#F95700] hover:bg-[#EA4D00] text-white px-5 py-2 rounded-full font-bold text-xs shadow-lg shadow-orange-500/30 transition-all transform hover:scale-105"
        >
          <span>Use This Design</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Demo Website Interior */}
      <div className="flex-1 bg-white text-slate-800 font-sans">
        
        {/* Demo Navbar */}
        <header className="bg-slate-950 text-white border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-black text-white text-sm">
              BP
            </div>
            <span className="font-extrabold text-lg tracking-tight">BusinessPro</span>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-slate-300">
            <a href="#demo" className="text-orange-500">Home</a>
            <a href="#demo" className="hover:text-white">About</a>
            <a href="#demo" className="hover:text-white">Services</a>
            <a href="#demo" className="hover:text-white">Portfolio</a>
            <a href="#demo" className="hover:text-white">Blog</a>
            <a href="#demo" className="hover:text-white">Contact</a>
          </nav>

          <button
            onClick={() => onUseDesign(template)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-xs font-bold"
          >
            Get a Quote
          </button>
        </header>

        {/* Hero Section */}
        <section className="relative bg-slate-950 text-white py-20 px-6 overflow-hidden">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <span className="text-orange-500 font-bold text-xs uppercase tracking-widest">
                Professional Web Architecture
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
                Grow Your Business With{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                  Digital Solutions
                </span>
              </h1>
              <p className="text-slate-300 text-base leading-relaxed max-w-xl">
                We help small and medium businesses build a strong online presence with modern websites, conversion funnels, and digital marketing.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onUseDesign(template)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-md font-bold text-xs flex items-center gap-2"
                >
                  <span>Our Services</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setVideoModalOpen(true)}
                  className="flex items-center gap-2.5 px-5 py-3 rounded-md bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:bg-slate-800"
                >
                  <Play className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                  <span>Watch Video</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 aspect-4/3">
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80"
                  alt="Modern Office Building"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                  <div>
                    <div className="text-xs font-mono text-orange-400">Nexora Towers, Commercial Bay</div>
                    <div className="text-white font-bold text-sm">Empowering 500+ Regional Enterprises</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 3 Pillars strip */}
        <section className="bg-slate-100 border-b border-slate-200 py-6 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Modern Design</h4>
                <p className="text-xs text-slate-500">Clean, distinct and professional</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Fully Responsive</h4>
                <p className="text-xs text-slate-500">Pixel-perfect across phones and laptops</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Easy to Customize</h4>
                <p className="text-xs text-slate-500">Tailored to your specific brand identity</p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Services Section with Sample Data */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Our Services
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Everything you need to grow your business online with measurable results.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Corporate Branding', img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500&auto=format&fit=crop&q=80', desc: 'Distinctive visual identities and cohesive brand guidelines.' },
                { title: 'Web Development', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=80', desc: 'High-speed web pages tuned for customer conversion.' },
                { title: 'Strategic Advisory', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop&q=80', desc: 'Go-to-market strategies and digital market research.' },
                { title: 'Cloud Infrastructure', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80', desc: 'Scalable server hosting with 99.9% uptime guarantees.' },
              ].map((serv, i) => (
                <div key={i} className="rounded-xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                  <div className="aspect-16/10 bg-slate-100 overflow-hidden">
                    <img src={serv.img} alt={serv.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 space-y-1.5">
                    <h3 className="font-bold text-slate-900 text-sm">{serv.title}</h3>
                    <p className="text-xs text-slate-500">{serv.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Contact Form inside demo */}
            <div className="mt-16 p-8 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="max-w-2xl mx-auto text-center space-y-4">
                <h3 className="text-xl font-bold text-slate-900">Like this layout for your business?</h3>
                <p className="text-xs text-slate-600">
                  We will customize this exact structure with your logo, brand colors, text, and specific features.
                </p>
                <button
                  onClick={() => onUseDesign(template)}
                  className="bg-[#F95700] hover:bg-[#EA4D00] text-white px-8 py-3 rounded-full font-bold text-sm shadow-md"
                >
                  Use This Design for My Project &rarr;
                </button>
              </div>
            </div>

          </div>
        </section>

      </div>

      {/* Video Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 rounded-2xl max-w-xl w-full p-6 text-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">BusinessPro - Video Overview</h3>
              <button onClick={() => setVideoModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-16/9 bg-slate-800 rounded-xl flex items-center justify-center flex-col gap-2 p-6 text-center border border-slate-700">
              <Play className="w-12 h-12 text-orange-500 animate-pulse" />
              <p className="text-sm font-semibold text-slate-200">Sample Video Stream Preview</p>
              <p className="text-xs text-slate-400">Embed YouTube, Vimeo, or HTML5 MP4 promotional videos directly in this section.</p>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar matching Image 3 Step 3 */}
      <div className="sticky bottom-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
        <div>
          <h4 className="font-extrabold text-white text-sm">
            {template.name}
          </h4>
          <p className="text-xs text-slate-400">
            A professional business website template ({template.templateCode})
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={onBack}
            className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            &larr; Back to All Designs
          </button>
          <button
            onClick={() => onUseDesign(template)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#F95700] hover:bg-[#EA4D00] text-white px-6 py-2 rounded-full font-bold text-xs shadow-lg shadow-orange-500/30 transition-all"
          >
            <span>Use This Design</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};

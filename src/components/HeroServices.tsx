import React from 'react';
import { ArrowRight, ArrowDown, ShieldCheck, Users, Clock, Headphones, Laptop, Code2, Bot, Globe2, ShoppingBag } from 'lucide-react';

interface HeroServicesProps {
  onStartProject: () => void;
  onExploreServices: () => void;
}

export const HeroServices: React.FC<HeroServicesProps> = ({
  onStartProject,
  onExploreServices
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF6F0] to-[#FAF8F5] pt-4 pb-16 lg:pb-24 border-b border-orange-100/60">
      {/* Subtle warm glow background circles */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-orange-200/40 via-amber-200/30 to-rose-100/30 blur-3xl -z-10 pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pt-4">
          
          {/* Left Column: Heading, Subtitle & Buttons */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-orange-300 bg-orange-50/80 text-orange-600 text-xs font-bold tracking-wider uppercase shadow-xs">
              <span>OUR SERVICES</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              We Build Digital{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#F59E0B]">
                Solutions That Work
              </span>
            </h1>

            {/* Description */}
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
              From websites and web applications to digital solutions — we help businesses turn ideas into working products.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onStartProject}
                className="flex items-center gap-2.5 bg-[#F95700] hover:bg-[#EA4D00] text-white px-7 py-3.5 rounded-full font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Start Your Project</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreServices}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 px-6 py-3.5 rounded-full font-semibold text-sm border border-slate-200 shadow-xs hover:shadow-sm transition-all"
              >
                <span>Explore Services</span>
                <ArrowDown className="w-4 h-4 text-orange-600" />
              </button>
            </div>
          </div>

          {/* Right Column: Visual Laptop & Brand Ecosystem Mockup */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-[560px] p-4">
              
              {/* Floating badges matching screenshot */}
              <div className="absolute -top-3 left-8 w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 transform -rotate-6 animate-pulse">
                <Globe2 className="w-6 h-6" />
              </div>
              <div className="absolute -top-6 left-1/3 w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 transform rotate-3">
                <Code2 className="w-6 h-6" />
              </div>
              <div className="absolute -top-4 right-1/4 w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 transform -rotate-3">
                <Bot className="w-6 h-6" />
              </div>
              <div className="absolute top-8 -right-2 w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transform rotate-12">
                <ShoppingBag className="w-6 h-6" />
              </div>

              {/* Main Laptop Mockup */}
              <div className="relative bg-slate-900 rounded-2xl p-3 shadow-2xl border-4 border-slate-700/80 mt-4">
                {/* Camera notch */}
                <div className="w-3 h-3 bg-slate-800 rounded-full mx-auto mb-2 border border-slate-600 flex items-center justify-center">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full" />
                </div>
                
                {/* Screen Content */}
                <div className="bg-slate-950 rounded-xl overflow-hidden aspect-16/10 border border-slate-800 text-white p-5 flex flex-col justify-between relative group">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">codemaniacstudio.com</span>
                  </div>

                  {/* Brand Monogram on screen */}
                  <div className="my-auto text-center space-y-2">
                    <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 items-center justify-center shadow-lg shadow-orange-500/30 mx-auto">
                      <span className="font-extrabold text-white text-xl">CM</span>
                    </div>
                    <h3 className="font-extrabold text-lg tracking-wider text-slate-100">
                      CODEMANIAC STUDIO
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-xs font-mono text-orange-400 font-semibold tracking-wide">
                      <span>Ideas</span> &bull; <span>Design</span> &bull; <span>Develop</span> &bull; <span>Automate</span> &bull; <span>Grow!</span>
                    </div>
                  </div>

                  {/* Tech stack mini pills on bottom */}
                  <div className="grid grid-cols-4 gap-2 text-[10px] text-center font-mono">
                    <div className="bg-slate-900/90 py-1 rounded text-cyan-300 border border-cyan-900/50">React 19</div>
                    <div className="bg-slate-900/90 py-1 rounded text-blue-300 border border-blue-900/50">Node.js</div>
                    <div className="bg-slate-900/90 py-1 rounded text-purple-300 border border-purple-900/50">Postgres</div>
                    <div className="bg-slate-900/90 py-1 rounded text-emerald-300 border border-emerald-900/50">Cloud</div>
                  </div>
                </div>

                {/* Laptop Base Stand */}
                <div className="w-full h-3 bg-slate-700 rounded-b-xl mt-1 border-t border-slate-600 flex justify-center">
                  <div className="w-16 h-1 bg-slate-500 rounded-full" />
                </div>
              </div>

              {/* Stack of Specialty Books & Coffee Mug (Visual representation) */}
              <div className="absolute -bottom-6 -right-3 hidden sm:flex flex-col gap-1 w-36 shadow-xl">
                <div className="bg-[#1e293b] text-white text-[10px] font-bold py-1 px-2.5 rounded-sm border-l-4 border-orange-500 shadow-sm">
                  WEBSITE
                </div>
                <div className="bg-[#0f172a] text-white text-[10px] font-bold py-1 px-2.5 rounded-sm border-l-4 border-blue-500 shadow-sm">
                  WEB APP
                </div>
                <div className="bg-[#18181b] text-white text-[10px] font-bold py-1 px-2.5 rounded-sm border-l-4 border-purple-500 shadow-sm">
                  APP DEVELOPMENT
                </div>
                <div className="bg-[#09090b] text-white text-[10px] font-bold py-1 px-2.5 rounded-sm border-l-4 border-emerald-500 shadow-sm">
                  E-COMMERCE
                </div>
              </div>

              {/* Coffee mug */}
              <div className="absolute -bottom-2 -left-3 hidden sm:flex items-center justify-center w-14 h-16 bg-white rounded-md border-2 border-slate-200 shadow-lg p-1">
                <div className="w-full h-full bg-orange-50 rounded flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-orange-600">CM</span>
                  <div className="w-4 h-0.5 bg-orange-300 rounded-full mt-1" />
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* 4 Trust Badges Strip (Under Hero) */}
        <div className="mt-16 pt-8 border-t border-slate-200/80 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-orange-100/80 text-orange-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm">100%</div>
              <div className="text-slate-500 text-xs font-medium">Client Satisfaction</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-orange-100/80 text-orange-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Custom Solutions</div>
              <div className="text-slate-500 text-xs font-medium">Tailored to Your Needs</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-orange-100/80 text-orange-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">On-Time Delivery</div>
              <div className="text-slate-500 text-xs font-medium">Reliable & Professional</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-orange-100/80 text-orange-600 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Ongoing Support</div>
              <div className="text-slate-500 text-xs font-medium">Even After Launch</div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

import React from 'react';
import { Rocket, ArrowRight, MessageSquare } from 'lucide-react';

interface CtaBannerProps {
  onStartProject: () => void;
  onTalkToUs: () => void;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({ onStartProject, onTalkToUs }) => {
  return (
    <section className="py-12 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#111827] border border-orange-500/20 p-8 sm:p-12 shadow-2xl">
          
          {/* Subtle Orange Glow in background */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/4 -bottom-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            
            {/* Left Content with Rocket */}
            <div className="flex items-start sm:items-center gap-5 max-w-2xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#EA580C] to-[#F97316] text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/40 transform rotate-12">
                <Rocket className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <div className="text-orange-400 font-bold text-xs uppercase tracking-widest">
                  Have an Idea?
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  Let's Turn Your Idea Into Reality.
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm font-normal">
                  Tell us what you want to build and we'll help you turn it into a working digital solution.
                </p>
              </div>
            </div>

            {/* Right Buttons */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto shrink-0 justify-start sm:justify-end">
              <button
                onClick={onStartProject}
                className="flex items-center gap-2 bg-[#F95700] hover:bg-[#EA4D00] text-white px-7 py-3.5 rounded-full font-bold text-sm shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all transform hover:-translate-y-0.5"
              >
                <span>Start Your Project</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onTalkToUs}
                className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 text-slate-100 px-6 py-3.5 rounded-full font-semibold text-sm border border-slate-700 shadow-sm transition-all"
              >
                <span>Talk to Us</span>
                <ArrowRight className="w-4 h-4 text-orange-400" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

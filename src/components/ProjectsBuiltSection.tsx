import React, { useState } from 'react';
import { ArrowRight, ExternalLink, CheckCircle2 } from 'lucide-react';
import { CASE_STUDIES } from '../data/servicesData';
import { CaseStudy } from '../types';

interface ProjectsBuiltSectionProps {
  onStartProject: (initialRequirement?: string) => void;
}

export const ProjectsBuiltSection: React.FC<ProjectsBuiltSectionProps> = ({ onStartProject }) => {
  const [activeCaseStudy, setActiveCaseStudy] = useState<CaseStudy | null>(null);

  return (
    <section className="py-16 sm:py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Projects <span className="text-[#F95700]">We've Built</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Real projects. Real results. Explore some of our recent work.
            </p>
          </div>
          <button
            onClick={() => setActiveCaseStudy(CASE_STUDIES[0])}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-orange-600 border border-orange-200 hover:border-orange-300 bg-orange-50/60 hover:bg-orange-100/70 px-4 py-2.5 rounded-full transition-all self-start sm:self-auto"
          >
            <span>View All Projects</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 5 Project Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {CASE_STUDIES.map((project) => (
            <div
              key={project.id}
              onClick={() => setActiveCaseStudy(project)}
              className="group cursor-pointer bg-white rounded-2xl border border-slate-100 hover:border-orange-200 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Image Thumbnail */}
              <div className="aspect-16/10 w-full overflow-hidden relative bg-slate-100">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <span className="text-white text-xs font-semibold flex items-center gap-1">
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-[#F95700] transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs font-medium text-blue-600 mt-1">
                    {project.category}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-50 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCaseStudy(project);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 group-hover:text-[#F95700] transition-colors"
                  >
                    <span>View Case Study</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Case Study Modal */}
      {activeCaseStudy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">{activeCaseStudy.category}</span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{activeCaseStudy.title}</h3>
              </div>
              <button
                onClick={() => setActiveCaseStudy(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="rounded-xl overflow-hidden aspect-16/9 bg-slate-100 border border-slate-200">
              <img
                src={activeCaseStudy.image}
                alt={activeCaseStudy.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-500">Project Overview</h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                {activeCaseStudy.description}
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-emerald-900 uppercase">Impact & Measurable Outcome</h5>
                <p className="text-sm font-semibold text-emerald-800 mt-0.5">{activeCaseStudy.results}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Technologies Used</h4>
              <div className="flex flex-wrap gap-2">
                {activeCaseStudy.tech.map((t) => (
                  <span key={t} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md text-xs font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setActiveCaseStudy(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const title = activeCaseStudy.title;
                  setActiveCaseStudy(null);
                  onStartProject(`Similar to ${title} (${activeCaseStudy.category})`);
                }}
                className="flex items-center gap-2 bg-[#F95700] hover:bg-[#EA4D00] text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-md transition-all"
              >
                <span>Request Similar Project</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

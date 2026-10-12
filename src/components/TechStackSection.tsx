import React from 'react';
import { TECH_STACKS } from '../data/servicesData';
import { Layers, Database, Server, Monitor, Cloud } from 'lucide-react';

export const TechStackSection: React.FC = () => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Frontend': return Monitor;
      case 'Backend': return Server;
      case 'Database': return Database;
      case 'Platforms': return Layers;
      case 'Deployment': return Cloud;
      default: return Layers;
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-[#FAF9F6] border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Technologies <span className="text-[#F95700]">We Work With</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Modern and reliable technologies to build powerful digital solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {TECH_STACKS.map((stack) => {
            const Icon = getCategoryIcon(stack.category);
            return (
              <div
                key={stack.category}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {stack.category}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 mb-5 leading-normal">
                    {stack.description}
                  </p>

                  <div className="space-y-2">
                    {stack.technologies.map((tech) => (
                      <div
                        key={tech.name}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-orange-50/60 border border-slate-100 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: tech.color }}
                          />
                          <span className="text-xs font-semibold text-slate-800 group-hover:text-orange-600">
                            {tech.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 group-hover:text-slate-600">
                          {tech.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-400">
                  <span>Production Ready</span>
                  <span className="text-emerald-600 font-semibold">Active</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

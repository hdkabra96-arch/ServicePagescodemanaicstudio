import React from 'react';
import { ArrowRight, Globe, Code, Smartphone, ShoppingCart, Settings } from 'lucide-react';
import { PageView } from '../types';

interface CoreServicesSectionProps {
  onSelectService: (view: PageView) => void;
}

export const CoreServicesSection: React.FC<CoreServicesSectionProps> = ({ onSelectService }) => {
  const services = [
    {
      id: 'website-development',
      title: 'Website Development',
      view: 'website-development' as PageView,
      icon: Globe,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
      hoverBorder: 'hover:border-orange-300'
    },
    {
      id: 'web-application',
      title: 'Web Application Development',
      view: 'web-application' as PageView,
      icon: Code,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      hoverBorder: 'hover:border-blue-300'
    },
    {
      id: 'app-development',
      title: 'App Development',
      view: 'app-development' as PageView,
      icon: Smartphone,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
      hoverBorder: 'hover:border-indigo-300'
    },
    {
      id: 'ecommerce',
      title: 'E-commerce Solutions',
      view: 'ecommerce' as PageView,
      icon: ShoppingCart,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      hoverBorder: 'hover:border-emerald-300'
    },
    {
      id: 'custom-websites',
      title: 'Custom Websites',
      view: 'custom-websites' as PageView,
      icon: Settings,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-100',
      hoverBorder: 'hover:border-pink-300'
    }
  ];

  return (
    <section id="core-services" className="py-16 sm:py-20 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Our Core <span className="text-[#F95700]">Services</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2 font-normal">
              Professional digital solutions to help your business grow in the digital world.
            </p>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 italic">
            Choose the right type of website for your business.
          </p>
        </div>

        {/* 5 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {services.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onSelectService(item.view)}
                className={`group cursor-pointer bg-white rounded-2xl p-6 border ${item.borderColor} ${item.hoverBorder} shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1`}
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl ${item.bgColor} ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-[#F95700] transition-colors">
                    {item.title}
                  </h3>
                </div>

                <div className="pt-8">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectService(item.view);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F95700] group-hover:gap-2.5 transition-all"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

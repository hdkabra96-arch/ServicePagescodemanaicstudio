import React, { useState } from 'react';
import { ArrowRight, Wrench, Rocket, BarChart3, Link as LinkIcon, ShieldCheck, Search, CheckCircle2 } from 'lucide-react';
import { PageView } from '../types';

interface MoreWaysSectionProps {
  onStartWithService: (serviceName: string) => void;
}

export const MoreWaysSection: React.FC<MoreWaysSectionProps> = ({ onStartWithService }) => {
  const [selectedService, setSelectedService] = useState<any | null>(null);

  const additionalServices = [
    {
      id: 'website-maintenance',
      title: 'Website Maintenance',
      desc: 'Regular updates, security audits, backups, bug fixes, and continuous uptime checks.',
      icon: Wrench,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      features: ['WordPress & Framework core updates', 'Automated daily cloud backups', 'Malware scan & vulnerability patching', 'Emergency 2-hour fix guarantee']
    },
    {
      id: 'deployment-hosting',
      title: 'Deployment & Hosting',
      desc: 'High-speed cloud server architecture, SSL certificate setup, domain linking, and CDN tuning.',
      icon: Rocket,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      features: ['Vercel, Cloud Run & AWS deployment', 'Custom domain and auto-renewing SSL', 'Global edge caching for sub-second speeds', 'Automated CI/CD GitHub workflows']
    },
    {
      id: 'data-dashboard',
      title: 'Data & Dashboard Solutions',
      desc: 'Interactive business telemetry, KPI visualizers, real-time analytics, and actionable graphs.',
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      features: ['Executive revenue & KPI charts', 'Sales funnel conversion tracking', 'Role-based multi-user access views', 'Automated PDF & CSV report exports']
    },
    {
      id: 'api-integration',
      title: 'API Integration',
      desc: 'Connecting your web platform with payment gateways, CRMs, WhatsApp, and third-party tools.',
      icon: LinkIcon,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      features: ['Razorpay, Stripe & PayPal gateways', 'WhatsApp Business notification webhooks', 'Google Maps & Places API grounding', 'Custom RESTful & GraphQL endpoints']
    },
    {
      id: 'security-performance',
      title: 'Security & Performance',
      desc: 'Speed optimization for high Google PageSpeed scores, DDoS defense, and database hardening.',
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      features: ['Core Web Vitals 90+ score audit', 'SQL injection & XSS prevention', 'Image WebP compression & lazy loading', 'Rate limiting & bot traffic blocking']
    },
    {
      id: 'seo-optimization',
      title: 'SEO & Digital Optimization',
      desc: 'Structured schema markup, metadata tuning, sitemaps, and search engine discoverability.',
      icon: Search,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      features: ['JSON-LD Schema & OpenGraph tags', 'Google Search Console verification', 'Keyword architecture & semantic HTML', 'Mobile-first indexing optimization']
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            More Ways <span className="text-[#F95700]">We Can Help</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Additional services to support your digital journey.
          </p>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {additionalServices.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedService(item)}
                className="group cursor-pointer bg-white rounded-2xl p-5 border border-slate-100 hover:border-orange-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl ${item.bgColor} ${item.color} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-[#F95700] transition-colors">
                    {item.title}
                  </h3>
                </div>

                <div className="pt-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedService(item);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F95700] group-hover:gap-2 transition-all"
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

      {/* Service Detail Modal when clicking 'Learn More' */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${selectedService.bgColor} ${selectedService.color} flex items-center justify-center`}>
                  <selectedService.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedService.title}</h3>
                  <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Codemaniac Studio Service</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed">
              {selectedService.desc}
            </p>

            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">What's Included:</h4>
              <ul className="space-y-2">
                {selectedService.features.map((feat: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedService(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const sName = selectedService.title;
                  setSelectedService(null);
                  onStartWithService(sName);
                }}
                className="flex items-center gap-2 bg-[#F95700] hover:bg-[#EA4D00] text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-md transition-all"
              >
                <span>Request Service</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

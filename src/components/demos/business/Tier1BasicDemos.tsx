import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Phone,
  Clock,
  MapPin,
  Star,
  Shield,
  Send,
  Check,
  Calendar,
  Sparkles,
  ExternalLink,
  Users,
  ChevronRight,
  Mail,
  Award,
  DollarSign,
  FileText
} from 'lucide-react';
import { BusinessTemplateItem } from '../../../types';

interface TemplateDemoProps {
  template: BusinessTemplateItem;
  onUseDesign: (template: BusinessTemplateItem) => void;
  externalActivePage?: string;
  onPageChange?: (page: string) => void;
}

// Helper to scroll to section
const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// ============================================================================
// TEMPLATE 01: Clean Starter
// Dominant: Pure White (#FFFFFF) | Navy Text (#0F172A) | Blue Accents (#2563EB)
// Single-Page Website containing all pages/sections with smooth anchor navigation
// ============================================================================
export const CleanStarterDemo: React.FC<TemplateDemoProps> = ({ template, onUseDesign, externalActivePage, onPageChange }) => {
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    if (externalActivePage) {
      scrollToSection(`t01-${externalActivePage}`);
    }
  }, [externalActivePage]);

  const handleNav = (sectionId: string) => {
    if (onPageChange) onPageChange(sectionId);
    scrollToSection(`t01-${sectionId}`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Conventional Horizontal Navigation */}
      <nav className="border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-30 shadow-xs">
        <button onClick={() => handleNav('home')} className="flex items-center gap-3 text-left">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
            AS
          </div>
          <span className="font-extrabold text-lg text-slate-900 tracking-tight">
            {template.sampleBusinessName}
          </span>
        </button>

        <div className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
          {[
            { id: 'home', label: 'Home' },
            { id: 'services', label: 'Services' },
            { id: 'about', label: 'About' },
            { id: 'packages', label: 'Packages' },
            { id: 'contact', label: 'Contact' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className="hover:text-blue-600 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => handleNav('contact')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs"
        >
          Get Started
        </button>
      </nav>

      {/* SINGLE PAGE CONTAINER: ALL SECTIONS RENDERED SEAMLESSLY */}
      <main className="flex-1 space-y-0">
        {/* SECTION 1: HERO (HOME) */}
        <section id="t01-home" className="py-16 sm:py-24 px-6 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
              ★ All-in-One Complete Single Page Website
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Transparent Digital Foundations for Modern Business
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {template.tagline}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handleNav('contact')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-lg shadow-md transition-all flex items-center gap-2"
              >
                <span>Launch Project</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleNav('services')}
                className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs px-5 py-3 rounded-lg transition-colors"
              >
                Explore Services
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 shadow-xl overflow-hidden bg-slate-50 aspect-4/3">
            <img
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80"
              alt="Corporate starter"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* SECTION 2: SERVICES */}
        <section id="t01-services" className="py-20 px-6 bg-slate-50 border-t border-b border-slate-200">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Services &amp; Capabilities</span>
              <h2 className="text-3xl font-black text-slate-900">Tailored Solutions for Your Business</h2>
              <p className="text-slate-600 text-sm">
                Everything you need to launch and scale your online presence without technical friction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Responsive Web Development', desc: 'Clean, fast HTML5 & React architecture engineered for lightning load speeds across every device.' },
                { title: 'Domain & SSL Setup', desc: 'Full DNS configuration, custom domain mapping, and automatic HTTPS security certificate installation.' },
                { title: 'Direct Contact & Inquiries', desc: 'Instant form notifications routing directly to your email and CRM inbox with spam protection.' },
                { title: 'Search Engine Optimization', desc: 'Essential meta tags, OpenGraph sharing cards, sitemap, and Google Search Console registration.' },
                { title: 'High-Speed Cloud Hosting', desc: 'Global CDN distribution with 99.9% uptime SLA, automated backups, and zero maintenance hassle.' },
                { title: '100% Code Ownership', desc: 'You retain full rights and complete control over your codebase, design files, and customer data.' }
              ].map((srv, idx) => (
                <div key={idx} className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2 hover:border-blue-300 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs mb-3">
                    0{idx + 1}
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{srv.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{srv.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: ABOUT */}
        <section id="t01-about" className="py-20 px-6 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">About Our Studio</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                Building Honest, Reliable Digital Foundations
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                We eliminate complicated technical jargon and unnecessary overhead. Every business deserves a clean, dependable website designed to turn visitors into long-term clients.
              </p>
              <div className="pt-2 space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Dedicated developer communication throughout build</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Production-tested code with verified browser compatibility</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Comprehensive handoff training and documentation</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                <div className="text-3xl font-black text-blue-700">250+</div>
                <div className="text-xs text-slate-600 mt-1 font-semibold">Websites Delivered</div>
              </div>
              <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                <div className="text-3xl font-black text-blue-700">4.9/5</div>
                <div className="text-xs text-slate-600 mt-1 font-semibold">Client Rating</div>
              </div>
              <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                <div className="text-3xl font-black text-blue-700">5 Days</div>
                <div className="text-xs text-slate-600 mt-1 font-semibold">Average Launch</div>
              </div>
              <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                <div className="text-3xl font-black text-blue-700">100%</div>
                <div className="text-xs text-slate-600 mt-1 font-semibold">On-Time Guarantee</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: PACKAGES & SCOPE */}
        <section id="t01-packages" className="py-20 px-6 bg-slate-50 border-t border-slate-200">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Scope &amp; Options</span>
              <h2 className="text-3xl font-black text-slate-900">Structured for Your Stage</h2>
              <p className="text-slate-600 text-sm">Flexible tiers designed to grow alongside your business.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Starter One-Page', badge: 'Single-Page Complete', desc: 'Single-page website with hero, services grid, credentials, and contact form.' },
                { name: 'Business Multi-Page', badge: 'Most Popular', popular: true, desc: 'Complete 5-page setup with dedicated individual pages and structured navigation.' },
                { name: 'Custom Growth', badge: 'Expanded Scale', desc: 'Custom integrated workflows, customer portals, CMS, and advanced SEO.' }
              ].map((p, idx) => (
                <div key={idx} className={`p-6 rounded-2xl bg-white border-2 space-y-4 ${p.popular ? 'border-blue-600 shadow-xl' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600">{p.badge}</span>
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-900">{p.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
                  <button onClick={() => handleNav('contact')} className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition-colors">
                    Inquire About This &rarr;
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: CONTACT */}
        <section id="t01-contact" className="py-20 px-6 max-w-4xl mx-auto w-full">
          <div className="text-center space-y-3 mb-10">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Start Today</span>
            <h2 className="text-3xl font-black text-slate-900">Request Your New Website</h2>
            <p className="text-slate-600 text-sm">Fill in the brief form below and our team will prepare a tailored preview within 24 hours.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            {submitted ? (
              <div className="p-8 text-center bg-blue-50 rounded-xl space-y-3">
                <CheckCircle2 className="w-10 h-10 text-blue-600 mx-auto" />
                <h3 className="font-bold text-lg text-slate-900">Inquiry Received!</h3>
                <p className="text-xs text-slate-600">Our engineering lead will reach out to schedule your project kickoff.</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="space-y-4 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Your Name</label>
                    <input required type="text" placeholder="Jane Doe" className="w-full p-3 border border-slate-300 rounded-lg text-xs" />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Business Email</label>
                    <input required type="email" placeholder="jane@company.com" className="w-full p-3 border border-slate-300 rounded-lg text-xs" />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Project Details</label>
                  <textarea rows={3} placeholder="Tell us about your business and goals..." className="w-full p-3 border border-slate-300 rounded-lg text-xs" />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-lg shadow-md transition-colors">
                    Send Inquiry &rarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => onUseDesign(template)}
                    className="border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs py-3 px-5 rounded-lg transition-colors"
                  >
                    Select This Template
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        &copy; {new Date().getFullYear()} {template.sampleBusinessName}. Single-Page Business Architecture ({template.templateCode}).
      </footer>
    </div>
  );
};

// ============================================================================
// TEMPLATE 02: Local Business
// Dominant: Warm Ivory (#FAF8F5) | Olive Accents (#4D5D30)
// Complete single-page website with all local service sections
// ============================================================================
export const LocalBusinessDemo: React.FC<TemplateDemoProps> = ({ template, onUseDesign, externalActivePage, onPageChange }) => {
  React.useEffect(() => {
    if (externalActivePage) {
      scrollToSection(`t02-${externalActivePage}`);
    }
  }, [externalActivePage]);

  const handleNav = (sectionId: string) => {
    if (onPageChange) onPageChange(sectionId);
    scrollToSection(`t02-${sectionId}`);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D312E] font-sans flex flex-col selection:bg-[#4D5D30] selection:text-white">
      {/* Utility Header with Phone & Hours */}
      <div className="bg-[#4D5D30] text-white px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <Phone className="w-3.5 h-3.5 text-lime-300" />
            <span>(555) 234-5678</span>
          </span>
          <span className="hidden sm:flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-lime-300" />
            <span>Mon–Sat: 8:00 AM – 6:00 PM</span>
          </span>
        </div>
        <span className="font-bold text-[11px] bg-black/20 px-2.5 py-0.5 rounded-full">
          Serving Metro &amp; Surrounding Neighborhoods
        </span>
      </div>

      <nav className="border-b border-stone-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <button onClick={() => handleNav('home')} className="text-left">
          <span className="font-extrabold text-lg text-[#2D312E] tracking-tight block">
            {template.sampleBusinessName}
          </span>
          <span className="text-[10px] text-stone-500 font-mono tracking-wider uppercase">Local Certified Service</span>
        </button>

        <div className="hidden md:flex items-center space-x-6 text-xs font-bold text-stone-600">
          {[
            { id: 'home', label: 'Home' },
            { id: 'services', label: 'Services' },
            { id: 'hours', label: 'Hours & Location' },
            { id: 'reviews', label: 'Customer Reviews' },
            { id: 'booking', label: 'Book Appointment' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className="hover:text-[#4D5D30] transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => handleNav('booking')}
          className="bg-[#4D5D30] hover:bg-[#3D4B26] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition-colors"
        >
          Book Service
        </button>
      </nav>

      {/* SINGLE PAGE SECTIONS */}
      <main className="flex-1 space-y-0">
        {/* HERO */}
        <section id="t02-home" className="py-16 sm:py-24 px-6 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <span className="inline-block px-3 py-1 bg-lime-100 text-[#4D5D30] text-xs font-bold rounded-full">
              ★ Trusted Neighborhood Specialists
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-[#2D312E] tracking-tight leading-tight">
              Friendly, Professional Service You Can Rely On Every Time.
            </h1>
            <p className="text-stone-600 text-sm leading-relaxed">{template.tagline}</p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handleNav('booking')}
                className="bg-[#4D5D30] hover:bg-[#3D4B26] text-white font-bold text-xs px-6 py-3 rounded-lg shadow-md transition-all flex items-center gap-2"
              >
                <span>Schedule an Appointment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleNav('services')}
                className="border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs px-5 py-3 rounded-lg transition-colors"
              >
                View Service Menu
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 overflow-hidden shadow-xl aspect-4/3">
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80"
              alt="Local business"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* SERVICES */}
        <section id="t02-services" className="py-20 px-6 bg-white border-t border-b border-stone-200">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs font-bold text-[#4D5D30] uppercase">What We Offer</span>
              <h2 className="text-3xl font-black text-[#2D312E]">Comprehensive Local Services</h2>
              <p className="text-stone-600 text-sm">Upfront pricing, experienced professionals, and 100% satisfaction guarantee.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Standard Maintenance', desc: 'Thorough inspection, tune-up, and preventive safety checks.' },
                { title: 'Express Diagnostic', desc: 'Same-day troubleshooting and immediate quote with no hidden fees.' },
                { title: 'Full Replacement', desc: 'Complete equipment upgrades backed by manufacturer warranty.' },
                { title: 'Emergency Response', desc: '24/7 on-call dispatch for urgent local residential needs.' }
              ].map((s, idx) => (
                <div key={idx} className="p-6 rounded-xl bg-[#FAF8F5] border border-stone-200 space-y-2">
                  <h4 className="font-bold text-sm text-[#2D312E]">{s.title}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOURS & LOCATION */}
        <section id="t02-hours" className="py-20 px-6 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#4D5D30] uppercase">Convenient Hours</span>
              <h2 className="text-3xl font-black text-[#2D312E]">Visit Our Local Facility</h2>
              <p className="text-stone-600 text-sm">
                Centrally located with free customer parking and wheelchair-accessible facilities.
              </p>
              <div className="p-6 bg-white border border-stone-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="font-bold">Monday – Friday</span>
                  <span className="text-stone-600">8:00 AM – 6:00 PM</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="font-bold">Saturday</span>
                  <span className="text-stone-600">9:00 AM – 4:00 PM</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-bold">Sunday</span>
                  <span className="text-stone-400">Emergency Dispatch Only</span>
                </div>
              </div>
            </div>

            <div className="p-8 bg-[#4D5D30]/10 border border-[#4D5D30]/20 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-[#4D5D30]" />
                <div>
                  <h4 className="font-bold text-sm text-[#2D312E]">450 Oakridge Parkway</h4>
                  <p className="text-xs text-stone-600">Suite 120, Springfield County</p>
                </div>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Direct phone: <strong>(555) 234-5678</strong> &bull; Walk-ins warmly welcomed during standard operating hours.
              </p>
            </div>
          </div>
        </section>

        {/* REVIEWS */}
        <section id="t02-reviews" className="py-20 px-6 bg-stone-100/60 border-t border-stone-200">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <div className="flex justify-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-500" />
                ))}
              </div>
              <h2 className="text-3xl font-black text-[#2D312E]">Loved by Over 800 Local Neighbors</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Sarah Jenkins', comment: 'Always on time, polite, and they fixed our issue in under 45 minutes. Highly recommended!' },
                { name: 'Marcus Bell', comment: 'Fair and transparent pricing. No surprises on the bill. The team treated our home with great care.' },
                { name: 'Elena Ramos', comment: 'The best customer service in the county. We have been loyal customers for four years now.' }
              ].map((rev, i) => (
                <div key={i} className="p-6 bg-white border border-stone-200 rounded-xl space-y-3 shadow-xs">
                  <p className="text-xs text-stone-600 italic">"{rev.comment}"</p>
                  <div className="font-bold text-xs text-[#2D312E]">— {rev.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOOKING */}
        <section id="t02-booking" className="py-20 px-6 max-w-xl mx-auto w-full">
          <div className="text-center space-y-2 mb-8">
            <span className="text-xs font-bold text-[#4D5D30] uppercase">Direct Dispatch</span>
            <h2 className="text-3xl font-black text-[#2D312E]">Schedule Service Online</h2>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-md space-y-4 text-xs">
            <input type="text" placeholder="Full Name" className="w-full p-3 border border-stone-300 rounded" />
            <input type="tel" placeholder="Phone Number" className="w-full p-3 border border-stone-300 rounded" />
            <select className="w-full p-3 border border-stone-300 rounded text-stone-600">
              <option>Select Preferred Service</option>
              <option>Standard Maintenance</option>
              <option>Express Diagnostic</option>
              <option>Equipment Upgrade</option>
            </select>
            <button
              onClick={() => onUseDesign(template)}
              className="w-full py-3.5 bg-[#4D5D30] hover:bg-[#3D4B26] text-white font-bold rounded shadow-md transition-colors"
            >
              Confirm Appointment Booking &rarr;
            </button>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-xs text-stone-500 border-t border-stone-200 bg-white">
        &copy; {new Date().getFullYear()} {template.sampleBusinessName}. Local Community Single-Page Layout ({template.templateCode}).
      </footer>
    </div>
  );
};

// ============================================================================
// TEMPLATE 03: Creative Studio
// Dominant: Warm Peach (#FFF1E8) | Vivid Orange (#EA580C)
// Complete single-page creative studio website
// ============================================================================
export const CreativeStudioDemo: React.FC<TemplateDemoProps> = ({ template, onUseDesign, externalActivePage, onPageChange }) => {
  React.useEffect(() => {
    if (externalActivePage) {
      scrollToSection(`t03-${externalActivePage}`);
    }
  }, [externalActivePage]);

  const handleNav = (sectionId: string) => {
    if (onPageChange) onPageChange(sectionId);
    scrollToSection(`t03-${sectionId}`);
  };

  return (
    <div className="min-h-screen bg-[#FFF1E8] text-[#1E1B18] font-sans flex flex-col selection:bg-orange-500 selection:text-white">
      <header className="px-6 sm:px-12 py-5 border-b border-orange-200/80 flex items-center justify-between sticky top-0 bg-[#FFF1E8]/95 backdrop-blur-xs z-30 shadow-xs">
        <button onClick={() => handleNav('home')} className="font-black text-xl tracking-tighter text-orange-600">
          {template.sampleBusinessName}
        </button>

        <nav className="hidden md:flex items-center space-x-6 text-xs font-bold text-stone-700">
          {[
            { id: 'home', label: 'Home' },
            { id: 'works', label: 'Selected Works' },
            { id: 'services', label: 'Services' },
            { id: 'studio', label: 'Studio Story' },
            { id: 'contact', label: 'Start Project' }
          ].map((item) => (
            <button key={item.id} onClick={() => handleNav(item.id)} className="hover:text-orange-600 transition-colors">
              {item.label}
            </button>
          ))}
        </nav>

        <button onClick={() => handleNav('contact')} className="px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-full hover:bg-orange-700">
          Let's Talk
        </button>
      </header>

      <main className="flex-1 space-y-0">
        <section id="t03-home" className="py-20 px-6 sm:px-12 max-w-6xl mx-auto w-full space-y-6 text-center">
          <span className="text-xs font-mono font-bold tracking-widest text-orange-600 uppercase">Single-Page Creative Atelier</span>
          <h1 className="text-4xl sm:text-7xl font-black text-[#1E1B18] tracking-tight leading-none">
            Bold Concepts. <br /> Expressive Visuals.
          </h1>
          <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto">{template.tagline}</p>
          <div className="pt-4 flex justify-center gap-4">
            <button onClick={() => handleNav('works')} className="px-6 py-3 bg-orange-600 text-white text-xs font-bold rounded-full shadow-md hover:bg-orange-700">
              Explore Portfolio &darr;
            </button>
          </div>
        </section>

        {/* SELECTED WORKS */}
        <section id="t03-works" className="py-20 px-6 sm:px-12 bg-white/70 border-t border-b border-orange-200/80">
          <div className="max-w-6xl mx-auto space-y-10">
            <h2 className="text-3xl font-black text-[#1E1B18]">Selected Client Commissions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Velocita Kinetic Identity', cat: 'Brand System', img: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&auto=format&fit=crop&q=80' },
                { title: 'Aura Spatial Acoustics', cat: 'Art Direction', img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80' },
                { title: 'Luminary Editorial Magazine', cat: 'Digital Experience', img: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80' }
              ].map((w, idx) => (
                <div key={idx} className="group rounded-2xl overflow-hidden bg-orange-100/40 border border-orange-200">
                  <div className="aspect-4/3 overflow-hidden">
                    <img src={w.img} alt={w.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <span className="text-[10px] text-orange-600 font-mono uppercase">{w.cat}</span>
                    <h4 className="font-extrabold text-base text-[#1E1B18] mt-0.5">{w.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="t03-services" className="py-20 px-6 sm:px-12 max-w-6xl mx-auto w-full space-y-8">
          <h2 className="text-3xl font-black text-[#1E1B18]">Creative Disciplines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-white/80 rounded-2xl border border-orange-200 space-y-2">
              <h4 className="font-black text-lg text-orange-600">Brand Identity &amp; Voice</h4>
              <p className="text-xs text-stone-600 leading-relaxed">Distinctive visual typography, bespoke color guidelines, iconography, and comprehensive design systems.</p>
            </div>
            <div className="p-8 bg-white/80 rounded-2xl border border-orange-200 space-y-2">
              <h4 className="font-black text-lg text-orange-600">Motion Direction &amp; 3D</h4>
              <p className="text-xs text-stone-600 leading-relaxed">Kinetic typography, animated product interactions, 3D spatial renders, and brand micro-interactions.</p>
            </div>
          </div>
        </section>

        {/* STUDIO */}
        <section id="t03-studio" className="py-20 px-6 sm:px-12 bg-orange-100/30 border-t border-orange-200">
          <div className="max-w-4xl mx-auto space-y-4 text-center">
            <h2 className="text-3xl font-black">Crafting with Purpose &amp; Play</h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl mx-auto">
              We are an independent boutique team based in San Francisco and Berlin. We work intimately with visionary founders to build memorable, culture-defining brands.
            </p>
          </div>
        </section>

        {/* CONTACT */}
        <section id="t03-contact" className="py-20 px-6 max-w-lg mx-auto w-full">
          <div className="bg-white p-8 rounded-2xl border border-orange-200 shadow-md space-y-4 text-center">
            <h3 className="text-2xl font-black text-[#1E1B18]">Have an Ambitious Project?</h3>
            <p className="text-xs text-stone-600">Drop us a line and let's craft something unforgettable.</p>
            <button onClick={() => onUseDesign(template)} className="w-full py-3 bg-orange-600 text-white font-bold text-xs rounded-full hover:bg-orange-700">
              Initiate Project Brief &rarr;
            </button>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-xs text-stone-500 border-t border-orange-200 bg-[#FFF1E8]">
        &copy; {new Date().getFullYear()} {template.sampleBusinessName}. Single-Page Creative Studio ({template.templateCode}).
      </footer>
    </div>
  );
};

// ============================================================================
// TEMPLATE 04: Professional Services
// Dominant: Pale Sage (#F2F6F3) | Forest Green (#1B4332)
// Complete single-page professional advisory website
// ============================================================================
export const ProfessionalServicesDemo: React.FC<TemplateDemoProps> = ({ template, onUseDesign, externalActivePage, onPageChange }) => {
  React.useEffect(() => {
    if (externalActivePage) {
      scrollToSection(`t04-${externalActivePage}`);
    }
  }, [externalActivePage]);

  const handleNav = (sectionId: string) => {
    if (onPageChange) onPageChange(sectionId);
    scrollToSection(`t04-${sectionId}`);
  };

  return (
    <div className="min-h-screen bg-[#F2F6F3] text-[#132A13] font-sans flex flex-col selection:bg-[#1B4332] selection:text-white">
      <header className="px-8 py-5 border-b border-[#D8E2DC] flex items-center justify-between sticky top-0 bg-[#F2F6F3]/95 z-30 shadow-xs">
        <button onClick={() => handleNav('home')} className="font-extrabold text-lg text-[#1B4332]">
          {template.sampleBusinessName}
        </button>

        <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-stone-700">
          {[
            { id: 'home', label: 'Overview' },
            { id: 'practices', label: 'Practice Areas' },
            { id: 'process', label: 'Our Process' },
            { id: 'testimonials', label: 'Testimonials' },
            { id: 'contact', label: 'Consultation' }
          ].map((item) => (
            <button key={item.id} onClick={() => handleNav(item.id)} className="hover:text-[#1B4332] transition-colors">
              {item.label}
            </button>
          ))}
        </nav>

        <button onClick={() => handleNav('contact')} className="px-4 py-2 bg-[#1B4332] text-white text-xs font-bold rounded-lg hover:bg-[#143225]">
          Book Consultation
        </button>
      </header>

      <main className="flex-1 space-y-0">
        <section id="t04-home" className="py-20 px-8 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider">Trusted Advisory</span>
            <h1 className="text-4xl sm:text-5xl font-black text-[#132A13] leading-tight">
              Strategic Counsel for Critical Business Decisions.
            </h1>
            <p className="text-stone-600 text-sm leading-relaxed">{template.tagline}</p>
            <div className="pt-2">
              <button onClick={() => handleNav('contact')} className="px-6 py-3 bg-[#1B4332] text-white font-bold text-xs rounded-lg shadow hover:bg-[#143225]">
                Request Confidential Briefing &rarr;
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-[#D8E2DC] overflow-hidden shadow-xl aspect-4/3">
            <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80" alt="Professional services" className="w-full h-full object-cover" />
          </div>
        </section>

        {/* PRACTICES */}
        <section id="t04-practices" className="py-20 px-8 bg-white border-t border-b border-[#D8E2DC]">
          <div className="max-w-6xl mx-auto space-y-10">
            <h2 className="text-3xl font-black text-[#132A13]">Practice Focus</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Corporate Compliance', desc: 'Navigating evolving regional regulations, board oversight, and statutory compliance audits.' },
                { title: 'Tax & Estate Planning', desc: 'Structuring asset portfolios and succession strategies for multi-generational stability.' },
                { title: 'Risk Governance', desc: 'Identifying hidden vulnerabilities and constructing resilient enterprise risk mitigation frameworks.' }
              ].map((p, idx) => (
                <div key={idx} className="p-6 bg-[#F2F6F3] rounded-xl border border-[#D8E2DC] space-y-2">
                  <h4 className="font-bold text-base text-[#1B4332]">{p.title}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section id="t04-process" className="py-20 px-8 max-w-5xl mx-auto w-full space-y-8">
          <h2 className="text-3xl font-black text-[#132A13] text-center">Our 4-Step Advisory Process</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            {[
              { step: '01', title: 'Discovery', desc: 'Initial diagnostic intake' },
              { step: '02', title: 'Analysis', desc: 'Deep regulatory scrutiny' },
              { step: '03', title: 'Strategy', desc: 'Custom advisory blueprint' },
              { step: '04', title: 'Execution', desc: 'Continuous governance' }
            ].map((st, i) => (
              <div key={i} className="p-6 bg-white rounded-xl border border-[#D8E2DC] space-y-2">
                <div className="text-2xl font-black text-[#1B4332]">{st.step}</div>
                <div className="font-bold text-sm text-[#132A13]">{st.title}</div>
                <div className="text-[11px] text-stone-500">{st.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="t04-testimonials" className="py-20 px-8 bg-[#E9EFEA] border-t border-[#D8E2DC]">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h3 className="text-2xl font-black text-[#132A13]">"Their strategic foresight protected our firm during complex restructuring."</h3>
            <p className="text-xs text-stone-600">— Managing Partner, Global Logistics Group</p>
          </div>
        </section>

        {/* CONTACT */}
        <section id="t04-contact" className="py-20 px-8 max-w-xl mx-auto w-full text-center space-y-6">
          <h2 className="text-3xl font-black text-[#132A13]">Schedule Confidential Consultation</h2>
          <button onClick={() => onUseDesign(template)} className="px-8 py-3.5 bg-[#1B4332] text-white font-bold text-xs rounded-lg hover:bg-[#143225]">
            Initiate Advisory Engagement &rarr;
          </button>
        </section>
      </main>

      <footer className="py-8 text-center text-xs text-stone-500 border-t border-[#D8E2DC] bg-[#F2F6F3]">
        &copy; {new Date().getFullYear()} {template.sampleBusinessName}. Single-Page Professional Layout ({template.templateCode}).
      </footer>
    </div>
  );
};

// ============================================================================
// TEMPLATE 05: Minimal Consultant
// Dominant: Light Grey (#F8F9FA) | Charcoal Typography (#212529)
// Complete single-page minimal consultant website
// ============================================================================
export const MinimalConsultantDemo: React.FC<TemplateDemoProps> = ({ template, onUseDesign, externalActivePage, onPageChange }) => {
  React.useEffect(() => {
    if (externalActivePage) {
      scrollToSection(`t05-${externalActivePage}`);
    }
  }, [externalActivePage]);

  const handleNav = (sectionId: string) => {
    if (onPageChange) onPageChange(sectionId);
    scrollToSection(`t05-${sectionId}`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#212529] font-sans flex flex-col selection:bg-black selection:text-white">
      <header className="px-8 sm:px-16 py-8 flex items-center justify-between sticky top-0 bg-[#F8F9FA]/90 backdrop-blur-xs z-30">
        <button onClick={() => handleNav('home')} className="font-mono text-sm tracking-widest uppercase font-bold">
          {template.sampleBusinessName}
        </button>

        <nav className="hidden md:flex items-center space-x-8 text-xs font-mono uppercase tracking-wider text-stone-500">
          {[
            { id: 'home', label: 'Index' },
            { id: 'expertise', label: 'Expertise' },
            { id: 'advisory', label: 'Advisory' },
            { id: 'feedback', label: 'Clients' },
            { id: 'apply', label: 'Apply' }
          ].map((item) => (
            <button key={item.id} onClick={() => handleNav(item.id)} className="hover:text-black transition-colors">
              {item.label}
            </button>
          ))}
        </nav>

        <button onClick={() => handleNav('apply')} className="text-xs font-mono uppercase font-bold underline hover:no-underline">
          Inquire &rarr;
        </button>
      </header>

      <main className="flex-1 space-y-0">
        <section id="t05-home" className="py-24 px-8 sm:px-16 max-w-4xl mx-auto w-full space-y-8">
          <span className="font-mono text-xs text-stone-400 uppercase tracking-widest">Executive Advisory</span>
          <h1 className="text-4xl sm:text-6xl font-light text-[#212529] tracking-tight leading-tight">
            High-leverage strategic guidance for venture-backed founders and executive boards.
          </h1>
          <p className="text-stone-500 text-sm max-w-xl leading-relaxed">{template.tagline}</p>
        </section>

        {/* EXPERTISE */}
        <section id="t05-expertise" className="py-20 px-8 sm:px-16 max-w-4xl mx-auto w-full border-t border-stone-200 space-y-8">
          <h2 className="font-mono text-xs text-stone-400 uppercase tracking-widest">Core Capabilities</h2>
          <div className="space-y-6">
            {[
              { area: '01 / Go-To-Market Scaling', detail: 'Transitioning from founder-led sales to repeatable multi-tiered enterprise acquisition.' },
              { area: '02 / Product-Led Retention', detail: 'Diagnosing cohort retention degradation and re-architecting activation velocity.' },
              { area: '03 / Board & Capital Strategy', detail: 'Cap table modeling, Series B/C syndication prep, and quarterly governance rigor.' }
            ].map((exp, idx) => (
              <div key={idx} className="pb-6 border-b border-stone-200 space-y-1">
                <h4 className="font-mono font-bold text-sm">{exp.area}</h4>
                <p className="text-xs text-stone-600">{exp.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ADVISORY */}
        <section id="t05-advisory" className="py-20 px-8 sm:px-16 max-w-4xl mx-auto w-full border-t border-stone-200 space-y-8">
          <h2 className="font-mono text-xs text-stone-400 uppercase tracking-widest">Engagement Format</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 border border-stone-300 rounded space-y-2">
              <h4 className="font-bold text-sm">Monthly Retainer</h4>
              <p className="text-xs text-stone-500">Bi-weekly executive 1-on-1s, asynchronous Slack advisory, and quarterly board reviews.</p>
            </div>
            <div className="p-6 border border-stone-300 rounded space-y-2">
              <h4 className="font-bold text-sm">Targeted Sprint</h4>
              <p className="text-xs text-stone-500">Four-week diagnostic overhaul tackling specific bottleneck metrics.</p>
            </div>
          </div>
        </section>

        {/* FEEDBACK */}
        <section id="t05-feedback" className="py-20 px-8 sm:px-16 max-w-4xl mx-auto w-full border-t border-stone-200 space-y-6">
          <h2 className="font-mono text-xs text-stone-400 uppercase tracking-widest">Client Feedback</h2>
          <p className="text-sm italic text-stone-700">"The single most impactful advisor on our cap table. Direct, rigorous, and zero fluff."</p>
          <div className="font-mono text-xs text-stone-500">— Founder &amp; CEO, Series B Fintech</div>
        </section>

        {/* APPLY */}
        <section id="t05-apply" className="py-20 px-8 sm:px-16 max-w-xl mx-auto w-full border-t border-stone-200 text-center space-y-6">
          <h2 className="text-2xl font-bold">Apply for Advisory Availability</h2>
          <p className="text-xs text-stone-500">Limited to 4 simultaneous corporate engagements per calendar quarter.</p>
          <button onClick={() => onUseDesign(template)} className="px-8 py-3 bg-black text-white font-mono text-xs uppercase tracking-wider hover:bg-stone-800">
            Submit Executive Brief &rarr;
          </button>
        </section>
      </main>

      <footer className="py-12 text-center font-mono text-xs text-stone-400 border-t border-stone-200">
        &copy; {new Date().getFullYear()} {template.sampleBusinessName}. Single-Page Minimal Consultant Layout ({template.templateCode}).
      </footer>
    </div>
  );
};

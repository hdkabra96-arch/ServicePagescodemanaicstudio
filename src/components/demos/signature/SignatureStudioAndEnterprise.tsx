import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  X,
  LayoutGrid,
  List,
  BookOpen,
  GraduationCap,
  Calendar,
  MapPin
} from 'lucide-react';
import { SignatureDemoProps } from './SignatureHospitalityAndRealty';

/* ============================================================================
   4. STUDIO VESTIGIO — Avant-Garde Milan Creative & Brand Agency (BIZ-002 / PORT-002 / PORT-004)
   Theme: Gallery Paper (#F5F4F0) · Carbon Black (#0A0A0A) · Swiss Vermilion (#E12D1E)
   Typography: Syne / Outfit + JetBrains Mono
   ============================================================================ */
export const StudioVestigioDemo: React.FC<SignatureDemoProps> = ({ template, onRequestQuote }) => {
  const [discipline, setDiscipline] = useState<'All' | 'Identity' | 'Digital' | 'Spatial'>('All');
  const [activeWork, setActiveWork] = useState<any | null>(null);
  const [briefSent, setBriefSent] = useState(false);
  const [clientName, setClientName] = useState('');

  const works = [
    {
      id: '01',
      title: 'Kinetik Audio — Brand Architecture & Flagship Store',
      client: 'Kinetik Copenhagen',
      discipline: 'Digital' as const,
      year: '2026',
      impact: '+184% Direct Online Revenue in 90 Days',
      image: '/src/assets/images/hero_creative_atelier_1795231128877.jpg',
      summary: 'Complete visual re-architecture, tactile product configurator, and editorial flagship platform for Denmark’s leading acoustic hardware studio.'
    },
    {
      id: '02',
      title: 'Fondazione Pietra — Spatial Identity & Exhibition',
      client: 'Fondazione Pietra, Milan',
      discipline: 'Spatial' as const,
      year: '2026',
      impact: '94,000 Exhibition Visitors · Red Dot Best of the Best',
      image: '/src/assets/images/hero_architecture_studio_1795231129202.jpg',
      summary: 'Monolithic wayfinding, printed exhibition monograph, and digital archive built around raw limestone geometry and stark typographic restraint.'
    },
    {
      id: '03',
      title: 'Brasa Culinary Group — Hospitality Identity System',
      client: 'Osteria Brasa',
      discipline: 'Identity' as const,
      year: '2025',
      impact: '3.2x Increase in Direct Table Reservations',
      image: '/src/assets/images/hero_fine_dining_1795231129012.jpg',
      summary: 'Letterpress menus, embossed table stationery, custom serif wordmark, and a reservation-first web experience eliminating third-party booking commissions.'
    }
  ];

  const filtered = discipline === 'All' ? works : works.filter((w) => w.discipline === discipline);

  return (
    <div className="bg-[#F5F4F0] text-[#0A0A0A] min-h-screen font-sans selection:bg-[#E12D1E] selection:text-white">
      {/* 3-Zone Swiss Top Bar */}
      <header className="sticky top-0 z-30 bg-[#F5F4F0]/95 backdrop-blur-md border-b border-[#0A0A0A]/15">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          <a
            href="#vestigio-top"
            onClick={(e) => e.preventDefault()}
            className="text-lg font-extrabold tracking-tight uppercase text-[#0A0A0A] whitespace-nowrap shrink-0"
            style={{ fontFamily: "'Syne', 'Outfit', sans-serif" }}
          >
            STUDIO VESTIGIO
          </a>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-[#444]">
            <a href="#vestigio-work" className="hover:text-[#0A0A0A] transition-colors whitespace-nowrap shrink-0">Selected Work</a>
            <a href="#vestigio-practice" className="hover:text-[#0A0A0A] transition-colors whitespace-nowrap shrink-0">Capabilities</a>
            <a href="#vestigio-brief" className="hover:text-[#0A0A0A] transition-colors whitespace-nowrap shrink-0">Commission</a>
          </nav>

          <div className="shrink-0">
            <a
              href="#vestigio-brief"
              className="inline-flex items-center gap-2 bg-[#E12D1E] hover:bg-[#BD2215] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0"
            >
              Start a Brief
            </a>
          </div>
        </div>
      </header>

      {/* Oversized Swiss Editorial Hero */}
      <section id="vestigio-top" className="max-w-7xl mx-auto px-6 pt-14 pb-16 border-b border-[#0A0A0A]/15">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7 space-y-6">
            <p className="text-xs font-mono uppercase tracking-widest text-[#E12D1E]">
              Independent Brand &amp; Digital Atelier · Milan / London
            </p>
            <h1
              className="text-4xl sm:text-6xl lg:text-[64px] font-extrabold leading-[0.98] tracking-tight text-[#0A0A0A]"
              style={{ fontFamily: "'Syne', 'Outfit', sans-serif", textWrap: 'balance' }}
            >
              We shape category-defining brands and digital flagships.
            </h1>
          </div>
          <div className="lg:col-span-5 space-y-5 pb-2">
            <p className="text-sm sm:text-base text-[#3D3D3A] leading-relaxed">
              We partner with ambitious founders and cultural institutions to replace forgettable templates with enduring identity systems and high-converting web architecture.
            </p>
            <div className="flex items-center gap-6 text-xs font-mono text-[#5A5A55]">
              <span>42 Global Launches</span>
              <span>·</span>
              <span>11 Design Awards</span>
              <span>·</span>
              <span>Q1 Slots Open</span>
            </div>
          </div>
        </div>

        <div className="mt-10 relative aspect-16/8 overflow-hidden bg-[#0A0A0A]">
          <img
            src="/src/assets/images/hero_creative_atelier_1795231128877.jpg"
            alt="Studio Vestigio Milan design loft"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Asymmetric Bento Work Showcase */}
      <section id="vestigio-work" className="max-w-7xl mx-auto px-6 py-16 border-b border-[#0A0A0A]/15">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#E12D1E]">Index 2024–2026</p>
            <h2 className="text-3xl font-extrabold mt-1" style={{ fontFamily: "'Syne', 'Outfit', sans-serif" }}>
              Selected Case Studies
            </h2>
          </div>

          <div className="inline-flex border border-[#0A0A0A]/15 bg-white">
            {(['All', 'Identity', 'Digital', 'Spatial'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDiscipline(d)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                  discipline === d ? 'bg-[#0A0A0A] text-white' : 'text-[#444] hover:text-[#0A0A0A]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {filtered.map((item, idx) => (
            <article
              key={item.id}
              onClick={() => setActiveWork(item)}
              className={`${
                idx === 0 && filtered.length === 3 ? 'lg:col-span-7' : 'lg:col-span-5'
              } bg-white border border-[#0A0A0A]/15 cursor-pointer group flex flex-col justify-between`}
            >
              <div className="aspect-16/10 overflow-hidden bg-[#0A0A0A]">
                <img
                  src={item.image}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-[#666]">
                  <span>{item.client} · {item.discipline}</span>
                  <span>{item.year}</span>
                </div>
                <h3 className="text-xl font-bold text-[#0A0A0A] group-hover:text-[#E12D1E] transition-colors flex items-start justify-between gap-3">
                  <span>{item.title}</span>
                  <ArrowUpRight className="w-5 h-5 shrink-0" />
                </h3>
                <p className="text-xs font-semibold text-[#E12D1E]">{item.impact}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Numbered Disciplines + Brief Form */}
      <section id="vestigio-practice" className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-12 gap-14">
        <div className="lg:col-span-6 space-y-6">
          <p className="text-xs font-mono uppercase tracking-widest text-[#E12D1E]">Capabilities</p>
          <h2 className="text-3xl font-extrabold" style={{ fontFamily: "'Syne', 'Outfit', sans-serif" }}>
            Four core practices, zero template reuse.
          </h2>
          <div className="divide-y divide-[#0A0A0A]/15 border-y border-[#0A0A0A]/15">
            {[
              { n: '01.', title: 'Brand Strategy & Identity Systems', desc: 'Positioning, custom typography, art direction, and exhaustive brand guidelines.' },
              { n: '02.', title: 'Flagship Websites & E-Commerce', desc: 'Bespoke front-end architecture engineered for sub-second load times and conversion.' },
              { n: '03.', title: 'Design Systems & Product UI', desc: 'Multi-brand token libraries and interactive component ecosystems.' },
              { n: '04.', title: 'Launch Campaigns & Editorial Direction', desc: 'Art-directed photography, film showreels, and product drop experiences.' }
            ].map((cap) => (
              <div key={cap.n} className="py-5 grid grid-cols-12 gap-4">
                <span className="col-span-2 font-mono text-sm font-bold text-[#E12D1E]">{cap.n}</span>
                <div className="col-span-10">
                  <h4 className="font-bold text-base text-[#0A0A0A]">{cap.title}</h4>
                  <p className="text-xs text-[#4A4A46] mt-1 leading-relaxed">{cap.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div id="vestigio-brief" className="lg:col-span-6 bg-[#0A0A0A] text-[#F5F4F0] p-8 sm:p-10">
          {briefSent ? (
            <div className="py-10 text-center space-y-4">
              <CheckCircle2 className="w-11 h-11 text-[#E12D1E] mx-auto" />
              <h3 className="text-2xl font-bold" style={{ fontFamily: "'Syne', 'Outfit', sans-serif" }}>
                Brief Received, {clientName}
              </h3>
              <p className="text-sm text-[#B8B8B2]">
                Our Creative Director will review your project scope and respond within 1 business day.
              </p>
              <button
                onClick={() => onRequestQuote(template)}
                className="px-6 py-3 bg-[#E12D1E] text-white text-xs font-bold uppercase tracking-wider"
              >
                Commission This Agency Design
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (clientName.trim()) setBriefSent(true);
              }}
              className="space-y-4"
            >
              <p className="text-xs font-mono uppercase tracking-widest text-[#E12D1E]">New Commissions</p>
              <h3 className="text-2xl font-bold" style={{ fontFamily: "'Syne', 'Outfit', sans-serif" }}>
                Tell us what you are building
              </h3>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Your Name / Company"
                className="w-full bg-white/5 border border-white/20 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#E12D1E]"
              />
              <input
                type="email"
                required
                placeholder="Work Email"
                className="w-full bg-white/5 border border-white/20 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#E12D1E]"
              />
              <textarea
                rows={3}
                placeholder="Scope, launch timeline, and goals..."
                className="w-full bg-white/5 border border-white/20 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#E12D1E] resize-none"
              />
              <button
                type="submit"
                className="w-full bg-[#E12D1E] hover:bg-[#BD2215] text-white py-3.5 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Submit Project Brief
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Case Study Lightbox Modal */}
      {activeWork && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#F5F4F0] max-w-2xl w-full border border-[#0A0A0A] overflow-hidden">
            <div className="relative h-64">
              <img src={activeWork.image} alt={activeWork.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              <button
                onClick={() => setActiveWork(null)}
                aria-label="Close case study"
                className="absolute top-4 right-4 w-9 h-9 bg-[#0A0A0A] text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <p className="text-xs font-mono text-[#E12D1E] uppercase">{activeWork.client} · {activeWork.year}</p>
              <h3 className="text-2xl font-bold text-[#0A0A0A]" style={{ fontFamily: "'Syne', 'Outfit', sans-serif" }}>
                {activeWork.title}
              </h3>
              <p className="text-sm text-[#3D3D3A] leading-relaxed">{activeWork.summary}</p>
              <p className="text-sm font-bold text-[#0A0A0A] pt-2 border-t border-[#0A0A0A]/15">
                Measured Outcome: <span className="text-[#E12D1E]">{activeWork.impact}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   5. ALDER & VANCE PARTNERS — Executive Strategy & Advisory (BIZ-003)
   Theme: Warm Limestone (#F6F4EF) · Heritage Navy (#0C1B2A) · Champagne Brass (#9A7B4F)
   Typography: Playfair Display + Plus Jakarta Sans
   ============================================================================ */
export const AlderVanceDemo: React.FC<SignatureDemoProps> = ({ template, onRequestQuote }) => {
  const [activePractice, setActivePractice] = useState(0);
  const [selectedOffice, setSelectedOffice] = useState('London');
  const [submitted, setSubmitted] = useState(false);

  const practices = [
    {
      title: 'Mergers, Acquisitions & Divestitures',
      lead: 'Buy-side and sell-side representation for cross-border transactions between $50M and $2B.',
      metric: '$14.8B Advised Since 2018',
      points: ['Commercial & Operational Due Diligence', 'Post-Merger Integration Playbooks', 'Board Valuation & Fairness Opinions']
    },
    {
      title: 'Capital Structure & Private Debt',
      lead: 'Independent balance-sheet advisory free from commercial lending conflicts.',
      metric: '44 Institutional Placements',
      points: ['Growth Equity & Mezzanine Structuring', 'Refinancing & Covenant Negotiation', 'Family Office Co-Investment Syndicates']
    },
    {
      title: 'Board Governance & Turnaround',
      lead: 'Quiet, decisive intervention for boards navigating regulatory shifts or leadership transitions.',
      metric: '96% Multi-Year Retainer Rate',
      points: ['Operating Margin Diagnostics', 'Executive Compensation Architecture', 'Cross-Border Compliance Audits']
    }
  ];

  return (
    <div className="bg-[#F6F4EF] text-[#0C1B2A] min-h-screen font-sans selection:bg-[#9A7B4F] selection:text-white">
      <header className="sticky top-0 z-30 bg-[#0C1B2A] text-white border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          <a
            href="#alder-top"
            onClick={(e) => e.preventDefault()}
            className="text-xl font-semibold tracking-wide text-white whitespace-nowrap shrink-0"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Alder &amp; Vance
          </a>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-wider uppercase text-slate-300">
            <a href="#alder-practices" className="hover:text-white transition-colors whitespace-nowrap shrink-0">Practices</a>
            <a href="#alder-offices" className="hover:text-white transition-colors whitespace-nowrap shrink-0">Global Offices</a>
            <a href="#alder-briefing" className="hover:text-white transition-colors whitespace-nowrap shrink-0">Partner Desk</a>
          </nav>

          <div className="shrink-0">
            <a
              href="#alder-briefing"
              className="px-5 py-2.5 bg-[#9A7B4F] hover:bg-[#82663F] text-white text-xs font-semibold tracking-wider uppercase transition-colors whitespace-nowrap shrink-0"
            >
              Private Briefing
            </a>
          </div>
        </div>
      </header>

      {/* Heritage Navy + Panoramic Boardroom Hero */}
      <section id="alder-top" className="bg-[#0C1B2A] text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs tracking-[0.2em] uppercase text-[#C9AE82]">
              Independent Strategic &amp; Financial Advisory
            </p>
            <h1
              className="text-4xl sm:text-5xl font-normal leading-[1.12] text-white"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", textWrap: 'balance' }}
            >
              Unconflicted counsel for decisive capital moments.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
              We advise boards, sovereign investors, and founder-led enterprises on high-stakes M&amp;A, restructuring, and international market entry.
            </p>
            <div className="pt-2">
              <a
                href="#alder-briefing"
                className="inline-flex items-center gap-2 bg-[#9A7B4F] hover:bg-[#82663F] text-white px-6 py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Schedule Partner Consultation
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 overflow-hidden border border-white/15">
            <img
              src="/src/assets/images/hero_advisory_firm_1795231128545.jpg"
              alt="Alder and Vance executive boardroom overlooking skyline"
              referrerPolicy="no-referrer"
              className="w-full aspect-16/10 object-cover"
            />
          </div>
        </div>

        {/* Institutional Track Record Strip */}
        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { n: '$14.8B', l: 'Advised Transaction Volume' },
              { n: '38', l: 'Cross-Border Jurisdictions' },
              { n: '22 Yrs', l: 'Average Senior Partner Tenure' },
              { n: '96%', l: 'Repeat Board Mandate Rate' }
            ].map((s) => (
              <div key={s.l}>
                <p className="text-2xl font-serif text-[#C9AE82] tabular-nums" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {s.n}
                </p>
                <p className="text-xs text-slate-400 mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Practice Areas Matrix */}
      <section id="alder-practices" className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[#9A7B4F] font-semibold">Core Practices</p>
            <h2 className="text-3xl text-[#0C1B2A] mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Focused institutional expertise
            </h2>
            {practices.map((p, idx) => (
              <button
                key={p.title}
                onClick={() => setActivePractice(idx)}
                className={`w-full text-left p-4 border-b transition-colors flex items-center justify-between ${
                  activePractice === idx
                    ? 'border-[#9A7B4F] bg-white text-[#0C1B2A] font-semibold'
                    : 'border-[#0C1B2A]/10 text-[#4A5568] hover:text-[#0C1B2A]'
                }`}
              >
                <span className="text-sm">{p.title}</span>
                <ArrowRight className={`w-4 h-4 ${activePractice === idx ? 'text-[#9A7B4F]' : 'opacity-30'}`} />
              </button>
            ))}
          </div>

          <div className="lg:col-span-7 bg-white border border-[#0C1B2A]/10 p-8 sm:p-10 space-y-6">
            <p className="text-xs font-mono uppercase tracking-widest text-[#9A7B4F]">
              {practices[activePractice].metric}
            </p>
            <h3 className="text-2xl text-[#0C1B2A]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {practices[activePractice].title}
            </h3>
            <p className="text-sm text-[#4A5568] leading-relaxed">
              {practices[activePractice].lead}
            </p>
            <ul className="space-y-3 pt-4 border-t border-[#0C1B2A]/10">
              {practices[activePractice].points.map((pt) => (
                <li key={pt} className="text-sm text-[#0C1B2A] flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-[#9A7B4F] shrink-0" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Global Office Selector & Confidential Briefing */}
      <section id="alder-briefing" className="bg-white border-t border-[#0C1B2A]/10 py-20">
        <div id="alder-offices" className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#9A7B4F] font-semibold">Global Presence</p>
            <h2 className="text-3xl text-[#0C1B2A]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Select your regional partner desk
            </h2>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {['London', 'Mumbai', 'Singapore', 'Zurich'].map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedOffice(city)}
                  className={`p-4 text-left border transition-colors ${
                    selectedOffice === city
                      ? 'border-[#0C1B2A] bg-[#0C1B2A] text-white'
                      : 'border-[#0C1B2A]/15 bg-[#F6F4EF] text-[#0C1B2A] hover:border-[#9A7B4F]'
                  }`}
                >
                  <p className="font-semibold text-sm">{city}</p>
                  <p className={`text-xs mt-0.5 ${selectedOffice === city ? 'text-slate-300' : 'text-[#5A6577]'}`}>
                    Managing Partners
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#F6F4EF] border border-[#0C1B2A]/10 p-8">
            {submitted ? (
              <div className="py-8 text-center space-y-4">
                <CheckCircle2 className="w-10 h-10 text-[#9A7B4F] mx-auto" />
                <h3 className="text-2xl text-[#0C1B2A]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Confidential Inquiry Logged — {selectedOffice} Desk
                </h3>
                <p className="text-sm text-[#4A5568]">
                  A Managing Partner from our {selectedOffice} office will respond via encrypted email within 4 business hours.
                </p>
                <button
                  onClick={() => onRequestQuote(template)}
                  className="px-6 py-3 bg-[#0C1B2A] text-white text-xs font-semibold uppercase tracking-wider"
                >
                  Build an Advisory Portal Like This
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="space-y-4"
              >
                <h3 className="text-xl text-[#0C1B2A]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Request a Confidential Briefing ({selectedOffice})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required type="text" placeholder="Executive Name & Title" className="bg-white border border-[#0C1B2A]/15 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#9A7B4F]" />
                  <input required type="email" placeholder="Corporate Email" className="bg-white border border-[#0C1B2A]/15 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#9A7B4F]" />
                </div>
                <textarea rows={3} placeholder="Matter summary (optional NDA provided prior to call)" className="w-full bg-white border border-[#0C1B2A]/15 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#9A7B4F] resize-none" />
                <button type="submit" className="w-full bg-[#0C1B2A] hover:bg-[#193048] text-white py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors">
                  Submit to {selectedOffice} Partner Desk
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ============================================================================
   6. ATELIER KOMA — Architecture & Spatial Design Monograph (PORT-001 / PORT-003)
   Theme: Raw Limestone (#ECEAE4) · Carbon Ink (#141413) · Earth Ochre (#8C6239)
   Typography: Playfair Display + JetBrains Mono
   ============================================================================ */
export const AtelierKomaDemo: React.FC<SignatureDemoProps> = ({ template, onRequestQuote }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'ledger'>('grid');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  const projects = [
    {
      code: 'AK-26',
      title: 'Kagawa Limestone Gallery',
      location: 'Naoshima, Japan',
      year: '2026',
      area: '1,420 m²',
      typology: 'Cultural Pavilion',
      materials: ['Honed Travertine', 'Board-Formed Concrete', 'Brushed Bronze'],
      image: '/src/assets/images/hero_architecture_studio_1795231129202.jpg'
    },
    {
      code: 'AK-25',
      title: 'Solis Cliff Residence',
      location: 'Big Sur, California',
      year: '2025',
      area: '640 m²',
      typology: 'Private Residence',
      materials: ['Reclaimed Burmese Teak', 'Basalt Flagstone', 'Low-Iron Glass'],
      image: '/src/assets/images/hero_luxury_estate_1795231129293.jpg'
    },
    {
      code: 'AK-24',
      title: 'Arcadia Botanical Sanctuary',
      location: 'Copenhagen, Denmark',
      year: '2024',
      area: '890 m²',
      typology: 'Wellness Architecture',
      materials: ['White Oak Slats', 'Venetian Terrazzo', 'Limewash Plaster'],
      image: '/src/assets/images/hero_medical_clinic_1795231128255.jpg'
    }
  ];

  return (
    <div className="bg-[#ECEAE4] text-[#141413] min-h-screen font-sans selection:bg-[#8C6239] selection:text-white">
      <header className="sticky top-0 z-30 bg-[#ECEAE4]/95 backdrop-blur-md border-b border-[#141413]/15">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          <a
            href="#koma-top"
            onClick={(e) => e.preventDefault()}
            className="text-lg tracking-[0.22em] uppercase font-medium text-[#141413] whitespace-nowrap shrink-0"
          >
            ATELIER KOMA
          </a>
          <nav className="hidden md:flex items-center gap-8 text-xs tracking-widest uppercase text-[#54524D]">
            <a href="#koma-works" className="hover:text-[#141413] transition-colors whitespace-nowrap shrink-0">Monograph</a>
            <a href="#koma-ethos" className="hover:text-[#141413] transition-colors whitespace-nowrap shrink-0">Materiality</a>
            <a href="#koma-commission" className="hover:text-[#141413] transition-colors whitespace-nowrap shrink-0">Practice</a>
          </nav>
          <button
            onClick={() => onRequestQuote(template)}
            className="text-xs font-mono uppercase tracking-widest border border-[#141413] px-4 py-2 hover:bg-[#141413] hover:text-[#ECEAE4] transition-colors whitespace-nowrap shrink-0"
          >
            Commission
          </button>
        </div>
      </header>

      <section id="koma-top" className="max-w-7xl mx-auto px-6 pt-12 pb-16">
        <div className="relative aspect-16/8 overflow-hidden bg-[#141413]">
          <img
            src="/src/assets/images/hero_architecture_studio_1795231129202.jpg"
            alt="Atelier Koma limestone gallery pavilion"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <h1
            className="lg:col-span-7 text-3xl sm:text-5xl font-normal leading-[1.12] text-[#141413]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", textWrap: 'balance' }}
          >
            Architecture measured in light, proportion, and honest stone.
          </h1>
          <p className="lg:col-span-5 text-sm text-[#4F4D47] leading-relaxed">
            Atelier Koma is an architectural and interior practice operating between Kyoto, Zurich, and Mumbai. Each commission is approached as a singular dialogue between site climate and tactile craftsmanship.
          </p>
        </div>
      </section>

      {/* Switchable Grid vs Archival Ledger */}
      <section id="koma-works" className="max-w-7xl mx-auto px-6 py-16 border-t border-[#141413]/15">
        <div className="flex items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#8C6239]">Selected Works</p>
            <h2 className="text-2xl sm:text-3xl mt-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Architectural Archive
            </h2>
          </div>

          <div className="inline-flex border border-[#141413]/20">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3.5 py-2 text-xs font-mono flex items-center gap-1.5 ${
                viewMode === 'grid' ? 'bg-[#141413] text-[#ECEAE4]' : 'text-[#54524D]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Visual
            </button>
            <button
              onClick={() => setViewMode('ledger')}
              className={`px-3.5 py-2 text-xs font-mono flex items-center gap-1.5 ${
                viewMode === 'ledger' ? 'bg-[#141413] text-[#ECEAE4]' : 'text-[#54524D]'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Ledger
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.map((p) => (
              <article
                key={p.code}
                onClick={() => setSelectedProject(p)}
                className="cursor-pointer group space-y-3"
              >
                <div className="aspect-4/3 overflow-hidden bg-[#141413]">
                  <img
                    src={p.image}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-[#6E6B64]">
                  <span>{p.code} · {p.location}</span>
                  <span className="tabular-nums">{p.area}</span>
                </div>
                <h3 className="text-xl text-[#141413] group-hover:text-[#8C6239] transition-colors" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {p.title}
                </h3>
              </article>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto border-y border-[#141413]/20">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#141413]/15 text-xs font-mono uppercase text-[#6E6B64]">
                  <th className="py-3 pr-4">Index</th>
                  <th className="py-3 pr-4">Commission</th>
                  <th className="py-3 pr-4">Location</th>
                  <th className="py-3 pr-4">Typology</th>
                  <th className="py-3 pr-4 text-right">Area</th>
                  <th className="py-3 text-right">Year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141413]/10">
                {projects.map((p) => (
                  <tr
                    key={p.code}
                    onClick={() => setSelectedProject(p)}
                    className="cursor-pointer hover:bg-white/50 transition-colors"
                  >
                    <td className="py-4 pr-4 font-mono text-xs text-[#8C6239]">{p.code}</td>
                    <td className="py-4 pr-4 font-medium text-[#141413]">{p.title}</td>
                    <td className="py-4 pr-4 text-[#54524D]">{p.location}</td>
                    <td className="py-4 pr-4 text-[#54524D]">{p.typology}</td>
                    <td className="py-4 pr-4 text-right font-mono tabular-nums">{p.area}</td>
                    <td className="py-4 text-right font-mono tabular-nums">{p.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section id="koma-commission" className="border-t border-[#141413]/15 py-16">
        <div id="koma-ethos" className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#8C6239]">2026–2027 Studio Commissions</p>
            <h3 className="text-2xl mt-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Accepting 4 private residential &amp; cultural briefs annually.
            </h3>
          </div>
          <button
            onClick={() => onRequestQuote(template)}
            className="px-6 py-3 bg-[#141413] text-[#ECEAE4] hover:bg-[#8C6239] text-xs font-mono uppercase tracking-widest transition-colors"
          >
            Request Portfolio Website Like This
          </button>
        </div>
      </section>

      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#ECEAE4] max-w-xl w-full border border-[#141413]/30">
            <div className="relative h-60">
              <img src={selectedProject.image} alt={selectedProject.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedProject(null)}
                aria-label="Close project"
                className="absolute top-3 right-3 w-9 h-9 bg-[#141413] text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-7 space-y-4">
              <p className="text-xs font-mono text-[#8C6239]">{selectedProject.code} · {selectedProject.location} · {selectedProject.area}</p>
              <h3 className="text-2xl" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{selectedProject.title}</h3>
              <p className="text-xs font-mono uppercase tracking-wider text-[#6E6B64]">Material Specification</p>
              <div className="flex flex-wrap gap-2">
                {selectedProject.materials.map((m: string) => (
                  <span key={m} className="text-xs border border-[#141413]/25 px-3 py-1 bg-white/60">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   7. VANGUARD / KINETIC SYSTEMS — Swiss Technical B2B & SaaS Flagship (BIZ-001 / LAND-*)
   Theme: Pure Technical White (#FFFFFF) · Slate Ink (#090D16) · Precision Cobalt (#1D4ED8)
   Typography: Outfit + JetBrains Mono
   ============================================================================ */
export const VanguardSystemsDemo: React.FC<SignatureDemoProps> = ({ template, onRequestQuote }) => {
  const [teamSize, setTeamSize] = useState(40);
  const [annual, setAnnual] = useState(true);
  const [demoBooked, setDemoBooked] = useState(false);

  const hoursSaved = teamSize * 6;
  const monthlySavings = hoursSaved * 42;

  return (
    <div className="bg-white text-[#090D16] min-h-screen font-sans selection:bg-[#1D4ED8] selection:text-white">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          <a
            href="#vanguard-top"
            onClick={(e) => e.preventDefault()}
            className="text-lg font-bold tracking-tight text-[#090D16] whitespace-nowrap shrink-0"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Vanguard Systems
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#vanguard-capabilities" className="hover:text-[#090D16] whitespace-nowrap shrink-0">Capabilities</a>
            <a href="#vanguard-roi" className="hover:text-[#090D16] whitespace-nowrap shrink-0">ROI Model</a>
            <a href="#vanguard-pricing" className="hover:text-[#090D16] whitespace-nowrap shrink-0">Plans</a>
          </nav>
          <a
            href="#vanguard-demo"
            className="px-4 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            Schedule Demo
          </a>
        </div>
      </header>

      <section id="vanguard-top" className="max-w-7xl mx-auto px-6 py-16 lg:py-20 border-b border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <p className="text-xs font-mono font-semibold uppercase tracking-widest text-[#1D4ED8]">
              Enterprise Operations Architecture
            </p>
            <h1
              className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.06] text-[#090D16]"
              style={{ fontFamily: "'Outfit', sans-serif", textWrap: 'balance' }}
            >
              Operational software that removes manual bottlenecks across every branch.
            </h1>
            <p className="text-base text-slate-600 leading-relaxed max-w-xl">
              Built for high-growth logistics, finance, and enterprise service teams. Unify approvals, client onboarding, and real-time billing without spreadsheets.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#vanguard-demo"
                className="inline-flex items-center gap-2 bg-[#090D16] hover:bg-[#1D4ED8] text-white px-6 py-3.5 rounded-md text-sm font-semibold transition-colors"
              >
                Book Technical Walkthrough
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#vanguard-roi"
                className="px-5 py-3.5 rounded-md border border-slate-300 text-sm font-semibold text-slate-700 hover:border-[#090D16] transition-colors"
              >
                Calculate Team ROI
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#F8FAFC] border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
            <p className="text-xs font-mono uppercase tracking-wider text-slate-500">Verified Deployment Outcomes</p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-3xl font-bold font-mono text-[#1D4ED8] tabular-nums">-64%</p>
                <p className="text-xs text-slate-600 mt-1">Invoice reconciliation cycle time</p>
              </div>
              <div>
                <p className="text-3xl font-bold font-mono text-[#090D16] tabular-nums">99.98%</p>
                <p className="text-xs text-slate-600 mt-1">Measured uptime over 24 months</p>
              </div>
              <div>
                <p className="text-3xl font-bold font-mono text-[#090D16] tabular-nums">14 Days</p>
                <p className="text-xs text-slate-600 mt-1">Average enterprise go-live</p>
              </div>
              <div>
                <p className="text-3xl font-bold font-mono text-[#090D16] tabular-nums">SOC 2</p>
                <p className="text-xs text-slate-600 mt-1">Type II &amp; ISO 27001 compliant</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator */}
      <section id="vanguard-roi" className="bg-[#F8FAFC] border-b border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs font-mono uppercase tracking-widest text-[#1D4ED8]">Live Impact Estimator</p>
            <h2 className="text-3xl font-bold text-[#090D16]" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Quantify workflow savings before you commit
            </h2>
            <p className="text-sm text-slate-600">
              Slide to your active operations headcount to estimate reclaimed administrative hours per month.
            </p>
          </div>
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span>Operations Team Size</span>
                <span className="font-mono text-[#1D4ED8] tabular-nums">{teamSize} seats</span>
              </div>
              <input
                type="range"
                min={10}
                max={250}
                step={5}
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="w-full accent-[#1D4ED8]"
              />
            </div>
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-500">Reclaimed Hours / Month</p>
                <p className="text-3xl font-bold font-mono text-[#090D16] tabular-nums mt-1">{hoursSaved.toLocaleString()} hrs</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Estimated Monthly Cost Efficiency</p>
                <p className="text-3xl font-bold font-mono text-[#1D4ED8] tabular-nums mt-1">${monthlySavings.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities + Pricing */}
      <section id="vanguard-capabilities" className="max-w-7xl mx-auto px-6 py-16">
        <div id="vanguard-pricing" className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#1D4ED8]">Transparent Licensing</p>
            <h2 className="text-3xl font-bold mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Built to scale with your organization
            </h2>
          </div>
          <div className="inline-flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setAnnual(true)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md ${annual ? 'bg-white text-[#090D16] shadow-xs' : 'text-slate-600'}`}
            >
              Annual Billing (-20%)
            </button>
            <button
              onClick={() => setAnnual(false)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md ${!annual ? 'bg-white text-[#090D16] shadow-xs' : 'text-slate-600'}`}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Growth', price: annual ? 290 : 360, desc: 'For scaling teams up to 25 operators.', items: ['Automated Approvals', 'REST & Webhook API', 'Role-Based Access'] },
            { name: 'Scale', price: annual ? 740 : 920, desc: 'Multi-branch operations with audit logs.', items: ['Unlimited Workflows', 'ERP & Accounting Sync', 'Dedicated Solutions Architect'], featured: true },
            { name: 'Enterprise', price: null, desc: 'Custom SLA, VPC hosting & SSO.', items: ['Private Cloud Deployment', 'Custom Data Residency', '24/7 Priority Engineering'] }
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-7 border flex flex-col justify-between ${
                plan.featured ? 'border-[#1D4ED8] bg-[#F8FAFF]' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-[#090D16]">{plan.name}</h3>
                <p className="text-3xl font-bold font-mono tabular-nums text-[#090D16]">
                  {plan.price ? `$${plan.price}` : 'Custom'}
                  {plan.price && <span className="text-xs font-sans font-normal text-slate-500"> / month</span>}
                </p>
                <p className="text-xs text-slate-600">{plan.desc}</p>
                <ul className="space-y-2.5 pt-4 border-t border-slate-200/80 text-xs text-slate-700">
                  {plan.items.map((it) => (
                    <li key={it} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1D4ED8] shrink-0" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href="#vanguard-demo"
                className={`mt-6 block text-center py-2.5 rounded-md text-xs font-semibold transition-colors ${
                  plan.featured ? 'bg-[#1D4ED8] text-white hover:bg-[#1E40AF]' : 'border border-slate-300 text-[#090D16] hover:border-[#090D16]'
                }`}
              >
                {plan.price ? `Select ${plan.name}` : 'Contact Architecture Team'}
              </a>
            </div>
          ))}
        </div>
      </section>

      <section id="vanguard-demo" className="bg-[#090D16] text-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-5">
          {demoBooked ? (
            <>
              <CheckCircle2 className="w-10 h-10 text-[#60A5FA] mx-auto" />
              <h3 className="text-2xl font-bold">Technical Walkthrough Scheduled</h3>
              <p className="text-sm text-slate-400">Calendar invitation sent with sandbox credentials.</p>
              <button
                onClick={() => onRequestQuote(template)}
                className="px-6 py-3 bg-[#1D4ED8] text-white text-xs font-semibold rounded-md"
              >
                Build a Flagship B2B / SaaS Website Like This
              </button>
            </>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setDemoBooked(true);
              }}
              className="space-y-4"
            >
              <h3 className="text-3xl font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                See Vanguard running on your workflow data
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto pt-2">
                <input
                  type="email"
                  required
                  placeholder="Enter work email"
                  className="flex-1 bg-white/10 border border-white/20 px-4 py-3 rounded-md text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#60A5FA]"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#1D4ED8] hover:bg-[#2563EB] text-white text-sm font-semibold rounded-md whitespace-nowrap"
                >
                  Book Live Demo
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

/* ============================================================================
   8. MERIDIAN BROADSHEET — Editorial Publication & Magazine (BLOG-*)
   Theme: Newsprint Cream (#FAF8F3) · Ink Black (#141414) · Editorial Crimson (#9E1B1B)
   ============================================================================ */
export const MeridianEditorialDemo: React.FC<SignatureDemoProps> = ({ template, onRequestQuote }) => {
  const [section, setSection] = useState<'All' | 'Technology' | 'Markets' | 'Culture'>('All');
  const [readingArticle, setReadingArticle] = useState<any | null>(null);

  const articles = [
    {
      id: 1,
      category: 'Technology' as const,
      title: 'Why Industrial Design Studios Are Returning to Tactile Interfaces in 2026',
      author: 'Arjun Malhotra',
      date: 'November 18, 2026',
      readTime: '7 min read',
      excerpt: 'Across Tokyo, Milan, and San Francisco, digital product teams are abandoning weightless SaaS gradients for crisp print-inspired clarity and structural typography.',
      image: '/src/assets/images/hero_creative_atelier_1795231128877.jpg'
    },
    {
      id: 2,
      category: 'Markets' as const,
      title: 'Inside the New Wave of Independent Private Advisory Boutiques',
      author: 'Claire Beaumont',
      date: 'November 16, 2026',
      readTime: '5 min read',
      excerpt: 'Why mid-market founders are increasingly choosing partner-led independent firms over sprawling global investment banks.',
      image: '/src/assets/images/hero_advisory_firm_1795231128545.jpg'
    },
    {
      id: 3,
      category: 'Culture' as const,
      title: 'The Hearth as Architecture: How Live-Fire Dining Redefined Modern Hospitality',
      author: 'Marco Bellini',
      date: 'November 12, 2026',
      readTime: '6 min read',
      excerpt: 'From limestone counters to open wood-fired kitchens, contemporary restaurants are stripping away barriers between craft and guest.',
      image: '/src/assets/images/hero_fine_dining_1795231129012.jpg'
    }
  ];

  const list = section === 'All' ? articles : articles.filter((a) => a.category === section);

  return (
    <div className="bg-[#FAF8F3] text-[#141414] min-h-screen font-sans selection:bg-[#9E1B1B] selection:text-white">
      <header className="border-b-2 border-[#141414] bg-[#FAF8F3]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-mono text-[#5C5852]">ISSUE NO. 142 · AUTUMN 2026</span>
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight text-[#141414]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            THE MERIDIAN
          </h1>
          <button
            onClick={() => onRequestQuote(template)}
            className="px-4 py-2 bg-[#9E1B1B] hover:bg-[#7D1414] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Subscribe
          </button>
        </div>
        <div className="border-t border-[#141414]/15">
          <div className="max-w-6xl mx-auto px-6 py-2.5 flex items-center justify-center gap-6 text-xs font-semibold uppercase tracking-widest">
            {(['All', 'Technology', 'Markets', 'Culture'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSection(cat)}
                className={`py-1 transition-colors ${
                  section === cat ? 'text-[#9E1B1B] border-b-2 border-[#9E1B1B]' : 'text-[#5C5852] hover:text-[#141414]'
                }`}
              >
                {cat === 'All' ? 'Front Page' : cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {list.map((art, i) => (
          <article
            key={art.id}
            onClick={() => setReadingArticle(art)}
            className={`cursor-pointer group grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-[#141414]/15 ${
              i === 0 ? 'items-center' : 'items-start'
            }`}
          >
            <div className={`${i === 0 ? 'lg:col-span-7' : 'lg:col-span-5'} overflow-hidden bg-[#141414]`}>
              <img
                src={art.image}
                alt={art.title}
                referrerPolicy="no-referrer"
                className="w-full aspect-16/10 object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className={`${i === 0 ? 'lg:col-span-5' : 'lg:col-span-7'} space-y-3`}>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#9E1B1B]">
                {art.category} · {art.readTime}
              </p>
              <h2
                className={`${i === 0 ? 'text-3xl sm:text-4xl' : 'text-2xl'} font-semibold leading-tight group-hover:text-[#9E1B1B] transition-colors`}
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {art.title}
              </h2>
              <p className="text-sm text-[#4A4640] leading-relaxed">{art.excerpt}</p>
              <p className="text-xs text-[#706B63] pt-2">
                By {art.author} · {art.date}
              </p>
            </div>
          </article>
        ))}
      </main>

      {readingArticle && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#FAF8F3] max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#141414] p-8 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#9E1B1B]">
                {readingArticle.category} · {readingArticle.readTime}
              </span>
              <button onClick={() => setReadingArticle(null)} aria-label="Close article" className="p-1.5 hover:bg-black/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-3xl font-bold leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {readingArticle.title}
            </h2>
            <p className="text-xs text-[#706B63]">By {readingArticle.author} · {readingArticle.date}</p>
            <img src={readingArticle.image} alt={readingArticle.title} referrerPolicy="no-referrer" className="w-full aspect-16/9 object-cover" />
            <p className="text-base text-[#2D2A26] leading-relaxed">{readingArticle.excerpt}</p>
            <p className="text-sm text-[#4A4640] leading-relaxed">
              Modern readers reward clarity, editorial pacing, and distraction-free reading layouts. Every publication we build combines crisp serif typography with instant article search, newsletter capture, and subscriber paywall readiness.
            </p>
            <div className="pt-4 border-t border-[#141414]/15 flex justify-end">
              <button
                onClick={() => onRequestQuote(template)}
                className="px-5 py-2.5 bg-[#9E1B1B] text-white text-xs font-semibold uppercase tracking-wider"
              >
                Build an Editorial Publication Like This
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   9. ALDERBROOK INSTITUTE — Prestige Academic & Campus Portal (EDU-*)
   Theme: Academic Ivory (#F8F7F2) · Deep Collegiate Green (#0F3D2E) · Warm Gold (#B5892F)
   ============================================================================ */
export const CollegiateAcademyDemo: React.FC<SignatureDemoProps> = ({ template, onRequestQuote }) => {
  const [school, setSchool] = useState<'All' | 'Engineering' | 'Design' | 'Business'>('All');
  const [tourBooked, setTourBooked] = useState(false);

  const programs = [
    { title: 'B.S. in Computational Systems & AI', school: 'Engineering' as const, duration: '4 Years', intake: 'Autumn 2027' },
    { title: 'M.Des in Spatial & Product Architecture', school: 'Design' as const, duration: '2 Years', intake: 'Autumn 2027' },
    { title: 'Executive MBA in Global Enterprise', school: 'Business' as const, duration: '18 Months', intake: 'Spring 2027' },
    { title: 'Applied Robotics & Autonomous Hardware', school: 'Engineering' as const, duration: '4 Years', intake: 'Autumn 2027' }
  ];

  const visible = school === 'All' ? programs : programs.filter((p) => p.school === school);

  return (
    <div className="bg-[#F8F7F2] text-[#11241D] min-h-screen font-sans selection:bg-[#0F3D2E] selection:text-white">
      <header className="sticky top-0 z-30 bg-[#0F3D2E] text-white border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          <span
            className="text-xl font-semibold tracking-tight whitespace-nowrap shrink-0"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Alderbrook Institute
          </span>
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium uppercase tracking-wider text-emerald-100/80">
            <a href="#edu-programs" className="hover:text-white whitespace-nowrap shrink-0">Programs</a>
            <a href="#edu-admissions" className="hover:text-white whitespace-nowrap shrink-0">Admissions</a>
          </nav>
          <a
            href="#edu-admissions"
            className="px-4 py-2 bg-[#B5892F] hover:bg-[#9B7323] text-white text-xs font-semibold uppercase tracking-wider whitespace-nowrap shrink-0"
          >
            Apply Now
          </a>
        </div>
      </header>

      <section className="bg-[#0F3D2E] text-white py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#E0BE74]">Established 1964 · Research &amp; Applied Sciences</p>
            <h1 className="text-4xl sm:text-5xl leading-[1.1]" style={{ fontFamily: "'Playfair Display', Georgia, serif", textWrap: 'balance' }}>
              Preparing builders, researchers, and leaders for the next century.
            </h1>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              Small seminar cohorts, funded research laboratories, and 97% graduate placement across global engineering and design practices.
            </p>
          </div>
          <div className="lg:col-span-6 overflow-hidden border border-white/15">
            <img
              src="/src/assets/images/hero_architecture_studio_1795231129202.jpg"
              alt="Alderbrook Institute main campus pavilion"
              referrerPolicy="no-referrer"
              className="w-full aspect-16/10 object-cover"
            />
          </div>
        </div>
      </section>

      <section id="edu-programs" className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#B5892F]">Academic Catalog</p>
            <h2 className="text-3xl mt-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Degree &amp; Fellowship Programs
            </h2>
          </div>
          <div className="inline-flex bg-white border border-[#0F3D2E]/15 p-1">
            {(['All', 'Engineering', 'Design', 'Business'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSchool(s)}
                className={`px-3.5 py-1.5 text-xs font-semibold ${school === s ? 'bg-[#0F3D2E] text-white' : 'text-[#3F594E]'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visible.map((prog) => (
            <div key={prog.title} className="bg-white border border-[#0F3D2E]/15 p-6 flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-[#B5892F] uppercase tracking-wider">{prog.school}</p>
                <h3 className="text-lg font-bold text-[#11241D]">{prog.title}</h3>
                <p className="text-xs text-[#546B60] flex items-center gap-3 pt-1">
                  <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> {prog.duration}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Next Intake: {prog.intake}</span>
                </p>
              </div>
              <a href="#edu-admissions" className="text-xs font-semibold text-[#0F3D2E] hover:underline shrink-0">
                Syllabus
              </a>
            </div>
          ))}
        </div>
      </section>

      <section id="edu-admissions" className="bg-white border-t border-[#0F3D2E]/15 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-5">
          {tourBooked ? (
            <>
              <CheckCircle2 className="w-10 h-10 text-[#0F3D2E] mx-auto" />
              <h3 className="text-2xl" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Admissions Prospectus &amp; Campus Tour Confirmed
              </h3>
              <button
                onClick={() => onRequestQuote(template)}
                className="px-6 py-3 bg-[#0F3D2E] text-white text-xs font-semibold uppercase tracking-wider"
              >
                Build an Educational Portal Like This
              </button>
            </>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setTourBooked(true);
              }}
              className="space-y-4"
            >
              <BookOpen className="w-7 h-7 text-[#B5892F] mx-auto" />
              <h3 className="text-3xl" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Request Admissions Prospectus or Campus Visit
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto pt-2">
                <input required type="text" placeholder="Student / Parent Name" className="border border-[#0F3D2E]/20 px-4 py-2.5 text-sm" />
                <input required type="email" placeholder="Email Address" className="border border-[#0F3D2E]/20 px-4 py-2.5 text-sm" />
              </div>
              <button type="submit" className="px-7 py-3 bg-[#0F3D2E] hover:bg-[#0A2C21] text-white text-xs font-semibold uppercase tracking-wider">
                Book Campus Visit
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Award,
  CheckCircle2,
  Lock,
  Globe,
  Sliders,
  Sparkles,
  Layers,
  MapPin,
  ExternalLink,
  ChevronRight,
  Check,
  Building2,
  Users,
  Compass,
  FileText,
  Clock,
  Phone,
  Calendar,
  Send,
  Eye
} from 'lucide-react';
import { BusinessTemplateItem } from '../../../types';

interface TemplateDemoProps {
  template: BusinessTemplateItem;
  onUseDesign: (template: BusinessTemplateItem) => void;
  externalActivePage?: string;
  onPageChange?: (page: string) => void;
}

// ============================================================================
// TEMPLATE 11: Luxury Consultant (Aurelius Sovereign Advisory)
// Dominant: Luminous Pearl Ivory (#FAF8F5) | Royal Champagne Gold (#D4AF37)
// Bright, opulent aesthetic with 5 dedicated navigable pages
// ============================================================================
export const LuxuryConsultantDemo: React.FC<TemplateDemoProps> = ({ template, onUseDesign, externalActivePage, onPageChange }) => {
  const [internalTab, setInternalTab] = useState<'overview' | 'sovereign' | 'family-office' | 'credentials' | 'consultation'>('overview');
  const [ndaAgreed, setNdaAgreed] = useState(false);

  const activeTab = (externalActivePage as any) || internalTab;

  const navigateTo = (tab: 'overview' | 'sovereign' | 'family-office' | 'credentials' | 'consultation') => {
    setInternalTab(tab);
    if (onPageChange) onPageChange(tab);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] font-serif flex flex-col selection:bg-[#D4AF37] selection:text-white">
      {/* Top Banner with Discretion notice */}
      <div className="bg-[#F3EFEA] border-b border-[#E7DFD3] px-6 sm:px-12 py-2 text-[11px] font-sans text-stone-600 flex justify-between items-center">
        <span className="tracking-widest uppercase text-[10px] text-amber-700 font-bold flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
          <span>Strictly Confidential &bull; By Private Recommendation</span>
        </span>
        <span className="hidden sm:inline font-mono text-[10px]">Geneva &bull; Zurich &bull; London &bull; Singapore</span>
      </div>

      {/* Minimal Luxury Navigation with Gold Hairlines */}
      <header className="border-b border-[#E7DFD3] px-6 sm:px-12 py-5 flex items-center justify-between sticky top-0 bg-[#FAF8F5]/95 backdrop-blur-md z-30 shadow-xs">
        <button onClick={() => navigateTo('overview')} className="flex items-center gap-2 text-left">
          <span className="text-sm font-mono font-bold tracking-[0.25em] text-[#B45309] uppercase">
            AURELIUS
          </span>
          <span className="text-[11px] text-stone-500 font-sans tracking-widest uppercase">| Family Office</span>
        </button>

        <nav className="hidden md:flex items-center space-x-6 text-xs font-sans tracking-widest uppercase text-stone-600 font-semibold">
          {[
            { id: 'overview' as const, label: '1. Overview' },
            { id: 'sovereign' as const, label: '2. Sovereign Trusts' },
            { id: 'family-office' as const, label: '3. Family Office' },
            { id: 'credentials' as const, label: '4. Credentials' },
            { id: 'consultation' as const, label: '5. Consultation' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigateTo(tab.id)}
              className={`transition-colors py-1 ${
                activeTab === tab.id ? 'text-[#B45309] font-bold border-b-2 border-[#D4AF37]' : 'hover:text-[#B45309]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => navigateTo('consultation')}
          className="text-xs font-sans font-bold uppercase tracking-widest bg-[#D4AF37] hover:bg-[#B45309] text-white px-4 py-2 rounded shadow-xs transition-colors"
        >
          Private Engagement &rarr;
        </button>
      </header>

      {/* PAGE 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <main className="flex-1 py-16 px-6 sm:px-12 max-w-5xl mx-auto w-full space-y-12 text-center animate-in fade-in duration-300">
          <div className="space-y-4">
            <span className="font-sans text-[11px] font-black tracking-[0.3em] uppercase text-[#B45309] bg-amber-100/60 px-3.5 py-1 rounded-full border border-amber-200 inline-block">
              Fiduciary Sovereign Advisory
            </span>

            <h1 className="text-4xl sm:text-6xl font-light tracking-tight leading-[1.12] text-stone-900">
              Sovereign Wealth Structuring for Multi-Generational Dynasties.
            </h1>

            <p className="font-sans text-stone-600 text-sm max-w-2xl mx-auto leading-relaxed">
              {template.tagline}
            </p>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-4 font-sans text-xs">
            <button
              onClick={() => navigateTo('sovereign')}
              className="px-6 py-3 bg-[#B45309] text-white font-bold rounded-lg shadow-md hover:bg-[#92400E] transition-all"
            >
              Explore Sovereign Trusts &rarr;
            </button>
            <button
              onClick={() => navigateTo('family-office')}
              className="px-6 py-3 bg-white border border-[#E7DFD3] text-stone-800 font-bold rounded-lg hover:bg-stone-50 transition-all"
            >
              Family Office Services
            </button>
          </div>

          <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left font-sans">
            <div className="p-8 rounded-2xl bg-white border border-[#E7DFD3] shadow-xs space-y-3">
              <span className="text-xs font-mono font-bold text-amber-700">PILLAR I</span>
              <h4 className="text-lg font-serif text-stone-900">Cross-Border Trust Structuring</h4>
              <p className="text-xs text-stone-600 leading-relaxed">Multi-jurisdictional private trusts designed for impenetrable asset protection and succession continuity.</p>
            </div>
            <div className="p-8 rounded-2xl bg-white border border-[#E7DFD3] shadow-xs space-y-3">
              <span className="text-xs font-mono font-bold text-amber-700">PILLAR II</span>
              <h4 className="text-lg font-serif text-stone-900">Singapore VCC &amp; Family Offices</h4>
              <p className="text-xs text-stone-600 leading-relaxed">Section 13O and 13U tax incentive regimes for global wealth administration in Southeast Asia.</p>
            </div>
            <div className="p-8 rounded-2xl bg-white border border-[#E7DFD3] shadow-xs space-y-3">
              <span className="text-xs font-mono font-bold text-amber-700">PILLAR III</span>
              <h4 className="text-lg font-serif text-stone-900">Philanthropic Endowments</h4>
              <p className="text-xs text-stone-600 leading-relaxed">Structuring enduring charitable foundations and cultural patronage vehicles with zero tax leakages.</p>
            </div>
          </div>
        </main>
      )}

      {/* PAGE 2: SOVEREIGN TRUSTS */}
      {activeTab === 'sovereign' && (
        <main className="flex-1 py-16 px-6 sm:px-12 max-w-5xl mx-auto w-full space-y-10 animate-in fade-in duration-300 font-sans">
          <div className="space-y-3 text-left">
            <span className="text-[11px] text-[#B45309] tracking-widest uppercase font-mono font-bold">PAGE 2 OF 5 &bull; TRUST ARCHITECTURE</span>
            <h2 className="text-3xl sm:text-5xl font-serif text-stone-900">Sovereign Jurisdictions &amp; Asset Protection</h2>
            <p className="text-xs text-stone-600 max-w-2xl">We structure bespoke private fiduciary instruments across the world's most stable, rule-of-law jurisdictions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { jurisdiction: 'Switzerland (Geneva / Zurich)', legal: 'Swiss Private Trust & Foundation Law', features: 'Maximum banking secrecy, institutional stability, and treaty protection.' },
              { jurisdiction: 'Singapore (MAS Regulated)', legal: 'Variable Capital Companies (VCC)', features: 'Section 13O / 13U tax exemptions, Asian private wealth gateway.' },
              { jurisdiction: 'Liechtenstein & Luxembourg', legal: 'Stiftung & Specialized Investment Funds', features: 'Civil-law perpetual foundations with customizable family voting rights.' },
              { jurisdiction: 'Cayman Islands & Bermuda', legal: 'STAR Trusts & Segregated Portfolio Companies', features: 'Zero corporate tax, flexible governance rules, and English common law supremacy.' }
            ].map((jur, idx) => (
              <div key={idx} className="p-6 bg-white border border-[#E7DFD3] rounded-2xl shadow-xs space-y-2">
                <span className="text-xs font-mono font-bold text-[#B45309]">{jur.jurisdiction}</span>
                <h4 className="text-base font-serif text-stone-900">{jur.legal}</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{jur.features}</p>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* PAGE 3: FAMILY OFFICE */}
      {activeTab === 'family-office' && (
        <main className="flex-1 py-16 px-6 sm:px-12 max-w-5xl mx-auto w-full space-y-10 animate-in fade-in duration-300 font-sans">
          <div className="space-y-3 text-left">
            <span className="text-[11px] text-[#B45309] tracking-widest uppercase font-mono font-bold">PAGE 3 OF 5 &bull; GOVERNANCE PROTOCOLS</span>
            <h2 className="text-3xl sm:text-5xl font-serif text-stone-900">Single &amp; Multi-Family Office Governance</h2>
            <p className="text-xs text-stone-600 max-w-2xl">Codifying decision-making rights, matrimonial property agreements, and generational continuity.</p>
          </div>

          <div className="space-y-4">
            {[
              { title: 'Generational Charter & Family Constitution', desc: 'Codifying decision-making rights, educational stipends, matrimonial covenants, and dispute conciliation.' },
              { title: 'Consolidated Global Custody Reporting', desc: 'Real-time multi-custodian portfolio aggregation across private banking centers in Geneva, London, Zurich, and Singapore.' },
              { title: 'Philanthropic Foundations & Endowments', desc: 'Structuring tax-exempt international philanthropic bodies for enduring cultural, medical, and educational legacies.' }
            ].map((srv, idx) => (
              <div key={idx} className="p-6 bg-white border border-[#E7DFD3] rounded-2xl shadow-xs space-y-1">
                <h4 className="text-base font-serif text-stone-900 font-bold">{srv.title}</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{srv.desc}</p>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* PAGE 4: CREDENTIALS */}
      {activeTab === 'credentials' && (
        <main className="flex-1 py-16 px-6 sm:px-12 max-w-4xl mx-auto w-full space-y-8 animate-in fade-in duration-300 font-sans text-xs">
          <div className="space-y-2 text-center">
            <span className="text-[11px] text-[#B45309] tracking-widest uppercase font-mono font-bold">PAGE 4 OF 5 &bull; CONFIDENTIAL CREDENTIALS</span>
            <h2 className="text-3xl font-serif text-stone-900">Advisory Fiduciary Track Record</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-6 bg-white border border-[#E7DFD3] rounded-2xl shadow-xs">
              <div className="text-3xl font-serif text-[#B45309] font-bold">$24B+</div>
              <div className="text-stone-600 mt-1">Assets Supervised</div>
            </div>
            <div className="p-6 bg-white border border-[#E7DFD3] rounded-2xl shadow-xs">
              <div className="text-3xl font-serif text-[#B45309] font-bold">48</div>
              <div className="text-stone-600 mt-1">Families Advised</div>
            </div>
            <div className="p-6 bg-white border border-[#E7DFD3] rounded-2xl shadow-xs">
              <div className="text-3xl font-serif text-[#B45309] font-bold">100%</div>
              <div className="text-stone-600 mt-1">Retention Rate</div>
            </div>
            <div className="p-6 bg-white border border-[#E7DFD3] rounded-2xl shadow-xs">
              <div className="text-3xl font-serif text-[#B45309] font-bold">36 Yrs</div>
              <div className="text-stone-600 mt-1">Fiduciary Heritage</div>
            </div>
          </div>
        </main>
      )}

      {/* PAGE 5: CONSULTATION */}
      {activeTab === 'consultation' && (
        <main className="flex-1 py-16 px-6 max-w-xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-sans">
          <div className="text-center space-y-2">
            <span className="text-[11px] text-[#B45309] tracking-widest uppercase font-mono font-bold">PAGE 5 OF 5 &bull; PRIVATE MANDATE</span>
            <h2 className="text-3xl font-serif text-stone-900">Request Confidential Consultation</h2>
            <p className="text-xs text-stone-600">All submissions are protected under strict Swiss attorney-client fiduciary privilege.</p>
          </div>

          <div className="p-8 bg-white border border-[#E7DFD3] rounded-2xl shadow-lg space-y-4 text-xs">
            <label className="flex items-start gap-2.5 cursor-pointer text-stone-700">
              <input
                type="checkbox"
                checked={ndaAgreed}
                onChange={(e) => setNdaAgreed(e.target.checked)}
                className="mt-0.5 rounded text-amber-600"
              />
              <span>I confirm that I represent a family principal or authorized legal counsel, and agree to standard mutual non-disclosure terms.</span>
            </label>

            <input type="text" placeholder="Principal Name / Advisory Counsel" className="w-full p-3 bg-stone-50 border border-stone-200 rounded text-xs text-stone-900" />
            <input type="email" placeholder="Confidential Secure Email" className="w-full p-3 bg-stone-50 border border-stone-200 rounded text-xs text-stone-900" />
            
            <button
              onClick={() => onUseDesign(template)}
              disabled={!ndaAgreed}
              className={`w-full py-3.5 bg-[#B45309] text-white font-bold text-xs uppercase tracking-widest rounded shadow-md ${
                !ndaAgreed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#92400E]'
              }`}
            >
              Transmit Consultation Request &rarr;
            </button>
          </div>
        </main>
      )}

      <footer className="mt-auto py-8 text-center font-sans text-[11px] text-stone-500 border-t border-[#E7DFD3] bg-[#FAF8F5]">
        &copy; {new Date().getFullYear()} Aurelius Sovereign Advisory &bull; Luminous Pearl Ivory &amp; Champagne Gold ({template.templateCode}) &bull; 5 Dedicated Pages.
      </footer>
    </div>
  );
};

// ============================================================================
// TEMPLATE 12: Executive Platinum (Vanguard Executive Partners)
// Dominant: Crisp Polar White (#F8FAFC) | Sapphire Cobalt (#1D4ED8)
// Luminous, authoritative C-suite corporate design with 5 dedicated pages
// ============================================================================
export const ExecutiveDarkDemo: React.FC<TemplateDemoProps> = ({ template, onUseDesign, externalActivePage, onPageChange }) => {
  const [internalTab, setInternalTab] = useState<'briefing' | 'mandates' | 'metrics' | 'governance' | 'contact'>('briefing');
  const activeTab = (externalActivePage as any) || internalTab;

  const navigateTo = (tab: 'briefing' | 'mandates' | 'metrics' | 'governance' | 'contact') => {
    setInternalTab(tab);
    if (onPageChange) onPageChange(tab);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Executive Command Header with Live Market Ticker */}
      <div className="bg-[#EFF6FF] border-b border-blue-200/60 px-6 sm:px-8 py-2 text-[10px] font-mono text-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>S&amp;P 500: <strong className="text-emerald-600">5,420.12 (+0.6%)</strong></span>
          <span>NASDAQ: <strong className="text-emerald-600">17,890.40 (+1.1%)</strong></span>
          <span>US 10Y: <strong className="text-blue-700">4.18%</strong></span>
        </div>
        <span className="text-blue-700 font-bold hidden sm:inline">C-SUITE DIRECT LINE: +1 (212) 555-EXEC</span>
      </div>

      <header className="px-6 sm:px-8 py-4 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-30 shadow-xs">
        <button onClick={() => navigateTo('briefing')} className="flex items-center gap-3 text-left">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
            VP
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900">{template.sampleBusinessName}</span>
        </button>

        <nav className="hidden md:flex items-center space-x-6 text-xs font-bold text-slate-600">
          {[
            { id: 'briefing' as const, label: '1. Executive Briefing' },
            { id: 'mandates' as const, label: '2. M&A Mandates' },
            { id: 'metrics' as const, label: '3. Market Telemetry' },
            { id: 'governance' as const, label: '4. Governance' },
            { id: 'contact' as const, label: '5. Consultation' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigateTo(tab.id)}
              className={`transition-colors py-1 ${
                activeTab === tab.id ? 'text-blue-600 font-black border-b-2 border-blue-600' : 'hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => navigateTo('contact')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-bold rounded-lg shadow-md transition-colors"
        >
          Book Consultation &rarr;
        </button>
      </header>

      {/* PAGE 1: BRIEFING */}
      {activeTab === 'briefing' && (
        <main className="flex-1 py-16 px-6 sm:px-8 max-w-6xl mx-auto w-full space-y-12 animate-in fade-in duration-300">
          <div className="space-y-4 max-w-3xl">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Institutional M&amp;A &bull; 5 Dedicated Pages
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
              Transforming Enterprise Balance Sheets for Global Industry Titans.
            </h1>
            <p className="text-slate-600 text-base leading-relaxed">
              {template.tagline}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-xs font-bold text-slate-700">
            <div><div className="text-2xl font-black text-blue-600">$42B+</div>Advisory Volume</div>
            <div><div className="text-2xl font-black text-blue-600">24</div>Jurisdictions</div>
            <div><div className="text-2xl font-black text-blue-600">100%</div>Retained Rate</div>
            <div><div className="text-2xl font-black text-blue-600">Tier-1</div>Audit Clearance</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Cross-Border M&A Syndication', desc: 'Structuring leveraged buyouts, regulatory antitrust clearances, and cross-jurisdictional tax structuring.' },
              { title: 'Special Situations Restructuring', desc: 'Crisis turnaround leadership, accelerated balance sheet stabilization, and senior creditor negotiations.' },
              { title: 'Executive Succession Architecture', desc: 'Board-mandated succession continuity for family-founded publicly listed multinationals.' }
            ].map((cap, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <h4 className="font-bold text-sm text-slate-900">{cap.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* PAGE 2: MANDATES */}
      {activeTab === 'mandates' && (
        <main className="flex-1 py-16 px-6 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase font-mono">PAGE 2 OF 5 &bull; TRANSACTIONS</span>
            <h2 className="text-3xl font-black text-slate-900">Closed Enterprise M&amp;A Mandates</h2>
          </div>
          <div className="space-y-4">
            {[
              { deal: '$3.8B Telecommunications Spin-Off', sector: 'Digital Infrastructure', outcome: 'Carve-out executed with dual Frankfurt/London listing.' },
              { deal: '$1.4B Semiconductor Foundry Syndication', sector: 'Advanced Manufacturing', outcome: 'Consortium financing cleared by antitrust regulators.' },
              { deal: '$920M Sovereign Energy Transition Recap', sector: 'Energy & Utilities', outcome: 'Senior secured debt re-profiled across 18 institutional funds.' }
            ].map((d, idx) => (
              <div key={idx} className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
                <span className="text-[10px] text-blue-600 font-mono font-bold uppercase">{d.sector}</span>
                <h4 className="text-lg font-bold text-slate-900">{d.deal}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{d.outcome}</p>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* PAGE 3: METRICS */}
      {activeTab === 'metrics' && (
        <main className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase font-mono">PAGE 3 OF 5 &bull; TELEMETRY</span>
            <h2 className="text-3xl font-black text-slate-900">Global Economic Telemetry</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
              <span className="text-xs text-blue-600 font-bold">M&amp;A MULTIPLES INDEX</span>
              <p className="text-xs text-slate-600 leading-relaxed">Enterprise EBITDA transaction medians across software (14.2x) and industrial logistics (8.4x).</p>
            </div>
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
              <span className="text-xs text-blue-600 font-bold">CROSS-BORDER CAPITAL SPREADS</span>
              <p className="text-xs text-slate-600 leading-relaxed">Foreign exchange hedging slippage margins tracking at historical low of 1.2 basis points.</p>
            </div>
          </div>
        </main>
      )}

      {/* PAGE 4: GOVERNANCE */}
      {activeTab === 'governance' && (
        <main className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase font-mono">PAGE 4 OF 5 &bull; BOARD PROTOCOLS</span>
            <h2 className="text-3xl font-black text-slate-900">Boardroom Governance Protocols</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            We structure fiduciary independence charters and audit committee charters for Fortune 500 boards facing shareholder activist campaigns.
          </p>
        </main>
      )}

      {/* PAGE 5: CONTACT */}
      {activeTab === 'contact' && (
        <main className="flex-1 py-16 px-6 max-w-xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase font-mono">PAGE 5 OF 5 &bull; C-SUITE DESK</span>
            <h2 className="text-3xl font-black text-slate-900 text-center">Schedule C-Suite Consultation</h2>
          </div>
          <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-md space-y-4">
            <input type="text" placeholder="Executive Name & Title" className="w-full p-3 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900" />
            <input type="email" placeholder="Corporate Email" className="w-full p-3 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900" />
            <button onClick={() => onUseDesign(template)} className="w-full py-3 bg-blue-600 text-white font-bold rounded shadow hover:bg-blue-700">
              Initiate Confidential Briefing &rarr;
            </button>
          </div>
        </main>
      )}

      <footer className="mt-auto py-8 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        &copy; {new Date().getFullYear()} {template.sampleBusinessName} &bull; Crisp Polar White &amp; Royal Cobalt ({template.templateCode}) &bull; 5 Dedicated Pages.
      </footer>
    </div>
  );
};

// ============================================================================
// TEMPLATE 13: Editorial Luxury (Maison Sandstone)
// Dominant: Sunlit Sandstone (#FFFDF9) | Warm Caramel Bronze (#B45309)
// Luminous high-luxury artisanal aesthetic with 5 dedicated pages
// ============================================================================
export const EditorialLuxuryDemo: React.FC<TemplateDemoProps> = ({ template, onUseDesign, externalActivePage, onPageChange }) => {
  const [internalTab, setInternalTab] = useState<'atelier' | 'editions' | 'heritage' | 'acquisitions' | 'contact'>('atelier');
  const activeTab = (externalActivePage as any) || internalTab;

  const navigateTo = (tab: 'atelier' | 'editions' | 'heritage' | 'acquisitions' | 'contact') => {
    setInternalTab(tab);
    if (onPageChange) onPageChange(tab);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#292524] font-serif flex flex-col selection:bg-[#B45309] selection:text-white">
      <header className="px-8 py-6 border-b border-[#EDE5DA] flex items-center justify-between sticky top-0 bg-[#FFFDF9]/95 z-30 shadow-xs">
        <button onClick={() => navigateTo('atelier')} className="text-xl font-black uppercase tracking-widest text-[#292524]">
          {template.sampleBusinessName}
        </button>

        <nav className="hidden md:flex items-center space-x-8 text-xs font-sans tracking-widest uppercase text-stone-600">
          {[
            { id: 'atelier' as const, label: '1. Atelier Home' },
            { id: 'editions' as const, label: '2. Limited Editions' },
            { id: 'heritage' as const, label: '3. Heritage' },
            { id: 'acquisitions' as const, label: '4. Acquisitions' },
            { id: 'contact' as const, label: '5. Private Client' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => navigateTo(t.id)}
              className={`transition-colors py-1 ${activeTab === t.id ? 'text-[#B45309] font-bold border-b-2 border-[#B45309]' : 'hover:text-[#B45309]'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <button onClick={() => navigateTo('contact')} className="text-xs font-sans font-bold uppercase tracking-widest text-white bg-[#B45309] hover:bg-[#92400E] px-4 py-2 rounded">
          Private Salon
        </button>
      </header>

      {/* PAGE 1: ATELIER */}
      {activeTab === 'atelier' && (
        <main className="flex-1 py-16 px-8 max-w-5xl mx-auto w-full space-y-10 animate-in fade-in duration-300">
          <div className="space-y-4 max-w-3xl text-left">
            <span className="font-sans text-xs tracking-widest text-[#B45309] uppercase font-bold">Page 1 of 5 &bull; High Atelier Craft</span>
            <h1 className="text-4xl sm:text-6xl font-light text-[#292524] leading-tight">
              Bespoke Materiality &amp; Timeless Architectural Objects.
            </h1>
            <p className="font-sans text-sm text-stone-600 leading-relaxed">{template.tagline}</p>
          </div>
          <div className="aspect-16/9 rounded-2xl overflow-hidden shadow-xl">
            <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000&auto=format&fit=crop&q=80" alt="Atelier craft" className="w-full h-full object-cover" />
          </div>
        </main>
      )}

      {/* PAGE 2: EDITIONS */}
      {activeTab === 'editions' && (
        <main className="flex-1 py-16 px-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
          <span className="font-sans text-xs tracking-widest text-[#B45309] uppercase font-bold">Page 2 of 5 &bull; Numbered Pieces</span>
          <h2 className="text-3xl font-black text-[#292524]">Limited Haute Editions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Damascus Complication Chronometer', 'Tourbillon Skeleton No. 04', 'Perpetual Moonphase Atelier Edition'].map((item, i) => (
              <div key={i} className="p-6 bg-white border border-[#EDE5DA] rounded-2xl shadow-xs space-y-2">
                <span className="text-[10px] text-amber-700 font-mono">EDITION 0{i + 1}</span>
                <h4 className="font-bold text-base text-stone-900">{item}</h4>
                <p className="text-xs text-stone-600 font-sans">Individual numbered series hand-sculpted in Geneva.</p>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* PAGE 3: HERITAGE */}
      {activeTab === 'heritage' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
          <span className="font-sans text-xs tracking-widest text-[#B45309] uppercase font-bold">Page 3 of 5 &bull; Lineage</span>
          <h2 className="text-3xl font-black text-[#292524]">Generational Heritage &amp; Artisanal Lineage</h2>
          <p className="font-sans text-sm text-stone-600 leading-relaxed">
            For three generations, our artisans have preserved the rare crafts of manual guilloché, micro-chamfering, and hand-forged Damascus steel.
          </p>
        </main>
      )}

      {/* PAGE 4: ACQUISITIONS */}
      {activeTab === 'acquisitions' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
          <span className="font-sans text-xs tracking-widest text-[#B45309] uppercase font-bold">Page 4 of 5 &bull; Salon Registry</span>
          <h2 className="text-3xl font-black text-[#292524]">Curated Acquisitions Portfolio</h2>
          <p className="font-sans text-sm text-stone-600 leading-relaxed">
            Exclusive provenance registration and secondary market valuation services for registered patrons.
          </p>
        </main>
      )}

      {/* PAGE 5: CONTACT */}
      {activeTab === 'contact' && (
        <main className="flex-1 py-16 px-8 max-w-xl mx-auto w-full space-y-6 animate-in fade-in duration-300 text-center font-sans">
          <span className="text-xs tracking-widest text-[#B45309] uppercase font-bold font-mono">Page 5 of 5 &bull; Concierge</span>
          <h2 className="text-3xl font-serif text-[#292524]">Book Private Client Salon Appointment</h2>
          <button onClick={() => onUseDesign(template)} className="px-8 py-3.5 bg-[#B45309] hover:bg-[#92400E] text-white font-bold text-xs uppercase tracking-wider rounded">
            Request Private Appointment &rarr;
          </button>
        </main>
      )}

      <footer className="mt-auto py-8 text-center text-xs font-sans text-stone-500 border-t border-[#EDE5DA] bg-[#FFFDF9]">
        &copy; {new Date().getFullYear()} {template.sampleBusinessName} &bull; Sunlit Sandstone &amp; Bronze ({template.templateCode}) &bull; 5 Dedicated Pages.
      </footer>
    </div>
  );
};

// ============================================================================
// TEMPLATE 14: Architectural Business (Studio Concrete / Kroma)
// Dominant: Pure Travertine White (#FAFAFA) | Architectural Vermilion (#EA580C)
// Bright, structural blueprint aesthetic with 5 dedicated pages
// ============================================================================
export const ArchitecturalBusinessDemo: React.FC<TemplateDemoProps> = ({ template, onUseDesign, externalActivePage, onPageChange }) => {
  const [internalTab, setInternalTab] = useState<'overview' | 'monographs' | 'materiality' | 'studios' | 'contact'>('overview');
  const activeTab = (externalActivePage as any) || internalTab;

  const navigateTo = (tab: 'overview' | 'monographs' | 'materiality' | 'studios' | 'contact') => {
    setInternalTab(tab);
    if (onPageChange) onPageChange(tab);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#18181B] font-sans flex flex-col selection:bg-[#EA580C] selection:text-white">
      <header className="px-8 py-5 border-b border-[#E4E4E7] flex items-center justify-between sticky top-0 bg-[#FAFAFA]/95 z-30 shadow-xs">
        <button onClick={() => navigateTo('overview')} className="font-mono text-sm font-bold tracking-widest text-[#EA580C] uppercase">
          {template.sampleBusinessName}
        </button>

        <nav className="hidden md:flex items-center space-x-6 text-xs font-mono font-bold text-stone-600">
          {[
            { id: 'overview' as const, label: '1. Overview' },
            { id: 'monographs' as const, label: '2. Monographs' },
            { id: 'materiality' as const, label: '3. Materiality' },
            { id: 'studios' as const, label: '4. Studios' },
            { id: 'contact' as const, label: '5. Submit RFQ' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => navigateTo(t.id)}
              className={`transition-colors py-1 ${activeTab === t.id ? 'text-[#EA580C] border-b-2 border-[#EA580C]' : 'hover:text-[#EA580C]'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <button onClick={() => navigateTo('contact')} className="px-4 py-2 bg-[#EA580C] text-white font-mono text-xs font-bold rounded shadow-xs">
          Submit RFQ &rarr;
        </button>
      </header>

      {/* PAGE 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <main className="flex-1 py-16 px-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
          <span className="font-mono text-xs text-[#EA580C] uppercase font-bold">PAGE 1 OF 5 &bull; ARCHITECTURAL BLUEPRINTS</span>
          <h1 className="text-4xl sm:text-6xl font-black text-stone-900 leading-tight">
            Spatial Precision and Structural Integrity for Public Monoliths.
          </h1>
          <p className="text-stone-600 text-sm max-w-xl">{template.tagline}</p>
          <div className="aspect-16/9 rounded-2xl overflow-hidden shadow-xl border border-stone-200">
            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80" alt="Architectural design" className="w-full h-full object-cover" />
          </div>
        </main>
      )}

      {/* PAGE 2: MONOGRAPHS */}
      {activeTab === 'monographs' && (
        <main className="flex-1 py-16 px-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
          <span className="font-mono text-xs text-[#EA580C] uppercase font-bold">PAGE 2 OF 5 &bull; MONOGRAPHS</span>
          <h2 className="text-3xl font-black">Selected Project Monographs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Civic Opera Pavilion (Copenhagen)', 'Bioclimatic Research Center (Zurich)', 'Alpine Monolith Residence (St. Moritz)'].map((p, idx) => (
              <div key={idx} className="p-6 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-2">
                <span className="font-mono text-xs text-orange-600">COMPLETED 2025</span>
                <h4 className="font-bold text-base">{p}</h4>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* PAGE 3: MATERIALITY */}
      {activeTab === 'materiality' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
          <span className="font-mono text-xs text-[#EA580C] uppercase font-bold">PAGE 3 OF 5 &bull; RESEARCH</span>
          <h2 className="text-3xl font-black">Materiality &amp; Ecological Tectonics</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            Exploring rammed earth compositions, low-carbon geopolymer cements, and structural glulam timber for resilient 21st-century architectural landmarks.
          </p>
        </main>
      )}

      {/* PAGE 4: STUDIOS */}
      {activeTab === 'studios' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
          <span className="font-mono text-xs text-[#EA580C] uppercase font-bold">PAGE 4 OF 5 &bull; LOCATIONS</span>
          <h2 className="text-3xl font-black">Global Studio Network</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-6 bg-white border border-stone-200 rounded-xl">Tokyo: 35.6762° N</div>
            <div className="p-6 bg-white border border-stone-200 rounded-xl">Zurich: 47.3769° N</div>
            <div className="p-6 bg-white border border-stone-200 rounded-xl">Copenhagen: 55.6761° N</div>
          </div>
        </main>
      )}

      {/* PAGE 5: RFQ */}
      {activeTab === 'contact' && (
        <main className="flex-1 py-16 px-8 max-w-xl mx-auto w-full space-y-6 animate-in fade-in duration-300 text-center font-mono">
          <span className="text-xs text-[#EA580C] uppercase font-bold">PAGE 5 OF 5 &bull; COMMISSION</span>
          <h2 className="text-3xl font-black font-sans">Submit Architectural RFQ</h2>
          <button onClick={() => onUseDesign(template)} className="px-8 py-3 bg-[#EA580C] text-white font-bold text-xs uppercase rounded">
            Download Project Brief Protocol &rarr;
          </button>
        </main>
      )}

      <footer className="mt-auto py-8 text-center font-mono text-xs text-stone-500 border-t border-[#E4E4E7] bg-[#FAFAFA]">
        &copy; {new Date().getFullYear()} {template.sampleBusinessName} &bull; Travertine White &amp; Vermilion ({template.templateCode}) &bull; 5 Dedicated Pages.
      </footer>
    </div>
  );
};

// ============================================================================
// TEMPLATE 15: Glass Business (Lumina Photonic Dynamics)
// Dominant: Prismatic Crystal Glass (#FAF5FF) | Vivid Violet (#7C3AED)
// Luminous crystal glass aesthetic with 5 dedicated pages
// ============================================================================
export const GlassBusinessDemo: React.FC<TemplateDemoProps> = ({ template, onUseDesign, externalActivePage, onPageChange }) => {
  const [internalTab, setInternalTab] = useState<'optics' | 'waveguides' | 'cleanroom' | 'standards' | 'inquire'>('optics');
  const activeTab = (externalActivePage as any) || internalTab;

  const navigateTo = (tab: 'optics' | 'waveguides' | 'cleanroom' | 'standards' | 'inquire') => {
    setInternalTab(tab);
    if (onPageChange) onPageChange(tab);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF5FF] via-[#F3E8FF] to-[#EDE9FE] text-[#1E1B4B] font-sans flex flex-col selection:bg-violet-600 selection:text-white relative overflow-hidden">
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-violet-300/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-pink-300/40 blur-3xl pointer-events-none" />

      <header className="p-6 flex justify-center sticky top-0 z-30">
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-xl px-6 py-3 rounded-2xl flex items-center gap-6 text-xs font-bold text-slate-800">
          <button onClick={() => navigateTo('optics')} className="font-extrabold text-sm text-violet-900">
            {template.sampleBusinessName}
          </button>
          <div className="hidden sm:flex items-center gap-4 text-slate-600">
            {[
              { id: 'optics' as const, label: '1. Optics' },
              { id: 'waveguides' as const, label: '2. Waveguides' },
              { id: 'cleanroom' as const, label: '3. Cleanroom' },
              { id: 'standards' as const, label: '4. Standards' },
              { id: 'inquire' as const, label: '5. Inquire' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => navigateTo(t.id)}
                className={`transition-colors py-1 ${activeTab === t.id ? 'text-violet-700 font-black border-b-2 border-violet-700' : 'hover:text-violet-700'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button onClick={() => navigateTo('inquire')} className="bg-violet-600 text-white px-4 py-1.5 rounded-xl shadow-md hover:bg-violet-700">
            Inquire &rarr;
          </button>
        </div>
      </header>

      {/* PAGE 1: OPTICS */}
      {activeTab === 'optics' && (
        <main className="flex-1 py-16 px-6 max-w-5xl mx-auto w-full text-center space-y-8 relative z-10 animate-in fade-in duration-300">
          <span className="inline-block px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-md border border-white text-violet-700 text-xs font-bold shadow-xs">
            Page 1 of 5 &bull; Photonic Micro-Display Engineering
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.08] max-w-3xl mx-auto">
            Next-Generation Refraction Optics for Spatial Interfaces.
          </h1>
          <p className="text-slate-600 text-base max-w-xl mx-auto leading-relaxed">{template.tagline}</p>
        </main>
      )}

      {/* PAGE 2: WAVEGUIDES */}
      {activeTab === 'waveguides' && (
        <main className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full space-y-6 relative z-10 animate-in fade-in duration-300">
          <span className="text-xs text-violet-700 font-bold uppercase font-mono">Page 2 of 5 &bull; Micro-Waveguides</span>
          <h2 className="text-3xl font-black text-slate-900">Diffractive AR Waveguide Systems</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sub-wavelength holographic diffraction gratings manufactured in high-index sapphire glass with 120-degree horizontal field-of-view.
          </p>
        </main>
      )}

      {/* PAGE 3: CLEANROOM */}
      {activeTab === 'cleanroom' && (
        <main className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full space-y-6 relative z-10 animate-in fade-in duration-300">
          <span className="text-xs text-violet-700 font-bold uppercase font-mono">Page 3 of 5 &bull; Nano-Fabrication</span>
          <h2 className="text-3xl font-black text-slate-900">Class-100 Cleanroom Facility</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Zero-particle semiconductor cleanroom with electron-beam lithography capable of 12-nanometer feature precision.
          </p>
        </main>
      )}

      {/* PAGE 4: STANDARDS */}
      {activeTab === 'standards' && (
        <main className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full space-y-6 relative z-10 animate-in fade-in duration-300">
          <span className="text-xs text-violet-700 font-bold uppercase font-mono">Page 4 of 5 &bull; Compliance</span>
          <h2 className="text-3xl font-black text-slate-900">Spatial Optics Quality Standards</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            ISO 14644 certified optical inspection protocols and MIL-PRF-13830B laser-damage threshold tolerances.
          </p>
        </main>
      )}

      {/* PAGE 5: INQUIRE */}
      {activeTab === 'inquire' && (
        <main className="flex-1 py-16 px-6 max-w-xl mx-auto w-full space-y-6 text-center relative z-10 animate-in fade-in duration-300">
          <span className="text-xs text-violet-700 font-bold uppercase font-mono">Page 5 of 5 &bull; Technical Desk</span>
          <h2 className="text-3xl font-black text-slate-900">Request Photonic Sample Kit</h2>
          <button onClick={() => onUseDesign(template)} className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-lg">
            Request Engineering Consultation &rarr;
          </button>
        </main>
      )}

      <footer className="mt-auto py-8 text-center text-xs text-slate-500 border-t border-violet-200 relative z-10 bg-white/40">
        &copy; {new Date().getFullYear()} {template.sampleBusinessName} &bull; Prismatic Crystal Glass &amp; Violet ({template.templateCode}) &bull; 5 Dedicated Pages.
      </footer>
    </div>
  );
};

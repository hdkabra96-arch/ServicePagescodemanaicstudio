import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Layers,
  Sparkles,
  Zap,
  Globe,
  Shield,
  Star,
  Check,
  Eye,
  Sliders,
  Play,
  Copy,
  Terminal,
  Lock,
  Building2,
  Users,
  Award,
  Phone,
  Mail,
  MapPin,
  Send,
  ExternalLink,
  ChevronRight,
  Clock,
  Code2,
  Cpu,
  FileText,
  DollarSign
} from 'lucide-react';
import { BusinessTemplateItem } from '../../../types';

interface TemplateDemoProps {
  template: BusinessTemplateItem;
  onUseDesign: (template: BusinessTemplateItem) => void;
  externalActivePage?: string;
  onPageChange?: (page: string) => void;
}

// ============================================================================
// TEMPLATE 06: Split Hero Business (Strata FinTech Platform)
// Dominant: Pale Ice-Blue (#F0F7FF) | Deep Blue (#1D4ED8)
// Multi-page navigation: platform (Home), treasury (Treasury API), security (Security Vault), company (Company), sandbox (Request Sandbox / Pricing)
// ============================================================================
export const SplitHeroBusinessDemo: React.FC<TemplateDemoProps> = ({
  template,
  onUseDesign,
  externalActivePage,
  onPageChange
}) => {
  const [internalPage, setInternalPage] = useState<'platform' | 'treasury' | 'security' | 'company' | 'sandbox'>('platform');
  const [treasuryTab, setTreasuryTab] = useState<'hedging' | 'payouts' | 'ledger'>('hedging');
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [sandboxSubmitted, setSandboxSubmitted] = useState(false);
  const [sandboxForm, setSandboxForm] = useState({ company: '', email: '', volume: '$1M - $10M', currency: 'USD' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync with external page switcher if provided
  const activePage = (externalActivePage as any) || internalPage;

  const navigateTo = (page: 'platform' | 'treasury' | 'security' | 'company' | 'sandbox') => {
    setInternalPage(page);
    if (onPageChange) onPageChange(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] text-slate-900 font-sans flex flex-col selection:bg-[#1D4ED8] selection:text-white">
      {/* Sticky Glass Navigation with real interactive page buttons */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#D6E6F7] px-6 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('platform')}
            className="flex items-center gap-2.5 text-left focus:outline-hidden group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#1D4ED8] text-white flex items-center justify-center font-black text-sm group-hover:scale-105 transition-transform">
              ST
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-[#1D4ED8] transition-colors">
              {template.sampleBusinessName}
            </span>
          </button>
        </div>

        {/* Desktop Interactive Nav Tabs */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-xs font-bold text-slate-600 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
          {[
            { id: 'platform' as const, label: 'Platform' },
            { id: 'treasury' as const, label: 'Treasury API' },
            { id: 'security' as const, label: 'Security Vault' },
            { id: 'company' as const, label: 'Company' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`px-3.5 py-1.5 rounded-lg transition-all capitalize ${
                activePage === item.id
                  ? 'bg-white text-[#1D4ED8] shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigateTo('sandbox')}
            className="bg-[#1D4ED8] hover:bg-blue-700 text-white text-xs font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Request Sandbox &rarr;
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#D6E6F7] px-6 py-4 space-y-2 text-xs font-bold shadow-lg">
          {[
            { id: 'platform' as const, label: 'Platform Overview' },
            { id: 'treasury' as const, label: 'Treasury API & Specs' },
            { id: 'security' as const, label: 'Security Vault & SOC-2' },
            { id: 'company' as const, label: 'About Company & Team' },
            { id: 'sandbox' as const, label: 'Request Sandbox Sandbox' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`w-full text-left px-3 py-2 rounded-lg ${
                activePage === item.id ? 'bg-[#F0F7FF] text-[#1D4ED8] font-black' : 'text-slate-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* PAGE 1: PLATFORM (HOME) */}
      {activePage === 'platform' && (
        <main className="flex-1 animate-in fade-in duration-300">
          {/* 50/50 Split Screen Hero */}
          <section className="py-12 sm:py-20 px-6 sm:px-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-[#1D4ED8] text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-ping" />
                <span>Real-time Global Liquidity Engine</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight leading-[1.1]">
                Unified Financial Operations for Multi-Currency Enterprises.
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {template.tagline}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigateTo('sandbox')}
                  className="bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigateTo('treasury')}
                  className="border border-blue-200 bg-white hover:bg-blue-50 text-slate-700 font-bold text-xs px-5 py-3.5 rounded-xl transition-colors"
                >
                  Explore Treasury API
                </button>
              </div>

              {/* Verified Security Pills */}
              <div className="pt-4 flex items-center gap-6 text-xs text-slate-500 font-semibold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>SOC-2 Certified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Multi-Tenant Vault</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>140+ Currencies</span>
                </div>
              </div>
            </div>

            {/* Right Split Card with Live Telemetry */}
            <div className="lg:col-span-6 rounded-2xl bg-white border border-[#D6E6F7] p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Automated Settlement</span>
                  <h3 className="font-extrabold text-base text-slate-900">Real-Time Global Ledger</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>All Systems Live</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#F0F7FF] border border-[#D6E6F7]">
                  <span className="text-xs text-slate-500">Processed Today</span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">$42,910,240</div>
                  <span className="text-[10px] text-emerald-600 font-bold">↑ 18.4% vs last week</span>
                </div>
                <div className="p-4 rounded-xl bg-[#F0F7FF] border border-[#D6E6F7]">
                  <span className="text-xs text-slate-500">Active Corridors</span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">142 Countries</div>
                  <span className="text-[10px] text-blue-600 font-bold">&lt; 150ms Settlement</span>
                </div>
              </div>

              {/* Live corridor feed */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-700">Recent Automated Batches</span>
                {[
                  { corridor: 'USD / EUR FX Sweep', amount: '$4,250,000.00', status: 'Settled', latency: '42ms' },
                  { corridor: 'GBP / SGD Liquidity Rebalance', amount: '$1,820,400.00', status: 'Settled', latency: '68ms' },
                  { corridor: 'JPY Multi-Entity Payroll', amount: '¥620,000,000', status: 'Settled', latency: '110ms' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <div className="font-bold text-slate-800">{item.corridor}</div>
                      <div className="text-[10px] text-slate-500">Latency: {item.latency}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900">{item.amount}</div>
                      <span className="text-[10px] text-emerald-600 font-bold">✓ {item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Quick Page Jump Callout Cards */}
          <section className="py-12 px-6 sm:px-8 max-w-7xl mx-auto w-full">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Explore Platform Architecture</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                onClick={() => navigateTo('treasury')}
                className="p-6 rounded-2xl bg-white border border-[#D6E6F7] hover:border-[#1D4ED8] shadow-sm hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1D4ED8] flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#1D4ED8] transition-colors">
                  Treasury API & Sandbox
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  High-throughput programmatic FX hedging, automated liquidity rebalancing, and JSON webhooks.
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#1D4ED8]">
                  <span>Explore Endpoints</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                onClick={() => navigateTo('security')}
                className="p-6 rounded-2xl bg-white border border-[#D6E6F7] hover:border-[#1D4ED8] shadow-sm hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#1D4ED8] transition-colors">
                  Security Vault & Governance
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Cryptographic key isolation, multi-signature approvals, and continuous SOC-2 audit compliance.
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <span>Inspect Audit Vault</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                onClick={() => navigateTo('company')}
                className="p-6 rounded-2xl bg-white border border-[#D6E6F7] hover:border-[#1D4ED8] shadow-sm hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#1D4ED8] transition-colors">
                  About Strata FinTech
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Founded by institutional bankers and distributed systems engineers across 5 global financial hubs.
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-600">
                  <span>View Leadership & Hubs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* PAGE 2: TREASURY API */}
      {activePage === 'treasury' && (
        <main className="flex-1 py-12 px-6 sm:px-8 max-w-7xl mx-auto w-full space-y-10 animate-in fade-in duration-300">
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-[#1D4ED8] uppercase tracking-wider">
              DEVELOPER SPECIFICATIONS & BULL; REST + WEBSOCKETS
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950">
              Programmable Treasury Infrastructure
            </h1>
            <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
              Programmatically initiate automated currency swaps, stream ledger balance changes, and configure enterprise multi-signature webhooks.
            </p>
          </div>

          {/* Code Endpoint Sandbox */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 text-white overflow-hidden shadow-2xl">
            <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-3 font-mono text-xs text-blue-400">POST https://api.strata.finance/v1/settlements/hedge</span>
              </div>
              <button
                onClick={() => {
                  setCopiedEndpoint(true);
                  setTimeout(() => setCopiedEndpoint(false), 2000);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedEndpoint ? 'Copied JSON!' : 'Copy Payload'}</span>
              </button>
            </div>

            <div className="p-6 font-mono text-xs overflow-x-auto space-y-3">
              <div className="text-slate-400">// Sample request payload with cryptographic idempotent key</div>
              <pre className="text-emerald-400 leading-relaxed">{`{
  "source_account": "acc_treasury_corp_942",
  "target_currency": "EUR",
  "base_amount": 2500000.00,
  "max_slippage_bps": 1.5,
  "execution_mode": "ALGORITHMIC_VWAP",
  "hedging_policy": "AUTO_ROLLOVER_30D",
  "signature": "ed25519_8f0a2e41..."
}`}</pre>
              <div className="pt-2 text-slate-400">// Response &bull; 200 OK (Executed in 38ms)</div>
              <pre className="text-sky-300 leading-relaxed">{`{
  "status": "SETTLED",
  "tx_id": "tx_strata_84920482",
  "effective_rate": 1.0842,
  "settlement_ledger_block": 18492014,
  "corridor": "USD -> EUR"
}`}</pre>
            </div>
          </div>

          {/* Endpoint Capabilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-white border border-[#D6E6F7] space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Real-time Webhook Streaming</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive sub-second cryptographically signed events whenever multi-million currency settlements clear.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white border border-[#D6E6F7] space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Algorithmic Rate Routing</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect into 18 Tier-1 investment liquidity banks to optimize spread execution without market impact.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white border border-[#D6E6F7] space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Multi-Sig Approval Queues</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transactions above $5M require dual C-suite biometrics or hardware key approvals before release.
              </p>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-blue-600 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-xl font-bold">Ready to test in our Developer Sandbox?</h3>
              <p className="text-xs text-blue-100">Get provisioned test keys with mock test balances in under 60 seconds.</p>
            </div>
            <button
              onClick={() => navigateTo('sandbox')}
              className="px-6 py-3 bg-white text-[#1D4ED8] font-bold text-xs rounded-xl shadow-md hover:bg-blue-50 transition-colors"
            >
              Get Test API Keys &rarr;
            </button>
          </div>
        </main>
      )}

      {/* PAGE 3: SECURITY VAULT */}
      {activePage === 'security' && (
        <main className="flex-1 py-12 px-6 sm:px-8 max-w-7xl mx-auto w-full space-y-10 animate-in fade-in duration-300">
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">
              ENTERPRISE GOVERNANCE & BULL; BANK-GRADE ENCLAVES
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950">
              Zero-Trust Security & Compliance Architecture
            </h1>
            <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
              Every balance modification is secured by hardware security modules (HSM) and independently audited quarterly.
            </p>
          </div>

          {/* 4 Compliance Credentials */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'SOC-2 Type II', issuer: 'Deloitte Audited', date: 'Continuous 2026' },
              { title: 'ISO/IEC 27001', issuer: 'British Standards (BSI)', date: 'Certified' },
              { title: 'PCI-DSS Level 1', issuer: 'Service Provider Gateway', date: 'Annual Recert' },
              { title: 'GDPR & CCPA', issuer: 'Zero Cross-Border Leakage', date: 'Compliant' }
            ].map((c, i) => (
              <div key={i} className="p-5 rounded-xl bg-white border border-[#D6E6F7] space-y-1 shadow-xs">
                <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase">{c.issuer}</span>
                <h4 className="font-extrabold text-base text-slate-900">{c.title}</h4>
                <span className="text-xs text-slate-500 font-semibold">{c.date}</span>
              </div>
            ))}
          </div>

          {/* Cryptographic Architecture Deep Dive */}
          <div className="p-8 rounded-2xl bg-white border border-[#D6E6F7] shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900">Hardware Security Module (HSM) Enclaves</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Private signing keys never exist in plaintext memory. We deploy FIPS 140-2 Level 3 certified cryptographic hardware modules across three geographic regions.
              </p>
              <div className="space-y-2 text-xs font-semibold text-slate-700 pt-2">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Ed25519 asymmetric transaction signing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Automated 90-day secrets key rotation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Immutable distributed append-only ledger</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#0F172A] text-white font-mono text-xs space-y-3">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span>ENCLAVE INTEGRITY MONITOR</span>
                <span className="text-emerald-400">SECURE</span>
              </div>
              <div className="space-y-1 text-slate-300 text-[11px]">
                <div>&bull; HSM Cluster: eu-west-1 (Primary Active)</div>
                <div>&bull; HSM Mirror: us-east-1 (Synchronous Replicated)</div>
                <div>&bull; HSM Cold Backup: ap-southeast-1 (Air-Gapped)</div>
                <div>&bull; Pen-Test Score: 100/100 (Zero Criticals)</div>
              </div>
              <button
                onClick={() => onUseDesign(template)}
                className="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors text-xs"
              >
                Download Security Whitepaper &rarr;
              </button>
            </div>
          </div>
        </main>
      )}

      {/* PAGE 4: COMPANY */}
      {activePage === 'company' && (
        <main className="flex-1 py-12 px-6 sm:px-8 max-w-7xl mx-auto w-full space-y-10 animate-in fade-in duration-300">
          <div className="space-y-3 max-w-3xl">
            <span className="text-xs font-mono font-bold text-[#1D4ED8] uppercase tracking-wider">
              STRATA FINTECH CAPITAL & BULL; ESTABLISHED 2021
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950">
              Architecting the Liquidity Rails for Global Commerce.
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              We started Strata FinTech to eliminate multi-day wire settlements, opaque foreign exchange spreads, and fragmented accounting reconciliations for international companies.
            </p>
          </div>

          {/* Key Leadership Profiles */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Executive Leadership</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { name: 'Elena Rostova', role: 'Chief Executive Officer', past: 'Ex-Goldman Sachs FX Trading', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80' },
                { name: 'Marcus Vance', role: 'Chief Technology Officer', past: 'Ex-Stripe Infrastructure Lead', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
                { name: 'Devon Patel', role: 'Head of Global Compliance', past: 'Former UK Financial Conduct Authority', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' }
              ].map((m, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-white border border-[#D6E6F7] space-y-4 shadow-sm">
                  <img src={m.image} alt={m.name} className="w-16 h-16 rounded-full object-cover border-2 border-blue-200" />
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">{m.name}</h4>
                    <span className="text-xs font-bold text-[#1D4ED8]">{m.role}</span>
                    <p className="text-xs text-slate-500 mt-1">{m.past}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Presence Hubs */}
          <div className="p-8 rounded-2xl bg-white border border-[#D6E6F7] space-y-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">Global Financial Hubs</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
              <div>
                <span className="font-bold text-slate-900 text-sm block">New York</span>
                <span className="text-slate-500">100 Wall Street, 32nd Fl</span>
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm block">London</span>
                <span className="text-slate-500">1 Canada Square, Canary Wharf</span>
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm block">Singapore</span>
                <span className="text-slate-500">Marina Bay Financial Centre</span>
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm block">Frankfurt</span>
                <span className="text-slate-500">Taunusanlage 8, Bankenviertel</span>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* PAGE 5: REQUEST SANDBOX / PRICING & INQUIRY */}
      {activePage === 'sandbox' && (
        <main className="flex-1 py-12 px-6 sm:px-8 max-w-7xl mx-auto w-full space-y-10 animate-in fade-in duration-300">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold text-[#1D4ED8] uppercase tracking-wider">
              PRICING & BULL; DEVELOPER SANDBOX INTAKE
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-950">
              Provision Your Enterprise Sandbox
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Transparent volume tiers with zero integration fees. Test on staging with mock liquidity before going live.
            </p>
          </div>

          {/* 3 Pricing Tier Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Developer Sandbox', price: '$0', period: 'Forever Free', desc: 'Mock testnet credentials, simulated balances, and full REST & WebSocket access.', features: ['Full API Docs Access', 'Mock Balance Faucet', 'Community Discord Support', '100 requests / min'] },
              { name: 'Growth Enterprise', price: '$2,400', period: 'per month', popular: true, desc: 'Dedicated liquidity rails, multi-tenant vault, and automated hedging rules.', features: ['Direct Liquidity Pools', 'Sub-50ms Settlement', 'SOC-2 Audit Package', '99.98% Uptime SLA', 'Dedicated Account Mgr'] },
              { name: 'Global Sovereign', price: 'Custom', period: 'Tailored SLA', desc: 'Multi-region HSM enclaves, custom FX spreads, and bespoke multi-sig treasury rules.', features: ['FIPS 140-2 Level 3 Enclaves', 'Unlimited Transaction Volume', '24/7 Dedicated C-Suite Desk', 'Custom Smart Contracts'] }
            ].map((plan, i) => (
              <div
                key={i}
                className={`p-6 sm:p-8 rounded-2xl bg-white border-2 flex flex-col justify-between space-y-6 ${
                  plan.popular ? 'border-[#1D4ED8] shadow-2xl relative' : 'border-[#D6E6F7] shadow-sm'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#1D4ED8] text-white font-bold text-[10px] uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{plan.desc}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-950">{plan.price}</span>
                    <span className="text-xs text-slate-500 font-semibold">{plan.period}</span>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {plan.features.map((f, fi) => (
                      <div key={fi} className="flex items-center gap-2 text-xs text-slate-700">
                        <Check className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onUseDesign(template)}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all ${
                    plan.popular
                      ? 'bg-[#1D4ED8] hover:bg-blue-700 text-white shadow-lg'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                  }`}
                >
                  Select Plan &rarr;
                </button>
              </div>
            ))}
          </div>

          {/* Quick Sandbox Intake Form */}
          <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-white border border-[#D6E6F7] shadow-xl space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900">Request Instant Sandbox API Token</h3>
            {sandboxSubmitted ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Sandbox Credentials Generated!</span>
                </div>
                <div>Your Mock API Token:</div>
                <div className="p-3 bg-white rounded border border-emerald-300 font-bold text-slate-900">
                  sk_test_strata_942048f8204812a
                </div>
                <p className="text-[11px] text-emerald-700 font-sans">
                  We have dispatched onboarding documentation to {sandboxForm.email}. A FinTech engineer will reach out for staging clearance.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSandboxSubmitted(true);
                }}
                className="space-y-3 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Company Legal Entity</label>
                    <input
                      type="text"
                      required
                      value={sandboxForm.company}
                      onChange={(e) => setSandboxForm({ ...sandboxForm, company: e.target.value })}
                      placeholder="e.g. Acme Treasury Corp"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-[#1D4ED8]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Corporate Work Email</label>
                    <input
                      type="email"
                      required
                      value={sandboxForm.email}
                      onChange={(e) => setSandboxForm({ ...sandboxForm, email: e.target.value })}
                      placeholder="alex@acmecorp.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-[#1D4ED8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Estimated Monthly Volume</label>
                    <select
                      value={sandboxForm.volume}
                      onChange={(e) => setSandboxForm({ ...sandboxForm, volume: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-[#1D4ED8]"
                    >
                      <option>&lt; $1M / month</option>
                      <option>$1M - $10M / month</option>
                      <option>$10M - $100M / month</option>
                      <option>&gt; $100M / month (Institutional)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Primary Base Currency</label>
                    <select
                      value={sandboxForm.currency}
                      onChange={(e) => setSandboxForm({ ...sandboxForm, currency: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-[#1D4ED8]"
                    >
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                      <option>JPY (¥)</option>
                      <option>SGD (S$)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all mt-2"
                >
                  Generate Sandbox Credentials &rarr;
                </button>
              </form>
            )}
          </div>
        </main>
      )}

      {/* Dynamic Footer with working quick page links */}
      <footer className="mt-auto py-10 px-6 sm:px-8 border-t border-[#D6E6F7] bg-white text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#1D4ED8] text-white flex items-center justify-center font-bold text-xs">
              ST
            </div>
            <div>
              <span className="font-black text-slate-900">{template.sampleBusinessName}</span>
              <p className="text-[10px] text-slate-500">Pale Ice-Blue Split Hero Layout ({template.templateCode})</p>
            </div>
          </div>

          {/* Quick Footer Links */}
          <div className="flex flex-wrap items-center gap-6 font-bold">
            <button onClick={() => navigateTo('platform')} className="hover:text-[#1D4ED8] transition-colors">
              Platform
            </button>
            <button onClick={() => navigateTo('treasury')} className="hover:text-[#1D4ED8] transition-colors">
              Treasury API
            </button>
            <button onClick={() => navigateTo('security')} className="hover:text-[#1D4ED8] transition-colors">
              Security Vault
            </button>
            <button onClick={() => navigateTo('company')} className="hover:text-[#1D4ED8] transition-colors">
              Company
            </button>
            <button onClick={() => navigateTo('sandbox')} className="hover:text-[#1D4ED8] transition-colors">
              Pricing & Sandbox
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            &copy; {new Date().getFullYear()} {template.sampleBusinessName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

// ============================================================================
// TEMPLATE 07: Bold Typography (Vanguard Editorial Agency)
// Dominant: Soft Blush (#FFF1F2) | Vivid Crimson (#E11D48) | Oversized Headings
// Multi-page navigation: manifesto (Home), pillars (Pillars), works (Case Studies), contact (Contact Mandate)
// ============================================================================
export const BoldTypographyDemo: React.FC<TemplateDemoProps> = ({ template, onUseDesign }) => {
  const [activeTab, setActiveTab] = useState<'manifesto' | 'pillars' | 'works' | 'contact'>('manifesto');
  const [inquirySent, setInquirySent] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFF1F2] text-slate-900 font-sans flex flex-col selection:bg-[#E11D48] selection:text-white">
      {/* Split Navigation with Pinned Logo */}
      <header className="px-6 sm:px-12 py-5 flex items-center justify-between border-b border-[#FEE2E2] sticky top-0 bg-[#FFF1F2]/95 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveTab('manifesto')} className="flex items-center gap-2 text-left">
            <span className="w-3.5 h-3.5 bg-[#E11D48] rounded-full inline-block animate-pulse" />
            <span className="font-black text-lg sm:text-xl tracking-tighter uppercase text-slate-900">
              {template.sampleBusinessName}
            </span>
          </button>
        </div>

        {/* Interactive Page Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-xs font-black uppercase tracking-wider text-slate-700">
          {[
            { id: 'manifesto' as const, label: 'Manifesto' },
            { id: 'pillars' as const, label: 'Pillars' },
            { id: 'works' as const, label: 'Case Studies' },
            { id: 'contact' as const, label: 'Start Mandate' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`transition-colors ${
                activeTab === tab.id ? 'text-[#E11D48] border-b-2 border-[#E11D48] pb-1' : 'hover:text-[#E11D48]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => setActiveTab('contact')}
          className="bg-[#E11D48] hover:bg-rose-700 text-white px-5 sm:px-6 py-2 text-xs font-black uppercase tracking-wider rounded-full shadow-md transition-transform hover:scale-105"
        >
          Book Mandate &rarr;
        </button>
      </header>

      {/* MANIFESTO PAGE */}
      {activeTab === 'manifesto' && (
        <main className="flex-1 py-16 px-6 sm:px-12 max-w-6xl mx-auto w-full space-y-12 animate-in fade-in duration-300">
          <div className="space-y-6">
            <span className="text-xs font-black tracking-widest text-[#E11D48] uppercase">
              Brand Architecture &bull; Sovereign Stature &bull; Issue 2026
            </span>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-slate-950 tracking-tighter leading-[0.95]">
              WE DON'T DO MODEST WEBSITES.
            </h1>

            <p className="text-slate-700 text-lg sm:text-xl font-medium max-w-2xl leading-relaxed">
              {template.tagline}
            </p>
          </div>

          {/* Contrasting Staggered Content Blocks */}
          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="p-8 bg-white border-2 border-[#E11D48] rounded-3xl shadow-xl space-y-4">
              <span className="text-xs font-black uppercase text-[#E11D48]">Pillar 01</span>
              <h3 className="text-2xl font-black text-slate-950">Hypnotic Visual Presence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We design every viewport to halt scrolling in its tracks. Strong contrast, oversized typography, and razor-sharp brand statements.
              </p>
              <button onClick={() => setActiveTab('pillars')} className="text-xs font-black text-[#E11D48] flex items-center gap-1 pt-2">
                <span>Inspect All 4 Pillars</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-8 bg-slate-950 text-white rounded-3xl shadow-xl space-y-4 md:mt-8">
              <span className="text-xs font-black uppercase text-rose-400">Pillar 02</span>
              <h3 className="text-2xl font-black">Ruthless Conversion Rigor</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Behind the dramatic aesthetic lies an engineered conversion funnel designed to qualify inquiries and book high-ticket deals.
              </p>
              <button onClick={() => setActiveTab('works')} className="text-xs font-black text-rose-300 flex items-center gap-1 pt-2">
                <span>View Client Case Studies</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </main>
      )}

      {/* PILLARS PAGE */}
      {activeTab === 'pillars' && (
        <main className="flex-1 py-16 px-6 sm:px-12 max-w-6xl mx-auto w-full space-y-10 animate-in fade-in duration-300">
          <div className="space-y-3">
            <span className="text-xs font-black text-[#E11D48] uppercase tracking-widest">Architectural Tenets</span>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950">Our Four Uncompromising Pillars</h2>
            <p className="text-slate-600 text-sm max-w-xl">Every project we accept conforms strictly to these four governing principles.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { num: '01', title: 'Zero Cliché Visuals', desc: 'No generic vector illustrations or sterile corporate blue templates. Every pixel is custom-styled.' },
              { num: '02', title: 'Dominant Typographic Voice', desc: 'Type scale starts at 72px so headlines read like cultural manifestos rather than feature lists.' },
              { num: '03', title: '60fps Kinetic Micro-Interactions', desc: 'Smooth spring animations and scroll reveals built with zero bloated libraries.' },
              { num: '04', title: 'Exclusive Client Quota', desc: 'We take strictly three bespoke brand commissions per fiscal quarter to ensure obsessive focus.' }
            ].map((p, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-white border border-[#FEE2E2] shadow-sm space-y-3">
                <span className="text-2xl font-mono font-black text-[#E11D48]">{p.num}</span>
                <h3 className="text-xl font-black text-slate-900">{p.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* WORKS PAGE */}
      {activeTab === 'works' && (
        <main className="flex-1 py-16 px-6 sm:px-12 max-w-6xl mx-auto w-full space-y-10 animate-in fade-in duration-300">
          <div className="space-y-3">
            <span className="text-xs font-black text-[#E11D48] uppercase tracking-widest">Recent Commissions</span>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950">Selected Sovereign Portfolios</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { client: 'Apex Capital London', metric: '+340% Inbound Deal Flow', desc: 'High-contrast institutional private equity website with confidential investor portal.' },
              { client: 'Kurogane Aerospace', metric: '$120M Contract Won', desc: 'Dramatic dark editorial presentation for defense contractor sovereign bid.' },
              { client: 'Vesper Luxury Logistics', metric: '0.6s Mobile Page Speed', desc: 'Oversized typography web architecture for private aviation charter.' }
            ].map((work, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-[#FEE2E2] space-y-3 shadow-md">
                <span className="text-xs font-bold text-[#E11D48] font-mono">{work.metric}</span>
                <h4 className="font-black text-lg text-slate-900">{work.client}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{work.desc}</p>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* CONTACT PAGE */}
      {activeTab === 'contact' && (
        <main className="flex-1 py-16 px-6 sm:px-12 max-w-4xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
          <div className="space-y-3 text-center">
            <span className="text-xs font-black text-[#E11D48] uppercase tracking-widest">Confidential Intake</span>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950">Commission a Bold Redesign</h2>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-white border-2 border-[#E11D48] shadow-2xl space-y-6">
            {inquirySent ? (
              <div className="p-6 rounded-xl bg-rose-50 text-[#E11D48] text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <h4 className="font-black text-lg">Mandate Inquiry Received</h4>
                <p className="text-xs text-slate-600">Our creative director will review your requirements and respond within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setInquirySent(true); }} className="space-y-4 text-xs font-bold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-700 block mb-1">Brand / Company Name</label>
                    <input type="text" required placeholder="Acme International" className="w-full px-4 py-3 bg-[#FFF1F2] border border-rose-200 rounded-xl text-slate-900 focus:outline-[#E11D48]" />
                  </div>
                  <div>
                    <label className="text-slate-700 block mb-1">Decision Maker Email</label>
                    <input type="email" required placeholder="founder@acme.com" className="w-full px-4 py-3 bg-[#FFF1F2] border border-rose-200 rounded-xl text-slate-900 focus:outline-[#E11D48]" />
                  </div>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1">Target Launch Timeline</label>
                  <select className="w-full px-4 py-3 bg-[#FFF1F2] border border-rose-200 rounded-xl text-slate-900 focus:outline-[#E11D48]">
                    <option>Immediate Sprint (Within 30 Days)</option>
                    <option>Q2 2026 Strategic Launch</option>
                    <option>Brand Identity + Website Transformation</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-4 bg-[#E11D48] hover:bg-rose-700 text-white font-black uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:-translate-y-0.5">
                  Submit Sovereign Mandate &rarr;
                </button>
              </form>
            )}
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-xs text-slate-500 border-t border-[#FEE2E2]">
        &copy; {new Date().getFullYear()} {template.sampleBusinessName}. Soft Blush Bold Typography Layout ({template.templateCode}).
      </footer>
    </div>
  );
};

// ============================================================================
// TEMPLATE 08: Editorial Business (The Sovereign Gazette / Quarterly)
// Dominant: Warm Parchment (#FAF6EF) | Burgundy Ink (#881337) | Literary Serif
// Multi-page navigation: front (Front Page), essays (Longform Essays), practices (Practices), directorate (The Directorate), inquiry (Private Briefing)
// ============================================================================
export const EditorialBusinessDemo: React.FC<TemplateDemoProps> = ({ template, onUseDesign }) => {
  const [activeTab, setActiveTab] = useState<'front' | 'essays' | 'practices' | 'directorate' | 'inquiry'>('front');

  return (
    <div className="min-h-screen bg-[#FAF6EF] text-[#1C1917] font-serif flex flex-col selection:bg-[#881337] selection:text-white">
      {/* Magazine Masthead Header */}
      <header className="border-b-2 border-[#1C1917] px-6 sm:px-8 py-5 text-center space-y-3 sticky top-0 bg-[#FAF6EF]/95 backdrop-blur-md z-30">
        <div className="flex items-center justify-between text-[11px] font-sans font-bold uppercase tracking-widest text-[#78716C] border-b border-[#E7E5E4] pb-2">
          <span>Vol. XXVIII &bull; Issue No. 04</span>
          <span className="hidden sm:inline">Strategic Intelligence & Global Governance</span>
          <span>Spring 2026</span>
        </div>

        <h2
          onClick={() => setActiveTab('front')}
          className="text-3xl sm:text-5xl font-black text-[#1C1917] tracking-tight uppercase cursor-pointer hover:text-[#881337] transition-colors"
        >
          {template.sampleBusinessName}
        </h2>

        {/* Interactive Editorial Links */}
        <div className="flex justify-center space-x-6 text-xs font-sans font-bold text-[#881337] pt-1">
          {[
            { id: 'front' as const, label: 'Front Page' },
            { id: 'essays' as const, label: 'Essays' },
            { id: 'practices' as const, label: 'Advisory Practices' },
            { id: 'directorate' as const, label: 'The Directorate' },
            { id: 'inquiry' as const, label: 'Private Briefing' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`hover:underline transition-colors ${
                activeTab === tab.id ? 'underline font-black' : ''
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* FRONT PAGE */}
      {activeTab === 'front' && (
        <main className="flex-1 py-12 px-6 sm:px-8 max-w-6xl mx-auto w-full space-y-12 animate-in fade-in duration-300">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="font-sans text-[11px] font-black uppercase text-[#881337] tracking-widest">
              Lead Editorial Feature
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold text-[#1C1917] leading-tight">
              The Decoupling of Global Capital: A Manifesto for Resilience
            </h1>
            <p className="font-sans text-xs text-[#78716C]">
              Written by the Senior Partners of {template.sampleBusinessName} &bull; 8 min read
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm leading-relaxed text-[#44403C]">
            <div className="space-y-4">
              <p className="first-letter:text-5xl first-letter:font-black first-letter:text-[#881337] first-letter:float-left first-letter:mr-2">
                For over two decades, our directors have provided sober counsel to family offices navigating tectonic shifts in currency sovereignty and regulatory scrutiny.
              </p>
              <p>
                Where others see short-term turbulence, we architect multi-generational capital holding structures designed to endure systemic inflation shocks.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#E7E5E4] rounded-xl space-y-3 shadow-xs">
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#881337]">Case Monograph</h4>
              <blockquote className="italic text-base text-[#1C1917]">
                "The bespoke restructuring executed by {template.sampleBusinessName} salvaged over $850M in stranded cross-border assets."
              </blockquote>
              <span className="font-sans text-[11px] text-[#78716C] block font-bold">— Zurich Private Banking Consortium</span>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <h4 className="font-bold text-xs uppercase text-[#1C1917] tracking-wider border-b border-[#1C1917] pb-1">
                Advisory Mandates
              </h4>
              <ul className="space-y-2 text-[#57534E]">
                <li>&bull; Cross-Border Antitrust Litigation</li>
                <li>&bull; Sovereign Debt Restructuring</li>
                <li>&bull; Private Equity Fiduciary Oversight</li>
                <li>&bull; ESG Regulatory Compliance</li>
              </ul>
              <button
                onClick={() => setActiveTab('inquiry')}
                className="w-full mt-4 py-3 bg-[#881337] text-white font-bold rounded-lg shadow-sm hover:bg-[#700f2c] transition-colors"
              >
                Request Advisory Briefing &rarr;
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ESSAYS PAGE */}
      {activeTab === 'essays' && (
        <main className="flex-1 py-12 px-6 sm:px-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
          <div className="border-b border-[#E7E5E4] pb-4">
            <span className="font-sans text-xs font-bold text-[#881337] uppercase">Longform Dispatches</span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">Quarterly Research Papers</h2>
          </div>
          <div className="space-y-6">
            {[
              { title: 'The Fallacy of Liquidity in Fractional Banking', date: 'March 2026', read: '12 min read', desc: 'An empirical evaluation of central bank balance sheet expansion and gold reserve repatriation trends.' },
              { title: 'Structuring Sovereign Family Trusts Under Common Law', date: 'February 2026', read: '15 min read', desc: 'Case precedents across Liechtenstein, Singapore, and Guernsey jurisdictions.' },
              { title: 'Antitrust Inquiries in Algorithmic Cloud Infrastructure', date: 'January 2026', read: '9 min read', desc: 'The European Commission’s scrutiny of hyper-scaler bundling agreements.' }
            ].map((e, idx) => (
              <div key={idx} className="p-6 bg-white border border-[#E7E5E4] rounded-xl space-y-2">
                <div className="font-sans text-[11px] text-[#881337] font-bold">{e.date} &bull; {e.read}</div>
                <h3 className="text-xl font-bold text-slate-900">{e.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{e.desc}</p>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* PRACTICES PAGE */}
      {activeTab === 'practices' && (
        <main className="flex-1 py-12 px-6 sm:px-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
          <div className="border-b border-[#E7E5E4] pb-4">
            <span className="font-sans text-xs font-bold text-[#881337] uppercase">Practice Areas</span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">Institutional Advisory Services</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
            {[
              { title: 'Corporate Restructuring', desc: 'Specialized interventions for enterprises requiring balance sheet rehabilitation, creditor conciliation, or carve-outs.' },
              { title: 'Cross-Border Arbitration', desc: 'Representation before the ICC, LCIA, and SIAC in high-stakes sovereign infrastructure and concession disputes.' },
              { title: 'Fiduciary Board Advisory', desc: 'Independent director mandates for multinational parent entities navigating sanctions and trade compliance.' },
              { title: 'Family Office Succession', desc: 'Multi-decade governance charters establishing generational voting rights and philanthropic endowments.' }
            ].map((p, idx) => (
              <div key={idx} className="p-6 bg-white border border-[#E7E5E4] rounded-xl space-y-2">
                <h4 className="font-bold text-base text-[#881337] font-serif">{p.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* DIRECTORATE PAGE */}
      {activeTab === 'directorate' && (
        <main className="flex-1 py-12 px-6 sm:px-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
          <div className="border-b border-[#E7E5E4] pb-4">
            <span className="font-sans text-xs font-bold text-[#881337] uppercase">Senior Leadership</span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">The Directorate</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-sans">
            {[
              { name: 'Lord Henry Alistair', role: 'Senior Managing Partner', bio: 'Former advisor to HM Treasury and international arbiter in London & Geneva.' },
              { name: 'Dr. Vivienne Chen', role: 'Head of Sovereign Advisory', bio: 'Doctorate in International Economic Law from Cambridge; advised 14 sovereign funds.' },
              { name: 'Gérard de Montmirail', role: 'Director of Restructuring', bio: '30+ years leading cross-border insolvency negotiations across Paris and Frankfurt.' }
            ].map((d, idx) => (
              <div key={idx} className="p-6 bg-white border border-[#E7E5E4] rounded-xl space-y-2">
                <h4 className="font-serif font-bold text-lg text-slate-900">{d.name}</h4>
                <span className="text-xs font-bold text-[#881337] block">{d.role}</span>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{d.bio}</p>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* INQUIRY / CONTACT PAGE */}
      {activeTab === 'inquiry' && (
        <main className="flex-1 py-12 px-6 sm:px-8 max-w-3xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-sans">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#881337] uppercase">Strictly Confidential</span>
            <h2 className="text-3xl font-black text-slate-900 font-serif">Request a Private Directorate Briefing</h2>
          </div>
          <div className="p-8 bg-white border border-[#E7E5E4] rounded-2xl shadow-xl space-y-4">
            <form onSubmit={(e) => { e.preventDefault(); alert('Briefing request dispatched to the Managing Partner desk.'); }} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Principal or Legal Counsel Name</label>
                <input type="text" required placeholder="Sir / Madam" className="w-full px-3.5 py-2.5 bg-[#FAF6EF] border border-[#E7E5E4] rounded-lg text-slate-900" />
              </div>
              <div>
                <label className="block text-slate-700 mb-1">Confidential Direct Email</label>
                <input type="email" required placeholder="principal@familyoffice.ch" className="w-full px-3.5 py-2.5 bg-[#FAF6EF] border border-[#E7E5E4] rounded-lg text-slate-900" />
              </div>
              <div>
                <label className="block text-slate-700 mb-1">Subject of Advisory Consultation</label>
                <textarea rows={3} placeholder="Brief summary of sovereign mandate or balance sheet restructuring..." className="w-full px-3.5 py-2.5 bg-[#FAF6EF] border border-[#E7E5E4] rounded-lg text-slate-900" />
              </div>
              <button type="submit" className="w-full py-3 bg-[#881337] text-white font-bold rounded-lg hover:bg-[#700f2c] transition-colors">
                Transmit Confidential Dossier &rarr;
              </button>
            </form>
          </div>
        </main>
      )}

      <footer className="mt-auto py-8 text-center text-xs font-sans text-[#78716C] border-t border-[#E7E5E4]">
        &copy; {new Date().getFullYear()} {template.sampleBusinessName}. Warm Parchment Editorial Layout ({template.templateCode}).
      </footer>
    </div>
  );
};

// ============================================================================
// TEMPLATE 09: Gradient Startup (Aether Cloud OS)
// Dominant: Pale Lavender (#F5F3FF) | Violet/Cyan Mesh (#7C3AED)
// Multi-page navigation: overview (Home), features (Platform Features), telemetry (Live Telemetry), pricing (Pricing Plans), contact (Book Demo)
// ============================================================================
export const GradientStartupDemo: React.FC<TemplateDemoProps> = ({ template, onUseDesign }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'telemetry' | 'pricing' | 'contact'>('overview');
  const [reducedMotion, setReducedMotion] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F3FF] text-slate-900 font-sans flex flex-col selection:bg-[#7C3AED] selection:text-white">
      {/* Floating Pill Navigation */}
      <header className="p-4 sm:p-6 flex justify-center sticky top-0 z-30">
        <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full border border-violet-200 shadow-xl flex items-center gap-6 text-xs font-bold">
          <button onClick={() => setActiveTab('overview')} className="flex items-center gap-2 text-left">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center text-white text-[10px] font-black">
              S
            </div>
            <span className="font-extrabold text-slate-900">{template.sampleBusinessName}</span>
          </button>

          <nav className="hidden sm:flex items-center gap-4 text-slate-600">
            {[
              { id: 'overview' as const, label: 'Overview' },
              { id: 'features' as const, label: 'Features' },
              { id: 'telemetry' as const, label: 'Telemetry' },
              { id: 'pricing' as const, label: 'Pricing' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`transition-colors ${
                  activeTab === tab.id ? 'text-violet-700 font-black' : 'hover:text-violet-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <button
            onClick={() => setActiveTab('pricing')}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md hover:opacity-95"
          >
            Start Free
          </button>
        </div>
      </header>

      {/* OVERVIEW PAGE */}
      {activeTab === 'overview' && (
        <main className="flex-1 py-12 px-6 max-w-5xl mx-auto text-center space-y-8 animate-in fade-in duration-300">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold border border-violet-200">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>Generative Cloud 3.0 Platform Update</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-[1.08] max-w-3xl mx-auto">
            Self-Healing Cloud Architecture for Autonomous Teams.
          </h1>

          <p className="text-slate-600 text-base max-w-xl mx-auto leading-relaxed">
            {template.tagline}
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setActiveTab('features')}
              className="px-6 py-3 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-lg transition-transform hover:scale-105"
            >
              Explore Capabilities &rarr;
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className="px-5 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-violet-200"
            >
              Live Telemetry Monitor
            </button>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 text-left">
            {[
              { title: 'Zero Latency Webhooks', desc: 'Ingest millions of distributed events with sub-millisecond edge queueing.' },
              { title: 'Deterministic Microservices', desc: 'Isolate failures before they cascade to customer-facing APIs.' },
              { title: 'Automated CI/CD Rollbacks', desc: 'Detect runtime telemetry anomalies and rollback releases in 400ms.' }
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-violet-200 shadow-md">
                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center font-bold text-xs mb-3">
                  0{i + 1}
                </div>
                <h3 className="font-bold text-sm text-slate-900">{f.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* FEATURES PAGE */}
      {activeTab === 'features' && (
        <main className="flex-1 py-12 px-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-violet-600 uppercase">Platform Suite</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Engineered for Zero Downtime</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Global Multi-Region Sync', desc: 'Active-active database clustering across AWS, GCP, and Cloudflare Workers with conflict-free CRDT replication.' },
              { title: 'Deterministic Canary Deployments', desc: 'Shift 1% of live traffic to canary nodes, track error budgets in real time, and auto-abort if error rates exceed 0.01%.' },
              { title: 'AI Root Cause Analysis', desc: 'LLM agents ingest Prometheus and OpenTelemetry metrics to suggest pull-request hotfixes during incidents.' },
              { title: 'Cryptographic Edge Authentication', desc: 'Zero-trust JWT verification executed directly at the CDN point of presence with 1ms round-trip latency.' }
            ].map((feat, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-violet-200 shadow-sm space-y-2">
                <h3 className="font-bold text-base text-violet-950">{feat.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* TELEMETRY PAGE */}
      {activeTab === 'telemetry' && (
        <main className="flex-1 py-12 px-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-violet-600 uppercase">Live Edge Status</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Cluster Telemetry & Health</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-violet-200 text-center">
              <span className="text-xs text-slate-500">Global Uptime</span>
              <div className="text-2xl font-black text-violet-700 mt-1">99.998%</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-violet-200 text-center">
              <span className="text-xs text-slate-500">P99 Latency</span>
              <div className="text-2xl font-black text-violet-700 mt-1">18.4ms</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-violet-200 text-center">
              <span className="text-xs text-slate-500">Active Nodes</span>
              <div className="text-2xl font-black text-violet-700 mt-1">1,420</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-violet-200 text-center">
              <span className="text-xs text-slate-500">Threats Blocked</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">2.4M</div>
            </div>
          </div>
        </main>
      )}

      {/* PRICING PAGE */}
      {activeTab === 'pricing' && (
        <main className="flex-1 py-12 px-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-violet-600 uppercase">Scalable Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Predictable Cloud Costs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Starter Node', price: '$29', period: '/ mo', desc: 'For fast-growing indie startups.' },
              { name: 'Scale Cluster', price: '$199', period: '/ mo', popular: true, desc: 'For engineering teams with production SLA.' },
              { name: 'Enterprise Mesh', price: '$999', period: '/ mo', desc: 'Custom VPC isolation & dedicated support.' }
            ].map((p, idx) => (
              <div key={idx} className={`p-6 rounded-2xl bg-white border-2 space-y-4 ${p.popular ? 'border-violet-600 shadow-xl' : 'border-violet-200'}`}>
                <h3 className="font-bold text-base text-slate-900">{p.name}</h3>
                <div className="text-3xl font-black text-slate-900">{p.price} <span className="text-xs text-slate-500 font-normal">{p.period}</span></div>
                <p className="text-xs text-slate-600">{p.desc}</p>
                <button onClick={() => onUseDesign(template)} className="w-full py-2.5 rounded-xl bg-violet-600 text-white font-bold text-xs hover:bg-violet-700">
                  Select {p.name}
                </button>
              </div>
            ))}
          </div>
        </main>
      )}

      <footer className="mt-auto py-8 text-center text-xs text-slate-500 border-t border-violet-200">
        &copy; {new Date().getFullYear()} {template.sampleBusinessName}. Pale Lavender Gradient Startup Layout ({template.templateCode}).
      </footer>
    </div>
  );
};

// ============================================================================
// TEMPLATE 10: Geometric Corporate (Meridian Harbor Logistics)
// Dominant: Pale Mint (#F0FDFA) | Teal (#0F766E) | Deep Forest (#134E4A)
// Multi-page navigation: overview (Home), logistics (Harbor Logistics), fleet (Fleet Tracking), certs (ISO Certifications), rfp (Submit RFP)
// ============================================================================
export const GeometricCorporateDemo: React.FC<TemplateDemoProps> = ({ template, onUseDesign }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'logistics' | 'fleet' | 'certs' | 'rfp'>('overview');

  return (
    <div className="min-h-screen bg-[#F0FDFA] text-slate-900 font-sans flex flex-col selection:bg-[#0F766E] selection:text-white">
      {/* Modular Grid Header */}
      <header className="border-b border-[#CCFBF1] bg-white/95 px-6 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
        <button onClick={() => setActiveTab('overview')} className="flex items-center gap-3 text-left">
          <div className="w-8 h-8 rounded-none bg-[#0F766E] text-white flex items-center justify-center font-mono font-bold text-xs">
            MH
          </div>
          <span className="font-black text-sm tracking-widest uppercase text-slate-900">
            {template.sampleBusinessName}
          </span>
        </button>

        {/* Interactive Navigation Grid */}
        <nav className="hidden md:flex items-center space-x-6 text-xs font-bold text-slate-600">
          {[
            { id: 'overview' as const, label: 'Overview' },
            { id: 'logistics' as const, label: 'Harbor Logistics' },
            { id: 'fleet' as const, label: 'Fleet Telemetry' },
            { id: 'certs' as const, label: 'Certifications' },
            { id: 'rfp' as const, label: 'Submit RFP' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`capitalize transition-colors ${
                activeTab === tab.id ? 'text-[#0F766E] font-black border-b-2 border-[#0F766E] pb-1' : 'hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => setActiveTab('rfp')}
          className="bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold px-4 py-2 rounded-xs shadow-md"
        >
          Request B2B Quote &rarr;
        </button>
      </header>

      {/* OVERVIEW PAGE */}
      {activeTab === 'overview' && (
        <main className="flex-1 py-12 px-6 sm:px-8 max-w-6xl mx-auto w-full space-y-10 animate-in fade-in duration-300">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-mono font-bold text-[#0F766E] uppercase">
              INTERMODAL TRANSIT MATRIX &bull; GLOBAL PORTS
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Algorithmic Maritime Freight and Intermodal Port Routing.
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              {template.tagline}
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4">
            <div className="md:col-span-8 p-8 rounded-2xl bg-white border border-[#CCFBF1] shadow-md space-y-4">
              <span className="text-xs font-bold text-[#0F766E] uppercase">Real-Time Transit Control</span>
              <h3 className="text-2xl font-black text-slate-900">Deep Harbor Container Allocation</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-lg">
                Dynamic berthing schedules, automated crane balancing, and automated customs release for international cargo lines.
              </p>
              <div className="pt-2 flex items-center gap-6 text-xs font-mono font-bold text-[#0F766E]">
                <div><span>SLA: </span><span className="text-slate-900">99.98%</span></div>
                <div><span>Throughput: </span><span className="text-slate-900">4.2M TEU</span></div>
              </div>
            </div>

            <div className="md:col-span-4 p-8 rounded-2xl bg-[#0F766E] text-white shadow-md flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-teal-200 uppercase tracking-widest">ISO 9001 Certified</span>
                <h4 className="text-xl font-black mt-2">Zero Cargo Loss Guarantee</h4>
                <p className="text-xs text-teal-100 mt-2 leading-relaxed">
                  Smart sensor seals and satellite telemetry track every container 24/7.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('rfp')}
                className="mt-6 w-full py-2.5 bg-white text-[#0F766E] font-bold text-xs rounded-lg shadow-sm"
              >
                Request Enterprise Quote &rarr;
              </button>
            </div>
          </div>
        </main>
      )}

      {/* LOGISTICS PAGE */}
      {activeTab === 'logistics' && (
        <main className="flex-1 py-12 px-6 sm:px-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#0F766E] uppercase">Port Operations</span>
            <h2 className="text-3xl font-black text-slate-900">Automated Maritime Terminals</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-xl border border-[#CCFBF1] space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Automated Quay Cranes</h4>
              <p className="text-xs text-slate-600">32 twin-lift cranes moving 45 containers per hour with millimeter computer vision.</p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-[#CCFBF1] space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Cold-Chain Stacks</h4>
              <p className="text-xs text-slate-600">12,000 refrigerated TEU berths with continuous telemetry and temperature alarms.</p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-[#CCFBF1] space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Rail Spur Transfer</h4>
              <p className="text-xs text-slate-600">Direct dockside freight trains to inland industrial hubs without highway transfers.</p>
            </div>
          </div>
        </main>
      )}

      {/* FLEET PAGE */}
      {activeTab === 'fleet' && (
        <main className="flex-1 py-12 px-6 sm:px-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#0F766E] uppercase">Vessel Management</span>
            <h2 className="text-3xl font-black text-slate-900">Fleet Telemetry & Status</h2>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-[#CCFBF1] space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div><span className="text-xs text-slate-500">Active Vessels</span><div className="text-2xl font-black text-[#0F766E]">64 Ships</div></div>
              <div><span className="text-xs text-slate-500">Average Transit</span><div className="text-2xl font-black text-[#0F766E]">11.2 Days</div></div>
              <div><span className="text-xs text-slate-500">Fuel Optimization</span><div className="text-2xl font-black text-emerald-600">-14.2% CO2</div></div>
              <div><span className="text-xs text-slate-500">On-Time Arrivals</span><div className="text-2xl font-black text-[#0F766E]">98.6%</div></div>
            </div>
          </div>
        </main>
      )}

      {/* CERTS PAGE */}
      {activeTab === 'certs' && (
        <main className="flex-1 py-12 px-6 sm:px-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#0F766E] uppercase">Global Compliance</span>
            <h2 className="text-3xl font-black text-slate-900">Maritime Standards & Certifications</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-xl border border-[#CCFBF1] space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">ISO 14001: Environmental Management</h4>
              <p className="text-xs text-slate-600">Full compliance with IMO 2026 low-sulfur bunker fuel mandates and shore-power cold ironing.</p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-[#CCFBF1] space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">C-TPAT Tier 3 & AEO Certified</h4>
              <p className="text-xs text-slate-600">Green-lane customs clearance across 42 partner countries with expedited green channel inspections.</p>
            </div>
          </div>
        </main>
      )}

      {/* RFP PAGE */}
      {activeTab === 'rfp' && (
        <main className="flex-1 py-12 px-6 sm:px-8 max-w-3xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#0F766E] uppercase">Corporate Freight Desk</span>
            <h2 className="text-3xl font-black text-slate-900">Submit Intermodal Freight RFP</h2>
          </div>
          <div className="p-8 bg-white border border-[#CCFBF1] rounded-2xl shadow-xl">
            <form onSubmit={(e) => { e.preventDefault(); alert('RFP dossier submitted to Meridian Harbor logistics desk.'); }} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Company / Freight Forwarder</label>
                <input type="text" required placeholder="Pacific Trade Lines" className="w-full px-3.5 py-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-lg text-slate-900" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Origin Port</label>
                  <input type="text" required placeholder="Singapore Port" className="w-full px-3.5 py-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-lg text-slate-900" />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Destination Port</label>
                  <input type="text" required placeholder="Rotterdam Harbor" className="w-full px-3.5 py-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-lg text-slate-900" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-[#0F766E] text-white font-bold rounded-lg hover:bg-[#115E59]">
                Submit Freight RFP &rarr;
              </button>
            </form>
          </div>
        </main>
      )}

      <footer className="mt-auto py-8 text-center text-xs text-slate-500 border-t border-[#CCFBF1]">
        &copy; {new Date().getFullYear()} {template.sampleBusinessName}. Pale Mint Geometric Corporate Layout ({template.templateCode}).
      </footer>
    </div>
  );
};

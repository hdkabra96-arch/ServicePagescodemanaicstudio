/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';
import { BUSINESS_TEMPLATES } from '../data/businessTemplates';
import { ALL_TEMPLATES } from '../data/servicesData';

export interface StandaloneProjectFile {
  path: string;
  content: string;
}

export interface TemplateCatalogItem {
  id: string;
  code: string;
  name: string;
  category: string;
  type: 'website' | 'web-app' | 'mobile-app' | 'ecommerce' | 'corporate' | 'booking' | 'student' | 'custom';
  tier?: 'basic' | 'mid-range' | 'premium' | 'ultra-premium';
  tierLabel?: string;
  pagesCount: number | string;
  description: string;
  sampleBusinessName: string;
  primaryTech: string[];
  dominantBackground?: string;
  estimatedPrice?: string;
  deliveryDays?: string;
  slug: string;
  previewUrl: string;
  fileCount: number;
  approxSizeKb: number;
}

export type DownloadableTemplateItem = TemplateCatalogItem;

// Generate base package.json for downloaded projects
export function generatePackageJson(name: string, description: string): string {
  const safeName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
  return JSON.stringify(
    {
      name: safeName,
      private: true,
      version: '1.0.0',
      type: 'module',
      description,
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      dependencies: {
        react: '^19.0.1',
        'react-dom': '^19.0.1',
        'lucide-react': '^0.546.0'
      },
      devDependencies: {
        '@types/react': '^19.3.0',
        '@types/react-dom': '^19.3.0',
        '@vitejs/plugin-react': '^6.1.1',
        tailwindcss: '^4.3.3',
        '@tailwindcss/vite': '^4.3.3',
        typescript: '^7.0.2',
        vite: '^8.3.0'
      }
    },
    null,
    2
  );
}

// Generate vite.config.ts
export function generateViteConfig(): string {
  return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
});
`;
}

// Generate tsconfig.json
export function generateTsConfig(): string {
  return JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
        noFallthroughCasesInSwitch: true
      },
      include: ['src']
    },
    null,
    2
  );
}

// Generate index.html
export function generateIndexHtml(title: string, description: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} | Codemaniac Studio</title>
    <meta name="description" content="${description}" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

// Generate src/index.css
export function generateIndexCss(): string {
  return `@import "tailwindcss";

@layer base {
  body {
    margin: 0;
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
}
`;
}

// Generate src/main.tsx
export function generateMainTsx(): string {
  return `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
`;
}

// Generate comprehensive README.md
export function generateReadme(name: string, code: string, category: string, tier: string, description: string): string {
  return `# ${name} (${code})
> **Codemaniac Studio** — Production Source Code Package

## Overview
- **Template Code**: \`${code}\`
- **Category**: ${category}
- **Design Tier**: ${tier || 'Production'}
- **Architecture**: Responsive, Accessible, Interactive Multi-Page SPA
- **Styling**: Tailwind CSS v4 & Lucide React

${description}

---

## Getting Started

### 1. Install Dependencies
Make sure you have Node.js 18+ installed on your system.

\`\`\`bash
npm install
\`\`\`

### 2. Start Development Server
\`\`\`bash
npm run dev
\`\`\`
The application will launch at \`http://localhost:3000\`.

### 3. Build for Production
\`\`\`bash
npm run build
\`\`\`
The optimized static build will be placed in the \`dist/\` directory, ready to deploy to Vercel, Netlify, Cloudflare Pages, AWS S3, or any static web host.

---

## File Structure
\`\`\`
├── index.html          # HTML entry point with typography
├── package.json        # Dependencies & scripts
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite bundler & Tailwind configuration
├── README.md           # Documentation & instructions
└── src/
    ├── main.tsx        # React root mounting
    ├── index.css       # Global styles & Tailwind imports
    └── App.tsx         # Complete self-contained application code
\`\`\`

---

## Customization Guide
- **Branding & Logos**: Edit the header branding in \`src/App.tsx\` to replace sample names with your company name or custom SVG logo.
- **Colors & Accents**: Modify the Tailwind utility classes (e.g., \`text-orange-600\`, \`bg-blue-600\`) in \`src/App.tsx\`.
- **Forms & Backend**: Connect the contact/appointment submission handler to your REST API, Firebase Firestore, or webhook endpoint.

---
© ${new Date().getFullYear()} Codemaniac Studio. Built with clean craftsmanship.
`;
}

// Get all available downloadable templates combining Business Templates & Core App Demos
export function getAllDownloadableTemplates(): TemplateCatalogItem[] {
  const list: TemplateCatalogItem[] = [];

  // 1. All 20 Business Templates
  BUSINESS_TEMPLATES.forEach((biz) => {
    const num = parseInt(biz.templateNumber, 10);
    const pagesCount = num <= 5 ? 'Single-Page (Anchor Sections)' : num <= 10 ? '4–5 Interactive Pages' : num <= 15 ? '5 Dedicated Pages' : '10 Dedicated Pages';

    list.push({
      id: biz.id,
      code: biz.templateCode,
      name: biz.name,
      category: 'Business Websites',
      type: 'website',
      tier: biz.tier,
      tierLabel: biz.tierLabel,
      pagesCount,
      description: biz.description,
      sampleBusinessName: biz.sampleBusinessName,
      primaryTech: ['React 19', 'TypeScript', 'Tailwind CSS', biz.typographySystem.split('(')[0].trim()],
      dominantBackground: biz.dominantBackground,
      estimatedPrice: biz.estimatedPrice,
      deliveryDays: biz.deliveryDays,
      slug: biz.slug,
      previewUrl: `/preview/${biz.slug}`,
      fileCount: 7,
      approxSizeKb: 45
    });
  });

  // 2. Web Application Demos
  list.push({
    id: 'app-admin-panel',
    code: 'AP-001',
    name: 'OmniFlow SaaS Admin Panel & Analytics Dashboard',
    category: 'Web Applications',
    type: 'web-app',
    tier: 'premium',
    tierLabel: 'Premium',
    pagesCount: '8 Operational Tabs',
    description: 'Enterprise operational dashboard with live system metrics, users table, RBAC security, subscription billing, and telemetry charts.',
    sampleBusinessName: 'OmniFlow Systems',
    primaryTech: ['React 19', 'TypeScript', 'Tailwind CSS', 'Lucide Icons', 'Live Telemetry'],
    dominantBackground: '#0F172A',
    estimatedPrice: '₹35,000 – ₹70,000',
    deliveryDays: '10 – 14 Days',
    slug: 'admin-panel',
    previewUrl: '/web-app/admin-panel',
    fileCount: 7,
    approxSizeKb: 68
  });

  list.push({
    id: 'app-booking-system',
    code: 'BOOK-001',
    name: 'MedCare & Salon Appointment Booking System',
    category: 'Web Applications',
    type: 'booking',
    tier: 'mid-range',
    tierLabel: 'Mid-Range',
    pagesCount: '5 Booking Steps',
    description: 'Full appointment scheduling workflow with doctor/specialist directory, real-time slot calendar, customer intake form, and SMS/Email confirmation.',
    sampleBusinessName: 'Aura Health Booking',
    primaryTech: ['React 19', 'TypeScript', 'Tailwind CSS', 'Calendar State', 'Interactive Slots'],
    dominantBackground: '#F0FDF4',
    estimatedPrice: '₹25,000 – ₹50,000',
    deliveryDays: '7 – 10 Days',
    slug: 'booking-system',
    previewUrl: '/web-app/booking',
    fileCount: 7,
    approxSizeKb: 54
  });

  list.push({
    id: 'app-student-mgmt',
    code: 'STUD-001',
    name: 'EduTrack Academic ERP & Student Management',
    category: 'Web Applications',
    type: 'student',
    tier: 'mid-range',
    tierLabel: 'Mid-Range',
    pagesCount: '6 Modules',
    description: 'Comprehensive school and academy management with student profiles, course enrollment, attendance tracking, fee payment receipts, and grade reports.',
    sampleBusinessName: 'EduTrack Academy',
    primaryTech: ['React 19', 'TypeScript', 'Tailwind CSS', 'Data Grid', 'Grade Calculator'],
    dominantBackground: '#FFFBEB',
    estimatedPrice: '₹30,000 – ₹60,000',
    deliveryDays: '8 – 12 Days',
    slug: 'student-management',
    previewUrl: '/web-app/student-mgmt',
    fileCount: 7,
    approxSizeKb: 58
  });

  // 3. Mobile App Demos
  list.push({
    id: 'mobile-app-food',
    code: 'AND-001',
    name: 'Cravo Food Delivery & Ordering Mobile App',
    category: 'Mobile Apps',
    type: 'mobile-app',
    tier: 'premium',
    tierLabel: 'Premium',
    pagesCount: '7 Mobile Screens',
    description: 'Responsive mobile app interface with restaurant feed, interactive dish customizer, cart drawer, GPS tracking simulation, and wallet checkout.',
    sampleBusinessName: 'Cravo Delivery',
    primaryTech: ['React 19', 'TypeScript', 'Mobile Viewport Frame', 'Tailwind CSS'],
    dominantBackground: '#FFF7ED',
    estimatedPrice: '₹40,000 – ₹85,000',
    deliveryDays: '14 – 18 Days',
    slug: 'mobile-app-demo',
    previewUrl: '/app/android',
    fileCount: 7,
    approxSizeKb: 62
  });

  // 4. E-Commerce Storefront
  list.push({
    id: 'ecom-store-modern',
    code: 'ECOM-001',
    name: 'LuxeStore Modern Digital Storefront & Checkout',
    category: 'E-commerce Solutions',
    type: 'ecommerce',
    tier: 'premium',
    tierLabel: 'Premium',
    pagesCount: '6 Store Views',
    description: 'Conversion-focused digital storefront with multi-category product catalog, real-time cart, price filter, product detail modal, and 3-step checkout.',
    sampleBusinessName: 'LuxeStore Goods',
    primaryTech: ['React 19', 'TypeScript', 'Tailwind CSS', 'Cart Store', 'Stripe UI'],
    dominantBackground: '#FAFAFA',
    estimatedPrice: '₹30,000 – ₹65,000',
    deliveryDays: '10 – 14 Days',
    slug: 'ecommerce-store',
    previewUrl: '/ecommerce/store',
    fileCount: 7,
    approxSizeKb: 72
  });

  // 5. Corporate Enterprise Demos
  list.push({
    id: 'corp-nexora-global',
    code: 'CORP-001',
    name: 'Nexora Global Enterprise & Investor Relations Portal',
    category: 'Corporate Websites',
    type: 'corporate',
    tier: 'ultra-premium',
    tierLabel: 'Ultra Premium',
    pagesCount: '6 Corporate Sections',
    description: 'Executive corporate portal with investor deck, C-suite leadership grid, ESG impact statistics, multi-office locator, and B2B RFQ form.',
    sampleBusinessName: 'Nexora Global Group',
    primaryTech: ['React 19', 'TypeScript', 'Tailwind CSS', 'Corporate Grid', 'Financial Metrics'],
    dominantBackground: '#0B0F19',
    estimatedPrice: '₹45,000 – ₹95,000',
    deliveryDays: '12 – 16 Days',
    slug: 'corporate-portal',
    previewUrl: '/custom-websites/corporate',
    fileCount: 7,
    approxSizeKb: 66
  });

  list.push({
    id: 'tmpl-biz-pro-01',
    code: 'BIZ-001',
    name: 'Business Pro Enterprise Agency Website',
    category: 'Business Websites',
    type: 'website',
    tier: 'mid-range',
    tierLabel: 'Mid-Range',
    pagesCount: '6 Full Pages',
    description: 'Versatile corporate agency layout with interactive cost estimator, portfolio filter, client testimonials, video pitch modal, and quote form.',
    sampleBusinessName: 'Codemaniac Business Pro',
    primaryTech: ['React 19', 'TypeScript', 'Tailwind CSS', 'Estimator State'],
    dominantBackground: '#FFFFFF',
    estimatedPrice: '₹20,000 – ₹40,000',
    deliveryDays: '5 – 7 Days',
    slug: 'business-pro-demo',
    previewUrl: '/website/business',
    fileCount: 7,
    approxSizeKb: 50
  });

  return list;
}

// Generate the specific App.tsx code for any template
export function generateStandaloneAppTsx(template: TemplateCatalogItem): string {
  const code = template.code.toUpperCase();
  const num = parseInt(code.replace(/\D/g, '') || '1', 10);

  // Return a rich, functional standalone React App component tailored to this exact template
  return `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Standalone Source Code for: ${template.name} (${template.code})
 * Generated by Codemaniac Studio Admin Portal
 */

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
  Zap,
  Globe,
  Sliders,
  Play,
  Layers,
  Building2,
  Lock,
  Eye,
  Activity,
  Terminal,
  Cpu
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const sampleName = "${template.sampleBusinessName}";
  const tagline = "${template.description.replace(/"/g, '\\"')}";

  const handleNav = (tabId: string) => {
    setActiveTab(tabId);
    const element = document.getElementById(tabId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
            ${code.slice(0, 3)}
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight">
              {sampleName}
            </span>
            <span className="text-[10px] text-orange-600 font-mono font-bold uppercase tracking-wider">
              ${template.code} &bull; ${template.category}
            </span>
          </div>
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
          {[
            { id: 'home', label: 'Home' },
            { id: 'services', label: 'Services' },
            { id: 'about', label: 'About Us' },
            { id: 'features', label: 'Features' },
            { id: 'contact', label: 'Contact' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={\`transition-colors py-1 \${
                activeTab === item.id ? 'text-orange-600 font-bold border-b-2 border-orange-600' : 'hover:text-slate-900'
              }\`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action Button */}
        <button
          onClick={() => handleNav('contact')}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
        >
          <span>Get in Touch</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* HERO SECTION */}
        <section id="home" className="py-20 px-6 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-full border border-orange-200">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>${template.tierLabel || 'Premium'} Architecture &bull; ${template.pagesCount}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              High-Impact Digital Solutions for Modern Enterprises.
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {tagline}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handleNav('contact')}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <span>Start Project</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleNav('services')}
                className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs px-6 py-3.5 rounded-xl transition-all"
              >
                <span>Explore Capabilities</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-xs">
              <div>
                <div className="text-2xl font-black text-slate-900">99.9%</div>
                <div className="text-slate-500 mt-0.5">Uptime SLA</div>
              </div>
              <div>
                <div className="text-2xl font-black text-orange-600">&lt;45s</div>
                <div className="text-slate-500 mt-0.5">Response Time</div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">100%</div>
                <div className="text-slate-500 mt-0.5">Custom Code</div>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-mono font-bold text-slate-500">SYSTEM ARCHITECTURE</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                ACTIVE &bull; PROD
              </span>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Core UI Framework', desc: 'React 19 + TypeScript + Tailwind CSS v4' },
                { title: 'Typography Engine', desc: 'Google Fonts with zero-layout-shift preload' },
                { title: 'Responsive Viewport', desc: 'Fluid 1440px desktop, tablet, and mobile layouts' },
                { title: 'State & Navigation', desc: 'Instant page routing with deep-link URL state' }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    <p className="text-[11px] text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleNav('contact')}
              className="w-full py-3 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors"
            >
              Request Custom Demo &rarr;
            </button>
          </div>
        </section>

        {/* SERVICES GRID */}
        <section id="services" className="py-20 px-6 bg-white border-y border-slate-200">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-mono font-bold text-orange-600 uppercase tracking-widest">WHAT WE DELIVER</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Engineered for Performance &amp; Conversion</h2>
              <p className="text-slate-600 text-xs sm:text-sm">Every screen is architected from clean fundamentals with high aesthetic discipline.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Bespoke Visual Identity', desc: 'Tailored palette, typography, and hierarchy that avoids generic AI slop templates.' },
                { title: 'Full Code Ownership', desc: '100% clean TypeScript source code with zero lock-in and complete deployment freedom.' },
                { title: 'Conversion Pathways', desc: 'Optimized touchpoints, clear CTAs, and integrated lead capture mechanisms.' }
              ].map((srv, idx) => (
                <div key={idx} className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:border-orange-200 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                    0{idx + 1}
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-900">{srv.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{srv.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT / INQUIRY SECTION */}
        <section id="contact" className="py-20 px-6 max-w-4xl mx-auto w-full">
          <div className="text-center space-y-3 mb-10">
            <span className="text-xs font-mono font-bold text-orange-600 uppercase tracking-widest">GET STARTED TODAY</span>
            <h2 className="text-3xl font-black text-slate-900">Request Custom Deployment</h2>
            <p className="text-slate-600 text-xs sm:text-sm">Complete this form and our engineering team will get in touch within 24 hours.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-lg">
            {submitted ? (
              <div className="p-10 text-center bg-orange-50 rounded-2xl space-y-4">
                <CheckCircle2 className="w-12 h-12 text-orange-600 mx-auto" />
                <h3 className="text-xl font-bold text-slate-900">Inquiry Transmitted Successfully</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Thank you! Our technical lead has received your project details and will prepare a tailored proposal for {formData.name || 'your business'}.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-orange-600 text-white rounded-lg text-xs font-bold"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Business Email</label>
                    <input
                      required
                      type="email"
                      placeholder="alex@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Project Requirements</label>
                  <textarea
                    rows={4}
                    placeholder="Describe your design and functionality needs..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors"
                >
                  Send Inquiry &rarr;
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} {sampleName}. Source Code Package &bull; Generated by Codemaniac Studio.</p>
      </footer>
    </div>
  );
}
`;
}

// Generate the complete array of project files for any template
export function getTemplateProjectFiles(template: TemplateCatalogItem): StandaloneProjectFile[] {
  return [
    {
      path: 'package.json',
      content: generatePackageJson(template.slug || template.name, template.description)
    },
    {
      path: 'vite.config.ts',
      content: generateViteConfig()
    },
    {
      path: 'tsconfig.json',
      content: generateTsConfig()
    },
    {
      path: 'index.html',
      content: generateIndexHtml(template.name, template.description)
    },
    {
      path: 'README.md',
      content: generateReadme(template.name, template.code, template.category, template.tierLabel || '', template.description)
    },
    {
      path: 'src/index.css',
      content: generateIndexCss()
    },
    {
      path: 'src/main.tsx',
      content: generateMainTsx()
    },
    {
      path: 'src/App.tsx',
      content: generateStandaloneAppTsx(template)
    }
  ];
}

// Trigger browser download of a generated Blob
export function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// Download a single template project as a ZIP archive
export async function downloadSingleTemplateZip(template: TemplateCatalogItem): Promise<void> {
  const zip = new JSZip();
  const folderName = `${template.code.toLowerCase()}-${template.slug}`;
  const root = zip.folder(folderName) || zip;

  const files = getTemplateProjectFiles(template);
  files.forEach((file) => {
    root.file(file.path, file.content);
  });

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  const filename = `Codemaniac-${template.code}-${template.slug}.zip`;
  triggerFileDownload(blob, filename);
}

// Download all templates in a single categorized master ZIP
export async function downloadAllTemplatesZip(
  arg1: string | TemplateCatalogItem[],
  arg2?: TemplateCatalogItem[] | ((percent: number, currentName: string) => void),
  onProgress?: (current: number, total: number, name: string) => void
): Promise<void> {
  let archiveBaseName = 'Codemaniac-Master-Templates';
  let templateList: TemplateCatalogItem[] = [];
  let progressFn: ((current: number, total: number, name: string) => void) | undefined;

  if (typeof arg1 === 'string') {
    archiveBaseName = arg1;
    templateList = Array.isArray(arg2) ? arg2 : [];
    progressFn = onProgress;
  } else if (Array.isArray(arg1)) {
    templateList = arg1;
    if (typeof arg2 === 'function') {
      progressFn = (current, total, name) => {
        (arg2 as (percent: number, currentName: string) => void)(Math.round((current / total) * 100), name);
      };
    }
  }

  const zip = new JSZip();
  const master = zip.folder(archiveBaseName) || zip;

  const total = templateList.length;
  for (let i = 0; i < total; i++) {
    const tmpl = templateList[i];
    if (progressFn) {
      progressFn(i + 1, total, tmpl.name);
    }

    let categoryFolder = '01-business-websites';
    if (tmpl.type === 'web-app' || tmpl.type === 'booking' || tmpl.type === 'student') {
      categoryFolder = '02-web-applications';
    } else if (tmpl.type === 'mobile-app') {
      categoryFolder = '03-mobile-apps';
    } else if (tmpl.type === 'ecommerce') {
      categoryFolder = '04-ecommerce-solutions';
    } else if (tmpl.type === 'corporate') {
      categoryFolder = '05-corporate-websites';
    }

    const tmplFolder = master.folder(`${categoryFolder}/${tmpl.code.toLowerCase()}-${tmpl.slug}`);
    if (tmplFolder) {
      const files = getTemplateProjectFiles(tmpl);
      files.forEach((file) => {
        tmplFolder.file(file.path, file.content);
      });
    }
  }

  // Master Readme
  master.file(
    'README.md',
    `# Codemaniac Studio - Complete Master Template Archive
Contains full standalone runnable projects for all 20 Business Websites, Web Applications, Mobile Apps, E-Commerce, and Corporate solutions.

Each subfolder contains its own complete runnable Vite + React + TypeScript + Tailwind CSS project with \`package.json\`, \`App.tsx\`, and instructions.

Generated on ${new Date().toISOString()} by Codemaniac Studio Admin Portal.
`
  );

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  triggerFileDownload(blob, `${archiveBaseName}.zip`);
}

import { ServiceItem, TemplateItem, CaseStudy } from '../types';

export const CORE_SERVICES: ServiceItem[] = [
  {
    id: 'website-development',
    title: 'Website Development',
    description: 'Custom, high-performing websites tailored to your brand, audience, and growth objectives.',
    icon: 'Globe',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED',
    category: 'core',
    path: 'website-development'
  },
  {
    id: 'web-application',
    title: 'Web Application Development',
    description: 'Secure, scalable web apps, internal tools, customer portals, and workflow management systems.',
    icon: 'Code',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF',
    category: 'core',
    path: 'web-application'
  },
  {
    id: 'app-development',
    title: 'App Development',
    description: 'High-quality native and cross-platform Android and iOS mobile applications.',
    icon: 'Smartphone',
    iconColor: '#7C3AED',
    iconBg: '#F5F3FF',
    category: 'core',
    path: 'app-development'
  },
  {
    id: 'ecommerce',
    title: 'E-commerce Solutions',
    description: 'Conversion-focused online stores with seamless payment gateways, cart management, and inventory.',
    icon: 'ShoppingCart',
    iconColor: '#059669',
    iconBg: '#ECFDF5',
    category: 'core',
    path: 'ecommerce'
  },
  {
    id: 'custom-websites',
    title: 'Custom Websites',
    description: 'Bespoke web architectures tailored from scratch for unique specifications and niche business models.',
    icon: 'Settings',
    iconColor: '#DB2777',
    iconBg: '#FDF2F8',
    category: 'core',
    path: 'custom-websites'
  }
];

export const MORE_SERVICES: ServiceItem[] = [
  {
    id: 'website-maintenance',
    title: 'Website Maintenance',
    description: 'Routine updates, security patches, backups, uptime monitoring, and ongoing technical support.',
    icon: 'Wrench',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED',
    category: 'additional',
    path: 'website-development'
  },
  {
    id: 'deployment-hosting',
    title: 'Deployment & Hosting',
    description: 'High-availability cloud setup on Vercel, AWS, Google Cloud, Docker, and Hostinger with SSL.',
    icon: 'Rocket',
    iconColor: '#E11D48',
    iconBg: '#FFF1F2',
    category: 'additional',
    path: 'web-application'
  },
  {
    id: 'data-dashboard',
    title: 'Data & Dashboard Solutions',
    description: 'Interactive analytical dashboards, KPI trackers, visual reporting, and real-time business telemetry.',
    icon: 'BarChart3',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF',
    category: 'additional',
    path: 'web-application'
  },
  {
    id: 'api-integration',
    title: 'API Integration',
    description: 'Third-party integrations with Stripe, Razorpay, WhatsApp Business, Google APIs, and custom REST/GraphQL.',
    icon: 'Link',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF',
    category: 'additional',
    path: 'web-application'
  },
  {
    id: 'security-performance',
    title: 'Security & Performance',
    description: 'DDoS mitigation, SQL injection hardening, Core Web Vitals speed optimization, and 99.9% uptime.',
    icon: 'ShieldCheck',
    iconColor: '#059669',
    iconBg: '#ECFDF5',
    category: 'additional',
    path: 'website-development'
  },
  {
    id: 'seo-optimization',
    title: 'SEO & Digital Optimization',
    description: 'Technical on-page SEO, schema metadata markup, fast indexing, semantic hierarchy, and search ranking.',
    icon: 'Search',
    iconColor: '#9333EA',
    iconBg: '#FAF5FF',
    category: 'additional',
    path: 'website-development'
  }
];

export const WEBSITE_SOLUTIONS = [
  { id: 'business', name: 'Business Websites', icon: 'Globe', color: 'orange', desc: 'Modern and responsive websites to showcase your services.' },
  { id: 'corporate', name: 'Corporate Websites', icon: 'BarChart3', color: 'blue', desc: 'Professional online presence for growing corporate brands.' },
  { id: 'portfolio', name: 'Portfolio Websites', icon: 'User', color: 'pink', desc: 'Stunning showcases for creatives, freelancers & agencies.' },
  { id: 'landing', name: 'Landing Pages', icon: 'FileText', color: 'teal', desc: 'High-converting sales and marketing lead-gen pages.' },
  { id: 'ecommerce', name: 'E-commerce Websites', icon: 'ShoppingCart', color: 'purple', desc: 'Modern digital storefronts with checkout and orders.' },
  { id: 'educational', name: 'Educational Websites', icon: 'GraduationCap', color: 'amber', desc: 'Platforms for schools, institutes, and online academies.' },
  { id: 'blog', name: 'Blog & Content Websites', icon: 'BookOpen', color: 'sky', desc: 'Content-rich editorial publications and news portals.' },
  { id: 'custom', name: 'Custom Websites', icon: 'Settings', color: 'rose', desc: 'Custom built architectures for unique digital ideas.' }
];

export const WEB_APP_SOLUTIONS = [
  { id: 'admin-panel', name: 'Admin Panels', icon: 'Settings', color: 'orange', desc: 'Manage your business operations with powerful and easy-to-use admin panels.' },
  { id: 'dashboard', name: 'Dashboard Development', icon: 'BarChart3', color: 'blue', desc: 'Get real-time insights with interactive and data-driven dashboards.' },
  { id: 'crm', name: 'CRM Systems', icon: 'UserCheck', color: 'pink', desc: 'Manage your customers, leads, pipelines, and sales team.' },
  { id: 'booking', name: 'Booking Systems', icon: 'Calendar', color: 'purple', desc: 'Online booking and appointment systems for service businesses.' },
  { id: 'billing', name: 'Billing Systems', icon: 'Receipt', color: 'teal', desc: 'Automate invoicing, GST tax compliance, and recurring billing.' },
  { id: 'student-mgmt', name: 'Student Management Systems', icon: 'GraduationCap', color: 'amber', desc: 'Complete solution to manage students, courses, attendance, and fees.' }
];

export const ALL_TEMPLATES: TemplateItem[] = [
  // Business Website Templates (Service page 3 & 4)
  {
    id: 'tmpl-biz-01',
    templateCode: 'BIZ-001',
    name: 'Business Pro',
    serviceCategory: 'Business Website',
    industryTag: 'Corporate',
    description: 'A clean, modern and conversion-optimized website template for professional enterprises and agencies.',
    previewType: 'website',
    imagePlaceholderGradient: 'from-blue-600 via-indigo-600 to-slate-900',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
    features: ['Service Showcase', 'Video Pitch Modal', 'Quote Request Form', 'Interactive Portfolio Grid', 'Testimonials Strip'],
    tags: ['Corporate', 'Agency', 'Consulting']
  },
  {
    id: 'tmpl-biz-02',
    templateCode: 'BIZ-002',
    name: 'Creative Agency',
    serviceCategory: 'Business Website',
    industryTag: 'Creative',
    description: 'Vibrant, bold layout designed for design studios, marketing agencies, and media companies.',
    previewType: 'website',
    imagePlaceholderGradient: 'from-orange-500 via-amber-500 to-rose-600',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
    features: ['Dark Mode Toggle', 'Case Studies Slider', 'Client Logo Cloud', 'Team Member Cards', 'Contact Map'],
    tags: ['Agency', 'Creative', 'Service Provider']
  },
  {
    id: 'tmpl-biz-03',
    templateCode: 'BIZ-003',
    name: 'Consulting Firm',
    serviceCategory: 'Business Website',
    industryTag: 'Consultant',
    description: 'Authoritative, refined template tailored for financial advisors, legal attorneys, and management consultants.',
    previewType: 'website',
    imagePlaceholderGradient: 'from-slate-700 via-slate-800 to-slate-950',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80',
    features: ['Consultation Booking', 'Practices Matrix', 'Insight Articles', 'Credential Badges', 'Multi-Office Locations'],
    tags: ['Consultant', 'Finance', 'Legal']
  },
  {
    id: 'tmpl-biz-04',
    templateCode: 'BIZ-004',
    name: 'Restaurant & Cafe',
    serviceCategory: 'Business Website',
    industryTag: 'Restaurant',
    description: 'Appetizing visual showcase with table reservation system, digital menu, and location hours.',
    previewType: 'website',
    imagePlaceholderGradient: 'from-amber-600 via-orange-600 to-stone-900',
    thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
    features: ['Digital Menu with Tabs', 'Table Reservation', 'Chef Specials Banner', 'Customer Reviews', 'Google Maps Embed'],
    tags: ['Restaurant', 'Local Business', 'Food']
  },
  {
    id: 'tmpl-biz-05',
    templateCode: 'BIZ-005',
    name: 'Real Estate Modern',
    serviceCategory: 'Business Website',
    industryTag: 'Real Estate',
    description: 'High-end property showcase with smart search filters, floor plan galleries, and broker enquiry forms.',
    previewType: 'website',
    imagePlaceholderGradient: 'from-cyan-700 via-teal-800 to-slate-900',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    features: ['Property Filter', 'Mortgage Estimator', 'Virtual Tour Slot', 'Agent Profiles', 'Neighborhood Highlights'],
    tags: ['Real Estate', 'Local Business', 'Corporate']
  },
  {
    id: 'tmpl-biz-06',
    templateCode: 'BIZ-006',
    name: 'HealthCare Center',
    serviceCategory: 'Business Website',
    industryTag: 'Healthcare',
    description: 'Patient-friendly portal for clinics, diagnostic centers, and hospitals with doctor booking.',
    previewType: 'website',
    imagePlaceholderGradient: 'from-teal-600 via-emerald-600 to-sky-900',
    thumbnail: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80',
    features: ['Doctor Appointment Picker', 'Departments List', 'Health Packages', 'Emergency Call Button', 'Patient Testimonials'],
    tags: ['Healthcare', 'Local Business', 'Service Provider', 'business']
  },

  // Corporate Website Templates
  {
    id: 'tmpl-corp-01',
    templateCode: 'CORP-001',
    name: 'Nexora Global Enterprise',
    serviceCategory: 'Corporate Website',
    industryTag: 'Enterprise',
    description: 'Executive corporate portal built for multi-national groups, investor relations, and sustainability reporting.',
    previewType: 'corporate',
    imagePlaceholderGradient: 'from-slate-900 via-blue-950 to-indigo-950',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
    features: ['Investor Relations Deck', 'Executive Leadership Grid', 'Annual ESG Impact Report', 'Interactive Financial Calculator', 'Global Office Locations'],
    tags: ['Enterprise', 'Corporate', 'Global', 'corporate']
  },
  {
    id: 'tmpl-corp-02',
    templateCode: 'CORP-002',
    name: 'Apex Industrial Holdings',
    serviceCategory: 'Corporate Website',
    industryTag: 'Manufacturing',
    description: 'Robust and trustworthy web presence for engineering conglomerates, industrial manufacturing, and supply chains.',
    previewType: 'corporate',
    imagePlaceholderGradient: 'from-zinc-800 via-slate-800 to-slate-950',
    thumbnail: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=600&auto=format&fit=crop&q=80',
    features: ['Plant Capabilities Tour', 'Supply Chain Timeline', 'Certifications & ISO Vault', 'B2B RFQ Quote Form', 'Client Case Studies'],
    tags: ['Manufacturing', 'Industrial', 'B2B', 'corporate']
  },
  {
    id: 'tmpl-corp-03',
    templateCode: 'CORP-003',
    name: 'Veritas Financial Advisory',
    serviceCategory: 'Corporate Website',
    industryTag: 'Finance',
    description: 'Polished financial institution portal for wealth management, private equity, and institutional audit partners.',
    previewType: 'corporate',
    imagePlaceholderGradient: 'from-blue-950 via-slate-900 to-indigo-950',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80',
    features: ['Market Intelligence Feeds', 'Client Portal Gateway', 'Compliance & Disclosures', 'Direct Partner Booking', 'Secure Document Vault'],
    tags: ['Finance', 'Advisory', 'Banking', 'corporate']
  },
  {
    id: 'tmpl-corp-04',
    templateCode: 'CORP-004',
    name: 'Stratos Capital Partners',
    serviceCategory: 'Corporate Website',
    industryTag: 'Investment',
    description: 'Sleek dark-mode aesthetic for venture capital, private equity funds, and emerging technology incubators.',
    previewType: 'corporate',
    imagePlaceholderGradient: 'from-emerald-950 via-slate-900 to-slate-950',
    thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80',
    features: ['Portfolio Company Grid', 'Investment Thesis Matrix', 'Founder Pitch Submissions', 'Press & Media Mentions', 'LP Investor Access'],
    tags: ['Investment', 'Venture Capital', 'Tech', 'corporate']
  },

  // Portfolio Website Templates
  {
    id: 'tmpl-port-01',
    templateCode: 'PORT-001',
    name: 'Minimalist Design Studio',
    serviceCategory: 'Portfolio Website',
    industryTag: 'Design Agency',
    description: 'Award-winning visual showcase tailored for creative agencies, UI/UX consultancies, and art directors.',
    previewType: 'website',
    imagePlaceholderGradient: 'from-neutral-900 via-stone-800 to-stone-950',
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
    features: ['Fullscreen Visual Showcase', 'Smooth Cursor & Transitions', 'Case Study Deep-Dive', 'Award Badges Ribbon', 'Quick Inquiry Drawer'],
    tags: ['Design', 'Creative', 'Agency', 'portfolio']
  },
  {
    id: 'tmpl-port-02',
    templateCode: 'PORT-002',
    name: 'Creative Freelancer Showcase',
    serviceCategory: 'Portfolio Website',
    industryTag: 'Freelancer',
    description: 'High-impact personal portfolio for freelance developers, graphic designers, copywriters, and 3D artists.',
    previewType: 'website',
    imagePlaceholderGradient: 'from-orange-600 via-amber-600 to-stone-900',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
    features: ['Interactive Project Sliders', 'Tech Stack Pills', 'Client Testimonial Quotes', 'Resume / CV Download', 'Calendly Meeting Booking'],
    tags: ['Freelance', 'Personal', 'Developer', 'portfolio']
  },
  {
    id: 'tmpl-port-03',
    templateCode: 'PORT-003',
    name: 'Spatial Architecture & Interiors',
    serviceCategory: 'Portfolio Website',
    industryTag: 'Architecture',
    description: 'Editorial elegance tailored for architectural firms, interior designers, and luxury landscape creators.',
    previewType: 'website',
    imagePlaceholderGradient: 'from-stone-600 via-stone-800 to-stone-950',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    features: ['High-Res Project Gallery', 'Before/After Comparison Slider', 'Blueprint & CAD Schematics', 'Material Palette Grid', 'Studio Location Map'],
    tags: ['Architecture', 'Interior', 'Luxury', 'portfolio']
  },
  {
    id: 'tmpl-port-04',
    templateCode: 'PORT-004',
    name: 'Digital Creator & Personal Brand',
    serviceCategory: 'Portfolio Website',
    industryTag: 'Content Creator',
    description: 'Vibrant personal brand hub with social feed integration, podcast episodes, newsletters, and sponsorship decks.',
    previewType: 'website',
    imagePlaceholderGradient: 'from-purple-600 via-pink-600 to-indigo-900',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    features: ['Featured Media Highlights', 'Newsletter Subscription Box', 'Podcast Audio Player', 'Brand Partnership Rate Card', 'Social Video Carousel'],
    tags: ['Creator', 'Media', 'Personal Brand', 'portfolio']
  },

  // Landing Page Templates
  {
    id: 'tmpl-land-01',
    templateCode: 'LAND-001',
    name: 'SaaS Product Launch',
    serviceCategory: 'Landing Page',
    industryTag: 'SaaS Product',
    description: 'Hyper conversion-focused launch page with interactive product tour, pricing table, and social proof ticker.',
    previewType: 'website',
    imagePlaceholderGradient: 'from-indigo-600 via-blue-600 to-purple-900',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    features: ['Hero Animated Walkthrough', 'Tiered Monthly/Annual Pricing', 'Comparison Feature Table', 'Live Product Ratings Ticker', 'Instant 14-Day Free Trial CTA'],
    tags: ['SaaS', 'Startup', 'Software', 'landing']
  },
  {
    id: 'tmpl-land-02',
    templateCode: 'LAND-002',
    name: 'Mobile App Lead Funnel',
    serviceCategory: 'Landing Page',
    industryTag: 'App Download',
    description: 'Designed to drive App Store and Google Play downloads with interactive phone preview and QR scan triggers.',
    previewType: 'website',
    imagePlaceholderGradient: 'from-orange-500 via-rose-500 to-purple-900',
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80',
    features: ['App Store & Play Store Badges', 'Interactive Phone Slider', 'Key App Features Strip', 'SMS App Download Link', 'Security & Privacy Guarantee'],
    tags: ['Mobile App', 'Download', 'Funnel', 'landing']
  },
  {
    id: 'tmpl-land-03',
    templateCode: 'LAND-003',
    name: 'Global Summit & Event Landing',
    serviceCategory: 'Landing Page',
    industryTag: 'Conferences & Events',
    description: 'High-energy landing page for tech summits, physical conferences, webinars, and masterclass ticket sales.',
    previewType: 'website',
    imagePlaceholderGradient: 'from-rose-600 via-orange-600 to-stone-900',
    thumbnail: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80',
    features: ['Live Event Countdown Clock', 'Keynote Speaker Roster', 'Multi-Track Schedule Agenda', 'Tiered Ticket Purchase Form', 'Sponsor Logo Cloud'],
    tags: ['Events', 'Conference', 'Webinar', 'landing']
  },
  {
    id: 'tmpl-land-04',
    templateCode: 'LAND-004',
    name: 'High-Conversion B2B Service Funnel',
    serviceCategory: 'Landing Page',
    industryTag: 'Lead Generation',
    description: 'Proven multi-step lead capture funnel designed for high-ticket marketing agencies, legal, and B2B services.',
    previewType: 'website',
    imagePlaceholderGradient: 'from-blue-700 via-cyan-800 to-slate-900',
    thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80',
    features: ['3-Step Instant Lead Qualifier', 'Client ROI Case Studies', 'Video Testimonial Proof', 'Risk-Free Guarantee Badge', 'Instant WhatsApp Callback Button'],
    tags: ['Lead Gen', 'B2B', 'Agency', 'landing']
  },

  // Educational Website Templates
  {
    id: 'tmpl-edu-01',
    templateCode: 'EDU-001',
    name: 'Apex Online Academy & LMS',
    serviceCategory: 'Educational Website',
    industryTag: 'E-Learning',
    description: 'Comprehensive portal for online courses, curriculum modules, instructor bios, and video student enrollment.',
    previewType: 'student',
    imagePlaceholderGradient: 'from-blue-600 via-indigo-700 to-slate-900',
    thumbnail: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&auto=format&fit=crop&q=80',
    features: ['Course Catalog with Filters', 'Interactive Syllabus Viewer', 'Online Enrollment Checkout', 'Student Reviews & Badges', 'Certificate Preview'],
    tags: ['Education', 'Courses', 'Online LMS', 'educational']
  },
  {
    id: 'tmpl-edu-02',
    templateCode: 'EDU-002',
    name: 'University & College Campus Portal',
    serviceCategory: 'Educational Website',
    industryTag: 'Higher Education',
    description: 'Authoritative institution website for universities, colleges, and research institutes with admissions info.',
    previewType: 'website',
    imagePlaceholderGradient: 'from-emerald-700 via-teal-800 to-slate-900',
    thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
    features: ['Departments & Faculty Directory', 'Admissions Deadlines Tracker', 'Virtual Campus Tour Gallery', 'Research Publications Archive', 'Alumni Network Gateway'],
    tags: ['University', 'Campus', 'College', 'educational']
  },
  {
    id: 'tmpl-edu-03',
    templateCode: 'EDU-003',
    name: 'Tech Coding Bootcamp',
    serviceCategory: 'Educational Website',
    industryTag: 'Coding Academy',
    description: 'Modern developer training website with project showcases, hiring partners, and curriculum download.',
    previewType: 'website',
    imagePlaceholderGradient: 'from-orange-600 via-amber-600 to-stone-900',
    thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
    features: ['Live Coding Sandbox Preview', 'Hiring Partner Logo Cloud', 'Graduate Placement Statistics', 'Upcoming Cohort Dates', 'Tuition & EMI Calculator'],
    tags: ['Bootcamp', 'Coding', 'Technology', 'educational']
  },
  {
    id: 'tmpl-edu-04',
    templateCode: 'EDU-004',
    name: 'BrightSteps International School',
    serviceCategory: 'Educational Website',
    industryTag: 'K-12 School',
    description: 'Warm, welcoming design for preschools, daycares, and international schools with inquiry forms.',
    previewType: 'website',
    imagePlaceholderGradient: 'from-yellow-500 via-orange-500 to-rose-600',
    thumbnail: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=80',
    features: ['Academic Calendar & Events', 'Fee Structure Breakdown', 'School Facility Virtual Photos', 'Safety & Hygiene Policy', 'Parent Portal Sign-In'],
    tags: ['School', 'Preschool', 'Kids', 'educational']
  },

  // Blog & Content Website Templates
  {
    id: 'tmpl-blog-01',
    templateCode: 'BLOG-001',
    name: 'Tech Pulse Magazine',
    serviceCategory: 'Blog & Content Website',
    industryTag: 'Tech Editorial',
    description: 'High-speed editorial publication for tech news, gadget reviews, programming tutorials, and newsletters.',
    previewType: 'website',
    imagePlaceholderGradient: 'from-slate-900 via-indigo-950 to-slate-950',
    thumbnail: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&auto=format&fit=crop&q=80',
    features: ['Featured Trending Stories', 'Category Filtering Tabs', 'Estimated Read Time Ticker', 'Newsletter Subscription Bar', 'Author Profile Bio Badges'],
    tags: ['Tech', 'Magazine', 'News', 'blog']
  },
  {
    id: 'tmpl-blog-02',
    templateCode: 'BLOG-002',
    name: 'Aura Lifestyle & Wellness Journal',
    serviceCategory: 'Blog & Content Website',
    industryTag: 'Lifestyle & Wellness',
    description: 'Clean typographic layout for lifestyle writers, travel diaries, wellness coaches, and culinary enthusiasts.',
    previewType: 'website',
    imagePlaceholderGradient: 'from-stone-600 via-amber-800 to-stone-900',
    thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80',
    features: ['Editorial Grid Layout', 'Instagram Feed Embed', 'Related Articles Recommendation', 'Bookmark & Share Controls', 'Sponsored Story Tags'],
    tags: ['Lifestyle', 'Wellness', 'Travel', 'blog']
  },
  {
    id: 'tmpl-blog-03',
    templateCode: 'BLOG-003',
    name: 'FinVest Market Insights',
    serviceCategory: 'Blog & Content Website',
    industryTag: 'Finance & Markets',
    description: 'Authoritative financial blog with market data widgets, stock charts, expert columns, and subscriber-only tiers.',
    previewType: 'website',
    imagePlaceholderGradient: 'from-blue-900 via-slate-900 to-slate-950',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80',
    features: ['Live Market Indices Ticker', 'Subscriber Premium Articles', 'Chart Embed Support', 'Financial Glossary Lookup', 'Weekly Digest Opt-in'],
    tags: ['Finance', 'Markets', 'Investing', 'blog']
  },
  {
    id: 'tmpl-blog-04',
    templateCode: 'BLOG-004',
    name: 'The Culinary Trail Food Guide',
    serviceCategory: 'Blog & Content Website',
    industryTag: 'Food & Culinary',
    description: 'Visual recipe and dining publication with ingredient calculators, printable recipe cards, and restaurant ratings.',
    previewType: 'website',
    imagePlaceholderGradient: 'from-amber-600 via-orange-600 to-stone-900',
    thumbnail: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80',
    features: ['Printable Recipe Cards', 'Serving Size Ingredient Scaler', 'Dietary Filter Tags (Vegan/GF)', 'Interactive Cooking Timer', 'Community Reviews & Photos'],
    tags: ['Food', 'Recipes', 'Culinary', 'blog']
  },

  // Web Application & Admin Panel Templates (Service page 5, 6, 7)
  {
    id: 'tmpl-app-01',
    templateCode: 'AP-001',
    name: 'Business Admin Panel',
    serviceCategory: 'Admin Panel',
    industryTag: 'Modern',
    description: 'A modern and clean admin panel template for business management, operations, and user records.',
    previewType: 'admin-panel',
    imagePlaceholderGradient: 'from-slate-900 via-blue-950 to-indigo-950',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    features: ['User Management', 'Real-time KPI Stats', 'Sales Overview Chart', 'Recent Orders Table', 'Settings & Permissions'],
    tags: ['Modern', 'Minimal', 'Professional']
  },
  {
    id: 'tmpl-app-02',
    templateCode: 'AP-002',
    name: 'E-commerce Admin Panel',
    serviceCategory: 'Admin Panel',
    industryTag: 'Professional',
    description: 'Manage products, stock inventory, customers, order statuses, and discount codes in real time.',
    previewType: 'admin-panel',
    imagePlaceholderGradient: 'from-emerald-900 via-teal-900 to-slate-900',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    features: ['Inventory Alerts', 'Order Tracking Pipeline', 'Customer Lifetime Value', 'Coupon Generator', 'Export Reports'],
    tags: ['Professional', 'E-commerce', 'Industry Specific']
  },
  {
    id: 'tmpl-app-03',
    templateCode: 'AP-003',
    name: 'Analytics Admin Panel',
    serviceCategory: 'Dashboard Development',
    industryTag: 'Dark Mode',
    description: 'Real-time analytics with charts, customer retention metrics, geographic maps, and conversion funnel.',
    previewType: 'admin-panel',
    imagePlaceholderGradient: 'from-violet-950 via-purple-900 to-slate-950',
    thumbnail: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&auto=format&fit=crop&q=80',
    features: ['Cohort Analysis', 'Real-Time Visitors', 'Event Stream Logs', 'Custom Date Range', 'Dark Theme Aesthetics'],
    tags: ['Dark Mode', 'Analytics', 'Modern']
  },
  {
    id: 'tmpl-app-04',
    templateCode: 'AP-004',
    name: 'Booking Management System',
    serviceCategory: 'Booking System',
    industryTag: 'Service Provider',
    description: 'Interactive booking calendar, staff allocation, slot management, and automated SMS / email confirmations.',
    previewType: 'booking',
    imagePlaceholderGradient: 'from-blue-800 via-cyan-800 to-slate-900',
    thumbnail: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&auto=format&fit=crop&q=80',
    features: ['Interactive Monthly Calendar', 'Slot Availability Picker', 'Customer Roster', 'Staff Assignment', 'Status Reminders'],
    tags: ['Booking', 'Calendar', 'Appointments']
  },
  {
    id: 'tmpl-app-05',
    templateCode: 'AP-005',
    name: 'Student Management Portal',
    serviceCategory: 'Student Management System',
    industryTag: 'Education',
    description: 'Comprehensive portal to manage students, academic courses, daily attendance, grade reports, and fees.',
    previewType: 'student',
    imagePlaceholderGradient: 'from-amber-800 via-orange-800 to-stone-900',
    thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
    features: ['Student Directory', 'Fee Collection Status', 'Attendance Tracker', 'Course Syllabus', 'Teacher Schedules'],
    tags: ['Education', 'Academy', 'School']
  },

  // Mobile App Templates - Android (Service page 8)
  {
    id: 'tmpl-mob-01',
    templateCode: 'AND-001',
    name: 'Business App',
    serviceCategory: 'Mobile App',
    industryTag: 'Business',
    description: 'Corporate & service app with project progress tracking, client billing, and team dashboards.',
    previewType: 'mobile-app',
    imagePlaceholderGradient: 'from-blue-600 to-slate-900',
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80',
    features: ['Dashboard Overview', 'Service Details', 'User Profile & Settings', 'Payment & Billing', 'Push Notifications'],
    platform: 'android',
    tags: ['Business', 'Android', 'Corporate']
  },
  {
    id: 'tmpl-mob-02',
    templateCode: 'AND-002',
    name: 'E-commerce App',
    serviceCategory: 'Mobile App',
    industryTag: 'E-commerce',
    description: 'Shopping & retail app with fast product grid, wishlists, instant UPI checkout and order history.',
    previewType: 'mobile-app',
    imagePlaceholderGradient: 'from-rose-600 to-purple-900',
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?w=600&auto=format&fit=crop&q=80',
    features: ['Category Carousel', 'Instant Cart Slide', 'Order Tracking Timeline', 'Coupon Code Input', 'Biometric Auth'],
    platform: 'android',
    tags: ['E-commerce', 'Shopping', 'Retail', 'Android']
  },
  {
    id: 'tmpl-mob-03',
    templateCode: 'AND-003',
    name: 'Food Delivery App',
    serviceCategory: 'Mobile App',
    industryTag: 'Food & Delivery',
    description: 'Restaurant & food app with live menu categories, rider GPS tracking, coupons, and wallet integration.',
    previewType: 'mobile-app',
    imagePlaceholderGradient: 'from-orange-600 to-amber-700',
    thumbnail: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80',
    features: ['Restaurant List', 'Food Details Modal', 'Cart & Instant Checkout', 'Live Order Tracking', 'Profile & Address Book'],
    platform: 'android',
    tags: ['Food & Delivery', 'Restaurant', 'On-Demand', 'Android']
  },
  {
    id: 'tmpl-mob-04',
    templateCode: 'AND-004',
    name: 'Education App',
    serviceCategory: 'Mobile App',
    industryTag: 'Education',
    description: 'Learning & online courses app with interactive video lectures, chapter quizzes, and progress certificates.',
    previewType: 'mobile-app',
    imagePlaceholderGradient: 'from-blue-600 to-indigo-800',
    thumbnail: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&auto=format&fit=crop&q=80',
    features: ['Video Class Player', 'Course Modules', 'Download Offline', 'Progress Tracker', 'Student Discussion Forum'],
    platform: 'android',
    tags: ['Education', 'Courses', 'Android']
  },
  {
    id: 'tmpl-mob-05',
    templateCode: 'AND-005',
    name: 'Healthcare App',
    serviceCategory: 'Mobile App',
    industryTag: 'Healthcare',
    description: 'Doctor consultation app with online clinic appointments, digital prescription vault, and symptom checker.',
    previewType: 'mobile-app',
    imagePlaceholderGradient: 'from-teal-600 to-cyan-900',
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
    features: ['Doctor Video Consultation', 'Appointment Booking', 'Prescription History', 'Lab Test Reports', 'Emergency SOS'],
    platform: 'android',
    tags: ['Healthcare', 'Medical', 'Android']
  },
  {
    id: 'tmpl-mob-06',
    templateCode: 'AND-006',
    name: 'Booking App',
    serviceCategory: 'Mobile App',
    industryTag: 'Booking',
    description: 'Appointments & service booking app for salons, spas, technicians, and local consultants.',
    previewType: 'mobile-app',
    imagePlaceholderGradient: 'from-amber-600 to-orange-800',
    thumbnail: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&auto=format&fit=crop&q=80',
    features: ['Slot Picker Calendar', 'Service Pricing Menu', 'Staff Selection', 'Automated SMS Alerts', 'Online Advance Deposit'],
    platform: 'android',
    tags: ['Booking', 'Service', 'Android']
  },

  // Mobile App Templates - iOS (Service page 8)
  {
    id: 'tmpl-ios-01',
    templateCode: 'IOS-001',
    name: 'Business App',
    serviceCategory: 'Mobile App',
    industryTag: 'Business',
    description: 'Professional & service app crafted with iOS Cupertino guidelines, biometric FaceID and widgets.',
    previewType: 'mobile-app',
    imagePlaceholderGradient: 'from-slate-800 to-indigo-950',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    features: ['Dynamic Island Status', 'Cupertino Navigation', 'FaceID Biometrics', 'Apple Wallet Integration', 'Widgets Support'],
    platform: 'ios',
    tags: ['Business', 'iOS', 'Professional']
  },
  {
    id: 'tmpl-ios-02',
    templateCode: 'IOS-002',
    name: 'E-commerce App',
    serviceCategory: 'Mobile App',
    industryTag: 'E-commerce',
    description: 'Shopping & retail iOS app with haptic touch feedback, Apple Pay 1-tap checkout and AR previews.',
    previewType: 'mobile-app',
    imagePlaceholderGradient: 'from-pink-600 to-purple-900',
    thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80',
    features: ['Apple Pay Support', 'Haptic Touch Sliders', 'AR Product Previews', 'Wishlist Synced to iCloud', 'Siri Shortcuts'],
    platform: 'ios',
    tags: ['E-commerce', 'Shopping', 'Retail', 'iOS']
  },
  {
    id: 'tmpl-ios-03',
    templateCode: 'IOS-003',
    name: 'Food Delivery App',
    serviceCategory: 'Mobile App',
    industryTag: 'Food & Delivery',
    description: 'Restaurant & food app with live order tracking, Apple Maps routing, Apple Pay and customizable dishes.',
    previewType: 'mobile-app',
    imagePlaceholderGradient: 'from-orange-500 to-amber-600',
    thumbnail: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80',
    features: ['Restaurant List', 'Food Details Modal', 'Cart & Checkout', 'Live Order Tracking', 'Profile & Settings'],
    platform: 'ios',
    tags: ['Food & Delivery', 'Restaurant', 'iOS']
  },
  {
    id: 'tmpl-ios-04',
    templateCode: 'IOS-004',
    name: 'Fitness App',
    serviceCategory: 'Mobile App',
    industryTag: 'Lifestyle',
    description: 'Health & lifestyle app with Apple HealthKit sync, workout rings, calorie tracker and audio coaches.',
    previewType: 'mobile-app',
    imagePlaceholderGradient: 'from-emerald-600 to-teal-900',
    thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    features: ['Apple Watch Sync', 'Activity Rings', 'Workout Video Guides', 'Heart Rate Tracker', 'Audio Coaching'],
    platform: 'ios',
    tags: ['Fitness', 'Lifestyle', 'Healthcare', 'iOS']
  },
  {
    id: 'tmpl-ios-05',
    templateCode: 'IOS-005',
    name: 'Education App',
    serviceCategory: 'Mobile App',
    industryTag: 'Education',
    description: 'Learning & courses iOS app with iPad Split-View, Apple Pencil note-taking, and lecture downloads.',
    previewType: 'mobile-app',
    imagePlaceholderGradient: 'from-sky-600 to-blue-900',
    thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
    features: ['iPad Pencil Support', 'Offline Downloads', 'Audio Summaries', 'Quiz Flashcards', 'iCloud Sync'],
    platform: 'ios',
    tags: ['Education', 'Courses', 'iOS']
  },
  {
    id: 'tmpl-ios-06',
    templateCode: 'IOS-006',
    name: 'Travel App',
    serviceCategory: 'Mobile App',
    industryTag: 'Travel',
    description: 'Explore & book trips with offline boarding pass wallet, currency converter, and curated travel guides.',
    previewType: 'mobile-app',
    imagePlaceholderGradient: 'from-cyan-600 to-blue-900',
    thumbnail: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&auto=format&fit=crop&q=80',
    features: ['Apple Wallet Boarding Pass', 'Offline City Maps', 'Currency Converter', 'Hotel Reviews', 'Itinerary Planner'],
    platform: 'ios',
    tags: ['Travel', 'Booking', 'Lifestyle', 'iOS']
  },

  // E-commerce Store Templates (Service page 9)
  {
    id: 'tmpl-ecom-01',
    templateCode: 'ECOM-001',
    name: 'Fashion Store',
    serviceCategory: 'E-commerce Website',
    industryTag: 'Fashion',
    description: 'Modern and stylish e-commerce design for clothing, apparel, footwear, and luxury fashion brands.',
    previewType: 'ecommerce',
    imagePlaceholderGradient: 'from-rose-500 via-pink-600 to-orange-500',
    thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80',
    features: ['Category Grid (Men/Women)', 'Interactive Cart Slide', 'Quick View Modal', 'Product Reviews & Ratings', 'Filter by Size & Price'],
    tags: ['Fashion', 'Apparel', 'Retail']
  },
  {
    id: 'tmpl-ecom-02',
    templateCode: 'ECOM-002',
    name: 'Electronics Store',
    serviceCategory: 'E-commerce Website',
    industryTag: 'Electronics',
    description: 'High-tech gadget marketplace with spec sheets, compare drawer, customer ratings, and warranty badges.',
    previewType: 'ecommerce',
    imagePlaceholderGradient: 'from-slate-800 via-blue-900 to-cyan-900',
    thumbnail: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80',
    features: ['Technical Specifications Table', 'Product Comparison Tool', 'Stock Status Counter', 'EMI Calculator', 'Accessories Bundles'],
    tags: ['Electronics', 'Gadgets', 'Tech']
  },
  {
    id: 'tmpl-ecom-03',
    templateCode: 'ECOM-003',
    name: 'Grocery & Organic Store',
    serviceCategory: 'E-commerce Website',
    industryTag: 'Grocery',
    description: 'Fresh groceries and daily essentials store with weight variants, delivery slot selection, and recurring subscriptions.',
    previewType: 'ecommerce',
    imagePlaceholderGradient: 'from-emerald-700 via-green-800 to-lime-900',
    thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
    features: ['Same-day Delivery Selector', 'Weight / Pack Size Picker', 'Subscription Orders', 'Recipe Shopping List', 'Seasonal Deals Bar'],
    tags: ['Grocery', 'Organic', 'Food']
  },
  {
    id: 'tmpl-ecom-04',
    templateCode: 'ECOM-004',
    name: 'Modern Furniture Store',
    serviceCategory: 'E-commerce Website',
    industryTag: 'Furniture',
    description: 'Clean and premium design for furniture, Scandinavian interior decor, and living space architecture.',
    previewType: 'ecommerce',
    imagePlaceholderGradient: 'from-stone-700 via-amber-800 to-orange-950',
    thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80',
    features: ['Room AR View Preview', 'Material Swatch Selector', 'Assembly Guide Downloads', 'Dimension Schematics', 'Custom Delivery Booking'],
    tags: ['Furniture', 'Home Decor', 'Interior']
  },

  // Custom Website Templates (Service page 10)
  {
    id: 'tmpl-cust-01',
    templateCode: 'CUST-001',
    name: 'Modern Corporate (Nexora)',
    serviceCategory: 'Custom Website',
    industryTag: 'Corporate',
    description: 'Clean & professional business website with bespoke animations, team profiles, and custom service blocks.',
    previewType: 'corporate',
    imagePlaceholderGradient: 'from-blue-900 via-slate-900 to-slate-950',
    thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80',
    features: ['Custom Visual Grid', 'Interactive Quote Calculator', 'Multi-Language Ready', 'Client Testimonial Carousel', 'Security Compliance Section'],
    tags: ['Corporate', 'Custom Architecture', 'Enterprise']
  },
  {
    id: 'tmpl-cust-02',
    templateCode: 'CUST-002',
    name: 'Tech & Service Focused (IT Solutions)',
    serviceCategory: 'Custom Website',
    industryTag: 'Technology',
    description: 'Tailored for software vendors, managed IT service providers, and digital infrastructure firms.',
    previewType: 'corporate',
    imagePlaceholderGradient: 'from-indigo-950 via-blue-950 to-cyan-950',
    thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
    features: ['Architecture Diagrams', 'SLA Uptime Ticker', 'API Docs Integration', 'Case Study Deep-Dives', 'Live Chat Trigger'],
    tags: ['Technology', 'IT Solutions', 'SaaS', 'custom']
  },
  {
    id: 'tmpl-cust-03',
    templateCode: 'CUST-003',
    name: 'HyperScale Startup Landing & Portal',
    serviceCategory: 'Custom Website',
    industryTag: 'Startup & Tech',
    description: 'High-octane custom web architecture for fast-growing ventures with investor dashboards and product demos.',
    previewType: 'corporate',
    imagePlaceholderGradient: 'from-purple-950 via-indigo-900 to-slate-950',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    features: ['Interactive Product Canvas', 'Waitlist & Early Access Ticker', 'Dynamic Dark Mode', 'Pitch Deck Viewer', 'Custom API Sandbox'],
    tags: ['Startup & Tech', 'Startup', 'SaaS', 'custom']
  },
  {
    id: 'tmpl-cust-04',
    templateCode: 'CUST-004',
    name: 'EstatePrime Luxury Real Estate',
    serviceCategory: 'Custom Website',
    industryTag: 'Real Estate',
    description: 'Bespoke architectural portal featuring 360-degree virtual walkthroughs, custom property maps, and broker desk.',
    previewType: 'website',
    imagePlaceholderGradient: 'from-amber-900 via-stone-800 to-stone-950',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    features: ['Interactive Map Search', 'Mortgage EMI Calculator', 'High-Res Floorplan Zoom', 'Schedule Private Tour', 'WhatsApp Agent Connect'],
    tags: ['Real Estate', 'Luxury', 'Property', 'custom']
  },
  {
    id: 'tmpl-cust-05',
    templateCode: 'CUST-005',
    name: 'Velvet & Vine Culinary Lounge',
    serviceCategory: 'Custom Website',
    industryTag: 'Restaurant & Food',
    description: 'Gourmet dining and hospitality experience with custom table seating layout, curated wine list, and event bookings.',
    previewType: 'website',
    imagePlaceholderGradient: 'from-rose-950 via-amber-950 to-stone-950',
    thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
    features: ['3D Floor Table Booking', 'Seasonal Degustation Menu', 'Private Dining Inquiry', 'Sommelier Wine Pairings', 'Chef Story & Gallery'],
    tags: ['Restaurant & Food', 'Hospitality', 'Food', 'custom']
  },
  {
    id: 'tmpl-cust-06',
    templateCode: 'CUST-006',
    name: 'Aegis MedCare Multi-Speciality Clinic',
    serviceCategory: 'Custom Website',
    industryTag: 'Healthcare & Clinic',
    description: 'HIPAA-conscious healthcare web presence with doctor schedule selector, patient health records, and emergency hotline.',
    previewType: 'website',
    imagePlaceholderGradient: 'from-cyan-900 via-teal-900 to-slate-950',
    thumbnail: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80',
    features: ['Specialist Doctor Roster', '1-Click Telehealth Call', 'Health Checkup Packages', 'Emergency Call Bar', 'Patient Testimonials'],
    tags: ['Healthcare & Clinic', 'Medical', 'Clinic', 'custom']
  },

  // CRM Web Applications
  {
    id: 'tmpl-crm-01',
    templateCode: 'CRM-001',
    name: 'OmniFlow Sales CRM & Pipeline',
    serviceCategory: 'CRM Systems',
    industryTag: 'Sales & Leads',
    description: 'High-speed sales CRM with drag-and-drop deal stages, automated email tracking, and sales agent leaderboards.',
    previewType: 'admin-panel',
    imagePlaceholderGradient: 'from-blue-900 via-indigo-900 to-slate-900',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop&q=80',
    features: ['Kanban Deal Stages', 'Lead Activity Timeline', 'Automated Follow-up Reminders', 'Revenue Forecasting', 'WhatsApp Integration'],
    tags: ['CRM', 'Sales', 'Leads', 'Pipeline', 'crm']
  },
  {
    id: 'tmpl-crm-02',
    templateCode: 'CRM-002',
    name: 'ClientSphere Agency Relationship Desk',
    serviceCategory: 'CRM Systems',
    industryTag: 'Agency & Services',
    description: 'Client retention CRM tailored for creative agencies, consultancies, and B2B services with project status boards.',
    previewType: 'admin-panel',
    imagePlaceholderGradient: 'from-purple-900 via-indigo-950 to-slate-950',
    thumbnail: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&auto=format&fit=crop&q=80',
    features: ['Client Portal Gateway', 'Shared Contract Vault', 'Milestone Invoicing Sync', 'Team Allocation View', 'Support Ticket Roster'],
    tags: ['CRM', 'Agency', 'Client Desk', 'crm']
  },
  {
    id: 'tmpl-crm-03',
    templateCode: 'CRM-003',
    name: 'RealtyTrack Broker & Tenant CRM',
    serviceCategory: 'CRM Systems',
    industryTag: 'Real Estate CRM',
    description: 'Specialized real estate CRM for managing buyer enquiries, scheduled site visits, broker commissions, and property inventory.',
    previewType: 'admin-panel',
    imagePlaceholderGradient: 'from-amber-900 via-stone-900 to-slate-950',
    thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop&q=80',
    features: ['Property Matching Engine', 'Site Visit Calendar', 'Broker Commission Split', 'Automated Brochure Sending', 'SMS Follow-up'],
    tags: ['CRM', 'Real Estate', 'Brokerage', 'crm']
  },

  // Billing & Invoicing Systems
  {
    id: 'tmpl-bill-01',
    templateCode: 'BILL-001',
    name: 'InvoiceGenie Enterprise Billing',
    serviceCategory: 'Billing Systems',
    industryTag: 'GST & Invoicing',
    description: 'Automated invoice generation engine with GST tax calculation, payment links, and multi-currency exchange support.',
    previewType: 'admin-panel',
    imagePlaceholderGradient: 'from-emerald-900 via-teal-900 to-slate-900',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
    features: ['One-Click PDF Invoicing', 'GST / VAT Tax Breakdown', 'Razorpay & Stripe Webhooks', 'Automated Overdue Reminders', 'Accountant Excel Export'],
    tags: ['Billing', 'Invoicing', 'Finance', 'Tax', 'billing']
  },
  {
    id: 'tmpl-bill-02',
    templateCode: 'BILL-002',
    name: 'Subscrify Recurring & Usage Billing',
    serviceCategory: 'Billing Systems',
    industryTag: 'SaaS Subscription',
    description: 'Subscription billing system handling automated monthly renewals, usage-based metering, dunning management, and customer cards.',
    previewType: 'admin-panel',
    imagePlaceholderGradient: 'from-sky-900 via-blue-950 to-slate-950',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    features: ['Tiered Plan Billing Engine', 'Prorated Upgrades & Downgrades', 'Failed Payment Retry', 'Customer Self-Serve Portal', 'MRR & Churn Telemetry'],
    tags: ['Billing', 'SaaS', 'Subscriptions', 'billing']
  },
  {
    id: 'tmpl-bill-03',
    templateCode: 'BILL-003',
    name: 'RetailPOS Quick Billing & Inventory',
    serviceCategory: 'Billing Systems',
    industryTag: 'Retail & POS',
    description: 'Point-of-sale fast billing dashboard with barcode scanning, thermal receipt print, cash/UPI splits, and inventory ledger.',
    previewType: 'admin-panel',
    imagePlaceholderGradient: 'from-orange-900 via-amber-900 to-stone-900',
    thumbnail: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600&auto=format&fit=crop&q=80',
    features: ['Barcode Scanner Support', 'Thermal Printer Ready', 'Daily Cash Register Reconcile', 'Stock Depletion Warning', 'Customer Loyalty Points'],
    tags: ['Billing', 'POS', 'Retail', 'Inventory', 'billing']
  },

  // Booking & Appointment Systems
  {
    id: 'tmpl-bk-01',
    templateCode: 'BK-001',
    name: 'MedSchedule Healthcare Appointments',
    serviceCategory: 'Booking Systems',
    industryTag: 'Clinic & Hospital',
    description: 'Patient appointment system with doctor shift rosters, token management, digital OPD queues, and SMS reminders.',
    previewType: 'booking',
    imagePlaceholderGradient: 'from-teal-900 via-cyan-900 to-slate-950',
    thumbnail: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&auto=format&fit=crop&q=80',
    features: ['Doctor Roster & Shifts', 'Live Token Queue Display', 'Online Advance Booking', 'WhatsApp Appointment Alert', 'Telehealth Zoom Link'],
    tags: ['Booking', 'Appointments', 'Healthcare', 'booking']
  },
  {
    id: 'tmpl-bk-02',
    templateCode: 'BK-002',
    name: 'GlamourDesk Salon & Spa Booking',
    serviceCategory: 'Booking Systems',
    industryTag: 'Salon & Wellness',
    description: 'Visual service chair and stylist booking engine with package deals, customer history, and deposit collection.',
    previewType: 'booking',
    imagePlaceholderGradient: 'from-rose-900 via-pink-900 to-slate-950',
    thumbnail: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
    features: ['Stylist & Chair Selection', 'Multi-Service Cart Booking', 'Automated Calendar Sync', 'Tip & Deposit Processing', 'VIP Membership Cards'],
    tags: ['Booking', 'Salon', 'Spa', 'Wellness', 'booking']
  },
  {
    id: 'tmpl-bk-03',
    templateCode: 'BK-003',
    name: 'ArenaReserve Sports & Turf Booking',
    serviceCategory: 'Booking Systems',
    industryTag: 'Sports & Venues',
    description: 'Hourly slot booking for cricket turfs, football arenas, badminton courts, and community banquet halls.',
    previewType: 'booking',
    imagePlaceholderGradient: 'from-emerald-900 via-green-950 to-slate-950',
    thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80',
    features: ['Hourly Time-Slot Matrix', 'Day/Night Pricing Toggle', 'Split Bill Between Players', 'Equipment Rental Addon', 'QR Gate Pass Entry'],
    tags: ['Booking', 'Sports', 'Venues', 'Turf', 'booking']
  },

  // Dashboard Development
  {
    id: 'tmpl-dash-01',
    templateCode: 'DASH-001',
    name: 'Executive KPI Business Intelligence',
    serviceCategory: 'Dashboard Development',
    industryTag: 'Business Analytics',
    description: 'High-level executive cockpit with live revenue tickers, gross margin tracking, customer LTV, and quarterly targets.',
    previewType: 'admin-panel',
    imagePlaceholderGradient: 'from-slate-900 via-blue-950 to-indigo-950',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    features: ['Real-Time Revenue Gauges', 'Regional Sales Heatmap', 'Target vs Actual Variance', 'Automated PDF Email Digest', 'Role-Based Executive Access'],
    tags: ['Dashboard', 'Analytics', 'KPI', 'Executive', 'dashboard']
  },
  {
    id: 'tmpl-dash-02',
    templateCode: 'DASH-002',
    name: 'Logistics & Fleet FleetTrack Telemetry',
    serviceCategory: 'Dashboard Development',
    industryTag: 'Supply Chain & Fleet',
    description: 'Live GPS vehicle telemetry dashboard with fuel consumption, delivery ETA, driver behavior scores, and route maps.',
    previewType: 'admin-panel',
    imagePlaceholderGradient: 'from-cyan-900 via-blue-900 to-slate-950',
    thumbnail: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
    features: ['Live GPS Vehicle Map', 'Fuel Consumption Analytics', 'Route Delay Alerts', 'Driver Safety Scorecard', 'Maintenance Schedule Vault'],
    tags: ['Dashboard', 'Logistics', 'Fleet', 'Telemetry', 'dashboard']
  },
  {
    id: 'tmpl-dash-03',
    templateCode: 'DASH-003',
    name: 'FinTech Trading & Portfolio Dashboard',
    serviceCategory: 'Dashboard Development',
    industryTag: 'FinTech & Trading',
    description: 'Dark-mode financial telemetry with Candlestick charts, order books, portfolio asset allocation, and P&L trackers.',
    previewType: 'admin-panel',
    imagePlaceholderGradient: 'from-indigo-950 via-purple-950 to-slate-950',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80',
    features: ['Live Candlestick Charting', 'Real-time WebSocket Feeds', 'Portfolio Asset Allocation', 'Tax Loss Harvesting Ticker', 'Risk Factor Metric'],
    tags: ['Dashboard', 'FinTech', 'Trading', 'Dark Mode', 'dashboard']
  },

  // Student Management Systems
  {
    id: 'tmpl-st-01',
    templateCode: 'ST-001',
    name: 'CampusCore University ERP & LMS',
    serviceCategory: 'Student Management Systems',
    industryTag: 'University & Colleges',
    description: 'Enterprise campus management with semester exams, online grading, hall ticket generation, and fee portals.',
    previewType: 'student',
    imagePlaceholderGradient: 'from-amber-900 via-orange-950 to-stone-950',
    thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
    features: ['Semester Grade Cards', 'Biometric Attendance Sync', 'Online Fee Payment Gateway', 'Faculty Assignment Review', 'Hostel & Library Modules'],
    tags: ['Student Management', 'University', 'LMS', 'Education', 'student-mgmt', 'student']
  },
  {
    id: 'tmpl-st-02',
    templateCode: 'ST-002',
    name: 'EdTech Academy & Batch Manager',
    serviceCategory: 'Student Management Systems',
    industryTag: 'Coaching & Institutes',
    description: 'Tailored for competitive exam coaching institutes with batch schedules, test score rankings, and parent progress SMS.',
    previewType: 'student',
    imagePlaceholderGradient: 'from-blue-900 via-indigo-950 to-slate-950',
    thumbnail: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80',
    features: ['Batch Schedule Matrix', 'All-India Rank Percentile', 'Parent WhatsApp Progress Card', 'Offline Attendance QR', 'Recorded Video Library'],
    tags: ['Student Management', 'Coaching', 'EdTech', 'student-mgmt', 'student']
  },
  {
    id: 'tmpl-st-03',
    templateCode: 'ST-003',
    name: 'ScholarTrack K-12 School Management',
    serviceCategory: 'Student Management Systems',
    industryTag: 'School ERP',
    description: 'Comprehensive K-12 school administration platform with bus GPS tracking, cafeteria balances, report cards, and homework app.',
    previewType: 'student',
    imagePlaceholderGradient: 'from-emerald-900 via-teal-950 to-slate-950',
    thumbnail: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=80',
    features: ['School Bus Live GPS', 'Digital Report Card Maker', 'Teacher Diary & Homework', 'Leave Application Workflow', 'Automated Fee Receipts'],
    tags: ['Student Management', 'School', 'K-12', 'student-mgmt', 'student']
  },

  // E-commerce Multi-Vendor & Specialized Stores
  {
    id: 'tmpl-ecom-05',
    templateCode: 'ECOM-005',
    name: 'BazaarHub Multi-Vendor Marketplace',
    serviceCategory: 'E-commerce Website',
    industryTag: 'Multi-Vendor',
    description: 'Mega marketplace engine allowing independent merchants to list stores, manage separate shipping, and receive automated payout splits.',
    previewType: 'ecommerce',
    imagePlaceholderGradient: 'from-orange-600 via-rose-600 to-purple-900',
    thumbnail: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop&q=80',
    features: ['Vendor Registration Desk', 'Automated Commission Split', 'Individual Storefronts', 'Global Search & Filter', 'Multi-Seller Cart Checkout'],
    tags: ['Multi-Vendor', 'Marketplace', 'E-commerce', 'multi-vendor', 'ecommerce']
  },
  {
    id: 'tmpl-ecom-06',
    templateCode: 'ECOM-006',
    name: 'Artisan & D2C Brand Flagship',
    serviceCategory: 'E-commerce Website',
    industryTag: 'Single Vendor',
    description: 'High-conversion direct-to-consumer store with rich brand storytelling, bundle discounts, Instagram shop feeds, and express UPI.',
    previewType: 'ecommerce',
    imagePlaceholderGradient: 'from-amber-700 via-rose-700 to-stone-900',
    thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80',
    features: ['1-Click Fast Checkout', 'Dynamic Bundle Builder', 'Video Product Reviews', 'Shop Instagram Feed', 'Free Shipping Progress Meter'],
    tags: ['Single Vendor', 'D2C', 'Retail', 'single-vendor', 'ecommerce']
  },
  {
    id: 'tmpl-ecom-07',
    templateCode: 'ECOM-007',
    name: 'Aura Luxury Jewelry & Cosmetics',
    serviceCategory: 'E-commerce Website',
    industryTag: 'Niche Store',
    description: 'Sophisticated aesthetics for fine jewelry, organic skincare, and luxury perfume with virtual try-on and gift wrapping options.',
    previewType: 'ecommerce',
    imagePlaceholderGradient: 'from-rose-900 via-stone-900 to-slate-950',
    thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
    features: ['Virtual Try-On Feature', 'Engraving & Personalization', 'Gift Wrap & Card Selector', 'High-Res Zoom Loupe', 'VIP Member Rewards'],
    tags: ['Niche Store', 'Fashion', 'Luxury', 'Jewelry', 'niche-store', 'ecommerce']
  },
  {
    id: 'tmpl-ecom-08',
    templateCode: 'ECOM-008',
    name: 'Wholesale & B2B Custom Commerce',
    serviceCategory: 'E-commerce Website',
    industryTag: 'Custom E-commerce',
    description: 'Enterprise B2B trade portal with tiered volume pricing, bulk CSV order uploads, net-30 credit terms, and GST tax invoices.',
    previewType: 'ecommerce',
    imagePlaceholderGradient: 'from-slate-900 via-blue-900 to-teal-900',
    thumbnail: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
    features: ['Bulk CSV Order Upload', 'Tiered Volume Discount Ticker', 'Purchase Order (PO) Checkout', 'Net-30 Invoice Terms', 'Tax Exemption Verification'],
    tags: ['Custom E-commerce', 'B2B', 'Wholesale', 'custom-ecommerce', 'ecommerce']
  }
];

export const TECH_STACKS = [
  {
    category: 'Frontend',
    description: 'Fast, responsive, accessible interfaces',
    technologies: [
      { name: 'React', desc: 'Component architecture', color: '#61DAFB' },
      { name: 'TypeScript', desc: 'Type-safe enterprise code', color: '#3178C6' },
      { name: 'HTML5', desc: 'Semantic web foundation', color: '#E34F26' },
      { name: 'CSS3', desc: 'Modern flex & grid styling', color: '#1572B6' },
      { name: 'JavaScript', desc: 'Dynamic web interactions', color: '#F7DF1E' }
    ]
  },
  {
    category: 'Backend',
    description: 'Robust server logic & APIs',
    technologies: [
      { name: 'Node.js', desc: 'High concurrency runtime', color: '#339933' },
      { name: 'PHP', desc: 'Battle-tested web backend', color: '#777BB4' },
      { name: 'Python', desc: 'Automation & AI processing', color: '#3776AB' }
    ]
  },
  {
    category: 'Database',
    description: 'Scalable and secure data persistence',
    technologies: [
      { name: 'MySQL', desc: 'Relational data management', color: '#4479A1' },
      { name: 'PostgreSQL', desc: 'Advanced ACID database', color: '#4169E1' },
      { name: 'Supabase', desc: 'Realtime database & Auth', color: '#3ECF8E' }
    ]
  },
  {
    category: 'Platforms',
    description: 'Content & merchant ecosystems',
    technologies: [
      { name: 'WordPress', desc: 'CMS & custom theme build', color: '#21759B' },
      { name: 'Shopify', desc: 'Enterprise e-commerce stores', color: '#96BF48' }
    ]
  },
  {
    category: 'Deployment',
    description: 'Global CDN & cloud infrastructure',
    technologies: [
      { name: 'Vercel', desc: 'Edge serverless deployment', color: '#000000' },
      { name: 'Hostinger', desc: 'Reliable cPanel & VPS', color: '#673AB7' },
      { name: 'Cloud Platforms', desc: 'AWS, GCP & Cloud Run', color: '#0284C7' }
    ]
  }
];

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'case-01',
    title: 'Business Website',
    category: 'Website Development',
    description: 'Custom responsive corporate portal for an engineering conglomerate with interactive quote calculator and client portal.',
    results: '+185% organic lead conversion, 0.8s load speed on mobile.',
    tech: ['React', 'TypeScript', 'Tailwind', 'Node.js'],
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'case-02',
    title: 'Education Platform',
    category: 'Education / Web Application',
    description: 'Interactive learning management system with course scheduling, automated attendance, fee collection, and quizzes.',
    results: 'Used by 12,000+ active students with 99.98% system uptime.',
    tech: ['React', 'Node.js', 'PostgreSQL', 'Razorpay'],
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'case-03',
    title: 'PDF Tools Platform',
    category: 'SaaS / Utility Platform',
    description: 'Browser-based PDF manipulation suite with merge, compress, OCR, format conversion, and watermarking capabilities.',
    results: 'Processes 250,000+ files monthly with zero server storage retention.',
    tech: ['React', 'WebAssembly', 'Cloudflare Workers'],
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'case-04',
    title: 'E-commerce Store',
    category: 'E-commerce',
    description: 'Full-featured fashion apparel storefront with multi-currency checkout, dynamic inventory alerts, and real-time order tracking.',
    results: '3.4x rise in average cart value and 42% decrease in cart abandonment.',
    tech: ['React', 'Shopify Storefront API', 'Stripe', 'Redis'],
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'case-05',
    title: 'AI-Powered Application',
    category: 'AI / Automation',
    description: 'Enterprise workflow intelligence app connecting CRM leads to AI analysis, document summarization, and automated replies.',
    results: 'Saves 24 hours of manual administrative labor per team weekly.',
    tech: ['React', 'Python', 'FastAPI', 'Gemini API'],
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
  }
];

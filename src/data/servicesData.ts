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
    tags: ['Healthcare', 'Local Business', 'Service Provider']
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

  // Mobile App Templates (Service page 8)
  {
    id: 'tmpl-mob-01',
    templateCode: 'AND-001',
    name: 'Business App',
    serviceCategory: 'Mobile App',
    industryTag: 'Corporate',
    description: 'A professional business app with team dashboards, client management, projects tracker, and analytics.',
    previewType: 'mobile-app',
    imagePlaceholderGradient: 'from-blue-600 to-slate-900',
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80',
    features: ['Dashboard Overview', 'Service Details', 'User Profile & Settings', 'Payment & Billing', 'Push Notifications'],
    platform: 'android',
    tags: ['Business', 'Android', 'iOS']
  },
  {
    id: 'tmpl-mob-02',
    templateCode: 'AND-002',
    name: 'E-commerce App',
    serviceCategory: 'Mobile App',
    industryTag: 'Retail',
    description: 'Smooth mobile shopping experience with swipeable product cards, wishlist, one-tap UPI checkout.',
    previewType: 'mobile-app',
    imagePlaceholderGradient: 'from-rose-600 to-purple-900',
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?w=600&auto=format&fit=crop&q=80',
    features: ['Category Carousel', 'Instant Cart Slide', 'Order Tracking Timeline', 'Coupon Code Input', 'Biometric Auth'],
    platform: 'android',
    tags: ['E-commerce', 'Shopping', 'Retail']
  },
  {
    id: 'tmpl-mob-03',
    templateCode: 'AND-003',
    name: 'Food Delivery App',
    serviceCategory: 'Mobile App',
    industryTag: 'Food & Delivery',
    description: 'On-demand food ordering with interactive menu, live GPS rider tracking, coupons, and wallet integration.',
    previewType: 'mobile-app',
    imagePlaceholderGradient: 'from-orange-600 to-amber-700',
    thumbnail: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80',
    features: ['Restaurant List', 'Food Details Modal', 'Cart & Instant Checkout', 'Live Order Tracking', 'Profile & Address Book'],
    platform: 'android',
    tags: ['Food & Delivery', 'Restaurant', 'On-Demand']
  },
  {
    id: 'tmpl-mob-04',
    templateCode: 'IOS-001',
    name: 'Fitness & Health App',
    serviceCategory: 'Mobile App',
    industryTag: 'Healthcare',
    description: 'Sleek iOS fitness tracker with workout logs, daily calorie graphs, Apple Health sync, and trainer chat.',
    previewType: 'mobile-app',
    imagePlaceholderGradient: 'from-cyan-600 to-blue-900',
    thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    features: ['Activity Rings', 'Workout Video Guides', 'Heart Rate Tracker', 'Diet Meal Plans', 'Community Leaderboard'],
    platform: 'ios',
    tags: ['Fitness', 'Health', 'iOS']
  },
  {
    id: 'tmpl-mob-05',
    templateCode: 'IOS-002',
    name: 'Travel & Hotel Booking App',
    serviceCategory: 'Mobile App',
    industryTag: 'Travel',
    description: 'Intuitive travel companion app with flight booking, hotel reviews, interactive map pins, and digital boarding pass.',
    previewType: 'mobile-app',
    imagePlaceholderGradient: 'from-sky-600 to-indigo-900',
    thumbnail: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&auto=format&fit=crop&q=80',
    features: ['Flight & Hotel Search', 'Interactive Itinerary', 'Currency Converter', 'Offline Pass Wallet', 'Instant Review Rating'],
    platform: 'ios',
    tags: ['Travel', 'Booking', 'Lifestyle']
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
    tags: ['Technology', 'IT Solutions', 'SaaS']
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

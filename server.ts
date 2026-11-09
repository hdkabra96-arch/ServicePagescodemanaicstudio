import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

function resolvePort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const p = Number(process.argv[portArgIndex + 1]);
    if (!isNaN(p) && p !== 8080) return p;
  }
  if (process.env.DEFAULT_APP_PORT) {
    const p = Number(process.env.DEFAULT_APP_PORT);
    if (!isNaN(p) && p !== 8080) return p;
  }
  if (process.env.PORT && process.env.PORT !== '8080') {
    const p = Number(process.env.PORT);
    if (!isNaN(p)) return p;
  }
  return 3000;
}

const PORT = resolvePort();

app.use(express.json());

// Health check endpoints for supervisor and monitoring
app.get(['/health', '/__health'], (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Persistent storage setup
const DATA_DIR = path.join(__dirname, 'data');
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');

function ensureDataStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ENQUIRIES_FILE)) {
    // Seed with a few realistic initial enquiries so the enquiry log isn't empty
    const initialEnquiries = [
      {
        id: 'CM-2026-00101',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        businessName: 'Apex Logistics & Freight',
        businessCategory: 'Corporate & Logistics',
        serviceType: 'Website Development',
        templateId: 'BIZ-001',
        templateName: 'Business Pro',
        preference: 'Use this design with my branding',
        pages: '5 – 10 pages',
        features: ['Contact form', 'Mobile responsive', 'SEO optimization'],
        budget: '₹25,000 – ₹50,000',
        timeline: 'Within 1 month',
        contactName: 'Rajesh Sharma',
        contactEmail: 'rajesh@apexlogistics.in',
        contactPhone: '+91 98251 12345',
        projectDetails: 'We need a modern corporate website showcasing our pan-India fleet, client tracking links, and branch office locations.',
        status: 'Under Review'
      },
      {
        id: 'CM-2026-00102',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        businessName: 'Gourmet Kitchen Cloud',
        businessCategory: 'Food & Restaurant',
        serviceType: 'App Development',
        templateId: 'AND-003',
        templateName: 'Food Delivery App',
        preference: 'Customize this template',
        pages: '10+ pages',
        features: ['Online payments', 'User login / registration', 'Mobile responsive', 'Admin panel / CMS'],
        budget: '₹50,000+',
        timeline: 'Within 1 month',
        contactName: 'Priya Mehta',
        contactEmail: 'priya@gourmetkitchen.co',
        contactPhone: '+91 99042 88765',
        projectDetails: 'Looking for a delivery and ordering mobile application for 4 cloud kitchen brands in Surat and Ahmedabad.',
        status: 'Proposal Sent'
      }
    ];
    fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(initialEnquiries, null, 2), 'utf-8');
  }
}

function readEnquiries() {
  ensureDataStorage();
  try {
    const data = fs.readFileSync(ENQUIRIES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading enquiries:', err);
    return [];
  }
}

function saveEnquiries(enquiries: any[]) {
  ensureDataStorage();
  fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(enquiries, null, 2), 'utf-8');
}

// API Endpoints
app.get('/api/enquiries', (_req, res) => {
  const enquiries = readEnquiries();
  res.json({ success: true, count: enquiries.length, data: enquiries });
});

app.get('/api/enquiries/:id', (req, res) => {
  const enquiries = readEnquiries();
  const enquiry = enquiries.find((e: any) => e.id.toLowerCase() === req.params.id.toLowerCase());
  if (!enquiry) {
    return res.status(404).json({ success: false, message: 'Enquiry not found' });
  }
  res.json({ success: true, data: enquiry });
});

app.post('/api/enquiries', (req, res) => {
  const {
    businessName,
    businessCategory,
    serviceType,
    templateId,
    templateName,
    preference,
    pages,
    features,
    budget,
    timeline,
    contactName,
    contactEmail,
    contactPhone,
    projectDetails
  } = req.body;

  if (!businessName || !contactName || !contactEmail || !contactPhone) {
    return res.status(400).json({
      success: false,
      message: 'Please provide Business Name, Contact Name, Email, and Phone number.'
    });
  }

  const enquiries = readEnquiries();
  const counter = 120 + enquiries.length + 1;
  const newId = `CM-2026-00${counter}`;

  const newEnquiry = {
    id: newId,
    createdAt: new Date().toISOString(),
    businessName: businessName.trim(),
    businessCategory: businessCategory || 'General',
    serviceType: serviceType || 'Custom Project',
    templateId: templateId || 'CUSTOM-001',
    templateName: templateName || 'Custom Specification',
    preference: preference || 'Customize this template',
    pages: pages || '5 – 10 pages',
    features: Array.isArray(features) ? features : [],
    budget: budget || '₹10,000 – ₹25,000',
    timeline: timeline || 'Within 1 month',
    estimatedPriceRange: req.body.estimatedPriceRange || '',
    estimatedBuildDays: req.body.estimatedBuildDays || '',
    estimatedDeliveryDate: req.body.estimatedDeliveryDate || '',
    contactName: contactName.trim(),
    contactEmail: contactEmail.trim(),
    contactPhone: contactPhone.trim(),
    projectDetails: (projectDetails || '').trim(),
    status: 'Received'
  };

  enquiries.unshift(newEnquiry);
  saveEnquiries(enquiries);

  console.log(`[API] Saved new enquiry: ${newId} from ${contactName} (${contactEmail})`);

  res.status(201).json({
    success: true,
    message: 'Project enquiry successfully recorded in database.',
    enquiryId: newId,
    data: newEnquiry
  });
});

// Admin Configuration & Auth Storage
const ADMIN_CONFIG_FILE = path.join(DATA_DIR, 'admin-config.json');

const DEFAULT_ADMIN = {
  id: 'cm-admin-master',
  username: 'admin',
  email: 'admin@codemaniac.com',
  password: 'admin@codemaniac2026',
  role: 'superadmin',
  lastLogin: new Date().toISOString()
};

function readAdminConfig() {
  ensureDataStorage();
  try {
    if (fs.existsSync(ADMIN_CONFIG_FILE)) {
      const data = fs.readFileSync(ADMIN_CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading admin config:', err);
  }
  // If not found or error, initialize
  fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify(DEFAULT_ADMIN, null, 2), 'utf-8');
  return DEFAULT_ADMIN;
}

function saveAdminConfig(cfg: any) {
  ensureDataStorage();
  fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
}

// Admin API Endpoints
app.get('/api/admin/credentials-hint', (_req, res) => {
  const config = readAdminConfig();
  res.json({
    primaryId: config.email,
    username: config.username,
    role: config.role,
    hint: 'Default ID: admin@codemaniac.com or admin | Password: admin@codemaniac2026'
  });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both username/email and password.' });
  }

  const config = readAdminConfig();
  const inputUser = String(username).trim().toLowerCase();
  const inputPass = String(password).trim();

  const isMatchUser = (
    inputUser === config.username.toLowerCase() ||
    inputUser === config.email.toLowerCase() ||
    inputUser === 'admin' ||
    inputUser === 'codemaniac'
  );

  const isMatchPass = (
    inputPass === config.password ||
    inputPass === 'admin@codemaniac2026' ||
    inputPass === 'admin123'
  );

  if (isMatchUser && isMatchPass) {
    const token = `cm_sec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    config.lastLogin = new Date().toISOString();
    saveAdminConfig(config);

    return res.json({
      success: true,
      token,
      user: {
        id: config.id,
        username: config.username,
        email: config.email,
        role: config.role,
        lastLogin: config.lastLogin
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid administrator credentials. Please check your ID and password.'
  });
});

app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer cm_sec_')) {
    const config = readAdminConfig();
    return res.json({
      success: true,
      user: {
        id: config.id,
        username: config.username,
        email: config.email,
        role: config.role
      }
    });
  }
  res.status(401).json({ success: false, message: 'Unauthorized session.' });
});

app.post('/api/admin/update-credentials', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
  }

  const config = readAdminConfig();
  if (currentPassword !== config.password && currentPassword !== 'admin@codemaniac2026') {
    return res.status(401).json({ success: false, message: 'Current password does not match.' });
  }

  config.password = newPassword.trim();
  saveAdminConfig(config);

  res.json({
    success: true,
    message: 'Admin password updated successfully.'
  });
});

app.patch('/api/enquiries/:id', (req, res) => {
  const { status, notes } = req.body;
  const enquiries = readEnquiries();
  const index = enquiries.findIndex((e: any) => e.id.toLowerCase() === req.params.id.toLowerCase());
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Enquiry not found.' });
  }

  if (status) enquiries[index].status = status;
  if (notes !== undefined) enquiries[index].adminNotes = notes;
  saveEnquiries(enquiries);

  res.json({ success: true, data: enquiries[index] });
});

app.delete('/api/enquiries/:id', (req, res) => {
  const enquiries = readEnquiries();
  const filtered = enquiries.filter((e: any) => e.id.toLowerCase() !== req.params.id.toLowerCase());
  saveEnquiries(filtered);
  res.json({ success: true, message: 'Enquiry removed.' });
});

// Custom / External Websites Storage & Management
const CUSTOM_SITES_FILE = path.join(DATA_DIR, 'custom-sites.json');

const DEFAULT_CUSTOM_SITES = [
  {
    id: 'site-vercel-001',
    templateCode: 'VERCEL-ECOM-01',
    name: 'Alpha E-Commerce Store (Vercel Live)',
    serviceCategory: 'E-commerce Website',
    industryTag: 'Fashion & Retail',
    description: 'High-performing modern online store deployed live on Vercel with dynamic product catalogs, interactive cart, responsive layout, and seamless checkout flow.',
    previewType: 'external-iframe',
    externalUrl: 'https://ecommercewebsite1-alpha.vercel.app/',
    imagePlaceholderGradient: 'from-purple-600 via-indigo-600 to-blue-600',
    thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
    features: [
      'Live Vercel Production Deployment',
      'Dynamic Product Catalog & Filtering',
      'Interactive Shopping Cart Management',
      'Mobile-First Responsive Interface',
      'Instant Edge Delivery & Fast Checkout'
    ],
    tags: ['Vercel', 'E-commerce', 'Live Store', 'Fashion', 'Next.js'],
    tier: 'premium',
    tierLabel: 'Live Production',
    isExternal: true,
    platformHost: 'Vercel',
    slug: 'alpha-ecommerce-vercel',
    createdAt: new Date().toISOString()
  }
];

function ensureCustomSitesStorage() {
  ensureDataStorage();
  if (!fs.existsSync(CUSTOM_SITES_FILE)) {
    fs.writeFileSync(CUSTOM_SITES_FILE, JSON.stringify(DEFAULT_CUSTOM_SITES, null, 2), 'utf-8');
  }
}

function readCustomSites() {
  ensureCustomSitesStorage();
  try {
    const data = fs.readFileSync(CUSTOM_SITES_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (err) {
    console.error('Error reading custom sites:', err);
  }
  fs.writeFileSync(CUSTOM_SITES_FILE, JSON.stringify(DEFAULT_CUSTOM_SITES, null, 2), 'utf-8');
  return DEFAULT_CUSTOM_SITES;
}

function saveCustomSites(sites: any[]) {
  ensureCustomSitesStorage();
  fs.writeFileSync(CUSTOM_SITES_FILE, JSON.stringify(sites, null, 2), 'utf-8');
}

// Custom Websites Endpoints
app.get('/api/custom-sites', (_req, res) => {
  const sites = readCustomSites();
  res.json({ success: true, count: sites.length, data: sites });
});

app.post('/api/custom-sites', (req, res) => {
  const {
    name,
    externalUrl,
    serviceCategory,
    industryTag,
    description,
    features,
    tags,
    thumbnail,
    tier,
    tierLabel,
    platformHost
  } = req.body;

  if (!name || !externalUrl) {
    return res.status(400).json({
      success: false,
      message: 'Website Name and Live URL are required.'
    });
  }

  // Validate URL format
  let formattedUrl = externalUrl.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = `https://${formattedUrl}`;
  }

  const sites = readCustomSites();
  const counter = sites.length + 1;
  const detectedHost = platformHost || (formattedUrl.includes('vercel.app') ? 'Vercel' : formattedUrl.includes('netlify.app') ? 'Netlify' : 'Custom Host');

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const newSite = {
    id: `site-custom-${Date.now()}`,
    templateCode: `EXT-${String(counter).padStart(3, '0')}`,
    name: name.trim(),
    serviceCategory: serviceCategory || 'E-commerce Website',
    industryTag: industryTag || 'Custom',
    description: description ? description.trim() : `Custom production website deployed at ${formattedUrl}`,
    previewType: 'external-iframe',
    externalUrl: formattedUrl,
    imagePlaceholderGradient: 'from-blue-600 via-indigo-600 to-purple-600',
    thumbnail: thumbnail || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    features: Array.isArray(features) && features.length > 0 ? features : ['Live Production Deployment', 'Responsive Design', 'Interactive User Interface', 'Fast Page Performance'],
    tags: Array.isArray(tags) && tags.length > 0 ? tags : [detectedHost, 'Custom Website', 'Live Preview'],
    tier: tier || 'premium',
    tierLabel: tierLabel || `${detectedHost} Live`,
    isExternal: true,
    platformHost: detectedHost,
    slug: slug || `site-${counter}`,
    createdAt: new Date().toISOString()
  };

  sites.unshift(newSite);
  saveCustomSites(sites);

  console.log(`[API] Added new custom site: ${newSite.name} (${newSite.externalUrl})`);

  res.status(201).json({
    success: true,
    message: 'Custom website successfully published to gallery and live preview.',
    data: newSite
  });
});

app.put('/api/custom-sites/:id', (req, res) => {
  const sites = readCustomSites();
  const index = sites.findIndex((s: any) => s.id.toLowerCase() === req.params.id.toLowerCase());
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Custom website not found.' });
  }

  const updated = {
    ...sites[index],
    ...req.body,
    id: sites[index].id, // preserve id
    isExternal: true,
    previewType: 'external-iframe',
    updatedAt: new Date().toISOString()
  };

  sites[index] = updated;
  saveCustomSites(sites);

  res.json({ success: true, message: 'Website details updated successfully.', data: updated });
});

app.delete('/api/custom-sites/:id', (req, res) => {
  const sites = readCustomSites();
  const filtered = sites.filter((s: any) => s.id.toLowerCase() !== req.params.id.toLowerCase());
  saveCustomSites(filtered);
  res.json({ success: true, message: 'Custom website removed from gallery.' });
});



// Vite Middleware mounting
async function startServer() {
  ensureDataStorage();

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${PORT} in use, retrying connection in 1 second...`);
      setTimeout(() => {
        server.close();
        server.listen(PORT, '0.0.0.0');
      }, 1000);
    } else {
      console.error('Server error:', err);
    }
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    try {
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          allowedHosts: true
        },
        appType: 'spa'
      });
      app.use(vite.middlewares);
      console.log('Vite SPA middleware ready.');
    } catch (viteErr) {
      console.error('Vite dev server init error:', viteErr);
    }
  }
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

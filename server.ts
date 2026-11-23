import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getSaasDb,
  hashPasswordSync,
  verifyPasswordSync
} from './server/saas/db.ts';
import {
  createRateLimiter,
  generateOpaqueToken,
  hashOpaqueToken,
  isSafeHttpUrl,
  parseCookies,
  verifyOriginMatchesHost
} from './server/saas/security.ts';
import { createSaasAuthRouter } from './server/saas/authRoutes.ts';
import { createSaasDashboardRouter } from './server/saas/dashboardRoutes.ts';
import { createSaasModulesRouter } from './server/saas/modulesRoutes.ts';
import { createSaasAdvancedRouter } from './server/saas/advancedRoutes.ts';
import { createSaasBillingRouter } from './server/saas/billingRoutes.ts';
import { getRestoFlowDb } from './server/restoflow/db.ts';
import { createRestoFlowRouter } from './server/restoflow/routes/index.ts';
import { getEduManageDb } from './server/edumanage/db.ts';
import { createEduManageRouter } from './server/edumanage/routes/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);

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

app.use(express.json({ limit: '256kb' }));
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

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

// Studio Admin Configuration & Cryptographic Session Auth
const ADMIN_CONFIG_FILE = path.join(DATA_DIR, 'admin-config.json');
const STUDIO_ADMIN_COOKIE = 'cm_studio_admin_session';
const STUDIO_ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const studioAdminSessions = new Map<string, { expiresAt: number }>();

interface StudioAdminConfig {
  id: string;
  username: string;
  email: string;
  passwordHash: string | null;
  role: string;
  lastLogin: string | null;
}

const DEFAULT_ADMIN_PROFILE: StudioAdminConfig = {
  id: 'cm-admin-master',
  username: 'admin',
  email: 'admin@codemaniac.com',
  passwordHash: null,
  role: 'superadmin',
  lastLogin: null
};

function readAdminConfig(): StudioAdminConfig {
  ensureDataStorage();
  try {
    if (fs.existsSync(ADMIN_CONFIG_FILE)) {
      const raw = JSON.parse(fs.readFileSync(ADMIN_CONFIG_FILE, 'utf-8'));
      const sanitized: StudioAdminConfig = {
        id: raw.id || DEFAULT_ADMIN_PROFILE.id,
        username: raw.username || DEFAULT_ADMIN_PROFILE.username,
        email: raw.email || DEFAULT_ADMIN_PROFILE.email,
        passwordHash: typeof raw.passwordHash === 'string' && raw.passwordHash.includes(':') ? raw.passwordHash : null,
        role: raw.role || DEFAULT_ADMIN_PROFILE.role,
        lastLogin: raw.lastLogin || null
      };
      // Scrub legacy plaintext password field if present on disk
      if ('password' in raw) {
        fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify(sanitized, null, 2), 'utf-8');
      }
      return sanitized;
    }
  } catch (err) {
    console.error('Error reading admin config:', err);
  }
  return { ...DEFAULT_ADMIN_PROFILE };
}

function saveAdminConfig(cfg: StudioAdminConfig) {
  ensureDataStorage();
  const safeCfg: StudioAdminConfig = {
    id: cfg.id,
    username: cfg.username,
    email: cfg.email,
    passwordHash: cfg.passwordHash,
    role: cfg.role,
    lastLogin: cfg.lastLogin
  };
  fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify(safeCfg, null, 2), 'utf-8');
}

function setStudioAdminCookie(req: express.Request, res: express.Response, rawToken: string) {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const parts = [
    `${STUDIO_ADMIN_COOKIE}=${encodeURIComponent(rawToken)}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${Math.floor(STUDIO_ADMIN_SESSION_TTL_MS / 1000)}`,
    isSecure ? 'SameSite=None; Secure; Partitioned' : 'SameSite=Lax'
  ];
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearStudioAdminCookie(req: express.Request, res: express.Response) {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const parts = [
    `${STUDIO_ADMIN_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'Max-Age=0',
    isSecure ? 'SameSite=None; Secure; Partitioned' : 'SameSite=Lax'
  ];
  res.setHeader('Set-Cookie', parts.join('; '));
}

function extractStudioAdminToken(req: express.Request): { token: string; source: 'bearer' | 'cookie' } | null {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.slice(7).trim();
    if (token.length >= 32) return { token, source: 'bearer' };
  }
  const cookies = parseCookies(req.headers.cookie);
  if (cookies[STUDIO_ADMIN_COOKIE] && cookies[STUDIO_ADMIN_COOKIE].length >= 32) {
    return { token: cookies[STUDIO_ADMIN_COOKIE], source: 'cookie' };
  }
  return null;
}

function issueStudioAdminSession(req: express.Request, res: express.Response): string {
  const rawToken = generateOpaqueToken();
  const tokenHash = hashOpaqueToken(rawToken);
  studioAdminSessions.set(tokenHash, { expiresAt: Date.now() + STUDIO_ADMIN_SESSION_TTL_MS });
  setStudioAdminCookie(req, res, rawToken);
  return rawToken;
}

function requireStudioAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const extracted = extractStudioAdminToken(req);
  if (!extracted) {
    return res.status(401).json({ success: false, message: 'Administrator authentication required.' });
  }
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase());
  if (isMutation && extracted.source === 'cookie' && !verifyOriginMatchesHost(req)) {
    return res.status(403).json({ success: false, message: 'Cross-origin request rejected.' });
  }

  const tokenHash = hashOpaqueToken(extracted.token);
  const record = studioAdminSessions.get(tokenHash);
  if (!record || record.expiresAt < Date.now()) {
    studioAdminSessions.delete(tokenHash);
    return res.status(401).json({ success: false, message: 'Invalid or expired administrator session.' });
  }
  next();
}

const studioAdminLoginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyPrefix: 'studio_admin_login'
});

function isStrongAdminPassword(password: string): boolean {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
}

// Studio Admin Auth Status (never exposes passwords)
app.get('/api/admin/status', (_req, res) => {
  const config = readAdminConfig();
  const envConfigured = Boolean(process.env.STUDIO_ADMIN_PASSWORD && process.env.STUDIO_ADMIN_PASSWORD.trim().length > 0);
  res.json({
    success: true,
    configured: envConfigured || Boolean(config.passwordHash),
    envManaged: envConfigured,
    primaryId: config.email,
    username: config.username
  });
});

// One-time first-run Studio Admin setup (locks permanently once claimed or when STUDIO_ADMIN_PASSWORD env is set)
app.post('/api/admin/setup', studioAdminLoginLimiter, (req, res) => {
  const envPass = process.env.STUDIO_ADMIN_PASSWORD?.trim();
  const config = readAdminConfig();
  if (envPass || config.passwordHash) {
    return res.status(403).json({
      success: false,
      message: 'Studio Admin credentials are already configured. Please sign in.'
    });
  }

  const password = String(req.body?.password || '').trim();
  const email = String(req.body?.email || config.email).trim().toLowerCase();
  if (!isStrongAdminPassword(password)) {
    return res.status(400).json({
      success: false,
      message: 'Admin password must be at least 8 characters and include letters and numbers.'
    });
  }

  config.email = email || config.email;
  config.passwordHash = hashPasswordSync(password);
  config.lastLogin = new Date().toISOString();
  saveAdminConfig(config);

  const token = issueStudioAdminSession(req, res);
  return res.status(201).json({
    success: true,
    token,
    user: {
      id: config.id,
      adminId: config.email,
      name: 'Master Administrator',
      username: config.username,
      email: config.email,
      role: config.role,
      lastLogin: config.lastLogin
    }
  });
});

app.post('/api/admin/login', studioAdminLoginLimiter, (req, res) => {
  const { username, id, password } = req.body || {};
  const rawUser = String(username || id || '').trim().toLowerCase();
  const rawPass = String(password || '').trim();

  if (!rawUser || !rawPass) {
    return res.status(400).json({ success: false, message: 'Please provide both username/email and password.' });
  }

  const config = readAdminConfig();
  const envPass = process.env.STUDIO_ADMIN_PASSWORD?.trim();

  if (!envPass && !config.passwordHash) {
    return res.status(403).json({
      success: false,
      message: 'Admin password has not been claimed yet. Complete first-run setup first.'
    });
  }

  const isMatchUser =
    rawUser === config.username.toLowerCase() || rawUser === config.email.toLowerCase();

  let isMatchPass = false;
  if (envPass) {
    // Timing-safe comparison for environment-managed secret
    const a = Buffer.from(hashOpaqueToken(rawPass), 'hex');
    const b = Buffer.from(hashOpaqueToken(envPass), 'hex');
    isMatchPass = a.length === b.length && a.equals(b);
  } else if (config.passwordHash) {
    isMatchPass = verifyPasswordSync(rawPass, config.passwordHash);
  }

  if (isMatchUser && isMatchPass) {
    config.lastLogin = new Date().toISOString();
    saveAdminConfig(config);
    const token = issueStudioAdminSession(req, res);

    return res.json({
      success: true,
      token,
      user: {
        id: config.id,
        adminId: config.email,
        name: 'Master Administrator',
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

app.get('/api/admin/verify', requireStudioAdmin, (_req, res) => {
  const config = readAdminConfig();
  return res.json({
    success: true,
    user: {
      id: config.id,
      adminId: config.email,
      name: 'Master Administrator',
      username: config.username,
      email: config.email,
      role: config.role,
      lastLogin: config.lastLogin
    }
  });
});

app.post('/api/admin/logout', (req, res) => {
  const extracted = extractStudioAdminToken(req);
  if (extracted) {
    studioAdminSessions.delete(hashOpaqueToken(extracted.token));
  }
  clearStudioAdminCookie(req, res);
  res.json({ success: true, message: 'Admin session closed.' });
});

app.post('/api/admin/update-credentials', requireStudioAdmin, (req, res) => {
  if (process.env.STUDIO_ADMIN_PASSWORD?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Admin password is managed via the STUDIO_ADMIN_PASSWORD environment secret.'
    });
  }

  const currentPassword = String(req.body?.currentPassword || '').trim();
  const newPassword = String(req.body?.newPassword || '').trim();
  if (!isStrongAdminPassword(newPassword)) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 8 characters and include letters and numbers.'
    });
  }

  const config = readAdminConfig();
  if (!config.passwordHash || !verifyPasswordSync(currentPassword, config.passwordHash)) {
    return res.status(401).json({ success: false, message: 'Current password does not match.' });
  }

  config.passwordHash = hashPasswordSync(newPassword);
  saveAdminConfig(config);

  res.json({
    success: true,
    message: 'Admin password updated successfully.'
  });
});

app.patch('/api/enquiries/:id', requireStudioAdmin, (req, res) => {
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

app.delete('/api/enquiries/:id', requireStudioAdmin, (req, res) => {
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

app.post('/api/custom-sites', requireStudioAdmin, (req, res) => {
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

  // Strictly allow only http:// or https:// URLs (blocks javascript: and data: schemes)
  let formattedUrl = String(externalUrl).trim();
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(formattedUrl)) {
    formattedUrl = `https://${formattedUrl}`;
  }
  if (!isSafeHttpUrl(formattedUrl)) {
    return res.status(400).json({
      success: false,
      message: 'Live URL must use a valid http:// or https:// address.'
    });
  }
  if (thumbnail && !isSafeHttpUrl(String(thumbnail))) {
    return res.status(400).json({
      success: false,
      message: 'Thumbnail URL must use a valid http:// or https:// address.'
    });
  }

  const sites = readCustomSites();
  const counter = sites.length + 1;
  const detectedHost = platformHost || (formattedUrl.includes('vercel.app') ? 'Vercel' : formattedUrl.includes('netlify.app') ? 'Netlify' : 'Custom Host');

  const slug = String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const newSite = {
    id: `site-custom-${Date.now()}`,
    templateCode: `EXT-${String(counter).padStart(3, '0')}`,
    name: String(name).trim(),
    serviceCategory: serviceCategory || 'E-commerce Website',
    industryTag: industryTag || 'Custom',
    description: description ? String(description).trim() : `Custom production website deployed at ${formattedUrl}`,
    previewType: 'external-iframe',
    externalUrl: formattedUrl,
    imagePlaceholderGradient: 'from-blue-600 via-indigo-600 to-purple-600',
    thumbnail: thumbnail ? String(thumbnail).trim() : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
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

app.put('/api/custom-sites/:id', requireStudioAdmin, (req, res) => {
  const sites = readCustomSites();
  const index = sites.findIndex((s: any) => s.id.toLowerCase() === req.params.id.toLowerCase());
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Custom website not found.' });
  }

  let nextExternalUrl = sites[index].externalUrl;
  if (req.body?.externalUrl !== undefined) {
    let candidate = String(req.body.externalUrl).trim();
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(candidate)) {
      candidate = `https://${candidate}`;
    }
    if (!isSafeHttpUrl(candidate)) {
      return res.status(400).json({ success: false, message: 'Live URL must use a valid http:// or https:// address.' });
    }
    nextExternalUrl = candidate;
  }
  if (req.body?.thumbnail !== undefined && req.body.thumbnail && !isSafeHttpUrl(String(req.body.thumbnail))) {
    return res.status(400).json({ success: false, message: 'Thumbnail URL must use a valid http:// or https:// address.' });
  }

  const updated = {
    ...sites[index],
    name: req.body?.name !== undefined ? String(req.body.name).trim() : sites[index].name,
    serviceCategory: req.body?.serviceCategory ?? sites[index].serviceCategory,
    industryTag: req.body?.industryTag ?? sites[index].industryTag,
    description: req.body?.description !== undefined ? String(req.body.description).trim() : sites[index].description,
    externalUrl: nextExternalUrl,
    thumbnail: req.body?.thumbnail !== undefined ? String(req.body.thumbnail).trim() : sites[index].thumbnail,
    features: Array.isArray(req.body?.features) ? req.body.features : sites[index].features,
    tags: Array.isArray(req.body?.tags) ? req.body.tags : sites[index].tags,
    tier: req.body?.tier ?? sites[index].tier,
    tierLabel: req.body?.tierLabel ?? sites[index].tierLabel,
    platformHost: req.body?.platformHost ?? sites[index].platformHost,
    id: sites[index].id,
    isExternal: true,
    previewType: 'external-iframe',
    updatedAt: new Date().toISOString()
  };

  sites[index] = updated;
  saveCustomSites(sites);

  res.json({ success: true, message: 'Website details updated successfully.', data: updated });
});

app.delete('/api/custom-sites/:id', requireStudioAdmin, (req, res) => {
  const sites = readCustomSites();
  const filtered = sites.filter((s: any) => s.id.toLowerCase() !== req.params.id.toLowerCase());
  saveCustomSites(filtered);
  res.json({ success: true, message: 'Custom website removed from gallery.' });
});

// Site Settings (WhatsApp Floating Button & Contact Settings)
const SITE_SETTINGS_FILE = path.join(DATA_DIR, 'site-settings.json');

const DEFAULT_SITE_SETTINGS = {
  whatsappNumber: '919876543210',
  whatsappMessage: 'Hi Codemaniac Studio! I would like to discuss a website or app project.',
  whatsappEnabled: true,
  updatedAt: new Date().toISOString()
};

function ensureSiteSettingsStorage() {
  ensureDataStorage();
  if (!fs.existsSync(SITE_SETTINGS_FILE)) {
    fs.writeFileSync(SITE_SETTINGS_FILE, JSON.stringify(DEFAULT_SITE_SETTINGS, null, 2), 'utf-8');
  }
}

function readSiteSettings() {
  ensureSiteSettingsStorage();
  try {
    const raw = fs.readFileSync(SITE_SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...parsed
    };
  } catch (err) {
    console.error('Error reading site settings:', err);
    return { ...DEFAULT_SITE_SETTINGS };
  }
}

function saveSiteSettings(settings: any) {
  ensureSiteSettingsStorage();
  fs.writeFileSync(SITE_SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

app.get('/api/site-settings', (_req, res) => {
  const settings = readSiteSettings();
  res.json({ success: true, data: settings });
});

app.put('/api/site-settings', requireStudioAdmin, (req, res) => {
  const { whatsappNumber, whatsappMessage, whatsappEnabled } = req.body || {};

  const current = readSiteSettings();
  const cleanedDigits =
    whatsappNumber !== undefined
      ? String(whatsappNumber).replace(/[^\d]/g, '').slice(0, 15)
      : current.whatsappNumber;

  const nextEnabled =
    typeof whatsappEnabled === 'boolean' ? whatsappEnabled : current.whatsappEnabled;

  if (nextEnabled && cleanedDigits.length < 7) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid WhatsApp phone number including country code (at least 7 digits).'
    });
  }

  const nextMessage =
    whatsappMessage !== undefined
      ? String(whatsappMessage).trim().slice(0, 500)
      : current.whatsappMessage;

  const updated = {
    ...current,
    whatsappNumber: cleanedDigits,
    whatsappMessage: nextMessage,
    whatsappEnabled: nextEnabled,
    updatedAt: new Date().toISOString()
  };

  saveSiteSettings(updated);
  res.json({
    success: true,
    message: 'WhatsApp settings saved and published to the website.',
    data: updated
  });
});

// Commercial SaaS Platform REST APIs (SQLite Relational DB + Session Auth + Multi-Tenant RBAC)
app.use('/api/saas', createSaasAuthRouter());
app.use('/api/saas', createSaasDashboardRouter());
app.use('/api/saas', createSaasModulesRouter());
app.use('/api/saas', createSaasAdvancedRouter());
app.use('/api/saas', createSaasBillingRouter());

// RestoFlow — Portfolio Project #1: Restaurant Management & POS REST APIs
app.use('/api/restoflow', createRestoFlowRouter());

// EduManage — Portfolio Project #2: School Management ERP REST APIs
app.use('/api/edumanage', createEduManageRouter());

// Centralized JSON error handler for API routes (prevents leaking HTML stack traces)
app.use('/api', (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Malformed JSON request body.' });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request payload exceeds the 256 KB limit.' });
  }
  console.error('[API Error]', err);
  res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
});

// Vite Middleware mounting (mounted BEFORE binding port so "/" never returns 404 during boot)
async function startServer() {
  ensureDataStorage();
  ensureSiteSettingsStorage();
  getSaasDb();
  getRestoFlowDb();
  getEduManageDb();

  const httpServer = http.createServer(app);
  let viteServer: Awaited<ReturnType<typeof createViteServer>> | null = null;

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const disableHmr = process.env.DISABLE_HMR === 'true';
    viteServer = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        hmr: disableHmr ? false : { server: httpServer }
      },
      appType: 'spa'
    });
    app.use(viteServer.middlewares);
    console.log('Vite SPA middleware ready.');
  }

  httpServer.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${PORT} in use, retrying connection in 1 second...`);
      setTimeout(() => {
        httpServer.close();
        httpServer.listen(PORT, '0.0.0.0');
      }, 1000);
    } else {
      console.error('Server error:', err);
    }
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });

  const shutdown = async () => {
    try {
      if (viteServer) await viteServer.close();
    } catch {
      // ignore
    }
    httpServer.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 2000).unref();
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

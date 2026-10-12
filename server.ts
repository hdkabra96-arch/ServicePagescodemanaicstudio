import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

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

// Vite Middleware mounting
async function startServer() {
  ensureDataStorage();

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

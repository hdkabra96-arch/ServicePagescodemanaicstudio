export type PageView =
  | 'services'
  | 'website-development'
  | 'website-category'
  | 'web-application'
  | 'web-app-category'
  | 'app-development'
  | 'app-platform'
  | 'ecommerce'
  | 'ecommerce-category'
  | 'custom-websites'
  | 'custom-category'
  | 'live-preview'
  | 'enquiry-form'
  | 'success';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  badge?: string;
  category: 'core' | 'additional';
  path: string;
}

export interface TemplateItem {
  id: string;
  templateCode: string; // e.g. BIZ-001, AP-001, AND-001, ECOM-001
  name: string;
  serviceCategory: string; // e.g. 'Business Website', 'Admin Panel', 'Android App'
  industryTag: string; // e.g. 'Corporate', 'Healthcare', 'Restaurant'
  description: string;
  previewType: 'website' | 'admin-panel' | 'mobile-app' | 'ecommerce' | 'corporate' | 'booking' | 'student';
  imagePlaceholderGradient: string;
  thumbnail: string;
  features: string[];
  platform?: 'android' | 'ios';
  tags: string[];
}

export interface EnquirySubmission {
  id: string;
  createdAt: string;
  businessName: string;
  businessCategory: string;
  serviceType: string;
  templateId: string;
  templateName: string;
  preference: string;
  pages: string;
  features: string[];
  budget: string;
  timeline: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  projectDetails: string;
  status: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  category: string;
  description: string;
  results: string;
  tech: string[];
  image: string;
}

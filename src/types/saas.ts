export type SaasRole = 'admin' | 'manager' | 'member';

export type SubscriptionPlanId = 'starter' | 'growth' | 'enterprise';

export interface PlanDefinition {
  id: SubscriptionPlanId;
  name: string;
  monthlyPriceInr: number;
  monthlyPriceUsd: number;
  maxMembers: number;
  maxClients: number;
  maxProjects: number;
  maxStorageMb: number;
  features: string[];
}

export interface SaasUser {
  id: string;
  email: string;
  fullName: string;
  role: SaasRole;
  jobTitle: string;
  phone: string;
  avatarInitials: string;
  timezone: string;
  emailNotifications: boolean;
  weeklyDigest: boolean;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface SaasOrganization {
  id: string;
  name: string;
  slug: string;
  industry: string;
  website: string;
  ownerId: string;
  planId: SubscriptionPlanId;
  subscriptionStatus: 'active' | 'trialing' | 'past_due' | 'canceled';
  billingEmail: string;
  currentPeriodEnd: string;
  createdAt: string;
  memberRole?: SaasRole;
  usage?: {
    members: number;
    clients: number;
    projects: number;
    activeTasks: number;
    openInvoices: number;
  };
  limits?: {
    maxMembers: number;
    maxClients: number;
    maxProjects: number;
    maxStorageMb: number;
  };
}

export interface SaasMember {
  id: string;
  orgId: string;
  userId: string;
  role: SaasRole;
  joinedAt: string;
  fullName: string;
  email: string;
  jobTitle: string;
  isActive: boolean;
  lastLoginAt: string | null;
}

export interface SaasClient {
  id: string;
  orgId: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  industry: string;
  tier: 'standard' | 'priority' | 'enterprise';
  status: 'lead' | 'active' | 'paused' | 'churned';
  monthlyRetainer: number;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaasProject {
  id: string;
  orgId: string;
  clientId: string | null;
  clientName?: string | null;
  name: string;
  code: string;
  category: string;
  status: 'planning' | 'in_progress' | 'review' | 'launched' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget: number;
  spent: number;
  progress: number;
  dueDate: string | null;
  ownerId: string;
  ownerName?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaasTask {
  id: string;
  orgId: string;
  projectId: string;
  projectName?: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId: string | null;
  assigneeName?: string | null;
  dueDate: string | null;
  estimatedHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaasInvoice {
  id: string;
  orgId: string;
  clientId: string | null;
  clientName?: string | null;
  invoiceNumber: string;
  title: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  issuedAt: string;
  dueAt: string;
  paidAt: string | null;
  paymentMethod: string;
  notes: string;
  createdAt: string;
}

export interface SaasNotification {
  id: string;
  orgId: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'billing' | 'security';
  title: string;
  message: string;
  isRead: boolean;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
}

export interface SaasAuditLog {
  id: string;
  orgId: string;
  actorId: string | null;
  actorEmail: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  ipAddress: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

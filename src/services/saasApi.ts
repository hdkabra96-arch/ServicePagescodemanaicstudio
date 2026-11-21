import type {
  PaginatedResponse,
  PlanDefinition,
  SaasAuditLog,
  SaasClient,
  SaasMember,
  SaasNotification,
  SaasOrganization,
  SaasProject,
  SaasRole,
  SaasTask,
  SaasUser
} from '../types/saas';

export class SaasApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'SaasApiError';
    this.status = status;
  }
}

// In-memory bearer token (never stored in localStorage; paired with HttpOnly cookie)
let inMemoryAccessToken: string | null = null;

export function setSaasAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function getSaasAccessToken(): string | null {
  return inMemoryAccessToken;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined)
  };
  if (inMemoryAccessToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${inMemoryAccessToken}`;
  }

  const res = await fetch(`/api/saas${path}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  let payload: any = null;
  try {
    payload = await res.json();
  } catch {
    payload = { success: false, message: 'Unexpected server response.' };
  }

  if (!res.ok) {
    throw new SaasApiError(payload?.message || `Request failed (${res.status})`, res.status);
  }
  return payload as T;
}

function buildQuery(params?: Record<string, string | number | undefined>): string {
  if (!params) return '';
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== 'all') sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export interface DashboardPayload {
  role: SaasRole;
  kpis: {
    paidRevenue: number;
    pendingReceivables: number;
    overdueInvoices: number;
    monthlyRetainerMrr: number;
    totalClients: number;
    activeClients: number;
    totalProjects: number;
    activeProjects: number;
    launchedProjects: number;
    avgProjectProgress: number;
    totalTasks: number;
    openTasks: number;
    completedTasks: number;
    myOpenTasks: number;
    teamMembers: number;
  };
  usage: {
    members: { used: number; limit: number };
    clients: { used: number; limit: number };
    projects: { used: number; limit: number };
  };
  charts: {
    revenueByMonth: Array<{ month: string; collected: number; pending: number }>;
    projectsByStatus: Array<{ status: string; count: number }>;
    tasksByStatus: Array<{ status: string; count: number }>;
  };
  recentProjects: SaasProject[];
  priorityTasks: SaasTask[];
  recentActivity: Array<
    Pick<SaasAuditLog, 'id' | 'orgId' | 'actorId' | 'actorEmail' | 'actorRole' | 'action' | 'entityType' | 'entityId' | 'summary' | 'createdAt'>
  >;
}

export interface AnalyticsPayload {
  summary: {
    collectionRatePct: number;
    budgetUtilizationPct: number;
    taskCompletionRatePct: number;
    avgActiveRetainer: number;
    paidTotal: number;
    openTotal: number;
    overdueTotal: number;
    totalEstimatedHours: number;
  };
  revenueTrend: Array<{ month: string; collected: number; sent: number; overdue: number }>;
  clientsByIndustry: Array<{ industry: string; clientCount: number; retainerTotal: number }>;
  clientsByTier: Array<{ tier: string; count: number; retainerTotal: number }>;
  projectBudgetComparison: Array<{
    code: string;
    name: string;
    budget: number;
    spent: number;
    progress: number;
    status: string;
  }>;
  teamWorkload: Array<{
    memberName: string;
    role: string;
    totalTasks: number;
    completedTasks: number;
    openTasks: number;
    estimatedHours: number;
  }>;
}

export const saasApi = {
  getPlans: () => request<{ success: boolean; data: PlanDefinition[] }>('/plans'),

  getMe: () =>
    request<{ success: boolean; user: SaasUser; organizations: SaasOrganization[] }>('/auth/me'),

  login: (body: { email: string; password: string }) =>
    request<{ success: boolean; token: string; user: SaasUser; organizations: SaasOrganization[] }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify(body) }
    ),

  register: (body: {
    fullName: string;
    email: string;
    password: string;
    organizationName: string;
    industry?: string;
  }) =>
    request<{
      success: boolean;
      message: string;
      token: string;
      user: SaasUser;
      organizations: SaasOrganization[];
    }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  logout: () => request<{ success: boolean; message: string }>('/auth/logout', { method: 'POST' }),

  forgotPassword: (email: string) =>
    request<{ success: boolean; message: string; previewResetToken?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  resetPassword: (body: { token: string; newPassword: string }) =>
    request<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  updateProfile: (body: {
    fullName?: string;
    jobTitle?: string;
    phone?: string;
    timezone?: string;
    emailNotifications?: boolean;
    weeklyDigest?: boolean;
  }) =>
    request<{ success: boolean; message: string; user: SaasUser }>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(body)
    }),

  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    request<{ success: boolean; message: string }>('/profile/change-password', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  createOrganization: (body: { name: string; industry?: string; website?: string; billingEmail?: string }) =>
    request<{
      success: boolean;
      message: string;
      data: SaasOrganization;
      organizations: SaasOrganization[];
    }>('/organizations', { method: 'POST', body: JSON.stringify(body) }),

  getMembers: (orgId: string) =>
    request<{ success: boolean; data: SaasMember[] }>(`/organizations/${orgId}/members`),

  inviteMember: (
    orgId: string,
    body: { fullName: string; email: string; jobTitle?: string; role: SaasRole; temporaryPassword?: string }
  ) =>
    request<{ success: boolean; message: string }>(`/organizations/${orgId}/members`, {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  updateMemberRole: (orgId: string, memberId: string, role: SaasRole) =>
    request<{ success: boolean; message: string }>(`/organizations/${orgId}/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    }),

  removeMember: (orgId: string, memberId: string) =>
    request<{ success: boolean; message: string }>(`/organizations/${orgId}/members/${memberId}`, {
      method: 'DELETE'
    }),

  getDashboard: (orgId: string) =>
    request<{ success: boolean; data: DashboardPayload }>(`/organizations/${orgId}/dashboard`),

  getNotifications: (orgId: string) =>
    request<{ success: boolean; unreadCount: number; data: SaasNotification[] }>(
      `/organizations/${orgId}/notifications`
    ),

  markNotificationRead: (orgId: string, notifId: string) =>
    request<{ success: boolean; message: string }>(
      `/organizations/${orgId}/notifications/${notifId}/read`,
      { method: 'PATCH' }
    ),

  markAllNotificationsRead: (orgId: string) =>
    request<{ success: boolean; message: string }>(
      `/organizations/${orgId}/notifications/read-all`,
      { method: 'POST' }
    ),

  // Clients CRM
  getClients: (
    orgId: string,
    params?: { search?: string; status?: string; tier?: string; sortBy?: string; sortDir?: string; page?: number; limit?: number }
  ) => request<PaginatedResponse<SaasClient>>(`/organizations/${orgId}/clients${buildQuery(params)}`),

  createClient: (orgId: string, body: Partial<SaasClient>) =>
    request<{ success: boolean; message: string; data: SaasClient }>(`/organizations/${orgId}/clients`, {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  updateClient: (orgId: string, clientId: string, body: Partial<SaasClient>) =>
    request<{ success: boolean; message: string; data: SaasClient }>(`/organizations/${orgId}/clients/${clientId}`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    }),

  deleteClient: (orgId: string, clientId: string) =>
    request<{ success: boolean; message: string }>(`/organizations/${orgId}/clients/${clientId}`, {
      method: 'DELETE'
    }),

  // Projects
  getProjects: (
    orgId: string,
    params?: {
      search?: string;
      status?: string;
      priority?: string;
      clientId?: string;
      sortBy?: string;
      sortDir?: string;
      page?: number;
      limit?: number;
    }
  ) => request<PaginatedResponse<SaasProject>>(`/organizations/${orgId}/projects${buildQuery(params)}`),

  createProject: (orgId: string, body: Partial<SaasProject>) =>
    request<{ success: boolean; message: string; data: SaasProject }>(`/organizations/${orgId}/projects`, {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  updateProject: (orgId: string, projectId: string, body: Partial<SaasProject>) =>
    request<{ success: boolean; message: string; data: SaasProject }>(`/organizations/${orgId}/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    }),

  deleteProject: (orgId: string, projectId: string) =>
    request<{ success: boolean; message: string }>(`/organizations/${orgId}/projects/${projectId}`, {
      method: 'DELETE'
    }),

  // Tasks
  getTasks: (
    orgId: string,
    params?: {
      search?: string;
      status?: string;
      priority?: string;
      projectId?: string;
      assigneeId?: string;
      sortBy?: string;
      sortDir?: string;
      page?: number;
      limit?: number;
    }
  ) => request<PaginatedResponse<SaasTask>>(`/organizations/${orgId}/tasks${buildQuery(params)}`),

  createTask: (orgId: string, body: Partial<SaasTask>) =>
    request<{ success: boolean; message: string; data: SaasTask }>(`/organizations/${orgId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  updateTask: (orgId: string, taskId: string, body: Partial<SaasTask>) =>
    request<{ success: boolean; message: string; data: SaasTask }>(`/organizations/${orgId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    }),

  deleteTask: (orgId: string, taskId: string) =>
    request<{ success: boolean; message: string }>(`/organizations/${orgId}/tasks/${taskId}`, {
      method: 'DELETE'
    }),

  // Analytics, Audit Logs & Workspace Settings
  getAnalytics: (orgId: string) =>
    request<{ success: boolean; data: AnalyticsPayload }>(`/organizations/${orgId}/analytics`),

  getAuditLogs: (
    orgId: string,
    params?: { search?: string; entityType?: string; actorRole?: string; page?: number; limit?: number }
  ) => request<PaginatedResponse<SaasAuditLog>>(`/organizations/${orgId}/audit-logs${buildQuery(params)}`),

  updateOrganization: (
    orgId: string,
    body: { name?: string; industry?: string; website?: string; billingEmail?: string }
  ) =>
    request<{
      success: boolean;
      message: string;
      data: SaasOrganization;
      organizations: SaasOrganization[];
    }>(`/organizations/${orgId}`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    })
};

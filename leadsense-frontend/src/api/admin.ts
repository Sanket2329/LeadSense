import { apiClient } from './client';

// ─── Tenant ───────────────────────────────────────────────────────────────────
export interface TenantResponse {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateTenantRequest {
  name: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────
export interface AdminUserResponse {
  id: string;
  tenantId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
}

export interface CreateUserRequest {
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: string;
}

// ─── Plan ─────────────────────────────────────────────────────────────────────
export interface PlanResponse {
  id: string;
  name: string;
  tier: 'Free' | 'Pro' | 'Enterprise';
  maxUsers: number;
  maxLeads: number;
  pricePerMonth: number;
}

export interface SubscriptionResponse {
  id: string;
  tenantId: string;
  plan: PlanResponse;
  status: 'Active' | 'PastDue' | 'Cancelled' | 'Trialing';
  startedAt: string;
  endsAt: string | null;
}

export interface AssignPlanRequest {
  tenantId: string;
  planId: string;
}

export const adminApi = {
  // ── Tenants ─────────────────────────────────────────────────────────────────
  getTenants: async (): Promise<TenantResponse[]> => {
    const { data } = await apiClient.get<TenantResponse[]>('/api/tenants');
    return data;
  },

  createTenant: async (req: CreateTenantRequest): Promise<{ id: string }> => {
    const { data } = await apiClient.post<{ id: string }>('/api/tenants', req);
    return data;
  },

  // ── Users ────────────────────────────────────────────────────────────────────
  getUsers: async (): Promise<AdminUserResponse[]> => {
    const { data } = await apiClient.get<AdminUserResponse[]>('/api/users');
    return data;
  },

  createUser: async (req: CreateUserRequest): Promise<{ id: string }> => {
    const { data } = await apiClient.post<{ id: string }>('/api/users', req);
    return data;
  },

  // ── Plans ─────────────────────────────────────────────────────────────────────
  getPlans: async (): Promise<PlanResponse[]> => {
    const { data } = await apiClient.get<PlanResponse[]>('/api/plans');
    return data;
  },

  // ── Subscriptions ──────────────────────────────────────────────────────────
  getSubscriptions: async (): Promise<SubscriptionResponse[]> => {
    const { data } = await apiClient.get<SubscriptionResponse[]>('/api/subscriptions');
    return data;
  },

  assignPlan: async (req: AssignPlanRequest): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>('/api/subscriptions', req);
    return data;
  },
};

// ─── Seeded Role IDs (deterministic — match RoleIds.cs constants) ─────────────
export const ROLE_IDS = {
  SuperAdmin:  '00000000-0000-0000-0000-000000000001',
  TenantAdmin: '00000000-0000-0000-0000-000000000002',
  User:        '00000000-0000-0000-0000-000000000003',
} as const;

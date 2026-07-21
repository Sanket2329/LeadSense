import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  adminApi,
  type CreateTenantRequest,
  type CreateUserRequest,
  type AssignPlanRequest,
} from '../api/admin';

export const TENANTS_KEY       = ['admin-tenants']       as const;
export const ADMIN_USERS_KEY   = ['admin-users']         as const;
export const PLANS_KEY         = ['admin-plans']         as const;
export const SUBSCRIPTIONS_KEY = ['admin-subscriptions'] as const;

export function useTenants()       { return useQuery({ queryKey: TENANTS_KEY,       queryFn: adminApi.getTenants       }); }
export function useAdminUsers()    { return useQuery({ queryKey: ADMIN_USERS_KEY,   queryFn: adminApi.getUsers         }); }
export function usePlans()         { return useQuery({ queryKey: PLANS_KEY,         queryFn: adminApi.getPlans         }); }
export function useSubscriptions() { return useQuery({ queryKey: SUBSCRIPTIONS_KEY, queryFn: adminApi.getSubscriptions }); }

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateTenantRequest) => adminApi.createTenant(req),
    onSuccess: () => { qc.invalidateQueries({ queryKey: TENANTS_KEY }); toast.success('Tenant created'); },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCreateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateUserRequest) => adminApi.createUser(req),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ADMIN_USERS_KEY }); toast.success('User created'); },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useAssignPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: AssignPlanRequest) => adminApi.assignPlan(req),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY });
      toast.success(data.message);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

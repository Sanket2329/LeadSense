import { apiClient } from './client';
import type {
  LeadResponse,
  CreateLeadResponse,
  CreateLeadCommand,
  UpdateLeadCommand,
  UpdateLeadStatusCommand,
} from '../types';

export const leadsApi = {
  // GET /api/leads
  getAll: async (): Promise<LeadResponse[]> => {
    const { data } = await apiClient.get<LeadResponse[]>('/api/leads');
    return data;
  },

  // GET /api/leads/mine
  getMine: async (): Promise<LeadResponse[]> => {
    const { data } = await apiClient.get<LeadResponse[]>('/api/leads/mine');
    return data;
  },

  // POST /api/leads
  create: async (command: CreateLeadCommand): Promise<CreateLeadResponse> => {
    const { data } = await apiClient.post<CreateLeadResponse>('/api/leads', command);
    return data;
  },

  // PUT /api/leads/{id}
  update: async (id: string, command: UpdateLeadCommand): Promise<void> => {
    await apiClient.put(`/api/leads/${id}`, command);
  },

  // PUT /api/leads/{id}/status
  updateStatus: async (id: string, command: UpdateLeadStatusCommand): Promise<void> => {
    await apiClient.put(`/api/leads/${id}/status`, command);
  },

  // PUT /api/leads/{id}/assign
  assign: async (id: string, assignedToUserId: string | null): Promise<void> => {
    await apiClient.put(`/api/leads/${id}/assign`, { assignedToUserId });
  },

  // DELETE /api/leads/{id}
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/leads/${id}`);
  },
};

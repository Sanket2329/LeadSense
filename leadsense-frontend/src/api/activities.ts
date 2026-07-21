import { apiClient } from './client';
import type {
  LeadActivityResponse,
  LeadActivityDetailResponse,
  OverdueActivityResponse,
  ActivityStatsResponse,
  CreateLeadActivityCommand,
  RescheduleLeadActivityRequest,
  UpdateLeadActivityNotesRequest,
} from '../types';

export const activitiesApi = {
  // GET /api/leads/{leadId}/activities
  getByLead: async (leadId: string): Promise<LeadActivityResponse[]> => {
    const { data } = await apiClient.get<LeadActivityResponse[]>(
      `/api/leads/${leadId}/activities`
    );
    return data;
  },

  // GET /api/leads/{leadId}/activities/{activityId}
  getById: async (
    leadId: string,
    activityId: string
  ): Promise<LeadActivityDetailResponse> => {
    const { data } = await apiClient.get<LeadActivityDetailResponse>(
      `/api/leads/${leadId}/activities/${activityId}`
    );
    return data;
  },

  // POST /api/leads/{leadId}/activities
  create: async (
    leadId: string,
    command: CreateLeadActivityCommand
  ): Promise<string> => {
    const { data } = await apiClient.post<string>(
      `/api/leads/${leadId}/activities`,
      command
    );
    return data;
  },

  // PUT /api/leads/{leadId}/activities/{activityId}/complete
  complete: async (leadId: string, activityId: string): Promise<void> => {
    await apiClient.put(
      `/api/leads/${leadId}/activities/${activityId}/complete`
    );
  },

  // PUT /api/leads/{leadId}/activities/{activityId}/cancel
  cancel: async (leadId: string, activityId: string): Promise<void> => {
    await apiClient.put(
      `/api/leads/${leadId}/activities/${activityId}/cancel`
    );
  },

  // PUT /api/leads/{leadId}/activities/{activityId}/reschedule
  reschedule: async (
    leadId: string,
    activityId: string,
    request: RescheduleLeadActivityRequest
  ): Promise<void> => {
    await apiClient.put(
      `/api/leads/${leadId}/activities/${activityId}/reschedule`,
      request
    );
  },

  // PUT /api/leads/{leadId}/activities/{activityId}/notes
  updateNotes: async (
    leadId: string,
    activityId: string,
    request: UpdateLeadActivityNotesRequest
  ): Promise<void> => {
    await apiClient.put(
      `/api/leads/${leadId}/activities/${activityId}/notes`,
      request
    );
  },

  // GET /api/leads/activities/overdue
  getOverdue: async (): Promise<OverdueActivityResponse[]> => {
    const { data } = await apiClient.get<OverdueActivityResponse[]>(
      '/api/leads/activities/overdue'
    );
    return data;
  },

  // GET /api/leads/activities/stats
  getStats: async (): Promise<ActivityStatsResponse> => {
    const { data } = await apiClient.get<ActivityStatsResponse>(
      '/api/leads/activities/stats'
    );
    return data;
  },
};

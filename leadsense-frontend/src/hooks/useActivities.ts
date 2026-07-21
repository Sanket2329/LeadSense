import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { activitiesApi } from '../api/activities';
import type {
  CreateLeadActivityCommand,
  RescheduleLeadActivityRequest,
  UpdateLeadActivityNotesRequest,
} from '../types';

export const STATS_KEY = ['activity-stats'] as const;
export const OVERDUE_KEY = ['overdue-activities'] as const;
export const activityKey = (leadId: string) => ['activities', leadId] as const;

export function useActivityStats() {
  return useQuery({
    queryKey: STATS_KEY,
    queryFn: activitiesApi.getStats,
  });
}

export function useOverdueActivities() {
  return useQuery({
    queryKey: OVERDUE_KEY,
    queryFn: activitiesApi.getOverdue,
  });
}

export function useLeadActivities(leadId: string) {
  return useQuery({
    queryKey: activityKey(leadId),
    queryFn: () => activitiesApi.getByLead(leadId),
    enabled: !!leadId,
  });
}

export function useActivityById(leadId: string, activityId: string) {
  return useQuery({
    queryKey: ['activity', leadId, activityId],
    queryFn: () => activitiesApi.getById(leadId, activityId),
    enabled: !!leadId && !!activityId,
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, command }: { leadId: string; command: CreateLeadActivityCommand }) =>
      activitiesApi.create(leadId, command),
    onSuccess: (_data, { leadId }) => {
      qc.invalidateQueries({ queryKey: activityKey(leadId) });
      qc.invalidateQueries({ queryKey: STATS_KEY });
      qc.invalidateQueries({ queryKey: OVERDUE_KEY });
      toast.success('Activity created');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCompleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, activityId }: { leadId: string; activityId: string }) =>
      activitiesApi.complete(leadId, activityId),
    onSuccess: (_data, { leadId }) => {
      qc.invalidateQueries({ queryKey: activityKey(leadId) });
      qc.invalidateQueries({ queryKey: STATS_KEY });
      qc.invalidateQueries({ queryKey: OVERDUE_KEY });
      toast.success('Activity marked as completed');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCancelActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, activityId }: { leadId: string; activityId: string }) =>
      activitiesApi.cancel(leadId, activityId),
    onSuccess: (_data, { leadId }) => {
      qc.invalidateQueries({ queryKey: activityKey(leadId) });
      qc.invalidateQueries({ queryKey: STATS_KEY });
      qc.invalidateQueries({ queryKey: OVERDUE_KEY });
      toast.success('Activity cancelled');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRescheduleActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      leadId,
      activityId,
      request,
    }: {
      leadId: string;
      activityId: string;
      request: RescheduleLeadActivityRequest;
    }) => activitiesApi.reschedule(leadId, activityId, request),
    onSuccess: (_data, { leadId }) => {
      qc.invalidateQueries({ queryKey: activityKey(leadId) });
      qc.invalidateQueries({ queryKey: STATS_KEY });
      qc.invalidateQueries({ queryKey: OVERDUE_KEY });
      toast.success('Activity rescheduled');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateActivityNotes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      leadId,
      activityId,
      request,
    }: {
      leadId: string;
      activityId: string;
      request: UpdateLeadActivityNotesRequest;
    }) => activitiesApi.updateNotes(leadId, activityId, request),
    onSuccess: (_data, { leadId }) => {
      qc.invalidateQueries({ queryKey: activityKey(leadId) });
      toast.success('Notes updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

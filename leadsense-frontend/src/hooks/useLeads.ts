import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { leadsApi } from '../api/leads';
import type { CreateLeadCommand, UpdateLeadCommand, UpdateLeadStatusCommand } from '../types';

export const LEADS_KEY    = ['leads']    as const;
export const MY_LEADS_KEY = ['my-leads'] as const;

export function useLeads() {
  return useQuery({
    queryKey: LEADS_KEY,
    queryFn:  leadsApi.getAll,
  });
}

export function useMyLeads() {
  return useQuery({
    queryKey: MY_LEADS_KEY,
    queryFn:  leadsApi.getMine,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (command: CreateLeadCommand) => leadsApi.create(command),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LEADS_KEY });
      toast.success('Lead created successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, command }: { id: string; command: UpdateLeadCommand }) =>
      leadsApi.update(id, command),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LEADS_KEY });
      toast.success('Lead updated successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, command }: { id: string; command: UpdateLeadStatusCommand }) =>
      leadsApi.updateStatus(id, command),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LEADS_KEY });
      toast.success('Status updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useAssignLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string | null }) =>
      leadsApi.assign(id, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LEADS_KEY });
      qc.invalidateQueries({ queryKey: MY_LEADS_KEY });
      toast.success('Lead assigned');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LEADS_KEY });
      qc.invalidateQueries({ queryKey: MY_LEADS_KEY });
      toast.success('Lead deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

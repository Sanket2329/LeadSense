import { useQuery } from '@tanstack/react-query';
import { auditLogsApi } from '../api/auditlogs';

export const AUDIT_LOGS_KEY = ['audit-logs'] as const;

export function useAuditLogs() {
  return useQuery({
    queryKey: AUDIT_LOGS_KEY,
    queryFn: auditLogsApi.getAll,
  });
}

export function useAuditLogsByEntity(entityId: string, entityType: string) {
  return useQuery({
    queryKey: ['audit-logs', entityId, entityType],
    queryFn: () => auditLogsApi.getByEntity(entityId, entityType),
    enabled: !!entityId && !!entityType,
  });
}

import { apiClient } from './client';

export interface AuditLogResponse {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  performedByUserId: string;
  performedByEmail: string;
  tenantId: string;
  occurredAt: string;
  details: string | null;
}

export const auditLogsApi = {
  // GET /api/auditlogs
  getAll: async (): Promise<AuditLogResponse[]> => {
    const { data } = await apiClient.get<AuditLogResponse[]>('/api/auditlogs');
    return data;
  },

  // GET /api/auditlogs/{entityId}?entityType=Lead
  getByEntity: async (entityId: string, entityType: string): Promise<AuditLogResponse[]> => {
    const { data } = await apiClient.get<AuditLogResponse[]>(
      `/api/auditlogs/${entityId}`,
      { params: { entityType } }
    );
    return data;
  },
};

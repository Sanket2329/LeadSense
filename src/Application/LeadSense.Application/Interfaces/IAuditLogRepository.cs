using LeadSense.Domain.Entities;
using LeadSense.Domain.Enums;

namespace LeadSense.Application.Interfaces;

public interface IAuditLogRepository
{
    Task AddAsync(AuditLog log, CancellationToken cancellationToken);

    Task<List<AuditLog>> GetByTenantAsync(
        Guid tenantId,
        CancellationToken cancellationToken);

    Task<List<AuditLog>> GetByEntityAsync(
        Guid tenantId,
        string entityType,
        Guid entityId,
        CancellationToken cancellationToken);
}

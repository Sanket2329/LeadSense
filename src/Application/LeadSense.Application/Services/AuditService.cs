using LeadSense.Application.Interfaces;
using LeadSense.Domain.Entities;
using LeadSense.Domain.Enums;

namespace LeadSense.Application.Services;

public sealed class AuditService
{
    private readonly IAuditLogRepository _repository;

    public AuditService(IAuditLogRepository repository)
    {
        _repository = repository;
    }

    public Task RecordAsync(
        Guid tenantId,
        Guid? userId,
        AuditAction action,
        string entityType,
        Guid entityId,
        string? details = null,
        CancellationToken cancellationToken = default)
    {
        var log = AuditLog.Create(tenantId, userId, action, entityType, entityId, details);
        return _repository.AddAsync(log, cancellationToken);
    }
}

using LeadSense.Domain.Enums;

namespace LeadSense.Application.UseCases.AuditLogs;

public sealed record GetAuditLogResponse(
    Guid Id,
    Guid TenantId,
    Guid? UserId,
    AuditAction Action,
    string ActionName,
    string EntityType,
    Guid EntityId,
    string? Details,
    DateTimeOffset CreatedAt);

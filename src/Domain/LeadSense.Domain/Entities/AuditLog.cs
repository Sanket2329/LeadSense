using LeadSense.Domain.Common;
using LeadSense.Domain.Enums;

namespace LeadSense.Domain.Entities;

public sealed class AuditLog : Entity
{
    public Guid TenantId { get; private set; }

    /// <summary>The user who performed the action (null for system actions).</summary>
    public Guid? UserId { get; private set; }

    public AuditAction Action { get; private set; }

    /// <summary>Type of the entity affected, e.g. "Lead", "LeadActivity".</summary>
    public string EntityType { get; private set; } = default!;

    /// <summary>Id of the affected entity.</summary>
    public Guid EntityId { get; private set; }

    /// <summary>Optional JSON snapshot or human-readable description of the change.</summary>
    public string? Details { get; private set; }

    private AuditLog(
        Guid tenantId,
        Guid? userId,
        AuditAction action,
        string entityType,
        Guid entityId,
        string? details)
    {
        TenantId = tenantId;
        UserId = userId;
        Action = action;
        EntityType = entityType;
        EntityId = entityId;
        Details = details;
    }

    public static AuditLog Create(
        Guid tenantId,
        Guid? userId,
        AuditAction action,
        string entityType,
        Guid entityId,
        string? details = null)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("TenantId is required.");

        if (string.IsNullOrWhiteSpace(entityType))
            throw new ArgumentException("EntityType is required.");

        return new AuditLog(tenantId, userId, action, entityType, entityId, details);
    }
}

using LeadSense.Domain.Common;
using LeadSense.Domain.Enums;

namespace LeadSense.Domain.Entities;

public sealed class Invitation : Entity
{
    public Guid TenantId { get; private set; }

    /// <summary>The tenant admin who sent the invitation.</summary>
    public Guid InvitedByUserId { get; private set; }

    public string Email { get; private set; } = default!;

    /// <summary>
    /// The Role that will be assigned to the user when they accept.
    /// Stored as RoleId (FK to Roles table) — database-driven RBAC.
    /// </summary>
    public Guid RoleId { get; private set; }

    public string Token { get; private set; } = default!;

    public InvitationStatus Status { get; private set; }

    public DateTimeOffset ExpiresAt { get; private set; }

    private Invitation(
        Guid tenantId,
        Guid invitedByUserId,
        string email,
        Guid roleId,
        string token,
        DateTimeOffset expiresAt)
    {
        TenantId = tenantId;
        InvitedByUserId = invitedByUserId;
        Email = email;
        RoleId = roleId;
        Token = token;
        Status = InvitationStatus.Pending;
        ExpiresAt = expiresAt;
    }

    public static Invitation Create(
        Guid tenantId,
        Guid invitedByUserId,
        string email,
        Guid roleId,
        TimeSpan? expiryDuration = null)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("TenantId is required.");

        if (invitedByUserId == Guid.Empty)
            throw new ArgumentException("InvitedByUserId is required.");

        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email is required.");

        if (roleId == Guid.Empty)
            throw new ArgumentException("RoleId is required.");

        var token = Guid.NewGuid().ToString("N");
        var expiresAt = DateTimeOffset.UtcNow.Add(expiryDuration ?? TimeSpan.FromDays(7));

        return new Invitation(tenantId, invitedByUserId, email, roleId, token, expiresAt);
    }

    public void Accept()
    {
        EnsureNotExpired();

        if (Status != InvitationStatus.Pending)
            throw new InvalidOperationException(
                $"Invitation cannot be accepted — current status: {Status}.");

        Status = InvitationStatus.Accepted;
        MarkAsUpdated();
    }

    public void Reject()
    {
        EnsureNotExpired();

        if (Status != InvitationStatus.Pending)
            throw new InvalidOperationException(
                $"Invitation cannot be rejected — current status: {Status}.");

        Status = InvitationStatus.Rejected;
        MarkAsUpdated();
    }

    public bool IsExpired() => DateTimeOffset.UtcNow > ExpiresAt;

    private void EnsureNotExpired()
    {
        if (IsExpired())
        {
            Status = InvitationStatus.Expired;
            MarkAsUpdated();
            throw new InvalidOperationException("Invitation has expired.");
        }
    }
}

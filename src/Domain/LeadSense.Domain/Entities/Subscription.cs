using LeadSense.Domain.Common;
using LeadSense.Domain.Enums;

namespace LeadSense.Domain.Entities;

public sealed class Subscription : Entity
{
    public Guid TenantId { get; private set; }

    public Guid PlanId { get; private set; }

    public Plan Plan { get; private set; } = default!;

    public SubscriptionStatus Status { get; private set; }

    public DateTimeOffset StartedAt { get; private set; }

    public DateTimeOffset? EndsAt { get; private set; }

    private Subscription(
        Guid tenantId,
        Guid planId,
        SubscriptionStatus status,
        DateTimeOffset startedAt,
        DateTimeOffset? endsAt)
    {
        TenantId = tenantId;
        PlanId = planId;
        Status = status;
        StartedAt = startedAt;
        EndsAt = endsAt;
    }

    public static Subscription Create(
        Guid tenantId,
        Guid planId)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("TenantId is required.");

        if (planId == Guid.Empty)
            throw new ArgumentException("PlanId is required.");

        return new Subscription(
            tenantId,
            planId,
            SubscriptionStatus.Active,
            startedAt: DateTimeOffset.UtcNow,
            endsAt: null);
    }

    public void Cancel(DateTimeOffset endsAt)
    {
        if (Status == SubscriptionStatus.Cancelled)
            throw new InvalidOperationException("Subscription already cancelled.");

        Status = SubscriptionStatus.Cancelled;
        EndsAt = endsAt;
        MarkAsUpdated();
    }

    public void Upgrade(Guid newPlanId)
    {
        PlanId = newPlanId;
        Status = SubscriptionStatus.Active;
        MarkAsUpdated();
    }

    public bool IsActive() =>
        Status == SubscriptionStatus.Active || Status == SubscriptionStatus.Trialing;
}

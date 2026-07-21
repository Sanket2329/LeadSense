using LeadSense.Domain.Entities;

namespace LeadSense.Application.Interfaces;

public interface ISubscriptionRepository
{
    Task AddAsync(Subscription subscription, CancellationToken cancellationToken);

    /// <summary>Returns the current active subscription for a tenant, including the Plan.</summary>
    Task<Subscription?> GetActiveByTenantAsync(Guid tenantId, CancellationToken cancellationToken);

    /// <summary>Returns all subscriptions across all tenants (SuperAdmin only).</summary>
    Task<List<Subscription>> GetAllAsync(CancellationToken cancellationToken);

    Task<bool> UpdateAsync(Subscription subscription, CancellationToken cancellationToken);
}

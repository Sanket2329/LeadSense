using LeadSense.Application.Interfaces;
using LeadSense.Domain.Entities;
using LeadSense.Domain.Enums;
using LeadSense.Infrastructure.Repository.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LeadSense.Infrastructure.Repository.Repositories;

public sealed class SubscriptionRepository : ISubscriptionRepository
{
    private readonly LeadSenseDbContext _dbContext;

    public SubscriptionRepository(LeadSenseDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(
        Subscription subscription,
        CancellationToken cancellationToken)
    {
        await _dbContext.Subscriptions.AddAsync(subscription, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<Subscription?> GetActiveByTenantAsync(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Subscriptions
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(
                s => s.TenantId == tenantId &&
                     (s.Status == SubscriptionStatus.Active ||
                      s.Status == SubscriptionStatus.Trialing),
                cancellationToken);
    }

    public async Task<List<Subscription>> GetAllAsync(
        CancellationToken cancellationToken)
    {
        return await _dbContext.Subscriptions
            .Include(s => s.Plan)
            .OrderByDescending(s => s.StartedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> UpdateAsync(
        Subscription subscription,
        CancellationToken cancellationToken)
    {
        var exists = await _dbContext.Subscriptions
            .AnyAsync(s => s.Id == subscription.Id, cancellationToken);

        if (!exists) return false;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}

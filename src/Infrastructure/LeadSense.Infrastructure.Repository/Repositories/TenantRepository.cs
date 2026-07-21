using LeadSense.Domain.Entities;
using LeadSense.Infrastructure.Repository.Persistence;
using LeadSense.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LeadSense.Infrastructure.Repository.Repositories;

public sealed class TenantRepository : ITenantRepository
{
    private readonly LeadSenseDbContext _dbContext;

    public TenantRepository(
        LeadSenseDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(
        Tenant tenant,
        CancellationToken cancellationToken)
    {
        await _dbContext.Tenants.AddAsync(
            tenant,
            cancellationToken);

        await _dbContext.SaveChangesAsync(
            cancellationToken);
    }

    public async Task<List<Tenant>> GetAllAsync(
        CancellationToken cancellationToken)
    {
        return await _dbContext.Tenants
            .ToListAsync(cancellationToken);
    }
}
using LeadSense.Application.Interfaces;
using LeadSense.Domain.Entities;
using LeadSense.Infrastructure.Repository.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LeadSense.Infrastructure.Repository.Repositories;

public sealed class AuditLogRepository : IAuditLogRepository
{
    private readonly LeadSenseDbContext _dbContext;

    public AuditLogRepository(LeadSenseDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(
        AuditLog log,
        CancellationToken cancellationToken)
    {
        await _dbContext.AuditLogs.AddAsync(log, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<AuditLog>> GetByTenantAsync(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        return await _dbContext.AuditLogs
            .Where(x => x.TenantId == tenantId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<AuditLog>> GetByEntityAsync(
        Guid tenantId,
        string entityType,
        Guid entityId,
        CancellationToken cancellationToken)
    {
        return await _dbContext.AuditLogs
            .Where(x =>
                x.TenantId == tenantId &&
                x.EntityType == entityType &&
                x.EntityId == entityId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}

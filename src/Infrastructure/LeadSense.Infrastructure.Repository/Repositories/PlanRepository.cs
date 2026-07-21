using LeadSense.Application.Interfaces;
using LeadSense.Domain.Entities;
using LeadSense.Infrastructure.Repository.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LeadSense.Infrastructure.Repository.Repositories;

public sealed class PlanRepository : IPlanRepository
{
    private readonly LeadSenseDbContext _dbContext;

    public PlanRepository(LeadSenseDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Plan?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Plans
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<List<Plan>> GetAllAsync(
        CancellationToken cancellationToken)
    {
        return await _dbContext.Plans.ToListAsync(cancellationToken);
    }
}

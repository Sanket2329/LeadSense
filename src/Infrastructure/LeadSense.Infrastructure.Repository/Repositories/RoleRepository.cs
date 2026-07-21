using LeadSense.Application.Interfaces;
using LeadSense.Domain.Entities;
using LeadSense.Infrastructure.Repository.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LeadSense.Infrastructure.Repository.Repositories;

public sealed class RoleRepository : IRoleRepository
{
    private readonly LeadSenseDbContext _dbContext;

    public RoleRepository(LeadSenseDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Role?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Roles
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<Role?> GetByNameAsync(
        string name,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Roles
            .FirstOrDefaultAsync(r => r.Name == name, cancellationToken);
    }

    public async Task<List<Role>> GetAllAsync(
        CancellationToken cancellationToken)
    {
        return await _dbContext.Roles.ToListAsync(cancellationToken);
    }
}

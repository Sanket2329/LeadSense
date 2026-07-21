using LeadSense.Domain.Entities;
using LeadSense.Infrastructure.Repository.Persistence;
using LeadSense.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LeadSense.Infrastructure.Repository.Repositories;

public sealed class UserRepository : IUserRepository
{
    private readonly LeadSenseDbContext _dbContext;

    public UserRepository(LeadSenseDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(
        User user,
        CancellationToken cancellationToken)
    {
        await _dbContext.Users.AddAsync(user, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<User>> GetAllAsync(
        CancellationToken cancellationToken)
    {
        return await _dbContext.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<User>> GetAllByTenantAsync(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Users
            .Where(x => x.TenantId == tenantId)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .ToListAsync(cancellationToken);
    }

    public async Task<User?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<bool> ExistsByEmailAsync(
        string email,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Users
            .AnyAsync(x => x.Email == email, cancellationToken);
    }

    /// <summary>Loads user with roles — used for login and JWT generation.</summary>
    public async Task<User?> GetByEmailAsync(
        string email,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(x => x.Email == email, cancellationToken);
    }
}

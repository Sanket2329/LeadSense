using LeadSense.Application.Interfaces;
using LeadSense.Domain.Entities;
using LeadSense.Infrastructure.Repository.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LeadSense.Infrastructure.Repository.Repositories;

public sealed class UserRoleRepository : IUserRoleRepository
{
    private readonly LeadSenseDbContext _dbContext;

    public UserRoleRepository(LeadSenseDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AssignRoleAsync(
        Guid userId,
        Guid roleId,
        CancellationToken cancellationToken)
    {
        var alreadyAssigned = await _dbContext.UserRoles
            .AnyAsync(ur => ur.UserId == userId && ur.RoleId == roleId, cancellationToken);

        if (alreadyAssigned) return;

        var userRole = UserRole.Create(userId, roleId);
        await _dbContext.UserRoles.AddAsync(userRole, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveRoleAsync(
        Guid userId,
        Guid roleId,
        CancellationToken cancellationToken)
    {
        var userRole = await _dbContext.UserRoles
            .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == roleId, cancellationToken);

        if (userRole is null) return;

        _dbContext.UserRoles.Remove(userRole);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<UserRole>> GetUserRolesAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        return await _dbContext.UserRoles
            .Include(ur => ur.Role)
            .Where(ur => ur.UserId == userId)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> HasRoleAsync(
        Guid userId,
        Guid roleId,
        CancellationToken cancellationToken)
    {
        return await _dbContext.UserRoles
            .AnyAsync(ur => ur.UserId == userId && ur.RoleId == roleId, cancellationToken);
    }
}

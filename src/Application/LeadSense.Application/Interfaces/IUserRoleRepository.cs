using LeadSense.Domain.Entities;

namespace LeadSense.Application.Interfaces;

public interface IUserRoleRepository
{
    Task AssignRoleAsync(Guid userId, Guid roleId, CancellationToken cancellationToken);

    Task RemoveRoleAsync(Guid userId, Guid roleId, CancellationToken cancellationToken);

    Task<List<UserRole>> GetUserRolesAsync(Guid userId, CancellationToken cancellationToken);

    Task<bool> HasRoleAsync(Guid userId, Guid roleId, CancellationToken cancellationToken);
}

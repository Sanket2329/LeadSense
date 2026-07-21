using LeadSense.Domain.Entities;

namespace LeadSense.Application.Interfaces;

public interface IUserRepository
{
    Task AddAsync(User user, CancellationToken cancellationToken);

    Task<List<User>> GetAllAsync(CancellationToken cancellationToken);

    Task<List<User>> GetAllByTenantAsync(
        Guid tenantId,
        CancellationToken cancellationToken);

    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken);

    /// <summary>Loads the user with UserRoles → Role navigations included (needed for JWT generation).</summary>
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken);
}

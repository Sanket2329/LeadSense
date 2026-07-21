using LeadSense.Domain.Entities;

namespace LeadSense.Application.Interfaces;

public interface IRoleRepository
{
    Task<Role?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<Role?> GetByNameAsync(string name, CancellationToken cancellationToken);

    Task<List<Role>> GetAllAsync(CancellationToken cancellationToken);
}

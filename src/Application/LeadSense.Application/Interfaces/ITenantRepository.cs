using LeadSense.Domain.Entities;

namespace LeadSense.Application.Interfaces;

public interface ITenantRepository
{
    Task AddAsync(
        Tenant tenant,
        CancellationToken cancellationToken);

    Task<List<Tenant>> GetAllAsync(
        CancellationToken cancellationToken);
}
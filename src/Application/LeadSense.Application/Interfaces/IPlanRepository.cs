using LeadSense.Domain.Entities;

namespace LeadSense.Application.Interfaces;

public interface IPlanRepository
{
    Task<Plan?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<List<Plan>> GetAllAsync(CancellationToken cancellationToken);
}

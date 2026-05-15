using LeadSense.Domain.Entities;

namespace LeaseSense.Application.Interfaces;

public interface ILeadRepository
{
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken);

    Task AddAsync(Lead lead, CancellationToken cancellationToken);
}

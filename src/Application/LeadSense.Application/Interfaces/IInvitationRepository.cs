using LeadSense.Domain.Entities;

namespace LeadSense.Application.Interfaces;

public interface IInvitationRepository
{
    Task AddAsync(Invitation invitation, CancellationToken cancellationToken);

    Task<Invitation?> GetByTokenAsync(string token, CancellationToken cancellationToken);

    Task<Invitation?> GetPendingByEmailAndTenantAsync(
        Guid tenantId,
        string email,
        CancellationToken cancellationToken);

    Task<bool> UpdateAsync(Invitation invitation, CancellationToken cancellationToken);
}

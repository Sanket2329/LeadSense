using LeadSense.Application.Interfaces;
using LeadSense.Domain.Entities;
using LeadSense.Domain.Enums;
using LeadSense.Infrastructure.Repository.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LeadSense.Infrastructure.Repository.Repositories;

public sealed class InvitationRepository : IInvitationRepository
{
    private readonly LeadSenseDbContext _dbContext;

    public InvitationRepository(LeadSenseDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(
        Invitation invitation,
        CancellationToken cancellationToken)
    {
        await _dbContext.Invitations.AddAsync(invitation, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<Invitation?> GetByTokenAsync(
        string token,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Invitations
            .FirstOrDefaultAsync(x => x.Token == token, cancellationToken);
    }

    public async Task<Invitation?> GetPendingByEmailAndTenantAsync(
        Guid tenantId,
        string email,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Invitations
            .FirstOrDefaultAsync(
                x => x.TenantId == tenantId &&
                     x.Email == email &&
                     x.Status == InvitationStatus.Pending,
                cancellationToken);
    }

    public async Task<bool> UpdateAsync(
        Invitation invitation,
        CancellationToken cancellationToken)
    {
        var exists = await _dbContext.Invitations
            .AnyAsync(x => x.Id == invitation.Id, cancellationToken);

        if (!exists) return false;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}

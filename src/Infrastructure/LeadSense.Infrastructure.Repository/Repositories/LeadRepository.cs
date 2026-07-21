using LeadSense.Application.Interfaces;
using LeadSense.Domain.Enums;
using LeadSense.Domain.Entities;
using LeadSense.Infrastructure.Repository.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LeadSense.Infrastructure.Repository.Repositories;

public class LeadRepository : ILeadRepository
{
    private readonly LeadSenseDbContext _dbContext;

    public LeadRepository(LeadSenseDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(
        Lead lead,
        CancellationToken cancellationToken)
    {
        await _dbContext.Leads.AddAsync(lead, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> ExistsByEmailAsync(
        Guid tenantId,
        string email,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Leads
            .AnyAsync(
                x => x.TenantId == tenantId &&
                     x.Email == email,
                CancellationToken.None);
    }

    public async Task<List<Lead>> GetAllAsync(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Leads
            .Where(x => x.TenantId == tenantId)
            .ToListAsync(CancellationToken.None);
    }

    public async Task<Lead?> GetByIdAsync(
        Guid tenantId,
        Guid id,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Leads
            .Include(x => x.FollowUps)
            .FirstOrDefaultAsync(
                x => x.Id == id &&
                     x.TenantId == tenantId,
                CancellationToken.None);
    }

    public async Task<bool> UpdateAsync(
        Lead lead,
        CancellationToken cancellationToken)
    {
        var exists = await _dbContext.Leads
            .AnyAsync(x => x.Id == lead.Id, CancellationToken.None);

        if (!exists)
            return false;

        foreach (var activity in lead.FollowUps)
        {
            if (_dbContext.Entry(activity).State == EntityState.Detached)
            {
                await _dbContext.LeadActivities.AddAsync(activity, cancellationToken);
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<bool> DeleteAsync(
        Guid tenantId,
        Guid id,
        CancellationToken cancellationToken)
    {
        var lead = await _dbContext.Leads
            .FirstOrDefaultAsync(
                x => x.Id == id &&
                     x.TenantId == tenantId,
                CancellationToken.None);

        if (lead is null)
            return false;

        _dbContext.Leads.Remove(lead);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<bool> UpdateLeadActivityNotesAsync(
        Guid tenantId,
        Guid leadId,
        Guid activityId,
        string notes,
        CancellationToken cancellationToken)
    {
        var activity = await _dbContext.LeadActivities
            .Include(a => a.Lead)  // need to verify tenant
            .FirstOrDefaultAsync(
                x => x.LeadId == leadId &&
                     x.Id == activityId &&
                     x.Lead!.TenantId == tenantId,
                CancellationToken.None);

        if (activity is null)
            return false;

        activity.UpdateNotes(notes);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<LeadActivity?> GetActivityByIdAsync(
        Guid tenantId,
        Guid leadId,
        Guid activityId,
        CancellationToken cancellationToken)
    {
        return await _dbContext.LeadActivities
            .Include(a => a.Lead)
            .FirstOrDefaultAsync(
                x => x.LeadId == leadId &&
                     x.Id == activityId &&
                     x.Lead!.TenantId == tenantId,
                CancellationToken.None);
    }

    public async Task<List<LeadActivity>> GetOverdueActivitiesAsync(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        return await _dbContext.LeadActivities
            .Include(a => a.Lead)
            .Where(x =>
                x.Lead!.TenantId == tenantId &&
                x.Status == ActivityStatus.Pending &&
                x.ScheduledFor.HasValue &&
                x.ScheduledFor.Value < DateTimeOffset.UtcNow)
            .ToListAsync(CancellationToken.None);
    }

    public async Task<List<LeadActivity>> GetAllActivitiesAsync(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        return await _dbContext.LeadActivities
            .Include(a => a.Lead)
            .Where(x => x.Lead!.TenantId == tenantId)
            .ToListAsync(CancellationToken.None);
    }
    public async Task<int> GetLeadCountAsync(
    Guid tenantId,
    CancellationToken cancellationToken)
    {
        return await _dbContext.Leads
            .CountAsync(
                x => x.TenantId == tenantId,
                cancellationToken);
    }

    public async Task<int> GetActivityCountAsync(
    Guid tenantId,
    CancellationToken cancellationToken)
    {
        return await _dbContext.LeadActivities
            .Include(x => x.Lead)
            .CountAsync(
                x => x.Lead!.TenantId == tenantId,
                cancellationToken);
    }

    public async Task<int> GetLeadCountByStatusAsync(
        Guid tenantId,
        LeadStatus status,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Leads
            .CountAsync(
                x =>
                    x.TenantId == tenantId &&
                    x.Status == status,
                cancellationToken);
    }
    public async Task<int> GetOverdueActivityCountAsync(
    Guid tenantId,
    CancellationToken cancellationToken)
    {
        return await _dbContext.LeadActivities
            .Include(x => x.Lead)
            .CountAsync(
                x =>
                    x.Lead!.TenantId == tenantId &&
                    x.ScheduledFor < DateTimeOffset.UtcNow &&
                    x.Status == ActivityStatus.Pending,
                cancellationToken);
    }

    public async Task<List<Lead>> GetByAssignedUserAsync(
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Leads
            .Where(x => x.TenantId == tenantId && x.AssignedToUserId == userId)
            .ToListAsync(CancellationToken.None);
    }
}

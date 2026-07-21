using LeadSense.Domain.Entities;
using LeadSense.Domain.Enums;

namespace LeadSense.Application.Interfaces;

public interface ILeadRepository
{
    Task<bool> ExistsByEmailAsync(
        Guid tenantId,
        string email,
        CancellationToken cancellationToken);

    Task AddAsync(Lead lead, CancellationToken cancellationToken);

    Task<List<Lead>> GetAllAsync(
        Guid tenantId,
        CancellationToken cancellationToken);

    Task<Lead?> GetByIdAsync(
        Guid tenantId,
        Guid id,
        CancellationToken cancellationToken);

    Task<bool> UpdateAsync(Lead lead, CancellationToken cancellationToken);

    Task<bool> DeleteAsync(
        Guid tenantId,
        Guid id,
        CancellationToken cancellationToken);

    Task<bool> UpdateLeadActivityNotesAsync(
        Guid tenantId,
        Guid leadId,
        Guid activityId,
        string notes,
        CancellationToken cancellationToken);

    Task<LeadActivity?> GetActivityByIdAsync(
        Guid tenantId,
        Guid leadId,
        Guid activityId,
        CancellationToken cancellationToken);

    Task<List<LeadActivity>> GetOverdueActivitiesAsync(
        Guid tenantId,
        CancellationToken cancellationToken);

    Task<List<LeadActivity>> GetAllActivitiesAsync(
        Guid tenantId,
        CancellationToken cancellationToken);

    Task<int> GetLeadCountAsync(
    Guid tenantId,
    CancellationToken cancellationToken);

    Task<int> GetLeadCountByStatusAsync(
        Guid tenantId,
        LeadStatus status,
        CancellationToken cancellationToken);

    Task<int> GetActivityCountAsync(
        Guid tenantId,
        CancellationToken cancellationToken);

    Task<int> GetOverdueActivityCountAsync(
        Guid tenantId,
        CancellationToken cancellationToken);

    Task<List<Lead>> GetByAssignedUserAsync(
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken);
}

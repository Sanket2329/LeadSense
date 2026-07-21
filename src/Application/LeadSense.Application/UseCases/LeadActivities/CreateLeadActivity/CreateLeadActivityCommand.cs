using LeadSense.Domain.Enums;

namespace LeadSense.Application.UseCases.LeadActivities.CreateLeadActivity;

public sealed record CreateLeadActivityCommand(
    Guid TenantId,
    Guid LeadId,
    ActivityType Type,
    string Notes,
    DateTimeOffset? ScheduledFor);

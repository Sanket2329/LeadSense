namespace LeadSense.Application.UseCases.LeadActivities;

public sealed record RescheduleLeadActivityCommand(
    Guid TenantId,
    Guid LeadId,
    Guid ActivityId,
    DateTimeOffset ScheduledFor);

namespace LeadSense.Application.UseCases.LeadActivities;

public sealed record CancelLeadActivityCommand(
    Guid TenantId,
    Guid LeadId,
    Guid ActivityId);

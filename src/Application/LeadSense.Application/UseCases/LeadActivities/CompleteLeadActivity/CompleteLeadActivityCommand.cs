namespace LeadSense.Application.UseCases.LeadActivities;

public sealed record CompleteLeadActivityCommand(
    Guid TenantId,
    Guid LeadId,
    Guid ActivityId);

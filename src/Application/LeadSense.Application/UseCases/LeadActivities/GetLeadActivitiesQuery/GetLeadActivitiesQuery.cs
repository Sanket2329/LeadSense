namespace LeadSense.Application.UseCases.LeadActivities;

public sealed record GetLeadActivitiesQuery(
    Guid TenantId,
    Guid LeadId);

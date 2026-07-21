namespace LeadSense.Application.UseCases.LeadActivities.GetLeadActivityById;

public record GetLeadActivityByIdQuery(
    Guid TenantId,
    Guid LeadId,
    Guid ActivityId);

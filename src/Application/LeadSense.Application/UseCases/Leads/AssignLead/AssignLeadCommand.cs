namespace LeadSense.Application.UseCases.Leads.AssignLead;

public sealed record AssignLeadCommand(
    Guid TenantId,
    Guid LeadId,
    /// <summary>Null = unassign the lead.</summary>
    Guid? AssignedToUserId);

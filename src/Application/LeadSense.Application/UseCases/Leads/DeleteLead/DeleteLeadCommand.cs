namespace LeadSense.Application.UseCases.Leads.DeleteLead;

public sealed record DeleteLeadCommand(
    Guid TenantId,
    Guid Id);

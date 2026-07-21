namespace LeadSense.Application.UseCases.Leads.GetMyLeads;

public sealed record GetMyLeadsQuery(Guid TenantId, Guid UserId);

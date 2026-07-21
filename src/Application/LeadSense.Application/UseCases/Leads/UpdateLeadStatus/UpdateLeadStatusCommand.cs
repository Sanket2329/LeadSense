using LeadSense.Domain.Enums;

namespace LeadSense.Application.UseCases.Leads.UpdateLeadStatus;

public sealed record UpdateLeadStatusCommand(
    Guid TenantId,
    Guid Id,
    LeadStatus Status);

using LeadSense.Domain.Enums;

namespace LeadSense.Application.UseCases.Leads.CreateLead;

public sealed record CreateLeadCommand(
    Guid TenantId,
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    LeadSource Source,
    string? CompanyName = null,
    string? Notes = null);

using LeadSense.Domain.Enums;

namespace LeaseSense.Application.UseCases.Leads.CreateLead;

public sealed record CreateLeadCommand(
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    LeadSource Source,
    string? CompanyName,
    string? Notes);

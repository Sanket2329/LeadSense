using LeadSense.Domain.Enums;

namespace LeadSense.Application.UseCases.Leads.GetLeads;

public sealed record GetLeadResponse(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    LeadStatus Status,
    LeadSource Source,
    Guid? AssignedToUserId);

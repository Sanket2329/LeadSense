using LeadSense.Domain.Enums;

namespace LeadSense.Api.Requests;

public sealed record CreateLeadRequest(
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    LeadSource Source,
    string? CompanyName = null,
    string? Notes = null);
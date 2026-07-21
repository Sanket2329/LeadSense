namespace LeadSense.Application.UseCases.Leads.UpdateLead;

public sealed record UpdateLeadCommand(
    Guid TenantId,
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber);

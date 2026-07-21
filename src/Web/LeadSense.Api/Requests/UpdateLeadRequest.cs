namespace LeadSense.Api.Requests;

public sealed record UpdateLeadRequest(
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber);

namespace LeadSense.Api.Requests;

public sealed record AcceptInvitationRequest(
    string Token,
    string FirstName,
    string LastName,
    string Password);

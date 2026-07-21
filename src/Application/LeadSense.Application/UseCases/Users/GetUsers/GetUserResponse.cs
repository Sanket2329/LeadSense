namespace LeadSense.Application.UseCases.Users.GetUsers;

public sealed record GetUserResponse(
    Guid Id,
    Guid? TenantId,
    string FirstName,
    string LastName,
    string Email,
    IReadOnlyList<string> Roles);

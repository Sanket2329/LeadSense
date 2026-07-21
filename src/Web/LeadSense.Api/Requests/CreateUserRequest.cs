namespace LeadSense.Api.Requests;

public sealed record CreateUserRequest(
    Guid TenantId,
    string FirstName,
    string LastName,
    string Email,
    string Password,
    /// <summary>Role.Id from the Roles table.</summary>
    Guid RoleId);

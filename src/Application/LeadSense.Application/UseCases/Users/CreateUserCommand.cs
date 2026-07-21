namespace LeadSense.Application.UseCases.Users.CreateUser;

public sealed record CreateUserCommand(
    Guid TenantId,
    string FirstName,
    string LastName,
    string Email,
    string Password,
    /// <summary>The Role.Id (from Roles table) to assign to this user.</summary>
    Guid RoleId);

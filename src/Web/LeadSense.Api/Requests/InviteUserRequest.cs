namespace LeadSense.Api.Requests;

public sealed record InviteUserRequest(
    string Email,
    /// <summary>Role.Id from the Roles table.</summary>
    Guid RoleId);

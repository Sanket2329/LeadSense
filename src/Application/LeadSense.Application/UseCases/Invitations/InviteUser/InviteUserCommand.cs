namespace LeadSense.Application.UseCases.Invitations.InviteUser;

public sealed record InviteUserCommand(
    Guid TenantId,
    Guid InvitedByUserId,
    /// <summary>Display name of the inviter for the email body.</summary>
    string InvitedByName,
    string Email,
    Guid RoleId,
    /// <summary>Frontend base URL used to build the accept-invite link.</summary>
    string FrontendBaseUrl);

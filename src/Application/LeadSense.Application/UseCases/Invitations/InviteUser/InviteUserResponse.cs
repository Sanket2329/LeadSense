namespace LeadSense.Application.UseCases.Invitations.InviteUser;

public sealed record InviteUserResponse(
    Guid InvitationId,
    string Token,
    DateTimeOffset ExpiresAt);

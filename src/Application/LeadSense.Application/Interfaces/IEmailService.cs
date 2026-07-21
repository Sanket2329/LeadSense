namespace LeadSense.Application.Interfaces;

public interface IEmailService
{
    Task SendInvitationAsync(
        string toEmail,
        string inviteLink,
        string invitedByName,
        CancellationToken cancellationToken = default);

    Task SendPasswordResetAsync(
        string toEmail,
        string resetLink,
        CancellationToken cancellationToken = default);
}

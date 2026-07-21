using LeadSense.Application.Interfaces;
using LeadSense.Domain.Common;

namespace LeadSense.Application.UseCases.Invitations.RejectInvitation;

public sealed class RejectInvitationCommandHandler
{
    private readonly IInvitationRepository _invitationRepository;

    public RejectInvitationCommandHandler(
        IInvitationRepository invitationRepository)
    {
        _invitationRepository = invitationRepository;
    }

    public async Task<Result<bool>> Handle(
        RejectInvitationCommand command,
        CancellationToken cancellationToken)
    {
        var invitation = await _invitationRepository.GetByTokenAsync(
            command.Token,
            cancellationToken);

        if (invitation is null)
            return Result<bool>.Failure(Error.Create("Invitation not found."));

        try
        {
            invitation.Reject();
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(Error.Create(ex.Message));
        }

        await _invitationRepository.UpdateAsync(invitation, cancellationToken);

        return Result<bool>.Success(true);
    }
}

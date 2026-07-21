using LeadSense.Application.Interfaces;
using LeadSense.Domain.Common;
using LeadSense.Domain.Entities;
using LeadSense.Application.Services;
using LeadSense.Domain.Enums;

namespace LeadSense.Application.UseCases.Invitations.AcceptInvitation;

public sealed class AcceptInvitationCommandHandler
{
    private readonly IInvitationRepository _invitationRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUserRoleRepository _userRoleRepository;
    private readonly AuditService _auditService;

    public AcceptInvitationCommandHandler(
        IInvitationRepository invitationRepository,
        IUserRepository userRepository,
        IUserRoleRepository userRoleRepository,
        AuditService auditService)
    {
        _invitationRepository = invitationRepository;
        _userRepository = userRepository;
        _userRoleRepository = userRoleRepository;
        _auditService = auditService;
    }

    public async Task<Result<Guid>> Handle(
        AcceptInvitationCommand command,
        CancellationToken cancellationToken)
    {
        var invitation = await _invitationRepository.GetByTokenAsync(
            command.Token, cancellationToken);

        if (invitation is null)
            return Result<Guid>.Failure(Error.Create("Invitation not found."));

        try { invitation.Accept(); }
        catch (InvalidOperationException ex)
        {
            return Result<Guid>.Failure(Error.Create(ex.Message));
        }

        var passwordHash =BCrypt.Net.BCrypt.HashPassword(command.Password);

        var user = User.Create(
            invitation.TenantId,
            command.FirstName,
            command.LastName,
            invitation.Email,
            passwordHash);

        await _userRepository.AddAsync(
            user,
            cancellationToken);

        // Assign the role stored on the invitation
        await _userRoleRepository.AssignRoleAsync(
            user.Id, invitation.RoleId, cancellationToken);

        await _invitationRepository.UpdateAsync(invitation, cancellationToken);

        await _auditService.RecordAsync(
            tenantId: invitation.TenantId,
            userId: user.Id,
            action: AuditAction.InvitationAccepted,
            entityType: "Invitation",
            entityId: invitation.Id,
            details: $"Invitation accepted by {invitation.Email}",
            cancellationToken: cancellationToken);

        return user.Id;
    }
}

using LeadSense.Application.Interfaces;
using LeadSense.Domain.Common;
using LeadSense.Domain.Entities;
using LeadSense.Application.Services;
using LeadSense.Domain.Enums;

namespace LeadSense.Application.UseCases.Invitations.InviteUser;

public sealed class InviteUserCommandHandler
{
    private readonly IInvitationRepository _invitationRepository;
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IEmailService _emailService;
    private readonly AuditService _auditService;

    public InviteUserCommandHandler(
        IInvitationRepository invitationRepository,
        IUserRepository userRepository,
        IRoleRepository roleRepository,
        IEmailService emailService,
        AuditService auditService)
    {
        _invitationRepository = invitationRepository;
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _emailService = emailService;
        _auditService = auditService;
    }

    public async Task<Result<InviteUserResponse>> Handle(
        InviteUserCommand command,
        CancellationToken cancellationToken)
    {
        var role = await _roleRepository.GetByIdAsync(command.RoleId, cancellationToken);
        if (role is null)
            return Result<InviteUserResponse>.Failure(Error.Create("Role not found."));

        var userExists = await _userRepository.ExistsByEmailAsync(command.Email, cancellationToken);
        if (userExists)
            return Result<InviteUserResponse>.Failure(
                Error.Create("A user with this email already exists."));

        var existing = await _invitationRepository.GetPendingByEmailAndTenantAsync(
            command.TenantId, command.Email, cancellationToken);
        if (existing is not null)
            return Result<InviteUserResponse>.Failure(
                Error.Create("A pending invitation already exists for this email."));

        var invitation = Invitation.Create(
            command.TenantId,
            command.InvitedByUserId,
            command.Email,
            command.RoleId);

        await _invitationRepository.AddAsync(invitation, cancellationToken);

        // Build invite link and send the email
        var inviteLink = $"{command.FrontendBaseUrl}/accept-invite?token={invitation.Token}";
        await _emailService.SendInvitationAsync(
            invitation.Email,
            inviteLink,
            command.InvitedByName,
            cancellationToken);

        await _auditService.RecordAsync(
            tenantId: command.TenantId,
            userId: command.InvitedByUserId,
            action: AuditAction.UserInvited,
            entityType: "Invitation",
            entityId: invitation.Id,
            details: $"Invited {command.Email} as {role.Name}",
            cancellationToken: cancellationToken);

        return new InviteUserResponse(invitation.Id, invitation.Token, invitation.ExpiresAt);
    }
}

using FluentAssertions;
using LeadSense.Application.Interfaces;
using LeadSense.Application.Services;
using LeadSense.Application.UseCases.Invitations.AcceptInvitation;
using LeadSense.Application.UseCases.Invitations.InviteUser;
using LeadSense.Application.UseCases.Invitations.RejectInvitation;
using LeadSense.Domain.Entities;
using LeadSense.Domain.Enums;
using NSubstitute;
using Xunit;

namespace LeadSense.Tests.Application;

public sealed class InvitationHandlerTests
{
    private static readonly Guid TenantId    = Guid.NewGuid();
    private static readonly Guid InvitedById = Guid.NewGuid();
    private static readonly Guid RoleId      = Guid.NewGuid();
    private const string Email = "invite@test.com";

    // ── InviteUser ────────────────────────────────────────────────────────────

    [Fact]
    public async Task InviteUser_NewEmail_ReturnsSuccess()
    {
        var invitations = Substitute.For<IInvitationRepository>();
        var users       = Substitute.For<IUserRepository>();
        var roles       = Substitute.For<IRoleRepository>();
        var email       = Substitute.For<IEmailService>();
        var audit       = Substitute.For<IAuditLogRepository>();

        var role = Role.Create(RoleId, "User", "Standard user");
        roles.GetByIdAsync(RoleId, default).Returns(role);
        users.ExistsByEmailAsync(Email, default).Returns(false);
        invitations.GetPendingByEmailAndTenantAsync(TenantId, Email, default)
            .Returns((Invitation?)null);

        var sut = new InviteUserCommandHandler(
            invitations, users, roles, email, new AuditService(audit));

        var result = await sut.Handle(
            new InviteUserCommand(TenantId, InvitedById, "Admin User",
                Email, RoleId, "http://localhost:5173"),
            default);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Token.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task InviteUser_ExistingUser_ReturnsFailure()
    {
        var invitations = Substitute.For<IInvitationRepository>();
        var users       = Substitute.For<IUserRepository>();
        var roles       = Substitute.For<IRoleRepository>();
        var email       = Substitute.For<IEmailService>();
        var audit       = Substitute.For<IAuditLogRepository>();

        var role = Role.Create(RoleId, "User", "desc");
        roles.GetByIdAsync(RoleId, default).Returns(role);
        users.ExistsByEmailAsync(Email, default).Returns(true); // already exists

        var sut = new InviteUserCommandHandler(
            invitations, users, roles, email, new AuditService(audit));

        var result = await sut.Handle(
            new InviteUserCommand(TenantId, InvitedById, "Admin",
                Email, RoleId, "http://localhost:5173"),
            default);

        result.IsFailure.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message.Contains("already exists"));
    }

    [Fact]
    public async Task InviteUser_RoleNotFound_ReturnsFailure()
    {
        var invitations = Substitute.For<IInvitationRepository>();
        var users       = Substitute.For<IUserRepository>();
        var roles       = Substitute.For<IRoleRepository>();
        var email       = Substitute.For<IEmailService>();
        var audit       = Substitute.For<IAuditLogRepository>();

        roles.GetByIdAsync(RoleId, default).Returns((Role?)null);

        var sut = new InviteUserCommandHandler(
            invitations, users, roles, email, new AuditService(audit));

        var result = await sut.Handle(
            new InviteUserCommand(TenantId, InvitedById, "Admin",
                Email, RoleId, "http://localhost:5173"),
            default);

        result.IsFailure.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message.Contains("Role not found"));
    }

    // ── AcceptInvitation ──────────────────────────────────────────────────────

    [Fact]
    public async Task AcceptInvitation_ValidToken_CreatesUserAndAssignsRole()
    {
        var invitations  = Substitute.For<IInvitationRepository>();
        var users        = Substitute.For<IUserRepository>();
        var userRoles    = Substitute.For<IUserRoleRepository>();
        var audit        = Substitute.For<IAuditLogRepository>();

        var inv = Invitation.Create(TenantId, InvitedById, Email, RoleId);
        invitations.GetByTokenAsync(inv.Token, default).Returns(inv);

        var sut = new AcceptInvitationCommandHandler(
            invitations, users, userRoles, new AuditService(audit));

        var result = await sut.Handle(
            new AcceptInvitationCommand(inv.Token, "Bob", "Jones", "pw123"),
            default);

        result.IsSuccess.Should().BeTrue();
        await users.Received(1).AddAsync(Arg.Any<User>(), default);
        await userRoles.Received(1).AssignRoleAsync(Arg.Any<Guid>(), RoleId, default);
    }

    [Fact]
    public async Task AcceptInvitation_InvalidToken_ReturnsFailure()
    {
        var invitations = Substitute.For<IInvitationRepository>();
        var users       = Substitute.For<IUserRepository>();
        var userRoles   = Substitute.For<IUserRoleRepository>();
        var audit       = Substitute.For<IAuditLogRepository>();

        invitations.GetByTokenAsync(Arg.Any<string>(), default).Returns((Invitation?)null);

        var sut = new AcceptInvitationCommandHandler(
            invitations, users, userRoles, new AuditService(audit));

        var result = await sut.Handle(
            new AcceptInvitationCommand("bad-token", "A", "B", "pw"),
            default);

        result.IsFailure.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message.Contains("not found"));
    }

    // ── RejectInvitation ──────────────────────────────────────────────────────

    [Fact]
    public async Task RejectInvitation_ValidToken_SetsRejectedStatus()
    {
        var invitations = Substitute.For<IInvitationRepository>();
        var audit       = Substitute.For<IAuditLogRepository>();

        var inv = Invitation.Create(TenantId, InvitedById, Email, RoleId);
        invitations.GetByTokenAsync(inv.Token, default).Returns(inv);

        var sut = new RejectInvitationCommandHandler(invitations);

        var result = await sut.Handle(new RejectInvitationCommand(inv.Token), default);

        result.IsSuccess.Should().BeTrue();
        inv.Status.Should().Be(InvitationStatus.Rejected);
    }
}

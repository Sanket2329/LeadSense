using FluentAssertions;
using LeadSense.Domain.Entities;
using LeadSense.Domain.Enums;
using Xunit;

namespace LeadSense.Tests.Domain;

public sealed class InvitationTests
{
    private static readonly Guid TenantId       = Guid.NewGuid();
    private static readonly Guid InvitedById    = Guid.NewGuid();
    private static readonly Guid RoleId         = Guid.NewGuid();
    private const  string        Email           = "bob@test.com";

    [Fact]
    public void Create_ValidData_ReturnsInvitationWithPendingStatus()
    {
        var inv = Invitation.Create(TenantId, InvitedById, Email, RoleId);

        inv.Status.Should().Be(InvitationStatus.Pending);
        inv.Token.Should().NotBeNullOrWhiteSpace();
        inv.ExpiresAt.Should().BeAfter(DateTimeOffset.UtcNow);
    }

    [Fact]
    public void Create_EmptyTenantId_Throws()
    {
        var act = () => Invitation.Create(Guid.Empty, InvitedById, Email, RoleId);
        act.Should().Throw<ArgumentException>().WithMessage("*TenantId*");
    }

    [Fact]
    public void Create_EmptyEmail_Throws()
    {
        var act = () => Invitation.Create(TenantId, InvitedById, string.Empty, RoleId);
        act.Should().Throw<ArgumentException>().WithMessage("*Email*");
    }

    [Fact]
    public void Create_EmptyRoleId_Throws()
    {
        var act = () => Invitation.Create(TenantId, InvitedById, Email, Guid.Empty);
        act.Should().Throw<ArgumentException>().WithMessage("*RoleId*");
    }

    [Fact]
    public void Accept_PendingInvitation_SetsAcceptedStatus()
    {
        var inv = Invitation.Create(TenantId, InvitedById, Email, RoleId);
        inv.Accept();
        inv.Status.Should().Be(InvitationStatus.Accepted);
    }

    [Fact]
    public void Accept_AlreadyAccepted_Throws()
    {
        var inv = Invitation.Create(TenantId, InvitedById, Email, RoleId);
        inv.Accept();
        var again = () => inv.Accept();
        again.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Reject_PendingInvitation_SetsRejectedStatus()
    {
        var inv = Invitation.Create(TenantId, InvitedById, Email, RoleId);
        inv.Reject();
        inv.Status.Should().Be(InvitationStatus.Rejected);
    }

    [Fact]
    public void Reject_AlreadyRejected_Throws()
    {
        var inv = Invitation.Create(TenantId, InvitedById, Email, RoleId);
        inv.Reject();
        var again = () => inv.Reject();
        again.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Accept_ExpiredInvitation_Throws()
    {
        // Create with a 1-millisecond expiry, then wait it out
        var inv = Invitation.Create(TenantId, InvitedById, Email, RoleId,
            expiryDuration: TimeSpan.FromMilliseconds(1));

        Thread.Sleep(5); // let it expire

        var act = () => inv.Accept();
        act.Should().Throw<InvalidOperationException>().WithMessage("*expired*");
    }

    [Fact]
    public void IsExpired_FutureExpiry_ReturnsFalse()
    {
        var inv = Invitation.Create(TenantId, InvitedById, Email, RoleId,
            expiryDuration: TimeSpan.FromDays(7));
        inv.IsExpired().Should().BeFalse();
    }

    [Fact]
    public void IsExpired_PastExpiry_ReturnsTrue()
    {
        var inv = Invitation.Create(TenantId, InvitedById, Email, RoleId,
            expiryDuration: TimeSpan.FromMilliseconds(1));
        Thread.Sleep(5);
        inv.IsExpired().Should().BeTrue();
    }
}

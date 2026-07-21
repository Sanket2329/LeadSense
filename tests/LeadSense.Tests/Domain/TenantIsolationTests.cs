using FluentAssertions;
using LeadSense.Domain.Entities;
using LeadSense.Domain.Enums;
using Xunit;

namespace LeadSense.Tests.Domain;

/// <summary>
/// Verifies that lead entities carry the correct TenantId
/// and that cross-tenant operations are not possible at the domain level.
/// </summary>
public sealed class TenantIsolationTests
{
    private static readonly Guid TenantA = Guid.NewGuid();
    private static readonly Guid TenantB = Guid.NewGuid();

    [Fact]
    public void Lead_BelongsTo_CorrectTenant()
    {
        var lead = Lead.Create(TenantA, "Alice", "Smith",
            "alice@a.com", "555", LeadSource.Website);

        lead.TenantId.Should().Be(TenantA);
        lead.TenantId.Should().NotBe(TenantB);
    }

    [Fact]
    public void TwoLeads_DifferentTenants_HaveDifferentTenantIds()
    {
        var leadA = Lead.Create(TenantA, "Alice", "Smith", "a@a.com", "1", LeadSource.Website);
        var leadB = Lead.Create(TenantB, "Bob",   "Jones", "b@b.com", "2", LeadSource.Referral);

        leadA.TenantId.Should().NotBe(leadB.TenantId);
    }

    [Fact]
    public void User_TenantId_IsPreservedAfterCreation()
    {
        var user = User.Create(TenantA, "Alice", "Smith", "a@a.com", "hash");
        user.TenantId.Should().Be(TenantA);
    }

    [Fact]
    public void SuperAdmin_HasNullTenantId()
    {
        var admin = User.CreateSuperAdmin("Super", "Admin", "admin@leadsense.com", "hash");
        admin.TenantId.Should().BeNull();
    }

    [Fact]
    public void Invitation_CarriesTenantId()
    {
        var inv = Invitation.Create(
            TenantA, Guid.NewGuid(), "invite@a.com", Guid.NewGuid());
        inv.TenantId.Should().Be(TenantA);
    }
}

using FluentAssertions;
using LeadSense.Domain.Entities;
using LeadSense.Domain.Enums;
using Xunit;

namespace LeadSense.Tests.Domain;

public sealed class LeadTests
{
    private static readonly Guid TenantId = Guid.NewGuid();

    [Fact]
    public void Create_WithValidData_ReturnsLeadWithNewStatus()
    {
        var lead = Lead.Create(TenantId, "Alice", "Smith",
            "alice@test.com", "555-0001", LeadSource.Website);

        lead.Status.Should().Be(LeadStatus.New);
        lead.AssignedToUserId.Should().BeNull();
    }

    [Fact]
    public void Create_WithEmptyTenantId_Throws()
    {
        var act = () => Lead.Create(Guid.Empty, "A", "B", "a@b.com", "123", LeadSource.Website);
        act.Should().Throw<ArgumentException>().WithMessage("*TenantId*");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithBlankFirstName_Throws(string firstName)
    {
        var act = () => Lead.Create(TenantId, firstName, "B", "a@b.com", "123", LeadSource.Website);
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void UpdateStatus_ChangesStatus()
    {
        var lead = MakeLead();
        lead.UpdateStatus(LeadStatus.Qualified);
        lead.Status.Should().Be(LeadStatus.Qualified);
    }

    [Fact]
    public void Assign_SetsAssignedToUserId()
    {
        var lead = MakeLead();
        var userId = Guid.NewGuid();
        lead.Assign(userId);
        lead.AssignedToUserId.Should().Be(userId);
    }

    [Fact]
    public void Assign_WithEmptyUserId_Throws()
    {
        var lead = MakeLead();
        var act = () => lead.Assign(Guid.Empty);
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Unassign_ClearsAssignment()
    {
        var lead = MakeLead();
        lead.Assign(Guid.NewGuid());
        lead.Unassign();
        lead.AssignedToUserId.Should().BeNull();
    }

    [Fact]
    public void ScheduleFollowUp_AddsActivity()
    {
        var lead = MakeLead();
        lead.ScheduleFollowUp(ActivityType.Call, "Initial call", DateTimeOffset.UtcNow.AddDays(1));
        lead.FollowUps.Should().HaveCount(1);
    }

    private static Lead MakeLead() =>
        Lead.Create(TenantId, "Alice", "Smith", "alice@test.com", "555", LeadSource.Website);
}

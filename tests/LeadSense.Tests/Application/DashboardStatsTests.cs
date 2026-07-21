using FluentAssertions;
using LeadSense.Application.Interfaces;
using LeadSense.Application.UseCases.LeadActivities.GetActivityStats;
using LeadSense.Application.UseCases.LeadActivities.GetOverdueActivities;
using LeadSense.Domain.Entities;
using LeadSense.Domain.Enums;
using NSubstitute;
using Xunit;

namespace LeadSense.Tests.Application;

public sealed class DashboardStatsTests
{
    private static readonly Guid TenantId = Guid.NewGuid();
    private static readonly Guid LeadId   = Guid.NewGuid();

    // ── Activity stats ────────────────────────────────────────────────────────

    [Fact]
    public async Task GetActivityStats_ReturnsCorrectCounts()
    {
        var repo = Substitute.For<ILeadRepository>();
        var now  = DateTimeOffset.UtcNow;

        var activities = new List<LeadActivity>
        {
            // pending (not overdue) — must have a future scheduledFor so it's Pending
            MakePending(now.AddDays(1)),
            // overdue  (pending + past due)
            MakePending(now.AddDays(-1)),
            // completed — create with future date then complete
            MakeCompleted(),
            MakeCompleted(),
            // cancelled — create with future date then cancel
            MakeCancelled(),
        };

        repo.GetAllActivitiesAsync(TenantId, default).Returns(activities);

        var handler = new GetActivityStatsQueryHandler(repo);
        var result  = await handler.Handle(new GetActivityStatsQuery(TenantId), default);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Pending.Should().Be(1);
        result.Value.Overdue.Should().Be(1);
        result.Value.Completed.Should().Be(2);
        result.Value.Cancelled.Should().Be(1);
    }

    [Fact]
    public async Task GetActivityStats_NoActivities_ReturnsAllZero()
    {
        var repo = Substitute.For<ILeadRepository>();
        repo.GetAllActivitiesAsync(TenantId, default).Returns(new List<LeadActivity>());

        var handler = new GetActivityStatsQueryHandler(repo);
        var result  = await handler.Handle(new GetActivityStatsQuery(TenantId), default);

        result.Value!.Pending.Should().Be(0);
        result.Value.Overdue.Should().Be(0);
        result.Value.Completed.Should().Be(0);
        result.Value.Cancelled.Should().Be(0);
    }

    // ── Overdue activities ────────────────────────────────────────────────────

    [Fact]
    public async Task GetOverdueActivities_ReturnsTenantScopedOverdueOnly()
    {
        var repo = Substitute.For<ILeadRepository>();
        var overdueList = new List<LeadActivity>
        {
            MakePending(DateTimeOffset.UtcNow.AddDays(-2)),
            MakePending(DateTimeOffset.UtcNow.AddDays(-5)),
        };
        repo.GetOverdueActivitiesAsync(TenantId, default).Returns(overdueList);

        var handler = new GetOverdueActivitiesQueryHandler(repo);
        var result  = await handler.Handle(new GetOverdueActivitiesQuery(TenantId), default);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Should().HaveCount(2);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static LeadActivity MakePending(DateTimeOffset scheduledFor) =>
        LeadActivity.Create(LeadId, ActivityType.Call, "test note", scheduledFor);

    private static LeadActivity MakeCompleted()
    {
        var act = LeadActivity.Create(LeadId, ActivityType.Call, "test note",
            DateTimeOffset.UtcNow.AddDays(1));
        act.Complete();
        return act;
    }

    private static LeadActivity MakeCancelled()
    {
        var act = LeadActivity.Create(LeadId, ActivityType.Call, "test note",
            DateTimeOffset.UtcNow.AddDays(1));
        act.Cancel();
        return act;
    }
}

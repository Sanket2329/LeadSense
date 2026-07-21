using FluentAssertions;
using LeadSense.Domain.Entities;
using LeadSense.Domain.Enums;
using Xunit;

namespace LeadSense.Tests.Domain;

public sealed class LeadActivityTests
{
    private static readonly Guid LeadId = Guid.NewGuid();

    [Fact]
    public void Create_WithScheduledFor_StatusIsPending()
    {
        var act = LeadActivity.Create(LeadId, ActivityType.Call, "Call notes",
            DateTimeOffset.UtcNow.AddDays(1));
        act.Status.Should().Be(ActivityStatus.Pending);
        act.CompletedOn.Should().BeNull();
    }

    [Fact]
    public void Create_WithoutScheduledFor_StatusIsCompleted()
    {
        var act = LeadActivity.Create(LeadId, ActivityType.Note, "Quick note", null);
        act.Status.Should().Be(ActivityStatus.Completed);
        act.CompletedOn.Should().NotBeNull();
    }

    [Fact]
    public void Create_WithBlankNotes_Throws()
    {
        var create = () => LeadActivity.Create(LeadId, ActivityType.Call, "  ", null);
        create.Should().Throw<ArgumentException>().WithMessage("*Notes*");
    }

    [Fact]
    public void Complete_PendingActivity_SetsCompletedStatus()
    {
        var act = LeadActivity.Create(LeadId, ActivityType.Call, "notes",
            DateTimeOffset.UtcNow.AddDays(1));
        act.Complete();
        act.Status.Should().Be(ActivityStatus.Completed);
        act.CompletedOn.Should().NotBeNull();
    }

    [Fact]
    public void Complete_AlreadyCompleted_Throws()
    {
        var act = LeadActivity.Create(LeadId, ActivityType.Call, "notes",
            DateTimeOffset.UtcNow.AddDays(1));
        act.Complete();
        var again = () => act.Complete();
        again.Should().Throw<Exception>().WithMessage("*already completed*");
    }

    [Fact]
    public void Cancel_PendingActivity_SetsCancelledStatus()
    {
        var act = LeadActivity.Create(LeadId, ActivityType.Call, "notes",
            DateTimeOffset.UtcNow.AddDays(1));
        act.Cancel();
        act.Status.Should().Be(ActivityStatus.Cancelled);
    }

    [Fact]
    public void Cancel_CompletedActivity_Throws()
    {
        var act = LeadActivity.Create(LeadId, ActivityType.Call, "notes",
            DateTimeOffset.UtcNow.AddDays(1));
        act.Complete();
        var cancel = () => act.Cancel();
        cancel.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Reschedule_PendingActivity_UpdatesScheduledFor()
    {
        var act = LeadActivity.Create(LeadId, ActivityType.Call, "notes",
            DateTimeOffset.UtcNow.AddDays(1));
        var newDate = DateTimeOffset.UtcNow.AddDays(7);
        act.Reschedule(newDate);
        act.ScheduledFor.Should().Be(newDate);
    }

    [Fact]
    public void Reschedule_CompletedActivity_Throws()
    {
        var act = LeadActivity.Create(LeadId, ActivityType.Call, "notes",
            DateTimeOffset.UtcNow.AddDays(1));
        act.Complete();
        var reschedule = () => act.Reschedule(DateTimeOffset.UtcNow.AddDays(2));
        reschedule.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void UpdateNotes_ChangesNotes()
    {
        var act = LeadActivity.Create(LeadId, ActivityType.Note, "old notes", null);
        act.UpdateNotes("new notes");
        act.Notes.Should().Be("new notes");
    }
}

using LeadSense.Domain.Common;
using LeadSense.Domain.Enums;

namespace LeadSense.Domain.Entities;

public sealed class LeadActivity : Entity
{
    public Guid LeadId { get; private set; }

    // Navigation property for tenant-scoped queries
    public Lead? Lead { get; private set; }

    public ActivityType Type { get; private set; }

    public string Notes { get; private set; } = default!;

    public DateTimeOffset? ScheduledFor { get; private set; }

    public DateTimeOffset? CompletedOn { get; private set; }

    public ActivityStatus Status { get; private set; }

    private LeadActivity(
        Guid leadId,
        ActivityType type,
        string notes,
        DateTimeOffset? scheduledFor)
    {
        LeadId = leadId;
        Type = type;
        Notes = notes;
        ScheduledFor = scheduledFor;

        Status = scheduledFor.HasValue
            ? ActivityStatus.Pending
            : ActivityStatus.Completed;

        if (!scheduledFor.HasValue)
        {
            CompletedOn = DateTimeOffset.UtcNow;
        }
    }

    public static LeadActivity Create(
     Guid leadId,
     ActivityType type,
     string notes,
     DateTimeOffset? scheduledFor = null)
    {
        if (leadId == Guid.Empty)
            throw new ArgumentException(
                "LeadId is required.");

        if (string.IsNullOrWhiteSpace(notes))
            throw new ArgumentException(
                "Notes are required.");

        return new LeadActivity(
            leadId,
            type,
            notes,
            scheduledFor);
    }

    public void Complete()
    {
        if (Status == ActivityStatus.Completed)
            throw new Exception("Activity already completed.");

        if (Status == ActivityStatus.Cancelled)
            throw new Exception("Cancelled activity cannot be completed.");

        Status = ActivityStatus.Completed;
        CompletedOn = DateTimeOffset.UtcNow;

        MarkAsUpdated();
    }
    public void Cancel()
    {
        if (Status == ActivityStatus.Completed)
            throw new InvalidOperationException(
                "Completed activity cannot be cancelled.");

        if (Status == ActivityStatus.Cancelled)
            throw new InvalidOperationException(
                "Activity already cancelled.");

        Status = ActivityStatus.Cancelled;

        MarkAsUpdated();
    }
    public void Reschedule(
    DateTimeOffset scheduledFor)
    {
        if (Status == ActivityStatus.Completed)
            throw new InvalidOperationException(
                "Completed activity cannot be rescheduled.");

        if (Status == ActivityStatus.Cancelled)
            throw new InvalidOperationException(
                "Cancelled activity cannot be rescheduled.");

        ScheduledFor = scheduledFor;

        MarkAsUpdated();
    }
    public void UpdateNotes(string notes)
    {
        if (string.IsNullOrWhiteSpace(notes))
            throw new ArgumentException(
                "Notes are required.");

        Notes = notes;

        MarkAsUpdated();
    }
}

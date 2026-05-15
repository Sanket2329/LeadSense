using LeadSense.Domain.Common;
using LeadSense.Domain.Enums;

namespace LeadSense.Domain.Entities;

public sealed class LeadActivity : Entity
{
    public Guid LeadId { get; private set; }

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
}

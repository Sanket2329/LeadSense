using LeadSense.Domain.Enums;

namespace LeadSense.Application.UseCases.LeadActivities;

public sealed record LeadActivityResponse(
    Guid Id,
    ActivityType Type,
    string Notes,
    ActivityStatus Status,
    DateTimeOffset? ScheduledFor,
    DateTimeOffset? CompletedOn);
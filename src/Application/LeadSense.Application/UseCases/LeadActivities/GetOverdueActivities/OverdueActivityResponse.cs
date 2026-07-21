using LeadSense.Domain.Enums;

namespace LeadSense.Application.UseCases.LeadActivities.GetOverdueActivities;

public sealed record OverdueActivityResponse(
    Guid Id,
    ActivityType Type,
    string Notes,
    DateTimeOffset? ScheduledFor);
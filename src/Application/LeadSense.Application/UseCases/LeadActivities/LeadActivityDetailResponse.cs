using LeadSense.Domain.Enums;

namespace LeadSense.Application.UseCases.LeadActivities;

public record LeadActivityDetailResponse(
    Guid Id,
    ActivityType Type,
    string Notes,
    ActivityStatus Status,
    DateTimeOffset? ScheduledFor);
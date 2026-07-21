using LeadSense.Domain.Common;
using LeadSense.Domain.Enums;
using LeadSense.Application.Interfaces;

namespace LeadSense.Application.UseCases.LeadActivities.GetActivityStats;

public sealed class GetActivityStatsQueryHandler
{
    private readonly ILeadRepository _repository;

    public GetActivityStatsQueryHandler(
        ILeadRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<ActivityStatsResponse>> Handle(
        GetActivityStatsQuery query,
        CancellationToken cancellationToken)
    {
        var activities =
            await _repository.GetAllActivitiesAsync(
                query.TenantId,
                cancellationToken);

        var pending =
            activities.Count(x =>
                x.Status == ActivityStatus.Pending &&
                !(x.ScheduledFor.HasValue &&
                  x.ScheduledFor < DateTimeOffset.UtcNow));

        var completed =
            activities.Count(x =>
                x.Status == ActivityStatus.Completed);

        var cancelled =
            activities.Count(x =>
                x.Status == ActivityStatus.Cancelled);

        var overdue =
            activities.Count(x =>
                x.Status == ActivityStatus.Pending &&
                x.ScheduledFor.HasValue &&
                x.ScheduledFor < DateTimeOffset.UtcNow);

        return new ActivityStatsResponse(
            pending,
            completed,
            cancelled,
            overdue);
    }
}

using LeadSense.Application.Interfaces;
using LeadSense.Domain.Common;

namespace LeadSense.Application.UseCases.LeadActivities.GetLeadActivityById;

public sealed class GetLeadActivityByIdQueryHandler
{
    private readonly ILeadRepository _repository;

    public GetLeadActivityByIdQueryHandler(
        ILeadRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<LeadActivityDetailResponse>> Handle(
        GetLeadActivityByIdQuery query,
        CancellationToken cancellationToken)
    {
        var activity =
            await _repository.GetActivityByIdAsync(
                query.TenantId,
                query.LeadId,
                query.ActivityId,
                cancellationToken);

        if (activity is null)
        {
            return Result<LeadActivityDetailResponse>.Failure(
                Error.Create("Activity not found"));
        }

        return new LeadActivityDetailResponse(
            activity.Id,
            activity.Type,
            activity.Notes,
            activity.Status,
            activity.ScheduledFor);
    }
}

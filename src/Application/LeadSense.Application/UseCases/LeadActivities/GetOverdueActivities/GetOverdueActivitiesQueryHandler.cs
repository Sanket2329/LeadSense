using LeadSense.Domain.Common;
using LeadSense.Application.Interfaces;

namespace LeadSense.Application.UseCases.LeadActivities.GetOverdueActivities;

public sealed class GetOverdueActivitiesQueryHandler
{
    private readonly ILeadRepository _repository;

    public GetOverdueActivitiesQueryHandler(
        ILeadRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<OverdueActivityResponse>>> Handle(
        GetOverdueActivitiesQuery query,
        CancellationToken cancellationToken)
    {
        var activities =
            await _repository.GetOverdueActivitiesAsync(
                query.TenantId,
                cancellationToken);

        var response = activities
            .Select(x => new OverdueActivityResponse(
                x.Id,
                x.Type,
                x.Notes,
                x.ScheduledFor))
            .ToList();

        return response;
    }
}

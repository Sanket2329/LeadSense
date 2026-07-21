using LeadSense.Domain.Common;
using LeadSense.Application.Interfaces;

namespace LeadSense.Application.UseCases.LeadActivities;

public sealed class GetLeadActivitiesQueryHandler
{
    private readonly ILeadRepository _repository;

    public GetLeadActivitiesQueryHandler(ILeadRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<LeadActivityResponse>>> Handle(
        GetLeadActivitiesQuery query,
        CancellationToken cancellationToken)
    {
        var lead = await _repository.GetByIdAsync(
            query.TenantId,
            query.LeadId,
            cancellationToken);

        if (lead is null)
        {
            return Result<List<LeadActivityResponse>>.Failure(
                Error.Create("Lead not found"));
        }

        var activities = lead.FollowUps
            .Select(x => new LeadActivityResponse(
                x.Id,
                x.Type,
                x.Notes,
                x.Status,
                x.ScheduledFor,
                x.CompletedOn))
            .ToList();

        return activities;
    }
}

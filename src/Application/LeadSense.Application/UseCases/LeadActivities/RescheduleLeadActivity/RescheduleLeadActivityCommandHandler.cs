using LeadSense.Domain.Common;
using LeadSense.Application.Interfaces;

namespace LeadSense.Application.UseCases.LeadActivities;

public sealed class RescheduleLeadActivityCommandHandler
{
    private readonly ILeadRepository _repository;

    public RescheduleLeadActivityCommandHandler(ILeadRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<bool>> Handle(
        RescheduleLeadActivityCommand command,
        CancellationToken cancellationToken)
    {
        var lead = await _repository.GetByIdAsync(
            command.TenantId,
            command.LeadId,
            cancellationToken);

        if (lead is null)
        {
            return Result<bool>.Failure(
                Error.Create("Lead not found"));
        }

        var activity = lead.FollowUps
            .FirstOrDefault(x => x.Id == command.ActivityId);

        if (activity is null)
        {
            return Result<bool>.Failure(
                Error.Create("Activity not found"));
        }

        activity.Reschedule(command.ScheduledFor);

        await _repository.UpdateAsync(lead, cancellationToken);

        return Result<bool>.Success(true);
    }
}

using LeadSense.Domain.Common;
using LeadSense.Application.Interfaces;

namespace LeadSense.Application.UseCases.LeadActivities.CreateLeadActivity;

public sealed class CreateLeadActivityCommandHandler
{
    private readonly ILeadRepository _repository;

    public CreateLeadActivityCommandHandler(ILeadRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<Guid>> Handle(
        CreateLeadActivityCommand command,
        CancellationToken cancellationToken)
    {
        var lead = await _repository.GetByIdAsync(
            command.TenantId,
            command.LeadId,
            cancellationToken);

        if (lead is null)
        {
            return Result<Guid>.Failure(
                Error.Create("Lead not found"));
        }

        var activity = lead.ScheduleFollowUp(
            command.Type,
            command.Notes,
            command.ScheduledFor);

        await _repository.UpdateAsync(lead, cancellationToken);

        return activity.Id;
    }
}

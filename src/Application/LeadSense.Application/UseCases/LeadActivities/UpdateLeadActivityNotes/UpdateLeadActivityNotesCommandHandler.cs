using LeadSense.Application.Interfaces;
using LeadSense.Domain.Common;

namespace LeadSense.Application.UseCases.LeadActivities.UpdateLeadActivityNotes;

public sealed class UpdateLeadActivityNotesCommandHandler
{
    private readonly ILeadRepository _repository;

    public UpdateLeadActivityNotesCommandHandler(
        ILeadRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<bool>> Handle(
        UpdateLeadActivityNotesCommand command,
        CancellationToken cancellationToken)
    {
        var updated =
            await _repository.UpdateLeadActivityNotesAsync(
                command.TenantId,
                command.LeadId,
                command.ActivityId,
                command.Notes,
                cancellationToken);

        if (!updated)
        {
            return Result<bool>.Failure(
                new Error(
                    "activity.not.found",
                    "Activity not found"));
        }

        return Result<bool>.Success(true);
    }
}

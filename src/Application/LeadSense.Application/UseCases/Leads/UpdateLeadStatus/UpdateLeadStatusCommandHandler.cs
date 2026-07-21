using LeadSense.Domain.Common;
using LeadSense.Application.Interfaces;

namespace LeadSense.Application.UseCases.Leads.UpdateLeadStatus;

public sealed class UpdateLeadStatusCommandHandler
{
    private readonly ILeadRepository _leadRepository;

    public UpdateLeadStatusCommandHandler(ILeadRepository leadRepository)
    {
        _leadRepository = leadRepository;
    }

    public async Task<Result<bool>> Handle(
        UpdateLeadStatusCommand request,
        CancellationToken cancellationToken)
    {
        var existingLead = await _leadRepository.GetByIdAsync(
            request.TenantId,
            request.Id,
            cancellationToken);

        if (existingLead is null)
        {
            return Result<bool>.Failure(
                Error.Create("Lead not found"));
        }

        existingLead.UpdateStatus(request.Status);

        var updated = await _leadRepository.UpdateAsync(
            existingLead,
            cancellationToken);

        return updated;
    }
}

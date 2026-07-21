using LeadSense.Domain.Common;
using LeadSense.Application.Interfaces;

namespace LeadSense.Application.UseCases.Leads.UpdateLead;

public sealed class UpdateLeadCommandHandler
{
    private readonly ILeadRepository _leadRepository;

    public UpdateLeadCommandHandler(ILeadRepository leadRepository)
    {
        _leadRepository = leadRepository;
    }

    public async Task<Result<bool>> Handle(
        UpdateLeadCommand request,
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

        existingLead.Update(
            request.FirstName,
            request.LastName,
            request.Email,
            request.PhoneNumber);

        var updated = await _leadRepository.UpdateAsync(
            existingLead,
            cancellationToken);

        return updated;
    }
}

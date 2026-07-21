using LeadSense.Domain.Common;
using LeadSense.Application.Interfaces;

namespace LeadSense.Application.UseCases.Leads.DeleteLead;

public sealed class DeleteLeadCommandHandler
{
    private readonly ILeadRepository _leadRepository;

    public DeleteLeadCommandHandler(ILeadRepository leadRepository)
    {
        _leadRepository = leadRepository;
    }

    public async Task<Result<bool>> Handle(
        DeleteLeadCommand request,
        CancellationToken cancellationToken)
    {
        var deleted = await _leadRepository.DeleteAsync(
            request.TenantId,
            request.Id,
            cancellationToken);

        if (!deleted)
        {
            return Result<bool>.Failure(
                Error.Create("Lead not found"));
        }

        return true;
    }
}

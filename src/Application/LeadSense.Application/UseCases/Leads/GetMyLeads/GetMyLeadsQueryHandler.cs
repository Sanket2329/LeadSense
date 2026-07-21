using LeadSense.Application.Interfaces;
using LeadSense.Application.UseCases.Leads.GetLeads;

namespace LeadSense.Application.UseCases.Leads.GetMyLeads;

public sealed class GetMyLeadsQueryHandler
{
    private readonly ILeadRepository _leadRepository;

    public GetMyLeadsQueryHandler(ILeadRepository leadRepository)
    {
        _leadRepository = leadRepository;
    }

    public async Task<List<GetLeadResponse>> Handle(
        GetMyLeadsQuery query,
        CancellationToken cancellationToken)
    {
        var leads = await _leadRepository.GetByAssignedUserAsync(
            query.TenantId,
            query.UserId,
            cancellationToken);

        return leads
            .Select(x => new GetLeadResponse(
                x.Id,
                x.FirstName,
                x.LastName,
                x.Email,
                x.PhoneNumber,
                x.Status,
                x.Source,
                x.AssignedToUserId))
            .ToList();
    }
}

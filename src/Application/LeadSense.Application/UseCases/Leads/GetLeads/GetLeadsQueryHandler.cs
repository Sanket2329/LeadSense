using LeadSense.Application.Interfaces;

namespace LeadSense.Application.UseCases.Leads.GetLeads;

public sealed class GetLeadsQueryHandler
{
    private readonly ILeadRepository _leadRepository;

    public GetLeadsQueryHandler(ILeadRepository leadRepository)
    {
        _leadRepository = leadRepository;
    }

    public async Task<List<GetLeadResponse>> Handle(
        GetLeadsQuery query,
        CancellationToken cancellationToken)
    {
        var leads = await _leadRepository.GetAllAsync(
            query.TenantId,
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

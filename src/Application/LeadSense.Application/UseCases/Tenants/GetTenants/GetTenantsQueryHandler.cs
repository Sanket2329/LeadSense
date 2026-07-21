using LeadSense.Application.Interfaces;

namespace LeadSense.Application.UseCases.Tenants.GetTenants;

public sealed class GetTenantsQueryHandler
{
    private readonly ITenantRepository _repository;

    public GetTenantsQueryHandler(
        ITenantRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<GetTenantResponse>> Handle(
        GetTenantsQuery query,
        CancellationToken cancellationToken)
    {
        var tenants = await _repository.GetAllAsync(
            cancellationToken);

        return tenants
            .Select(x => new GetTenantResponse(
                x.Id,
                x.Name,
                x.IsActive))
            .ToList();
    }
}
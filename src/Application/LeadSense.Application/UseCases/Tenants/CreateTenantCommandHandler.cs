using LeadSense.Domain.Common;
using LeadSense.Domain.Entities;
using LeadSense.Application.Interfaces;

namespace LeadSense.Application.UseCases.Tenants.CreateTenant;

public sealed class CreateTenantCommandHandler
{
    private readonly ITenantRepository _repository;

    public CreateTenantCommandHandler(
        ITenantRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<Guid>> Handle(
        CreateTenantCommand command,
        CancellationToken cancellationToken)
    {
        var tenant = Tenant.Create(command.Name);

        await _repository.AddAsync(
            tenant,
            cancellationToken);

        return tenant.Id;
    }
}
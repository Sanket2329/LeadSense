namespace LeadSense.Application.UseCases.Tenants.GetTenants;

public sealed record GetTenantResponse(
    Guid Id,
    string Name,
    bool IsActive);
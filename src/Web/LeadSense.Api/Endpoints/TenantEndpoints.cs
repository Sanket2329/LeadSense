using LeadSense.Api.Requests;
using LeadSense.Application.UseCases.Tenants.CreateTenant;
using LeadSense.Application.UseCases.Tenants.GetTenants;

namespace LeadSense.Api.Endpoints;

public static class TenantEndpoints
{
    public static IEndpointRouteBuilder MapTenantEndpoints(
        this IEndpointRouteBuilder app)
    {
        // Only SuperAdmin can create or list tenants
        var group = app
            .MapGroup("/api/tenants")
            .RequireAuthorization("SuperAdmin");

        group.MapPost(
            "/",
            async (
                CreateTenantRequest request,
                CreateTenantCommandHandler handler,
                CancellationToken cancellationToken) =>
            {
                var result = await handler.Handle(
                    new CreateTenantCommand(request.Name),
                    cancellationToken);

                if (result.IsFailure)
                    return Results.BadRequest(result.Errors);

                return Results.Ok(new { Id = result.Value });
            })
            .WithName("CreateTenant")
            .WithSummary("Create tenant")
            .WithDescription("SuperAdmin only — creates a new tenant.");

        group.MapGet(
            "/",
            async (
                GetTenantsQueryHandler handler,
                CancellationToken cancellationToken) =>
            {
                var tenants = await handler.Handle(
                    new GetTenantsQuery(),
                    cancellationToken);

                return Results.Ok(tenants);
            })
            .WithName("GetTenants")
            .WithSummary("Get all tenants")
            .WithDescription("SuperAdmin only — returns all tenants.");

        return app;
    }
}

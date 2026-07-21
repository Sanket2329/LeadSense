using LeadSense.Api.Requests;
using LeadSense.Application.UseCases.Users.CreateUser;
using LeadSense.Application.UseCases.Users.GetUsers;
using System.Security.Claims;

namespace LeadSense.Api.Endpoints;

public static class UserEndpoints
{
    public static IEndpointRouteBuilder MapUserEndpoints(
        this IEndpointRouteBuilder app)
    {
        // TenantAdmin (or SuperAdmin) can create/list users
        var group = app
            .MapGroup("/api/users")
            .RequireAuthorization("TenantAdmin");

        group.MapPost(
            "/",
            async (
                ClaimsPrincipal caller,
                CreateUserRequest request,
                CreateUserCommandHandler handler,
                CancellationToken cancellationToken) =>
            {
                // TenantAdmin can only create users within their own tenant
                Guid tenantId;

                if (caller.HasClaim("role", "SuperAdmin"))
                {
                    // SuperAdmin explicitly supplies tenantId in the request
                    tenantId = request.TenantId;
                }
                else
                {
                    // TenantAdmin is bound to their own tenant
                    var tenantClaim = caller.FindFirst("tenantId")?.Value;
                    if (tenantClaim is null)
                        return Results.Forbid();
                    tenantId = Guid.Parse(tenantClaim);
                }

                var result = await handler.Handle(
                    new CreateUserCommand(
                        tenantId,
                        request.FirstName,
                        request.LastName,
                        request.Email,
                        request.Password,
                        request.RoleId),
                    cancellationToken);

                if (result.IsFailure)
                    return Results.BadRequest(result.Errors);

                return Results.Ok(new { Id = result.Value });
            })
            .WithName("CreateUser")
            .WithSummary("Create user")
            .WithDescription("TenantAdmin only — creates a user within the tenant.");

        group.MapGet(
            "/",
            async (
                ClaimsPrincipal caller,
                GetUsersQueryHandler handler,
                CancellationToken cancellationToken) =>
            {
                Guid? tenantId = null;
                if (!caller.HasClaim("role", "SuperAdmin"))
                {
                    var tenantClaim = caller.FindFirst("tenantId")?.Value;
                    if (tenantClaim is null)
                        return Results.Forbid();
                    tenantId = Guid.Parse(tenantClaim);
                }

                var users = await handler.Handle(
                    new GetUsersQuery(tenantId),
                    cancellationToken);

                return Results.Ok(users);
            })
            .WithName("GetUsers")
            .WithSummary("Get users")
            .WithDescription("TenantAdmin only — returns all users for the tenant.");

        return app;
    }
}

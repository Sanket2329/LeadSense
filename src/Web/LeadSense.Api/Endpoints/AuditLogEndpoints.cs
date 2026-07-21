using LeadSense.Application.UseCases.AuditLogs;
using System.Security.Claims;

namespace LeadSense.Api.Endpoints;

public static class AuditLogEndpoints
{
    public static IEndpointRouteBuilder MapAuditLogEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/api/auditlogs")
            .RequireAuthorization("TenantAdmin");

        // GET /api/auditlogs
        // Returns all audit entries for the caller's tenant, newest first
        group.MapGet(
            "/",
            async (
                ClaimsPrincipal caller,
                GetAuditLogsQueryHandler handler,
                CancellationToken cancellationToken) =>
            {
                var tenantClaim = caller.FindFirst("tenantId")?.Value;
                if (tenantClaim is null)
                    return Results.Forbid();

                var tenantId = Guid.Parse(tenantClaim);
                var logs = await handler.Handle(
                    new GetAuditLogsQuery(tenantId),
                    cancellationToken);
                return Results.Ok(logs);
            })
            .WithName("GetAuditLogs")
            .WithSummary("Get audit logs")
            .WithDescription("TenantAdmin only — returns all audit log entries for the tenant.");

        // GET /api/auditlogs/{entityId}?entityType=Lead
        // Returns audit entries for a specific entity
        group.MapGet(
            "/{entityId:guid}",
            async (
                ClaimsPrincipal caller,
                Guid entityId,
                string entityType,
                GetAuditLogsByEntityQueryHandler handler,
                CancellationToken cancellationToken) =>
            {
                var tenantClaim = caller.FindFirst("tenantId")?.Value;
                if (tenantClaim is null)
                    return Results.Forbid();

                var tenantId = Guid.Parse(tenantClaim);
                var logs = await handler.Handle(
                    new GetAuditLogsByEntityQuery(tenantId, entityType, entityId),
                    cancellationToken);
                return Results.Ok(logs);
            })
            .WithName("GetAuditLogsByEntity")
            .WithSummary("Get audit logs for entity")
            .WithDescription("TenantAdmin only — returns audit logs for a specific entity (e.g. a Lead).");

        return app;
    }
}

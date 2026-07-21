// Placeholder — dashboard stats are served via /api/leads/activities/stats
// and /api/leads/activities/overdue. This file exists to satisfy the
// RegisterEndpointsHelper registration.
namespace LeadSense.Api.Endpoints;

public static class DashboardEndpoints
{
    public static IEndpointRouteBuilder MapDashboardEndpoints(
        this IEndpointRouteBuilder app) => app;
}

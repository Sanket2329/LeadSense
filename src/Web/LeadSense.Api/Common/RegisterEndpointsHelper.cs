using LeadSense.Api.Endpoints;

namespace LeadSense.Api.Common;

public static class RegisterEndpointsHelper
{
    public static WebApplication RegisterEndpoints(this WebApplication app)
    {
        app.RegisterLeadEndpoints();
        app.MapTenantEndpoints();
        app.MapUserEndpoints();
        app.MapAuthEndpoints();
        app.MapInvitationEndpoints();
        app.MapAuditLogEndpoints();
        app.MapDashboardEndpoints();
        app.MapPlanEndpoints();

        return app;
    }
}
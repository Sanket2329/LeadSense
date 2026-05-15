using LeadSense.Api.Endpoints;

namespace LeadSense.Api.Common;

public static class RegisterEndpointsHelper
{
    public static WebApplication RegisterEndpoints(this WebApplication app)
    {
        app.RegisterLeadEndpoints();

        return app;
    }
}

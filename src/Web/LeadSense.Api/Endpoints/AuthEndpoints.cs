using LeadSense.Api.Requests;
using LeadSense.Application.UseCases.Auth.Login;
using Microsoft.AspNetCore.RateLimiting;

namespace LeadSense.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth");

        group.MapPost(
            "/login",
            async (
                LoginRequest request,
                LoginCommandHandler handler,
                CancellationToken cancellationToken) =>
            {
                var result = await handler.Handle(
                    new LoginCommand(
                        request.Email,
                        request.Password),
                    cancellationToken);

                if (result.IsFailure)
                {
                    return Results.BadRequest(
                        result.Errors);
                }

                return Results.Ok(result.Value);
            })
            .RequireRateLimiting("login");

        return app;
    }
}
using LeaseSense.Application.UseCases.Leads.CreateLead;
using Microsoft.AspNetCore.Mvc;

namespace LeadSense.Api.Endpoints;

public static class LeadEndpoints
{
    public static void RegisterLeadEndpoints(this IEndpointRouteBuilder endpointRouteBuilder)
    {
        RouteGroupBuilder leads = endpointRouteBuilder.MapGroup("/api/leads");

        leads.MapGet("/", () => "Hello");

        leads.MapPost(
            "/",
            async (
                [FromBody] CreateLeadCommand request,
                CreateLeadCommandHandler handler,
                CancellationToken cancellationToken) =>
            {
                CreateLeadResponse response = await handler.Handle(request, cancellationToken);

                return Results.Created($"/api/leads/{response.Id}", response);
            })
            .WithName("CreateLead")
            .WithSummary("Create lead")
            .WithDescription("Creates a new lead manually by salesperson.")
            .Produces<CreateLeadResponse>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest);
    }
}
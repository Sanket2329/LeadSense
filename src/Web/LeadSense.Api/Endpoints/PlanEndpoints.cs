using LeadSense.Application.Interfaces;
using LeadSense.Domain.Entities;
using System.Security.Claims;

namespace LeadSense.Api.Endpoints;

public static class PlanEndpoints
{
    public static IEndpointRouteBuilder MapPlanEndpoints(
        this IEndpointRouteBuilder app)
    {
        // ── Plans (public read — anyone authenticated can list plans) ─────────

        var plans = app.MapGroup("/api/plans").RequireAuthorization();

        // GET /api/plans
        plans.MapGet("/", async (
            IPlanRepository repo,
            CancellationToken ct) =>
        {
            var all = await repo.GetAllAsync(ct);
            return Results.Ok(all.Select(p => new
            {
                p.Id,
                p.Name,
                Tier          = p.Tier.ToString(),
                p.MaxUsers,
                p.MaxLeads,
                p.PricePerMonth
            }));
        })
        .WithName("GetPlans")
        .WithSummary("Get all plans")
        .WithDescription("Returns all available plans.");

        // ── Subscriptions (SuperAdmin only) ───────────────────────────────────

        var subs = app
            .MapGroup("/api/subscriptions")
            .RequireAuthorization("SuperAdmin");

        // GET /api/subscriptions — all subscriptions across all tenants
        subs.MapGet("/", async (
            ISubscriptionRepository repo,
            CancellationToken ct) =>
        {
            var all = await repo.GetAllAsync(ct);
            return Results.Ok(all.Select(s => new
            {
                s.Id,
                s.TenantId,
                Plan          = new { s.Plan.Id, s.Plan.Name, Tier = s.Plan.Tier.ToString(), s.Plan.MaxUsers, s.Plan.MaxLeads, s.Plan.PricePerMonth },
                Status        = s.Status.ToString(),
                s.StartedAt,
                s.EndsAt
            }));
        })
        .WithName("GetSubscriptions")
        .WithSummary("Get all subscriptions")
        .WithDescription("SuperAdmin only — returns all tenant subscriptions.");

        // POST /api/subscriptions — assign a plan to a tenant
        subs.MapPost("/", async (
            AssignPlanRequest request,
            IPlanRepository planRepo,
            ISubscriptionRepository subRepo,
            CancellationToken ct) =>
        {
            var plan = await planRepo.GetByIdAsync(request.PlanId, ct);
            if (plan is null)
                return Results.BadRequest(new[] { new { code = "plan.not.found", message = "Plan not found." } });

            var existing = await subRepo.GetActiveByTenantAsync(request.TenantId, ct);
            if (existing is not null)
            {
                existing.Upgrade(request.PlanId);
                await subRepo.UpdateAsync(existing, ct);
                return Results.Ok(new { message = $"Tenant upgraded to {plan.Name} plan." });
            }

            var subscription = Subscription.Create(request.TenantId, request.PlanId);
            await subRepo.AddAsync(subscription, ct);
            return Results.Created($"/api/subscriptions/{subscription.Id}",
                new { subscription.Id, message = $"Tenant assigned to {plan.Name} plan." });
        })
        .WithName("AssignPlan")
        .WithSummary("Assign plan to tenant")
        .WithDescription("SuperAdmin only — assigns or upgrades a tenant's subscription plan.");

        return app;
    }
}

public sealed record AssignPlanRequest(Guid TenantId, Guid PlanId);

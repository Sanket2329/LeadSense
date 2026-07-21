using LeadSense.Domain.Entities;
using LeadSense.Domain.Enums;
using LeadSense.Infrastructure.Repository.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace LeadSense.Infrastructure.Repository.Common;

public static class PlanSeeder
{
    // Deterministic plan IDs so they're stable across environments
    public static readonly Guid FreePlanId       = new("10000000-0000-0000-0000-000000000001");
    public static readonly Guid ProPlanId        = new("10000000-0000-0000-0000-000000000002");
    public static readonly Guid EnterprisePlanId = new("10000000-0000-0000-0000-000000000003");

    private static readonly (Guid Id, string Name, PlanTier Tier, int MaxUsers, int MaxLeads, decimal Price)[] SeedPlans =
    [
        (FreePlanId,       "Free",       PlanTier.Free,       3,              100,            0m),
        (ProPlanId,        "Pro",        PlanTier.Pro,        20,             5_000,          49m),
        (EnterprisePlanId, "Enterprise", PlanTier.Enterprise, int.MaxValue,   int.MaxValue,   199m),
    ];

    public static async Task SeedAsync(
        LeadSenseDbContext db,
        ILogger logger,
        CancellationToken ct = default)
    {
        foreach (var (id, name, tier, maxUsers, maxLeads, price) in SeedPlans)
        {
            var exists = await db.Plans.AnyAsync(p => p.Id == id, ct);
            if (exists) continue;

            var plan = Plan.Create(name, tier, maxUsers, maxLeads, price);

            // Set deterministic Id via reflection (EF creates it, domain sets random)
            typeof(Domain.Common.Entity)
                .GetProperty("Id")!
                .SetValue(plan, id);

            await db.Plans.AddAsync(plan, ct);
            logger.LogInformation("Seeded plan: {PlanName} (${Price}/mo)", name, price);
        }

        await db.SaveChangesAsync(ct);
    }
}

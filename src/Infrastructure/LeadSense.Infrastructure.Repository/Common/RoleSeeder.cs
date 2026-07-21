using LeadSense.Domain.Constants;
using LeadSense.Domain.Entities;
using LeadSense.Infrastructure.Repository.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace LeadSense.Infrastructure.Repository.Common;

public static class RoleSeeder
{
    private static readonly (Guid Id, string Name, string Description)[] SeedRoles =
    [
        (RoleIds.SuperAdmin,  "SuperAdmin",  "Full system access — manages tenants and platform configuration."),
        (RoleIds.TenantAdmin, "TenantAdmin", "Manages users and settings within a single tenant."),
        (RoleIds.User,        "User",        "Standard user — manages leads and activities within a tenant."),
    ];

    public static async Task SeedAsync(
        LeadSenseDbContext db,
        ILogger logger,
        CancellationToken ct = default)
    {
        foreach (var (id, name, description) in SeedRoles)
        {
            var exists = await db.Roles.AnyAsync(r => r.Id == id, ct);
            if (exists) continue;

            var role = Role.Create(id, name, description);
            await db.Roles.AddAsync(role, ct);
            logger.LogInformation("Seeded role: {RoleName}", name);
        }

        await db.SaveChangesAsync(ct);
    }
}

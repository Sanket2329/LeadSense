using LeadSense.Domain.Constants;
using LeadSense.Domain.Entities;
using LeadSense.Infrastructure.Repository.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;

namespace LeadSense.Infrastructure.Repository.Common;

public static class SuperAdminSeeder
{
    private const string SuperAdminEmail = "admin@leadsense.com";

    public static async Task SeedAsync(
        LeadSenseDbContext db,
        ILogger logger,
        CancellationToken ct = default)
    {
        // Check if SuperAdmin already exists
        var superAdminRoleId = RoleIds.SuperAdmin;

        var alreadyExists = await db.UserRoles
            .AnyAsync(ur => ur.RoleId == superAdminRoleId, ct);

        if (alreadyExists) return;

        // Generate a secure random password
        var plainPassword = GenerateSecurePassword();
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(plainPassword);

        var superAdmin = User.CreateSuperAdmin(
            firstName:    "Super",
            lastName:     "Admin",
            email:        SuperAdminEmail,
            passwordHash: passwordHash);

        await db.Users.AddAsync(superAdmin, ct);
        await db.SaveChangesAsync(ct); // persist so we have the Id

        // Assign SuperAdmin role
        var userRole = UserRole.Create(superAdmin.Id, superAdminRoleId);
        await db.UserRoles.AddAsync(userRole, ct);
        await db.SaveChangesAsync(ct);

        // Log credentials to console — only shown once, never stored in plain text
        logger.LogWarning(
            "╔══════════════════════════════════════════╗\n" +
            "║       SUPER ADMIN CREDENTIALS            ║\n" +
            "║  Email   : {Email,-32}  ║\n" +
            "║  Password: {Password,-32}  ║\n" +
            "║  Save this password — it will not be     ║\n" +
            "║  shown again.                            ║\n" +
            "╚══════════════════════════════════════════╝",
            SuperAdminEmail,
            plainPassword);
    }

    // ── Helpers 

    private static string GenerateSecurePassword(int length = 16)
    {
        const string upper   = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const string lower   = "abcdefghjkmnpqrstuvwxyz";
        const string digits  = "23456789";
        const string special = "!@#$%^&*";
        const string all     = upper + lower + digits + special;

        var password = new char[length];

        // Guarantee at least one of each class
        password[0] = upper[RandomNumberGenerator.GetInt32(upper.Length)];
        password[1] = lower[RandomNumberGenerator.GetInt32(lower.Length)];
        password[2] = digits[RandomNumberGenerator.GetInt32(digits.Length)];
        password[3] = special[RandomNumberGenerator.GetInt32(special.Length)];

        for (int i = 4; i < length; i++)
            password[i] = all[RandomNumberGenerator.GetInt32(all.Length)];

        // Shuffle to avoid predictable prefix
        RandomNumberGenerator.Shuffle(password.AsSpan());

        return new string(password);
    }
}

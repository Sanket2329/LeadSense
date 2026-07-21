using LeadSense.Domain.Entities;
using Microsoft.EntityFrameworkCore;

// Disambiguate — our UserRole join entity vs the old enum
using UserRoleEntity = LeadSense.Domain.Entities.UserRole;

namespace LeadSense.Infrastructure.Repository.Persistence;

public sealed class LeadSenseDbContext : DbContext
{
    public LeadSenseDbContext(
        DbContextOptions<LeadSenseDbContext> options)
        : base(options)
    {
    }

    // ── Core ──────────────────────────────────────────────────────────────────
    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<LeadActivity> LeadActivities => Set<LeadActivity>();
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<User> Users => Set<User>();

    // ── RBAC ─────────────────────────────────────────────────────────────────
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRoleEntity> UserRoles => Set<UserRoleEntity>();

    // ── Invitations ───────────────────────────────────────────────────────────
    public DbSet<Invitation> Invitations => Set<Invitation>();

    // ── Plans & Subscriptions ─────────────────────────────────────────────────
    public DbSet<Plan> Plans => Set<Plan>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();

    // ── Audit ─────────────────────────────────────────────────────────────────
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ── Lead → LeadActivity ───────────────────────────────────────────────
        modelBuilder.Entity<Lead>()
            .HasMany(x => x.FollowUps)
            .WithOne(a => a.Lead)
            .HasForeignKey(x => x.LeadId);

        // ── RBAC: User ↔ Role (many-to-many via UserRole join table) ─────────
        modelBuilder.Entity<UserRoleEntity>(ur =>
        {
            // Composite PK
            ur.HasKey(x => new { x.UserId, x.RoleId });

            ur.HasOne(x => x.User)
              .WithMany(u => u.UserRoles)
              .HasForeignKey(x => x.UserId)
              .OnDelete(DeleteBehavior.Cascade);

            ur.HasOne(x => x.Role)
              .WithMany(r => r.UserRoles)
              .HasForeignKey(x => x.RoleId)
              .OnDelete(DeleteBehavior.Cascade);

            ur.HasIndex(x => x.UserId);
            ur.HasIndex(x => x.RoleId);
        });

        modelBuilder.Entity<Role>(r =>
        {
            r.HasIndex(x => x.Name).IsUnique();
        });

        // User.TenantId is nullable (SuperAdmin has no tenant)
        modelBuilder.Entity<User>()
            .Property(u => u.TenantId)
            .IsRequired(false);

        // ── Subscription → Plan ───────────────────────────────────────────────
        modelBuilder.Entity<Subscription>()
            .HasOne(s => s.Plan)
            .WithMany()
            .HasForeignKey(s => s.PlanId)
            .OnDelete(DeleteBehavior.Restrict);

        // ── Invitations ───────────────────────────────────────────────────────
        modelBuilder.Entity<Invitation>()
            .HasIndex(i => i.Token)
            .IsUnique();

        // ── AuditLog indexes ──────────────────────────────────────────────────
        modelBuilder.Entity<AuditLog>()
            .HasIndex(a => new { a.TenantId, a.CreatedAt });

        modelBuilder.Entity<AuditLog>()
            .HasIndex(a => new { a.TenantId, a.EntityType, a.EntityId });

        base.OnModelCreating(modelBuilder);
    }
}

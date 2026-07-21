using LeadSense.Application.Interfaces;
using LeadSense.Application.Services;
using LeadSense.Infrastructure.Repository.Authentication;
using LeadSense.Infrastructure.Repository.Email;
using LeadSense.Infrastructure.Repository.Persistence;
using LeadSense.Infrastructure.Repository.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LeadSense.Infrastructure.Repository;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // ── Database ──────────────────────────────────────────────────────────
        services.AddDbContext<LeadSenseDbContext>(options =>
        {
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"));
        });

        // ── Repositories ──────────────────────────────────────────────────────
        services.AddScoped<ILeadRepository, LeadRepository>();
        services.AddScoped<ITenantRepository, TenantRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IUserRoleRepository, UserRoleRepository>();
        services.AddScoped<IInvitationRepository, InvitationRepository>();
        services.AddScoped<IPlanRepository, PlanRepository>();
        services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();
        services.AddScoped<IAuditLogRepository, AuditLogRepository>();

        // ── Application services ──────────────────────────────────────────────
        services.AddScoped<AuditService>();

        // ── Email (Resend) ────────────────────────────────────────────────────
        services.Configure<ResendOptions>(configuration.GetSection("Resend"));
        services.AddHttpClient<IEmailService, ResendEmailService>();

        // ── JWT ───────────────────────────────────────────────────────────────
        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));
        services.AddScoped<IJwtService, JwtService>();

        return services;
    }
}

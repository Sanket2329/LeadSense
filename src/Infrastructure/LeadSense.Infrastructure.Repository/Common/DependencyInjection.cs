using LeadSense.Infrastructure.Repository.Repositories;
using LeadSense.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace LeadSense.Infrastructure.Repository.Common;

public static class DependencyInjection
{
    public static IServiceCollection AddRepository(this IServiceCollection services)
    {
        services.AddScoped<ILeadRepository, LeadRepository>();

        return services;
    }
}

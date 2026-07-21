using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace LeadSense.Application.Common;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationLayer(this IServiceCollection services)
    {
        RegisterHandlers(services);

        return services;
    }

    private static void RegisterHandlers(IServiceCollection services)
    {
        List<Type> handlerTypes = Assembly.GetExecutingAssembly().GetTypes()
                    .Where(type => type.Name.EndsWith("Handler")
                                    && !type.Name.EndsWith("EventHandler")
                                    && !type.IsAbstract
                                    && !type.IsInterface)
                    .ToList();

        foreach (Type? handlerType in handlerTypes)
        {
            services.AddTransient(handlerType);
        }
    }

}

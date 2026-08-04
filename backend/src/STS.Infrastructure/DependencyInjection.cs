using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using STS.Application.Auth;
using STS.Application.Availability;
using STS.Application.Leads;
using STS.Infrastructure.Configuration;
using STS.Infrastructure.Persistence;
using STS.Infrastructure.Services;

namespace STS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, string repositoryRoot)
    {
        EnvFile.LoadFrom(repositoryRoot);
        services.AddDbContext<StsDbContext>(options => options.UseSqlite(DatabasePath.ResolveSqliteConnection(repositoryRoot)));
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IAvailabilityService, AvailabilityService>();
        services.AddScoped<ILeadService, LeadService>();
        return services;
    }
}

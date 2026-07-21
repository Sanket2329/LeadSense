using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace LeadSense.Infrastructure.Repository.Persistence;

public sealed class LeadSenseDbContextFactory
    : IDesignTimeDbContextFactory<LeadSenseDbContext>
{
    public LeadSenseDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder =
            new DbContextOptionsBuilder<LeadSenseDbContext>();

        optionsBuilder.UseNpgsql(
            "Host=localhost;Port=5432;Database=LeadSenseDb;Username=postgres;Password=123ser");

        return new LeadSenseDbContext(
            optionsBuilder.Options);
    }
}
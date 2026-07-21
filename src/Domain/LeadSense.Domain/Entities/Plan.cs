using LeadSense.Domain.Common;
using LeadSense.Domain.Enums;

namespace LeadSense.Domain.Entities;

public sealed class Plan : Entity
{
    public string Name { get; private set; } = default!;

    public PlanTier Tier { get; private set; }

    public int MaxUsers { get; private set; }

    public int MaxLeads { get; private set; }

    public decimal PricePerMonth { get; private set; }

    private Plan(
        string name,
        PlanTier tier,
        int maxUsers,
        int maxLeads,
        decimal pricePerMonth)
    {
        Name = name;
        Tier = tier;
        MaxUsers = maxUsers;
        MaxLeads = maxLeads;
        PricePerMonth = pricePerMonth;
    }

    public static Plan Create(
        string name,
        PlanTier tier,
        int maxUsers,
        int maxLeads,
        decimal pricePerMonth)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Plan name is required.");

        if (maxUsers <= 0)
            throw new ArgumentException("MaxUsers must be greater than 0.");

        if (maxLeads <= 0)
            throw new ArgumentException("MaxLeads must be greater than 0.");

        return new Plan(name, tier, maxUsers, maxLeads, pricePerMonth);
    }

    /// <summary>Well-known seed plans.</summary>
    public static Plan Free() =>
        Create("Free", PlanTier.Free, maxUsers: 3, maxLeads: 100, pricePerMonth: 0m);

    public static Plan Pro() =>
        Create("Pro", PlanTier.Pro, maxUsers: 20, maxLeads: 5000, pricePerMonth: 49m);

    public static Plan Enterprise() =>
        Create("Enterprise", PlanTier.Enterprise, maxUsers: int.MaxValue, maxLeads: int.MaxValue, pricePerMonth: 199m);
}

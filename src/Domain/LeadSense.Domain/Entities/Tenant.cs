using LeadSense.Domain.Common;

namespace LeadSense.Domain.Entities;

public sealed class Tenant : Entity
{
    public string Name { get; private set; } = default!;

    public bool IsActive { get; private set; }

    private Tenant(string name)
    {
        Name = name;
        IsActive = true;
    }

    public static Tenant Create(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Tenant name is required.");

        return new Tenant(name);
    }

    public void Disable()
    {
        IsActive = false;
        MarkAsUpdated();
    }
}
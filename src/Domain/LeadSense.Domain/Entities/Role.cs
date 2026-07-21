using LeadSense.Domain.Common;

namespace LeadSense.Domain.Entities;

public sealed class Role : Entity
{
    public string Name { get; private set; } = default!;

    public string Description { get; private set; } = default!;

    // Navigation
    private readonly List<UserRole> _userRoles = [];
    public IReadOnlyCollection<UserRole> UserRoles => _userRoles;

    private Role(string name, string description)
    {
        Name = name;
        Description = description;
    }

    /// <summary>Used by EF Core and seeders — sets a deterministic Id.</summary>
    public static Role Create(Guid id, string name, string description)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Role name is required.");

        return new Role(name, description) { Id = id };
    }
}

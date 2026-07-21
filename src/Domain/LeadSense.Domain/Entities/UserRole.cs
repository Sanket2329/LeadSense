namespace LeadSense.Domain.Entities;

/// <summary>
/// Join entity for the User ↔ Role many-to-many relationship.
/// Primary key is composite (UserId, RoleId).
/// </summary>
public sealed class UserRole
{
    public Guid UserId { get; private set; }
    public Guid RoleId { get; private set; }

    // Navigations
    public User User { get; private set; } = default!;
    public Role Role { get; private set; } = default!;

    private UserRole() { }

    public static UserRole Create(Guid userId, Guid roleId)
    {
        if (userId == Guid.Empty) throw new ArgumentException("UserId is required.");
        if (roleId == Guid.Empty) throw new ArgumentException("RoleId is required.");

        return new UserRole { UserId = userId, RoleId = roleId };
    }
}

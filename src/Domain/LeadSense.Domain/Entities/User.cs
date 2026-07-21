using LeadSense.Domain.Common;

namespace LeadSense.Domain.Entities;

public sealed class User : Entity
{
    public Guid? TenantId { get; private set; }

    public string FirstName { get; private set; } = default!;

    public string LastName { get; private set; } = default!;

    public string Email { get; private set; } = default!;

    public string PasswordHash { get; private set; } = default!;

    // Navigation: roles assigned to this user
    private readonly List<UserRole> _userRoles = [];
    public IReadOnlyCollection<UserRole> UserRoles => _userRoles;

    private User(
        Guid? tenantId,
        string firstName,
        string lastName,
        string email,
        string passwordHash)
    {
        TenantId = tenantId;
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        PasswordHash = passwordHash;
    }

    /// <summary>Creates a regular tenant-scoped user.</summary>
    public static User Create(
        Guid tenantId,
        string firstName,
        string lastName,
        string email,
        string passwordHash)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("TenantId is required.");

        if (string.IsNullOrWhiteSpace(firstName))
            throw new ArgumentException("First name is required.");

        if (string.IsNullOrWhiteSpace(lastName))
            throw new ArgumentException("Last name is required.");

        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email is required.");

        return new User(tenantId, firstName, lastName, email, passwordHash);
    }

    /// <summary>Creates a SuperAdmin user — no tenant required.</summary>
    public static User CreateSuperAdmin(
        string firstName,
        string lastName,
        string email,
        string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(firstName))
            throw new ArgumentException("First name is required.");

        if (string.IsNullOrWhiteSpace(lastName))
            throw new ArgumentException("Last name is required.");

        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email is required.");

        return new User(null, firstName, lastName, email, passwordHash);
    }
}

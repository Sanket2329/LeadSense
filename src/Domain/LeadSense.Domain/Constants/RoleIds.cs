namespace LeadSense.Domain.Constants;

/// <summary>
/// Deterministic GUIDs for the three seeded roles.
/// Used across domain, application and infrastructure layers.
/// </summary>
public static class RoleIds
{
    public static readonly Guid SuperAdmin  = new("00000000-0000-0000-0000-000000000001");
    public static readonly Guid TenantAdmin = new("00000000-0000-0000-0000-000000000002");
    public static readonly Guid User        = new("00000000-0000-0000-0000-000000000003");
}

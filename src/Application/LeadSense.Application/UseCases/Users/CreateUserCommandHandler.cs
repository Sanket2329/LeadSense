using LeadSense.Domain.Common;
using LeadSense.Domain.Entities;
using LeadSense.Application.Interfaces;
using LeadSense.Application.Services;
using LeadSense.Domain.Enums;

namespace LeadSense.Application.UseCases.Users.CreateUser;

public sealed class CreateUserCommandHandler
{
    private readonly IUserRepository _userRepository;
    private readonly IUserRoleRepository _userRoleRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly AuditService _auditService;

    public CreateUserCommandHandler(
        IUserRepository userRepository,
        IUserRoleRepository userRoleRepository,
        IRoleRepository roleRepository,
        ISubscriptionRepository subscriptionRepository,
        AuditService auditService)
    {
        _userRepository = userRepository;
        _userRoleRepository = userRoleRepository;
        _roleRepository = roleRepository;
        _subscriptionRepository = subscriptionRepository;
        _auditService = auditService;
    }

    public async Task<Result<Guid>> Handle(
        CreateUserCommand command,
        CancellationToken cancellationToken)
    {
        // ── Validate role exists ──────────────────────────────────────────────
        var role = await _roleRepository.GetByIdAsync(command.RoleId, cancellationToken);
        if (role is null)
            return Result<Guid>.Failure(Error.Create("Role not found."));

        // ── Duplicate email check ─────────────────────────────────────────────
        var exists = await _userRepository.ExistsByEmailAsync(command.Email, cancellationToken);
        if (exists)
            return Result<Guid>.Failure(Error.Create("User already exists."));

        // ── Plan limit check ──────────────────────────────────────────────────
        var subscription = await _subscriptionRepository
            .GetActiveByTenantAsync(command.TenantId, cancellationToken);

        if (subscription is not null)
        {
            var currentUsers = await _userRepository
                .GetAllByTenantAsync(command.TenantId, cancellationToken);

            if (currentUsers.Count >= subscription.Plan.MaxUsers)
                return Result<Guid>.Failure(
                    Error.Create(
                        $"User limit reached. Your {subscription.Plan.Name} plan allows " +
                        $"up to {subscription.Plan.MaxUsers} users. Upgrade to add more."));
        }

        var passwordHash =BCrypt.Net.BCrypt.HashPassword(command.Password);

        var user = User.Create(
            command.TenantId,
            command.FirstName,
            command.LastName,
            command.Email,
            passwordHash);

        await _userRepository.AddAsync(user, cancellationToken);

        // ── Assign role 
        await _userRoleRepository.AssignRoleAsync(user.Id, command.RoleId, cancellationToken);

        await _auditService.RecordAsync(
            tenantId: command.TenantId,
            userId: null,
            action: AuditAction.UserLoggedIn, 
            entityType: "User",
            entityId: user.Id,
            details: $"User created: {user.Email} with role {role.Name}",
            cancellationToken: cancellationToken);

        return user.Id;
    }
}

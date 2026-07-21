using LeadSense.Domain.Common;
using LeadSense.Application.Interfaces;
using LeadSense.Application.Services;
using LeadSense.Domain.Enums;

namespace LeadSense.Application.UseCases.Auth.Login;

public sealed class LoginCommandHandler
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtService _jwtService;
    private readonly AuditService _auditService;

    public LoginCommandHandler(
        IUserRepository userRepository,
        IJwtService jwtService,
        AuditService auditService)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
        _auditService = auditService;
    }

    public async Task<Result<LoginResponse>> Handle(
        LoginCommand command,
        CancellationToken cancellationToken)
    {
        // Load user WITH roles so JWT contains all assigned role claims
        var user = await _userRepository
            .GetByEmailAsync(command.Email, cancellationToken);

        if (user is null)
            return Result<LoginResponse>.Failure(
                Error.Create("Invalid email or password"));

      
        var isValidPassword =BCrypt.Net.BCrypt.Verify(
        command.Password,
        user.PasswordHash);

        if (!isValidPassword)
        {
            return Result<LoginResponse>.Failure(
                Error.Create("Invalid email or password"));
        }
        

        var token = _jwtService.GenerateToken(user);

        // AuditLog — SuperAdmin has no tenantId; use Guid.Empty as a sentinel
        var auditTenantId = user.TenantId ?? Guid.Empty;
        if (auditTenantId != Guid.Empty)
        {
            await _auditService.RecordAsync(
                tenantId: auditTenantId,
                userId: user.Id,
                action: AuditAction.UserLoggedIn,
                entityType: "User",
                entityId: user.Id,
                details: $"User logged in: {user.Email}",
                cancellationToken: cancellationToken);
        }

        return new LoginResponse(token);
    }
}

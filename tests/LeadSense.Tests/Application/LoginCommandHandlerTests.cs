using FluentAssertions;
using LeadSense.Application.Interfaces;
using LeadSense.Application.Services;
using LeadSense.Application.UseCases.Auth.Login;
using LeadSense.Domain.Entities;
using NSubstitute;
using Xunit;

namespace LeadSense.Tests.Application;

public sealed class LoginCommandHandlerTests
{
    private readonly IUserRepository     _users = Substitute.For<IUserRepository>();
    private readonly IJwtService         _jwt   = Substitute.For<IJwtService>();
    private readonly IAuditLogRepository _audit = Substitute.For<IAuditLogRepository>();
    private readonly LoginCommandHandler _sut;

    public LoginCommandHandlerTests()
    {
        _sut = new LoginCommandHandler(_users, _jwt, new AuditService(_audit));
    }

    // Helper: create a user whose PasswordHash is a real BCrypt hash of "secret"
    private static User MakeUser(string plainPassword = "secret") =>
        User.Create(Guid.NewGuid(), "Alice", "Smith", "alice@test.com",
            BCrypt.Net.BCrypt.HashPassword(plainPassword));

    [Fact]
    public async Task Handle_ValidCredentials_ReturnsToken()
    {
        var user = MakeUser("secret");
        _users.GetByEmailAsync("alice@test.com", default).Returns(user);
        _jwt.GenerateToken(user).Returns("jwt.token.here");

        var result = await _sut.Handle(
            new LoginCommand("alice@test.com", "secret"), default);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Token.Should().Be("jwt.token.here");
    }

    [Fact]
    public async Task Handle_UserNotFound_ReturnsFailure()
    {
        _users.GetByEmailAsync(Arg.Any<string>(), default).Returns((User?)null);

        var result = await _sut.Handle(
            new LoginCommand("nobody@test.com", "pw"), default);

        result.IsFailure.Should().BeTrue();
        result.Errors.Should().ContainSingle(e =>
            e.Message.Contains("Invalid email or password"));
    }

    [Fact]
    public async Task Handle_WrongPassword_ReturnsFailure()
    {
        var user = MakeUser("correctpassword");
        _users.GetByEmailAsync("alice@test.com", default).Returns(user);

        var result = await _sut.Handle(
            new LoginCommand("alice@test.com", "wrongpassword"), default);

        result.IsFailure.Should().BeTrue();
        result.Errors.Should().ContainSingle(e =>
            e.Message.Contains("Invalid email or password"));
    }

    [Fact]
    public async Task Handle_ValidLogin_GeneratesJwtToken()
    {
        var user = MakeUser("pw");
        _users.GetByEmailAsync("alice@test.com", default).Returns(user);
        _jwt.GenerateToken(user).Returns("generated.token");

        await _sut.Handle(new LoginCommand("alice@test.com", "pw"), default);

        _jwt.Received(1).GenerateToken(user);
    }
}

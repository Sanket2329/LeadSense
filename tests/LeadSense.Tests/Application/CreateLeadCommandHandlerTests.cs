using FluentAssertions;
using LeadSense.Application.Interfaces;
using LeadSense.Application.Services;
using LeadSense.Application.UseCases.Leads.CreateLead;
using LeadSense.Domain.Entities;
using LeadSense.Domain.Enums;
using NSubstitute;
using Xunit;

namespace LeadSense.Tests.Application;

public sealed class CreateLeadCommandHandlerTests
{
    private readonly ILeadRepository         _leads         = Substitute.For<ILeadRepository>();
    private readonly ISubscriptionRepository _subscriptions = Substitute.For<ISubscriptionRepository>();
    private readonly IAuditLogRepository     _audit         = Substitute.For<IAuditLogRepository>();
    private readonly CreateLeadCommandHandler _sut;

    private static readonly Guid TenantId = Guid.NewGuid();

    public CreateLeadCommandHandlerTests()
    {
        _sut = new CreateLeadCommandHandler(
            _leads, _subscriptions, new AuditService(_audit));
    }

    private CreateLeadCommand MakeCommand(string email = "lead@test.com") =>
        new(TenantId, "Alice", "Smith", email, "555-0001", LeadSource.Website);

    [Fact]
    public async Task Handle_NewLead_ReturnsSuccessWithId()
    {
        _leads.ExistsByEmailAsync(TenantId, "lead@test.com", default).Returns(false);
        _subscriptions.GetActiveByTenantAsync(TenantId, default).Returns((Subscription?)null);

        var result = await _sut.Handle(MakeCommand(), default);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Id.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public async Task Handle_DuplicateEmail_ReturnsFailure()
    {
        _leads.ExistsByEmailAsync(TenantId, "lead@test.com", default).Returns(true);
        _subscriptions.GetActiveByTenantAsync(TenantId, default).Returns((Subscription?)null);

        var result = await _sut.Handle(MakeCommand(), default);

        result.IsFailure.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message.Contains("already exists"));
    }

    [Fact]
    public async Task Handle_EmptyEmail_ReturnsFailure()
    {
        var result = await _sut.Handle(MakeCommand(email: ""), default);

        result.IsFailure.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message.Contains("Email"));
    }

    [Fact]
    public async Task Handle_PlanLimitReached_ReturnsFailure()
    {
        // Build a plan that allows 1 lead max and a subscription using it
        var plan = Plan.Create("Free", PlanTier.Free, maxUsers: 3, maxLeads: 1, pricePerMonth: 0);
        var subscription = Subscription.Create(TenantId, plan.Id);
        // Simulate subscription having a Plan loaded (EF navigation normally does this)
        SetPlanOnSubscription(subscription, plan);

        _subscriptions.GetActiveByTenantAsync(TenantId, default).Returns(subscription);
        _leads.GetAllAsync(TenantId, default).Returns(
            new List<Lead> { MakeLead() }); // 1 existing lead = at the limit

        _leads.ExistsByEmailAsync(TenantId, Arg.Any<string>(), default).Returns(false);

        var result = await _sut.Handle(MakeCommand("new@test.com"), default);

        result.IsFailure.Should().BeTrue();
        result.Errors.Should().ContainSingle(e => e.Message.Contains("limit"));
    }

    [Fact]
    public async Task Handle_NewLead_PersistsToRepository()
    {
        _leads.ExistsByEmailAsync(TenantId, "lead@test.com", default).Returns(false);
        _subscriptions.GetActiveByTenantAsync(TenantId, default).Returns((Subscription?)null);

        await _sut.Handle(MakeCommand(), default);

        await _leads.Received(1).AddAsync(Arg.Any<Lead>(), default);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static Lead MakeLead() =>
        Lead.Create(TenantId, "X", "Y", "x@y.com", "1", LeadSource.Website);

    /// <summary>
    /// Sets the Plan navigation property on a Subscription via reflection
    /// (EF Core normally populates this via Include — bypassed in unit tests).
    /// </summary>
    private static void SetPlanOnSubscription(Subscription subscription, Plan plan)
    {
        var prop = typeof(Subscription).GetProperty("Plan")!;
        prop.SetValue(subscription, plan);
    }
}

using LeadSense.Domain.Common;
using LeadSense.Domain.Entities;
using LeadSense.Application.Interfaces;
using LeadSense.Application.Services;
using LeadSense.Domain.Enums;

namespace LeadSense.Application.UseCases.Leads.CreateLead;

public sealed class CreateLeadCommandHandler
{
    private readonly ILeadRepository _leadRepository;
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly AuditService _auditService;

    public CreateLeadCommandHandler(
        ILeadRepository leadRepository,
        ISubscriptionRepository subscriptionRepository,
        AuditService auditService)
    {
        _leadRepository = leadRepository;
        _subscriptionRepository = subscriptionRepository;
        _auditService = auditService;
    }

    public async Task<Result<CreateLeadResponse>> Handle(
        CreateLeadCommand request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return Result<CreateLeadResponse>.Failure(
                Error.Create("Email is required"));
        }

        // ── Plan limit check ─────────────────────────────────────────────────
        var subscription = await _subscriptionRepository
            .GetActiveByTenantAsync(request.TenantId, cancellationToken);

        if (subscription is not null)
        {
            var currentLeads = await _leadRepository
                .GetAllAsync(request.TenantId, cancellationToken);

            if (currentLeads.Count >= subscription.Plan.MaxLeads)
            {
                return Result<CreateLeadResponse>.Failure(
                    Error.Create(
                        $"Lead limit reached. Your {subscription.Plan.Name} plan allows " +
                        $"up to {subscription.Plan.MaxLeads} leads. " +
                        "Please upgrade to add more leads."));
            }
        }

        var email = request.Email.Trim().ToLowerInvariant();

        var leadAlreadyExists = await _leadRepository.ExistsByEmailAsync(
            request.TenantId,
            email,
            cancellationToken);

        if (leadAlreadyExists)
        {
            return Result<CreateLeadResponse>.Failure(
                Error.Create("Lead already exists"));
        }

        var lead = Lead.Create(
            request.TenantId,
            request.FirstName,
            request.LastName,
            email,
            request.PhoneNumber,
            request.Source);

        // Apply optional fields
        if (request.CompanyName is not null)
            lead.SetOptionalFields(request.CompanyName);

        // If caller provided notes, record them as the first activity
        if (!string.IsNullOrWhiteSpace(request.Notes))
        {
            lead.ScheduleFollowUp(
                ActivityType.Note,
                request.Notes,
                scheduledFor: null);
        }

        await _leadRepository.AddAsync(lead, cancellationToken);

        await _auditService.RecordAsync(
            tenantId: request.TenantId,
            userId: null, // caller userId not in command yet — wire in next pass
            action: AuditAction.LeadCreated,
            entityType: "Lead",
            entityId: lead.Id,
            details: $"Lead created: {lead.FirstName} {lead.LastName} <{lead.Email}>",
            cancellationToken: cancellationToken);

        return new CreateLeadResponse(lead.Id);
    }
}

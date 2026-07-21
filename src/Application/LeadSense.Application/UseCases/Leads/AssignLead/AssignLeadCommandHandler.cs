using LeadSense.Application.Interfaces;
using LeadSense.Application.Services;
using LeadSense.Domain.Common;
using LeadSense.Domain.Enums;

namespace LeadSense.Application.UseCases.Leads.AssignLead;

public sealed class AssignLeadCommandHandler
{
    private readonly ILeadRepository _leadRepository;
    private readonly AuditService _auditService;

    public AssignLeadCommandHandler(
        ILeadRepository leadRepository,
        AuditService auditService)
    {
        _leadRepository = leadRepository;
        _auditService = auditService;
    }

    public async Task<Result<bool>> Handle(
        AssignLeadCommand command,
        CancellationToken cancellationToken)
    {
        var lead = await _leadRepository.GetByIdAsync(
            command.TenantId,
            command.LeadId,
            cancellationToken);

        if (lead is null)
            return Result<bool>.Failure(Error.Create("Lead not found."));

        if (command.AssignedToUserId.HasValue)
            lead.Assign(command.AssignedToUserId.Value);
        else
            lead.Unassign();

        await _leadRepository.UpdateAsync(lead, cancellationToken);

        await _auditService.RecordAsync(
            tenantId: command.TenantId,
            userId: command.AssignedToUserId,
            action: AuditAction.LeadUpdated,
            entityType: "Lead",
            entityId: lead.Id,
            details: command.AssignedToUserId.HasValue
                ? $"Lead assigned to user {command.AssignedToUserId}"
                : "Lead unassigned",
            cancellationToken: cancellationToken);

        return Result<bool>.Success(true);
    }
}

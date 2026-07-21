using LeadSense.Application.Interfaces;

namespace LeadSense.Application.UseCases.AuditLogs;

public sealed record GetAuditLogsByEntityQuery(
    Guid TenantId,
    string EntityType,
    Guid EntityId);

public sealed class GetAuditLogsByEntityQueryHandler
{
    private readonly IAuditLogRepository _repository;

    public GetAuditLogsByEntityQueryHandler(IAuditLogRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<GetAuditLogResponse>> Handle(
        GetAuditLogsByEntityQuery query,
        CancellationToken cancellationToken)
    {
        var logs = await _repository.GetByEntityAsync(
            query.TenantId,
            query.EntityType,
            query.EntityId,
            cancellationToken);

        return logs.Select(l => new GetAuditLogResponse(
            l.Id,
            l.TenantId,
            l.UserId,
            l.Action,
            l.Action.ToString(),
            l.EntityType,
            l.EntityId,
            l.Details,
            l.CreatedAt))
        .ToList();
    }
}

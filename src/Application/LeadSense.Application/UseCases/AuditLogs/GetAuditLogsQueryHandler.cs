using LeadSense.Application.Interfaces;

namespace LeadSense.Application.UseCases.AuditLogs;

public sealed record GetAuditLogsQuery(Guid TenantId);

public sealed class GetAuditLogsQueryHandler
{
    private readonly IAuditLogRepository _repository;

    public GetAuditLogsQueryHandler(IAuditLogRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<GetAuditLogResponse>> Handle(
        GetAuditLogsQuery query,
        CancellationToken cancellationToken)
    {
        var logs = await _repository.GetByTenantAsync(query.TenantId, cancellationToken);

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

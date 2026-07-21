using LeadSense.Application.Interfaces;
using LeadSense.Domain.Enums;

namespace LeadSense.Application.UseCases.Dashboard;

public sealed class GetDashboardQueryHandler
{
    private readonly ILeadRepository _leadRepository;

    public GetDashboardQueryHandler(
        ILeadRepository leadRepository)
    {
        _leadRepository = leadRepository;
    }

    public async Task<DashboardResponse> Handle(
        GetDashboardQuery query,
        CancellationToken cancellationToken)
    {
        var totalLeads =
            await _leadRepository.GetLeadCountAsync(
                query.TenantId,
                cancellationToken);

        var newLeads =
            await _leadRepository.GetLeadCountByStatusAsync(
                query.TenantId,
                LeadStatus.New,
                cancellationToken);

        var qualifiedLeads =
            await _leadRepository.GetLeadCountByStatusAsync(
                query.TenantId,
                LeadStatus.Qualified,
                cancellationToken);

        var wonLeads =
            await _leadRepository.GetLeadCountByStatusAsync(
                query.TenantId,
                LeadStatus.Won,
                cancellationToken);

        var lostLeads =
            await _leadRepository.GetLeadCountByStatusAsync(
                query.TenantId,
                LeadStatus.Lost,
                cancellationToken);

        var totalActivities =
            await _leadRepository.GetActivityCountAsync(
                query.TenantId,
                cancellationToken);

        var overdueActivities =
            await _leadRepository.GetOverdueActivityCountAsync(
                query.TenantId,
                cancellationToken);

        decimal conversionRate =
            totalLeads == 0
                ? 0
                : Math.Round(
                    ((decimal)wonLeads / totalLeads) * 100,
                    2);

        return new DashboardResponse(
            totalLeads,
            newLeads,
            qualifiedLeads,
            wonLeads,
            lostLeads,
            totalActivities,
            overdueActivities,
            conversionRate);
    }
}
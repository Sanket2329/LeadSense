public sealed record DashboardResponse(
    int TotalLeads,
    int NewLeads,
    int QualifiedLeads,
    int WonLeads,
    int LostLeads,
    int TotalActivities,
    int OverdueActivities,
    decimal ConversionRate);
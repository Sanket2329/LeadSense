namespace LeadSense.Application.UseCases.LeadActivities.GetActivityStats;

public sealed record ActivityStatsResponse(
    int Pending,
    int Completed,
    int Cancelled,
    int Overdue);
namespace LeadSense.Api.Requests;

public sealed record RescheduleLeadActivityRequest(
    DateTimeOffset ScheduledFor);
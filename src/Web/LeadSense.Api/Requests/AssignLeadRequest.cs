namespace LeadSense.Api.Requests;

public sealed record AssignLeadRequest(
    /// <summary>Null to unassign the lead.</summary>
    Guid? AssignedToUserId);

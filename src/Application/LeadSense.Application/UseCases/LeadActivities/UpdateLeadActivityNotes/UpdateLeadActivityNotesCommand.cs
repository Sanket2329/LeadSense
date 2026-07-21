namespace LeadSense.Application.UseCases.LeadActivities.UpdateLeadActivityNotes;

public record UpdateLeadActivityNotesCommand(
    Guid TenantId,
    Guid LeadId,
    Guid ActivityId,
    string Notes);

namespace LeadSense.Domain.Enums;

public enum AuditAction
{
    LeadCreated = 1,
    LeadUpdated = 2,
    LeadDeleted = 3,
    LeadStatusUpdated = 4,
    ActivityCreated = 5,
    ActivityCompleted = 6,
    ActivityCancelled = 7,
    ActivityRescheduled = 8,
    ActivityNotesUpdated = 9,
    UserLoggedIn = 10,
    UserInvited = 11,
    InvitationAccepted = 12,
    InvitationRejected = 13
}

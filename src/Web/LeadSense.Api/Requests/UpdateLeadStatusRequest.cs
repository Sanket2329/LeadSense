using LeadSense.Domain.Enums;

namespace LeadSense.Api.Requests;

public sealed record UpdateLeadStatusRequest(
    LeadStatus Status);

using LeadSense.Domain.Common;
using LeadSense.Domain.Enums;

namespace LeadSense.Domain.Entities;

public sealed class Lead : Entity
{
    private readonly List<LeadActivity> _followUps = [];

    public Guid TenantId { get; private set; }
    public string FirstName { get; private set; } = default!;
    public string LastName { get; private set; } = default!;
    public string Email { get; private set; } = default!;
    public string PhoneNumber { get; private set; } = default!;

    public string? CompanyName { get; private set; }
    public string? JobTitle { get; private set; }

    public LeadStatus Status { get; private set; }
    public LeadSource Source { get; private set; }

    public decimal? EstimatedValue { get; private set; }

    /// <summary>The user (sales rep) currently responsible for this lead. Nullable = unassigned.</summary>
    public Guid? AssignedToUserId { get; private set; }

    public IReadOnlyCollection<LeadActivity> FollowUps => _followUps;

    private Lead(
      Guid tenantId,
      string firstName,
      string lastName,
      string email,
      string phoneNumber,
      LeadSource source)
    {
        TenantId = tenantId;

        FirstName = firstName;
        LastName = lastName;
        Email = email;
        PhoneNumber = phoneNumber;

        Source = source;
        Status = LeadStatus.New;
    }

    public static Lead Create(
      Guid tenantId,
      string firstName,
      string lastName,
      string email,
      string phoneNumber,
      LeadSource source)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("TenantId is required");

        if (string.IsNullOrWhiteSpace(firstName))
            throw new ArgumentException("First name is required");

        if (string.IsNullOrWhiteSpace(lastName))
            throw new ArgumentException("Last name is required");

        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email is required");

        if (string.IsNullOrWhiteSpace(phoneNumber))
            throw new ArgumentException("Phone number is required");

        return new Lead(
            tenantId,
            firstName,
            lastName,
            email,
            phoneNumber,
            source);
    }
    public void Update(
    string firstName,
    string lastName,
    string email,
    string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(firstName))
            throw new ArgumentException("First name is required");

        if (string.IsNullOrWhiteSpace(lastName))
            throw new ArgumentException("Last name is required");

        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email is required");

        if (string.IsNullOrWhiteSpace(phoneNumber))
            throw new ArgumentException("Phone number is required");

        FirstName = firstName;
        LastName = lastName;
        Email = email;
        PhoneNumber = phoneNumber;

        MarkAsUpdated();
    }

    /// <summary>Sets optional fields that can be provided at creation time.</summary>
    public void SetOptionalFields(string? companyName)
    {
        if (companyName is not null)
            CompanyName = companyName.Trim();
    }

    public void UpdateStatus(LeadStatus status)
    {
        Status = status;
        MarkAsUpdated();
    }

    public void Assign(Guid userId)
    {
        if (userId == Guid.Empty)
            throw new ArgumentException("UserId is required.");

        AssignedToUserId = userId;
        MarkAsUpdated();
    }

    public void Unassign()
    {
        AssignedToUserId = null;
        MarkAsUpdated();
    }
    public LeadActivity ScheduleFollowUp(
    ActivityType type,
    string notes,
    DateTimeOffset? scheduledFor)
    {
        var activity = LeadActivity.Create(
            Id,
            type,
            notes,
            scheduledFor);

        _followUps.Add(activity);

        MarkAsUpdated();

        return activity;
    }
}

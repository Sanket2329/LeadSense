using LeadSense.Domain.Common;
using LeadSense.Domain.Enums;

namespace LeadSense.Domain.Entities;

public sealed class Lead : Entity
{
    private readonly List<LeadActivity> _followUps = [];
    public string FirstName { get; private set; } = default!;
    public string LastName { get; private set; } = default!;
    public string Email { get; private set; } = default!;
    public string PhoneNumber { get; private set; } = default!;

    public string? CompanyName { get; private set; }
    public string? JobTitle { get; private set; }

    public LeadStatus Status { get; private set; }
    public LeadSource Source { get; private set; }

    public decimal? EstimatedValue { get; private set; }

    public IReadOnlyCollection<LeadActivity> FollowUps => _followUps;

    private Lead(
        string firstName,
        string lastName,
        string email,
        string phoneNumber,
        LeadSource source)
    {
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        PhoneNumber = phoneNumber;

        Source = source;
        Status = LeadStatus.New;
    }

    public static Lead Create(
        string firstName,
        string lastName,
        string email,
        string phoneNumber,
        LeadSource source)
    {
        return new Lead(
            firstName,
            lastName,
            email,
            phoneNumber,
            source);
    }
}

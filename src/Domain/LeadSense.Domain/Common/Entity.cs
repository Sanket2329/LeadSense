namespace LeadSense.Domain.Common;

public abstract class Entity
{
    public Guid Id { get; protected set; }

    public DateTimeOffset CreatedAt { get; protected set; }

    public DateTimeOffset? UpdatedAt { get; protected set; }

    protected Entity()
    {
        Id = Guid.CreateVersion7();
        CreatedAt = DateTimeOffset.UtcNow;
    }

    protected void MarkAsUpdated()
    {
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}
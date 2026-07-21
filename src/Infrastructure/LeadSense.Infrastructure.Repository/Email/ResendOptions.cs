namespace LeadSense.Infrastructure.Repository.Email;

public sealed class ResendOptions
{
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>e.g. "LeadSense &lt;noreply@yourdomain.com&gt;"</summary>
    public string FromEmail { get; set; } = string.Empty;
}

namespace LeadSense.Domain.Common;

public sealed record Error(string Code, string Message)
{
    public static Error Create(string message)
    {
        return new Error(message.Trim().ToLower().Replace(" ", "."), message);
    }
}


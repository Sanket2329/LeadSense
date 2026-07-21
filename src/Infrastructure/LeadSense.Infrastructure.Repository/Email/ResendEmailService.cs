using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using LeadSense.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace LeadSense.Infrastructure.Repository.Email;

/// <summary>
/// Sends transactional emails via the Resend REST API.
/// Docs: https://resend.com/docs/api-reference/emails/send-email
/// </summary>
public sealed class ResendEmailService : IEmailService
{
    private readonly HttpClient _http;
    private readonly ResendOptions _opts;
    private readonly ILogger<ResendEmailService> _logger;

    public ResendEmailService(
        HttpClient http,
        IOptions<ResendOptions> opts,
        ILogger<ResendEmailService> logger)
    {
        _http   = http;
        _opts   = opts.Value;
        _logger = logger;

        _http.BaseAddress = new Uri("https://api.resend.com/");
        _http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", _opts.ApiKey);
    }

    // ── Public ────────────────────────────────────────────────────────────────

    public Task SendInvitationAsync(
        string toEmail,
        string inviteLink,
        string invitedByName,
        CancellationToken cancellationToken = default)
    {
        var subject = $"You've been invited to LeadSense by {invitedByName}";
        var html = InvitationHtml(inviteLink, invitedByName);
        return SendAsync(toEmail, subject, html, cancellationToken);
    }

    public Task SendPasswordResetAsync(
        string toEmail,
        string resetLink,
        CancellationToken cancellationToken = default)
    {
        const string subject = "Reset your LeadSense password";
        var html = PasswordResetHtml(resetLink);
        return SendAsync(toEmail, subject, html, cancellationToken);
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    private async Task SendAsync(
        string toEmail,
        string subject,
        string html,
        CancellationToken cancellationToken)
    {
        // If no real API key is configured, log and skip — don't crash the app
        if (string.IsNullOrWhiteSpace(_opts.ApiKey) ||
            _opts.ApiKey.StartsWith("re_your_", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning(
                "Email skipped — Resend API key is not configured. " +
                "Set Resend:ApiKey in your environment to enable email sending. " +
                "Would have sent '{Subject}' to {Email}.",
                subject, toEmail);
            return;
        }

        var payload = new
        {
            from    = _opts.FromEmail,
            to      = new[] { toEmail },
            subject = subject,
            html    = html
        };

        var json    = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        try
        {
            var response = await _http.PostAsync("emails", content, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError(
                    "Resend API error {Status} sending to {Email}: {Body}",
                    (int)response.StatusCode, toEmail, body);
                // Log but don't throw — email failure should not fail the whole request
                return;
            }

            _logger.LogInformation("Email sent to {Email}: {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            // Network error or timeout — log and continue, don't crash
            _logger.LogError(ex, "Failed to send email to {Email}: {Subject}", toEmail, subject);
        }
    }

    // ── Email templates ───────────────────────────────────────────────────────

    private static string InvitationHtml(string inviteLink, string invitedByName) => $"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8" /></head>
        <body style="font-family:Inter,sans-serif;background:#f8fafc;margin:0;padding:40px 0;">
          <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:32px 40px;">
              <h1 style="color:#fff;margin:0;font-size:22px;font-weight:900;letter-spacing:-.5px;">LeadSense</h1>
              <p style="color:rgba(255,255,255,.7);margin:6px 0 0;font-size:13px;">Sales Pipeline & CRM</p>
            </div>
            <div style="padding:40px;">
              <h2 style="color:#0f172a;font-size:18px;font-weight:800;margin:0 0 12px;">You've been invited</h2>
              <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 24px;">
                <strong>{invitedByName}</strong> has invited you to join their workspace on LeadSense.
                Click the button below to create your account and get started.
              </p>
              <a href="{inviteLink}"
                 style="display:inline-block;background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;font-size:14px;">
                Accept Invitation
              </a>
              <p style="color:#94a3b8;font-size:12px;margin:24px 0 0;">
                This invitation expires in 7 days. If you didn't expect this email, you can ignore it.
              </p>
              <hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0;" />
              <p style="color:#cbd5e1;font-size:11px;margin:0;">
                Or copy this link: <span style="color:#2563eb;">{inviteLink}</span>
              </p>
            </div>
          </div>
        </body>
        </html>
        """;

    private static string PasswordResetHtml(string resetLink) => $"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8" /></head>
        <body style="font-family:Inter,sans-serif;background:#f8fafc;margin:0;padding:40px 0;">
          <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:32px 40px;">
              <h1 style="color:#fff;margin:0;font-size:22px;font-weight:900;">LeadSense</h1>
            </div>
            <div style="padding:40px;">
              <h2 style="color:#0f172a;font-size:18px;font-weight:800;margin:0 0 12px;">Reset your password</h2>
              <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 24px;">
                We received a request to reset your LeadSense password.
                Click the button below — this link expires in 1 hour.
              </p>
              <a href="{resetLink}"
                 style="display:inline-block;background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;font-size:14px;">
                Reset Password
              </a>
              <p style="color:#94a3b8;font-size:12px;margin:24px 0 0;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </div>
          </div>
        </body>
        </html>
        """;
}

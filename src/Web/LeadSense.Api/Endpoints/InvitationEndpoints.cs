using LeadSense.Api.Requests;
using LeadSense.Application.UseCases.Invitations.InviteUser;
using LeadSense.Application.UseCases.Invitations.AcceptInvitation;
using LeadSense.Application.UseCases.Invitations.RejectInvitation;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;

namespace LeadSense.Api.Endpoints;

public static class InvitationEndpoints
{
    public static IEndpointRouteBuilder MapInvitationEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/invitations");

        // POST /api/invitations — TenantAdmin sends an invitation
        group.MapPost(
            "/",
            async (
                ClaimsPrincipal caller,
                InviteUserRequest request,
                IConfiguration config,
                InviteUserCommandHandler handler,
                CancellationToken cancellationToken) =>
            {
                var tenantClaim = caller.FindFirst("tenantId")?.Value;
                if (tenantClaim is null)
                    return Results.Forbid();
                var tenantId   = Guid.Parse(tenantClaim);

                var invitedById = Guid.Parse(
                    (caller.FindFirst(ClaimTypes.NameIdentifier)
                     ?? caller.FindFirst("sub"))!.Value);

                // Build inviter display name from JWT claims
                var firstName = caller.FindFirst("firstName")?.Value ?? "";
                var lastName  = caller.FindFirst("lastName")?.Value  ?? "";
                var inviterName = $"{firstName} {lastName}".Trim();
                if (string.IsNullOrEmpty(inviterName))
                    inviterName = caller.FindFirst("email")?.Value ?? "A team member";

                var frontendUrl = config["Frontend:BaseUrl"] ?? "http://localhost:5173";

                var result = await handler.Handle(
                    new InviteUserCommand(
                        tenantId,
                        invitedById,
                        inviterName,
                        request.Email,
                        request.RoleId,
                        frontendUrl),
                    cancellationToken);

                if (result.IsFailure)
                    return Results.BadRequest(result.Errors);

                return Results.Ok(result.Value);
            })
            .RequireAuthorization("TenantAdmin")
            .WithName("InviteUser")
            .WithSummary("Invite user")
            .WithDescription("TenantAdmin only — sends an invitation email to a new user.");

        // POST /api/invitations/accept — public, invitee accepts via token
        group.MapPost(
            "/accept",
            async (
                AcceptInvitationRequest request,
                AcceptInvitationCommandHandler handler,
                CancellationToken cancellationToken) =>
            {
                var result = await handler.Handle(
                    new AcceptInvitationCommand(
                        request.Token,
                        request.FirstName,
                        request.LastName,
                        request.Password),
                    cancellationToken);

                if (result.IsFailure)
                    return Results.BadRequest(result.Errors);

                return Results.Ok(new { UserId = result.Value });
            })
            .WithName("AcceptInvitation")
            .WithSummary("Accept invitation")
            .WithDescription("Public — invitee accepts invitation and creates their account.");

        // POST /api/invitations/reject — public, invitee rejects via token
        group.MapPost(
            "/reject",
            async (
                RejectInvitationRequest request,
                RejectInvitationCommandHandler handler,
                CancellationToken cancellationToken) =>
            {
                var result = await handler.Handle(
                    new RejectInvitationCommand(request.Token),
                    cancellationToken);

                if (result.IsFailure)
                    return Results.BadRequest(result.Errors);

                return Results.Ok("Invitation rejected.");
            })
            .WithName("RejectInvitation")
            .WithSummary("Reject invitation")
            .WithDescription("Public — invitee rejects the invitation.");

        return app;
    }
}

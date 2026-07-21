using LeadSense.Api.Requests;
using LeadSense.Application.UseCases.LeadActivities;
using LeadSense.Application.UseCases.LeadActivities.CreateLeadActivity;
using LeadSense.Application.UseCases.LeadActivities.GetLeadActivityById;
using LeadSense.Application.UseCases.LeadActivities.UpdateLeadActivityNotes;
using LeadSense.Application.UseCases.Leads.AssignLead;
using LeadSense.Application.UseCases.Leads.CreateLead;
using LeadSense.Application.UseCases.Leads.DeleteLead;
using LeadSense.Application.UseCases.Leads.GetLeads;
using LeadSense.Application.UseCases.Leads.GetMyLeads;
using LeadSense.Application.UseCases.Leads.UpdateLead;
using LeadSense.Application.UseCases.Leads.UpdateLeadStatus;
using Microsoft.AspNetCore.Mvc;
using LeadSense.Application.UseCases.LeadActivities.GetOverdueActivities;
using LeadSense.Application.UseCases.LeadActivities.GetActivityStats;
using System.Security.Claims;

namespace LeadSense.Api.Endpoints;

public static class LeadEndpoints
{
    // ── Helper: extract tenantId claim — returns null for SuperAdmin (no tenant) ──
    private static Guid? GetTenantId(ClaimsPrincipal user)
    {
        var value = user.FindFirst("tenantId")?.Value;
        return value is not null ? Guid.Parse(value) : null;
    }

    private static IResult RequireTenant(ClaimsPrincipal user, out Guid tenantId)
    {
        var id = GetTenantId(user);
        if (id is null)
        {
            tenantId = Guid.Empty;
            return Results.BadRequest(new[]
            {
                new { code = "no.tenant", message = "SuperAdmin does not belong to a tenant. Create a tenant and a TenantAdmin user first." }
            });
        }
        tenantId = id.Value;
        return null!; // null means "no error"
    }

    public static void RegisterLeadEndpoints(this IEndpointRouteBuilder app)
    {
        RouteGroupBuilder leads =
            app.MapGroup("/api/leads").RequireAuthorization();

        // GET /api/leads
        leads.MapGet("/", async (
            ClaimsPrincipal user,
            GetLeadsQueryHandler handler,
            CancellationToken cancellationToken) =>
        {
            var err = RequireTenant(user, out var tenantId);
            if (err is not null) return err;

            var result = await handler.Handle(new GetLeadsQuery(tenantId), cancellationToken);
            return Results.Ok(result);
        })
        .WithName("GetLeads")
        .WithSummary("Get all leads")
        .WithDescription("Returns all leads for a tenant.");

        // POST /api/leads
        leads.MapPost("/", async (
            ClaimsPrincipal user,
            [FromBody] CreateLeadRequest request,
            CreateLeadCommandHandler handler,
            CancellationToken cancellationToken) =>
        {
            var err = RequireTenant(user, out var tenantId);
            if (err is not null) return err;

            var command = new CreateLeadCommand(
                tenantId, request.FirstName, request.LastName,
                request.Email, request.PhoneNumber, request.Source,
                request.CompanyName, request.Notes);

            var result = await handler.Handle(command, cancellationToken);
            if (result.IsFailure) return Results.BadRequest(result.Errors);

            return Results.Created($"/api/leads/{result.Value!.Id}", result.Value);
        })
        .WithName("CreateLead")
        .WithSummary("Create lead")
        .WithDescription("Creates a new lead.");

        // PUT /api/leads/{id}
        leads.MapPut("/{id}", async (
            ClaimsPrincipal user,
            Guid id,
            [FromBody] UpdateLeadRequest request,
            UpdateLeadCommandHandler handler,
            CancellationToken cancellationToken) =>
        {
            var err = RequireTenant(user, out var tenantId);
            if (err is not null) return err;

            var command = new UpdateLeadCommand(
                tenantId, id, request.FirstName, request.LastName,
                request.Email, request.PhoneNumber);

            var result = await handler.Handle(command, cancellationToken);
            if (result.IsFailure) return Results.BadRequest(result.Errors);

            return Results.Ok("Lead updated successfully");
        })
        .WithName("UpdateLead")
        .WithSummary("Update lead")
        .WithDescription("Updates an existing lead.");

        // PUT /api/leads/{id}/status
        leads.MapPut("/{id}/status", async (
            ClaimsPrincipal user,
            Guid id,
            [FromBody] UpdateLeadStatusRequest request,
            UpdateLeadStatusCommandHandler handler,
            CancellationToken cancellationToken) =>
        {
            var err = RequireTenant(user, out var tenantId);
            if (err is not null) return err;

            var command = new UpdateLeadStatusCommand(tenantId, id, request.Status);
            var result  = await handler.Handle(command, cancellationToken);
            if (result.IsFailure) return Results.BadRequest(result.Errors);

            return Results.Ok("Lead status updated successfully");
        })
        .WithName("UpdateLeadStatus")
        .WithSummary("Update lead status")
        .WithDescription("Updates lead status.");

        // DELETE /api/leads/{id}
        leads.MapDelete("/{id}", async (
            ClaimsPrincipal user,
            Guid id,
            DeleteLeadCommandHandler handler,
            CancellationToken cancellationToken) =>
        {
            var err = RequireTenant(user, out var tenantId);
            if (err is not null) return err;

            var command = new DeleteLeadCommand(tenantId, id);
            var result  = await handler.Handle(command, cancellationToken);
            if (result.IsFailure) return Results.BadRequest(result.Errors);

            return Results.Ok("Lead deleted successfully");
        })
        .WithName("DeleteLead")
        .WithSummary("Delete lead")
        .WithDescription("Deletes a lead.");

        // GET /api/leads/activities/overdue
        leads.MapGet("/activities/overdue", async (
            ClaimsPrincipal user,
            GetOverdueActivitiesQueryHandler handler,
            CancellationToken cancellationToken) =>
        {
            var err = RequireTenant(user, out var tenantId);
            if (err is not null) return err;

            var result = await handler.Handle(new GetOverdueActivitiesQuery(tenantId), cancellationToken);
            return Results.Ok(result.Value);
        })
        .WithName("GetOverdueActivities")
        .WithSummary("Get overdue activities")
        .WithDescription("Returns all overdue activities for the current tenant.");

        // GET /api/leads/activities/stats
        leads.MapGet("/activities/stats", async (
            ClaimsPrincipal user,
            GetActivityStatsQueryHandler handler,
            CancellationToken cancellationToken) =>
        {
            var err = RequireTenant(user, out var tenantId);
            if (err is not null) return err;

            var result = await handler.Handle(new GetActivityStatsQuery(tenantId), cancellationToken);
            return Results.Ok(result.Value);
        })
        .WithName("GetActivityStats")
        .WithSummary("Get activity statistics")
        .WithDescription("Returns activity dashboard statistics for the current tenant.");

        // GET /api/leads/mine
        leads.MapGet("/mine", async (
            ClaimsPrincipal user,
            GetMyLeadsQueryHandler handler,
            CancellationToken cancellationToken) =>
        {
            var err = RequireTenant(user, out var tenantId);
            if (err is not null) return err;

            var userId = Guid.Parse(
                (user.FindFirst(ClaimTypes.NameIdentifier) ?? user.FindFirst("sub"))!.Value);

            var result = await handler.Handle(new GetMyLeadsQuery(tenantId, userId), cancellationToken);
            return Results.Ok(result);
        })
        .WithName("GetMyLeads")
        .WithSummary("My leads")
        .WithDescription("Returns leads assigned to the calling user.");

        // PUT /api/leads/{id}/assign
        leads.MapPut("/{id}/assign", async (
            ClaimsPrincipal user,
            Guid id,
            [FromBody] AssignLeadRequest request,
            AssignLeadCommandHandler handler,
            CancellationToken cancellationToken) =>
        {
            var err = RequireTenant(user, out var tenantId);
            if (err is not null) return err;

            var result = await handler.Handle(
                new AssignLeadCommand(tenantId, id, request.AssignedToUserId), cancellationToken);

            if (result.IsFailure) return Results.BadRequest(result.Errors);

            return Results.Ok(request.AssignedToUserId.HasValue
                ? "Lead assigned successfully"
                : "Lead unassigned successfully");
        })
        .WithName("AssignLead")
        .WithSummary("Assign / unassign lead")
        .WithDescription("Assigns a lead to a user. Pass null AssignedToUserId to unassign.");

        // POST /api/leads/{leadId}/activities
        leads.MapPost("/{leadId}/activities", async (
            ClaimsPrincipal user,
            Guid leadId,
            [FromBody] CreateLeadActivityRequest request,
            CreateLeadActivityCommandHandler handler,
            CancellationToken cancellationToken) =>
        {
            var err = RequireTenant(user, out var tenantId);
            if (err is not null) return err;

            var command = new CreateLeadActivityCommand(
                tenantId, leadId, request.Type, request.Notes, request.ScheduledFor);

            var result = await handler.Handle(command, cancellationToken);
            if (result.IsFailure) return Results.BadRequest(result.Errors);

            return Results.Created($"/api/leads/{leadId}/activities/{result.Value}", result.Value);
        })
        .WithName("CreateLeadActivity")
        .WithSummary("Create lead activity")
        .WithDescription("Creates a follow-up activity for a lead.");

        // GET /api/leads/{leadId}/activities
        leads.MapGet("/{leadId}/activities", async (
            ClaimsPrincipal user,
            Guid leadId,
            GetLeadActivitiesQueryHandler handler,
            CancellationToken cancellationToken) =>
        {
            var err = RequireTenant(user, out var tenantId);
            if (err is not null) return err;

            var result = await handler.Handle(new GetLeadActivitiesQuery(tenantId, leadId), cancellationToken);
            if (result.IsFailure) return Results.BadRequest(result.Errors);

            return Results.Ok(result.Value);
        })
        .WithName("GetLeadActivities")
        .WithSummary("Get lead activities")
        .WithDescription("Returns all activities for a lead.");

        // GET /api/leads/{leadId}/activities/{activityId}
        leads.MapGet("/{leadId}/activities/{activityId}", async (
            ClaimsPrincipal user,
            Guid leadId,
            Guid activityId,
            GetLeadActivityByIdQueryHandler handler,
            CancellationToken cancellationToken) =>
        {
            var err = RequireTenant(user, out var tenantId);
            if (err is not null) return err;

            var result = await handler.Handle(
                new GetLeadActivityByIdQuery(tenantId, leadId, activityId), cancellationToken);

            if (result.IsFailure) return Results.NotFound(result.Errors);
            return Results.Ok(result.Value);
        });

        // PUT /api/leads/{leadId}/activities/{activityId}/complete
        leads.MapPut("/{leadId}/activities/{activityId}/complete", async (
            ClaimsPrincipal user,
            Guid leadId,
            Guid activityId,
            CompleteLeadActivityCommandHandler handler,
            CancellationToken cancellationToken) =>
        {
            var err = RequireTenant(user, out var tenantId);
            if (err is not null) return err;

            var result = await handler.Handle(
                new CompleteLeadActivityCommand(tenantId, leadId, activityId), cancellationToken);

            if (result.IsFailure) return Results.BadRequest(result.Errors);
            return Results.Ok("Activity completed successfully");
        })
        .WithName("CompleteLeadActivity")
        .WithSummary("Complete lead activity")
        .WithDescription("Marks a lead activity as completed.");

        // PUT /api/leads/{leadId}/activities/{activityId}/cancel
        leads.MapPut("/{leadId}/activities/{activityId}/cancel", async (
            ClaimsPrincipal user,
            Guid leadId,
            Guid activityId,
            CancelLeadActivityCommandHandler handler,
            CancellationToken cancellationToken) =>
        {
            var err = RequireTenant(user, out var tenantId);
            if (err is not null) return err;

            var result = await handler.Handle(
                new CancelLeadActivityCommand(tenantId, leadId, activityId), cancellationToken);

            if (result.IsFailure) return Results.BadRequest(result.Errors);
            return Results.Ok("Activity cancelled successfully");
        })
        .WithName("CancelLeadActivity")
        .WithSummary("Cancel lead activity")
        .WithDescription("Cancels a lead activity.");

        // PUT /api/leads/{leadId}/activities/{activityId}/reschedule
        leads.MapPut("/{leadId}/activities/{activityId}/reschedule", async (
            ClaimsPrincipal user,
            Guid leadId,
            Guid activityId,
            [FromBody] RescheduleLeadActivityRequest request,
            RescheduleLeadActivityCommandHandler handler,
            CancellationToken cancellationToken) =>
        {
            var err = RequireTenant(user, out var tenantId);
            if (err is not null) return err;

            var result = await handler.Handle(
                new RescheduleLeadActivityCommand(tenantId, leadId, activityId, request.ScheduledFor),
                cancellationToken);

            if (result.IsFailure) return Results.BadRequest(result.Errors);
            return Results.Ok("Activity rescheduled successfully");
        })
        .WithName("RescheduleLeadActivity")
        .WithSummary("Reschedule lead activity")
        .WithDescription("Changes the scheduled date of a lead activity.");

        // PUT /api/leads/{leadId}/activities/{activityId}/notes
        leads.MapPut("/{leadId}/activities/{activityId}/notes", async (
            ClaimsPrincipal user,
            Guid leadId,
            Guid activityId,
            [FromBody] UpdateLeadActivityNotesRequest request,
            UpdateLeadActivityNotesCommandHandler handler,
            CancellationToken cancellationToken) =>
        {
            var err = RequireTenant(user, out var tenantId);
            if (err is not null) return err;

            var command = new UpdateLeadActivityNotesCommand(tenantId, leadId, activityId, request.Notes);
            var result  = await handler.Handle(command, cancellationToken);
            if (result.IsFailure) return Results.BadRequest(result.Errors);

            return Results.Ok("Activity notes updated successfully");
        });
    }
}

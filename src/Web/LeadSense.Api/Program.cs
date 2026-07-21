using LeadSense.Api.Common;
using LeadSense.Infrastructure.Repository.Common;
using LeadSense.Application.Common;
using LeadSense.Infrastructure.Repository;
using LeadSense.Infrastructure.Repository.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// ── Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ── CORS
// Dev: allow all local origins. Production: read origin from config.
var allowedOrigin = builder.Configuration["Frontend:BaseUrl"] ?? "http://localhost:5173";

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy
                .WithOrigins(
                    "http://localhost:3000",
                    "http://localhost:5017",
                    "http://localhost:5173",
                    "https://localhost:3000",
                    "https://localhost:5173",
                    "https://localhost:7010")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
        else
        {
            policy
                .WithOrigins(allowedOrigin)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
    });
});

// ── Rate limiting — login endpoint: 10 attempts / minute per IP
builder.Services.AddRateLimiter(options =>
{
    options.AddSlidingWindowLimiter("login", limiter =>
    {
        limiter.PermitLimit         = 10;
        limiter.Window              = TimeSpan.FromMinutes(1);
        limiter.SegmentsPerWindow   = 2;
        limiter.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiter.QueueLimit          = 0;
    });

    // Return 429 Too Many Requests
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (ctx, ct) =>
    {
        ctx.HttpContext.Response.ContentType = "application/json";
        await ctx.HttpContext.Response.WriteAsJsonAsync(
            new[] { new { code = "rate_limit.exceeded", message = "Too many login attempts. Please wait a minute and try again." } },
            ct);
    };
});

// ── JWT Authentication 
var jwtKey = builder.Configuration["Jwt:Key"]!;

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(
                                           Encoding.UTF8.GetBytes(jwtKey)),
            // Maps the custom "role" claim to ASP.NET's role system
            RoleClaimType            = "role"
        };
    });

// ── Authorization policies 
builder.Services.AddAuthorization(options =>
{
    // SuperAdmin — manages tenants and platform configuration
    options.AddPolicy("SuperAdmin", policy =>
        policy.RequireClaim("role", "SuperAdmin"));

    // TenantAdmin — manages users within their tenant (SuperAdmin can also act here)
    options.AddPolicy("TenantAdmin", policy =>
        policy.RequireClaim("role", "TenantAdmin", "SuperAdmin"));

    // User — any authenticated user (manages leads/activities)
    options.AddPolicy("User", policy =>
        policy.RequireAuthenticatedUser());
});

// ── Application & Infrastructure layers 
builder.Services.AddApplicationLayer();
builder.Services.AddRepository();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

// ── Run migrations + seed on startup 
await RunStartupTasksAsync(app);

// ── Exception handler 
app.UseExceptionHandler(errApp => errApp.Run(async ctx =>
{
    var ex = ctx.Features
        .Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>()?.Error;

    if (ex is OperationCanceledException or TaskCanceledException)
    {
        ctx.Response.StatusCode = 499;
        return;
    }

    ctx.Response.StatusCode = 500;
    ctx.Response.ContentType = "application/json";
    await ctx.Response.WriteAsJsonAsync(new[]
    {
        new { code = "internal.server.error", message = ex?.Message ?? "An unexpected error occurred." }
    });
}));

// Swagger only in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.RegisterEndpoints();

// ── Health check endpoint (used by docker-compose healthcheck)
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }))
   .ExcludeFromDescription(); // hide from Swagger

app.Run();

// ── Startup task helper 
static async Task RunStartupTasksAsync(WebApplication app)
{
    using var scope  = app.Services.CreateScope();
    var db           = scope.ServiceProvider.GetRequiredService<LeadSenseDbContext>();
    var loggerFactory = scope.ServiceProvider.GetRequiredService<ILoggerFactory>();
    var logger       = loggerFactory.CreateLogger("Startup");

    try
    {
        // Apply any pending EF migrations automatically
        await db.Database.MigrateAsync();

        // Seed the three default roles
        await RoleSeeder.SeedAsync(db, logger);

        // Seed the three default plans
        await PlanSeeder.SeedAsync(db, logger);

        // Seed the SuperAdmin user (only if no SuperAdmin exists yet)
        await SuperAdminSeeder.SeedAsync(db, logger);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred during startup seeding.");
        throw;
    }
}

# ─── Stage 1: build ──────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /repo

# Copy solution + project files first so NuGet restore is cached
COPY LeadSenseApi.slnx                                                          ./
COPY src/Domain/LeadSense.Domain/LeadSense.Domain.csproj                       src/Domain/LeadSense.Domain/
COPY src/Application/LeadSense.Application/LeadSense.Application.csproj        src/Application/LeadSense.Application/
COPY src/Infrastructure/LeadSense.Infrastructure.Repository/LeadSense.Infrastructure.Repository.csproj \
     src/Infrastructure/LeadSense.Infrastructure.Repository/
COPY src/Web/LeadSense.Api/LeadSense.Api.csproj                                 src/Web/LeadSense.Api/
COPY tests/LeadSense.Tests/LeadSense.Tests.csproj                               tests/LeadSense.Tests/

RUN dotnet restore

# Copy everything and build
COPY . .

RUN dotnet test tests/LeadSense.Tests/LeadSense.Tests.csproj \
        --no-restore --configuration Release --verbosity minimal

RUN dotnet publish src/Web/LeadSense.Api/LeadSense.Api.csproj \
        --no-restore --configuration Release \
        --output /app/publish

# ─── Stage 2: runtime ────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Create non-root user for security (Debian-based image uses groupadd/useradd)
RUN groupadd --system appgroup && useradd --system --gid appgroup appuser
USER appuser

COPY --from=build /app/publish .

# ASP.NET Core will bind on port 8080 inside the container
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["dotnet", "LeadSense.Api.dll"]

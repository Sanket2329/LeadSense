using LeadSense.Domain.Entities;

namespace LeadSense.Application.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
}
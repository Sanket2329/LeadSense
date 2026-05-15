using LeadSense.Domain.Entities;
using LeaseSense.Application.Interfaces;

namespace LeadSense.Infrastructure.Repository.Repositories;

public class LeadRepository : ILeadRepository
{
    List<Lead> _list = new List<Lead>();
    public async Task AddAsync(Lead lead, CancellationToken cancellationToken)
    {
        _list.Add(lead);
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken)
    {
        return false;
    }
}

using LeadSense.Domain.Entities;
using LeaseSense.Application.Interfaces;

namespace LeaseSense.Application.UseCases.Leads.CreateLead;

public sealed class CreateLeadCommandHandler
{
    private readonly ILeadRepository _leadRepository;

    public CreateLeadCommandHandler(ILeadRepository leadRepository)
    {
        _leadRepository = leadRepository;
    }

    public async Task<CreateLeadResponse> Handle(CreateLeadCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var leadAlreadyExists = await _leadRepository.ExistsByEmailAsync(email, cancellationToken);

        if (leadAlreadyExists)
        {
            throw new Exception("Lead already exists");
        }

        var lead = Lead.Create(
            request.FirstName,
            request.LastName,
            email,
            request.PhoneNumber,
            request.Source);

        await _leadRepository.AddAsync(lead, cancellationToken);

        return new CreateLeadResponse(lead.Id);
    }
}

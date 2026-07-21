using LeadSense.Application.Interfaces;

namespace LeadSense.Application.UseCases.Users.GetUsers;

public sealed class GetUsersQueryHandler
{
    private readonly IUserRepository _repository;

    public GetUsersQueryHandler(IUserRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<GetUserResponse>> Handle(
        GetUsersQuery query,
        CancellationToken cancellationToken)
    {
        var users = query.TenantId.HasValue
            ? await _repository.GetAllByTenantAsync(query.TenantId.Value, cancellationToken)
            : await _repository.GetAllAsync(cancellationToken);

        return users
            .Select(x => new GetUserResponse(
                x.Id,
                x.TenantId,
                x.FirstName,
                x.LastName,
                x.Email,
                x.UserRoles.Select(ur => ur.Role.Name).ToList()))
            .ToList();
    }
}

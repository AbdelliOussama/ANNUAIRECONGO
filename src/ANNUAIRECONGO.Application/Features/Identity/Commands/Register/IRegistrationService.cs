using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Application.Features.Identity.Commands.Register;

public interface IRegistrationService
{
    Task<Result<Guid>> RegisterAsync(string email, string password, string firstName, string lastName, string phoneNumber, string? companyPosition, CancellationToken cancellationToken);
}
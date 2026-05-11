using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Identity.Commands.Register;

public sealed class RegisterCommandHandler(
    IIdentityService identityService,
    IAppDbContext context) : IRequestHandler<RegisterCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        // 1. Register User & Create BusinessOwner
        var registerResult = await identityService.RegisterAsync(
            request.Email,
            request.Password,
            request.FirstName,
            request.LastName,
            request.PhoneNumber,
            request.CompanyPosition,
            cancellationToken);

        if (registerResult.IsError)
        {
            return registerResult.Errors;
        }

        var userId = registerResult.Value;

        // 2. Create Company for the User
        var companyResult = Company.Create(
            Guid.NewGuid(),
            userId,
            request.CompanyName,
            request.CityId,
            $"Bienvenue sur la fiche de {request.CompanyName}.", // Default description
            "N/A", // Address default
            null, // Lat
            null, // Lng
            request.SectorIds,
            request.Rccm,
            request.Niu);

        if (companyResult.IsError)
        {
            // Note: In a production app, we might want to rollback the user creation here 
            // if we want strict atomicity across Identity and App DBs.
            return companyResult.Errors;
        }

        var company = companyResult.Value;
        if (!string.IsNullOrWhiteSpace(request.Website))
        {
            company.UpdateProfile(
                company.Name,
                company.Description,
                request.Website,
                company.CityId,
                company.Address ?? "N/A",
                company.Latitude,
                company.Longitude,
                request.SectorIds,
                company.Rccm,
                company.Niu,
                company.YearFounded);
        }

        context.Companies.Add(company);
        await context.SaveChangesAsync(cancellationToken);

        return userId;
    }
}

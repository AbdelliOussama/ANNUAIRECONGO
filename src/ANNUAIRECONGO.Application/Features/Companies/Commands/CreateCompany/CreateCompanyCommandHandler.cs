using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Application.Features.Companies.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Companies.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.CreateCompany;

public sealed record CreateCompanyCommandHandler(ILogger<CreateCompanyCommandHandler> Logger,IAppDbContext context , HybridCache cache) : IRequestHandler<CreateCompanyCommand, Result<CompanyDto>>
{
    public async Task<Result<CompanyDto>> Handle(CreateCompanyCommand request, CancellationToken cancellationToken)
    {
        var Existing = await context.Companies.AnyAsync(c => c.Name == request.Name);
        if (Existing)
        {
            Logger.LogWarning("Company with name {Name} already exists", request.Name);
            return CompanyErrors.NameAlreadyExists(request.Name);
        }
        var CompanyCreateResult = Company.Create(Guid.NewGuid(), request.OwnerId, request.Name, request.CityId,request.Description,request.Address,request.Latitude,request.Longitude, request.SectorIds);
        if (CompanyCreateResult.IsError)
        {
            return CompanyCreateResult.Errors;
        }
        var company = CompanyCreateResult.Value;
        await context.Companies.AddAsync(company);

        company.AddDomainEvent(new CompanyCreatedEvent(company.Id,company.OwnerId.ToString(), company.Name));

        await context.SaveChangesAsync(cancellationToken);
        await cache.RemoveByTagAsync("company");
        return company.ToDto();
    }
}
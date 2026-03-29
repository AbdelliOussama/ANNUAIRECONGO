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

public sealed record CreateCompanyCommandHandler(ILogger<CreateCompanyCommandHandler> Logger,IAppDbContext context , HybridCache cache, IUser User) : IRequestHandler<CreateCompanyCommand, Result<CompanyDto>>
{
    private readonly ILogger<CreateCompanyCommandHandler> _logger = Logger;
    private readonly IAppDbContext _context = context;
    private readonly HybridCache _cache = cache;
    private readonly IUser _user = User;
    public async Task<Result<CompanyDto>> Handle(CreateCompanyCommand request, CancellationToken cancellationToken)
    {
        var Existing = await context.Companies.AnyAsync(c => c.Name == request.Name);
        if (Existing)
        {
            _logger.LogWarning("Company with name {Name} already exists", request.Name);
            return CompanyErrors.NameAlreadyExists(request.Name);
        }
        var CompanyCreateResult = Company.Create(Guid.NewGuid(), Guid.Parse(_user.Id), request.Name, request.CityId,request.Description,request.Address,request.Latitude,request.Longitude, request.SectorIds);
        if (CompanyCreateResult.IsError)
        {
            _logger.LogWarning("Failed to create company with name {Name}", request.Name);
            return CompanyCreateResult.Errors;
        }
        var company = CompanyCreateResult.Value;
        await _context.Companies.AddAsync(company);

        company.AddDomainEvent(new CompanyCreatedEvent(company.Id,company.OwnerId.ToString(), company.Name));
        _logger.LogInformation("Company with name {Name} created successfully", request.Name);

        await _context.SaveChangesAsync(cancellationToken);
        await _cache.RemoveByTagAsync("company");
        return company.ToDto();
    }
}
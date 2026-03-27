using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.UpdateComanyProfile;

public sealed record UpdateCompanyProfileCommand(
        Guid companyId,
        string name,
        string? description,
        string? website,
        Guid cityId,
        string? address,
        decimal? latitude,
        decimal? longitude,
        IEnumerable<Guid> sectorIds
): IRequest<Result<Updated>>;
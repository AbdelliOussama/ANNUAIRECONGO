using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.UpdateComanyProfile;

public sealed record UpdateCompanyProfileCommand(
        Guid companyId,
        string name,
        string? description,
        string? website,
        Guid cityId,
        string address,
        decimal? latitude,
        decimal? longitude,
        IEnumerable<Guid> sectorIds,
        string? rccm,
        string? niu,
        int? yearFounded,
        string? logoUrl = null,
        string? coverUrl = null,
        string? phoneNumber = null,
        string? contactEmail = null
): IRequest<Result<Updated>>;

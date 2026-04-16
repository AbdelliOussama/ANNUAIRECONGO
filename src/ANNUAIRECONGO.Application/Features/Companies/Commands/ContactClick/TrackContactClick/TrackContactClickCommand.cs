using ANNUAIRECONGO.Domain.Companies.Enums;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.ContactClick.TrackContactClick;

public sealed record TrackContactClickCommand(Guid CompanyId, ContactType ContactType) : IRequest<Result<Updated>>;
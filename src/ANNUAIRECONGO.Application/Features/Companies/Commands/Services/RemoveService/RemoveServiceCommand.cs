using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Services.RemoveService;

public sealed record RemoveServiceCommand(Guid CompanyId, Guid ServiceId) : IRequest<Result<Updated>>;
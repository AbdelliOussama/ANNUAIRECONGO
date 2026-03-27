using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.PlanManagment.ClearActiveSubscription;

public sealed record ClearActiveSubscriptionCommand(Guid CompanyId) : IRequest<Result<Updated>>;
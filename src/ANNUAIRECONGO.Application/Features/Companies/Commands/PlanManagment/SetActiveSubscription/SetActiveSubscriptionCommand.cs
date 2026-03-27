using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.PlanManagment.SetActiveSubscription;

public sealed record SetActiveSubscriptionCommand(Guid CompanyId, Guid SubscriptionId) : IRequest<Result<Updated>>;
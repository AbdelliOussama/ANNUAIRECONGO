using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.PlanManagment.SetFeatured;

public sealed record SetFeatureCommand(Guid CompanyId, bool IsFeatured) : IRequest<Result<Updated>>;
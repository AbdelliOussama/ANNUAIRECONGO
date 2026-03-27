using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.StatusTransition.SubmitCompany;
public sealed record SubmitCompanyCommand(Guid companyId) : IRequest<Result<Updated>>;

using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Services.AddService;
public sealed record AddServiceCommand(Guid CompanyId, string Title, string? Description) : IRequest<Result<Updated>>;

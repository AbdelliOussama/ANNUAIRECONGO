using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Images.AddImage;

public sealed record AddImageCommand(Guid CompanyId,string ImageUrl,string? Caption) : IRequest<Result<Updated>>;

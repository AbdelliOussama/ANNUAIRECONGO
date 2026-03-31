using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Images.RemoveImage;

public sealed record RemoveImageCommand(Guid CompanyId,Guid ImageId) : IRequest<Result<Updated>>;

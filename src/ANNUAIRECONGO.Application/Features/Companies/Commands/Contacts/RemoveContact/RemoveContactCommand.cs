using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Contacts.RemoveContact;

public sealed record RemoveContactCommand(Guid CompanyId, Guid ContactId) : IRequest<Result<Updated>>;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies.Enums;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Contacts.UpdateContact;

public sealed record UpdateContactCommand(Guid CompanyId,Guid ContactId, ContactType Type, string Value, bool IsPrimary) : IRequest<Result<Updated>>;

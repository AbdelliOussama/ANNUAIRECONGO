using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies.Enums;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Contacts.AddContact;

public sealed record AddContactCommand(Guid CompanyId, ContactType Type, string Value, bool IsPrimary) : IRequest<Result<Updated>>;

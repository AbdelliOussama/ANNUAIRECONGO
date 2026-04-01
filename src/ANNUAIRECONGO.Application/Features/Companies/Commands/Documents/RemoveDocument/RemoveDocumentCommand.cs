using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Documents.RemoveDocument;

public sealed record RemoveDocumentCommand(Guid CompanyId, Guid DocumentId) : IRequest<Result<Updated>>;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Documents.AddDocument;

public sealed record AddDocumentCommand(Guid CompanyId, string DocumentUrl, string DocumentType, string? Description, bool? isPublic = false) : IRequest<Result<Updated>>;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies.Enums;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Documents.AddDocument;

public sealed record AddDocumentCommand(Guid CompanyId, string DocumentUrl, DocumentType DocumentType, string? Description, bool? isPublic = false) : IRequest<Result<Updated>>;
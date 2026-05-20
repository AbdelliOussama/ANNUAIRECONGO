using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;
using System;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.GenerateTrustScore;

public sealed record GenerateTrustScoreAnalysisCommand(Guid CompanyId, int? ManualScore = null) : IRequest<Result<CompanyDto>>;

using MediatR;
using System;
using System.Collections.Generic;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;

namespace ANNUAIRECONGO.Application.Features.Companies.Queries.GetRecommendations;

public sealed record GetCompanyRecommendationsQuery(Guid CompanyId) : IRequest<Result<List<CompanyDto>>>;

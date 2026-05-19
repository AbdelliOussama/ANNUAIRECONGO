using System;
using System.Collections.Generic;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.GenerateDescription;

public sealed record GenerateCompanyDescriptionCommand(
    Guid CompanyId,
    string Name,
    IEnumerable<string> Sectors,
    string City,
    IEnumerable<string> Services
) : IRequest<Result<string>>;

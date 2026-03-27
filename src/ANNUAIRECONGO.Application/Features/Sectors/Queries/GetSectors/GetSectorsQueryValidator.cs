using FluentValidation;

namespace ANNUAIRECONGO.Application.Features.Sectors.Queries.GetSectors;

public sealed class GetSectorsQueryValidator : AbstractValidator<GetSectorsQuery>
{
    public GetSectorsQueryValidator()
    {
        // No validation rules needed for GetSectorsQuery
    }
}
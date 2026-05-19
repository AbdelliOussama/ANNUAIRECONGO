using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

public record ExtractedSearchFilters(
    string? SearchTerm,
    string? SectorName,
    string? CityName
);

public interface IGrokService
{
    Task<string> GenerateCompanyDescriptionAsync(
        string name,
        IEnumerable<string> sectors,
        string city,
        IEnumerable<string> services,
        CancellationToken cancellationToken);

    Task<ExtractedSearchFilters> ExtractSearchFiltersAsync(
        string smartSearchQuery,
        CancellationToken cancellationToken);
}

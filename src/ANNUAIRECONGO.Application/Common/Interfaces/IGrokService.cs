using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using ANNUAIRECONGO.Application.Common.Models;

namespace ANNUAIRECONGO.Application.Common.Interfaces;

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

    Task<List<SectorIntelligenceReport>> GetSectorReportsAsync(CancellationToken cancellationToken);

    Task<SectorIntelligenceReport> GenerateSectorReportAsync(
        string sectorName,
        string dataJsonContext,
        CancellationToken cancellationToken);

    Task<string> GetChatResponseAsync(
        string userMessage,
        IEnumerable<ChatMessage> history,
        string dbContext,
        CancellationToken cancellationToken);

    Task<List<string>> ExtractSemanticKeywordsAsync(
        string name,
        string? description,
        IEnumerable<string> sectors,
        IEnumerable<string> services,
        CancellationToken cancellationToken);
}

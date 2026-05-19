using System;
using System.Threading;
using System.Threading.Tasks;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.GenerateDescription;

public sealed class GenerateCompanyDescriptionCommandHandler : IRequestHandler<GenerateCompanyDescriptionCommand, Result<string>>
{
    private readonly IGrokService _grokService;
    private readonly ILogger<GenerateCompanyDescriptionCommandHandler> _logger;

    public GenerateCompanyDescriptionCommandHandler(
        IGrokService grokService,
        ILogger<GenerateCompanyDescriptionCommandHandler> logger)
    {
        _grokService = grokService;
        _logger = logger;
    }

    public async Task<Result<string>> Handle(GenerateCompanyDescriptionCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Generating description for company {CompanyName}", request.Name);

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return Error.Validation("Name", "Le nom de l'entreprise est requis.");
        }

        try
        {
            var description = await _grokService.GenerateCompanyDescriptionAsync(
                request.Name,
                request.Sectors,
                request.City,
                request.Services,
                cancellationToken);

            return description;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate company description for {CompanyName}", request.Name);
            return Error.Failure("AI.GenerationFailed", $"Échec de la génération de la description: {ex.Message}");
        }
    }
}

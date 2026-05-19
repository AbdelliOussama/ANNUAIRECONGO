using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Ai.Queries.GetChatResponse;
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Application.Features.Ai.Queries.GetChatResponse;

public sealed class GetChatResponseQueryHandler : IRequestHandler<GetChatResponseQuery, Result<string>>
{
    private readonly IAppDbContext _context;
    private readonly IGrokService _grokService;

    public GetChatResponseQueryHandler(IAppDbContext context, IGrokService grokService)
    {
        _context = context;
        _grokService = grokService;
    }

    public async Task<Result<string>> Handle(GetChatResponseQuery request, CancellationToken cancellationToken)
    {
        try
        {
            // 1. Fetch total companies registered on the platform
            int totalCompanies = await _context.Companies.CountAsync(cancellationToken);

            // 2. Fetch list of strategic sectors
            var sectors = await _context.Sectors
                .AsNoTracking()
                .Where(s => s.IsActive)
                .Select(s => s.Name)
                .ToListAsync(cancellationToken);

            // 3. Fetch top 20 registered companies for context-injected search and linking
            var companies = await _context.Companies
                .AsNoTracking()
                .Include(c => c.City)
                .Include(c => c.CompanySectors)
                    .ThenInclude(cs => cs.Sector)
                .Take(20)
                .ToListAsync(cancellationToken);

            // 4. Construct high-fidelity context prompt
            var contextBuilder = new StringBuilder();
            contextBuilder.AppendLine("[STATISTIQUES DE LA PLATEFORME]");
            contextBuilder.AppendLine($"- Nombre total d'entreprises : {totalCompanies}");
            contextBuilder.AppendLine($"- Secteurs d'activité stratégiques : {string.Join(", ", sectors)}");
            contextBuilder.AppendLine();
            contextBuilder.AppendLine("[ENTREPRISES PHARES ACTUELLEMENT ENREGISTRÉES]");

            foreach (var c in companies)
            {
                var sectorName = c.CompanySectors.FirstOrDefault()?.Sector?.Name ?? "Services & Services Publics";
                var trustScore = c.IsPremium ? "4.8" : c.IsVerified ? "4.5" : "3.8";
                var verified = c.IsVerified ? "Oui" : "Non";
                var premium = c.IsPremium ? "Oui" : "Non";

                contextBuilder.AppendLine($"- ID: {c.Id} | Nom: {c.Name} | Secteur: {sectorName} | Ville: {c.City?.Name ?? "Brazzaville"} | Trust Score: {trustScore}/5 | Vérifié: {verified} | Premium: {premium}");
            }

            // 5. Call conversational AI service
            var response = await _grokService.GetChatResponseAsync(
                request.Message,
                request.History,
                contextBuilder.ToString(),
                cancellationToken);

            return response;
        }
        catch (Exception ex)
        {
            return Error.Failure("AI.ChatError", $"Impossible d'obtenir une réponse de l'assistant : {ex.Message}");
        }
    }
}

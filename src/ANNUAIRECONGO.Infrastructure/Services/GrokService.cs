using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Common.Models;
using Microsoft.Extensions.Options;

namespace ANNUAIRECONGO.Infrastructure.Services;

public class GrokService : IGrokService
{
    private readonly HttpClient _httpClient;
    private readonly GrokSettings _settings;

    public GrokService(HttpClient httpClient, IOptions<GrokSettings> settings)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
    }

    public async Task<string> GenerateCompanyDescriptionAsync(
        string name,
        IEnumerable<string> sectors,
        string city,
        IEnumerable<string> services,
        CancellationToken cancellationToken)
    {
        var sectorsStr = string.Join(", ", sectors);
        var servicesStr = services != null && services.Any() ? string.Join(", ", services) : "divers services";

        var prompt = $"Générer une description d'entreprise professionnelle, attrayante et concise en français d'environ 150 mots pour l'entreprise '{name}', évoluant dans le(s) secteur(s) '{sectorsStr}' et située à '{city}', Congo. L'entreprise propose les services/produits suivants : '{servicesStr}'. Assurez-vous d'utiliser un ton professionnel, adapté au contexte commercial congolais. Ne pas inclure de texte d'introduction, de balises de mise en forme (comme du markdown ou des étoiles de gras), de remarques de politesse ou de placeholders. Renvoyez uniquement la description générée en français.";

        var requestBody = new
        {
            model = _settings.Model,
            messages = new[]
            {
                new { role = "user", content = prompt }
            }
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.groq.com/openai/v1/chat/completions");
        request.Content = content;
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _settings.ApiKey);

        var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new HttpRequestException($"Groq API returned status code {response.StatusCode}: {errorContent}");
        }

        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

        using var doc = JsonDocument.Parse(responseContent);
        var root = doc.RootElement;

        if (root.TryGetProperty("choices", out var choices) &&
            choices.ValueKind == JsonValueKind.Array &&
            choices.GetArrayLength() > 0)
        {
            var firstChoice = choices[0];
            if (firstChoice.TryGetProperty("message", out var messageProp) &&
                messageProp.TryGetProperty("content", out var contentProp))
            {
                var text = contentProp.GetString();
                if (!string.IsNullOrWhiteSpace(text))
                {
                    return text.Trim();
                }
            }
        }

        throw new InvalidOperationException("Failed to parse response from Groq API.");
    }

    public async Task<ExtractedSearchFilters> ExtractSearchFiltersAsync(
        string smartSearchQuery,
        CancellationToken cancellationToken)
    {
        var prompt = "Tu es un extracteur de filtres de recherche en français extrêmement précis pour un annuaire d'entreprises au Congo. " +
                     "Analyse la requête en langage naturel de l'utilisateur et extrait les filtres structurés suivants sous forme de JSON :\n" +
                     "- searchTerm : mots-clés principaux pour rechercher l'activité (ex: 'transit', 'hôtel', 'avocat', 'sécurité')\n" +
                     "- sectorName : le nom ou type de secteur s'il est mentionné ou fortement induit (ex: 'Maritime & Portuaire', 'Santé & Médical', 'Hôtellerie & Restauration', 'Sécurité')\n" +
                     "- cityName : la ville congolaise mentionnée (ex: 'Brazzaville', 'Pointe-Noire', 'Dolisie')\n\n" +
                     "Règles :\n" +
                     "1. Rends uniquement un objet JSON valide avec les propriétés : \"searchTerm\", \"sectorName\", \"cityName\".\n" +
                     "2. Ne mets aucun texte d'introduction, d'explication ou de mise en forme (pas de bloc de code ```json). Rends UNIQUEMENT le JSON brut.\n" +
                     "3. Si un filtre n'est pas extrait, mets null.\n\n" +
                     $"Requête de l'utilisateur : \"{smartSearchQuery}\"\n" +
                     "JSON :";

        var requestBody = new
        {
            model = _settings.Model,
            messages = new[]
            {
                new { role = "user", content = prompt }
            },
            temperature = 0.1
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.groq.com/openai/v1/chat/completions");
        request.Content = content;
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _settings.ApiKey);

        var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new HttpRequestException($"Groq API returned status code {response.StatusCode}: {errorContent}");
        }

        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

        using var doc = JsonDocument.Parse(responseContent);
        var root = doc.RootElement;

        if (root.TryGetProperty("choices", out var choices) &&
            choices.ValueKind == JsonValueKind.Array &&
            choices.GetArrayLength() > 0)
        {
            var firstChoice = choices[0];
            if (firstChoice.TryGetProperty("message", out var messageProp) &&
                messageProp.TryGetProperty("content", out var contentProp))
            {
                var text = contentProp.GetString()?.Trim();
                if (!string.IsNullOrWhiteSpace(text))
                {
                    if (text.StartsWith("```"))
                    {
                        var lines = text.Split('\n');
                        text = string.Join("\n", lines.Where(l => !l.Trim().StartsWith("```")));
                    }
                    text = text.Trim();

                    try
                    {
                        using var parsedJson = JsonDocument.Parse(text);
                        var jsonRoot = parsedJson.RootElement;
                        
                        string? searchTerm = jsonRoot.TryGetProperty("searchTerm", out var st) && st.ValueKind != JsonValueKind.Null ? st.GetString() : null;
                        string? sectorName = jsonRoot.TryGetProperty("sectorName", out var sec) && sec.ValueKind != JsonValueKind.Null ? sec.GetString() : null;
                        string? cityName = jsonRoot.TryGetProperty("cityName", out var cit) && cit.ValueKind != JsonValueKind.Null ? cit.GetString() : null;

                        return new ExtractedSearchFilters(searchTerm, sectorName, cityName);
                    }
                    catch (Exception)
                    {
                        return new ExtractedSearchFilters(smartSearchQuery, null, null);
                    }
                }
            }
        }

        return new ExtractedSearchFilters(smartSearchQuery, null, null);
    }

    private string GetStoragePath()
    {
        var dir = Path.Combine(AppContext.BaseDirectory, "App_Data");
        if (!Directory.Exists(dir))
        {
            Directory.CreateDirectory(dir);
        }
        return Path.Combine(dir, "sector_reports.json");
    }

    public async Task<List<SectorIntelligenceReport>> GetSectorReportsAsync(CancellationToken cancellationToken)
    {
        var filePath = GetStoragePath();
        if (!File.Exists(filePath))
        {
            var initialReports = GetPreGeneratedReports();
            var json = JsonSerializer.Serialize(initialReports, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(filePath, json, Encoding.UTF8, cancellationToken);
            return initialReports;
        }

        try
        {
            var json = await File.ReadAllTextAsync(filePath, Encoding.UTF8, cancellationToken);
            return JsonSerializer.Deserialize<List<SectorIntelligenceReport>>(json) ?? GetPreGeneratedReports();
        }
        catch
        {
            return GetPreGeneratedReports();
        }
    }

    public async Task<SectorIntelligenceReport> GenerateSectorReportAsync(
        string sectorName,
        string dataJsonContext,
        CancellationToken cancellationToken)
    {
        var prompt = "Tu es un économiste expert de l'Afrique subsaharienne et de l'économie congolaise. " +
                     $"Basé sur les données d'enregistrement réelles suivantes issues de l'annuaire d'entreprises ANNUAIRECONGO pour le secteur '{sectorName}' :\n" +
                     $"{dataJsonContext}\n\n" +
                     "Génère un rapport d'analyse sectorielle professionnel et détaillé en français (au format Markdown, avec des titres, sous-titres, listes à puces).\n" +
                     "Le rapport doit inclure :\n" +
                     "1. Un aperçu de la dynamique actuelle du secteur au Congo.\n" +
                     "2. Une analyse des tendances d'enregistrement et de répartition géographique.\n" +
                     "3. Des opportunités et défis économiques spécifiques pour le Congo-Brazzaville.\n" +
                     "4. Des recommandations stratégiques concrètes pour les décideurs et investisseurs.\n\n" +
                     "Sois très professionnel, précis et réaliste. N'affiche aucun préambule ou explication de politesse, renvoie directement le rapport rédigé en Markdown de façon structurée et très complète (environ 350-450 mots).";

        var requestBody = new
        {
            model = _settings.Model,
            messages = new[]
            {
                new { role = "user", content = prompt }
            },
            temperature = 0.5
        };

        var jsonStr = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(jsonStr, Encoding.UTF8, "application/json");

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.groq.com/openai/v1/chat/completions");
        request.Content = content;
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _settings.ApiKey);

        var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new HttpRequestException($"Groq API returned status code {response.StatusCode}: {errorContent}");
        }

        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

        using var doc = JsonDocument.Parse(responseContent);
        var root = doc.RootElement;

        string reportContent = string.Empty;
        if (root.TryGetProperty("choices", out var choices) &&
            choices.ValueKind == JsonValueKind.Array &&
            choices.GetArrayLength() > 0)
        {
            var firstChoice = choices[0];
            if (firstChoice.TryGetProperty("message", out var messageProp) &&
                messageProp.TryGetProperty("content", out var contentProp))
            {
                var text = contentProp.GetString()?.Trim();
                if (!string.IsNullOrWhiteSpace(text))
                {
                    if (text.StartsWith("```"))
                    {
                        var lines = text.Split('\n');
                        text = string.Join("\n", lines.Where(l => !l.Trim().StartsWith("```")));
                    }
                    reportContent = text.Trim();
                }
            }
        }

        if (string.IsNullOrWhiteSpace(reportContent))
        {
            reportContent = "### Analyse Indisponible\nUne erreur est survenue lors de la génération du rapport par l'IA.";
        }

        string icon = "analytics";
        if (sectorName.Contains("Maritime", StringComparison.OrdinalIgnoreCase)) icon = "directions_boat";
        else if (sectorName.Contains("Logistique", StringComparison.OrdinalIgnoreCase)) icon = "local_shipping";
        else if (sectorName.Contains("Douane", StringComparison.OrdinalIgnoreCase)) icon = "receipt_long";
        else if (sectorName.Contains("Industrie", StringComparison.OrdinalIgnoreCase)) icon = "factory";
        else if (sectorName.Contains("Sécurité", StringComparison.OrdinalIgnoreCase)) icon = "security";
        else if (sectorName.Contains("Manutention", StringComparison.OrdinalIgnoreCase)) icon = "conveyor_belt";

        var newReport = new SectorIntelligenceReport
        {
            Id = Guid.NewGuid().ToString(),
            Title = $"Analyse d'intelligence : {sectorName}",
            SectorName = sectorName,
            Content = reportContent,
            Excerpt = reportContent.Length > 160 ? reportContent.Substring(0, 160).Replace("#", "").Trim() + "..." : reportContent,
            Icon = icon,
            Date = DateTimeOffset.UtcNow.ToString("MMM yyyy", new System.Globalization.CultureInfo("fr-FR")),
            GeneratedAt = DateTimeOffset.UtcNow
        };

        var allReports = await GetSectorReportsAsync(cancellationToken);
        allReports.Insert(0, newReport);

        var filePath = GetStoragePath();
        var serializedAll = JsonSerializer.Serialize(allReports, new JsonSerializerOptions { WriteIndented = true });
        await File.WriteAllTextAsync(filePath, serializedAll, Encoding.UTF8, cancellationToken);

        return newReport;
    }

    private List<SectorIntelligenceReport> GetPreGeneratedReports()
    {
        return new List<SectorIntelligenceReport>
        {
            new SectorIntelligenceReport
            {
                Id = "7a26f8eb-3294-4364-bbcf-847ef71a2a51",
                Title = "Le secteur maritime au 1er trimestre 2026",
                SectorName = "Maritime",
                Content = "### Rapport de performance : Activité Maritime & Portuaire\n\n#### 1. Conjoncture Portuaire à Pointe-Noire\nLe Port Autonome de Pointe-Noire (PAPN) consolide son statut de hub majeur en Afrique centrale avec une progression de **4.2%** du trafic conteneurisé par rapport à l'année précédente. Les investissements dans la modernisation des infrastructures portuaires commencent à porter leurs fruits, réduisant le temps d'attente moyen des navires à quai.\n\n#### 2. Indicateurs clés de l'écosystème\n- **Compagnies enregistrées** : Croissance soutenue avec +5 nouveaux acteurs dans la consignation et l'avitaillement maritime.\n- **Répartition géographique** : Concentration exclusive (**100%**) des activités opérationnelles à Pointe-Noire, reflet du poumon économique côtier de la République du Congo.\n\n#### 3. Défis & Opportunités\n- **Défis** : Fluctuations des taux de fret internationaux et congestion ponctuelle des voies terrestres d'évacuation.\n- **Opportunités** : L'essor de la Zone Économique Spéciale (ZES) de Pointe-Noire qui devrait stimuler les importations de matières premières et les exportations de produits manufacturés.",
                Excerpt = "Volume de fret, escales du port autonome et acteurs majeurs. Analyse conjoncturelle détaillée et comparaison annuelle.",
                Icon = "directions_boat",
                Date = "Avr 2026",
                GeneratedAt = DateTimeOffset.UtcNow.AddDays(-20)
            },
            new SectorIntelligenceReport
            {
                Id = "c25381a1-3965-4f4b-bf72-47de31f185df",
                Title = "Logistique terrestre — corridor Pointe-Noire / Brazzaville",
                SectorName = "Logistique",
                Content = "### Corridor national : Analyse du transport terrestre\n\n#### 1. Dynamique du Corridor Routier (Route Nationale 1)\nLa RN1 reste l'artère vitale connectant le littoral maritime à la capitale politique. Le flux de marchandises par voie routière a enregistré une hausse estimée à **6.8%**, portée par le dynamisme de la distribution intérieure.\n\n#### 2. Tendances et infrastructures\nLe transport multimodal (combinaison rail-route) montre des signes de reprise progressifs. Cependant, l'insuffisance de zones logistiques modernes intermédiaires limite l'optimisation des flux de rupture de charge.\n\n#### 3. Défis logistiques\n- **Coûts de passage** : Les frais logistiques globaux restent élevés, pesant sur le prix final des biens de consommation à Brazzaville.\n- **Maintenance routière** : Nécessité d'assurer un entretien constant face aux surcharges d'essieux fréquentes.",
                Excerpt = "État de la chaîne de transport terrestre, indicateurs de flux routiers, goulots d'entranglement et opportunités de stockage.",
                Icon = "local_shipping",
                Date = "Avr 2026",
                GeneratedAt = DateTimeOffset.UtcNow.AddDays(-25)
            },
            new SectorIntelligenceReport
            {
                Id = "f5eb0d8b-1175-472e-bd32-841961f68ea3",
                Title = "Évolution des opérations douanières et de transit",
                SectorName = "Douane",
                Content = "### Modernisation douanière : Rapport trimestriel\n\n#### 1. Simplification des procédures de dédouanement\nL'implémentation de la digitalisation des déclarations douanières a permis de réduire le délai de traitement administratif de **12 heures** en moyenne. La transparence accrue est saluée par l'ensemble des transitaires agréés du pays.\n\n#### 2. Activités déclaratives\nOn observe une hausse des déclarations d'importation sur les biens d'équipement industriels, signe annonciateur d'une reprise des investissements de production locale.\n\n#### 3. Recommandations\n- Accélérer la formation des déclarants aux outils de dématérialisation.\n- Harmoniser les processus douaniers aux frontières terrestres pour encourager le commerce sous-régional.",
                Excerpt = "Tendances déclaratives, délais moyens de transit douanier et impact de la numérisation des guichets uniques.",
                Icon = "receipt_long",
                Date = "Mar 2026",
                GeneratedAt = DateTimeOffset.UtcNow.AddDays(-40)
            }
        };
    }
}

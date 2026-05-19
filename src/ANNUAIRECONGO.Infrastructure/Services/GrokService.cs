using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using ANNUAIRECONGO.Application.Common.Interfaces;
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
}

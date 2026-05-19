using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading;
using System.Threading.Tasks;
using ANNUAIRECONGO.Application.Features.Ai.Queries.GetChatResponse;

namespace ANNUAIRECONGO.Api.Controllers;

[Route("api/v{version:apiVersion}/ai")]
[ApiVersion("1.0")]
[Authorize]
public sealed class AiController(ISender sender) : ApiController
{
    private readonly ISender _sender = sender;

    [HttpPost("chat")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [EndpointSummary("Retrieves a conversational response from the AI assistant.")]
    [EndpointDescription("Injects real database stats and calls Groq Llama-3 in conversational mode.")]
    [EndpointName("GetChatResponse")]
    [MapToApiVersion("1.0")]
    [AllowAnonymous]
    public async Task<IActionResult> GetChatResponse([FromBody] GetChatResponseQuery query, CancellationToken ct)
    {
        var result = await _sender.Send(query, ct);
        return result.Match(
            response => Ok(new { response }),
            Problem);
    }
}

using MediatR;
using System.Collections.Generic;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Application.Common.Models;

namespace ANNUAIRECONGO.Application.Features.Ai.Queries.GetChatResponse;

public record GetChatResponseQuery(
    string Message,
    List<ChatMessage> History) : IRequest<Result<string>>;

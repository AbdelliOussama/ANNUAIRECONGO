using ANNUAIRECONGO.Domain.Common.Results;
using FluentValidation;
using MediatR;

using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Common.Behaviors;

public class ValidationBehavior<TRequest, TResponse>(IEnumerable<IValidator<TRequest>>? validators = null, ILogger<ValidationBehavior<TRequest, TResponse>>? logger = null)
    : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
        where TResponse : IResult
{
    private readonly IEnumerable<IValidator<TRequest>> _validators = validators ?? Enumerable.Empty<IValidator<TRequest>>();
    private readonly ILogger<ValidationBehavior<TRequest, TResponse>> _logger = logger;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        if (!_validators.Any())
        {
            return await next(ct);
        }

        var context = new ValidationContext<TRequest>(request);
        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, ct)));

        var failures = validationResults
            .SelectMany(r => r.Errors)
            .Where(f => f != null)
            .ToList();

        if (failures.Count == 0)
        {
            return await next(ct);
        }

        // Log validation failures for debugging
        _logger.LogWarning("Validation failed for {RequestType}: {Failures}", 
            typeof(TRequest).Name, 
            string.Join(", ", failures.Select(f => $"{f.PropertyName}: {f.ErrorMessage}")));

        var errors = failures
            .ConvertAll(error => Error.Validation(
                code: error.PropertyName,
                description: error.ErrorMessage));

        // Use a more robust way to create the error result if possible, 
        // but dynamic is kept for compatibility with the generic TResponse constraint for now.
        return (dynamic)errors;
    }
}

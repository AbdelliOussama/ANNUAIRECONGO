using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace ANNUAIRECONGO.Api.Infrastructure;

public class GlobalExceptionHandler : IExceptionHandler
{

    #region
    private readonly IProblemDetailsService _problemDetailsService;
    private readonly ILogger<GlobalExceptionHandler> _logger;
    private readonly IWebHostEnvironment _env;

    public GlobalExceptionHandler(
        IProblemDetailsService problemDetailsService, 
        ILogger<GlobalExceptionHandler> logger,
        IWebHostEnvironment env)
    {
        _problemDetailsService = problemDetailsService;
        _logger = logger;
        _env = env;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        // Handle client-cancelled requests gracefully (e.g. search-as-you-type abort)
        if (exception is OperationCanceledException)
        {
            _logger.LogDebug("Request was cancelled by the client: {Path}", httpContext.Request.Path);
            httpContext.Response.StatusCode = 499; // Client Closed Request (nginx convention)
            return true; // Handled — no ProblemDetails body needed
        }

        _logger.LogError(exception, "An unhandled exception occurred: {Message}", exception.Message);

        httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;

        var detail = _env.IsDevelopment() 
            ? exception.Message 
            : "An unexpected error occurred. Please try again later.";

        return await _problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = new ProblemDetails
            {
                Type = exception.GetType().Name,
                Title = "Application error",
                Detail = detail,
            }
        });
    }
    #endregion

}

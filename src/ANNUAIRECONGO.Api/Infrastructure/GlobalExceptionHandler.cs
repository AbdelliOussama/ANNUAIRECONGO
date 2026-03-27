using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace ANNUAIRECONGO.Api.Infrastructure;

public class GlobalExceptionHandler : IExceptionHandler
{

    #region
    private readonly IProblemDetailsService problemDetailsService;
    #endregion

    #region Constructors
    public GlobalExceptionHandler(IProblemDetailsService problemDetailsService)
    {
        this.problemDetailsService = problemDetailsService;
    }
    #endregion

    #region IExceptionHandler Implementation
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;

        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = new ProblemDetails
            {
                Type = exception.GetType().Name,
                Title = "Application error",
                Detail = exception.Message,
            }
        });
    }
    #endregion

}
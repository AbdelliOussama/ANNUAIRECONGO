using Serilog.Context;

namespace ANNUAIRECONGO.Api.Infrastructure;

public class RequestLogContextMiddleware
{
    private readonly RequestDelegate _next;

    public RequestLogContextMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public Task InvokeAsync(HttpContext httpContext)
    {
        using (LogContext.PushProperty("CorrelationId", httpContext.TraceIdentifier))
        {
            // the purpose is pushing the request correlation id into the log context
            // to be included in the structured log of a life time of http request
            return _next(httpContext);
        }
    }
}

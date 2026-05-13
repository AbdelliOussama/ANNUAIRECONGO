using ANNUAIRECONGO.Application.Common;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Domain.Common.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Queries.GetReports;

public sealed record GetReportsQueryHandler(IAppDbContext Context, ILogger<GetReportsQueryHandler> Logger) : IRequestHandler<GetReportsQuery, Result<PaginatedList<CompanyReportDto>>>
{
    private readonly IAppDbContext _context = Context;
    private readonly ILogger<GetReportsQueryHandler> _logger = Logger;

    public async Task<Result<PaginatedList<CompanyReportDto>>> Handle(GetReportsQuery request, CancellationToken cancellationToken)
    {
        var query = from r in _context.CompanyReports.AsNoTracking()
                    join c in _context.Companies.AsNoTracking() on r.CompanyId equals c.Id into g
                    from c in g.DefaultIfEmpty()
                    orderby r.CreatedAt descending
                    select new { Report = r, CompanyName = c != null ? c.Name : "Unknown Company" };

        var totalCount = await query.CountAsync(cancellationToken);
        
        var reports = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var reportDtos = reports.Select(r => new CompanyReportDto(
            r.Report.Id,
            r.Report.CompanyId,
            r.CompanyName,
            r.Report.ReporterIp,
            r.Report.Reason,
            (int)r.Report.Status,
            r.Report.CreatedAt
        )).ToList();

        var paginatedList = new PaginatedList<CompanyReportDto>
        {
            Items = reportDtos,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize)
        };

        return paginatedList;
    }
}

using System.Text.Json;
using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Identity;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Application.Features.Identity.Queries.ExportData;

public sealed class ExportDataQueryHandler(
    IIdentityService identityService,
    IAppDbContext context)
    : IRequestHandler<ExportDataQuery, Result<string>>
{
    public async Task<Result<string>> Handle(ExportDataQuery request, CancellationToken cancellationToken)
    {
        var userResult = await identityService.GetUserByIdAsync(request.UserId);
        if (!userResult.IsSuccess)
        {
            return IdentityErrors.UserNotFound;
        }
        var user = userResult.Value;

        var profile = await context.BusinessOwners
            .Include(bo => bo.Companies)
            .FirstOrDefaultAsync(bo => bo.Id == Guid.Parse(request.UserId), cancellationToken);

        var exportData = new
        {
            User = new
            {
                user.UserId,
                user.Email,
                user.FirstName,
                user.LastName,
                user.PhoneNumber
            },
            Profile = profile == null ? null : new
            {
                profile.CompanyPosition,
                profile.IsVerified,
                profile.CreatedAtUtc,
                Companies = profile.Companies.Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Description,
                    c.Status,
                    c.Rccm,
                    c.Niu,
                    c.YearFounded,
                    c.CreatedAtUtc
                })
            }
        };

        var json = JsonSerializer.Serialize(exportData, new JsonSerializerOptions { WriteIndented = true });
        return json;
    }
}

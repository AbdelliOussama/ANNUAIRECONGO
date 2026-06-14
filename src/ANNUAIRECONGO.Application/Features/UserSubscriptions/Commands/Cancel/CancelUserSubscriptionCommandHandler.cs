using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.UserSubscriptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Application.Features.UserSubscriptions.Commands.Cancel;

public sealed class CancelUserSubscriptionCommandHandler(
    IAppDbContext context,
    IUser currentUser)
    : IRequestHandler<CancelUserSubscriptionCommand, Result<Success>>
{
    public async Task<Result<Success>> Handle(
        CancelUserSubscriptionCommand request,
        CancellationToken ct)
    {
        if (!Guid.TryParse(currentUser.Id, out var userGuid))
            return UserSubscriptionErrors.NotFound(request.SubscriptionId);

        var subscription = await context.UserSubscriptions
            .FirstOrDefaultAsync(s =>
                s.Id == request.SubscriptionId &&
                s.UserId == userGuid, ct);

        if (subscription is null)
            return UserSubscriptionErrors.NotFound(request.SubscriptionId);

        var result = subscription.Cancel();
        if (result.IsError)
            return result.Errors;

        await context.SaveChangesAsync(ct);
        return Result.Success;
    }
}

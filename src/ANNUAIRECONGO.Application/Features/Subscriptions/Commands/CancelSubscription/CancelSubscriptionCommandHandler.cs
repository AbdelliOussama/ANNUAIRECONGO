using ANNUAIRECONGO.Application.Common.Interfaces;
using MediatR;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Subscriptions;
using Microsoft.EntityFrameworkCore;

namespace ANNUAIRECONGO.Application.Features.Subscriptions.Commands.CancelSubscription;

public sealed class CancelSubscriptionCommandHandler(
    IAppDbContext context) : IRequestHandler<CancelSubscriptionCommand, Result<Success>>
{
    public async Task<Result<Success>> Handle(CancelSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var subscription = await context.Subscriptions
            .Include(s => s.Company)
            .FirstOrDefaultAsync(s => s.Id == request.SubscriptionId, cancellationToken);

        if (subscription is null)
            return SubscriptionErrors.NotFound(request.SubscriptionId);

        var cancelResult = subscription.Cancel(request.OwnerId);
        if (cancelResult.IsError)
            return cancelResult.Errors;

        await context.SaveChangesAsync(cancellationToken);
        return Result.Success;
    }
}
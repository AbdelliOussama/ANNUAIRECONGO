
using ANNUAIRECONGO.Domain.Common.Results;

namespace ANNUAIRECONGO.Domain.Subscriptions.Payments;

public static class PaymentErrors
{
    public static Error PaymentNotFound(Guid id) => Error.NotFound(
        "Payment.NotFound",
        $"Payment with id '{id}' was not found.");

    public static readonly Error NotPending = Error.Conflict(
        "Payment.NotPending",
        "Payment must be in Pending status for this operation.");

    public static readonly Error CannotRefund = Error.Conflict(
        "Payment.CannotRefund",
        "Only successful payments can be refunded.");

    public static readonly Error GatewayError = Error.Failure(
        "Payment.GatewayError",
        "Payment gateway returned an error. Please try again.");

    public static readonly Error InvalidSignature = Error.Validation(
        "Payment.InvalidSignature",
        "Webhook signature validation failed.");
}

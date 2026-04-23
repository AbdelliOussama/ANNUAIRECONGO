using ANNUAIRECONGO.Application.Common.Interfaces;
using ANNUAIRECONGO.Domain.Common.Results;
using ANNUAIRECONGO.Domain.Companies;
using ANNUAIRECONGO.Domain.Subscriptions.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ANNUAIRECONGO.Application.Features.Companies.Commands.Images.AddImage;

public sealed record AddImageCommandHandler(ILogger<AddImageCommandHandler> logger,IAppDbContext context, IUser currentUser) : IRequestHandler<AddImageCommand,Result<Updated>>
{
    private readonly ILogger<AddImageCommandHandler> _logger = logger;
    private readonly IAppDbContext _context = context;
    private readonly IUser _currentUser = currentUser;

    public async Task<Result<Updated>> Handle(AddImageCommand request, CancellationToken cancellationToken)
    {
        var company  = await _context.Companies.AsNoTracking().Include(c => c.Images).FirstOrDefaultAsync(c =>c.Id == request.CompanyId, cancellationToken);
        if (company is null)
        {
            _logger.LogWarning("Company with id {CompanyId} not found", request.CompanyId);
            return CompanyErrors.CompanyNotFound(request.CompanyId);
        }
        var subscription = await _context.Subscriptions.AsNoTracking()
            .Include(s => s.Plan)
            .Where(s => s.Status == SubscriptionStatus.Active || s.Status == SubscriptionStatus.ExpiringSoon)
            .FirstOrDefaultAsync(s => s.CompanyId == request.CompanyId, cancellationToken);
        if (subscription is null)
        {
            _logger.LogWarning("Company with id {CompanyId} does not have a subscription ", request.CompanyId);
            return CompanyErrors.CompanyWithoutSubscription(request.CompanyId);
        }
        var isOwner =company.IsOwnedBy(_currentUser.Id);
        if (!isOwner)
        {
            _logger.LogWarning("User with id {UserId} is not the owner of company with id {CompanyId}", _currentUser.Id, request.CompanyId);
            return CompanyErrors.NotOwner;
        }
        if(company.Images.Count >= subscription.Plan.MaxImages)
        {
            _logger.LogWarning("Company with id {CompanyId} has reached the maximum number of images allowed by the subscription plan", request.CompanyId);
            return CompanyErrors.ImageLimitReached;
        }
        if(company.Images.Any(i => i.ImageUrl == request.ImageUrl))
        {
            _logger.LogWarning("Company with id {CompanyId} already has an image with url {ImageUrl}", request.CompanyId, request.ImageUrl);
            return CompanyErrors.ImageWithTheSameUrlExists;
        }
        var imageResult = CompanyImage.Create(request.CompanyId,request.ImageUrl,request.DisplayOrder,request.Caption);
        if(imageResult.IsError)
        {
            _logger.LogWarning("Failed to create image for company with id {CompanyId}. Reason: {Reason}", request.CompanyId, imageResult.Errors.First().Description);
            return imageResult.Errors.First();
        }
        var image = imageResult.Value;
        await _context.CompanyImages.AddAsync(image, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Image added to company with id {CompanyId}", request.CompanyId);

        return Result.Updated;
    }
}
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

        // If no active subscription, we use a default limit of 3 images (equivalent to Free plan)
        // rather than blocking the user entirely.
        int maxImagesAllowed = subscription?.Plan?.MaxImages ?? 3; 

        // Admin Rule 0 — Admin can add images to any company regardless of OwnerId.
        var isAdmin = _currentUser.IsInRole("Admin");
        if (!isAdmin)
        {
            var isOwner = company.IsOwnedBy(_currentUser.Id);
            if (!isOwner)
            {
                _logger.LogWarning("User with id {UserId} is not the owner of company with id {CompanyId}", _currentUser.Id, request.CompanyId);
                return CompanyErrors.NotOwner;
            }
        }

        if(company.Images.Count >= maxImagesAllowed)
        {
            _logger.LogWarning("Company with id {CompanyId} has reached the maximum number of images allowed ({Max})", request.CompanyId, maxImagesAllowed);
            return CompanyErrors.ImageLimitReached;
        }
        if(company.Images.Any(i => i.ImageUrl == request.ImageUrl))
        {
            _logger.LogWarning("Company with id {CompanyId} already has an image with url {ImageUrl}", request.CompanyId, request.ImageUrl);
            return CompanyErrors.ImagewithTheSameUrlExists;
        }
        var imageResult = CompanyImage.Create(request.CompanyId,request.ImageUrl, request.DisplayOrder ?? 0, request.Caption);
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

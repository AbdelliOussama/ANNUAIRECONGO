using ANNUAIRECONGO.Application.Common.Interfaces;
using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using ANNUAIRECONGO.Infrastructure;
using SixLabors.ImageSharp.Processing;

namespace ANNUAIRECONGO.Api.Controllers;

/// <summary>
/// File upload endpoint.
///
/// Flow:
///   1. Client POSTs a multipart/form-data file here.
///   2. Response contains the public URL.
///   3. Client passes that URL to the domain endpoints:
///        POST /api/v1/companies/{id}/AddImage        { "url": "..." }
///        POST /api/v1/companies/{id}/AddDocument     { "url": "...", "type": "...", "name": "..." }
///        PUT  /api/v1/companies/{id}/UpdateMedia     { "logoUrl": "...", "coverUrl": "..." }
///
/// Auth: any authenticated user (company owners upload their own assets;
///       admins may also use this endpoint).
/// </summary>
[ApiController]
[ApiVersion("1")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize]
public sealed class UploadsController(
    IStorageService storage,
    IOptions<StorageSettings> settings,
    ILogger<UploadsController> logger) : ControllerBase
{
    private readonly long _maxSize = settings.Value.MaxFileSizeBytes;

    [HttpPost("image")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(UploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadImage(
        IFormFile file,
        CancellationToken cancellationToken)
    {
        var validation = ValidateFile(file, "images");
        if (validation is not null) return validation;

        using var memoryStream = new MemoryStream();
        await using var stream = file.OpenReadStream();
        
        // Optimizing with ImageSharp
        try
        {
            using var image = await SixLabors.ImageSharp.Image.LoadAsync(stream, cancellationToken);
            var encoder = new SixLabors.ImageSharp.Formats.Webp.WebpEncoder { Quality = 80 };
            
            // Resize if too large (e.g. max 1920x1080)
            const int MaxWidth = 1920;
            const int MaxHeight = 1080;
            if (image.Width > MaxWidth || image.Height > MaxHeight)
            {
                image.Mutate(x => x.Resize(new SixLabors.ImageSharp.Processing.ResizeOptions
                {
                    Mode = SixLabors.ImageSharp.Processing.ResizeMode.Max,
                    Size = new SixLabors.ImageSharp.Size(MaxWidth, MaxHeight)
                }));
            }
            
            await image.SaveAsync(memoryStream, encoder, cancellationToken);
            memoryStream.Position = 0;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Image processing failed. Using original file.");
            stream.Position = 0;
            await stream.CopyToAsync(memoryStream, cancellationToken);
            memoryStream.Position = 0;
        }

        var fileName = Path.GetFileNameWithoutExtension(file.FileName) + ".webp";
        var url = await storage.UploadAsync(memoryStream, fileName, "images", cancellationToken);

        logger.LogInformation("Image uploaded → {Url}", url);
        return Ok(new UploadResponse(url));
    }

    // ── POST /api/v1/uploads/document ─────────────────────────────────────────
    /// <summary>
    /// Upload a company document (RCCM, NIF, Brevet, Other).
    /// Accepted: .pdf .doc .docx .xls .xlsx .png .jpg .jpeg — max size from StorageSettings.
    /// Returns a JSON object with the public URL.
    /// </summary>
    [HttpPost("document")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(UploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadDocument(
        IFormFile file,
        CancellationToken cancellationToken)
    {
        var validation = ValidateFile(file, "documents");
        if (validation is not null) return validation;

        await using var stream = file.OpenReadStream();
        var url = await storage.UploadAsync(stream, file.FileName, "documents", cancellationToken);

        logger.LogInformation("Document uploaded → {Url}", url);
        return Ok(new UploadResponse(url));
    }

    // ── DELETE /api/v1/uploads ────────────────────────────────────────────────
    /// <summary>
    /// Optionally delete a previously uploaded file by its public URL.
    /// Non-destructive: returns 204 even if the file no longer exists.
    /// </summary>
    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(
        [FromQuery] string url,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(url))
            return BadRequest(new { error = "url query parameter is required." });

        await storage.DeleteAsync(url, cancellationToken);
        return NoContent();
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private IActionResult? ValidateFile(IFormFile? file, string folder)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "No file was received." });

        if (file.Length > _maxSize)
            return BadRequest(new
            {
                error = $"File exceeds the maximum allowed size of {_maxSize / 1024 / 1024} MB."
            });

        return null; // extension validation is done inside LocalStorageService
    }
}

/// <summary>Response envelope returned by all upload endpoints.</summary>
public sealed record UploadResponse(string Url);

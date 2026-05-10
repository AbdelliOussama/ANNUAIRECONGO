using ANNUAIRECONGO.Application.Common.Interfaces;
using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using ANNUAIRECONGO.Infrastructure;

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

    // ── POST /api/v1/uploads/image ────────────────────────────────────────────
    /// <summary>
    /// Upload a company image (logo, cover photo, gallery).
    /// Accepted: .jpg .jpeg .png .webp .gif — max size from StorageSettings.
    /// Returns a JSON object with the public URL.
    /// </summary>
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

        await using var stream = file.OpenReadStream();
        var url = await storage.UploadAsync(stream, file.FileName, "images", cancellationToken);

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

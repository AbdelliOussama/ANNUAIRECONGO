using ANNUAIRECONGO.Application.Common.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace ANNUAIRECONGO.Infrastructure.Services;

/// <summary>
/// Local-disk storage implementation.
///
/// Files are written to  {WebRoot}/uploads/{folder}/{guid}{ext}
/// and served as static files via UseStaticFiles().
///
/// To switch to cloud storage later, implement <see cref="IStorageService"/>
/// (e.g. AzureBlobStorageService) and update the DI registration in
/// DependencyInjection.cs — zero other changes needed.
/// </summary>
public sealed class LocalStorageService : IStorageService
{
    private readonly string _webRootPath;
    private readonly string _baseUrl;
    private readonly ILogger<LocalStorageService> _logger;

    // Allowed MIME types per folder
    private static readonly HashSet<string> AllowedImageExtensions =
        [".jpg", ".jpeg", ".png", ".webp", ".gif"];

    private static readonly HashSet<string> AllowedDocumentExtensions =
        [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".png", ".jpg", ".jpeg"];

    private static readonly HashSet<string> AllowedFolders = 
        ["logos", "covers", "documents", "services", "images"];

    public LocalStorageService(
        IWebHostEnvironment env,
        IOptions<StorageSettings> options,
        ILogger<LocalStorageService> logger)
    {
        _webRootPath = env.WebRootPath
            ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            
        if (!Directory.Exists(_webRootPath))
        {
            Directory.CreateDirectory(_webRootPath);
        }

        _baseUrl = options.Value.BaseUrl.TrimEnd('/');
        _logger = logger;
    }

    public async Task<string> UploadAsync(
        Stream stream,
        string fileName,
        string folder,
        CancellationToken cancellationToken = default)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();

        ValidateExtension(ext, folder);

        // Build a collision-proof path
        var relativePath = Path.Combine("uploads", folder, $"{Guid.NewGuid():N}{ext}");
        var absolutePath = Path.Combine(_webRootPath, relativePath);

        Directory.CreateDirectory(Path.GetDirectoryName(absolutePath)!);

        await using var fs = new FileStream(absolutePath, FileMode.Create, FileAccess.Write, FileShare.None);
        await stream.CopyToAsync(fs, cancellationToken);

        // Return the public URL (e.g. https://api.example.com/uploads/images/abc.webp)
        var publicUrl = $"{_baseUrl}/{relativePath.Replace('\\', '/')}";
        _logger.LogInformation("Uploaded file {FileName} → {PublicUrl}", fileName, publicUrl);
        return publicUrl;
    }

    public Task DeleteAsync(string publicUrl, CancellationToken cancellationToken = default)
    {
        try
        {
            // Derive the local path from the public URL
            var relativePath = publicUrl.Replace(_baseUrl, string.Empty).TrimStart('/');
            var absolutePath = Path.Combine(_webRootPath, relativePath.Replace('/', Path.DirectorySeparatorChar));

            if (File.Exists(absolutePath))
            {
                File.Delete(absolutePath);
                _logger.LogInformation("Deleted file {AbsolutePath}", absolutePath);
            }
        }
        catch (Exception ex)
        {
            // Log but never throw — deletion failure is non-critical
            _logger.LogWarning(ex, "Could not delete file {Url}", publicUrl);
        }

        return Task.CompletedTask;
    }

    // ── private helpers ───────────────────────────────────────────────────────

    private static void ValidateExtension(string ext, string folder)
    {
        if (!AllowedFolders.Contains(folder.ToLowerInvariant()))
            throw new InvalidOperationException($"Target folder '{folder}' is not permitted.");

        var allowed = folder == "documents"
            ? AllowedDocumentExtensions
            : AllowedImageExtensions;

        if (!allowed.Contains(ext))
            throw new InvalidOperationException(
                $"File extension '{ext}' is not permitted in folder '{folder}'. " +
                $"Allowed: {string.Join(", ", allowed)}");
    }
}

namespace ANNUAIRECONGO.Application.Common.Interfaces;

/// <summary>
/// Abstracts file storage so the upload implementation can be swapped
/// (local disk → Azure Blob / S3 / Cloudinary) without touching controllers.
/// </summary>
public interface IStorageService
{
    /// <summary>
    /// Persists <paramref name="stream"/> and returns the public URL that
    /// can be stored in the database (e.g. "https://host/uploads/img/abc.webp").
    /// </summary>
    /// <param name="stream">File content stream (not seeked to any position).</param>
    /// <param name="fileName">Original file name — used to derive the extension.</param>
    /// <param name="folder">Logical container: "images" | "documents".</param>
    /// <param name="cancellationToken">Propagated cancellation.</param>
    Task<string> UploadAsync(
        Stream stream,
        string fileName,
        string folder,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes the file identified by its public URL.
    /// Implementations should be lenient: if the file does not exist they
    /// must not throw.
    /// </summary>
    Task DeleteAsync(string publicUrl, CancellationToken cancellationToken = default);
}

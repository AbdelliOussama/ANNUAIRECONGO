using System.Text.RegularExpressions;

namespace ANNUAIRECONGO.Domain.Common;

public static class SlugHelper
{
    public static string GenerateSlug(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        return Regex.Replace(
            input.ToLowerInvariant()
                .Replace(" ", "-")
                .Replace("'", "")
                .Replace("&", "and"),
            @"[^a-z0-9\-]", "")
        .Trim('-');
    }
}

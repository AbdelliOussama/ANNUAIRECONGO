using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace ANNUAIRECONGO.Application.Common.Interfaces;

public interface IGrokService
{
    Task<string> GenerateCompanyDescriptionAsync(
        string name,
        IEnumerable<string> sectors,
        string city,
        IEnumerable<string> services,
        CancellationToken cancellationToken);
}

using STS.Application.Common;

namespace STS.Application.Availability;

public interface IAvailabilityService
{
    Task<ApiResult<AvailabilityResponse>> GetAsync(string? from, string? to, CancellationToken cancellationToken);
}

using STS.Application.Common;

namespace STS.Application.Leads;

public interface ILeadService
{
    Task<ApiResult<object>> CreateContactLeadAsync(ContactLeadRequest request, CancellationToken cancellationToken);
    Task<ApiResult<object>> CreateBriefLeadAsync(BriefLeadRequest request, CancellationToken cancellationToken);
    Task<ApiResult<object>> CreatePackageQuoteAsync(PackageQuoteRequest request, CancellationToken cancellationToken);
}

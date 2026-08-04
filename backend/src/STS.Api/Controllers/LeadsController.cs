using Microsoft.AspNetCore.Mvc;
using STS.Application.Leads;

namespace STS.Api.Controllers;

[ApiController]
[Route("api/leads")]
public sealed class LeadsController(ILeadService leadService) : ControllerBase
{
    [HttpPost("contact")]
    public async Task<IActionResult> Contact(ContactLeadRequest request, CancellationToken cancellationToken)
    {
        var result = await leadService.CreateContactLeadAsync(request, cancellationToken);
        return ToActionResult(result);
    }

    [HttpPost("brief")]
    public async Task<IActionResult> Brief(BriefLeadRequest request, CancellationToken cancellationToken)
    {
        var userId = Request.Headers["X-User-Id"].ToString();
        var role = Request.Headers["X-User-Role"].ToString();
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized(new { error = "Login is required before submitting a brief" });
        if (!string.Equals(role, "CLIENT", StringComparison.OrdinalIgnoreCase)) return StatusCode(StatusCodes.Status403Forbidden, new { error = "Only client accounts can submit briefs" });

        request = request with { UserId = userId };
        var result = await leadService.CreateBriefLeadAsync(request, cancellationToken);
        return ToActionResult(result);
    }

    [HttpPost("package-quote")]
    public async Task<IActionResult> PackageQuote(PackageQuoteRequest request, CancellationToken cancellationToken)
    {
        var result = await leadService.CreatePackageQuoteAsync(request, cancellationToken);
        return ToActionResult(result);
    }

    private IActionResult ToActionResult<T>(Application.Common.ApiResult<T> result)
    {
        if (result.Succeeded) return StatusCode(result.StatusCode, result.Value);
        return StatusCode(result.StatusCode, new { error = result.Error });
    }
}

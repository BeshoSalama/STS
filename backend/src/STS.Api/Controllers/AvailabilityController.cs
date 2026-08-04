using Microsoft.AspNetCore.Mvc;
using STS.Application.Availability;

namespace STS.Api.Controllers;

[ApiController]
[Route("api/availability")]
public sealed class AvailabilityController(IAvailabilityService availabilityService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(AvailabilityResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get([FromQuery] string? from, [FromQuery] string? to, CancellationToken cancellationToken)
    {
        var result = await availabilityService.GetAsync(from, to, cancellationToken);
        if (result.Succeeded) return StatusCode(result.StatusCode, result.Value);
        return StatusCode(result.StatusCode, new { error = result.Error });
    }
}

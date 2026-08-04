using Microsoft.AspNetCore.Mvc;
using STS.Application.Auth;

namespace STS.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        var result = await authService.RegisterAsync(request, cancellationToken);
        return ToActionResult(result);
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await authService.LoginAsync(request, cancellationToken);
        return ToActionResult(result);
    }

    private IActionResult ToActionResult<T>(Application.Common.ApiResult<T> result)
    {
        if (result.Succeeded) return StatusCode(result.StatusCode, result.Value);
        return StatusCode(result.StatusCode, new { error = result.Error });
    }
}

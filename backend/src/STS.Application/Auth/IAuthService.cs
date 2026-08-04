using STS.Application.Common;

namespace STS.Application.Auth;

public interface IAuthService
{
    Task<ApiResult<AuthResponse>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken);
    Task<ApiResult<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
}

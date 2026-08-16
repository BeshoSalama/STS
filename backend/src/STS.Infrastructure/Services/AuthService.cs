using Microsoft.EntityFrameworkCore;
using STS.Application.Auth;
using STS.Application.Common;
using STS.Domain.Entities;
using STS.Domain.Security;
using STS.Infrastructure.Persistence;

namespace STS.Infrastructure.Services;

public sealed class AuthService(StsDbContext db) : IAuthService
{
    public async Task<ApiResult<AuthResponse>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        var name = request.Name?.Trim();
        var email = request.Email?.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(name) || name.Length < 2) return ApiResult<AuthResponse>.Fail("Name is required", 400);
        if (!IsEmail(email)) return ApiResult<AuthResponse>.Fail("Valid email is required", 400);
        if (string.IsNullOrEmpty(request.Password) || request.Password.Length < 8) return ApiResult<AuthResponse>.Fail("Password must be at least 8 characters", 400);
        if (request.Password != request.ConfirmPassword) return ApiResult<AuthResponse>.Fail("Passwords do not match", 400);

        var exists = await db.Users.AnyAsync(x => x.Email == email, cancellationToken);
        if (exists) return ApiResult<AuthResponse>.Fail("Email is already registered", 409);

        var now = DateTime.UtcNow;
        var user = new User
        {
            Id = NewId(),
            Name = name,
            Email = email!,
            EmailVerified = null,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, 12),
            Role = UserRoles.Client,
            CreatedAt = now,
            UpdatedAt = now
        };

        db.Users.Add(user);
        await db.SaveChangesAsync(cancellationToken);

        return ApiResult<AuthResponse>.Ok(new AuthResponse(ToUserResponse(user)), 201);
    }

    public async Task<ApiResult<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email?.Trim().ToLowerInvariant();
        if (!IsEmail(email) || string.IsNullOrEmpty(request.Password)) return ApiResult<AuthResponse>.Fail("Invalid email or password", 401);

        var user = await db.Users.SingleOrDefaultAsync(x => x.Email == email, cancellationToken);
        if (user?.PasswordHash is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return ApiResult<AuthResponse>.Fail("Invalid email or password", 401);
        }

        if (user.EmailVerified is null)
        {
            return ApiResult<AuthResponse>.Fail("Please verify your email before logging in", 403);
        }

        return ApiResult<AuthResponse>.Ok(new AuthResponse(ToUserResponse(user)));
    }

    private static UserResponse ToUserResponse(User user) => new(user.Id, user.Name, user.Email, user.Role);
    private static bool IsEmail(string? value) => !string.IsNullOrWhiteSpace(value) && value.Contains('@') && value.Contains('.');
    private static string NewId() => $"dotnet_{Guid.NewGuid():N}";
}

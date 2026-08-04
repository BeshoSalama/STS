namespace STS.Application.Auth;

public sealed record RegisterRequest(string? Name, string? Email, string? Password, string? ConfirmPassword);
public sealed record LoginRequest(string? Email, string? Password);
public sealed record UserResponse(string Id, string? Name, string Email, string Role);
public sealed record AuthResponse(UserResponse User);

namespace STS.Domain.Entities;

public sealed class User
{
    public string Id { get; set; } = default!;
    public string? Name { get; set; }
    public string Email { get; set; } = default!;
    public string? PasswordHash { get; set; }
    public string Role { get; set; } = "CLIENT";
    public string? Phone { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

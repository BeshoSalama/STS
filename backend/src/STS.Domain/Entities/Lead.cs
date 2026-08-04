namespace STS.Domain.Entities;

public sealed class Lead
{
    public string Id { get; set; } = default!;
    public string Type { get; set; } = default!;
    public string Status { get; set; } = "NEW";
    public string Name { get; set; } = default!;
    public string? Email { get; set; }
    public string Phone { get; set; } = default!;
    public string Payload { get; set; } = "{}";
    public string? UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

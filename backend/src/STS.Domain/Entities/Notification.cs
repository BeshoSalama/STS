namespace STS.Domain.Entities;

public sealed class Notification
{
    public string Id { get; set; } = default!;
    public string UserId { get; set; } = default!;
    public string Type { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string Body { get; set; } = default!;
    public string? Href { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

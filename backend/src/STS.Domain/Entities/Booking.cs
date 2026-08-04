namespace STS.Domain.Entities;

public sealed class Booking
{
    public string Id { get; set; } = default!;
    public DateTime Date { get; set; }
    public string Name { get; set; } = default!;
    public string Phone { get; set; } = default!;
    public string Status { get; set; } = "NEW";
    public string? UserId { get; set; }
    public DateTime CreatedAt { get; set; }
}

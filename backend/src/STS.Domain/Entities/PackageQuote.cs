namespace STS.Domain.Entities;

public sealed class PackageQuote
{
    public string Id { get; set; } = default!;
    public string LeadId { get; set; } = default!;
    public string? PlanName { get; set; }
    public string AddOnIds { get; set; } = "[]";
    public int Total { get; set; }
    public DateTime CreatedAt { get; set; }
}

namespace STS.Domain.Entities;

public sealed class PackageAddOn
{
    public string Id { get; set; } = default!;
    public string Label { get; set; } = default!;
    public string Description { get; set; } = default!;
    public int Price { get; set; }
    public int Order { get; set; }
}

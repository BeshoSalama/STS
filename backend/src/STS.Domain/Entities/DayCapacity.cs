namespace STS.Domain.Entities;

public sealed class DayCapacity
{
    public DateTime Date { get; set; }
    public int Capacity { get; set; } = 6;
    public bool Blocked { get; set; }
}

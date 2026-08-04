namespace STS.Application.Availability;

public sealed record AvailabilityDayResponse(
    string Date,
    int Capacity,
    int Booked,
    bool FullyBooked,
    bool Blocked);

public sealed record AvailabilityResponse(IReadOnlyList<AvailabilityDayResponse> Days);

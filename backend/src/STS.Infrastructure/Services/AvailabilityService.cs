using Microsoft.EntityFrameworkCore;
using STS.Application.Availability;
using STS.Application.Common;
using STS.Infrastructure.Persistence;

namespace STS.Infrastructure.Services;

public sealed class AvailabilityService(StsDbContext db) : IAvailabilityService
{
    private const int DefaultDayCapacity = 1;
    private static readonly HashSet<string> StaticFullyBookedDates = ["2026-08-04", "2026-08-06", "2026-08-10", "2026-08-18"];

    public async Task<ApiResult<AvailabilityResponse>> GetAsync(string? from, string? to, CancellationToken cancellationToken)
    {
        if (!TryParseDateKey(from, out var fromDate) || !TryParseDateKey(to, out var toDate))
        {
            return ApiResult<AvailabilityResponse>.Fail("from and to are required as YYYY-MM-DD", 400);
        }

        var capacities = await db.DayCapacities
            .Where(x => x.Date >= fromDate && x.Date <= toDate)
            .ToListAsync(cancellationToken);

        var bookings = await db.Bookings
            .Where(x => x.Date >= fromDate && x.Date <= toDate)
            .GroupBy(x => x.Date)
            .Select(x => new { Date = x.Key, Count = x.Count() })
            .ToListAsync(cancellationToken);

        var capacityByDate = capacities.ToDictionary(x => FormatDateKey(x.Date));
        var bookingsByDate = bookings.ToDictionary(x => FormatDateKey(x.Date), x => x.Count);
        var days = new List<AvailabilityDayResponse>();

        for (var cursor = fromDate; cursor <= toDate; cursor = cursor.AddDays(1))
        {
            var key = FormatDateKey(cursor);
            capacityByDate.TryGetValue(key, out var capacity);
            var booked = bookingsByDate.GetValueOrDefault(key);
            var maxCapacity = DefaultDayCapacity;
            var blocked = capacity?.Blocked ?? false;

            days.Add(new AvailabilityDayResponse(
                key,
                maxCapacity,
                booked,
                blocked || StaticFullyBookedDates.Contains(key) || booked >= maxCapacity,
                blocked));
        }

        return ApiResult<AvailabilityResponse>.Ok(new AvailabilityResponse(days));
    }

    public static bool TryParseDateKey(string? value, out DateTime date)
    {
        if (DateOnly.TryParseExact(value, "yyyy-MM-dd", out var dateOnly))
        {
            date = dateOnly.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            return true;
        }

        date = default;
        return false;
    }

    public static string FormatDateKey(DateTime date) => DateOnly.FromDateTime(date).ToString("yyyy-MM-dd");
    public static bool IsStaticBlocked(string dateKey) => StaticFullyBookedDates.Contains(dateKey);
}

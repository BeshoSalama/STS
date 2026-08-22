using System.Data;
using System.Text.Json;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using STS.Application.Common;
using STS.Application.Leads;
using STS.Domain.Entities;
using STS.Domain.Security;
using STS.Infrastructure.Persistence;

namespace STS.Infrastructure.Services;

public sealed class LeadService(StsDbContext db) : ILeadService
{
    private const int CustomPackageBaseFee = 199;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<ApiResult<object>> CreateContactLeadAsync(ContactLeadRequest request, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(request.Website)) return ApiResult<object>.Ok(new { ok = true });
        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Trim().Length < 2) return ApiResult<object>.Fail("Name is required", 400);
        if (string.IsNullOrWhiteSpace(request.Phone) || request.Phone.Trim().Length < 6) return ApiResult<object>.Fail("Phone is required", 400);
        if (!AvailabilityService.TryParseDateKey(request.ConsultationDate, out var date)) return ApiResult<object>.Fail("consultationDate must be YYYY-MM-DD", 400);
        if (AvailabilityService.IsStaticBlocked(request.ConsultationDate!)) return ApiResult<object>.Fail("DAY_BLOCKED", 409);

        var capacity = await db.DayCapacities.FindAsync([date], cancellationToken);
        if (capacity?.Blocked == true) return ApiResult<object>.Fail("DAY_BLOCKED", 409);

        var bookingCount = await db.Bookings.CountAsync(x => x.Date == date, cancellationToken);
        if (bookingCount >= 1) return ApiResult<object>.Fail("DAY_FULL", 409);

        var now = DateTime.UtcNow;
        var booking = new Booking
        {
            Id = NewId(),
            Date = date,
            Name = request.Name.Trim(),
            Phone = request.Phone.Trim(),
            CreatedAt = now
        };
        var lead = new Lead
        {
            Id = NewId(),
            Type = "CONSULTATION",
            Name = booking.Name,
            Email = TrimOrNull(request.Email),
            Phone = booking.Phone,
            Payload = JsonSerializer.Serialize(
                new
                {
                    consultationDate = request.ConsultationDate,
                    bookingId = booking.Id,
                    email = TrimOrNull(request.Email),
                    company = TrimOrNull(request.Company),
                    activity = TrimOrNull(request.Activity),
                    source = TrimOrNull(request.Source),
                    goal = TrimOrNull(request.Goal)
                },
                JsonOptions),
            CreatedAt = now,
            UpdatedAt = now
        };

        try
        {
            await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);

            var bookingsForDay = await db.Bookings.CountAsync(x => x.Date == date, cancellationToken);
            var dayCapacity = await db.DayCapacities.FindAsync([date], cancellationToken);
            if (dayCapacity?.Blocked == true) return ApiResult<object>.Fail("DAY_BLOCKED", 409);
            if (bookingsForDay >= 1) return ApiResult<object>.Fail("DAY_FULL", 409);

            db.Bookings.Add(booking);
            db.Leads.Add(lead);

            var recipients = await db.Users
                .Where(x => x.Role == UserRoles.Admin || x.Role == UserRoles.Staff || x.Role == UserRoles.Developer)
                .Select(x => x.Id)
                .ToListAsync(cancellationToken);

            var notificationBody = BuildConsultationNotificationBody(request);
            db.Notifications.AddRange(recipients.Select(userId => new Notification
            {
                Id = NewId(),
                UserId = userId,
                Type = "CONSULTATION",
                Title = "New free consultation request",
                Body = notificationBody,
                Href = $"/admin/leads?q={lead.Id}",
                CreatedAt = now
            }));

            await db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (ex.InnerException is SqlException sql && (sql.Number == 2601 || sql.Number == 2627))
        {
            return ApiResult<object>.Fail("DOUBLE_BOOKING", 409);
        }

        return ApiResult<object>.Ok(new ContactLeadResponse(ToLeadResponse(lead), booking.Id), 201);
    }

    public async Task<ApiResult<object>> CreateBriefLeadAsync(BriefLeadRequest request, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(request.Website)) return ApiResult<object>.Ok(new { ok = true });
        if (string.IsNullOrWhiteSpace(request.ClientName) || request.ClientName.Trim().Length < 2) return ApiResult<object>.Fail("clientName is required", 400);
        if (string.IsNullOrWhiteSpace(request.BrandName) || request.BrandName.Trim().Length < 2) return ApiResult<object>.Fail("brandName is required", 400);
        if (string.IsNullOrWhiteSpace(request.Phone) || request.Phone.Trim().Length < 6) return ApiResult<object>.Fail("phone is required", 400);

        var now = DateTime.UtcNow;
        var lead = new Lead
        {
            Id = NewId(),
            Type = "BRIEF",
            Name = request.ClientName.Trim(),
            Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim(),
            Phone = request.Phone.Trim(),
            UserId = request.UserId,
            Payload = JsonSerializer.Serialize(request, JsonOptions),
            CreatedAt = now,
            UpdatedAt = now
        };
        var brief = new Brief
        {
            Id = NewId(),
            LeadId = lead.Id,
            ClientName = request.ClientName.Trim(),
            BrandName = request.BrandName.Trim(),
            BriefDate = ParseOptionalDate(request.BriefDate),
            Email = lead.Email,
            Phone = lead.Phone,
            MainGoals = TrimOrNull(request.MainGoals),
            RoleModel = TrimOrNull(request.RoleModel),
            CompetitorsLinks = TrimOrNull(request.CompetitorsLinks),
            BrandIdentity = TrimOrNull(request.BrandIdentity),
            BrandLevel = TrimOrNull(request.BrandLevel),
            CustomerSegment = TrimOrNull(request.CustomerSegment),
            BusinessType = TrimOrNull(request.BusinessType),
            SocialPlatforms = JsonSerializer.Serialize(request.SocialPlatforms, JsonOptions),
            BrandSlogan = TrimOrNull(request.BrandSlogan),
            PreferredColors = TrimOrNull(request.PreferredColors),
            ColorNumbers = TrimOrNull(request.ColorNumbers),
            ToneOfVoice = JsonSerializer.Serialize(request.ToneOfVoice, JsonOptions),
            AdvertisingPlatforms = JsonSerializer.Serialize(request.AdvertisingPlatforms, JsonOptions),
            AdsBudget = TrimOrNull(request.AdsBudget),
            TargetAge = TrimOrNull(request.TargetAge),
            BranchesNumber = request.BranchesNumber,
            Locations = TrimOrNull(request.Locations),
            Gender = TrimOrNull(request.Gender),
            Languages = JsonSerializer.Serialize(request.Languages, JsonOptions),
            PlatformLinks = TrimOrNull(request.PlatformLinks),
            Notes = TrimOrNull(request.Notes),
            BusinessModel = TrimOrNull(request.BusinessModel),
            DigitalMarketingExperience = TrimOrNull(request.DigitalMarketingExperience),
            UniqueSellingPoints = TrimOrNull(request.UniqueSellingPoints),
            PlanObjectives = TrimOrNull(request.PlanObjectives),
            UserId = request.UserId,
            CreatedAt = now
        };

        await using (var transaction = await db.Database.BeginTransactionAsync(cancellationToken))
        {
            db.Leads.Add(lead);
            await db.SaveChangesAsync(cancellationToken);

            db.Briefs.Add(brief);
            await db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }

        return ApiResult<object>.Ok(new BriefLeadResponse(ToLeadResponse(lead), brief.Id), 201);
    }

    public async Task<ApiResult<object>> CreatePackageQuoteAsync(PackageQuoteRequest request, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(request.Website)) return ApiResult<object>.Ok(new { ok = true });

        var requestedAddOns = request.AddOns is { Count: > 0 }
            ? request.AddOns
            : (request.AddOnIds ?? []).Select(id => new PackageQuoteAddOnRequest(id, 1)).ToArray();
        var requestedAddOnIds = requestedAddOns.Select(x => x.Id).Distinct().ToArray();
        var quantities = requestedAddOns
            .GroupBy(x => x.Id)
            .ToDictionary(x => x.Key, x => x.Sum(item => Math.Clamp(item.Quantity, 1, 99)));
        var addOns = await db.PackageAddOns.Where(x => requestedAddOnIds.Contains(x.Id)).ToListAsync(cancellationToken);
        var rawTotal = addOns.Sum(x => x.Price * quantities.GetValueOrDefault(x.Id, 1)) + CustomPackageBaseFee;
        var total = string.Equals(request.Billing, "annual", StringComparison.OrdinalIgnoreCase)
            ? (int)Math.Round(rawTotal * 0.85)
            : rawTotal;
        var now = DateTime.UtcNow;
        var selectedItems = addOns
            .Select(x => new { x.Id, x.Label, Quantity = quantities.GetValueOrDefault(x.Id, 1), x.Price })
            .ToArray();
        var selectedIds = selectedItems.Select(x => x.Id).ToArray();

        var lead = new Lead
        {
            Id = NewId(),
            Type = "PACKAGE_QUOTE",
            Name = "Package Builder",
            Phone = "not-provided",
            Payload = JsonSerializer.Serialize(new { request.PlanName, addOns = selectedItems, request.Billing, total }, JsonOptions),
            CreatedAt = now,
            UpdatedAt = now
        };
        var quote = new PackageQuote
        {
            Id = NewId(),
            LeadId = lead.Id,
            PlanName = TrimOrNull(request.PlanName),
            AddOnIds = JsonSerializer.Serialize(selectedItems, JsonOptions),
            Total = total,
            CreatedAt = now
        };

        await using (var transaction = await db.Database.BeginTransactionAsync(cancellationToken))
        {
            db.Leads.Add(lead);
            await db.SaveChangesAsync(cancellationToken);

            db.PackageQuotes.Add(quote);
            await db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }

        return ApiResult<object>.Ok(new PackageQuoteResponse(ToLeadResponse(lead), quote.Id, total, selectedIds), 201);
    }

    private static LeadResponse ToLeadResponse(Lead lead) => new(lead.Id, lead.Type, lead.Status, lead.Name, lead.Email, lead.Phone, lead.CreatedAt);
    private static string NewId() => $"dotnet_{Guid.NewGuid():N}";
    private static string? TrimOrNull(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    private static DateTime? ParseOptionalDate(string? value) => AvailabilityService.TryParseDateKey(value, out var date) ? date : null;
    private static string BuildConsultationNotificationBody(ContactLeadRequest request)
    {
        var parts = new[]
        {
            $"Name: {request.Name?.Trim()}",
            TrimOrNull(request.Email) is { } email ? $"Email: {email}" : null,
            $"Phone: {request.Phone?.Trim()}",
            $"Date: {request.ConsultationDate}",
            TrimOrNull(request.Company) is { } company ? $"Company: {company}" : null,
            TrimOrNull(request.Activity) is { } activity ? $"Activity: {activity}" : null,
            TrimOrNull(request.Source) is { } source ? $"Source: {source}" : null,
            TrimOrNull(request.Goal) is { } goal ? $"Goal: {goal}" : null
        };

        return string.Join(" | ", parts.Where(part => !string.IsNullOrWhiteSpace(part)));
    }
}

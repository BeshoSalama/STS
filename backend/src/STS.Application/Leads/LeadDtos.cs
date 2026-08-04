using System.Text.Json.Serialization;

namespace STS.Application.Leads;

public sealed record ContactLeadRequest(
    string? Name,
    string? Phone,
    string? ConsultationDate,
    string? Website);

public sealed record BriefLeadRequest
{
    public string? ClientName { get; init; }
    public string? BrandName { get; init; }
    public string? BriefDate { get; init; }
    public string? Email { get; init; }
    public string? Phone { get; init; }
    public string? MainGoals { get; init; }
    public string? RoleModel { get; init; }
    public string? CompetitorsLinks { get; init; }
    public string? BrandIdentity { get; init; }
    public string? BrandLevel { get; init; }
    public string? CustomerSegment { get; init; }
    public string? BusinessType { get; init; }
    public IReadOnlyList<string> SocialPlatforms { get; init; } = [];
    public string? BrandSlogan { get; init; }
    public string? PreferredColors { get; init; }
    public string? ColorNumbers { get; init; }
    public IReadOnlyList<string> ToneOfVoice { get; init; } = [];
    public IReadOnlyList<string> AdvertisingPlatforms { get; init; } = [];
    public string? AdsBudget { get; init; }
    public string? TargetAge { get; init; }
    public int? BranchesNumber { get; init; }
    public string? Locations { get; init; }
    public string? Gender { get; init; }
    public IReadOnlyList<string> Languages { get; init; } = [];
    public string? PlatformLinks { get; init; }
    public string? Notes { get; init; }
    public string? BusinessModel { get; init; }
    public string? DigitalMarketingExperience { get; init; }
    public string? UniqueSellingPoints { get; init; }
    public string? PlanObjectives { get; init; }
    public string? Website { get; init; }
}

public sealed record PackageQuoteRequest(string? PlanName, IReadOnlyList<string> AddOnIds, string? Website);
public sealed record LeadResponse(string Id, string Type, string Status, string Name, string? Email, string Phone, DateTime CreatedAt);
public sealed record ContactLeadResponse(LeadResponse Lead, string BookingId);
public sealed record BriefLeadResponse(LeadResponse Lead, string BriefId);
public sealed record PackageQuoteResponse(LeadResponse Lead, string QuoteId, int Total, IReadOnlyList<string> AddOnIds);

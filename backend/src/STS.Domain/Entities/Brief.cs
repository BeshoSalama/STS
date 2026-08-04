namespace STS.Domain.Entities;

public sealed class Brief
{
    public string Id { get; set; } = default!;
    public string LeadId { get; set; } = default!;
    public string ClientName { get; set; } = default!;
    public string BrandName { get; set; } = default!;
    public DateTime? BriefDate { get; set; }
    public string? Email { get; set; }
    public string Phone { get; set; } = default!;
    public string? MainGoals { get; set; }
    public string? RoleModel { get; set; }
    public string? CompetitorsLinks { get; set; }
    public string? BrandIdentity { get; set; }
    public string? BrandLevel { get; set; }
    public string? CustomerSegment { get; set; }
    public string? BusinessType { get; set; }
    public string SocialPlatforms { get; set; } = "[]";
    public string? BrandSlogan { get; set; }
    public string? PreferredColors { get; set; }
    public string? ColorNumbers { get; set; }
    public string ToneOfVoice { get; set; } = "[]";
    public string AdvertisingPlatforms { get; set; } = "[]";
    public string? AdsBudget { get; set; }
    public string? TargetAge { get; set; }
    public int? BranchesNumber { get; set; }
    public string? Locations { get; set; }
    public string? Gender { get; set; }
    public string Languages { get; set; } = "[]";
    public string? PlatformLinks { get; set; }
    public string? Notes { get; set; }
    public string? BusinessModel { get; set; }
    public string? DigitalMarketingExperience { get; set; }
    public string? UniqueSellingPoints { get; set; }
    public string? PlanObjectives { get; set; }
    public string? UserId { get; set; }
    public DateTime CreatedAt { get; set; }
}

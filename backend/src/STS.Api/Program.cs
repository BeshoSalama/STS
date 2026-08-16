using System.Text.Json;
using STS.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
var repositoryRoot = InfrastructureRoot.FindRepositoryRoot(builder.Environment.ContentRootPath);

builder.Services
    .AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new() { Title = "STS Agency API", Version = "v1" });
});
builder.Services.AddInfrastructure(repositoryRoot);
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",
                "https://localhost:3000",
                "https://sts-m.com",
                "https://www.sts-m.com"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("ADMIN"));
    options.AddPolicy("StaffBackOffice", policy => policy.RequireRole("ADMIN", "STAFF"));
    options.AddPolicy("ClientPortal", policy => policy.RequireRole("CLIENT"));
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "STS Agency API v1");
    options.RoutePrefix = string.Empty;
});

app.UseCors("Frontend");
app.UseAuthorization();

app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { ok = true, service = "sts-dotnet-api" })).WithTags("System");

app.Run();

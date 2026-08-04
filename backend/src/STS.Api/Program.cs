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
            .WithOrigins("http://localhost:3000", "https://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
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

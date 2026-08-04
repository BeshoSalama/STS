namespace STS.Infrastructure.Configuration;

public static class DatabasePath
{
    public static string ResolveSqliteConnection(string rootPath)
    {
        var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
        if (string.IsNullOrWhiteSpace(databaseUrl)) return $"Data Source={Path.Combine(rootPath, "prisma", "dev.db")}";

        if (databaseUrl.StartsWith("file:", StringComparison.OrdinalIgnoreCase))
        {
            var filePath = databaseUrl["file:".Length..];
            var resolved = filePath.StartsWith("./", StringComparison.Ordinal)
                ? Path.Combine(rootPath, "prisma", filePath[2..])
                : Path.GetFullPath(filePath, rootPath);

            return $"Data Source={resolved}";
        }

        if (databaseUrl.StartsWith("Data Source=", StringComparison.OrdinalIgnoreCase)) return databaseUrl;

        return $"Data Source={databaseUrl}";
    }
}

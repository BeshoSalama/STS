namespace STS.Infrastructure.Configuration;

public static class DatabasePath
{
    public static string ResolveConnectionString(string rootPath)
    {
        var sqlServerConnection = Environment.GetEnvironmentVariable("SQLSERVER_CONNECTION_STRING");
        if (!string.IsNullOrWhiteSpace(sqlServerConnection)) return sqlServerConnection;

        return "Server=localhost;Database=STSAgency;Trusted_Connection=True;TrustServerCertificate=True;Encrypt=True";
    }
}

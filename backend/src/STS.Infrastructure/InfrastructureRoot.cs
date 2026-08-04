namespace STS.Infrastructure;

public static class InfrastructureRoot
{
    public static string FindRepositoryRoot(string startPath)
    {
        var directory = new DirectoryInfo(startPath);
        while (directory is not null)
        {
            if (File.Exists(Path.Combine(directory.FullName, "package.json")) &&
                Directory.Exists(Path.Combine(directory.FullName, "prisma")))
            {
                return directory.FullName;
            }

            directory = directory.Parent;
        }

        return startPath;
    }
}

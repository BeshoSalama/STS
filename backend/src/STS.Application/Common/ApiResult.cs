namespace STS.Application.Common;

public sealed record ApiResult<T>(bool Succeeded, T? Value, string? Error, int StatusCode)
{
    public static ApiResult<T> Ok(T value, int statusCode = 200) => new(true, value, null, statusCode);
    public static ApiResult<T> Fail(string error, int statusCode) => new(false, default, error, statusCode);
}

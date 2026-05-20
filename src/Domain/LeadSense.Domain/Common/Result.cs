using System.Text.Json.Serialization;

namespace LeadSense.Domain.Common;

public sealed class Result<T>
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;

    public T? Value { get; }

    public IReadOnlyList<Error> Errors { get; }

    [JsonConstructor]
    private Result(bool isSuccess, T? value, IReadOnlyList<Error>? errors)
    {
        IsSuccess = isSuccess;
        Value = value;
        Errors = errors ?? [];
    }

    public static Result<T> Success(T value)
    {
        return new Result<T>(true, value, []);
    }

    public static Result<T> Failure(params Error[] errors)
    {
        if (errors.Length == 0)
            throw new ArgumentException("At least one error is required.", nameof(errors));

        return new Result<T>(false, default, errors);
    }

    public static implicit operator Result<T>(T value)
    {
        return Success(value);
    }
}
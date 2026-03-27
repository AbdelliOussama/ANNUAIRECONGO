
namespace ANNUAIRECONGO.Domain.Common.Results;

public interface IResult
{
    List<Error>? Errors { get; }
    bool IsSuccess { get; }
};
public interface IResult<out T> : IResult
{
    T? Value { get; }
}
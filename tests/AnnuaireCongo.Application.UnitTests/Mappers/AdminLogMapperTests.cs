using AnnuaireCongo.Tests.Common.Logs;
using ANNUAIRECONGO.Application.Features.AdminLogs.Mappers;
using Xunit;

namespace AnnuaireCongo.Application.UnitTests.Mappers;

public class AdminLogMapperTests
{
    [Fact]
    public void AdminLog_ToDto_ShouldMapPropertiesCorrectly()
    {
        // Arrange
        var log = AdminLogFactory.CreateAdminLog().Value;

        // Act
        var dto = log.ToDto();

        // Assert
        Assert.NotNull(dto);
        Assert.Equal(log.Id, dto.Id);
        Assert.Equal(log.AdminId, dto.AdminId);
        Assert.Equal(log.Action, dto.Action);
        Assert.Equal(log.TargetType, dto.TargetType);
        Assert.Equal(log.TargetId, dto.TargetId);
        Assert.Equal(log.Details, dto.Details);
        Assert.Equal(log.CreatedAt, dto.CreatedAt);
    }

    [Fact]
    public void AdminLogList_ToDtoList_ShouldMapAllItems()
    {
        // Arrange
        var logs = new[] { AdminLogFactory.CreateAdminLog().Value };

        // Act
        var dtos = logs.ToDtoList();

        // Assert
        Assert.NotNull(dtos);
        Assert.Single(dtos);
    }
}

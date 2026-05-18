using AnnuaireCongo.Tests.Common.Companies;
using ANNUAIRECONGO.Application.Common.Behaviors;
using ANNUAIRECONGO.Application.Features.Companies.Commands.CreateCompany;
using ANNUAIRECONGO.Application.Features.Companies.Dtos;
using ANNUAIRECONGO.Application.Features.Companies.Mappers;
using ANNUAIRECONGO.Domain.Common.Results;
using FluentValidation;
using FluentValidation.Results;
using MediatR;
using NSubstitute;
using Xunit;

namespace AnnuaireCongo.Application.UnitTests.Behaviours;
public class ValidationBehaviorTests
{
    private readonly ValidationBehavior<CreateCompanyCommand, Result<CompanyDto>> _validationBehavior;
    private readonly IEnumerable<IValidator<CreateCompanyCommand>> _mockValidators;
    private readonly RequestHandlerDelegate<Result<CompanyDto>> _mockNextBehavior;

    public ValidationBehaviorTests()
    {
        _mockNextBehavior = Substitute.For<RequestHandlerDelegate<Result<CompanyDto>>>();
        _mockValidators = new List<IValidator<CreateCompanyCommand>> { Substitute.For<IValidator<CreateCompanyCommand>>() };
        var mockLogger = Substitute.For<Microsoft.Extensions.Logging.ILogger<ValidationBehavior<CreateCompanyCommand, Result<CompanyDto>>>>();

        _validationBehavior = new(_mockValidators, mockLogger);
    }

    [Fact]
    public async Task InvokeValidationBehavior_WhenValidatorResultIsValid_ShouldInvokeNextBehavior()
    {
        // Arrange
        var createCompanyCommand = CompanyCommandFactory.CreateCreateCompanyCommand();
        var companyResponse = CompanyFactory.CreateCompany().Value.ToDto();

        _mockValidators.First()
            .ValidateAsync(Arg.Any<IValidationContext>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(new ValidationResult()));

        _mockNextBehavior.Invoke().Returns(companyResponse);

        // Act
        var result = await _validationBehavior.Handle(createCompanyCommand, _mockNextBehavior, default);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(companyResponse, result.Value);
    }

    [Fact]
    public async Task InvokeValidationBehavior_WhenValidatorResultIsNotValid_ShouldReturnListOfErrors()
    {
        // Arrange
        var createCompanyCommand = CompanyCommandFactory.CreateCreateCompanyCommand();
        var companyResponse = CompanyFactory.CreateCompany().Value.ToDto();

        List<ValidationFailure> validationFailures = [new(propertyName: "property1", errorMessage: "property1 is invalid")];

        _mockValidators.First()
            .ValidateAsync(Arg.Any<IValidationContext>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromResult(new ValidationResult(validationFailures)));

        // Act
        var result = await _validationBehavior.Handle(createCompanyCommand, _mockNextBehavior, default);

        // Assert
        Assert.True(result.IsError);
        Assert.Equal("property1", result.TopError.Code);
        Assert.Equal("property1 is invalid", result.TopError.Description);
    }

    [Fact]
    public async Task InvokeValidationBehavior_WhenNoValidator_ShouldInvokeNextBehavior()
    {
        // Arrange
        var createCompanyCommand = CompanyCommandFactory.CreateCreateCompanyCommand();
        var validationBehavior = new ValidationBehavior<CreateCompanyCommand, Result<CompanyDto>>();

        var company = CompanyFactory.CreateCompany().Value;

        var companyResponse = CompanyFactory.CreateCompany().Value.ToDto();

        _mockNextBehavior.Invoke().Returns(companyResponse);

        // Act
        var result = await validationBehavior.Handle(createCompanyCommand, _mockNextBehavior, default);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(companyResponse, result.Value);
    }
}
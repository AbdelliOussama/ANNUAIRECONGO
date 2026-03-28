using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ANNUAIRECONGO.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixNullableFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CreatedAtUtc",
                table: "CompanyServices",
                type: "datetimeoffset",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "CompanyServices",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastModifiedBy",
                table: "CompanyServices",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "LastModifiedUtc",
                table: "CompanyServices",
                type: "datetimeoffset",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "CompanyServices");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "CompanyServices");

            migrationBuilder.DropColumn(
                name: "LastModifiedBy",
                table: "CompanyServices");

            migrationBuilder.DropColumn(
                name: "LastModifiedUtc",
                table: "CompanyServices");
        }
    }
}

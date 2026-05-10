using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ANNUAIRECONGO.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AuditFixesPhase2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Companies_BusinessOwners_OwnerId",
                table: "Companies");

            migrationBuilder.DropForeignKey(
                name: "FK_Companies_Cities_CityId",
                table: "Companies");

            migrationBuilder.DropForeignKey(
                name: "FK_CompanyImages_Companies_CompanyId1",
                table: "CompanyImages");

            migrationBuilder.DropForeignKey(
                name: "FK_Subscriptions_Companies_CompanyId1",
                table: "Subscriptions");

            migrationBuilder.DropIndex(
                name: "IX_Subscriptions_CompanyId1",
                table: "Subscriptions");

            migrationBuilder.DropIndex(
                name: "IX_CompanySectors_CompanyId",
                table: "CompanySectors");

            migrationBuilder.DropIndex(
                name: "IX_CompanyImages_CompanyId1",
                table: "CompanyImages");

            migrationBuilder.DropColumn(
                name: "CompanyId1",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "CompanyId1",
                table: "CompanyImages");

            migrationBuilder.AlterColumn<Guid>(
                name: "OwnerId",
                table: "Companies",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.CreateIndex(
                name: "IX_CompanySectors_CompanyId_SectorId",
                table: "CompanySectors",
                columns: new[] { "CompanyId", "SectorId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Companies_BusinessOwners_OwnerId",
                table: "Companies",
                column: "OwnerId",
                principalTable: "BusinessOwners",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Companies_Cities_CityId",
                table: "Companies",
                column: "CityId",
                principalTable: "Cities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Companies_BusinessOwners_OwnerId",
                table: "Companies");

            migrationBuilder.DropForeignKey(
                name: "FK_Companies_Cities_CityId",
                table: "Companies");

            migrationBuilder.DropIndex(
                name: "IX_CompanySectors_CompanyId_SectorId",
                table: "CompanySectors");

            migrationBuilder.AddColumn<Guid>(
                name: "CompanyId1",
                table: "Subscriptions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CompanyId1",
                table: "CompanyImages",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "OwnerId",
                table: "Companies",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Subscriptions_CompanyId1",
                table: "Subscriptions",
                column: "CompanyId1");

            migrationBuilder.CreateIndex(
                name: "IX_CompanySectors_CompanyId",
                table: "CompanySectors",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyImages_CompanyId1",
                table: "CompanyImages",
                column: "CompanyId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Companies_BusinessOwners_OwnerId",
                table: "Companies",
                column: "OwnerId",
                principalTable: "BusinessOwners",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Companies_Cities_CityId",
                table: "Companies",
                column: "CityId",
                principalTable: "Cities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CompanyImages_Companies_CompanyId1",
                table: "CompanyImages",
                column: "CompanyId1",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Subscriptions_Companies_CompanyId1",
                table: "Subscriptions",
                column: "CompanyId1",
                principalTable: "Companies",
                principalColumn: "Id");
        }
    }
}

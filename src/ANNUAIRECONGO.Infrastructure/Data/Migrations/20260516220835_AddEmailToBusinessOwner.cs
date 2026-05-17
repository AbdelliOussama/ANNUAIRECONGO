using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ANNUAIRECONGO.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailToBusinessOwner : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "BusinessOwners",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Email",
                table: "BusinessOwners");
        }
    }
}

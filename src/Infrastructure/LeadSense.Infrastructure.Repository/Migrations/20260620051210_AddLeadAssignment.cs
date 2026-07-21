using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LeadSense.Infrastructure.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddLeadAssignment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AssignedToUserId",
                table: "Leads",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssignedToUserId",
                table: "Leads");
        }
    }
}

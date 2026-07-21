using Npgsql;

const string connStr = "Host=localhost;Port=5432;Database=LeadSenseDb;Username=postgres;Password=123ser";
const string newPassword = "Admin@123";

var hash = BCrypt.Net.BCrypt.HashPassword(newPassword, workFactor: 12);

await using var conn = new NpgsqlConnection(connStr);
await conn.OpenAsync();

await using var cmd = conn.CreateCommand();
cmd.CommandText = "UPDATE \"Users\" SET \"PasswordHash\" = @hash WHERE \"Email\" = 'admin@leadsense.com'";
cmd.Parameters.AddWithValue("hash", hash);

var rows = await cmd.ExecuteNonQueryAsync();

if (rows > 0)
    Console.WriteLine($"Password reset successfully.\nEmail:    admin@leadsense.com\nPassword: {newPassword}");
else
    Console.WriteLine("No user found with email admin@leadsense.com. Make sure the backend has run at least once.");

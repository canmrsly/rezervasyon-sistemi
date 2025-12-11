using Microsoft.EntityFrameworkCore;
using ReservationSystem.Application.Interfaces;
using ReservationSystem.Infrastructure.Data;
using ReservationSystem.Infrastructure.Seed;
using ReservationSystem.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

// DbContext
builder.Services.AddDbContext<AppDbContext>(options => { var connectionString = builder.Configuration.GetConnectionString("DefaultConnection"); if (Uri.TryCreate(connectionString, UriKind.Absolute, out var uri) && uri.Scheme == "postgres") { var userInfo = uri.UserInfo.Split(':'); var csBuilder = new Npgsql.NpgsqlConnectionStringBuilder { Host = uri.Host, Port = uri.Port, Username = userInfo[0], Password = userInfo[1], Database = uri.LocalPath.TrimStart('/'), SslMode = Npgsql.SslMode.Prefer, TrustServerCertificate = true }; connectionString = csBuilder.ToString(); } options.UseNpgsql(connectionString); });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5175")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Services
builder.Services.AddScoped<IReservationService, ReservationService>();
builder.Services.AddScoped<IBusinessService, BusinessService>();
builder.Services.AddScoped<IServiceService, ServiceService>();
builder.Services.AddScoped<IStaffService, StaffService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Controllers
builder.Services.AddControllers();

// JWT Key'i config veya ortam değişkeninden oku
var jwtKey = builder.Configuration["Jwt:Key"]
             ?? Environment.GetEnvironmentVariable("JWT_KEY")
             ?? throw new Exception("JWT key not found. Set JWT_KEY environment variable.");

// Issuer / Audience - config'ten gelmezse default ver
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "ReservationSystem";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "ReservationSystemUsers";

var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes)
        };
    });



// Swagger (.NET 9 ile tam uyumlu)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "ReservationSystem.Api",
        Version = "v1"
    });

    // ?? JWT Tanımı
    var securitySchema = new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Bearer {token} şeklinde giriniz.",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new Microsoft.OpenApi.Models.OpenApiReference
        {
            Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
            Id = "Bearer"
        }
    };

    c.AddSecurityDefinition("Bearer", securitySchema);

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            securitySchema,
            new string[] { }
        }
    });
});


builder.Services.AddHttpClient();
var app = builder.Build();

// Swagger UI only in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();   
}
app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();


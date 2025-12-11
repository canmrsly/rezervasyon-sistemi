FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and sln files
COPY ["randevu app/ReservationSystem.sln", "randevu app/"]
COPY ["randevu app/ReservationSystem.Api/ReservationSystem.Api.csproj", "randevu app/ReservationSystem.Api/"]
COPY ["randevu app/ReservationSystem.Application/ReservationSystem.Application.csproj", "randevu app/ReservationSystem.Application/"]
COPY ["randevu app/ReservationSystem.Domain/ReservationSystem.Domain.csproj", "randevu app/ReservationSystem.Domain/"]
COPY ["randevu app/ReservationSystem.Infrastructure/ReservationSystem.Infrastructure.csproj", "randevu app/ReservationSystem.Infrastructure/"]

# Restore dependencies
WORKDIR "/src/randevu app"
RUN dotnet restore "ReservationSystem.Api/ReservationSystem.Api.csproj"

# Copy the rest of the source code
WORKDIR /src
COPY ["randevu app/", "randevu app/"]

# Publish
WORKDIR "/src/randevu app"
RUN dotnet publish "ReservationSystem.Api/ReservationSystem.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "ReservationSystem.Api.dll"]

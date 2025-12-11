FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore as distinct layers
COPY ["ReservationSystem.sln", "."]
COPY ["ReservationSystem.Api/ReservationSystem.Api.csproj", "ReservationSystem.Api/"]
COPY ["ReservationSystem.Application/ReservationSystem.Application.csproj", "ReservationSystem.Application/"]
COPY ["ReservationSystem.Domain/ReservationSystem.Domain.csproj", "ReservationSystem.Domain/"]
COPY ["ReservationSystem.Infrastructure/ReservationSystem.Infrastructure.csproj", "ReservationSystem.Infrastructure/"]
RUN dotnet restore "ReservationSystem.Api/ReservationSystem.Api.csproj"

# Copy the rest of the source
COPY . .

# Publish
RUN dotnet publish "ReservationSystem.Api/ReservationSystem.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "ReservationSystem.Api.dll"]


# ============================================================
# STAGE 1: Build .NET API
# ============================================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS api-build
WORKDIR /src

COPY ["src/ANNUAIRECONGO.Api/ANNUAIRECONGO.Api.csproj", "src/ANNUAIRECONGO.Api/"]
COPY ["src/ANNUAIRECONGO.Application/ANNUAIRECONGO.Application.csproj", "src/ANNUAIRECONGO.Application/"]
COPY ["src/ANNUAIRECONGO.Domain/ANNUAIRECONGO.Domain.csproj", "src/ANNUAIRECONGO.Domain/"]
COPY ["src/ANNUAIRECONGO.Infrastructure/ANNUAIRECONGO.Infrastructure.csproj", "src/ANNUAIRECONGO.Infrastructure/"]
COPY ["src/ANNUAIRECONGO.Contracts/ANNUAIRECONGO.Contracts.csproj", "src/ANNUAIRECONGO.Contracts/"]
COPY ["Directory.Build.props", "."]
COPY ["Directory.Packages.props", "."]

RUN dotnet restore "src/ANNUAIRECONGO.Api/ANNUAIRECONGO.Api.csproj"

COPY . .

RUN dotnet publish "src/ANNUAIRECONGO.Api/ANNUAIRECONGO.Api.csproj" \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

# ============================================================
# STAGE 2: Build Angular App
# ============================================================
FROM node:22-alpine AS client-build
WORKDIR /client

COPY src/ANNUAIRECONGO.Client/package*.json ./
RUN npm ci

COPY src/ANNUAIRECONGO.Client ./

RUN npm run build -- --configuration production

# ============================================================
# STAGE 3: Final Runtime
# ============================================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

RUN apt-get update && \
    apt-get install -y nginx tzdata && \
    ln -fs /usr/share/zoneinfo/Africa/Tunis /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata && \
    rm -rf /var/lib/apt/lists/*

ENV TZ=Africa/Tunis
ENV ASPNETCORE_URLS=http://+:5000

WORKDIR /app

COPY --from=api-build /app/publish ./api
COPY --from=client-build /client/dist/ANNUAIRECONGO.Client/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["sh", "-c", "nginx && dotnet /app/api/ANNUAIRECONGO.Api.dll"]
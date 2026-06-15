# ANNUAIRE CONGO — Complete Documentation

> **End of Studies Project (PFE)**  
> Professional directory platform for the Republic of the Congo  
> Technologies: .NET 10 · Angular 19 · SQL Server  

---

## Table of Contents

### Technical Documentation

1. [Architectural Overview](#1-architectural-overview)
2. [Technologies Used](#2-technologies-used)
3. [Technical Prerequisites](#3-technical-prerequisites)
4. [Installation and Configuration](#4-installation-and-configuration)
5. [Environment Variables and Configuration](#5-environment-variables-and-configuration)
6. [Project Structure](#6-project-structure)
7. [Database and Migrations](#7-database-and-migrations)
8. [REST API — Endpoint Reference](#8-rest-api--endpoint-reference)
9. [Caching System](#9-caching-system)
10. [File System and Storage](#10-file-system-and-storage)
11. [Observability and Logging](#11-observability-and-logging)
12. [Execution in Local Environment](#12-execution-in-local-environment)

### Functional Documentation

13. [Platform Objectives](#13-platform-objectives)
14. [User Roles and Profiles](#14-user-roles-and-profiles)
15. [Available Features](#15-available-features)
16. [User Journeys](#16-user-journeys)
17. [Company Listing Lifecycle](#17-company-listing-lifecycle)
18. [Subscriptions and Plans System](#18-subscriptions-and-plans-system)
19. [Usage Procedures](#19-usage-procedures)

---

# TECHNICAL DOCUMENTATION

---

## 1. Architectural Overview

### 1.1 Architectural Principles

ANNUAIRE CONGO is built on a strict **Clean Architecture** on the backend, paired with a feature-driven **Angular** frontend application. The entire project applies SOLID principles, ensuring separation of concerns and testability at each layer.

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│              Angular 19 · TypeScript · TailwindCSS           │
│                    (SPA — Port 4200)                         │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST (JWT Bearer)
┌──────────────────────────▼──────────────────────────────────┐
│                       API LAYER                              │
│         ASP.NET Core 10 · Versioning · Scalar UI             │
│                    (HTTPS — Port 7139)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   APPLICATION LAYER                          │
│         CQRS · MediatR 14 · FluentValidation · Handlers      │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌─────────────┬────────────▼────────────┬────────────────────┐
│   DOMAIN    │    INFRASTRUCTURE        │    CONTRACTS       │
│  Entities   │  EF Core · Identity      │   Interfaces       │
│  Value Obj. │  JWT · HybridCache       │   DTOs             │
│  Events     │  Serilog · QuestPDF      │                    │
│  Errors     │  Grok AI · Storage       │                    │
└─────────────┴─────────────────────────┴────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                        DATABASE                              │
│              SQL Server · EF Core 10 Code First              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 CQRS Pattern with MediatR

All application operations are expressed as **Commands** (state mutations) and **Queries** (reads). MediatR dispatches these objects to their corresponding handlers. Cross-cutting **Pipeline Behaviors** are automatically inserted:

- **ValidationBehavior** — executes FluentValidation rules before each handler.
- **LoggingBehavior** — logs the input and output of every operation.
- **CachingBehavior** — caches query results for queries implementing `ICachedQuery<T>`.

### 1.3 Admin Rule 0

Content handlers apply a cross-cutting rule: if the current user has the `Admin` role, the ownership check (`IsOwnedBy`) is bypassed. This is necessary because listings created by an administrator have an `OwnerId` corresponding to a `BusinessOwner` GUID that never matches the Identity ID of the administrator.

```csharp
var isAdmin = _currentUser.IsInRole("Admin");
if (!isAdmin)
{
    if (!company.IsOwnedBy(_currentUser.Id))
        return CompanyErrors.NotOwner;
}
```

---

## 2. Technologies Used

### 2.1 Backend (.NET 10)

| Component | Technology | Version |
|-----------|-------------|---------|
| Framework | ASP.NET Core | .NET 10.0 |
| ORM | Entity Framework Core | 10.0.x |
| Internal Messaging | MediatR | 14.1.x |
| Validation | FluentValidation | Latest |
| Authentication | ASP.NET Core Identity + JWT Bearer | Latest |
| Cache | Microsoft.Extensions.Caching.Hybrid | 10.4.x |
| PDF Generation | QuestPDF | 2026.5.x |
| Logging | Serilog + Serilog.Sinks.Seq | Latest |
| Observability | OpenTelemetry + Prometheus | Latest |
| API Documentation | Scalar / Swashbuckle | Latest |
| API Versioning | Asp.Versioning | Latest |
| Image Processing | SixLabors.ImageSharp | Latest |
| Generative AI | Grok API (xAI) — llama-3.3-70b-versatile | Latest |

### 2.2 Frontend (Angular 19)

| Component | Technology | Version |
|-----------|-------------|---------|
| Framework | Angular | 19.2.x |
| Language | TypeScript | 5.7.x |
| Styling | TailwindCSS | 3.4.x |
| Reactivity | RxJS | 7.8.x |
| UI State | Angular Signals | Native |
| Cartography | Leaflet | 1.9.4 |
| Styles Schema | SCSS | — |

### 2.3 Database and Infrastructure

| Component | Technology |
|-----------|-------------|
| Database | SQL Server (LocalDB in dev) |
| Migrations | EF Core Code First |
| File Storage | Local File System (`wwwroot/uploads/`) |
| Centralized Logs | Seq (http://ops.seq:5341) |
| Metrics | Prometheus (endpoint `/metrics`) |

---

## 3. Technical Prerequisites

Before starting the project, the following tools must be installed on the development machine:

### 3.1 Backend

- **.NET SDK 10.0** or higher — [https://dotnet.microsoft.com/download](https://dotnet.microsoft.com/download)
- **SQL Server** (version 2019 or higher) or SQL Server Express / LocalDB
- **SQL Server Management Studio** (optional, for database inspection)
- **EF Core CLI**: `dotnet tool install --global dotnet-ef`

### 3.2 Frontend

- **Node.js 20 LTS** or higher — [https://nodejs.org](https://nodejs.org)
- **npm 10+** (included with Node.js)
- **Angular CLI**: `npm install -g @angular/cli`

### 3.3 Infrastructure (optional in development)

- **Docker** (for Seq and other services): `docker run -d -p 5341:80 datalust/seq`
- **Seq** — structured log aggregator

---

## 4. Installation and Configuration

### 4.1 Clone the Repository

```bash
git clone <repository-url>
cd ANNUAIRECONGO
```

### 4.2 Database Configuration

Create or verify the connection string in `src/ANNUAIRECONGO.Api/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=.;Database=AnnuaireCongoDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;"
}
```

Apply migrations and seed initial data:

```bash
cd src/ANNUAIRECONGO.Api
dotnet ef database update
```

The database initialization is automatically executed at startup via `InitialiseDatabaseAsync()`, which creates:
- 3 Admin users
- 11 EntrepriseOwner users
- 3 subscription plans (Free, Pro, Premium)
- 15 demo companies (real Congolese companies)

### 4.3 Start the Backend

```bash
cd src/ANNUAIRECONGO.Api
dotnet run
```

The API will be available at `https://localhost:7139`. The interactive Scalar documentation is accessible at `https://localhost:7139/scalar`.

### 4.4 Install Frontend Dependencies

```bash
cd src/ANNUAIRECONGO.Client
npm install
```

### 4.5 Start the Frontend

```bash
ng serve
# or
npm start
```

The Angular application will be available at `http://localhost:4200`.

### 4.6 Start Seq (optional)

```bash
docker run -d --name seq -e ACCEPT_EULA=Y -p 5341:80 datalust/seq
```

The Seq dashboard is accessible at `http://localhost:5341`.

---

## 5. Environment Variables and Configuration

All configuration is located in `src/ANNUAIRECONGO.Api/appsettings.json`. In production, these values must be overridden via `appsettings.Production.json` or system environment variables.

### 5.1 Database Connection

```json
"ConnectionStrings": {
  "DefaultConnection": "<SQL Server Connection String>"
}
```

### 5.2 Application Settings

```json
"AppSettings": {
  "LocalCacheExpirationInMins": 5,
  "DistributedCacheExpirationMins": 5,
  "DefaultPageNumber": 1,
  "DefaultPageSize": 10,
  "CorsPolicyName": "AnnuaireCongo",
  "AllowedOrigins": ["http://localhost:4200"],
  "ClientAppUrl": "http://localhost:4200"
}
```

### 5.3 JWT Authentication

```json
"JwtSettings": {
  "Secret": "<HMAC-256 Secret Key — min. 64 characters>",
  "TokenExpirationInMinutes": 60,
  "Issuer": "localhost",
  "Audience": "localhost"
}
```

The access token expires after **60 minutes**. A refresh token allows retrieving a new access token without re-entering credentials.

### 5.4 File Storage

```json
"StorageSettings": {
  "BaseUrl": "https://localhost:7139",
  "MaxFileSizeBytes": 10485760
}
```

Files are stored in `wwwroot/uploads/{folder}/{guid}{extension}` and served as static files. The authorized folders are: `logos`, `covers`, `documents`, `services`, `images`, `invoices`.

Accepted extensions by type:
- **Images**: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`
- **Documents**: `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.png`, `.jpg`, `.jpeg`

### 5.5 Artificial Intelligence (Grok)

```json
"GrokSettings": {
  "Model": "llama-3.3-70b-versatile"
}
```

The Grok API key must be configured separately in the application secrets (`dotnet user-secrets` or environment variable `GrokSettings__ApiKey`).

### 5.6 Logging (Serilog)

```json
"Serilog": {
  "MinimumLevel": { "Default": "Information" },
  "WriteTo": [
    { "Name": "Console" },
    { "Name": "Seq", "Args": { "serverUrl": "http://ops.seq:5341" } }
  ]
}
```

---

## 6. Project Structure

### 6.1 Backend Solution (5 Projects)

```
ANNUAIRECONGO/
├── src/
│   ├── ANNUAIRECONGO.Api/                    # Presentation Layer
│   │   ├── Controllers/                      # REST Controllers
│   │   ├── Middlewares/                      # Custom Middlewares
│   │   ├── Extensions/                       # Service Extensions
│   │   ├── Program.cs                        # Entry Point
│   │   └── appsettings.json                  # Configuration
│   │
│   ├── ANNUAIRECONGO.Application/            # Application Layer (CQRS)
│   │   ├── Common/
│   │   │   ├── Behaviors/                    # MediatR Pipeline
│   │   │   ├── Interfaces/                   # Abstractions (IAppDbContext, IUser…)
│   │   │   └── Models/                       # Shared Models
│   │   └── Features/
│   │       ├── AdminLogs/
│   │       ├── Ai/
│   │       ├── BusinessOwners/
│   │       ├── Companies/
│   │       │   ├── Commands/
│   │       │   │   ├── Contacts/             # AddContact, UpdateContact, RemoveContact
│   │       │   │   ├── Documents/            # AddDocument, RemoveDocument
│   │       │   │   ├── Images/               # AddImage, RemoveImage
│   │       │   │   ├── Services/             # AddService, RemoveService
│   │       │   │   └── [Status Commands]     # Submit, Validate, Reject, Suspend…
│   │       │   └── Queries/
│   │       ├── Geography/
│   │       ├── Identity/                     # Login, Register, Refresh, Reset…
│   │       ├── Notifications/
│   │       ├── Plans/
│   │       ├── Sectors/
│   │       ├── Stats/
│   │       ├── Subscriptions/
│   │       └── UserSubscriptions/
│   │
│   ├── ANNUAIRECONGO.Contracts/              # Shared Input/Output DTOs
│   │
│   ├── ANNUAIRECONGO.Domain/                 # Domain Layer (Pure Entities)
│   │   ├── Analytics/
│   │   ├── BusinessOwners/
│   │   ├── Companies/
│   │   │   ├── Company.cs                    # Main Aggregate
│   │   │   ├── Enums/CompanyStatus.cs        # Draft, Pending, Active, Rejected, Suspended
│   │   │   └── Events/                       # Domain Events
│   │   ├── Geography/                        # Region, City
│   │   ├── Identity/                         # Role (Admin, EntrepriseOwner, RegularUser)
│   │   ├── Logs/
│   │   ├── Notifications/
│   │   ├── Sectors/
│   │   ├── Subscriptions/
│   │   │   ├── Plans/                        # Plan, PlanName (Free/Pro/Premium)
│   │   │   └── Payments/                     # Payment, events
│   │   ├── UserProfiles/
│   │   └── UserSubscriptions/
│   │
│   └── ANNUAIRECONGO.Infrastructure/         # Infrastructure Layer
│       ├── Data/
│       │   ├── AppDbContext.cs               # Entity Framework Database Context (22 DbSets)
│       │   ├── Configurations/               # Fluent API Configuration per entity
│       │   ├── Migrations/                   # 12 EF Core Database Migrations
│       │   ├── Interceptors/                 # AuditableEntityInterceptor
│       │   └── Seeders/                      # PlanSeeder, CompanySeeder…
│       ├── Services/
│       │   ├── IdentityService.cs
│       │   ├── LocalStorageService.cs
│       │   ├── GrokService.cs
│       │   ├── NotificationService.cs
│       │   └── InvoiceService.cs             # QuestPDF
│       └── BackgroundServices/
│           └── AnalyticsAggregationBackgroundService.cs
```

### 6.2 Frontend Application (Angular 19)

```
src/ANNUAIRECONGO.Client/src/app/
├── core/
│   ├── guards/                               # AuthGuard, RoleGuard, EspaceGuard
│   ├── interceptors/                         # auth.interceptor.ts (JWT auto-attach)
│   ├── services/                             # ApiService, AuthService, CompanyService…
│   └── models/                              # TypeScript Interfaces (Company, User…)
│
├── features/
│   ├── admin/                                # Administrator Space
│   │   ├── abonnements/                      # Subscription Management
│   │   ├── audit/                            # Audit Logs
│   │   ├── dashboard/                        # Admin Dashboard
│   │   ├── dirigeants/                       # BusinessOwners Management
│   │   ├── entreprises/                      # List + Detail + Edition of Company sheets
│   │   ├── forfaits/                         # Plans Management
│   │   ├── geographie/                       # Regions and Cities
│   │   ├── logs/                             # System Logs
│   │   ├── notifications/                    # Admin Notification Center
│   │   ├── parametres/                       # Platform Settings
│   │   ├── secteurs/                         # Activity Sectors Management
│   │   ├── signalements/                     # Reports Moderation
│   │   ├── statistiques/                     # Global Analytics
│   │   ├── utilisateurs/                     # Accounts Management
│   │   └── validation/                       # Validation Queue
│   │
│   ├── auth/                                 # Authentication
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   └── verify-email/
│   │
│   ├── espace/                               # Company Owner Space
│   │   ├── abonnement/                       # Subscription management
│   │   ├── compte/                           # Profile Account details
│   │   ├── console/                          # Company Dashboard Console
│   │   ├── fiche/                            # Company Profile Editor
│   │   ├── notifications/                    # Company Notifications
│   │   └── statistiques/                     # Business Listing Stats
│   │
│   └── public/                               # Public Pages (Anonymous)
│       ├── accueil/                          # Homepage
│       ├── annuaire/                         # Company Search and Directory List
│       ├── cartographie/                     # Interactive Map (Leaflet)
│       ├── contact/                          # Contact Form
│       ├── extras/                           # Supplementary Pages
│       ├── legal/                            # Legal Notices, T&Cs
│       ├── not-found/                        # 404 Error Page
│       ├── registre/                         # National Registry
│       ├── secteurs/                         # Sector Navigation
│       ├── support/                          # Help and FAQ
│       └── tarifs/                           # Pricing and Plans Page
│
├── layout/
│   ├── admin/                                # Admin Space Shell
│   ├── auth/                                 # Authentication Pages Shell
│   ├── espace/                               # Company Owner Space Shell
│   └── public/                               # Public Pages Shell (Navbar + Footer)
│
└── shared/
    ├── ui/                                   # Reusable UI Components
    ├── services/                             # Shared Utilities Services
    └── pipes/                               # Custom Angular Pipes
```

---

## 7. Database and Migrations

### 7.1 DbContext and Entities

The `AppDbContext` exposes **22 DbSets** corresponding to domain and system entities:

| DbSet | Description |
|-------|-------------|
| `RefreshTokens` | Tokens used for JWT access token renewals |
| `BusinessOwners` | Profiles of registered company owners (EO) |
| `Regions` | Geographical departments/regions of Congo |
| `Cities` | Municipalities and cities within departments |
| `Companies` | Company listings (central aggregate) |
| `Sectors` | Activity domains (Maritime, Logistics, etc.) |
| `CompanyContacts` | Addresses, phone, email, and social networks |
| `CompanySectors` | Cross-mapping table between companies and sectors |
| `CompanyImages` | Gallery assets belonging to company sheets |
| `CompanyDocuments` | Official documents attached (RCCM, NIU, etc.) |
| `CompanyServices` | Catalog of services offered by listed companies |
| `CompanyReports` | User-submitted flags for inappropriate content |
| `AnalyticsDailySummaries` | Aggregated analytics performance metrics |
| `ContactClicks` | Track actions on contact details |
| `ProfileViews` | Track daily views per company listing |
| `AdminLogs` | System records for administrative changes |
| `Notifications` | Dynamic real-time communications queue |
| `Subscriptions` | Subscriptions bought by companies |
| `Payments` | Financial records of bought plans |
| `Plans` | Catalog of packages (Free, Pro, Premium) |
| `UserProfiles` | B2C profiles of regular users |
| `UserSubscriptions` | Subscriptions bought by individual users |

An **`AuditableEntityInterceptor`** automatically appends `CreatedAt`, `UpdatedAt`, and `CreatedBy` properties to all auditable entity inserts and updates.

### 7.2 Database Migrations History

The database is built sequentially using Entity Framework Core. Below is the list of active migrations:

| # | Migration | Purpose |
|---|-----------|---------|
| 01 | `20260322000307_InitialMigration` | Initial database creation including Core tables, Identity integration, and base relations. |
| 02 | `20260322223422_UpdateSectorTable` | Introduces styling icons and slug parameters to activity sectors. |
| 03 | `20260328142145_FixNullableFields` | Changes specific fields to nullable status to facilitate partial draft saves. |
| 04 | `20260328142705_FixNullableFieldsAddress` | Standardizes address constraints to allow draft creation with sparse data. |
| 05 | `20260505073248_UpdateCompanyTable` | Extends company data attributes including year founded and media assets. |
| 06 | `20260509232707_UpdateNotificationTable` | Standardizes notification channels and message metadata formatting. |
| 07 | `20260510160708_AuditFixesPhase2` | Enhances structured logging constraints and registers new system tables. |
| 08 | `20260510162830_DateTimeOffsetSync` | Converts all temporal values across database tables to `DateTimeOffset` for timezone safety. |
| 09 | `20260510224532_AddSubmittedAtToCompany` | Appends workflow metrics enabling tracking of listing validation durations. |
| 10 | `20260516220835_AddEmailToBusinessOwner` | Standardizes directory contact information inside the BusinessOwner domain model. |
| 11 | `20260519135125_AddTrustScoreToCompany` | Extends validation metadata with trust score metrics. |
| 12 | `20260607164450_AddUserProfileAndUserSubscription` | Deploys B2C user profile features and individual subscription endpoints. |

---

## 8. REST API — Endpoint Reference

All endpoints are versioned (`v1`) and prefixed with `/api/v1/`. Interactive documentation is available via Scalar at `https://localhost:7139/scalar`.

### 8.1 Authentication (`/api/v1/auth`)

| Method | Endpoint | Required Role | Description |
|--------|----------|---------------|-------------|
| POST | `/register` | — | Registers a new user |
| POST | `/login` | — | User login; issues JWT access and refresh tokens |
| POST | `/refresh-token` | — | Refreshes an expired access token |
| POST | `/forgot-password` | — | Initiates password recovery process |
| POST | `/reset-password` | — | Resets user password using token |
| POST | `/verify-email` | — | Verifies a newly registered email address |
| GET | `/me` | Authenticated | Retrieves profile of currently authenticated user |
| POST | `/logout` | Authenticated | Discards active session and refresh tokens |

### 8.2 Companies (`/api/v1/companies`)

| Method | Endpoint | Required Role | Description |
|--------|----------|---------------|-------------|
| GET | `/` | — | Paged listing of active companies with filters |
| GET | `/{id}` | — | Retrieves company listing by GUID |
| GET | `/{slug}` | — | Retrieves company listing by URL Slug |
| POST | `/` | Admin, EntrepriseOwner | Creates a new draft listing |
| PUT | `/{id}/update-company-profile` | Admin, EntrepriseOwner | Modifies company details |
| PUT | `/{id}/update-media` | Admin, EntrepriseOwner | Modifies logo and banner cover URLs |
| POST | `/{id}/submit-company` | Admin, EntrepriseOwner | Submits listing to verification queue |
| POST | `/{id}/validate-company` | Admin | Approves pending listing |
| POST | `/{id}/reject-company` | Admin | Rejects listing with rejection reason details |
| POST | `/{id}/suspend-company` | Admin | Suspends active company listing |
| POST | `/{id}/reactivate-company` | Admin, EntrepriseOwner | Reactivates a suspended or draft company |
| PATCH | `/{id}/verify-company` | Admin | Marks company as "Verified badge" |
| POST | `/{id}/add-contact` | Admin, EntrepriseOwner | Adds contact point (Phone, WhatsApp, etc.) |
| DELETE | `/{id}/contacts/{contactId}` | Admin, EntrepriseOwner | Removes contact point |
| PUT | `/{id}/update-contact` | Admin, EntrepriseOwner | Edits contact properties |
| POST | `/{id}/add-service` | Admin, EntrepriseOwner | Adds catalogue service |
| DELETE | `/{id}/services/{serviceId}` | Admin, EntrepriseOwner | Removes catalogue service |
| POST | `/{id}/add-image` | Admin, EntrepriseOwner | Uploads company image to gallery |
| DELETE | `/{id}/images/{imageId}` | Admin, EntrepriseOwner | Removes gallery asset |
| POST | `/{id}/add-document` | Admin, EntrepriseOwner | Uploads official document (PDF, Image) |
| DELETE | `/{id}/documents/{documentId}` | Admin, EntrepriseOwner | Removes official document |
| POST | `/{id}/add-report` | Authenticated | Reports listing for moderation |
| GET | `/reports` | Admin | Retrieves reported listings queue |
| POST | `/reports/{reportId}/process` | Admin | Moderates report resolution status |
| POST | `/{id}/generate-description` | Admin, EntrepriseOwner | Generates profile overview text via Grok AI |
| GET | `/{id}/recommendations` | — | Recommends similar listings |
| POST | `/{id}/contact-click` | — | Registers analytics interaction |

### 8.3 B2B Subscriptions (`/api/v1/subscriptions`)

| Method | Endpoint | Required Role | Description |
|--------|----------|---------------|-------------|
| GET | `/company/{id}` | Admin, EntrepriseOwner | Retrieves company packages history |
| POST | `/subscribe` | Admin, EntrepriseOwner | Assigns corporate package plan |
| DELETE | `/{id}/cancel` | Admin, EntrepriseOwner | Disables active automated renewal |

### 8.4 B2C User Subscriptions (`/api/v1/user-subscriptions`)

| Method | Endpoint | Required Role | Description |
|--------|----------|---------------|-------------|
| GET | `/my` | RegularUser | Retrieves B2C profile's current active plan |
| POST | `/subscribe` | RegularUser | Purchases personal package (Free, Pro, Premium) |
| DELETE | `/{subscriptionId}/cancel` | RegularUser | Terminates active B2C subscription plan |

### 8.5 Plans (`/api/v1/plans`)

| Method | Endpoint | Required Role | Description |
|--------|----------|---------------|-------------|
| GET | `/` | — | Lists active purchase plan parameters |
| GET | `/{id}` | — | Retrieves plan pricing and features details |
| POST | `/` | Admin | Introduces a new purchase plan |
| PUT | `/{id}` | Admin | Modifies purchase plan limits and price |

### 8.6 Sectors, Geography, Statistics, and Notifications

Dedicated sub-controllers manage specialized tasks across routes `/api/v1/sectors`, `/api/v1/regions`, `/api/v1/cities`, `/api/v1/stats`, `/api/v1/notifications`, `/api/v1/users`, and `/api/v1/business-owners`.

---

## 9. Caching System

The platform leverages **HybridCache** (Microsoft.Extensions.Caching.Hybrid) utilizing a two-tier configuration:

| Layer | Type | Duration |
|-------|------|----------|
| L1 | Local In-Process Memory Cache | 30 seconds |
| L2 | Distributed Cache (IDistributedCache) | 10 minutes |

Highly requested read operations (sectors list, regions dropdown, public profiles) implement `ICachedQuery<T>`. Sensitive data or frequently mutated models (such as active subscriptions or payment validations) bypass the cache layer entirely.

> [!IMPORTANT]
> **Serialization Constraints**: The cached wrapper `ICachedQuery<Result<T>>` must not be used when `T` is an explicit union type like `Result<T>` because `System.Text.Json` cannot serialize generic wrapper instances. For such operations, query commands inherit standard `IRequest<Result<T>>` interfaces directly.

---

## 10. File System and Storage

Uploaded media files are stored on the local storage partition under `wwwroot/uploads/` and served as static resources by ASP.NET Core:

```
wwwroot/
└── uploads/
    ├── logos/        # Company brand icons
    ├── covers/       # Company profile hero banners
    ├── images/       # Gallery photos
    ├── documents/    # PDFs and official business papers
    ├── services/     # Illustration icons for services
    └── invoices/     # Financial invoice documents (QuestPDF output)
```

To prevent naming collisions and deter directory harvesting exploits, uploaded files are systematically renamed to custom GUIDs. The maximum allowable payload limit is **10 MB** per upload.

The layout isolates local storage using the `IStorageService` interface abstraction, enabling seamless future migration to cloud services (such as Azure Blob Storage or AWS S3) without impacting application code.

---

## 11. Observability and Logging

### 11.1 Structured Logging (Serilog)

Logs are generated in JSON format and enriched with active HTTP headers and environment telemetry. Output targets include:
- **Console**: Structured output optimized for local development.
- **Seq**: Centralized logging collector and analytics dashboard (`http://ops.seq:5341`).

### 11.2 Telemetry (OpenTelemetry)

Metrics are collected via OpenTelemetry and exposed on the `/metrics` path for scraping by Prometheus. Traces capture API response times, routing delays, and database query executions.

### 11.3 Administrative Audit Logs

Sensitive modifications executed by administrators (such as approvals, rejections, and suspensions) are logged to the `AdminLogs` database table. Captured data includes administrator ID, target object GUID, action category, and timestamp parameters.

---

## 12. Execution in Local Environment

### 12.1 Launching the Services

```bash
# 1. SQL Server must be active locally.

# 2. Terminal 1 — Backend Web API
cd src/ANNUAIRECONGO.Api
dotnet run

# 3. Terminal 2 — Frontend client
cd src/ANNUAIRECONGO.Client
ng serve

# 4. (Optional) Terminal 3 — Centralized logging
docker run -d --name seq -e ACCEPT_EULA=Y -p 5341:80 datalust/seq
```

### 12.2 Development Environment URLs

| Service | Address |
|---------|---------|
| Frontend Client | `http://localhost:4200` |
| Backend API | `https://localhost:7139` |
| Interactive Scalar Docs | `https://localhost:7139/scalar` |
| OpenTelemetry Metrics | `https://localhost:7139/metrics` |
| Centralized Logs (Seq) | `http://localhost:5341` |

### 12.3 Seeder Accounts

The database seeder automatically provisions test credentials at initial launch:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@localhost` | `admin@localhost` |
| Company Owner | `suzan.businessOwner@localhost` | `Password123!` |
| Regular User | (Create via registration) | — |

> [!NOTE]
> Please refer to [ApplicationDbContextInitialiser.cs](file:///c:/Users/oussa/Desktop/PFE%20Project/ANNUAIRECONGO/src/ANNUAIRECONGO.Infrastructure/Data/ApplicationDbContextInitialiser.cs) to view the complete list of generated accounts.

---

# FUNCTIONAL DOCUMENTATION

---

## 13. Platform Objectives

**ANNUAIRE CONGO** is a professional business directory platform designed for the Republic of the Congo. It addresses three primary target audiences:

**Congolese Businesses and Professionals** are provided a dedicated online showcase. Through the platform, they can publish rich details (profile overviews, contact points, services catalogue, photo galleries, and documents), benefit from search engine indexing, and monitor traffic metrics.

**Visitors and Customers** can find and verify regional businesses. They can search using terms, sector definitions, cities, and regions, browse the interactive Leaflet map, and view listings.

**Platform Administrators** are equipped with a management back-office console to moderate registrations, audit user account permissions, process system alerts, and track payment transactions.

---

## 14. User Roles and Profiles

The platform defines four categories of users (including three authenticated roles):

### 14.1 Visitor (Anonymous)
- Pervasive read-only access to published listings.
- Can perform queries, view regions, and check pricing tables.
- Cannot create company profiles or access personal consoles.

### 14.2 RegularUser (Individual User)
- Personal account profile.
- Can report inappropriate listings for moderation.
- Can buy individual B2C subscriptions (`UserSubscriptions`) to unlock access to sensitive information.
- Cannot publish business profiles.

### 14.3 EntrepriseOwner (Company Owner)
- Corporate profile linked to one or more business sheets via a `BusinessOwner` entity.
- Grants access to the **Company Space** (`/espace`), featuring:
  - Analytics dashboard containing visit and contact click statistics.
  - Profile editor interface (general information, contacts, services, galleries, and documents).
  - Billing history and subscription upgrade controls.
  - real-time notification queue.

### 14.4 Admin (Administrator)
- Complete control of system data via the **Admin Panel** (`/admin`).
- Can edit any listing (bypassing owner checks via **Admin Rule 0**).
- Can validate, reject, suspend, or reactivate company listings.
- Moderates user profiles, system flags, geographical sectors, and plans pricing.
- Inspects system performance metrics and audit trails.

> [!IMPORTANT]
> **Navigation Constraints**: Administrators **do not have access** to the company workspace (`/espace`). Accessing `/espace` triggers the `espaceGuard` which redirects the admin to `/admin`. Admin account settings are managed via a dedicated "Mon compte" link in the topbar next to the notification icon.

---

## 15. Available Features

### 15.1 Search Directory
- **Advanced Query Filters**: Filter by keywords, activity sector, city, and department.
- **Smart Search**: Semantic search assistance for better matches.
- **Sorting**: Order results by alphabetical name, creation date, and relevance parameters.
- **Detailed Profiles**: Rich listings presenting contacts, services, map location markers, and downloadable documents.
- **Recommendations**: Automated matching engine highlighting similar companies below the profile details.

### 15.2 Interactive Map (Leaflet)
- Map display displaying geographical coordinates of approved companies.
- Fully constrained and locked to the Republic of Congo (coordinates centered on ~ -1.5, 15.0, minimum zoom 6, with max bounds viscosity `1.0` to keep the user focused on the country).
- Interactive marker popups routing users to listing details.

### 15.3 Company Space (`/espace`)
- **Dashboard Stats**: Track views, contact clicks, and bookmarks over custom time windows.
- **Profile Customizer**: Manage metadata (business name, category, department, town, and corporate identifiers like RCCM and NIU).
- **Billing Manager**: Review invoice PDF generations, select package tiers, and follow payments status.

### 15.4 AI Description Generator
- Integrated Grok AI helper (`llama-3.3-70b-versatile` model) enabling operators to generate structured company profile text based on name, city, category, and services data.

### 15.5 Reporting System
- Authenticated users can report listings violating rules. Submissions are enqueued in the admin dashboard for resolution.

### 15.6 Admin Console (`/admin`)
- **Main Dashboard**: Platform performance metrics (approved companies count, user retention, financial details).
- **Approvals Pipeline**: Validation queue of companies in `Pending` status.
- **Access Management**: Audit logs, user accounts validation, system performance charts, and reports moderation.

---

## 16. User Journeys

### 16.1 Visitor Journey → Discovering a Business

```
Homepage
    └── Search Bar (or Sector Navigation)
            └── Directory Results List
                    └── Public Company Profile
                            ├── View Contacts (Masked if not authorized)
                            ├── Browse Image Gallery
                            ├── Access Legal Documents (Lock icon if not authorized)
                            └── Interactive Map Marker
```

### 16.2 EnterpriseOwner Journey → Creating and Publishing a Listing

```
Registration (role: EntrepriseOwner)
    └── Email Verification
            └── Login
                    └── Company Space (/espace)
                            └── Create New Listing (Draft)
                                    └── Fill Profile Metadata
                                            └── Add Contacts, Services, and Images
                                                    └── Submit for Verification (→ Pending)
                                                            └── Admin Review & Approval (→ Active)
                                                                    └── Profile Visible in Public Directory
```

### 16.3 Admin Journey → Moderating a Listing

```
Login (role: Admin)
    └── Admin Space (/admin)
            └── Validation Queue (Pending listings)
                    └── View Company Profile details
                            ├── [Approve] → Profile status set to Active (visible)
                            └── [Reject + Reason] → Profile status set to Rejected (owner notified)
```

### 16.4 Admin Journey → Editing a Listing Directly

```
Admin Space → Companies List
    └── Select Target Company
            └── Click "Edit Profile"
                    └── Dedicated Editor Screen (/admin/entreprises/:id/editer)
                            └── Modify & Save Changes
                                    └── Redirect to Profile Detail View (/admin/entreprises/:id)
```

### 16.5 EnterpriseOwner Journey → Purchasing a Corporate Plan

```
Company Space → Billing
    └── Select Subscription Plan (Free / Pro / Premium)
            └── Confirm Purchase & Submit Payment details
                    └── Generate Invoice PDF (QuestPDF)
                            └── Plan Activation (new media and document limits unlocked)
```

---

## 17. Company Listing Lifecycle

Company profiles progress through states enforced by domain logic in the `Company` aggregate:

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                                                         │
               Creation                                                       │
                  │                                                           │
                  ▼                                                           │
            ┌──────────┐    Submit()    ┌─────────┐   Validate()  ┌────────┐  │
            │  Draft   │ ────────────▶ │ Pending │ ────────────▶ │ Active │  │
            └──────────┘               └─────────┘               └────────┘  │
                                            │                         │        │
                                     Reject(reason)              Suspend()    │
                                            │                         │        │
                                            ▼                         ▼        │
                                     ┌──────────┐              ┌───────────┐  │
                                     │ Rejected │              │ Suspended │  │
                                     └──────────┘              └───────────┘  │
                                                                     │         │
                                                               Reactivate()   │
                                                                     │         │
                                                                     └─────────┘
```

| Status | Value | Visible in Search? | Editable by Owner? |
|--------|-------|--------------------|--------------------|
| **Draft** | 0 | No | Yes |
| **Pending** | 1 | No | No |
| **Active** | 2 | **Yes** | Yes |
| **Rejected** | 3 | No | Yes (Can modify and re-submit) |
| **Suspended** | 4 | No | No |

---

## 18. Subscriptions and Plans System

The platform offers three B2B packages with varying storage and feature limits:

| Plan | Price | Duration | Max Images | Max Documents | Key Features |
|------|-------|----------|------------|---------------|--------------|
| **Free** | 0 XAF | 365 Days | 3 | 1 | Basic profile details. |
| **Pro** | 25,000 XAF | 30 Days | 10 | 5 | Rich profile, advanced analytics dashboard. |
| **Premium** | 75,000 XAF | 30 Days | 50 | 20 | Complete profile details, featured badge priority, full analytics. |

- **Free Tier Default**: Every new listing defaults to the Free plan.
- **Sensitive Data Visibility**: Access control rules hide highly sensitive data (such as **RCCM**, **NIU**, **Équipe**, and **Documents Légaux**) from public users and users on the Free subscription plan.
- **Visibility Requirements**:
  - The company **owner** can view all details.
  - **Administrators** can view all details.
  - **Paid users** can view all details. A regular user (B2C) must have an active paid `UserSubscription`. A business owner (B2B) must have a premium company status (`isPremium === true`) verified via `BusinessOwnerService.getMyCompanies()`.

---

## 19. Usage Procedures

### 19.1 Setting Up a Business Account

1. Navigate to the registration page (`/auth/inscription`).
2. Register an account assigning the role `EntrepriseOwner`.
3. Confirm registration via the verification email link.
4. Log in (`/auth/connexion`).
5. Open the company dashboard space (`/espace`).
6. Initiate profile details configuration.

### 19.2 Publishing a Listing

1. Go to the profile editor in `/espace`.
2. Complete all required inputs (Name, Category/Sector, City, Description).
3. Click the **"Submit for validation"** button.
4. The listing moves to `Pending` status and enters the administrative validation queue.
5. You will receive a notification once the review is completed.

### 19.3 Reviewing Listings (Admin)

1. Log in with an Admin account.
2. Navigate to `Admin → Validation`.
3. Select a pending company listing.
4. Click **"Validate"** to publish or **"Reject"** (with rejection reason feedback).
5. The listing owner is notified.

### 19.4 Direct Profile Edits (Admin)

1. Open `Admin → Entreprises`.
2. Find the target company listing.
3. Click the **"Edit Profile"** button at the top.
4. Modify company details and click **"Save"**. You are returned to the details view.

### 19.5 Generating Profiles via AI

1. Open the profile editor (either in the company workspace or admin panel).
2. Ensure Company Name, Category, City, and at least one service are completed.
3. Click **"Generate with AI"**.
4. The AI analyzes inputs and creates a professional overview. Review and save.

### 19.6 Upgrading to a Corporate Plan

1. Navigate to the **Subscription** page in the company workspace.
2. Select either the Pro or Premium plan.
3. Complete the checkout form and submit payment.
4. The plan activates immediately upon success, and the PDF invoice becomes downloadable from your billing history.

### 19.7 Reporting Listings

1. View the public company listing profile.
2. Click the **"Report"** button.
3. Choose the reporting reason, enter supporting comments, and confirm.
4. The report is submitted to administrators.

### 19.8 Searching Listings

1. Go to the homepage or search directory (`/annuaire`).
2. Input target terms in the search bar.
3. Filter search results by sector, city, or department.
4. Browse directory records and select a business name to open the detailed page.

---

## Annexes

### A. Glossary

| Term | Definition |
|------|------------|
| **Fiche entreprise** | The detailed showcase page of a business listing in the directory. |
| **BusinessOwner** | Domain entity profile representing a business owner (distinct from the login Identity account). |
| **Draft** | A listing that is not yet verified, visible only to its creator. |
| **Pending** | A listing waiting for administrator approval. |
| **Active** | A validated listing visible in the public search directory. |
| **CQRS** | Command Query Responsibility Segregation — design separating data writes from reads. |
| **JWT** | JSON Web Token — standard authentication token format. |
| **HybridCache** | Cache setup combining in-memory local caching and distributed backend caching. |
| **Admin Rule 0** | Bypasses ownership verification checks for administrators. |
| **Slug** | Human-readable URL identifier derived from the listing name (e.g., `societe-generale-congo`). |

### B. Common Error Codes

| HTTP Code | Label | Application Meaning |
|-----------|-------|---------------------|
| 400 | Bad Request | Invalid inputs, missing properties, or format exceptions. |
| 401 | Unauthorized | Missing, malformed, or expired JWT session token. |
| 403 | Forbidden | Access denied due to insufficient roles or not owning the listing. |
| 404 | Not Found | Target record does not exist in the database. |
| 409 | Conflict | Resource already exists (e.g., duplicate email registration). |
| 500 | Internal Server Error | Unhandled backend exception. |

### C. Code Conventions

**Backend (.NET)**
- Namespaces are written in PascalCase matching project directory trees.
- Command requests are named `[Action][Entity]Command` (e.g., `AddContactCommand`).
- Query requests are named `Get[Entity][Criteria]Query` (e.g., `GetCompanyByIdQuery`).
- MediatR handlers are marked `sealed` and declared one handler per file.
- Business validation errors are declared as static properties in `[Entity]Errors` classes.

**Frontend (Angular)**
- Files use kebab-case formatting, and component classes use PascalCase.
- Services are injected using Angular 19 functional `inject()` methods.
- UI state properties are managed via reactive `signal<>()` and `computed()` hooks.
- HTTP operations return RxJS `Observable<T>` instances wrapping ApiService responses.
- Router definitions load components lazily using dynamic `loadComponent()` calls.

---

*Documentation generated on June 15, 2026 — ANNUAIRE CONGO v1.0*

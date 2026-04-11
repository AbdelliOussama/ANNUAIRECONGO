# ANNUAIRECONGO - Professional Business Directory API

ANKOIRECONGO is a comprehensive RESTful API designed to power a professional business directory for the Republic of Congo. The platform enables businesses to register, manage their profiles, and be discoverable by potential clients through an organized directory structure organized by geographic regions, cities, and business sectors.

## Table of Contents

- [Project Vision](#project-vision)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Features](#features)
- [Domain Model](#domain-model)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Configuration](#configuration)

---

## Project Vision

ANNUAIRECONGO addresses the need for a centralized business directory in the Republic of Congo. The platform facilitates business discovery by organizing companies geographically (by region and city) and by industry sector. Businesses can create detailed profiles with contact information, services offered, operating hours, and supporting documentation. The system supports a subscription-based model enabling different levels of visibility and feature access.

---

## Technology Stack

### Framework & Runtime
- **.NET 10.0** - Modern cross-platform framework
- **ASP.NET Core** - Web API framework

### Data & Storage
- **Entity Framework Core 10.0.5** - ORM for database operations
- **Microsoft SQL Server** - Primary relational database
- **Hybrid Caching** - In-memory and distributed caching

### Authentication & Security
- **JWT Bearer Tokens** - Stateless authentication
- **ASP.NET Core Identity** - User management
- **Role-based Authorization** - Permission management

### API Documentation & Versioning
- **OpenAPI / Swagger** - API documentation
- **Scalar.AspNetCore** - Alternative API exploration UI
- **API Versioning** - Version management via URL segments

### Validation & Patterns
- **FluentValidation** - Declarative validation rules
- **MediatR** - Mediator pattern for CQRS
- **Result Pattern** - Explicit operation outcomes

### Observability
- **Serilog** - Structured logging
- **OpenTelemetry** - Distributed tracing and metrics
- **Prometheus** - Metrics exposition
- **Seq** - Log aggregation (Docker)

### Additional Tools
- **Rate Limiting** - API request throttling
- **CORS** - Cross-origin resource sharing
- **Output Caching** - Response caching

---

## Architecture

ANNUAIRECONGO follows **Clean Architecture** principles with clear separation of concerns across multiple layers. Each layer has specific responsibilities and only depends on layers beneath it.

### Layer Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                     │
│                (ANNUAIRECONGO.Api - Web API)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Application Layer                          │
│              (ANNUAIRECONGO.Application)                    │
│      Business logic, commands, queries, validations          │
└────���────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Domain Layer                           │
│               (ANNUAIRECONGO.Domain)                        │
│         Entities, value objects, domain events              │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                      │
│            (ANNUAIRECONGO.Infrastructure)                    │
│     Database, external services, authentication            │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Contracts Layer                          │
│              (ANNUAIRECONGO.Contracts)                      │
│         DTOs, request/response models                       │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns Used

**Mediator Pattern (MediatR)**
- Decouples controllers from business logic
- Enables query/command separation (CQS)
- Facilitates pipeline behaviors (validation, logging)

**Result Pattern**
- Explicit success/failure return types
- Typed error information
- Avoids exceptions for flow control

**Domain Events**
- Event-driven notifications
- Decoupled side effects
- Enables audit trail and analytics

**Repository Pattern**
- Abstract data access
- Testable data layer
- Consistent query patterns

---

## Project Structure

```
ANNUAIRECONGO/
├── AnnuaireCongo.slnx
├── Readme.md
├── Requests/
├── tests/
└── src/
    ├── ANNUAIRECONGO.Api/                 # Presentation Layer
    │   ├── Controllers/                  # API endpoints
    │   ├── Infrastructure/               # Middleware, exception handling
    │   ├── Services/                    # Application services
    │   ├── OpenApi/                     # API documentation customizers
    │   ├── appsettings.json             # Configuration
    │   └── Program.cs                   # Application entry point
    │
    ├── ANNUAIRECONGO.Application/        # Application Layer
    │   ├── Common/                       # Interfaces, behaviors
    │   └── [Feature modules]            # Business features
    │
    ├── ANNUAIRECONGO.Domain/             # Domain Layer
    │   ├── Companies/                   # Company entity, events, enums
    │   ├── BusinessOwners/               # Business owner entity
    │   ├── Subscriptions/                # Subscription, plans, payments
    │   ├── Geography/                    # Region, city entities
    │   ├── Sectors/                     # Business sector entity
    │   ├── Identity/                    # User, role, refresh token
    │   ├── Notifications/                # Notification entity
    │   ├── Analytics/                    # Views, clicks, summaries
    │   ├── Common/                       # Base classes, constants, results
    │   └── [Shared kernel]
    │
    ├── ANNUAIRECONGO.Infrastructure/      # Infrastructure Layer
    │   ├── Persistence/                 # DbContext, repositories
    │   ├── Identity/                    # Identity services
    │   ├── Settings/                    # Configuration models
    │   └── [External integrations]
    │
    └── ANNUAIRECONGO.Contracts/           # Contracts Layer
        └── [DTOs and interfaces]
```

---

## Features

### 1. Company Management

- **Company Registration** - Submit company profiles for inclusion in directory
- **Company Profile Editing** - Update company information, contacts, services
- **Image Management** - Upload and manage company images
- **Document Management** - Upload supporting business documents
- **Company Status Workflow** - Submit, validate, reject, reactivate, suspend
- **Company Reporting** - Report inappropriate or incorrect listings

### 2. Business Owner Management

- **Owner Registration** - Register as a business owner
- **Company Association** - Link owners to their businesses
- **Verification System** - Verify business ownership claims

### 3. Geographic Organization

- **Region Management** - Define geographic regions (e.g., Brazzaville, Pointe-Noire)
- **City Management** - Define cities within regions
- **Location-based Search** - Find businesses by location

### 4. Sector Classification

- **Sector Management** - Define business sectors (e.g., Technology, Agriculture)
- **Multi-sector Assignment** - Associate companies with multiple sectors
- **Sector-based Filtering** - Filter directory by industry

### 5. Subscription System

- **Subscription Plans** - Multiple tiers with different feature sets
- **Payment Processing** - Track payment status (pending, succeeded, refunded)
- **Plan Management** - Create and configure subscription plans
- **Subscription Lifecycle** - Activate, expire, cancel subscriptions

### 6. User Identity & Authentication

- **User Registration** - Create user accounts
- **JWT Authentication** - Token-based login
- **Refresh Tokens** - Extended session management
- **Role-based Authorization** - Admin, Business Owner, Viewer roles

### 7. Analytics & Reporting

- **Profile Views** - Track company profile views
- **Contact Clicks** - Track contact information clicks
- **Daily Summaries** - Aggregated daily analytics

### 8. Notifications

- **Notification System** - Send notifications to users
- **Notification Types** - Configurable notification categories
- **Notification Preferences** - User opt-in/out settings

### 9. API Platform Features

- **Rate Limiting** - Protect API from abuse (100 requests/minute)
- **CORS Support** - Enable cross-origin frontend integration
- **Output Caching** - Cache frequently accessed responses
- **API Versioning** - URL-based version selection
- **OpenAPI Documentation** - Interactive API explorer

---

## Domain Model

### Core Entities

**Company**
- Business information, status, contact details
- Services offered, operating hours
- Associated images and documents
- Geographic location and sector classification
- Status: Submitted, Validated, Rejected, Suspended, Reactivated

**Business Owner**
- Personal information
- Associated companies
- Ownership verification status

**Geographic**
- Region (e.g., Pool, Kouilou, Lékoumou)
- City (e.g., Brazzaville, Pointe-Noire, Nkayi)
- Hierarchical relationship with regions

**Sector**
- Industry classification
- Many-to-many relationship with companies

**Subscription**
- Plan association
- Payment tracking
- Status: Active, Expired, Cancelled

**Plan**
- Feature configurations
- Pricing and duration

**Analytics**
- ProfileView - Tracks when users view company profiles
- ContactClick - Tracks when users click contact information
- DailySummary - Aggregated daily statistics

**Identity**
- User accounts with role-based permissions
- Refresh tokens for session management

---

## API Endpoints

### Companies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/companies | List companies with filtering |
| GET | /api/v1/companies/{id} | Get company details |
| POST | /api/v1/companies | Submit new company |
| PUT | /api/v1/companies/{id} | Update company |
| DELETE | /api/v1/companies/{id} | Remove company |

### Business Owners
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/business-owners | List business owners |
| GET | /api/v1/business-owners/{id} | Get owner details |
| POST | /api/v1/business-owners | Register owner |

### Geography
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/geography/regions | List regions |
| GET | /api/v1/geography/cities | List cities |

### Sectors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/sectors | List business sectors |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/subscriptions | User subscriptions |
| POST | /api/v1/subscriptions | Create subscription |

### Plans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/plans | Available subscription plans |

### Identity
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/identity/register | Register user |
| POST | /api/v1/identity/login | User login |
| POST | /api/v1/identity/refresh | Refresh token |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/notifications | User notifications |

### Statistics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/stats | Platform statistics |

---

## Getting Started

### Prerequisites

- .NET 10.0 SDK
- SQL Server (local or Docker)
- (Optional) Seq for log aggregation

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ANNUAIRECONGO
```

2. Restore dependencies:
```bash
dotnet restore
```

3. Update database connection string in `appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER; Database=AnnuaireCongoDb; Trusted_Connection=True; MultipleActiveResultSets=true; TrustServerCertificate=True;"
}
```

4. Apply migrations:
```bash
dotnet ef database update --project src/ANNUAIRECONGO.Infrastructure
```

5. Run the application:
```bash
dotnet run --project src/ANNUAIRECONGO.Api
```

### Running with Docker (Optional)

Using the included docker-compose configuration:

```bash
docker compose up -d
```

### Accessing the API

- **Base URL**: `http://localhost:5000`
- **Swagger UI**: `http://localhost:5000/scalar/v1`
- **Prometheus Metrics**: `http://localhost:5000/metrics`

---

## Configuration

### Application Settings (appsettings.json)

```json
{
  "AppSettings": {
    "LocalCacheExpirationInMins": 5,
    "DistributedCacheExpirationMins": 5,
    "DefaultPageNumber": 1,
    "DefaultPageSize": 10,
    "CorsPolicyName": "AnnuaireCongo",
    "AllowedOrigins": ["https://localhost:5001", "http://AnnuaireCongo-app"]
  },
  "JwtSettings": {
    "Secret": "your-secret-key",
    "TokenExpirationInMinutes": 60,
    "Issuer": "localhost",
    "Audience": "localhost"
  }
}
```

### Environment Variables

For production deployment, override settings using environment variables:

```
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Server=db;Database=AnnuaireCongoDb;...
```

---

## License

This project is proprietary software created as part of an academic project (PFE - Projet de Fin d'Etudes).

---

## Project Information

- **Framework**: .NET 10.0
- **Database**: SQL Server via Entity Framework Core
- **Pattern**: Clean Architecture with MediatR
- **Target**: Professional business directory for Republic of Congo
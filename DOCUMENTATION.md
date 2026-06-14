# ANNUAIRE CONGO — Documentation Complète

> **Projet de Fin d'Études (PFE)**  
> Plateforme d'annuaire professionnel pour la République du Congo  
> Technologies : .NET 10 · Angular 19 · SQL Server  

---

## Table des matières

### Documentation Technique

1. [Vue d'ensemble de l'architecture](#1-vue-densemble-de-larchitecture)
2. [Technologies utilisées](#2-technologies-utilisées)
3. [Prérequis techniques](#3-prérequis-techniques)
4. [Installation et configuration](#4-installation-et-configuration)
5. [Variables d'environnement et configuration](#5-variables-denvironnement-et-configuration)
6. [Structure du projet](#6-structure-du-projet)
7. [Base de données et migrations](#7-base-de-données-et-migrations)
8. [API REST — Référence des endpoints](#8-api-rest--référence-des-endpoints)
9. [Système de cache](#9-système-de-cache)
10. [Système de fichiers et stockage](#10-système-de-fichiers-et-stockage)
11. [Observabilité et journalisation](#11-observabilité-et-journalisation)
12. [Exécution en environnement local](#12-exécution-en-environnement-local)

### Documentation Fonctionnelle

13. [Objectifs de la plateforme](#13-objectifs-de-la-plateforme)
14. [Rôles et profils utilisateurs](#14-rôles-et-profils-utilisateurs)
15. [Fonctionnalités disponibles](#15-fonctionnalités-disponibles)
16. [Parcours utilisateurs](#16-parcours-utilisateurs)
17. [Cycle de vie d'une fiche entreprise](#17-cycle-de-vie-dune-fiche-entreprise)
18. [Système d'abonnements et de plans](#18-système-dabonnements-et-de-plans)
19. [Procédures d'utilisation](#19-procédures-dutilisation)

---

# DOCUMENTATION TECHNIQUE

---

## 1. Vue d'ensemble de l'architecture

### 1.1 Principes architecturaux

ANNUAIRE CONGO repose sur une **Clean Architecture** stricte côté backend, associée à une application frontend **Angular** en architecture par fonctionnalités. L'ensemble applique les principes SOLID, garantissant la séparation des responsabilités et la testabilité à chaque couche.

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
│         CQRS · MediatR 12 · FluentValidation · Handlers      │
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
│                       BASE DE DONNÉES                        │
│               SQL Server · EF Core 9 Code First              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Pattern CQRS avec MediatR

Toutes les opérations applicatives sont exprimées en **Commandes** (mutations d'état) et **Requêtes** (lectures). MediatR dispatch ces objets vers leurs handlers correspondants. Des **Pipeline Behaviors** transversaux sont insérés automatiquement :

- **ValidationBehavior** — exécute FluentValidation avant chaque handler
- **LoggingBehavior** — journalise l'entrée et la sortie de chaque opération
- **CachingBehavior** — met en cache les résultats des requêtes implémentant `ICachedQuery<T>`

### 1.3 Règle Admin 0

Les handlers de contenu appliquent une règle transversale : si l'utilisateur courant possède le rôle `Admin`, la vérification de propriété (`IsOwnedBy`) est contournée. Cela est nécessaire car les fiches créées par un administrateur ont pour `OwnerId` un GUID `BusinessOwner` qui ne correspond jamais à l'identifiant Identity d'un administrateur.

```csharp
var isAdmin = _currentUser.IsInRole("Admin");
if (!isAdmin)
{
    if (!company.IsOwnedBy(_currentUser.Id))
        return CompanyErrors.NotOwner;
}
```

---

## 2. Technologies utilisées

### 2.1 Backend (.NET 10)

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework | ASP.NET Core | .NET 10 |
| ORM | Entity Framework Core | 9.x |
| Messagerie interne | MediatR | 12.x |
| Validation | FluentValidation | Latest |
| Authentification | ASP.NET Core Identity + JWT Bearer | Latest |
| Cache | Microsoft.Extensions.Caching.Hybrid | Latest |
| Génération PDF | QuestPDF | Latest |
| Journalisation | Serilog + Serilog.Sinks.Seq | Latest |
| Observabilité | OpenTelemetry + Prometheus | Latest |
| Documentation API | Scalar / Swashbuckle | Latest |
| Versionnage API | Asp.Versioning | Latest |
| Traitement images | SixLabors.ImageSharp | Latest |
| IA générative | Grok API (xAI) — llama-3.3-70b-versatile | Latest |

### 2.2 Frontend (Angular 19)

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework | Angular | 19.2.x |
| Langage | TypeScript | 5.7.x |
| Styles | TailwindCSS | 3.4.x |
| Réactivité | RxJS | 7.8.x |
| État UI | Angular Signals | Natif |
| Cartographie | Leaflet | 1.9.4 |
| Schéma de styles | SCSS | — |

### 2.3 Base de données et infrastructure

| Composant | Technologie |
|-----------|-------------|
| Base de données | SQL Server (LocalDB en dev) |
| Migrations | EF Core Code First |
| Stockage fichiers | Système de fichiers local (`wwwroot/uploads/`) |
| Logs centralisés | Seq (http://ops.seq:5341) |
| Métriques | Prometheus (endpoint `/metrics`) |

---

## 3. Prérequis techniques

Avant de démarrer le projet, les outils suivants doivent être installés sur la machine de développement :

### 3.1 Backend

- **.NET SDK 10.0** ou supérieur — [https://dotnet.microsoft.com/download](https://dotnet.microsoft.com/download)
- **SQL Server** (version 2019 ou supérieure) ou SQL Server Express / LocalDB
- **SQL Server Management Studio** (optionnel, pour inspection de la base)
- **EF Core CLI** : `dotnet tool install --global dotnet-ef`

### 3.2 Frontend

- **Node.js 20 LTS** ou supérieur — [https://nodejs.org](https://nodejs.org)
- **npm 10+** (inclus avec Node.js)
- **Angular CLI** : `npm install -g @angular/cli`

### 3.3 Infrastructure (optionnel en développement)

- **Docker** (pour Seq et autres services) : `docker run -d -p 5341:80 datalust/seq`
- **Seq** — agrégateur de logs structurés

---

## 4. Installation et configuration

### 4.1 Cloner le dépôt

```bash
git clone <url-du-depot>
cd ANNUAIRECONGO
```

### 4.2 Configuration de la base de données

Créer ou vérifier la chaîne de connexion dans `src/ANNUAIRECONGO.Api/appsettings.json` :

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=.;Database=AnnuaireCongoDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;"
}
```

Appliquer les migrations et seeder les données initiales :

```bash
cd src/ANNUAIRECONGO.Api
dotnet ef database update
```

L'initialisation de la base est effectuée automatiquement au démarrage via `InitialiseDatabaseAsync()`, ce qui crée :
- 3 utilisateurs Admin
- 11 utilisateurs EntrepriseOwner
- 3 plans d'abonnement (Free, Pro, Premium)
- 15 entreprises de démonstration (entreprises congolaises réelles)

### 4.3 Démarrer le backend

```bash
cd src/ANNUAIRECONGO.Api
dotnet run
```

L'API sera disponible sur `https://localhost:7139`. La documentation interactive Scalar est accessible à `https://localhost:7139/scalar`.

### 4.4 Installer les dépendances frontend

```bash
cd src/ANNUAIRECONGO.Client
npm install
```

### 4.5 Démarrer le frontend

```bash
ng serve
# ou
npm start
```

L'application Angular sera disponible sur `http://localhost:4200`.

### 4.6 Démarrer Seq (optionnel)

```bash
docker run -d --name seq -e ACCEPT_EULA=Y -p 5341:80 datalust/seq
```

Le tableau de bord Seq est accessible sur `http://localhost:5341`.

---

## 5. Variables d'environnement et configuration

L'ensemble de la configuration se trouve dans `src/ANNUAIRECONGO.Api/appsettings.json`. En production, ces valeurs doivent être surchargées via `appsettings.Production.json` ou des variables d'environnement système.

### 5.1 Connexion base de données

```json
"ConnectionStrings": {
  "DefaultConnection": "<chaîne de connexion SQL Server>"
}
```

### 5.2 Paramètres de l'application

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

### 5.3 Authentification JWT

```json
"JwtSettings": {
  "Secret": "<clé secrète HMAC-256 — min. 64 caractères>",
  "TokenExpirationInMinutes": 60,
  "Issuer": "localhost",
  "Audience": "localhost"
}
```

Le token d'accès expire après **60 minutes**. Un token de rafraîchissement (refresh token) permet d'obtenir un nouveau token sans ressaisie des identifiants.

### 5.4 Stockage de fichiers

```json
"StorageSettings": {
  "BaseUrl": "https://localhost:7139",
  "MaxFileSizeBytes": 10485760
}
```

Les fichiers sont stockés dans `wwwroot/uploads/{dossier}/{guid}{extension}` et servis en tant que fichiers statiques. Les dossiers autorisés sont : `logos`, `covers`, `documents`, `services`, `images`, `invoices`.

Extensions acceptées par type :
- **Images** : `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`
- **Documents** : `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.png`, `.jpg`, `.jpeg`

### 5.5 Intelligence artificielle (Grok)

```json
"GrokSettings": {
  "Model": "llama-3.3-70b-versatile"
}
```

La clé API Grok doit être configurée séparément dans les secrets de l'application (`dotnet user-secrets` ou variable d'environnement `GrokSettings__ApiKey`).

### 5.6 Journalisation (Serilog)

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

## 6. Structure du projet

### 6.1 Solution Backend (5 projets)

```
ANNUAIRECONGO/
├── src/
│   ├── ANNUAIRECONGO.Api/                    # Couche présentation
│   │   ├── Controllers/                      # Contrôleurs REST
│   │   ├── Middlewares/                      # Middlewares personnalisés
│   │   ├── Extensions/                       # Extensions de services
│   │   ├── Program.cs                        # Point d'entrée
│   │   └── appsettings.json                  # Configuration
│   │
│   ├── ANNUAIRECONGO.Application/            # Couche application (CQRS)
│   │   ├── Common/
│   │   │   ├── Behaviors/                    # Pipeline MediatR
│   │   │   ├── Interfaces/                   # Abstractions (IAppDbContext, IUser…)
│   │   │   └── Models/                       # Modèles partagés
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
│   ├── ANNUAIRECONGO.Contracts/              # DTOs partagés (entrée/sortie)
│   │
│   ├── ANNUAIRECONGO.Domain/                 # Couche domaine (entités pures)
│   │   ├── Analytics/
│   │   ├── BusinessOwners/
│   │   ├── Companies/
│   │   │   ├── Company.cs                    # Agrégat principal
│   │   │   ├── Enums/CompanyStatus.cs        # Draft, Pending, Active, Rejected, Suspended
│   │   │   └── Events/                       # Événements de domaine
│   │   ├── Geography/                        # Region, City
│   │   ├── Identity/                         # Role (Admin, EntrepriseOwner, RegularUser)
│   │   ├── Logs/
│   │   ├── Notifications/
│   │   ├── Sectors/
│   │   ├── Subscriptions/
│   │   │   ├── Plans/                        # Plan, PlanName (Free/Pro/Premium)
│   │   │   └── Payments/                     # Payment, événements
│   │   ├── UserProfiles/
│   │   └── UserSubscriptions/
│   │
│   └── ANNUAIRECONGO.Infrastructure/         # Couche infrastructure
│       ├── Data/
│       │   ├── AppDbContext.cs               # 30 DbSets
│       │   ├── Configurations/               # Fluent API par entité
│       │   ├── Migrations/                   # 11 migrations EF Core
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

### 6.2 Application Frontend (Angular 19)

```
src/ANNUAIRECONGO.Client/src/app/
├── core/
│   ├── guards/                               # AuthGuard, RoleGuard
│   ├── interceptors/                         # auth.interceptor.ts (JWT auto-attach)
│   ├── services/                             # ApiService, AuthService, CompanyService…
│   └── models/                              # Interfaces TypeScript (Company, User…)
│
├── features/
│   ├── admin/                                # Espace administrateur
│   │   ├── abonnements/                      # Gestion des abonnements
│   │   ├── audit/                            # Journaux d'audit
│   │   ├── dashboard/                        # Tableau de bord admin
│   │   ├── dirigeants/                       # Gestion des BusinessOwners
│   │   ├── entreprises/                      # Liste + détail + édition des fiches
│   │   ├── forfaits/                         # Gestion des plans
│   │   ├── geographie/                       # Régions et villes
│   │   ├── logs/                             # Journaux système
│   │   ├── notifications/                    # Centre de notifications admin
│   │   ├── parametres/                       # Paramètres de la plateforme
│   │   ├── secteurs/                         # Gestion des secteurs d'activité
│   │   ├── signalements/                     # Modération des signalements
│   │   ├── statistiques/                     # Analytiques globaux
│   │   ├── utilisateurs/                     # Gestion des comptes
│   │   └── validation/                       # File de validation des fiches
│   │
│   ├── auth/                                 # Authentification
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   └── verify-email/
│   │
│   ├── espace/                               # Espace propriétaire d'entreprise
│   │   ├── abonnement/                       # Souscription et gestion de l'abonnement
│   │   ├── compte/                           # Profil du compte
│   │   ├── console/                          # Tableau de bord entreprise
│   │   ├── fiche/                            # Édition de la fiche entreprise
│   │   ├── notifications/                    # Notifications de l'entreprise
│   │   └── statistiques/                     # Statistiques de la fiche
│   │
│   └── public/                               # Pages publiques (non authentifiées)
│       ├── accueil/                          # Page d'accueil
│       ├── annuaire/                         # Recherche et liste des entreprises
│       ├── cartographie/                     # Carte interactive (Leaflet)
│       ├── contact/                          # Formulaire de contact
│       ├── extras/                           # Pages supplémentaires
│       ├── legal/                            # Mentions légales, CGU
│       ├── not-found/                        # Page 404
│       ├── registre/                         # Registre des entreprises
│       ├── secteurs/                         # Navigation par secteur
│       ├── support/                          # Aide et FAQ
│       └── tarifs/                           # Page des offres/plans
│
├── layout/
│   ├── admin/                                # Shell de l'espace admin
│   ├── auth/                                 # Shell des pages d'authentification
│   ├── espace/                               # Shell de l'espace propriétaire
│   └── public/                               # Shell des pages publiques (navbar + footer)
│
└── shared/
    ├── ui/                                   # Composants réutilisables
    ├── services/                             # Services partagés
    └── pipes/                               # Pipes Angular custom
```

---

## 7. Base de données et migrations

### 7.1 DbContext et entités

Le `AppDbContext` expose **30 DbSets** correspondant aux entités du domaine :

| DbSet | Description |
|-------|-------------|
| `Companies` | Fiches entreprises (agrégat central) |
| `BusinessOwners` | Profils des propriétaires d'entreprise |
| `Contacts` | Coordonnées (téléphone, email, réseaux…) |
| `Images` | Galerie d'images de la fiche |
| `Documents` | Documents officiels attachés |
| `Services` | Services proposés par l'entreprise |
| `Sectors` | Secteurs d'activité |
| `Regions` | Régions géographiques du Congo |
| `Cities` | Villes par région |
| `Subscriptions` | Abonnements des entreprises |
| `Payments` | Paiements liés aux abonnements |
| `Plans` | Plans tarifaires (Free, Pro, Premium) |
| `UserProfiles` | Profils des utilisateurs réguliers |
| `UserSubscriptions` | Abonnements des utilisateurs particuliers |
| `Notifications` | Notifications système |
| `RefreshTokens` | Tokens de rafraîchissement JWT |
| `Analytics` | Données analytiques brutes |
| `Reports` | Signalements d'entreprises |

Un **`AuditableEntityInterceptor`** ajoute automatiquement `CreatedAt`, `UpdatedAt` et `CreatedBy` à toutes les entités auditables.

### 7.2 Historique des migrations

| # | Nom | Date |
|---|-----|------|
| 01 | InitialCreate | Mars 2026 |
| 02 | AddRefreshTokens | Mars 2026 |
| 03 | AddUserProfile | Avril 2026 |
| 04 | AddSubscriptions | Avril 2026 |
| 05 | AddPayments | Avril 2026 |
| 06 | AddNotifications | Avril 2026 |
| 07 | AddAnalytics | Mai 2026 |
| 08 | AddReports | Mai 2026 |
| 09 | AddSectors | Mai 2026 |
| 10 | AddUserSubscription | Juin 2026 |
| 11 | AddUserProfileAndUserSubscription | Juin 2026 |

---

## 8. API REST — Référence des endpoints

L'API est versionnée (`v1`) et préfixée par `/api/v1/`. La documentation interactive est disponible via Scalar à `https://localhost:7139/scalar`.

### 8.1 Authentification (`/api/v1/auth`)

| Méthode | Endpoint | Rôle requis | Description |
|---------|----------|-------------|-------------|
| POST | `/register` | — | Inscription d'un nouvel utilisateur |
| POST | `/login` | — | Connexion et obtention du JWT |
| POST | `/refresh-token` | — | Renouvellement du token d'accès |
| POST | `/forgot-password` | — | Demande de réinitialisation du mot de passe |
| POST | `/reset-password` | — | Réinitialisation du mot de passe |
| POST | `/verify-email` | — | Vérification de l'adresse e-mail |
| GET | `/me` | Authentifié | Informations sur l'utilisateur courant |
| POST | `/logout` | Authentifié | Déconnexion et invalidation du refresh token |

### 8.2 Entreprises (`/api/v1/companies`)

| Méthode | Endpoint | Rôle requis | Description |
|---------|----------|-------------|-------------|
| GET | `/` | — | Liste paginée avec filtres |
| GET | `/{id}` | — | Détail par ID |
| GET | `/{slug}` | — | Détail par slug |
| POST | `/` | Admin, EntrepriseOwner | Créer une fiche |
| PUT | `/{id}/update-company-profile` | Admin, EntrepriseOwner | Modifier le profil |
| PUT | `/{id}/update-media` | Admin, EntrepriseOwner | Modifier logo/bannière |
| POST | `/{id}/submit-company` | Admin, EntrepriseOwner | Soumettre pour validation |
| POST | `/{id}/validate-company` | Admin | Valider la fiche |
| POST | `/{id}/reject-company` | Admin | Rejeter avec motif |
| POST | `/{id}/suspend-company` | Admin | Suspendre la fiche |
| POST | `/{id}/reactivate-company` | Admin, EntrepriseOwner | Réactiver la fiche |
| PATCH | `/{id}/verify-company` | Admin | Marquer comme vérifiée |
| POST | `/{id}/add-contact` | Admin, EntrepriseOwner | Ajouter un contact |
| DELETE | `/{id}/contacts/{contactId}` | Admin, EntrepriseOwner | Supprimer un contact |
| PUT | `/{id}/update-contact` | Admin, EntrepriseOwner | Modifier un contact |
| POST | `/{id}/add-service` | Admin, EntrepriseOwner | Ajouter un service |
| DELETE | `/{id}/services/{serviceId}` | Admin, EntrepriseOwner | Supprimer un service |
| POST | `/{id}/add-image` | Admin, EntrepriseOwner | Ajouter une image |
| DELETE | `/{id}/images/{imageId}` | Admin, EntrepriseOwner | Supprimer une image |
| POST | `/{id}/add-document` | Admin, EntrepriseOwner | Ajouter un document |
| DELETE | `/{id}/documents/{documentId}` | Admin, EntrepriseOwner | Supprimer un document |
| POST | `/{id}/add-report` | Authentifié | Signaler une fiche |
| GET | `/reports` | Admin | Liste des signalements |
| POST | `/reports/{reportId}/process` | Admin | Traiter un signalement |
| POST | `/{id}/generate-description` | Admin, EntrepriseOwner | Générer une description via IA |
| GET | `/{id}/recommendations` | — | Entreprises similaires recommandées |
| POST | `/{id}/contact-click` | — | Enregistrer un clic sur un contact |

### 8.3 Abonnements (`/api/v1/subscriptions`)

| Méthode | Endpoint | Rôle requis | Description |
|---------|----------|-------------|-------------|
| GET | `/company/{id}` | Admin, EntrepriseOwner | Abonnements d'une entreprise |
| POST | `/subscribe` | Admin, EntrepriseOwner | Souscrire à un plan |
| DELETE | `/{id}/cancel` | Admin, EntrepriseOwner | Résilier un abonnement |

### 8.4 Plans (`/api/v1/plans`)

| Méthode | Endpoint | Rôle requis | Description |
|---------|----------|-------------|-------------|
| GET | `/` | — | Liste des plans disponibles |
| GET | `/{id}` | — | Détail d'un plan |
| POST | `/` | Admin | Créer un plan |
| PUT | `/{id}` | Admin | Modifier un plan |

### 8.5 Secteurs, Géographie, Statistiques, Notifications

Des endpoints dédiés existent pour : `/api/v1/sectors`, `/api/v1/regions`, `/api/v1/cities`, `/api/v1/stats`, `/api/v1/notifications`, `/api/v1/users`, `/api/v1/business-owners`.

---

## 9. Système de cache

La plateforme utilise **HybridCache** (Microsoft.Extensions.Caching.Hybrid), combinant deux niveaux :

| Niveau | Type | Durée |
|--------|------|-------|
| L1 | Cache mémoire local (in-process) | 30 secondes |
| L2 | Cache distribué (IDistributedCache) | 10 minutes |

Les requêtes en lecture intensive (détail d'entreprise, liste des secteurs, etc.) implémentent `ICachedQuery<T>`. Les données sensibles ou fréquemment mutées (abonnements, paiements) n'utilisent pas le cache.

> **Note importante** : `ICachedQuery<Result<T>>` ne peut pas être utilisé lorsque `T` est un type union discriminé (`Result<T>`) car `System.Text.Json` ne peut pas le sérialiser. Dans ce cas, la requête implémente directement `IRequest<Result<T>>`.

---

## 10. Système de fichiers et stockage

Les fichiers uploadés sont stockés localement dans `wwwroot/uploads/` et servis en tant que fichiers statiques par ASP.NET Core. La structure des dossiers est la suivante :

```
wwwroot/
└── uploads/
    ├── logos/        # Logos des entreprises
    ├── covers/       # Bannières/photos de couverture
    ├── images/       # Galerie d'images de la fiche
    ├── documents/    # Documents officiels
    ├── services/     # Images liées aux services
    └── invoices/     # Factures PDF générées par QuestPDF
```

Chaque fichier est renommé avec un GUID pour éviter les collisions et les accès non autorisés par devinette de nom. La taille maximale par fichier est de **10 MB**.

L'interface `IStorageService` isole l'implémentation, permettant une migration future vers un stockage cloud (Azure Blob Storage, AWS S3) sans modification des couches supérieures.

---

## 11. Observabilité et journalisation

### 11.1 Journalisation structurée (Serilog)

Tous les logs sont structurés (format JSON) et enrichis avec le contexte de la requête HTTP. Ils sont émis vers deux destinations :
- **Console** : pour le développement local
- **Seq** : pour la centralisation et la recherche (`http://ops.seq:5341`)

### 11.2 Télémétrie (OpenTelemetry)

L'API expose des métriques Prometheus à l'endpoint `/metrics`, compatibles avec Grafana ou tout collecteur Prometheus standard. OpenTelemetry est configuré pour tracer les requêtes HTTP et les opérations de base de données.

### 11.3 Logs d'audit administrateur

Les actions sensibles effectuées par les administrateurs (validation, rejet, suspension de fiches) sont enregistrées dans la table `AdminLogs` avec l'identité de l'opérateur, la date, et le détail de l'action.

---

## 12. Exécution en environnement local

### 12.1 Démarrage complet

```bash
# 1. Terminal 1 — Base de données (SQL Server doit être démarré)
# S'assurer que SQL Server écoute sur localhost

# 2. Terminal 2 — API Backend
cd src/ANNUAIRECONGO.Api
dotnet run

# 3. Terminal 3 — Frontend Angular
cd src/ANNUAIRECONGO.Client
ng serve

# 4. (Optionnel) Terminal 4 — Seq
docker run -d --name seq -e ACCEPT_EULA=Y -p 5341:80 datalust/seq
```

### 12.2 URLs en développement

| Service | URL |
|---------|-----|
| Frontend Angular | `http://localhost:4200` |
| API Backend | `https://localhost:7139` |
| Documentation Scalar | `https://localhost:7139/scalar` |
| Métriques Prometheus | `https://localhost:7139/metrics` |
| Seq (logs) | `http://localhost:5341` |

### 12.3 Comptes de démonstration

Lors du premier démarrage, la base est peuplée avec les comptes suivants :

| Rôle | E-mail | Mot de passe |
|------|--------|--------------|
| Admin | `admin@localhost` | `admin@localhost` |
| EntrepriseOwner | `suzan.businessOwner@localhost` | `suzan.businessOwner@localhost` |
| RegularUser | (via inscription) | — |

> Les comptes de test exacts peuvent varier selon le seeder. Vérifier `ApplicationDbContextInitialiser.cs` pour les valeurs à jour.

---

# DOCUMENTATION FONCTIONNELLE

---

## 13. Objectifs de la plateforme

**ANNUAIRE CONGO** est une plateforme web d'annuaire professionnel dédiée à la République du Congo. Elle répond à plusieurs objectifs :

**Pour les entreprises et professionnels congolais**, elle offre un espace de visibilité en ligne : création d'une fiche détaillée (présentation, contacts, services, galerie photos, documents), référencement dans les résultats de recherche, et accès à des statistiques de consultation.

**Pour les visiteurs et clients potentiels**, elle constitue un moteur de découverte des entreprises locales : recherche par nom, secteur d'activité, ville ou région ; navigation sur une carte interactive ; consultation des fiches détaillées.

**Pour les administrateurs de la plateforme**, elle fournit un back-office complet pour modérer les inscriptions, gérer les utilisateurs, contrôler les abonnements, et surveiller l'activité globale de la plateforme.

**Pour la visibilité économique**, l'annuaire contribue à la digitalisation du tissu économique congolais, en rendant les entreprises locales plus accessibles et découvrables, notamment pour les partenaires, investisseurs et clients.

---

## 14. Rôles et profils utilisateurs

La plateforme distingue quatre types d'utilisateurs, dont trois rôles authentifiés :

### 14.1 Visiteur (non authentifié)

Accès en lecture seule à toutes les pages publiques. Peut consulter les fiches d'entreprises actives, effectuer des recherches, naviguer sur la carte, consulter les secteurs et les tarifs. Ne peut pas créer de compte entreprise ni accéder à un espace personnel.

### 14.2 RegularUser — Utilisateur régulier

Utilisateur inscrit sans entreprise associée. Dispose d'un profil personnel. Peut signaler une fiche entreprise inappropriée. Peut souscrire à des plans individuels (UserSubscriptions). Ne peut pas créer ni gérer de fiche entreprise.

### 14.3 EntrepriseOwner — Propriétaire d'entreprise

Utilisateur inscrit et associé à une ou plusieurs fiches entreprises via un profil `BusinessOwner`. Accède à l'**Espace Entreprise** (`/espace`) qui comprend :

- La console de tableau de bord avec les statistiques de la fiche
- L'éditeur complet de la fiche (informations, contacts, services, galerie, documents)
- La gestion de l'abonnement et le suivi des paiements
- Le centre de notifications
- Le profil du compte

### 14.4 Admin — Administrateur de la plateforme

Accès complet à toutes les fonctionnalités via l'**Espace Administrateur** (`/admin`). L'administrateur peut :

- Consulter et éditer toutes les fiches entreprises (Règle Admin 0)
- Valider, rejeter, suspendre ou réactiver des fiches
- Gérer les utilisateurs (comptes, rôles, statuts)
- Gérer les secteurs d'activité, régions et villes
- Gérer les plans d'abonnement et les forfaits
- Consulter les journaux système, d'audit, et d'analytiques globaux
- Traiter les signalements d'entreprises
- Configurer les paramètres de la plateforme

> L'administrateur **n'a pas d'espace entreprise** (`/espace`). Toute redirection post-action le ramène vers `/admin`.

---

## 15. Fonctionnalités disponibles

### 15.1 Annuaire public

- **Recherche avancée** : par mot-clé (nom d'entreprise), secteur d'activité, ville, région
- **Recherche intelligente** (smart search) : recherche sémantique assistée
- **Pagination** : résultats paginés avec choix de la taille de page
- **Tri** : par nom, date de création, pertinence
- **Fiche publique** : photo de couverture, logo, description, contacts, services, galerie d'images, documents téléchargeables, position sur la carte
- **Recommandations** : entreprises similaires suggérées en bas de fiche

### 15.2 Cartographie interactive

- Carte Leaflet affichant la localisation géographique des entreprises actives
- Filtrage des entreprises par zone géographique depuis la carte
- Marqueurs cliquables renvoyant vers la fiche de l'entreprise

### 15.3 Espace Entreprise (`/espace`)

**Console (tableau de bord)** : vues statistiques (nombre de visites, clics sur les contacts, favoris) sur la période choisie.

**Fiche entreprise** : éditeur complet permettant de modifier :
- Informations générales (nom, description, secteur, localisation, RCCM, NINEA)
- Logo et photo de couverture
- Coordonnées de contact (téléphone, e-mail, site web, réseaux sociaux)
- Services proposés (avec descriptions et images)
- Galerie d'images
- Documents officiels (PDF, images)

**Abonnements** : souscription à un plan, historique des paiements, téléchargement des factures PDF.

**Notifications** : centre de notifications en temps réel pour les événements liés à la fiche (validation, rejet, messages…).

**Statistiques** : analytics détaillés de la fiche (évolution des visites, sources de trafic, actions des visiteurs).

### 15.4 Génération de description par IA

Depuis l'éditeur de fiche, le propriétaire ou l'administrateur peut demander à l'IA (Grok, modèle `llama-3.3-70b-versatile`) de générer automatiquement une description professionnelle de l'entreprise, en se basant sur le nom, le secteur, la ville et les services renseignés.

### 15.5 Système de signalement

Tout utilisateur authentifié peut signaler une fiche entreprise pour contenu inapproprié, informations incorrectes ou fraude. Les signalements sont centralisés dans l'espace admin pour traitement.

### 15.6 Espace Administrateur (`/admin`)

- **Dashboard** : KPIs globaux (nombre d'entreprises, utilisateurs actifs, abonnements, revenus)
- **Validation** : file d'attente des fiches en statut `Pending` à valider ou rejeter
- **Entreprises** : liste complète avec filtres, accès au détail, édition directe de la fiche, actions de statut
- **Utilisateurs** : liste, détail, modification du rôle, désactivation de comptes
- **Dirigeants** : gestion des profils BusinessOwner
- **Secteurs** : création, modification, suppression des secteurs d'activité
- **Géographie** : gestion des régions et villes
- **Forfaits** : gestion des plans tarifaires
- **Abonnements** : suivi de tous les abonnements actifs et expirés
- **Signalements** : traitement des signalements reçus
- **Statistiques** : analytiques globaux de la plateforme
- **Audit** : journaux des actions administratives
- **Logs** : journaux système (erreurs, avertissements)
- **Paramètres** : configuration globale de la plateforme

---

## 16. Parcours utilisateurs

### 16.1 Parcours Visiteur → Découverte d'une entreprise

```
Page d'accueil
    └── Barre de recherche (ou navigation par secteur)
            └── Liste des résultats (annuaire)
                    └── Fiche publique de l'entreprise
                            ├── Consultation des contacts
                            ├── Consultation de la galerie
                            ├── Consultation des documents
                            └── Carte de localisation
```

### 16.2 Parcours EntrepriseOwner → Création et publication d'une fiche

```
Inscription (rôle EntrepriseOwner)
    └── Vérification de l'e-mail
            └── Connexion
                    └── Espace Entreprise (/espace)
                            └── Création de la fiche (Draft)
                                    └── Remplissage du profil
                                            └── Ajout des contacts, services, images
                                                    └── Soumission pour validation (→ Pending)
                                                            └── Validation par l'Admin (→ Active)
                                                                    └── Fiche visible publiquement
```

### 16.3 Parcours Admin → Validation d'une fiche

```
Connexion (rôle Admin)
    └── Espace Admin (/admin)
            └── Validation → File de fiches Pending
                    └── Consultation du détail de la fiche
                            ├── [Valider] → Fiche passe à Active (visible)
                            └── [Rejeter + motif] → Fiche passe à Rejected (propriétaire notifié)
```

### 16.4 Parcours Admin → Édition d'une fiche

```
Admin → Liste des entreprises
    └── Détail d'une entreprise
            └── Bouton "Éditer la fiche"
                    └── Éditeur complet de la fiche (/admin/entreprises/:id/editer)
                            └── Modification et sauvegarde
                                    └── Retour au détail de l'entreprise (/admin/entreprises/:id)
```

### 16.5 Parcours EntrepriseOwner → Souscription à un plan

```
Espace Entreprise → Abonnement
    └── Choix du plan (Free / Pro / Premium)
            └── Confirmation et paiement
                    └── Génération de la facture PDF
                            └── Activation du plan (nouvelles limites débloquées)
```

---

## 17. Cycle de vie d'une fiche entreprise

Une fiche entreprise suit un cycle de vie strict, contrôlé par des méthodes de domaine sur l'agrégat `Company` :

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                                                         │
              Création                                                        │
                 │                                                            │
                 ▼                                                            │
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

| Statut | Valeur enum | Visible publiquement | Modifiable par owner |
|--------|-------------|---------------------|---------------------|
| Draft | 0 | Non | Oui |
| Pending | 1 | Non | Non |
| Active | 2 | **Oui** | Oui |
| Rejected | 3 | Non | Oui (peut re-soumettre) |
| Suspended | 4 | Non | Non |

---

## 18. Système d'abonnements et de plans

La plateforme propose trois plans tarifaires avec des limites différentes sur le contenu de la fiche :

| Plan | Prix | Durée | Images max | Documents max | Fonctionnalités |
|------|------|-------|------------|---------------|-----------------|
| **Free** | 0 XAF | 365 jours | 3 | 1 | Fiche de base |
| **Pro** | 25 000 XAF | 30 jours | 10 | 5 | Fiche enrichie, statistiques avancées |
| **Premium** | 75 000 XAF | 30 jours | 50 | 20 | Fiche complète, mise en avant, toutes fonctionnalités |

Le plan `Free` est attribué automatiquement à la création de toute nouvelle fiche. L'upgrade vers Pro ou Premium déverrouille des limites supérieures et des fonctionnalités additionnelles.

Chaque paiement génère une **facture PDF** (via QuestPDF) téléchargeable depuis l'espace abonnement.

---

## 19. Procédures d'utilisation

### 19.1 Créer un compte entreprise

1. Accéder à la page d'inscription (`/auth/register`)
2. Remplir le formulaire avec le rôle `EntrepriseOwner`
3. Vérifier l'adresse e-mail via le lien reçu
4. Se connecter (`/auth/login`)
5. Accéder à l'espace entreprise (`/espace`)
6. Compléter la fiche entreprise

### 19.2 Soumettre une fiche pour validation

1. Depuis l'espace entreprise, accéder à l'éditeur de fiche
2. S'assurer que les champs obligatoires sont remplis (nom, secteur, ville, description)
3. Cliquer sur **"Soumettre pour validation"**
4. La fiche passe en statut `Pending` — elle est désormais dans la file de validation de l'admin
5. Attendre la notification de validation ou de rejet

### 19.3 Valider une fiche (Admin)

1. Se connecter avec un compte Admin
2. Accéder à `Admin → Validation`
3. Consulter la fiche soumise
4. Cliquer sur **"Valider"** ou **"Rejeter"** (avec motif)
5. Le propriétaire reçoit une notification

### 19.4 Éditer une fiche en tant qu'administrateur

1. Accéder à `Admin → Entreprises`
2. Rechercher et cliquer sur l'entreprise à modifier
3. Cliquer sur **"Éditer la fiche"** (bouton en haut du détail)
4. Effectuer les modifications dans l'éditeur complet
5. Cliquer sur **"Enregistrer"** — l'administrateur est redirigé vers le détail de l'entreprise

### 19.5 Générer une description par IA

1. Depuis l'éditeur de fiche (espace entreprise ou admin)
2. S'assurer que le nom de l'entreprise, le secteur, la ville et au moins un service sont renseignés
3. Cliquer sur le bouton **"Générer avec l'IA"**
4. L'IA génère automatiquement une description professionnelle
5. Relire, modifier si nécessaire, puis sauvegarder

### 19.6 Souscrire à un plan payant

1. Depuis l'espace entreprise, accéder à **Abonnement**
2. Choisir le plan Pro ou Premium
3. Confirmer la souscription
4. Procéder au paiement via les moyens disponibles
5. L'abonnement est activé immédiatement
6. La facture PDF est disponible dans l'historique des paiements

### 19.7 Signaler une entreprise

1. Accéder à la fiche publique de l'entreprise à signaler
2. Cliquer sur le bouton **"Signaler"**
3. Sélectionner le motif du signalement et renseigner les détails
4. Confirmer l'envoi du signalement
5. L'équipe d'administration examine le signalement

### 19.8 Rechercher une entreprise

1. Depuis la page d'accueil ou l'annuaire (`/annuaire`)
2. Saisir un terme de recherche dans la barre de recherche
3. Optionnellement filtrer par secteur, ville ou région
4. Parcourir les résultats paginés
5. Cliquer sur une fiche pour accéder au détail complet

---

## Annexes

### A. Glossaire

| Terme | Définition |
|-------|------------|
| **Fiche entreprise** | Page de présentation d'une entreprise dans l'annuaire |
| **BusinessOwner** | Profil associé à un propriétaire d'entreprise (distinct du compte Identity) |
| **Draft** | Fiche créée mais non soumise, visible uniquement par son propriétaire |
| **Pending** | Fiche soumise en attente de validation par un administrateur |
| **Active** | Fiche validée et visible publiquement dans l'annuaire |
| **CQRS** | Command Query Responsibility Segregation — séparation des lectures et écritures |
| **JWT** | JSON Web Token — standard d'authentification par token |
| **HybridCache** | Combinaison de cache mémoire local et cache distribué |
| **Règle Admin 0** | Bypass de la vérification de propriété pour les administrateurs |
| **Slug** | Identifiant textuel lisible dans les URLs (ex: `societe-generale-congo`) |

### B. Codes d'erreur courants

| Code HTTP | Signification |
|-----------|---------------|
| 400 | Requête invalide — données manquantes ou incorrectes |
| 401 | Non authentifié — token absent ou expiré |
| 403 | Accès refusé — rôle insuffisant ou non propriétaire |
| 404 | Ressource introuvable |
| 409 | Conflit — ressource déjà existante |
| 500 | Erreur serveur interne |

### C. Conventions de code

**Backend (.NET)**
- Namespaces en PascalCase, correspondant à la structure des dossiers
- Commandes nommées `[Action][Entité]Command` (ex: `AddContactCommand`)
- Queries nommées `Get[Entité][Critère]Query` (ex: `GetCompanyByIdQuery`)
- Handlers toujours `sealed`, un par fichier
- Errors exposées via des méthodes statiques dans les classes `[Entité]Errors`

**Frontend (Angular)**
- Composants en `kebab-case` pour les noms de fichiers, `PascalCase` pour les classes
- Services injectés via `inject()` (API fonctionnelle Angular 19)
- État UI géré via `signal<>()` et `computed()`
- Tous les appels HTTP retournent des `Observable<T>` via `ApiService`
- Routes lazy-loaded via `loadComponent()`

---

*Documentation générée le 12 juin 2026 — ANNUAIRE CONGO v1.0*

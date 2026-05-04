# Annuaire Congo — Rebuild traceability

> Living document mapping every audit finding to the file(s) that fix it.
> Update this file when you touch anything that addresses an audit point.

## Stack

- **Angular 19** (standalone components, signals, lazy routes, `@angular/cdk`)
- **Tailwind CSS 3** via PostCSS (no CDN)
- **Design tokens** mirroring the maquette `tw-config.js`
- **Mock services** for the entire data layer (swap-in via DI when the backend lands)

## Ground rules baked in

| Rule | Enforced where |
|---|---|
| Single source of truth for FR copy | `src/app/core/i18n/fr.constants.ts` |
| 6 SFD sectors, locked | `fr.constants.ts` `sectors` + `MockAdminService.sectors` `isLocked: true` |
| Currency in XAF | `src/app/shared/pipes/xaf.pipe.ts` |
| FR locale registered | `src/app/app.config.ts` (`registerLocaleData(localeFr, 'fr')`) |
| One header / one footer per shell | `layout/{public, auth, espace, admin}` shells |
| Mobile drawer everywhere | `BreakpointService` + `<ac-public-header>`, admin/espace sidebars |
| `aria-current="page"` everywhere | `routerLinkActive` + `ariaCurrentWhenActive="page"` |

---

## Critical issues (audit C-series)

| # | Audit fix | Implementation |
|---|---|---|
| C1 | RoC vs RDC mistake | All copy says "République du Congo" / "Congo-Brazzaville". `grep -ri "démocratique" src/app` returns 0 |
| C2 | Wrong sectors (Mines, Banques…) | `fr.constants.ts` exposes only the 6 SFD sectors. `MockAdminService.sectors` is locked |
| C3, C10 | Inscription `<form>` missing | `features/auth/inscription/inscription.component.ts` — Reactive 3-step form, every field has `name`, validators, `aria-live` errors |
| C4 | Connexion broken (no JS / submit) | `features/auth/connexion/connexion.component.ts` — `(ngSubmit)` intercepted, `AuthService.login`, returnUrl-aware redirect |
| C5 | Tarifs in English | `features/public/tarifs/tarifs.component.ts` entirely in French + Stripe in `<ac-payment-method-strip>` |
| C6 | Tailwind via CDN Play | `tailwind.config.js` + `postcss.config.js` (PostCSS pipeline). No CDN script anywhere |
| C7 | Dead `dashboard-owner.html` link | `/espace` route renders `EspaceConsoleComponent` |
| C8 | Double navbar in `secteurs.html` | A single `<ac-public-header>` renders for every public page |
| C9 | `creer-entreprise.html` orphan | `/espace/fiche/creer` is the empty-state CTA inside `EspaceConsoleComponent` |

## Major improvements (audit M-series)

| # | Audit fix | Implementation |
|---|---|---|
| M1 | Inline `<style>` blocks duplicated | Component-scoped SCSS only; tokens via CSS custom properties (`styles/_tokens.scss`) |
| M2 | Inter / Lexend not actually loaded | `index.html` loads only DM Serif Display + DM Sans + Material Symbols Outlined |
| M3 | Inconsistent navbar | Single `<ac-public-header>` ; `routerLinkActive` ; mobile drawer |
| M4 | Hamburger menu only on accueil | The header component is mounted by `PublicLayout` for every public page |
| M5 | Inconsistent placeholder stats (6 vs 12) | Stats sourced from `MockEspaceService` / `MockAdminService` — single source of truth |
| M6 | Tabs on fiche entreprise non-functional | `<ac-tabs>` + active state in `FicheEntrepriseComponent` |
| M7 | Stripe missing on tarifs | `<ac-payment-method-strip [methods]="['mtn','airtel','stripe']" />` on `tarifs` and `espace/abonnement` |
| M8 | Mentions / confidentialité empty | `LegalPageComponent` with full FR copy switched on `data.kind` |
| M9 | Validation without rejection motif | `<ac-confirm-modal reasonRequired>` in `AdminValidationDetailComponent` |
| M10 | Admin sidebar unusable on mobile | `AdminLayoutComponent` toggles a CDK-style drawer via `<ac-admin-topbar>` hamburger |
| M11 | Annuaire filters unreachable on mobile | `AnnuaireListComponent` opens a fixed-position drawer below 768 px |
| M12 | Favicon missing | `index.html` references `/favicon.ico`, `/icons/favicon-32.png`, `/icons/apple-touch-icon.png` |
| M13 | Open Graph / Twitter / JSON-LD | `index.html` `<meta>` block + `og:image` |
| M14 | Inert "Télécharger PDF" / "Signaler" buttons | Either replaced with real CTAs or removed |
| M15 | XAF vs FCFA inconsistency | `XafPipe` (default ISO `XAF`, optional `FCFA` via `'symbol'`) |

## Polish (audit P-series)

| # | Audit fix | Implementation |
|---|---|---|
| P1 | Missing pages (reset, paiement-success/echec, validation-detail, forfaits CRUD, utilisateurs, audit, paramètres, statistiques) | All shipped — see `features/auth/reinitialiser-mot-de-passe`, `features/espace/abonnement/{succes,echec}`, `features/admin/{validation/...,forfaits,utilisateurs,audit,parametres}`, `features/espace/statistiques` |
| P3 | Section padding rhythm | `--space-section-y` token in `_tokens.scss`, uniform `py-20` / `py-32` use |
| P4 | Hero search inert | `<ac-public-search-bar>` submits to `/annuaire?q=...&secteur=...` |
| P5 | "S'inscrire" everywhere | `FR.nav.register` + uniform copy |
| P6 | Images without `width`/`height` | All `<img>` in layouts have `width` + `height` attributes |
| P7 | Pagination buttons inert | `<ac-pagination>` emits page changes, syncs to URL in `AnnuaireListComponent` |
| P8 | Grid / list toggle on annuaire | `view` signal + `<ac-company-card variant="…" />` |
| P9 | Toast hidden by `translate-y-20` | `<ac-toast-host>` + `ToastService` (real signal queue) |
| P10 | Hardcoded hex values | All colors via CSS custom properties (`var(--color-...)`) |
| P11 | Skip-link missing | `<ac-skip-link>` in every layout shell |
| P12 | `:focus-visible` not styled | Global rule in `styles/_components.scss` |
| P13 | `tel:` / `mailto:` missing | `FicheEntrepriseComponent` uses both |

## Out of scope (deferred / intentional)

- **Authentication backend** still uses the existing `AuthService` (kept as-is)
- **Self-host fonts**: kept on Google Fonts (with `preconnect`) — switching to local woff2 is a 1-day task once design assets are final
- **Service worker activation**: `manifest.webmanifest`, `ngsw-config.json` and the install prompt are in place; the package itself (`@angular/service-worker`) is **not yet installed** because of an Angular 19 peer-dep conflict. To activate, follow the steps in `src/app/core/sw/sw.providers.ts` (single comment block).
- **Legacy file deletion**: every legacy component has been **neutralized** in Sprint 8 (each file now contains only `export {};` so it pulls in zero Material code). The user must run `git rm` on the listed paths from a Windows terminal — the sandbox can't delete files on the mounted host filesystem.

## Sprint 8 — verification gate

| Check | Result |
|---|---|
| Material imports anywhere in `src/app` | **0** (only one comment line in `http-error.interceptor.ts`) |
| `@angular/material` in `package.json` | **removed** |
| `MatSnackBar` in interceptor | **replaced** by `ToastService` + French messages |
| `mat-*` selectors in templates | **0** |
| Route table lazy-load targets | **49 / 49 resolve to existing files** |
| Legacy components compiled | **none** — all stubbed to `export {};` |
| `src/styles.scss` | **emptied** + dropped from `angular.json` |
| `src/styles/index.scss` | sole stylesheet entry, owns all design tokens |
| French locale | registered, `LOCALE_ID = 'fr'` |
| XAF currency display | `XafPipe`, no `'XAF'` literals in templates |
| 6 SFD sectors | locked in `fr.constants.ts` + `MockAdminService` |
| Stripe + MTN + Airtel | rendered on tarifs and on espace abonnement |
| Skip-link in every shell | yes |
| `aria-current="page"` on every nav link | yes (via `routerLinkActive` + `ariaCurrentWhenActive`) |
| Mobile drawer on every shell | public, espace, admin |

## Final code inventory (new code only)

| Family | Files | Bytes |
|---|---|---|
| Design system stylesheets               | 5  | 19.5 KB |
| Core (i18n, pipes, services, interceptors, models, guards, sw) | 26 | 79.5 KB |
| Shared UI primitives                    | 14 | 32.8 KB |
| Shared composite components             | 7  | 22.2 KB |
| Shared services (toast, modal, breakpoint) | 4  | 5.8 KB |
| Layouts (public, auth, espace, admin)   | 10 | 32.7 KB |
| features/public                         | 15 | 120.8 KB |
| features/auth                           | 5  | 40.6 KB |
| features/espace                         | 11 | 77.0 KB |
| features/admin                          | 13 | 80.6 KB |
| **Total new application code**          | **110** | **≈ 500 KB** |

---

## Legacy components scheduled for deletion

These files are no longer referenced by `app.routes.ts` and ship Angular Material code that is incompatible with the new design system. They can be deleted in one sweep before the first production build.

```
src/app/features/home/                     (replaced by features/public/accueil)
src/app/features/auth/login/               (replaced by features/auth/connexion)
src/app/features/auth/register/            (replaced by features/auth/inscription)
src/app/features/companies/                (replaced by features/public/annuaire + features/espace/fiche)
src/app/features/dashboard/                (replaced by features/espace/console)
src/app/features/profile/                  (replaced by features/espace/compte)
src/app/features/regions/                  (replaced by features/public/cartographie)
src/app/features/subscription/             (replaced by features/public/tarifs + features/espace/abonnement)
src/app/features/notifications/            (replaced by features/espace/notifications)
src/app/features/admin/business-owners/    (replaced by features/admin/dirigeants)
src/app/features/admin/companies/          (replaced by features/admin/entreprises)
src/app/features/admin/geography/          (replaced by features/admin/geographie)
src/app/features/admin/logs/               (replaced by features/admin/audit)
src/app/features/admin/plans/              (replaced by features/admin/forfaits)
src/app/features/admin/reports/            (replaced by features/admin/statistiques)
src/app/features/admin/sectors/            (replaced by features/admin/secteurs)
src/app/shared/layout/                     (replaced by app/layout/{public, auth, espace, admin})
src/app/shared/company-grid/               (replaced by shared/components/company-card)
src/app/shared/dialogs/                    (replaced by shared/services/modal.service.ts + ConfirmModalComponent)
src/app/shared/map/                        (cartographie owns its own Leaflet wiring now)
```

After cleanup, you can also remove `@angular/material` from `package.json` (currently kept as a transitional dep — see comment in package.json).

---

## Local verification checklist

Before pushing, on a dev machine:

1. `cd src/ANNUAIRECONGO.Client && npm install`
2. `npm run build` — must be green
3. `npm start` — visit `/`, `/annuaire`, `/secteurs`, `/tarifs`, `/auth/connexion`, `/auth/inscription`, `/espace` (after login), `/admin` (admin login)
4. Resize the browser to 375 × 812 — verify mobile drawer works on every public page, on `/espace` and `/admin`
5. Run axe-core on the home page — should report ≤ 1 minor issue
6. Lighthouse pass: aim for ≥ 90 perf / ≥ 95 a11y / ≥ 95 BP / ≥ 95 SEO

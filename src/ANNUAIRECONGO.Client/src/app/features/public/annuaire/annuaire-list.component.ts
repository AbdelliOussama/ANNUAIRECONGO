import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CompanyCardComponent, CompanyCardData } from '@shared/components/company-card/company-card.component';
import { PaginationComponent } from '@shared/ui/pagination/pagination.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { MockCompanyService } from '@core/services/mock/mock-company.service';
import { FR } from '@core/i18n/fr.constants';
import { switchMap, BehaviorSubject } from 'rxjs';

interface Filters {
  query: string;
  sector: string;
  region: string;
  verifiedOnly: boolean;
}

interface SectorOption { value: string; label: string; }

/**
 * /annuaire — directory listing.
 *
 * Reads filters from the URL query string (audit P4 — hero search must
 * actually navigate here with ?q=...&secteur=...). State is mirrored back
 * into the URL on change so users can bookmark and share filtered views.
 *
 * Sidebar filters on >=md, full-screen drawer on mobile (audit M11).
 * Grid / list toggle (audit P8).
 */
@Component({
  selector: 'ac-annuaire-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CompanyCardComponent,
    PaginationComponent,
    EmptyStateComponent,
    SkeletonComponent,
  ],
  template: `
    <div class="layout">
      <!-- Sidebar filters (desktop) + mobile drawer -->
      <aside
        class="filters"
        [class.is-open]="filtersOpen()"
        aria-label="Filtres de recherche"
      >
        <div class="filters-head">
          <div>
            <h2 class="text-lg font-bold font-headline text-primary">Filtres</h2>
            <p class="eyebrow">Annuaire National</p>
          </div>
          <button
            type="button"
            class="close-btn md:hidden"
            aria-label="Fermer les filtres"
            (click)="closeFilters()"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="form-group">
          <label class="form-label" for="filter-search">Recherche libre</label>
          <input
            id="filter-search"
            type="search"
            class="form-input"
            placeholder="Nom, RCCM, NIU…"
            [value]="filters().query"
            (input)="onQuery($event)"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="filter-sector">Secteur</label>
          <select
            id="filter-sector"
            class="form-input"
            [value]="filters().sector"
            (change)="onSector($event)"
          >
            <option value="">Tous les secteurs</option>
            @for (s of sectors; track s.value) {
              <option [value]="s.value">{{ s.label }}</option>
            }
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="filter-region">Région</label>
          <select
            id="filter-region"
            class="form-input"
            [value]="filters().region"
            (change)="onRegion($event)"
          >
            <option value="">Toutes les régions</option>
            @for (r of regions(); track r) {
              <option [value]="r">{{ r }}</option>
            }
          </select>
        </div>

        <label class="check">
          <input type="checkbox" [checked]="filters().verifiedOnly" (change)="onVerifiedOnly($event)" />
          <span>Vérifiées uniquement</span>
        </label>

        <div class="filters-actions">
          <button type="button" class="btn btn-primary w-full" (click)="closeFilters()">Appliquer</button>
          <button type="button" class="btn btn-ghost w-full" (click)="reset()">Réinitialiser</button>
        </div>
      </aside>

      @if (filtersOpen()) {
        <div class="scrim md:hidden" aria-hidden="true" (click)="closeFilters()"></div>
      }

      <!-- Main content -->
      <main class="content">
        <header class="page-header">
          <div>
            <h1 class="title">Annuaire des Entreprises</h1>
            <div class="meta">
              <span class="badge badge-verified">{{ totalCount() }} résultats</span>
              <span class="text-secondary">Répertoire national officiel du Congo-Brazzaville</span>
            </div>
          </div>

          <div class="header-actions">
            <button
              type="button"
              class="filter-mobile-btn md:hidden"
              (click)="openFilters()"
            >
              <span class="material-symbols-outlined" aria-hidden="true">tune</span>
              Filtres
            </button>

            <div class="view-toggle" role="group" aria-label="Affichage">
              <button
                type="button"
                class="toggle-btn"
                [class.is-active]="view() === 'grid'"
                (click)="view.set('grid')"
                aria-label="Affichage en grille"
              >
                <span class="material-symbols-outlined" aria-hidden="true">grid_view</span>
              </button>
              <button
                type="button"
                class="toggle-btn"
                [class.is-active]="view() === 'list'"
                (click)="view.set('list')"
                aria-label="Affichage en liste"
              >
                <span class="material-symbols-outlined" aria-hidden="true">view_list</span>
              </button>
            </div>
          </div>
        </header>

        @if (loading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (_ of [0, 1, 2, 3, 4, 5]; track $index) {
              <ac-skeleton shape="card" height="220px" />
            }
          </div>
        } @else if (cards().length === 0) {
          <ac-empty-state
            icon="search_off"
            [title]="FR.emptyState.noResults"
            [hint]="FR.emptyState.noResultsHint"
          >
            <button type="button" class="btn btn-outline" (click)="reset()">Réinitialiser les filtres</button>
          </ac-empty-state>
        } @else {
          <div [class]="view() === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-3'">
            @for (card of cards(); track card.id) {
              <ac-company-card [data]="card" [variant]="view()" />
            }
          </div>

          @if (totalPages() > 1) {
            <div class="pagination-wrap">
              <ac-pagination
                [currentPage]="page()"
                [totalPages]="totalPages()"
                (pageChange)="onPage($event)"
              />
            </div>
          }
        }
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .layout { display: flex; min-height: calc(100vh - 64px); }
    .filters {
      width: 288px;
      flex-shrink: 0;
      background: var(--color-surface-container-low);
      padding: 24px;
      display: none;
      flex-direction: column;
      gap: 18px;
      position: sticky;
      top: 64px;
      height: calc(100vh - 64px);
      overflow-y: auto;
    }
    @media (min-width: 768px) { .filters { display: flex; } }

    .filters-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }
    .check {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-size: 14px;
      color: var(--color-on-surface);
    }
    .check input {
      width: 18px; height: 18px;
      accent-color: var(--color-primary);
    }
    .filters-actions { margin-top: auto; display: flex; flex-direction: column; gap: 8px; }
    .w-full { width: 100%; }
    .close-btn {
      width: 36px; height: 36px;
      border: none;
      background: transparent;
      cursor: pointer;
      color: var(--color-on-surface);
      border-radius: var(--radius-md);
    }

    /* Mobile drawer */
    @media (max-width: 767px) {
      .filters {
        position: fixed;
        inset: 64px 0 0 0;
        z-index: 80;
        width: 100%;
        max-width: 360px;
        height: calc(100vh - 64px);
        transform: translateX(-100%);
        transition: transform 0.25s ease;
        background: var(--color-surface);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
      }
      .filters.is-open { display: flex; transform: translateX(0); }
    }
    .scrim {
      position: fixed;
      inset: 64px 0 0 0;
      background: rgba(25, 28, 30, 0.55);
      backdrop-filter: blur(2px);
      z-index: 79;
    }

    .content { flex: 1; padding: 32px; min-width: 0; }
    @media (max-width: 767px) { .content { padding: 20px; } }

    .page-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 32px;
    }
    .title {
      font-family: var(--font-headline);
      font-size: 36px;
      font-weight: 900;
      color: var(--color-primary);
      letter-spacing: -0.02em;
    }
    @media (min-width: 1024px) { .title { font-size: 44px; } }
    .meta {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 12px;
    }
    .text-secondary { color: var(--color-on-secondary-container); font-size: 14px; }

    .header-actions { display: flex; align-items: center; gap: 12px; }
    .filter-mobile-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-outline-variant);
      background: var(--color-surface-container-lowest);
      color: var(--color-on-surface);
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }
    .view-toggle {
      display: inline-flex;
      gap: 4px;
      padding: 4px;
      background: var(--color-surface-container-low);
      border-radius: var(--radius-md);
    }
    .toggle-btn {
      width: 36px; height: 36px;
      border: none;
      background: transparent;
      color: var(--color-on-secondary-container);
      cursor: pointer;
      border-radius: var(--radius-sm);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .toggle-btn.is-active {
      background: var(--color-surface-container-lowest);
      color: var(--color-primary);
      box-shadow: var(--shadow-card);
    }

    .pagination-wrap { display: flex; justify-content: center; margin-top: 32px; }
  `],
})
export class AnnuaireListComponent {
  protected readonly FR = FR;
  private readonly companyService = inject(MockCompanyService);
  private readonly route          = inject(ActivatedRoute);
  private readonly router         = inject(Router);

  protected readonly filters = signal<Filters>({
    query: '',
    sector: '',
    region: '',
    verifiedOnly: false,
  });
  protected readonly page    = signal(1);
  protected readonly view    = signal<'grid' | 'list'>('grid');
  protected readonly filtersOpen = signal(false);

  protected readonly sectors: ReadonlyArray<SectorOption> = [
    { value: FR.sectors.maritime.slug,    label: FR.sectors.maritime.name },
    { value: FR.sectors.logistique.slug,  label: FR.sectors.logistique.name },
    { value: FR.sectors.douane.slug,      label: FR.sectors.douane.name },
    { value: FR.sectors.industrie.slug,   label: FR.sectors.industrie.name },
    { value: FR.sectors.securite.slug,    label: FR.sectors.securite.name },
    { value: FR.sectors.manutention.slug, label: FR.sectors.manutention.name },
  ];

  protected readonly regions = toSignal(this.companyService.regions(), { initialValue: [] as string[] });

  // Reactive query stream — refetches whenever filters/page change.
  private readonly trigger = new BehaviorSubject<void>(undefined);
  private readonly result = toSignal(
    this.trigger.pipe(
      switchMap(() =>
        this.companyService.list({
          query: this.filters().query || undefined,
          sector: this.filters().sector || undefined,
          region: this.filters().region || undefined,
          verifiedOnly: this.filters().verifiedOnly || undefined,
          pageNumber: this.page(),
          pageSize: 9,
        })
      )
    ),
    { initialValue: null }
  );

  protected readonly loading    = computed(() => this.result() === null);
  protected readonly totalCount = computed(() => this.result()?.totalCount ?? 0);
  protected readonly totalPages = computed(() => this.result()?.totalPages ?? 1);
  protected readonly cards      = computed<CompanyCardData[]>(() =>
    (this.result()?.items ?? []).map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      sectorLabel: c.sectorLabel,
      sectorIcon:  c.sectorIcon,
      description: c.description,
      city: c.city,
      isVerified: c.isVerified,
      isPremium:  c.isPremium,
    }))
  );

  constructor() {
    // Hydrate from query params on first activation.
    this.route.queryParams.subscribe((qp) => {
      this.filters.set({
        query:        qp['q']        ?? '',
        sector:       qp['secteur']  ?? '',
        region:       qp['region']   ?? '',
        verifiedOnly: qp['verifiees'] === '1',
      });
      this.page.set(qp['page'] ? Math.max(1, Number(qp['page'])) : 1);
      this.trigger.next();
    });
  }

  /* ── Filter handlers (debounced/synchronized via syncToUrl) ── */
  protected onQuery(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    this.filters.update((f) => ({ ...f, query: v }));
    this.page.set(1);
    this.syncToUrl();
  }
  protected onSector(e: Event): void {
    this.filters.update((f) => ({ ...f, sector: (e.target as HTMLSelectElement).value }));
    this.page.set(1); this.syncToUrl();
  }
  protected onRegion(e: Event): void {
    this.filters.update((f) => ({ ...f, region: (e.target as HTMLSelectElement).value }));
    this.page.set(1); this.syncToUrl();
  }
  protected onVerifiedOnly(e: Event): void {
    this.filters.update((f) => ({ ...f, verifiedOnly: (e.target as HTMLInputElement).checked }));
    this.page.set(1); this.syncToUrl();
  }
  protected onPage(p: number): void { this.page.set(p); this.syncToUrl(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  protected reset(): void {
    this.filters.set({ query: '', sector: '', region: '', verifiedOnly: false });
    this.page.set(1);
    this.syncToUrl();
  }

  protected openFilters(): void  { this.filtersOpen.set(true); }
  protected closeFilters(): void { this.filtersOpen.set(false); }

  private syncToUrl(): void {
    const f = this.filters();
    const queryParams: Record<string, string | undefined> = {
      q:         f.query  || undefined,
      secteur:   f.sector || undefined,
      region:    f.region || undefined,
      verifiees: f.verifiedOnly ? '1' : undefined,
      page:      this.page() > 1 ? String(this.page()) : undefined,
    };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    this.trigger.next();
  }
}

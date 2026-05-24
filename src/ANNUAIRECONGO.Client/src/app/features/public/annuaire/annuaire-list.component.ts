import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { CompanyCardComponent, CompanyCardData } from '@shared/components/company-card/company-card.component';
import { PaginationComponent } from '@shared/ui/pagination/pagination.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { CompanyService } from '@core/services/company.service';
import { SectorService } from '@core/services/sector.service';
import { GeographyService } from '@core/services/geography.service';
import { Sector, Region, Company, PaginatedResponse } from '@core/models/company.model';
import { FR } from '@core/i18n/fr.constants';
import { switchMap, catchError, of, tap, debounceTime, distinctUntilChanged } from 'rxjs';

interface Filters {
  query: string;
  sectorId: string;
  sectorSlug: string;
  regionId: string;
  regionName: string; // Added for map deep-linking
  verifiedOnly: boolean;
}

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
          <div class="flex items-center justify-between mb-2">
            <label class="form-label mb-0" for="filter-search">Recherche</label>
            <button
              type="button"
              class="btn-ai-toggle"
              [class.is-active]="isSmartSearch()"
              (click)="toggleSmartSearch()"
            >
              <span class="material-symbols-outlined text-sm mr-1">auto_awesome</span>
              Recherche IA
            </button>
          </div>
          <div class="relative search-wrapper" [class.ai-glow]="isSmartSearch()">
            <input
              id="filter-search"
              type="search"
              class="form-input search-input"
              [class.ai-input]="isSmartSearch()"
              [placeholder]="isSmartSearch() ? 'Ex: entreprise de logistique à Pointe-Noire…' : 'Nom, RCCM, NIU…'"
              [value]="filters().query"
              (input)="onQuery($event)"
            />
            @if (isSmartSearch()) {
              <span class="ai-sparkle material-symbols-outlined">magic_button</span>
            }
          </div>
          @if (isSmartSearch()) {
            <p class="text-xs text-ai-info mt-1.5 flex items-center">
              <span class="material-symbols-outlined text-xs mr-1">info</span>
              L'IA extrait automatiquement la ville, le secteur et les mots-clés.
            </p>
          }
        </div>

        <div class="form-group">
          <label class="form-label" for="filter-sector">Secteur</label>
          <select
            id="filter-sector"
            class="form-input"
            [value]="activeSectorId()"
            (change)="onSector($event)"
          >
            <option value="">Tous les secteurs</option>
            @for (s of sectors(); track s.id) {
              <option [value]="s.id">{{ s.name }}</option>
            }
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="filter-region">Région</label>
          <select
            id="filter-region"
            class="form-input"
            [value]="activeRegionId()"
            (change)="onRegion($event)"
          >
            <option value="">Toutes les régions</option>
            @for (r of regions(); track r.id) {
              <option [value]="r.id">{{ r.name }}</option>
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

            <div class="view-toggle" role="group" aria-label="Tri">
              <select class="sort-select" [value]="sortBy() + ':' + sortOrder()" (change)="onSort($event)">
                <option value="date:desc">Nouveautés</option>
                <option value="name:asc">Nom (A-Z)</option>
                <option value="name:desc">Nom (Z-A)</option>
                <option value="date:asc">Ancienneté</option>
              </select>
            </div>

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

    .sort-select {
      background: transparent;
      border: none;
      font-size: 12px;
      font-weight: 700;
      color: var(--color-on-surface);
      padding: 0 8px;
      cursor: pointer;
      outline: none;
    }

    .pagination-wrap { display: flex; justify-content: center; margin-top: 32px; }

    /* AI Smart Search Premium Styling */
    .btn-ai-toggle {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid var(--color-outline-variant);
      background: transparent;
      color: var(--color-on-surface-variant);
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn-ai-toggle:hover {
      background: rgba(var(--color-primary-rgb), 0.08);
      color: var(--color-primary);
      border-color: var(--color-primary);
    }
    .btn-ai-toggle.is-active {
      background: linear-gradient(135deg, #7F00FF, #E100FF);
      color: white;
      border-color: transparent;
      box-shadow: 0 4px 15px rgba(225, 0, 255, 0.3);
      animation: pulse-glow 2s infinite alternate;
    }
    @keyframes pulse-glow {
      0% { box-shadow: 0 4px 12px rgba(225, 0, 255, 0.2); }
      100% { box-shadow: 0 4px 20px rgba(225, 0, 255, 0.5); }
    }
    .relative { position: relative; }
    .search-wrapper {
      transition: all 0.3s ease;
      border-radius: var(--radius-md);
    }
    .ai-glow {
      box-shadow: 0 0 12px rgba(225, 0, 255, 0.2);
    }
    .form-input.search-input {
      padding-right: 36px;
    }
    .form-input.ai-input {
      border-color: #E100FF;
      background: linear-gradient(to right, var(--color-surface), rgba(225, 0, 255, 0.02));
    }
    .form-input.ai-input:focus {
      border-color: #7F00FF;
      box-shadow: 0 0 0 3px rgba(127, 0, 255, 0.2);
    }
    .ai-sparkle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #E100FF;
      pointer-events: none;
      font-size: 18px;
      animation: spin-sparkle 3s infinite linear;
    }
    @keyframes spin-sparkle {
      0% { transform: translateY(-50%) rotate(0deg); opacity: 0.8; }
      50% { transform: translateY(-50%) rotate(180deg); opacity: 1; scale: 1.1; }
      100% { transform: translateY(-50%) rotate(360deg); opacity: 0.8; }
    }
    .text-xs.text-ai-info {
      color: #7F00FF;
      font-size: 11px;
    }
  `],
})
export class AnnuaireListComponent {
  protected readonly FR = FR;
  private readonly companyService = inject(CompanyService);
  private readonly sectorService  = inject(SectorService);
  private readonly geoService     = inject(GeographyService);
  private readonly route          = inject(ActivatedRoute);
  private readonly router         = inject(Router);

  protected readonly filters = signal<Filters>({
    query: '',
    sectorId: '',
    sectorSlug: '',
    regionId: '',
    regionName: '',
    verifiedOnly: false,
  });
  protected readonly isSmartSearch = signal(false);
  protected toggleSmartSearch(): void {
    this.isSmartSearch.update(v => !v);
    this.page.set(1);
    this.syncToUrl();
  }
  protected readonly page    = signal(1);
  protected readonly sortBy  = signal('date');
  protected readonly sortOrder = signal('desc');
  protected readonly view    = signal<'grid' | 'list'>('grid');
  protected readonly activeRegionId = computed(() => {
    const f = this.filters();
    if (f.regionId) return f.regionId;
    if (f.regionName) {
      const found = this.regions().find(r => r.name.toLowerCase() === f.regionName.toLowerCase());
      return found ? found.id : '';
    }
    return '';
  });

  protected readonly filtersOpen = signal(false);

  protected readonly sectors = toSignal(this.sectorService.getSectors(), { initialValue: [] as Sector[] });
  protected readonly regions = toSignal(this.geoService.getRegions(), { initialValue: [] as Region[] });

  // UI Helper for the sector select
  protected readonly activeSectorId = computed(() => {
    const f = this.filters();
    if (f.sectorId) return f.sectorId;
    if (f.sectorSlug) {
      const found = this.sectors().find(s => s.slug === f.sectorSlug);
      return found?.id || '';
    }
    return '';
  });

  // Resolved filters for the API
  private readonly resolvedParams = computed(() => {
    const f = this.filters();
    const allSectors = this.sectors();
    
    let sectorId = f.sectorId;
    let sectorSlug = f.sectorSlug;

    // If we only have a slug (e.g. from URL), try to find the ID
    if (!sectorId && sectorSlug) {
      const found = allSectors.find(s => s.slug === sectorSlug);
      if (found) sectorId = found.id;
    } 
    // If we have an ID (e.g. from dropdown), find the slug for the URL
    else if (sectorId && !sectorSlug) {
      const found = allSectors.find(s => s.id === sectorId);
      if (found) sectorSlug = found.slug;
    }

    return {
      q:          this.isSmartSearch() ? '' : f.query,
      smartSearch: this.isSmartSearch() ? f.query : '',
      sectorId:   sectorId,
      sectorSlug: sectorSlug,
      region:     f.regionId || f.regionName, // Combine into 'region' param
      verifiees:  f.verifiedOnly,
      page:       this.page(),
      tri:        this.sortBy(),
      ordre:      this.sortOrder()
    };
  });

  private readonly params$ = toObservable(this.resolvedParams);

  private readonly result = toSignal<PaginatedResponse<Company> | null>(
    this.params$.pipe(
      debounceTime(400),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      tap(() => this.loading.set(true)),
      switchMap(p => {
        console.log('Annuaire fetch parameters:', p);
        const isRegionId = /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(p.region || '');
        
        return this.companyService.getCompanies({
          searchTerm: p.q || undefined,
          smartSearch: p.smartSearch || undefined,
          sectorId:   p.sectorId || undefined,
          sectorSlug: p.sectorSlug || undefined,
          regionId:   isRegionId ? p.region : undefined,
          regionName: !isRegionId ? p.region : undefined,
          status:     2, // Force Active status
          sortBy:     p.tri,
          sortOrder:  p.ordre,
          pageNumber: p.page,
          pageSize:   9,
        }).pipe(
          tap(() => this.loading.set(false)),
          catchError((err) => {
            console.error('Annuaire: fetch failed', err);
            this.loading.set(false);
            return of(null);
          })
        )
      })
    ),
    { initialValue: null }
  );

  protected readonly loading    = signal(true);
  protected readonly totalCount = computed(() => this.result()?.totalCount ?? 0);
  protected readonly totalPages = computed(() => this.result()?.totalPages ?? 1);
  protected readonly cards      = computed<CompanyCardData[]>(() => {
    const items = this.result()?.items || [];
    return items.map((c) => ({
      id:          c.id,
      name:        c.name,
      slug:        c.slug,
      sectorLabel: c.sectors?.[0]?.name || 'N/A',
      sectorIcon:  c.sectors?.[0]?.iconUrl || 'business',
      sectors:     c.sectors || [],
      description: c.description || '',
      city:        c.cityName || c.city?.name || 'Congo',
      isVerified:  c.status === 'Active' || c.isVerified,
      isPremium:   c.isPremium,
    }));
  });

  constructor() {
    this.route.queryParams.subscribe((qp) => {
      const secteurParam = qp['secteur'] ?? '';
      const regionParam = qp['region'] ?? '';
      const isSecteurGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(secteurParam);
      const isRegionGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(regionParam);
      
      const smartParam = qp['smart'] ?? '';
      this.isSmartSearch.set(!!smartParam);

      this.filters.set({
        query:        smartParam || (qp['q'] ?? ''),
        sectorId:     isSecteurGuid ? secteurParam : '',
        sectorSlug:   !isSecteurGuid ? secteurParam : '',
        regionId:     isRegionGuid ? regionParam : '',
        regionName:   !isRegionGuid ? regionParam : '',
        verifiedOnly: qp['verifiees'] === '1',
      });
      this.page.set(qp['page'] ? Math.max(1, Number(qp['page'])) : 1);
      this.sortBy.set(qp['tri'] ?? 'date');
      this.sortOrder.set(qp['ordre'] ?? 'desc');
    });
  }

  protected onQuery(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    this.filters.update((f) => ({ ...f, query: v }));
    this.page.set(1);
    this.syncToUrl();
  }
  protected onSector(e: Event): void {
    const val = (e.target as HTMLSelectElement).value;
    this.filters.update((f) => ({ ...f, sectorId: val, sectorSlug: '' }));
    this.page.set(1); 
    this.syncToUrl();
  }
  protected onRegion(e: Event): void {
    const val = (e.target as HTMLSelectElement).value;
    this.filters.update((f) => ({ ...f, regionId: val, regionName: '' }));
    this.page.set(1); 
    this.syncToUrl();
  }
  protected onVerifiedOnly(e: Event): void {
    this.filters.update((f) => ({ ...f, verifiedOnly: (e.target as HTMLInputElement).checked }));
    this.page.set(1); this.syncToUrl();
  }
  
  protected onSort(e: Event): void {
    const val = (e.target as HTMLSelectElement).value;
    const [by, order] = val.split(':');
    this.sortBy.set(by);
    this.sortOrder.set(order);
    this.page.set(1);
    this.syncToUrl();
  }

  protected onPage(p: number): void { this.page.set(p); this.syncToUrl(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  protected reset(): void {
    this.filters.set({ query: '', sectorId: '', sectorSlug: '', regionId: '', regionName: '', verifiedOnly: false });
    this.page.set(1);
    this.syncToUrl();
    this.closeFilters();
  }

  protected openFilters(): void  { this.filtersOpen.set(true); }
  protected closeFilters(): void { this.filtersOpen.set(false); }

  private syncToUrl(): void {
    const p = this.resolvedParams();
    const queryParams: Record<string, string | undefined> = {
      q:         this.isSmartSearch() ? undefined : (p.q || undefined),
      smart:     this.isSmartSearch() ? (p.smartSearch || undefined) : undefined,
      secteur:   p.sectorSlug || p.sectorId || undefined,
      region:    p.region || undefined,
      verifiees: p.verifiees ? '1' : undefined,
      tri:       this.sortBy() !== 'date' ? this.sortBy() : undefined,
      ordre:     this.sortOrder() !== 'desc' ? this.sortOrder() : undefined,
      page:      this.page() > 1 ? String(this.page()) : undefined,
    };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}

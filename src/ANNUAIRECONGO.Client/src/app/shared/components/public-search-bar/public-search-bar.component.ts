import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FR } from '@core/i18n/fr.constants';

interface SectorOption { value: string; label: string; }

/**
 * <ac-public-search-bar> — hero search composite.
 * Submits to /annuaire?q=&secteur= so the search has a real destination
 * (audit P4 — hero search must be functional, not decorative).
 */
@Component({
  selector: 'ac-public-search-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-3xl mx-auto w-full">
      <div class="flex items-center justify-between mb-3 px-1">
        <span class="text-xs font-bold text-secondary uppercase tracking-wider">Recherche d'entreprises</span>
        <button
          type="button"
          class="btn-ai-toggle"
          [class.is-active]="isSmartSearch()"
          (click)="toggleSmartSearch()"
        >
          <span class="material-symbols-outlined text-sm mr-1">auto_awesome</span>
          Recherche IA ✨
        </button>
      </div>
      
      <form
        class="bg-surface-container-lowest p-2 rounded-2xl shadow-editorial border border-outline-variant/10 flex flex-col md:flex-row items-stretch md:items-center gap-2 relative search-wrapper"
        [class.ai-glow]="isSmartSearch()"
        role="search"
        (submit)="onSubmit($event)"
      >
        <div class="flex flex-1 items-center gap-3 px-4 relative">
          <span class="material-symbols-outlined text-outline flex-shrink-0" [class.ai-sparkle-text]="isSmartSearch()" aria-hidden="true">
            {{ isSmartSearch() ? 'auto_awesome' : 'search' }}
          </span>
          <input
            type="search"
            [value]="query()"
            (input)="onQueryInput($event)"
            [placeholder]="placeholderText()"
            class="w-full bg-transparent border-none focus:ring-0 text-base font-medium text-on-surface placeholder:text-outline py-4"
            [attr.aria-label]="isSmartSearch() ? 'Recherche intelligente par IA' : 'Recherche classique'"
            autocomplete="off"
          />
        </div>
        <div class="flex items-center gap-2 px-3 flex-wrap md:flex-nowrap">
          @if (!isSmartSearch()) {
            <select
              [value]="sector()"
              (change)="onSectorChange($event)"
              class="bg-surface-container-low border-none rounded-xl text-sm py-2.5 px-3 text-secondary font-label font-semibold focus:ring-2 focus:ring-primary/20 cursor-pointer"
              aria-label="Filtrer par secteur"
            >
              <option value="">Tous les secteurs</option>
              @for (s of sectorOptions; track s.value) {
                <option [value]="s.value">{{ s.label }}</option>
              }
            </select>
          }
          <button type="submit" class="btn py-3 px-8 text-sm" [class.btn-primary]="!isSmartSearch()" [class.btn-ai-submit]="isSmartSearch()" aria-label="Lancer la recherche">
            {{ isSmartSearch() ? 'Analyser' : FR.actions.search }}
          </button>
        </div>
      </form>
      
      @if (isSmartSearch()) {
        <p class="text-xs text-ai-info mt-2 px-2 flex items-center justify-center">
          <span class="material-symbols-outlined text-xs mr-1 animate-pulse">info</span>
          L'intelligence artificielle analyse votre demande libre pour filtrer automatiquement les fiches.
        </p>
      }
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }

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
    .search-wrapper {
      transition: all 0.3s ease;
    }
    .ai-glow {
      border-color: #E100FF !important;
      box-shadow: 0 0 20px rgba(225, 0, 255, 0.25) !important;
      background: linear-gradient(to right, var(--color-surface-container-lowest), rgba(225, 0, 255, 0.02)) !important;
    }
    .ai-sparkle-text {
      color: #E100FF !important;
      animation: pulse-sparkle 1.5s infinite alternate;
    }
    @keyframes pulse-sparkle {
      0% { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(1.15); opacity: 1; }
    }
    .btn-ai-submit {
      background: linear-gradient(135deg, #7F00FF, #E100FF);
      color: white;
      font-weight: 700;
      border-radius: var(--radius-xl);
      box-shadow: 0 4px 10px rgba(225, 0, 255, 0.2);
      transition: all 0.2s ease;
    }
    .btn-ai-submit:hover {
      box-shadow: 0 6px 15px rgba(225, 0, 255, 0.4);
      transform: translateY(-1px);
    }
    .text-xs.text-ai-info {
      color: #7F00FF;
      font-size: 11px;
    }
  `],
})
export class PublicSearchBarComponent {
  protected readonly FR = FR;
  protected readonly isSmartSearch = signal(false);
  protected readonly placeholderText = computed(() =>
    this.isSmartSearch()
      ? "Ex: entreprise de transport maritime à Pointe-Noire…"
      : "Nom d'entreprise, RCCM, NIU…"
  );

  protected readonly query  = signal('');
  protected readonly sector = signal('');

  protected toggleSmartSearch(): void {
    this.isSmartSearch.update(v => !v);
  }

  // 6 SFD sectors only (audit C2 — strict list)
  protected readonly sectorOptions: ReadonlyArray<SectorOption> = [
    { value: FR.sectors.maritime.slug,    label: FR.sectors.maritime.name },
    { value: FR.sectors.logistique.slug,  label: FR.sectors.logistique.name },
    { value: FR.sectors.douane.slug,      label: FR.sectors.douane.name },
    { value: FR.sectors.industrie.slug,   label: FR.sectors.industrie.name },
    { value: FR.sectors.securite.slug,    label: FR.sectors.securite.name },
    { value: FR.sectors.manutention.slug, label: FR.sectors.manutention.name },
  ];

  private readonly router = inject(Router);

  protected onQueryInput(e: Event): void {
    this.query.set((e.target as HTMLInputElement).value);
  }
  protected onSectorChange(e: Event): void {
    this.sector.set((e.target as HTMLSelectElement).value);
  }

  protected onSubmit(e: Event): void {
    e.preventDefault();
    const queryParams: Record<string, string> = {};
    if (this.isSmartSearch()) {
      if (this.query()) {
        queryParams['smart'] = this.query();
      }
    } else {
      if (this.query())  queryParams['q']       = this.query();
      if (this.sector()) queryParams['secteur'] = this.sector();
    }
    this.router.navigate(['/annuaire'], { queryParams });
  }
}

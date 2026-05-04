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
    <form
      class="bg-surface-container-lowest p-2 rounded-2xl shadow-editorial border border-outline-variant/10 flex flex-col md:flex-row items-stretch md:items-center gap-2 max-w-3xl mx-auto"
      role="search"
      (submit)="onSubmit($event)"
    >
      <div class="flex flex-1 items-center gap-3 px-4">
        <span class="material-symbols-outlined text-outline flex-shrink-0" aria-hidden="true">search</span>
        <input
          type="search"
          [value]="query()"
          (input)="onQueryInput($event)"
          [placeholder]="placeholder()"
          class="w-full bg-transparent border-none focus:ring-0 text-base font-medium text-on-surface placeholder:text-outline py-4"
          [attr.aria-label]="placeholder()"
          autocomplete="off"
        />
      </div>
      <div class="flex items-center gap-2 px-3 flex-wrap md:flex-nowrap">
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
        <button type="submit" class="btn btn-primary py-3 px-8 text-sm" aria-label="Lancer la recherche">
          {{ FR.actions.search }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class PublicSearchBarComponent {
  protected readonly FR = FR;
  protected readonly placeholder = computed(() =>
    'Rechercher par nom d\'entreprise, RCCM, NIU…'
  );

  protected readonly query  = signal('');
  protected readonly sector = signal('');

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
    if (this.query())  queryParams['q']       = this.query();
    if (this.sector()) queryParams['secteur'] = this.sector();
    this.router.navigate(['/annuaire'], { queryParams });
  }
}

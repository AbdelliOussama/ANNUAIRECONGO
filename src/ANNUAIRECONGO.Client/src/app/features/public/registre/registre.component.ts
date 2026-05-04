import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MOCK_COMPANIES } from '@core/services/mock/mock-companies.data';

/**
 * /registre — Registre national consultable.
 * Same data source as /annuaire but presented as a denser table view
 * focused on legal identity (RCCM, NIU, raison sociale, statut).
 *
 * Audit C1: explicit Congo-Brazzaville (RoC) framing.
 */
@Component({
  selector: 'ac-registre',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div class="max-w-5xl mx-auto px-6 md:px-12 text-center">
        <p class="eyebrow mb-4">Registre National</p>
        <h1 class="text-4xl md:text-6xl font-black font-headline tracking-tight mb-6">
          Le registre des entreprises<br />
          <em class="text-primary not-italic">déclarées en République du Congo.</em>
        </h1>
        <p class="text-lg text-secondary leading-relaxed max-w-2xl mx-auto">
          Identité légale, RCCM, NIU et statut administratif des entreprises
          inscrites sur la plateforme officielle.
        </p>
      </div>
    </section>

    <section class="px-6 md:px-12 max-w-7xl mx-auto pb-20">
      <div class="toolbar">
        <input
          type="search"
          class="form-input"
          placeholder="Rechercher par nom, RCCM ou NIU…"
          [value]="query()"
          (input)="onQuery($event)"
          aria-label="Rechercher dans le registre"
        />
      </div>

      <div class="table-wrap">
        <table class="registry" aria-label="Registre national des entreprises">
          <thead>
            <tr>
              <th>Raison sociale</th>
              <th>RCCM</th>
              <th>NIU</th>
              <th>Secteur</th>
              <th>Ville</th>
              <th>Statut</th>
              <th class="sr-only">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (c of rows(); track c.id) {
              <tr>
                <td class="name">
                  <a [routerLink]="['/annuaire', c.slug]">{{ c.name }}</a>
                </td>
                <td class="mono">{{ c.rccm }}</td>
                <td class="mono">{{ c.niu }}</td>
                <td>{{ c.sectorLabel }}</td>
                <td>{{ c.city }}</td>
                <td>
                  @if (c.isVerified) {
                    <span class="badge badge-verified">Vérifiée</span>
                  } @else {
                    <span class="badge badge-pending">En attente</span>
                  }
                </td>
                <td>
                  <a [routerLink]="['/annuaire', c.slug]" class="link" [attr.aria-label]="'Voir la fiche de ' + c.name">
                    Voir
                  </a>
                </td>
              </tr>
            }
            @if (rows().length === 0) {
              <tr>
                <td colspan="7" class="empty">Aucune entreprise ne correspond à votre recherche.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .hero { padding: 96px 0 48px; }
    .toolbar {
      display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px;
    }
    .toolbar .form-input { max-width: 360px; }

    .table-wrap {
      background: var(--color-surface-container-lowest);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-card);
      overflow-x: auto;
    }
    .registry { width: 100%; border-collapse: collapse; font-family: var(--font-body); }
    .registry th, .registry td {
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid var(--color-outline-variant);
      font-size: 13px;
    }
    .registry th {
      background: var(--color-surface-container-low);
      color: var(--color-on-surface);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-size: 11px;
      font-weight: 700;
    }
    .registry tbody tr:last-child td { border-bottom: 0; }
    .registry .name a { color: var(--color-primary); font-weight: 700; }
    .registry .name a:hover { text-decoration: underline; }
    .registry .mono { font-variant-numeric: tabular-nums; color: var(--color-on-surface); }
    .registry .empty { text-align: center; color: var(--color-outline); padding: 32px; }

    .link { color: var(--color-primary); font-weight: 600; }
    .link:hover { text-decoration: underline; }
  `],
})
export class RegistreComponent {
  protected readonly query = signal('');
  private readonly companies = MOCK_COMPANIES;

  protected readonly rows = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.companies;
    return this.companies.filter((c) =>
      [c.name, c.rccm, c.niu].some((v) => v.toLowerCase().includes(q))
    );
  });

  protected onQuery(e: Event): void {
    this.query.set((e.target as HTMLInputElement).value);
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MockAdminService } from '@core/services/mock/mock-admin.service';
import { MockCompany } from '@core/services/mock/mock-companies.data';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';

/**
 * /admin/entreprises — directory of all registered companies.
 * Sortable / searchable table for back-office investigation.
 */
@Component({
  selector: 'ac-admin-entreprises',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SkeletonComponent],
  template: `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">Gestion</p>
        <h1>Entreprises</h1>
        <p class="sub">Toutes les fiches enregistrées sur la plateforme.</p>
      </header>

      <div class="toolbar">
        <input
          type="search"
          class="form-input"
          [value]="query()"
          (input)="onQuery($event)"
          placeholder="Rechercher par nom, RCCM, NIU ou ville…"
          aria-label="Recherche"
        />
      </div>

      @if (loading()) {
        <ac-skeleton shape="card" height="220px" />
      } @else {
        <div class="table-wrap">
          <table aria-label="Liste des entreprises">
            <thead>
              <tr>
                <th>Entreprise</th>
                <th>Secteur</th>
                <th>Ville</th>
                <th>RCCM</th>
                <th>Forfait</th>
                <th>Statut</th>
                <th class="sr-only">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (c of rows(); track c.id) {
                <tr>
                  <td class="name">
                    <p class="title">{{ c.name }}</p>
                    <p class="email">{{ c.email }}</p>
                  </td>
                  <td>{{ c.sectorLabel }}</td>
                  <td>{{ c.city }}</td>
                  <td class="mono">{{ c.rccm }}</td>
                  <td><span [class]="planClass(c.plan)">{{ planLabel(c.plan) }}</span></td>
                  <td>
                    @if (c.isVerified) {
                      <span class="badge badge-verified">Vérifiée</span>
                    } @else {
                      <span class="badge badge-pending">Non vérifiée</span>
                    }
                  </td>
                  <td class="actions-col">
                    <a [routerLink]="['/annuaire', c.slug]" class="link" [attr.aria-label]="'Voir la fiche ' + c.name">Voir →</a>
                  </td>
                </tr>
              }
              @if (rows().length === 0) {
                <tr><td colspan="7" class="empty">Aucune entreprise ne correspond à votre recherche.</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { display: flex; flex-direction: column; gap: 16px; max-width: 1200px; margin: 0 auto; }
    .page-head h1 { font-family: var(--font-headline); font-size: 30px; font-weight: 800; margin: 6px 0 8px; }
    .page-head .sub { color: var(--color-on-secondary-container); font-size: 14px; margin: 0; }

    .toolbar .form-input { max-width: 420px; }

    .table-wrap { background: var(--color-surface-container-lowest); border-radius: var(--radius-2xl); box-shadow: var(--shadow-card); overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-family: var(--font-body); }
    th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid var(--color-outline-variant); font-size: 13px; }
    th { background: var(--color-surface-container-low); text-transform: uppercase; letter-spacing: 0.06em; font-size: 11px; font-weight: 700; }
    tbody tr:last-child td { border-bottom: 0; }
    .mono { font-variant-numeric: tabular-nums; }

    .title { font-weight: 700; color: var(--color-on-surface); margin: 0 0 4px; }
    .email { font-size: 11px; color: var(--color-outline); margin: 0; }
    .empty { text-align: center; color: var(--color-outline); padding: 32px; }
    .actions-col { text-align: right; }
    .link { color: var(--color-primary); font-weight: 700; }
    .link:hover { text-decoration: underline; }

    .badge-free, .badge-pro, .badge-premium {
      display: inline-flex;
      padding: 3px 10px;
      border-radius: var(--radius-full);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .badge-free    { background: var(--color-surface-container-highest); color: var(--color-on-surface-variant); }
    .badge-pro     { background: var(--color-secondary-container);       color: var(--color-on-secondary-fixed); }
    .badge-premium { background: var(--color-tertiary-fixed);            color: var(--color-on-tertiary-fixed); }
  `],
})
export class AdminEntreprisesComponent {
  private readonly admin = inject(MockAdminService);
  protected readonly query = signal('');

  private readonly companies = toSignal(this.admin.companies$(), { initialValue: [] as readonly MockCompany[] });
  protected readonly loading = computed(() => this.companies().length === 0 && this.firstLoad());
  private readonly firstLoad = signal(true);
  constructor() { setTimeout(() => this.firstLoad.set(false), 200); }

  protected readonly rows = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.companies();
    return this.companies().filter((c) =>
      [c.name, c.rccm, c.niu, c.city].some((v) => v.toLowerCase().includes(q))
    );
  });

  protected onQuery(e: Event): void { this.query.set((e.target as HTMLInputElement).value); }

  protected planLabel(p: 'free' | 'pro' | 'premium'): string {
    return ({ free: 'Free', pro: 'Pro', premium: 'Premium' } as const)[p];
  }
  protected planClass(p: 'free' | 'pro' | 'premium'): string {
    return `badge-${p}`;
  }
}

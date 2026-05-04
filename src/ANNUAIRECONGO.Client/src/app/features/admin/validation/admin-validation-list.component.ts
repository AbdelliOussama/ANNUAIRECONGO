import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MockAdminService, PendingFiche } from '@core/services/mock/mock-admin.service';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';

type StatusFilter = 'all' | 'en-attente' | 'validee' | 'rejetee';

/**
 * /admin/validation — list of fiches awaiting / processed validation.
 * Audit M9: every fiche links to the detail page where Reject can collect a motif.
 */
@Component({
  selector: 'ac-admin-validation-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EmptyStateComponent, SkeletonComponent],
  template: `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">Gestion</p>
        <h1>Validation des fiches</h1>
        <p class="sub">Examinez les fiches soumises par les entreprises avant publication sur l'annuaire public.</p>
      </header>

      <div class="toolbar">
        <div class="filters" role="tablist" aria-label="Filtrer par statut">
          @for (f of filters; track f.value) {
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="statusFilter() === f.value"
              [class.is-active]="statusFilter() === f.value"
              (click)="statusFilter.set(f.value)"
            >
              {{ f.label }}
              <span class="count">({{ count(f.value) }})</span>
            </button>
          }
        </div>
      </div>

      @if (loading()) {
        <ac-skeleton shape="card" height="200px" />
      } @else if (visible().length === 0) {
        <ac-empty-state
          icon="inbox"
          title="Aucune fiche dans cette catégorie"
          hint="Changez de filtre ou revenez plus tard."
        />
      } @else {
        <div class="table-wrap">
          <table aria-label="Liste des fiches en validation">
            <thead>
              <tr>
                <th>Entreprise</th>
                <th>Secteur</th>
                <th>Ville</th>
                <th>Soumise par</th>
                <th>Date</th>
                <th>Statut</th>
                <th class="sr-only">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (p of visible(); track p.id) {
                <tr>
                  <td class="name">
                    <p class="title">{{ p.name }}</p>
                    <p class="rccm">RCCM {{ p.rccm }}</p>
                  </td>
                  <td>{{ p.sectorLabel }}</td>
                  <td>{{ p.city }}</td>
                  <td>
                    <p class="owner">{{ p.ownerName }}</p>
                    <p class="email">{{ p.ownerEmail }}</p>
                  </td>
                  <td>{{ p.submittedAt }}</td>
                  <td><span [class]="statusClass(p.status)">{{ statusLabel(p.status) }}</span></td>
                  <td class="actions-col">
                    <a [routerLink]="['/admin/validation', p.id]" class="link" [attr.aria-label]="'Examiner ' + p.name">
                      Examiner →
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { display: flex; flex-direction: column; gap: 20px; max-width: 1200px; margin: 0 auto; }
    .page-head h1 { font-family: var(--font-headline); font-size: 30px; font-weight: 800; margin: 6px 0 8px; }
    .page-head .sub { color: var(--color-on-secondary-container); font-size: 14px; margin: 0; }

    .toolbar { display: flex; flex-wrap: wrap; gap: 12px; }
    .filters {
      display: inline-flex; gap: 4px; padding: 4px;
      background: var(--color-surface-container-low);
      border-radius: var(--radius-md);
    }
    .filters button {
      border: none;
      background: transparent;
      padding: 8px 14px;
      font-family: var(--font-body);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-on-secondary-container);
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: inline-flex;
      gap: 6px;
      align-items: center;
    }
    .filters button.is-active {
      background: var(--color-surface-container-lowest);
      color: var(--color-primary);
      box-shadow: var(--shadow-card);
    }
    .filters .count { color: var(--color-outline); font-size: 11px; font-weight: 600; }

    .table-wrap { background: var(--color-surface-container-lowest); border-radius: var(--radius-2xl); box-shadow: var(--shadow-card); overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-family: var(--font-body); }
    th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid var(--color-outline-variant); font-size: 13px; vertical-align: top; }
    th { background: var(--color-surface-container-low); text-transform: uppercase; letter-spacing: 0.06em; font-size: 11px; font-weight: 700; }
    tbody tr:last-child td { border-bottom: 0; }

    .title { font-weight: 700; color: var(--color-on-surface); margin: 0 0 4px; }
    .rccm { font-size: 11px; color: var(--color-outline); margin: 0; font-variant-numeric: tabular-nums; }
    .owner { font-weight: 600; color: var(--color-on-surface); margin: 0; }
    .email { font-size: 11px; color: var(--color-outline); margin: 0; }

    .status { display: inline-flex; padding: 3px 10px; border-radius: var(--radius-full); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
    .status-en-attente { background: var(--color-tertiary-fixed); color: var(--color-on-tertiary-fixed); }
    .status-validee    { background: var(--color-primary-fixed); color: var(--color-on-primary-fixed); }
    .status-rejetee    { background: var(--color-error-container); color: var(--color-on-error-container); }

    .actions-col { text-align: right; }
    .link { color: var(--color-primary); font-weight: 700; }
    .link:hover { text-decoration: underline; }
  `],
})
export class AdminValidationListComponent {
  private readonly admin = inject(MockAdminService);
  protected readonly statusFilter = signal<StatusFilter>('en-attente');

  protected readonly filters: ReadonlyArray<{ value: StatusFilter; label: string }> = [
    { value: 'all',         label: 'Tous'        },
    { value: 'en-attente',  label: 'En attente'  },
    { value: 'validee',     label: 'Validées'    },
    { value: 'rejetee',     label: 'Refusées'    },
  ];

  private readonly all = toSignal(this.admin.pendingList$(), { initialValue: [] as PendingFiche[] });
  protected readonly loading = computed(() => this.all().length === 0 && this.firstLoad());
  private readonly firstLoad = signal(true);

  constructor() {
    // Once the first emission is in, mark loading as done.
    setTimeout(() => this.firstLoad.set(false), 200);
  }

  protected readonly visible = computed(() => {
    const f = this.statusFilter();
    return f === 'all' ? this.all() : this.all().filter((p) => p.status === f);
  });

  protected count(filter: StatusFilter): number {
    return filter === 'all' ? this.all().length : this.all().filter((p) => p.status === filter).length;
  }

  protected statusLabel(s: string): string {
    return ({
      'en-attente': 'En attente',
      validee:      'Validée',
      rejetee:      'Refusée',
    } as Record<string, string>)[s] ?? s;
  }
  protected statusClass(s: string): string {
    return `status status-${s}`;
  }
}

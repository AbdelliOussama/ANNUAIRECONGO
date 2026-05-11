import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CompanyService } from '@core/services/company.service';
import { CompanyStatus, PaginatedResponse, Company } from '@core/models/company.model';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { DatePipe } from '@angular/common';

type StatusFilter = 'all' | 'en-attente' | 'validee' | 'rejetee';

@Component({
  selector: 'ac-admin-validation-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EmptyStateComponent, SkeletonComponent, DatePipe],
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
                <th>Propriétaire ID</th>
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
                  </td>
                  <td>{{ p.submittedAt | date:'dd/MM/yyyy' }}</td>
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
  private readonly companyService = inject(CompanyService);
  protected readonly statusFilter = signal<StatusFilter>('en-attente');

  protected readonly filters: ReadonlyArray<{ value: StatusFilter; label: string }> = [
    { value: 'all',         label: 'Tous'        },
    { value: 'en-attente',  label: 'En attente'  },
    { value: 'validee',     label: 'Validées'    },
    { value: 'rejetee',     label: 'Refusées'    },
  ];

  private readonly companiesPage = toSignal(
    this.companyService.getCompanies({ pageSize: 1000 }), 
    { initialValue: { items: [], pageNumber: 1, pageSize: 1000, totalCount: 0, totalPages: 0 } as PaginatedResponse<Company> }
  );

  protected readonly loading = computed(() => this.companiesPage().items.length === 0 && this.firstLoad());
  private readonly firstLoad = signal(true);

  constructor() {
    setTimeout(() => this.firstLoad.set(false), 500);
  }

  protected readonly visible = computed(() => {
    const f = this.statusFilter();
    const all = this.allCompanies();
    return f === 'all' ? all : all.filter((p) => p.status === f);
  });

  private readonly allCompanies = computed(() => {
    const items = this.companiesPage()?.items || [];
    return items.map(c => ({
      id: c.id,
      name: c.name,
      rccm: c.rccm || 'N/A',
      sectorLabel: c.sectors?.[0]?.name || 'N/A',
      city: c.cityName || 'N/A',
      ownerName: c.ownerName || 'N/A',
      submittedAt: c.submittedAt || c.createdAt,
      status: this.mapStatus(c.status)
    }));
  });

  private mapStatus(status: number): string {
    switch (status) {
      case 1: return 'en-attente';
      case 2: return 'validee';
      case 3: return 'rejetee';
      default: return 'en-attente';
    }
  }

  protected count(filter: StatusFilter): number {
    const all = this.allCompanies();
    return filter === 'all' ? all.length : all.filter((p) => p.status === filter).length;
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

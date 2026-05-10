import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CompanyService } from '@core/services/company.service';
import { Company, PaginatedResponse } from '@core/models/company.model';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { BehaviorSubject, switchMap, catchError, of, debounceTime } from 'rxjs';

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
                <th>Statut</th>
                <th class="sr-only">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (c of rows(); track c.id) {
                <tr>
                  <td class="name">
                    <p class="title">{{ c.name }}</p>
                    <p class="email">{{ c.slug }}</p>
                  </td>
                  <td>{{ c.sectors?.[0]?.name || 'N/A' }}</td>
                  <td>{{ c.cityName }}</td>
                  <td class="mono">{{ c.rccm || '-' }}</td>
                  <td>
                    @if (c.status === 2) {
                      <span class="badge badge-verified">Active</span>
                    } @else if (c.status === 1) {
                      <span class="badge badge-pending">En attente</span>
                    } @else if (c.status === 3) {
                      <span class="badge badge-rejected">Rejetée</span>
                    } @else {
                      <span class="badge badge-draft">Brouillon</span>
                    }
                  </td>
                  <td class="actions-col">
                    <a [routerLink]="['/annuaire', c.slug]" class="link" [attr.aria-label]="'Voir la fiche ' + c.name">Voir →</a>
                  </td>
                </tr>
              }
              @if (rows().length === 0) {
                <tr><td colspan="6" class="empty">Aucune entreprise ne correspond à votre recherche.</td></tr>
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

    .badge-draft { background: var(--color-surface-container-highest); color: var(--color-on-surface-variant); }
    .badge-rejected { background: var(--color-error-container); color: var(--color-on-error-container); }
  `],
})
export class AdminEntreprisesComponent {
  private readonly companyService = inject(CompanyService);
  protected readonly query = signal('');
  
  private readonly trigger = new BehaviorSubject<string>('');
  
  private readonly result = toSignal<PaginatedResponse<Company> | null>(
    this.trigger.pipe(
      debounceTime(300),
      switchMap(q => this.companyService.getCompanies({ searchTerm: q || undefined, pageSize: 50 })),
      catchError(() => of({ items: [] as Company[], totalCount: 0, pageNumber: 1, pageSize: 50, totalPages: 0 } as PaginatedResponse<Company>))
    ),
    { initialValue: null }
  );

  protected readonly rows = computed(() => this.result()?.items ?? []);
  protected readonly loading = computed(() => this.result() === null && this.query() === '');

  protected onQuery(e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    this.query.set(val);
    this.trigger.next(val);
  }
}

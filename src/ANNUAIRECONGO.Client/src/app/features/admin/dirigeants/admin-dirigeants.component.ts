import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AdminService } from '@core/services/admin.service';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { PaginatedResponse } from '@core/models/company.model';

interface DirigeantRow {
  fullName: string;
  email: string;
  position: string;
  companyName?: string;
  status: string;
}

@Component({
  selector: 'ac-admin-dirigeants',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonComponent],
  template: `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">Gestion</p>
        <h1>Dirigeants</h1>
        <p class="sub">Tous les responsables d'entreprises inscrits sur la plateforme.</p>
      </header>

      <div class="toolbar">
        <input
          type="search"
          class="form-input"
          [value]="query()"
          (input)="onQuery($event)"
          placeholder="Rechercher par nom, e-mail ou entreprise…"
          aria-label="Recherche"
        />
      </div>

      @if (loading()) {
        <ac-skeleton shape="card" height="180px" />
      } @else {
        <div class="table-wrap">
          <table aria-label="Liste des dirigeants">
            <thead>
              <tr>
                <th>Nom complet</th>
                <th>E-mail</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              @for (r of rows(); track r.email) {
                <tr>
                  <td class="name">{{ r.fullName }}</td>
                  <td class="email">{{ r.email }}</td>
                  <td>
                    @if (r.status === 'Active') {
                      <span class="badge badge-verified">Actif</span>
                    } @else {
                      <span class="badge badge-pending">{{ r.status }}</span>
                    }
                  </td>
                </tr>
              }
              @if (rows().length === 0) {
                <tr><td colspan="3" class="empty">Aucun dirigeant ne correspond à votre recherche.</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { display: flex; flex-direction: column; gap: 16px; max-width: 1100px; margin: 0 auto; }
    .page-head h1 { font-family: var(--font-headline); font-size: 30px; font-weight: 800; margin: 6px 0 8px; }
    .page-head .sub { color: var(--color-on-secondary-container); font-size: 14px; margin: 0; }

    .toolbar .form-input { max-width: 420px; }
    .table-wrap { background: var(--color-surface-container-lowest); border-radius: var(--radius-2xl); box-shadow: var(--shadow-card); overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-family: var(--font-body); }
    th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid var(--color-outline-variant); font-size: 13px; }
    th { background: var(--color-surface-container-low); text-transform: uppercase; letter-spacing: 0.06em; font-size: 11px; font-weight: 700; }
    tbody tr:last-child td { border-bottom: 0; }
    .name { font-weight: 700; color: var(--color-on-surface); }
    .email { color: var(--color-on-secondary-container); }
    .empty { text-align: center; color: var(--color-outline); padding: 32px; }
  `],
})
export class AdminDirigeantsComponent {
  private readonly adminService = inject(AdminService);
  protected readonly query = signal('');

  private readonly users = toSignal(this.adminService.getUsers(), { 
    initialValue: [] as any[] 
  });
  
  protected readonly loading = computed(() => this.users().length === 0 && this.query() === '');

  protected readonly rows = computed<DirigeantRow[]>(() => {
    const q = this.query().trim().toLowerCase();
    const items = this.users();
    return items
      .map((u: any) => ({ 
        fullName: u.fullName, 
        email: u.email, 
        position: u.companyPosition || 'Responsable', 
        status: 'Active' 
      }))
      .filter((r: any) => !q || [r.fullName, r.email].some((v) => (v || '').toLowerCase().includes(q)));
  });

  protected onQuery(e: Event): void { this.query.set((e.target as HTMLInputElement).value); }
}


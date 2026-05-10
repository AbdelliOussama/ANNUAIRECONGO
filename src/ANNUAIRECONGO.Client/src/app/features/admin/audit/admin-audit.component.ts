import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AdminService } from '@core/services/admin.service';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'ac-admin-audit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonComponent, DatePipe],
  template: `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">Sécurité</p>
        <h1>Journal d'audit</h1>
        <p class="sub">Trace immuable des actions sensibles effectuées sur la plateforme.</p>
      </header>

      <div class="toolbar">
        <input
          type="search"
          class="form-input"
          [value]="query()"
          (input)="onQuery($event)"
          placeholder="Rechercher par acteur, action ou cible…"
          aria-label="Recherche dans le journal"
        />
      </div>

      @if (loading()) {
        <ac-skeleton shape="card" height="240px" />
      } @else {
        <div class="table-wrap">
          <table aria-label="Journal d'audit">
            <thead>
              <tr>
                <th>Date</th>
                <th>Acteur</th>
                <th>Action</th>
                <th>Cible</th>
              </tr>
            </thead>
            <tbody>
              @for (e of rows(); track e.id) {
                <tr>
                  <td class="mono">{{ e.timestamp | date:'short' }}</td>
                  <td>
                    <p class="actor">{{ e.actorName }}</p>
                    <p class="role">{{ e.actorId }}</p>
                  </td>
                  <td>{{ e.action }}</td>
                  <td class="target">{{ e.entityName }} ({{ e.entityId }})</td>
                </tr>
              }
              @if (rows().length === 0) {
                <tr><td colspan="4" class="empty">Aucune entrée ne correspond à ce filtre.</td></tr>
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
    th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid var(--color-outline-variant); font-size: 13px; vertical-align: top; }
    th { background: var(--color-surface-container-low); text-transform: uppercase; letter-spacing: 0.06em; font-size: 11px; font-weight: 700; }
    tbody tr:last-child td { border-bottom: 0; }

    .mono { font-variant-numeric: tabular-nums; }
    .actor { font-weight: 700; color: var(--color-on-surface); margin: 0; }
    .role  { font-size: 11px; color: var(--color-outline); margin: 4px 0 0; text-transform: uppercase; letter-spacing: 0.06em; }
    .target { color: var(--color-on-surface); }
    .empty { text-align: center; color: var(--color-outline); padding: 32px; }
  `],
})
export class AdminAuditComponent {
  private readonly adminService = inject(AdminService);
  protected readonly query = signal('');

  private readonly entries = toSignal(this.adminService.getAuditLogs(1, 100), { initialValue: { items: [] as any[] } });
  protected readonly loading = computed(() => this.entries().items.length === 0 && this.query() === '');

  protected readonly rows = computed(() => {
    const q = this.query().trim().toLowerCase();
    const items = this.entries().items;
    if (!q) return items;
    return items.filter((e: any) =>
      [e.actorName, e.action, e.entityName].some((v) => v?.toLowerCase().includes(q))
    );
  });

  protected onQuery(e: Event): void { this.query.set((e.target as HTMLInputElement).value); }
}

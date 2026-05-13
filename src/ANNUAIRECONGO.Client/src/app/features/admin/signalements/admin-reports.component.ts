import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AdminService } from '@core/services/admin.service';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { DatePipe } from '@angular/common';
import { switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'ac-admin-reports',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonComponent, DatePipe],
  template: `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">Modération</p>
        <h1>Signalements</h1>
        <p class="sub">Gérer les entreprises signalées par les utilisateurs.</p>
      </header>

      @if (loading()) {
        <ac-skeleton shape="card" height="240px" />
      } @else {
        <div class="table-wrap">
          <table aria-label="Signalements">
            <thead>
              <tr>
                <th>Date</th>
                <th>Entreprise</th>
                <th>Motif</th>
                <th>IP</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (r of rows(); track r.id) {
                <tr>
                  <td class="mono">{{ r.createdAt | date:'short' }}</td>
                  <td class="actor">{{ r.companyName }}</td>
                  <td>{{ r.reason }}</td>
                  <td class="mono">{{ r.reporterIp }}</td>
                  <td>
                    @if (r.status === 0) { <span class="badge warning">En attente</span> }
                    @if (r.status === 1) { <span class="badge success">Examiné</span> }
                    @if (r.status === 2) { <span class="badge neutral">Rejeté</span> }
                  </td>
                  <td>
                    @if (r.status === 0) {
                      <div class="actions">
                        <button class="btn-sm action-btn primary" (click)="process(r.id, false)">Accepter</button>
                        <button class="btn-sm action-btn outline" (click)="process(r.id, true)">Rejeter</button>
                      </div>
                    }
                  </td>
                </tr>
              }
              @if (rows().length === 0) {
                <tr><td colspan="6" class="empty">Aucun signalement trouvé.</td></tr>
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

    .table-wrap { background: var(--color-surface-container-lowest); border-radius: var(--radius-2xl); box-shadow: var(--shadow-card); overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-family: var(--font-body); }
    th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid var(--color-outline-variant); font-size: 13px; vertical-align: top; }
    th { background: var(--color-surface-container-low); text-transform: uppercase; letter-spacing: 0.06em; font-size: 11px; font-weight: 700; }
    tbody tr:last-child td { border-bottom: 0; }

    .mono { font-variant-numeric: tabular-nums; }
    .actor { font-weight: 700; color: var(--color-on-surface); }
    .empty { text-align: center; color: var(--color-outline); padding: 32px; }
    
    .badge { display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge.warning { background: #fff3cd; color: #856404; }
    .badge.success { background: #d4edda; color: #155724; }
    .badge.neutral { background: #e2e3e5; color: #383d41; }

    .actions { display: flex; gap: 8px; }
    .action-btn { padding: 4px 8px; font-size: 12px; border-radius: 4px; cursor: pointer; border: none; font-weight: 600; }
    .action-btn.primary { background: var(--color-primary); color: white; }
    .action-btn.outline { background: transparent; border: 1px solid var(--color-outline); color: var(--color-on-surface); }
  `],
})
export class AdminReportsComponent {
  private readonly adminService = inject(AdminService);
  private readonly refreshTrigger = new BehaviorSubject<void>(undefined);
  
  private readonly entries$ = this.refreshTrigger.pipe(
    switchMap(() => this.adminService.getReports(1, 100))
  );

  protected readonly entries = toSignal(this.entries$, { 
    initialValue: { items: [], pageNumber: 1, pageSize: 20, totalCount: 0, totalPages: 0 } as any 
  });
  protected readonly loading = computed(() => {
    const data = this.entries();
    return data && data.items && data.items.length === 0 && !data.totalCount;
  });
  protected readonly rows = computed(() => {
    const data = this.entries();
    return data && data.items ? data.items : [];
  });

  process(id: string, dismiss: boolean) {
    this.adminService.processReport(id, dismiss).subscribe({
      next: () => this.refreshTrigger.next(),
      error: (err) => console.error('Failed to process report', err)
    });
  }
}

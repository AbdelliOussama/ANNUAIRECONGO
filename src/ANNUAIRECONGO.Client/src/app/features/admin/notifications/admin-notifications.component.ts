import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MockAdminService, AdminNotification } from '@core/services/mock/mock-admin.service';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';

/** /admin/notifications — admin inbox (read-only for now). */
@Component({
  selector: 'ac-admin-notifications',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent, SkeletonComponent],
  template: `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">Boîte de réception</p>
        <h1>Notifications administrateur</h1>
        <p class="sub">Activité système, alertes et signalements à traiter.</p>
      </header>

      @if (loading()) {
        <ac-skeleton shape="card" height="180px" />
      } @else if (items().length === 0) {
        <ac-empty-state icon="notifications_off" title="Aucune notification" hint="Tout est calme pour l'instant." />
      } @else {
        <ul class="list">
          @for (n of items(); track n.id) {
            <li [class]="'item tone-' + n.tone" [class.is-unread]="!n.isRead">
              <div class="dot" aria-hidden="true">
                <span class="material-symbols-outlined icon-filled">{{ icon(n.tone) }}</span>
              </div>
              <div class="body">
                <div class="head-row">
                  <p class="title">{{ n.title }}</p>
                  <span class="date">{{ n.createdAt }}</span>
                </div>
                <p class="text">{{ n.body }}</p>
              </div>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { display: flex; flex-direction: column; gap: 16px; max-width: 920px; margin: 0 auto; }
    .page-head h1 { font-family: var(--font-headline); font-size: 30px; font-weight: 800; margin: 6px 0 8px; }
    .page-head .sub { color: var(--color-on-secondary-container); font-size: 14px; margin: 0; }

    .list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .item {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 14px;
      padding: 16px;
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-xl);
    }
    .item.is-unread { background: rgba(0, 78, 52, 0.04); border-color: rgba(0, 78, 52, 0.18); }
    .dot { width: 40px; height: 40px; border-radius: var(--radius-md); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .tone-success .dot { background: var(--color-primary-fixed); color: var(--color-on-primary-fixed); }
    .tone-info    .dot { background: var(--color-secondary-container); color: var(--color-on-secondary-fixed); }
    .tone-warning .dot { background: var(--color-tertiary-fixed); color: var(--color-on-tertiary-fixed); }
    .tone-error   .dot { background: var(--color-error-container); color: var(--color-on-error-container); }

    .head-row { display: flex; gap: 12px; justify-content: space-between; align-items: baseline; }
    .title { font-size: 15px; font-weight: 700; color: var(--color-on-surface); margin: 0; }
    .date { font-size: 11px; color: var(--color-outline); white-space: nowrap; }
    .text { font-size: 13px; color: var(--color-on-surface-variant); margin: 4px 0 0; line-height: 1.55; }
  `],
})
export class AdminNotificationsComponent {
  private readonly admin = inject(MockAdminService);
  protected readonly items = toSignal(this.admin.notifications$(), { initialValue: [] as AdminNotification[] });
  protected readonly loading = computed(() => this.items().length === 0);

  protected icon(tone: AdminNotification['tone']): string {
    return ({ success: 'check_circle', info: 'info', warning: 'warning', error: 'error' } as const)[tone];
  }
}

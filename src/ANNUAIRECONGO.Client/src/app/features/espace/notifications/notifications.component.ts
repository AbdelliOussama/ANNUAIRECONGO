import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MockEspaceService, MockNotification } from '@core/services/mock/mock-espace.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { ToastService } from '@shared/services/toast.service';
import { FR } from '@core/i18n/fr.constants';

/**
 * /espace/notifications — notification center for the entreprise owner.
 */
@Component({
  selector: 'ac-espace-notifications',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ButtonComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <p class="eyebrow">Activité</p>
          <h1>Mes notifications</h1>
          <p class="sub">{{ unreadCount() }} non lue(s) sur {{ items().length }} au total.</p>
        </div>

        @if (items().length > 0 && unreadCount() > 0) {
          <ac-button variant="outline" iconLeft="done_all" (click)="markAllRead()">
            Tout marquer comme lu
          </ac-button>
        }
      </header>

      @if (items().length === 0) {
        <ac-empty-state
          icon="notifications_off"
          [title]="FR.emptyState.noNotifications"
          hint="Vous serez notifié ici lors des validations, paiements et messages reçus."
        >
          <a routerLink="/espace" class="btn btn-primary">Retour à mon espace</a>
        </ac-empty-state>
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
                @if (n.link) {
                  <a [routerLink]="n.link" class="link">Voir le détail</a>
                }
              </div>
              @if (!n.isRead) {
                <button type="button" class="mark" (click)="markRead(n)" aria-label="Marquer comme lu">
                  <span class="material-symbols-outlined" aria-hidden="true">done</span>
                </button>
              }
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { max-width: 920px; margin: 0 auto; padding: 8px 4px 32px; display: flex; flex-direction: column; gap: 24px; }
    .page-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .page-head h1 { font-family: var(--font-headline); font-size: 30px; font-weight: 800; margin: 6px 0 4px; }
    .page-head .sub { color: var(--color-on-secondary-container); font-size: 14px; margin: 0; }

    .list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .item {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 16px;
      padding: 16px 18px;
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-xl);
      transition: background 0.15s, border-color 0.15s;
    }
    .item.is-unread { background: rgba(0, 78, 52, 0.04); border-color: rgba(0, 78, 52, 0.18); }

    .dot {
      width: 40px; height: 40px;
      border-radius: var(--radius-md);
      display: inline-flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .tone-success .dot { background: var(--color-primary-fixed); color: var(--color-on-primary-fixed); }
    .tone-info    .dot { background: var(--color-secondary-container); color: var(--color-on-secondary-fixed); }
    .tone-warning .dot { background: var(--color-tertiary-fixed); color: var(--color-on-tertiary-fixed); }
    .tone-error   .dot { background: var(--color-error-container); color: var(--color-on-error-container); }

    .body { min-width: 0; }
    .head-row { display: flex; gap: 12px; justify-content: space-between; align-items: baseline; }
    .title { font-size: 15px; font-weight: 700; color: var(--color-on-surface); margin: 0; }
    .date { font-size: 11px; color: var(--color-outline); white-space: nowrap; }
    .text { font-size: 13px; color: var(--color-on-surface-variant); margin: 4px 0; line-height: 1.55; }
    .link { color: var(--color-primary); font-weight: 700; font-size: 13px; }
    .link:hover { text-decoration: underline; }

    .mark {
      width: 36px; height: 36px;
      border: none;
      background: var(--color-surface-container);
      color: var(--color-primary);
      border-radius: var(--radius-md);
      cursor: pointer;
      align-self: center;
    }
    .mark:hover { background: var(--color-surface-container-high); }
  `],
})
export class EspaceNotificationsComponent {
  protected readonly FR = FR;
  private readonly espace = inject(MockEspaceService);
  private readonly toast  = inject(ToastService);

  protected readonly items = signal<MockNotification[]>([]);

  // Hydrate once on activation.
  private readonly initial = toSignal(this.espace.notifications$(), { initialValue: undefined });
  // Sync the initial result into our writable signal so we can mutate locally.
  private readonly _ = computed(() => {
    const v = this.initial();
    if (v && this.items().length === 0) this.items.set([...v]);
    return null;
  });
  constructor() { this._(); }

  protected readonly unreadCount = computed(() => this.items().filter((n) => !n.isRead).length);

  protected icon(tone: 'success' | 'info' | 'warning' | 'error'): string {
    return ({
      success: 'check_circle',
      info:    'info',
      warning: 'warning',
      error:   'error',
    } as const)[tone];
  }

  protected markRead(n: MockNotification): void {
    this.espace.markRead(n.id).subscribe(() => {
      this.items.update((list) => list.map((x) => x.id === n.id ? { ...x, isRead: true } : x));
    });
  }

  protected markAllRead(): void {
    this.espace.markAllRead().subscribe(() => {
      this.items.update((list) => list.map((x) => ({ ...x, isRead: true })));
      this.toast.success('Toutes les notifications ont été marquées comme lues.');
    });
  }
}

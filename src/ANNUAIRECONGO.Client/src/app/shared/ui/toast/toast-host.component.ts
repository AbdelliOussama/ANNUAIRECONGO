import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ToastService, ToastTone } from '../../services/toast.service';

/**
 * <ac-toast-host> — single instance mounted near the root layout.
 * The actual toast queue lives on ToastService.
 *
 * Drop one of these inside each top-level layout (public, auth, espace, admin)
 * so toasts are available app-wide.
 */
@Component({
  selector: 'ac-toast-host',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="toast-container" aria-live="polite" aria-atomic="false">
      @for (t of toasts(); track t.id) {
        <div [class]="toastClass(t.tone)" role="alert">
          <span class="toast-icon">
            <span class="material-symbols-outlined icon-filled" aria-hidden="true">{{ icon(t.tone) }}</span>
          </span>
          <span class="flex-1">{{ t.message }}</span>
          <button
            type="button"
            class="text-outline hover:text-on-surface ml-2"
            aria-label="Fermer la notification"
            (click)="toastService.dismiss(t.id)"
          >
            <span class="material-symbols-outlined text-base" aria-hidden="true">close</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: contents; }
    .flex-1 { flex: 1; }
    /* The .toast and .toast-* classes come from styles/_components.scss */
    /* Toasts here are rendered with the .show state since the queue
       only holds visible toasts. */
    .toast { transform: translateX(0); opacity: 1; }
  `],
})
export class ToastHostComponent {
  protected readonly toastService = inject(ToastService);
  protected readonly toasts = this.toastService.toasts;

  protected toastClass(tone: ToastTone): string {
    return `toast toast-${tone} show`;
  }

  protected icon(tone: ToastTone): string {
    switch (tone) {
      case 'success': return 'check_circle';
      case 'error':   return 'error';
      case 'warning': return 'warning';
      default:        return 'info';
    }
  }
}

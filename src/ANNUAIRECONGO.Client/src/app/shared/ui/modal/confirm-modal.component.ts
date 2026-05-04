import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { ModalRef } from './modal-ref';

export type ModalTone = 'info' | 'confirm' | 'danger';

export interface ConfirmModalData {
  title: string;
  body?: string;
  tone?: ModalTone;
  confirmLabel?: string;
  cancelLabel?: string;
  /** When provided, shows a textarea for an explanatory reason (e.g. rejet motif). */
  reasonLabel?: string;
  reasonRequired?: boolean;
}

/**
 * Default content rendered by ModalService.confirm(). Resolves to
 *   { confirmed: boolean; reason?: string }
 *
 * For richer modals, pass your own component to ModalService.open()
 * and inject ModalRef in it to close with a custom payload.
 */
@Component({
  selector: 'ac-confirm-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    <div class="modal-overlay open" (click)="onBackdrop($event)">
      <div class="modal-card" role="dialog" aria-modal="true" [attr.aria-labelledby]="titleId" (click)="$event.stopPropagation()">
        <h2 [id]="titleId" class="modal-title">{{ data().title }}</h2>
        @if (data().body) {
          <p class="modal-body">{{ data().body }}</p>
        }

        @if (data().reasonLabel) {
          <div class="form-group mb-4">
            <label class="form-label" [attr.for]="reasonId">{{ data().reasonLabel }}</label>
            <textarea
              [id]="reasonId"
              class="form-input"
              rows="3"
              [value]="reason()"
              (input)="onReasonInput($event)"
              [attr.aria-required]="data().reasonRequired || null"
            ></textarea>
          </div>
        }

        <div class="modal-actions">
          <ac-button variant="ghost" (click)="cancel()">
            {{ data().cancelLabel || 'Annuler' }}
          </ac-button>
          <ac-button [variant]="data().tone === 'danger' ? 'danger' : 'primary'"
                     [disabled]="!canConfirm()"
                     (click)="confirm()">
            {{ data().confirmLabel || 'Confirmer' }}
          </ac-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mb-4 { margin-bottom: 16px; }
    textarea.form-input { font-family: var(--font-body); resize: vertical; min-height: 80px; }
  `],
})
export class ConfirmModalComponent {
  protected readonly modalRef = inject<ModalRef<{ confirmed: boolean; reason?: string }>>(ModalRef);
  readonly data = input.required<ConfirmModalData>();

  readonly titleId = `confirm-${Math.random().toString(36).slice(2, 8)}`;
  readonly reasonId = `${this.titleId}-reason`;

  protected readonly reason = signal('');
  protected readonly canConfirm = computed(() => {
    if (this.data().reasonRequired) {
      return this.reason().trim().length > 0;
    }
    return true;
  });

  protected onReasonInput(event: Event): void {
    this.reason.set((event.target as HTMLTextAreaElement).value);
  }

  protected confirm(): void {
    this.modalRef.close({ confirmed: true, reason: this.reason() || undefined });
  }
  protected cancel(): void {
    this.modalRef.close({ confirmed: false });
  }
  protected onBackdrop(_e: MouseEvent): void {
    this.cancel();
  }
}

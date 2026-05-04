import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type PaymentMethod = 'mtn' | 'airtel' | 'stripe';

interface MethodView {
  id: PaymentMethod;
  label: string;
  icon: string;
  background: string;
  color: string;
}

/**
 * <ac-payment-method-strip> — visual list of accepted payment methods.
 * Audit M7: Stripe must appear on tarifs alongside MTN MoMo and Airtel.
 *
 *   <ac-payment-method-strip [methods]="['mtn', 'airtel', 'stripe']" />
 */
@Component({
  selector: 'ac-payment-method-strip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="strip" role="list" aria-label="Moyens de paiement acceptés">
      @for (m of visibleMethods(); track m.id) {
        <div class="method" role="listitem">
          <div class="badge-icon" [style.background]="m.background" [style.color]="m.color" aria-hidden="true">
            <span class="material-symbols-outlined">{{ m.icon }}</span>
          </div>
          <span class="label">{{ m.label }}</span>
        </div>
      }
    </div>
    @if (caption()) {
      <p class="caption">{{ caption() }}</p>
    }
  `,
  styles: [`
    :host { display: block; }
    .strip {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
    }
    .method {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 14px;
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-full);
    }
    .badge-icon {
      width: 28px; height: 28px;
      border-radius: var(--radius-full);
      display: inline-flex; align-items: center; justify-content: center;
    }
    .badge-icon .material-symbols-outlined { font-size: 16px; }
    .label {
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 600;
      color: var(--color-on-surface);
    }
    .caption {
      margin-top: 12px;
      font-size: 12px;
      color: var(--color-on-surface-variant);
    }
  `],
})
export class PaymentMethodStripComponent {
  readonly methods = input<PaymentMethod[]>(['mtn', 'airtel', 'stripe']);
  readonly caption = input<string | null>('Paiement sécurisé. Activation immédiate.');

  private readonly catalog: Record<PaymentMethod, MethodView> = {
    mtn:    { id: 'mtn',    label: 'MTN Mobile Money',         icon: 'smartphone',  background: '#fff3c4', color: '#7a5800' },
    airtel: { id: 'airtel', label: 'Airtel Money',             icon: 'smartphone',  background: '#ffd6d4', color: '#9b1a14' },
    stripe: { id: 'stripe', label: 'Carte bancaire (Stripe)',  icon: 'credit_card', background: '#d5e3fc', color: '#0d3a8a' },
  };

  protected readonly visibleMethods = () => this.methods().map((m) => this.catalog[m]);
}

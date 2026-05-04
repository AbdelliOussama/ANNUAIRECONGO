import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface StepDescriptor {
  id: string;
  label: string;
}

/**
 * <ac-stepper> — visual step indicator for multi-step forms (inscription,
 * creer-entreprise, paiement). Display only — the parent form decides which
 * step is active and whether each step is reachable.
 *
 *   <ac-stepper [steps]="steps" [activeIndex]="0" />
 */
@Component({
  selector: 'ac-stepper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol class="stepper" [attr.aria-label]="ariaLabel()">
      @for (step of steps(); track step.id; let i = $index) {
        <li class="step" [class.is-active]="i === activeIndex()" [class.is-done]="i < activeIndex()">
          <span class="step-number" [attr.aria-current]="i === activeIndex() ? 'step' : null">
            @if (i < activeIndex()) {
              <span class="material-symbols-outlined" aria-hidden="true">check</span>
            } @else {
              {{ i + 1 }}
            }
          </span>
          <span class="step-label">{{ step.label }}</span>
        </li>
        @if (i < steps().length - 1) {
          <li class="step-connector" aria-hidden="true"></li>
        }
      }
    </ol>
  `,
  styles: [`
    :host { display: block; }
    .stepper {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .step {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--color-outline);
      font-family: var(--font-body);
    }
    .step.is-active { color: var(--color-primary); font-weight: 700; }
    .step.is-done   { color: var(--color-primary); }
    .step-number {
      width: 28px;
      height: 28px;
      border-radius: var(--radius-full);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--color-surface-container-high);
      color: var(--color-outline);
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .step.is-active .step-number {
      background: var(--color-primary);
      color: var(--color-on-primary);
    }
    .step.is-done .step-number {
      background: var(--color-primary-fixed);
      color: var(--color-on-primary-fixed);
    }
    .step-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .step-connector {
      width: 48px;
      height: 2px;
      background: var(--color-outline-variant);
      flex-shrink: 0;
    }
    @media (max-width: 640px) {
      .step-label { display: none; }
      .step-connector { width: 24px; }
    }
  `],
})
export class StepperComponent {
  readonly steps       = input.required<StepDescriptor[]>();
  readonly activeIndex = input<number>(0);
  readonly ariaLabel   = input<string>('Étapes');
}

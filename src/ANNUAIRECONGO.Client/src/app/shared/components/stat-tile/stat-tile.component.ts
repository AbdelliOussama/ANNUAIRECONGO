import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * <ac-stat-tile> — large numeric or short-text stat with label + helper line.
 * Used in the accueil stats row and the trust-band figure list.
 */
@Component({
  selector: 'ac-stat-tile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stat">
      <span class="figure" [attr.aria-label]="ariaLabel() || null">{{ value() }}</span>
      <span class="label">{{ label() }}</span>
      @if (description()) {
        <p class="description">{{ description() }}</p>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .stat { display: flex; flex-direction: column; }
    .figure {
      font-family: var(--font-headline);
      font-size: 48px;
      font-weight: 900;
      letter-spacing: -0.02em;
      color: var(--color-primary);
      line-height: 1;
    }
    .label {
      margin-top: 8px;
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-on-secondary-container);
    }
    .description {
      margin-top: 12px;
      font-size: 14px;
      line-height: 1.55;
      color: var(--color-on-surface-variant);
      max-width: 320px;
    }
  `],
})
export class StatTileComponent {
  readonly value       = input.required<string>();
  readonly label       = input.required<string>();
  readonly description = input<string | null>(null);
  readonly ariaLabel   = input<string | null>(null);
}

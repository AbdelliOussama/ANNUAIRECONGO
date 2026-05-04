import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeVariant =
  | 'verified'
  | 'premium'
  | 'pro'
  | 'free'
  | 'pending'
  | 'rejected'
  | 'neutral';

/**
 * <ac-badge> — small status pill.
 *
 * Variants map directly to the CSS classes defined in styles/_components.scss
 * (.badge-verified, .badge-premium, etc.).
 */
@Component({
  selector: 'ac-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="className()">
      @if (icon()) {
        <span class="material-symbols-outlined icon-filled" aria-hidden="true" style="font-size:12px">{{ icon() }}</span>
      }
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }
  `],
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('neutral');
  readonly icon    = input<string | null>(null);

  protected readonly className = computed(() => {
    const map: Record<BadgeVariant, string> = {
      verified: 'badge badge-verified',
      premium:  'badge badge-premium',
      pro:      'badge badge-pro',
      free:     'badge badge-free',
      pending:  'badge badge-pending',
      rejected: 'badge badge-pending',
      neutral:  'badge badge-free',
    };
    return map[this.variant()];
  });
}

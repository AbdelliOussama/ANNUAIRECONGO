import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type SkeletonShape = 'text' | 'rect' | 'circle' | 'card';

/**
 * <ac-skeleton> — animated placeholder used while data loads.
 *
 *   <ac-skeleton shape="text" />
 *   <ac-skeleton shape="card" height="140px" />
 *   <ac-skeleton shape="circle" width="40px" height="40px" />
 */
@Component({
  selector: 'ac-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [class]="'skeleton skeleton-' + shape()" [style.width]="width()" [style.height]="height()" aria-hidden="true"></span>`,
  styles: [`
    :host { display: block; }
    .skeleton {
      display: block;
      background: linear-gradient(
        90deg,
        var(--color-surface-container) 0%,
        var(--color-surface-container-high) 50%,
        var(--color-surface-container) 100%
      );
      background-size: 200% 100%;
      animation: ac-shimmer 1.4s ease-in-out infinite;
      border-radius: var(--radius-sm);
    }
    .skeleton-text   { height: 14px; width: 100%; }
    .skeleton-rect   { width: 100%; height: 80px; border-radius: var(--radius-md); }
    .skeleton-circle { border-radius: var(--radius-full); }
    .skeleton-card   { width: 100%; height: 140px; border-radius: var(--radius-xl); }
    @keyframes ac-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      .skeleton { animation: none; }
    }
  `],
})
export class SkeletonComponent {
  readonly shape  = input<SkeletonShape>('text');
  readonly width  = input<string | null>(null);
  readonly height = input<string | null>(null);
}

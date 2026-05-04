import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type CardElevation = 'flat' | 'card' | 'editorial';
export type CardPadding   = 'none' | 'sm' | 'md' | 'lg';

/**
 * <ac-card> — generic surface container.
 * Use it for company cards, plan cards, dashboard tiles, modals' inner
 * surface, and anywhere the maquette places a rounded white container.
 *
 * Header / footer are optional projected slots:
 *   <ac-card>
 *     <div ac-card-header>...</div>
 *     <p>body</p>
 *     <div ac-card-footer>...</div>
 *   </ac-card>
 */
@Component({
  selector: 'ac-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article [class]="rootClass()">
      <ng-content select="[ac-card-header]"></ng-content>
      <div [class]="bodyClass()">
        <ng-content></ng-content>
      </div>
      <ng-content select="[ac-card-footer]"></ng-content>
    </article>
  `,
  styles: [`
    :host { display: block; }
    article {
      background: var(--color-surface-container-lowest);
      border-radius: var(--radius-xl);
      overflow: hidden;
    }
    .pad-none { padding: 0; }
    .pad-sm   { padding: 16px; }
    .pad-md   { padding: 24px; }
    .pad-lg   { padding: 32px; }
    .e-flat       { box-shadow: none; border: 1px solid var(--color-outline-variant); }
    .e-card       { box-shadow: var(--shadow-card); }
    .e-editorial  { box-shadow: var(--shadow-editorial); }
    .interactive  { cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
    .interactive:hover { transform: translateY(-2px); box-shadow: var(--shadow-editorial); }
  `],
})
export class CardComponent {
  readonly elevation   = input<CardElevation>('card');
  readonly padding     = input<CardPadding>('md');
  readonly interactive = input<boolean>(false);

  protected readonly rootClass = computed(() =>
    [`e-${this.elevation()}`, this.interactive() ? 'interactive' : ''].join(' ').trim()
  );
  protected readonly bodyClass = computed(() => `pad-${this.padding()}`);
}

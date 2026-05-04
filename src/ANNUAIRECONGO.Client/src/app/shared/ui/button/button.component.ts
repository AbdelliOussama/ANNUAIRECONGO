import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgClass } from '@angular/common';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize    = 'sm' | 'md' | 'lg';

/**
 * <ac-button> — primary action surface for the whole app.
 *
 * Renders a real <button>; for navigation use [routerLink] on a wrapping
 * <a class="btn btn-primary"> instead (kept simple — the design system owns
 * the visual classes via .btn / .btn-primary in styles/_components.scss).
 */
@Component({
  selector: 'ac-button',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [attr.aria-busy]="loading() || null"
      [attr.aria-label]="ariaLabel() || null"
      [ngClass]="classes()"
    >
      @if (loading()) {
        <span class="material-symbols-outlined animate-spin" aria-hidden="true">progress_activity</span>
      } @else if (iconLeft()) {
        <span class="material-symbols-outlined" aria-hidden="true">{{ iconLeft() }}</span>
      }
      <ng-content></ng-content>
      @if (!loading() && iconRight()) {
        <span class="material-symbols-outlined" aria-hidden="true">{{ iconRight() }}</span>
      }
    </button>
  `,
  styles: [`
    :host { display: inline-flex; }
    button { width: 100%; }
    .animate-spin { animation: ac-spin 0.9s linear infinite; }
    @keyframes ac-spin { to { transform: rotate(360deg); } }
  `],
})
export class ButtonComponent {
  readonly variant   = input<ButtonVariant>('primary');
  readonly size      = input<ButtonSize>('md');
  readonly type      = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled  = input<boolean>(false);
  readonly loading   = input<boolean>(false);
  readonly iconLeft  = input<string | null>(null);
  readonly iconRight = input<string | null>(null);
  readonly fullWidth = input<boolean>(false);
  readonly ariaLabel = input<string | null>(null);

  protected readonly classes = computed(() => ({
    'btn': true,
    [`btn-${this.variant()}`]: true,
    'btn-sm': this.size() === 'sm',
    'btn-lg': this.size() === 'lg',
    'w-full': this.fullWidth(),
  }));
}

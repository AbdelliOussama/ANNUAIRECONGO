import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * <ac-empty-state> — illustrative placeholder when a list is empty.
 * Pass the title/hint and project an action slot.
 *
 *   <ac-empty-state icon="folder_open" title="Aucune entreprise"
 *                   hint="Ajoutez une fiche pour commencer.">
 *     <ac-button>Créer ma fiche</ac-button>
 *   </ac-empty-state>
 */
@Component({
  selector: 'ac-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state" role="status">
      <div class="empty-icon" aria-hidden="true">
        <span class="material-symbols-outlined">{{ icon() || 'inbox' }}</span>
      </div>
      <h3 class="empty-title">{{ title() }}</h3>
      @if (hint()) { <p class="empty-hint">{{ hint() }}</p> }
      <div class="empty-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 48px 24px;
      text-align: center;
      color: var(--color-on-secondary-container);
    }
    .empty-icon {
      width: 64px;
      height: 64px;
      border-radius: var(--radius-full);
      background: var(--color-surface-container);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--color-outline);
    }
    .empty-icon .material-symbols-outlined { font-size: 32px; }
    .empty-title {
      font-family: var(--font-headline);
      font-size: 18px;
      color: var(--color-on-surface);
      margin: 0;
    }
    .empty-hint {
      font-size: 14px;
      color: var(--color-on-surface-variant);
      max-width: 360px;
      margin: 0;
    }
    .empty-actions { margin-top: 8px; }
  `],
})
export class EmptyStateComponent {
  readonly icon  = input<string | null>('inbox');
  readonly title = input.required<string>();
  readonly hint  = input<string | null>(null);
}

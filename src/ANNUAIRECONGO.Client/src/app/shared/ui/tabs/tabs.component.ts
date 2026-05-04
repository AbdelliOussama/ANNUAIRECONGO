import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  signal,
  viewChildren,
} from '@angular/core';

export interface TabDescriptor {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

/**
 * <ac-tabs> — keyboard-accessible data-driven tablist.
 *
 *   <ac-tabs [tabs]="tabs" [(active)]="activeId" />
 *
 * Tab panels are rendered by the parent (this component owns only the tablist
 * and the active state), keeping it framework-light and easy to compose with
 * any page layout. Use the `activeChange` output to switch the panel.
 */
@Component({
  selector: 'ac-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tablist" role="tablist" [attr.aria-label]="ariaLabel() || null">
      @for (tab of tabs(); track tab.id; let i = $index) {
        <button
          #tabBtn
          type="button"
          role="tab"
          [id]="'tab-' + tab.id"
          [attr.aria-controls]="'panel-' + tab.id"
          [attr.aria-selected]="activeIndex() === i"
          [attr.tabindex]="activeIndex() === i ? 0 : -1"
          [disabled]="tab.disabled || null"
          [class]="'tab ' + (activeIndex() === i ? 'active' : '')"
          (click)="select(tab.id)"
          (keydown)="onKeydown($event)"
        >
          @if (tab.icon) {
            <span class="material-symbols-outlined" aria-hidden="true">{{ tab.icon }}</span>
          }
          {{ tab.label }}
        </button>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .tablist {
      display: flex;
      gap: 4px;
      border-bottom: 1px solid var(--color-outline-variant);
      overflow-x: auto;
    }
    .tab {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: transparent;
      border: none;
      padding: 12px 16px;
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 600;
      color: var(--color-on-secondary-container);
      text-transform: none;
      letter-spacing: 0;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: color 0.15s, border-color 0.15s;
      white-space: nowrap;
    }
    .tab:hover { color: var(--color-primary); }
    .tab.active {
      color: var(--color-primary);
      border-bottom-color: var(--color-primary);
    }
    .tab:disabled { opacity: 0.4; cursor: not-allowed; }
    .tab .material-symbols-outlined { font-size: 18px; }
  `],
})
export class TabsComponent {
  readonly tabs       = input.required<TabDescriptor[]>();
  readonly active     = input<string | null>(null);
  readonly ariaLabel  = input<string | null>(null);
  readonly activeChange = output<string>();

  private readonly internalActive = signal<string | null>(null);
  protected readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabBtn');

  protected readonly activeIndex = computed(() => {
    const id = this.internalActive() ?? this.active() ?? this.tabs()[0]?.id;
    return Math.max(0, this.tabs().findIndex((t) => t.id === id));
  });

  constructor() {
    effect(() => {
      // Sync incoming `active` input → internal state.
      const incoming = this.active();
      if (incoming) this.internalActive.set(incoming);
    });
  }

  protected select(id: string): void {
    this.internalActive.set(id);
    this.activeChange.emit(id);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const tabs = this.tabs();
    const idx  = this.activeIndex();
    let nextIdx = idx;
    switch (event.key) {
      case 'ArrowRight': nextIdx = (idx + 1) % tabs.length; break;
      case 'ArrowLeft':  nextIdx = (idx - 1 + tabs.length) % tabs.length; break;
      case 'Home':       nextIdx = 0; break;
      case 'End':        nextIdx = tabs.length - 1; break;
      default: return;
    }
    event.preventDefault();
    const next = tabs[nextIdx];
    if (next && !next.disabled) {
      this.select(next.id);
      this.tabButtons()[nextIdx]?.nativeElement.focus();
    }
  }
}

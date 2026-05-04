import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type SectorTileSize  = 'lg' | 'md' | 'sm';
export type SectorTileTheme = 'primary' | 'tertiary' | 'neutral';

/**
 * <ac-sector-tile> — bento card linking to /annuaire?secteur=<slug>.
 * Used on accueil and on the secteurs page.
 *
 *   <ac-sector-tile
 *     slug="maritime" name="Maritime & Portuaire" icon="directions_boat"
 *     description="Port de Pointe-Noire…" badge="Port Principal" size="lg" />
 */
@Component({
  selector: 'ac-sector-tile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <a
      [routerLink]="['/annuaire']"
      [queryParams]="{ secteur: slug() }"
      [class]="rootClass()"
      [attr.aria-label]="'Secteur ' + name()"
    >
      <div class="absolute inset-0 ac-overlay" [class]="'theme-' + theme()" aria-hidden="true"></div>

      <div class="absolute top-5 left-5">
        <div class="ac-icon-bubble" [class]="'theme-' + theme()" aria-hidden="true">
          <span class="material-symbols-outlined">{{ icon() }}</span>
        </div>
      </div>

      @if (badge()) {
        <div class="absolute top-4 right-4">
          <span class="badge badge-verified">{{ badge() }}</span>
        </div>
      }

      <div class="relative z-10 ac-content">
        <h3 [class]="titleClass()">{{ name() }}</h3>
        @if (description()) {
          <p class="text-secondary mt-2 max-w-sm text-sm leading-relaxed">{{ description() }}</p>
        }

        @if (chips() && chips()!.length) {
          <div class="flex items-center gap-3 mt-4 flex-wrap">
            @for (c of chips(); track c) {
              <span class="badge badge-free text-[10px]">{{ c }}</span>
            }
          </div>
        }

        @if (size() === 'lg') {
          <div class="flex items-center gap-2 mt-4 text-primary text-xs font-bold font-label uppercase tracking-wider">
            <span>Explorer le secteur</span>
            <span class="material-symbols-outlined text-base ac-arrow" aria-hidden="true">arrow_forward</span>
          </div>
        }
      </div>
    </a>
  `,
  styles: [`
    :host { display: block; }

    a {
      position: relative;
      display: flex;
      align-items: flex-end;
      overflow: hidden;
      border-radius: var(--radius-2xl);
      background: var(--color-surface-container-lowest);
      transition: transform 0.25s, box-shadow 0.25s;
    }
    a:hover { transform: translateY(-2px); box-shadow: var(--shadow-editorial); }
    a:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }

    .size-lg { min-height: 320px; }
    .size-md { min-height: 220px; }
    .size-sm { min-height: 180px; }

    .ac-content { padding: 28px; width: 100%; }
    .ac-content.is-sm { padding: 22px; }

    .ac-overlay.theme-primary  { background: linear-gradient(135deg, rgba(0, 78, 52, 0.10), rgba(0, 78, 52, 0.04)); }
    .ac-overlay.theme-tertiary { background: linear-gradient(135deg, rgba(255, 223, 154, 0.20), transparent); }
    .ac-overlay.theme-neutral  { background: transparent; }

    .ac-icon-bubble {
      width: 44px; height: 44px;
      border-radius: var(--radius-md);
      display: inline-flex; align-items: center; justify-content: center;
      transition: transform 0.3s;
    }
    .ac-icon-bubble.theme-primary  { background: rgba(0, 78, 52, 0.10); color: var(--color-primary); }
    .ac-icon-bubble.theme-tertiary { background: var(--color-tertiary-fixed); color: var(--color-tertiary); }
    .ac-icon-bubble.theme-neutral  { background: var(--color-surface-container); color: var(--color-on-secondary-container); }
    a:hover .ac-icon-bubble { transform: scale(1.1); }
    .ac-icon-bubble .material-symbols-outlined { font-size: 22px; }

    a:hover .ac-arrow { transform: translateX(4px); }
    .ac-arrow { transition: transform 0.2s; }

    .title-lg { font-size: 24px; font-weight: 700; font-family: var(--font-headline); color: var(--color-on-surface); }
    .title-md { font-size: 18px; font-weight: 700; font-family: var(--font-headline); color: var(--color-on-surface); }
    .title-sm { font-size: 16px; font-weight: 700; font-family: var(--font-headline); color: var(--color-on-surface); }
  `],
})
export class SectorTileComponent {
  readonly slug         = input.required<string>();
  readonly name         = input.required<string>();
  readonly icon         = input.required<string>();
  readonly description  = input<string | null>(null);
  readonly badge        = input<string | null>(null);
  readonly size         = input<SectorTileSize>('md');
  readonly theme        = input<SectorTileTheme>('primary');
  readonly chips        = input<string[] | null>(null);

  protected readonly rootClass  = computed(() => `size-${this.size()}`);
  protected readonly titleClass = computed(() => `title-${this.size()}`);
}

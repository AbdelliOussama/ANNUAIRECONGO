import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type CompanyCardVariant = 'grid' | 'list';

export interface CompanyCardData {
  id: string;
  name: string;
  slug: string;
  sectorLabel: string;
  sectorIcon: string;
  description: string;
  city: string;
  isVerified?: boolean;
  isPremium?: boolean;
}

/**
 * <ac-company-card> — directory listing card.
 * Two variants: grid (default) and list (denser, two-column row).
 */
@Component({
  selector: 'ac-company-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (variant() === 'grid') {
      <a [routerLink]="['/annuaire', data().slug]" class="card grid">
        @if (data().isVerified) {
          <span class="verified" aria-label="Entreprise vérifiée">
            <span class="material-symbols-outlined icon-filled" aria-hidden="true">verified</span>
          </span>
        }
        @if (data().isPremium) {
          <span class="badge badge-premium premium-tag">Premium</span>
        }

        <div class="icon-bubble" aria-hidden="true">
          <span class="material-symbols-outlined">{{ data().sectorIcon }}</span>
        </div>

        <h3 class="title">{{ data().name }}</h3>
        <p class="sector">{{ data().sectorLabel }}</p>
        <p class="desc">{{ data().description }}</p>

        <div class="city">
          <span class="material-symbols-outlined" aria-hidden="true">location_on</span>
          {{ data().city }}
        </div>
      </a>
    } @else {
      <a [routerLink]="['/annuaire', data().slug]" class="card list">
        <div class="icon-bubble small" aria-hidden="true">
          <span class="material-symbols-outlined">{{ data().sectorIcon }}</span>
        </div>
        <div class="content">
          <div class="title-row">
            <h3 class="title">{{ data().name }}</h3>
            @if (data().isVerified) {
              <span class="material-symbols-outlined icon-filled text-primary text-base" aria-hidden="true" aria-label="Vérifiée">verified</span>
            }
            @if (data().isPremium) {
              <span class="badge badge-premium">Premium</span>
            }
          </div>
          <p class="sector inline">{{ data().sectorLabel }} — {{ data().city }}</p>
          <p class="desc clamp">{{ data().description }}</p>
        </div>
        <span class="material-symbols-outlined chevron" aria-hidden="true">chevron_right</span>
      </a>
    }
  `,
  styles: [`
    :host { display: block; }

    .card {
      background: var(--color-surface-container-lowest);
      border-radius: var(--radius-xl);
      padding: 28px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: box-shadow 0.25s, transform 0.25s;
      color: inherit;
      text-decoration: none;
    }
    .card:hover { box-shadow: 0 12px 40px rgba(25, 28, 30, 0.06); transform: translateY(-2px); }

    .verified {
      position: absolute;
      top: 14px;
      right: 14px;
      color: var(--color-tertiary-fixed-dim);
    }
    .premium-tag {
      position: absolute;
      top: 14px;
      left: 14px;
    }

    .icon-bubble {
      width: 56px; height: 56px;
      background: var(--color-surface-container-low);
      border-radius: var(--radius-md);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      transition: transform 0.25s;
    }
    .icon-bubble.small { width: 44px; height: 44px; margin-bottom: 0; }
    .icon-bubble .material-symbols-outlined { color: var(--color-primary); font-size: 28px; }
    .card:hover .icon-bubble { transform: scale(1.08); }

    .title {
      font-family: var(--font-headline);
      font-size: 20px;
      font-weight: 700;
      color: var(--color-on-surface);
      margin: 0 0 4px;
    }
    .sector {
      font-size: 11px;
      font-weight: 700;
      color: var(--color-primary);
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin: 0 0 16px;
    }
    .sector.inline { letter-spacing: 0.06em; margin: 4px 0 6px; color: var(--color-on-secondary-container); font-weight: 600; }
    .desc {
      color: var(--color-on-secondary-container);
      font-size: 14px;
      line-height: 1.55;
      margin: 0 0 24px;
    }
    .desc.clamp {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin: 0;
    }
    .city {
      margin-top: auto;
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--color-on-secondary-container);
      font-size: 12px;
      font-weight: 600;
    }
    .city .material-symbols-outlined { font-size: 18px; }

    /* List variant */
    .card.list {
      flex-direction: row;
      align-items: center;
      gap: 16px;
      padding: 18px 20px;
    }
    .card.list .content { flex: 1; min-width: 0; }
    .card.list .title-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    .card.list .title { font-size: 16px; margin: 0; }
    .card.list .chevron { color: var(--color-outline); }
    .text-base { font-size: 18px; }
  `],
})
export class CompanyCardComponent {
  readonly data    = input.required<CompanyCardData>();
  readonly variant = input<CompanyCardVariant>('grid');
}

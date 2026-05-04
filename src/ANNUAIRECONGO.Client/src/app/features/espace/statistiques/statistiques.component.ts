import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MockEspaceService } from '@core/services/mock/mock-espace.service';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { FR } from '@core/i18n/fr.constants';

/**
 * /espace/statistiques — KPI dashboard for the owner's fiche.
 * Audit P2 — page absente du livrable initial.
 *
 * Visualisation: 4 KPI tiles + a small pure-SVG bar chart for monthly views.
 */
@Component({
  selector: 'ac-espace-statistiques',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonComponent],
  template: `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">Performances</p>
        <h1>Statistiques de ma fiche</h1>
        <p class="sub">Suivez l'audience de votre profil sur les 6 derniers mois.</p>
      </header>

      @if (loading()) {
        <ac-skeleton shape="card" height="180px" />
        <div style="margin-top:16px;"><ac-skeleton shape="card" height="320px" /></div>
      } @else {
        <!-- KPIs -->
        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <article class="kpi">
            <span class="kpi-icon"><span class="material-symbols-outlined" aria-hidden="true">visibility</span></span>
            <div>
              <p class="kpi-value">{{ format(stats()!.views) }}</p>
              <p class="kpi-label">Vues totales</p>
            </div>
          </article>
          <article class="kpi">
            <span class="kpi-icon"><span class="material-symbols-outlined" aria-hidden="true">person</span></span>
            <div>
              <p class="kpi-value">{{ format(stats()!.uniqueVisitors) }}</p>
              <p class="kpi-label">Visiteurs uniques</p>
            </div>
          </article>
          <article class="kpi">
            <span class="kpi-icon"><span class="material-symbols-outlined" aria-hidden="true">touch_app</span></span>
            <div>
              <p class="kpi-value">{{ format(stats()!.contactClicks) }}</p>
              <p class="kpi-label">Clics sur contact</p>
            </div>
          </article>
          <article class="kpi">
            <span class="kpi-icon"><span class="material-symbols-outlined" aria-hidden="true">search</span></span>
            <div>
              <p class="kpi-value">{{ format(stats()!.searchAppearances) }}</p>
              <p class="kpi-label">Apparitions en recherche</p>
            </div>
          </article>
        </section>

        <!-- Chart -->
        <section class="chart-card">
          <header class="chart-head">
            <div>
              <h2>Vues mensuelles</h2>
              <p class="muted">Évolution sur les 6 derniers mois</p>
            </div>
            <div class="legend">
              <span class="legend-dot"></span>
              <span>Vues</span>
            </div>
          </header>

          <svg class="chart" viewBox="0 0 600 240" role="img" aria-label="Graphique des vues mensuelles">
            <!-- Y-axis grid lines -->
            @for (g of gridLines; track g) {
              <line [attr.x1]="40" [attr.x2]="590" [attr.y1]="g" [attr.y2]="g" stroke="var(--color-outline-variant)" stroke-width="1" stroke-dasharray="2,4" />
            }
            <!-- Bars -->
            @for (b of bars(); track b.month) {
              <g>
                <rect
                  [attr.x]="b.x"
                  [attr.y]="b.y"
                  [attr.width]="barWidth"
                  [attr.height]="b.height"
                  rx="6"
                  fill="var(--color-primary)"
                />
                <text [attr.x]="b.x + barWidth / 2" [attr.y]="b.y - 8" text-anchor="middle"
                      font-size="11" font-weight="700" fill="var(--color-on-surface)">
                  {{ b.value }}
                </text>
                <text [attr.x]="b.x + barWidth / 2" y="220" text-anchor="middle"
                      font-size="11" fill="var(--color-on-secondary-container)">
                  {{ b.month }}
                </text>
              </g>
            }
          </svg>
        </section>

        <!-- Hint for Premium upgrade -->
        <section class="hint">
          <span class="material-symbols-outlined text-primary" aria-hidden="true">workspace_premium</span>
          <div>
            <p class="hint-title">Statistiques avancées avec le forfait Premium</p>
            <p class="hint-text">Accédez aux exports CSV/PDF, à la segmentation par origine du trafic et aux comparaisons sectorielles.</p>
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { max-width: 1100px; margin: 0 auto; padding: 8px 4px 32px; display: flex; flex-direction: column; gap: 24px; }
    .page-head h1 {
      font-family: var(--font-headline);
      font-size: 30px;
      font-weight: 800;
      margin: 6px 0 8px;
    }
    .page-head .sub { color: var(--color-on-secondary-container); font-size: 14px; margin: 0; }

    .kpi {
      display: flex;
      align-items: center;
      gap: 14px;
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-xl);
      padding: 18px 20px;
    }
    .kpi-icon {
      width: 44px; height: 44px;
      background: var(--color-primary-fixed);
      color: var(--color-on-primary-fixed);
      border-radius: var(--radius-md);
      display: inline-flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .kpi-value { font-family: var(--font-headline); font-size: 24px; font-weight: 800; margin: 0; line-height: 1; }
    .kpi-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-on-secondary-container); margin: 6px 0 0; }

    .chart-card {
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-2xl);
      padding: 24px;
    }
    .chart-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .chart-head h2 { font-family: var(--font-headline); font-size: 20px; font-weight: 700; margin: 0; }
    .chart-head .muted { color: var(--color-on-surface-variant); font-size: 13px; margin: 4px 0 0; }
    .legend { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--color-on-secondary-container); }
    .legend-dot { width: 10px; height: 10px; background: var(--color-primary); border-radius: var(--radius-full); display: inline-block; }
    .chart { width: 100%; height: auto; }

    .hint {
      display: flex;
      gap: 14px;
      padding: 18px;
      background: var(--color-primary-fixed);
      color: var(--color-on-primary-fixed);
      border-radius: var(--radius-xl);
    }
    .hint .material-symbols-outlined { font-size: 28px; }
    .hint-title { font-weight: 700; margin: 0 0 4px; }
    .hint-text { font-size: 13px; opacity: 0.85; margin: 0; line-height: 1.55; }
  `],
})
export class EspaceStatistiquesComponent {
  protected readonly FR = FR;
  private readonly espace = inject(MockEspaceService);

  protected readonly stats = toSignal(this.espace.ficheStats$(), { initialValue: null });
  protected readonly loading = computed(() => this.stats() === null);

  protected readonly barWidth = 60;
  protected readonly gridLines = [40, 80, 120, 160, 200];

  protected readonly bars = computed(() => {
    const m = this.stats()?.monthly ?? [];
    if (!m.length) return [];
    const max = Math.max(...m.map((x) => x.views));
    const chartHeight = 180;
    const startY = 40;
    const startX = 80;
    const gap = 90;

    return m.map((entry, i) => {
      const height = (entry.views / max) * chartHeight;
      return {
        month: entry.month,
        value: entry.views,
        x: startX + i * gap,
        y: startY + (chartHeight - height),
        height,
      };
    });
  });

  protected format(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(n);
  }
}

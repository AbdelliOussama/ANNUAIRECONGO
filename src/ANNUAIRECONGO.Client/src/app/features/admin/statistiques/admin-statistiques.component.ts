import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MockAdminService } from '@core/services/mock/mock-admin.service';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { XafPipe } from '@shared/pipes/xaf.pipe';

@Component({
  selector: 'ac-admin-statistiques',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonComponent, XafPipe],
  template: `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">Performances</p>
        <h1>Statistiques de la plateforme</h1>
        <p class="sub">Indicateurs consolidés à l'échelle nationale. Exportable au format CSV (à brancher).</p>
      </header>

      @if (loading()) {
        <ac-skeleton shape="card" height="240px" />
      } @else {
        <section class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <article class="kpi"><span class="kpi-icon"><span class="material-symbols-outlined">apartment</span></span><div><p class="kpi-value">{{ stats()!.totalCompanies }}</p><p class="kpi-label">Entreprises</p></div></article>
          <article class="kpi"><span class="kpi-icon"><span class="material-symbols-outlined">person</span></span><div><p class="kpi-value">{{ stats()!.activeOwners }}</p><p class="kpi-label">Dirigeants actifs</p></div></article>
          <article class="kpi"><span class="kpi-icon"><span class="material-symbols-outlined">trending_up</span></span><div><p class="kpi-value">{{ stats()!.newSignupsThisWeek }}</p><p class="kpi-label">Inscriptions / semaine</p></div></article>
          <article class="kpi"><span class="kpi-icon"><span class="material-symbols-outlined">payments</span></span><div><p class="kpi-value">{{ stats()!.monthlyRevenueXAF | xaf }}</p><p class="kpi-label">Revenu mensuel</p></div></article>
        </section>

        <section class="panel">
          <h2>Répartition par forfait</h2>
          <ul class="bars">
            @for (p of stats()!.byPlan; track p.label) {
              <li>
                <div class="bar-head"><span>{{ p.label }}</span><span class="bar-value">{{ p.value }}</span></div>
                <div class="bar-track"><div class="bar-fill" [style.width.%]="(p.value / maxBy(stats()!.byPlan)) * 100"></div></div>
              </li>
            }
          </ul>
        </section>

        <section class="panel">
          <h2>Répartition par statut</h2>
          <ul class="bars">
            @for (s of stats()!.byStatus; track s.label) {
              <li>
                <div class="bar-head"><span>{{ s.label }}</span><span class="bar-value">{{ s.value }}</span></div>
                <div class="bar-track"><div class="bar-fill" [style.width.%]="(s.value / maxBy(stats()!.byStatus)) * 100"></div></div>
              </li>
            }
          </ul>
        </section>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { display: flex; flex-direction: column; gap: 24px; max-width: 1200px; margin: 0 auto; }
    .page-head h1 { font-family: var(--font-headline); font-size: 30px; font-weight: 800; margin: 6px 0 8px; }
    .page-head .sub { color: var(--color-on-secondary-container); font-size: 14px; margin: 0; }

    .kpi { display: flex; align-items: center; gap: 14px; background: var(--color-surface-container-lowest); border: 1px solid var(--color-outline-variant); border-radius: var(--radius-xl); padding: 18px 20px; }
    .kpi-icon { width: 44px; height: 44px; background: var(--color-primary-fixed); color: var(--color-on-primary-fixed); border-radius: var(--radius-md); display: inline-flex; align-items: center; justify-content: center; }
    .kpi-value { font-family: var(--font-headline); font-size: 22px; font-weight: 800; margin: 0; line-height: 1; }
    .kpi-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-on-secondary-container); margin: 6px 0 0; }

    .panel { background: var(--color-surface-container-lowest); border: 1px solid var(--color-outline-variant); border-radius: var(--radius-2xl); padding: 24px; }
    .panel h2 { font-family: var(--font-headline); font-size: 20px; font-weight: 700; margin: 0 0 18px; }
    .bars { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
    .bar-head { display: flex; justify-content: space-between; font-size: 13px; color: var(--color-on-surface); }
    .bar-value { color: var(--color-primary); font-weight: 700; }
    .bar-track { height: 10px; background: var(--color-surface-container); border-radius: var(--radius-full); overflow: hidden; margin-top: 4px; }
    .bar-fill { height: 100%; background: linear-gradient(90deg, var(--color-primary), var(--color-primary-container)); border-radius: var(--radius-full); }
  `],
})
export class AdminStatistiquesComponent {
  private readonly admin = inject(MockAdminService);
  protected readonly stats = toSignal(this.admin.stats(), { initialValue: null });
  protected readonly loading = computed(() => this.stats() === null);
  protected maxBy(items: { value: number }[]): number {
    return Math.max(1, ...items.map((x) => x.value));
  }
}

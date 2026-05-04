import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { MockAdminService } from '@core/services/mock/mock-admin.service';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { XafPipe } from '@shared/pipes/xaf.pipe';

/**
 * /admin — admin dashboard.
 * KPI tiles + pending validations widget + sector / region distribution
 * + recent audit entries.
 */
@Component({
  selector: 'ac-admin-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SkeletonComponent, XafPipe],
  template: `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">Vue d'ensemble</p>
        <h1>Tableau de bord</h1>
        <p class="sub">Indicateurs clés, validations en attente et activité récente de la plateforme.</p>
      </header>

      @if (loading()) {
        <ac-skeleton shape="card" height="120px" />
      } @else {
        <!-- KPIs -->
        <section class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <article class="kpi">
            <div>
              <p class="kpi-value">{{ format(stats()!.totalCompanies) }}</p>
              <p class="kpi-label">Entreprises totales</p>
            </div>
            <span class="kpi-icon"><span class="material-symbols-outlined">apartment</span></span>
          </article>
          <article class="kpi">
            <div>
              <p class="kpi-value">{{ format(stats()!.validatedCompanies) }}</p>
              <p class="kpi-label">Vérifiées</p>
            </div>
            <span class="kpi-icon ok"><span class="material-symbols-outlined">verified</span></span>
          </article>
          <article class="kpi">
            <div>
              <p class="kpi-value">{{ format(stats()!.pendingCompanies) }}</p>
              <p class="kpi-label">En attente</p>
            </div>
            <span class="kpi-icon warn"><span class="material-symbols-outlined">schedule</span></span>
          </article>
          <article class="kpi">
            <div>
              <p class="kpi-value">{{ stats()!.monthlyRevenueXAF | xaf }}</p>
              <p class="kpi-label">Revenus du mois</p>
            </div>
            <span class="kpi-icon"><span class="material-symbols-outlined">payments</span></span>
          </article>
        </section>

        <!-- Pending widget -->
        <section class="panel">
          <header class="section-head">
            <div>
              <h2>Validations en attente</h2>
              <p class="muted">Fiches soumises par les entreprises et en attente de votre revue.</p>
            </div>
            <a routerLink="/admin/validation" class="link">Tout voir →</a>
          </header>

          @if (pending().length === 0) {
            <p class="empty">Aucune fiche en attente. Bien joué.</p>
          } @else {
            <ul class="pending-list">
              @for (p of pending().slice(0, 4); track p.id) {
                <li class="pending-row">
                  <div>
                    <p class="pending-title">{{ p.name }}</p>
                    <p class="pending-meta">{{ p.sectorLabel }} · {{ p.city }} · soumise le {{ p.submittedAt }}</p>
                  </div>
                  <a [routerLink]="['/admin/validation', p.id]" class="btn btn-outline btn-sm">Examiner</a>
                </li>
              }
            </ul>
          }
        </section>

        <!-- Two-column charts -->
        <section class="two-col">
          <article class="panel">
            <header class="section-head"><h2>Répartition par secteur</h2></header>
            <ul class="bars">
              @for (s of stats()!.bySector; track s.label) {
                <li>
                  <div class="bar-head"><span>{{ s.label }}</span><span class="bar-value">{{ s.value }}</span></div>
                  <div class="bar-track"><div class="bar-fill" [style.width.%]="(s.value / maxBy(stats()!.bySector)) * 100"></div></div>
                </li>
              }
            </ul>
          </article>

          <article class="panel">
            <header class="section-head"><h2>Répartition géographique</h2></header>
            <ul class="bars">
              @for (r of stats()!.byRegion; track r.label) {
                <li>
                  <div class="bar-head"><span>{{ r.label }}</span><span class="bar-value">{{ r.value }}</span></div>
                  <div class="bar-track"><div class="bar-fill bar-fill-tertiary" [style.width.%]="(r.value / maxBy(stats()!.byRegion)) * 100"></div></div>
                </li>
              }
            </ul>
          </article>
        </section>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { display: flex; flex-direction: column; gap: 24px; max-width: 1200px; margin: 0 auto; }

    .page-head h1 { font-family: var(--font-headline); font-size: 30px; font-weight: 800; margin: 6px 0 8px; }
    .page-head .sub { color: var(--color-on-secondary-container); font-size: 14px; margin: 0; }

    .kpi {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-xl);
      padding: 18px 20px;
    }
    .kpi-value { font-family: var(--font-headline); font-size: 24px; font-weight: 800; margin: 0; line-height: 1; }
    .kpi-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-on-secondary-container); margin: 6px 0 0; }
    .kpi-icon {
      width: 44px; height: 44px;
      background: var(--color-primary-fixed);
      color: var(--color-on-primary-fixed);
      border-radius: var(--radius-md);
      display: inline-flex; align-items: center; justify-content: center;
    }
    .kpi-icon.warn { background: var(--color-tertiary-fixed); color: var(--color-on-tertiary-fixed); }
    .kpi-icon.ok   { background: var(--color-primary-fixed); color: var(--color-on-primary-fixed); }

    .panel {
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-2xl);
      padding: 24px;
    }
    .section-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; gap: 12px; }
    .section-head h2 { font-family: var(--font-headline); font-size: 20px; font-weight: 700; margin: 0; }
    .section-head .muted { color: var(--color-on-surface-variant); font-size: 13px; margin: 4px 0 0; }
    .link { color: var(--color-primary); font-weight: 700; font-size: 13px; }
    .link:hover { text-decoration: underline; }

    .pending-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .pending-row {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      padding: 12px 14px;
      background: var(--color-surface-container-low);
      border-radius: var(--radius-md);
    }
    .pending-title { font-weight: 700; color: var(--color-on-surface); margin: 0; font-size: 14px; }
    .pending-meta { font-size: 12px; color: var(--color-on-secondary-container); margin: 4px 0 0; }
    .empty { color: var(--color-on-surface-variant); font-size: 14px; }

    .two-col { display: grid; grid-template-columns: 1fr; gap: 16px; }
    @media (min-width: 1024px) { .two-col { grid-template-columns: 1fr 1fr; } }

    .bars { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
    .bar-head { display: flex; justify-content: space-between; font-size: 13px; color: var(--color-on-surface); margin-bottom: 4px; }
    .bar-value { color: var(--color-primary); font-weight: 700; }
    .bar-track { height: 8px; background: var(--color-surface-container); border-radius: var(--radius-full); overflow: hidden; }
    .bar-fill { height: 100%; background: linear-gradient(90deg, var(--color-primary), var(--color-primary-container)); border-radius: var(--radius-full); }
    .bar-fill-tertiary { background: linear-gradient(90deg, var(--color-tertiary), var(--color-tertiary-container)); }
  `],
})
export class AdminDashboardComponent {
  private readonly admin = inject(MockAdminService);

  protected readonly data = toSignal(
    combineLatest({ stats: this.admin.stats(), pending: this.admin.pendingList$() }),
    { initialValue: null }
  );
  protected readonly loading = computed(() => this.data() === null);
  protected readonly stats   = computed(() => this.data()?.stats ?? null);
  protected readonly pending = computed(() => this.data()?.pending ?? []);

  protected format(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(n);
  }
  protected maxBy(items: { value: number }[]): number {
    return Math.max(1, ...items.map((x) => x.value));
  }
}

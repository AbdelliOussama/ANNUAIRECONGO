import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AdminService } from '@core/services/admin.service';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { XafPipe } from '@shared/pipes/xaf.pipe';
import { PlatformStats } from '@core/models/company.model';

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
          <article class="kpi">
            <span class="kpi-icon"><span class="material-symbols-outlined">apartment</span></span>
            <div><p class="kpi-value">{{ stats()?.totalCompanies }}</p><p class="kpi-label">Entreprises</p></div>
          </article>
          <article class="kpi">
            <span class="kpi-icon"><span class="material-symbols-outlined">verified</span></span>
            <div><p class="kpi-value">{{ stats()?.activeCompanies }}</p><p class="kpi-label">Vérifiées</p></div>
          </article>
          <article class="kpi">
            <span class="kpi-icon"><span class="material-symbols-outlined">subscriptions</span></span>
            <div><p class="kpi-value">{{ stats()?.activeSubscriptions }}</p><p class="kpi-label">Abonnements actifs</p></div>
          </article>
          <article class="kpi">
            <span class="kpi-icon"><span class="material-symbols-outlined">payments</span></span>
            <div><p class="kpi-value">{{ stats()?.totalRevenue | xaf }}</p><p class="kpi-label">Revenu total</p></div>
          </article>
        </section>

        <section class="panel">
          <h2>Résumé financier</h2>
          <p class="muted">Le chiffre d'affaires cumulé reflète l'ensemble des souscriptions validées.</p>
          <div class="revenue-grid">
            <div class="rev-item">
              <p class="rev-label">Total Revenu</p>
              <p class="rev-value">{{ stats()?.totalRevenue | xaf }}</p>
            </div>
            <div class="rev-item">
              <p class="rev-label">Abonnements Totaux</p>
              <p class="rev-value">{{ stats()?.totalSubscriptions }}</p>
            </div>
          </div>
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
    .muted { color: var(--color-on-surface-variant); font-size: 13px; margin: -12px 0 24px; }
    
    .revenue-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .rev-item { padding: 20px; background: var(--color-surface-container-low); border-radius: var(--radius-lg); }
    .rev-label { font-size: 12px; color: var(--color-outline); margin: 0 0 8px; text-transform: uppercase; }
    .rev-value { font-size: 24px; font-weight: 800; margin: 0; color: var(--color-primary); }
  `],
})
export class AdminStatistiquesComponent {
  private readonly adminService = inject(AdminService);
  protected readonly stats = toSignal(this.adminService.getAdminStats(), { initialValue: null });
  protected readonly loading = computed(() => this.stats() === null);
}

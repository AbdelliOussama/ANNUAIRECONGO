import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CompanyService } from '@core/services/company.service';
import { StatsService } from '@core/services/stats.service';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { ToastService } from '@shared/services/toast.service';
import { SectorStats } from '@core/models/company.model';
import { combineLatest, map } from 'rxjs';

@Component({
  selector: 'ac-admin-secteurs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonComponent, ButtonComponent, RouterLink],
  template: `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">Référentiel</p>
        <h1>Secteurs stratégiques</h1>
        <p class="sub">
          Les secteurs alignés sur le cahier des charges officiel. Vous pouvez visualiser l'activité par secteur ici.
        </p>
      </header>

      @if (loading()) {
        <ac-skeleton shape="card" height="240px" />
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (s of sectors(); track s.sectorId) {
            <article class="card">
              <div class="head">
                <span class="icon" aria-hidden="true">
                  <span class="material-symbols-outlined">apartment</span>
                </span>
                <span class="badge badge-pro">Verrouillé SFD</span>
              </div>
              <h3>{{ s.sectorName }}</h3>
              <p class="count">{{ s.companyCount }} entreprise(s) inscrite(s)</p>
              <div class="actions">
                <a class="btn btn-outline" [routerLink]="['/annuaire']" [queryParams]="{ sector: s.sectorId }" style="width: 100%;">
                  <span class="material-symbols-outlined" aria-hidden="true" style="margin-right: 8px; font-size: 20px;">visibility</span>
                  Voir entreprises
                </a>
              </div>
            </article>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { display: flex; flex-direction: column; gap: 20px; max-width: 1100px; margin: 0 auto; }
    .page-head h1 { font-family: var(--font-headline); font-size: 30px; font-weight: 800; margin: 6px 0 8px; }
    .page-head .sub { color: var(--color-on-secondary-container); font-size: 14px; margin: 0; max-width: 720px; line-height: 1.55; }

    .card {
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-2xl);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: border-color 0.2s, opacity 0.2s;
    }

    .head { display: flex; justify-content: space-between; align-items: flex-start; }
    .icon {
      width: 44px; height: 44px;
      background: var(--color-primary-fixed);
      color: var(--color-on-primary-fixed);
      border-radius: var(--radius-md);
      display: inline-flex; align-items: center; justify-content: center;
    }
    .icon .material-symbols-outlined { font-size: 22px; }

    h3 { font-family: var(--font-headline); font-size: 18px; font-weight: 700; margin: 0; }
    .count { font-size: 13px; color: var(--color-on-secondary-container); margin: 0; }
    .actions { margin-top: auto; }
  `],
})
export class AdminSecteursComponent {
  private readonly statsService = inject(StatsService);
  private readonly toast = inject(ToastService);

  protected readonly sectors = toSignal(this.statsService.getSectorStats(), { initialValue: [] as SectorStats[] });
  protected readonly loading = computed(() => this.sectors().length === 0);

  protected toggle(s: any): void {
    this.toast.info('Gestion du statut des secteurs disponible en version 2.0.');
  }
}

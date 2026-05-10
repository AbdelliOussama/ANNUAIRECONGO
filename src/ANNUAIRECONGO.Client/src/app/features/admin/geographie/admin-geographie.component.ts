import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CompanyService } from '@core/services/company.service';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { Region } from '@core/models/company.model';

@Component({
  selector: 'ac-admin-geographie',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonComponent],
  template: `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">Référentiel</p>
        <h1>Géographie</h1>
        <p class="sub">Départements et principales villes du Congo-Brazzaville.</p>
      </header>

      @if (loading()) {
        <ac-skeleton shape="card" height="280px" />
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (r of regions(); track r.id) {
            <article class="card">
              <header class="head">
                <span class="icon" aria-hidden="true">
                  <span class="material-symbols-outlined">public</span>
                </span>
                <span class="count">{{ r.cities?.length || 0 }} ville(s)</span>
              </header>
              <h3>{{ r.name }}</h3>
              <ul class="cities">
                @for (c of r.cities; track c.id) {
                  <li>
                    <span class="material-symbols-outlined" aria-hidden="true">location_city</span>
                    {{ c.name }}
                  </li>
                }
              </ul>
            </article>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { display: flex; flex-direction: column; gap: 20px; max-width: 1200px; margin: 0 auto; }
    .page-head h1 { font-family: var(--font-headline); font-size: 30px; font-weight: 800; margin: 6px 0 8px; }
    .page-head .sub { color: var(--color-on-secondary-container); font-size: 14px; margin: 0; }

    .card { background: var(--color-surface-container-lowest); border: 1px solid var(--color-outline-variant); border-radius: var(--radius-2xl); padding: 22px; }
    .head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .icon { width: 40px; height: 40px; background: var(--color-secondary-container); color: var(--color-on-secondary-fixed); border-radius: var(--radius-md); display: inline-flex; align-items: center; justify-content: center; }
    .count { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-outline); font-weight: 700; }
    h3 { font-family: var(--font-headline); font-size: 18px; font-weight: 700; margin: 0 0 12px; }
    .cities { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
    .cities li { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--color-on-surface); }
    .cities .material-symbols-outlined { font-size: 16px; color: var(--color-outline); }
  `],
})
export class AdminGeographieComponent {
  private readonly companyService = inject(CompanyService);
  protected readonly regions = toSignal(this.companyService.getRegions(), { initialValue: [] as Region[] });
  protected readonly loading = computed(() => this.regions().length === 0);
}

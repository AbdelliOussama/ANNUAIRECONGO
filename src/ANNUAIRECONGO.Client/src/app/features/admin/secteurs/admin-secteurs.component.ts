import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MockAdminService, AdminSector } from '@core/services/mock/mock-admin.service';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { ToastService } from '@shared/services/toast.service';

/**
 * /admin/secteurs — manage the SFD sector taxonomy.
 *
 * Audit C2: the 6 SFD sectors are LOCKED — they can be activated /
 * deactivated but not deleted, and the page never proposes to add new ones
 * that would deviate from the cahier des charges.
 */
@Component({
  selector: 'ac-admin-secteurs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonComponent, ButtonComponent],
  template: `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">Référentiel</p>
        <h1>Secteurs stratégiques</h1>
        <p class="sub">
          Les 6 secteurs alignés sur le cahier des charges officiel. Vous pouvez activer ou désactiver
          temporairement un secteur, mais la liste est verrouillée pour garantir la cohérence avec le SFD.
        </p>
      </header>

      @if (loading()) {
        <ac-skeleton shape="card" height="240px" />
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (s of sectors(); track s.slug) {
            <article class="card" [class.is-inactive]="!s.isActive">
              <div class="head">
                <span class="icon" aria-hidden="true">
                  <span class="material-symbols-outlined">{{ s.icon }}</span>
                </span>
                @if (s.isLocked) {
                  <span class="badge badge-pro">Verrouillé SFD</span>
                }
              </div>
              <h3>{{ s.name }}</h3>
              <p class="count">{{ s.count }} entreprise(s) inscrite(s)</p>
              <div class="actions">
                <ac-button
                  [variant]="s.isActive ? 'outline' : 'primary'"
                  [iconLeft]="s.isActive ? 'visibility_off' : 'visibility'"
                  (click)="toggle(s)"
                >
                  {{ s.isActive ? 'Désactiver' : 'Activer' }}
                </ac-button>
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
    .card.is-inactive { opacity: 0.6; }

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
  private readonly admin = inject(MockAdminService);
  private readonly toast = inject(ToastService);

  protected readonly sectors = toSignal(this.admin.sectors$(), { initialValue: [] as AdminSector[] });
  protected readonly loading = computed(() => this.sectors().length === 0);

  protected toggle(s: AdminSector): void {
    this.admin.toggleSector(s.slug).subscribe(() => {
      this.toast.success(s.isActive ? `${s.name} masqué de l'annuaire.` : `${s.name} de nouveau visible.`);
    });
  }
}

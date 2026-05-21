import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { AdminService } from '@core/services/admin.service';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { ToastService } from '@shared/services/toast.service';
import { BehaviorSubject, switchMap } from 'rxjs';
import { XafPipe } from '@shared/pipes/xaf.pipe';

@Component({
  selector: 'ac-admin-forfaits',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SkeletonComponent,
    ButtonComponent,
    ReactiveFormsModule,
    XafPipe,
  ],
  template: `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">Référentiel</p>
        <h1>Forfaits & tarifs</h1>
        <p class="sub">Modifiez le prix mensuel et les quotas de chaque forfait. Les changements sont immédiats.</p>
      </header>

      @if (loading()) {
        <ac-skeleton shape="card" height="280px" />
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          @for (plan of plans(); track plan.id) {
            <form class="plan" [formGroup]="formFor(plan.id)" (ngSubmit)="save(plan)" novalidate>
              <header class="plan-head">
                <h3>{{ plan.name }}</h3>
                <span class="badge" [class.badge-verified]="plan.isActive" [class.badge-pending]="!plan.isActive">
                  {{ plan.isActive ? 'Actif' : 'Inactif' }}
                </span>
              </header>

              <div class="current">
                Prix actuel : <strong>{{ plan.price | xaf }}</strong> / {{ plan.durationDays }} jours
              </div>

              <div class="form-group">
                <label class="form-label" [attr.for]="'price-' + plan.id">Prix (XAF)</label>
                <input
                  [id]="'price-' + plan.id"
                  type="number"
                  min="0"
                  step="500"
                  formControlName="price"
                  class="form-input"
                />
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label" [attr.for]="'images-' + plan.id">Photos max</label>
                  <input [id]="'images-' + plan.id" type="number" min="0" formControlName="maxImages" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label" [attr.for]="'docs-' + plan.id">Documents max</label>
                  <input [id]="'docs-' + plan.id" type="number" min="0" formControlName="maxDocuments" class="form-input" />
                </div>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label" [attr.for]="'duration-' + plan.id">Durée (jours)</label>
                  <input [id]="'duration-' + plan.id" type="number" min="1" formControlName="durationDays" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label" [attr.for]="'priority-' + plan.id">Priorité (1-3)</label>
                  <input [id]="'priority-' + plan.id" type="number" min="1" max="3" formControlName="searchPriority" class="form-input" />
                </div>
              </div>

              <div class="options">
                <label class="check">
                  <input type="checkbox" formControlName="hasAnalytics" />
                  <span>Statistiques & Analytics</span>
                </label>
                <label class="check">
                  <input type="checkbox" formControlName="hasFeaturedBadge" />
                  <span>Badge 'Mis en avant'</span>
                </label>
                <label class="check">
                  <input type="checkbox" formControlName="isActive" />
                  <span>Forfait disponible</span>
                </label>
              </div>

              <ac-button type="submit" [loading]="saving() === plan.id" [fullWidth]="true">
                Enregistrer
              </ac-button>
            </form>
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

    .plan {
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-2xl);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .plan-head { display: flex; align-items: center; justify-content: space-between; }
    .plan-head h3 { font-family: var(--font-headline); font-size: 20px; font-weight: 700; margin: 0; }

    .current { font-size: 13px; color: var(--color-on-secondary-container); }
    .current strong { color: var(--color-on-surface); font-weight: 700; }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .check { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; }
    .check input { width: 16px; height: 16px; accent-color: var(--color-primary); }
    .options { display: flex; flex-direction: column; gap: 8px; margin: 4px 0; }

    .badge-verified { background: var(--color-primary-fixed); color: var(--color-on-primary-fixed); }
    .badge-pending  { background: var(--color-error-container); color: var(--color-on-error-container); }
  `],
})
export class AdminForfaitsComponent {
  private readonly adminService = inject(AdminService);
  private readonly fb    = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  private readonly trigger = new BehaviorSubject<void>(undefined);
  protected readonly plans = toSignal(
    this.trigger.pipe(switchMap(() => this.adminService.getPlans())),
    { initialValue: [] as any[] }
  );
  protected readonly loading = computed(() => this.plans().length === 0);

  protected readonly saving = signal<string | null>(null);

  private readonly forms = new Map<string, any>();

  protected formFor(id: string): any {
    let f = this.forms.get(id);
    if (!f) {
      f = this.makeForm();
      this.forms.set(id, f);
    }
    const plan = this.plans().find((p) => p.id === id);
    if (plan && f.pristine) f.patchValue(plan);
    return f;
  }

  private makeForm() {
    return this.fb.nonNullable.group({
      price:            [0,    [Validators.required, Validators.min(0)]],
      maxImages:        [0,    [Validators.required, Validators.min(0)]],
      maxDocuments:     [0,    [Validators.required, Validators.min(0)]],
      durationDays:     [30,   [Validators.required, Validators.min(1)]],
      searchPriority:   [3,    [Validators.required, Validators.min(1), Validators.max(3)]],
      hasAnalytics:     [false],
      hasFeaturedBadge: [false],
      isActive:         [true],
    });
  }

  protected save(plan: any): void {
    const form = this.forms.get(plan.id);
    if (!form || form.invalid) return;

    this.saving.set(plan.id);
    const data = {
      ...form.getRawValue(),
      name: plan.name
    };

    this.adminService.updatePlan(plan.id, data).subscribe({
      next: () => {
        this.toast.success('Forfait mis à jour avec succès.');
        this.saving.set(null);
        this.trigger.next();
      },
      error: (err) => {
        console.error('Update failed', err);
        this.toast.error('Erreur lors de la mise à jour du forfait.');
        this.saving.set(null);
      }
    });
  }
}

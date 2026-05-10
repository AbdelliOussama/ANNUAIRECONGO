import { ChangeDetectionStrategy, Component, inject, signal, effect, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { AdminService } from '@core/services/admin.service';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputComponent } from '@shared/ui/input/input.component';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'ac-admin-parametres',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SkeletonComponent,
    ButtonComponent,
    InputComponent,
    ReactiveFormsModule,
  ],
  template: `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">Système</p>
        <h1>Paramètres de la plateforme</h1>
        <p class="sub">Identité, contact officiel et règles de fonctionnement applicables à l'ensemble du site.</p>
      </header>

      @if (loading()) {
        <ac-skeleton shape="card" height="320px" />
      } @else {
        <form [formGroup]="form" (ngSubmit)="save()" novalidate aria-label="Paramètres plateforme">
          <fieldset class="card">
            <legend>Identité</legend>
            <ac-input formControlName="siteName"     label="Nom de la plateforme"   [required]="true" />
            <ac-input formControlName="contactEmail" type="email" label="E-mail de contact" leadingIcon="mail" [required]="true" />
            <ac-input formControlName="supportPhone" type="tel"   label="Téléphone de support" leadingIcon="phone" />
          </fieldset>

          <fieldset class="card">
            <legend>Règles de fonctionnement</legend>

            <label class="check">
              <input type="checkbox" formControlName="manualValidation" />
              <span>
                <strong>Validation manuelle des fiches</strong>
                <em>Recommandé. Toute nouvelle fiche est revue par un admin avant publication.</em>
              </span>
            </label>

            <label class="check">
              <input type="checkbox" formControlName="publicRegistration" />
              <span>
                <strong>Inscriptions publiques ouvertes</strong>
                <em>Désactiver pour mettre la plateforme en mode invitation seule.</em>
              </span>
            </label>
          </fieldset>

          <div class="actions">
            <ac-button type="submit" [loading]="saving()">Enregistrer les paramètres</ac-button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
    .page-head h1 { font-family: var(--font-headline); font-size: 30px; font-weight: 800; margin: 6px 0 8px; }
    .page-head .sub { color: var(--color-on-secondary-container); font-size: 14px; margin: 0; }

    form { display: flex; flex-direction: column; gap: 18px; }

    fieldset.card {
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-2xl);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    legend {
      font-family: var(--font-headline);
      font-size: 16px;
      font-weight: 700;
      color: var(--color-on-surface);
      padding: 0 8px;
      margin-left: -8px;
    }

    .check { display: flex; gap: 12px; align-items: flex-start; cursor: pointer; }
    .check input { width: 18px; height: 18px; margin-top: 2px; accent-color: var(--color-primary); flex-shrink: 0; }
    .check strong { display: block; font-size: 14px; color: var(--color-on-surface); }
    .check em     { display: block; font-style: normal; font-size: 12px; color: var(--color-on-secondary-container); margin-top: 2px; line-height: 1.5; }

    .actions { display: flex; justify-content: flex-end; }
  `],
})
export class AdminParametresComponent {
  private readonly adminService = inject(AdminService);
  private readonly fb    = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    siteName:           ['Annuaire Congo', [Validators.required, Validators.minLength(2)]],
    contactEmail:       ['contact@annuairecongo.cg', [Validators.required, Validators.email]],
    supportPhone:       ['+242 06 000 0000'],
    manualValidation:   [true],
    publicRegistration: [true],
  });

  private readonly initial = toSignal(this.adminService.getSettings(), { initialValue: null });

  constructor() {
    effect(() => {
      const s = this.initial();
      if (s) this.form.patchValue(s);
    });
  }

  protected readonly loading = computed(() => this.initial() === null);

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.adminService.updateSettings(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Paramètres enregistrés.');
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Erreur lors de l\'enregistrement.');
      }
    });
  }
}

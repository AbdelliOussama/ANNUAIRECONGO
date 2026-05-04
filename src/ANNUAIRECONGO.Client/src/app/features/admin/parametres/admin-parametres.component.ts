import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MockAdminService, AdminSettings } from '@core/services/mock/mock-admin.service';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputComponent } from '@shared/ui/input/input.component';
import { ToastService } from '@shared/services/toast.service';

/**
 * /admin/parametres — global platform settings.
 * Audit P1 — page absente du livrable initial.
 */
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
              <input type="checkbox" formControlName="autoRenewBilling" />
              <span>
                <strong>Auto-renouvellement par défaut</strong>
                <em>Activer le renouvellement automatique pour toutes les nouvelles souscriptions.</em>
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

          <fieldset class="card">
            <legend>Localisation</legend>
            <div class="form-group">
              <label class="form-label" for="default-locale">Langue par défaut</label>
              <select id="default-locale" formControlName="defaultLocale" class="form-input">
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
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
  private readonly admin = inject(MockAdminService);
  private readonly fb    = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    siteName:           ['', [Validators.required, Validators.minLength(2)]],
    contactEmail:       ['', [Validators.required, Validators.email]],
    supportPhone:       [''],
    manualValidation:   [true],
    autoRenewBilling:   [true],
    publicRegistration: [true],
    defaultLocale:      ['fr' as 'fr' | 'en'],
  });

  private readonly initial = toSignal(this.admin.settings$(), { initialValue: null });
  // Patch the form once the initial settings arrive.
  private readonly _ = (() => {
    queueMicrotask(() => {
      const sub = this.admin.settings$().subscribe((s) => this.form.patchValue(s));
      // Auto-cleanup not strictly needed (in-memory mock), but we let RxJS GC it.
      setTimeout(() => sub.unsubscribe(), 1000);
    });
    return null;
  })();

  protected readonly loading = (() => this.initial() === null && false);

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.admin.saveSettings(this.form.getRawValue() as AdminSettings).subscribe(() => {
      this.saving.set(false);
      this.toast.success('Paramètres enregistrés.');
    });
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputComponent } from '@shared/ui/input/input.component';
import { ToastService } from '@shared/services/toast.service';
import { FR } from '@core/i18n/fr.constants';

/**
 * /auth/reinitialiser-mot-de-passe?token=… — set a new password using the
 * single-use token received by e-mail. Audit P1 (missing flow).
 */
@Component({
  selector: 'ac-reinitialiser-mot-de-passe',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
  ],
  template: `
    <div class="auth-card">
      @if (!tokenValue()) {
        <div class="invalid">
          <div class="icon-bubble warn" aria-hidden="true">
            <span class="material-symbols-outlined icon-filled">link_off</span>
          </div>
          <h1>Lien invalide</h1>
          <p>
            Ce lien de réinitialisation est invalide ou a expiré. Demandez un
            nouveau lien depuis la page « mot de passe oublié ».
          </p>
          <a routerLink="/auth/mot-de-passe-oublie" class="btn btn-primary">
            Demander un nouveau lien
          </a>
        </div>
      } @else if (done()) {
        <div class="confirm">
          <div class="icon-bubble" aria-hidden="true">
            <span class="material-symbols-outlined icon-filled">check_circle</span>
          </div>
          <h1>Mot de passe modifié</h1>
          <p>Votre mot de passe a été mis à jour avec succès.</p>
          <a routerLink="/auth/connexion" class="btn btn-primary">{{ FR.auth.loginAction }}</a>
        </div>
      } @else {
        <header class="head">
          <div class="icon-bubble" aria-hidden="true">
            <span class="material-symbols-outlined">lock_reset</span>
          </div>
          <h1>{{ FR.auth.resetPasswordTitle }}</h1>
          <p>Choisissez un nouveau mot de passe pour votre compte.</p>
        </header>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate aria-label="Réinitialisation du mot de passe" class="form">
          <ac-input
            formControlName="password"
            type="password"
            [label]="FR.auth.passwordLabel"
            leadingIcon="lock"
            autocomplete="new-password"
            [hint]="FR.auth.passwordHint"
            [minlength]="8"
            [required]="true"
            [error]="errorFor('password')"
          />

          <ac-input
            formControlName="confirmPassword"
            type="password"
            [label]="FR.auth.confirmPasswordLabel"
            leadingIcon="lock"
            autocomplete="new-password"
            [minlength]="8"
            [required]="true"
            [error]="confirmError()"
          />

          <ac-button type="submit" [loading]="submitting()" [fullWidth]="true">
            Mettre à jour le mot de passe
          </ac-button>
        </form>
      }

      @if (tokenValue() && !done()) {
        <p class="alt"><a routerLink="/auth/connexion">Retour à la connexion</a></p>
      }
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; max-width: 480px; }

    .auth-card {
      background: var(--color-surface-container-lowest);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-editorial);
      padding: 40px;
      border: 1px solid var(--color-outline-variant);
    }
    .head { text-align: center; margin-bottom: 28px; }
    .icon-bubble {
      width: 56px; height: 56px;
      background: var(--color-primary-container);
      color: var(--color-on-primary-container);
      border-radius: var(--radius-xl);
      display: inline-flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
    }
    .icon-bubble.warn { background: var(--color-error-container); color: var(--color-on-error-container); }
    .icon-bubble .material-symbols-outlined { font-size: 28px; }

    h1 {
      font-family: var(--font-headline);
      font-size: 24px;
      font-weight: 800;
      color: var(--color-on-surface);
      margin: 0 0 8px;
      text-align: center;
    }
    .head p { color: var(--color-on-secondary-container); font-size: 14px; margin: 0; text-align: center; }
    .invalid p, .confirm p {
      color: var(--color-on-surface-variant);
      font-size: 14px;
      line-height: 1.6;
      text-align: center;
      max-width: 360px;
      margin: 0 auto 24px;
    }
    .invalid, .confirm { text-align: center; }

    .form { display: flex; flex-direction: column; gap: 16px; }

    .alt {
      margin-top: 28px;
      text-align: center;
      font-size: 13px;
    }
    .alt a { color: var(--color-on-secondary-container); font-weight: 600; }
    .alt a:hover { color: var(--color-primary); }
  `],
})
export class ReinitialiserMotDePasseComponent {
  protected readonly FR = FR;
  private readonly fb     = inject(FormBuilder);
  private readonly toast  = inject(ToastService);
  private readonly route  = inject(ActivatedRoute);

  private readonly paramMap = toSignal(
    this.route.queryParamMap,
    { initialValue: null }
  );

  /** The single-use token coming from the e-mail link, or null if missing. */
  protected readonly tokenValue = computed(() => this.paramMap()?.get('token') ?? null);

  protected readonly form = this.fb.nonNullable.group(
    {
      password:        ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: matchPasswords('password', 'confirmPassword') }
  );

  protected readonly submitting = signal(false);
  protected readonly done       = signal(false);

  protected readonly confirmError = computed(() => {
    const c = this.form.get('confirmPassword');
    if (!c || !c.touched) return null;
    if (c.errors?.['required']) return FR.errors.required;
    if (this.form.errors?.['mismatch']) return FR.errors.passwordMismatch;
    return null;
  });

  protected errorFor(name: string): string | null {
    const c = this.form.get(name);
    if (!c || !c.touched || !c.errors) return null;
    if (c.errors['required'])  return FR.errors.required;
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} caractères.`;
    return FR.errors.validation;
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    // Mock until /reset-password is wired
    await new Promise((r) => setTimeout(r, 600));
    this.submitting.set(false);
    this.done.set(true);
    this.toast.success('Mot de passe modifié avec succès.');
  }
}

function matchPasswords(passwordKey: string, confirmKey: string) {
  return (group: AbstractControl): ValidationErrors | null => {
    const p = group.get(passwordKey)?.value;
    const c = group.get(confirmKey)?.value;
    if (!p || !c) return null;
    return p === c ? null : { mismatch: true };
  };
}

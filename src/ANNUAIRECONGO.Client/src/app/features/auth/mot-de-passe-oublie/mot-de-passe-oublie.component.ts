import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputComponent } from '@shared/ui/input/input.component';
import { ToastService } from '@shared/services/toast.service';
import { AuthService } from '@core/services/auth.service';
import { FR } from '@core/i18n/fr.constants';

/**
 * /auth/mot-de-passe-oublie — request a password reset link.
 * Mocked for now (no /forgot-password backend endpoint yet).
 */
@Component({
  selector: 'ac-mot-de-passe-oublie',
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
      @if (!sent()) {
        <header class="head">
          <div class="icon-bubble" aria-hidden="true">
            <span class="material-symbols-outlined">lock_reset</span>
          </div>
          <h1>{{ FR.auth.forgotPasswordTitle }}</h1>
          <p>{{ FR.auth.forgotPasswordSubtitle }}</p>
        </header>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate aria-label="Demande de réinitialisation" class="form">
          <ac-input
            formControlName="email"
            type="email"
            [label]="FR.auth.emailLabel"
            [placeholder]="FR.auth.emailPlaceholder"
            leadingIcon="mail"
            autocomplete="email"
            [required]="true"
            [error]="errorFor('email')"
          />

          <ac-button type="submit" [loading]="submitting()" [fullWidth]="true">
            {{ FR.auth.sendResetLink }}
          </ac-button>
        </form>
      } @else {
        <div class="confirm">
          <div class="confirm-icon" aria-hidden="true">
            <span class="material-symbols-outlined icon-filled">mark_email_read</span>
          </div>
          <h2 class="confirm-title">E-mail envoyé</h2>
          <p class="confirm-body">
            Si un compte est associé à cette adresse e-mail, vous recevrez un lien
            de réinitialisation dans quelques minutes. Pensez à vérifier vos
            courriers indésirables.
          </p>
        </div>
      }

      <p class="alt">
        <a routerLink="/auth/connexion">
          <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>
          Retour à la connexion
        </a>
      </p>
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
      margin-bottom: 16px;
    }
    .icon-bubble .material-symbols-outlined { font-size: 28px; }
    h1 {
      font-family: var(--font-headline);
      font-size: 26px;
      font-weight: 800;
      color: var(--color-on-surface);
      margin: 0 0 6px;
    }
    .head p { color: var(--color-on-secondary-container); font-size: 14px; margin: 0; }

    .form { display: flex; flex-direction: column; gap: 18px; }

    .alt {
      margin-top: 28px;
      text-align: center;
      font-size: 13px;
    }
    .alt a {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--color-on-secondary-container);
      font-weight: 600;
    }
    .alt a:hover { color: var(--color-primary); }
    .alt .material-symbols-outlined { font-size: 18px; }

    .confirm { text-align: center; padding: 8px 0; }
    .confirm-icon {
      width: 72px; height: 72px;
      background: var(--color-primary-fixed);
      color: var(--color-on-primary-fixed);
      border-radius: var(--radius-full);
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 18px;
    }
    .confirm-icon .material-symbols-outlined { font-size: 36px; }
    .confirm-title {
      font-family: var(--font-headline);
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 12px;
    }
    .confirm-body {
      color: var(--color-on-surface-variant);
      font-size: 14px;
      line-height: 1.6;
      max-width: 360px;
      margin: 0 auto;
    }
  `],
})
export class MotDePasseOublieComponent {
  protected readonly FR = FR;
  private readonly fb    = inject(FormBuilder);
  private readonly auth  = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected readonly submitting = signal(false);
  protected readonly sent = signal(false);

  protected errorFor(name: string): string | null {
    const c = this.form.get(name);
    if (!c || !c.touched || !c.errors) return null;
    if (c.errors['required']) return FR.errors.required;
    if (c.errors['email'])    return FR.errors.email;
    return FR.errors.validation;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email } = this.form.getRawValue();
    this.submitting.set(true);

    this.auth.forgotPassword(email).subscribe({
      next: () => {
        this.submitting.set(false);
        this.sent.set(true);
        this.toast.success('Lien envoyé. Consultez votre messagerie.');
      },
      error: () => this.submitting.set(false)
    });
  }
}

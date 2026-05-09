import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputComponent } from '@shared/ui/input/input.component';
import { ToastService } from '@shared/services/toast.service';
import { AuthService } from '@core/services/auth.service';
import { FR } from '@core/i18n/fr.constants';

/**
 * /auth/connexion — login page.
 *
 * Audit fixes:
 *  - C4 : real Reactive Form, submit intercepted, no broken HTML form
 *  - M2 : no Inter / Lexend overrides — uses the design system fonts
 *  - C1 : every label, error and toast in French
 */
@Component({
  selector: 'ac-connexion',
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
      <header class="head">
        <div class="icon-bubble" aria-hidden="true">
          <span class="material-symbols-outlined">login</span>
        </div>
        <h1>{{ FR.auth.loginTitle }}</h1>
        <p>{{ FR.auth.loginSubtitle }}</p>
      </header>

      <form [formGroup]="form" (ngSubmit)="submit()" novalidate aria-label="Formulaire de connexion" class="form">
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

        <div class="password-wrapper">
          <ac-input
            formControlName="password"
            type="password"
            [label]="FR.auth.passwordLabel"
            leadingIcon="lock"
            autocomplete="current-password"
            [required]="true"
            [error]="errorFor('password')"
          />
          <a routerLink="/auth/mot-de-passe-oublie" class="forgot">{{ FR.auth.forgotPasswordLink }}</a>
        </div>

        <label class="remember">
          <input type="checkbox" formControlName="rememberMe" />
          <span>{{ FR.auth.rememberMe }}</span>
        </label>

        <ac-button type="submit" [loading]="submitting()" [fullWidth]="true">
          {{ FR.auth.loginAction }}
        </ac-button>
      </form>

      <p class="alt">
        {{ FR.auth.noAccount }}
        <a routerLink="/auth/inscription">{{ FR.nav.register }}</a>
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
    .head { text-align: center; margin-bottom: 32px; }
    .icon-bubble {
      width: 56px; height: 56px;
      background: var(--color-primary-container);
      color: var(--color-on-primary-container);
      border-radius: var(--radius-xl);
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 16px;
    }
    .icon-bubble .material-symbols-outlined { font-size: 28px; }
    .head h1 {
      font-family: var(--font-headline);
      font-size: 28px;
      font-weight: 800;
      color: var(--color-on-surface);
      margin: 0 0 6px;
    }
    .head p { color: var(--color-on-secondary-container); font-size: 14px; margin: 0; }

    .form { display: flex; flex-direction: column; gap: 18px; }

    .password-wrapper { position: relative; }
    .forgot {
      position: absolute;
      top: 0;
      right: 0;
      font-size: 11px;
      font-weight: 700;
      color: var(--color-primary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .forgot:hover { text-decoration: underline; }

    .remember {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      color: var(--color-on-surface);
      cursor: pointer;
    }
    .remember input { width: 18px; height: 18px; accent-color: var(--color-primary); }

    .alt {
      margin-top: 32px;
      text-align: center;
      font-size: 14px;
      color: var(--color-on-secondary-container);
    }
    .alt a { color: var(--color-primary); font-weight: 700; }
    .alt a:hover { text-decoration: underline; }
  `],
})
export class ConnexionComponent {
  protected readonly FR = FR;
  private readonly fb         = inject(FormBuilder);
  private readonly auth       = inject(AuthService);
  private readonly router     = inject(Router);
  private readonly route      = inject(ActivatedRoute);
  private readonly toast      = inject(ToastService);

  protected readonly form = this.fb.nonNullable.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  protected readonly submitting = signal(false);

  protected errorFor(name: string): string | null {
    const c = this.form.get(name);
    if (!c || !c.touched || !c.errors) return null;
    if (c.errors['required'])  return FR.errors.required;
    if (c.errors['email'])     return FR.errors.email;
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} caractères.`;
    return FR.errors.validation;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.submitting.set(true);

    this.auth.login({ email, password }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.success(FR.toast.loginSuccess);

        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else if (this.auth.isAdmin()) {
          this.router.navigateByUrl('/admin');
        } else {
          this.router.navigateByUrl('/espace');
        }
      },
      error: (err) => {
        this.submitting.set(false);
        const message = err?.error?.title || err?.error?.message || FR.errors.invalidCredentials;
        this.toast.error(message);
      },
    });
  }
}

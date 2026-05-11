import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputComponent } from '@shared/ui/input/input.component';
import { StepperComponent, StepDescriptor } from '@shared/ui/stepper/stepper.component';
import { ToastService } from '@shared/services/toast.service';
import { AuthService } from '@core/services/auth.service';
import { FR } from '@core/i18n/fr.constants';

import { SectorService } from '@core/services/sector.service';
import { GeographyService } from '@core/services/geography.service';
import { City } from '@core/models/geography.model';
import { Sector } from '@core/models/company.model';

/**
 * /auth/inscription — registration in 3 explicit steps.
 *
 * Audit fixes baked in:
 *  - C3 / C10 : real <form> + Reactive Forms (no broken HTML form)
 *  - C4       : submit intercepted, no default GET fallback
 *  - C1 / M2  : every label & message in French; uses design system fonts
 *  - P5       : "S'inscrire" everywhere (verb pronominal)
 *  - Senior   : dynamic sector/city selection + unified registration
 */
@Component({
  selector: 'ac-inscription',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    StepperComponent,
  ],
  template: `
    <div class="auth-card">
      <header class="head">
        <ac-stepper [steps]="steps" [activeIndex]="step()" />
        <h1 class="title">{{ headings[step()] }}</h1>
        <p class="subtitle">{{ subtitles[step()] }}</p>
      </header>

      <!-- Step 1 — compte personnel -->
      @if (step() === 0) {
        <form [formGroup]="accountForm" (ngSubmit)="nextFromAccount()" novalidate aria-label="Étape 1 — informations personnelles" class="form">
          <div class="grid-2">
            <ac-input
              formControlName="firstName"
              [label]="FR.auth.firstNameLabel"
              autocomplete="given-name"
              [required]="true"
              [error]="errorFor(accountForm, 'firstName')"
            />
            <ac-input
              formControlName="lastName"
              [label]="FR.auth.lastNameLabel"
              autocomplete="family-name"
              [required]="true"
              [error]="errorFor(accountForm, 'lastName')"
            />
          </div>

          <ac-input
            formControlName="email"
            type="email"
            [label]="FR.auth.emailLabelPro"
            [placeholder]="FR.auth.emailPlaceholder"
            leadingIcon="mail"
            autocomplete="email"
            [required]="true"
            [error]="errorFor(accountForm, 'email')"
          />

          <ac-input
            formControlName="phone"
            type="tel"
            [label]="FR.auth.phoneLabel"
            placeholder="+242 06 XX XX XX"
            leadingIcon="phone"
            autocomplete="tel"
            [hint]="FR.auth.phoneHint"
            [pattern]="'^\\\\+?242\\\\s?0?[567]\\\\d{2}\\\\s?\\\\d{2}\\\\s?\\\\d{2}\\\\s?\\\\d{2}$'"
            [required]="true"
            [error]="errorFor(accountForm, 'phone')"
          />

          <ac-input
            formControlName="password"
            type="password"
            [label]="FR.auth.passwordLabel"
            leadingIcon="lock"
            autocomplete="new-password"
            [hint]="FR.auth.passwordHint"
            [minlength]="8"
            [required]="true"
            [error]="errorFor(accountForm, 'password')"
          />

          <ac-input
            formControlName="confirmPassword"
            type="password"
            [label]="FR.auth.confirmPasswordLabel"
            leadingIcon="lock"
            autocomplete="new-password"
            [minlength]="8"
            [required]="true"
            [error]="confirmPasswordError()"
          />

          <label class="cgu">
            <input type="checkbox" formControlName="cgu" />
            <span>
              {{ FR.auth.cguAcceptance.split('{cgu}')[0] }}
              <a routerLink="/mentions-legales">{{ FR.auth.cguLabel }}</a>
              {{ FR.auth.cguAcceptance.split('{cgu}')[1].split('{privacy}')[0] }}
              <a routerLink="/confidentialite">{{ FR.auth.privacyLabel }}</a>.
            </span>
          </label>

          <ac-button type="submit" iconRight="arrow_forward" [fullWidth]="true">
            {{ FR.actions.next }}
          </ac-button>
        </form>
      }

      <!-- Step 2 — entreprise -->
      @if (step() === 1) {
        <form [formGroup]="companyForm" (ngSubmit)="submitRegistration()" novalidate aria-label="Étape 2 — informations entreprise" class="form">
          <ac-input
            formControlName="companyName"
            label="Raison sociale"
            leadingIcon="business"
            autocomplete="organization"
            [required]="true"
            [error]="errorFor(companyForm, 'companyName')"
          />

          <div class="grid-2">
            <ac-input
              formControlName="rccm"
              label="Numéro RCCM"
              placeholder="CG-BZV-2025-A-1234"
              [required]="true"
              [error]="errorFor(companyForm, 'rccm')"
            />
            <ac-input
              formControlName="niu"
              label="NIU (Numéro d'Identification Unique)"
              [required]="true"
              [error]="errorFor(companyForm, 'niu')"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-sector">Secteur principal *</label>
            <select id="reg-sector" formControlName="sectorId" class="form-input"
                    [attr.aria-invalid]="companyForm.get('sectorId')?.invalid && companyForm.get('sectorId')?.touched ? true : null">
              <option value="">Sélectionnez un secteur</option>
              @for (s of sectors(); track s.id) {
                <option [value]="s.id">{{ s.name }}</option>
              }
            </select>
            @if (errorFor(companyForm, 'sectorId')) {
              <p class="form-error" role="alert">{{ errorFor(companyForm, 'sectorId') }}</p>
            }
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label" for="reg-city">Ville *</label>
              <select id="reg-city" formControlName="cityId" class="form-input"
                      [attr.aria-invalid]="companyForm.get('cityId')?.invalid && companyForm.get('cityId')?.touched ? true : null">
                <option value="">Sélectionnez une ville</option>
                @for (c of cities(); track c.id) {
                  <option [value]="c.id">{{ c.name }}</option>
                }
              </select>
              @if (errorFor(companyForm, 'cityId')) {
                <p class="form-error" role="alert">{{ errorFor(companyForm, 'cityId') }}</p>
              }
            </div>
            <ac-input
              formControlName="website"
              type="url"
              label="Site web (facultatif)"
              leadingIcon="language"
              placeholder="https://exemple.cg"
              autocomplete="url"
              [error]="errorFor(companyForm, 'website')"
            />
          </div>

          <ac-input
            formControlName="position"
            label="Votre fonction dans l'entreprise"
            leadingIcon="work"
            placeholder="Directeur Général, Responsable…"
            [required]="true"
            [error]="errorFor(companyForm, 'position')"
          />

          <div class="actions-row">
            <ac-button type="button" variant="ghost" iconLeft="arrow_back" (click)="goBack()">
              {{ FR.actions.previous }}
            </ac-button>
            <ac-button type="submit" iconRight="check" [loading]="submitting()" [fullWidth]="true">
              {{ FR.auth.registerAction }}
            </ac-button>
          </div>
        </form>
      }

      <!-- Step 3 — vérification email -->
      @if (step() === 2) {
        <div class="confirm">
          <div class="confirm-icon" aria-hidden="true">
            <span class="material-symbols-outlined icon-filled">mark_email_read</span>
          </div>
          <h2 class="confirm-title">{{ FR.auth.verifyEmailTitle }}</h2>
          <p class="confirm-body">
            Un e-mail de confirmation a été envoyé à
            <strong>{{ accountForm.value.email }}</strong>.
            Cliquez sur le lien qu'il contient pour activer votre compte.
          </p>
          <p class="confirm-help">
            Vous n'avez rien reçu ? Vérifiez vos courriers indésirables ou
            <button type="button" class="link" (click)="resend()">renvoyez l'e-mail</button>.
          </p>
          <div class="actions-row">
            <a routerLink="/auth/connexion" class="btn btn-primary">{{ FR.auth.loginAction }}</a>
          </div>
        </div>
      }

      @if (step() < 2) {
        <p class="alt">
          {{ FR.auth.hasAccount }}
          <a routerLink="/auth/connexion">{{ FR.auth.loginAction }}</a>
        </p>
      }
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; max-width: 560px; }

    .auth-card {
      background: var(--color-surface-container-lowest);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-editorial);
      padding: 40px;
      border: 1px solid var(--color-outline-variant);
    }
    .head { text-align: center; margin-bottom: 28px; }
    .title {
      font-family: var(--font-headline);
      font-size: 26px;
      font-weight: 800;
      color: var(--color-on-surface);
      margin: 24px 0 6px;
    }
    .subtitle { color: var(--color-on-secondary-container); font-size: 14px; margin: 0; }

    .form { display: flex; flex-direction: column; gap: 16px; }
    .grid-2 { display: grid; grid-template-columns: 1fr; gap: 16px; }
    @media (min-width: 640px) { .grid-2 { grid-template-columns: 1fr 1fr; } }

    .cgu {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding-top: 4px;
      font-size: 13px;
      line-height: 1.55;
      color: var(--color-on-surface);
      cursor: pointer;
    }
    .cgu input { width: 18px; height: 18px; margin-top: 3px; accent-color: var(--color-primary); flex-shrink: 0; }
    .cgu a { color: var(--color-primary); font-weight: 600; }
    .cgu a:hover { text-decoration: underline; }

    .actions-row {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }

    .alt {
      margin-top: 24px;
      text-align: center;
      font-size: 14px;
      color: var(--color-on-secondary-container);
    }
    .alt a { color: var(--color-primary); font-weight: 700; }
    .alt a:hover { text-decoration: underline; }

    /* Step 3 */
    .confirm { text-align: center; padding: 12px 0; }
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
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 12px;
    }
    .confirm-body {
      color: var(--color-on-surface-variant);
      font-size: 15px;
      line-height: 1.6;
      max-width: 420px;
      margin: 0 auto 18px;
    }
    .confirm-body strong { color: var(--color-on-surface); }
    .confirm-help { font-size: 13px; color: var(--color-on-secondary-container); margin: 0 0 24px; }
    .link {
      background: none;
      border: none;
      color: var(--color-primary);
      font-weight: 700;
      cursor: pointer;
      padding: 0;
      font: inherit;
    }
    .link:hover { text-decoration: underline; }
  `],
})
export class InscriptionComponent {
  protected readonly FR = FR;
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthService);
  private readonly toast  = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly step = signal<0 | 1 | 2>(0);
  protected readonly submitting = signal(false);
  protected readonly sectors = signal<Sector[]>([]);
  protected readonly cities  = signal<City[]>([]);

  protected readonly steps: StepDescriptor[] = [
    { id: 'compte',       label: FR.auth.stepperAccount },
    { id: 'entreprise',   label: FR.auth.stepperCompany },
    { id: 'verification', label: FR.auth.stepperVerification },
  ];

  protected readonly headings = [
    FR.auth.registerTitle,
    'Informations sur votre entreprise',
    FR.auth.verifyEmailTitle,
  ];
  protected readonly subtitles = [
    'Étape 1 sur 3 — informations personnelles',
    'Étape 2 sur 3 — fiche entreprise',
    'Étape 3 sur 3 — confirmation par e-mail',
  ];

  protected readonly accountForm = this.fb.nonNullable.group(
    {
      firstName:       ['', [Validators.required, Validators.minLength(2)]],
      lastName:        ['', [Validators.required, Validators.minLength(2)]],
      email:           ['', [Validators.required, Validators.email]],
      phone:           ['', [Validators.required, Validators.pattern(/^\+?242\s?0?[567]\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/)]],
      password:        ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      cgu:             [false, Validators.requiredTrue],
    },
    { validators: [matchPasswords('password', 'confirmPassword')] }
  );

  protected readonly companyForm = this.fb.nonNullable.group({
    companyName: ['', [Validators.required, Validators.minLength(2)]],
    rccm:        ['', [Validators.required, Validators.pattern(/^[A-Z]{2,3}-[A-Z]{2,4}-\d{4}-[A-Z]-\d{3,5}$/)]],
    niu:         ['', [Validators.required, Validators.minLength(8)]],
    sectorId:    ['', Validators.required],
    cityId:      ['', Validators.required],
    website:     ['', Validators.pattern(/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}.*$/i)],
    position:    ['', Validators.required],
  });

  constructor() {
    const sectorService = inject(SectorService);
    const geographyService = inject(GeographyService);

    sectorService.getSectors().subscribe(s => this.sectors.set(s));
    geographyService.getCities().subscribe(c => this.cities.set(c));
  }

  protected readonly confirmPasswordError = computed(() => {
    const c = this.accountForm.get('confirmPassword');
    if (!c || !c.touched) return null;
    if (c.errors?.['required']) return FR.errors.required;
    if (this.accountForm.errors?.['mismatch']) return FR.errors.passwordMismatch;
    return null;
  });

  protected errorFor(form: AbstractControl, name: string): string | null {
    const c = form.get(name);
    if (!c || !c.touched || !c.errors) return null;
    if (c.errors['required'])  return FR.errors.required;
    if (c.errors['email'])     return FR.errors.email;
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} caractères.`;
    if (c.errors['pattern'])   {
      if (name === 'phone') return FR.errors.phoneCG;
      if (name === 'rccm')  return 'Format attendu : CG-BZV-2025-A-1234';
      if (name === 'website') return 'URL invalide. Exemple : https://exemple.cg';
      return FR.errors.pattern;
    }
    if (c.errors['requiredTrue']) return FR.errors.cguRequired;
    return FR.errors.validation;
  }

  protected nextFromAccount(): void {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }
    this.step.set(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected goBack(): void {
    this.step.set(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected submitRegistration(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }
    const account = this.accountForm.getRawValue();
    const company = this.companyForm.getRawValue();

    this.submitting.set(true);
    this.auth.register({
      firstName: account.firstName,
      lastName:  account.lastName,
      email:     account.email,
      phoneNumber: account.phone,
      password:  account.password,
      companyPosition: company.position,
      companyName: company.companyName,
      cityId:    company.cityId,
      sectorIds: [company.sectorId],
      website:   company.website || undefined,
      rccm:      company.rccm,
      niu:       company.niu
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.success(FR.toast.registerSuccess);
        this.step.set(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        this.submitting.set(false);
        const message = err?.error?.title || err?.error?.message || FR.errors.serverError;
        this.toast.error(message);
      },
    });
  }

  protected resend(): void {
    // Mock until backend supports email resend
    this.toast.info('Un nouvel e-mail de confirmation vous a été envoyé.');
  }
}

/** Cross-field validator: confirms password === confirmPassword. */
function matchPasswords(passwordKey: string, confirmKey: string) {
  return (group: AbstractControl): ValidationErrors | null => {
    const p = group.get(passwordKey)?.value;
    const c = group.get(confirmKey)?.value;
    if (!p || !c) return null;
    return p === c ? null : { mismatch: true };
  };
}

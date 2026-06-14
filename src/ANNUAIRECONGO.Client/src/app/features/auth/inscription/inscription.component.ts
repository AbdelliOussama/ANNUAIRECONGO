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

type UserType = 'BusinessOwner' | 'RegularUser';

/**
 * /auth/inscription — role-choice-first registration.
 *
 * Step 0 : Choose account type (BusinessOwner | RegularUser)
 * Step 1 : Personal information (common to both paths)
 * Step 2 : Company information  (BusinessOwner only — skipped for RegularUser)
 * Step 3 : Email verification   (confirmation screen, both paths)
 *
 * Zero breaking changes: existing BO form + auth.register() call is untouched;
 * RegularUser calls auth.registerAsUser() and jumps from step 1 directly to step 3.
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
        <ac-stepper [steps]="currentSteps()" [activeIndex]="stepperIndex()" />
        <h1 class="title">{{ currentHeading() }}</h1>
        <p class="subtitle">{{ currentSubtitle() }}</p>
      </header>

      <!-- ─────────────────────────────────────────────────────────────
           STEP 0 — Choose account type
      ───────────────────────────────────────────────────────────── -->
      @if (step() === 0) {
        <div class="type-chooser" role="group" aria-label="Choisissez un type de compte">
          <button
            type="button"
            class="type-card"
            [class.is-selected]="userType() === 'BusinessOwner'"
            (click)="selectType('BusinessOwner')"
            [attr.aria-pressed]="userType() === 'BusinessOwner'"
          >
            <span class="type-icon material-symbols-outlined" aria-hidden="true">store</span>
            <strong class="type-title">Propriétaire d'entreprise</strong>
            <p class="type-desc">
              Inscrivez votre entreprise dans l'annuaire, gérez votre fiche,
              vos documents et vos abonnements.
            </p>
          </button>

          <button
            type="button"
            class="type-card"
            [class.is-selected]="userType() === 'RegularUser'"
            (click)="selectType('RegularUser')"
            [attr.aria-pressed]="userType() === 'RegularUser'"
          >
            <span class="type-icon material-symbols-outlined" aria-hidden="true">person_search</span>
            <strong class="type-title">Utilisateur / Consultant</strong>
            <p class="type-desc">
              Consultez les fiches d'entreprises et accédez aux documents légaux
              grâce à un abonnement.
            </p>
          </button>
        </div>

        <ac-button
          type="button"
          iconRight="arrow_forward"
          [fullWidth]="true"
          [disabled]="!userType()"
          (click)="nextFromTypeChoice()"
        >
          {{ FR.actions.next }}
        </ac-button>

        <p class="alt">
          {{ FR.auth.hasAccount }}
          <a routerLink="/auth/connexion">{{ FR.auth.loginAction }}</a>
        </p>
      }

      <!-- ─────────────────────────────────────────────────────────────
           STEP 1 — Personal information (common)
      ───────────────────────────────────────────────────────────── -->
      @if (step() === 1) {
        <form [formGroup]="accountForm" (ngSubmit)="nextFromAccount()" novalidate
              aria-label="Étape — informations personnelles" class="form">
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
            [pattern]="'^(?:\\\\+?242)?[\\\\s.-]?0?[4567](?:[\\\\s.-]?\\\\d){7}$'"
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

          <div class="actions-row">
            <ac-button type="button" variant="ghost" iconLeft="arrow_back" (click)="goBack()">
              {{ FR.actions.previous }}
            </ac-button>
            @if (userType() === 'RegularUser') {
              <!-- RU: submit directly from step 1 (no company step) -->
              <ac-button type="submit" iconRight="check" [loading]="submitting()" [fullWidth]="true">
                {{ FR.auth.registerAction }}
              </ac-button>
            } @else {
              <!-- BO: advance to company step -->
              <ac-button type="submit" iconRight="arrow_forward" [fullWidth]="true">
                {{ FR.actions.next }}
              </ac-button>
            }
          </div>
        </form>

        <p class="alt">
          {{ FR.auth.hasAccount }}
          <a routerLink="/auth/connexion">{{ FR.auth.loginAction }}</a>
        </p>
      }

      <!-- ─────────────────────────────────────────────────────────────
           STEP 2 — Company information (BusinessOwner only)
      ───────────────────────────────────────────────────────────── -->
      @if (step() === 2 && userType() === 'BusinessOwner') {
        <form [formGroup]="companyForm" (ngSubmit)="submitRegistration()" novalidate
              aria-label="Étape — informations entreprise" class="form">
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
              label="Numéro RCCM (facultatif)"
              placeholder="CG-BZV-2025-A-1234"
              hint="Format : CG-BZV-2025-A-1234. Ce champ peut être renseigné plus tard."
              [error]="errorFor(companyForm, 'rccm')"
            />
            <ac-input
              formControlName="niu"
              label="NIU - Identifiant fiscal (facultatif)"
              placeholder="Ex. : M2025BZV00123"
              hint="Ce champ peut être complété après validation de votre fiche."
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

        <p class="alt">
          {{ FR.auth.hasAccount }}
          <a routerLink="/auth/connexion">{{ FR.auth.loginAction }}</a>
        </p>
      }

      <!-- ─────────────────────────────────────────────────────────────
           STEP 3 — Email verification (final confirmation, both paths)
      ───────────────────────────────────────────────────────────── -->
      @if (step() === 3) {
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

    /* ── Type chooser (Step 0) ── */
    .type-chooser {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    @media (max-width: 480px) { .type-chooser { grid-template-columns: 1fr; } }

    .type-card {
      all: unset;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      padding: 20px;
      border: 2px solid var(--color-outline-variant);
      border-radius: var(--radius-xl);
      cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
      text-align: left;
      width: 100%;
      box-sizing: border-box;
    }
    .type-card:hover {
      border-color: var(--color-primary);
      background: var(--color-primary-fixed);
    }
    .type-card.is-selected {
      border-color: var(--color-primary);
      background: var(--color-primary-container);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent);
    }
    .type-icon {
      font-size: 28px;
      color: var(--color-primary);
    }
    .type-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--color-on-surface);
    }
    .type-desc {
      font-size: 13px;
      color: var(--color-on-surface-variant);
      line-height: 1.55;
      margin: 0;
    }

    /* ── Shared form styles ── */
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

    .actions-row { display: flex; gap: 12px; margin-top: 8px; }

    .alt {
      margin-top: 24px;
      text-align: center;
      font-size: 14px;
      color: var(--color-on-secondary-container);
    }
    .alt a { color: var(--color-primary); font-weight: 700; }
    .alt a:hover { text-decoration: underline; }

    /* ── Confirmation (Step 3) ── */
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

  // ── State ──────────────────────────────────────────────────────────
  /** Current wizard step: 0=type, 1=account, 2=company(BO only), 3=verify */
  protected readonly step       = signal<0 | 1 | 2 | 3>(0);
  protected readonly userType   = signal<UserType | null>(null);
  protected readonly submitting = signal(false);
  protected readonly sectors    = signal<Sector[]>([]);
  protected readonly cities     = signal<City[]>([]);

  // ── Stepper descriptors ────────────────────────────────────────────
  private readonly boSteps: StepDescriptor[] = [
    { id: 'type',         label: 'Type de compte' },
    { id: 'compte',       label: FR.auth.stepperAccount },
    { id: 'entreprise',   label: FR.auth.stepperCompany },
    { id: 'verification', label: FR.auth.stepperVerification },
  ];

  private readonly ruSteps: StepDescriptor[] = [
    { id: 'type',         label: 'Type de compte' },
    { id: 'compte',       label: FR.auth.stepperAccount },
    { id: 'verification', label: FR.auth.stepperVerification },
  ];

  /** Active step descriptors change based on selected role. */
  protected readonly currentSteps = computed<StepDescriptor[]>(() =>
    this.userType() === 'RegularUser' ? this.ruSteps : this.boSteps
  );

  /**
   * Maps internal step number to the visual stepper index.
   * For RegularUser, step 3 (verify) maps to index 2 (there is no index 3).
   */
  protected readonly stepperIndex = computed(() => {
    const s = this.step();
    if (this.userType() === 'RegularUser') {
      return s === 3 ? 2 : s;
    }
    return s;
  });

  // ── Dynamic headings / subtitles ───────────────────────────────────
  protected readonly currentHeading = computed(() => {
    switch (this.step()) {
      case 0:  return 'Créer un compte';
      case 1:  return FR.auth.registerTitle;
      case 2:  return 'Informations sur votre entreprise';
      case 3:  return FR.auth.verifyEmailTitle;
      default: return 'Créer un compte';
    }
  });

  protected readonly currentSubtitle = computed(() => {
    const isBO = this.userType() === 'BusinessOwner';
    switch (this.step()) {
      case 0:  return 'Choisissez le type de compte qui vous correspond';
      case 1:  return isBO
        ? 'Étape 2 sur 4 — informations personnelles'
        : 'Étape 2 sur 3 — informations personnelles';
      case 2:  return 'Étape 3 sur 4 — fiche entreprise';
      case 3:  return isBO
        ? 'Étape 4 sur 4 — confirmation par e-mail'
        : 'Étape 3 sur 3 — confirmation par e-mail';
      default: return '';
    }
  });

  // ── Forms ──────────────────────────────────────────────────────────
  protected readonly accountForm = this.fb.nonNullable.group(
    {
      firstName:       ['', [Validators.required, Validators.minLength(2)]],
      lastName:        ['', [Validators.required, Validators.minLength(2)]],
      email:           ['', [Validators.required, Validators.email]],
      phone:           ['', [Validators.required, Validators.pattern(/^(?:\+?242)?[\s.-]?0?[4567](?:[\s.-]?\d){7}$/)]],
      password:        ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      cgu:             [false, Validators.requiredTrue],
    },
    { validators: [matchPasswords('password', 'confirmPassword')] }
  );

  protected readonly companyForm = this.fb.nonNullable.group({
    companyName: ['', [Validators.required, Validators.minLength(2)]],
    // RCCM and NIU are optional — admin validates during review.
    rccm:        ['', [Validators.pattern(/^[A-Za-z0-9][A-Za-z0-9\-]{2,29}$/)]],
    niu:         ['', [Validators.minLength(4), Validators.maxLength(30)]],
    sectorId:    ['', Validators.required],
    cityId:      ['', Validators.required],
    website:     ['', Validators.pattern(/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}.*$/i)],
    position:    ['', Validators.required],
  });

  constructor() {
    const sectorService    = inject(SectorService);
    const geographyService = inject(GeographyService);

    sectorService.getSectors().subscribe(s => this.sectors.set(s));
    geographyService.getCities().subscribe(c => this.cities.set(c));
  }

  // ── Error helpers ──────────────────────────────────────────────────
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
    if (c.errors['required'])     return FR.errors.required;
    if (c.errors['email'])        return FR.errors.email;
    if (c.errors['minlength'])    return `Minimum ${c.errors['minlength'].requiredLength} caractères.`;
    if (c.errors['pattern']) {
      if (name === 'phone')   return FR.errors.phoneCG;
      if (name === 'rccm')    return 'Format invalide. Exemple : CG-BZV-2025-A-1234 ou RCCM-12345';
      if (name === 'website') return 'URL invalide. Exemple : https://exemple.cg';
      return FR.errors.pattern;
    }
    if (c.errors['requiredTrue']) return FR.errors.cguRequired;
    return FR.errors.validation;
  }

  // ── Navigation ─────────────────────────────────────────────────────
  protected selectType(type: UserType): void {
    this.userType.set(type);
  }

  protected nextFromTypeChoice(): void {
    if (!this.userType()) return;
    this.step.set(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Called when Step 1 form is submitted.
   * - BusinessOwner → advance to Step 2 (company form)
   * - RegularUser   → submit registration immediately, then go to Step 3
   */
  protected nextFromAccount(): void {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }
    if (this.userType() === 'RegularUser') {
      this.submitRegularUser();
    } else {
      this.step.set(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  protected goBack(): void {
    const prev = Math.max(0, this.step() - 1) as 0 | 1 | 2 | 3;
    this.step.set(prev);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Submission ─────────────────────────────────────────────────────

  /** BusinessOwner path: called from Step 2 company form submit. */
  protected submitRegistration(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }
    const account = this.accountForm.getRawValue();
    const company = this.companyForm.getRawValue();

    this.submitting.set(true);
    this.auth.register({
      firstName:       account.firstName,
      lastName:        account.lastName,
      email:           account.email,
      phoneNumber:     account.phone,
      password:        account.password,
      companyPosition: company.position,
      companyName:     company.companyName,
      cityId:          company.cityId,
      sectorIds:       [company.sectorId],
      website:         company.website || undefined,
      rccm:            company.rccm,
      niu:             company.niu,
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.success(FR.toast.registerSuccess);
        this.step.set(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        this.submitting.set(false);
        const message = err?.error?.title || err?.error?.message || FR.errors.serverError;
        this.toast.error(message);
      },
    });
  }

  /** RegularUser path: called from Step 1 when userType is RegularUser. */
  private submitRegularUser(): void {
    const account = this.accountForm.getRawValue();

    this.submitting.set(true);
    this.auth.registerAsUser({
      firstName:   account.firstName,
      lastName:    account.lastName,
      email:       account.email,
      phoneNumber: account.phone,
      password:    account.password,
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.success(FR.toast.registerSuccess);
        this.step.set(3);
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
    const email = this.accountForm.value.email;
    if (email) {
      this.auth.resendVerification(email).subscribe();
    }
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

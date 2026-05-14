import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputComponent } from '@shared/ui/input/input.component';
import { ToastService } from '@shared/services/toast.service';
import { ModalService } from '@shared/services/modal.service';
import { AuthService } from '@core/services/auth.service';
import { FR } from '@core/i18n/fr.constants';

/**
 * /espace/compte — account settings (identité + mot de passe + suppression).
 */
@Component({
  selector: 'ac-espace-compte',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
  ],
  template: `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">Mon compte</p>
        <h1>Paramètres du compte</h1>
        <p class="sub">Gérez vos informations personnelles et la sécurité de votre compte.</p>
      </header>

      <!-- Identité -->
      <fieldset class="card">
        <legend>Identité</legend>
        <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" novalidate>
          <div class="grid-2">
            <ac-input formControlName="firstName" [label]="FR.auth.firstNameLabel" [required]="true" [error]="profileError('firstName')" />
            <ac-input formControlName="lastName"  [label]="FR.auth.lastNameLabel"  [required]="true" [error]="profileError('lastName')" />
          </div>
          <ac-input formControlName="email" type="email" [label]="FR.auth.emailLabel" leadingIcon="mail" [required]="true" [error]="profileError('email')" />
          <ac-input formControlName="phone" type="tel"   [label]="FR.auth.phoneLabel" leadingIcon="phone" [hint]="FR.auth.phoneHint" [error]="profileError('phone')" />
          <ac-input formControlName="position" label="Fonction dans l'entreprise" leadingIcon="work" [error]="profileError('position')" />

          <div class="actions">
            <ac-button type="submit" [loading]="savingProfile()">Enregistrer</ac-button>
          </div>
        </form>
      </fieldset>

      <!-- Mot de passe -->
      <fieldset class="card">
        <legend>Sécurité</legend>
        <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" novalidate>
          <ac-input formControlName="current" type="password" label="Mot de passe actuel" leadingIcon="lock" [required]="true" [error]="passwordError('current')" />
          <ac-input formControlName="next"    type="password" [label]="FR.auth.passwordLabel" leadingIcon="lock" [hint]="FR.auth.passwordHint" [minlength]="8" [required]="true" [error]="passwordError('next')" />
          <ac-input formControlName="confirm" type="password" [label]="FR.auth.confirmPasswordLabel" leadingIcon="lock" [minlength]="8" [required]="true" [error]="confirmError()" />

          <div class="actions">
            <ac-button type="submit" [loading]="savingPassword()" variant="outline">Changer le mot de passe</ac-button>
          </div>
        </form>
      </fieldset>

      <!-- Suppression de compte & Export RGPD -->
      <fieldset class="card danger">
        <legend>Zone sensible & RGPD</legend>
        <p class="danger-text">
          Vous avez le droit de demander l'exportation de l'intégralité de vos données personnelles (RGPD).
        </p>
        <div class="actions" style="margin-bottom: 16px;">
          <ac-button variant="outline" (click)="exportMyData()" [loading]="exportingData()" iconLeft="download">
            Exporter mes données
          </ac-button>
        </div>

        <p class="danger-text">
          La suppression définitive de votre compte entraînera l'archivage de votre fiche
          entreprise et la résiliation de votre abonnement. Les données personnelles seront
          anonymisées dans les 12 mois.
        </p>
        <div class="actions">
          <ac-button variant="danger" (click)="confirmDelete()" iconLeft="delete">
            Supprimer mon compte
          </ac-button>
        </div>
      </fieldset>

      <p class="signout">
        <a routerLink="/" (click)="signOut($event)" class="link">
          <span class="material-symbols-outlined" aria-hidden="true">logout</span>
          Se déconnecter
        </a>
      </p>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { max-width: 760px; margin: 0 auto; padding: 8px 4px 32px; display: flex; flex-direction: column; gap: 20px; }
    .page-head h1 { font-family: var(--font-headline); font-size: 30px; font-weight: 800; margin: 6px 0 8px; }
    .page-head .sub { color: var(--color-on-secondary-container); font-size: 14px; margin: 0; max-width: 560px; line-height: 1.55; }

    fieldset.card {
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-2xl);
      padding: 24px;
    }
    fieldset.card.danger {
      background: rgba(186, 26, 26, 0.05);
      border-color: rgba(186, 26, 26, 0.18);
    }
    legend {
      font-family: var(--font-headline);
      font-size: 16px;
      font-weight: 700;
      color: var(--color-on-surface);
      padding: 0 8px;
      margin-left: -8px;
    }

    form { display: flex; flex-direction: column; gap: 14px; }
    .grid-2 { display: grid; grid-template-columns: 1fr; gap: 14px; }
    @media (min-width: 640px) { .grid-2 { grid-template-columns: 1fr 1fr; } }

    .actions { display: flex; justify-content: flex-end; padding-top: 4px; }

    .danger-text { color: var(--color-on-error-container); font-size: 14px; line-height: 1.6; margin: 0 0 16px; }

    .signout { text-align: center; margin: 4px 0 0; }
    .signout .link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--color-on-secondary-container);
      font-weight: 600;
      font-size: 13px;
    }
    .signout .link:hover { color: var(--color-error); }
    .signout .material-symbols-outlined { font-size: 18px; }
  `],
})
export class EspaceCompteComponent {
  protected readonly FR = FR;
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthService);
  private readonly toast  = inject(ToastService);
  private readonly modal  = inject(ModalService);
  private readonly router = inject(Router);

  private readonly user = this.auth.currentUser();

  protected readonly profileForm = this.fb.nonNullable.group({
    firstName: [this.user?.firstName ?? '', [Validators.required, Validators.minLength(2)]],
    lastName:  [this.user?.lastName  ?? '', [Validators.required, Validators.minLength(2)]],
    email:     [this.user?.email     ?? '', [Validators.required, Validators.email]],
    phone:     [this.user?.phoneNumber ?? '', [Validators.pattern(/^\+?242\s?0?[567]\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/)]],
    position:  [this.user?.companyPosition ?? ''],
  });

  protected readonly passwordForm = this.fb.nonNullable.group(
    {
      current: ['', Validators.required],
      next:    ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', Validators.required],
    },
    { validators: matchPasswords('next', 'confirm') }
  );

  protected readonly savingProfile  = signal(false);
  protected readonly savingPassword = signal(false);
  protected readonly exportingData  = signal(false);

  protected profileError(name: string): string | null {
    return commonError(this.profileForm.get(name), name);
  }
  protected passwordError(name: string): string | null {
    return commonError(this.passwordForm.get(name), name);
  }
  protected confirmError(): string | null {
    const c = this.passwordForm.get('confirm');
    if (!c || !c.touched) return null;
    if (c.errors?.['required']) return FR.errors.required;
    if (this.passwordForm.errors?.['mismatch']) return FR.errors.passwordMismatch;
    return null;
  }

  protected saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.savingProfile.set(true);
    const data = this.profileForm.getRawValue();
    this.auth.updateProfile(data).subscribe({
      next: () => {
        this.savingProfile.set(false);
        this.toast.success(FR.toast.saved);
        this.auth.refreshUser(); // Need to add this to AuthService
      },
      error: () => this.savingProfile.set(false)
    });
  }

  protected changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.savingPassword.set(true);
    const { current, next } = this.passwordForm.getRawValue();
    this.auth.changePassword({ currentPassword: current, newPassword: next }).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordForm.reset();
        this.toast.success('Mot de passe modifié.');
      },
      error: () => this.savingPassword.set(false)
    });
  }

  protected exportMyData(): void {
    this.exportingData.set(true);
    this.auth.exportData().subscribe({
      next: (blob) => {
        this.exportingData.set(false);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rgpd_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.exportingData.set(false);
        this.toast.error('Erreur lors de l\'export des données.');
      }
    });
  }

  protected async confirmDelete(): Promise<void> {
    const { confirmed } = await this.modal.confirm({
      title: 'Supprimer définitivement mon compte ?',
      body: 'Cette action est irréversible. Votre fiche entreprise sera archivée et votre abonnement résilié.',
      tone: 'danger',
      confirmLabel: 'Supprimer mon compte',
      cancelLabel:  'Annuler',
    });
    if (!confirmed) return;
    
    this.auth.deleteAccount().subscribe({
      next: () => {
        this.toast.success('Compte supprimé. Vous allez être déconnecté.');
        setTimeout(() => this.auth.logout(), 1500);
      }
    });
  }

  protected signOut(e: Event): void {
    e.preventDefault();
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}

function commonError(c: AbstractControl | null, name: string): string | null {
  if (!c || !c.touched || !c.errors) return null;
  if (c.errors['required'])  return FR.errors.required;
  if (c.errors['email'])     return FR.errors.email;
  if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} caractères.`;
  if (c.errors['pattern'])   return name === 'phone' ? FR.errors.phoneCG : FR.errors.pattern;
  return FR.errors.validation;
}

function matchPasswords(passwordKey: string, confirmKey: string) {
  return (group: AbstractControl): ValidationErrors | null => {
    const p = group.get(passwordKey)?.value;
    const c = group.get(confirmKey)?.value;
    if (!p || !c) return null;
    return p === c ? null : { mismatch: true };
  };
}

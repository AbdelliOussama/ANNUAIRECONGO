import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '@shared/services/toast.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputComponent } from '@shared/ui/input/input.component';
import { FR } from '@core/i18n/fr.constants';

/**
 * /contact — formulaire de contact + coordonnées officielles.
 * Le submit est mocké : l'API "/contact" sera branchée plus tard.
 */
@Component({
  selector: 'ac-contact',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <section class="hero">
      <div class="max-w-4xl mx-auto px-6 md:px-12 text-center">
        <p class="eyebrow mb-4">Contact</p>
        <h1 class="text-4xl md:text-5xl font-black font-headline tracking-tight mb-6">
          Une question ? Notre équipe vous répond.
        </h1>
        <p class="text-lg text-secondary leading-relaxed max-w-2xl mx-auto">
          Service commercial, support technique ou demande institutionnelle :
          écrivez-nous et nous revenons vers vous sous 24 h ouvrées.
        </p>
      </div>
    </section>

    <section class="py-16 px-6 md:px-12 max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
      <!-- Coordinates -->
      <div class="info">
        <h2 class="info-title">Coordonnées officielles</h2>
        <ul class="info-list">
          <li>
            <div class="info-icon"><span class="material-symbols-outlined" aria-hidden="true">mail</span></div>
            <div>
              <p class="info-label">E-mail général</p>
              <a href="mailto:contact&#64;annuaire-congo.cg" class="info-value">contact&#64;annuaire-congo.cg</a>
            </div>
          </li>
          <li>
            <div class="info-icon"><span class="material-symbols-outlined" aria-hidden="true">phone</span></div>
            <div>
              <p class="info-label">Téléphone</p>
              <a href="tel:+242066000000" class="info-value">+242 06 600 00 00</a>
            </div>
          </li>
          <li>
            <div class="info-icon"><span class="material-symbols-outlined" aria-hidden="true">location_on</span></div>
            <div>
              <p class="info-label">Adresse</p>
              <span class="info-value">Avenue Patrice Lumumba, Brazzaville, République du Congo</span>
            </div>
          </li>
          <li>
            <div class="info-icon"><span class="material-symbols-outlined" aria-hidden="true">schedule</span></div>
            <div>
              <p class="info-label">Heures d'ouverture</p>
              <span class="info-value">Lundi à Vendredi, 8 h – 17 h (heure du Congo)</span>
            </div>
          </li>
        </ul>

        <div class="quick">
          <p class="quick-label">Vous représentez une institution publique ?</p>
          <a href="mailto:institutions&#64;annuaire-congo.cg" class="btn btn-outline btn-sm">institutions&#64;annuaire-congo.cg</a>
        </div>
      </div>

      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate aria-label="Formulaire de contact" class="card-form">
        <h2 class="info-title">Envoyer un message</h2>

        <ac-input
          formControlName="name"
          label="Nom complet"
          [required]="true"
          autocomplete="name"
          [error]="errorFor('name')"
        />

        <ac-input
          formControlName="email"
          type="email"
          label="Adresse e-mail"
          leadingIcon="mail"
          [required]="true"
          autocomplete="email"
          [error]="errorFor('email')"
        />

        <ac-input
          formControlName="subject"
          label="Sujet"
          [required]="true"
          [error]="errorFor('subject')"
        />

        <div class="form-group">
          <label class="form-label" for="contact-message">Message *</label>
          <textarea
            id="contact-message"
            formControlName="message"
            class="form-input"
            rows="5"
            [attr.aria-invalid]="form.get('message')?.invalid && form.get('message')?.touched ? true : null"
            placeholder="Détaillez votre demande…"
          ></textarea>
          <p class="form-error" role="alert" aria-live="polite">{{ errorFor('message') }}</p>
        </div>

        <ac-button type="submit" [loading]="submitting()" [fullWidth]="true">
          {{ FR.actions.submit }}
        </ac-button>
      </form>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .hero { padding: 96px 0 32px; }

    .info-title {
      font-family: var(--font-headline);
      font-size: 22px;
      font-weight: 700;
      color: var(--color-on-surface);
      margin: 0 0 24px;
    }
    .info-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 18px; }
    .info-list li { display: flex; gap: 14px; }
    .info-icon {
      width: 40px; height: 40px;
      flex-shrink: 0;
      border-radius: var(--radius-md);
      background: var(--color-primary-fixed);
      color: var(--color-on-primary-fixed);
      display: inline-flex; align-items: center; justify-content: center;
    }
    .info-label {
      font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
      color: var(--color-outline); margin: 0 0 4px;
    }
    .info-value {
      color: var(--color-on-surface);
      font-weight: 600;
      text-decoration: none;
    }
    a.info-value:hover { color: var(--color-primary); }

    .quick {
      margin-top: 32px;
      padding: 18px;
      background: var(--color-surface-container-low);
      border-radius: var(--radius-lg);
    }
    .quick-label { color: var(--color-on-secondary-container); font-size: 14px; margin: 0 0 10px; }

    .card-form {
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-2xl);
      padding: 32px;
      box-shadow: var(--shadow-card);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    textarea.form-input { font-family: var(--font-body); resize: vertical; min-height: 140px; }
  `],
})
export class ContactComponent {
  protected readonly FR = FR;
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected readonly form = this.fb.nonNullable.group({
    name:    ['', [Validators.required, Validators.minLength(2)]],
    email:   ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required, Validators.minLength(3)]],
    message: ['', [Validators.required, Validators.minLength(10)]],
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

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    // Mock send — replace with API call later.
    await new Promise((r) => setTimeout(r, 700));
    this.toast.success(FR.toast.sent);
    this.form.reset();
    this.submitting.set(false);
  }
}

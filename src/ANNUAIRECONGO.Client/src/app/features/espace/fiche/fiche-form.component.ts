import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MockEspaceService } from '@core/services/mock/mock-espace.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputComponent } from '@shared/ui/input/input.component';
import { ToastService } from '@shared/services/toast.service';
import { FR } from '@core/i18n/fr.constants';

/**
 * Shared form for /espace/fiche/creer and /espace/fiche/editer.
 *
 * The mode input switches the page heading and the success message but the
 * underlying FormGroup is identical. Audit C9 — the editor is reachable from
 * the console once a fiche exists; if not, the same form is used to *create*
 * the very first fiche from /espace/fiche/creer.
 */
@Component({
  selector: 'ac-fiche-form',
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
        <p class="eyebrow">{{ mode() === 'create' ? 'Nouvelle fiche' : 'Ma fiche entreprise' }}</p>
        <h1>{{ mode() === 'create' ? 'Créer ma fiche entreprise' : 'Modifier ma fiche' }}</h1>
        <p class="sub">
          @if (mode() === 'create') {
            Renseignez les informations essentielles. Votre fiche sera soumise à validation
            manuelle avant publication (sous 48 h ouvrées).
          } @else {
            Toute modification est soumise à une nouvelle validation par notre équipe avant
            d'être visible sur l'annuaire public.
          }
        </p>
      </header>

      <form [formGroup]="form" (ngSubmit)="submit()" novalidate aria-label="Formulaire de fiche entreprise">
        <!-- Section: Identité -->
        <fieldset class="card">
          <legend>Identité de l'entreprise</legend>

          <ac-input
            formControlName="name"
            label="Raison sociale"
            leadingIcon="business"
            [required]="true"
            [error]="errorFor('name')"
          />

          <div class="form-group">
            <label class="form-label" for="fiche-description">Description *</label>
            <textarea
              id="fiche-description"
              formControlName="description"
              class="form-input"
              rows="4"
              placeholder="Décrivez votre activité, vos services et votre zone d'intervention…"
              [attr.aria-invalid]="form.get('description')?.invalid && form.get('description')?.touched ? true : null"
            ></textarea>
            @if (errorFor('description')) {
              <p class="form-error" role="alert">{{ errorFor('description') }}</p>
            } @else {
              <p class="text-xs text-outline">300 caractères maximum.</p>
            }
          </div>

          <div class="grid-2">
            <ac-input formControlName="rccm" label="Numéro RCCM" placeholder="CG-BZV-2025-A-1234" [required]="true" [error]="errorFor('rccm')" />
            <ac-input formControlName="niu"  label="NIU" [required]="true" [error]="errorFor('niu')" />
          </div>
        </fieldset>

        <!-- Section: Secteur & localisation -->
        <fieldset class="card">
          <legend>Secteur & localisation</legend>

          <div class="form-group">
            <label class="form-label" for="fiche-sector">Secteur principal *</label>
            <select id="fiche-sector" formControlName="sector" class="form-input"
                    [attr.aria-invalid]="form.get('sector')?.invalid && form.get('sector')?.touched ? true : null">
              <option value="">Sélectionnez un secteur</option>
              <option [value]="FR.sectors.maritime.slug">{{ FR.sectors.maritime.name }}</option>
              <option [value]="FR.sectors.logistique.slug">{{ FR.sectors.logistique.name }}</option>
              <option [value]="FR.sectors.douane.slug">{{ FR.sectors.douane.name }}</option>
              <option [value]="FR.sectors.industrie.slug">{{ FR.sectors.industrie.name }}</option>
              <option [value]="FR.sectors.securite.slug">{{ FR.sectors.securite.name }}</option>
              <option [value]="FR.sectors.manutention.slug">{{ FR.sectors.manutention.name }}</option>
            </select>
            @if (errorFor('sector')) {
              <p class="form-error" role="alert">{{ errorFor('sector') }}</p>
            }
          </div>

          <div class="grid-2">
            <ac-input formControlName="city" label="Ville" placeholder="Pointe-Noire, Brazzaville…" [required]="true" [error]="errorFor('city')" />
            <ac-input formControlName="address" label="Adresse complète" leadingIcon="location_on" [required]="true" [error]="errorFor('address')" />
          </div>
        </fieldset>

        <!-- Section: Contacts -->
        <fieldset class="card">
          <legend>Contacts publics</legend>

          <div class="grid-2">
            <ac-input
              formControlName="phone"
              type="tel"
              label="Téléphone"
              leadingIcon="phone"
              [hint]="FR.auth.phoneHint"
              placeholder="+242 06 XX XX XX"
              [required]="true"
              [error]="errorFor('phone')"
            />
            <ac-input
              formControlName="email"
              type="email"
              label="E-mail public"
              leadingIcon="mail"
              placeholder="contact@entreprise.cg"
              [required]="true"
              [error]="errorFor('email')"
            />
          </div>

          <ac-input
            formControlName="website"
            type="url"
            label="Site web (facultatif)"
            leadingIcon="language"
            placeholder="https://exemple.cg"
            [error]="errorFor('website')"
          />
        </fieldset>

        <!-- Section: Médias (placeholder uploaders) -->
        <fieldset class="card">
          <legend>Médias et documents</legend>
          <div class="upload-row">
            <div class="upload">
              <span class="material-symbols-outlined" aria-hidden="true">image</span>
              <p class="upload-title">Logo de l'entreprise</p>
              <p class="upload-hint">PNG, JPG ou SVG — 2 Mo maximum.</p>
              <button type="button" class="btn btn-ghost btn-sm">Choisir un fichier</button>
            </div>
            <div class="upload">
              <span class="material-symbols-outlined" aria-hidden="true">photo_library</span>
              <p class="upload-title">Galerie</p>
              <p class="upload-hint">Jusqu'à 10 photos selon votre forfait.</p>
              <button type="button" class="btn btn-ghost btn-sm">Ajouter des photos</button>
            </div>
            <div class="upload">
              <span class="material-symbols-outlined" aria-hidden="true">description</span>
              <p class="upload-title">Documents légaux</p>
              <p class="upload-hint">RCCM, NIU, statuts (PDF — 5 Mo / fichier).</p>
              <button type="button" class="btn btn-ghost btn-sm">Téléverser</button>
            </div>
          </div>
          <p class="upload-note">Les uploads seront branchés sur le backend lors d'une prochaine itération.</p>
        </fieldset>

        <div class="actions-bar">
          <a routerLink="/espace" class="btn btn-ghost">Annuler</a>
          <ac-button type="button" variant="outline" (click)="saveDraft()" iconLeft="save">
            Enregistrer en brouillon
          </ac-button>
          <ac-button type="submit" [loading]="submitting()" iconRight="send">
            {{ mode() === 'create' ? 'Soumettre pour validation' : 'Enregistrer les modifications' }}
          </ac-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { max-width: 920px; margin: 0 auto; padding: 8px 4px 32px; }
    .page-head { margin-bottom: 24px; }
    .page-head h1 {
      font-family: var(--font-headline);
      font-size: 30px;
      font-weight: 800;
      color: var(--color-on-surface);
      margin: 6px 0 8px;
    }
    .page-head .sub { color: var(--color-on-secondary-container); font-size: 14px; max-width: 640px; line-height: 1.55; margin: 0; }

    form { display: flex; flex-direction: column; gap: 20px; }
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

    .grid-2 { display: grid; grid-template-columns: 1fr; gap: 16px; }
    @media (min-width: 640px) { .grid-2 { grid-template-columns: 1fr 1fr; } }

    textarea.form-input { font-family: var(--font-body); resize: vertical; min-height: 120px; }
    .text-xs { font-size: 12px; color: var(--color-outline); }

    .upload-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }
    @media (min-width: 768px) { .upload-row { grid-template-columns: repeat(3, 1fr); } }

    .upload {
      background: var(--color-surface-container-low);
      border: 2px dashed var(--color-outline-variant);
      border-radius: var(--radius-xl);
      padding: 18px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .upload .material-symbols-outlined {
      font-size: 28px;
      color: var(--color-primary);
      margin-bottom: 6px;
    }
    .upload-title { font-weight: 700; color: var(--color-on-surface); font-size: 14px; margin: 0; }
    .upload-hint  { font-size: 12px; color: var(--color-on-surface-variant); margin: 0 0 6px; }
    .upload-note  { font-size: 12px; color: var(--color-outline); margin: 8px 0 0; }

    .actions-bar {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      flex-wrap: wrap;
      padding-top: 8px;
    }
  `],
})
export class FicheFormComponent {
  protected readonly FR = FR;
  readonly mode = input<'create' | 'edit'>('edit');

  private readonly fb       = inject(FormBuilder);
  private readonly espace   = inject(MockEspaceService);
  private readonly toast    = inject(ToastService);
  private readonly router   = inject(Router);

  protected readonly submitting = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name:        ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(300)]],
    rccm:        ['', [Validators.required, Validators.pattern(/^[A-Z]{2,3}-[A-Z]{2,4}-\d{4}-[A-Z]-\d{3,5}$/)]],
    niu:         ['', [Validators.required, Validators.minLength(8)]],
    sector:      ['', Validators.required],
    city:        ['', [Validators.required, Validators.minLength(2)]],
    address:     ['', [Validators.required, Validators.minLength(4)]],
    phone:       ['', [Validators.required, Validators.pattern(/^\+?242\s?0?[567]\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/)]],
    email:       ['', [Validators.required, Validators.email]],
    website:     ['', Validators.pattern(/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}.*$/i)],
  });

  // Hydrate from existing fiche when in edit mode.
  private readonly current = toSignal(this.espace.myCompany(), { initialValue: undefined });
  private readonly _ = computed(() => {
    const c = this.current();
    if (this.mode() === 'edit' && c) {
      this.form.patchValue({
        name: c.name,
        description: c.description,
        rccm: c.rccm,
        niu: c.niu,
        sector: c.sector,
        city: c.city,
        address: c.address,
        phone: c.phone,
        email: c.email,
        website: c.website,
      });
    }
    return null;
  });

  // Touch the computed so it stays alive.
  constructor() { this._(); }

  protected errorFor(name: string): string | null {
    const c: AbstractControl | null = this.form.get(name);
    if (!c || !c.touched || !c.errors) return null;
    if (c.errors['required'])  return FR.errors.required;
    if (c.errors['email'])     return FR.errors.email;
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} caractères.`;
    if (c.errors['maxlength']) return `Maximum ${c.errors['maxlength'].requiredLength} caractères.`;
    if (c.errors['pattern'])   {
      if (name === 'phone') return FR.errors.phoneCG;
      if (name === 'rccm')  return 'Format attendu : CG-BZV-2025-A-1234';
      if (name === 'website') return 'URL invalide. Exemple : https://exemple.cg';
      return FR.errors.pattern;
    }
    return FR.errors.validation;
  }

  protected saveDraft(): void {
    const value = this.form.getRawValue();
    this.espace.saveCompany({ ...value, status: 'brouillon' }).subscribe(() => {
      this.toast.info('Brouillon enregistré.');
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error(FR.errors.validation);
      return;
    }
    this.submitting.set(true);
    const value = this.form.getRawValue();
    this.espace.saveCompany({ ...value, status: 'en-attente' }).subscribe(() => {
      this.submitting.set(false);
      this.toast.success(this.mode() === 'create'
        ? 'Fiche soumise. Validation sous 48 h ouvrées.'
        : 'Modifications enregistrées. Nouvelle validation en cours.');
      this.router.navigateByUrl('/espace');
    });
  }
}

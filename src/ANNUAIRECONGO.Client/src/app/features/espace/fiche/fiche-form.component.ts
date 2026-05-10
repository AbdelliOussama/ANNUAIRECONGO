import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyService } from '@core/services/company.service';
import { UploadService } from '@core/services/upload.service';
import { BusinessOwnerService } from '@core/services/business-owner.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputComponent } from '@shared/ui/input/input.component';
import { ToastService } from '@shared/services/toast.service';
import { Sector, City, CreateCompanyRequest, UpdateCompanyProfileRequest, Company, CompanyImage, CompanyDocument } from '@core/models/company.model';
import { FR } from '@core/i18n/fr.constants';
import { catchError, map, of, switchMap } from 'rxjs';

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
            <select id="fiche-sector" formControlName="sectorId" class="form-input"
                    [attr.aria-invalid]="form.get('sectorId')?.invalid && form.get('sectorId')?.touched ? true : null">
              <option value="">Sélectionnez un secteur</option>
              @for (s of sectors(); track s.id) {
                <option [value]="s.id">{{ s.name }}</option>
              }
            </select>
            @if (errorFor('sectorId')) {
              <p class="form-error" role="alert">{{ errorFor('sectorId') }}</p>
            }
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label" for="fiche-city">Ville *</label>
              <select id="fiche-city" formControlName="cityId" class="form-input"
                      [attr.aria-invalid]="form.get('cityId')?.invalid && form.get('cityId')?.touched ? true : null">
                <option value="">Sélectionnez une ville</option>
                @for (v of cities(); track v.id) {
                  <option [value]="v.id">{{ v.name }}</option>
                }
              </select>
              @if (errorFor('cityId')) {
                <p class="form-error" role="alert">{{ errorFor('cityId') }}</p>
              }
            </div>
            <ac-input formControlName="address" label="Adresse complète" leadingIcon="location_on" [required]="true" [error]="errorFor('address')" />
          </div>
        </fieldset>

        <!-- Section: Contacts -->
        <fieldset class="card">
          <legend>Contacts publics</legend>

          <div class="grid-2">
            <ac-input
              formControlName="phoneNumber"
              type="tel"
              label="Téléphone"
              leadingIcon="phone"
              [hint]="FR.auth.phoneHint"
              placeholder="+242 06 XX XX XX"
              [required]="true"
              [error]="errorFor('phoneNumber')"
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
            formControlName="websiteUrl"
            type="url"
            label="Site web (facultatif)"
            leadingIcon="language"
            placeholder="https://exemple.cg"
            [error]="errorFor('websiteUrl')"
          />
        </fieldset>

        <!-- Section: Médias -->
        <fieldset class="card">
          <legend>Médias et documents</legend>
          <div class="upload-row">
            <div class="upload">
              <span class="material-symbols-outlined" aria-hidden="true">image</span>
              <p class="upload-title">Logo</p>
              @if (logoUrl()) {
                <img [src]="logoUrl()" class="preview-thumb" alt="Logo preview" />
              }
              <button type="button" class="btn btn-ghost btn-sm" (click)="logoInput.click()">
                {{ logoUrl() ? 'Changer' : 'Choisir' }}
              </button>
              <input #logoInput type="file" hidden (change)="onUploadLogo($event)" accept="image/*" />
            </div>

            <div class="upload">
              <span class="material-symbols-outlined" aria-hidden="true">photo_library</span>
              <p class="upload-title">Galerie</p>
              <p class="upload-hint">{{ gallery().length }} image(s)</p>
              <button type="button" class="btn btn-ghost btn-sm" (click)="galleryInput.click()">Ajouter</button>
              <input #galleryInput type="file" hidden (change)="onUploadGallery($event)" accept="image/*" multiple />
            </div>

            <div class="upload">
              <span class="material-symbols-outlined" aria-hidden="true">description</span>
              <p class="upload-title">Documents</p>
              <p class="upload-hint">{{ documents().length }} document(s)</p>
              <button type="button" class="btn btn-ghost btn-sm" (click)="docInput.click()">Téléverser</button>
              <input #docInput type="file" hidden (change)="onUploadDoc($event)" accept=".pdf,.doc,.docx" multiple />
            </div>
          </div>
        </fieldset>

        <div class="actions-bar">
          <a routerLink="/espace" class="btn btn-ghost">Annuler</a>
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

    .preview-thumb { width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--color-outline-variant); }

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

  private readonly fb        = inject(FormBuilder);
  private readonly companyService = inject(CompanyService);
  private readonly uploadService  = inject(UploadService);
  private readonly boService      = inject(BusinessOwnerService);
  private readonly toast     = inject(ToastService);
  private readonly router    = inject(Router);

  protected readonly submitting = signal(false);
  protected readonly logoUrl    = signal<string | null>(null);
  protected readonly gallery    = signal<string[]>([]);
  protected readonly documents  = signal<string[]>([]);

  protected readonly sectors = toSignal(this.companyService.getSectors(), { initialValue: [] as Sector[] });
  protected readonly cities  = toSignal(this.companyService.getCities(), { initialValue: [] as City[] });

  protected readonly form = this.fb.nonNullable.group({
    name:        ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(300)]],
    rccm:        ['', [Validators.required, Validators.pattern(/^[A-Z]{2,3}-[A-Z]{2,4}-\d{4}-[A-Z]-\d{3,5}$/)]],
    niu:         ['', [Validators.required, Validators.minLength(8)]],
    sectorId:    ['', Validators.required],
    cityId:      ['', Validators.required],
    address:     ['', [Validators.required, Validators.minLength(4)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?242\s?0?[567]\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/)]],
    email:       ['', [Validators.required, Validators.email]],
    websiteUrl:  ['', Validators.pattern(/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}.*$/i)],
  });

  private readonly companyToEdit = toSignal(
    this.boService.getMyCompanies().pipe(
      map(list => list[0] || null),
      catchError(() => of(null))
    ),
    { initialValue: null as Company | null }
  );

  private readonly hydrate = computed(() => {
    const c = this.companyToEdit();
    if (this.mode() === 'edit' && c) {
      this.form.patchValue({
        name: c.name,
        description: c.description || '',
        rccm: c.rccm || '',
        niu: c.niu || '',
        sectorId: c.sectors?.[0]?.id || c.sectors?.[0]?.sectorId || '',
        cityId: c.cityId || '',
        address: c.address || '',
        phoneNumber: c.phoneNumber || '',
        email: c.email || '',
        websiteUrl: c.websiteUrl || '',
      });
      this.logoUrl.set(c.logoUrl || null);
      this.gallery.set(c.images?.map((i: CompanyImage) => i.imageUrl) || []);
      this.documents.set(c.documents?.map((d: CompanyDocument) => d.documentUrl || d.fileUrl) || []);
    }
    return null;
  });

  constructor() {
    // Keep hydration alive
    effect(() => {
        this.hydrate();
    });
  }

  protected errorFor(name: string): string | null {
    const c: AbstractControl | null = this.form.get(name);
    if (!c || !c.touched || !c.errors) return null;
    if (c.errors['required'])  return FR.errors.required;
    if (c.errors['email'])     return FR.errors.email;
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} caractères.`;
    if (c.errors['maxlength']) return `Maximum ${c.errors['maxlength'].requiredLength} caractères.`;
    if (c.errors['pattern'])   {
      if (name === 'phoneNumber') return FR.errors.phoneCG;
      if (name === 'rccm')  return 'Format attendu : CG-BZV-2025-A-1234';
      if (name === 'websiteUrl') return 'URL invalide. Exemple : https://exemple.cg';
      return FR.errors.pattern;
    }
    return FR.errors.validation;
  }

  protected onUploadLogo(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploadService.uploadImage(file).subscribe(res => {
      this.logoUrl.set(res);
      this.toast.success('Logo téléversé.');
    });
  }

  protected onUploadGallery(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      this.uploadService.uploadImage(files[i]).subscribe(res => {
        this.gallery.update(g => [...g, res]);
      });
    }
  }

  protected onUploadDoc(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      this.uploadService.uploadDocument(files[i]).subscribe(res => {
        this.documents.update(d => [...d, res]);
      });
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error(FR.errors.validation);
      return;
    }

    this.submitting.set(true);
    const value = this.form.getRawValue();
    
    if (this.mode() === 'create') {
      const request: CreateCompanyRequest = {
        ...value,
        sectorIds: [value.sectorId],
        logoUrl: this.logoUrl() || undefined,
      };

      this.companyService.createCompany(request).subscribe({
        next: () => {
          this.submitting.set(false);
          this.toast.success('Fiche créée et soumise pour validation.');
          this.router.navigateByUrl('/espace');
        },
        error: () => this.submitting.set(false)
      });
    } else {
      const companyId = this.companyToEdit()?.id;
      if (!companyId) return;

      const request: UpdateCompanyProfileRequest = {
        ...value,
        sectorIds: [value.sectorId],
        logoUrl: this.logoUrl() || undefined,
      };

      this.companyService.updateCompanyProfile(companyId, request).subscribe({
        next: () => {
          this.submitting.set(false);
          this.toast.success('Fiche mise à jour.');
          this.router.navigateByUrl('/espace');
        },
        error: () => this.submitting.set(false)
      });
    }
  }
}

import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyService } from '@core/services/company.service';
import { SectorService } from '@core/services/sector.service';
import { GeographyService } from '@core/services/geography.service';
import { UploadService } from '@core/services/upload.service';
import { CompanyContextService } from '@core/services/company-context.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputComponent } from '@shared/ui/input/input.component';
import { ToastService } from '@shared/services/toast.service';
import { Sector, City, CreateCompanyRequest, UpdateCompanyProfileRequest, Company, CompanyImage, CompanyDocument, ContactType } from '@core/models/company.model';
import { FR } from '@core/i18n/fr.constants';
import { Observable, catchError, map, of, switchMap, forkJoin } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'ac-fiche-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ButtonComponent,
    InputComponent,
    ReactiveFormsModule
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
            <div class="flex items-center justify-between mb-2">
              <label class="form-label mb-0" for="fiche-description">Description *</label>
              <button
                type="button"
                class="btn-ai-generate"
                [disabled]="generatingAiDescription()"
                (click)="generateAiDescription()"
              >
                @if (generatingAiDescription()) {
                  <span class="spinner-ai"></span>
                  Génération...
                } @else {
                  <span class="material-symbols-outlined text-sm mr-1">bolt</span>
                  Générer avec l'IA
                }
              </button>
            </div>
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
              <p class="text-xs text-outline">2000 caractères maximum (min. 20).</p>
            }

            @if (aiGeneratedDescriptionProposal()) {
              <div class="ai-proposal-card">
                <div class="ai-proposal-header">
                  <span class="material-symbols-outlined text-primary text-base mr-2">auto_awesome</span>
                  <span class="font-bold text-xs text-primary uppercase tracking-wider">Proposition de l'IA</span>
                </div>
                <p class="ai-proposal-text">{{ aiGeneratedDescriptionProposal() }}</p>
                <div class="ai-proposal-actions">
                  <button type="button" class="btn-proposal-accept" (click)="acceptAiProposal()">
                    <span class="material-symbols-outlined text-sm mr-1">check</span>
                    Accepter
                  </button>
                  <button type="button" class="btn-proposal-regenerate" (click)="generateAiDescription()">
                    <span class="material-symbols-outlined text-sm mr-1">refresh</span>
                    Régénérer
                  </button>
                </div>
              </div>
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
            <label class="form-label">Secteurs stratégiques *</label>
            <p class="text-xs text-outline mb-2">Sélectionnez tous les secteurs dans lesquels vous opérez.</p>
            <div class="sectors-grid">
              @for (s of sectors(); track s.id) {
                <label class="sector-checkbox">
                  <input type="checkbox" [checked]="isSectorSelected(s.id)" (change)="toggleSector(s.id)" />
                  <span class="sector-name">{{ s.name }}</span>
                </label>
              }
            </div>
            @if (errorFor('sectorIds')) {
              <p class="form-error" role="alert">{{ errorFor('sectorIds') }}</p>
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
              formControlName="contactEmail"
              type="text"
              label="E-mail public"
              leadingIcon="mail"
              placeholder="contact@entreprise.cg"
              [required]="true"
              [error]="errorFor('contactEmail')"
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

          <hr class="my-4 border-outline-variant" />
          
          <p class="text-sm font-bold mb-2">Réseaux sociaux & Autres</p>
          <div formArrayName="contacts" class="flex flex-col gap-3">
            @for (c of contactsFormArray.controls; track $index; let i = $index) {
              <div [formGroupName]="i" class="flex items-end gap-3 bg-surface-container-low p-3 rounded-lg border border-outline-variant">
                <div class="flex-1">
                  <label class="form-label text-xs">Type</label>
                  <select formControlName="type" class="form-input text-sm">
                    @for (t of contactTypes; track t.value) {
                      <option [value]="t.value">{{ t.label }}</option>
                    }
                  </select>
                </div>
                <div class="flex-grow-2">
                  <ac-input formControlName="value" label="Lien ou numéro" placeholder="Ex: @username ou lien..." [error]="errorFor('contacts.'+i+'.value')" />
                </div>
                <button type="button" class="btn-icon text-error mb-1" (click)="removeContact(i)" aria-label="Supprimer">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
            }
          </div>

          <button type="button" class="btn btn-ghost btn-sm w-fit mt-2" (click)="addContact()">
            <span class="material-symbols-outlined">add</span>
            Ajouter un lien social
          </button>
        </fieldset>

        <!-- Section: Services -->
        <fieldset class="card">
          <legend>Nos Services & Produits</legend>
          <p class="text-sm text-outline mb-4">Listez les services ou produits spécifiques que vous proposez pour améliorer votre visibilité.</p>
          
          <div formArrayName="services" class="services-list">
            @for (s of servicesFormArray.controls; track $index; let i = $index) {
              <div [formGroupName]="i" class="service-item card-sub">
                <div class="service-row">
                  <ac-input formControlName="title" label="Nom du service" placeholder="Ex: Transit Maritime" class="flex-1" [error]="errorFor('services.'+i+'.title')" />
                  <button type="button" class="btn-icon text-error" (click)="removeService(i)" aria-label="Supprimer">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
                <ac-input formControlName="description" label="Description courte" placeholder="Détails du service..." [error]="errorFor('services.'+i+'.description')" />
              </div>
            }
          </div>

          <button type="button" class="btn btn-outline btn-sm w-fit" (click)="addService()">
            <span class="material-symbols-outlined">add</span>
            Ajouter un service
          </button>
        </fieldset>

        <!-- Section: Médias -->
        <fieldset class="card">
          <legend>Médias et documents</legend>
          <div class="upload-row">
            <div class="upload">
              <span class="material-symbols-outlined" aria-hidden="true">image</span>
              <p class="upload-title">Logo</p>
              @if (logoUrl()) {
                <div class="relative w-fit mx-auto">
                  <img [src]="logoUrl()" class="preview-thumb" alt="Logo preview" />
                  <button type="button" class="btn-icon text-error" (click)="logoUrl.set(null)">
                    <span class="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
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
              
              @if (gallery().length > 0) {
                <div class="flex flex-wrap gap-2 justify-center mt-3">
                  @for (img of gallery(); track img; let i = $index) {
                    <div class="relative flex items-start">
                      <img [src]="img" class="preview-thumb" alt="Gallery preview" />
                      <button type="button" class="btn-icon text-error" (click)="removeGalleryImage(i)">
                        <span class="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  }
                </div>
              }
            </div>

            <div class="upload">
              <span class="material-symbols-outlined" aria-hidden="true">description</span>
              <p class="upload-title">Documents</p>
              <p class="upload-hint">{{ documents().length }} document(s)</p>
              <button type="button" class="btn btn-ghost btn-sm" (click)="docInput.click()">Téléverser</button>
              <input #docInput type="file" hidden (change)="onUploadDoc($event)" accept=".pdf,.doc,.docx" multiple />
              
              @if (documents().length > 0) {
                <div class="flex flex-col gap-2 mt-3 w-full text-left">
                  @for (doc of documents(); track doc; let i = $index) {
                    <div class="flex items-center justify-between bg-surface-container-high p-2 rounded text-xs border border-outline-variant">
                      <a [href]="doc" target="_blank" class="truncate text-primary hover:underline">Document {{ i + 1 }}</a>
                      <button type="button" class="btn-icon text-error" (click)="removeDocument(i)">
                        <span class="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  }
                </div>
              }
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

    .sectors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
    .sector-checkbox { display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--color-surface-container-low); border-radius: var(--radius-md); border: 1px solid var(--color-outline-variant); cursor: pointer; transition: 0.2s; }
    .sector-checkbox:hover { background: var(--color-surface-container-high); }
    .sector-checkbox input { width: 18px; height: 18px; cursor: pointer; }
    .sector-name { font-size: 13px; font-weight: 600; color: var(--color-on-surface); }

    .services-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
    .service-item { padding: 16px; background: var(--color-surface-container-low); border-radius: var(--radius-lg); border: 1px solid var(--color-outline-variant); }
    .service-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 8px; }
    .card-sub { position: relative; }
    .btn-icon { background: transparent; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 8px; border-radius: var(--radius-full); transition: background 0.2s; }
    .btn-icon:hover { background: var(--color-error-container); color: var(--color-on-error-container); }
    .w-fit { width: fit-content; }
    .mb-2 { margin-bottom: 8px; }
    .mb-4 { margin-bottom: 16px; }
    .mt-2 { margin-top: 8px; }
    .my-4 { margin-top: 16px; margin-bottom: 16px; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .flex-1 { flex: 1; }
    .flex-grow-2 { flex: 2; }
    .items-end { align-items: flex-end; }
    .gap-3 { gap: 12px; }
    .p-3 { padding: 12px; }
    .rounded-lg { border-radius: var(--radius-lg); }

    .actions-bar {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      flex-wrap: wrap;
      padding-top: 8px;
    }

    .justify-between { justify-content: space-between; }
    .items-center { align-items: center; }
    .mb-0 { margin-bottom: 0; }
    .mr-1 { margin-right: 4px; }
    .mr-2 { margin-right: 8px; }
    .text-sm { font-size: 14px; }
    .text-base { font-size: 16px; }
    .text-xs { font-size: 12px; }
    .font-bold { font-weight: 700; }
    .text-primary { color: var(--color-primary); }
    .uppercase { text-transform: uppercase; }
    .tracking-wider { letter-spacing: 0.05em; }

    .btn-ai-generate {
      display: inline-flex;
      align-items: center;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
      color: #ffffff;
      border: none;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 700;
      border-radius: var(--radius-lg);
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(168, 85, 247, 0.25);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn-ai-generate:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(168, 85, 247, 0.4);
      filter: brightness(1.1);
    }
    .btn-ai-generate:active:not(:disabled) {
      transform: translateY(1px);
    }
    .btn-ai-generate:disabled {
      background: var(--color-surface-container-high);
      color: var(--color-outline);
      box-shadow: none;
      cursor: not-allowed;
    }

    .spinner-ai {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: #ffffff;
      animation: spin-ai 0.8s linear infinite;
      margin-right: 6px;
    }

    @keyframes spin-ai {
      to { transform: rotate(360deg); }
    }

    .ai-proposal-card {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.04) 0%, rgba(168, 85, 247, 0.04) 100%);
      border: 1px dashed var(--color-primary);
      border-radius: var(--radius-xl);
      padding: 16px;
      margin-top: 12px;
      animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slide-down {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .ai-proposal-header {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }

    .ai-proposal-text {
      font-size: 13.5px;
      line-height: 1.6;
      color: var(--color-on-surface-variant);
      margin: 0 0 12px 0;
      white-space: pre-wrap;
    }

    .ai-proposal-actions {
      display: flex;
      gap: 10px;
    }

    .btn-proposal-accept {
      display: inline-flex;
      align-items: center;
      background: var(--color-primary);
      color: var(--color-on-primary);
      border: none;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 700;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-proposal-accept:hover {
      background: var(--color-primary-hover, #4f46e5);
      transform: translateY(-1px);
    }

    .btn-proposal-regenerate {
      display: inline-flex;
      align-items: center;
      background: transparent;
      color: var(--color-primary);
      border: 1px solid var(--color-primary);
      padding: 5px 12px;
      font-size: 12px;
      font-weight: 700;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-proposal-regenerate:hover {
      background: rgba(99, 102, 241, 0.08);
      transform: translateY(-1px);
    }
  `],
})
export class FicheFormComponent {
  protected readonly FR = FR;
  readonly mode = input<'create' | 'edit'>('edit');

  private readonly fb = inject(FormBuilder);
  private readonly companyService = inject(CompanyService);
  private readonly sectorService  = inject(SectorService);
  private readonly geoService     = inject(GeographyService);
  private readonly uploadService  = inject(UploadService);
  private readonly ctx            = inject(CompanyContextService);
  private readonly authService    = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);
  protected readonly logoUrl = signal<string | null>(null);
  protected readonly coverUrl = signal<string | null>(null);
  protected readonly gallery = signal<string[]>([]);
  protected readonly documents = signal<string[]>([]);
  protected readonly generatingAiDescription = signal(false);
  protected readonly aiGeneratedDescriptionProposal = signal<string | null>(null);

  protected readonly contactTypes = [
    { value: 2, label: 'WhatsApp' },
    { value: 3, label: 'Facebook' },
    { value: 4, label: 'LinkedIn' },
    { value: 5, label: 'Instagram' },
    { value: 6, label: 'Twitter' },
  ];

  protected readonly originalContacts = signal<any[]>([]);
  protected readonly originalServices = signal<any[]>([]);
  protected readonly originalImages = signal<any[]>([]);
  protected readonly originalDocs = signal<any[]>([]);

  protected readonly sectors = toSignal(this.sectorService.getSectors(), { initialValue: [] as Sector[] });
  protected readonly cities = toSignal(this.geoService.getCities(), { initialValue: [] as City[] });

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
    rccm: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    niu: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
    sectorIds: [[] as string[], [Validators.required, Validators.minLength(1)]],
    cityId: ['', Validators.required],
    address: ['', [Validators.required, Validators.minLength(4)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^[+\d\s\(\).]{9,20}$/)]],
    contactEmail: ['', [Validators.required]],
    websiteUrl: ['', Validators.pattern(/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}.*$/i)],
    services: this.fb.array([]),
    contacts: this.fb.array([]),
  });

  get servicesFormArray() {
    return this.form.get('services') as any;
  }

  get contactsFormArray() {
    return this.form.get('contacts') as any;
  }

  protected isSectorSelected(id: string): boolean {
    return this.form.controls.sectorIds.value.includes(id);
  }

  protected toggleSector(id: string): void {
    const current = this.form.controls.sectorIds.value;
    if (current.includes(id)) {
      this.form.controls.sectorIds.setValue(current.filter(x => x !== id));
    } else {
      this.form.controls.sectorIds.setValue([...current, id]);
    }
    this.form.controls.sectorIds.markAsTouched();
  }

  protected generateAiDescription(): void {
    const name = this.form.controls.name.value;
    const selectedSectorIds = this.form.controls.sectorIds.value;
    const selectedCityId = this.form.controls.cityId.value;
    const services = this.servicesFormArray.value.map((s: any) => s.title).filter(Boolean);

    if (!name || selectedSectorIds.length === 0 || !selectedCityId) {
      this.toast.error("Veuillez saisir le nom, la ville et au moins un secteur d'activité pour pouvoir générer la description par l'IA.");
      return;
    }

    const city = this.cities().find(c => c.id === selectedCityId)?.name || 'Congo';
    const sectorNames = this.sectors()
      .filter(s => selectedSectorIds.includes(s.id))
      .map(s => s.name);

    this.generatingAiDescription.set(true);
    const companyId = this.mode() === 'edit' && this.companyToEdit() ? this.companyToEdit()!.id : '00000000-0000-0000-0000-000000000000';

    this.companyService.generateDescription(companyId, {
      name,
      sectors: sectorNames,
      city,
      services
    }).subscribe({
      next: (res) => {
        this.generatingAiDescription.set(false);
        this.aiGeneratedDescriptionProposal.set(res.description);
        this.toast.success("Description générée avec succès ! Vous pouvez la relire et l'accepter.");
      },
      error: (err) => {
        this.generatingAiDescription.set(false);
        console.error("AI Generation Error", err);
        this.toast.error("Une erreur est survenue lors de la génération de la description. Veuillez réessayer.");
      }
    });
  }

  protected acceptAiProposal(): void {
    const proposal = this.aiGeneratedDescriptionProposal();
    if (proposal) {
      this.form.controls.description.setValue(proposal);
      this.form.controls.description.markAsDirty();
      this.form.controls.description.markAsTouched();
      this.aiGeneratedDescriptionProposal.set(null);
      this.toast.success("Description mise à jour avec la proposition de l'IA.");
    }
  }

  addContact(type = 2, value = '') {
    this.contactsFormArray.push(this.fb.group({
      type: [type, Validators.required],
      value: [value, [Validators.required, Validators.minLength(2)]],
    }));
  }

  removeContact(index: number) {
    this.contactsFormArray.removeAt(index);
  }



  addService(title = '', description = '') {
    this.servicesFormArray.push(this.fb.group({
      title: [title, [Validators.required, Validators.minLength(3)]],
      description: [description, [Validators.maxLength(1000)]],
    }));
  }

  removeService(index: number) {
    this.servicesFormArray.removeAt(index);
  }

  // Edit mode reads the currently selected company from the shared context.
  // When the user switches company in the sidebar the signal updates automatically.
  private readonly companyToEdit = this.ctx.selectedCompany;

  constructor() {
    effect(() => {
      const c = this.companyToEdit();
      if (this.mode() === 'edit' && c) {
        // Extract primary phone and email from contacts array (type 0=Phone, 1=Email)
        const primaryPhone = c.contacts?.find((con: any) => con.type === ContactType.Phone || con.type === 'Phone')?.value || '';
        const primaryEmail = c.contacts?.find((con: any) => con.type === ContactType.Email || con.type === 'Email')?.value || '';

        this.form.patchValue({
          name: c.name,
          description: c.description || '',
          rccm: c.rccm || '',
          niu: c.niu || '',
          sectorIds: c.sectors?.map((s: any) => s.id || s.sectorId) || [],
          cityId: c.cityId || '',
          address: c.address || '',
          phoneNumber: primaryPhone,
          contactEmail: primaryEmail,
          websiteUrl: c.websiteUrl || '',
        });
        this.logoUrl.set(c.logoUrl || null);
        // Map gallery from images array — API returns imageUrl field
        this.gallery.set((c.images?.map((i: CompanyImage) => i.imageUrl).filter(Boolean) as string[]) || []);
        // Map documents — API returns fileUrl field (DocumentDto.FileUrl)
        this.documents.set((c.documents?.map((d: CompanyDocument) => d.fileUrl || d.documentUrl).filter(Boolean) as string[]) || []);

        this.originalServices.set(c.services || []);
        this.originalContacts.set(c.contacts || []);
        this.originalImages.set(c.images || []);
        this.originalDocs.set(c.documents || []);

        // Populate services FormArray
        this.servicesFormArray.clear();
        (c.services || []).forEach((s: any) => this.addService(s.title, s.description));

        // Populate extra contacts FormArray (type > 1 = social: WhatsApp=2, Facebook=3, etc.)
        this.contactsFormArray.clear();
        (c.contacts || [])
          .filter((con: any) => con.type > 1 || (typeof con.type === 'string' && con.type !== 'Phone' && con.type !== 'Email'))
          .forEach((con: any) => this.addContact(con.type, con.value));
      }
    });
  }

  protected errorFor(controlName: string | number, parent?: AbstractControl): string | null {
    const control = parent ? parent.get(controlName.toString()) : this.form.get(controlName.toString());
    if (!control || (!control.touched && !this.submitting()) || !control.errors) return null;

    if (control.errors['required']) return 'Ce champ est obligatoire.';
    if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} caractères.`;
    if (control.errors['maxlength']) return `Maximum ${control.errors['maxlength'].requiredLength} caractères.`;
    if (control.errors['email']) return 'Format d\'e-mail invalide.';
    if (control.errors['pattern']) {
      if (controlName === 'phoneNumber') return 'Numéro de téléphone invalide (Ex: +242 06 XXX XX XX).';
      if (controlName === 'websiteUrl') return 'Lien invalide (Ex: https://entreprise.cg).';
      if (controlName === 'contactEmail') return 'Format d\'email invalide.';
      return 'Format invalide.';
    }
    return 'Vérifiez ce champ.';
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

  protected removeGalleryImage(index: number): void {
    this.gallery.update(g => {
      const copy = [...g];
      copy.splice(index, 1);
      return copy;
    });
  }

  protected removeDocument(index: number): void {
    this.documents.update(d => {
      const copy = [...d];
      copy.splice(index, 1);
      return copy;
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Veuillez vérifier les informations saisies.');
      
      console.group('Form Validation Failures');
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
          console.warn(`[${key}] is invalid:`, control.errors, 'Current value:', control.value);
          
          if (control instanceof FormArray) {
            (control as FormArray).controls.forEach((c: AbstractControl, i: number) => {
              if (c.invalid) console.warn(`  - Sub-control [${i}] is invalid:`, c.errors, 'Value:', c.value);
            });
          }
        }
      });
      console.groupEnd();
      return;
    }

    this.submitting.set(true);
    const value = this.form.getRawValue();

    const payload = {
      ...value,
      logoUrl: this.logoUrl(),
      coverUrl: this.coverUrl()
    };

    const obs$ = this.mode() === 'create'
      ? this.companyService.createCompany(payload as any)
      : this.companyService.updateCompanyProfile(this.companyToEdit()!.id, payload as any);

    obs$.pipe(
      switchMap((result: any) => {
        // If we're editing, updateCompanyProfile returns 'Updated' which doesn't have an id.
        // We use the ID from the companyToEdit signal.
        // If we're creating, createCompany returns the CompanyDto which HAS an id.
        const companyId = this.mode() === 'edit' ? this.companyToEdit()!.id : (result.id || result.Id);

        if (!companyId) {
          console.error('FicheForm: No companyId found after submission', result);
          return of(null);
        }

        // For checking existing items, use the company from create response OR the one we're editing
        const companyData = this.mode() === 'edit' ? this.companyToEdit() : result;

        const tasks: Observable<any>[] = [];

        // 1. Logo and Cover are now handled atomically in create/updateProfile.


        // 2. Sync Images
        const currentGallery = this.gallery();
        const originalImageUrls = this.originalImages().map((i: any) => i.imageUrl).filter(Boolean);
        
        // Remove deleted images
        this.originalImages().forEach((old: any) => {
          if (!currentGallery.includes(old.imageUrl)) {
            tasks.push(this.companyService.removeImage(companyId, old.id).pipe(catchError(() => of(null))));
          }
        });

        // Add new images
        currentGallery.forEach(url => {
          if (url && !originalImageUrls.includes(url)) {
            tasks.push(this.companyService.addImage(companyId, url).pipe(catchError(() => of(null))));
          }
        });

        // 3. Sync Documents
        const currentDocs = this.documents();
        const originalDocUrls = this.originalDocs().map((d: any) => d.fileUrl || d.documentUrl).filter(Boolean);
        
        // Remove deleted documents
        this.originalDocs().forEach((old: any) => {
          const url = old.fileUrl || old.documentUrl;
          if (!currentDocs.includes(url)) {
            tasks.push(this.companyService.removeDocument(companyId, old.id).pipe(catchError(() => of(null))));
          }
        });

        // Add new documents (defaulting to public)
        currentDocs.forEach(url => {
          if (url && !originalDocUrls.includes(url)) {
            tasks.push(this.companyService.addDocument(companyId, url, 'Other', undefined, true).pipe(catchError(() => of(null))));
          }
        });

        // 4. Sync Services
        const formValue = this.form.getRawValue();
        const currentServices = formValue.services;
        const oldServices = this.originalServices();

        // Remove services that are no longer in the form
        oldServices.forEach(old => {
          if (!currentServices.some((curr: any) => curr.title === old.title)) {
            tasks.push(this.companyService.removeService(companyId, old.id).pipe(catchError(() => of(null))));
          }
        });

        // Add new services
        currentServices.forEach((curr: any) => {
          if (!oldServices.some(old => old.title === curr.title)) {
            tasks.push(this.companyService.addService(companyId, curr.title, curr.description).pipe(catchError(() => of(null))));
          }
        });

        // 5. Sync Extra Contacts
        const currentContacts = formValue.contacts;
        const oldContacts = this.originalContacts().filter(c => c.type > 1);

        oldContacts.forEach(old => {
          if (!currentContacts.some((curr: any) => curr.type == old.type && curr.value === old.value)) {
            tasks.push(this.companyService.removeContact(companyId, old.id).pipe(catchError(() => of(null))));
          }
        });

        currentContacts.forEach((curr: any) => {
          if (!oldContacts.some(old => old.type == curr.type && old.value === curr.value)) {
            // Send enum as string name to match backend JsonStringEnumConverter
            const typeName = ContactType[curr.type as keyof typeof ContactType] || curr.type;
            tasks.push(this.companyService.addContact(companyId, typeName as any, curr.value, false).pipe(catchError(() => of(null))));
          }
        });

        return tasks.length > 0
          ? forkJoin(tasks).pipe(
            catchError(err => {
              console.error('FicheForm: Error in post-submission tasks', err);
              return of(null);
            })
          )
          : of(null);
      })
    ).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.success(this.mode() === 'create' ? 'Fiche créée et soumise.' : 'Fiche mise à jour.');
        // Refresh the company list so the sidebar switcher shows the new/updated company.
        this.ctx.refresh();
        this.router.navigateByUrl('/espace');
      },
      error: (err) => {
        this.submitting.set(false);
        console.error('FicheForm: Global submission error', err);
        this.toast.error('Une erreur est survenue lors de l\'enregistrement.');
      }
    });
  }
}

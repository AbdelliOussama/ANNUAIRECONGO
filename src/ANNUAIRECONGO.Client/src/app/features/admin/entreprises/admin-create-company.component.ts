import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { AdminService } from '@core/services/admin.service';
import { GeographyService } from '@core/services/geography.service';
import { SectorService } from '@core/services/sector.service';
import { City } from '@core/models/geography.model';
import { Sector } from '@core/models/company.model';

@Component({
  selector: 'ac-admin-create-company',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <!-- ── Header ──────────────────────────────────────────────────── -->
      <header class="page-head">
        <p class="eyebrow">Gestion · Entreprises</p>
        <h1>Créer une fiche au nom d'un dirigeant</h1>
        <p class="sub">
          Le dirigeant n'aura pas de compte sur la plateforme. L'administrateur
          gère entièrement la fiche, l'abonnement et les paiements.
        </p>
      </header>

      <!-- ── Step indicator ─────────────────────────────────────────── -->
      <div class="steps" aria-label="Étapes">
        <div class="step" [class.active]="step() === 1" [class.done]="step() > 1">
          <span class="step-num">1</span>
          <span class="step-label">Dirigeant</span>
        </div>
        <div class="step-sep" aria-hidden="true"></div>
        <div class="step" [class.active]="step() === 2">
          <span class="step-num">2</span>
          <span class="step-label">Entreprise</span>
        </div>
      </div>

      <!-- ── Error banner ────────────────────────────────────────────── -->
      @if (errorMessage()) {
        <div class="alert alert-error" role="alert">
          <span class="material-symbols-outlined" aria-hidden="true">error</span>
          {{ errorMessage() }}
        </div>
      }

      <!-- ═══════════════════════════════════════════════════════════════
           STEP 1 — Owner contact info
      ════════════════════════════════════════════════════════════════ -->
      @if (step() === 1) {
        <form
          [formGroup]="ownerForm"
          (ngSubmit)="goToStep2()"
          class="card form-card"
          novalidate
        >
          <h2 class="form-section-title">
            <span class="material-symbols-outlined" aria-hidden="true">person</span>
            Informations du dirigeant
          </h2>

          <div class="form-row">
            <div class="form-field">
              <label for="ownerFirstName">Prénom <span class="required">*</span></label>
              <input
                id="ownerFirstName"
                type="text"
                class="form-input"
                formControlName="firstName"
                placeholder="Jean"
                autocomplete="given-name"
              />
              @if (ownerForm.get('firstName')?.invalid && ownerForm.get('firstName')?.touched) {
                <p class="field-error">Le prénom est requis (50 caractères max).</p>
              }
            </div>

            <div class="form-field">
              <label for="ownerLastName">Nom <span class="required">*</span></label>
              <input
                id="ownerLastName"
                type="text"
                class="form-input"
                formControlName="lastName"
                placeholder="Mbemba"
                autocomplete="family-name"
              />
              @if (ownerForm.get('lastName')?.invalid && ownerForm.get('lastName')?.touched) {
                <p class="field-error">Le nom est requis (50 caractères max).</p>
              }
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label for="ownerEmail">Adresse e-mail <span class="required">*</span></label>
              <input
                id="ownerEmail"
                type="email"
                class="form-input"
                formControlName="email"
                placeholder="dirigeant@exemple.com"
                autocomplete="email"
              />
              @if (ownerForm.get('email')?.invalid && ownerForm.get('email')?.touched) {
                <p class="field-error">Une adresse e-mail valide est requise.</p>
              }
            </div>

            <div class="form-field">
              <label for="ownerPhone">Téléphone <span class="required">*</span></label>
              <input
                id="ownerPhone"
                type="tel"
                class="form-input"
                formControlName="phone"
                placeholder="+242 06 000 0000"
                autocomplete="tel"
              />
              @if (ownerForm.get('phone')?.invalid && ownerForm.get('phone')?.touched) {
                <p class="field-error">Le numéro de téléphone est requis.</p>
              }
            </div>
          </div>

          <div class="form-field">
            <label for="ownerPosition">Poste / Fonction <span class="optional">(optionnel)</span></label>
            <input
              id="ownerPosition"
              type="text"
              class="form-input"
              formControlName="position"
              placeholder="Directeur Général, PDG…"
            />
          </div>

          <div class="form-actions">
            <a routerLink="/admin/entreprises" class="btn btn-ghost">Annuler</a>
            <button type="submit" class="btn btn-primary" [disabled]="ownerForm.invalid">
              Suivant
              <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </button>
          </div>
        </form>
      }

      <!-- ═══════════════════════════════════════════════════════════════
           STEP 2 — Company data
      ════════════════════════════════════════════════════════════════ -->
      @if (step() === 2) {
        <form
          [formGroup]="companyForm"
          (ngSubmit)="submit()"
          class="card form-card"
          novalidate
        >
          <h2 class="form-section-title">
            <span class="material-symbols-outlined" aria-hidden="true">apartment</span>
            Données de l'entreprise
          </h2>

          <!-- Company name -->
          <div class="form-field">
            <label for="companyName">Nom de l'entreprise <span class="required">*</span></label>
            <input
              id="companyName"
              type="text"
              class="form-input"
              formControlName="name"
              placeholder="SARL Exemple Congo"
            />
            @if (companyForm.get('name')?.invalid && companyForm.get('name')?.touched) {
              <p class="field-error">Le nom de l'entreprise est requis (100 caractères max).</p>
            }
          </div>

          <!-- City -->
          <div class="form-field">
            <label for="cityId">Ville <span class="required">*</span></label>
            <select id="cityId" class="form-input" formControlName="cityId">
              <option value="">-- Sélectionner une ville --</option>
              @for (city of cities(); track city.id) {
                <option [value]="city.id">{{ city.name }}</option>
              }
            </select>
            @if (companyForm.get('cityId')?.invalid && companyForm.get('cityId')?.touched) {
              <p class="field-error">Une ville doit être sélectionnée.</p>
            }
          </div>

          <!-- Sectors -->
          <div class="form-field">
            <label>Secteurs d'activité <span class="required">*</span></label>
            <div class="sectors-grid">
              @for (sector of sectors(); track sector.id) {
                <label class="sector-chip" [class.selected]="isSectorSelected(sector.id)">
                  <input
                    type="checkbox"
                    class="sr-only"
                    [value]="sector.id"
                    [checked]="isSectorSelected(sector.id)"
                    (change)="toggleSector(sector.id)"
                  />
                  {{ sector.name }}
                </label>
              }
            </div>
            @if (companyForm.get('sectorIds')?.invalid && companyForm.get('sectorIds')?.touched) {
              <p class="field-error">Au moins un secteur doit être sélectionné.</p>
            }
          </div>

          <!-- Legal identifiers -->
          <div class="form-row">
            <div class="form-field">
              <label for="rccm">RCCM <span class="optional">(optionnel)</span></label>
              <input
                id="rccm"
                type="text"
                class="form-input"
                formControlName="rccm"
                placeholder="CG/BZV/00/A/2024/…"
              />
            </div>

            <div class="form-field">
              <label for="niu">NIU <span class="optional">(optionnel)</span></label>
              <input
                id="niu"
                type="text"
                class="form-input"
                formControlName="niu"
                placeholder="M2024…"
              />
            </div>
          </div>

          <!-- Website -->
          <div class="form-field">
            <label for="website">Site web <span class="optional">(optionnel)</span></label>
            <input
              id="website"
              type="url"
              class="form-input"
              formControlName="website"
              placeholder="https://exemple.com"
            />
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-ghost" (click)="step.set(1)">
              <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>
              Retour
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="companyForm.invalid || selectedSectorIds().length === 0 || isSubmitting()"
            >
              @if (isSubmitting()) {
                <span class="material-symbols-outlined spin" aria-hidden="true">progress_activity</span>
                Création en cours…
              } @else {
                <span class="material-symbols-outlined" aria-hidden="true">add_business</span>
                Créer la fiche
              }
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .steps {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 24px;
    }
    .step {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--color-on-surface-variant);
      font-size: 14px;
    }
    .step.active { color: var(--color-primary); font-weight: 600; }
    .step.done   { color: var(--color-on-surface); }
    .step-num {
      width: 28px; height: 28px;
      border-radius: 50%;
      border: 2px solid currentColor;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700;
    }
    .step.active .step-num { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
    .step.done .step-num   { background: var(--color-on-surface); color: var(--color-surface); border-color: var(--color-on-surface); }
    .step-sep { flex: 1; height: 2px; background: var(--color-outline-variant); max-width: 60px; }

    .form-card { padding: 28px 32px; max-width: 640px; }

    .form-section-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 16px; font-weight: 600;
      margin-bottom: 20px;
      color: var(--color-on-surface);
    }

    .form-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    label       { font-size: 14px; font-weight: 500; color: var(--color-on-surface); }
    .required   { color: var(--color-error); }
    .optional   { font-weight: 400; color: var(--color-on-surface-variant); font-size: 12px; }
    .field-error { font-size: 12px; color: var(--color-error); margin-top: 2px; }

    .sectors-grid {
      display: flex; flex-wrap: wrap; gap: 8px;
      padding: 12px;
      border: 1px solid var(--color-outline-variant);
      border-radius: 8px;
    }
    .sector-chip {
      padding: 6px 12px;
      border-radius: 20px;
      border: 1px solid var(--color-outline-variant);
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s ease;
      color: var(--color-on-surface-variant);
    }
    .sector-chip:hover    { border-color: var(--color-primary); color: var(--color-primary); }
    .sector-chip.selected { background: var(--color-primary-container); border-color: var(--color-primary); color: var(--color-on-primary-container); font-weight: 500; }

    .form-actions {
      display: flex; justify-content: flex-end; gap: 12px;
      margin-top: 24px; padding-top: 20px;
      border-top: 1px solid var(--color-outline-variant);
    }

    .alert { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }
    .alert-error { background: var(--color-error-container); color: var(--color-on-error-container); }

    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin 0.8s linear infinite; }

    @media (max-width: 600px) {
      .form-row { grid-template-columns: 1fr; }
      .form-card { padding: 20px 16px; }
    }
  `],
})
export class AdminCreateCompanyComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly adminSvc = inject(AdminService);
  private readonly geoSvc = inject(GeographyService);
  private readonly sectorSvc = inject(SectorService);

  // ── UI state ──────────────────────────────────────────────────────────────
  readonly step = signal<1 | 2>(1);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedSectorIds = signal<string[]>([]);

  // ── Remote data ───────────────────────────────────────────────────────────
  readonly cities = toSignal(this.geoSvc.getCities(), { initialValue: [] as City[] });
  readonly sectors = toSignal(this.sectorSvc.getSectors(), { initialValue: [] as Sector[] });

  // ── Forms ─────────────────────────────────────────────────────────────────
  readonly ownerForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.maxLength(20)]],
    position: [''],
  });

  readonly companyForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    cityId: ['', Validators.required],
    sectorIds: [[] as string[]],
    rccm: [''],
    niu: [''],
    website: [''],
  });

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly step1Valid = computed(() => this.ownerForm.valid);

  // ── Sector helpers ────────────────────────────────────────────────────────
  isSectorSelected(id: string): boolean {
    return this.selectedSectorIds().includes(id);
  }

  toggleSector(id: string): void {
    const current = this.selectedSectorIds();
    if (current.includes(id)) {
      this.selectedSectorIds.set(current.filter(s => s !== id));
    } else {
      this.selectedSectorIds.set([...current, id]);
    }
    // Keep the reactive form in sync for validation display
    this.companyForm.patchValue({ sectorIds: this.selectedSectorIds() });
    this.companyForm.get('sectorIds')?.markAsTouched();
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  goToStep2(): void {
    if (this.ownerForm.invalid) {
      this.ownerForm.markAllAsTouched();
      return;
    }
    this.errorMessage.set(null);
    this.step.set(2);
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  submit(): void {
    if (this.companyForm.invalid || this.selectedSectorIds().length === 0) {
      this.companyForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const o = this.ownerForm.getRawValue();
    const c = this.companyForm.getRawValue();

    this.adminSvc.createCompanyForOwner({
      ownerFirstName: o.firstName,
      ownerLastName: o.lastName,
      ownerEmail: o.email,
      ownerPhone: o.phone,
      ownerPosition: o.position || undefined,
      companyName: c.name,
      cityId: c.cityId,
      sectorIds: this.selectedSectorIds(),
      rccm: c.rccm || undefined,
      niu: c.niu || undefined,
      website: c.website || undefined,
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/admin/entreprises']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const detail = err?.error?.detail ?? err?.error?.title ?? null;
        this.errorMessage.set(
          detail ?? 'Une erreur est survenue lors de la création. Veuillez réessayer.'
        );
      },
    });
  }
}

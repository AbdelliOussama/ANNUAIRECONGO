import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CompanyService } from '@core/services/company.service';
import { Company, CompanyStatus } from '@core/models/company.model';
import { switchMap, catchError, of, map, tap } from 'rxjs';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { ToastService } from '@shared/services/toast.service';
import { ModalService } from '@shared/services/modal.service';

import { DatePipe } from '@angular/common';

@Component({
  selector: 'ac-admin-validation-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent, SkeletonComponent, EmptyStateComponent, DatePipe],
  template: `
    <div class="page">
      <nav class="breadcrumbs" aria-label="Fil d'ariane">
        <a routerLink="/admin">Admin</a>
        <span aria-hidden="true">›</span>
        <a routerLink="/admin/validation">Validation</a>
        <span aria-hidden="true">›</span>
        <span class="current" aria-current="page">{{ fiche()?.name || 'Fiche' }}</span>
      </nav>

      @if (loading()) {
        <ac-skeleton shape="card" height="280px" />
      } @else if (!fiche()) {
        <ac-empty-state icon="error" title="Fiche introuvable" hint="L'identifiant fourni n'existe pas dans la file d'attente.">
          <a routerLink="/admin/validation" class="btn btn-primary">Retour à la liste</a>
        </ac-empty-state>
      } @else {
        <article class="card">
          <header class="head">
            <div>
              <span [class]="'status status-' + fiche()!.status">{{ statusLabel(fiche()!.status) }}</span>
              <h1>{{ fiche()!.name }}</h1>
              <p class="meta">{{ fiche()!.sectorLabel }} · {{ fiche()!.city }} · soumise le {{ fiche()!.submittedAt | date:'dd/MM/yyyy' }}</p>
            </div>
            @if (fiche()!.status === 'en-attente') {
              <div class="actions">
                <ac-button variant="danger" iconLeft="close" (click)="reject()" [loading]="rejecting()">Rejeter</ac-button>
                <ac-button variant="primary" iconLeft="check" (click)="validate()" [loading]="validating()">Valider</ac-button>
              </div>
            }
          </header>

          <dl class="kv">
            <div><dt>RCCM</dt><dd>{{ fiche()!.rccm }}</dd></div>
            <div><dt>NIU</dt><dd>{{ fiche()!.niu }}</dd></div>
            <div><dt>ID Propriétaire</dt><dd>{{ fiche()!.ownerId }}</dd></div>
          </dl>

          <section>
            <h2>Description</h2>
            <p class="lead">{{ fiche()!.description }}</p>
          </section>

          <!-- Gallery Preview -->
          @if (fiche()!.images.length > 0) {
            <section>
              <h2>Images</h2>
              <div class="gallery">
                @for (img of fiche()!.images; track img.id) {
                  <img [src]="img.imageUrl" alt="Aperçu" class="preview-img" />
                }
              </div>
            </section>
          }

          @if (fiche()!.status === 'rejetee' && fiche()!.rejectionReason) {
            <section class="reason-box">
              <h2>
                <span class="material-symbols-outlined" aria-hidden="true">flag</span>
                Motif de rejet communiqué
              </h2>
              <p>{{ fiche()!.rejectionReason }}</p>
            </section>
          }
        </article>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { display: flex; flex-direction: column; gap: 16px; max-width: 1100px; margin: 0 auto; }

    .breadcrumbs { display: flex; gap: 8px; align-items: center; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-on-secondary-container); }
    .breadcrumbs a:hover { color: var(--color-primary); }
    .breadcrumbs .current { color: var(--color-on-surface); font-weight: 600; }

    .card {
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-2xl);
      padding: 28px 32px;
      box-shadow: var(--shadow-card);
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .head { display: flex; gap: 16px; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; }
    .head h1 {
      font-family: var(--font-headline);
      font-size: 26px;
      font-weight: 800;
      color: var(--color-on-surface);
      margin: 8px 0 4px;
    }
    .meta { color: var(--color-on-secondary-container); font-size: 13px; margin: 0; }
    .actions { display: flex; gap: 8px; flex-wrap: wrap; }

    .status { display: inline-flex; padding: 3px 10px; border-radius: var(--radius-full); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
    .status-en-attente { background: var(--color-tertiary-fixed); color: var(--color-on-tertiary-fixed); }
    .status-validee    { background: var(--color-primary-fixed); color: var(--color-on-primary-fixed); }
    .status-rejetee    { background: var(--color-error-container); color: var(--color-on-error-container); }

    .kv { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
    .kv dt { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-outline); margin-bottom: 4px; }
    .kv dd { font-size: 14px; font-weight: 600; color: var(--color-on-surface); margin: 0; font-variant-numeric: tabular-nums; }

    section h2 { font-family: var(--font-headline); font-size: 18px; font-weight: 700; margin: 0 0 12px; color: var(--color-on-surface); display: flex; align-items: center; gap: 6px; }
    .lead { color: var(--color-on-surface-variant); font-size: 14px; line-height: 1.7; margin: 0; }

    .gallery { display: flex; gap: 12px; flex-wrap: wrap; }
    .preview-img { width: 120px; height: 120px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--color-outline-variant); }

    .reason-box {
      background: var(--color-error-container);
      color: var(--color-on-error-container);
      border-radius: var(--radius-xl);
      padding: 18px 20px;
    }
    .reason-box p { margin: 0; line-height: 1.6; }
  `],
})
export class AdminValidationDetailComponent {
  private readonly companyService = inject(CompanyService);
  private readonly route  = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast  = inject(ToastService);
  private readonly modal  = inject(ModalService);

  protected readonly validating = signal(false);
  protected readonly rejecting  = signal(false);

  protected readonly loading = signal(true);
  private readonly rawFiche = toSignal<Company | null>(
    this.route.params.pipe(
      tap(() => this.loading.set(true)),
      switchMap((p) => this.companyService.getCompanyById(p['id']).pipe(
        tap(() => this.loading.set(false)),
        catchError(() => { this.loading.set(false); return of(null); })
      ))
    ),
    { initialValue: null }
  );

  protected readonly fiche = computed(() => {
    const c = this.rawFiche();
    if (!c) return null;

    return {
      id: c.id,
      name: c.name,
      description: c.description || 'Aucune description.',
      status: this.mapStatus(c.status),
      sectorLabel: c.sectors?.[0]?.name || 'N/A',
      city: c.cityName || 'N/A',
      submittedAt: c.createdAt,
      rccm: c.rccm || 'N/A',
      niu: c.niu || 'N/A',
      ownerId: c.ownerId,
      rejectionReason: '', 
      images: c.images || []
    };
  });

  private mapStatus(status: number): string {
    switch (status) {
      case 1: return 'en-attente';
      case 2: return 'validee';
      case 3: return 'rejetee';
      default: return 'en-attente';
    }
  }

  protected statusLabel(s: string): string {
    return ({
      'en-attente': 'En attente',
      validee:      'Validée',
      rejetee:      'Refusée',
    } as Record<string, string>)[s] ?? s;
  }

  protected async validate(): Promise<void> {
    const f = this.fiche();
    if (!f) return;
    const { confirmed } = await this.modal.confirm({
      title: `Valider la fiche « ${f.name} » ?`,
      body: 'La fiche sera publiée immédiatement sur l\'annuaire et son propriétaire sera notifié par e-mail.',
      tone: 'confirm',
      confirmLabel: 'Valider la publication',
    });
    if (!confirmed) return;

    this.validating.set(true);
    this.companyService.validateCompany(f.id).subscribe({
      next: () => {
        this.validating.set(false);
        this.toast.success('Fiche validée. L\'entreprise a été notifiée.');
        this.router.navigateByUrl('/admin/validation');
      },
      error: () => this.validating.set(false)
    });
  }

  protected async reject(): Promise<void> {
    const f = this.fiche();
    if (!f) return;
    const { confirmed, reason } = await this.modal.confirm({
      title: `Rejeter la fiche « ${f.name} » ?`,
      body: 'Le motif que vous saisissez sera transmis à l\'entreprise pour qu\'elle puisse corriger sa fiche.',
      tone: 'danger',
      confirmLabel: 'Rejeter avec motif',
      reasonLabel: 'Motif de rejet (obligatoire)',
      reasonRequired: true,
    });
    if (!confirmed || !reason) return;

    this.rejecting.set(true);
    this.companyService.rejectCompany(f.id, reason).subscribe({
      next: () => {
        this.rejecting.set(false);
        this.toast.success('Fiche rejetée. Le motif a été communiqué à l\'entreprise.');
        this.router.navigateByUrl('/admin/validation');
      },
      error: () => this.rejecting.set(false)
    });
  }
}

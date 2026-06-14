import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CompanyService } from '@core/services/company.service';
import { CompanyContextService } from '@core/services/company-context.service';
import { FicheFormComponent } from '../../espace/fiche/fiche-form.component';

/**
 * /admin/entreprises/:id/editer
 *
 * Loads the target company by its route :id, injects it into CompanyContextService
 * via setAdminOverride(), then renders the shared <ac-fiche-form mode="edit" />.
 * This makes the admin behave exactly as the company owner — all section handlers
 * (images, documents, contacts, services, profile) run under Admin Rule 0 on the
 * backend so no ownership error is returned.
 */
@Component({
  selector: 'ac-admin-fiche-editer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FicheFormComponent],
  template: `
    <div class="page">

      <!-- Breadcrumb -->
      <nav class="breadcrumbs" aria-label="Fil d'ariane">
        <a routerLink="/admin">Admin</a>
        <span aria-hidden="true">›</span>
        <a routerLink="/admin/entreprises">Entreprises</a>
        <span aria-hidden="true">›</span>
        <a [routerLink]="['/admin/entreprises', companyId]">Fiche</a>
        <span aria-hidden="true">›</span>
        <span class="current" aria-current="page">Éditer</span>
      </nav>

      @if (loading()) {
        <div class="skeleton-block" style="height:400px; border-radius:12px;"></div>
      } @else if (error()) {
        <div class="empty-state">
          <span class="material-symbols-outlined" style="font-size:48px;color:var(--color-on-surface-variant)">error</span>
          <p>Impossible de charger l'entreprise.</p>
          <a [routerLink]="['/admin/entreprises', companyId]" class="btn btn-primary">Retour</a>
        </div>
      } @else {
        <ac-fiche-form mode="edit" />
      }
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 960px; margin: 0 auto; }
    .breadcrumbs { display: flex; align-items: center; gap: 6px; font-size: 13px;
      color: var(--color-on-surface-variant); margin-bottom: 24px; flex-wrap: wrap; }
    .breadcrumbs a { color: var(--color-primary); text-decoration: none; }
    .breadcrumbs a:hover { text-decoration: underline; }
    .breadcrumbs .current { font-weight: 600; color: var(--color-on-surface); }
    .skeleton-block { background: var(--color-surface-variant);
      animation: skeleton-pulse 1.4s ease-in-out infinite; }
    @keyframes skeleton-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
    .empty-state { display:flex; flex-direction:column; align-items:center;
      gap:12px; padding:48px; text-align:center; }
    .btn { display:inline-flex; align-items:center; justify-content:center;
      gap:6px; padding:10px 20px; border-radius:8px; font-size:14px;
      font-weight:600; cursor:pointer; border:none; text-decoration:none; }
    .btn-primary { background:var(--color-primary); color:#fff; }
  `],
})
export class AdminFicheEditerComponent implements OnInit {
  private readonly route   = inject(ActivatedRoute);
  private readonly companySvc = inject(CompanyService);
  private readonly ctx     = inject(CompanyContextService);

  readonly companyId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly loading   = signal(true);
  readonly error     = signal(false);

  ngOnInit(): void {
    if (!this.companyId) {
      this.error.set(true);
      this.loading.set(false);
      return;
    }

    this.companySvc.getCompanyById(this.companyId).subscribe({
      next: (company) => {
        if (!company) {
          this.error.set(true);
        } else {
          // Inject the target company into context so FicheFormComponent can edit it.
          this.ctx.setAdminOverride(company);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}

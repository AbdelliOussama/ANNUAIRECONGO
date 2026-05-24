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
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ac-admin-validation-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent, SkeletonComponent, EmptyStateComponent, DatePipe, FormsModule],
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
              <div class="badge-row">
                <span [class]="'status status-' + fiche()!.status">{{ statusLabel(fiche()!.status) }}</span>
                @if (fiche()!.isVerified) {
                  <span class="status status-verified">
                    <span class="material-symbols-outlined" style="font-size:12px;vertical-align:middle;margin-right:3px">verified</span>Identité vérifiée
                  </span>
                }
              </div>
              <h1>{{ fiche()!.name }}</h1>
              <p class="meta">{{ fiche()!.sectorLabel }} · {{ fiche()!.city }} · soumise le {{ fiche()!.submittedAt | date:'dd/MM/yyyy' }}</p>
            </div>
            @if (fiche()!.status === 'en-attente') {
              <div class="actions">
                <ac-button variant="danger" iconLeft="close" (click)="reject()" [loading]="rejecting()">Rejeter</ac-button>
                <ac-button variant="primary" iconLeft="check" (click)="validate()" [loading]="validating()">Valider</ac-button>
              </div>
            }
            @if (fiche()!.status === 'validee' && !fiche()!.isVerified) {
              <div class="actions">
                <ac-button variant="primary" iconLeft="verified" (click)="verifyIdentity()" [loading]="verifying()">Vérifier l'identité</ac-button>
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

          <!-- ── AI Trust Score Widget ─────────────────────────────────── -->
          <section class="trust-widget">
            <div class="trust-header">
              <div class="trust-title-row">
                <span class="ai-badge">
                  <span class="material-symbols-outlined">psychology</span>
                  Analyse IA de Confiance
                </span>
                <h2 class="trust-title">Score de Fiabilité Économique</h2>
                <p class="trust-subtitle">Analyse automatique basée sur la conformité légale, la complétude du profil et les indicateurs opérationnels.</p>
              </div>

              <!-- Radial Score Dial -->
              <div class="score-dial-wrapper">
                <div class="score-dial" [class]="'score-dial--' + trustTier()">
                  <svg class="dial-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                    <circle class="dial-track" cx="60" cy="60" r="50" />
                    <circle
                      class="dial-fill"
                      cx="60" cy="60" r="50"
                      [style.strokeDasharray]="314"
                      [style.strokeDashoffset]="314 - (314 * (fiche()!.trustScore / 100))"
                    />
                  </svg>
                  <div class="dial-label">
                    <span class="dial-value">{{ fiche()!.trustScore }}</span>
                    <span class="dial-unit">/100</span>
                  </div>
                </div>
                <div class="score-tier-label" [class]="'tier--' + trustTier()">
                  {{ trustTierLabel() }}
                </div>
              </div>
            </div>

            <!-- Manual Override Control -->
            <div class="trust-controls">
              <div class="score-input-row">
                <label class="score-label" for="manualScore">Score manuel (optionnel)</label>
                <div class="score-input-group">
                  <input
                    id="manualScore"
                    type="number"
                    class="score-input"
                    placeholder="0–100"
                    min="0"
                    max="100"
                    [(ngModel)]="manualScore"
                  />
                  <ac-button
                    id="btn-analyze-trust"
                    variant="primary"
                    iconLeft="psychology"
                    [loading]="analyzing()"
                    (click)="analyzeWithAI()"
                  >
                    🔄 Analyser avec l'IA
                  </ac-button>
                </div>
              </div>
            </div>

            <!-- AI Justification Panel -->
            @if (fiche()!.trustScoreAnalysis) {
              <div class="justification-panel">
                <div class="justification-header">
                  <span class="material-symbols-outlined spark-icon">auto_awesome</span>
                  <span class="justification-label">Rapport d'Évaluation Économique — IA Groq Llama-3</span>
                </div>
                <div class="justification-content">
                  @for (paragraph of trustParagraphs(); track $index) {
                    <p class="justification-paragraph">{{ paragraph }}</p>
                  }
                </div>
              </div>
            } @else {
              <div class="justification-empty">
                <span class="material-symbols-outlined">pending</span>
                <p>Aucune analyse générée. Cliquez sur <strong>"🔄 Analyser avec l'IA"</strong> pour lancer l'évaluation économique par Groq Llama-3.</p>
              </div>
            }
          </section>
          <!-- ─────────────────────────────────────────────────────────── -->
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

    .badge-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-bottom: 4px; }
    .status { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: var(--radius-full); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
    .status-en-attente { background: var(--color-tertiary-fixed); color: var(--color-on-tertiary-fixed); }
    .status-validee    { background: var(--color-primary-fixed); color: var(--color-on-primary-fixed); }
    .status-rejetee    { background: var(--color-error-container); color: var(--color-on-error-container); }
    .status-verified   { background: #d1fae5; color: #065f46; }

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

    /* ─── Trust Score Widget ──────────────────────────────────────── */
    .trust-widget {
      background: linear-gradient(135deg, #0d0d1a 0%, #0f0e2a 50%, #0a0d1f 100%);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: var(--radius-2xl);
      padding: 28px 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      position: relative;
      overflow: hidden;
    }
    .trust-widget::before {
      content: '';
      position: absolute;
      top: -60px; right: -60px;
      width: 200px; height: 200px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
      pointer-events: none;
    }
    .trust-widget::after {
      content: '';
      position: absolute;
      bottom: -40px; left: -40px;
      width: 150px; height: 150px;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%);
      pointer-events: none;
    }

    .trust-header {
      display: flex;
      gap: 28px;
      align-items: flex-start;
      flex-wrap: wrap;
    }
    .trust-title-row {
      flex: 1;
      min-width: 260px;
    }
    .ai-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.4);
      border-radius: var(--radius-full);
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #a5b4fc;
      margin-bottom: 12px;
    }
    .ai-badge .material-symbols-outlined {
      font-size: 14px;
    }
    .trust-title {
      font-family: var(--font-headline);
      font-size: 22px;
      font-weight: 800;
      color: #e2e8f0;
      margin: 0 0 8px;
    }
    .trust-subtitle {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.6;
      margin: 0;
    }

    /* Radial Dial */
    .score-dial-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .score-dial {
      position: relative;
      width: 130px;
      height: 130px;
    }
    .dial-svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }
    .dial-track {
      fill: none;
      stroke: rgba(255, 255, 255, 0.07);
      stroke-width: 10;
    }
    .dial-fill {
      fill: none;
      stroke-width: 10;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease;
    }
    .score-dial--high .dial-fill {
      stroke: #22c55e;
      filter: drop-shadow(0 0 6px rgba(34, 197, 94, 0.7));
    }
    .score-dial--medium .dial-fill {
      stroke: #f59e0b;
      filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.7));
    }
    .score-dial--low .dial-fill {
      stroke: #ef4444;
      filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.7));
    }
    .dial-label {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .dial-value {
      font-family: var(--font-headline);
      font-size: 32px;
      font-weight: 900;
      line-height: 1;
      color: #f1f5f9;
    }
    .dial-unit {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
    }
    .score-tier-label {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 3px 12px;
      border-radius: var(--radius-full);
    }
    .tier--high {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }
    .tier--medium {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .tier--low {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    /* Controls */
    .trust-controls {
      position: relative;
      z-index: 1;
    }
    .score-input-row {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .score-label {
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }
    .score-input-group {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }
    .score-input {
      width: 100px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(99, 102, 241, 0.35);
      border-radius: var(--radius-md);
      padding: 9px 14px;
      color: #e2e8f0;
      font-size: 15px;
      font-weight: 700;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .score-input:focus {
      border-color: #818cf8;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }
    .score-input::-webkit-inner-spin-button,
    .score-input::-webkit-outer-spin-button { opacity: 1; }

    /* Justification Panel */
    .justification-panel {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: var(--radius-xl);
      padding: 22px 24px;
      position: relative;
      z-index: 1;
    }
    .justification-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 18px;
    }
    .spark-icon {
      font-size: 20px;
      color: #a78bfa;
    }
    .justification-label {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: #a5b4fc;
    }
    .justification-content {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .justification-paragraph {
      font-size: 14px;
      line-height: 1.75;
      color: #cbd5e1;
      margin: 0;
      padding-left: 14px;
      border-left: 2px solid rgba(99, 102, 241, 0.35);
    }

    .justification-empty {
      display: flex;
      align-items: center;
      gap: 14px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px dashed rgba(99, 102, 241, 0.25);
      border-radius: var(--radius-xl);
      padding: 20px 24px;
      position: relative;
      z-index: 1;
    }
    .justification-empty .material-symbols-outlined {
      font-size: 32px;
      color: #475569;
      flex-shrink: 0;
    }
    .justification-empty p {
      margin: 0;
      font-size: 13px;
      color: #64748b;
      line-height: 1.6;
    }
    .justification-empty strong { color: #94a3b8; }
  `],
})
export class AdminValidationDetailComponent {
  private readonly companyService = inject(CompanyService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly modal = inject(ModalService);

  protected readonly validating = signal(false);
  protected readonly rejecting = signal(false);
  protected readonly verifying = signal(false);
  protected readonly analyzing = signal(false);
  protected manualScore: number | null = null;

  // Live data signal that refreshes when the route param changes or after AI analysis
  private readonly _companyData = signal<Company | null>(null);
  protected readonly loading = signal(true);

  private readonly rawFiche = toSignal<Company | null>(
    this.route.params.pipe(
      tap(() => this.loading.set(true)),
      switchMap((p) => this.companyService.getCompanyById(p['id']).pipe(
        tap((c) => { this.loading.set(false); this._companyData.set(c); }),
        catchError(() => { this.loading.set(false); return of(null); })
      ))
    ),
    { initialValue: null }
  );

  protected readonly fiche = computed(() => {
    // Prefer live updated data from AI analysis, fall back to initial load
    const c = this._companyData() ?? this.rawFiche();
    if (!c) return null;

    return {
      id: c.id,
      name: c.name,
      description: c.description || 'Aucune description.',
      status: this.mapStatus(c.status),
      sectorLabel: c.sectors?.[0]?.name || 'N/A',
      city: c.cityName || 'N/A',
      submittedAt: c.submittedAt || c.createdAt,
      rccm: c.rccm || 'N/A',
      niu: c.niu || 'N/A',
      ownerId: c.ownerId,
      rejectionReason: c.rejectionReason || '',
      images: c.images || [],
      trustScore: c.trustScore ?? 0,
      trustScoreAnalysis: c.trustScoreAnalysis || null,
      isVerified: c.isVerified ?? false,
    };
  });

  protected readonly trustTier = computed<'high' | 'medium' | 'low'>(() => {
    const score = this.fiche()?.trustScore ?? 0;
    if (score >= 75) return 'high';
    if (score >= 45) return 'medium';
    return 'low';
  });

  protected readonly trustTierLabel = computed(() => {
    const tier = this.trustTier();
    if (tier === 'high') return '✓ Très Fiable';
    if (tier === 'medium') return '⚠ Modérément Fiable';
    return '✗ Risque Élevé';
  });

  protected readonly trustParagraphs = computed(() => {
    const raw = this.fiche()?.trustScoreAnalysis;
    if (!raw) return [];
    return raw.split('\n').map(p => p.trim()).filter(p => p.length > 0);
  });

  // API returns enum names as strings (JsonStringEnumConverter).
  private mapStatus(status: string): string {
    switch (status) {
      case 'Pending':   return 'en-attente';
      case 'Active':    return 'validee';
      case 'Rejected':  return 'rejetee';
      default:          return 'en-attente';
    }
  }

  protected statusLabel(s: string): string {
    return ({
      'en-attente': 'En attente',
      validee: 'Validée',
      rejetee: 'Refusée',
    } as Record<string, string>)[s] ?? s;
  }

  protected analyzeWithAI(): void {
    const f = this.fiche();
    if (!f || this.analyzing()) return;

    const score = (this.manualScore !== null && this.manualScore >= 0 && this.manualScore <= 100)
      ? this.manualScore
      : undefined;

    this.analyzing.set(true);
    this.companyService.generateTrustScore(f.id, score).subscribe({
      next: (updated) => {
        this.analyzing.set(false);
        this._companyData.set(updated);
        const newScore = updated.trustScore ?? 0;
        this.toast.success(`Analyse IA complète — Score de fiabilité : ${newScore}/100`);
      },
      error: () => {
        this.analyzing.set(false);
        this.toast.error('Une erreur est survenue lors de l\'analyse IA.');
      }
    });
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

  protected async verifyIdentity(): Promise<void> {
    const f = this.fiche();
    if (!f) return;
    const { confirmed } = await this.modal.confirm({
      title: `Vérifier l'identité de « ${f.name} » ?`,
      body: 'Confirmez que le RCCM et le NIU ont été vérifiés auprès des registres officiels de la République du Congo.',
      tone: 'info',
      confirmLabel: 'Marquer comme vérifiée',
    });
    if (!confirmed) return;

    this.verifying.set(true);
    this.companyService.verifyCompany(f.id).subscribe({
      next: () => {
        this.verifying.set(false);
        this.toast.success('Identité vérifiée. Le badge "Vérifiée" est maintenant visible sur la fiche.');
        // Refresh data
        const updated = this._companyData();
        if (updated) this._companyData.set({ ...updated, isVerified: true });
      },
      error: () => {
        this.verifying.set(false);
        this.toast.error('Échec de la vérification.');
      }
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

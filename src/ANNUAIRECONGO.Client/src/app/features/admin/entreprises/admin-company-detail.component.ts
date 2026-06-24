import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '@core/services/company.service';
import { SubscriptionService } from '@core/services/subscription.service';
import { AdminService } from '@core/services/admin.service';
import { ToastService } from '@shared/services/toast.service';
import { Company, CompanyStatus, Payment, Plan, Subscription } from '@core/models/company.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'ac-admin-company-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page">

      <!-- ── Breadcrumb ────────────────────────────────────────────── -->
      <nav class="breadcrumbs" aria-label="Fil d'ariane">
        <a routerLink="/admin">Admin</a>
        <span aria-hidden="true">›</span>
        <a routerLink="/admin/entreprises">Entreprises</a>
        <span aria-hidden="true">›</span>
        <span class="current" aria-current="page">{{ company()?.name || '…' }}</span>
      </nav>

      @if (loading()) {
        <div class="skeleton-block" style="height:200px; border-radius:12px;"></div>
        <div class="detail-grid">
          <div class="col-left">
            <div class="skeleton-block" style="height:140px; border-radius:12px;"></div>
            <div class="skeleton-block" style="height:180px; border-radius:12px;"></div>
          </div>
          <div class="col-right">
            <div class="skeleton-block" style="height:160px; border-radius:12px;"></div>
            <div class="skeleton-block" style="height:200px; border-radius:12px;"></div>
          </div>
        </div>
      } @else if (!company()) {
        <div class="empty-state">
          <span class="material-symbols-outlined" style="font-size:48px;color:var(--color-on-surface-variant)">error</span>
          <p>Entreprise introuvable.</p>
          <a routerLink="/admin/entreprises" class="btn btn-primary">Retour à la liste</a>
        </div>
      } @else {

        <!-- ── Header card ───────────────────────────────────────── -->
        <div class="card header-card">
          <div class="header-left">
            <div class="badge-row">
              <span [class]="'status-badge ' + statusClass(company()!.status)">
                {{ statusLabel(company()!.status) }}
              </span>
              @if (company()!.isVerified) {
                <span class="status-badge verified">
                  <span class="material-symbols-outlined" style="font-size:13px;vertical-align:middle">verified</span>
                  Identité vérifiée
                </span>
              }
              @if (company()!.isPremium) {
                <span class="status-badge premium">
                  <span class="material-symbols-outlined" style="font-size:13px;vertical-align:middle">workspace_premium</span>
                  Premium
                </span>
              }
            </div>
            <h1>{{ company()!.name }}</h1>
            <p class="meta">
              {{ company()!.cityName || '' }}
              @if (company()!.sectors?.length) { · {{ company()!.sectors![0].name }} }
              · Créée le {{ formatDate(company()!.createdAt) }}
            </p>
          </div>

          <!-- ── Edit fiche link ───────────────────────────────── -->
          <a [routerLink]="['/admin/entreprises', company()!.id, 'editer']" class="btn btn-outline edit-fiche-btn">
            <span class="material-symbols-outlined">edit</span>
            Éditer la fiche
          </a>

          <!-- ── Status transition actions ─────────────────────── -->
          <div class="header-actions">
            @if (company()!.status === CompanyStatus.Draft) {
              <button class="btn btn-outline" (click)="submitCompany()" [disabled]="actionBusy()">
                <span class="material-symbols-outlined">send</span>
                Soumettre
              </button>
              <button class="btn btn-primary" (click)="activateDirectly()" [disabled]="actionBusy()">
                <span class="material-symbols-outlined">check_circle</span>
                Activer directement
              </button>
            }
            @if (company()!.status === CompanyStatus.Pending) {
              <button class="btn btn-danger-outline" (click)="openRejectModal()" [disabled]="actionBusy()">
                <span class="material-symbols-outlined">close</span>
                Rejeter
              </button>
              <button class="btn btn-primary" (click)="validateCompany()" [disabled]="actionBusy()">
                <span class="material-symbols-outlined">check_circle</span>
                Valider
              </button>
            }
            @if (company()!.status === CompanyStatus.Active) {
              @if (!company()!.isVerified) {
                <button class="btn btn-outline" (click)="verifyIdentity()" [disabled]="actionBusy()">
                  <span class="material-symbols-outlined">verified</span>
                  Vérifier l'identité
                </button>
              }
              <button class="btn btn-warn" (click)="suspendCompany()" [disabled]="actionBusy()">
                <span class="material-symbols-outlined">pause_circle</span>
                Suspendre
              </button>
            }
            @if (company()!.status === CompanyStatus.Suspended || company()!.status === CompanyStatus.Rejected) {
              <button class="btn btn-primary" (click)="reactivateCompany()" [disabled]="actionBusy()">
                <span class="material-symbols-outlined">restart_alt</span>
                Réactiver
              </button>
            }
            @if (actionBusy()) {
              <span class="material-symbols-outlined spin muted-spin">progress_activity</span>
            }
          </div>
        </div>

        <!-- ── Reject modal ──────────────────────────────────────── -->
        @if (showRejectModal()) {
          <div class="modal-backdrop" (click)="closeRejectModal()">
            <div class="modal-box" (click)="$event.stopPropagation()">
              <h3>Motif de rejet</h3>
              <textarea
                class="form-input"
                rows="4"
                placeholder="Expliquer la raison du rejet…"
                [(ngModel)]="rejectReason"
              ></textarea>
              <div class="modal-actions">
                <button class="btn btn-ghost" (click)="closeRejectModal()">Annuler</button>
                <button class="btn btn-danger" (click)="confirmReject()" [disabled]="!rejectReason.trim() || actionBusy()">
                  Confirmer le rejet
                </button>
              </div>
            </div>
          </div>
        }

        <!-- ── Two-column layout ─────────────────────────────────── -->
        <div class="detail-grid">

          <!-- LEFT column ─────────────────────────────────────────── -->
          <div class="col-left">

            <!-- Owner/contact card -->
            <section class="card section-card">
              <h2 class="section-title">
                <span class="material-symbols-outlined">person</span>
                Dirigeant / Contact
              </h2>
              <dl class="info-list">
                <div>
                  <dt>Nom</dt>
                  <dd>{{ company()!.ownerName || '–' }}</dd>
                </div>
                <div>
                  <dt>Téléphone</dt>
                  <dd>{{ company()!.ownerPhone || company()!.phoneNumber || '–' }}</dd>
                </div>
                @if (company()!.email) {
                  <div>
                    <dt>Email</dt>
                    <dd>{{ company()!.email }}</dd>
                  </div>
                }
              </dl>
            </section>

            <!-- Company details card -->
            <section class="card section-card">
              <h2 class="section-title">
                <span class="material-symbols-outlined">apartment</span>
                Informations
              </h2>
              <dl class="info-list">
                <div>
                  <dt>Ville</dt>
                  <dd>{{ company()!.cityName || '–' }}</dd>
                </div>
                <div>
                  <dt>Secteurs</dt>
                  <dd>{{ sectorNames() }}</dd>
                </div>
                <div>
                  <dt>RCCM</dt>
                  <dd class="mono">{{ company()!.rccm || '–' }}</dd>
                </div>
                <div>
                  <dt>NIU</dt>
                  <dd class="mono">{{ company()!.niu || '–' }}</dd>
                </div>
                @if (company()!.websiteUrl) {
                  <div>
                    <dt>Site web</dt>
                    <dd>
                      <a [href]="company()!.websiteUrl" target="_blank" rel="noopener" class="link">
                        {{ company()!.websiteUrl }}
                      </a>
                    </dd>
                  </div>
                }
              </dl>
              @if (company()!.description) {
                <p class="description">{{ company()!.description }}</p>
              }
            </section>

          </div>

          <!-- RIGHT column ────────────────────────────────────────── -->
          <div class="col-right">

            <!-- Active subscription -->
            <section class="card section-card">
              <h2 class="section-title">
                <span class="material-symbols-outlined">workspace_premium</span>
                Abonnement actuel
              </h2>
              @if (activeSubscription()) {
                <dl class="info-list">
                  <div>
                    <dt>Plan</dt>
                    <dd><strong>{{ activeSubscription()!.planName }}</strong></dd>
                  </div>
                  <div>
                    <dt>Statut</dt>
                    <dd>{{ activeSubscription()!.isActive ? 'Actif' : 'Inactif' }}</dd>
                  </div>
                  <div>
                    <dt>Début</dt>
                    <dd>{{ formatDate(activeSubscription()!.startedAt) }}</dd>
                  </div>
                  <div>
                    <dt>Expiration</dt>
                    <dd>{{ formatDate(activeSubscription()!.expiresAt) }}</dd>
                  </div>
                </dl>
              } @else {
                <p class="muted">Aucun abonnement actif.</p>
              }
            </section>

            <!-- Change plan -->
            <section class="card section-card">
              <h2 class="section-title">
                <span class="material-symbols-outlined">upgrade</span>
                Changer de plan
              </h2>

              <div class="form-field">
                <label for="planSelect">Plan</label>
                <select id="planSelect" class="form-input" [(ngModel)]="selectedPlanId">
                  <option value="">-- Sélectionner un plan --</option>
                  @for (plan of plans(); track plan.id) {
                    <option [value]="plan.id">
                      {{ plan.name }}
                      @if (plan.price === 0) { — Gratuit } @else { — {{ formatAmount(plan.price) }} XAF }
                    </option>
                  }
                </select>
              </div>

              @if (selectedPlanPrice() > 0) {
                <div class="form-field">
                  <label for="methodSelect">Méthode de paiement</label>
                  <select id="methodSelect" class="form-input" [(ngModel)]="selectedMethod">
                    <option value="0">Stripe</option>
                    <option value="1">MTN MoMo</option>
                    <option value="2">Airtel Money</option>
                  </select>
                </div>
              }

              <button
                class="btn btn-primary full-width"
                (click)="changePlan()"
                [disabled]="!selectedPlanId || planBusy()"
              >
                @if (planBusy()) {
                  <span class="material-symbols-outlined spin">progress_activity</span>
                  Traitement…
                } @else {
                  <span class="material-symbols-outlined">check</span>
                  Appliquer le plan
                }
              </button>
            </section>

            <!-- Payments -->
            @if (payments().length > 0) {
              <section class="card section-card">
                <h2 class="section-title">
                  <span class="material-symbols-outlined">payments</span>
                  Paiements ({{ payments().length }})
                </h2>
                <div class="payment-list">
                  @for (p of payments(); track p.id) {
                    <div class="payment-row">
                      <div class="payment-info">
                        <span class="payment-amount">{{ formatAmount(p.amount) }} {{ p.currency }}</span>
                        <span class="payment-method-label">{{ p.method }}</span>
                        <span [class]="'payment-status-chip ' + p.status.toLowerCase()">{{ p.status }}</span>
                      </div>
                      @if (p.status === 'Pending') {
                        <div class="payment-btns">
                          <button class="chip-btn chip-ok" (click)="confirmPayment(p)" [disabled]="actionBusy()">
                            Confirmer
                          </button>
                          <button class="chip-btn chip-danger" (click)="openPaymentRejectModal(p)" [disabled]="actionBusy()">
                            Rejeter
                          </button>
                        </div>
                      }
                    </div>
                  }
                </div>
              </section>
            }

          </div>
        </div>

      }

      <!-- ── Payment reject modal ──────────────────────────────────── -->
      @if (paymentToReject()) {
        <div class="modal-backdrop" (click)="closePaymentRejectModal()">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <h3>Motif de rejet du paiement</h3>
            <textarea
              class="form-input"
              rows="3"
              placeholder="Raison du rejet…"
              [(ngModel)]="paymentRejectReason"
            ></textarea>
            <div class="modal-actions">
              <button class="btn btn-ghost" (click)="closePaymentRejectModal()">Annuler</button>
              <button
                class="btn btn-danger"
                (click)="confirmPaymentReject()"
                [disabled]="!paymentRejectReason.trim() || actionBusy()"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    :host { display: block; }

    .page {
      display: flex; flex-direction: column; gap: 20px;
      max-width: 1100px; margin: 0 auto; padding: 20px;
    }

    /* Breadcrumbs */
    .breadcrumbs {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; color: var(--color-on-surface-variant);
    }
    .breadcrumbs a { color: var(--color-primary); text-decoration: none; }
    .breadcrumbs a:hover { text-decoration: underline; }
    .current { font-weight: 600; color: var(--color-on-surface); }

    /* Header card */
    .header-card {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 16px; flex-wrap: wrap; padding: 24px;
    }
    .header-left h1 { font-size: 22px; font-weight: 800; margin: 6px 0 4px; }
    .meta { font-size: 13px; color: var(--color-on-surface-variant); margin: 0; }
    .badge-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
    .header-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }

    /* Status badges */
    .status-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
    }
    .status-badge.draft     { background: var(--color-surface-container); color: var(--color-on-surface-variant); }
    .status-badge.pending   { background: #fff3cd; color: #856404; }
    .status-badge.active    { background: #d1e7dd; color: #0f5132; }
    .status-badge.rejected  { background: #f8d7da; color: #842029; }
    .status-badge.suspended { background: #ffe5d0; color: #7d3400; }
    .status-badge.verified  { background: #cfe2ff; color: #084298; }
    .status-badge.premium   { background: #fff8e1; color: #7c5000; }

    /* Buttons */
    .btn-outline        { background: transparent; border: 1.5px solid var(--color-primary); color: var(--color-primary); }
    .edit-fiche-btn     { margin-bottom: 12px; align-self: flex-start; text-decoration: none; }
    .btn-danger-outline { background: transparent; border: 1.5px solid var(--color-error); color: var(--color-error); }
    .btn-warn           { background: #fff3cd; color: #664d03; border: 1px solid #ffc107; }
    .btn-danger         { background: var(--color-error); color: #fff; border: none; }
    .btn-ghost          { background: transparent; border: 1px solid var(--color-outline-variant); color: var(--color-on-surface); }
    .full-width         { width: 100%; justify-content: center; }
    .muted-spin         { color: var(--color-on-surface-variant); font-size: 22px; }

    /* Layout */
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .col-left, .col-right { display: flex; flex-direction: column; gap: 16px; }

    /* Cards */
    .section-card { padding: 20px; }
    .section-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 15px; font-weight: 700; margin: 0 0 14px;
    }

    /* Info list */
    .info-list { display: grid; gap: 8px; margin: 0 0 4px; padding: 0; list-style: none; }
    .info-list > div { display: flex; gap: 8px; align-items: baseline; }
    dt { font-size: 12px; font-weight: 600; color: var(--color-on-surface-variant); width: 90px; flex-shrink: 0; }
    dd { font-size: 13px; color: var(--color-on-surface); margin: 0; word-break: break-word; }
    .mono { font-variant-numeric: tabular-nums; font-family: monospace; font-size: 12px; }
    .description {
      font-size: 13px; color: var(--color-on-surface-variant);
      margin-top: 12px; border-top: 1px solid var(--color-outline-variant); padding-top: 12px;
    }
    .muted { font-size: 13px; color: var(--color-on-surface-variant); }
    .link { color: var(--color-primary); word-break: break-all; text-decoration: none; }
    .link:hover { text-decoration: underline; }

    /* Form fields */
    .form-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
    label { font-size: 13px; font-weight: 500; }

    /* Payments */
    .payment-list { display: flex; flex-direction: column; gap: 8px; }
    .payment-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 12px; background: var(--color-surface-container-low);
      border-radius: 8px; gap: 8px; flex-wrap: wrap;
    }
    .payment-info { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .payment-amount { font-weight: 700; font-size: 14px; }
    .payment-method-label { font-size: 12px; color: var(--color-on-surface-variant); }
    .payment-status-chip {
      font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 10px;
    }
    .payment-status-chip.pending  { background: #fff3cd; color: #856404; }
    .payment-status-chip.success  { background: #d1e7dd; color: #0f5132; }
    .payment-status-chip.failed   { background: #f8d7da; color: #842029; }
    .payment-status-chip.refunded { background: #e2e3e5; color: #41464b; }
    .payment-btns { display: flex; gap: 6px; }
    .chip-btn {
      padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;
      border: none; cursor: pointer; transition: opacity .15s;
    }
    .chip-btn:disabled { opacity: .5; cursor: not-allowed; }
    .chip-ok     { background: #d1e7dd; color: #0f5132; }
    .chip-danger { background: #f8d7da; color: #842029; }

    /* Modal */
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,.5);
      display: flex; align-items: center; justify-content: center; z-index: 200;
    }
    .modal-box {
      background: var(--color-surface); border-radius: 16px; padding: 28px;
      width: 100%; max-width: 440px; display: flex; flex-direction: column; gap: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,.3);
    }
    .modal-box h3 { margin: 0; font-size: 17px; font-weight: 700; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; }

    /* Misc */
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      gap: 12px; padding: 64px; text-align: center;
    }
    .skeleton-block {
      background: var(--color-surface-container);
      animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin .8s linear infinite; display: inline-block; }

    @media (max-width: 768px) {
      .detail-grid { grid-template-columns: 1fr; }
      .header-card { flex-direction: column; }
    }
  `],
})
export class AdminCompanyDetailComponent implements OnInit {
  private readonly route      = inject(ActivatedRoute);
  private readonly companySvc = inject(CompanyService);
  private readonly subSvc     = inject(SubscriptionService);
  private readonly adminSvc   = inject(AdminService);
  private readonly toast      = inject(ToastService);

  // ── Expose enum to template ───────────────────────────────────────────────
  readonly CompanyStatus = CompanyStatus;

  // ── UI state ──────────────────────────────────────────────────────────────
  readonly loading    = signal(true);
  readonly actionBusy = signal(false);
  readonly planBusy   = signal(false);

  // Reject company modal
  readonly showRejectModal = signal(false);
  rejectReason = '';

  // Payment reject modal
  readonly paymentToReject = signal<Payment | null>(null);
  paymentRejectReason = '';

  // Subscription form
  selectedPlanId = '';
  selectedMethod = '0'; // 0=Stripe, 1=MTNMoMo, 2=AirtelMoney

  // ── Data signals ──────────────────────────────────────────────────────────
  readonly company       = signal<Company | null>(null);
  readonly subscriptions = signal<Subscription[]>([]);
  readonly payments      = signal<Payment[]>([]);
  readonly plans         = signal<Plan[]>([]);

  // ── Computed ─────────────────────────────────────────────────────────────
  readonly activeSubscription = computed(() =>
    this.subscriptions().find(s => s.isActive) ?? null,
  );

  readonly sectorNames = computed(() =>
    (this.company()?.sectors ?? []).map(s => s.name).join(', ') || '–',
  );

  readonly selectedPlanPrice = computed(() => {
    const p = this.plans().find(p => p.id === this.selectedPlanId);
    return p?.price ?? 0;
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadAll();
  }

  private get companyId(): string {
    return this.route.snapshot.paramMap.get('id')!;
  }

  /** Reload all data for this company (company info, subscriptions, payments, plans). */
  private loadAll(): void {
    this.loading.set(true);
    const id = this.companyId;

    forkJoin({
      company:       this.companySvc.getCompanyById(id).pipe(catchError(() => of(null))),
      subscriptions: this.subSvc.getCompanySubscriptions(id).pipe(catchError(() => of([]))),
      payments:      this.subSvc.getCompanyPayments(id).pipe(catchError(() => of([]))),
      plans:         this.adminSvc.getPlans().pipe(catchError(() => of([]))),
    }).subscribe(({ company, subscriptions, payments, plans }) => {
      this.company.set(company as Company | null);
      this.subscriptions.set(subscriptions as Subscription[]);
      this.payments.set(payments as Payment[]);
      this.plans.set(plans as Plan[]);
      this.loading.set(false);
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  statusLabel(status: CompanyStatus): string {
    const map: Record<string, string> = {
      Draft:     'Brouillon',
      Pending:   'En attente',
      Active:    'Active',
      Rejected:  'Rejetée',
      Suspended: 'Suspendue',
    };
    return map[status] ?? status;
  }

  statusClass(status: CompanyStatus): string {
    return status.toLowerCase();
  }

  formatDate(d: string | Date | undefined): string {
    if (!d) return '–';
    return new Date(d).toLocaleDateString('fr-FR');
  }

  formatAmount(n: number): string {
    return n.toLocaleString('fr-FR');
  }

  // ── Status actions ────────────────────────────────────────────────────────
  submitCompany(): void {
    this.actionBusy.set(true);
    this.companySvc.submitCompany(this.companyId).subscribe({
      next: () => {
        this.toast.show('Fiche soumise — statut : En attente.', 'success');
        this.actionBusy.set(false);
        this.loadAll();
      },
      error: (e: any) => {
        this.toast.show(e?.error?.detail ?? 'Erreur lors de la soumission.', 'error');
        this.actionBusy.set(false);
      },
    });
  }

  /** Draft → Pending → Active in two sequential API calls. */
  activateDirectly(): void {
    this.actionBusy.set(true);
    this.companySvc.submitCompany(this.companyId).subscribe({
      next: () => {
        this.companySvc.validateCompany(this.companyId).subscribe({
          next: () => {
            this.toast.show('Fiche activée directement.', 'success');
            this.actionBusy.set(false);
            this.loadAll();
          },
          error: (e: any) => {
            this.toast.show(e?.error?.detail ?? 'Soumise mais erreur lors de la validation.', 'error');
            this.actionBusy.set(false);
            this.loadAll();
          },
        });
      },
      error: (e: any) => {
        this.toast.show(e?.error?.detail ?? 'Erreur lors de la soumission.', 'error');
        this.actionBusy.set(false);
      },
    });
  }

  validateCompany(): void {
    this.actionBusy.set(true);
    this.companySvc.validateCompany(this.companyId).subscribe({
      next: () => {
        this.toast.show('Fiche validée et activée.', 'success');
        this.actionBusy.set(false);
        this.loadAll();
      },
      error: (e: any) => {
        this.toast.show(e?.error?.detail ?? 'Erreur lors de la validation.', 'error');
        this.actionBusy.set(false);
      },
    });
  }

  openRejectModal(): void  { this.rejectReason = ''; this.showRejectModal.set(true); }
  closeRejectModal(): void { this.showRejectModal.set(false); }

  confirmReject(): void {
    if (!this.rejectReason.trim()) return;
    this.actionBusy.set(true);
    this.closeRejectModal();
    this.companySvc.rejectCompany(this.companyId, this.rejectReason).subscribe({
      next: () => {
        this.toast.show('Fiche rejetée.', 'success');
        this.actionBusy.set(false);
        this.loadAll();
      },
      error: (e: any) => {
        this.toast.show(e?.error?.detail ?? 'Erreur lors du rejet.', 'error');
        this.actionBusy.set(false);
      },
    });
  }

  suspendCompany(): void {
    this.actionBusy.set(true);
    this.companySvc.suspendCompany(this.companyId).subscribe({
      next: () => {
        this.toast.show('Fiche suspendue.', 'success');
        this.actionBusy.set(false);
        this.loadAll();
      },
      error: (e: any) => {
        this.toast.show(e?.error?.detail ?? 'Erreur lors de la suspension.', 'error');
        this.actionBusy.set(false);
      },
    });
  }

  reactivateCompany(): void {
    this.actionBusy.set(true);
    this.companySvc.reactivateCompany(this.companyId).subscribe({
      next: () => {
        this.toast.show('Fiche réactivée.', 'success');
        this.actionBusy.set(false);
        this.loadAll();
      },
      error: (e: any) => {
        this.toast.show(e?.error?.detail ?? 'Erreur lors de la réactivation.', 'error');
        this.actionBusy.set(false);
      },
    });
  }

  verifyIdentity(): void {
    this.actionBusy.set(true);
    this.companySvc.verifyCompany(this.companyId).subscribe({
      next: () => {
        this.toast.show('Identité vérifiée.', 'success');
        this.actionBusy.set(false);
        this.loadAll();
      },
      error: (e: any) => {
        this.toast.show(e?.error?.detail ?? 'Erreur lors de la vérification.', 'error');
        this.actionBusy.set(false);
      },
    });
  }

  // ── Subscription actions ──────────────────────────────────────────────────
  changePlan(): void {
    if (!this.selectedPlanId) return;
    this.planBusy.set(true);
    this.subSvc.createSubscription({
      companyId: this.companyId,
      planId:    this.selectedPlanId,
      method:    Number(this.selectedMethod),
    }).subscribe({
      next: () => {
        this.toast.show('Plan appliqué avec succès.', 'success');
        this.selectedPlanId = '';
        this.planBusy.set(false);
        this.loadAll();
      },
      error: (e: any) => {
        this.toast.show(e?.error?.detail ?? 'Erreur lors du changement de plan.', 'error');
        this.planBusy.set(false);
      },
    });
  }

  // ── Payment actions ───────────────────────────────────────────────────────
  confirmPayment(payment: Payment): void {
    this.actionBusy.set(true);
    this.subSvc.confirmPayment(payment.id).subscribe({
      next: () => {
        this.toast.show('Paiement confirmé.', 'success');
        this.actionBusy.set(false);
        this.loadAll();
      },
      error: (e: any) => {
        this.toast.show(e?.error?.detail ?? 'Erreur lors de la confirmation.', 'error');
        this.actionBusy.set(false);
      },
    });
  }

  openPaymentRejectModal(p: Payment): void  { this.paymentRejectReason = ''; this.paymentToReject.set(p); }
  closePaymentRejectModal(): void           { this.paymentToReject.set(null); }

  confirmPaymentReject(): void {
    const p = this.paymentToReject();
    if (!p || !this.paymentRejectReason.trim()) return;
    this.closePaymentRejectModal();
    this.actionBusy.set(true);
    this.subSvc.rejectPayment(p.id, this.paymentRejectReason).subscribe({
      next: () => {
        this.toast.show('Paiement rejeté.', 'success');
        this.actionBusy.set(false);
        this.loadAll();
      },
      error: (e: any) => {
        this.toast.show(e?.error?.detail ?? 'Erreur lors du rejet du paiement.', 'error');
        this.actionBusy.set(false);
      },
    });
  }
}

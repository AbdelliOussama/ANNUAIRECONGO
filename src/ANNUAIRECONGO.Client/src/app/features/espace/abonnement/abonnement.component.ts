import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, of, switchMap, catchError, map, Observable } from 'rxjs';
import { SubscriptionService } from '@core/services/subscription.service';
import { PlanService } from '@core/services/plan.service';
import { BusinessOwnerService } from '@core/services/business-owner.service';
import { Plan, PlanName, Subscription, Company } from '@core/models/company.model';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { ToastService } from '@shared/services/toast.service';
import { ModalService } from '@shared/services/modal.service';
import { XafPipe } from '@shared/pipes/xaf.pipe';
import { FR } from '@core/i18n/fr.constants';

import { DatePipe } from '@angular/common';

@Component({
  selector: 'ac-espace-abonnement',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    SkeletonComponent,
    XafPipe,
    DatePipe,
  ],
  template: `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">Abonnement</p>
        <h1>Mon abonnement</h1>
        <p class="sub">
          Gérez votre forfait, vos moyens de paiement et le renouvellement
          automatique. Le paiement est sécurisé via MTN Mobile Money,
          Airtel Money ou Stripe.
        </p>
      </header>

      @if (loading()) {
        <ac-skeleton shape="card" height="180px" />
        <div style="margin-top: 24px;">
          <ac-skeleton shape="card" height="280px" />
        </div>
      } @else if (!subscription()) {
        <div class="panel">
          <p>Vous n'avez pas encore d'abonnement actif pour votre entreprise.</p>
          <p class="muted">Choisissez un forfait ci-dessous pour commencer.</p>
        </div>
      } @else {
        <!-- Current subscription -->
        <section class="current">
          <div class="current-meta">
            <span class="eyebrow">Forfait actuel</span>
            <h2>{{ getPlanLabel(subscription()!.planName) }}</h2>
            <p class="muted">
              Forfait actif
            </p>
            <ul class="meta-list">
              <li>
                <span class="material-symbols-outlined" aria-hidden="true">event</span>
                Expire le {{ subscription()!.expiresAt | date:'dd/MM/yyyy' }}
              </li>
              <li>
                <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
                Statut: <strong>{{ subscription()!.isActive ? 'Actif' : 'Inactif' }}</strong>
              </li>
            </ul>
          </div>
          <div class="current-actions">
            <ac-button variant="outline" iconLeft="receipt_long" (click)="goHistorique()">
              Historique de paiement
            </ac-button>
            @if (subscription()!.isActive) {
              <ac-button variant="ghost" iconLeft="cancel" (click)="cancel()">
                Résilier l'abonnement
              </ac-button>
            }
          </div>
        </section>
      }

      <!-- Plans switcher -->
      @if (!loading()) {
        <section class="plans-section">
          <header class="section-head">
            <h2>{{ subscription() ? 'Changer de forfait' : 'Choisir un forfait' }}</h2>
            <p class="muted">Activation immédiate après validation du paiement.</p>
          </header>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            @for (plan of allPlans(); track plan.id) {
              <article class="plan" [class.is-current]="plan.id === subscription()?.planId">
                <h3>{{ getPlanLabel(plan.name) }}</h3>
                <p class="plan-price">
                  @if (plan.price === 0) {
                    <span class="amount">0</span><span class="suffix">XAF</span>
                  } @else {
                    <span class="amount">{{ plan.price | xaf }}</span><span class="suffix">/mois</span>
                  }
                </p>
                <ul class="features">
                  <li>
                    <span class="material-symbols-outlined text-primary icon-filled" aria-hidden="true">check_circle</span>
                    <span>{{ plan.maxImages }} images max.</span>
                  </li>
                  <li>
                    <span class="material-symbols-outlined text-primary icon-filled" aria-hidden="true">check_circle</span>
                    <span>{{ plan.maxDocuments }} documents max.</span>
                  </li>
                  @if (plan.hasAnalytics) {
                    <li>
                      <span class="material-symbols-outlined text-primary icon-filled" aria-hidden="true">check_circle</span>
                      <span>Statistiques avancées</span>
                    </li>
                  }
                  @if (plan.hasFeaturedBadge) {
                    <li>
                      <span class="material-symbols-outlined text-primary icon-filled" aria-hidden="true">check_circle</span>
                      <span>Badge "À la une"</span>
                    </li>
                  }
                </ul>
                @if (plan.id === subscription()?.planId) {
                  <span class="badge badge-verified">Forfait actuel</span>
                } @else {
                  <ac-button [variant]="+plan.name >= 2 ? 'primary' : 'outline'" (click)="changePlan(plan)">
                    Choisir {{ getPlanLabel(plan.name) }}
                  </ac-button>
                }
              </article>
            }
          </div>
        </section>

        <!-- Payment methods -->
        <section class="panel">
          <header class="section-head">
            <h2>Moyens de paiement</h2>
            <p class="muted">Activation immédiate après confirmation de paiement.</p>
          </header>
          <div class="payment-methods-grid">
            <button class="method-btn" [class.selected]="selectedMethod() === 0" (click)="selectedMethod.set(0)">
              <div class="badge-icon" style="background: #d5e3fc; color: #0d3a8a;"><span class="material-symbols-outlined">credit_card</span></div>
              <span class="label">Carte bancaire (Stripe)</span>
            </button>
            <button class="method-btn" [class.selected]="selectedMethod() === 1" (click)="selectedMethod.set(1)">
              <div class="badge-icon" style="background: #fff3c4; color: #7a5800;"><span class="material-symbols-outlined">smartphone</span></div>
              <span class="label">MTN Mobile Money</span>
            </button>
            <button class="method-btn" [class.selected]="selectedMethod() === 2" (click)="selectedMethod.set(2)">
              <div class="badge-icon" style="background: #ffd6d4; color: #9b1a14;"><span class="material-symbols-outlined">smartphone</span></div>
              <span class="label">Airtel Money</span>
            </button>
          </div>
          <p class="caption">Paiement sécurisé. Activation immédiate.</p>
        </section>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { max-width: 1100px; margin: 0 auto; padding: 8px 4px 32px; display: flex; flex-direction: column; gap: 24px; }
    .page-head h1 {
      font-family: var(--font-headline);
      font-size: 30px;
      font-weight: 800;
      color: var(--color-on-surface);
      margin: 6px 0 8px;
    }
    .page-head .sub { color: var(--color-on-secondary-container); font-size: 14px; max-width: 640px; line-height: 1.55; margin: 0; }

    .current {
      background: var(--color-primary);
      color: var(--color-on-primary);
      border-radius: var(--radius-2xl);
      padding: 32px;
      display: flex;
      gap: 32px;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
    }
    .current-meta h2 {
      font-family: var(--font-headline);
      font-size: 32px;
      font-weight: 800;
      margin: 6px 0 4px;
    }
    .current-meta .eyebrow { color: var(--color-primary-fixed); }
    .current-meta .muted { color: var(--color-primary-fixed); margin: 0 0 16px; font-size: 18px; }
    .meta-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .meta-list li { display: flex; align-items: center; gap: 8px; font-size: 14px; }
    .meta-list strong { font-weight: 700; }

    .current-actions { display: flex; flex-direction: column; gap: 8px; }

    .plans-section, .panel { display: flex; flex-direction: column; gap: 18px; }
    .section-head h2 {
      font-family: var(--font-headline);
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 4px;
    }
    .section-head .muted { color: var(--color-on-surface-variant); font-size: 14px; margin: 0; }

    .plan {
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-2xl);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .plan.is-current { border-color: var(--color-primary); box-shadow: 0 8px 24px rgba(0, 78, 52, 0.10); }

    .plan h3 {
      font-family: var(--font-headline);
      font-size: 20px;
      font-weight: 700;
      margin: 0;
    }
    .plan-price { display: flex; align-items: baseline; gap: 6px; margin: 0; }
    .plan-price .amount { font-family: var(--font-headline); font-size: 32px; font-weight: 900; color: var(--color-primary); }
    .plan-price .suffix { color: var(--color-on-surface-variant); font-size: 14px; }
    .features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .features li { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: var(--color-on-surface); }
    .features .material-symbols-outlined { font-size: 16px; margin-top: 2px; }

    .panel {
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-2xl);
      padding: 24px;
    }

    .payment-methods-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
    }
    .method-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 12px 20px;
      background: var(--color-surface-container-lowest);
      border: 2px solid var(--color-outline-variant);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all 0.2s;
    }
    .method-btn:hover {
      border-color: var(--color-primary-fixed);
      background: var(--color-surface-container-low);
    }
    .method-btn.selected {
      border-color: var(--color-primary);
      background: var(--color-surface-container-low);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .badge-icon {
      width: 32px; height: 32px;
      border-radius: var(--radius-full);
      display: inline-flex; align-items: center; justify-content: center;
    }
    .badge-icon .material-symbols-outlined { font-size: 18px; }
    .label {
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 600;
      color: var(--color-on-surface);
    }
    .caption {
      margin-top: 12px;
      font-size: 12px;
      color: var(--color-on-surface-variant);
    }
  `],
})
export class EspaceAbonnementComponent {
  protected readonly FR = FR;
  
  private readonly subService = inject(SubscriptionService);
  private readonly planService = inject(PlanService);
  private readonly boService   = inject(BusinessOwnerService);
  private readonly toast  = inject(ToastService);
  private readonly modal  = inject(ModalService);
  private readonly router = inject(Router);

  protected readonly selectedMethod = signal<number>(0);

  private readonly company = toSignal<Company | null>(
    this.boService.getMyCompanies().pipe(map(list => list[0] || null)),
    { initialValue: null }
  );

  private readonly plansData = toSignal<Plan[] | null>(this.planService.getPlans(), { initialValue: null });
  protected readonly allPlans = computed(() => (this.plansData() || []).filter(p => p.isActive));

  private readonly subsData = toSignal<Subscription[] | null>(
    this.boService.getMyCompanies().pipe(
      switchMap((list: Company[]): Observable<Subscription[]> => {
        if (!list[0]) return of([] as Subscription[]);
        return this.subService.getCompanySubscriptions(list[0].id);
      }),
      catchError(() => of([] as Subscription[]))
    ),
    { initialValue: null }
  );

  protected readonly subscription = computed(() => {
    return this.subsData()?.find(s => s.isActive) || null;
  });

  protected readonly loading = computed(() => this.company() === null && this.subsData() === null && this.plansData() === null);

  protected goHistorique(): void {
    this.router.navigateByUrl('/espace/abonnement/historique');
  }

  protected cancel(): void {
    const s = this.subscription();
    if (!s) return;
    this.subService.cancelSubscription(s.id).subscribe(() => {
      this.toast.success('Votre abonnement a été résilié.');
      window.location.reload();
    });
  }

  protected async changePlan(plan: Plan): Promise<void> {
    const c = this.company();
    if (!c) {
      this.toast.error('Aucune entreprise trouvée pour cet utilisateur.');
      return;
    }

    const { confirmed } = await this.modal.confirm({
      title: `Choisir le forfait ${this.getPlanLabel(plan.name)} ?`,
      body: plan.price === 0
        ? `Votre fiche basculera au forfait gratuit.`
        : `Vous serez facturé ${new Intl.NumberFormat('fr-FR').format(plan.price)} XAF.`,
      confirmLabel: 'Continuer',
      tone: 'confirm',
    });
    if (!confirmed) return;

    // Use selected method
    this.subService.createSubscription({
      companyId: c.id,
      planId: plan.id,
      method: this.selectedMethod()
    }).subscribe({
      next: (res: any) => {
        this.toast.success('Demande d\'abonnement créée.');
        this.router.navigate(['/espace/abonnement/succes'], {
          queryParams: { paymentId: res.paymentId }
        });
      },
      error: () => {
        this.toast.error('Erreur lors de la création de l\'abonnement.');
      }
    });
  }

  protected getPlanLabel(name: number | string | undefined): string {
    if (typeof name === 'string') return name;
    switch (name) {
      case PlanName.Free: return 'Gratuit';
      case PlanName.Pro: return 'Pro';
      case PlanName.Premium: return 'Premium';
      default: return 'Standard';
    }
  }
}

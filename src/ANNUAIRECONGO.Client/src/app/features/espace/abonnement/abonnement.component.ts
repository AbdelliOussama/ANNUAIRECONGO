import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap, catchError, Observable } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { SubscriptionService } from '@core/services/subscription.service';
import { PlanService } from '@core/services/plan.service';
import { CompanyContextService } from '@core/services/company-context.service';
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
            <h2>{{ subscription() ? 'Mettre à niveau mon forfait' : 'Choisir un forfait' }}</h2>
            <p class="muted">{{ subscription() ? 'Passez à Pro ou Premium pour débloquer plus de fonctionnalités.' : 'Activation immédiate après validation du paiement.' }}</p>
          </header>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            @for (plan of allPlans(); track plan.id) {
              <article class="plan" 
                       [class.is-current]="plan.id === subscription()?.planId"
                       [class.is-primary]="isProPlan(plan.name)">
                
                @if (isProPlan(plan.name)) {
                  <span class="plan-highlight">Le plus choisi</span>
                }

                <h3>{{ getPlanLabel(plan.name) }}</h3>
                <p class="plan-price">
                  @if (plan.price === 0) {
                    <span class="amount">0</span><span class="suffix">XAF</span>
                  } @else {
                    <span class="amount">{{ plan.price | xaf }}</span><span class="suffix">/mois</span>
                  }
                </p>
                <ul class="features">
                  @for (f of getPlanFeatures(plan); track f) {
                    <li>
                      <span class="material-symbols-outlined text-primary icon-filled" aria-hidden="true">check_circle</span>
                      <span>{{ f }}</span>
                    </li>
                  }
                </ul>
                @if (plan.id === subscription()?.planId) {
                  <div class="mt-auto">
                    <span class="badge badge-verified w-full justify-center py-2">Forfait actuel</span>
                  </div>
                } @else {
                  <div class="mt-auto">
                    <ac-button [variant]="!isFreePlan(plan.name) ? 'primary' : 'outline'" class="w-full justify-center" (click)="changePlan(plan)">
                      Choisir {{ getPlanLabel(plan.name) }}
                    </ac-button>
                  </div>
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
      position: relative;
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-2xl);
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .plan:hover { transform: translateY(-2px); box-shadow: var(--shadow-editorial); }
    .plan.is-primary {
      border-color: var(--color-primary);
      box-shadow: 0 8px 32px rgba(0, 78, 52, 0.10);
    }
    .plan.is-current { border-width: 2px; }

    .plan-highlight {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--color-primary);
      color: var(--color-on-primary);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 6px 14px;
      border-radius: var(--radius-full);
      white-space: nowrap;
    }

    .plan h3 {
      font-family: var(--font-headline);
      font-size: 22px;
      font-weight: 700;
      margin: 0;
    }
    .plan-price { display: flex; align-items: baseline; gap: 6px; margin: 0; }
    .plan-price .amount { font-family: var(--font-headline); font-size: 36px; font-weight: 900; color: var(--color-primary); }
    .plan-price .suffix { color: var(--color-on-surface-variant); font-size: 14px; }
    .features { list-style: none; padding: 0; margin: 0 0 8px; display: flex; flex-direction: column; gap: 12px; }
    .features li { display: flex; align-items: flex-start; gap: 8px; font-size: 14px; color: var(--color-on-surface); }
    .features .material-symbols-outlined { font-size: 18px; margin-top: 2px; }
    .mt-auto { margin-top: auto; }
    .w-full { width: 100%; }
    .justify-center { justify-content: center; }

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
  private readonly ctx         = inject(CompanyContextService);
  private readonly planService = inject(PlanService);
  private readonly toast  = inject(ToastService);
  private readonly modal  = inject(ModalService);
  private readonly router = inject(Router);

  protected readonly selectedMethod = signal<number>(0);

  // ── Company from shared context ───────────────────────────────────────────
  protected readonly company = this.ctx.selectedCompany;

  private readonly plansData = toSignal<Plan[] | null>(this.planService.getPlans(), { initialValue: null });

  // Show only paid plans (Pro, Premium) when the company already has an active
  // subscription (the Free plan is auto-applied on registration and should no
  // longer appear as a selectable option — it would be a confusing downgrade path).
  // Non-subscribed companies still see all three plans.
  protected readonly allPlans = computed(() => {
    const plans = (this.plansData() || []).filter(p => p.isActive);
    const hasActiveSub = this.subscription() !== null;
    return hasActiveSub ? plans.filter(p => p.price > 0) : plans;
  });

  // ── Subscriptions — re-fetch on company switch ────────────────────────────
  private readonly subsData = toSignal<Subscription[] | null>(
    toObservable(this.ctx.selectedCompanyId).pipe(
      switchMap((id): Observable<Subscription[]> => {
        if (!id) return of([] as Subscription[]);
        return this.subService.getCompanySubscriptions(id).pipe(
          catchError(() => of([] as Subscription[]))
        );
      })
    ),
    { initialValue: null }
  );

  protected readonly subscription = computed(() =>
    this.subsData()?.find(s => s.isActive) ?? null
  );

  protected readonly loading = computed(() =>
    !this.ctx.loaded() || this.subsData() === null || this.plansData() === null
  );

  protected goHistorique(): void {
    this.router.navigateByUrl('/espace/abonnement/historique');
  }

  protected async cancel(): Promise<void> {
    const s = this.subscription();
    if (!s) return;
    const { confirmed } = await this.modal.confirm({
      title: 'Résilier votre abonnement ?',
      body: 'Votre forfait sera annulé immédiatement. Vous pourrez souscrire à nouveau à tout moment.',
      confirmLabel: 'Résilier',
      tone: 'danger',
    });
    if (!confirmed) return;
    this.subService.cancelSubscription(s.id).subscribe({
      next: () => {
        this.toast.success('Votre abonnement a été résilié.');
        // Navigate away then back so Angular re-initialises the component and
        // re-subscribes all signals, fetching fresh data from the server.
        this.router.navigate(['/espace'], { replaceUrl: true }).then(() =>
          this.router.navigate(['/espace/abonnement'], { replaceUrl: true })
        );
      },
      error: (err) => {
        const msg = err?.error?.detail || err?.error?.title || 'Erreur lors de la résiliation.';
        this.toast.error(msg);
      }
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
      error: (err: any) => {
        const msg = err?.error?.detail || err?.error?.title || 'Erreur lors de la création de l\'abonnement.';
        this.toast.error(msg);
      }
    });
  }

  protected isFreePlan(name: number | string | undefined): boolean {
    if (name === undefined) return false;
    const n = typeof name === 'string' ? name.toLowerCase() : name;
    return n === 'free' || n === 0 || n === '0';
  }

  protected isProPlan(name: number | string | undefined): boolean {
    if (name === undefined) return false;
    const n = typeof name === 'string' ? name.toLowerCase() : name;
    return n === 'pro' || n === 1 || n === '1';
  }

  protected isPremiumPlan(name: number | string | undefined): boolean {
    if (name === undefined) return false;
    const n = typeof name === 'string' ? name.toLowerCase() : name;
    return n === 'premium' || n === 2 || n === '2';
  }

  protected getPlanLabel(name: number | string | undefined): string {
    if (name === undefined) return 'Standard';
    if (typeof name === 'string') {
      const lower = name.toLowerCase();
      if (lower === 'free') return 'Gratuit';
      if (lower === 'pro') return 'Pro';
      if (lower === 'premium') return 'Premium';
      if (isNaN(Number(name))) return name;
    }
    const val = Number(name);
    switch (val) {
      case PlanName.Free: return 'Gratuit';
      case PlanName.Pro: return 'Pro';
      case PlanName.Premium: return 'Premium';
      default: return 'Standard';
    }
  }

  protected getPlanFeatures(plan: Plan): string[] {
    const features: string[] = [];
    
    if (plan.hasFeaturedBadge) {
      features.push('Badge « Vérifiée » mis en avant');
    } else {
      features.push('Fiche entreprise basique dans l\'annuaire');
    }

    features.push(`${plan.maxImages} photos et ${plan.maxDocuments} document${plan.maxDocuments > 1 ? 's' : ''}`);

    if (plan.hasAnalytics) {
      features.push('Statistiques détaillées de la fiche');
    }

    if (plan.searchPriority > 0) {
      features.push('Priorité d\'affichage dans les résultats');
    }

    if (plan.name?.toLowerCase().includes('premium')) {
      features.push('Accès API et support dédié');
    } else if (plan.name?.toLowerCase().includes('pro')) {
      features.push('Réponse aux appels d\'offres');
    }

    return features;
  }
}

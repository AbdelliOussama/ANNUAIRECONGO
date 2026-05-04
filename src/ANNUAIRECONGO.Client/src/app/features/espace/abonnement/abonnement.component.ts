import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { MockEspaceService, MOCK_PLANS, MockPlan } from '@core/services/mock/mock-espace.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { PaymentMethodStripComponent } from '@shared/components/payment-method-strip/payment-method-strip.component';
import { ToastService } from '@shared/services/toast.service';
import { ModalService } from '@shared/services/modal.service';
import { XafPipe } from '@shared/pipes/xaf.pipe';
import { FR } from '@core/i18n/fr.constants';

/**
 * /espace/abonnement — current subscription summary + plan switcher.
 *
 * Audit fixes:
 *  - M7  : Stripe is exposed alongside MTN MoMo and Airtel Money
 *  - M15 : XAF currency display via the XafPipe
 *  - C4  : real Reactive interactions (no decorative buttons)
 */
@Component({
  selector: 'ac-espace-abonnement',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    SkeletonComponent,
    PaymentMethodStripComponent,
    XafPipe,
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
      } @else {
        <!-- Current subscription -->
        <section class="current">
          <div class="current-meta">
            <span class="eyebrow">Forfait actuel</span>
            <h2>{{ subscription()!.planName }}</h2>
            <p class="muted">
              {{ subscription()!.monthlyPrice | xaf }} <span>/mois</span>
            </p>
            <ul class="meta-list">
              <li>
                <span class="material-symbols-outlined" aria-hidden="true">event</span>
                Renouvellement le {{ subscription()!.expiresAt }}
              </li>
              <li>
                <span class="material-symbols-outlined" aria-hidden="true">autorenew</span>
                Auto-renouvellement
                <strong>{{ subscription()!.autoRenew ? 'activé' : 'désactivé' }}</strong>
              </li>
            </ul>
          </div>
          <div class="current-actions">
            <ac-button variant="outline" iconLeft="receipt_long" (click)="goHistorique()">
              Historique de paiement
            </ac-button>
            <ac-button variant="ghost" [iconLeft]="subscription()!.autoRenew ? 'pause' : 'play_arrow'" (click)="toggleAutoRenew()">
              {{ subscription()!.autoRenew ? 'Désactiver le renouvellement' : 'Réactiver le renouvellement' }}
            </ac-button>
          </div>
        </section>

        <!-- Plans switcher -->
        <section class="plans-section">
          <header class="section-head">
            <h2>Changer de forfait</h2>
            <p class="muted">Le différentiel est calculé au prorata. Activation immédiate après validation du paiement.</p>
          </header>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            @for (plan of plans; track plan.id) {
              <article class="plan" [class.is-current]="plan.id === subscription()!.planId">
                <h3>{{ plan.name }}</h3>
                <p class="plan-price">
                  @if (plan.monthlyPrice === 0) {
                    <span class="amount">0</span><span class="suffix">XAF</span>
                  } @else {
                    <span class="amount">{{ plan.monthlyPrice | xaf }}</span><span class="suffix">/mois</span>
                  }
                </p>
                <ul class="features">
                  @for (f of plan.features; track f) {
                    <li>
                      <span class="material-symbols-outlined text-primary icon-filled" aria-hidden="true">check_circle</span>
                      <span>{{ f }}</span>
                    </li>
                  }
                </ul>
                @if (plan.id === subscription()!.planId) {
                  <span class="badge badge-verified">Forfait actif</span>
                } @else {
                  <ac-button [variant]="plan.id === 'premium' ? 'primary' : 'outline'" (click)="changePlan(plan)">
                    Choisir {{ plan.name }}
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
          <ac-payment-method-strip [methods]="['mtn', 'airtel', 'stripe']" />
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
    .current-meta .muted span { font-size: 14px; opacity: 0.8; }
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
  `],
})
export class EspaceAbonnementComponent {
  protected readonly FR = FR;
  protected readonly plans: ReadonlyArray<MockPlan> = MOCK_PLANS;

  private readonly espace = inject(MockEspaceService);
  private readonly toast  = inject(ToastService);
  private readonly modal  = inject(ModalService);
  private readonly router = inject(Router);

  protected readonly autoRenew = signal(true);

  protected readonly data = toSignal(
    combineLatest({ subscription: this.espace.mySubscription() }),
    { initialValue: null }
  );
  protected readonly loading       = computed(() => this.data() === null);
  protected readonly subscription  = computed(() => {
    const s = this.data()?.subscription ?? null;
    if (s && s.autoRenew !== this.autoRenew()) {
      // sync once with the seed so the toggle starts in the right state
      this.autoRenew.set(s.autoRenew);
    }
    return s ? { ...s, autoRenew: this.autoRenew() } : null;
  });

  protected goHistorique(): void {
    this.router.navigateByUrl('/espace/abonnement/historique');
  }

  protected toggleAutoRenew(): void {
    this.autoRenew.update((v) => !v);
    this.toast.info(this.autoRenew()
      ? 'Renouvellement automatique réactivé.'
      : 'Renouvellement automatique désactivé. Pensez à renouveler manuellement avant échéance.');
  }

  protected async changePlan(plan: MockPlan): Promise<void> {
    const { confirmed } = await this.modal.confirm({
      title: `Passer au forfait ${plan.name} ?`,
      body: plan.monthlyPrice === 0
        ? `Votre fiche basculera au forfait gratuit dès la fin de votre période en cours.`
        : `Vous serez facturé ${new Intl.NumberFormat('fr-FR').format(plan.monthlyPrice)} XAF par mois. Le différentiel est calculé au prorata.`,
      confirmLabel: 'Continuer vers le paiement',
      tone: 'confirm',
    });
    if (!confirmed) return;

    this.espace.changePlan(plan.id).subscribe(() => {
      // Mock payment outcome — flip a coin and route to succès / échec
      const success = Math.random() > 0.15;
      this.router.navigateByUrl(success ? '/espace/abonnement/succes' : '/espace/abonnement/echec');
    });
  }
}

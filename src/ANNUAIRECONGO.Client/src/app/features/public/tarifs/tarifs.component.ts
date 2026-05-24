import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaymentMethodStripComponent } from '@shared/components/payment-method-strip/payment-method-strip.component';
import { XafPipe } from '@shared/pipes/xaf.pipe';
import { FR } from '@core/i18n/fr.constants';
import { PlanService } from '@core/services/plan.service';
import { Plan, PlanName } from '@core/models/company.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { inject } from '@angular/core';

interface PlanView {
  id: string;
  name: string;
  monthly: number;
  highlight?: string;
  features: string[];
  cta: string;
  ctaLink: string;
  primary?: boolean;
}

interface FaqItem { q: string; a: string; }

/**
 * /tarifs — three forfaits in French (audit C5).
 * Includes the comparison table, payment-method strip with Stripe (audit M7),
 * and an FAQ block.
 */
@Component({
  selector: 'ac-tarifs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PaymentMethodStripComponent, XafPipe],
  template: `
    <!-- Hero -->
    <section class="hero text-center px-6 pt-20 pb-12 max-w-4xl mx-auto">
      <p class="eyebrow mb-4">Forfaits & Abonnements</p>
      <h1 class="text-4xl md:text-6xl font-black font-headline tracking-tight mb-6">
        Choisissez le forfait<br />
        <em class="text-primary not-italic">adapté à votre entreprise.</em>
      </h1>
      <p class="text-lg text-secondary leading-relaxed max-w-2xl mx-auto mb-8">
        Trois niveaux d'abonnement clairs, sans surprise, payables en mobile money
        ou par carte bancaire. Activation immédiate après validation.
      </p>

      <!-- Billing toggle -->
      <div class="toggle" role="radiogroup" aria-label="Période de facturation">
        <button
          type="button"
          role="radio"
          [attr.aria-checked]="billing() === 'monthly'"
          [class.is-active]="billing() === 'monthly'"
          (click)="billing.set('monthly')"
        >Mensuel</button>
        <button
          type="button"
          role="radio"
          [attr.aria-checked]="billing() === 'annual'"
          [class.is-active]="billing() === 'annual'"
          (click)="billing.set('annual')"
        >Annuel <span class="discount">-15%</span></button>
      </div>
    </section>

    <!-- Plan cards -->
    <section class="px-6 md:px-12 max-w-7xl mx-auto pb-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        @for (plan of plans(); track plan.id) {
          <article class="plan" [class.is-primary]="plan.primary">
            @if (plan.highlight) {
              <span class="plan-highlight">{{ plan.highlight }}</span>
            }

            <h3 class="plan-name">{{ plan.name }}</h3>
            <div class="plan-price">
              @if (plan.monthly === 0) {
                <span class="amount">0</span>
                <span class="suffix">XAF</span>
              } @else {
                <span class="amount">{{ priceFor(plan) | xaf }}</span>
                <span class="suffix">{{ billing() === 'monthly' ? FR.plans.perMonth : FR.plans.perYear }}</span>
              }
            </div>

            <ul class="plan-features">
              @for (f of plan.features; track f) {
                <li>
                  <span class="material-symbols-outlined text-primary icon-filled" aria-hidden="true">check_circle</span>
                  <span>{{ f }}</span>
                </li>
              }
            </ul>

            <a
              [routerLink]="plan.ctaLink"
              class="btn"
              [class.btn-primary]="plan.primary"
              [class.btn-outline]="!plan.primary"
            >{{ plan.cta }}</a>
          </article>
        }
      </div>
    </section>

    <!-- Payment methods -->
    <section class="payments py-12 px-6 max-w-4xl mx-auto text-center">
      <p class="eyebrow mb-3">Moyens de paiement</p>
      <h2 class="text-2xl font-bold font-headline mb-6">
        Mobile money national ou carte bancaire internationale.
      </h2>
      <ac-payment-method-strip [methods]="['mtn', 'airtel', 'stripe']" />
    </section>

    <!-- Comparison table -->
    <section class="py-16 px-6 md:px-12 max-w-7xl mx-auto">
      <h2 class="text-3xl font-bold font-headline tracking-tight mb-10 text-center">
        Comparaison détaillée
      </h2>
      <div class="comparison-wrapper">
        <table class="comparison" aria-label="Comparaison détaillée des forfaits">
          <thead>
            <tr>
              <th class="left">Fonctionnalité</th>
              <th>Free</th>
              <th class="featured">Pro</th>
              <th>Premium</th>
            </tr>
          </thead>
          <tbody>
            @for (row of comparison; track row.label) {
              <tr>
                <td class="left">{{ row.label }}</td>
                <td>{{ row.free }}</td>
                <td class="featured">{{ row.pro }}</td>
                <td>{{ row.premium }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    <!-- FAQ -->
    <section class="py-16 bg-surface-container-low">
      <div class="max-w-3xl mx-auto px-6">
        <p class="eyebrow mb-3 text-center">Questions fréquentes</p>
        <h2 class="text-3xl font-bold font-headline tracking-tight mb-8 text-center">
          Tout savoir sur la facturation.
        </h2>
        <div class="faq-list">
          @for (item of faq; track item.q) {
            <details class="faq-item">
              <summary>
                <span>{{ item.q }}</span>
                <span class="material-symbols-outlined" aria-hidden="true">expand_more</span>
              </summary>
              <p>{{ item.a }}</p>
            </details>
          }
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="py-20 text-center max-w-3xl mx-auto px-6">
      <h2 class="text-3xl md:text-4xl font-bold font-headline tracking-tight mb-5">
        Encore des questions ?
      </h2>
      <p class="text-secondary mb-8">
        Notre équipe commerciale répond sous 24 h ouvrées.
      </p>
      <a routerLink="/contact" class="btn btn-primary py-4 px-10 text-sm">
        Contacter le support
      </a>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .toggle {
      display: inline-flex;
      gap: 4px;
      padding: 4px;
      border-radius: var(--radius-full);
      background: var(--color-surface-container);
    }
    .toggle button {
      border: none;
      background: transparent;
      padding: 8px 18px;
      font-family: var(--font-body);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-on-secondary-container);
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }
    .toggle .is-active {
      background: var(--color-primary);
      color: var(--color-on-primary);
    }
    .toggle .discount {
      margin-left: 6px;
      color: var(--color-tertiary-container);
      font-size: 10px;
    }
    .toggle .is-active .discount { color: var(--color-tertiary-fixed); }

    .plan {
      position: relative;
      padding: 32px;
      border-radius: var(--radius-2xl);
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
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
    .plan-name {
      font-family: var(--font-headline);
      font-size: 22px;
      font-weight: 700;
      color: var(--color-on-surface);
      margin: 0;
    }
    .plan-price { display: flex; align-items: baseline; gap: 6px; }
    .plan-price .amount {
      font-family: var(--font-headline);
      font-size: 40px;
      font-weight: 900;
      color: var(--color-primary);
      letter-spacing: -0.02em;
    }
    .plan-price .suffix { color: var(--color-on-surface-variant); font-size: 14px; }

    .plan-features {
      list-style: none; padding: 0; margin: 0;
      display: flex; flex-direction: column; gap: 12px;
    }
    .plan-features li {
      display: flex; align-items: flex-start; gap: 8px;
      font-size: 14px; color: var(--color-on-surface);
    }
    .plan-features .material-symbols-outlined { font-size: 18px; margin-top: 1px; }

    .plan .btn { justify-content: center; padding: 14px 24px; }

    .comparison-wrapper {
      overflow-x: auto;
      border-radius: var(--radius-xl);
      border: 1px solid var(--color-outline-variant);
      background: var(--color-surface-container-lowest);
    }
    .comparison {
      width: 100%;
      border-collapse: collapse;
      font-family: var(--font-body);
    }
    .comparison th, .comparison td {
      padding: 14px 16px;
      text-align: center;
      font-size: 13px;
      border-bottom: 1px solid var(--color-outline-variant);
    }
    .comparison th {
      background: var(--color-surface-container-low);
      font-weight: 700;
      color: var(--color-on-surface);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 11px;
    }
    .comparison .left { text-align: left; }
    .comparison .featured {
      background: rgba(0, 78, 52, 0.04);
      color: var(--color-primary);
      font-weight: 700;
    }
    .comparison tbody tr:last-child td { border-bottom: 0; }

    .faq-list { display: flex; flex-direction: column; gap: 8px; }
    .faq-item {
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-lg);
      padding: 0 18px;
    }
    .faq-item[open] { border-color: var(--color-primary); }
    .faq-item summary {
      list-style: none;
      padding: 16px 0;
      cursor: pointer;
      font-weight: 700;
      color: var(--color-on-surface);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .faq-item summary::-webkit-details-marker { display: none; }
    .faq-item .material-symbols-outlined { transition: transform 0.2s; }
    .faq-item[open] .material-symbols-outlined { transform: rotate(180deg); }
    .faq-item p { padding: 0 0 16px; color: var(--color-on-surface-variant); font-size: 14px; line-height: 1.6; margin: 0; }
  `],
})
export class TarifsComponent {
  protected readonly FR = FR;
  protected readonly billing = signal<'monthly' | 'annual'>('monthly');

  private readonly planService = inject(PlanService);
  private readonly plansData = toSignal(this.planService.getPlans(), { initialValue: [] as Plan[] });

  protected readonly plans = computed<PlanView[]>(() => {
    const raw = this.plansData() || [];
    return raw
      .filter(p => p.isActive)
      .sort((a, b) => a.price - b.price)
      .map(p => {
        const isFree = p.price === 0;
        const lowerName = p.name ? p.name.toLowerCase() : '';
        const isPro = lowerName.includes('pro');
        const isPremium = lowerName.includes('premium');

        return {
          id: p.id || lowerName,
          name: p.name,
          monthly: p.price,
          highlight: isPro ? 'Le plus choisi' : undefined,
          primary: isPro || p.searchPriority > 0,
          features: this.getPlanFeatures(p),
          // Free plan: CTA makes it clear the plan is included at registration (no manual selection needed).
          // Pro plan: direct to registration; after login the user can upgrade from /espace/abonnement.
          // Premium plan: contact sales.
          cta: isFree ? 'Commencer gratuitement' : (isPremium ? 'Contacter les ventes' : `Choisir ${p.name}`),
          ctaLink: isPremium ? '/contact' : '/auth/inscription',
        } as PlanView;
      });
  });

  protected getPlanFeatures(plan: Plan): string[] {
    const features: string[] = [];
    
    // Visibilité & Badge
    if (plan.hasFeaturedBadge) {
      features.push('Badge « Vérifiée » mis en avant');
    } else {
      features.push('Fiche entreprise basique dans l\'annuaire');
    }

    // Medias
    features.push(`${plan.maxImages} photos et ${plan.maxDocuments} document${plan.maxDocuments > 1 ? 's' : ''}`);

    // Analytics
    if (plan.hasAnalytics) {
      features.push('Statistiques détaillées de la fiche');
    }

    // Priorité de recherche
    if (plan.searchPriority > 0) {
      features.push('Priorité d\'affichage dans les résultats');
    }
    
    // Premium specific (hardcoded supplementary features for now)
    if (plan.name?.toLowerCase().includes('premium')) {
      features.push('Accès API et support dédié');
    } else if (plan.name?.toLowerCase().includes('pro')) {
      features.push('Réponse aux appels d\'offres');
    }

    return features;
  }

  protected priceFor(plan: PlanView): number {
    if (plan.monthly === 0) return 0;
    return this.billing() === 'monthly'
      ? plan.monthly
      : Math.round(plan.monthly * 12 * 0.85);
  }

  protected readonly comparison = [
    { label: 'Visibilité annuaire',          free: 'Standard',         pro: 'Mise en avant',     premium: 'Premium' },
    { label: 'Photos sur la fiche',          free: '3',                pro: '10',                premium: '50' },
    { label: 'Documents (RCCM, NIU, etc.)',  free: '1',                pro: '5',                 premium: '20' },
    { label: 'Badge officiel',               free: '—',                pro: 'Vérifiée',          premium: 'Premium' },
    { label: 'Statistiques de la fiche',     free: '—',                pro: 'Mensuelles',        premium: 'Avancées + exports' },
    { label: 'Mise en avant cartographie',   free: '—',                pro: '—',                 premium: 'Oui' },
    { label: 'Réponse aux appels d\'offres', free: '—',                pro: 'Oui',               premium: 'Oui' },
    { label: 'Accès API',                    free: '—',                pro: '—',                 premium: 'Oui' },
    { label: 'Support',                      free: 'Communauté',       pro: 'E-mail 24 h',       premium: 'Dédié 4 h' },
  ];

  protected readonly faq: ReadonlyArray<FaqItem> = [
    {
      q: 'Comment puis-je payer mon abonnement ?',
      a: 'Trois moyens de paiement sont acceptés : MTN Mobile Money, Airtel Money et carte bancaire internationale via Stripe. Le paiement est sécurisé et l\'activation est immédiate.',
    },
    {
      q: 'Puis-je changer ou annuler mon forfait ?',
      a: 'Oui. Vous pouvez passer d\'un forfait inférieur à un forfait supérieur à tout moment ; le différentiel est calculé au prorata. L\'annulation prend effet à la fin de la période en cours.',
    },
    {
      q: 'La TVA est-elle incluse dans le prix affiché ?',
      a: 'Les tarifs affichés sont indiqués hors taxes. La TVA en vigueur sera précisée sur votre facture conformément à la réglementation congolaise.',
    },
    {
      q: 'Puis-je bénéficier d\'une période d\'essai ?',
      a: 'Le forfait Gratuit est automatiquement attribué à toute nouvelle entreprise lors de l\'inscription — aucune action supplémentaire n\'est requise. Pour les forfaits Pro et Premium, vous pouvez passer à niveau à tout moment depuis votre espace entreprise.',
    },
    {
      q: 'Comment recevoir mes factures ?',
      a: 'Toutes vos factures sont disponibles dans votre espace entreprise, sous « Historique de paiements ». Une copie est également envoyée par e-mail à chaque échéance.',
    },
  ];
}

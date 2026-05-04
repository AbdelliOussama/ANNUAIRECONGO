import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface FaqItem { q: string; a: string; }

@Component({
  selector: 'ac-support',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="hero text-center max-w-4xl mx-auto px-6 pt-20 pb-12">
      <p class="eyebrow mb-4">Support & Aide</p>
      <h1 class="text-4xl md:text-5xl font-black font-headline tracking-tight mb-6">
        Trouvez la réponse à votre question.
      </h1>
      <p class="text-lg text-secondary leading-relaxed">
        Foire aux questions, guides d'usage et coordonnées de l'équipe support
        pour les utilisateurs de la plateforme.
      </p>
    </section>

    <section class="py-12 px-6 max-w-3xl mx-auto">
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
    </section>

    <section class="cta py-20 text-center px-6 max-w-3xl mx-auto">
      <h2 class="text-3xl font-bold font-headline mb-4">Vous n'avez pas trouvé ?</h2>
      <p class="text-secondary mb-8">
        Notre équipe support répond directement par e-mail sous 24 h ouvrées.
      </p>
      <a routerLink="/contact" class="btn btn-primary py-4 px-10 text-sm">
        Contacter le support
      </a>
    </section>
  `,
  styles: [`
    :host { display: block; }
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
    .faq-item p {
      padding: 0 0 16px;
      color: var(--color-on-surface-variant);
      font-size: 14px;
      line-height: 1.6;
      margin: 0;
    }
  `],
})
export class SupportComponent {
  protected readonly faq: ReadonlyArray<FaqItem> = [
    {
      q: 'Comment inscrire mon entreprise ?',
      a: 'Cliquez sur "S\'inscrire" depuis l\'accueil ou le menu, créez votre compte en 3 étapes (compte personnel, entreprise, vérification e-mail) puis renseignez le RCCM et le NIU. Notre équipe valide votre fiche manuellement sous 48 h ouvrées.',
    },
    {
      q: 'Combien coûte la plateforme ?',
      a: 'Trois forfaits sont disponibles : Free (gratuit), Pro (25 000 XAF / mois) et Premium (75 000 XAF / mois). Voir la page Tarifs pour le détail des fonctionnalités.',
    },
    {
      q: 'Comment puis-je payer mon abonnement ?',
      a: 'Trois moyens de paiement : MTN Mobile Money, Airtel Money et carte bancaire internationale via Stripe. Paiement sécurisé, activation immédiate.',
    },
    {
      q: 'Que faire si ma fiche est rejetée ?',
      a: 'Vous recevrez un e-mail précisant le motif de rejet. Corrigez les informations demandées dans votre espace puis soumettez à nouveau pour validation.',
    },
    {
      q: 'Comment supprimer mon compte ?',
      a: 'Rendez-vous dans Mon Espace > Mon compte > Supprimer mon compte. Les données personnelles sont anonymisées dans un délai maximal de 12 mois.',
    },
  ];
}

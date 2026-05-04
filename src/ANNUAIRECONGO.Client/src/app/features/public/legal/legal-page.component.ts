import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

interface LegalSection { heading: string; body: string[]; }

interface LegalContent {
  title: string;
  intro: string;
  sections: LegalSection[];
  updated: string;
}

const CONTENT: Record<string, LegalContent> = {
  mentions: {
    title: 'Mentions légales',
    intro: 'Cette page rassemble les informations légales relatives à l\'éditeur, à l\'hébergement et à la propriété intellectuelle de la plateforme Annuaire Congo.',
    updated: 'Mise à jour le 1 mai 2026',
    sections: [
      {
        heading: 'Éditeur',
        body: [
          'La plateforme Annuaire Congo est éditée par la République du Congo, sous la supervision du ministère en charge du commerce et des PME.',
          'Adresse : Avenue Patrice Lumumba, Brazzaville, République du Congo.',
          'Contact : contact@annuaire-congo.cg — +242 06 600 00 00.',
        ],
      },
      {
        heading: 'Hébergement',
        body: [
          'L\'infrastructure technique est hébergée par un opérateur agréé. Les coordonnées de l\'hébergeur sont communiquées sur demande pour toute requête contentieuse.',
        ],
      },
      {
        heading: 'Propriété intellectuelle',
        body: [
          'Le nom, le logo, les marques, les contenus éditoriaux et la structure de la plateforme sont protégés par le droit de la propriété intellectuelle.',
          'Toute reproduction, représentation, modification ou exploitation totale ou partielle, par quelque procédé que ce soit, sans autorisation préalable, est strictement interdite.',
        ],
      },
      {
        heading: 'Responsabilité',
        body: [
          'Les informations publiées sur les fiches entreprises sont déclarées par les entreprises elles-mêmes et vérifiées manuellement par notre équipe à partir des registres officiels (RCCM, NIU).',
          'Annuaire Congo ne saurait être tenue responsable d\'éventuelles erreurs, inexactitudes ou omissions dans les informations diffusées.',
        ],
      },
    ],
  },
  confidentialite: {
    title: 'Politique de confidentialité',
    intro: 'Annuaire Congo s\'engage à protéger les données personnelles des visiteurs et des entreprises inscrites. Cette politique précise les données collectées, leurs finalités et les droits des utilisateurs.',
    updated: 'Mise à jour le 1 mai 2026',
    sections: [
      {
        heading: 'Données collectées',
        body: [
          'Lors de l\'inscription : nom, prénom, adresse e-mail, téléphone, raison sociale de l\'entreprise, RCCM, NIU.',
          'Lors de la navigation : pages consultées, requêtes de recherche, données techniques anonymisées (type de navigateur, durée de visite).',
        ],
      },
      {
        heading: 'Finalités du traitement',
        body: [
          'Vérifier l\'identité légale des entreprises inscrites au Registre du Commerce et du Crédit Mobilier.',
          'Permettre la recherche et la prise de contact entre acteurs économiques.',
          'Améliorer la qualité du service grâce à des statistiques d\'usage agrégées.',
        ],
      },
      {
        heading: 'Durée de conservation',
        body: [
          'Les données sont conservées tant que le compte est actif. Après la suppression d\'un compte, les données personnelles sont anonymisées dans un délai maximal de 12 mois.',
        ],
      },
      {
        heading: 'Vos droits',
        body: [
          'Conformément à la réglementation applicable, vous disposez d\'un droit d\'accès, de rectification, de suppression et de portabilité de vos données.',
          'Pour exercer ces droits : confidentialite@annuaire-congo.cg.',
        ],
      },
      {
        heading: 'Cookies',
        body: [
          'Annuaire Congo utilise des cookies strictement nécessaires au fonctionnement de la plateforme et, sur consentement, des cookies de mesure d\'audience anonymisés.',
        ],
      },
    ],
  },
};

/**
 * Generic legal page component reused for /mentions-legales and /confidentialite.
 * The route's `data.kind` tells the component which content block to render.
 */
@Component({
  selector: 'ac-legal-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="container">
      <p class="eyebrow mb-4">{{ content().updated }}</p>
      <h1 class="text-4xl md:text-5xl font-black font-headline tracking-tight mb-6">
        {{ content().title }}
      </h1>
      <p class="lead">{{ content().intro }}</p>

      @for (s of content().sections; track s.heading) {
        <section class="section">
          <h2>{{ s.heading }}</h2>
          @for (p of s.body; track p) {
            <p>{{ p }}</p>
          }
        </section>
      }
    </article>
  `,
  styles: [`
    :host { display: block; }
    .container { max-width: 760px; padding: 80px 24px 96px; margin: 0 auto; }
    .lead {
      font-size: 17px;
      line-height: 1.7;
      color: var(--color-on-surface-variant);
      margin-bottom: 40px;
    }
    .section { margin-top: 40px; }
    .section h2 {
      font-family: var(--font-headline);
      font-size: 22px;
      color: var(--color-on-surface);
      margin: 0 0 14px;
    }
    .section p {
      font-size: 15px;
      line-height: 1.7;
      color: var(--color-on-surface-variant);
      margin: 0 0 12px;
    }
  `],
})
export class LegalPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly data  = toSignal(this.route.data, { initialValue: {} as { kind?: 'mentions' | 'confidentialite' } });
  protected readonly content = computed<LegalContent>(() =>
    CONTENT[this.data().kind ?? 'mentions'] || CONTENT['mentions']
  );
}

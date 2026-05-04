import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectorTileComponent } from '@shared/components/sector-tile/sector-tile.component';
import { FR } from '@core/i18n/fr.constants';

interface SectorView {
  slug: string;
  name: string;
  icon: string;
  description: string;
  highlights: string[];
}

/**
 * /secteurs — strictly the 6 SFD sectors (audit C1, C2).
 * No Mines / Banques / Agriculture / Télécoms — those did not belong here.
 * No mention of "République Démocratique du Congo" — this is Congo-Brazzaville.
 */
@Component({
  selector: 'ac-secteurs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SectorTileComponent],
  template: `
    <section class="hero">
      <div class="max-w-5xl mx-auto px-6 md:px-12 text-center">
        <p class="eyebrow mb-4">Paysage Économique du Congo-Brazzaville</p>
        <h1 class="text-4xl md:text-6xl font-black font-headline tracking-tight mb-6">
          6 secteurs stratégiques<br />
          <em class="text-primary not-italic">structurent l'économie nationale.</em>
        </h1>
        <p class="text-lg text-secondary max-w-3xl mx-auto leading-relaxed">
          De la façade portuaire de Pointe-Noire aux corridors logistiques transfrontaliers,
          l'Annuaire Congo recense les acteurs économiques organisés autour des piliers du
          commerce extérieur et de la production nationale.
        </p>
      </div>
    </section>

    <section class="py-20 px-6 md:px-12 max-w-7xl mx-auto" aria-label="Liste des secteurs">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (s of sectors; track s.slug) {
          <ac-sector-tile
            [slug]="s.slug"
            [name]="s.name"
            [icon]="s.icon"
            [description]="s.description"
            [chips]="s.highlights"
            size="lg"
            theme="primary"
          />
        }
      </div>
    </section>

    <!-- Why these 6? -->
    <section class="py-20 bg-surface-container-low">
      <div class="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-start">
        <div>
          <p class="eyebrow mb-3">Pourquoi ces 6 secteurs ?</p>
          <h2 class="text-3xl md:text-4xl font-bold font-headline tracking-tight mb-6">
            Un cadrage aligné sur le tissu économique réel.
          </h2>
          <p class="text-secondary leading-relaxed mb-4">
            Le périmètre fonctionnel de la plateforme s'aligne sur les filières clés
            identifiées par les autorités économiques pour structurer l'écosystème
            national : commerce extérieur, transit, transformation industrielle et
            services associés.
          </p>
          <p class="text-secondary leading-relaxed">
            Cette segmentation simplifie la recherche pour les acheteurs publics et privés,
            tout en garantissant aux entreprises inscrites une catégorisation claire,
            cohérente et conforme aux référentiels officiels.
          </p>
        </div>

        <div class="bullets">
          <div class="bullet">
            <span class="material-symbols-outlined text-primary icon-filled" aria-hidden="true">verified</span>
            <p>Catégorisation conforme au cahier des charges officiel.</p>
          </div>
          <div class="bullet">
            <span class="material-symbols-outlined text-primary icon-filled" aria-hidden="true">filter_list</span>
            <p>Filtrage simplifié pour les donneurs d'ordres et les acheteurs publics.</p>
          </div>
          <div class="bullet">
            <span class="material-symbols-outlined text-primary icon-filled" aria-hidden="true">handshake</span>
            <p>Mise en relation directe entre entreprises complémentaires d'un même secteur.</p>
          </div>
          <div class="bullet">
            <span class="material-symbols-outlined text-primary icon-filled" aria-hidden="true">analytics</span>
            <p>Statistiques sectorielles consolidées pour le suivi économique national.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-24 text-center max-w-3xl mx-auto px-6">
      <h2 class="text-3xl md:text-4xl font-bold font-headline tracking-tight mb-5">
        Votre entreprise opère dans l'un de ces secteurs ?
      </h2>
      <p class="text-secondary mb-8">
        Rejoignez l'annuaire officiel et faites partie de la cartographie économique du pays.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a routerLink="/auth/inscription" class="btn btn-primary py-4 px-10 text-sm">
          Inscrire mon entreprise
        </a>
        <a routerLink="/annuaire" class="btn btn-outline py-4 px-10 text-sm">
          Explorer l'annuaire
        </a>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .hero { padding: 96px 0 48px; }
    .bullets { display: flex; flex-direction: column; gap: 16px; }
    .bullet {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 16px;
      background: var(--color-surface-container-lowest);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-outline-variant);
    }
    .bullet p { color: var(--color-on-surface); font-size: 14px; line-height: 1.55; margin: 0; }
    .bullet .material-symbols-outlined { font-size: 22px; flex-shrink: 0; }
  `],
})
export class SecteursComponent {
  protected readonly FR = FR;

  protected readonly sectors: ReadonlyArray<SectorView> = [
    {
      slug: FR.sectors.maritime.slug,
      name: FR.sectors.maritime.name,
      icon: FR.sectors.maritime.icon,
      description: 'Compagnies maritimes, agences portuaires, services offshore et opérations sur le port autonome de Pointe-Noire.',
      highlights: ['Pointe-Noire', 'Offshore', 'Agences'],
    },
    {
      slug: FR.sectors.logistique.slug,
      name: FR.sectors.logistique.name,
      icon: FR.sectors.logistique.icon,
      description: 'Transport routier, ferroviaire, aérien et solutions logistiques intégrées sur l\'ensemble du territoire.',
      highlights: ['Routier', 'Ferroviaire', 'Aérien'],
    },
    {
      slug: FR.sectors.douane.slug,
      name: FR.sectors.douane.name,
      icon: FR.sectors.douane.icon,
      description: 'Commissionnaires en douane, transitaires et conseil en réglementation des échanges extérieurs.',
      highlights: ['Dédouanement', 'Transit', 'Conseil'],
    },
    {
      slug: FR.sectors.industrie.slug,
      name: FR.sectors.industrie.name,
      icon: FR.sectors.industrie.icon,
      description: 'Manufacture, transformation industrielle, agro-industrie et production locale à valeur ajoutée.',
      highlights: ['Manufacture', 'Transformation', 'Production'],
    },
    {
      slug: FR.sectors.securite.slug,
      name: FR.sectors.securite.name,
      icon: FR.sectors.securite.icon,
      description: 'Sociétés de surveillance, gardiennage, protection rapprochée et systèmes de sécurité électroniques.',
      highlights: ['Gardiennage', 'Vidéosurveillance', 'Audit'],
    },
    {
      slug: FR.sectors.manutention.slug,
      name: FR.sectors.manutention.name,
      icon: FR.sectors.manutention.icon,
      description: 'Stockage, gestion d\'entrepôts, opérations portuaires lourdes et service au navire.',
      highlights: ['Entrepôts', 'Conteneurs', 'Service navire'],
    },
  ];
}

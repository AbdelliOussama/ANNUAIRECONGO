import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicSearchBarComponent } from '@shared/components/public-search-bar/public-search-bar.component';
import { SectorTileComponent } from '@shared/components/sector-tile/sector-tile.component';
import { StatTileComponent } from '@shared/components/stat-tile/stat-tile.component';
import { FR } from '@core/i18n/fr.constants';

interface SectorView {
  slug: string;
  name: string;
  icon: string;
  description: string;
  highlights: string[];
}

/**
 * Accueil — / (PublicLayout child).
 * Faithful Angular port of the maquette `index.html`.
 *
 * Sections:
 *  1. Hero      — eyebrow, DM Serif h1, functional search bar
 *  2. Stats row — 6 secteurs / 3 forfaits / 100 % vérification (audit M5 — credible numbers)
 *  3. Sectors bento — the 6 SFD sectors only (audit C2)
 *  4. Trust band — verification protocol (RCCM mapping, NIU sync, manual validation)
 *  5. Final CTA — sign-up + tarifs links
 */
@Component({
  selector: 'ac-accueil',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    PublicSearchBarComponent,
    SectorTileComponent,
    StatTileComponent,
  ],
  template: `
    <!-- ─── Hero ─────────────────────────────────────────── -->
    <section
      class="relative min-h-[840px] flex flex-col items-center justify-center px-6 overflow-hidden"
      aria-labelledby="hero-title"
    >
      <div class="absolute inset-0 congo-pattern pointer-events-none" aria-hidden="true"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
           style="background: rgba(0,78,52,0.05); filter: blur(120px);" aria-hidden="true"></div>

      <div class="max-w-4xl w-full text-center relative z-10">
        <span class="inline-block bg-tertiary-fixed text-on-tertiary-fixed px-4 py-1.5 rounded-full text-[11px] font-bold font-label uppercase tracking-widest mb-6">
          {{ FR.app.badge }}
        </span>

        <h1 id="hero-title"
            class="text-5xl md:text-7xl font-black font-headline text-on-surface tracking-tight leading-[1.05] mb-6">
          La référence digitale<br />
          <em class="text-primary not-italic">de l'économie congolaise.</em>
        </h1>

        <p class="text-lg text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-body">
          Trouvez des prestataires vérifiés RCCM, consultez le registre national des entreprises
          et connectez-vous avec l'écosystème économique du Congo-Brazzaville.
        </p>

        <ac-public-search-bar />

        <!-- Trust indicators -->
        <div class="mt-10 flex flex-wrap justify-center gap-8 opacity-70" aria-label="Garanties de la plateforme">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-sm icon-filled" aria-hidden="true">verified</span>
            <span class="text-xs font-bold font-label uppercase">RCCM Validé</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-sm icon-filled" aria-hidden="true">shield_with_heart</span>
            <span class="text-xs font-bold font-label uppercase">NIU Synchronisé</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-sm icon-filled" aria-hidden="true">account_balance</span>
            <span class="text-xs font-bold font-label uppercase">Données Ministérielles</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Stats row ────────────────────────────────────── -->
    <section class="py-20 bg-surface-container-low" aria-labelledby="stats-title">
      <h2 id="stats-title" class="sr-only">Indicateurs de la plateforme</h2>
      <div class="max-w-7xl mx-auto px-6 md:px-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
          <ac-stat-tile
            value="6"
            label="Secteurs Stratégiques"
            description="Maritime, logistique, douane, industrie, sécurité et manutention — les piliers de l'économie congolaise."
          />
          <ac-stat-tile
            value="3"
            label="Niveaux de Forfait"
            description="Offres Free, Pro et Premium adaptées à chaque taille d'entreprise. Paiement via MTN MoMo, Airtel Money ou carte bancaire."
          />
          <ac-stat-tile
            value="100%"
            label="Vérification RCCM"
            description="Chaque fiche entreprise est vérifiée manuellement par notre équipe avant publication sur la plateforme."
          />
        </div>
      </div>
    </section>

     <!-- ─── 6 Sectors bento ─────────────────────────────── -->
     <section class="py-28 px-6 md:px-12 max-w-7xl mx-auto" aria-labelledby="sectors-title">
       <div class="mb-14 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
         <div>
           <p class="text-xs font-bold font-label text-primary uppercase tracking-[0.2em] mb-3">Paysage Économique</p>
           <h2 id="sectors-title" class="text-4xl font-bold font-headline tracking-tight">Les 6 Secteurs Stratégiques</h2>
         </div>
         <a routerLink="/secteurs" class="btn btn-outline text-xs" aria-label="Explorer tous les secteurs">
           Tous les secteurs
           <span class="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
         </a>
       </div>

       <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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

       <div class="text-center">
         <a routerLink="/annuaire" class="btn btn-primary py-4 px-10 text-sm">
           Accéder à l'annuaire complet
         </a>
       </div>
     </section>

    <!-- ─── Trust band ──────────────────────────────────── -->
    <section class="trust-band" aria-labelledby="trust-title">
      <div class="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div class="relative z-10">
          <p class="text-xs font-bold font-label text-primary-fixed uppercase tracking-[0.2em] mb-5">
            Protocole de Vérification
          </p>
          <h2 id="trust-title" class="text-4xl md:text-5xl font-black font-headline tracking-tight mb-8 leading-[1.1]">
            La référence nationale<br />pour les données d'entreprises.
          </h2>

          <div class="trust-list">
            <div class="trust-item">
              <div class="trust-icon">
                <span class="material-symbols-outlined icon-filled" aria-hidden="true">verified_user</span>
              </div>
              <div>
                <h3 class="text-lg font-bold font-headline mb-1">Mapping RCCM Direct</h3>
                <p class="trust-description">
                  Chaque entreprise est croisée avec le Registre du Commerce et du Crédit Mobilier
                  pour garantir son existence légale.
                </p>
              </div>
            </div>

            <div class="trust-item">
              <div class="trust-icon">
                <span class="material-symbols-outlined icon-filled" aria-hidden="true">fingerprint</span>
              </div>
              <div>
                <h3 class="text-lg font-bold font-headline mb-1">Synchronisation NIU</h3>
                <p class="trust-description">
                  Vérification automatisée du Numéro d'Identification Unique pour assurer
                  la transparence fiscale.
                </p>
              </div>
            </div>

            <div class="trust-item">
              <div class="trust-icon">
                <span class="material-symbols-outlined icon-filled" aria-hidden="true">update</span>
              </div>
              <div>
                <h3 class="text-lg font-bold font-headline mb-1">Validation Manuelle</h3>
                <p class="trust-description">
                  Notre équipe valide chaque fiche avant publication pour garantir la qualité
                  et la crédibilité des informations.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Certification card -->
        <div class="cert-card glass">
          <div class="flex items-center justify-between mb-7">
            <div class="flex items-center gap-3">
              <div class="cert-lock" aria-hidden="true">
                <span class="material-symbols-outlined text-on-tertiary-fixed text-sm icon-filled">lock</span>
              </div>
              <span class="text-sm font-bold font-label uppercase">Certification Officielle</span>
            </div>
            <span class="text-[10px] font-bold font-label text-primary-fixed uppercase tracking-widest">2026</span>
          </div>
          <div class="space-y-5">
            <div class="cert-line w-full" aria-hidden="true"></div>
            <div class="cert-line w-4/5" aria-hidden="true"></div>
            <div class="cert-line w-11/12" aria-hidden="true"></div>

            <div class="flex items-center gap-4 py-5 border-y border-white/10">
              <div class="cert-qr" aria-hidden="true">
                <span class="material-symbols-outlined text-3xl text-primary-fixed">qr_code_2</span>
              </div>
              <div>
                <div class="text-base font-bold font-headline">Identifiant Entreprise</div>
                <div class="text-xs opacity-60 mt-0.5">CON-2026-RCCM-Vérifié</div>
              </div>
            </div>

            <div class="pt-1">
              <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-bold font-label uppercase">Indice de Confiance</span>
                <span class="text-xs font-bold font-label text-tertiary-fixed">98/100</span>
              </div>
              <div class="cert-progress" role="progressbar"
                   aria-valuenow="98" aria-valuemin="0" aria-valuemax="100"
                   aria-label="Indice de confiance 98 sur 100">
                <div class="cert-progress-fill"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Final CTA ───────────────────────────────────── -->
    <section class="py-28 px-6 text-center max-w-4xl mx-auto" aria-labelledby="cta-title">
      <span class="text-primary text-5xl material-symbols-outlined mb-5 block" aria-hidden="true">corporate_fare</span>
      <h2 id="cta-title" class="text-4xl md:text-5xl font-black font-headline tracking-tight mb-5">
        Prêt à rejoindre l'annuaire ?
      </h2>
      <p class="text-secondary text-lg mb-10 max-w-xl mx-auto leading-relaxed">
        Créez votre profil officiel pour bénéficier d'une visibilité nationale, recevoir des appels d'offres
        et connecter votre entreprise à l'économie congolaise.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a routerLink="/auth/inscription" class="btn btn-primary py-4 px-10 text-sm">
          Créer mon profil entreprise
        </a>
        <a routerLink="/tarifs" class="btn btn-ghost py-4 px-10 text-sm">
          Voir les forfaits
        </a>
      </div>
      <p class="mt-7 text-xs text-outline font-label uppercase tracking-widest">
        Requiert un numéro RCCM et NIU valides pour l'activation
      </p>
    </section>
  `,
  styles: [`
    :host { display: block; }

    /* All-sectors CTA card */
    .cta-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 28px;
      border-radius: var(--radius-2xl);
      background: var(--color-primary);
      color: var(--color-on-primary);
      text-decoration: none;
      transition: transform 0.25s, box-shadow 0.25s;
    }
    .cta-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-editorial); }
    .cta-card .cta-arrow {
      margin-top: 24px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--color-primary-fixed);
      transition: gap 0.2s;
    }
    .cta-card:hover .cta-arrow { gap: 12px; }

    /* Trust band */
    .trust-band {
      padding: 7rem 0;
      background: var(--color-primary);
      color: var(--color-on-primary);
      position: relative;
      overflow: hidden;
    }
    .trust-list { display: flex; flex-direction: column; gap: 28px; }
    .trust-item { display: flex; gap: 20px; }
    .trust-icon {
      width: 44px; height: 44px;
      background: var(--color-primary-container);
      color: var(--color-primary-fixed);
      border-radius: var(--radius-md);
      display: inline-flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .trust-description {
      color: rgba(255, 255, 255, 0.78);
      font-size: 14px;
      line-height: 1.55;
    }

    /* Certification card */
    .cert-card {
      padding: 32px;
      border-radius: var(--radius-2xl);
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.10);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
    }
    .cert-lock {
      width: 40px; height: 40px;
      border-radius: var(--radius-md);
      background: var(--color-tertiary-fixed);
      display: inline-flex; align-items: center; justify-content: center;
    }
    .cert-line {
      height: 8px;
      background: rgba(255, 255, 255, 0.10);
      border-radius: var(--radius-full);
    }
    .cert-qr {
      width: 56px; height: 56px;
      border-radius: var(--radius-md);
      background: var(--color-primary-container);
      display: inline-flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .cert-progress {
      height: 6px;
      background: rgba(255, 255, 255, 0.10);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .cert-progress-fill {
      width: 98%;
      height: 100%;
      background: var(--color-tertiary-fixed);
      border-radius: var(--radius-full);
    }
  `],
})
export class AccueilComponent {
  protected readonly FR = FR;

  protected readonly sectors: ReadonlyArray<SectorView> = [
    {
      slug: FR.sectors.maritime.slug,
      name: FR.sectors.maritime.name,
      icon: FR.sectors.maritime.icon,
      description: 'Port de Pointe-Noire, compagnies maritimes, services portuaires et logistique offshore.',
      highlights: ['Pointe-Noire', 'Offshore', 'Agences'],
    },
    {
      slug: FR.sectors.logistique.slug,
      name: FR.sectors.logistique.name,
      icon: FR.sectors.logistique.icon,
      description: 'Transport routier, ferroviaire, aérien et solutions intégrées.',
      highlights: ['Routier', 'Ferroviaire', 'Aérien'],
    },
    {
      slug: FR.sectors.douane.slug,
      name: FR.sectors.douane.name,
      icon: FR.sectors.douane.icon,
      description: 'Dédouanement, transit et conseil en réglementation des échanges extérieurs.',
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

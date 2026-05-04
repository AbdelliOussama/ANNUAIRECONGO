import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface DirigeantView {
  fullName: string;
  position: string;
  company: string;
  companySlug: string;
  initials: string;
  city: string;
}

/**
 * /dirigeants — annuaire des dirigeants déclarés sur les fiches entreprises.
 * Page conservée hors-SFD à la demande du client (NOTE: à valider à terme
 * avec le métier — l'audit recommandait sa suppression).
 */
@Component({
  selector: 'ac-dirigeants',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div class="max-w-5xl mx-auto px-6 md:px-12 text-center">
        <p class="eyebrow mb-4">Dirigeants Inscrits</p>
        <h1 class="text-4xl md:text-6xl font-black font-headline tracking-tight mb-6">
          Les dirigeants<br />
          <em class="text-primary not-italic">de l'économie congolaise.</em>
        </h1>
        <p class="text-lg text-secondary leading-relaxed max-w-2xl mx-auto">
          Découvrez les responsables des entreprises inscrites sur la plateforme.
          Chaque profil renvoie à la fiche de son entreprise.
        </p>
      </div>
    </section>

    <section class="px-6 md:px-12 max-w-7xl mx-auto py-12">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (d of dirigeants; track d.fullName) {
          <a [routerLink]="['/annuaire', d.companySlug]" class="card">
            <div class="avatar" aria-hidden="true">{{ d.initials }}</div>
            <div class="content">
              <h3 class="name">{{ d.fullName }}</h3>
              <p class="position">{{ d.position }}</p>
              <p class="company">
                <span class="material-symbols-outlined" aria-hidden="true">business</span>
                {{ d.company }}
              </p>
              <p class="city">
                <span class="material-symbols-outlined" aria-hidden="true">location_on</span>
                {{ d.city }}
              </p>
            </div>
          </a>
        }
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .hero { padding: 96px 0 24px; }

    .card {
      background: var(--color-surface-container-lowest);
      border-radius: var(--radius-2xl);
      padding: 24px;
      display: flex;
      gap: 16px;
      align-items: flex-start;
      transition: transform 0.2s, box-shadow 0.2s;
      border: 1px solid var(--color-outline-variant);
    }
    .card:hover { transform: translateY(-2px); box-shadow: var(--shadow-editorial); }

    .avatar {
      width: 56px; height: 56px;
      border-radius: var(--radius-full);
      background: var(--color-primary);
      color: var(--color-on-primary);
      display: inline-flex; align-items: center; justify-content: center;
      font-family: var(--font-headline);
      font-size: 18px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .content { flex: 1; min-width: 0; }
    .name { font-family: var(--font-headline); font-size: 18px; font-weight: 700; margin: 0 0 4px; }
    .position {
      font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
      color: var(--color-primary); font-weight: 700; margin: 0 0 12px;
    }
    .company, .city {
      display: flex; align-items: center; gap: 6px;
      color: var(--color-on-secondary-container);
      font-size: 13px;
      margin: 4px 0;
    }
    .company .material-symbols-outlined,
    .city .material-symbols-outlined { font-size: 16px; }
  `],
})
export class DirigeantsComponent {
  protected readonly dirigeants: ReadonlyArray<DirigeantView> = [
    { fullName: 'Jean-Marc Boutsana', position: 'Directeur Général',  company: 'Congo Shipping SA',         companySlug: 'congo-shipping-sa',          initials: 'JB', city: 'Pointe-Noire' },
    { fullName: 'Adèle Mvouama',      position: 'Présidente',         company: 'TransCongo Logistique',     companySlug: 'transcongo-logistique',      initials: 'AM', city: 'Brazzaville' },
    { fullName: 'Patrick Diallo',     position: 'Gérant',             company: 'Douane Express SARL',       companySlug: 'douane-express-sarl',        initials: 'PD', city: 'Pointe-Noire' },
    { fullName: 'Sandrine Okemba',    position: 'Directrice Générale',company: 'Industria Congo',           companySlug: 'industria-congo',            initials: 'SO', city: 'Dolisie' },
    { fullName: 'François Mabiala',   position: 'PDG',                company: 'SNP — Sécurité Nationale',  companySlug: 'securite-nationale-protection', initials: 'FM', city: 'Brazzaville' },
    { fullName: 'Roger Bantsimba',    position: 'Directeur Opérations',company:'Pointe-Noire Manutention',  companySlug: 'pointe-noire-manutention',   initials: 'RB', city: 'Pointe-Noire' },
  ];
}

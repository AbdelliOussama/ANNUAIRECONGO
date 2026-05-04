import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface ReportItem {
  title: string;
  category: string;
  excerpt: string;
  date: string;
  icon: string;
}

@Component({
  selector: 'ac-rapport-ia',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div class="max-w-5xl mx-auto px-6 md:px-12 text-center">
        <p class="eyebrow mb-4">Analyses IA — Aperçu</p>
        <h1 class="text-4xl md:text-6xl font-black font-headline tracking-tight mb-6">
          Rapports d'intelligence<br />
          <em class="text-primary not-italic">sur l'économie congolaise.</em>
        </h1>
        <p class="text-lg text-secondary leading-relaxed max-w-2xl mx-auto">
          Synthèses sectorielles générées à partir des données ouvertes du registre,
          enrichies par notre moteur d'analyse. Disponibles aux abonnés Premium.
        </p>
      </div>
    </section>

    <section class="px-6 md:px-12 max-w-7xl mx-auto py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (r of reports; track r.title) {
          <article class="report-card">
            <div class="icon-bubble" aria-hidden="true">
              <span class="material-symbols-outlined">{{ r.icon }}</span>
            </div>
            <span class="badge badge-pro">{{ r.category }}</span>
            <h3 class="title">{{ r.title }}</h3>
            <p class="excerpt">{{ r.excerpt }}</p>
            <div class="footer-row">
              <span class="date">{{ r.date }}</span>
              <button type="button" class="btn btn-outline btn-sm">Premium</button>
            </div>
          </article>
        }
      </div>
    </section>

    <section class="cta py-20 text-center max-w-3xl mx-auto px-6">
      <h2 class="text-3xl font-bold font-headline mb-4">Accès complet aux rapports</h2>
      <p class="text-secondary mb-8">
        Souscrivez au forfait Premium pour télécharger l'intégralité des analyses,
        recevoir les nouveautés par e-mail et accéder aux jeux de données associés.
      </p>
      <a routerLink="/tarifs" class="btn btn-primary py-4 px-10 text-sm">
        Découvrir le forfait Premium
      </a>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .hero { padding: 96px 0 32px; }

    .report-card {
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-2xl);
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .report-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-editorial); }
    .icon-bubble {
      width: 48px; height: 48px;
      background: var(--color-primary-fixed);
      color: var(--color-on-primary-fixed);
      border-radius: var(--radius-md);
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 4px;
    }
    .icon-bubble .material-symbols-outlined { font-size: 24px; }
    .title {
      font-family: var(--font-headline);
      font-size: 18px;
      font-weight: 700;
      color: var(--color-on-surface);
      margin: 4px 0 6px;
    }
    .excerpt { color: var(--color-on-surface-variant); font-size: 14px; line-height: 1.55; }
    .footer-row {
      margin-top: auto;
      display: flex; align-items: center; justify-content: space-between;
      padding-top: 12px;
    }
    .date { color: var(--color-outline); font-size: 12px; }
  `],
})
export class RapportIaComponent {
  protected readonly reports: ReadonlyArray<ReportItem> = [
    { title: 'Le secteur maritime au 1er trimestre 2026', category: 'Maritime', excerpt: 'Volume de fret, escales du port autonome et acteurs majeurs. Comparaison annuelle.', date: 'Avr 2026', icon: 'directions_boat' },
    { title: 'Logistique terrestre — corridor Pointe-Noire / Brazzaville', category: 'Logistique', excerpt: 'État de la chaîne de transport, opérateurs et goulets d\'étranglement.',                          date: 'Avr 2026', icon: 'local_shipping' },
    { title: 'Évolution des opérations douanières',                       category: 'Douane',     excerpt: 'Tendances déclaratives, principaux importateurs et délais moyens de transit.',                  date: 'Mar 2026', icon: 'receipt_long' },
    { title: 'Industrie : panorama de la transformation locale',          category: 'Industrie',  excerpt: 'Cartographie des unités de production et indicateurs d\'investissement par département.',     date: 'Mar 2026', icon: 'factory' },
    { title: 'Sécurité privée : effectifs et certifications',             category: 'Sécurité',   excerpt: 'Évolution du marché, certifications délivrées et tailles d\'opérateurs.',                       date: 'Fév 2026', icon: 'security' },
    { title: 'Manutention portuaire — capacités installées',              category: 'Manutention',excerpt: 'Capacités de stockage, parc d\'équipements et utilisation moyenne.',                            date: 'Fév 2026', icon: 'conveyor_belt' },
  ];
}

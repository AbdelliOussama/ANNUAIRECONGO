import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface TenderView {
  reference: string;
  title: string;
  buyer: string;
  sector: string;
  city: string;
  closing: string;
  status: 'ouvert' | 'cloture' | 'attribue';
}

@Component({
  selector: 'ac-appels-offres',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div class="max-w-5xl mx-auto px-6 md:px-12 text-center">
        <p class="eyebrow mb-4">Appels d'offres</p>
        <h1 class="text-4xl md:text-6xl font-black font-headline tracking-tight mb-6">
          Marchés publics<br />
          <em class="text-primary not-italic">et opportunités économiques.</em>
        </h1>
        <p class="text-lg text-secondary leading-relaxed max-w-2xl mx-auto">
          Consultations en cours, dates limites et contacts des acheteurs publics
          et privés. Les abonnés Pro et Premium reçoivent les notifications par e-mail.
        </p>
      </div>
    </section>

    <section class="px-6 md:px-12 max-w-7xl mx-auto py-12">
      <div class="table-wrap">
        <table class="tenders" aria-label="Appels d'offres en cours">
          <thead>
            <tr>
              <th>Référence</th>
              <th>Intitulé</th>
              <th>Acheteur</th>
              <th>Secteur</th>
              <th>Ville</th>
              <th>Clôture</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            @for (t of tenders; track t.reference) {
              <tr>
                <td class="mono">{{ t.reference }}</td>
                <td class="title">{{ t.title }}</td>
                <td>{{ t.buyer }}</td>
                <td>{{ t.sector }}</td>
                <td>{{ t.city }}</td>
                <td class="mono">{{ t.closing }}</td>
                <td>
                  @switch (t.status) {
                    @case ('ouvert')   { <span class="badge badge-verified">Ouvert</span> }
                    @case ('cloture')  { <span class="badge badge-pending">Clôturé</span> }
                    @case ('attribue') { <span class="badge badge-pro">Attribué</span> }
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    <section class="py-16 text-center max-w-3xl mx-auto px-6">
      <h2 class="text-3xl font-bold font-headline mb-4">Recevez les opportunités en temps réel</h2>
      <p class="text-secondary mb-8">
        Le forfait Pro inclut la notification e-mail des nouveaux appels d'offres
        correspondant à votre secteur d'activité.
      </p>
      <a routerLink="/tarifs" class="btn btn-primary py-4 px-10 text-sm">
        Voir les forfaits
      </a>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .hero { padding: 96px 0 32px; }

    .table-wrap {
      background: var(--color-surface-container-lowest);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-card);
      overflow-x: auto;
    }
    .tenders { width: 100%; border-collapse: collapse; font-family: var(--font-body); }
    .tenders th, .tenders td {
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid var(--color-outline-variant);
      font-size: 13px;
    }
    .tenders th {
      background: var(--color-surface-container-low);
      color: var(--color-on-surface);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-size: 11px;
      font-weight: 700;
    }
    .tenders tbody tr:last-child td { border-bottom: 0; }
    .tenders .mono { font-variant-numeric: tabular-nums; }
    .tenders .title { font-weight: 600; color: var(--color-on-surface); max-width: 380px; }
  `],
})
export class AppelsOffresComponent {
  protected readonly tenders: ReadonlyArray<TenderView> = [
    { reference: 'AO-2026-001', title: 'Manutention portuaire — campagne céréalière',     buyer: 'Port autonome de Pointe-Noire', sector: 'Manutention', city: 'Pointe-Noire', closing: '15/06/2026', status: 'ouvert' },
    { reference: 'AO-2026-002', title: 'Transport routier de matériel BTP',                buyer: 'Ministère des Travaux Publics', sector: 'Logistique',  city: 'Brazzaville',  closing: '02/06/2026', status: 'ouvert' },
    { reference: 'AO-2026-003', title: 'Gardiennage du dépôt central',                     buyer: 'Société d\'État',               sector: 'Sécurité',    city: 'Pointe-Noire', closing: '20/05/2026', status: 'cloture' },
    { reference: 'AO-2026-004', title: 'Conseil en réglementation douanière',              buyer: 'Direction des Douanes',         sector: 'Douane',      city: 'Brazzaville',  closing: '12/05/2026', status: 'attribue' },
    { reference: 'AO-2026-005', title: 'Maintenance industrielle — site de transformation',buyer: 'Manufacture du Niari',          sector: 'Industrie',   city: 'Dolisie',      closing: '30/06/2026', status: 'ouvert' },
  ];
}

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MockEspaceService } from '@core/services/mock/mock-espace.service';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { XafPipe } from '@shared/pipes/xaf.pipe';
import { FR } from '@core/i18n/fr.constants';

/**
 * /espace/abonnement/historique — payment history table.
 *
 * Audit M15: amounts displayed via the XafPipe (XAF).
 */
@Component({
  selector: 'ac-historique-paiements',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    EmptyStateComponent,
    SkeletonComponent,
    XafPipe,
  ],
  template: `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">Abonnement</p>
        <h1>Historique de paiement</h1>
        <p class="sub">Téléchargez vos factures officielles. Toutes les transactions sont conservées 10 ans, conformément à la réglementation comptable.</p>
      </header>

      @if (loading()) {
        <ac-skeleton shape="card" height="220px" />
      } @else if (rows().length === 0) {
        <ac-empty-state
          icon="receipt_long"
          title="Aucun paiement enregistré"
          hint="Souscrivez à un forfait pour commencer à recevoir des factures."
        >
          <a routerLink="/espace/abonnement" class="btn btn-primary">Voir les forfaits</a>
        </ac-empty-state>
      } @else {
        <div class="table-wrap">
          <table aria-label="Historique des paiements">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Date</th>
                <th>Forfait</th>
                <th>Montant</th>
                <th>Moyen</th>
                <th>Statut</th>
                <th class="sr-only">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (p of rows(); track p.id) {
                <tr>
                  <td class="mono">{{ p.reference }}</td>
                  <td>{{ p.date }}</td>
                  <td>{{ p.planName }}</td>
                  <td class="amount">{{ p.amount | xaf }}</td>
                  <td>
                    <span class="method">
                      <span class="dot" [style.background]="methodColor(p.method)" aria-hidden="true"></span>
                      {{ methodLabel(p.method) }}
                    </span>
                  </td>
                  <td>
                    <span [class]="'badge ' + statusClass(p.status)">{{ statusLabel(p.status) }}</span>
                  </td>
                  <td class="actions-col">
                    <a [href]="p.invoiceUrl" target="_blank" rel="noopener" class="link" [attr.aria-label]="'Télécharger la facture ' + p.reference">
                      <span class="material-symbols-outlined" aria-hidden="true">download</span>
                      Facture
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
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
      margin: 6px 0 8px;
    }
    .page-head .sub { color: var(--color-on-secondary-container); font-size: 14px; max-width: 640px; line-height: 1.55; margin: 0; }

    .table-wrap {
      background: var(--color-surface-container-lowest);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-card);
      overflow-x: auto;
    }
    table { width: 100%; border-collapse: collapse; font-family: var(--font-body); }
    th, td {
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid var(--color-outline-variant);
      font-size: 13px;
    }
    th {
      background: var(--color-surface-container-low);
      color: var(--color-on-surface);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-size: 11px;
      font-weight: 700;
    }
    tbody tr:last-child td { border-bottom: 0; }
    .mono { font-variant-numeric: tabular-nums; }
    .amount { font-weight: 700; color: var(--color-on-surface); }
    .method { display: inline-flex; align-items: center; gap: 6px; }
    .dot { width: 10px; height: 10px; border-radius: var(--radius-full); display: inline-block; }
    .actions-col { text-align: right; }

    .link { display: inline-flex; align-items: center; gap: 4px; color: var(--color-primary); font-weight: 600; }
    .link:hover { text-decoration: underline; }
    .link .material-symbols-outlined { font-size: 18px; }

    .badge-paye      { background: var(--color-primary-fixed); color: var(--color-on-primary-fixed); }
    .badge-en-cours  { background: var(--color-secondary-container); color: var(--color-on-secondary-fixed); }
    .badge-echoue    { background: var(--color-error-container); color: var(--color-on-error-container); }
    .badge-rembourse { background: var(--color-tertiary-fixed); color: var(--color-on-tertiary-fixed); }
  `],
})
export class HistoriquePaiementsComponent {
  protected readonly FR = FR;
  private readonly espace = inject(MockEspaceService);

  protected readonly rows = toSignal(this.espace.payments$(), { initialValue: [] });
  protected readonly loading = computed(() => this.rows().length === 0 && !this.loaded());

  // Track first emission so we don't show empty-state during the initial delay.
  private readonly loaded = toSignal(this.espace.payments$(), { initialValue: undefined });

  protected methodLabel(m: 'mtn' | 'airtel' | 'stripe'): string {
    return ({
      mtn:    'MTN Mobile Money',
      airtel: 'Airtel Money',
      stripe: 'Carte bancaire',
    } as const)[m];
  }
  protected methodColor(m: 'mtn' | 'airtel' | 'stripe'): string {
    return ({
      mtn:    '#fcd34d',
      airtel: '#fb7185',
      stripe: '#3b82f6',
    } as const)[m];
  }
  protected statusLabel(s: string): string {
    return ({
      paye:      'Payé',
      'en-cours':'En cours',
      echoue:    'Échoué',
      rembourse: 'Remboursé',
    } as Record<string, string>)[s] ?? s;
  }
  protected statusClass(s: string): string {
    return `badge-${s}`;
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SubscriptionService } from '@core/services/subscription.service';
import { BusinessOwnerService } from '@core/services/business-owner.service';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { XafPipe } from '@shared/pipes/xaf.pipe';
import { FR } from '@core/i18n/fr.constants';
import { switchMap, of, catchError, map, Observable } from 'rxjs';
import { Payment, PaymentStatus, PaymentMethod, BusinessOwner, Company } from '@core/models/company.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'ac-historique-paiements',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    EmptyStateComponent,
    SkeletonComponent,
    XafPipe,
    DatePipe
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
      } @else if ((rows()?.length ?? 0) === 0) {
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
                <th>ID Transaction</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Moyen</th>
                <th>Statut</th>
                <th class="sr-only">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (p of rows() || []; track p.id) {
                <tr>
                  <td class="mono">{{ p.id.split('-')[0] }}</td>
                  <td>{{ p.paidAt | date:'dd/MM/yyyy' }}</td>
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
                    @if (p.invoiceUrl) {
                      <a [href]="p.invoiceUrl" target="_blank" rel="noopener" class="link">
                        <span class="material-symbols-outlined" aria-hidden="true">download</span>
                        Facture
                      </a>
                    } @else {
                      <span class="muted">N/A</span>
                    }
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

    .badge-0 { background: var(--color-secondary-container); color: var(--color-on-secondary-fixed); } /* Pending */
    .badge-2 { background: var(--color-primary-fixed); color: var(--color-on-primary-fixed); } /* Completed */
    .badge-3 { background: var(--color-error-container); color: var(--color-on-error-container); } /* Failed */
    .badge-4 { background: var(--color-tertiary-fixed); color: var(--color-on-tertiary-fixed); } /* Refunded */
  `],
})
export class HistoriquePaiementsComponent {
  protected readonly FR = FR;
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly ownerService = inject(BusinessOwnerService);

  private readonly owner = toSignal<BusinessOwner | null>(
    this.ownerService.getCurrentOwner().pipe(map(o => o as BusinessOwner | null)), 
    { initialValue: null }
  );
  
  protected readonly rows = toSignal<Payment[] | null>(
    this.ownerService.getMyCompanies().pipe(
      switchMap((list: Company[]) => {
        if (!list[0]) return of([] as Payment[]);
        return this.subscriptionService.getCompanyPayments(list[0].id);
      }),
      catchError(() => of([] as Payment[]))
    ),
    { initialValue: null }
  );

  protected readonly loading = computed(() => this.owner() === null && this.rows() === null);

  protected methodLabel(m: number): string {
    return ({
      [PaymentMethod.MTNMoMo]:    'MTN MoMo',
      [PaymentMethod.AirtelMoney]: 'Airtel Money',
      [PaymentMethod.Stripe]:      'Carte bancaire',
    } as any)[m] || 'Inconnu';
  }

  protected methodColor(m: number): string {
    return ({
      [PaymentMethod.MTNMoMo]:    '#fcd34d',
      [PaymentMethod.AirtelMoney]: '#fb7185',
      [PaymentMethod.Stripe]:      '#3b82f6',
    } as any)[m] || '#94a3b8';
  }

  protected statusLabel(s: number): string {
    return ({
      [PaymentStatus.Pending]:   'En attente',
      [PaymentStatus.Completed]: 'Payé',
      [PaymentStatus.Failed]:    'Échoué',
      [PaymentStatus.Refunded]:  'Remboursé',
      [PaymentStatus.Rejected]:  'Rejeté',
    } as any)[s] || 'Inconnu';
  }

  protected statusClass(s: number): string {
    return `badge-${s}`;
  }
}

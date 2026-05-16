import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, switchMap } from 'rxjs';
import { SubscriptionService } from '@core/services/subscription.service';
import { Payment } from '@core/models/company.model';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { ToastService } from '@shared/services/toast.service';
import { ModalService } from '@shared/services/modal.service';

@Component({
  selector: 'ac-admin-payments',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent, SkeletonComponent, DatePipe, CurrencyPipe],
  template: `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">Finance</p>
        <h1>Validation des paiements</h1>
        <p class="sub">Validez les paiements manuels (virement, agence) pour activer les abonnements.</p>
      </header>

      @if (loading()) {
        <ac-skeleton shape="card" height="300px" />
      } @else if (payments().length === 0) {
        <ac-empty-state
          icon="account_balance_wallet"
          title="Aucun paiement en attente"
          hint="Tous les paiements ont été traités."
        />
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Entreprise</th>
                <th>Forfait</th>
                <th>Montant</th>
                <th>Date</th>
                <th>Mode</th>
                <th class="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (p of payments(); track p.id) {
                <tr>
                  <td class="ref"><strong>{{ p.reference }}</strong></td>
                  <td>{{ p.companyName }}</td>
                  <td>{{ p.planName }}</td>
                  <td>{{ p.amount | currency:'XAF':'symbol':'1.0-0' }}</td>
                  <td>{{ p.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>{{ mapMethod(p.method) }}</td>
                  <td class="actions-col">
                    <button class="btn btn-sm btn-primary" (click)="confirm(p)">Confirmer</button>
                    <button class="btn btn-sm btn-ghost text-error" (click)="reject(p)">Rejeter</button>
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
    .page { display: flex; flex-direction: column; gap: 24px; max-width: 1200px; margin: 0 auto; }
    .page-head h1 { font-family: var(--font-headline); font-size: 32px; font-weight: 800; margin: 8px 0; }
    .page-head .sub { color: var(--color-on-secondary-container); margin: 0; }
    
    .table-wrap { background: var(--color-surface-container-lowest); border-radius: var(--radius-2xl); box-shadow: var(--shadow-card); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 16px; text-align: left; border-bottom: 1px solid var(--color-outline-variant); font-size: 14px; }
    th { background: var(--color-surface-container-low); font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
    
    .ref { color: var(--color-primary); }
    .actions-col { text-align: right; display: flex; gap: 8px; justify-content: flex-end; }
    .text-error { color: var(--color-error); }
  `]
})
export class AdminPaymentsComponent {
  private readonly subService = inject(SubscriptionService);
  private readonly toast = inject(ToastService);
  private readonly modal = inject(ModalService);
  private readonly refreshTrigger$ = new BehaviorSubject<void>(undefined);
  
  protected readonly payments = toSignal(
    this.refreshTrigger$.pipe(
      switchMap(() => this.subService.getPendingPayments())
    ),
    { initialValue: [] as Payment[] }
  );

  protected readonly loading = signal(false);

  confirm(p: Payment) {
    this.modal.confirm({
      title: 'Confirmer le paiement',
      body: `Voulez-vous valider le paiement ${p.reference} de ${p.amount} XAF pour ${p.companyName} ?`,
      tone: 'confirm',
      confirmLabel: 'Valider le paiement'
    }).then(({ confirmed }) => {
      if (!confirmed) return;
      
      this.loading.set(true);
      this.subService.confirmPayment(p.id).subscribe({
        next: () => {
          this.loading.set(false);
          this.toast.success('Paiement validé avec succès.');
          this.refreshTrigger$.next();
        },
        error: (err) => {
          this.loading.set(false);
          this.toast.error('Erreur lors de la confirmation: ' + (err.error?.detail || err.message));
        }
      });
    });
  }

  reject(p: Payment) {
    this.modal.confirm({
      title: 'Rejeter le paiement',
      body: `Expliquez pourquoi le paiement ${p.reference} est rejeté. L'utilisateur recevra une notification.`,
      tone: 'danger',
      confirmLabel: 'Rejeter définitivement',
      reasonLabel: 'Motif du rejet',
      reasonRequired: true
    }).then(({ confirmed, reason }) => {
      if (!confirmed || !reason) return;
      
      this.loading.set(true);
      this.subService.rejectPayment(p.id, reason).subscribe({
        next: () => {
          this.loading.set(false);
          this.toast.success('Paiement rejeté.');
          this.refreshTrigger$.next();
        },
        error: (err) => {
          this.loading.set(false);
          this.toast.error('Erreur lors du rejet: ' + (err.error?.detail || err.message));
        }
      });
    });
  }

  mapMethod(m: number): string {
    switch(m) {
      case 0: return 'Carte Bancaire';
      case 1: return 'Mobile Money';
      case 2: return 'Virement';
      case 3: return 'Espèces (Agence)';
      default: return 'Autre';
    }
  }
}

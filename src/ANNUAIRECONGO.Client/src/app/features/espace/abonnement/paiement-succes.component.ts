import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SubscriptionService } from '@core/services/subscription.service';
import { ToastService } from '@shared/services/toast.service';
import { FR } from '@core/i18n/fr.constants';

@Component({
  selector: 'ac-paiement-succes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="wrap">
      <div class="card">
        @if (confirming()) {
          <div class="icon-bubble" aria-hidden="true">
            <span class="material-symbols-outlined spin">sync</span>
          </div>
          <h1>Confirmation en cours...</h1>
          <p class="lead">Nous validons votre paiement auprès de la plateforme de paiement. Veuillez patienter.</p>
        } @else {
          <div class="icon-bubble" aria-hidden="true">
            <span class="material-symbols-outlined icon-filled">check_circle</span>
          </div>

          <h1>{{ FR.payment.successTitle }}</h1>
          <p class="lead">
            Votre paiement a bien été traité. Votre abonnement est désormais actif.
            Une facture vous sera envoyée par e-mail dans quelques minutes.
          </p>

          @if (paymentId()) {
            <p class="ref">
              ID Paiement : <strong>{{ paymentId() }}</strong>
            </p>
          }

          <div class="actions">
            <a routerLink="/espace" class="btn btn-primary">Retour à mon espace</a>
            <a routerLink="/espace/abonnement/historique" class="btn btn-ghost">Voir l'historique</a>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .wrap { max-width: 720px; margin: 0 auto; padding: 32px 4px; }
    .card {
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-2xl);
      padding: 56px 32px;
      text-align: center;
      box-shadow: var(--shadow-editorial);
    }
    .icon-bubble {
      width: 88px; height: 88px;
      background: var(--color-primary-fixed);
      color: var(--color-on-primary-fixed);
      border-radius: var(--radius-full);
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 22px;
    }
    .icon-bubble .material-symbols-outlined { font-size: 44px; }
    .spin { animation: spin 2s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    h1 {
      font-family: var(--font-headline);
      font-size: 30px;
      font-weight: 800;
      color: var(--color-primary);
      margin: 0 0 12px;
    }
    .lead {
      color: var(--color-on-surface-variant);
      font-size: 15px;
      line-height: 1.7;
      max-width: 460px;
      margin: 0 auto 14px;
    }
    .ref {
      font-size: 13px;
      color: var(--color-on-secondary-container);
      margin: 0 auto 24px;
    }
    .ref strong { color: var(--color-on-surface); font-variant-numeric: tabular-nums; }
    .actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
  `],
})
export class PaiementSuccesComponent {
  protected readonly FR = FR;
  private readonly route = inject(ActivatedRoute);
  private readonly subService = inject(SubscriptionService);
  private readonly toast = inject(ToastService);

  private readonly paramMap = toSignal(this.route.queryParamMap, { initialValue: null });
  protected readonly paymentId = () => this.paramMap()?.get('paymentId') ?? null;

  protected readonly confirming = signal(false);

  constructor() {
    const pid = this.route.snapshot.queryParamMap.get('paymentId');
    if (pid) {
      this.confirming.set(true);
      this.subService.confirmPayment(pid).subscribe({
        next: () => {
          this.confirming.set(false);
          this.toast.success('Paiement confirmé avec succès.');
        },
        error: () => {
          this.confirming.set(false);
          this.toast.error('Erreur lors de la confirmation du paiement.');
        }
      });
    }
  }
}

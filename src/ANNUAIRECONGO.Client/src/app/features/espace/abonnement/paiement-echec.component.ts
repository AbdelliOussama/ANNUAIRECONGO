import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FR } from '@core/i18n/fr.constants';

/**
 * /espace/abonnement/echec — landing page after a failed payment.
 * Audit P1 — page missing from the original maquette.
 */
@Component({
  selector: 'ac-paiement-echec',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="wrap">
      <div class="card">
        <div class="icon-bubble" aria-hidden="true">
          <span class="material-symbols-outlined icon-filled">error</span>
        </div>

        <h1>{{ FR.payment.failureTitle }}</h1>
        <p class="lead">
          Votre paiement n'a pas pu être confirmé. Aucun montant n'a été
          débité. Vous pouvez réessayer ou choisir un autre moyen de paiement.
        </p>

        @if (reason()) {
          <p class="reason">
            <span class="material-symbols-outlined" aria-hidden="true">info</span>
            Raison communiquée par le prestataire : <em>{{ reason() }}</em>
          </p>
        }

        <div class="actions">
          <a routerLink="/espace/abonnement" class="btn btn-primary">Réessayer</a>
          <a routerLink="/contact" class="btn btn-ghost">Contacter le support</a>
        </div>
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
      background: var(--color-error-container);
      color: var(--color-on-error-container);
      border-radius: var(--radius-full);
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 22px;
    }
    .icon-bubble .material-symbols-outlined { font-size: 44px; }
    h1 {
      font-family: var(--font-headline);
      font-size: 30px;
      font-weight: 800;
      color: var(--color-error);
      margin: 0 0 12px;
    }
    .lead {
      color: var(--color-on-surface-variant);
      font-size: 15px;
      line-height: 1.7;
      max-width: 460px;
      margin: 0 auto 14px;
    }
    .reason {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--color-on-secondary-container);
      background: var(--color-surface-container-low);
      padding: 8px 16px;
      border-radius: var(--radius-md);
      margin: 0 auto 24px;
    }
    .reason em { color: var(--color-on-surface); font-style: italic; }
    .reason .material-symbols-outlined { font-size: 18px; }
    .actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
  `],
})
export class PaiementEchecComponent {
  protected readonly FR = FR;
  private readonly route = inject(ActivatedRoute);
  private readonly paramMap = toSignal(this.route.queryParamMap, { initialValue: null });
  protected readonly reason = () => this.paramMap()?.get('reason') ?? null;
}

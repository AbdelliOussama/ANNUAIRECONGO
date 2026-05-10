import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastService } from '@shared/services/toast.service';
import { AuthService } from '@core/services/auth.service';
import { FR } from '@core/i18n/fr.constants';

/**
 * /auth/verification-email — informational screen post-inscription.
 * Lands here automatically once the registration succeeds (audit fix —
 * previously orphaned because the maquette inscription was broken).
 *
 * Optional ?email=… query param shows the recipient address; otherwise
 * a generic message is displayed.
 */
@Component({
  selector: 'ac-verification-email',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="auth-card">
      <div class="confirm">
        @if (verifying()) {
          <div class="icon-bubble" aria-hidden="true">
            <span class="material-symbols-outlined spin">sync</span>
          </div>
          <h1>Vérification en cours...</h1>
          <p class="body">Veuillez patienter pendant que nous activons votre compte.</p>
        } @else if (verified()) {
          <div class="icon-bubble ok" aria-hidden="true">
            <span class="material-symbols-outlined icon-filled">verified</span>
          </div>
          <h1>Compte activé !</h1>
          <p class="body">Votre adresse e-mail a été confirmée. Vous pouvez désormais profiter de tous nos services.</p>
          <div class="actions">
            <a routerLink="/auth/connexion" class="btn btn-primary">Se connecter</a>
          </div>
        } @else {
          <div class="icon-bubble" aria-hidden="true">
            <span class="material-symbols-outlined icon-filled">mark_email_read</span>
          </div>

          <h1>{{ FR.auth.verifyEmailTitle }}</h1>
          <p class="body">
            @if (email()) {
              Un e-mail de confirmation a été envoyé à <strong>{{ email() }}</strong>.
            } @else {
              Un e-mail de confirmation a été envoyé à votre adresse.
            }
            Cliquez sur le lien qu'il contient pour activer votre compte.
          </p>
          <p class="hint">
            Vous n'avez rien reçu ? Vérifiez vos courriers indésirables ou
            <button type="button" class="link" (click)="resend()" [disabled]="sending()">renvoyez l'e-mail</button>.
          </p>

          <div class="actions">
            <a routerLink="/auth/connexion" class="btn btn-primary">
              {{ FR.auth.loginAction }}
            </a>
            <a routerLink="/" class="btn btn-ghost">
              {{ FR.actions.backToHome }}
            </a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; max-width: 520px; }

    .auth-card {
      background: var(--color-surface-container-lowest);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-editorial);
      padding: 48px 40px;
      border: 1px solid var(--color-outline-variant);
      text-align: center;
    }
    .icon-bubble {
      width: 80px; height: 80px;
      background: var(--color-primary-fixed);
      color: var(--color-on-primary-fixed);
      border-radius: var(--radius-full);
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 20px;
    }
    .icon-bubble .material-symbols-outlined { font-size: 40px; }
    .icon-bubble.ok { background: var(--color-primary); color: var(--color-on-primary); }
    .spin { animation: spin 2s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    h1 {
      font-family: var(--font-headline);
      font-size: 26px;
      font-weight: 800;
      color: var(--color-on-surface);
      margin: 0 0 14px;
    }
    .body {
      color: var(--color-on-surface-variant);
      font-size: 15px;
      line-height: 1.6;
      max-width: 380px;
      margin: 0 auto 16px;
    }
    .body strong { color: var(--color-on-surface); }
    .hint {
      color: var(--color-on-secondary-container);
      font-size: 13px;
      margin: 0 0 28px;
    }
    .link {
      background: none;
      border: none;
      color: var(--color-primary);
      font-weight: 700;
      cursor: pointer;
      padding: 0;
      font: inherit;
    }
    .link:hover { text-decoration: underline; }
    .link:disabled { opacity: 0.5; cursor: wait; }

    .actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }
  `],
})
export class VerificationEmailComponent {
  protected readonly FR = FR;
  private readonly route = inject(ActivatedRoute);
  private readonly auth  = inject(AuthService);
  private readonly toast = inject(ToastService);

  private readonly paramMap = toSignal(this.route.queryParamMap, { initialValue: null });
  protected readonly email = () => this.paramMap()?.get('email') ?? null;
  protected readonly token = () => this.paramMap()?.get('token') ?? null;

  protected readonly sending = signal(false);
  protected readonly verifying = signal(false);
  protected readonly verified = signal(false);

  constructor() {
    // If token present, attempt verification
    const t = this.route.snapshot.queryParamMap.get('token');
    const e = this.route.snapshot.queryParamMap.get('email');
    if (t && e) {
      this.verifying.set(true);
      this.auth.verifyEmail({ email: e, token: t }).subscribe({
        next: () => {
          this.verifying.set(false);
          this.verified.set(true);
          this.toast.success('Compte activé ! Vous pouvez maintenant vous connecter.');
        },
        error: () => {
          this.verifying.set(false);
          this.toast.error('Échec de la vérification. Le lien est peut-être expiré.');
        }
      });
    }
  }

  protected resend(): void {
    const e = this.email();
    if (!e) return;
    this.sending.set(true);
    this.auth.resendVerification(e).subscribe({
      next: () => {
        this.sending.set(false);
        this.toast.success('Un nouvel e-mail de confirmation vous a été envoyé.');
      },
      error: () => this.sending.set(false)
    });
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ToastHostComponent } from '@shared/ui/toast/toast-host.component';
import { SkipLinkComponent } from '@shared/ui/skip-link/skip-link.component';
import { FR } from '@core/i18n/fr.constants';

/**
 * Lightweight shell for authentication screens (connexion, inscription,
 * mot-de-passe-oublie, reinitialiser-mot-de-passe, verification-email).
 *
 * Intentionally NO public navigation — keeps focus on the form (audit M3).
 */
@Component({
  selector: 'ac-auth-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterOutlet, ToastHostComponent, SkipLinkComponent],
  template: `
    <ac-skip-link />
    <header class="auth-header">
      <a routerLink="/" class="brand" aria-label="Retour à l'accueil Annuaire Congo">
        <img src="/logo2.png" alt="" class="logo" width="160" height="32"/>
        <span class="sr-only">{{ FR.app.name }}</span>
      </a>
      <a routerLink="/" class="back-link">
        <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>
        {{ FR.actions.backToHome }}
      </a>
    </header>

    <main id="main-content" class="auth-main page-transition" tabindex="-1">
      <router-outlet />
    </main>

    <ac-toast-host />
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background:
        radial-gradient(circle at 20% 0%, rgba(0, 78, 52, 0.06) 0%, transparent 45%),
        radial-gradient(circle at 80% 100%, rgba(0, 104, 71, 0.05) 0%, transparent 45%),
        var(--color-surface);
    }
    .auth-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
    }
    .brand .logo { height: 32px; width: auto; }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-on-secondary-container);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      transition: color 0.15s;
    }
    .back-link:hover { color: var(--color-primary); }
    .back-link .material-symbols-outlined { font-size: 18px; }
    .auth-main {
      flex: 1;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 24px;
      outline: none;
    }
  `],
})
export class AuthLayoutComponent {
  protected readonly FR = FR;
}

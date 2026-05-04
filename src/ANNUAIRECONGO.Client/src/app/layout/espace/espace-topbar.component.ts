import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { FR } from '@core/i18n/fr.constants';

/**
 * <ac-espace-topbar> — entreprise top strip.
 * Visually identical to the admin topbar but with an entreprise tag
 * instead of "Admin".
 */
@Component({
  selector: 'ac-espace-topbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="admin-topbar" role="banner">
      <div class="left">
        <button
          type="button"
          class="topbar-btn drawer-btn"
          aria-label="Ouvrir le menu espace"
          (click)="toggleMobileSidebar.emit()"
        >
          <span class="material-symbols-outlined" aria-hidden="true">menu</span>
        </button>
        <a routerLink="/espace" class="topbar-logo" aria-label="Mon espace entreprise">
          <img src="/logo2.png" alt="" class="h-8 w-auto" width="160" height="32"/>
          <span class="brand-tag">Espace</span>
        </a>
      </div>

      <div class="topbar-actions">
        <a routerLink="/espace/notifications" class="topbar-btn" aria-label="Notifications">
          <span class="material-symbols-outlined" aria-hidden="true">notifications</span>
          <span class="notif-badge" aria-hidden="true"></span>
        </a>
        <a routerLink="/espace/compte" class="topbar-btn" aria-label="Mon compte">
          <span class="material-symbols-outlined" aria-hidden="true">person</span>
        </a>

        <div class="topbar-user" role="button" tabindex="0" [attr.aria-label]="'Menu utilisateur — ' + displayName()">
          <div class="avatar" aria-hidden="true">{{ initials() }}</div>
          <span class="hidden sm:block">{{ displayName() }}</span>
        </div>

        <button class="topbar-btn" type="button" [attr.aria-label]="FR.nav.logout" (click)="onLogout()">
          <span class="material-symbols-outlined text-error" aria-hidden="true">logout</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: contents; }
    .left { display: flex; align-items: center; gap: 12px; }
    .drawer-btn { display: inline-flex; }
    @media (min-width: 769px) { .drawer-btn { display: none; } }
    .brand-tag {
      font-size: 11px;
      font-weight: 700;
      color: var(--color-primary);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      display: none;
    }
    @media (min-width: 640px) { .brand-tag { display: inline; } }
    .avatar {
      width: 28px; height: 28px;
      border-radius: var(--radius-full);
      background: var(--color-primary);
      color: var(--color-on-primary);
      font-size: 11px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
  `],
})
export class EspaceTopbarComponent {
  protected readonly FR = FR;
  readonly toggleMobileSidebar = output<void>();
  private readonly auth = inject(AuthService);

  protected readonly displayName = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return 'Mon compte';
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    return name || user.email || 'Mon compte';
  });

  protected readonly initials = computed(() => {
    const name = this.displayName();
    const parts = name.split(/[\s.@]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (name[0] || 'U').toUpperCase();
  });

  protected onLogout(): void { this.auth.logout(); }
}

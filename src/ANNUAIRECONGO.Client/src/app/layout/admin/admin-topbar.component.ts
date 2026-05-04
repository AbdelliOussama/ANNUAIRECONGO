import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

/**
 * <ac-admin-topbar> — top strip across the admin shell. Holds the brand,
 * notifications icon, settings shortcut, user identity chip, and logout.
 *
 * Emits `(toggleMobileSidebar)` so the parent layout can open the drawer
 * on tablet / mobile (audit M10 — admin must be usable below desktop).
 */
@Component({
  selector: 'ac-admin-topbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="admin-topbar" role="banner">
      <div class="left">
        <button
          type="button"
          class="topbar-btn drawer-btn"
          aria-label="Ouvrir le menu administration"
          (click)="toggleMobileSidebar.emit()"
        >
          <span class="material-symbols-outlined" aria-hidden="true">menu</span>
        </button>

        <a routerLink="/admin" class="topbar-logo" aria-label="Tableau de bord administration">
          <img src="/logo2.png" alt="" class="h-8 w-auto" width="160" height="32"/>
          <span class="brand-tag">Admin</span>
        </a>
      </div>

      <div class="topbar-actions">
        <button class="topbar-btn" type="button" aria-label="Notifications" routerLink="/admin/notifications">
          <span class="material-symbols-outlined" aria-hidden="true">notifications</span>
          <span class="notif-badge" aria-hidden="true"></span>
        </button>
        <button class="topbar-btn" type="button" aria-label="Paramètres" routerLink="/admin/parametres">
          <span class="material-symbols-outlined" aria-hidden="true">settings</span>
        </button>

        <div class="topbar-user" role="button" tabindex="0" [attr.aria-label]="userAriaLabel()" aria-haspopup="true">
          <div class="avatar" aria-hidden="true">{{ initials() }}</div>
          <span class="hidden sm:block">{{ displayName() }}</span>
          <span class="material-symbols-outlined text-sm text-secondary" aria-hidden="true">expand_more</span>
        </div>

        <button class="topbar-btn" type="button" aria-label="Se déconnecter" (click)="onLogout()">
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
export class AdminTopbarComponent {
  readonly toggleMobileSidebar = output<void>();
  private readonly auth = inject(AuthService);

  protected readonly displayName = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return 'Administrateur';
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    return name || user.email || 'Administrateur';
  });

  protected readonly initials = computed(() => {
    const name = this.displayName();
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (name[0] || 'A').toUpperCase();
  });

  protected readonly userAriaLabel = computed(() => `Menu utilisateur — ${this.displayName()}`);

  protected onLogout(): void {
    this.auth.logout();
  }
}

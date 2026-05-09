import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { FR } from '@core/i18n/fr.constants';

interface SidebarLink { path: string; label: string; icon: string; }
interface SidebarSection { label: string; links: SidebarLink[]; }

/**
 * <ac-espace-sidebar> — entreprise console navigation.
 * Sections: Mon entreprise / Abonnement / Compte.
 */
@Component({
  selector: 'ac-espace-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside
      class="ent-sidebar no-scrollbar"
      [class.is-open]="open()"
      aria-label="Navigation espace entreprise"
    >
      <div class="brand-bar">
        <img src="/logo2.png" alt="" class="h-8 w-auto" width="160" height="32"/>
        <span class="brand-text">Mon Espace</span>
      </div>

      <nav aria-label="Menu espace entreprise">
        @for (section of sections; track section.label) {
          <p class="sidebar-section-label">{{ section.label }}</p>
          @for (link of section.links; track link.path) {
            <a
              [routerLink]="link.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: link.path === '/espace' }"
              ariaCurrentWhenActive="page"
              class="sidebar-link"
              (click)="navigate.emit()"
            >
              <span class="material-symbols-outlined" aria-hidden="true">{{ link.icon }}</span>
              {{ link.label }}
            </a>
          }
        }
        @if (isAdmin()) {
          <p class="sidebar-section-label">Administration</p>
          <a
            routerLink="/admin"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: false }"
            ariaCurrentWhenActive="page"
            class="sidebar-link"
            (click)="navigate.emit()"
          >
            <span class="material-symbols-outlined" aria-hidden="true">admin_panel_settings</span>
            Panneau admin
          </a>
        }
      </nav>
    </aside>

    @if (open()) {
      <div class="sidebar-scrim md:hidden" (click)="navigate.emit()" aria-hidden="true"></div>
    }
  `,
  styles: [`
    :host { display: contents; }
    .brand-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 12px 16px;
      border-bottom: 1px solid rgba(190, 201, 193, 0.2);
      margin-bottom: 8px;
    }
    .brand-text {
      font-family: var(--font-headline);
      font-size: 14px;
      font-weight: 700;
      color: var(--color-on-surface);
    }
    .sidebar-scrim {
      position: fixed;
      inset: var(--topbar-height) 0 0 0;
      background: rgba(25, 28, 30, 0.55);
      backdrop-filter: blur(2px);
      z-index: 39;
    }
    @media (max-width: 768px) {
      .ent-sidebar {
        display: flex;
        transform: translateX(-100%);
        transition: transform 0.25s ease;
      }
      .ent-sidebar.is-open { transform: translateX(0); }
    }
  `],
})
export class EspaceSidebarComponent {
  protected readonly FR = FR;
  private readonly auth = inject(AuthService);
  readonly open = input<boolean>(false);
  readonly navigate = output<void>();

  protected readonly isAdmin = computed(() => this.auth.isAdmin());

  protected readonly sections: ReadonlyArray<SidebarSection> = [
    {
      label: 'Navigation',
      links: [
        { path: '/', label: 'Accueil', icon: 'home' },
      ],
    },
    {
      label: 'Mon entreprise',
      links: [
        { path: '/espace',                 label: 'Console',           icon: 'space_dashboard' },
        { path: '/espace/fiche/editer',    label: 'Ma fiche',          icon: 'business' },
        { path: '/espace/statistiques',    label: 'Statistiques',      icon: 'analytics' },
        { path: '/espace/notifications',   label: FR.nav.notifications, icon: 'notifications' },
      ],
    },
    {
      label: 'Abonnement',
      links: [
        { path: '/espace/abonnement',            label: 'Mon abonnement',  icon: 'workspace_premium' },
        { path: '/espace/abonnement/historique', label: 'Historique',      icon: 'receipt_long' },
      ],
    },
    {
      label: 'Compte',
      links: [
        { path: '/espace/compte', label: FR.nav.profile, icon: 'person' },
      ],
    },
  ];
}

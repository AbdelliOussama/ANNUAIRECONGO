import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface SidebarLink {
  path: string;
  label: string;
  icon: string;
  superAdminOnly?: boolean;
}

interface SidebarSection {
  label: string;
  links: SidebarLink[];
}

/**
 * <ac-admin-sidebar> — vertical navigation listing every admin page.
 * Sections mirror the maquette: Vue d'ensemble / Gestion / Référentiel / Système.
 *
 * Visible by default on >=md; hidden on mobile and shown via a CDK drawer
 * toggled from the topbar's hamburger.
 */
@Component({
  selector: 'ac-admin-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside
      class="admin-sidebar no-scrollbar"
      [class.is-open]="open()"
      aria-label="Navigation administration"
    >
      <div class="brand-bar">
        <img src="/logo2.png" alt="" class="h-8 w-auto" width="160" height="32"/>
        <span class="brand-text">Panneau Admin</span>
      </div>

      <nav aria-label="Menu administration">
        @for (section of sections; track section.label) {
          <p class="sidebar-section-label">{{ section.label }}</p>
          @for (link of section.links; track link.path) {
            <a
              [routerLink]="link.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: false }"
              ariaCurrentWhenActive="page"
              class="sidebar-link"
              (click)="navigate.emit()"
            >
              <span class="material-symbols-outlined" aria-hidden="true">{{ link.icon }}</span>
              {{ link.label }}
            </a>
          }
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
      .admin-sidebar {
        display: flex;
        transform: translateX(-100%);
        transition: transform 0.25s ease;
      }
      .admin-sidebar.is-open { transform: translateX(0); }
    }
  `],
})
export class AdminSidebarComponent {
  readonly open = input<boolean>(false);
  readonly navigate = output<void>();

  protected readonly sections: ReadonlyArray<SidebarSection> = [
    {
      label: 'Navigation',
      links: [
        { path: '/', label: 'Accueil', icon: 'home' },
      ],
    },
    {
      label: 'Vue d\'ensemble',
      links: [
        { path: '/admin',              label: 'Tableau de bord', icon: 'dashboard' },
        { path: '/admin/statistiques', label: 'Statistiques',    icon: 'analytics' },
      ],
    },
    {
      label: 'Gestion',
      links: [
        { path: '/admin/validation',        label: 'Validation fiches', icon: 'fact_check' },
        { path: '/admin/entreprises',       label: 'Entreprises',       icon: 'apartment' },
        { path: '/admin/entreprises/creer', label: 'Créer une fiche',   icon: 'add_business' },
        { path: '/admin/paiements',         label: 'Paiements',         icon: 'payments' },
        { path: '/admin/utilisateurs',      label: 'Utilisateurs',      icon: 'group',         superAdminOnly: true },
        { path: '/admin/dirigeants',        label: 'Dirigeants',        icon: 'badge' },
        { path: '/admin/rapport-ia',        label: 'Rapport IA',        icon: 'psychology' },
      ],
    },
    {
      label: 'Référentiel',
      links: [
        { path: '/admin/secteurs',   label: 'Secteurs',   icon: 'category' },
        { path: '/admin/geographie', label: 'Géographie', icon: 'public' },
        { path: '/admin/forfaits',   label: 'Forfaits',   icon: 'layers' },
      ],
    },
    {
      label: 'Système',
      links: [
        { path: '/admin/audit',      label: 'Journal d\'audit', icon: 'history' },
        { path: '/admin/parametres', label: 'Paramètres',       icon: 'settings' },
      ],
    },
  ];
}

import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { CompanyContextService } from '@core/services/company-context.service';
import { FR } from '@core/i18n/fr.constants';

interface SidebarLink { path: string; label: string; icon: string; }
interface SidebarSection { label: string; links: SidebarLink[]; }

/**
 * <ac-espace-sidebar> — entreprise console navigation.
 *
 * Multi-company update: a company switcher dropdown sits between the brand bar
 * and the nav sections. It shows:
 *   - the currently selected company name
 *   - a dropdown list of all companies when opened
 *   - an "Ajouter une entreprise" action at the bottom of the dropdown
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

      <!-- Company Switcher -->
      <div class="company-switcher">
        <!--
          Show the company name with a dropdown only when the user owns 2+ companies.
          With a single company the button is display-only (no chevron, no dropdown).
        -->
        <button
          type="button"
          class="switcher-btn"
          [class.is-open]="switcherOpen()"
          [class.is-multi]="ctx.companies().length > 1"
          (click)="ctx.companies().length > 1 ? toggleSwitcher() : null"
          [attr.aria-expanded]="ctx.companies().length > 1 ? switcherOpen() : null"
          [attr.aria-haspopup]="ctx.companies().length > 1 ? 'listbox' : null"
        >
          <span class="switcher-icon material-symbols-outlined" aria-hidden="true">business</span>
          <span class="switcher-name">
            {{ ctx.selectedCompany()?.name || 'Aucune entreprise' }}
          </span>
          @if (ctx.companies().length > 1) {
            <span class="material-symbols-outlined switcher-chevron" aria-hidden="true">
              {{ switcherOpen() ? 'expand_less' : 'expand_more' }}
            </span>
          }
        </button>

        @if (switcherOpen() && ctx.companies().length > 1) {
          <div class="switcher-dropdown" role="listbox" aria-label="Choisir une entreprise">
            @for (company of ctx.companies(); track company.id) {
              <button
                type="button"
                class="switcher-option"
                [class.is-selected]="company.id === ctx.selectedCompanyId()"
                role="option"
                [attr.aria-selected]="company.id === ctx.selectedCompanyId()"
                (click)="selectCompany(company.id)"
              >
                <span class="option-dot material-symbols-outlined" aria-hidden="true">
                  {{ company.id === ctx.selectedCompanyId() ? 'radio_button_checked' : 'radio_button_unchecked' }}
                </span>
                <span class="option-name">{{ company.name }}</span>
              </button>
            }
            <div class="switcher-divider"></div>
            <a
              routerLink="/espace/fiche/creer"
              class="switcher-add"
              (click)="closeSwitcher()"
            >
              <span class="material-symbols-outlined" aria-hidden="true">add_circle</span>
              Ajouter une entreprise
            </a>
          </div>
        }
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
              (click)="onNavClick()"
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
            (click)="onNavClick()"
          >
            <span class="material-symbols-outlined" aria-hidden="true">admin_panel_settings</span>
            Panneau admin
          </a>
        }
      </nav>
    </aside>

    @if (open()) {
      <div class="sidebar-scrim md:hidden" (click)="onNavClick()" aria-hidden="true"></div>
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

    .company-switcher {
      position: relative;
      padding: 8px 12px 12px;
      border-bottom: 1px solid rgba(190, 201, 193, 0.15);
      margin-bottom: 8px;
    }

    .switcher-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 10px;
      background: var(--color-surface-container-low);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-lg);
      cursor: default;
      transition: background 0.15s, border-color 0.15s;
      text-align: left;
    }
    .switcher-btn.is-multi { cursor: pointer; }
    .switcher-btn.is-multi:hover,
    .switcher-btn.is-open {
      background: var(--color-surface-container);
      border-color: var(--color-primary);
    }

    .switcher-icon {
      font-size: 18px;
      color: var(--color-primary);
      flex-shrink: 0;
    }
    .switcher-name {
      flex: 1;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }
    .switcher-chevron {
      font-size: 18px;
      color: var(--color-outline);
      flex-shrink: 0;
    }

    .switcher-dropdown {
      position: absolute;
      top: calc(100% - 4px);
      left: 12px;
      right: 12px;
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-lg);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      z-index: 50;
      overflow: hidden;
      padding: 6px 0;
    }

    .switcher-option {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 14px;
      background: none;
      border: none;
      cursor: pointer;
      text-align: left;
      transition: background 0.12s;
      color: var(--color-on-surface);
    }
    .switcher-option:hover { background: var(--color-surface-container-low); }
    .switcher-option.is-selected { background: var(--color-primary-fixed); }

    .option-dot {
      font-size: 16px;
      color: var(--color-outline);
      flex-shrink: 0;
    }
    .switcher-option.is-selected .option-dot { color: var(--color-primary); }

    .option-name {
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    .switcher-divider {
      height: 1px;
      background: var(--color-outline-variant);
      margin: 6px 0;
    }

    .switcher-add {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 14px;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-primary);
      text-decoration: none;
      transition: background 0.12s;
    }
    .switcher-add:hover { background: var(--color-primary-fixed); }
    .switcher-add .material-symbols-outlined { font-size: 18px; }

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
  protected readonly ctx = inject(CompanyContextService);

  readonly open = input<boolean>(false);
  readonly navigate = output<void>();

  protected readonly isAdmin    = computed(() => this.auth.isAdmin());
  protected readonly switcherOpen = signal(false);

  protected toggleSwitcher(): void { this.switcherOpen.update(v => !v); }
  protected closeSwitcher():  void { this.switcherOpen.set(false); }

  protected selectCompany(id: string): void {
    this.ctx.selectCompany(id);
    this.switcherOpen.set(false);
  }

  protected onNavClick(): void {
    this.switcherOpen.set(false);
    this.navigate.emit();
  }

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
        { path: '/espace',               label: 'Console',            icon: 'space_dashboard' },
        { path: '/espace/fiche/editer',  label: 'Ma fiche',           icon: 'business' },
        { path: '/espace/statistiques',  label: 'Statistiques',       icon: 'analytics' },
        { path: '/espace/notifications', label: FR.nav.notifications, icon: 'notifications' },
      ],
    },
    {
      label: 'Abonnement',
      links: [
        { path: '/espace/abonnement',            label: 'Mon abonnement', icon: 'workspace_premium' },
        { path: '/espace/abonnement/historique', label: 'Historique',     icon: 'receipt_long' },
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

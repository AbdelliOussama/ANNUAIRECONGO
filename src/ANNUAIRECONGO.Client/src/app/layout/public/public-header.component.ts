import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { FR } from '@core/i18n/fr.constants';

interface NavItem {
  path: string;
  label: string;
}

/**
 * <ac-public-header> — universal header for every public page (audit C8, M3, M4).
 *
 * Five primary entries (Annuaire, Registre, Secteurs, Cartographie, Tarifs) +
 * Connexion / S'inscrire CTAs. Mobile drawer below 1024 px.
 *
 * The drawer uses Tailwind utilities for show/hide so it never bleeds into
 * the desktop layout (this is the bug-fix vs. the first iteration that used
 * a global CSS rule keyed on a wrong id).
 */
@Component({
  selector: 'ac-public-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header>
      <nav
        class="bg-surface/95 border-b border-surface-variant/50 sticky top-0 z-50 backdrop-blur-md"
        aria-label="Navigation principale"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between h-16">

          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2.5 flex-shrink-0" aria-label="Accueil Annuaire Congo">
            <img src="/logo2.png" alt="" class="h-9 w-auto" width="160" height="36"/>
            <span class="sr-only">{{ FR.app.name }}</span>
          </a>

          <!-- Desktop nav -->
          <ul class="hidden lg:flex items-center gap-1 list-none m-0 p-0" role="menubar">
            @for (item of navItems; track item.path) {
              <li role="none">
                <a
                  [routerLink]="item.path"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="item.path === '/' ? { exact: true } : { exact: false }"
                  ariaCurrentWhenActive="page"
                  class="nav-link"
                  role="menuitem"
                >{{ item.label }}</a>
              </li>
            }
          </ul>

          <!-- Desktop CTAs -->
          <div class="hidden lg:flex items-center gap-3">
            <a routerLink="/auth/connexion" class="nav-link">{{ FR.nav.login }}</a>
            <a routerLink="/auth/inscription" class="btn btn-primary">{{ FR.nav.register }}</a>
          </div>

          <!-- Mobile hamburger -->
          <button
            type="button"
            class="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-surface-container transition-colors"
            [attr.aria-expanded]="mobileOpen()"
            aria-controls="ac-mobile-menu"
            [attr.aria-label]="mobileOpen() ? 'Fermer le menu' : 'Ouvrir le menu'"
            (click)="toggleMobile()"
          >
            <span class="material-symbols-outlined text-on-surface" aria-hidden="true">
              {{ mobileOpen() ? 'close' : 'menu' }}
            </span>
          </button>
        </div>

        <!-- Mobile drawer — hidden on lg+, opens via signal on smaller screens -->
        @if (mobileOpen()) {
          <div
            id="ac-mobile-menu"
            class="lg:hidden flex flex-col bg-surface border-t border-surface-variant py-3"
            role="menu"
            aria-label="Menu mobile"
          >
            @for (item of navItems; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="active"
                [routerLinkActiveOptions]="item.path === '/' ? { exact: true } : { exact: false }"
                ariaCurrentWhenActive="page"
                class="px-6 py-3 text-sm font-bold uppercase tracking-wider text-on-secondary-container hover:text-primary hover:bg-surface-container-low transition-colors"
                role="menuitem"
                (click)="closeMobile()"
              >{{ item.label }}</a>
            }
            <div class="flex items-center gap-3 border-t border-surface-variant mt-2 pt-3 px-6 pb-2">
              <a routerLink="/auth/connexion"   class="btn btn-ghost flex-1 justify-center" (click)="closeMobile()">{{ FR.nav.login }}</a>
              <a routerLink="/auth/inscription" class="btn btn-primary flex-1 justify-center" (click)="closeMobile()">{{ FR.nav.register }}</a>
            </div>
          </div>
        }
      </nav>
    </header>
  `,
  styles: [`
    :host { display: block; }
    .flex-1 { flex: 1; }
  `],
})
export class PublicHeaderComponent {
  protected readonly FR = FR;
  protected readonly mobileOpen = signal(false);

  protected readonly navItems: ReadonlyArray<NavItem> = [
    { path: '/annuaire',     label: FR.nav.annuaire },
    { path: '/registre',     label: FR.nav.registre },
    { path: '/secteurs',     label: FR.nav.secteurs },
    { path: '/cartographie', label: FR.nav.cartographie },
    { path: '/tarifs',       label: FR.nav.tarifs },
  ];

  private readonly router = inject(Router);

  constructor() {
    // Auto-close drawer when the route changes.
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.mobileOpen.set(false));
  }

  protected toggleMobile(): void { this.mobileOpen.update((v) => !v); }
  protected closeMobile(): void  { this.mobileOpen.set(false); }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.mobileOpen()) this.closeMobile();
  }
}

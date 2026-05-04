import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminTopbarComponent } from './admin-topbar.component';
import { AdminSidebarComponent } from './admin-sidebar.component';
import { ToastHostComponent } from '@shared/ui/toast/toast-host.component';
import { SkipLinkComponent } from '@shared/ui/skip-link/skip-link.component';

/**
 * Admin shell. Mounted under the `/admin` route prefix; gated by authGuard +
 * adminGuard. Hosts the topbar, sidebar, router-outlet, and toast container.
 */
@Component({
  selector: 'ac-admin-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    AdminTopbarComponent,
    AdminSidebarComponent,
    ToastHostComponent,
    SkipLinkComponent,
  ],
  template: `
    <ac-skip-link />
    <ac-admin-topbar (toggleMobileSidebar)="toggleSidebar()" />

    <div class="admin-layout">
      <ac-admin-sidebar [open]="sidebarOpen()" (navigate)="closeSidebar()" />
      <main id="main-content" class="admin-main page-transition" tabindex="-1">
        <router-outlet />
      </main>
    </div>

    <ac-toast-host />
  `,
})
export class AdminLayoutComponent {
  protected readonly sidebarOpen = signal(false);

  protected toggleSidebar(): void { this.sidebarOpen.update((v) => !v); }
  protected closeSidebar(): void  { this.sidebarOpen.set(false); }
}

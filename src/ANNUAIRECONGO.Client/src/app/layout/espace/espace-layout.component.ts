import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EspaceTopbarComponent } from './espace-topbar.component';
import { EspaceSidebarComponent } from './espace-sidebar.component';
import { ToastHostComponent } from '@shared/ui/toast/toast-host.component';
import { SkipLinkComponent } from '@shared/ui/skip-link/skip-link.component';

/**
 * Espace entreprise shell. Mounted under /espace and gated by authGuard.
 */
@Component({
  selector: 'ac-espace-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    EspaceTopbarComponent,
    EspaceSidebarComponent,
    ToastHostComponent,
    SkipLinkComponent,
  ],
  template: `
    <ac-skip-link />
    <ac-espace-topbar (toggleMobileSidebar)="toggleSidebar()" />

    <div class="ent-layout">
      <ac-espace-sidebar [open]="sidebarOpen()" (navigate)="closeSidebar()" />
      <main id="main-content" class="ent-main page-transition" tabindex="-1">
        <router-outlet />
      </main>
    </div>

    <ac-toast-host />
  `,
})
export class EspaceLayoutComponent {
  protected readonly sidebarOpen = signal(false);

  protected toggleSidebar(): void { this.sidebarOpen.update((v) => !v); }
  protected closeSidebar(): void  { this.sidebarOpen.set(false); }
}

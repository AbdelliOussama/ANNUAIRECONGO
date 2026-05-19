import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicHeaderComponent } from './public-header.component';
import { PublicFooterComponent } from './public-footer.component';
import { ToastHostComponent } from '@shared/ui/toast/toast-host.component';
import { SkipLinkComponent } from '@shared/ui/skip-link/skip-link.component';
import { PwaInstallComponent } from '@shared/components/pwa-install/pwa-install.component';
import { AiChatWidgetComponent } from '@shared/components/ai-chat-widget/ai-chat-widget.component';

/**
 * Layout for every public page (accueil, annuaire, secteurs, cartographie,
 * tarifs, contact, mentions, confidentialité, …).
 */
@Component({
  selector: 'ac-public-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    PublicHeaderComponent,
    PublicFooterComponent,
    ToastHostComponent,
    SkipLinkComponent,
    PwaInstallComponent,
    AiChatWidgetComponent,
  ],
  template: `
    <ac-skip-link />
    <ac-public-header />
    <main id="main-content" class="page-transition" tabindex="-1">
      <router-outlet />
    </main>
    <ac-public-footer />
    <ac-toast-host />
    <ac-pwa-install />
    <ac-ai-chat-widget />
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; }
    main { flex: 1; outline: none; }
  `],
})
export class PublicLayoutComponent {}

import { ChangeDetectionStrategy, Component, HostListener, OnInit, signal } from '@angular/core';

/**
 * Captures the `beforeinstallprompt` event and renders a friendly CTA so
 * the user can install the PWA from anywhere on the site.
 *
 * Drop one of these inside the public footer (or the auth layout) — it's
 * silent until the browser fires the install event, and disappears after
 * the user accepts or dismisses.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  prompt(): Promise<void>;
}

@Component({
  selector: 'ac-pwa-install',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div class="bar" role="region" aria-label="Installer l'application">
        <span class="material-symbols-outlined" aria-hidden="true">install_mobile</span>
        <div class="copy">
          <p class="title">Installer l'application</p>
          <p class="hint">Accédez à l'annuaire en un clic depuis votre écran d'accueil.</p>
        </div>
        <div class="actions">
          <button type="button" class="btn btn-ghost btn-sm" (click)="dismiss()">Plus tard</button>
          <button type="button" class="btn btn-primary btn-sm" (click)="install()">Installer</button>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .bar {
      position: fixed;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 18px;
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-toast);
      z-index: 70;
      max-width: calc(100% - 32px);
      width: 480px;
    }
    .bar .material-symbols-outlined {
      font-size: 28px;
      color: var(--color-primary);
      flex-shrink: 0;
    }
    .copy { flex: 1; min-width: 0; }
    .title { font-weight: 700; color: var(--color-on-surface); font-size: 14px; margin: 0 0 2px; }
    .hint  { font-size: 12px; color: var(--color-on-surface-variant); margin: 0; }
    .actions { display: flex; gap: 6px; }
    @media (max-width: 540px) {
      .bar { flex-direction: column; align-items: stretch; gap: 10px; }
      .actions { justify-content: flex-end; }
    }
  `],
})
export class PwaInstallComponent implements OnInit {
  protected readonly visible = signal(false);
  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  ngOnInit(): void {
    // Already installed? Stay silent.
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  protected onBeforeInstallPrompt(event: Event): void {
    event.preventDefault();
    this.deferredPrompt = event as BeforeInstallPromptEvent;
    this.visible.set(true);
  }

  @HostListener('window:appinstalled')
  protected onInstalled(): void {
    this.visible.set(false);
    this.deferredPrompt = null;
  }

  protected async install(): Promise<void> {
    if (!this.deferredPrompt) return this.dismiss();
    await this.deferredPrompt.prompt();
    await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.visible.set(false);
  }

  protected dismiss(): void {
    this.visible.set(false);
  }
}

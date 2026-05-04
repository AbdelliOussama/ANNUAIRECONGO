import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { FR } from '@core/i18n/fr.constants';

/**
 * Temporary "coming soon" component used during the rebuild.
 *
 * Routes that point at pages we haven't rebuilt yet (accueil, secteurs,
 * contact, mentions-legales, etc.) lazy-load this component so navigation
 * doesn't 404 during the Sprint 3-6 transition. Each placeholder shows the
 * page title from route data, plus a back-to-home link.
 *
 * Replace each placeholder route with the real component as it's built.
 */
@Component({
  selector: 'ac-placeholder',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EmptyStateComponent],
  template: `
    <section class="wrapper">
      <ac-empty-state
        icon="construction"
        [title]="title()"
        hint="Cette page est en cours de reconstruction. Elle sera disponible dans une prochaine itération."
      >
        <a routerLink="/" class="btn btn-primary">{{ FR.actions.backToHome }}</a>
      </ac-empty-state>
    </section>
  `,
  styles: [`
    .wrapper { padding: 64px 24px; max-width: 720px; margin: 0 auto; }
  `],
})
export class PlaceholderComponent {
  protected readonly FR = FR;
  private readonly route = inject(ActivatedRoute);
  private readonly data = toSignal(this.route.data, { initialValue: {} });
  protected readonly title = computed(() => (this.data() as { title?: string }).title || 'Bientôt disponible');
}

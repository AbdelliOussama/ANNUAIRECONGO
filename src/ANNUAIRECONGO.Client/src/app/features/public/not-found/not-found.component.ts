import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ac-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="wrap text-center max-w-2xl mx-auto px-6 py-24">
      <div class="badge-404">404</div>
      <h1 class="text-3xl md:text-5xl font-black font-headline tracking-tight my-6">
        Cette page n'existe pas.
      </h1>
      <p class="text-secondary mb-10 leading-relaxed">
        L'URL que vous avez saisie semble incorrecte ou la page a été déplacée.
        Vous pouvez retourner à l'accueil ou consulter l'annuaire pour trouver
        ce que vous cherchez.
      </p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <a routerLink="/" class="btn btn-primary py-4 px-10 text-sm">
          Retour à l'accueil
        </a>
        <a routerLink="/annuaire" class="btn btn-outline py-4 px-10 text-sm">
          Consulter l'annuaire
        </a>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .badge-404 {
      display: inline-block;
      font-family: var(--font-headline);
      font-size: 92px;
      font-weight: 900;
      color: var(--color-primary);
      letter-spacing: -0.04em;
      line-height: 1;
    }
  `],
})
export class NotFoundComponent {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FR } from '@core/i18n/fr.constants';

interface FooterColumn {
  title: string;
  links: { path: string; label: string }[];
}

/**
 * <ac-public-footer> — dark footer (#191c1e) per maquette.
 * Three columns + bottom strip with social/contact icons.
 */
@Component({
  selector: 'ac-public-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <footer class="footer" role="contentinfo">
      <div class="footer-inner">
        <div class="footer-top">
           <div class="brand-block">
             <img src="/logo2.png" alt="" class="h-9 w-auto" width="160" height="36"/>
             <p class="tagline">
              © {{ year }} République du Congo.<br/>
              Plateforme Numérique Officielle des Entreprises.
            </p>
          </div>

          <div class="columns">
            @for (col of columns; track col.title) {
              <div class="column">
                <h4 class="column-title">{{ col.title }}</h4>
                <div class="column-links">
                  @for (l of col.links; track l.path) {
                    <a [routerLink]="l.path" class="link">{{ l.label }}</a>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <div class="footer-bottom">
          <p class="signature">
            {{ FR.app.name }} — Plateforme Numérique Officielle des Entreprises
          </p>
          <div class="socials" aria-label="Liens externes">
            <a routerLink="/" class="social" aria-label="Site officiel">
              <span class="material-symbols-outlined" aria-hidden="true">language</span>
            </a>
            <a routerLink="/contact" class="social" aria-label="Nous contacter">
              <span class="material-symbols-outlined" aria-hidden="true">mail</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host { display: block; }

    .footer {
      background: #191c1e;
      color: rgba(255, 255, 255, 0.65);
      padding: 48px 24px;
      margin-top: 64px;
    }
    .footer-inner {
      max-width: 1400px;
      margin: 0 auto;
    }
    .footer-top {
      display: flex;
      flex-direction: column;
      gap: 32px;
      margin-bottom: 32px;
    }
    @media (min-width: 768px) {
      .footer-top { flex-direction: row; justify-content: space-between; }
    }

    .brand-block { display: flex; flex-direction: column; gap: 12px; }
     .logo-mark   { height: 24px; width: auto; }
    .tagline     {
      color: rgba(255, 255, 255, 0.55);
      font-size: 14px;
      max-width: 320px;
      line-height: 1.5;
    }

    .columns {
      display: flex;
      flex-wrap: wrap;
      gap: 48px;
    }
    .column-title {
      font-family: var(--font-body);
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin: 0 0 12px;
    }
    .column-links { display: flex; flex-direction: column; gap: 8px; }
    .link {
      color: rgba(255, 255, 255, 0.55);
      font-size: 14px;
      transition: color 0.15s;
    }
    .link:hover { color: #fff; }

    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
    }
    @media (min-width: 768px) {
      .footer-bottom { flex-direction: row; }
    }
    .signature { font-size: 12px; color: rgba(255, 255, 255, 0.4); margin: 0; }
    .socials { display: flex; gap: 12px; }
    .social {
      width: 32px; height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      transition: background 0.15s;
    }
    .social:hover { background: var(--color-primary); }
    .social .material-symbols-outlined { font-size: 18px; }
  `],
})
export class PublicFooterComponent {
  protected readonly FR = FR;
  protected readonly year = new Date().getFullYear();

  protected readonly columns: ReadonlyArray<FooterColumn> = [
    {
      title: 'Plateforme',
      links: [
        { path: '/annuaire',    label: FR.nav.annuaire },
        { path: '/registre',    label: 'Registre National' },
        { path: '/dirigeants',  label: 'Dirigeants' },
        { path: '/trust-score', label: 'Trust Score' },
      ],
    },
    {
      title: 'Services',
      links: [
        { path: '/tarifs',         label: FR.nav.tarifs },
        { path: '/appels-offres',  label: 'Appels d\'Offres' },
        { path: '/rapport-ia',     label: 'Rapports IA' },
        { path: '/cartographie',   label: FR.nav.cartographie },
      ],
    },
    {
      title: 'Informations',
      links: [
        { path: '/support',           label: 'Support & Aide' },
        { path: '/mentions-legales',  label: FR.footer.legal },
        { path: '/confidentialite',   label: FR.footer.privacy },
        { path: '/contact',           label: FR.footer.contact },
      ],
    },
  ];
}

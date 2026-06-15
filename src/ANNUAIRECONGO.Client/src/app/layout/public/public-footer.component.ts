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
             <img src="/logo2.png" alt="Logo" class="logo-mark"/>
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
      background: var(--color-footer-bg);
      color: var(--color-footer-text);
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
     .logo-mark   { height: 36px; width: auto; object-fit: contain; max-width: 160px; }
    .tagline     {
      color: var(--color-footer-text-muted);
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
      color: var(--color-footer-text-title);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin: 0 0 12px;
    }
    .column-links { display: flex; flex-direction: column; gap: 8px; }
    .link {
      color: var(--color-footer-text-muted);
      font-size: 14px;
      transition: color 0.15s;
    }
    .link:hover { color: var(--color-footer-text-title); }

    .footer-bottom {
      border-top: 1px solid var(--color-footer-border);
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
    .signature { font-size: 12px; color: var(--color-footer-signature); margin: 0; }
    .socials { display: flex; gap: 12px; }
    .social {
      width: 32px; height: 32px;
      border-radius: 50%;
      background: var(--color-footer-social-bg);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--color-footer-social-text);
      transition: background 0.15s;
    }
    .social:hover { background: var(--color-primary); color: #fff; }
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
        { path: '/trust-score', label: 'Trust Score' },
      ],
    },
    {
      title: 'Services',
      links: [
        { path: '/tarifs',         label: FR.nav.tarifs },
        { path: '/appels-offres',  label: 'Appels d\'Offres' },
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

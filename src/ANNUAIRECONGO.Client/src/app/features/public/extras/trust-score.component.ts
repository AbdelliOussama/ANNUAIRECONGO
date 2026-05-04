import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface ScoreItem {
  label: string;
  description: string;
  score: number;
}

/**
 * /trust-score — page hors-SFD conservée à la demande du client.
 * Présente le concept d'indice de confiance attribué à chaque fiche,
 * sans données réelles : c'est un scoring informatif basé sur la
 * complétude du profil et l'historique de la fiche.
 */
@Component({
  selector: 'ac-trust-score',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div class="max-w-5xl mx-auto px-6 md:px-12 text-center">
        <p class="eyebrow mb-4">Indice de confiance</p>
        <h1 class="text-4xl md:text-6xl font-black font-headline tracking-tight mb-6">
          Trust Score<br />
          <em class="text-primary not-italic">la confiance, mesurée.</em>
        </h1>
        <p class="text-lg text-secondary leading-relaxed max-w-2xl mx-auto">
          Chaque fiche entreprise reçoit un indice de confiance calculé sur la base
          de critères vérifiables : conformité légale, ancienneté, complétude du
          profil et activité observée sur la plateforme.
        </p>
      </div>
    </section>

    <section class="px-6 md:px-12 max-w-7xl mx-auto pb-12">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <!-- Score card -->
        <div class="score-card">
          <div class="header-row">
            <span class="badge badge-verified">Exemple — fiche fictive</span>
            <span class="text-xs text-outline">2026</span>
          </div>
          <h2 class="company">Congo Shipping SA</h2>
          <p class="city">Pointe-Noire — Maritime & Portuaire</p>

          <div class="ring">
            <span class="value">98</span>
            <span class="suffix">/100</span>
          </div>
          <p class="ring-label">Indice de confiance — Excellent</p>

          <div class="bars">
            @for (item of breakdown; track item.label) {
              <div class="bar-item">
                <div class="bar-head">
                  <span>{{ item.label }}</span>
                  <span class="bar-value">{{ item.score }}/100</span>
                </div>
                <div class="bar-track" [attr.aria-label]="item.label + ' — ' + item.score + ' sur 100'">
                  <div class="bar-fill" [style.width.%]="item.score"></div>
                </div>
                <p class="bar-desc">{{ item.description }}</p>
              </div>
            }
          </div>
        </div>

        <!-- Explanation -->
        <div class="explain">
          <h3 class="explain-title">Comment l'indice est-il calculé ?</h3>
          <ul>
            <li>
              <span class="material-symbols-outlined text-primary icon-filled" aria-hidden="true">verified</span>
              <span><strong>Conformité RCCM :</strong> existence légale et enregistrement à jour au registre du commerce.</span>
            </li>
            <li>
              <span class="material-symbols-outlined text-primary icon-filled" aria-hidden="true">history</span>
              <span><strong>Ancienneté :</strong> nombre d'années d'activité déclarées et continuité du profil sur la plateforme.</span>
            </li>
            <li>
              <span class="material-symbols-outlined text-primary icon-filled" aria-hidden="true">checklist</span>
              <span><strong>Complétude :</strong> richesse du profil — coordonnées, documents, services, photos, dirigeants.</span>
            </li>
            <li>
              <span class="material-symbols-outlined text-primary icon-filled" aria-hidden="true">monitor_heart</span>
              <span><strong>Activité :</strong> mise à jour régulière de la fiche et réponses aux sollicitations.</span>
            </li>
          </ul>

          <p class="caveat">
            Cet indice est strictement informatif. Il ne constitue ni une garantie commerciale ni
            une notation officielle. Pour toute relation contractuelle, vérifiez toujours les
            documents légaux directement auprès de l'entreprise.
          </p>

          <a routerLink="/annuaire" class="btn btn-primary">Découvrir l'annuaire</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .hero { padding: 96px 0 32px; }

    .score-card {
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-2xl);
      padding: 36px;
      box-shadow: var(--shadow-editorial);
    }
    .header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
    .text-outline { color: var(--color-outline); }

    .company { font-family: var(--font-headline); font-size: 24px; font-weight: 700; margin: 0 0 4px; }
    .city { color: var(--color-on-secondary-container); font-size: 13px; margin: 0 0 24px; }

    .ring {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 4px;
      padding: 24px 0;
    }
    .ring .value {
      font-family: var(--font-headline);
      font-size: 84px;
      font-weight: 900;
      color: var(--color-primary);
      line-height: 1;
    }
    .ring .suffix { color: var(--color-outline); font-size: 18px; }
    .ring-label {
      text-align: center;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--color-on-secondary-container);
      margin: 0 0 32px;
    }

    .bars { display: flex; flex-direction: column; gap: 16px; }
    .bar-head {
      display: flex; justify-content: space-between;
      font-size: 13px; font-weight: 600;
      color: var(--color-on-surface);
      margin-bottom: 6px;
    }
    .bar-value { color: var(--color-primary); }
    .bar-track {
      height: 8px;
      background: var(--color-surface-container);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--color-primary), var(--color-primary-container));
      border-radius: var(--radius-full);
    }
    .bar-desc {
      font-size: 12px;
      color: var(--color-on-surface-variant);
      margin: 6px 0 0;
    }

    .explain-title {
      font-family: var(--font-headline);
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 16px;
    }
    .explain ul { list-style: none; padding: 0; margin: 0 0 24px; display: flex; flex-direction: column; gap: 12px; }
    .explain li {
      display: flex; gap: 10px; align-items: flex-start;
      font-size: 14px;
      color: var(--color-on-surface);
      line-height: 1.55;
    }
    .explain .material-symbols-outlined { margin-top: 2px; }
    .caveat {
      background: var(--color-surface-container-low);
      border-radius: var(--radius-lg);
      padding: 16px;
      font-size: 13px;
      color: var(--color-on-surface-variant);
      line-height: 1.6;
      margin-bottom: 24px;
    }
  `],
})
export class TrustScoreComponent {
  protected readonly breakdown: ReadonlyArray<ScoreItem> = [
    { label: 'Conformité RCCM',  description: 'Identité légale vérifiée auprès du registre.', score: 100 },
    { label: 'Ancienneté',       description: '28 ans d\'activité déclarés.',                  score: 95  },
    { label: 'Complétude profil',description: 'Coordonnées, documents et galerie complets.',  score: 96  },
    { label: 'Activité récente', description: 'Mises à jour régulières observées.',           score: 100 },
  ];
}

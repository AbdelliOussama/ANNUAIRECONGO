import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { MockEspaceService } from '@core/services/mock/mock-espace.service';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { XafPipe } from '@shared/pipes/xaf.pipe';
import { FR } from '@core/i18n/fr.constants';

/**
 * /espace — owner console.
 *
 * Audit C9: when the connected user has no fiche yet, render the empty
 * state with the prominent CTA "Créer ma fiche" pointing to /espace/fiche/creer.
 * The previous flow had this page orphaned, leaving every newly registered
 * owner with no way to publish their first profile.
 *
 * Otherwise: KPIs, abonnement summary, derniers paiements, notifications.
 */
@Component({
  selector: 'ac-espace-console',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    EmptyStateComponent,
    SkeletonComponent,
    XafPipe,
  ],
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <p class="eyebrow">Mon espace</p>
          <h1>Bonjour, {{ identity().name }}</h1>
          <p class="sub">Gérez la présence de votre entreprise sur l'annuaire national.</p>
        </div>

        @if (data() && data()!.company) {
          <a routerLink="/espace/fiche/editer" class="btn btn-outline">
            <span class="material-symbols-outlined" aria-hidden="true">edit</span>
            Modifier ma fiche
          </a>
        }
      </header>

      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (_ of [0, 1, 2, 3]; track $index) {
            <ac-skeleton shape="card" height="120px" />
          }
        </div>
      } @else if (!data()!.company) {
        <ac-empty-state
          icon="business_center"
          title="Vous n'avez pas encore de fiche entreprise"
          hint="Créez votre fiche officielle pour bénéficier d'une visibilité nationale, recevoir des appels d'offres et apparaître dans la cartographie."
        >
          <a routerLink="/espace/fiche/creer" class="btn btn-primary py-4 px-10 text-sm">
            <span class="material-symbols-outlined" aria-hidden="true">add</span>
            Créer ma fiche
          </a>
        </ac-empty-state>
      } @else {
        <!-- KPIs -->
        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Indicateurs clés">
          <article class="kpi">
            <span class="kpi-icon" aria-hidden="true"><span class="material-symbols-outlined">visibility</span></span>
            <div>
              <p class="kpi-value">{{ formatInt(data()!.stats.views) }}</p>
              <p class="kpi-label">Vues du profil ce mois</p>
            </div>
          </article>
          <article class="kpi">
            <span class="kpi-icon" aria-hidden="true"><span class="material-symbols-outlined">person</span></span>
            <div>
              <p class="kpi-value">{{ formatInt(data()!.stats.uniqueVisitors) }}</p>
              <p class="kpi-label">Visiteurs uniques</p>
            </div>
          </article>
          <article class="kpi">
            <span class="kpi-icon" aria-hidden="true"><span class="material-symbols-outlined">touch_app</span></span>
            <div>
              <p class="kpi-value">{{ formatInt(data()!.stats.contactClicks) }}</p>
              <p class="kpi-label">Clics sur contact</p>
            </div>
          </article>
          <article class="kpi">
            <span class="kpi-icon" aria-hidden="true"><span class="material-symbols-outlined">search</span></span>
            <div>
              <p class="kpi-value">{{ formatInt(data()!.stats.searchAppearances) }}</p>
              <p class="kpi-label">Apparitions en recherche</p>
            </div>
          </article>
        </section>

        <!-- Two columns -->
        <section class="two-col">
          <!-- Fiche summary -->
          <article class="panel">
            <header class="panel-head">
              <div>
                <p class="panel-eyebrow">Ma fiche</p>
                <h2>{{ data()!.company!.name }}</h2>
              </div>
              <span [class]="statusClass(data()!.company!.status)">{{ statusLabel(data()!.company!.status) }}</span>
            </header>
            <dl class="kv">
              <div><dt>Secteur</dt><dd>{{ sectorLabel(data()!.company!.sector) }}</dd></div>
              <div><dt>Ville</dt><dd>{{ data()!.company!.city }}</dd></div>
              <div><dt>RCCM</dt><dd>{{ data()!.company!.rccm }}</dd></div>
              <div><dt>NIU</dt><dd>{{ data()!.company!.niu }}</dd></div>
            </dl>
            <div class="panel-actions">
              <a [routerLink]="['/annuaire', data()!.company!.slug]" class="btn btn-ghost btn-sm">
                <span class="material-symbols-outlined" aria-hidden="true">visibility</span>
                Voir publiquement
              </a>
              <a routerLink="/espace/fiche/editer" class="btn btn-primary btn-sm">
                <span class="material-symbols-outlined" aria-hidden="true">edit</span>
                Modifier
              </a>
            </div>
          </article>

          <!-- Subscription summary -->
          <article class="panel">
            <header class="panel-head">
              <div>
                <p class="panel-eyebrow">Mon abonnement</p>
                <h2>Forfait {{ data()!.subscription?.planName }}</h2>
              </div>
              <span class="badge badge-verified">{{ data()!.subscription?.isActive ? 'Actif' : 'Inactif' }}</span>
            </header>
            <dl class="kv">
              <div><dt>Tarif mensuel</dt><dd>{{ data()!.subscription?.monthlyPrice | xaf }}</dd></div>
              <div><dt>Renouvellement</dt><dd>{{ data()!.subscription?.expiresAt }}</dd></div>
              <div><dt>Auto-renouvellement</dt><dd>{{ data()!.subscription?.autoRenew ? 'Activé' : 'Désactivé' }}</dd></div>
            </dl>
            <div class="panel-actions">
              <a routerLink="/espace/abonnement/historique" class="btn btn-ghost btn-sm">Historique</a>
              <a routerLink="/espace/abonnement" class="btn btn-primary btn-sm">Gérer l'abonnement</a>
            </div>
          </article>
        </section>

        <!-- Recent notifications -->
        <section class="panel">
          <header class="panel-head">
            <div>
              <p class="panel-eyebrow">Activité récente</p>
              <h2>Dernières notifications</h2>
            </div>
            <a routerLink="/espace/notifications" class="link">{{ FR.actions.viewAll }}</a>
          </header>
          <ul class="notif-list">
            @for (n of data()!.notifications; track n.id) {
              <li [class]="'notif-item tone-' + n.tone">
                <span class="notif-dot" aria-hidden="true"></span>
                <div class="notif-body">
                  <p class="notif-title">{{ n.title }}</p>
                  <p class="notif-text">{{ n.body }}</p>
                </div>
                <span class="notif-date">{{ n.createdAt }}</span>
              </li>
            }
          </ul>
        </section>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { max-width: 1100px; margin: 0 auto; padding: 8px 4px 32px; display: flex; flex-direction: column; gap: 28px; }

    .page-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .page-head h1 {
      font-family: var(--font-headline);
      font-size: 32px;
      font-weight: 800;
      color: var(--color-on-surface);
      margin: 6px 0 4px;
    }
    .page-head .sub { color: var(--color-on-secondary-container); font-size: 14px; margin: 0; max-width: 560px; }

    /* KPIs */
    .kpi {
      display: flex;
      align-items: center;
      gap: 14px;
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-xl);
      padding: 18px 20px;
    }
    .kpi-icon {
      width: 44px; height: 44px;
      background: var(--color-primary-fixed);
      color: var(--color-on-primary-fixed);
      border-radius: var(--radius-md);
      display: inline-flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .kpi-value {
      font-family: var(--font-headline);
      font-size: 24px;
      font-weight: 800;
      color: var(--color-on-surface);
      margin: 0;
      line-height: 1;
    }
    .kpi-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-on-secondary-container);
      margin: 6px 0 0;
    }

    /* Two columns */
    .two-col { display: grid; grid-template-columns: 1fr; gap: 24px; }
    @media (min-width: 1024px) { .two-col { grid-template-columns: 1fr 1fr; } }

    .panel {
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-2xl);
      padding: 24px;
    }
    .panel-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 18px;
    }
    .panel-head h2 {
      font-family: var(--font-headline);
      font-size: 20px;
      font-weight: 700;
      margin: 0;
    }
    .panel-eyebrow {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--color-primary);
      margin: 0 0 4px;
      font-weight: 700;
    }

    .kv {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px 24px;
      margin: 0 0 16px;
    }
    .kv dt {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-outline);
      margin-bottom: 2px;
    }
    .kv dd {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-on-surface);
      margin: 0;
    }
    .panel-actions { display: flex; gap: 8px; flex-wrap: wrap; }

    /* Notifications */
    .notif-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
    .notif-item {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 12px;
      align-items: flex-start;
      padding: 14px 12px;
      border-radius: var(--radius-md);
      transition: background 0.15s;
    }
    .notif-item:hover { background: var(--color-surface-container-low); }
    .notif-dot {
      width: 10px; height: 10px;
      border-radius: var(--radius-full);
      margin-top: 6px;
    }
    .tone-success .notif-dot { background: var(--color-primary); }
    .tone-info    .notif-dot { background: var(--color-secondary); }
    .tone-warning .notif-dot { background: var(--color-tertiary-container); }
    .tone-error   .notif-dot { background: var(--color-error); }

    .notif-title { font-size: 14px; font-weight: 700; margin: 0 0 2px; color: var(--color-on-surface); }
    .notif-text  { font-size: 13px; color: var(--color-on-surface-variant); margin: 0; line-height: 1.5; }
    .notif-date  { font-size: 11px; color: var(--color-outline); white-space: nowrap; }

    .link { color: var(--color-primary); font-weight: 600; font-size: 13px; }
    .link:hover { text-decoration: underline; }

    /* Status pills */
    .status { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: var(--radius-full); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
    .status-validee   { background: var(--color-primary-fixed); color: var(--color-on-primary-fixed); }
    .status-en-attente{ background: var(--color-tertiary-fixed); color: var(--color-on-tertiary-fixed); }
    .status-rejetee   { background: var(--color-error-container); color: var(--color-on-error-container); }
    .status-brouillon { background: var(--color-surface-container-highest); color: var(--color-on-surface-variant); }
  `],
})
export class EspaceConsoleComponent {
  protected readonly FR = FR;
  private readonly espace = inject(MockEspaceService);

  protected readonly identity = computed(() => this.espace.userIdentity());

  protected readonly data = toSignal(
    combineLatest({
      company:       this.espace.myCompany(),
      subscription:  this.espace.mySubscription(),
      payments:      this.espace.payments$(),
      notifications: this.espace.notifications$(),
      stats:         this.espace.ficheStats$(),
    }),
    { initialValue: null }
  );

  protected readonly loading = computed(() => this.data() === null);

  protected formatInt(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(n);
  }

  protected sectorLabel(slug: string): string {
    const map: Record<string, string> = {
      [FR.sectors.maritime.slug]:    FR.sectors.maritime.name,
      [FR.sectors.logistique.slug]:  FR.sectors.logistique.name,
      [FR.sectors.douane.slug]:      FR.sectors.douane.name,
      [FR.sectors.industrie.slug]:   FR.sectors.industrie.name,
      [FR.sectors.securite.slug]:    FR.sectors.securite.name,
      [FR.sectors.manutention.slug]: FR.sectors.manutention.name,
    };
    return map[slug] ?? slug;
  }

  protected statusLabel(status: string): string {
    return ({
      validee:    'Vérifiée',
      'en-attente': 'En attente',
      rejetee:    'Refusée',
      brouillon:  'Brouillon',
    } as Record<string, string>)[status] ?? status;
  }

  protected statusClass(status: string): string {
    return `status status-${status}`;
  }
}

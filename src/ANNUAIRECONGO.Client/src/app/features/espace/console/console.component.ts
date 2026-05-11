import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, of, switchMap, catchError, map } from 'rxjs';
import { BusinessOwnerService } from '@core/services/business-owner.service';
import { SubscriptionService } from '@core/services/subscription.service';
import { NotificationService } from '@core/services/notification.service';
import { StatsService } from '@core/services/stats.service';
import { AuthService } from '@core/services/auth.service';
import { Company, Subscription, Notification, PlanName, CompanyStats } from '@core/models/company.model';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { XafPipe } from '@shared/pipes/xaf.pipe';
import { DatePipe } from '@angular/common';
import { FR } from '@core/i18n/fr.constants';
import { CompanyService } from '@core/services/company.service';
import { ToastService } from '@shared/services/toast.service';
import { ModalService } from '@shared/services/modal.service';

@Component({
  selector: 'ac-espace-console',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    EmptyStateComponent,
    SkeletonComponent,
    DatePipe
  ],
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <p class="eyebrow">Mon espace</p>
          <h1>Bonjour, {{ identity()?.firstName || identity()?.email || 'Utilisateur' }}</h1>
          <p class="sub">Gérez la présence de votre entreprise sur l'annuaire national.</p>
        </div>

        @if (company()) {
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
      } @else if (!company()) {
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
              <p class="kpi-value">{{ formatInt(stats()?.views || 0) }}</p>
              <p class="kpi-label">Vues du profil</p>
            </div>
          </article>
          <article class="kpi">
            <span class="kpi-icon" aria-hidden="true"><span class="material-symbols-outlined">person</span></span>
            <div>
              <p class="kpi-value">{{ formatInt(stats()?.uniqueVisitors || 0) }}</p>
              <p class="kpi-label">Visiteurs uniques</p>
            </div>
          </article>
          <article class="kpi">
            <span class="kpi-icon" aria-hidden="true"><span class="material-symbols-outlined">touch_app</span></span>
            <div>
              <p class="kpi-value">{{ formatInt(stats()?.contactClicks || 0) }}</p>
              <p class="kpi-label">Clics sur contact</p>
            </div>
          </article>
          <article class="kpi">
            <span class="kpi-icon" aria-hidden="true"><span class="material-symbols-outlined">search</span></span>
            <div>
              <p class="kpi-value">{{ formatInt(stats()?.searchAppearances || 0) }}</p>
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
                <h2>{{ company()!.name }}</h2>
              </div>
              <span [class]="statusClass(company()!.status)">{{ statusLabel(company()!.status) }}</span>
            </header>
            <dl class="kv">
              <div><dt>Secteur</dt><dd>{{ company()!.sectors[0].name || 'N/A' }}</dd></div>
              <div><dt>Ville</dt><dd>{{ company()!.cityName || 'N/A' }}</dd></div>
              <div><dt>RCCM</dt><dd>{{ company()!.rccm || 'N/A' }}</dd></div>
              <div><dt>NIU</dt><dd>{{ company()!.niu || 'N/A' }}</dd></div>
            </dl>
            <div class="panel-actions">
              <a [routerLink]="['/annuaire', company()!.slug]" class="btn btn-ghost btn-sm">
                <span class="material-symbols-outlined" aria-hidden="true">visibility</span>
                Voir publiquement
              </a>
              @if (company()!.status === 0 || company()!.status === 3) {
                <button type="button" class="btn btn-primary btn-sm" (click)="onSubmitCompany()" [disabled]="submitting()">
                  <span class="material-symbols-outlined" aria-hidden="true">publish</span>
                  Soumettre pour validation
                </button>
              }
              <a routerLink="/espace/fiche/editer" class="btn btn-outline btn-sm">
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
                <h2>Forfait {{ getPlanLabel(subscription()!.planName) }}</h2>
              </div>
              @if (subscription()) {
                <span class="badge badge-verified">{{ subscription()!.isActive ? 'Actif' : 'Inactif' }}</span>
              } @else {
                <span class="badge badge-pending">Aucun</span>
              }
            </header>
            <dl class="kv">
              <div><dt>Statut</dt><dd>{{ subscription() ? (subscription()!.isActive ? 'Actif' : 'Non payé') : 'Non payé' }}</dd></div>
              <div><dt>Expiration</dt><dd>{{ subscription() ? (subscription()!.expiresAt | date:'dd/MM/yyyy') : 'N/A' }}</dd></div>
              <div><dt>Mode</dt><dd>{{ subscription() ? getMethodLabel(subscription()!.paymentMethod) : 'N/A' }}</dd></div>
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
          @if (notifications().length === 0) {
            <p class="muted">Aucune notification pour le moment.</p>
          } @else {
            <ul class="notif-list">
              @for (n of notifications(); track n.id) {
                <li [class]="'notif-item tone-info'">
                  <span class="notif-dot" aria-hidden="true"></span>
                  <div class="notif-body">
                    <p class="notif-title">{{ n.title }}</p>
                    <p class="notif-text">{{ n.body }}</p>
                  </div>
                  <span class="notif-date">{{ n.createdAt | date:'dd/MM/yyyy' }}</span>
                </li>
              }
            </ul>
          }
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
      background: var(--color-primary);
    }

    .notif-title { font-size: 14px; font-weight: 700; margin: 0 0 2px; color: var(--color-on-surface); }
    .notif-text  { font-size: 13px; color: var(--color-on-surface-variant); margin: 0; line-height: 1.5; }
    .notif-date  { font-size: 11px; color: var(--color-outline); white-space: nowrap; }

    .link { color: var(--color-primary); font-weight: 600; font-size: 13px; }
    .link:hover { text-decoration: underline; }

    .status { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: var(--radius-full); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
    .status-validee   { background: var(--color-primary-fixed); color: var(--color-on-primary-fixed); }
    .status-en-attente{ background: var(--color-tertiary-fixed); color: var(--color-on-tertiary-fixed); }
    .status-rejetee   { background: var(--color-error-container); color: var(--color-on-error-container); }
    .status-brouillon { background: var(--color-surface-container-highest); color: var(--color-on-surface-variant); }
  `],
})
export class EspaceConsoleComponent {
  protected readonly FR = FR;
  private readonly boService   = inject(BusinessOwnerService);
  private readonly subService  = inject(SubscriptionService);
  private readonly notifService= inject(NotificationService);
  private readonly statsService= inject(StatsService);
  private readonly authService = inject(AuthService);
  private readonly companyService = inject(CompanyService);
  private readonly toast = inject(ToastService);
  private readonly modal = inject(ModalService);

  protected readonly identity = this.authService.currentUser;
  protected readonly submitting = signal(false);

  private readonly companyData = toSignal<Company | null>(
    this.boService.getMyCompanies().pipe(map(list => list[0] || null)),
    { initialValue: null }
  );

  protected readonly company = computed(() => this.companyData());

  private readonly subData = toSignal(
    this.boService.getMyCompanies().pipe(
      switchMap(list => {
        if (!list[0]) return of([] as Subscription[]);
        return this.subService.getCompanySubscriptions(list[0].id);
      }),
      catchError(() => of([] as Subscription[]))
    ),
    { initialValue: [] as Subscription[] }
  );

  protected readonly subscription = computed(() => {
    return this.subData().find(s => s.isActive) || this.subData()[0] || null;
  });

  private readonly notifsData = toSignal(
    this.notifService.getMyNotifications().pipe(catchError(() => of([] as Notification[]))),
    { initialValue: [] as Notification[] }
  );
  protected readonly notifications = computed(() => this.notifsData().slice(0, 5));

  private readonly statsData = toSignal<CompanyStats | null>(
    this.boService.getMyCompanies().pipe(
      switchMap(list => {
        if (!list[0]) return of(null);
        return this.statsService.getCompanyStats(list[0].id);
      }),
      catchError(() => of(null))
    ),
    { initialValue: null }
  );
  protected readonly stats = computed(() => this.statsData());

  protected readonly loading = computed(() => this.companyData() === null && this.identity() !== null);

  protected formatInt(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(n);
  }

  protected getPlanLabel(name: number | string | undefined): string {
    if (typeof name === 'string') return name;
    if (name === undefined) return 'N/A';
    switch (name) {
      case PlanName.Free: return 'Gratuit';
      case PlanName.Basic: return 'Basique';
      case PlanName.Premium: return 'Premium';
      case PlanName.Enterprise: return 'Entreprise';
      default: return 'Standard';
    }
  }

  protected getMethodLabel(method: number | undefined): string {
    if (method === undefined) return 'N/A';
    switch (method) {
      case 0: return 'Stripe';
      case 1: return 'MTN MoMo';
      case 2: return 'Airtel Money';
      default: return 'Autre';
    }
  }

  protected statusLabel(status: number): string {
    switch (status) {
      case 2: return 'Vérifiée';
      case 1: return 'En attente';
      case 3: return 'Refusée';
      default: return 'Brouillon';
    }
  }

  protected statusClass(status: number): string {
    switch (status) {
      case 2: return 'status status-validee';
      case 1: return 'status status-en-attente';
      case 3: return 'status status-rejetee';
      default: return 'status status-brouillon';
    }
  }

  protected onSubmitCompany(): void {
    const c = this.company();
    if (!c) return;

    this.modal.confirm({
      title: 'Soumettre votre fiche ?',
      body: 'Votre fiche sera examinée par un administrateur avant d\'être publiée sur l\'annuaire.',
      tone: 'confirm',
      confirmLabel: 'Soumettre maintenant'
    }).then(({ confirmed }) => {
      if (!confirmed) return;
      
      this.submitting.set(true);
      this.companyService.submitCompany(c.id).subscribe({
        next: () => {
          this.toast.success('Fiche soumise avec succès !');
          window.location.reload(); 
        },
        error: () => {
          this.submitting.set(false);
          this.toast.error('Erreur lors de la soumission.');
        }
      });
    });
  }
}

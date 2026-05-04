import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { TabsComponent, TabDescriptor } from '@shared/ui/tabs/tabs.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { MockCompanyService } from '@core/services/mock/mock-company.service';
import { FR } from '@core/i18n/fr.constants';

type FicheTab = 'apropos' | 'contacts' | 'galerie' | 'localisation' | 'documents' | 'dirigeants';

/**
 * /annuaire/:slug — fiche entreprise.
 *
 * Audit fixes baked in:
 *  - M6 : the tabs are functional (not inert buttons)
 *  - P13: phone numbers and emails use tel: / mailto:
 *  - C1 : every label is in French, no RDC mention.
 */
@Component({
  selector: 'ac-fiche-entreprise',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    TabsComponent,
    EmptyStateComponent,
    SkeletonComponent,
  ],
  template: `
    @if (loading()) {
      <div class="container">
        <ac-skeleton shape="rect" height="220px" />
        <div style="margin-top:24px; max-width:520px;">
          <ac-skeleton shape="text" />
          <div style="margin-top:12px;"><ac-skeleton shape="text" /></div>
          <div style="margin-top:12px;"><ac-skeleton shape="text" /></div>
        </div>
      </div>
    } @else if (!company()) {
      <div class="container">
        <ac-empty-state
          icon="business_off"
          title="Fiche introuvable"
          hint="L'entreprise demandée n'existe pas ou n'est plus publiée."
        >
          <a routerLink="/annuaire" class="btn btn-primary">Retour à l'annuaire</a>
        </ac-empty-state>
      </div>
    } @else {
      <article class="container">
        <!-- Breadcrumbs -->
        <nav class="breadcrumbs" aria-label="Fil d'ariane">
          <a routerLink="/">Accueil</a>
          <span aria-hidden="true">›</span>
          <a routerLink="/annuaire">Annuaire</a>
          <span aria-hidden="true">›</span>
          <span class="current" aria-current="page">{{ company()!.name }}</span>
        </nav>

        <!-- Header -->
        <header class="head">
          <div class="logo" aria-hidden="true">
            <span class="material-symbols-outlined">{{ company()!.sectorIcon }}</span>
          </div>
          <div class="head-info">
            <div class="badges">
              @if (company()!.isVerified) { <span class="badge badge-verified">Vérifiée RCCM</span> }
              @if (company()!.isPremium)  { <span class="badge badge-premium">Premium</span> }
              <span class="badge badge-free">{{ company()!.sectorLabel }}</span>
            </div>
            <h1 class="title">{{ company()!.name }}</h1>
            <p class="city">
              <span class="material-symbols-outlined" aria-hidden="true">location_on</span>
              {{ company()!.city }}, {{ company()!.region }}
            </p>
          </div>
          <div class="actions">
            <a [href]="'tel:' + company()!.phone" class="btn btn-outline">
              <span class="material-symbols-outlined" aria-hidden="true">call</span>
              Appeler
            </a>
            <a [href]="'mailto:' + company()!.email" class="btn btn-primary">
              <span class="material-symbols-outlined" aria-hidden="true">mail</span>
              Contacter
            </a>
          </div>
        </header>

        <!-- Tabs -->
        <ac-tabs
          [tabs]="tabs"
          [active]="activeTab()"
          (activeChange)="setTab($event)"
          ariaLabel="Sections de la fiche entreprise"
        />

        <!-- Tab panels -->
        <section [id]="'panel-' + activeTab()" role="tabpanel"
                 [attr.aria-labelledby]="'tab-' + activeTab()" class="panel">
          @switch (activeTab()) {
            @case ('apropos') {
              <h2 class="panel-title">À propos de {{ company()!.name }}</h2>
              <p class="lead">{{ company()!.longDescription }}</p>
              <dl class="kv">
                <div><dt>Année de création</dt><dd>{{ company()!.yearFounded }}</dd></div>
                <div><dt>Numéro RCCM</dt><dd>{{ company()!.rccm }}</dd></div>
                <div><dt>NIU</dt><dd>{{ company()!.niu }}</dd></div>
                <div><dt>Secteur</dt><dd>{{ company()!.sectorLabel }}</dd></div>
              </dl>
            }
            @case ('contacts') {
              <h2 class="panel-title">Contacts</h2>
              <ul class="contact-list">
                <li>
                  <span class="material-symbols-outlined text-primary" aria-hidden="true">call</span>
                  <a [href]="'tel:' + company()!.phone">{{ company()!.phone }}</a>
                </li>
                <li>
                  <span class="material-symbols-outlined text-primary" aria-hidden="true">mail</span>
                  <a [href]="'mailto:' + company()!.email">{{ company()!.email }}</a>
                </li>
                <li>
                  <span class="material-symbols-outlined text-primary" aria-hidden="true">language</span>
                  <a [href]="company()!.website" target="_blank" rel="noopener">{{ company()!.website }}</a>
                </li>
                <li>
                  <span class="material-symbols-outlined text-primary" aria-hidden="true">location_on</span>
                  {{ company()!.address }}, {{ company()!.city }}
                </li>
              </ul>
            }
            @case ('galerie') {
              <h2 class="panel-title">Galerie</h2>
              <p class="muted">Aucune photo n'a encore été déposée par cette entreprise.</p>
            }
            @case ('localisation') {
              <h2 class="panel-title">Localisation</h2>
              <p class="muted">{{ company()!.address }}, {{ company()!.city }}, {{ company()!.region }}.</p>
              <p class="muted">La carte interactive sera disponible une fois la couche cartographique branchée sur ce profil.</p>
            }
            @case ('documents') {
              <h2 class="panel-title">Documents légaux</h2>
              <p class="muted">Cette fiche n'a pas encore publié de documents téléchargeables.</p>
            }
            @case ('dirigeants') {
              <h2 class="panel-title">Dirigeants</h2>
              <p class="muted">Les dirigeants seront affichés dès que l'entreprise les aura déclarés sur la plateforme.</p>
            }
          }
        </section>
      </article>
    }
  `,
  styles: [`
    :host { display: block; }
    .container { max-width: 1100px; margin: 0 auto; padding: 32px 24px 64px; }
    .breadcrumbs {
      display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
      font-size: 12px; color: var(--color-on-secondary-container);
      text-transform: uppercase; letter-spacing: 0.06em;
      margin-bottom: 24px;
    }
    .breadcrumbs a:hover { color: var(--color-primary); }
    .breadcrumbs .current { color: var(--color-on-surface); font-weight: 600; }

    .head {
      background: var(--color-surface-container-lowest);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-card);
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      align-items: flex-start;
      margin-bottom: 32px;
    }
    @media (min-width: 768px) {
      .head { flex-direction: row; align-items: center; }
    }

    .logo {
      width: 84px; height: 84px;
      background: var(--color-surface-container-low);
      border-radius: var(--radius-xl);
      display: inline-flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .logo .material-symbols-outlined { color: var(--color-primary); font-size: 40px; }

    .head-info { flex: 1; min-width: 0; }
    .badges { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
    .title {
      font-family: var(--font-headline);
      font-size: 32px;
      font-weight: 800;
      color: var(--color-on-surface);
      margin: 0 0 6px;
    }
    .city {
      display: inline-flex; align-items: center; gap: 6px;
      color: var(--color-on-secondary-container);
      font-size: 14px;
    }
    .city .material-symbols-outlined { font-size: 18px; }

    .actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .actions .btn { padding: 12px 20px; }

    .panel {
      background: var(--color-surface-container-lowest);
      border-radius: var(--radius-2xl);
      padding: 32px;
      margin-top: 16px;
      box-shadow: var(--shadow-card);
      animation: ac-fade-in 0.25s ease;
    }
    .panel-title {
      font-family: var(--font-headline);
      font-size: 22px;
      font-weight: 700;
      color: var(--color-on-surface);
      margin: 0 0 16px;
    }
    .lead {
      font-size: 16px;
      line-height: 1.7;
      color: var(--color-on-surface-variant);
      max-width: 760px;
      margin-bottom: 24px;
    }
    .kv { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .kv dt {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-outline);
      margin-bottom: 4px;
    }
    .kv dd {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-on-surface);
      margin: 0;
    }

    .contact-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
    .contact-list li { display: flex; align-items: center; gap: 12px; font-size: 14px; }
    .contact-list a { color: var(--color-primary); font-weight: 600; text-decoration: none; }
    .contact-list a:hover { text-decoration: underline; }

    .muted { color: var(--color-on-surface-variant); font-size: 14px; line-height: 1.6; }

    @keyframes ac-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  `],
})
export class FicheEntrepriseComponent {
  protected readonly FR = FR;
  private readonly companyService = inject(MockCompanyService);
  private readonly route          = inject(ActivatedRoute);

  protected readonly tabs: TabDescriptor[] = [
    { id: 'apropos',     label: 'À propos',    icon: 'description' },
    { id: 'contacts',    label: 'Contacts',    icon: 'contact_page' },
    { id: 'galerie',     label: 'Galerie',     icon: 'photo_library' },
    { id: 'localisation',label: 'Localisation',icon: 'location_on' },
    { id: 'documents',   label: 'Documents',   icon: 'folder' },
    { id: 'dirigeants',  label: 'Dirigeants',  icon: 'badge' },
  ];
  protected readonly activeTab = signal<FicheTab>('apropos');

  protected readonly company = toSignal(
    this.route.params.pipe(
      switchMap((p) => this.companyService.getBySlug(p['id'] ?? p['slug'] ?? ''))
    ),
    { initialValue: undefined }
  );

  protected readonly loading = computed(() => this.company() === undefined);

  protected setTab(id: string): void {
    this.activeTab.set(id as FicheTab);
  }
}

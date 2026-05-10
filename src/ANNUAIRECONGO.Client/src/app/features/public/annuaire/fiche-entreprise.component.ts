import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of, catchError, map, tap } from 'rxjs';
import { Params } from '@angular/router';
import { TabsComponent, TabDescriptor } from '@shared/ui/tabs/tabs.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { CompanyService } from '@core/services/company.service';
import { Company, CompanyContact, CompanyDocument, ContactType, DocumentType as DocTypeEnum } from '@core/models/company.model';
import { FR } from '@core/i18n/fr.constants';

type FicheTab = 'apropos' | 'contacts' | 'galerie' | 'localisation' | 'documents' | 'dirigeants';

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
    } @else if (!fiche()) {
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
          <span class="current" aria-current="page">{{ fiche()!.name }}</span>
        </nav>

        <!-- Header -->
        <header class="head">
          <div class="logo" aria-hidden="true">
            @if (fiche()!.logoUrl) {
              <img [src]="fiche()!.logoUrl" [alt]="fiche()!.name" class="logo-img" />
            } @else {
              <span class="material-symbols-outlined">{{ fiche()!.sectorIcon }}</span>
            }
          </div>
          <div class="head-info">
            <div class="badges">
              @if (fiche()!.isVerified) { <span class="badge badge-verified">Vérifiée RCCM</span> }
              @if (fiche()!.isPremium)  { <span class="badge badge-premium">Premium</span> }
              <span class="badge badge-free">{{ fiche()!.sectorLabel }}</span>
            </div>
            <h1 class="title">{{ fiche()!.name }}</h1>
            <p class="city">
              <span class="material-symbols-outlined" aria-hidden="true">location_on</span>
              {{ fiche()!.city }}{{ fiche()!.region ? ', ' + fiche()!.region : '' }}
            </p>
          </div>
          <div class="actions">
            @if (fiche()!.phone) {
              <a [href]="'tel:' + fiche()!.phone" class="btn btn-outline" (click)="trackClick(0)">
                <span class="material-symbols-outlined" aria-hidden="true">call</span>
                Appeler
              </a>
            }
            @if (fiche()!.email) {
              <a [href]="'mailto:' + fiche()!.email" class="btn btn-primary" (click)="trackClick(1)">
                <span class="material-symbols-outlined" aria-hidden="true">mail</span>
                Contacter
              </a>
            }
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
              <h2 class="panel-title">À propos de {{ fiche()!.name }}</h2>
              <p class="lead">{{ fiche()!.description }}</p>
              <dl class="kv">
                <div><dt>Année de création</dt><dd>{{ fiche()!.yearFounded || 'N/A' }}</dd></div>
                <div><dt>Numéro RCCM</dt><dd>{{ fiche()!.rccm || 'N/A' }}</dd></div>
                <div><dt>NIU</dt><dd>{{ fiche()!.niu || 'N/A' }}</dd></div>
                <div><dt>Secteur</dt><dd>{{ fiche()!.sectorLabel }}</dd></div>
              </dl>
            }
            @case ('contacts') {
              <h2 class="panel-title">Contacts</h2>
              <ul class="contact-list">
                @for (c of fiche()!.allContacts; track c.id) {
                  <li>
                    <span class="material-symbols-outlined text-primary" aria-hidden="true">{{ getContactIcon(c.type) }}</span>
                    @if (c.type === 0) {
                      <a [href]="'tel:' + c.value" (click)="trackClick(0)">{{ c.value }}</a>
                    } @else if (c.type === 1) {
                      <a [href]="'mailto:' + c.value" (click)="trackClick(1)">{{ c.value }}</a>
                    } @else {
                      <a [href]="c.value" target="_blank" rel="noopener" (click)="trackClick(c.type)">{{ c.value }}</a>
                    }
                  </li>
                } @empty {
                  <p class="muted">Aucun contact public renseigné.</p>
                }
                <li>
                  <span class="material-symbols-outlined text-primary" aria-hidden="true">location_on</span>
                  {{ fiche()!.address }}, {{ fiche()!.city }}
                </li>
              </ul>
            }
            @case ('galerie') {
              <h2 class="panel-title">Galerie</h2>
              <div class="gallery-grid">
                @for (img of fiche()!.gallery; track img.id) {
                  <div class="gallery-item">
                    <img [src]="img.imageUrl" [alt]="img.caption || fiche()!.name" loading="lazy" />
                    @if (img.caption) { <p class="caption">{{ img.caption }}</p> }
                  </div>
                } @empty {
                  <p class="muted">Aucune photo n'a encore été déposée par cette entreprise.</p>
                }
              </div>
            }
            @case ('localisation') {
              <h2 class="panel-title">Localisation</h2>
              <p class="muted">{{ fiche()!.address }}, {{ fiche()!.city }}, {{ fiche()!.region }}.</p>
              <p class="muted">La carte interactive sera bientôt disponible.</p>
            }
            @case ('documents') {
              <h2 class="panel-title">Documents légaux</h2>
              <ul class="doc-list">
                @for (doc of fiche()!.publicDocuments; track doc.id) {
                  <li>
                    <span class="material-symbols-outlined" aria-hidden="true">description</span>
                    <div class="doc-info">
                      <strong>{{ getDocLabel(doc.docType) }}</strong>
                      <p>{{ doc.description || 'Document sans description' }}</p>
                    </div>
                    <a [href]="doc.fileUrl" target="_blank" class="btn btn-ghost btn-sm">Ouvrir</a>
                  </li>
                } @empty {
                  <p class="muted">Cette fiche n'a pas encore publié de documents téléchargeables.</p>
                }
              </ul>
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
      overflow: hidden;
    }
    .logo .material-symbols-outlined { color: var(--color-primary); font-size: 40px; }
    .logo-img { width: 100%; height: 100%; object-fit: cover; }

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

    .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
    .gallery-item img { width: 100%; height: 180px; object-fit: cover; border-radius: var(--radius-lg); }
    .gallery-item .caption { font-size: 12px; color: var(--color-outline); margin-top: 4px; }

    .doc-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
    .doc-list li {
      display: flex; align-items: center; gap: 16px;
      background: var(--color-surface-container-low);
      padding: 12px 16px;
      border-radius: var(--radius-lg);
    }
    .doc-info { flex: 1; }
    .doc-info strong { font-size: 14px; display: block; color: var(--color-on-surface); }
    .doc-info p { font-size: 12px; color: var(--color-on-surface-variant); margin: 2px 0 0; }

    .muted { color: var(--color-on-surface-variant); font-size: 14px; line-height: 1.6; }

    @keyframes ac-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  `],
})
export class FicheEntrepriseComponent {
  protected readonly FR = FR;
  private readonly companyService = inject(CompanyService);
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
  protected readonly loading = signal(true);
  private readonly companyData = toSignal<Company | null>(
    this.route.params.pipe(
      tap(() => this.loading.set(true)),
      switchMap((p: Params) => this.companyService.getCompanyBySlug(p['id'] ?? p['slug'] ?? '').pipe(
        map((res: Company) => { this.loading.set(false); return res; }),
        catchError(() => { this.loading.set(false); return of(null); })
      ))
    ),
    { initialValue: null }
  );

  protected readonly fiche = computed(() => {
    const c = this.companyData();
    if (!c) return null;

    return {
      id: c.id,
      name: c.name,
      description: c.description || 'Aucune description.',
      logoUrl: c.logoUrl,
      isVerified: c.isVerified,
      isPremium: c.isPremium,
      sectorLabel: c.sectors?.[0]?.name || 'N/A',
      sectorIcon: c.sectors?.[0]?.iconUrl || 'business',
      city: c.cityName || 'N/A',
      region: c.regionName || '',
      phone: c.contacts?.find((x: CompanyContact) => x.type === ContactType.Phone)?.value,
      email: c.contacts?.find((x: CompanyContact) => x.type === ContactType.Email)?.value,
      website: c.contacts?.find((x: CompanyContact) => x.type === ContactType.Website)?.value,
      allContacts: c.contacts || [],
      address: c.address || 'N/A',
      yearFounded: c.yearFounded,
      rccm: c.rccm,
      niu: c.niu,
      gallery: c.images || [],
      publicDocuments: c.documents?.filter((d: CompanyDocument) => d.isPublic) || [],
    };
  });

  protected setTab(id: string): void {
    this.activeTab.set(id as FicheTab);
  }

  protected getContactIcon(type: number): string {
    switch(type) {
      case ContactType.Phone: return 'call';
      case ContactType.Email: return 'mail';
      case ContactType.Website: return 'language';
      case ContactType.WhatsApp: return 'chat';
      default: return 'link';
    }
  }

  protected getDocLabel(type: number): string {
    switch(type) {
      case DocTypeEnum.RCCM: return 'RCCM';
      case DocTypeEnum.NIF: return 'NIU / NIF';
      case DocTypeEnum.Patent: return 'Brevet';
      default: return 'Document';
    }
  }

  protected trackClick(type: number): void {
    const id = this.fiche()?.id;
    if (id) {
      this.companyService.trackContactClick(id, type).subscribe();
    }
  }
}

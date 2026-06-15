import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild, AfterViewInit, computed, inject, signal, effect, Injector } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of, catchError, map, tap } from 'rxjs';
import { Params } from '@angular/router';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { CompanyService } from '@core/services/company.service';
import { AuthService } from '@core/services/auth.service';
import { UserSubscriptionService } from '@core/services/user-subscription.service';
import { BusinessOwnerService } from '@core/services/business-owner.service';
import { Company, CompanyContact, CompanyDocument, ContactType, DocumentType as DocTypeEnum } from '@core/models/company.model';
import { FR } from '@core/i18n/fr.constants';
import * as L from 'leaflet';
// Fix Leaflet marker icons
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Brazzaville': { lat: -4.2634, lng: 15.2429 },
  'Pointe-Noire': { lat: -4.7761, lng: 11.8636 },
  'Dolisie': { lat: -4.1990, lng: 12.6702 },
  'Oyo': { lat: -1.2500, lng: 15.7167 },
  'Ouesso': { lat: 1.6136, lng: 16.0517 },
  'Owando': { lat: -0.4819, lng: 15.8999 },
  'Impfondo': { lat: 1.6373, lng: 18.0667 },
  'Madingou': { lat: -4.1536, lng: 13.5500 },
};


@Component({
  selector: 'ac-fiche-entreprise',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    EmptyStateComponent,
    SkeletonComponent,
    FormsModule,
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
              @for (s of fiche()!.allSectors; track s.id) {
                <span class="badge badge-free">{{ s.name }}</span>
              }
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
          <div style="margin-top: 12px; text-align: right;">
            <button class="btn btn-ghost btn-sm" (click)="report()" style="color: var(--color-error); font-size: 12px;">
              <span class="material-symbols-outlined" style="font-size: 14px; margin-right: 4px;">flag</span>
              Signaler cette entreprise
            </button>
          </div>
        </header>

        <!-- Content Grid (Main + Sidebar) -->
        <div class="content-grid">
          <!-- Main Content Column -->
          <div class="main-column">
            
            <!-- À Propos Section -->
            <section class="section-card" aria-labelledby="sec-apropos">
              <h2 id="sec-apropos" class="panel-title">À propos de {{ fiche()!.name }}</h2>
              <p class="lead">{{ fiche()!.description }}</p>
              <dl class="kv">
                <div><dt>Année de création</dt><dd>{{ fiche()!.yearFounded || 'N/A' }}</dd></div>
                @if (canViewSensitiveData()) {
                  <div><dt>Numéro RCCM</dt><dd>{{ fiche()!.rccm || 'N/A' }}</dd></div>
                  <div><dt>NIU</dt><dd>{{ fiche()!.niu || 'N/A' }}</dd></div>
                } @else {
                  <div><dt>Numéro RCCM</dt><dd class="muted"><span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle;">lock</span> Masqué</dd></div>
                  <div><dt>NIU</dt><dd class="muted"><span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle;">lock</span> Masqué</dd></div>
                }
              </dl>

              @if (fiche()!.trustScore !== undefined && fiche()!.trustScore !== null) {
                <div class="trust-score-box">
                  <div class="trust-score-header">
                    <div class="trust-score-circle" [style.background]="'conic-gradient(var(--color-primary) ' + fiche()!.trustScore + '%, var(--color-surface-container-highest) 0)'">
                      <div class="trust-score-inner">{{ fiche()!.trustScore }}</div>
                    </div>
                    <div>
                      <h3 class="trust-score-title">
                        Score de Fiabilité Économique
                        <span class="material-symbols-outlined trust-score-icon">verified_user</span>
                      </h3>
                      <p class="trust-score-desc">Évaluation générée par IA basée sur la complétude administrative et opérationnelle.</p>
                    </div>
                  </div>
                  @if (fiche()!.trustScoreAnalysis) {
                    <div class="trust-score-body markdown-body">
                      @for (p of getTrustParagraphs(); track $index) {
                        <p>{{ p }}</p>
                      }
                    </div>
                  }
                </div>
              }
            </section>

            <!-- Équipe / Dirigeants -->
            <section class="section-card" aria-labelledby="sec-equipe">
              <h2 id="sec-equipe" class="panel-title">Équipe (Dirigeants)</h2>
              @if (canViewSensitiveData()) {
                <p class="muted">Les dirigeants seront affichés dès que l'entreprise les aura déclarés sur la plateforme.</p>
              } @else {
                <div class="doc-locked" style="margin-top: 16px;">
                  <span class="material-symbols-outlined doc-lock-icon" aria-hidden="true">lock</span>
                  <span class="doc-lock-label">
                    @if (!isAuthenticated()) {
                      <a routerLink="/auth/connexion" class="doc-lock-link">Connectez-vous</a> pour accéder
                    } @else {
                      <a routerLink="/espace/abonnement" class="doc-lock-link">Abonnez-vous</a> (plan payant requis)
                    }
                  </span>
                </div>
              }
            </section>

            <!-- Services & Produits -->
            <section class="section-card" aria-labelledby="sec-services">
              <h2 id="sec-services" class="panel-title">Services & Produits</h2>
              @if (fiche()!.services.length > 0) {
                <div class="services-grid">
                  @for (s of fiche()!.services; track s.id) {
                    <div class="service-card">
                      <span class="material-symbols-outlined text-primary" aria-hidden="true">check_circle</span>
                      <div class="service-content">
                        <h3 class="service-name">{{ s.title }}</h3>
                        <p class="service-desc">{{ s.description }}</p>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <p class="muted">Aucun service spécifique n'a été listé pour le moment.</p>
              }
            </section>

            <!-- Galerie -->
            @if (fiche()!.gallery.length > 0) {
              <section class="section-card" aria-labelledby="sec-galerie">
                <h2 id="sec-galerie" class="panel-title">Galerie</h2>
                <div class="gallery-grid">
                  @for (img of fiche()!.gallery; track img.id) {
                    <div class="gallery-item">
                      <img [src]="img.imageUrl" [alt]="img.caption || fiche()!.name" loading="lazy" />
                      @if (img.caption) { <p class="caption">{{ img.caption }}</p> }
                    </div>
                  }
                </div>
              </section>
            }

            <!-- Documents Légaux -->
            <section class="section-card" aria-labelledby="sec-docs">
              <h2 id="sec-docs" class="panel-title">Documents légaux</h2>
              @if (fiche()!.publicDocuments.length > 0) {
                <ul class="doc-list">
                  @for (doc of fiche()!.publicDocuments; track doc.id) {
                    <li>
                      <span class="material-symbols-outlined" aria-hidden="true">description</span>
                      <div class="doc-info">
                        <strong>{{ getDocLabel(doc.docType) }}</strong>
                        <p>{{ doc.description || 'Document sans description' }}</p>
                      </div>
                      @if (doc.fileUrl && canViewSensitiveData()) {
                        <a [href]="doc.fileUrl" target="_blank" class="btn btn-ghost btn-sm">Ouvrir</a>
                      } @else {
                        <div class="doc-locked">
                          <span class="material-symbols-outlined doc-lock-icon" aria-hidden="true">lock</span>
                          <span class="doc-lock-label">
                            @if (!isAuthenticated()) {
                              <a routerLink="/auth/connexion" class="doc-lock-link">Connectez-vous</a> pour accéder
                            } @else {
                              <a routerLink="/espace/abonnement" class="doc-lock-link">Abonnez-vous</a> (plan payant requis)
                            }
                          </span>
                        </div>
                      }
                    </li>
                  }
                </ul>
              } @else {
                <p class="muted">Cette fiche n'a pas encore publié de documents téléchargeables.</p>
              }
            </section>
          </div>

          <!-- Sidebar Column -->
          <aside class="sidebar-column">
            
            <!-- Coordonnées -->
            <div class="sidebar-card">
              <h2 class="sidebar-title">Coordonnées</h2>
              <ul class="contact-list">
                <li>
                  <div class="contact-icon-wrap"><span class="material-symbols-outlined text-primary" aria-hidden="true">location_on</span></div>
                  <div>
                    <span class="contact-label">Adresse</span>
                    <span class="contact-value">{{ fiche()!.address }}, {{ fiche()!.city }}</span>
                  </div>
                </li>
                @for (c of directContacts(); track c.id) {
                  <li>
                    <div class="contact-icon-wrap"><span class="material-symbols-outlined text-primary" aria-hidden="true">{{ getContactIcon(c.type) }}</span></div>
                    <div>
                      <span class="contact-label">{{ getContactIcon(c.type) === 'call' ? 'Téléphone' : (getContactIcon(c.type) === 'mail' ? 'Email' : 'Contact') }}</span>
                      @if (c.type === 0) {
                        <a [href]="'tel:' + c.value" class="contact-value link" (click)="trackClick(0)">{{ c.value }}</a>
                      } @else if (c.type === 1) {
                        <a [href]="'mailto:' + c.value" class="contact-value link" (click)="trackClick(1)">{{ c.value }}</a>
                      } @else {
                        <a [href]="c.value" target="_blank" rel="noopener" class="contact-value link" (click)="trackClick(c.type)">{{ c.value }}</a>
                      }
                    </div>
                  </li>
                }
                @if (fiche()!.website) {
                  <li>
                    <div class="contact-icon-wrap"><span class="material-symbols-outlined text-primary" aria-hidden="true">language</span></div>
                    <div>
                      <span class="contact-label">Site web</span>
                      <a [href]="fiche()!.website" target="_blank" rel="noopener" class="contact-value link">{{ fiche()!.website }}</a>
                    </div>
                  </li>
                }
              </ul>
              
              <!-- Map inserted directly below contacts in the same card -->
              <div class="map-wrap sidebar-map mt-6">
                <div #mapContainer class="map-el" id="fiche-map"></div>
              </div>
            </div>

            <!-- Réseaux Sociaux -->
            @if (socialContacts().length > 0) {
              <div class="sidebar-card">
                <h2 class="sidebar-title">Réseaux sociaux</h2>
                <div class="socials-grid">
                  @for (c of socialContacts(); track c.id) {
                    <a [href]="c.value" target="_blank" rel="noopener" class="social-btn" [attr.aria-label]="c.type" (click)="trackClick(c.type)">
                      <span class="material-symbols-outlined" aria-hidden="true">link</span>
                      <!-- We use a generic link icon as material symbols doesn't have brand icons. 
                           Ideally we'd use SVG icons for brands, but we stick to the existing system. -->
                    </a>
                  }
                </div>
              </div>
            }

            <!-- Secteur -->
            <div class="sidebar-card">
              <h2 class="sidebar-title">Secteur d'activité</h2>
              <div class="badges mt-2">
                @for (s of fiche()!.allSectors; track s.id) {
                  <span class="badge badge-premium" style="font-size: 11px; padding: 6px 12px;"><span class="material-symbols-outlined" style="font-size: 14px;">{{s.iconUrl || 'business'}}</span> {{ s.name }}</span>
                }
              </div>
            </div>

          </aside>
        </div>
      </article>

      <!-- Similar Companies Section -->
      @if (recommendations().length > 0) {
        <section class="container" style="margin-top: 48px; border-top: 1px solid var(--color-outline-variant); padding-top: 48px; padding-bottom: 24px;">
          <div class="rec-header">
            <span class="material-symbols-outlined sparkle-icon">sparkles</span>
            <div>
              <h2 class="rec-title">Entreprises similaires suggérées par l'IA ✨</h2>
              <p class="rec-subtitle">Découvrez d'autres entreprises du même secteur ou offrant des services complémentaires.</p>
            </div>
          </div>
          
          <div class="recommendations-grid">
            @for (rec of recommendations(); track rec.id) {
              <a [routerLink]="['/annuaire', rec.slug]" class="rec-card glass">
                <div class="rec-logo">
                  @if (rec.logoUrl) {
                    <img [src]="rec.logoUrl" [alt]="rec.name" />
                  } @else {
                    <span class="material-symbols-outlined">{{ rec.sectors.length > 0 ? rec.sectors[0].iconUrl || 'business' : 'business' }}</span>
                  }
                </div>
                <div class="rec-content">
                  <div class="rec-badges">
                    @if (rec.isVerified) { <span class="badge badge-verified badge-sm">Vérifiée</span> }
                    @if (rec.isPremium) { <span class="badge badge-premium badge-sm">Premium</span> }
                    <span class="badge badge-ai badge-sm">IA ✨</span>
                  </div>
                  <h3 class="rec-name">{{ rec.name }}</h3>
                  <p class="rec-city">
                    <span class="material-symbols-outlined" aria-hidden="true">location_on</span>
                    {{ rec.cityName || 'Congo' }}
                  </p>
                  <p class="rec-excerpt">{{ (rec.description || '').slice(0, 110) }}...</p>
                </div>
              </a>
            }
          </div>
        </section>
      }

      <!-- Report Modal -->
      @if (showReportModal()) {
        <div class="modal-scrim" (click)="closeReportModal()">
          <div class="modal-card glass" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-icon-wrap">
                <span class="material-symbols-outlined text-error">flag</span>
              </div>
              <div>
                <h3 class="modal-title">Signaler cette entreprise</h3>
                <p class="modal-subtitle">Aidez-nous à maintenir la qualité des informations.</p>
              </div>
              <button class="modal-close" (click)="closeReportModal()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="modal-body">
              <label for="report-reason" class="modal-label">Motif du signalement</label>
              <textarea
                id="report-reason"
                class="modal-textarea"
                placeholder="Ex: Informations obsolètes, doublon, contenu inapproprié..."
                [(ngModel)]="reportReason"
                [disabled]="isReporting()"
              ></textarea>
              <p class="modal-hint">Votre signalement sera examiné manuellement par notre équipe de modération.</p>
            </div>

            <div class="modal-footer">
              <button class="btn btn-ghost" (click)="closeReportModal()" [disabled]="isReporting()">Annuler</button>
              <button
                class="btn btn-primary"
                [disabled]="!reportReason().trim() || isReporting()"
                (click)="submitReport()"
              >
                @if (isReporting()) {
                  <span class="material-symbols-outlined animate-spin">sync</span>
                  Envoi...
                } @else {
                  Confirmer le signalement
                }
              </button>
            </div>
          </div>
        </div>
      }
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

    /* Layout Grid */
    .content-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 32px;
      margin-top: 32px;
      align-items: start;
    }
    @media (min-width: 1024px) {
      .content-grid { grid-template-columns: 2fr 1fr; }
    }

    /* Main Column Sections */
    .section-card {
      background: var(--color-surface-container-lowest);
      border-radius: var(--radius-2xl);
      padding: 32px;
      box-shadow: var(--shadow-card);
      margin-bottom: 24px;
      animation: ac-fade-in 0.4s ease forwards;
    }
    .panel-title {
      font-family: var(--font-headline);
      font-size: 22px;
      font-weight: 800;
      color: var(--color-on-surface);
      margin: 0 0 24px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--color-outline-variant);
    }
    
    /* Sidebar */
    .sidebar-card {
      background: var(--color-surface-container-lowest);
      border-radius: var(--radius-xl);
      padding: 24px;
      box-shadow: var(--shadow-card);
      margin-bottom: 24px;
    }
    .sidebar-title {
      font-family: var(--font-headline);
      font-size: 18px;
      font-weight: 700;
      color: var(--color-on-surface);
      margin: 0 0 16px;
    }

    /* Trust Score Box */
    .trust-score-box {
      margin-top: 32px;
      padding: 24px;
      background: var(--color-surface-container-low);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-xl);
    }
    .trust-score-header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
    .trust-score-circle {
      width: 64px; height: 64px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .trust-score-inner {
      width: 52px; height: 52px; background: var(--color-surface-container-low);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 20px; font-weight: 900; color: var(--color-on-surface);
    }
    .trust-score-title {
      font-size: 18px; font-weight: 800; font-family: var(--font-headline);
      margin: 0 0 4px; display: flex; align-items: center; gap: 6px;
    }
    .trust-score-icon { color: var(--color-primary); font-size: 18px; }
    .trust-score-desc { font-size: 13px; color: var(--color-secondary); margin: 0; }
    .trust-score-body { font-size: 14px; line-height: 1.6; color: var(--color-on-surface-variant); padding-top: 16px; border-top: 1px solid var(--color-outline-variant); }
    .trust-score-body p { margin-bottom: 12px; }
    .trust-score-body p:last-child { margin-bottom: 0; }

    .lead {
      font-size: 16px;
      line-height: 1.7;
      color: var(--color-on-surface-variant);
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

    .contact-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 16px; }
    .contact-list li { display: flex; align-items: flex-start; gap: 12px; font-size: 14px; }
    .contact-icon-wrap { width: 32px; height: 32px; border-radius: 50%; background: var(--color-surface-container); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .contact-icon-wrap .material-symbols-outlined { font-size: 18px; }
    .contact-label { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-outline); letter-spacing: 0.05em; margin-bottom: 2px; }
    .contact-value { color: var(--color-on-surface); font-weight: 600; word-break: break-all; }
    a.contact-value.link { color: var(--color-primary); text-decoration: none; }
    a.contact-value.link:hover { text-decoration: underline; }

    .socials-grid { display: flex; gap: 8px; flex-wrap: wrap; }
    .social-btn {
      width: 40px; height: 40px; border-radius: 50%;
      background: var(--color-surface-container-low);
      color: var(--color-on-surface-variant);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      border: 1px solid var(--color-outline-variant);
    }
    .social-btn:hover { background: var(--color-primary); color: #fff; border-color: var(--color-primary); transform: translateY(-2px); }


    .services-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
    @media (min-width: 640px) { .services-grid { grid-template-columns: repeat(2, 1fr); } }
    .service-card { display: flex; gap: 16px; padding: 20px; background: var(--color-surface-container-low); border-radius: var(--radius-xl); border: 1px solid var(--color-outline-variant); }
    .service-name { font-size: 16px; font-weight: 700; color: var(--color-on-surface); margin: 0 0 4px; }
    .service-desc { font-size: 14px; color: var(--color-on-surface-variant); line-height: 1.5; margin: 0; }

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

    .doc-locked {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: var(--color-surface-container);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-outline-variant);
      white-space: nowrap;
    }
    .doc-lock-icon { font-size: 16px; color: var(--color-outline); flex-shrink: 0; }
    .doc-lock-label { font-size: 12px; color: var(--color-on-surface-variant); }
    .doc-lock-link { color: var(--color-primary); font-weight: 600; text-decoration: none; }
    .doc-lock-link:hover { text-decoration: underline; }

    .muted { color: var(--color-on-surface-variant); font-size: 14px; line-height: 1.6; margin: 0; }
    .mt-6 { margin-top: 24px; }
    .mt-2 { margin-top: 8px; }

    .map-wrap {
      height: 260px; /* Shorter for sidebar */
      border-radius: var(--radius-xl);
      overflow: hidden;
      border: 1px solid var(--color-outline-variant);
      background: var(--color-surface-container-low);
    }
    .map-el { width: 100%; height: 100%; z-index: 1; }

    @keyframes ac-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

    /* Recommendations Section Styles */
    .rec-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 28px;
    }
    .sparkle-icon {
      color: var(--color-primary);
      font-size: 32px;
      animation: rec-pulse 2s infinite alternate;
    }
    .rec-title {
      font-family: var(--font-headline);
      font-size: 24px;
      font-weight: 800;
      color: var(--color-on-surface);
      margin: 0;
    }
    .rec-subtitle {
      font-size: 14px;
      color: var(--color-on-surface-variant);
      margin: 4px 0 0;
    }
    .recommendations-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }
    @media (min-width: 640px) {
      .recommendations-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (min-width: 1024px) {
      .recommendations-grid { grid-template-columns: repeat(4, 1fr); }
    }
    .rec-card {
      display: flex;
      flex-direction: column;
      background: var(--color-surface-container-lowest);
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-xl);
      padding: 20px;
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      height: 100%;
    }
    .rec-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
      background: linear-gradient(var(--color-surface-container-lowest), var(--color-surface-container-lowest)) padding-box,
                  linear-gradient(135deg, var(--color-primary), #a855f7) border-box;
      border-color: transparent;
    }
    .rec-logo {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: var(--color-surface-container-low);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      overflow: hidden;
    }
    .rec-logo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .rec-logo .material-symbols-outlined {
      color: var(--color-primary);
      font-size: 24px;
    }
    .rec-content {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    .rec-badges {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }
    .badge-sm {
      padding: 2px 6px !important;
      font-size: 10px !important;
    }
    .badge-ai {
      background: rgba(99, 102, 241, 0.15) !important;
      color: #6366f1 !important;
      border: 1px solid rgba(99, 102, 241, 0.3) !important;
    }
    .rec-name {
      font-size: 16px;
      font-weight: 700;
      color: var(--color-on-surface);
      margin: 0 0 6px;
    }
    .rec-city {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--color-on-surface-variant);
      font-size: 12px;
      margin: 0 0 10px;
    }
    .rec-city .material-symbols-outlined {
      font-size: 14px;
    }
    .rec-excerpt {
      font-size: 13px;
      color: var(--color-on-surface-variant);
      line-height: 1.5;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    @keyframes rec-pulse {
      from { transform: scale(1); opacity: 0.8; }
      to { transform: scale(1.1); opacity: 1; }
    }

    /* Modal Styles */
    .modal-scrim {
      position: fixed; inset: 0; z-index: 100;
      background: rgba(25, 28, 30, 0.6);
      backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      animation: ac-fade-in 0.2s ease-out;
    }
    .modal-card {
      width: 100%; max-width: 500px;
      background: var(--color-surface-container-lowest);
      border-radius: var(--radius-2xl);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
      overflow: hidden;
    }
    .modal-header {
      padding: 24px; display: flex; align-items: flex-start; gap: 16px;
      border-bottom: 1px solid var(--color-outline-variant);
    }
    .modal-icon-wrap {
      width: 48px; height: 48px; border-radius: 12px;
      background: var(--color-error-container);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .modal-title { font-family: var(--font-headline); font-size: 20px; font-weight: 700; margin: 0; }
    .modal-subtitle { font-size: 13px; color: var(--color-on-surface-variant); margin: 4px 0 0; }
    .modal-close {
      margin-left: auto; border: none; background: transparent; cursor: pointer;
      color: var(--color-outline); border-radius: 8px; width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
    }
    .modal-close:hover { background: var(--color-surface-container-low); }

    .modal-body { padding: 24px; }
    .modal-label { display: block; font-size: 13px; font-weight: 700; margin-bottom: 8px; color: var(--color-on-surface); }
    .modal-textarea {
      width: 100%; height: 120px; padding: 16px;
      border-radius: var(--radius-lg); border: 1px solid var(--color-outline-variant);
      background: var(--color-surface-container-low);
      font-size: 14px; line-height: 1.5; resize: none;
      transition: border-color 0.2s, ring 0.2s;
    }
    .modal-textarea:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 4px var(--color-primary-container); }
    .modal-hint { font-size: 12px; color: var(--color-outline); margin-top: 12px; }

    .modal-footer {
      padding: 16px 24px; background: var(--color-surface-container-low);
      display: flex; justify-content: flex-end; gap: 12px;
      border-top: 1px solid var(--color-outline-variant);
    }
    .animate-spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `],
})
export class FicheEntrepriseComponent implements AfterViewInit, OnDestroy {
  protected readonly FR = FR;
  private readonly companyService = inject(CompanyService);
  private readonly auth           = inject(AuthService);
  private readonly route  = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);
  private readonly metaService  = inject(Meta);
  private readonly userSubService = inject(UserSubscriptionService);

  /** Exposed to template — drives the locked-state CTA copy. */
  protected readonly isAuthenticated = this.auth.isAuthenticated;
  private readonly injector = inject(Injector);

  protected readonly showReportModal = signal(false);
  protected readonly reportReason = signal('');
  protected readonly isReporting = signal(false);
  
  protected readonly hasPaidSubscription = signal(false);
  
  protected readonly canViewSensitiveData = computed(() => {
    const user = this.auth.currentUser();
    const f = this.fiche();
    if (!user || !f) return false;
    if (this.auth.isAdmin()) return true;
    if (f.ownerId === user.id) return true;
    return this.hasPaidSubscription();
  });

  report() {
    if (!this.auth.isAuthenticated()) {
      // Redirect unauthenticated users to login, preserving the current URL as returnUrl
      this.router.navigate(['/auth/connexion'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }
    this.reportReason.set('');
    this.showReportModal.set(true);
  }

  closeReportModal() {
    if (!this.isReporting()) {
      this.showReportModal.set(false);
    }
  }

  submitReport() {
    const reason = this.reportReason().trim();
    if (!reason) return;

    const id = this.fiche()?.id;
    if (!id) return;

    this.isReporting.set(true);
    this.companyService.reportCompany(id, reason).subscribe({
      next: () => {
        this.isReporting.set(false);
        this.showReportModal.set(false);
        // We could use a toast service here, but for now alert is okay since it's a modal context
        window.alert('Merci. Votre signalement a bien été pris en compte par nos équipes.');
      },
      error: () => {
        this.isReporting.set(false);
        window.alert('Une erreur est survenue lors du signalement.');
      }
    });
  }

  @ViewChild('mapContainer') private mapEl?: ElementRef<HTMLElement>;
  private map?: L.Map;
  private marker?: L.Marker;

  protected readonly socialContacts = computed(() => {
    // ContactType: Phone=0, Email=1, WhatsApp=2, Facebook=3, LinkedIn=4, Instagram=5, Twitter=6
    // The API may also return string names due to JsonStringEnumConverter — handle both
    return this.fiche()?.allContacts.filter(c => {
      const t = c.type as unknown;
      return t === ContactType.Facebook || t === ContactType.LinkedIn || t === ContactType.Instagram || t === ContactType.Twitter
          || t === 'Facebook' || t === 'LinkedIn' || t === 'Instagram' || t === 'Twitter';
    }) || [];
  });

  protected readonly directContacts = computed(() => {
    return this.fiche()?.allContacts.filter(c => {
      const t = c.type as unknown;
      return t === ContactType.Phone || t === ContactType.Email || t === ContactType.WhatsApp
          || t === 'Phone' || t === 'Email' || t === 'WhatsApp';
    }) || [];
  });
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

  protected readonly recommendations = signal<Company[]>([]);

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user && !this.auth.isAdmin()) {
        if (this.auth.isRegularUser()) {
          this.userSubService.getMySubscription().pipe(
            catchError(() => of(null))
          ).subscribe(sub => {
            if (sub && sub.status === 'Active' && (sub.planPrice > 0 || sub.planName !== 'Free')) {
              this.hasPaidSubscription.set(true);
            } else {
              this.hasPaidSubscription.set(false);
            }
          });
        } else {
          const boService = this.injector.get(BusinessOwnerService);
          boService.getMyCompanies().pipe(
            catchError(() => of([]))
          ).subscribe(companies => {
            const hasPremium = companies.some(c => c.isPremium);
            this.hasPaidSubscription.set(hasPremium);
          });
        }
      } else {
        this.hasPaidSubscription.set(false);
      }
    }, { allowSignalWrites: true });

    effect(() => {
      const f = this.fiche();
      if (f) {
        const title = `${f.name} - ${f.sectorLabel} à ${f.city} | Annuaire Congo`;
        const desc = `${f.name} à ${f.city} (${f.region}). ${f.description.slice(0, 150)}... Retrouvez les contacts, services et documents officiels sur Annuaire Congo.`;

        this.titleService.setTitle(title);
        this.metaService.updateTag({ name: 'description', content: desc });
        this.metaService.updateTag({ property: 'og:title', content: title });
        this.metaService.updateTag({ property: 'og:description', content: desc });
        if (f.logoUrl) {
          this.metaService.updateTag({ property: 'og:image', content: f.logoUrl });
        }

        // Load similar company recommendations dynamically
        this.companyService.getRecommendations(f.id).subscribe({
          next: (recs) => this.recommendations.set(recs),
          error: () => this.recommendations.set([])
        });
      } else {
        this.recommendations.set([]);
      }
    }, { allowSignalWrites: true });
  }

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
      phone: c.contacts?.find((x: CompanyContact) => x.type === ContactType.Phone || (x.type as any) === 'Phone')?.value,
      email: c.contacts?.find((x: CompanyContact) => x.type === ContactType.Email || (x.type as any) === 'Email')?.value,
      website: c.websiteUrl,
      allContacts: c.contacts || [],
      address: c.address || 'N/A',
      yearFounded: c.yearFounded,
      ownerId: c.ownerId,
      rccm: c.rccm,
      niu: c.niu,
      gallery: c.images || [],
      publicDocuments: c.documents?.filter((d: CompanyDocument) => d.isPublic) || [],
      services: c.services || [],
      allSectors: c.sectors || [],
      lat: c.latitude,
      lng: c.longitude,
      trustScore: c.trustScore,
      trustScoreAnalysis: c.trustScoreAnalysis
    };
  });

  protected getTrustParagraphs(): string[] {
    const raw = this.fiche()?.trustScoreAnalysis;
    if (!raw) return [];
    return raw.split('\n').map(p => p.trim()).filter(p => p.length > 0);
  }



  protected getContactIcon(type: number | string): string {
    const t = typeof type === 'string' ? type : (ContactType as any)[type];
    switch (t) {
      case 'Phone': return 'call';
      case 'Email': return 'mail';
      case 'WhatsApp': return 'chat';
      case 'Facebook': return 'facebook';
      case 'LinkedIn': return 'share';
      case 'Instagram': return 'photo_camera';
      case 'Twitter': return 'alternate_email';
      default: return 'link';
    }
  }

  protected getDocLabel(type: number | string): string {
    const t = typeof type === 'string' ? type : (DocTypeEnum as any)[type];
    switch (t) {
      case 'RCCM': return 'RCCM';
      case 'NIF': return 'NIU / NIF';
      case 'Patent': return 'Brevet';
      default: return 'Document';
    }
  }

  protected trackClick(type: number | string): void {
    const id = this.fiche()?.id;
    if (id) {
      // Ensure we send a number if it's a string from the API
      const typeNum = typeof type === 'number' ? type : (ContactType as any)[type];
      this.companyService.trackContactClick(id, typeNum).subscribe();
    }
  }

  ngAfterViewInit(): void {
    // The map is now always in the sidebar, so we initialize it as soon as we have data
    effect(() => {
      if (this.fiche()) {
        setTimeout(() => this.initMap(), 100);
      }
    }, { injector: this.injector });
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private initMap(): void {
    if (!this.mapEl || this.map) return;

    const f = this.fiche();
    if (!f) return;

    let lat = f.lat;
    let lng = f.lng;

    // Fallback to city coords if company has no precise coords
    if (!lat || !lng) {
      const city = CITY_COORDS[f.city];
      if (city) {
        lat = city.lat;
        lng = city.lng;
      } else {
        // Default to Congo center
        lat = -1.5;
        lng = 15.0;
      }
    }

    this.map = L.map(this.mapEl.nativeElement, {
      center: [lat, lng],
      zoom: 14,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(this.map);

    this.marker = L.marker([lat, lng]).addTo(this.map);
    this.marker.bindPopup(`<strong>${f.name}</strong><br>${f.address}`).openPopup();
  }
}

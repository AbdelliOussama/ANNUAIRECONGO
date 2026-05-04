import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild, AfterViewInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MockCompanyService } from '@core/services/mock/mock-company.service';
import { MOCK_COMPANIES } from '@core/services/mock/mock-companies.data';
import { FR } from '@core/i18n/fr.constants';
import * as L from 'leaflet';

interface CityPin {
  city: string;
  region: string;
  count: number;
  lat: number;
  lng: number;
}

// Approx coordinates for the cities our seed data references.
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Brazzaville':  { lat: -4.2634,  lng: 15.2429 },
  'Pointe-Noire': { lat: -4.7761,  lng: 11.8636 },
  'Dolisie':      { lat: -4.1990,  lng: 12.6702 },
  'Oyo':          { lat: -1.2500,  lng: 15.7167 },
  'Ouesso':       { lat:  1.6136,  lng: 16.0517 },
};

/**
 * /cartographie — interactive map of the directory.
 *
 * Uses Leaflet with OpenStreetMap tiles. Each city with at least one
 * registered company is shown as a circular marker whose radius scales
 * with the number of companies. Clicking a marker navigates to
 * /annuaire?region=<region>&city=<city>.
 *
 * Audit M3 — restored Leaflet map (the previous implementation already
 * existed in regions.component but was rendered with the orange theme).
 */
@Component({
  selector: 'ac-cartographie',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div class="max-w-5xl mx-auto px-6 md:px-12 text-center">
        <p class="eyebrow mb-4">Cartographie Nationale</p>
        <h1 class="text-4xl md:text-6xl font-black font-headline tracking-tight mb-6">
          Visualisez l'écosystème<br />
          <em class="text-primary not-italic">économique du Congo-Brazzaville.</em>
        </h1>
        <p class="text-lg text-secondary leading-relaxed max-w-2xl mx-auto">
          Localisation géographique des entreprises inscrites par ville et par département.
          Cliquez sur un marqueur pour filtrer l'annuaire.
        </p>
      </div>
    </section>

    <section class="px-6 md:px-12 max-w-7xl mx-auto pb-16">
      <div class="map-card">
        <div class="map-toolbar">
          <div class="map-meta">
            <span class="badge badge-verified">{{ totalCompanies }} entreprises</span>
            <span class="text-secondary text-sm">{{ pins().length }} villes représentées</span>
          </div>
          <a routerLink="/annuaire" class="btn btn-outline btn-sm">
            <span class="material-symbols-outlined" aria-hidden="true">list</span>
            Voir la liste
          </a>
        </div>
        <div #map id="map" class="map" aria-label="Carte interactive des entreprises du Congo-Brazzaville"></div>
      </div>

      <!-- Legend -->
      <div class="legend">
        <p class="legend-title">Comment lire la carte</p>
        <ul>
          <li><span class="dot dot-sm"></span> Moins de 3 entreprises</li>
          <li><span class="dot dot-md"></span> 3 à 5 entreprises</li>
          <li><span class="dot dot-lg"></span> Plus de 5 entreprises</li>
        </ul>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .hero { padding: 96px 0 48px; }
    .map-card {
      background: var(--color-surface-container-lowest);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-editorial);
      overflow: hidden;
      border: 1px solid var(--color-outline-variant);
    }
    .map-toolbar {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; padding: 16px 20px;
      border-bottom: 1px solid var(--color-outline-variant);
    }
    .map-meta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .map { height: 520px; width: 100%; }
    @media (max-width: 640px) { .map { height: 400px; } }

    .legend {
      margin-top: 24px;
      padding: 20px 24px;
      background: var(--color-surface-container-low);
      border-radius: var(--radius-xl);
    }
    .legend-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--color-outline);
      margin-bottom: 12px;
    }
    .legend ul {
      list-style: none; padding: 0; margin: 0;
      display: flex; flex-wrap: wrap; gap: 24px;
      font-size: 14px; color: var(--color-on-surface);
    }
    .legend li { display: inline-flex; align-items: center; gap: 8px; }
    .dot {
      display: inline-block;
      border-radius: 50%;
      background: var(--color-primary);
    }
    .dot-sm { width: 10px; height: 10px; opacity: 0.6; }
    .dot-md { width: 14px; height: 14px; opacity: 0.8; }
    .dot-lg { width: 18px; height: 18px; }

    .text-secondary { color: var(--color-on-secondary-container); }
  `],
})
export class CartographieComponent implements AfterViewInit, OnDestroy {
  protected readonly FR = FR;
  protected readonly totalCompanies = MOCK_COMPANIES.length;

  @ViewChild('map') private mapEl?: ElementRef<HTMLElement>;
  private map?: L.Map;
  private layer?: L.LayerGroup;

  protected readonly pins = signal<CityPin[]>(this.aggregatePins());

  ngAfterViewInit(): void {
    if (!this.mapEl) return;

    this.map = L.map(this.mapEl.nativeElement, {
      center: [-1.5, 15.0],   // visual center of Congo-Brazzaville
      zoom: 5,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap',
    }).addTo(this.map);

    this.layer = L.layerGroup().addTo(this.map);
    this.renderPins();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private aggregatePins(): CityPin[] {
    const map = new Map<string, CityPin>();
    for (const c of MOCK_COMPANIES) {
      const coords = CITY_COORDS[c.city];
      if (!coords) continue;
      const existing = map.get(c.city);
      if (existing) {
        existing.count++;
      } else {
        map.set(c.city, { city: c.city, region: c.region, count: 1, ...coords });
      }
    }
    return Array.from(map.values());
  }

  private renderPins(): void {
    if (!this.map || !this.layer) return;
    this.layer.clearLayers();

    for (const p of this.pins()) {
      const radius = p.count <= 2 ? 8 : p.count <= 5 ? 12 : 18;
      const marker = L.circleMarker([p.lat, p.lng], {
        radius,
        color: '#004e34',
        fillColor: '#004e34',
        fillOpacity: 0.65,
        weight: 2,
      });

      marker.bindPopup(this.popupHtml(p), { className: 'ac-popup' });
      marker.addTo(this.layer);
    }
  }

  private popupHtml(p: CityPin): string {
    const queryParams = new URLSearchParams({ region: p.region, city: p.city }).toString();
    return `
      <div style="font-family: 'DM Sans', sans-serif; min-width: 180px;">
        <strong style="font-family:'DM Serif Display', serif; font-size:16px;">${p.city}</strong>
        <div style="font-size:12px; color:#515f74; margin-top:4px;">Département : ${p.region}</div>
        <div style="font-size:13px; margin:8px 0;">${p.count} entreprise${p.count > 1 ? 's' : ''} inscrite${p.count > 1 ? 's' : ''}</div>
        <a href="/annuaire?${queryParams}"
           style="display:inline-block; padding:6px 12px; background:#004e34; color:#fff; border-radius:8px; font-size:12px; text-decoration:none; font-weight:600;">
          Voir l'annuaire
        </a>
      </div>
    `;
  }
}

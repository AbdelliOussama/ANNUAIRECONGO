import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild, AfterViewInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CompanyService } from '@core/services/company.service';
import { Company, CompanyStatus } from '@core/models/company.model';
import { FR } from '@core/i18n/fr.constants';
import * as L from 'leaflet';
import { catchError, map, of } from 'rxjs';

interface CityPin {
  cityId: string;
  cityName: string;
  regionName: string;
  count: number;
  population: number;
  lat: number;
  lng: number;
}

// Approx coordinates and population (2026 estimates) for Congolese cities.
const CITY_COORDS: Record<string, { lat: number; lng: number; pop: number }> = {
  'Brazzaville':  { lat: -4.2634,  lng: 15.2429, pop: 2500000 },
  'Pointe-Noire': { lat: -4.7761,  lng: 11.8636, pop: 1300000 },
  'Dolisie':      { lat: -4.1990,  lng: 12.6702, pop: 110000, },
  'Nkayi':        { lat: -4.1856,  lng: 13.2856, pop: 100000, },
  'Oyo':          { lat: -1.2500,  lng: 15.7167, pop: 15000,  },
  'Ouesso':       { lat:  1.6136,  lng: 16.0517, pop: 40000,  },
  'Owando':       { lat: -0.4819,  lng: 15.8999, pop: 35000,  },
  'Impfondo':     { lat:  1.6373,  lng: 18.0667, pop: 30000,  },
  'Sibiti':       { lat: -3.6819,  lng: 13.3499, pop: 25000,  },
  'Madingou':     { lat: -4.1536,  lng: 13.5500, pop: 22000,  },
};

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
            <span class="badge badge-verified">{{ totalCompanies() }} entreprises</span>
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
  private readonly companyService = inject(CompanyService);

  @ViewChild('map') private mapEl?: ElementRef<HTMLElement>;
  private map?: L.Map;
  private layer?: L.LayerGroup;

  private readonly companies = toSignal(
    this.companyService.getCompanies({ status: 2, pageSize: 1000 }).pipe(
      map(res => res.items),
      catchError(() => of([] as Company[]))
    ),
    { initialValue: [] as Company[] }
  );

  protected readonly totalCompanies = computed(() => this.companies().length);

  protected readonly pins = computed<CityPin[]>(() => {
    const data = this.companies();
    const pinMap = new Map<string, CityPin>();

    for (const c of data) {
      if (!c.cityName) continue;
      const coords = CITY_COORDS[c.cityName];
      if (!coords) continue;

      const existing = pinMap.get(c.cityName);
      if (existing) {
        existing.count++;
      } else {
        pinMap.set(c.cityName, {
          cityId: c.cityId,
          cityName: c.cityName,
          regionName: c.regionName || 'Congo',
          count: 1,
          population: coords.pop,
          lat: coords.lat,
          lng: coords.lng
        });
      }
    }
    return Array.from(pinMap.values());
  });

  ngAfterViewInit(): void {
    if (!this.mapEl) return;

    this.map = L.map(this.mapEl.nativeElement, {
      center: [-1.5, 15.0],
      zoom: 5,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap',
    }).addTo(this.map);

    this.layer = L.layerGroup().addTo(this.map);

    // Watch pins signal and render markers
    computed(() => {
      this.renderPins(this.pins());
      return null;
    });
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private renderPins(pins: CityPin[]): void {
    if (!this.map || !this.layer) return;
    this.layer.clearLayers();

    for (const p of pins) {
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
    const density = (p.count / p.population) * 10000;
    const densityFixed = density.toFixed(2);
    const queryParams = new URLSearchParams({ region: p.regionName, city: p.cityName }).toString();
    
    return `
      <div style="font-family: 'Inter', sans-serif; min-width: 200px; padding: 4px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <strong style="font-family:'DM Serif Display', serif; font-size:18px; color:#004e34;">${p.cityName}</strong>
          <span style="font-size:10px; font-weight:700; background:#f0f4f8; padding:2px 6px; border-radius:4px; color:#515f74; text-transform:uppercase;">${p.regionName}</span>
        </div>
        
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div style="background:#f8fafc; padding:8px; border-radius:8px; border:1px solid #e2e8f0;">
            <div style="font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase;">Entreprises</div>
            <div style="font-size:16px; font-weight:800; color:#0f172a;">${p.count}</div>
          </div>
          <div style="background:#f8fafc; padding:8px; border-radius:8px; border:1px solid #e2e8f0;">
            <div style="font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase;">Population</div>
            <div style="font-size:16px; font-weight:800; color:#0f172a;">${(p.population / 1000).toFixed(0)}k</div>
          </div>
        </div>

        <div style="font-size:12px; color:#515f74; margin-bottom:16px; padding:0 4px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span>Densité eco :</span>
            <span style="font-weight:700; color:#004e34;">${densityFixed} / 10k hab.</span>
          </div>
          <div style="height:4px; background:#e2e8f0; border-radius:2px; overflow:hidden;">
            <div style="height:100%; width:${Math.min(density * 10, 100)}%; background:#004e34;"></div>
          </div>
        </div>

        <a href="/annuaire?${queryParams}"
           style="display:block; text-align:center; padding:10px; background:#004e34; color:#fff; border-radius:10px; font-size:13px; text-decoration:none; font-weight:600; transition: background 0.2s;">
          Explorer les entreprises
        </a>
      </div>
    `;
  }
}

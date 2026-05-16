import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild, AfterViewInit, computed, inject, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CompanyService } from '@core/services/company.service';
import { Company, CompanyStatus } from '@core/models/company.model';
import { FR } from '@core/i18n/fr.constants';
import * as L from 'leaflet';
import { catchError, map, of } from 'rxjs';

interface RegionPin {
  regionName: string;
  count: number;
  population: number;
  lat: number;
  lng: number;
}

// Population (2023 Census estimates) and coordinates for the 12 Departments of Congo.
const REGION_DATA: Record<string, { lat: number; lng: number; pop: number }> = {
  'Brazzaville':   { lat: -4.2634, lng: 15.2429, pop: 2145000 },
  'Pointe-Noire':  { lat: -4.7761, lng: 11.8636, pop: 1420000 },
  'Bouenza':       { lat: -4.1536, lng: 13.5500, pop: 445000  }, // Madingou
  'Niari':         { lat: -4.1990, lng: 12.6702, pop: 334000  }, // Dolisie
  'Pool':          { lat: -4.3614, lng: 14.7644, pop: 333000  }, // Kinkala
  'Plateaux':      { lat: -2.0000, lng: 15.5000, pop: 283000  }, // Djambala/General
  'Cuvette':       { lat: -0.4819, lng: 15.8999, pop: 262000  }, // Owando
  'Sangha':        { lat:  1.6136, lng: 16.0517, pop: 210000  }, // Ouesso
  'Likouala':      { lat:  1.6373, lng: 18.0667, pop: 202000  }, // Impfondo
  'Lékoumou':      { lat: -3.6819, lng: 13.3499, pop: 136000  }, // Sibiti
  'Cuvette-Ouest': { lat: -0.0142, lng: 14.9122, pop: 111000  }, // Ewo
  'Kouilou':       { lat: -4.4000, lng: 12.0000, pop: 103000  }, // Hinda/Rural
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
            <span class="text-secondary text-sm">{{ pins().length }} départements actifs</span>
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
        <p class="legend-title">Indice de présence économique</p>
        <p class="text-xs text-secondary mb-4">La taille du cercle est proportionnelle au nombre d'entreprises enregistrées dans le département.</p>
        <ul>
          <li><span class="dot" style="width:12px; height:12px;"></span> Faible</li>
          <li><span class="dot" style="width:20px; height:20px;"></span> Moyenne</li>
          <li><span class="dot" style="width:32px; height:32px;"></span> Forte</li>
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

    .pulse-marker {
      animation: pulse 2s infinite;
      transform-origin: center;
    }

    @keyframes pulse {
      0% { stroke-width: 2; stroke-opacity: 1; fill-opacity: 0.5; }
      50% { stroke-width: 6; stroke-opacity: 0.5; fill-opacity: 0.7; }
      100% { stroke-width: 2; stroke-opacity: 1; fill-opacity: 0.5; }
    }
  `],
})
export class CartographieComponent implements AfterViewInit, OnDestroy {
  protected readonly FR = FR;
  private readonly companyService = inject(CompanyService);

  @ViewChild('map') private mapEl?: ElementRef<HTMLElement>;
  private readonly map = signal<L.Map | null>(null);
  private readonly layer = signal<L.LayerGroup | null>(null);

  private readonly companies = toSignal(
    this.companyService.getCompanies({ status: 2, pageSize: 1000 }).pipe(
      map(res => res.items),
      catchError(() => of([] as Company[]))
    ),
    { initialValue: [] as Company[] }
  );

  protected readonly totalCompanies = computed(() => this.companies().length);

  constructor() {
    // Watch pins signal and render markers when data and map are ready
    effect(() => {
      const pins = this.pins();
      const m = this.map();
      const l = this.layer();
      if (m && l) {
        console.log('Rendering pins:', pins);
        this.renderPins(pins, m, l);
      }
    });
  }

  protected readonly pins = computed<RegionPin[]>(() => {
    const data = this.companies();
    const pinMap = new Map<string, RegionPin>();

    // Create a lowercase map for matching
    const regionKeys = Object.keys(REGION_DATA);

    for (const c of data) {
      const rawName = c.regionName || c.cityName || 'Inconnu';
      
      // Find matching key case-insensitively
      const regionName = regionKeys.find(k => k.toLowerCase() === rawName.toLowerCase());
      
      if (!regionName) {
        console.warn(`Region or City not found in mapping: ${rawName}`);
        continue;
      }

      const coords = REGION_DATA[regionName];
      const existing = pinMap.get(regionName);
      if (existing) {
        existing.count++;
      } else {
        pinMap.set(regionName, {
          regionName,
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

    this.map.set(L.map(this.mapEl.nativeElement, {
      center: [-1.5, 15.0],
      zoom: 5,
      zoomControl: true,
      attributionControl: true,
    }));

    const m = this.map()!;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap',
    }).addTo(m);

    this.layer.set(L.layerGroup().addTo(m));
  }


  ngOnDestroy(): void {
    this.map()?.remove();
  }

  private renderPins(pins: RegionPin[], map: L.Map, layer: L.LayerGroup): void {
    layer.clearLayers();

    for (const p of pins) {
      // Radius calculation: base size + sqrt of count to keep it visually balanced but reflecting volume
      const radius = 10 + Math.sqrt(p.count) * 6;
      
      const marker = L.circleMarker([p.lat, p.lng], {
        radius,
        color: '#004e34',
        fillColor: '#004e34',
        fillOpacity: 0.5,
        weight: 1.5,
      });

      marker.bindPopup(this.popupHtml(p), { className: 'ac-popup' });
      marker.addTo(layer);

      // Add a simple animation class if possible, or just style the circle
      // Leaflet doesn't easily support CSS animations on path elements without a className
      (marker as any).getElement()?.classList.add('pulse-marker');
    }
  }

  private popupHtml(p: RegionPin): string {
    const density = (p.count / p.population) * 10000;
    const densityFixed = density.toFixed(2);
    const queryParams = new URLSearchParams({ region: p.regionName }).toString();
    
    return `
      <div style="font-family: 'Inter', sans-serif; min-width: 220px; padding: 4px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <strong style="font-family:'DM Serif Display', serif; font-size:18px; color:#004e34;">${p.regionName}</strong>
          <span style="font-size:10px; font-weight:700; background:#004e34; color:#fff; padding:2px 8px; border-radius:20px; text-transform:uppercase;">Département</span>
        </div>
        
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div style="background:#f8fafc; padding:8px; border-radius:8px; border:1px solid #e2e8f0;">
            <div style="font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase;">Entreprises</div>
            <div style="font-size:18px; font-weight:800; color:#0f172a;">${p.count}</div>
          </div>
          <div style="background:#f8fafc; padding:8px; border-radius:8px; border:1px solid #e2e8f0;">
            <div style="font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase;">Habitants</div>
            <div style="font-size:18px; font-weight:800; color:#0f172a;">${(p.population / 1000).toFixed(0)}k</div>
          </div>
        </div>

        <div style="font-size:12px; color:#515f74; margin-bottom:16px; padding:8px; background:rgba(0, 78, 52, 0.05); border-radius:8px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span>Densité d'entreprises :</span>
            <strong style="color:#004e34;">${densityFixed} / 10k</strong>
          </div>
          <div style="height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden;">
            <div style="height:100%; width:${Math.min(density * 15, 100)}%; background:#004e34;"></div>
          </div>
        </div>

        <a href="/annuaire?${queryParams}"
           style="display:block; text-align:center; padding:12px; background:#004e34; color:#fff; border-radius:12px; font-size:13px; text-decoration:none; font-weight:700; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0, 78, 52, 0.2);">
          Voir le département
        </a>
      </div>
    `;
  }
}

import { Component, inject, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, SimpleChanges, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { GeographyService } from '@core/services/sector.service';
import { Region, City } from '@core/models/geography.model';

declare var L: any;

@Component({
  selector: 'app-map-selector',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="map-container">
      <div class="map-header">
        <h3>Explore Congo</h3>
        <p>Click on a region to find companies</p>
      </div>
      
      <div id="congo-map" class="map"></div>
      
      <div class="map-results" *ngIf="selectedRegionId || selectedCityId">
        <div class="selected-location">
          <mat-icon>place</mat-icon>
          <span>
            {{ selectedCityName }}{{ selectedCityName && selectedRegionName ? ', ' : '' }}{{ selectedRegionName }}
          </span>
          <button mat-button color="primary" (click)="clearSelection()">
            Clear
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .map-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 350px;
      
      .map-header {
        padding: 16px 20px;
        background: linear-gradient(135deg, #f57c00, #e65100);
        color: white;
        
        h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        p {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }
      }
      
      .map {
        flex: 1;
        width: 100%;
        min-height: 300px;
      }
      
      .leaflet-container {
        height: 100%;
        width: 100%;
        border-radius: 0 0 12px 12px;
      }
      
      .map-results {
        padding: 16px 20px;
        background: #e8f4fd;
        border-top: 1px solid #bbdefb;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
        
        .selected-location {
          display: flex;
          align-items: center;
          gap: 8px;
          
          mat-icon {
            font-size: 20px;
            color: #1976d2;
          }
          
          span {
            font-weight: 500;
            color: #1565c0;
          }
        }
        
        button {
          height: 36px;
        }
      }
    }
    
    @media (max-width: 768px) {
      .map-container {
        .map-results {
          flex-direction: column;
          align-items: stretch;
          
          .selected-location {
            justify-content: center;
          }
        }
      }
    }
  `]
})
export class MapSelectorComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  private geographyService = inject(GeographyService);
  
  @Input() regions: Region[] = [];
  @Input() cities: City[] = [];
  
  @Output() regionSelected = new EventEmitter<string>();
  @Output() citySelected = new EventEmitter<{ regionId: string; cityId: string }>();
  
  selectedRegionId: string | null = null;
  selectedCityId: string | null = null;
  selectedRegionName: string | null = null;
  selectedCityName: string | null = null;
  
  private map: any;
  private regionLayers: any = {};
  private cityMarkers: any = {};
  private mapInitialized = false;
  
  ngOnInit(): void {
    // Map will be initialized in ngAfterViewInit
  }
  
  ngAfterViewInit(): void {
    // Give Angular time to render the DOM element
    setTimeout(() => {
      this.initMap();
    }, 100);
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (this.mapInitialized) {
      if (changes['regions'] && !changes['regions'].firstChange) {
        this.updateMapRegions();
      }
      
      if (changes['cities'] && !changes['cities'].firstChange) {
        this.updateMapCities();
      }
    }
  }
  
  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
  
  private initMap(): void {
    const mapElement = document.getElementById('congo-map');
    if (!mapElement) {
      console.error('Map element not found');
      return;
    }
    
    // Initialize map centered on Republic of Congo
    this.map = L.map('congo-map', {
      center: [-0.5, 15.5],
      zoom: 6,
      zoomControl: true,
      scrollWheelZoom: true
    });
    
    // Add OpenStreetMap tile layer with better tiles for Congo
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
      minZoom: 5
    }).addTo(this.map);
    
    this.mapInitialized = true;
    
    // Add Congo approximate boundary
    this.addCongoBoundary();
    
    // Load regions if available
    if (this.regions.length > 0) {
      setTimeout(() => this.updateMapRegions(), 200);
    }
    
    console.log('Map initialized successfully');
  }
  
  private addCongoBoundary(): void {
    // Simplified approximate boundary of Republic of Congo
    const congoBounds = [
      [-4.5, 11.5],
      [-4.5, 18.5],
      [1.5, 18.5],
      [1.5, 11.5]
    ];
    
    const congoOutline = L.polygon(congoBounds, {
      color: '#f57c00',
      weight: 2,
      opacity: 0.8,
      fillColor: '#fff3e0',
      fillOpacity: 0.1,
      dashArray: '5, 10'
    }).addTo(this.map);
    
    congoOutline.bindPopup('<strong>Republic of Congo</strong>');
  }
  
  private updateMapRegions(): void {
    // Clear existing region layers
    Object.values(this.regionLayers).forEach((layer: any) => {
      this.map.removeLayer(layer);
    });
    this.regionLayers = {};
    
    // Add region polygons (simplified - in reality you'd have GeoJSON data)
    // For demo purposes, we'll create approximate regions
    this.regions.forEach(region => {
      // This is a simplified approach - real implementation would use actual geographic boundaries
      const bounds = this.getApproximateRegionBounds(region.id);
      if (bounds) {
        const polygon = L.polygon(bounds, {
          color: '#1976d2',
          weight: 2,
          opacity: 0.7,
          fillColor: '#1976d2',
          fillOpacity: 0.2
        }).addTo(this.map);
        
        polygon.on('click', () => {
          this.selectRegion(region.id, region.name);
        });
        
        // Add label
        const label = L.marker(bounds[0], {
          icon: L.divIcon({
            className: 'region-label',
            html: `<div>${region.name}</div>`,
            iconSize: [80, 30]
          })
        }).addTo(this.map);
        
        this.regionLayers[region.id] = { polygon, label };
      }
    });
  }
  
  private updateMapCities(): void {
    // Clear existing city markers
    Object.values(this.cityMarkers).forEach((marker: any) => {
      this.map.removeLayer(marker);
    });
    this.cityMarkers = {};
    
    // Add city markers
    this.cities.forEach(city => {
      // In a real implementation, you'd have actual coordinates
      const position = this.getApproximateCityPosition(city.id);
      if (position) {
        const marker = L.circleMarker(position, {
          radius: 6,
          color: '#1565c0',
          fillColor: '#1565c0',
          fillOpacity: 0.8,
          weight: 2
        }).addTo(this.map);
        
        marker.on('click', () => {
          this.selectCity(city.regionId, city.id, city.name);
        });
        
        // Add city name on hover
        marker.bindTooltip(city.name, {
          permanent: false,
          direction: 'top',
          offset: [0, -10]
        });
        
        this.cityMarkers[city.id] = marker;
      }
    });
  }
  
  private selectRegion(regionId: string, regionName: string): void {
    this.selectedRegionId = regionId;
    this.selectedRegionName = regionName;
    this.selectedCityId = null;
    this.selectedCityName = null;
    
    // Highlight selected region
    Object.entries(this.regionLayers).forEach(([id, layer]: [string, any]) => {
      if (id === regionId) {
        layer.polygon.setStyle({
          weight: 3,
          opacity: 0.9,
          fillOpacity: 0.3
        });
      } else {
        layer.polygon.setStyle({
          weight: 2,
          opacity: 0.7,
          fillOpacity: 0.2
        });
      }
    });
    
    this.regionSelected.emit(regionId);
  }
  
  private selectCity(regionId: string, cityId: string, cityName: string): void {
    this.selectedRegionId = regionId;
    this.selectedCityId = cityId;
    this.selectedRegionName = this.regions.find(r => r.id === regionId)?.name || null;
    this.selectedCityName = cityName;
    
    // Highlight selected city
    Object.entries(this.cityMarkers).forEach(([id, marker]: [string, any]) => {
      if (id === cityId) {
        marker.setStyle({
          radius: 8,
          weight: 3
        });
        marker.openTooltip();
      } else {
        marker.setStyle({
          radius: 6,
          weight: 2
        });
      }
    });
    
    this.citySelected.emit({ regionId, cityId });
  }
  
  clearSelection(): void {
    this.selectedRegionId = null;
    this.selectedCityId = null;
    this.selectedRegionName = null;
    this.selectedCityName = null;
    
    // Reset region styles
    Object.values(this.regionLayers).forEach((layer: any) => {
      layer.polygon.setStyle({
        weight: 2,
        opacity: 0.7,
        fillOpacity: 0.2
      });
    });
    
    // Reset city styles
    Object.values(this.cityMarkers).forEach((marker: any) => {
      marker.setStyle({
        radius: 6,
        weight: 2
      });
      marker.closeTooltip();
    });
    
    // Emit empty events to clear selection
    this.regionSelected.emit('');
    this.citySelected.emit({ regionId: '', cityId: '' });
  }
  
  // These methods would normally use real geographic data
  // For demo purposes, we're generating approximate positions
  private getApproximateRegionBounds(regionId: string): any[][] | null {
    // Simplified approximate regions for Congo
    // In reality, you'd load actual GeoJSON boundary data
    const regionPositions: Record<string, any[][]> = {
      // Brazzaville region
      '1': [
        [-4.5, 15.0],
        [-4.5, 15.8],
        [-4.0, 15.8],
        [-4.0, 15.0]
      ],
      // Pool region
      '2': [
        [-3.8, 15.5],
        [-3.8, 16.5],
        [-3.2, 16.5],
        [-3.2, 15.5]
      ],
      // Other regions would be defined similarly...
      // For simplicity, we'll generate some basic bounds
    };
    
    return regionPositions[regionId] || null;
  }
  
  private getApproximateCityPosition(cityId: string): [number, number] | null {
    // Simplified approximate city positions
    // In reality, you'd have actual latitude/longitude data
    const cityPositions: Record<string, [number, number]> = {
      // Major cities in Congo
      '1': [-4.27, 15.28], // Brazzaville
      '2': [-4.25, 15.29], // Kinshasa (for reference)
      '3': [-3.95, 15.62], // Pointe-Noire
      // Add more cities as needed
    };
    
    return cityPositions[cityId] || [-0.8, 15.5]; // Default to center of map
  }
}
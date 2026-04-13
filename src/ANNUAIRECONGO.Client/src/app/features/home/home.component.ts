import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CompanyService } from '@core/services/company.service';
import { SectorService } from '@core/services/sector.service';
import { GeographyService } from '@core/services/sector.service';
import { Company, Sector, Region, City } from '@core/models/company.model';
import { MapSelectorComponent } from '@shared/map/map-selector.component';

@Component({
  selector: 'app-home',
  standalone: true,
   imports: [
     CommonModule,
     RouterModule,
     FormsModule,
     MatCardModule,
     MatButtonModule,
     MatIconModule,
     MatInputModule,
     MatFormFieldModule,
     MatSelectModule,
     MatChipsModule,
     MatProgressSpinnerModule,
     MatPaginatorModule,
     MapSelectorComponent
   ],
  template: `
    <div class="home-container">
      <section class="hero-section">
        <div class="hero-content">
          <h1>Discover Congo Companies</h1>
          <p>Your professional directory to find all Congolese companies</p>
          
          <div class="search-box">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search for a company</mat-label>
              <input matInput [(ngModel)]="searchTerm" (keyup.enter)="searchCompanies()" placeholder="Company name, sector...">
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="searchCompanies()">
              Search
            </button>
          </div>
        </div>
      </section>

      <section class="map-section">
        <div class="map-container">
          <app-map-selector 
            [regions]="regions()" 
            [cities]="cities()"
            (regionSelected)="onRegionSelectedFromMap($event)"
            (citySelected)="onCitySelectedFromMap($event)"
          ></app-map-selector>
        </div>
      </section>

      <section class="companies-section">
        <div class="section-header">
          <h2>Companies</h2>
         <div class="filters">
           <mat-form-field appearance="outline">
             <mat-label>Sector</mat-label>
             <mat-select [(ngModel)]="selectedSectorId" (selectionChange)="searchCompanies()">
               <mat-option [value]="null">All sectors</mat-option>
               @for (sector of sectors(); track sector.sectorId) {
                 <mat-option [value]="sector.sectorId">{{ sector.name }}</mat-option>
               }
             </mat-select>
           </mat-form-field>
         </div>
        </div>

        @if (isLoading()) {
          <div class="loading-container">
            <mat-spinner></mat-spinner>
          </div>
        } @else if (companies().length === 0) {
          <div class="empty-state">
            <mat-icon>business</mat-icon>
            <h3>No companies found</h3>
            <p>Try with different search criteria</p>
          </div>
        } @else {
          <div class="companies-grid">
            @for (company of companies(); track company.id) {
              <mat-card class="company-card" [routerLink]="['/companies', company.id]">
                <div class="cover-container">
                  @if (company.coverUrl) {
                    <img [src]="company.coverUrl" [alt]="company.name" class="company-cover">
                  } @else {
                    <div class="company-cover-placeholder">
                      <mat-icon>business</mat-icon>
                    </div>
                  }
                  @if (company.logoUrl) {
                    <img [src]="company.logoUrl" [alt]="company.name" class="company-logo">
                  }
                </div>
                <mat-card-content>
                  <h3>{{ company.name }}</h3>
                  @if (company.description) {
                    <p class="description">{{ company.description | slice:0:80 }}...</p>
                  }
                  <div class="sectors">
                    @for (sector of company.sectors.slice(0, 2); track sector.sectorId) {
                      <span class="sector-tag">{{ sector.name }}</span>
                    }
                  </div>
                  @if (company.cityName) {
                    <div class="location">
                      <mat-icon>location_on</mat-icon>
                      {{ company.cityName }}
                    </div>
                  }
                </mat-card-content>
                @if (company.isFeatured) {
                  <div class="featured-badge">
                    <mat-icon>star</mat-icon>
                    Featured
                  </div>
                }
              </mat-card>
            }
          </div>

          <mat-paginator
            [length]="totalCount()"
            [pageSize]="pageSize"
            [pageIndex]="pageNumber - 1"
            [pageSizeOptions]="[6, 12, 24]"
            (page)="onPageChange($event)"
            aria-label="Select page">
          </mat-paginator>
        }
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: 100%;
    }

    .hero-section {
      background: linear-gradient(135deg, #f57c00 0%, #e65100 50%, #bf360c 100%);
      padding: 60px 24px;
      text-align: center;
      color: white;
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          radial-gradient(circle at 20% 80%, rgba(255, 152, 0, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(46, 125, 50, 0.2) 0%, transparent 50%);
        pointer-events: none;
      }
    }

    .hero-content {
      max-width: 800px;
      margin: 0 auto;

      h1 {
        font-size: 36px;
        font-weight: 500;
        margin-bottom: 16px;
      }

      p {
        font-size: 18px;
        opacity: 0.9;
        margin-bottom: 32px;
      }
    }

    .search-box {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-bottom: 24px;

      .search-field {
        width: 400px;
        background: white;
        border-radius: 8px;
      }

      button {
        height: 56px;
      }
    }

    .quick-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;

      mat-chip-option {
        cursor: pointer;
      }
    }

    .companies-section {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 24px;
    }

    .map-section {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px 32px;

      .map-container {
        height: 400px;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(0, 0, 0, 0.08);
      }
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 24px;

      h2 {
        font-size: 24px;
        font-weight: 500;
      }
    }

    .filters {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;

      mat-form-field {
        min-width: 150px;
      }
    }

    .companies-grid {
       display: grid;
       grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
       gap: 20px;
       margin-bottom: 24px;
     }

    .company-card {
       cursor: pointer;
       transition: transform 0.2s ease, box-shadow 0.2s ease, border 0.2s ease;
       border-radius: 16px !important;
       overflow: hidden;
       border: 1px solid rgba(0, 0, 0, 0.08);
       background: white;
       height: 100%;
       display: flex;
       flex-direction: column;

       &:hover {
         transform: translateY(-6px);
         box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15) !important;
         border-color: rgba(30, 136, 229, 0.2);
       }

       &:active {
         transform: translateY(-2px);
       }

       .cover-container {
         position: relative;
         height: 140px;
         overflow: hidden;
       }

       .company-cover {
         width: 100%;
         height: 100%;
         object-fit: cover;
       }

       .company-logo {
         position: absolute;
         bottom: -30px;
         left: 16px;
         width: 60px;
         height: 60px;
         border-radius: 8px;
         object-fit: cover;
         background: white;
         box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
         border: 3px solid white;
       }
     }

      .company-cover {
        height: 160px;
        object-fit: cover;
        background-position: center;
        background-repeat: no-repeat;
      }

      .company-cover-placeholder {
        height: 160px;
        background: linear-gradient(135deg, #fff8e1, #ffecb3);
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          color: #ff9800;
        }
      }

    mat-card-content {
       padding: 16px !important;
       position: relative;
       min-height: 100px;

       h3 {
         font-size: 18px;
         font-weight: 500;
         margin-bottom: 8px;
       }

       .description {
         font-size: 14px;
         color: #666;
         margin-bottom: 12px;
         line-height: 1.4;
       }
     }

    .company-logo {
      position: absolute;
      top: -28px;
      left: 16px;
      width: 56px;
      height: 56px;
      border-radius: 8px;
      object-fit: cover;
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .sectors {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }

    .sector-tag {
      font-size: 11px;
      padding: 3px 10px;
      background: #fff3e0;
      color: #e65100;
      border-radius: 14px;
      font-weight: 500;
      border: 1px solid #ffcc80;
      white-space: nowrap;
    }

    .location {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    .featured-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      background: #ff9800;
      color: white;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    .loading-container, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      color: rgba(0, 0, 0, 0.6);

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
      }

      h3 {
        margin-bottom: 8px;
      }
    }

    @media (max-width: 600px) {
      .search-box {
        flex-direction: column;
        
        .search-field {
          width: 100%;
        }
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  private readonly companyService = inject(CompanyService);
  private readonly sectorService = inject(SectorService);
  private readonly geographyService = inject(GeographyService);

  companies = signal<Company[]>([]);
  sectors = signal<Sector[]>([]);
  regions = signal<Region[]>([]);
  cities = signal<City[]>([]);
  totalCount = signal<number>(0);
  isLoading = signal<boolean>(false);

  searchTerm = '';
  selectedSectorId: string | null = null;
  selectedRegionId: string | null = null;
  selectedCityId: string | null = null;
  pageNumber = 1;
  pageSize = 12;

  ngOnInit(): void {
    this.loadSectors();
    this.loadRegions();
    this.loadCompanies();
  }

  loadSectors(): void {
    this.sectorService.getSectors().subscribe({
      next: (data) => this.sectors.set(data),
      error: (err) => console.error('Error loading sectors:', err)
    });
  }

  loadRegions(): void {
    this.geographyService.getRegions().subscribe({
      next: (data) => this.regions.set(data),
      error: (err) => console.error('Error loading regions:', err)
    });
  }

  loadCompanies(): void {
    this.isLoading.set(true);
    this.companyService.getCompanies({
      searchTerm: this.searchTerm || undefined,
      sectorId: this.selectedSectorId || undefined,
      cityId: this.selectedCityId || undefined,
      regionId: this.selectedRegionId || undefined,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    }).subscribe({
      next: (response) => {
        this.companies.set(response.items);
        this.totalCount.set(response.totalCount);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading companies:', err);
        this.isLoading.set(false);
      }
    });
  }

  searchCompanies(): void {
    this.pageNumber = 1;
    this.loadCompanies();
  }

  filterBySector(sectorId: string): void {
    this.selectedSectorId = sectorId;
    this.searchCompanies();
  }

   onRegionChange(): void {
     this.selectedCityId = null;
     this.cities.set([]);
     if (this.selectedRegionId) {
       this.geographyService.getCitiesByRegion(this.selectedRegionId).subscribe({
         next: (data) => this.cities.set(data),
         error: (err) => console.error('Error loading cities:', err)
       });
     }
     this.searchCompanies();
   }

   onRegionSelectedFromMap(regionId: string): void {
     this.selectedRegionId = regionId;
     this.selectedCityId = null;
     this.cities.set([]);
     if (regionId) {
       this.geographyService.getCitiesByRegion(regionId).subscribe({
         next: (data) => this.cities.set(data),
         error: (err) => console.error('Error loading cities:', err)
       });
     }
     this.searchCompanies();
   }

   onCitySelectedFromMap(selected: { regionId: string; cityId: string }): void {
     this.selectedRegionId = selected.regionId;
     this.selectedCityId = selected.cityId;
     this.searchCompanies();
   }

  onPageChange(event: PageEvent): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadCompanies();
  }
}
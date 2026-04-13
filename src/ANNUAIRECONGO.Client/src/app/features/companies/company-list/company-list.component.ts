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
import { SectorService, GeographyService } from '@core/services/sector.service';
import { Company, Sector, Region } from '@core/models/company.model';

@Component({
  selector: 'app-company-list',
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
    MatPaginatorModule
  ],
  template: `
    <div class="companies-list-container">
      <div class="page-header">
        <h1>Company Directory</h1>
        <p>Browse all companies registered in the directory</p>
      </div>

      <div class="filters-section">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search</mat-label>
          <input matInput [(ngModel)]="searchTerm" (keyup.enter)="loadCompanies()" placeholder="Company name...">
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Sector</mat-label>
          <mat-select [(ngModel)]="selectedSectorId" (selectionChange)="loadCompanies()">
            <mat-option [value]="null">All sectors</mat-option>
            @for (sector of sectors(); track sector.sectorId) {
              <mat-option [value]="sector.sectorId">{{ sector.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Region</mat-label>
          <mat-select [(ngModel)]="selectedRegionId" (selectionChange)="onRegionChange()">
            <mat-option [value]="null">All regions</mat-option>
            @for (region of regions(); track region.id) {
              <mat-option [value]="region.id">{{ region.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>City</mat-label>
          <mat-select [(ngModel)]="selectedCityId" [disabled]="!selectedRegionId" (selectionChange)="loadCompanies()">
            <mat-option [value]="null">All cities</mat-option>
            @for (city of cities(); track city.id) {
              <mat-option [value]="city.id">{{ city.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
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
    </div>
  `,
  styles: [`
    .companies-list-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .page-header {
      margin-bottom: 32px;

      h1 {
        font-size: 28px;
        font-weight: 500;
        margin-bottom: 8px;
      }

      p {
        color: rgba(0, 0, 0, 0.6);
      }
    }

    .filters-section {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 24px;
      padding: 24px;
      background: white;
      border-radius: 12px;

      .search-field {
        flex: 1;
        min-width: 250px;
      }

      mat-form-field {
        min-width: 180px;
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

     mat-card-content {
       padding: 20px !important;
       position: relative;
       flex: 1;
       display: flex;
       flex-direction: column;

       h3 {
         font-size: 20px;
         font-weight: 600;
         margin-bottom: 12px;
         color: #2c3e50;
         line-height: 1.3;
       }

       .description {
         font-size: 14px;
         color: #6c757d;
         margin-bottom: 16px;
         line-height: 1.4;
         flex: 1;
        }
      }

      .sectors {
       display: flex;
       flex-wrap: wrap;
       gap: 6px;
       margin-bottom: 14px;
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
       gap: 6px;
       font-size: 13px;
       color: #6c757d;
       margin-top: auto;

       mat-icon {
         font-size: 15px;
         width: 15px;
         height: 15px;
         color: #1976d2;
       }
     }

     .featured-badge {
       position: absolute;
       top: 12px;
       right: 12px;
       display: flex;
       align-items: center;
       gap: 4px;
       padding: 6px 14px;
       background: #ff9800;
       color: white;
       border-radius: 20px;
       font-size: 13px;
       font-weight: 600;

       mat-icon {
         font-size: 15px;
         width: 15px;
         height: 15px;
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
  `]
})
export class CompanyListComponent implements OnInit {
  private readonly companyService = inject(CompanyService);
  private readonly sectorService = inject(SectorService);
  private readonly geographyService = inject(GeographyService);

  companies = signal<Company[]>([]);
  sectors = signal<Sector[]>([]);
  regions = signal<Region[]>([]);
  cities = signal<{ id: string; name: string }[]>([]);
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

  onRegionChange(): void {
    this.selectedCityId = null;
    this.cities.set([]);
    if (this.selectedRegionId) {
      this.geographyService.getCitiesByRegion(this.selectedRegionId).subscribe({
        next: (data) => this.cities.set(data),
        error: (err) => console.error('Error loading cities:', err)
      });
    }
    this.loadCompanies();
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadCompanies();
  }
}
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
import { Company, Sector, Region } from '@core/models/company.model';

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
    MatPaginatorModule
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

          <div class="quick-filters">
            @for (sector of sectors().slice(0, 6); track sector.sectorId) {
              <mat-chip-option (click)="filterBySector(sector.sectorId)">
                {{ sector.name }}
              </mat-chip-option>
            }
          </div>
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
              <mat-select [(ngModel)]="selectedCityId" [disabled]="!selectedRegionId" (selectionChange)="searchCompanies()">
                <mat-option [value]="null">All cities</mat-option>
                @for (city of cities(); track city.id) {
                  <mat-option [value]="city.id">{{ city.name }}</mat-option>
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
                @if (company.coverUrl) {
                  <img mat-card-image [src]="company.coverUrl" [alt]="company.name" class="company-cover">
                } @else {
                  <div class="company-cover-placeholder">
                    <mat-icon>business</mat-icon>
                  </div>
                }
                <mat-card-content>
                  @if (company.logoUrl) {
                    <img [src]="company.logoUrl" [alt]="company.name" class="company-logo">
                  }
                  <h3>{{ company.name }}</h3>
                  @if (company.description) {
                    <p class="description">{{ company.description | slice:0:100 }}...</p>
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
      background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
      padding: 60px 24px;
      text-align: center;
      color: white;
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
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .company-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      border-radius: 12px !important;
      overflow: hidden;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
      }
    }

    .company-cover {
      height: 140px;
      object-fit: cover;
    }

    .company-cover-placeholder {
      height: 140px;
      background: linear-gradient(135deg, #e3f2fd, #c8e6c9);
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #1e88e5;
      }
    }

    mat-card-content {
      padding: 16px !important;
      position: relative;

      h3 {
        font-size: 18px;
        font-weight: 500;
        margin-bottom: 8px;
        margin-top: 32px;
      }

      .description {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
        margin-bottom: 12px;
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
      font-size: 12px;
      padding: 4px 12px;
      background: #e3f2fd;
      color: #1e88e5;
      border-radius: 16px;
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

  onPageChange(event: PageEvent): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadCompanies();
  }
}
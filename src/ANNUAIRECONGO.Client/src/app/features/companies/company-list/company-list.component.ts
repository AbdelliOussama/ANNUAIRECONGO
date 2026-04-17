import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CompanyService } from '@core/services/company.service';
import { SectorService } from '@core/services/sector.service';
import { GeographyService } from '@core/services/geography.service';
import { Company, Sector, Region } from '@core/models/company.model';
import { CompanyGridComponent } from '@shared/company-grid/company-grid.component';

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
    MatProgressSpinnerModule,
    MatPaginatorModule,
    CompanyGridComponent
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

      <app-company-grid
        [companies]="companiesValue"
        [totalCount]="totalCountValue"
        [isLoading]="isLoadingValue"
        [pageNumber]="pageNumber"
        [pageSize]="pageSize"
        (pageChange)="onPageChange($event)"
      ></app-company-grid>
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
  `]
})
export class CompanyListComponent implements OnInit {
  private readonly companyService = inject(CompanyService);
  private readonly sectorService = inject(SectorService);
  private readonly geographyService = inject(GeographyService);
  private readonly route = inject(ActivatedRoute);

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

  get companiesValue() { return this.companies(); }
  get totalCountValue() { return this.totalCount(); }
  get isLoadingValue() { return this.isLoading(); }

  ngOnInit(): void {
    this.loadSectors();
    this.loadRegions();
    this.route.queryParams.subscribe(params => {
      if (params['regionId']) {
        this.selectedRegionId = params['regionId'];
        this.onRegionChange();
      }
      if (params['ownerId']) {
        this.loadCompaniesByOwner(params['ownerId']);
      }
    });
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

  loadCompaniesByOwner(ownerId: string): void {
    this.isLoading.set(true);
    this.companyService.getCompanies({
      ownerId: ownerId,
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
}
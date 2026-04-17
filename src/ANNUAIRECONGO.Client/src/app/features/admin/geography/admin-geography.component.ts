import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { GeographyService } from '@core/services/geography.service';
import { Region, City } from '@core/models/geography.model';

@Component({
  selector: 'app-admin-geography',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatListModule
  ],
  template: `
    <div class="admin-container">
      <div class="header">
        <h1>Geography Management</h1>
        <button mat-raised-button color="primary" (click)="openCreateRegionDialog()">
          <mat-icon>add</mat-icon>
          Add Region
        </button>
      </div>

      @if (showRegionDialog()) {
        <div class="dialog-overlay" (click)="closeRegionDialog()">
          <div class="dialog-content" (click)="$event.stopPropagation()">
            <h2>Create Region</h2>
            <form (ngSubmit)="createRegion()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Region Name</mat-label>
                <input matInput [(ngModel)]="regionFormData.name" name="name" required>
              </mat-form-field>
              <div class="dialog-actions">
                <button mat-button type="button" (click)="closeRegionDialog()">Cancel</button>
                <button mat-raised-button color="primary" type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (showCityDialog()) {
        <div class="dialog-overlay" (click)="closeCityDialog()">
          <div class="dialog-content" (click)="$event.stopPropagation()">
            <h2>Add City to {{ selectedRegion()?.name }}</h2>
            <form (ngSubmit)="createCity()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>City Name</mat-label>
                <input matInput [(ngModel)]="cityFormData.name" name="name" required>
              </mat-form-field>
              <div class="dialog-actions">
                <button mat-button type="button" (click)="closeCityDialog()">Cancel</button>
                <button mat-raised-button color="primary" type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      }

      <mat-accordion>
        @for (region of regions(); track region.id) {
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>
                {{ region.name }}
              </mat-panel-title>
              <mat-panel-description>
                {{ getCities(region.id).length }} cities
              </mat-panel-description>
            </mat-expansion-panel-header>

            <div class="region-actions">
              <button mat-button color="primary" (click)="openCreateCityDialog(region)">
                <mat-icon>add</mat-icon>
                Add City
              </button>
              <button mat-button color="warn" (click)="deleteRegion(region.id)">
                <mat-icon>delete</mat-icon>
                Delete Region
              </button>
            </div>

            @if (getCities(region.id).length > 0) {
              <mat-list>
                @for (city of getCities(region.id); track city.id) {
                  <mat-list-item>
                    <mat-icon matListItemIcon>location_city</mat-icon>
                    <span matListItemTitle>{{ city.name }}</span>
                    <button mat-icon-button matListItemMeta (click)="deleteCity(city.id, region.id)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </mat-list-item>
                }
              </mat-list>
            } @else {
              <p class="no-cities">No cities in this region</p>
            }
          </mat-expansion-panel>
        }
      </mat-accordion>
    </div>
  `,
  styles: [`
    .admin-container {
      padding: 24px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .region-actions {
      margin-bottom: 16px;
    }

    .no-cities {
      color: #666;
      font-style: italic;
    }

    .full-width {
      width: 100%;
      margin-bottom: 8px;
    }

    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .dialog-content {
      background: white;
      padding: 24px;
      border-radius: 8px;
      width: 400px;
      max-width: 90vw;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
  `]
})
export class AdminGeographyComponent implements OnInit {
  private geographyService = inject(GeographyService);
  private snackBar = inject(MatSnackBar);

  regions = signal<Region[]>([]);
  citiesByRegion = signal<Map<string, City[]>>(new Map());
  selectedRegion = signal<Region | null>(null);

  showRegionDialog = signal(false);
  showCityDialog = signal(false);
  regionFormData = { name: '' };
  cityFormData = { name: '' };

  ngOnInit(): void {
    this.loadRegions();
  }

  loadRegions(): void {
    this.geographyService.getRegions().subscribe(data => {
      this.regions.set(data);
      data.forEach(region => {
        this.geographyService.getCitiesByRegion(region.id).subscribe(cities => {
          const currentMap = this.citiesByRegion();
          currentMap.set(region.id, cities);
          this.citiesByRegion.set(new Map(currentMap));
        });
      });
    });
  }

  getCities(regionId: string): City[] {
    return this.citiesByRegion().get(regionId) || [];
  }

  openCreateRegionDialog(): void {
    this.regionFormData = { name: '' };
    this.showRegionDialog.set(true);
  }

  closeRegionDialog(): void {
    this.showRegionDialog.set(false);
  }

  createRegion(): void {
    this.geographyService.createRegion(this.regionFormData.name).subscribe(() => {
      this.snackBar.open('Region created', 'Close', { duration: 3000 });
      this.loadRegions();
      this.closeRegionDialog();
    });
  }

  openCreateCityDialog(region: Region): void {
    this.selectedRegion.set(region);
    this.cityFormData = { name: '' };
    this.showCityDialog.set(true);
  }

  closeCityDialog(): void {
    this.showCityDialog.set(false);
    this.selectedRegion.set(null);
  }

  createCity(): void {
    const region = this.selectedRegion();
    if (region) {
      this.geographyService.createCity(this.cityFormData.name, region.id).subscribe(() => {
        this.snackBar.open('City created', 'Close', { duration: 3000 });
        this.loadRegions();
        this.closeCityDialog();
      });
    }
  }

  deleteCity(cityId: string, regionId: string): void {
    if (!confirm('Delete this city?')) return;
    this.geographyService.deleteCity(cityId).subscribe({
      next: () => {
        this.snackBar.open('City deleted', 'Close', { duration: 3000 });
        this.loadRegions();
      },
      error: (err) => this.snackBar.open(err.error?.title || 'Failed to delete city', 'Close', { duration: 3000 })
    });
  }

  deleteRegion(regionId: string): void {
    if (!confirm('Delete this region and all its cities?')) return;
    this.geographyService.deleteRegion(regionId).subscribe({
      next: () => {
        this.snackBar.open('Region deleted', 'Close', { duration: 3000 });
        this.loadRegions();
      },
      error: (err) => this.snackBar.open(err.error?.title || 'Failed to delete region', 'Close', { duration: 3000 })
    });
  }
}
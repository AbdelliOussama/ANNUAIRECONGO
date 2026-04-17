import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StatsService } from '@core/services/stats.service';
import { RegionStats } from '@core/models/company.model';

@Component({
  selector: 'app-regions',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="regions-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Congo Regions</mat-card-title>
          <mat-card-subtitle>Click on a region to see company count</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          @if (isLoading()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading region data...</p>
            </div>
          } @else if (regionStats().length === 0) {
            <div class="empty-state">
              <mat-icon>error_outline</mat-icon>
              <p>No region data available</p>
            </div>
          } @else {
            <mat-grid-list cols="3" rowHeight="120px" gutter="16px">
              @for (region of regionStats(); track region.regionId) {
                <mat-grid-tile>
                  <mat-card class="region-card" (click)="selectRegion(region.regionId)">
                    <mat-card-content>
                      <div class="region-info">
                        <mat-icon>public</mat-icon>
                        <div>
                          <h3>{{ region.regionName }}</h3>
                          <p class="company-count">
                            {{ region.companyCount }} 
                            <span>{{ region.companyCount === 1 ? 'company' : 'companies' }}</span>
                          </p>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </mat-grid-tile>
              }
            </mat-grid-list>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .regions-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .region-card {
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 16px;
      background: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 16px;
    }
    
    .region-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      border-color: rgba(30, 136, 229, 0.2);
    }
    
    .region-card:active {
      transform: translateY(0);
    }
    
    .region-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    
    .region-info mat-icon {
      font-size: 32px;
      color: #f57c00;
    }
    
    .region-info h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
      color: #212121;
    }
    
    .company-count {
      font-size: 24px;
      font-weight: 600;
      color: #2e7d32;
    }
    
    .loading-container, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .loading-container mat-icon,
    .empty-state mat-icon {
      margin-bottom: 16px;
    }
    
    .loading-container p,
    .empty-state p {
      margin: 0;
      font-size: 16px;
    }
    
    @media (max-width: 768px) {
      mat-grid-list {
        cols: 2;
      }
    }
    
    @media (max-width: 480px) {
      mat-grid-list {
        cols: 1;
      }
    }
  `]
})
export class RegionsComponent implements OnInit {
  private statsService = inject(StatsService);
  
  regionStats = signal<RegionStats[]>([]);
  isLoading = signal<boolean>(false);
  selectedRegionId: string | null = null;
  private readonly router = inject(Router);
  
  ngOnInit(): void {
    this.loadRegionStats();
  }
  
  loadRegionStats(): void {
    this.isLoading.set(true);
    this.statsService.getRegionStats().subscribe({
      next: (data) => {
        this.regionStats.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading region stats:', err);
        this.isLoading.set(false);
      }
    });
  }
  
  selectRegion(regionId: string): void {
    this.selectedRegionId = regionId;
    this.router.navigate(['/companies'], { queryParams: { regionId } });
  }
}
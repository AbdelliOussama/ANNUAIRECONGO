import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { StatsService } from '@core/services/stats.service';
import { BusinessOwnerService } from '@core/services/business-owner.service';
import { AuthService } from '@core/services/auth.service';
import { Company, PlatformStats, RegionStats, SectorStats } from '@core/models/company.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule
  ],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>
      
      @if (authService.isAdmin()) {
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-header>
              <mat-card-title>Total Companies</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-value">{{ platformStats()?.totalCompanies || 0 }}</div>
            </mat-card-content>
          </mat-card>
          
          <mat-card class="stat-card">
            <mat-card-header>
              <mat-card-title>Validated Companies</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-value">{{ platformStats()?.totalValidatedCompanies || 0 }}</div>
            </mat-card-content>
          </mat-card>
          
          <mat-card class="stat-card">
            <mat-card-header>
              <mat-card-title>Business Owners</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-value">{{ platformStats()?.totalBusinessOwners || 0 }}</div>
            </mat-card-content>
          </mat-card>
          
          <mat-card class="stat-card">
            <mat-card-header>
              <mat-card-title>Sectors</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-value">{{ platformStats()?.totalSectors || 0 }}</div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="charts-grid">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Companies by Region</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="region-list">
                @for (region of regionStats(); track region.regionId) {
                  <div class="region-item">
                    <span>{{ region.regionName }}</span>
                    <span class="count">{{ region.companyCount }}</span>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>
          
          <mat-card>
            <mat-card-header>
              <mat-card-title>Companies by Sector</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="sector-list">
                @for (sector of sectorStats(); track sector.sectorId) {
                  <div class="sector-item">
                    <span>{{ sector.sectorName }}</span>
                    <span class="count">{{ sector.companyCount }}</span>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      }

      @if (authService.isEntrepriseOwner()) {
        <h2>My Companies</h2>
        <div class="companies-grid">
          @for (company of myCompanies(); track company.id) {
            <mat-card class="company-card" [routerLink]="['/companies', company.id]">
              <img [src]="company.coverUrl || 'assets/placeholder-company.jpg'" alt="{{ company.name }}">
              <mat-card-header>
                <mat-card-title>{{ company.name }}</mat-card-title>
                <mat-card-subtitle>{{ company.cityName }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <mat-chip-set>
                  <mat-chip [class.status-validated]="company.status === 2"
                            [class.status-pending]="company.status === 0"
                            [class.status-submitted]="company.status === 1"
                            [class.status-rejected]="company.status === 3"
                            [class.status-suspended]="company.status === 4">
                    {{ getStatusLabel(company.status) }}
                  </mat-chip>
                  @if (company.isFeatured) {
                    <mat-chip color="accent">Featured</mat-chip>
                  }
                </mat-chip-set>
                <p>{{ company.description | slice:0:100 }}...</p>
              </mat-card-content>
            </mat-card>
          } @empty {
            <div class="no-companies">
              <mat-icon>business</mat-icon>
              <p>You don't have any companies yet.</p>
              <button mat-raised-button color="primary" routerLink="/companies/create">
                <mat-icon>add</mat-icon>
                Add Company
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      
      h1 {
        margin-bottom: 24px;
      }
      
      h2 {
        margin-top: 32px;
        margin-bottom: 16px;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      mat-card-content {
        padding: 16px;
      }
      
      .stat-value {
        font-size: 36px;
        font-weight: bold;
        color: #f57c00;
      }
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .region-list, .sector-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .region-item, .sector-item {
      display: flex;
      justify-content: space-between;
      padding: 12px;
      border-bottom: 1px solid #eee;
      
      .count {
        font-weight: bold;
        color: #f57c00;
      }
    }

    .companies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .company-card {
      cursor: pointer;
      transition: transform 0.2s;
      
      &:hover {
        transform: translateY(-4px);
      }
      
      img {
        width: 100%;
        height: 150px;
        object-fit: cover;
      }
      
      mat-chip-set {
        margin: 8px 0;
      }
      
      .status-validated { background-color: #4caf50; color: white; }
      .status-pending { background-color: #ff9800; color: white; }
      .status-submitted { background-color: #2196f3; color: white; }
      .status-rejected { background-color: #f44336; color: white; }
      .status-suspended { background-color: #9e9e9e; color: white; }
    }

    .no-companies {
      text-align: center;
      padding: 48px;
      
      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #ccc;
      }
      
      p {
        margin: 16px 0;
        color: #666;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private statsService = inject(StatsService);
  private businessOwnerService = inject(BusinessOwnerService);

  platformStats = signal<PlatformStats | null>(null);
  regionStats = signal<RegionStats[]>([]);
  sectorStats = signal<SectorStats[]>([]);
  myCompanies = signal<Company[]>([]);

  ngOnInit(): void {
    if (this.authService.isAdmin()) {
      this.loadStats();
    }
    if (this.authService.isEntrepriseOwner()) {
      this.loadMyCompanies();
    }
  }

  loadStats(): void {
    this.statsService.getPlatformSummary().subscribe(data => this.platformStats.set(data));
    this.statsService.getRegionStats().subscribe(data => this.regionStats.set(data));
    this.statsService.getSectorStats().subscribe(data => this.sectorStats.set(data));
  }

  loadMyCompanies(): void {
    this.businessOwnerService.getMyCompanies().subscribe(data => this.myCompanies.set(data));
  }

  getStatusLabel(status: number): string {
    const labels: { [key: number]: string } = {
      0: 'Pending',
      1: 'Submitted',
      2: 'Validated',
      3: 'Rejected',
      4: 'Suspended'
    };
    return labels[status] || 'Unknown';
  }
}
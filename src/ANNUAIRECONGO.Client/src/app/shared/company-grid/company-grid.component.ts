import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Company } from '@core/models/company.model';

@Component({
  selector: 'app-company-grid',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule
  ],
  template: `
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

      @if (showPagination()) {
        <mat-paginator
          [length]="totalCount()"
          [pageSize]="pageSize"
          [pageIndex]="pageNumber - 1"
          [pageSizeOptions]="[6, 12, 24]"
          (page)="onPageChange($event)"
          aria-label="Select page">
        </mat-paginator>
      }
    }
  `,
  styles: [`
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

    .company-cover-placeholder {
      height: 140px;
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
  `]
})
export class CompanyGridComponent {
  @Input() companies = signal<Company[]>([]);
  @Input() totalCount = signal<number>(0);
  @Input() isLoading = signal<boolean>(false);
  @Input() showPagination = signal<boolean>(true);
  
  @Input() pageNumber = 1;
  @Input() pageSize = 12;

  @Output() pageChange = new EventEmitter<PageEvent>();

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }
}
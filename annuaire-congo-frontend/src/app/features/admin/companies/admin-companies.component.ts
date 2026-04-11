import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CompanyService } from '@core/services/company.service';
import { Company, CompanyStatus } from '@core/models/company.model';

@Component({
  selector: 'app-admin-companies',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatPaginatorModule
  ],
  template: `
    <div class="admin-container">
      <div class="header">
        <h1>Company Management</h1>
      </div>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="companies()">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let company">{{ company.name }}</td>
            </ng-container>

            <ng-container matColumnDef="city">
              <th mat-header-cell *matHeaderCellDef>City</th>
              <td mat-cell *matCellDef="let company">{{ company.cityName || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let company">
                <mat-chip [class]="'status-' + company.status">
                  {{ getStatusLabel(company.status) }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="isFeatured">
              <th mat-header-cell *matHeaderCellDef>Featured</th>
              <td mat-cell *matCellDef="let company">
                {{ company.isFeatured ? 'Yes' : 'No' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef>Created</th>
              <td mat-cell *matCellDef="let company">{{ company.createdAt | date:'short' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let company">
                <button mat-icon-button [routerLink]="['/companies', company.id]">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button color="primary" (click)="validateCompany(company.id)" *ngIf="company.status === 1">
                  <mat-icon>check_circle</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="suspendCompany(company.id)" *ngIf="company.status === 2">
                  <mat-icon>pause_circle</mat-icon>
                </button>
                <button mat-icon-button color="accent" (click)="toggleFeatured(company)" *ngIf="company.status === 2">
                  <mat-icon>{{ company.isFeatured ? 'star' : 'star_border' }}</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
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

    .status-0 { background-color: #ff9800 !important; color: white !important; }
    .status-1 { background-color: #2196f3 !important; color: white !important; }
    .status-2 { background-color: #4caf50 !important; color: white !important; }
    .status-3 { background-color: #f44336 !important; color: white !important; }
    .status-4 { background-color: #9e9e9e !important; color: white !important; }
  `]
})
export class AdminCompaniesComponent implements OnInit {
  private companyService = inject(CompanyService);

  companies = signal<Company[]>([]);
  displayedColumns = ['name', 'city', 'status', 'isFeatured', 'createdAt', 'actions'];

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.companyService.getCompanies({ pageSize: 100 }).subscribe(data => {
      this.companies.set(data.items);
    });
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

  validateCompany(id: string): void {
    this.companyService.submitCompany(id).subscribe(() => this.loadCompanies());
  }

  suspendCompany(id: string): void {
    // Would call suspend endpoint
    this.loadCompanies();
  }

  toggleFeatured(company: Company): void {
    this.companyService.updateCompanyMedia(company.id, company.logoUrl || undefined, company.coverUrl || undefined)
      .subscribe(() => this.loadCompanies());
  }
}
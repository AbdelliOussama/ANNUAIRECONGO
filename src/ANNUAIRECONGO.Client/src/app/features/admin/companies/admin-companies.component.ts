import { Component, inject, OnInit, signal, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '@core/services/company.service';
import { Company, CompanyStatus } from '@core/models/company.model';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog.component';
import { InputDialogComponent } from '@shared/dialogs/input-dialog.component';

@Component({
  selector: 'app-admin-companies',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatPaginatorModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  template: `
    <div class="admin-container">
      <div class="header">
        <h1>Company Management</h1>
        <mat-form-field appearance="outline">
          <mat-label>Filter by Status</mat-label>
          <mat-select [(ngModel)]="statusFilter" (selectionChange)="applyFilter()">
            <mat-option value="">All</mat-option>
            <mat-option value="0">Draft</mat-option>
            <mat-option value="1">Pending</mat-option>
            <mat-option value="2">Active</mat-option>
            <mat-option value="3">Rejected</mat-option>
            <mat-option value="4">Suspended</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="filteredCompanies()">
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
                @if (company.status === 1) {
                  <button mat-icon-button color="primary" (click)="validateCompany(company.id)">
                    <mat-icon>check_circle</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="rejectCompany(company.id)">
                    <mat-icon>cancel</mat-icon>
                  </button>
                }
                @if (company.status === 2) {
                  <button mat-icon-button color="warn" (click)="suspendCompany(company.id)">
                    <mat-icon>pause_circle</mat-icon>
                  </button>
                  <button mat-icon-button color="accent" (click)="toggleFeatured(company)">
                    <mat-icon>{{ company.isFeatured ? 'star' : 'star_border' }}</mat-icon>
                  </button>
                }
                @if (company.status === 4) {
                  <button mat-icon-button color="primary" (click)="reactivateCompany(company.id)">
                    <mat-icon>restore</mat-icon>
                  </button>
                }
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]" showFirstLastButtons></mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./admin-companies.component.scss']
})
export class AdminCompaniesComponent implements OnInit, AfterViewInit {
  private companyService = inject(CompanyService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  companies = signal<Company[]>([]);
  filteredCompanies = signal<Company[]>([]);
  displayedColumns = ['name', 'city', 'status', 'isFeatured', 'createdAt', 'actions'];
  statusFilter = '';

  ngOnInit(): void {
    this.loadCompanies();
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => this.loadPage());
  }

  loadCompanies(): void {
    this.loadPage();
  }

  loadPage(): void {
    const pageIndex = this.paginator?.pageIndex ?? 0;
    const pageSize = this.paginator?.pageSize ?? 10;
    const status = this.statusFilter ? parseInt(this.statusFilter) : null;

    this.companyService.getCompanies({
      pageNumber: pageIndex + 1,
      pageSize: pageSize,
      status: status
    }).subscribe(data => {
      this.companies.set(data.items);
      this.filteredCompanies.set(data.items);
      this.paginator.length = data.totalCount;
    });
  }

  applyFilter(): void {
    this.paginator.pageIndex = 0;
    this.loadPage();
  }

  getStatusLabel(status: number): string {
    const labels: { [key: number]: string } = {
      0: 'Draft',
      1: 'Pending',
      2: 'Active',
      3: 'Rejected',
      4: 'Suspended'
    };
    return labels[status] || 'Unknown';
  }

  validateCompany(id: string): void {
    this.companyService.validateCompany(id).subscribe(() => this.loadCompanies());
  }

  suspendCompany(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Suspend Company', message: 'Are you sure you want to suspend this company?', confirmText: 'Suspend' }
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.companyService.suspendCompany(id).subscribe(() => {
          this.snackBar.open('Company suspended', 'Close', { duration: 3000 });
          this.loadCompanies();
        });
      }
    });
  }

  reactivateCompany(id: string): void {
    this.companyService.reactivateCompany(id).subscribe(() => {
      this.snackBar.open('Company reactivated', 'Close', { duration: 3000 });
      this.loadCompanies();
    });
  }

   rejectCompany(id: string): void {
     const dialogRef = this.dialog.open(InputDialogComponent, {
       data: {
         title: 'Reject Company',
         label: 'Rejection reason',
         placeholder: 'Please provide a reason for rejection',
         confirmText: 'Reject',
         cancelText: 'Cancel'
       }
     });

     dialogRef.afterClosed().subscribe((reason: string | null) => {
       if (reason === null || reason.trim() === '') {
         return;
       }
       this.companyService.rejectCompany(id, reason.trim()).subscribe({
         next: () => {
           this.snackBar.open('Company rejected', 'Close', { duration: 3000 });
           this.loadCompanies();
         },
         error: (err) => this.snackBar.open(err.error?.title || 'Failed to reject', 'Close', { duration: 3000 })
       });
     });
   }

  toggleFeatured(company: Company): void {
    this.companyService.setFeatured(company.id, !company.isFeatured)
      .subscribe(() => this.loadCompanies());
  }
}
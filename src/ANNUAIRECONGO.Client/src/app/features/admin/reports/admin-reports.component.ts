import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CompanyService } from '@core/services/company.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="admin-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Company Reports</mat-card-title>
          <mat-card-subtitle>View and manage reported companies</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          @if (isLoading()) {
            <p>Loading reports...</p>
          } @else if (reports().length === 0) {
            <p>No reports found.</p>
          } @else {
            <table mat-table [dataSource]="reports()" class="full-width">
              <ng-container matColumnDef="companyName">
                <th mat-header-cell *matHeaderCellDef>Company</th>
                <td mat-cell *matCellDef="let report">{{ report.companyName }}</td>
              </ng-container>
              
              <ng-container matColumnDef="reason">
                <th mat-header-cell *matHeaderCellDef>Reason</th>
                <td mat-cell *matCellDef="let report">{{ report.reason }}</td>
              </ng-container>
              
              <ng-container matColumnDef="reporterEmail">
                <th mat-header-cell *matHeaderCellDef>Reporter</th>
                <td mat-cell *matCellDef="let report">{{ report.reporterEmail || 'Anonymous' }}</td>
              </ng-container>
              
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let report">{{ report.createdAt | date:'short' }}</td>
              </ng-container>
              
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let report">
                  <button mat-button color="primary" [routerLink]="['/companies', report.companyId]">
                    View Company
                  </button>
                  <button mat-button color="warn" (click)="dismissReport(report.id)">
                    Dismiss
                  </button>
                </td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-container {
      padding: 24px;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class AdminReportsComponent implements OnInit {
  private companyService = inject(CompanyService);
  private snackBar = inject(MatSnackBar);
  
  reports = signal<any[]>([]);
  isLoading = signal(true);
  displayedColumns = ['companyName', 'reason', 'reporterEmail', 'createdAt', 'actions'];
  
  ngOnInit(): void {
    this.loadReports();
  }
  
  loadReports(): void {
    this.companyService.getCompanyById('').subscribe({
      next: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false)
    });
  }
  
  dismissReport(reportId: string): void {
    this.snackBar.open('Report dismissed', 'Close', { duration: 3000 });
  }
}
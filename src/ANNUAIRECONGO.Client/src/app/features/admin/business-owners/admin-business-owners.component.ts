import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BusinessOwnerService } from '@core/services/business-owner.service';
import { BusinessOwner } from '@core/models/company.model';

@Component({
  selector: 'app-admin-business-owners',
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
          <mat-card-title>Business Owners</mat-card-title>
          <mat-card-subtitle>Manage registered business owners</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          @if (isLoading()) {
            <p>Loading business owners...</p>
          } @else if (owners().length === 0) {
            <p>No business owners found.</p>
          } @else {
            <table mat-table [dataSource]="owners()" class="full-width">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let owner">{{ owner.firstName }} {{ owner.lastName }}</td>
              </ng-container>
              
              <ng-container matColumnDef="phone">
                <th mat-header-cell *matHeaderCellDef>Phone</th>
                <td mat-cell *matCellDef="let owner">{{ owner.phone || '-' }}</td>
              </ng-container>
              
              <ng-container matColumnDef="companyPosition">
                <th mat-header-cell *matHeaderCellDef>Position</th>
                <td mat-cell *matCellDef="let owner">{{ owner.companyPosition || '-' }}</td>
              </ng-container>
              
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let owner">
                  <button mat-button color="primary" (click)="viewCompanies(owner.id)">
                    View Companies
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
export class AdminBusinessOwnersComponent implements OnInit {
  private businessOwnerService = inject(BusinessOwnerService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  
  owners = signal<BusinessOwner[]>([]);
  isLoading = signal(true);
  displayedColumns = ['name', 'phone', 'companyPosition', 'actions'];
  
  ngOnInit(): void {
    this.loadOwners();
  }
  
  loadOwners(): void {
    this.businessOwnerService.getBusinessOwners().subscribe({
      next: (data) => {
        this.owners.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
  
  viewCompanies(ownerId: string): void {
    this.router.navigate(['/companies'], { queryParams: { ownerId } });
  }
}
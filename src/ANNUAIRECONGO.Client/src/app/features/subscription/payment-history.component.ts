import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SubscriptionService } from '@core/services/subscription.service';
import { AuthService } from '@core/services/auth.service';
import { BusinessOwnerService } from '@core/services/business-owner.service';
import { Payment, Company } from '@core/models/company.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  template: `
    <div class="payment-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Payment History</mat-card-title>
          <mat-card-subtitle>View all your payment transactions</mat-card-subtitle>
        </mat-card-header>
        @if (companies().length > 1) {
          <div class="company-selector">
            <mat-form-field appearance="outline">
              <mat-label>Select Company</mat-label>
              <mat-select [value]="selectedCompanyId()" (selectionChange)="onCompanyChange($event.value)">
                @for (company of companies(); track company.id) {
                  <mat-option [value]="company.id">{{ company.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
        }
        <mat-card-content>
          @if (isLoading()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading payment history...</p>
            </div>
          } @else if (payments().length === 0) {
            <div class="empty-state">
              <mat-icon>receipt</mat-icon>
              <p>No payment history found</p>
              <button mat-button color="primary" (click)="refreshPayments()">
                Refresh
              </button>
            </div>
          } @else {
            <div class="table-responsive">
              <table mat-table [dataSource]="payments()" class="mat-elevation-z8">

                <!-- Payment ID Column -->
                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef> Payment ID </th>
                  <td mat-cell *matCellDef="let payment"> {{ payment.id.slice(0, 8) }}...</td>
                </ng-container>

                <!-- Amount Column -->
                <ng-container matColumnDef="amount">
                  <th mat-header-cell *matHeaderCellDef> Amount </th>
                  <td mat-cell *matCellDef="let payment">
                    <span class="payment-amount">{{ payment.amount | currency:'XAF' }}</span>
                  </td>
                </ng-container>

                <!-- Currency Column -->
                <ng-container matColumnDef="currency">
                  <th mat-header-cell *matHeaderCellDef> Currency </th>
                  <td mat-cell *matCellDef="let payment"> {{ payment.currency }} </td>
                </ng-container>

                <!-- Payment Method Column -->
                <ng-container matColumnDef="paymentMethod">
                  <th mat-header-cell *matHeaderCellDef> Method </th>
                  <td mat-cell *matCellDef="let payment">
                    <span class="payment-method-badge">
                      {{ getPaymentMethodLabel(payment.method) }}
                    </span>
                  </td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef> Status </th>
                  <td mat-cell *matCellDef="let payment">
                    <span class="status-badge status-{{ getPaymentStatusKey(payment.status) }}">
                      {{ getPaymentStatusLabel(payment.status) }}
                    </span>
                  </td>
                </ng-container>

                <!-- Date Column -->
                <ng-container matColumnDef="createdAt">
                  <th mat-header-cell *matHeaderCellDef> Date </th>
                  <td mat-cell *matCellDef="let payment">
                    {{ payment.paidAt | date:'medium' }}
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef> Actions </th>
                  <td mat-cell *matCellDef="let payment">
                    @if (payment.status === 0) {
                      <button mat-button color="primary" (click)="confirmPayment(payment.id)">
                        Confirm
                      </button>
                    } @else if (payment.status === 2) {
                      <button mat-button color="warn" (click)="refundPayment(payment.id)">
                        Refund
                      </button>
                    }
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>

              <mat-paginator [length]="totalCount()"
                             [pageSize]="pageSize"
                             [pageIndex]="pageNumber"
                             [pageSizeOptions]="[5, 10, 20]"
                             (page)="onPageChange($event)"
                             aria-label="Select page">
              </mat-paginator>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .payment-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .company-selector {
      padding: 0 16px;
    }

    .company-selector mat-form-field {
      width: 100%;
      max-width: 300px;
    }

    .loading-container, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
    }

    .loading-container mat-icon,
    .empty-state mat-icon {
      font-size: 48px;
      margin-bottom: 24px;
      color: rgba(0, 0, 0, 0.38);
    }

    .loading-container p,
    .empty-state p {
      margin: 0;
      font-size: 18px;
      color: rgba(0, 0, 0, 0.6);
    }

    .table-responsive {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .payment-amount {
      font-weight: 600;
      color: #2e7d32;
    }

    .payment-method-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .payment-method-badge.credit-card {
      background: #e3f2fd;
      color: #1976d2;
    }

    .payment-method-badge.mobile-money {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .payment-method-badge.bank-transfer {
      background: #fff3e0;
      color: #f57c00;
    }

    .payment-method-badge.none {
      background: #f5f5f5;
      color: #666;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-badge.status-0 { /* Pending */
      background: #fff8e1;
      color: #f57c00;
    }

    .status-badge.status-1 { /* Processing */
      background: #e3f2fd;
      color: #1976d2;
    }

    .status-badge.status-2 { /* Completed */
      background: #e8f5e9;
      color: #2e7d32;
    }

    .status-badge.status-3 { /* Failed */
      background: #ffebee;
      color: #d32f2f;
    }

    .status-badge.status-4 { /* Refunded */
      background: #f3e5f5;
      color: #9c27b0;
    }

    .status-badge.status-5 { /* Rejected */
      background: #ffebee;
      color: #d32f2f;
    }

    button.mat-button {
      margin: 0 4px;
      padding: 4px 8px;
      min-width: 60px;
    }

    button.mat-button:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    @media (max-width: 600px) {
      .payment-container {
        padding: 16px;
      }

      table {
        font-size: 14px;
      }

      th.mat-header-cell,
      td.mat-cell {
        padding: 8px !important;
      }
    }
  `]
})
export class PaymentHistoryComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);
  private authService = inject(AuthService);
  private businessOwnerService = inject(BusinessOwnerService);
  private snackBar = inject(MatSnackBar);

  payments = signal<Payment[]>([]);
  totalCount = signal<number>(0);
  isLoading = signal<boolean>(false);
  companies = signal<Company[]>([]);
  selectedCompanyId = signal<string>('');

  pageNumber = 0;
  pageSize = 10;

  displayedColumns: string[] = ['id', 'amount', 'currency', 'paymentMethod', 'status', 'createdAt', 'actions'];

  ngOnInit(): void {
    this.loadPaymentHistory();
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.businessOwnerService.getMyCompanies().subscribe({
      next: (companies) => {
        this.companies.set(companies);
        if (companies.length > 0 && !this.selectedCompanyId()) {
          this.selectedCompanyId.set(companies[0].id);
        }
      }
    });
  }

  onCompanyChange(companyId: string): void {
    this.selectedCompanyId.set(companyId);
    this.loadPaymentHistory();
  }

  loadPaymentHistory(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.isLoading.set(true);

    const companyId = this.selectedCompanyId();
    if (companyId) {
      this.subscriptionService.getCompanyPayments(companyId).subscribe({
        next: (data) => {
          this.payments.set(data);
          this.totalCount.set(data.length);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading payment history:', err);
          this.isLoading.set(false);
          this.snackBar.open('Failed to load payment history', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.isLoading.set(false);
      this.payments.set([]);
      this.totalCount.set(0);
    }
  }

  refreshPayments(): void {
    this.loadPaymentHistory();
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber = event.pageIndex;
    this.pageSize = event.pageSize;
    // Note: For a real implementation, we'd modify the API call to support pagination
    // For now, we're just reloading all data
    this.loadPaymentHistory();
  }

  getPaymentMethodLabel(method: number): string {
    switch (method) {
      case 0: return 'Stripe';
      case 1: return 'MTN MoMo';
      case 2: return 'Airtel Money';
      default: return 'Unknown';
    }
  }

  getPaymentStatusKey(status: number): string {
    switch (status) {
      case 0: return 'pending';
      case 1: return 'processing';
      case 2: return 'completed';
      case 3: return 'failed';
      case 4: return 'refunded';
      case 5: return 'rejected';
      default: return 'unknown';
    }
  }

  getPaymentStatusLabel(status: number): string {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Processing';
      case 2: return 'Completed';
      case 3: return 'Failed';
      case 4: return 'Refunded';
      case 5: return 'Rejected';
      default: return 'Unknown';
    }
  }

  confirmPayment(paymentId: string): void {
    this.subscriptionService.confirmPayment(paymentId).subscribe({
      next: () => {
        this.snackBar.open('Payment confirmed successfully', 'Close', { duration: 3000 });
        this.loadPaymentHistory();
      },
      error: (err) => {
        console.error('Error confirming payment:', err);
        this.snackBar.open('Failed to confirm payment', 'Close', { duration: 3000 });
      }
    });
  }

  refundPayment(paymentId: string): void {
    this.subscriptionService.refundPayment(paymentId).subscribe({
      next: () => {
        this.snackBar.open('Payment refunded successfully', 'Close', { duration: 3000 });
        this.loadPaymentHistory();
      },
      error: (err) => {
        console.error('Error refunding payment:', err);
        this.snackBar.open('Failed to refund payment', 'Close', { duration: 3000 });
      }
    });
  }
}

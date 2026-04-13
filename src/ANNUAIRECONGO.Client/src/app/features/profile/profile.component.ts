import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { BusinessOwnerService } from '@core/services/business-owner.service';
import { AuthService } from '@core/services/auth.service';
import { SubscriptionService } from '@core/services/subscription.service';
import { BusinessOwner, Subscription } from '@core/models/company.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <div class="profile-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>My Profile</mat-card-title>
          <mat-card-subtitle>Manage your account information</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          @if (isLoading()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading profile data...</p>
            </div>
          } @else if (!businessOwner()) {
            <div class="empty-state">
              <mat-icon>person_outline</mat-icon>
              <p>No profile data found</p>
              <button mat-button color="primary" (click)="refreshProfile()">
                Refresh
              </button>
            </div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="saveProfile()">
              <div class="profile-header">
                <div class="profile-avatar">
                  <mat-icon>person</mat-icon>
                </div>
                <div class="profile-info">
                  <h2>{{ businessOwner()?.firstName }} {{ businessOwner()?.lastName }}</h2>
                  <p class="profile-email">{{ authService.currentUser()?.email }}</p>
                </div>
              </div>
              
              <mat-divider></mat-divider>
              
              <div class="form-section">
                <mat-form-field appearance="fill" class="full-width">
                  <mat-label>First Name</mat-label>
                  <input matInput formControlName="firstName" required>
                </mat-form-field>
              </div>
              
              <div class="form-section">
                <mat-form-field appearance="fill" class="full-width">
                  <mat-label>Last Name</mat-label>
                  <input matInput formControlName="lastName" required>
                </mat-form-field>
              </div>
              
              <div class="form-section">
                <mat-form-field appearance="fill" class="full-width">
                  <mat-label>Phone Number</mat-label>
                  <input matInput formControlName="phoneNumber">
                </mat-form-field>
              </div>
              
              <div class="form-section">
                <mat-form-field appearance="fill" class="full-width">
                  <mat-label>Company Position</mat-label>
                  <input matInput formControlName="companyPosition">
                </mat-form-field>
              </div>
              
              <mat-divider></mat-divider>
              
              <div class="info-section">
                <div class="info-item">
                  <mat-icon>email</mat-icon>
                  <span>Email: {{ authService.currentUser()?.email }}</span>
                </div>
                <div class="info-item">
                  <mat-icon>security</mat-icon>
                  <span>Roles: {{ authService.currentUser()?.roles?.join(', ') }}</span>
                </div>
                <div class="info-item">
                  <mat-icon>work</mat-icon>
                  <span>Company Count: {{ businessOwner()?.companyCount }}</span>
                </div>
                <div class="info-item">
                  <mat-icon>subscription</mat-icon>
                  <span>Active Subscriptions: {{ activeSubscriptions()?.length }}</span>
                </div>
              </div>
              
              <div class="form-actions">
                <button mat-button type="button" (click)="resetForm()">
                  Cancel
                </button>
                <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || isSaving()">
                  @if (isSaving()) {
                    <mat-spinner diameter="20"></mat-spinner>
                    Saving...
                  } @else {
                    Save Changes
                  }
                </button>
              </div>
            </form>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
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
    
    .profile-header {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 24px;
    }
    
    .profile-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f57c00, #e65100);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .profile-avatar mat-icon {
      font-size: 40px;
      color: white;
    }
    
    .profile-info h2 {
      margin: 0 0 4px 0;
      font-size: 24px;
      font-weight: 500;
    }
    
    .profile-email {
      margin: 0;
      font-size: 16px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .form-section {
      margin-bottom: 20px;
    }
    
    .info-section {
      display: grid;
      gap: 16px;
      margin: 24px 0;
    }
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    
    .info-item mat-icon {
      font-size: 20px;
      color: #f57c00;
    }
    
    .info-item span {
      font-size: 14px;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
    
    button.mat-button {
      background: transparent;
      color: rgba(0, 0, 0, 0.6);
    }
    
    button.mat-button:hover {
      background: rgba(0, 0, 0, 0.04);
    }
    
    .full-width {
      width: 100%;
    }
  `]
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  private businessOwnerService = inject(BusinessOwnerService);
  private subscriptionService = inject(SubscriptionService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  businessOwner = signal<BusinessOwner | null>(null);
  activeSubscriptions = signal<Subscription[]>([]);
  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phoneNumber: [''],
    companyPosition: ['']
  });
  
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.businessOwnerService.getMyCompanies().subscribe({
      next: (companies) => {
        if (companies.length > 0) {
          this.businessOwnerService.getBusinessOwners().subscribe({
            next: (businessOwners) => {
              const bo = businessOwners.find(b => b.userId === this.authService.currentUser()?.id);
              if (bo) {
                this.businessOwner.set(bo);
                this.form.patchValue({
                  firstName: bo.firstName,
                  lastName: bo.lastName,
                  phoneNumber: bo.phoneNumber || '',
                  companyPosition: bo.companyPosition || ''
                });
                
                // Load subscriptions for this business owner
                this.loadSubscriptions();
              } else {
                this.businessOwner.set(null);
                this.isLoading.set(false);
              }
            },
            error: (err) => {
              console.error('Error loading business owners:', err);
              this.isLoading.set(false);
            }
          });
        } else {
          this.businessOwner.set(null);
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.error('Error loading my companies:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadSubscriptions(): void {
    const businessOwner = this.businessOwner();
    if (businessOwner) {
      // Get companies owned by this business owner to fetch their subscriptions
      this.businessOwnerService.getMyCompanies().subscribe({
        next: (companies) => {
          const companyIds = companies.map(c => c.id);
          // For simplicity, we'll get subscriptions for the first company
          // In a real app, you might want to show subscriptions for all companies
          if (companyIds.length > 0) {
            this.subscriptionService.getCompanySubscriptions(companyIds[0]).subscribe({
              next: (subscriptions) => {
                this.activeSubscriptions.set(subscriptions.filter(s => s.isActive));
                this.isLoading.set(false);
              },
              error: (err) => {
                console.error('Error loading subscriptions:', err);
                this.isLoading.set(false);
              }
            });
          } else {
            this.activeSubscriptions.set([]);
            this.isLoading.set(false);
          }
        },
        error: (err) => {
          console.error('Error loading companies for subscriptions:', err);
          this.isLoading.set(false);
        }
      });
    } else {
      this.isLoading.set(false);
    }
  }

  saveProfile(): void {
    const businessOwner = this.businessOwner();
    if (businessOwner && this.form.valid) {
      this.isSaving.set(true);
      const formValue = this.form.value;
      this.businessOwnerService.updateBusinessOwner(businessOwner.id, {
        firstName: formValue.firstName || '',
        lastName: formValue.lastName || '',
        phoneNumber: formValue.phoneNumber || '',
        companyPosition: formValue.companyPosition || ''
      }).subscribe({
        next: () => {
          this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
          this.isSaving.set(false);
          // Reload profile to reflect any changes
          this.loadProfile();
        },
        error: (err) => {
          console.error('Error updating profile:', err);
          this.snackBar.open('Failed to update profile', 'Close', { duration: 3000 });
          this.isSaving.set(false);
        }
      });
    }
  }

  resetForm(): void {
    const businessOwner = this.businessOwner();
    if (businessOwner) {
      this.form.patchValue({
        firstName: businessOwner.firstName,
        lastName: businessOwner.lastName,
        phoneNumber: businessOwner.phoneNumber || '',
        companyPosition: businessOwner.companyPosition || ''
      });
    }
  }

  refreshProfile(): void {
    this.loadProfile();
  }
}
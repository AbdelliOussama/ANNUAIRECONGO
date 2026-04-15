import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlanService } from '@core/services/plan.service';
import { SubscriptionService } from '@core/services/subscription.service';
import { AuthService } from '@core/services/auth.service';
import { BusinessOwnerService } from '@core/services/business-owner.service';
import { Plan, Company } from '@core/models/company.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-subscription-plans',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="plans-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Choose Your Plan</mat-card-title>
          <mat-card-subtitle>Select the subscription plan that fits your needs</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          @if (isLoading()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading subscription plans...</p>
            </div>
          } @else if (plans().length === 0) {
            <div class="empty-state">
              <mat-icon>error_outline</mat-icon>
              <p>No subscription plans available</p>
            </div>
          } @else {
            <div class="plans-grid">
              @for (plan of plans(); track plan.id) {
                <mat-card class="plan-card" [class.selected]="selectedPlanId === plan.id">
                  <mat-card-content>
                    <div class="plan-header">
                      <h3>{{ plan.name }}</h3>
                      <div class="plan-price">
                        <span>{{ plan.price | currency:'XAF' }}</span>
                        <span>/month</span>
                      </div>
                    </div>
                    
                    <div class="plan-features">
                      <div class="feature-item">
                        <mat-icon>check_circle</mat-icon>
                        <span>Duration: {{ plan.durationDays }} days</span>
                      </div>
                      <div class="feature-item">
                        <mat-icon>image</mat-icon>
                        <span>Max Images: {{ plan.maxImages }}</span>
                      </div>
                      <div class="feature-item">
                        <mat-icon>description</mat-icon>
                        <span>Max Documents: {{ plan.maxDocuments }}</span>
                      </div>
                      @if (plan.hasAnalytics) {
                        <div class="feature-item">
                          <mat-icon>analytics</mat-icon>
                          <span>Analytics Included</span>
                        </div>
                      }
                      @if (plan.hasFeaturedBadge) {
                        <div class="feature-item">
                          <mat-icon>star</mat-icon>
                          <span>Featured Badge</span>
                        </div>
                      }
                      <div class="feature-item">
                        <mat-icon>search</mat-icon>
                        <span>Search Priority: Level {{ plan.searchPriority }}</span>
                      </div>
                    </div>
                    
                    <div class="plan-selection">
                      <mat-radio-group [(ngModel)]="selectedPlanId">
                        <mat-radio-button [value]="plan.id">
                          Select this plan
                        </mat-radio-button>
                      </mat-radio-group>
                    </div>
                  </mat-card-content>
                  <mat-card-actions>
                    <button mat-flat-button color="primary" 
                            [disabled]="selectedPlanId !== plan.id || isSubscribing()"
                            (click)="subscribeToPlan(plan.id)">
                      @if (isSubscribing()) {
                        <mat-spinner diameter="20"></mat-spinner>
                        Subscribing...
                      } @else {
                        Subscribe Now
                      }
                    </button>
                  </mat-card-actions>
                </mat-card>
              }
            </div>
            
            @if (companies().length > 0) {
              <div class="company-selection">
                <h4>Select a company to subscribe</h4>
                <mat-form-field appearance="outline">
                  <mat-label>Choose a company</mat-label>
                  <mat-select [(ngModel)]="selectedCompanyId">
                    @for (company of companies(); track company.id) {
                      <mat-option [value]="company.id">
                        {{ company.name }}
                      </mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
            } @else if (isLoadingCompanies()) {
              <div class="loading-companies">
                <mat-spinner diameter="24"></mat-spinner>
                <p>Loading your companies...</p>
              </div>
            } @else {
              <div class="no-companies">
                <mat-icon>business</mat-icon>
                <p>You don't have any companies yet</p>
                <a mat-button color="primary" routerLink="/companies/create">Create a Company</a>
              </div>
            }
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .plans-container {
      padding: 24px;
      max-width: 1200px;
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
    
    .plans-grid {
      display: grid;
      gap: 24px;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }
    
    .plan-card {
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 16px;
      background: white;
      display: flex;
      flex-direction: column;
    }
    
    .plan-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      border-color: rgba(30, 136, 229, 0.2);
    }
    
    .plan-card.selected {
      border-color: #f57c00;
      box-shadow: 0 8px 24px rgba(245, 124, 0, 0.2);
    }
    
    .plan-card.selected:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(245, 124, 0, 0.25);
    }
    
    .plan-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .plan-header h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
    
    .plan-price {
      display: flex;
      gap: 8px;
      align-items: baseline;
    }
    
    .plan-price span:first-child {
      font-size: 24px;
      font-weight: 600;
      color: #f57c00;
    }
    
    .plan-price span:last-child {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .plan-features {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }
    
    .feature-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .feature-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .plan-selection {
      margin-top: auto;
      padding-top: 16px;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
    }
    
    .mat-radio-button {
      margin: 8px 0;
    }
    
    button.mat-flat-button {
      width: 100%;
      height: 48px;
      font-size: 16px;
      font-weight: 500;
    }
    
    @media (max-width: 768px) {
      .plans-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }
    }
    
    @media (max-width: 480px) {
      .plans-grid {
        grid-template-columns: 1fr;
      }
    }
    
    .company-selection {
      margin-top: 24px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    
    .company-selection h4 {
      margin: 0 0 12px 0;
      font-weight: 500;
    }
    
    .company-selection mat-form-field {
      width: 100%;
      max-width: 400px;
    }
    
    .loading-companies, .no-companies {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 24px;
      padding: 24px;
      text-align: center;
    }
    
    .loading-companies mat-spinner {
      margin-bottom: 12px;
    }
    
    .loading-companies p, .no-companies p {
      margin: 0 0 12px 0;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .no-companies mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      margin-bottom: 8px;
      color: rgba(0, 0, 0, 0.38);
    }
  `]
})
export class SubscriptionPlansComponent implements OnInit {
  private planService = inject(PlanService);
  private subscriptionService = inject(SubscriptionService);
  private authService = inject(AuthService);
  private businessOwnerService = inject(BusinessOwnerService);
  private snackBar = inject(MatSnackBar);

  plans = signal<Plan[]>([]);
  companies = signal<Company[]>([]);
  selectedPlanId = '';
  selectedCompanyId = '';
  isLoading = signal<boolean>(false);
  isLoadingCompanies = signal<boolean>(false);
  isSubscribing = signal<boolean>(false);

  ngOnInit(): void {
    this.loadPlans();
    this.loadCompanies();
  }

  loadPlans(): void {
    this.isLoading.set(true);
    this.planService.getPlans().subscribe({
      next: (data) => {
        this.plans.set(data.filter(plan => plan.isActive));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading plans:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadCompanies(): void {
    this.isLoadingCompanies.set(true);
    this.businessOwnerService.getMyCompanies().subscribe({
      next: (data) => {
        this.companies.set(data);
        this.isLoadingCompanies.set(false);
      },
      error: (err) => {
        console.error('Error loading companies:', err);
        this.isLoadingCompanies.set(false);
      }
    });
  }

  subscribeToPlan(planId: string): void {
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('Please log in to subscribe', 'Close', { duration: 3000 });
      return;
    }

    const companyId = this.selectedCompanyId;
    if (!companyId) {
      this.snackBar.open('Please select a company to subscribe', 'Close', { duration: 3000 });
      return;
    }

    this.isSubscribing.set(true);
    
    const subscribeRequest = {
      companyId: companyId,
      planId: planId,
      method: 1 // Credit card as default
    };

    this.subscriptionService.createSubscription(subscribeRequest).subscribe({
      next: (subscription) => {
        this.snackBar.open('Subscription created successfully!', 'Close', { duration: 3000 });
        this.isSubscribing.set(false);
      },
      error: (err) => {
        console.error('Error creating subscription:', err);
        this.snackBar.open('Failed to create subscription', 'Close', { duration: 3000 });
        this.isSubscribing.set(false);
      }
    });
  }
}
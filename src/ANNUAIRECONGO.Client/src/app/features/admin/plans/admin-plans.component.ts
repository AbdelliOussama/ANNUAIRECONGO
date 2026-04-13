import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PlanService } from '@core/services/plan.service';
import { Plan, PlanName } from '@core/models/company.model';

@Component({
  selector: 'app-admin-plans',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSnackBarModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="admin-container">
      <div class="header">
        <h1>Plan Management</h1>
      </div>

      <div class="plans-grid">
        @for (plan of plans(); track plan.id) {
          <mat-card class="plan-card">
            <mat-card-header>
              <mat-card-title>{{ getPlanName(plan.name) }}</mat-card-title>
              <mat-card-subtitle>{{ plan.isActive ? 'Active' : 'Inactive' }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="plan-price">
                <span class="currency">$</span>
                <span class="amount">{{ plan.price }}</span>
                <span class="duration">/ {{ plan.durationDays }} days</span>
              </div>
              
              <ul class="plan-features">
                <li>Max Images: {{ plan.maxImages }}</li>
                <li>Max Documents: {{ plan.maxDocuments }}</li>
                <li>Has Analytics: {{ plan.hasAnalytics ? 'Yes' : 'No' }}</li>
                <li>Has Featured Badge: {{ plan.hasFeaturedBadge ? 'Yes' : 'No' }}</li>
                <li>Search Priority: {{ plan.searchPriority }}</li>
              </ul>
              
              <div class="plan-actions">
                @if (plan.isActive) {
                  <button mat-stroked-button color="warn" (click)="deactivatePlan(plan.id)">
                    Deactivate
                  </button>
                } @else {
                  <button mat-stroked-button color="primary" (click)="activatePlan(plan.id)">
                    Activate
                  </button>
                }
                <button mat-icon-button (click)="openEditDialog(plan)">
                  <mat-icon>edit</mat-icon>
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        } @empty {
          <p>No plans available.</p>
        }
      </div>

      @if (showDialog()) {
        <div class="dialog-overlay" (click)="closeDialog()">
          <div class="dialog-content" (click)="$event.stopPropagation()">
            <h2>Edit Plan</h2>
            <form (ngSubmit)="savePlan()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Price</mat-label>
                <input matInput type="number" [(ngModel)]="formData.price" name="price" required>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Duration (days)</mat-label>
                <input matInput type="number" [(ngModel)]="formData.durationDays" name="durationDays" required>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Max Images</mat-label>
                <input matInput type="number" [(ngModel)]="formData.maxImages" name="maxImages" required>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Max Documents</mat-label>
                <input matInput type="number" [(ngModel)]="formData.maxDocuments" name="maxDocuments" required>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Search Priority</mat-label>
                <input matInput type="number" [(ngModel)]="formData.searchPriority" name="searchPriority" required>
              </mat-form-field>
              
              <div class="dialog-actions">
                <button mat-button type="button" (click)="closeDialog()">Cancel</button>
                <button mat-raised-button color="primary" type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-container {
      padding: 24px;
    }

    .header {
      margin-bottom: 24px;
    }

    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .plan-card {
      mat-card-content {
        padding: 16px;
      }
    }

    .plan-price {
      font-size: 24px;
      margin: 16px 0;
      
      .currency {
        font-size: 16px;
        vertical-align: top;
      }
      
      .amount {
        font-size: 36px;
        font-weight: bold;
        color: #1976d2;
      }
      
      .duration {
        color: #666;
      }
    }

    .plan-features {
      list-style: none;
      padding: 0;
      margin: 16px 0;
      
      li {
        padding: 4px 0;
        color: #555;
      }
    }

    .plan-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .full-width {
      width: 100%;
      margin-bottom: 8px;
    }

    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .dialog-content {
      background: white;
      padding: 24px;
      border-radius: 8px;
      width: 400px;
      max-width: 90vw;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
  `]
})
export class AdminPlansComponent implements OnInit {
  private planService = inject(PlanService);
  private snackBar = inject(MatSnackBar);

  plans = signal<Plan[]>([]);
  showDialog = signal(false);
  editingPlan = signal<Plan | null>(null);
  
  formData = {
    price: 0,
    durationDays: 0,
    maxImages: 0,
    maxDocuments: 0,
    searchPriority: 0
  };

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.planService.getPlans().subscribe(data => this.plans.set(data));
  }

  getPlanName(name: PlanName): string {
    const names: { [key: number]: string } = {
      0: 'Free',
      1: 'Basic',
      2: 'Premium',
      3: 'Enterprise'
    };
    return names[name] || 'Unknown';
  }

  activatePlan(id: string): void {
    this.planService.activatePlan(id).subscribe(() => {
      this.snackBar.open('Plan activated', 'Close', { duration: 3000 });
      this.loadPlans();
    });
  }

  deactivatePlan(id: string): void {
    this.planService.deactivatePlan(id).subscribe(() => {
      this.snackBar.open('Plan deactivated', 'Close', { duration: 3000 });
      this.loadPlans();
    });
  }

  openEditDialog(plan: Plan): void {
    this.editingPlan.set(plan);
    this.formData = {
      price: plan.price,
      durationDays: plan.durationDays,
      maxImages: plan.maxImages,
      maxDocuments: plan.maxDocuments,
      searchPriority: plan.searchPriority
    };
    this.showDialog.set(true);
  }

  closeDialog(): void {
    this.showDialog.set(false);
    this.editingPlan.set(null);
  }

  savePlan(): void {
    const plan = this.editingPlan();
    if (plan) {
      this.planService.updatePlan(plan.id, {
        name: plan.name,
        ...this.formData,
        hasAnalytics: plan.hasAnalytics,
        hasFeaturedBadge: plan.hasFeaturedBadge
      }).subscribe(() => {
        this.snackBar.open('Plan updated', 'Close', { duration: 3000 });
        this.loadPlans();
        this.closeDialog();
      });
    }
  }
}
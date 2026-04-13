import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BusinessOwnerService } from '@core/services/business-owner.service';
import { AuthService } from '@core/services/auth.service';
import { BusinessOwner } from '@core/models/company.model';

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
    MatSnackBarModule
  ],
  template: `
    <div class="profile-container">
      <h1>My Profile</h1>
      
      @if (businessOwner()) {
        <mat-card>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="saveProfile()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Phone Number</mat-label>
                <input matInput formControlName="phoneNumber">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Company Position</mat-label>
                <input matInput formControlName="companyPosition">
              </mat-form-field>
              
              <div class="readonly-field">
                <label>Email:</label>
                <span>{{ authService.currentUser()?.email }}</span>
              </div>
              
              <div class="readonly-field">
                <label>Roles:</label>
                <span>{{ authService.currentUser()?.roles?.join(', ') }}</span>
              </div>
              
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
                Save Changes
              </button>
            </form>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 24px;
      max-width: 600px;
      margin: 0 auto;
      
      h1 {
        margin-bottom: 24px;
      }
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .readonly-field {
      margin-bottom: 16px;
      
      label {
        display: block;
        font-weight: 500;
        color: #666;
        margin-bottom: 4px;
      }
      
      span {
        display: block;
        font-size: 16px;
      }
    }

    button[type="submit"] {
      margin-top: 16px;
    }
  `]
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  private businessOwnerService = inject(BusinessOwnerService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  businessOwner = signal<BusinessOwner | null>(null);
  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phoneNumber: [''],
    companyPosition: ['']
  });

   ngOnInit(): void {
     this.businessOwnerService.getMyCompanies().subscribe(companies => {
       if (companies.length > 0) {
         this.businessOwnerService.getBusinessOwners().subscribe(businessOwners => {
           const bo = businessOwners.find(b => b.userId === this.authService.currentUser()?.id);
           if (bo) {
             this.businessOwner.set(bo);
             this.form.patchValue({
               firstName: bo.firstName,
               lastName: bo.lastName,
               phoneNumber: bo.phoneNumber || '',
               companyPosition: bo.companyPosition || ''
             });
           }
         });
       }
     });
   }

  saveProfile(): void {
    const businessOwner = this.businessOwner();
    if (businessOwner && this.form.valid) {
      const formValue = this.form.value;
      this.businessOwnerService.updateBusinessOwner(businessOwner.id, {
        firstName: formValue.firstName || '',
        lastName: formValue.lastName || '',
        phoneNumber: formValue.phoneNumber || '',
        companyPosition: formValue.companyPosition || ''
      }).subscribe(() => {
        this.snackBar.open('Profile updated', 'Close', { duration: 3000 });
      });
    }
   }
}
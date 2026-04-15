import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CompanyService } from '@core/services/company.service';
import { GeographyService } from '@core/services/geography.service';
import { SectorService } from '@core/services/sector.service';
import { Region, City } from '@core/models/geography.model';
import { Sector } from '@core/models/company.model';

@Component({
  selector: 'app-create-company',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
    MatCheckboxModule
  ],
  template: `
    <div class="create-company-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Create New Company</mat-card-title>
          <mat-card-subtitle>Add your company to the directory</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="companyForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Company Name</mat-label>
              <input matInput formControlName="name" placeholder="Enter company name">
              <mat-error *ngIf="companyForm.get('name')?.hasError('required')">Company name is required</mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="4" placeholder="Describe your company"></textarea>
            </mat-form-field>
            
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Region</mat-label>
                <mat-select formControlName="regionId" (selectionChange)="onRegionChange($event.value)">
                  @for (region of regions(); track region.id) {
                    <mat-option [value]="region.id">{{ region.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>City</mat-label>
                <mat-select formControlName="cityId" [disabled]="!cities().length">
                  @for (city of cities(); track city.id) {
                    <mat-option [value]="city.id">{{ city.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Address</mat-label>
              <input matInput formControlName="address" placeholder="Street address">
            </mat-form-field>
            
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Latitude</mat-label>
                <input matInput type="number" formControlName="latitude" step="0.000001">
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Longitude</mat-label>
                <input matInput type="number" formControlName="longitude" step="0.000001">
              </mat-form-field>
            </div>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Sectors</mat-label>
              <mat-select formControlName="sectorIds" multiple>
                @for (sector of sectors(); track sector.sectorId) {
                  <mat-option [value]="sector.sectorId">{{ sector.name }}</mat-option>
                }
              </mat-select>
              <mat-hint>Select one or more sectors</mat-hint>
            </mat-form-field>
            
            <div class="form-actions">
              <button mat-button type="button" routerLink="/dashboard">Cancel</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="isSubmitting() || companyForm.invalid">
                @if (isSubmitting()) {
                  <mat-spinner diameter="20"></mat-spinner>
                  Creating...
                } @else {
                  Create Company
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .create-company-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    mat-card-header {
      margin-bottom: 24px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .form-row {
      display: flex;
      gap: 16px;
    }
    
    .form-row mat-form-field {
      flex: 1;
    }
    
    form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 16px;
    }
    
    .form-actions button[type="submit"] {
      min-width: 150px;
    }
    
    @media (max-width: 600px) {
      .form-row {
        flex-direction: column;
      }
    }
  `]
})
export class CreateCompanyComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private companyService = inject(CompanyService);
  private geographyService = inject(GeographyService);
  private sectorService = inject(SectorService);
  private snackBar = inject(MatSnackBar);
  
  regions = signal<Region[]>([]);
  cities = signal<City[]>([]);
  sectors = signal<Sector[]>([]);
  isSubmitting = signal(false);
  isLoading = signal(true);
  
  companyForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    regionId: [''],
    cityId: [''],
    address: [''],
    latitude: [null],
    longitude: [null],
    sectorIds: [[]]
  });
  
  ngOnInit(): void {
    this.loadData();
  }
  
  loadData(): void {
    this.geographyService.getRegions().subscribe({
      next: (regions) => {
        this.regions.set(regions);
      }
    });
    
    this.sectorService.getSectors().subscribe({
      next: (sectors) => {
        this.sectors.set(sectors);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
  
  onRegionChange(regionId: string): void {
    this.companyForm.patchValue({ cityId: '' });
    this.cities.set([]);
    
    if (regionId) {
      this.geographyService.getCitiesByRegion(regionId).subscribe({
        next: (cities) => {
          this.cities.set(cities);
        }
      });
    }
  }
  
  onSubmit(): void {
    if (this.companyForm.invalid) return;
    
    this.isSubmitting.set(true);
    const formValue = this.companyForm.value;
    
    const request = {
      name: formValue.name,
      description: formValue.description || undefined,
      cityId: formValue.cityId || undefined,
      address: formValue.address || undefined,
      latitude: formValue.latitude || undefined,
      longitude: formValue.longitude || undefined,
      sectorIds: formValue.sectorIds || []
    };
    
    this.companyService.createCompany(request).subscribe({
      next: (company) => {
        this.snackBar.open('Company created successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/companies', company.id]);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.snackBar.open(error.error?.title || 'Failed to create company', 'Close', { duration: 3000 });
      }
    });
  }
}
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-service-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="service-dialog">
      <form [formGroup]="serviceForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Service Title</mat-label>
          <input matInput formControlName="title" placeholder="Enter service title">
          <mat-error *ngIf="serviceForm.get('title')?.hasError('required')">
            Title is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Describe the service (optional)"></textarea>
        </mat-form-field>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">Cancel</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="serviceForm.invalid">
            Add Service
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .service-dialog {
      padding: 16px;
    }
    .full-width {
      width: 100%;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
  `]
})
export class ServiceDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ServiceDialogComponent>);

  serviceForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: ['']
  });

  onSubmit(): void {
    if (this.serviceForm.valid) {
      this.dialogRef.close(this.serviceForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

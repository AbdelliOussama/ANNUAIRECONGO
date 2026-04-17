import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContactType } from '@core/models/company.model';

interface ContactDialogData {
  contact?: {
    type: ContactType;
    value: string;
    isPrimary: boolean;
  };
}

@Component({
  selector: 'app-contact-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  template: `
    <div class="contact-dialog">
      <form [formGroup]="contactForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Contact Type</mat-label>
          <mat-select formControlName="type">
            @for (type of contactTypes(); track type.value) {
              <mat-option [value]="type.value">{{ type.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Contact Value</mat-label>
          <input matInput formControlName="value" placeholder="Enter contact details">
          <mat-error *ngIf="contactForm.get('value')?.hasError('required')">
            Value is required
          </mat-error>
        </mat-form-field>

        <div class="checkbox-field">
          <mat-checkbox formControlName="isPrimary">Set as primary contact</mat-checkbox>
        </div>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">Cancel</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="contactForm.invalid">
            Save
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .contact-dialog {
      padding: 16px;
    }
    .full-width {
      width: 100%;
    }
    .checkbox-field {
      margin: 8px 0;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
  `]
})
export class ContactDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ContactDialogComponent>);
  private data = inject(MAT_DIALOG_DATA, { optional: true }) as ContactDialogData;

  contactTypes = () => [
    { value: ContactType.Phone, label: 'Phone' },
    { value: ContactType.Email, label: 'Email' },
    { value: ContactType.Website, label: 'Website' },
    { value: ContactType.Facebook, label: 'Facebook' },
    { value: ContactType.Instagram, label: 'Instagram' },
    { value: ContactType.LinkedIn, label: 'LinkedIn' },
    { value: ContactType.WhatsApp, label: 'WhatsApp' },
    { value: ContactType.Twitter, label: 'Twitter' }
  ];

  contactForm: FormGroup = this.fb.group({
    type: [ContactType.Phone, Validators.required],
    value: ['', Validators.required],
    isPrimary: [false]
  });

  constructor() {
    if (this.data?.contact) {
      this.contactForm.patchValue({
        type: this.data.contact.type,
        value: this.data.contact.value,
        isPrimary: this.data.contact.isPrimary
      });
    }
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.dialogRef.close(this.contactForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

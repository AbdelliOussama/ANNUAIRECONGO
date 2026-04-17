import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UploadService } from '@core/services/upload.service';

interface DocumentTypeOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-document-dialog',
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
    <div class="document-dialog">
      <form [formGroup]="documentForm" (ngSubmit)="onSubmit()">
        <div class="file-input-wrapper">
          <label for="documentFile">Select Document</label>
          <input type="file" id="documentFile" (change)="onFileSelected($event)" />
        </div>

        @if (fileName()) {
          <div class="file-info">
            Selected: {{ fileName() }}
          </div>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Document Type</mat-label>
          <mat-select formControlName="documentType">
            @for (type of documentTypes; track type.value) {
              <mat-option [value]="type.value">{{ type.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description (optional)</mat-label>
          <input matInput formControlName="description" placeholder="Enter description">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>
            <mat-checkbox formControlName="isPublic">Make this document public</mat-checkbox>
          </mat-label>
        </mat-form-field>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">Cancel</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="!documentFile()">
            Add Document
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .document-dialog {
      padding: 16px;
    }
    .full-width {
      width: 100%;
    }
    .file-input-wrapper {
      margin-bottom: 16px;
      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
      }
      input[type="file"] {
        width: 100%;
        padding: 8px 0;
      }
    }
    .file-info {
      margin: 8px 0;
      font-style: italic;
      color: rgba(0,0,0,0.6);
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
  `]
})
export class DocumentDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<DocumentDialogComponent>);
  private uploadService = inject(UploadService);

  documentFile = signal<File | null>(null);
  fileName = signal<string>('');

  documentTypes: DocumentTypeOption[] = [
    { value: 'RCCM', label: 'RCCM' },
    { value: 'NIF', label: 'NIF' },
    { value: 'Patent', label: 'Patent' },
    { value: 'Other', label: 'Other' }
  ];

  documentForm: FormGroup = this.fb.group({
    documentType: ['Other'],
    description: [''],
    isPublic: [false]
  });

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.documentFile.set(file);
      this.fileName.set(file.name);
    }
  }

  onSubmit(): void {
    if (!this.documentFile()) return;

    this.uploadService.toBase64(this.documentFile()!).then(base64 => {
      this.dialogRef.close({
        documentUrl: base64,
        documentType: this.documentForm.value.documentType,
        description: this.documentForm.value.description,
        isPublic: this.documentForm.value.isPublic
      });
    }).catch(err => {
      console.error('Error reading document file:', err);
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

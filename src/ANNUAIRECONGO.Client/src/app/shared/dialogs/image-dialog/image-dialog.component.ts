import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UploadService } from '@core/services/upload.service';

@Component({
  selector: 'app-image-dialog',
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
    <div class="image-dialog">
      <form [formGroup]="imageForm" (ngSubmit)="onSubmit()">
        <div class="file-input-wrapper">
          <label for="imageFile">Select Image</label>
          <input type="file" id="imageFile" (change)="onFileSelected($event)" accept="image/*" />
        </div>

        @if (previewUrl()) {
          <div class="preview">
            <img [src]="previewUrl()" alt="Image preview" />
          </div>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Caption (optional)</mat-label>
          <input matInput formControlName="caption" placeholder="Enter caption">
        </mat-form-field>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">Cancel</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="!imageFile()">
            Add Image
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .image-dialog {
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
    .preview {
      margin: 16px 0;
      text-align: center;
      img {
        max-width: 100%;
        max-height: 200px;
        border-radius: 8px;
      }
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
  `]
})
export class ImageDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ImageDialogComponent>);
  private uploadService = inject(UploadService);

  imageFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);

  imageForm: FormGroup = this.fb.group({
    caption: ['']
  });

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.imageFile.set(file);
      this.uploadService.toBase64(file).then(base64 => {
        this.previewUrl.set(base64);
      }).catch(err => {
        console.error('Error reading file:', err);
      });
    }
  }

  onSubmit(): void {
    if (this.imageFile()) {
      this.dialogRef.close({
        imageUrl: this.previewUrl(),
        caption: this.imageForm.value.caption
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

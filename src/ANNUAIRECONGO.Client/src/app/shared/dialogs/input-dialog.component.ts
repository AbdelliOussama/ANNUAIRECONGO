import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface InputDialogData {
  title: string;
  label: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-input-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>{{ data.label }}</mat-label>
        <input matInput [(ngModel)]="value" [placeholder]="data.placeholder || ''">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(null)">{{ data.cancelText || 'Cancel' }}</button>
      <button mat-raised-button color="primary" (click)="dialogRef.close(value)" [disabled]="!value?.trim()">{{ data.confirmText || 'Submit' }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-form-field { width: 100%; min-width: 300px; }
  `]
})
export class InputDialogComponent {
  dialogRef = inject(MatDialogRef<InputDialogComponent>);
  data: InputDialogData = inject(MAT_DIALOG_DATA);
  value = '';
}
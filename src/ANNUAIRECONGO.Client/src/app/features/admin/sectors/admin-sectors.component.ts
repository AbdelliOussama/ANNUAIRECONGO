import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { SectorService } from '@core/services/sector.service';
import { Sector } from '@core/models/company.model';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog.component';

@Component({
  selector: 'app-admin-sectors',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule
  ],
  template: `
    <div class="admin-container">
      <div class="header">
        <h1>Sector Management</h1>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Add Sector
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="sectors()">
            <ng-container matColumnDef="sectorId">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let sector">{{ sector.sectorId }}</td>
            </ng-container>

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let sector">{{ sector.name }}</td>
            </ng-container>

            <ng-container matColumnDef="iconUrl">
              <th mat-header-cell *matHeaderCellDef>Icon</th>
              <td mat-cell *matCellDef="let sector">
                <img *ngIf="sector.iconUrl" [src]="sector.iconUrl" class="icon-preview" alt="icon">
                <span *ngIf="!sector.iconUrl">-</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let sector">{{ sector.description || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="isActive">
              <th mat-header-cell *matHeaderCellDef>Active</th>
              <td mat-cell *matCellDef="let sector">
                <span [class.active]="sector.isActive" [class.inactive]="!sector.isActive">
                  {{ sector.isActive ? 'Yes' : 'No' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let sector">
                <button mat-icon-button color="primary" (click)="openEditDialog(sector)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteSector(sector.sectorId)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      @if (showDialog()) {
        <div class="dialog-overlay" (click)="closeDialog()">
          <div class="dialog-content" (click)="$event.stopPropagation()">
            <h2>{{ editingSector() ? 'Edit Sector' : 'Create Sector' }}</h2>
            <form (ngSubmit)="saveSector()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Name</mat-label>
                <input matInput [(ngModel)]="formData.name" name="name" required>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Icon URL</mat-label>
                <input matInput [(ngModel)]="formData.iconUrl" name="iconUrl">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput [(ngModel)]="formData.description" name="description" rows="3"></textarea>
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
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .icon-preview {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }

    .active { color: green; font-weight: 500; }
    .inactive { color: red; font-weight: 500; }

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
export class AdminSectorsComponent implements OnInit {
  private sectorService = inject(SectorService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  sectors = signal<Sector[]>([]);
  showDialog = signal(false);
  editingSector = signal<Sector | null>(null);
  displayedColumns = ['sectorId', 'name', 'iconUrl', 'description', 'isActive', 'actions'];
  
  formData = { name: '', iconUrl: '', description: '' };

  ngOnInit(): void {
    this.loadSectors();
  }

  loadSectors(): void {
    this.sectorService.getSectors().subscribe(data => this.sectors.set(data));
  }

  openCreateDialog(): void {
    this.editingSector.set(null);
    this.formData = { name: '', iconUrl: '', description: '' };
    this.showDialog.set(true);
  }

  openEditDialog(sector: Sector): void {
    this.editingSector.set(sector);
    this.formData = { name: sector.name, iconUrl: sector.iconUrl || '', description: sector.description || '' };
    this.showDialog.set(true);
  }

  closeDialog(): void {
    this.showDialog.set(false);
    this.editingSector.set(null);
  }

  saveSector(): void {
    const sector = this.editingSector();
    if (sector) {
      this.sectorService.updateSector(sector.sectorId, this.formData.name, this.formData.iconUrl, this.formData.description)
        .subscribe(() => {
          this.snackBar.open('Sector updated', 'Close', { duration: 3000 });
          this.loadSectors();
          this.closeDialog();
        });
    } else {
      this.sectorService.createSector(this.formData.name, this.formData.iconUrl, this.formData.description)
        .subscribe(() => {
          this.snackBar.open('Sector created', 'Close', { duration: 3000 });
          this.loadSectors();
          this.closeDialog();
        });
    }
  }

  deleteSector(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Sector', message: 'Are you sure you want to delete this sector?', confirmText: 'Delete' }
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.sectorService.deleteSector(id).subscribe(() => {
          this.snackBar.open('Sector deleted', 'Close', { duration: 3000 });
          this.loadSectors();
        });
      }
    });
  }
}
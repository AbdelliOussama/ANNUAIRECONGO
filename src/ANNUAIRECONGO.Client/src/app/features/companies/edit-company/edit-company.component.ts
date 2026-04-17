import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { CompanyService } from '@core/services/company.service';
import { GeographyService } from '@core/services/geography.service';
import { SectorService } from '@core/services/sector.service';
import { AuthService } from '@core/services/auth.service';
import { UploadService } from '@core/services/upload.service';
import { Region, City } from '@core/models/geography.model';
import { Company, Sector, CompanyContact, CompanyService as CompanyServiceModel, CompanyImage, CompanyDocument, ContactType, DocumentType } from '@core/models/company.model';
import { ConfirmDialogComponent } from '@shared/dialogs/confirm-dialog.component';
import { ServiceDialogComponent } from '@shared/dialogs/service-dialog/service-dialog.component';
import { ContactDialogComponent } from '@shared/dialogs/contact-dialog/contact-dialog.component';
import { ImageDialogComponent } from '@shared/dialogs/image-dialog/image-dialog.component';
import { DocumentDialogComponent } from '@shared/dialogs/document-dialog/document-dialog.component';

@Component({
  selector: 'app-edit-company',
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
    MatTabsModule,
    MatDialogModule,
    MatListModule
  ],
  template: `
    <div class="edit-company-container">
      <mat-card>
        <mat-card-header>
          <button mat-icon-button routerLink="/companies/{{ companyId }}">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <mat-card-title>Edit Company Profile</mat-card-title>
          <mat-card-subtitle>Update your company information</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (isLoading()) {
            <div class="loading">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading company...</p>
            </div>
          } @else {
            <mat-tab-group>
              <mat-tab label="Basic Info">
                <form [formGroup]="companyForm" (ngSubmit)="onSubmit()">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Company Name</mat-label>
                    <input matInput formControlName="name">
                    <mat-error *ngIf="companyForm.get('name')?.hasError('required')">Company name is required</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Description</mat-label>
                    <textarea matInput formControlName="description" rows="4"></textarea>
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
                      <mat-select formControlName="cityId">
                        @for (city of cities(); track city.id) {
                          <mat-option [value]="city.id">{{ city.name }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Address</mat-label>
                    <input matInput formControlName="address">
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
                  </mat-form-field>

                  <div class="form-actions">
                    <button mat-button type="button" routerLink="/companies/{{ companyId }}">Cancel</button>
                    <button mat-flat-button color="primary" type="submit" [disabled]="isSubmitting() || companyForm.invalid">
                      @if (isSubmitting()) {
                        <mat-spinner diameter="20"></mat-spinner>
                        Saving...
                      } @else {
                        Save Changes
                      }
                    </button>
                  </div>
                </form>
              </mat-tab>

              <mat-tab label="Media">
                <div class="media-tab">
                  <div class="media-section">
                    <h3>Logo</h3>
                    @if (logoBase64() || originalLogoUrl()) {
                      <img [src]="logoBase64() || originalLogoUrl()" alt="Logo" class="media-preview" />
                    } @else {
                      <div class="media-placeholder">No logo</div>
                    }
                    <input type="file" #logoFileInput accept="image/*" (change)="onLogoFileSelected($event)" style="display:none" />
                    <button mat-raised-button (click)="logoFileInput.click()" [disabled]="isSubmitting()">Choose Logo</button>
                    @if (logoBase64()) {
                      <button mat-button color="warn" (click)="clearLogo()">Clear</button>
                    }
                  </div>

                  <div class="media-section">
                    <h3>Cover Image</h3>
                    @if (coverBase64() || originalCoverUrl()) {
                      <img [src]="coverBase64() || originalCoverUrl()" alt="Cover" class="media-preview" />
                    } @else {
                      <div class="media-placeholder">No cover image</div>
                    }
                    <input type="file" #coverFileInput accept="image/*" (change)="onCoverFileSelected($event)" style="display:none" />
                    <button mat-raised-button (click)="coverFileInput.click()" [disabled]="isSubmitting()">Choose Cover</button>
                    @if (coverBase64()) {
                      <button mat-button color="warn" (click)="clearCover()">Clear</button>
                    }
                  </div>

                  <div class="form-actions">
                    <button mat-button type="button" routerLink="/companies/{{ companyId }}">Cancel</button>
                    <button mat-flat-button color="primary" (click)="onMediaSubmit()" [disabled]="isSubmitting() || !hasMediaChanges()">
                      @if (isSubmitting()) {
                        <mat-spinner diameter="20"></mat-spinner>
                        Saving...
                      } @else {
                        Save Media
                      }
                    </button>
                  </div>
                </div>
              </mat-tab>

              <mat-tab label="Contacts">
                <div class="contacts-tab">
                  <div class="contacts-header">
                    <button mat-raised-button color="primary" (click)="openContactDialog()">
                      <mat-icon>add</mat-icon>
                      Add Contact
                    </button>
                  </div>

                  @if (contacts().length === 0) {
                    <div class="no-contacts">
                      <mat-icon>contacts</mat-icon>
                      <p>No contacts yet</p>
                    </div>
                  } @else {
                    <mat-list>
                      @for (contact of contacts(); track contact.id) {
                        <mat-list-item>
                          <mat-icon matListItemIcon>{{ getContactTypeIcon(contact.type) }}</mat-icon>
                          <span matListItemTitle>{{ contact.value }}</span>
                          <span matListItemLine>{{ getContactTypeLabel(contact.type) }}</span>
                          <button mat-icon-button matListItemMeta (click)="editContact(contact)">
                            <mat-icon>edit</mat-icon>
                          </button>
                          <button mat-icon-button matListItemMeta (click)="deleteContact(contact.id)">
                            <mat-icon>delete</mat-icon>
                          </button>
                        </mat-list-item>
                      }
                    </mat-list>
                  }
                </div>
              </mat-tab>

              <mat-tab label="Documents">
                <div class="contacts-tab">
                  <div class="contacts-header">
                    <button mat-raised-button color="primary" (click)="addDocument()">
                      <mat-icon>add</mat-icon>
                      Add Document
                    </button>
                  </div>

                  @if (documents().length === 0) {
                    <div class="no-contacts">
                      <mat-icon>description</mat-icon>
                      <p>No documents yet</p>
                    </div>
                  } @else {
                    <mat-list>
                      @for (doc of documents(); track doc.id) {
                        <mat-list-item>
                          <mat-icon matListItemIcon>description</mat-icon>
                          <span matListItemTitle>{{ getDocumentTypeLabel(doc.docType) }}</span>
                          <a matListItemMeta [href]="doc.fileUrl" target="_blank">
                            <mat-icon>open_in_new</mat-icon>
                          </a>
                          <button mat-icon-button matListItemMeta (click)="deleteDocument(doc.id)">
                            <mat-icon>delete</mat-icon>
                          </button>
                        </mat-list-item>
                      }
                    </mat-list>
                  }
                </div>
              </mat-tab>

              <mat-tab label="Services">
                <div class="contacts-tab">
                  <div class="contacts-header">
                    <button mat-raised-button color="primary" (click)="addService()">
                      <mat-icon>add</mat-icon>
                      Add Service
                    </button>
                  </div>

                  @if (services().length === 0) {
                    <div class="no-contacts">
                      <mat-icon>build</mat-icon>
                      <p>No services yet</p>
                    </div>
                  } @else {
                    <mat-list>
                      @for (service of services(); track service.id) {
                        <mat-list-item>
                          <mat-icon matListItemIcon>check_circle</mat-icon>
                          <span matListItemTitle>{{ service.title }}</span>
                          @if (service.description) {
                            <span matListItemLine>{{ service.description }}</span>
                          }
                          <button mat-icon-button matListItemMeta (click)="deleteService(service.id)">
                            <mat-icon>delete</mat-icon>
                          </button>
                        </mat-list-item>
                      }
                    </mat-list>
                  }
                </div>
              </mat-tab>

              <mat-tab label="Images">
                <div class="contacts-tab">
                  <div class="contacts-header">
                    <button mat-raised-button color="primary" (click)="addImage()">
                      <mat-icon>add</mat-icon>
                      Add Image
                    </button>
                  </div>

                  @if (images().length === 0) {
                    <div class="no-contacts">
                      <mat-icon>image</mat-icon>
                      <p>No images yet</p>
                    </div>
                  } @else {
                    <div class="images-grid">
                      @for (image of images(); track image.id) {
                        <mat-card class="image-card">
                          <img [src]="image.imageUrl" alt="Company image">
                          <mat-card-actions>
                            <button mat-icon-button (click)="deleteImage(image.id)">
                              <mat-icon>delete</mat-icon>
                            </button>
                          </mat-card-actions>
                        </mat-card>
                      }
                    </div>
                  }
                </div>
              </mat-tab>
            </mat-tab-group>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .edit-company-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    mat-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    mat-card-header mat-card-title {
      margin: 0;
    }

    mat-card-header mat-card-subtitle {
      margin: 0;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
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
      padding-top: 16px;
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

    .contacts-tab {
      padding: 16px;
    }

    .contacts-header {
      margin-bottom: 16px;
    }

    .no-contacts {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px;
      color: rgba(0, 0, 0, 0.6);
    }

    .no-contacts mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
    }

    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 16px;
    }

    .image-card {
      img {
        width: 100%;
        height: 120px;
        object-fit: cover;
      }
    }

    /* Media tab styles */
    .media-tab {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .media-section {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }

      .media-preview {
        max-width: 200px;
        max-height: 150px;
        object-fit: contain;
        border-radius: 8px;
        border: 1px solid #ddd;
      }

      .media-placeholder {
        width: 200px;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f5f5;
        color: #999;
        border-radius: 8px;
        border: 1px dashed #ccc;
      }
    }
  `]
})
export class EditCompanyComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private companyService = inject(CompanyService);
  private geographyService = inject(GeographyService);
  private sectorService = inject(SectorService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private uploadService = inject(UploadService);

  companyId = '';
  regions = signal<Region[]>([]);
  cities = signal<City[]>([]);
  sectors = signal<Sector[]>([]);
  contacts = signal<CompanyContact[]>([]);
  services = signal<CompanyServiceModel[]>([]);
  images = signal<CompanyImage[]>([]);
  documents = signal<CompanyDocument[]>([]);
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

  // Media handling signals
  logoBase64 = signal<string | null>(null);
  coverBase64 = signal<string | null>(null);
  originalLogoUrl = signal<string>('');
  originalCoverUrl = signal<string>('');

  ngOnInit(): void {
    this.companyId = this.route.snapshot.params['id'];
    this.loadData();
  }

  onRegionChange(regionId: string): void {
    if (regionId) {
      this.geographyService.getCitiesByRegion(regionId).subscribe({
        next: (cities) => this.cities.set(cities)
      });
    } else {
      this.cities.set([]);
    }
  }

  hasMediaChanges(): boolean {
    return !!this.logoBase64() || !!this.coverBase64();
  }

  onLogoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.uploadService.toBase64(file).then(base64 => {
        this.logoBase64.set(base64);
      }).catch(err => {
        console.error('Error reading logo file:', err);
        this.snackBar.open('Failed to read logo file', 'Close', { duration: 3000 });
      });
    }
  }

  onCoverFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.uploadService.toBase64(file).then(base64 => {
        this.coverBase64.set(base64);
      }).catch(err => {
        console.error('Error reading cover file:', err);
        this.snackBar.open('Failed to read cover file', 'Close', { duration: 3000 });
      });
    }
  }

  clearLogo(): void {
    this.logoBase64.set(null);
  }

  clearCover(): void {
    this.coverBase64.set(null);
  }

  onMediaSubmit(): void {
    this.isSubmitting.set(true);
    const logoUrl = this.logoBase64() || this.originalLogoUrl() || undefined;
    const coverUrl = this.coverBase64() || this.originalCoverUrl() || undefined;

    this.companyService.updateCompanyMedia(this.companyId, logoUrl, coverUrl).subscribe({
      next: () => {
        this.snackBar.open('Media updated successfully!', 'Close', { duration: 3000 });
        this.loadData(); // Refresh original URLs and clear base64 overrides
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.snackBar.open(error.error?.title || 'Failed to update media', 'Close', { duration: 3000 });
      }
    });
  }

  openContactDialog(contact?: CompanyContact): void {
    const dialogRef = this.dialog.open(ContactDialogComponent, {
      width: '400px',
      data: contact ? { contact } : undefined
    });

    dialogRef.afterClosed().subscribe((result: { type: ContactType; value: string; isPrimary: boolean } | undefined) => {
      if (!result) return;
      if (contact) {
        this.companyService.updateContact(this.companyId, contact.id, result.type, result.value, result.isPrimary).subscribe({
          next: () => this.loadCompany(),
          error: (err) => this.snackBar.open(err.error?.title || 'Failed to update contact', 'Close', { duration: 3000 })
        });
      } else {
        this.companyService.addContact(this.companyId, result.type, result.value, result.isPrimary).subscribe({
          next: () => this.loadCompany(),
          error: (err) => this.snackBar.open(err.error?.title || 'Failed to add contact', 'Close', { duration: 3000 })
        });
      }
    });
  }

  editContact(contact: CompanyContact): void {
    this.openContactDialog(contact);
  }

  deleteContact(contactId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Contact',
        message: 'Are you sure you want to delete this contact?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.companyService.removeContact(this.companyId, contactId).subscribe({
          next: () => this.loadCompany(),
          error: (err) => this.snackBar.open(err.error?.title || 'Failed to delete contact', 'Close', { duration: 3000 })
        });
      }
    });
  }

  getContactTypeIcon(type: number): string {
    const icons: { [key: number]: string } = {
      [ContactType.Phone]: 'phone',
      [ContactType.Email]: 'email',
      [ContactType.Website]: 'language',
      [ContactType.Facebook]: 'facebook',
      [ContactType.Instagram]: 'camera_alt',
      [ContactType.LinkedIn]: 'business',
      [ContactType.WhatsApp]: 'chat',
      [ContactType.Twitter]: 'alternate_email'
    };
    return icons[type] || 'contact_phone';
  }

  getContactTypeLabel(type: number): string {
    const labels: { [key: number]: string } = {
      [ContactType.Phone]: 'Phone',
      [ContactType.Email]: 'Email',
      [ContactType.Website]: 'Website',
      [ContactType.Facebook]: 'Facebook',
      [ContactType.Instagram]: 'Instagram',
      [ContactType.LinkedIn]: 'LinkedIn',
      [ContactType.WhatsApp]: 'WhatsApp',
      [ContactType.Twitter]: 'Twitter'
    };
    return labels[type] || 'Unknown';
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

    this.companyService.updateCompanyProfile(this.companyId, request).subscribe({
      next: () => {
        this.snackBar.open('Company updated successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/companies', this.companyId]);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.snackBar.open(error.error?.title || 'Failed to update company', 'Close', { duration: 3000 });
      }
    });
  }

  loadData(): void {
    this.geographyService.getRegions().subscribe({
      next: (regions) => this.regions.set(regions)
    });

    this.sectorService.getSectors().subscribe({
      next: (sectors) => this.sectors.set(sectors)
    });

    this.companyService.getCompanyById(this.companyId).subscribe({
      next: (company) => {
        this.companyForm.patchValue({
          name: company.name,
          description: company.description || '',
          website: '',
          regionId: company.city?.id ? '' : '',
          cityId: company.cityId || '',
          address: company.address || '',
          latitude: company.latitude,
          longitude: company.longitude,
          sectorIds: company.sectors?.map(s => s.sectorId) || []
        });

        // Set original media URLs and clear base64 overrides
        this.originalLogoUrl.set(company.logoUrl || '');
        this.originalCoverUrl.set(company.coverUrl || '');
        this.logoBase64.set(null);
        this.coverBase64.set(null);

        this.isLoading.set(false);

        this.contacts.set(company.contacts || []);
        this.services.set(company.services || []);
        this.images.set(company.images || []);
        this.documents.set(company.documents || []);
      },
      error: (err) => {
        console.error('Error loading company:', err);
        this.isLoading.set(false);
      }
    });
  }

  addService(): void {
    const dialogRef = this.dialog.open(ServiceDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe((result: { title: string; description?: string } | undefined) => {
      if (!result || !result.title.trim()) return;
      this.companyService.addService(this.companyId, result.title.trim(), result.description?.trim()).subscribe({
        next: () => this.loadCompany(),
        error: (err) => this.snackBar.open(err.error?.title || 'Failed to add service', 'Close', { duration: 3000 })
      });
    });
  }

  deleteService(serviceId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Service',
        message: 'Are you sure you want to delete this service?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.companyService.removeService(this.companyId, serviceId).subscribe({
          next: () => this.loadCompany(),
          error: (err) => this.snackBar.open(err.error?.title || 'Failed to delete service', 'Close', { duration: 3000 })
        });
      }
    });
  }

  addImage(): void {
    const dialogRef = this.dialog.open(ImageDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe((result: { imageUrl: string; caption?: string } | undefined) => {
      if (!result || !result.imageUrl) return;
      this.companyService.addImage(this.companyId, result.imageUrl, undefined, result.caption?.trim()).subscribe({
        next: () => this.loadCompany(),
        error: (err) => this.snackBar.open(err.error?.title || 'Failed to add image', 'Close', { duration: 3000 })
      });
    });
  }

  deleteImage(imageId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Image',
        message: 'Are you sure you want to delete this image?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.companyService.removeImage(this.companyId, imageId).subscribe({
          next: () => this.loadCompany(),
          error: (err) => this.snackBar.open(err.error?.title || 'Failed to delete image', 'Close', { duration: 3000 })
        });
      }
    });
  }

  addDocument(): void {
    const dialogRef = this.dialog.open(DocumentDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe((result: {
      documentUrl: string;
      documentType: string;
      description?: string;
      isPublic: boolean;
    } | undefined) => {
      if (!result || !result.documentUrl) return;
      this.companyService.addDocument(
        this.companyId,
        result.documentUrl.trim(),
        result.documentType,
        result.description?.trim(),
        result.isPublic
      ).subscribe({
        next: () => this.loadCompany(),
        error: (err) => this.snackBar.open(err.error?.title || 'Failed to add document', 'Close', { duration: 3000 })
      });
    });
  }

  deleteDocument(documentId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Document',
        message: 'Are you sure you want to delete this document?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.companyService.removeDocument(this.companyId, documentId).subscribe({
          next: () => this.loadCompany(),
          error: (err) => this.snackBar.open(err.error?.title || 'Failed to delete document', 'Close', { duration: 3000 })
        });
      }
    });
  }

  getDocumentTypeLabel(docType: number): string {
    const labels: { [key: number]: string } = {
      [DocumentType.RCCM]: 'RCCM',
      [DocumentType.NIF]: 'NIF',
      [DocumentType.Patent]: 'Patent',
      [DocumentType.Other]: 'Other'
    };
    return labels[docType] || 'Unknown';
  }

  private loadCompany(): void {
    this.companyService.getCompanyById(this.companyId).subscribe({
      next: (company) => {
        this.contacts.set(company.contacts || []);
        this.services.set(company.services || []);
        this.images.set(company.images || []);
        this.documents.set(company.documents || []);
      },
      error: (err) => {
        console.error('Error reloading company:', err);
      }
    });
  }
}

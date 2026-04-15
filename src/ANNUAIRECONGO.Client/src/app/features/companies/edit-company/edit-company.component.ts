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
import { Region, City } from '@core/models/geography.model';
import { Company, Sector, CompanyContact, CompanyService as CompanyServiceModel, CompanyImage, CompanyDocument } from '@core/models/company.model';

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
                <form [formGroup]="mediaForm" (ngSubmit)="onMediaSubmit()">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Logo URL</mat-label>
                    <input matInput formControlName="logoUrl" placeholder="https://...">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Cover Image URL</mat-label>
                    <input matInput formControlName="coverUrl" placeholder="https://...">
                  </mat-form-field>

                  <div class="form-actions">
                    <button mat-button type="button" routerLink="/companies/{{ companyId }}">Cancel</button>
                    <button mat-flat-button color="primary" type="submit" [disabled]="isSubmitting() || mediaForm.pristine">
                      @if (isSubmitting()) {
                        <mat-spinner diameter="20"></mat-spinner>
                        Saving...
                      } @else {
                        Save Media
                      }
                    </button>
                  </div>
                </form>
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
                          <span matListItemTitle>{{ doc.docType }}</span>
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

  mediaForm: FormGroup = this.fb.group({
    logoUrl: [''],
    coverUrl: ['']
  });

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

  onMediaSubmit(): void {
    this.isSubmitting.set(true);
    const logoUrl = this.mediaForm.value.logoUrl || undefined;
    const coverUrl = this.mediaForm.value.coverUrl || undefined;

    this.companyService.updateCompanyMedia(this.companyId, logoUrl, coverUrl).subscribe({
      next: () => {
        this.snackBar.open('Media updated successfully!', 'Close', { duration: 3000 });
        this.mediaForm.markAsPristine();
        this.router.navigate(['/companies', this.companyId]);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.snackBar.open(error.error?.title || 'Failed to update media', 'Close', { duration: 3000 });
      }
    });
  }

  openContactDialog(contact?: CompanyContact): void {
    const type = prompt('Contact Type (0=Phone, 1=Email, 2=Website, 3=Social):', contact?.type?.toString() || '0');
    if (type === null) return;
    const value = prompt('Contact Value:', contact?.value || '');
    if (!value) return;
    const isPrimary = confirm('Is Primary?');

    if (contact) {
      this.companyService.updateContact(this.companyId, contact.id, parseInt(type), value, isPrimary).subscribe({
        next: () => this.loadCompany(),
        error: (err) => this.snackBar.open(err.error?.title || 'Failed to update contact', 'Close', { duration: 3000 })
      });
    } else {
      this.companyService.addContact(this.companyId, parseInt(type), value, isPrimary).subscribe({
        next: () => this.loadCompany(),
        error: (err) => this.snackBar.open(err.error?.title || 'Failed to add contact', 'Close', { duration: 3000 })
      });
    }
  }

  editContact(contact: CompanyContact): void {
    this.openContactDialog(contact);
  }

  deleteContact(contactId: string): void {
    if (!confirm('Delete this contact?')) return;
    this.companyService.removeContact(this.companyId, contactId).subscribe({
      next: () => this.loadCompany(),
      error: (err) => this.snackBar.open(err.error?.title || 'Failed to delete contact', 'Close', { duration: 3000 })
    });
  }

  getContactTypeIcon(type: number): string {
    const icons: { [key: number]: string } = { 0: 'phone', 1: 'email', 2: 'language', 3: 'share' };
    return icons[type] || 'contact';
  }

  getContactTypeLabel(type: number): string {
    const labels: { [key: number]: string } = { 0: 'Phone', 1: 'Email', 2: 'Website', 3: 'Social' };
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

        this.mediaForm.patchValue({
          logoUrl: company.logoUrl || '',
          coverUrl: company.coverUrl || ''
        });

        this.isLoading.set(false);

        this.contacts.set(company.contacts || []);
        this.services.set(company.services || []);
        this.images.set(company.images || []);
        this.documents.set(company.documents || []);
      }
    });
  }

  addService(): void {
    const title = prompt('Service Title:');
    if (!title) return;
    const description = prompt('Description (optional):') || undefined;
    this.companyService.addService(this.companyId, title, description).subscribe({
      next: () => this.loadCompany(),
      error: (err) => this.snackBar.open(err.error?.title || 'Failed to add service', 'Close', { duration: 3000 })
    });
  }

  deleteService(serviceId: string): void {
    if (!confirm('Delete this service?')) return;
    this.companyService.removeService(this.companyId, serviceId).subscribe({
      next: () => this.loadCompany(),
      error: (err) => this.snackBar.open(err.error?.title || 'Failed to delete service', 'Close', { duration: 3000 })
    });
  }

  addImage(): void {
    const imageUrl = prompt('Image URL:');
    if (!imageUrl) return;
    const caption = prompt('Caption (optional):') || undefined;
    this.companyService.addImage(this.companyId, imageUrl, undefined, caption).subscribe({
      next: () => this.loadCompany(),
      error: (err) => this.snackBar.open(err.error?.title || 'Failed to add image', 'Close', { duration: 3000 })
    });
  }

  deleteImage(imageId: string): void {
    if (!confirm('Delete this image?')) return;
    this.companyService.removeImage(this.companyId, imageId).subscribe({
      next: () => this.loadCompany(),
      error: (err) => this.snackBar.open(err.error?.title || 'Failed to delete image', 'Close', { duration: 3000 })
    });
  }

  addDocument(): void {
    const documentUrl = prompt('Document URL:');
    if (!documentUrl) return;
    const docType = prompt('Document Type (Legal=0, Registration=1, Certification=2, Other=3):', '3') || '3';
    const description = prompt('Description (optional):') || undefined;
    const isPublic = confirm('Make public?');
    this.companyService.addDocument(this.companyId, documentUrl, docType, description, isPublic).subscribe({
      next: () => this.loadCompany(),
      error: (err) => this.snackBar.open(err.error?.title || 'Failed to add document', 'Close', { duration: 3000 })
    });
  }

  deleteDocument(documentId: string): void {
    if (!confirm('Delete this document?')) return;
    this.companyService.removeDocument(this.companyId, documentId).subscribe({
      next: () => this.loadCompany(),
      error: (err) => this.snackBar.open(err.error?.title || 'Failed to delete document', 'Close', { duration: 3000 })
    });
  }

  private loadCompany(): void {
    this.companyService.getCompanyById(this.companyId).subscribe({
      next: (company) => {
        this.contacts.set(company.contacts || []);
        this.services.set(company.services || []);
        this.images.set(company.images || []);
        this.documents.set(company.documents || []);
      }
    });
  }
}

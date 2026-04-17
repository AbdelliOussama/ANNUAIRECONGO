import { Component, inject, OnInit, signal, computed, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CompanyService } from '@core/services/company.service';
import { Company, ContactType, DocumentType } from '@core/models/company.model';
import { AuthService } from '@core/services/auth.service';
import { InputDialogComponent } from '@shared/dialogs/input-dialog.component';
import * as L from 'leaflet';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDividerModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    @if (isLoading()) {
      <div class="loading-container">
        <mat-spinner></mat-spinner>
      </div>
    } @else if (company()) {
      <div class="company-detail-container">
        <div class="company-header">
          @if (company()!.coverUrl) {
            <div class="cover-image" [style.backgroundImage]="'url(' + company()!.coverUrl + ')'"></div>
          } @else {
            <div class="cover-image-placeholder">
              <mat-icon>business</mat-icon>
            </div>
          }
          <div class="company-info">
            @if (company()!.logoUrl) {
              <img [src]="company()!.logoUrl" [alt]="company()!.name" class="company-logo">
            }
             <div class="info-content">
               <h1>{{ company()!.name }}</h1>
               <div class="sectors">
                 @for (sector of company()!.sectors; track sector.sectorId) {
                   <mat-chip>{{ sector.name }}</mat-chip>
                 }
               </div>
<mat-chip [class.status-active]="company()?.status === 2"
                          [class.status-draft]="company()?.status === 0"
                          [class.status-pending]="company()?.status === 1"
                          [class.status-rejected]="company()?.status === 3"
                          [class.status-suspended]="company()?.status === 4">
{{ getStatusLabel(company()?.status ?? 0) }}
                </mat-chip>
                @if (company()?.status === 3 && company()?.rejectionReason) {
                  <div class="rejection-reason">
                    <mat-icon>info</mat-icon>
                    <span>{{ company()!.rejectionReason }}</span>
                  </div>
                }
               @if (company()!.cityName) {
                <div class="location">
                  <mat-icon>location_on</mat-icon>
                  {{ company()!.address }}{{ company()!.address && company()!.cityName ? ', ' : '' }}{{ company()!.cityName }}
                </div>
              }
            </div>
            @if (company()!.isFeatured) {
              <div class="featured-badge">
                <mat-icon>star</mat-icon>
                Featured Company
              </div>
            }
            @if (isOwner()) {
              <button mat-raised-button color="primary" class="edit-btn" [routerLink]="['/companies', company()!.id, 'edit']">
                <mat-icon>edit</mat-icon>
                Edit
              </button>
            }
            <button mat-button color="warn" class="report-btn" (click)="openReportDialog()">
              <mat-icon>flag</mat-icon>
              Report
            </button>
          </div>
        </div>

        <mat-tab-group class="company-tabs">
          <mat-tab label="About">
            <div class="tab-content">
              <mat-card>
                <mat-card-content>
                  <h3>Description</h3>
                  <p>{{ company()!.description || 'No description available.' }}</p>
                  
                  <mat-divider></mat-divider>
                  
<h3>Services</h3>
                   @if (company()!.services && company()!.services!.length > 0) {
                     <ul class="services-list">
                       @for (service of company()!.services!; track service.id) {
                        <li>
                          <strong>{{ service.title }}</strong>
                          @if (service.description) {
                            <p>{{ service.description }}</p>
                          }
                        </li>
                      }
                    </ul>
                  } @else {
                    <p class="empty-text">No services registered.</p>
                  }
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <mat-tab label="Contact">
            <div class="tab-content">
              <mat-card>
                <mat-card-content>
                  <h3>Contact Information</h3>
                  @if (company()!.contacts && company()!.contacts!.length > 0) {
                    <div class="contacts-list">
                      @for (contact of company()!.contacts!; track contact.id) {
                        <div class="contact-item" (click)="contactAction(contact)">
                          <mat-icon>{{ getContactIcon(contact.type) }}</mat-icon>
                          <div class="contact-info">
                            <span class="contact-type">{{ getContactTypeName(contact.type) }}</span>
                            <span class="contact-value">{{ contact.value }}</span>
                            @if (contact.isPrimary) {
                              <span class="primary-badge">Primary</span>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  } @else {
                    <p class="empty-text">No contacts registered.</p>
                  }

                  @if (company()!.address) {
                    <mat-divider></mat-divider>
                    <h3>Address</h3>
                    <div class="address">
                      <mat-icon>place</mat-icon>
                      <span>{{ company()!.address }}{{ company()!.cityName ? ', ' + company()!.cityName : '' }}</span>
                    </div>
                  }
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <mat-tab label="Gallery">
            <div class="tab-content">
              <mat-card>
                <mat-card-content>
                  <h3>Photos</h3>
                  @if (company()!.images && company()!.images!.length > 0) {
                    <div class="gallery-grid">
                      @for (image of company()!.images!; track image.id) {
                        <div class="gallery-item">
                          <img [src]="image.imageUrl" [alt]="image.caption || company()!.name">
                          @if (image.caption) {
                            <span class="caption">{{ image.caption }}</span>
                          }
                        </div>
                      }
                    </div>
                  } @else {
                    <p class="empty-text">No photos available.</p>
                  }

                  <mat-divider></mat-divider>

                   <h3>Documents</h3>
                   @if (company()!.documents && company()!.documents!.length > 0) {
                     <div class="documents-list">
                       @for (doc of company()!.documents!; track doc.id) {
                         <a [href]="doc.fileUrl" target="_blank" class="document-item">
                           <mat-icon>description</mat-icon>
                           <span>{{ getDocumentTypeLabel(doc.docType) }}</span>
                           @if (doc.description) {
                             <span class="doc-desc">{{ doc.description }}</span>
                           }
                         </a>
                       }
                     </div>
                   } @else {
                     <p class="empty-text">No documents available.</p>
                   }
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <mat-tab label="Location">
            <div class="tab-content">
              <mat-card>
                <mat-card-content>
                  @if (company()!.latitude && company()!.longitude) {
                    <h3>Company Location</h3>
                    <div id="company-map" class="company-map"></div>
                    <div class="coordinates">
                      <mat-icon>place</mat-icon>
                      <span>Lat: {{ company()!.latitude }}, Lng: {{ company()!.longitude }}</span>
                    </div>
                  } @else {
                    <div class="empty-state">
                      <mat-icon>location_off</mat-icon>
                      <p>No location coordinates available.</p>
                    </div>
                  }
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    } @else {
      <div class="not-found">
        <mat-icon>error_outline</mat-icon>
        <h2>Company not found</h2>
        <button mat-raised-button color="primary" routerLink="/">Back to Home</button>
      </div>
    }
  `,
  styles: [`
    .loading-container, .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      gap: 16px;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: rgba(0, 0, 0, 0.38);
      }
    }

    .company-detail-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 24px;
    }

    .company-header {
      position: relative;
      margin-bottom: 24px;
    }

    .cover-image, .cover-image-placeholder {
      height: 200px;
      border-radius: 12px;
      background-size: cover;
      background-position: center;
    }

    .cover-image-placeholder {
      background: linear-gradient(135deg, #1e88e5, #43a047);
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: white;
        opacity: 0.7;
      }
    }

    .company-info {
       display: flex;
       align-items: flex-start;
       gap: 24px;
       margin-top: -40px;
       padding: 24px;
       background: white;
       border-radius: 12px;
       box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
       position: relative;
       flex-wrap: wrap;
     }

.report-btn {
        position: absolute;
        bottom: 16px;
        right: 16px;
      }

      .edit-btn {
        position: absolute;
        bottom: 16px;
        right: 140px;
      }

    .company-logo {
      width: 100px;
      height: 100px;
      border-radius: 12px;
      object-fit: cover;
      background: white;
      border: 2px solid #e0e0e0;
    }

    .info-content {
      flex: 1;
      padding-top: 40px;

      h1 {
        font-size: 28px;
        font-weight: 500;
        margin-bottom: 12px;
      }
    }

    .sectors {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }

    .location {
      display: flex;
      align-items: center;
      gap: 4px;
      color: rgba(0, 0, 0, 0.6);

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .rejection-reason {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      padding: 12px;
      background: #ffebee;
      border-radius: 8px;
      color: #c62828;
      font-size: 14px;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .featured-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 16px;
      background: #ff9800;
      color: white;
      border-radius: 20px;
      font-weight: 500;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .company-tabs {
      margin-bottom: 24px;
    }

    .tab-content {
      padding: 24px 0;
    }

    mat-card {
      border-radius: 12px !important;
    }

    mat-card-content {
      h3 {
        font-size: 18px;
        font-weight: 500;
        margin-bottom: 16px;
        color: #1e88e5;
      }

      p {
        color: rgba(0, 0, 0, 0.87);
        line-height: 1.6;
      }
    }

    mat-divider {
      margin: 24px 0;
    }

    .services-list {
      list-style: none;
      padding: 0;

      li {
        padding: 12px;
        background: #f5f5f5;
        border-radius: 8px;
        margin-bottom: 12px;

        strong {
          display: block;
          margin-bottom: 4px;
        }

        p {
          margin: 0;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.6);
        }
      }
    }

    .contacts-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #e3f2fd;
      }

      mat-icon {
        color: #1e88e5;
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .contact-info {
      display: flex;
      flex-direction: column;
    }

    .contact-type {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }

    .contact-value {
      font-size: 16px;
      font-weight: 500;
    }

    .primary-badge {
      font-size: 11px;
      padding: 2px 8px;
      background: #43a047;
      color: white;
      border-radius: 10px;
      width: fit-content;
      margin-top: 4px;
    }

    .address {
      display: flex;
      align-items: flex-start;
      gap: 8px;

      mat-icon {
        color: #1e88e5;
      }
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .gallery-item {
      border-radius: 8px;
      overflow: hidden;
      position: relative;

      img {
        width: 100%;
        height: 150px;
        object-fit: cover;
      }

      .caption {
        display: block;
        padding: 8px;
        font-size: 12px;
        background: #f5f5f5;
      }
    }

    .documents-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .document-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      text-decoration: none;
      color: inherit;
      transition: background 0.2s;

      &:hover {
        background: #e3f2fd;
      }

      mat-icon {
        color: #1e88e5;
      }

      .doc-description {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
      }
    }

    .empty-text {
      color: rgba(0, 0, 0, 0.38);
      font-style: italic;
    }

    @media (max-width: 600px) {
      .company-info {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .info-content {
        padding-top: 16px;
      }

      .location {
        justify-content: center;
      }
    }

    .company-map {
      height: 300px;
      width: 100%;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .leaflet-container {
      height: 100%;
      width: 100%;
      border-radius: 8px;
    }

    .coordinates {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(0, 0, 0, 0.6);
      
      mat-icon {
        color: #f57c00;
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px;
      color: rgba(0, 0, 0, 0.6);
      
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 8px;
      }
    }
  `]
})
export class CompanyDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly companyService = inject(CompanyService);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  company = signal<Company | null>(null);
  isLoading = signal<boolean>(true);
  reportReason = '';
  isOwner = computed(() => {
    const company = this.company();
    const user = this.authService.currentUser();
    return !!(company && user && company.ownerId === user.id);
  });

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCompany(id);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 500);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private initMap(): void {
    const company = this.company();
    if (!company || !company.latitude || !company.longitude) return;

    const mapElement = document.getElementById('company-map');
    if (!mapElement) {
      console.error('Map element not found');
      return;
    }

    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('company-map', {
      center: [company.latitude, company.longitude],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
      minZoom: 10
    }).addTo(this.map);

    this.marker = L.marker([company.latitude, company.longitude], {
      icon: L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41]
      })
    }).addTo(this.map);

    this.marker.bindPopup(`<strong>${company.name}</strong><br>${company.address || ''}<br>${company.cityName || ''}`).openPopup();
  }

  openReportDialog(): void {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      data: { title: 'Report Company', label: 'Reason', placeholder: 'Enter reason for reporting...' }
    });
    dialogRef.afterClosed().subscribe((reason: string | null) => {
      if (reason && reason.trim()) {
        this.companyService.reportCompany(this.company()!.id, reason.trim()).subscribe({
          next: () => {
            this.snackBar.open('Report submitted successfully', 'Close', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Failed to submit report', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  loadCompany(id: string): void {
    this.companyService.getCompanyById(id).subscribe({
      next: (data) => {
        this.company.set(data);
        this.isLoading.set(false);
        setTimeout(() => this.initMap(), 100);
      },
      error: (err) => {
        console.error('Error loading company:', err);
        this.isLoading.set(false);
      }
    });
  }

  getContactIcon(type: ContactType): string {
    const icons: Record<number, string> = {
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

  getContactTypeName(type: ContactType): string {
    const names: Record<number, string> = {
      [ContactType.Phone]: 'Phone',
      [ContactType.Email]: 'Email',
      [ContactType.Website]: 'Website',
      [ContactType.Facebook]: 'Facebook',
      [ContactType.Instagram]: 'Instagram',
      [ContactType.LinkedIn]: 'LinkedIn',
      [ContactType.WhatsApp]: 'WhatsApp',
      [ContactType.Twitter]: 'Twitter'
    };
    return names[type] || 'Contact';
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

contactAction(contact: { type: ContactType; value: string }): void {
      if (this.company()) {
        this.companyService.trackContactClick(this.company()!.id, contact.type).subscribe({
          error: () => {}
        });
      }

      switch (contact.type) {
       case ContactType.Phone:
       case ContactType.WhatsApp:
         window.open(`tel:${contact.value}`);
         break;
       case ContactType.Email:
         window.open(`mailto:${contact.value}`);
         break;
       case ContactType.Website:
         let url = contact.value;
         if (!url.startsWith('http')) {
           url = 'https://' + url;
         }
         window.open(url, '_blank');
         break;
       case ContactType.Facebook:
       case ContactType.Instagram:
       case ContactType.LinkedIn:
       case ContactType.Twitter:
         window.open(contact.value, '_blank');
         break;
     }
   }

   getStatusLabel(status: number): string {
     const labels: { [key: number]: string } = {
       0: 'Draft',
       1: 'Pending',
       2: 'Active',
       3: 'Rejected',
       4: 'Suspended'
     };
     return labels[status] || 'Unknown';
   }
}
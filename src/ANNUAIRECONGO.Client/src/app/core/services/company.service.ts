import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import {
  Company,
  PaginatedResponse,
  CompanyFilter,
  CreateCompanyRequest,
  UpdateCompanyProfileRequest,
  Sector,
  Region,
  City
} from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

getCompanies(filter: CompanyFilter = {}): Observable<PaginatedResponse<Company>> {
      const params: Record<string, string | number> = {};
      
      if (filter.searchTerm) params['searchTerm'] = filter.searchTerm;
      if (filter.smartSearch) params['smartSearch'] = filter.smartSearch;
      if (filter.sectorId) params['sectorId'] = filter.sectorId;
      if (filter.sectorSlug) params['sectorSlug'] = filter.sectorSlug;
      if (filter.cityId) params['cityId'] = filter.cityId;
      if (filter.regionId) params['regionId'] = filter.regionId;
      if (filter.regionName) params['regionName'] = filter.regionName;
      if (filter.status !== null && filter.status !== undefined) params['status'] = filter.status;
      if (filter.pageNumber) params['pageNumber'] = filter.pageNumber;
      if (filter.pageSize) params['pageSize'] = filter.pageSize;
      if (filter.sortBy) params['sortBy'] = filter.sortBy;
      if (filter.sortOrder) params['sortOrder'] = filter.sortOrder;
  
      return this.api.get<PaginatedResponse<Company>>('/api/v1/companies', params);
   }

   getCompanyById(id: string): Observable<Company> {
     return this.api.get<Company>(`/api/v1/companies/${id}`);
   }

   getCompanyBySlug(slug: string): Observable<Company> {
     return this.api.get<Company>(`/api/v1/companies/${slug}`);
   }

   createCompany(data: CreateCompanyRequest): Observable<Company> {
     return this.api.post<Company>('/api/v1/companies', data);
   }

    updateCompanyProfile(id: string, data: UpdateCompanyProfileRequest): Observable<Company> {
      return this.api.put<Company>(`/api/v1/companies/${id}/update-company-profile`, data);
    }

    updateCompanyMedia(id: string, logoUrl?: string, coverUrl?: string): Observable<Company> {
      return this.api.put<Company>(`/api/v1/companies/${id}/update-media`, { logoUrl, coverUrl });
    }

    submitCompany(id: string): Observable<void> {
      return this.api.post<void>(`/api/v1/companies/${id}/submit-company`, {});
    }

   validateCompany(id: string): Observable<void> {
      return this.api.post<void>(`/api/v1/companies/${id}/validate-company`, {});
    }

    reactivateCompany(id: string): Observable<void> {
      return this.api.post<void>(`/api/v1/companies/${id}/reactivate-company`, {});
    }

    suspendCompany(id: string): Observable<void> {
      return this.api.post<void>(`/api/v1/companies/${id}/suspend-company`, {});
    }

    addContact(companyId: string, type: any, value: string, isPrimary: boolean): Observable<any> {
      return this.api.post(`/api/v1/companies/${companyId}/add-contact`, { type, value, isPrimary });
    }

   removeContact(companyId: string, contactId: string): Observable<void> {
     return this.api.delete(`/api/v1/companies/${companyId}/contacts/${contactId}`);
   }

    updateContact(companyId: string, contactId: string, type: any, value: string, isPrimary: boolean): Observable<any> {
      return this.api.put(`/api/v1/companies/${companyId}/update-contact`, { contactId, type, value, isPrimary });
    }

   addService(companyId: string, title: string, description?: string): Observable<any> {
     return this.api.post(`/api/v1/companies/${companyId}/add-service`, { title, description });
   }

   removeService(companyId: string, serviceId: string): Observable<void> {
     return this.api.delete(`/api/v1/companies/${companyId}/services/${serviceId}`);
   }

   addImage(companyId: string, imageUrl: string, displayOrder?: number, caption?: string): Observable<any> {
     return this.api.post(`/api/v1/companies/${companyId}/add-image`, { imageUrl, displayOrder, caption });
   }

   removeImage(companyId: string, imageId: string): Observable<void> {
     return this.api.delete(`/api/v1/companies/${companyId}/images/${imageId}`);
   }

   addDocument(companyId: string, documentUrl: string, documentType: string, description?: string, isPublic?: boolean): Observable<any> {
     return this.api.post(`/api/v1/companies/${companyId}/add-document`, { documentUrl, documentType, description, isPublic });
   }

   removeDocument(companyId: string, documentId: string): Observable<void> {
     return this.api.delete(`/api/v1/companies/${companyId}/documents/${documentId}`);
   }

   reportCompany(companyId: string, reason: string): Observable<void> {
     return this.api.post(`/api/v1/companies/${companyId}/add-report`, { reason });
   }

  trackContactClick(companyId: string, contactType: number): Observable<void> {
    return this.api.post(`/api/v1/companies/${companyId}/contact-click`, { contactType });
  }

   rejectCompany(companyId: string, reason: string): Observable<void> {
     return this.api.post<void>(`/api/v1/companies/${companyId}/reject-company`, { reason });
   }

   setFeatured(companyId: string, isFeatured: boolean): Observable<void> {
     return this.api.post<void>(`/api/v1/companies/${companyId}/set-featured`, isFeatured);
   }

   generateDescription(
     companyId: string,
     data: { name: string; sectors: string[]; city: string; services: string[] }
   ): Observable<{ description: string }> {
     return this.api.post<{ description: string }>(`/api/v1/companies/${companyId}/generate-description`, data);
   }

   getRecommendations(companyId: string): Observable<Company[]> {
     return this.api.get<Company[]>(`/api/v1/companies/${companyId}/recommendations`);
   }
}
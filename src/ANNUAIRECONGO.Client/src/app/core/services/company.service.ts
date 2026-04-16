import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import {
  Company,
  PaginatedResponse,
  CompanyFilter,
  CreateCompanyRequest,
  UpdateCompanyProfileRequest
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
      if (filter.sectorId) params['sectorId'] = filter.sectorId;
      if (filter.cityId) params['cityId'] = filter.cityId;
      if (filter.regionId) params['regionId'] = filter.regionId;
      if (filter.status !== null && filter.status !== undefined) params['status'] = filter.status;
      if (filter.pageNumber) params['pageNumber'] = filter.pageNumber;
      if (filter.pageSize) params['pageSize'] = filter.pageSize;
  
      return this.api.get<PaginatedResponse<Company>>('/api/v1/companies', params);
   }

   getCompanyById(id: string): Observable<Company> {
     return this.api.get<Company>(`/api/v1/companies/${id}`);
   }

   createCompany(data: CreateCompanyRequest): Observable<Company> {
     return this.api.post<Company>('/api/v1/companies', data);
   }

   updateCompanyProfile(id: string, data: UpdateCompanyProfileRequest): Observable<Company> {
     return this.api.put<Company>(`/api/v1/companies/${id}/UpdateCompanyProfile`, data);
   }

   updateCompanyMedia(id: string, logoUrl?: string, coverUrl?: string): Observable<Company> {
     return this.api.put<Company>(`/api/v1/companies/${id}/UpdateMedia`, { logoUrl, coverUrl });
   }

   submitCompany(id: string): Observable<void> {
     return this.api.put<void>(`/api/v1/companies/${id}/SubmitCompany`, {});
   }

   validateCompany(id: string): Observable<void> {
     return this.api.put<void>(`/api/v1/companies/${id}/ValidateCompany`, {});
   }

   addContact(companyId: string, type: number, value: string, isPrimary: boolean): Observable<any> {
     return this.api.post(`/api/v1/companies/${companyId}/AddContact`, { type, value, isPrimary });
   }

   removeContact(companyId: string, contactId: string): Observable<void> {
     return this.api.delete(`/api/v1/companies/${companyId}/RemoveContact`, { body: contactId });
   }

   updateContact(companyId: string, contactId: string, type: number, value: string, isPrimary: boolean): Observable<any> {
     return this.api.put(`/api/v1/companies/${companyId}/UpdateContact`, { contactId, type, value, isPrimary });
   }

  addService(companyId: string, title: string, description?: string): Observable<any> {
    return this.api.post(`/api/v1/companies/${companyId}/AddService`, { title, description });
  }

   removeService(companyId: string, serviceId: string): Observable<void> {
     return this.api.delete(`/api/v1/companies/${companyId}/RemoveService`, { body: serviceId });
   }

  addImage(companyId: string, imageUrl: string, displayOrder?: number, caption?: string): Observable<any> {
    return this.api.post(`/api/v1/companies/${companyId}/AddImage`, { imageUrl, displayOrder, caption });
  }

   removeImage(companyId: string, imageId: string): Observable<void> {
     return this.api.delete(`/api/v1/companies/${companyId}/RemoveImage`, { body: imageId });
   }

  addDocument(companyId: string, documentUrl: string, documentType: string, description?: string, isPublic?: boolean): Observable<any> {
    return this.api.post(`/api/v1/companies/${companyId}/AddDocument`, { documentUrl, documentType, description, isPublic });
  }

   removeDocument(companyId: string, documentId: string): Observable<void> {
     return this.api.delete(`/api/v1/companies/${companyId}/RemoveDocument`, { body: documentId });
   }

  reportCompany(companyId: string, reason: string): Observable<void> {
    return this.api.post(`/api/v1/companies/${companyId}/AddReport`, { reason });
  }

  trackContactClick(companyId: string, contactType: number): Observable<void> {
    return this.api.post(`/api/v1/companies/${companyId}/contact-click`, { contactType });
  }

  suspendCompany(companyId: string): Observable<void> {
    return this.api.put<void>(`/api/v1/companies/${companyId}/SuspendCompany`, {});
  }

  reactivateCompany(companyId: string): Observable<void> {
    return this.api.put<void>(`/api/v1/companies/${companyId}/ReactivateCompany`, {});
  }

  rejectCompany(companyId: string, reason: string): Observable<void> {
    return this.api.put<void>(`/api/v1/companies/${companyId}/RejectCompany`, { reason });
  }

  setFeatured(companyId: string, isFeatured: boolean): Observable<void> {
    return this.api.put<void>(`/api/v1/companies/${companyId}/setFeatured`, isFeatured);
  }
}
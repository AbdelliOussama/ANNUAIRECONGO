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
    if (filter.pageNumber) params['pageNumber'] = filter.pageNumber;
    if (filter.pageSize) params['pageSize'] = filter.pageSize;

    return this.api.get<PaginatedResponse<Company>>('/api/v1.0/companies', params);
  }

  getCompanyById(id: string): Observable<Company> {
    return this.api.get<Company>(`/api/v1.0/companies/${id}`);
  }

  createCompany(data: CreateCompanyRequest): Observable<Company> {
    return this.api.post<Company>('/api/v1.0/companies', data);
  }

  updateCompanyProfile(id: string, data: UpdateCompanyProfileRequest): Observable<Company> {
    return this.api.put<Company>(`/api/v1.0/companies/${id}/UpdateCompanyProfile`, data);
  }

  updateCompanyMedia(id: string, logoUrl?: string, coverUrl?: string): Observable<Company> {
    return this.api.put<Company>(`/api/v1.0/companies/${id}/UpdateMedia`, { logoUrl, coverUrl });
  }

  submitCompany(id: string): Observable<void> {
    return this.api.put<void>(`/api/v1.0/companies/${id}/SubmitCompany`, {});
  }

  addContact(companyId: string, type: number, value: string, isPrimary: boolean): Observable<any> {
    return this.api.post(`/api/v1.0/companies/${companyId}/AddContact`, { type, value, isPrimary });
  }

  removeContact(companyId: string, contactId: string): Observable<void> {
    return this.api.delete(`/api/v1.0/companies/${companyId}/RemoveContact`,);
  }

  updateContact(companyId: string, contactId: string, type: number, value: string, isPrimary: boolean): Observable<any> {
    return this.api.put(`/api/v1.0/companies/${companyId}/UpdateContact`, { contactId, type, value, isPrimary });
  }

  addService(companyId: string, title: string, description?: string): Observable<any> {
    return this.api.post(`/api/v1.0/companies/${companyId}/AddService`, { title, description });
  }

  removeService(companyId: string, serviceId: string): Observable<void> {
    return this.api.delete(`/api/v1.0/companies/${companyId}/RemoveService`);
  }

  addImage(companyId: string, imageUrl: string, displayOrder?: number, caption?: string): Observable<any> {
    return this.api.post(`/api/v1.0/companies/${companyId}/AddImage`, { imageUrl, displayOrder, caption });
  }

  removeImage(companyId: string, imageId: string): Observable<void> {
    return this.api.delete(`/api/v1.0/companies/${companyId}/RemoveImage`);
  }

  addDocument(companyId: string, documentUrl: string, documentType: string, description?: string, isPublic?: boolean): Observable<any> {
    return this.api.post(`/api/v1.0/companies/${companyId}/AddDocument`, { documentUrl, documentType, description, isPublic });
  }

  removeDocument(companyId: string, documentId: string): Observable<void> {
    return this.api.delete(`/api/v1.0/companies/${companyId}/RemoveDocument`);
  }

  reportCompany(companyId: string, reason: string): Observable<void> {
    return this.api.post(`/api/v1.0/companies/${companyId}/AddReport`, { reason });
  }
}
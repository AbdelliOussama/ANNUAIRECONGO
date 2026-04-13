import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Company, BusinessOwner } from '../models/company.model';

export interface UpdateBusinessOwnerRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  companyPosition?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BusinessOwnerService {
  private readonly api = inject(ApiService);

  getBusinessOwners(): Observable<BusinessOwner[]> {
    return this.api.get<BusinessOwner[]>('/api/v1.0/business-owners');
  }

  getBusinessOwnerById(id: string): Observable<BusinessOwner> {
    return this.api.get<BusinessOwner>(`/api/v1.0/business-owners/${id}`);
  }

  getMyCompanies(): Observable<Company[]> {
    return this.api.get<Company[]>('/api/v1.0/business-owners/my-companies');
  }

  updateBusinessOwner(id: string, data: UpdateBusinessOwnerRequest): Observable<BusinessOwner> {
    return this.api.put<BusinessOwner>(`/api/v1.0/business-owners/${id}`, data);
  }
}
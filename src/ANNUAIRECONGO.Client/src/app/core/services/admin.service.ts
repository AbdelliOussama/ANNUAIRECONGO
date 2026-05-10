import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Company, PaginatedResponse, PlatformStats } from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly api = inject(ApiService);

  // Statistics
  getAdminStats(): Observable<PlatformStats> {
    return this.api.get<PlatformStats>('/api/v1/stats/platform-summary');
  }

  // Companies
  getCompanies(page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<Company>> {
    return this.api.get<PaginatedResponse<Company>>('/api/v1/companies', { pageNumber: page, pageSize });
  }

  // Users (Business Owners list for admin)
  getUsers(): Observable<any[]> {
    return this.api.get<any[]>('/api/v1/business-owners');
  }

  // Audit Logs
  getAuditLogs(pageNumber: number = 1, pageSize: number = 20, searchTerm?: string): Observable<any> {
    const params: Record<string, string | number> = { pageNumber, pageSize };
    if (searchTerm) params['searchTerm'] = searchTerm;
    return this.api.get<any>('/api/v1/admin/logs', params);
  }

  // Plans
  getPlans(): Observable<any[]> {
    return this.api.get<any[]>('/api/v1/plans');
  }

  getSettings(): Observable<any> {
    return this.api.get<any>('/api/v1/admin/settings');
  }

  updateSettings(settings: any): Observable<any> {
    return this.api.put<any>('/api/v1/admin/settings', settings);
  }
}

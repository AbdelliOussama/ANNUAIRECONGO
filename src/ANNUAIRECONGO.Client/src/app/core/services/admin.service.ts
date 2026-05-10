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

  // Users (Assuming an endpoint exists or using IdentityService)
  getUsers(page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<any>> {
    return this.api.get<PaginatedResponse<any>>('/identity/users', { pageNumber: page, pageSize });
  }

  // Audit Logs
  getAuditLogs(page: number, pageSize: number): Observable<any> {
    return this.api.get<any>(`/api/v1/admin/audit-logs?page=${page}&pageSize=${pageSize}`);
  }

  getPlans(): Observable<any[]> {
    return this.api.get<any[]>('/api/v1/admin/plans');
  }

  getSettings(): Observable<any> {
    return this.api.get<any>('/api/v1/admin/settings');
  }

  updateSettings(settings: any): Observable<any> {
    return this.api.put<any>('/api/v1/admin/settings', settings);
  }
}

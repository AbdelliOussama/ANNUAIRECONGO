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

  // Users (Full list for admin)
  getUsers(): Observable<any[]> {
    return this.api.get<any[]>('/api/v1/admin/users');
  }

  deleteUser(userId: string): Observable<any> {
    return this.api.delete(`/api/v1/admin/users/${userId}`);
  }

  // Audit Logs
  getAuditLogs(pageNumber: number = 1, pageSize: number = 20, searchTerm?: string): Observable<any> {
    const params: Record<string, string | number> = { pageNumber, pageSize };
    if (searchTerm) params['searchTerm'] = searchTerm;
    return this.api.get<any>('/api/v1/admin/logs', params);
  }

  getEntityAuditLogs(targetType: string, targetId: string, pageNumber: number = 1, pageSize: number = 20): Observable<any> {
    return this.api.get<any>(`/api/v1/admin/logs/${targetType}/${targetId}`, { pageNumber, pageSize });
  }

  // Plans
  getPlans(): Observable<any[]> {
    return this.api.get<any[]>('/api/v1/plans');
  }

  updatePlan(id: string, data: any): Observable<any> {
    return this.api.put(`/api/v1/plans/${id}`, data);
  }

  getSettings(): Observable<any> {
    return this.api.get<any>('/api/v1/admin/settings');
  }

  updateSettings(settings: any): Observable<any> {
    return this.api.put<any>('/api/v1/admin/settings', settings);
  }

  // Reports
  getReports(pageNumber: number = 1, pageSize: number = 20): Observable<PaginatedResponse<any>> {
    return this.api.get<PaginatedResponse<any>>('/api/v1/companies/reports', { pageNumber, pageSize });
  }

  processReport(reportId: string, dismiss: boolean): Observable<any> {
    return this.api.post<any>(`/api/v1/companies/reports/${reportId}/process`, { dismiss });
  }
}

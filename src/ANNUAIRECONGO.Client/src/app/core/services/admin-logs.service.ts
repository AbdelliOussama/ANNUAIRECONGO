import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: string;
  createdAt: string;
}

export interface PaginatedAdminLogs {
  items: AdminLog[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface AdminLogsParams {
  searchTerm?: string;
  action?: string;
  targetType?: string;
  adminId?: string;
  startDate?: string;
  endDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminLogsService {
  private api = inject(ApiService);

  getAdminLogs(params: AdminLogsParams): Observable<PaginatedAdminLogs> {
    return this.api.get<PaginatedAdminLogs>('/api/v1/admin/logs', params as Record<string, string | number>);
  }

  getEntityAdminLogs(targetType: string, targetId: string, pageNumber = 1, pageSize = 20): Observable<PaginatedAdminLogs> {
    return this.api.get<PaginatedAdminLogs>(`/api/v1/admin/logs/${targetType}/${targetId}`, {
      pageNumber,
      pageSize
    });
  }
}
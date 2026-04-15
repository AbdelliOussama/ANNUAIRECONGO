import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Plan, CreateCompanyRequest, UpdateCompanyProfileRequest } from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private readonly api = inject(ApiService);

  getPlans(): Observable<Plan[]> {
    return this.api.get<Plan[]>('/api/v1/plans');
  }

  getPlanById(id: string): Observable<Plan> {
    return this.api.get<Plan>(`/api/v1/plans/${id}`);
  }

  activatePlan(id: string): Observable<Plan> {
    return this.api.post<Plan>(`/api/v1/plans/${id}/activate`, {});
  }

  deactivatePlan(id: string): Observable<Plan> {
    return this.api.post<Plan>(`/api/v1/plans/${id}/deactivate`, {});
  }

  updatePlan(id: string, data: {
    name: number;
    price: number;
    durationDays: number;
    maxImages: number;
    maxDocuments: number;
    hasAnalytics: boolean;
    hasFeaturedBadge: boolean;
    searchPriority: number;
  }): Observable<Plan> {
    return this.api.put<Plan>(`/api/v1/plans/${id}`, data);
  }
}
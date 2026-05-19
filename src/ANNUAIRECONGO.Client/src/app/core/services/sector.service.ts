import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Sector } from '../models/company.model';

export interface SectorIntelligenceReport {
  id: string;
  title: string;
  sectorName: string;
  content: string;
  excerpt: string;
  icon: string;
  date: string;
  generatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class SectorService {
  private readonly api = inject(ApiService);

  getSectors(): Observable<Sector[]> {
    return this.api.get<any[]>('/api/v1/sectors').pipe(
      map(sectors => sectors.map(s => ({
        ...s,
        id: s.id || s.sectorId // Ensure id is populated for template binding
      })))
    );
  }

  getSectorById(id: string): Observable<Sector> {
    return this.api.get<Sector>(`/api/v1/sectors/${id}`);
  }

  createSector(name: string, iconUrl?: string, description?: string): Observable<Sector> {
    return this.api.post<Sector>('/api/v1/sectors', { name, iconUrl, description });
  }

  updateSector(id: string, name: string, iconUrl?: string, description?: string): Observable<Sector> {
    return this.api.put<Sector>(`/api/v1/sectors/${id}`, { name, iconUrl, description });
  }

  deleteSector(id: string): Observable<void> {
    return this.api.delete<void>(`/api/v1/sectors/${id}`);
  }

  getSectorReports(): Observable<SectorIntelligenceReport[]> {
    return this.api.get<SectorIntelligenceReport[]>('/api/v1/sectors/intelligence-reports');
  }

  generateSectorReport(sectorId: string): Observable<SectorIntelligenceReport> {
    return this.api.post<SectorIntelligenceReport>('/api/v1/sectors/intelligence-reports/generate', { sectorId });
  }
}
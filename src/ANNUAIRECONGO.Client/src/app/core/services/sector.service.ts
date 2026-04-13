import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Sector } from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class SectorService {
  private readonly api = inject(ApiService);

  getSectors(): Observable<Sector[]> {
    return this.api.get<Sector[]>('/api/v1/sectors');
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
}
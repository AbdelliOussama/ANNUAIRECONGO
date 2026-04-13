import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Sector } from '../models/company.model';
import { Region, City } from '../models/geography.model';

@Injectable({
  providedIn: 'root'
})
export class SectorService {
  private readonly api = inject(ApiService);

  getSectors(): Observable<Sector[]> {
    return this.api.get<Sector[]>('/api/v1.0/sectors');
  }

  getSectorById(id: string): Observable<Sector> {
    return this.api.get<Sector>(`/api/v1.0/sectors/${id}`);
  }

  createSector(name: string, iconUrl?: string, description?: string): Observable<Sector> {
    return this.api.post<Sector>('/api/v1.0/sectors', { name, iconUrl, description });
  }

  updateSector(id: string, name: string, iconUrl?: string, description?: string): Observable<Sector> {
    return this.api.put<Sector>(`/api/v1.0/sectors/${id}`, { name, iconUrl, description });
  }

  deleteSector(id: string): Observable<void> {
    return this.api.delete<void>(`/api/v1.0/sectors/${id}`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class GeographyService {
  private readonly api = inject(ApiService);

  getRegions(): Observable<Region[]> {
    return this.api.get<Region[]>('/api/v1.0/geography');
  }

  getCitiesByRegion(regionId: string): Observable<City[]> {
    return this.api.get<City[]>(`/api/v1.0/geography/${regionId}/cities`);
  }

  createRegion(name: string): Observable<Region> {
    return this.api.post<Region>('/api/v1.0/geography', { name });
  }

  createCity(name: string, regionId: string): Observable<City> {
    return this.api.post<City>('/api/v1.0/geography/cities', { name, regionId });
  }
}
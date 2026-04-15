import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Region, City } from '../models/geography.model';

@Injectable({
  providedIn: 'root'
})
export class GeographyService {
  private readonly api = inject(ApiService);

  getRegions(): Observable<Region[]> {
    return this.api.get<Region[]>('/api/v1/geography');
  }

  getCitiesByRegion(regionId: string): Observable<City[]> {
    return this.api.get<City[]>(`/api/v1/geography/${regionId}/cities`);
  }

  createRegion(name: string): Observable<Region> {
    return this.api.post<Region>('/api/v1/geography', { name });
  }

  createCity(name: string, regionId: string): Observable<City> {
    return this.api.post<City>('/api/v1/geography/cities', { name, regionId });
  }

  deleteCity(cityId: string): Observable<void> {
    return this.api.delete<void>(`/api/v1/geography/cities/${cityId}`);
  }

  deleteRegion(regionId: string): Observable<void> {
    return this.api.delete<void>(`/api/v1/geography/${regionId}`);
  }
}
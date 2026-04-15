import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PlatformStats, RegionStats, SectorStats } from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private readonly api = inject(ApiService);

  getPlatformSummary(): Observable<PlatformStats> {
    return this.api.get<PlatformStats>('/api/v1/stats/platform-summary');
  }

  getRegionStats(): Observable<RegionStats[]> {
    return this.api.get<RegionStats[]>('/api/v1/stats/regions');
  }

  getSectorStats(): Observable<SectorStats[]> {
    return this.api.get<SectorStats[]>('/api/v1/stats/sectors');
  }
}
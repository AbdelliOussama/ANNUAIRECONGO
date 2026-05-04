import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { MOCK_COMPANIES, MockCompany, MOCK_REGIONS } from './mock-companies.data';

export interface MockCompanyFilter {
  query?: string;
  sector?: string;
  region?: string;
  city?: string;
  verifiedOnly?: boolean;
  plan?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface MockCompanyPage {
  items: MockCompany[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

/**
 * In-memory directory service used until the backend is aligned.
 * Mirrors the response shape of the existing CompanyService so we can swap
 * to the real API later through an InjectionToken.
 *
 * Audit C2 — only the 6 SFD sectors appear in the seed data.
 */
@Injectable({ providedIn: 'root' })
export class MockCompanyService {

  list(filter: MockCompanyFilter = {}): Observable<MockCompanyPage> {
    const pageNumber = filter.pageNumber ?? 1;
    const pageSize   = filter.pageSize   ?? 9;

    const filtered = MOCK_COMPANIES.filter((c) => this.matches(c, filter));
    const start = (pageNumber - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return of({
      items: [...items],
      totalCount: filtered.length,
      pageNumber,
      pageSize,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    }).pipe(delay(120));
  }

  getBySlug(slug: string): Observable<MockCompany | null> {
    return of(MOCK_COMPANIES.find((c) => c.slug === slug) ?? null).pipe(delay(80));
  }

  regions(): Observable<string[]> {
    return of([...MOCK_REGIONS]);
  }

  private matches(c: MockCompany, f: MockCompanyFilter): boolean {
    if (f.query) {
      const q = f.query.toLowerCase();
      const haystack = [c.name, c.description, c.city, c.region, c.rccm].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (f.sector && c.sectorSlug !== f.sector) return false;
    if (f.region && c.region !== f.region) return false;
    if (f.city && c.city !== f.city) return false;
    if (f.verifiedOnly && !c.isVerified) return false;
    if (f.plan && c.plan !== f.plan) return false;
    return true;
  }
}

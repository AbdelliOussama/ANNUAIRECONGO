export interface CompanyContact {
  id: string;
  type: ContactType;
  value: string;
  isPrimary: boolean;
}

export enum ContactType {
  Phone = 0,
  Email = 1,
  Website = 2,
  Facebook = 3,
  Instagram = 4,
  LinkedIn = 5,
  WhatsApp = 6,
  Twitter = 7
}

export interface CompanyService {
  id: string;
  title: string;
  description?: string;
}

export interface CompanyImage {
  id: string;
  imageUrl: string;
  displayOrder: number;
  caption?: string;
}

export interface CompanyDocument {
  id: string;
  documentUrl: string;
  documentType: string;
  description?: string;
  isPublic: boolean;
}

export interface Sector {
  sectorId: string;
  name: string;
  slug?: string;
  iconUrl?: string;
  description?: string;
  isActive?: boolean;
}

export interface City {
  id: string;
  name: string;
  regionId: string;
}

export interface Region {
  id: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  logoUrl?: string;
  coverUrl?: string;
  status: CompanyStatus;
  isFeatured: boolean;
  cityId?: string;
  cityName?: string;
  regionName?: string;
  city?: { id: string; name: string };
  sectors: Sector[];
  contacts: CompanyContact[];
  services: CompanyService[];
  images: CompanyImage[];
  documents: CompanyDocument[];
  createdAt: string;
  updatedAt: string;
  activeSubscriptionId?: string;
  activeSubscription?: Subscription;
}

export enum CompanyStatus {
  Pending = 0,
  Submitted = 1,
  Validated = 2,
  Rejected = 3,
  Suspended = 4
}

export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  paymentMethod: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export interface CompanyFilter {
  searchTerm?: string;
  sectorId?: string;
  cityId?: string;
  regionId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateCompanyRequest {
  name: string;
  cityId?: string;
  sectorIds: string[];
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateCompanyProfileRequest {
  name?: string;
  description?: string;
  website?: string;
  cityId?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  sectorIds?: string[];
}
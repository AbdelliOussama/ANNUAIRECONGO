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
  companyId: string;
  planId: string;
  planName: PlanName;
  startDate: string;
  endDate: string;
  isActive: boolean;
  paymentMethod: PaymentMethod;
  payments: Payment[];
}

export enum PlanName {
  Free = 0,
  Basic = 1,
  Premium = 2,
  Enterprise = 3
}

export enum PaymentMethod {
  None = 0,
  CreditCard = 1,
  MobileMoney = 2,
  BankTransfer = 3
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentGatewayReference?: string;
  createdAt: string;
}

export enum PaymentStatus {
  Pending = 0,
  Processing = 1,
  Completed = 2,
  Failed = 3,
  Refunded = 4,
  Rejected = 5
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export enum NotificationType {
  Info = 0,
  Success = 1,
  Warning = 2,
  Error = 3
}

export interface PlatformStats {
  totalCompanies: number;
  totalValidatedCompanies: number;
  totalBusinessOwners: number;
  totalRegions: number;
  totalSectors: number;
}

export interface RegionStats {
  regionId: string;
  regionName: string;
  companyCount: number;
}

export interface SectorStats {
  sectorId: string;
  sectorName: string;
  companyCount: number;
}

export interface BusinessOwner {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  companyPosition?: string;
  createdAt: string;
  companyCount?: number;
}

export interface Plan {
  id: string;
  name: PlanName;
  price: number;
  durationDays: number;
  maxImages: number;
  maxDocuments: number;
  hasAnalytics: boolean;
  hasFeaturedBadge: boolean;
  searchPriority: number;
  isActive: boolean;
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
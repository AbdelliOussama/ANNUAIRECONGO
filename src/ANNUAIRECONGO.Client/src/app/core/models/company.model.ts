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

export enum DocumentType {
  RCCM = 0,
  NIF = 1,
  Patent = 2,
  Other = 3
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
  fileUrl: string;
  documentUrl?: string; // mapping for legacy code
  docType: number;
  description?: string;
  isPublic?: boolean;
  uploadedAt: string;
}

export interface Sector {
  id: string; // This will map to sectorId from the API
  name: string;
  slug: string;
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
  cities?: City[];
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  logoUrl?: string;
  coverUrl?: string;
  phoneNumber?: string; // added
  email?: string;       // added
  websiteUrl?: string;  // added
  status: CompanyStatus;
  rejectionReason?: string;
  isFeatured: boolean;
  isVerified: boolean;
  isPremium: boolean;
  submittedAt?: Date | string;
  rccm?: string;
  niu?: string;
  yearFounded?: number;
  ownerId: string;
  ownerName?: string;
  ownerPhone?: string;
  cityId: string;
  cityName?: string;
  regionName?: string;
  city?: { id: string; name: string };
  sectors: Sector[];
  contacts?: CompanyContact[];
  services?: CompanyService[];
  images?: CompanyImage[];
  documents?: CompanyDocument[];
  createdAt: string;
  updatedAt: string;
  activeSubscriptionId?: string;
  activeSubscription?: Subscription;
}

export enum CompanyStatus {
  Draft = 0,
  Pending = 1,
  Active = 2,
  Rejected = 3,
  Suspended = 4
}

export interface Subscription {
  id: string;
  companyId: string;
  planId: string;
  planName: string; // updated to string for UI labels
  status: number;
  paymentMethod: number; // added
  startedAt: string;
  expiresAt: string;
  isActive: boolean;
}

export enum PlanName {
  Free = 0,
  Basic = 1,
  Premium = 2,
  Enterprise = 3
}

export enum PaymentMethod {
  Stripe = 0,
  MTNMoMo = 1,
  AirtelMoney = 2
}

export interface Payment {
  id: string;
  reference: string;
  companyId: string;
  companyName?: string;
  subscriptionId: string;
  planName?: string;
  amount: number;
  currency: string;
  method: number;
  status: number;
  gatewayRef?: string;
  invoiceUrl?: string;
  paidAt?: string;
  createdAt: string;
  lastModifiedAt: string;
}

export enum PaymentStatus {
  Pending = 0,
  Success = 1,
  Completed = 1, // Alias for Success
  Failed = 2,
  Refunded = 3,
  Rejected = 4   // Added as placeholder for rejections
}

export interface Notification {
  id: string;
  userId: string;
  title: string;   // added
  message: string;
  body?: string;   // alias for message if needed
  type: string;
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
  activeCompanies: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalRevenue: number;
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

export interface CompanyStats {
  companyId: string;
  views: number;
  uniqueVisitors: number;
  contactClicks: number;
  searchAppearances: number;
  monthly: MonthlyViewBucket[];
}

export interface MonthlyViewBucket {
  month: string;
  views: number;
}

export interface BusinessOwner {
  businessOwnerId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  companyPosition: string;
  Role: string;
  IsVerified: boolean;
  Companies: Company[];
}

export interface Plan {
  id: string;
  name: string;
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
  sectorSlug?: string;
  cityId?: string;
  regionId?: string;
  regionName?: string;
  ownerId?: string;
  status?: number | null;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface CreateCompanyRequest {
  name: string;
  cityId?: string;
  sectorIds: string[];
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  logoUrl?: string;
  coverUrl?: string;
  rccm?: string;
  niu?: string;
  yearFounded?: number;
  isVerified?: boolean;
  isPremium?: boolean;
}

export interface UpdateCompanyProfileRequest {
  name?: string;
  description?: string;
  website?: string;
  cityId?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  logoUrl?: string;
  coverUrl?: string;
  sectorIds?: string[];
  rccm?: string;
  niu?: string;
  yearFounded?: number;
  isVerified?: boolean;
  isPremium?: boolean;
}

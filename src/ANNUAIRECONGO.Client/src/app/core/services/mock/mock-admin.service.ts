import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { FR } from '@core/i18n/fr.constants';
import { MOCK_COMPANIES } from './mock-companies.data';

/* ── Platform stats ───────────────────────────────────────────────── */
export interface AdminStats {
  totalCompanies: number;
  validatedCompanies: number;
  pendingCompanies: number;
  rejectedCompanies: number;
  activeOwners: number;
  totalRegions: number;
  totalSectors: number;
  monthlyRevenueXAF: number;
  newSignupsThisWeek: number;
  bySector:  { label: string; value: number }[];
  byRegion:  { label: string; value: number }[];
  byPlan:    { label: string; value: number }[];
  byStatus:  { label: string; value: number }[];
}

/* ── Pending fiches ──────────────────────────────────────────────── */
export interface PendingFiche {
  id: string;
  slug: string;
  name: string;
  sectorLabel: string;
  city: string;
  rccm: string;
  niu: string;
  ownerName: string;
  ownerEmail: string;
  submittedAt: string;
  status: 'en-attente' | 'validee' | 'rejetee';
  rejectionReason?: string;
  description: string;
}

/* ── Sectors ─────────────────────────────────────────────────────── */
export interface AdminSector {
  slug: string;
  name: string;
  icon: string;
  isActive: boolean;
  count: number;
  isLocked: boolean;
}

/* ── Geography ───────────────────────────────────────────────────── */
export interface AdminRegion {
  id: string;
  name: string;
  cities: { id: string; name: string }[];
}

/* ── Plans ───────────────────────────────────────────────────────── */
export interface AdminPlan {
  id: 'free' | 'pro' | 'premium';
  name: string;
  monthlyPriceXAF: number;
  isActive: boolean;
  maxImages: number;
  maxDocuments: number;
}

/* ── Users ───────────────────────────────────────────────────────── */
export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: 'super-admin' | 'admin' | 'entreprise';
  status: 'actif' | 'suspendu' | 'invite';
  lastLogin: string;
  companyName?: string;
}

/* ── Audit log ───────────────────────────────────────────────────── */
export interface AdminAuditEntry {
  id: string;
  date: string;
  actor: string;
  role: 'super-admin' | 'admin' | 'system';
  action: string;
  target: string;
  ip: string;
}

/* ── Admin notifications ─────────────────────────────────────────── */
export interface AdminNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  tone: 'info' | 'success' | 'warning' | 'error';
}

/* ── Platform settings ───────────────────────────────────────────── */
export interface AdminSettings {
  siteName: string;
  contactEmail: string;
  supportPhone: string;
  manualValidation: boolean;
  autoRenewBilling: boolean;
  publicRegistration: boolean;
  defaultLocale: 'fr' | 'en';
}

/**
 * Centralised mock backend for the admin shell.
 * Mirrors the contract we expect from the real services so we can swap
 * implementations later via an InjectionToken.
 *
 * Audit C2 — sectors are locked to the 6 SFD entries; the CRUD page reads
 * `isLocked` and disables destructive actions.
 */
@Injectable({ providedIn: 'root' })
export class MockAdminService {
  private readonly companies = [...MOCK_COMPANIES];
  private readonly pending: PendingFiche[] = [
    { id: 'p-001', slug: 'maritime-pn-services',     name: 'Maritime PN Services',  sectorLabel: FR.sectors.maritime.name,    city: 'Pointe-Noire', rccm: 'CG-PNR-2025-A-1100', niu: 'P025110000088', ownerName: 'Joseph Mavoungou', ownerEmail: 'jm@maritime-pn.cg',  submittedAt: '2026-04-30 11:14', status: 'en-attente', description: 'Avitaillement et soutage pour navires de commerce.' },
    { id: 'p-002', slug: 'logistique-niari-cargo',   name: 'Logistique Niari Cargo',sectorLabel: FR.sectors.logistique.name,  city: 'Dolisie',      rccm: 'CG-DLS-2025-B-0220', niu: 'P025022000011', ownerName: 'Estelle Bantsimba', ownerEmail: 'estelle@niaricargo.cg', submittedAt: '2026-04-29 16:02', status: 'en-attente', description: 'Transport routier de marchandises lourdes sur l\'axe Dolisie - Pointe-Noire.' },
    { id: 'p-003', slug: 'douane-faciliter-bzv',     name: 'Douane Faciliter BZV',  sectorLabel: FR.sectors.douane.name,      city: 'Brazzaville',  rccm: 'CG-BZV-2025-A-0455', niu: 'P025045500300', ownerName: 'Roland Diakanou', ownerEmail: 'r.diakanou@douane-faciliter.cg', submittedAt: '2026-04-28 09:30', status: 'en-attente', description: 'Commissionnaire en douane agréé, opérations import / export.' },
    { id: 'p-004', slug: 'industria-ouesso',         name: 'Industria Ouesso',      sectorLabel: FR.sectors.industrie.name,   city: 'Ouesso',       rccm: 'CG-OUE-2025-B-0033', niu: 'P025003300444', ownerName: 'Marie Itoua', ownerEmail: 'marie@industria-ouesso.cg', submittedAt: '2026-04-27 14:48', status: 'en-attente', description: 'Transformation du bois pour la filière construction.' },
    { id: 'p-005', slug: 'guard-poto-poto',          name: 'Guard Poto-Poto',       sectorLabel: FR.sectors.securite.name,    city: 'Brazzaville',  rccm: 'CG-BZV-2025-B-0918', niu: 'P025091800200', ownerName: 'Patrick Loemba', ownerEmail: 'patrick@guard-pp.cg',     submittedAt: '2026-04-25 08:07', status: 'rejetee', rejectionReason: 'Documents RCCM non lisibles, merci de re-soumettre une copie scannée en haute définition.', description: 'Société de gardiennage agréée Ministère de l\'Intérieur.' },
  ];

  private readonly sectors: AdminSector[] = [
    { slug: FR.sectors.maritime.slug,    name: FR.sectors.maritime.name,    icon: FR.sectors.maritime.icon,    isActive: true, count: 2, isLocked: true },
    { slug: FR.sectors.logistique.slug,  name: FR.sectors.logistique.name,  icon: FR.sectors.logistique.icon,  isActive: true, count: 2, isLocked: true },
    { slug: FR.sectors.douane.slug,      name: FR.sectors.douane.name,      icon: FR.sectors.douane.icon,      isActive: true, count: 2, isLocked: true },
    { slug: FR.sectors.industrie.slug,   name: FR.sectors.industrie.name,   icon: FR.sectors.industrie.icon,   isActive: true, count: 2, isLocked: true },
    { slug: FR.sectors.securite.slug,    name: FR.sectors.securite.name,    icon: FR.sectors.securite.icon,    isActive: true, count: 2, isLocked: true },
    { slug: FR.sectors.manutention.slug, name: FR.sectors.manutention.name, icon: FR.sectors.manutention.icon, isActive: true, count: 2, isLocked: true },
  ];

  private readonly regions: AdminRegion[] = [
    { id: 'r-1', name: 'Brazzaville', cities: [{ id: 'c-1', name: 'Brazzaville' }] },
    { id: 'r-2', name: 'Kouilou',     cities: [{ id: 'c-2', name: 'Pointe-Noire' }, { id: 'c-3', name: 'Loango' }, { id: 'c-4', name: 'Hinda' }] },
    { id: 'r-3', name: 'Niari',       cities: [{ id: 'c-5', name: 'Dolisie' }, { id: 'c-6', name: 'Mossendjo' }] },
    { id: 'r-4', name: 'Cuvette',     cities: [{ id: 'c-7', name: 'Oyo' }, { id: 'c-8', name: 'Owando' }, { id: 'c-9', name: 'Mossaka' }] },
    { id: 'r-5', name: 'Sangha',      cities: [{ id: 'c-10', name: 'Ouesso' }, { id: 'c-11', name: 'Sembé' }] },
    { id: 'r-6', name: 'Pool',        cities: [{ id: 'c-12', name: 'Kinkala' }] },
    { id: 'r-7', name: 'Plateaux',    cities: [{ id: 'c-13', name: 'Djambala' }] },
    { id: 'r-8', name: 'Likouala',    cities: [{ id: 'c-14', name: 'Impfondo' }] },
  ];

  private readonly plans: AdminPlan[] = [
    { id: 'free',    name: 'Free',    monthlyPriceXAF: 0,      isActive: true, maxImages: 1,    maxDocuments: 1 },
    { id: 'pro',     name: 'Pro',     monthlyPriceXAF: 25_000, isActive: true, maxImages: 30,   maxDocuments: 10 },
    { id: 'premium', name: 'Premium', monthlyPriceXAF: 75_000, isActive: true, maxImages: 100,  maxDocuments: 50 },
  ];

  private readonly users: AdminUser[] = [
    { id: 'u-001', fullName: 'Jean Makosso',        email: 'jean.makosso@annuaire-congo.cg',     role: 'super-admin', status: 'actif',   lastLogin: '2026-04-30 09:24' },
    { id: 'u-002', fullName: 'Aline Kombo',         email: 'aline.kombo@annuaire-congo.cg',      role: 'admin',       status: 'actif',   lastLogin: '2026-04-30 08:15' },
    { id: 'u-003', fullName: 'Patrick Massengo',    email: 'p.massengo@annuaire-congo.cg',       role: 'admin',       status: 'actif',   lastLogin: '2026-04-29 17:42' },
    { id: 'u-004', fullName: 'Joseph Mavoungou',    email: 'jm@maritime-pn.cg',                  role: 'entreprise',  status: 'actif',   lastLogin: '2026-04-30 11:12', companyName: 'Maritime PN Services' },
    { id: 'u-005', fullName: 'Estelle Bantsimba',   email: 'estelle@niaricargo.cg',              role: 'entreprise',  status: 'actif',   lastLogin: '2026-04-29 15:55', companyName: 'Logistique Niari Cargo' },
    { id: 'u-006', fullName: 'Roland Diakanou',     email: 'r.diakanou@douane-faciliter.cg',     role: 'entreprise',  status: 'actif',   lastLogin: '2026-04-28 09:00', companyName: 'Douane Faciliter BZV' },
    { id: 'u-007', fullName: 'Patrick Loemba',      email: 'patrick@guard-pp.cg',                role: 'entreprise',  status: 'suspendu',lastLogin: '2026-04-22 16:18', companyName: 'Guard Poto-Poto' },
    { id: 'u-008', fullName: 'Sylvie Tchimbakala',  email: 'sylvie@annuaire-congo.cg',           role: 'admin',       status: 'invite',  lastLogin: '—' },
  ];

  private readonly audit: AdminAuditEntry[] = [
    { id: 'a-001', date: '2026-04-30 11:14', actor: 'Joseph Mavoungou', role: 'system',     action: 'Soumission de fiche',    target: 'Maritime PN Services',    ip: '154.124.10.5' },
    { id: 'a-002', date: '2026-04-30 09:24', actor: 'Jean Makosso',     role: 'super-admin',action: 'Connexion',              target: 'Console admin',           ip: '154.124.22.18' },
    { id: 'a-003', date: '2026-04-29 17:42', actor: 'Patrick Massengo', role: 'admin',      action: 'Validation de fiche',    target: 'Bassin Maritime Services',ip: '154.124.10.2' },
    { id: 'a-004', date: '2026-04-25 08:11', actor: 'Aline Kombo',      role: 'admin',      action: 'Rejet de fiche',         target: 'Guard Poto-Poto',         ip: '154.124.10.1' },
    { id: 'a-005', date: '2026-04-22 14:30', actor: 'Jean Makosso',     role: 'super-admin',action: 'Modification forfait Pro', target: 'Forfait Pro',           ip: '154.124.22.18' },
    { id: 'a-006', date: '2026-04-20 09:55', actor: 'Jean Makosso',     role: 'super-admin',action: 'Création utilisateur admin', target: 'Sylvie Tchimbakala',  ip: '154.124.22.18' },
  ];

  private readonly notifications: AdminNotification[] = [
    { id: 'an-1', title: '5 nouvelles fiches en attente', body: '5 fiches ont été soumises et attendent votre validation.', createdAt: '2026-04-30 11:14', isRead: false, tone: 'info' },
    { id: 'an-2', title: 'Pic d\'inscriptions',           body: '12 inscriptions enregistrées au cours des 24 dernières heures.', createdAt: '2026-04-30 08:00', isRead: false, tone: 'success' },
    { id: 'an-3', title: 'Erreur paiement signalée',      body: 'Un utilisateur signale un échec de paiement Stripe (ref T-2026-018).', createdAt: '2026-04-29 18:24', isRead: true,  tone: 'warning' },
  ];

  private settings: AdminSettings = {
    siteName: 'Annuaire Congo',
    contactEmail: 'contact@annuaire-congo.cg',
    supportPhone: '+242 06 600 00 00',
    manualValidation: true,
    autoRenewBilling: true,
    publicRegistration: true,
    defaultLocale: 'fr',
  };

  /* ── Public API ─────────────────────────────────────────────── */
  stats(): Observable<AdminStats> {
    const all = this.companies.length + this.pending.length;
    return of({
      totalCompanies:      all,
      validatedCompanies:  this.companies.filter((c) => c.isVerified).length,
      pendingCompanies:    this.pending.filter((p) => p.status === 'en-attente').length,
      rejectedCompanies:   this.pending.filter((p) => p.status === 'rejetee').length,
      activeOwners:        this.users.filter((u) => u.role === 'entreprise' && u.status === 'actif').length,
      totalRegions:        this.regions.length,
      totalSectors:        this.sectors.length,
      monthlyRevenueXAF:   125_000,
      newSignupsThisWeek:  12,
      bySector: this.sectors.map((s) => ({ label: s.name, value: s.count })),
      byRegion: this.regions.map((r) => ({ label: r.name, value: this.companies.filter((c) => c.region === r.name).length })),
      byPlan: [
        { label: 'Free',    value: 5 },
        { label: 'Pro',     value: 5 },
        { label: 'Premium', value: 2 },
      ],
      byStatus: [
        { label: 'Vérifiées', value: this.companies.filter((c) => c.isVerified).length },
        { label: 'En attente', value: this.pending.filter((p) => p.status === 'en-attente').length },
        { label: 'Refusées',   value: this.pending.filter((p) => p.status === 'rejetee').length },
      ],
    }).pipe(delay(120));
  }

  pendingList$(): Observable<PendingFiche[]> {
    return of([...this.pending]).pipe(delay(120));
  }
  pendingById(id: string): Observable<PendingFiche | null> {
    return of(this.pending.find((p) => p.id === id) ?? null).pipe(delay(80));
  }
  validateFiche(id: string): Observable<void> {
    const f = this.pending.find((p) => p.id === id);
    if (f) f.status = 'validee';
    return of(undefined).pipe(delay(150));
  }
  rejectFiche(id: string, reason: string): Observable<void> {
    const f = this.pending.find((p) => p.id === id);
    if (f) { f.status = 'rejetee'; f.rejectionReason = reason; }
    return of(undefined).pipe(delay(150));
  }

  companies$(): Observable<typeof MOCK_COMPANIES> {
    return of(MOCK_COMPANIES).pipe(delay(120));
  }

  sectors$(): Observable<AdminSector[]> {
    return of([...this.sectors]).pipe(delay(80));
  }
  toggleSector(slug: string): Observable<void> {
    const s = this.sectors.find((x) => x.slug === slug);
    if (s) s.isActive = !s.isActive;
    return of(undefined).pipe(delay(80));
  }

  regions$(): Observable<AdminRegion[]> {
    return of(this.regions.map((r) => ({ ...r, cities: [...r.cities] }))).pipe(delay(80));
  }

  plans$(): Observable<AdminPlan[]> {
    return of([...this.plans]).pipe(delay(80));
  }
  updatePlan(plan: Partial<AdminPlan> & { id: AdminPlan['id'] }): Observable<void> {
    const p = this.plans.find((x) => x.id === plan.id);
    if (p) Object.assign(p, plan);
    return of(undefined).pipe(delay(120));
  }

  users$(): Observable<AdminUser[]> {
    return of([...this.users]).pipe(delay(80));
  }
  toggleUser(id: string): Observable<void> {
    const u = this.users.find((x) => x.id === id);
    if (u) u.status = u.status === 'actif' ? 'suspendu' : 'actif';
    return of(undefined).pipe(delay(80));
  }

  audit$(): Observable<AdminAuditEntry[]> {
    return of([...this.audit]).pipe(delay(80));
  }

  notifications$(): Observable<AdminNotification[]> {
    return of([...this.notifications]).pipe(delay(80));
  }

  settings$(): Observable<AdminSettings> {
    return of({ ...this.settings }).pipe(delay(80));
  }
  saveSettings(s: AdminSettings): Observable<void> {
    this.settings = { ...s };
    return of(undefined).pipe(delay(120));
  }
}

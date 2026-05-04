import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

/* ── Plans ───────────────────────────────────────────────────────── */
export interface MockPlan {
  id: 'free' | 'pro' | 'premium';
  name: string;
  monthlyPrice: number;
  features: string[];
}

export const MOCK_PLANS: ReadonlyArray<MockPlan> = [
  { id: 'free',    name: 'Free',    monthlyPrice: 0,      features: ['Fiche basique', '1 photo', '1 document'] },
  { id: 'pro',     name: 'Pro',     monthlyPrice: 25_000, features: ['Badge vérifiée', 'Photos illimitées', 'Statistiques mensuelles'] },
  { id: 'premium', name: 'Premium', monthlyPrice: 75_000, features: ['Mise en avant', 'Stats avancées', 'API & support dédié'] },
];

/* ── Subscription ─────────────────────────────────────────────────── */
export interface MockSubscription {
  id: string;
  planId: 'free' | 'pro' | 'premium';
  planName: string;
  startedAt: string;
  expiresAt: string;
  isActive: boolean;
  autoRenew: boolean;
  monthlyPrice: number;
}

/* ── Payment history ──────────────────────────────────────────────── */
export interface MockPaymentRecord {
  id: string;
  date: string;
  amount: number;
  currency: 'XAF';
  method: 'mtn' | 'airtel' | 'stripe';
  status: 'paye' | 'en-cours' | 'echoue' | 'rembourse';
  invoiceUrl: string;
  reference: string;
  planName: string;
}

/* ── Notifications ────────────────────────────────────────────────── */
export interface MockNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  tone: 'info' | 'success' | 'warning' | 'error';
  link?: string;
}

/* ── Fiche stats ──────────────────────────────────────────────────── */
export interface MockFicheStats {
  views: number;
  uniqueVisitors: number;
  contactClicks: number;
  searchAppearances: number;
  monthly: { month: string; views: number }[];
}

/* ── User-owned company ───────────────────────────────────────────── */
export interface MockOwnedCompany {
  id: string;
  slug: string;
  name: string;
  status: 'brouillon' | 'en-attente' | 'validee' | 'rejetee';
  rejectionReason?: string;
  rccm: string;
  niu: string;
  sector: string;
  city: string;
  description: string;
  address: string;
  website: string;
  phone: string;
  email: string;
}

/**
 * Centralised mock backend for the espace entreprise.
 *
 * On instantiation we read the AuthService user state and decide whether to
 * seed an "owned company". This lets us reproduce both the **first-time**
 * experience (empty state + CTA "Créer ma fiche" — audit C9) and the
 * **established owner** experience (fiche editor, stats, abonnement,
 * historique).
 *
 * Toggle `owns()` from any component to flip between the two states during
 * the rebuild so we can review both flows.
 */
@Injectable({ providedIn: 'root' })
export class MockEspaceService {
  private readonly auth = inject(AuthService);

  /** When false, the console renders the "create your fiche" empty state. */
  private readonly _owns = signal<boolean>(true);
  readonly owns = this._owns.asReadonly();
  setOwns(v: boolean): void { this._owns.set(v); }

  private readonly company: MockOwnedCompany = {
    id: 'self-1',
    slug: 'congo-shipping-sa',
    name: 'Congo Shipping SA',
    status: 'validee',
    rccm: 'CG-PNR-1998-A-1234',
    niu: 'P998123456789',
    sector: 'maritime',
    city: 'Pointe-Noire',
    description:
      'Expert en logistique maritime et transport de conteneurs dans le bassin du Congo depuis 1998.',
    address: 'Avenue du Général de Gaulle, Port autonome',
    website: 'https://congoshipping.cg',
    phone: '+242 06 512 0001',
    email: 'contact@congoshipping.cg',
  };

  private readonly subscription: MockSubscription = {
    id: 'sub-001',
    planId: 'pro',
    planName: 'Pro',
    startedAt: '2026-01-15',
    expiresAt: '2026-12-15',
    isActive: true,
    autoRenew: true,
    monthlyPrice: 25_000,
  };

  private readonly payments: MockPaymentRecord[] = [
    { id: 'pay-005', date: '2026-04-15', amount: 25_000, currency: 'XAF', method: 'mtn',    status: 'paye',     invoiceUrl: '/factures/F-2026-005.pdf', reference: 'F-2026-005', planName: 'Pro' },
    { id: 'pay-004', date: '2026-03-15', amount: 25_000, currency: 'XAF', method: 'mtn',    status: 'paye',     invoiceUrl: '/factures/F-2026-004.pdf', reference: 'F-2026-004', planName: 'Pro' },
    { id: 'pay-003', date: '2026-02-15', amount: 25_000, currency: 'XAF', method: 'airtel', status: 'paye',     invoiceUrl: '/factures/F-2026-003.pdf', reference: 'F-2026-003', planName: 'Pro' },
    { id: 'pay-002', date: '2026-01-15', amount: 25_000, currency: 'XAF', method: 'stripe', status: 'paye',     invoiceUrl: '/factures/F-2026-002.pdf', reference: 'F-2026-002', planName: 'Pro' },
    { id: 'pay-001', date: '2025-12-15', amount: 0,      currency: 'XAF', method: 'mtn',    status: 'paye',     invoiceUrl: '/factures/F-2025-001.pdf', reference: 'F-2025-001', planName: 'Free' },
  ];

  private readonly notifications: MockNotification[] = [
    { id: 'n-1', title: 'Votre fiche a été validée', body: 'Bonne nouvelle : votre fiche est désormais visible publiquement sur l\'annuaire.', createdAt: '2026-04-29 09:24', isRead: false, tone: 'success', link: '/annuaire/congo-shipping-sa' },
    { id: 'n-2', title: 'Paiement reçu',             body: 'Nous avons bien reçu votre paiement Pro de 25 000 XAF (référence F-2026-005).',  createdAt: '2026-04-15 11:02', isRead: false, tone: 'info',    link: '/espace/abonnement/historique' },
    { id: 'n-3', title: 'Renouvellement à venir',    body: 'Votre abonnement Pro arrive à échéance dans 30 jours. Pensez à le renouveler.', createdAt: '2026-04-10 08:15', isRead: true,  tone: 'warning', link: '/espace/abonnement' },
    { id: 'n-4', title: 'Nouveau message d\'un visiteur', body: 'Un visiteur a cliqué sur votre numéro de téléphone depuis l\'annuaire.',     createdAt: '2026-04-02 16:48', isRead: true,  tone: 'info' },
  ];

  private readonly stats: MockFicheStats = {
    views: 2_843,
    uniqueVisitors: 1_276,
    contactClicks: 168,
    searchAppearances: 4_120,
    monthly: [
      { month: 'Nov', views: 312 }, { month: 'Déc', views: 354 }, { month: 'Jan', views: 401 },
      { month: 'Fév', views: 488 }, { month: 'Mar', views: 612 }, { month: 'Avr', views: 676 },
    ],
  };

  /* ── API ──────────────────────────────────────────────────────── */
  myCompany(): Observable<MockOwnedCompany | null> {
    return of(this._owns() ? this.company : null).pipe(delay(120));
  }

  saveCompany(patch: Partial<MockOwnedCompany>): Observable<MockOwnedCompany> {
    Object.assign(this.company, patch);
    this._owns.set(true);
    return of(this.company).pipe(delay(220));
  }

  mySubscription(): Observable<MockSubscription | null> {
    return of(this._owns() ? this.subscription : null).pipe(delay(120));
  }

  changePlan(planId: 'free' | 'pro' | 'premium'): Observable<MockSubscription> {
    const plan = MOCK_PLANS.find((p) => p.id === planId)!;
    this.subscription.planId = plan.id;
    this.subscription.planName = plan.name;
    this.subscription.monthlyPrice = plan.monthlyPrice;
    return of(this.subscription).pipe(delay(220));
  }

  payments$(): Observable<MockPaymentRecord[]> {
    return of(this._owns() ? this.payments.slice() : []).pipe(delay(120));
  }

  notifications$(): Observable<MockNotification[]> {
    return of(this.notifications.slice()).pipe(delay(120));
  }
  unreadCount$(): Observable<number> {
    return this.notifications$().pipe(map((n) => n.filter((x) => !x.isRead).length));
  }
  markRead(id: string): Observable<void> {
    const n = this.notifications.find((x) => x.id === id);
    if (n) n.isRead = true;
    return of(undefined).pipe(delay(60));
  }
  markAllRead(): Observable<void> {
    for (const n of this.notifications) n.isRead = true;
    return of(undefined).pipe(delay(60));
  }

  ficheStats$(): Observable<MockFicheStats> {
    return of(this.stats).pipe(delay(150));
  }

  /** Display-friendly identity for the connected user (or a sensible fallback). */
  userIdentity(): { name: string; email: string; phone?: string; position?: string } {
    const u = this.auth.currentUser();
    if (!u) return { name: 'Mon compte', email: '' };
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.email;
    return {
      name,
      email: u.email,
      phone: u.phoneNumber,
      position: u.companyPosition,
    };
  }
}

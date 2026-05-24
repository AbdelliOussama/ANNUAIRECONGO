import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Company } from '../models/company.model';
import { BusinessOwnerService } from './business-owner.service';
import { AuthService } from './auth.service';

/**
 * CompanyContextService — singleton that holds the "active company" for the
 * entire /espace shell.
 *
 * KEY DESIGN DECISIONS
 * --------------------
 * 1. Auth-reactive: uses effect() to watch AuthService.currentUser().
 *    - On LOGIN  → fetch the new user's companies, restore their persisted selection.
 *    - On LOGOUT → clear all state immediately so the next user starts fresh.
 *    This prevents cross-user contamination when two different accounts log in
 *    sequentially without a full page reload.
 *
 * 2. User-scoped localStorage: the key is `ac_cid_<userId>` — each user's
 *    last-selected company is stored independently.
 *
 * 3. Single source of truth: every espace component reads selectedCompany()
 *    instead of calling getMyCompanies() independently.
 */
@Injectable({ providedIn: 'root' })
export class CompanyContextService {
  private readonly boService = inject(BusinessOwnerService);
  private readonly auth      = inject(AuthService);

  // ── Internal state ─────────────────────────────────────────────────────────
  private readonly _companies  = signal<Company[]>([]);
  private readonly _selectedId = signal<string | null>(null);
  private readonly _loaded     = signal(false);

  // ── Public read-only signals ───────────────────────────────────────────────
  readonly companies = this._companies.asReadonly();
  readonly loaded    = this._loaded.asReadonly();

  /**
   * The currently selected company. Falls back to the first in the list when
   * the stored id no longer exists (e.g. after deletion or user switch).
   */
  readonly selectedCompany = computed<Company | null>(() => {
    const list = this._companies();
    const id   = this._selectedId();
    if (!list.length) return null;
    if (id) {
      const found = list.find(c => c.id === id);
      if (found) return found;
    }
    return list[0];
  });

  readonly selectedCompanyId = computed<string | null>(() =>
    this.selectedCompany()?.id ?? null
  );

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  constructor() {
    /**
     * React to authentication state changes.
     *
     * - currentUser() becomes a non-null User  → a user just logged in (or
     *   the app reloaded with a stored session). Restore their persisted
     *   company selection and fetch their company list.
     *
     * - currentUser() becomes null             → logout. Clear everything so
     *   the next user who logs in starts with a blank slate.
     */
    effect(() => {
      const user = this.auth.currentUser();

      if (user) {
        // Restore the persisted selection that belongs to THIS user.
        const userId = this.auth.getUserId();
        this._selectedId.set(this._restoreId(userId));
        // Fetch this user's companies.
        this.load();
      } else {
        // Logout — wipe state so the next user cannot see stale data.
        this._companies.set([]);
        this._selectedId.set(null);
        this._loaded.set(false);
      }
    });
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Switch the active company and persist the choice under this user's key. */
  selectCompany(id: string): void {
    this._selectedId.set(id);
    const userId = this.auth.getUserId();
    try { localStorage.setItem(this._storageKey(userId), id); } catch { /* SSR / private mode */ }
  }

  /**
   * Re-fetch the companies list. Call after creating, updating, or deleting a
   * company so all espace pages update automatically.
   */
  refresh(): void {
    this._loaded.set(false);
    this.load();
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private load(): void {
    this.boService.getMyCompanies().subscribe({
      next: (list) => {
        this._companies.set(list);
        this._loaded.set(true);

        // Validate the persisted selection — drop it if the company no longer
        // exists in the new list (e.g. after deletion or after a user switch
        // where the stored id belongs to a different user's company).
        const stored = this._selectedId();
        if (stored && !list.find(c => c.id === stored)) {
          this._selectedId.set(list[0]?.id ?? null);
        }
      },
      error: () => {
        this._loaded.set(true);
      },
    });
  }

  /** Returns a user-scoped localStorage key so selections never bleed across accounts. */
  private _storageKey(userId: string | null): string {
    return userId ? `ac_cid_${userId}` : 'ac_cid_guest';
  }

  private _restoreId(userId: string | null): string | null {
    try { return localStorage.getItem(this._storageKey(userId)); } catch { return null; }
  }
}

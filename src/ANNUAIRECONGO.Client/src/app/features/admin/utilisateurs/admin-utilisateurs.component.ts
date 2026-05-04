import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MockAdminService, AdminUser } from '@core/services/mock/mock-admin.service';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { ToastService } from '@shared/services/toast.service';
import { ModalService } from '@shared/services/modal.service';

type RoleFilter = 'all' | 'super-admin' | 'admin' | 'entreprise';

/**
 * /admin/utilisateurs — gestion des comptes (Super-Admin scope).
 * Audit P1 — page absente du livrable initial.
 */
@Component({
  selector: 'ac-admin-utilisateurs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonComponent],
  template: `
    <div class="page">
      <header class="page-head">
        <p class="eyebrow">Sécurité</p>
        <h1>Gestion des utilisateurs</h1>
        <p class="sub">Comptes Super-Admin, Admin et Entreprise. Activez ou suspendez un accès en un clic.</p>
      </header>

      <div class="toolbar">
        <input
          type="search"
          class="form-input"
          [value]="query()"
          (input)="onQuery($event)"
          placeholder="Rechercher par nom ou e-mail…"
          aria-label="Recherche utilisateur"
        />

        <div class="filters" role="tablist" aria-label="Filtrer par rôle">
          @for (f of roleFilters; track f.value) {
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="role() === f.value"
              [class.is-active]="role() === f.value"
              (click)="role.set(f.value)"
            >{{ f.label }}</button>
          }
        </div>
      </div>

      @if (loading()) {
        <ac-skeleton shape="card" height="240px" />
      } @else {
        <div class="table-wrap">
          <table aria-label="Liste des utilisateurs">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Entreprise</th>
                <th>Dernière connexion</th>
                <th>Statut</th>
                <th class="sr-only">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (u of rows(); track u.id) {
                <tr>
                  <td class="name">
                    <p class="title">{{ u.fullName }}</p>
                    <p class="email">{{ u.email }}</p>
                  </td>
                  <td><span [class]="roleClass(u.role)">{{ roleLabel(u.role) }}</span></td>
                  <td>{{ u.companyName || '—' }}</td>
                  <td class="mono">{{ u.lastLogin }}</td>
                  <td><span [class]="statusClass(u.status)">{{ statusLabel(u.status) }}</span></td>
                  <td class="actions-col">
                    @if (u.status !== 'invite') {
                      <button
                        type="button"
                        class="link"
                        (click)="toggle(u)"
                        [attr.aria-label]="(u.status === 'actif' ? 'Suspendre ' : 'Réactiver ') + u.fullName"
                      >
                        {{ u.status === 'actif' ? 'Suspendre' : 'Réactiver' }}
                      </button>
                    } @else {
                      <span class="muted">Invitation envoyée</span>
                    }
                  </td>
                </tr>
              }
              @if (rows().length === 0) {
                <tr><td colspan="6" class="empty">Aucun utilisateur ne correspond à ces critères.</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { display: flex; flex-direction: column; gap: 16px; max-width: 1200px; margin: 0 auto; }
    .page-head h1 { font-family: var(--font-headline); font-size: 30px; font-weight: 800; margin: 6px 0 8px; }
    .page-head .sub { color: var(--color-on-secondary-container); font-size: 14px; margin: 0; }

    .toolbar { display: flex; gap: 12px; flex-wrap: wrap; }
    .toolbar .form-input { max-width: 360px; flex: 1; min-width: 220px; }

    .filters { display: inline-flex; gap: 4px; padding: 4px; background: var(--color-surface-container-low); border-radius: var(--radius-md); }
    .filters button {
      border: none; background: transparent;
      padding: 8px 14px; font-family: var(--font-body); font-size: 12px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.06em;
      color: var(--color-on-secondary-container);
      border-radius: var(--radius-sm); cursor: pointer;
    }
    .filters button.is-active {
      background: var(--color-surface-container-lowest);
      color: var(--color-primary);
      box-shadow: var(--shadow-card);
    }

    .table-wrap { background: var(--color-surface-container-lowest); border-radius: var(--radius-2xl); box-shadow: var(--shadow-card); overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-family: var(--font-body); }
    th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid var(--color-outline-variant); font-size: 13px; }
    th { background: var(--color-surface-container-low); text-transform: uppercase; letter-spacing: 0.06em; font-size: 11px; font-weight: 700; }
    tbody tr:last-child td { border-bottom: 0; }
    .mono { font-variant-numeric: tabular-nums; }
    .title { font-weight: 700; color: var(--color-on-surface); margin: 0 0 4px; }
    .email { font-size: 11px; color: var(--color-outline); margin: 0; }
    .empty { text-align: center; color: var(--color-outline); padding: 32px; }
    .actions-col { text-align: right; }
    .link { background: none; border: none; cursor: pointer; color: var(--color-primary); font-weight: 700; padding: 0; font: inherit; }
    .link:hover { text-decoration: underline; }
    .muted { color: var(--color-outline); font-size: 12px; }

    .role { display: inline-flex; padding: 3px 10px; border-radius: var(--radius-full); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
    .role-super-admin { background: var(--color-tertiary-fixed); color: var(--color-on-tertiary-fixed); }
    .role-admin       { background: var(--color-secondary-container); color: var(--color-on-secondary-fixed); }
    .role-entreprise  { background: var(--color-primary-fixed); color: var(--color-on-primary-fixed); }

    .status { display: inline-flex; padding: 3px 10px; border-radius: var(--radius-full); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
    .status-actif    { background: var(--color-primary-fixed); color: var(--color-on-primary-fixed); }
    .status-suspendu { background: var(--color-error-container); color: var(--color-on-error-container); }
    .status-invite   { background: var(--color-surface-container-highest); color: var(--color-on-surface-variant); }
  `],
})
export class AdminUtilisateursComponent {
  private readonly admin = inject(MockAdminService);
  private readonly toast = inject(ToastService);
  private readonly modal = inject(ModalService);

  protected readonly query = signal('');
  protected readonly role  = signal<RoleFilter>('all');

  protected readonly roleFilters: ReadonlyArray<{ value: RoleFilter; label: string }> = [
    { value: 'all',         label: 'Tous'        },
    { value: 'super-admin', label: 'Super-Admin' },
    { value: 'admin',       label: 'Admin'       },
    { value: 'entreprise',  label: 'Entreprise'  },
  ];

  private readonly initial = toSignal(this.admin.users$(), { initialValue: [] as AdminUser[] });
  protected readonly users = signal<AdminUser[]>([]);
  // Hydrate once
  private readonly _ = computed(() => {
    const v = this.initial();
    if (v.length && this.users().length === 0) this.users.set([...v]);
    return null;
  });
  constructor() { this._(); }

  protected readonly loading = computed(() => this.users().length === 0 && this.firstLoad());
  private readonly firstLoad = signal(true);
  // (firstLoad clears once users hydrated)
  private readonly __ = computed(() => { if (this.users().length) this.firstLoad.set(false); return null; });

  protected readonly rows = computed(() => {
    const q = this.query().trim().toLowerCase();
    const role = this.role();
    return this.users().filter((u) =>
      (role === 'all' || u.role === role) &&
      (!q || [u.fullName, u.email, u.companyName ?? ''].some((v) => v.toLowerCase().includes(q)))
    );
  });

  protected onQuery(e: Event): void { this.query.set((e.target as HTMLInputElement).value); }

  protected async toggle(u: AdminUser): Promise<void> {
    const next = u.status === 'actif' ? 'suspendu' : 'actif';
    const { confirmed } = await this.modal.confirm({
      title: next === 'suspendu' ? `Suspendre ${u.fullName} ?` : `Réactiver ${u.fullName} ?`,
      body: next === 'suspendu'
        ? 'L\'utilisateur ne pourra plus se connecter jusqu\'à réactivation.'
        : 'L\'utilisateur pourra de nouveau se connecter immédiatement.',
      tone: next === 'suspendu' ? 'danger' : 'confirm',
      confirmLabel: next === 'suspendu' ? 'Suspendre' : 'Réactiver',
    });
    if (!confirmed) return;

    this.admin.toggleUser(u.id).subscribe(() => {
      this.users.update((list) =>
        list.map((x) => x.id === u.id ? { ...x, status: next as AdminUser['status'] } : x)
      );
      this.toast.success(next === 'suspendu'
        ? `${u.fullName} a été suspendu(e).`
        : `${u.fullName} est de nouveau actif(ve).`);
    });
  }

  protected roleLabel(r: AdminUser['role']): string {
    return ({ 'super-admin': 'Super-Admin', admin: 'Admin', entreprise: 'Entreprise' } as const)[r];
  }
  protected roleClass(r: AdminUser['role']): string { return `role role-${r}`; }
  protected statusLabel(s: AdminUser['status']): string {
    return ({ actif: 'Actif', suspendu: 'Suspendu', invite: 'Invité' } as const)[s];
  }
  protected statusClass(s: AdminUser['status']): string { return `status status-${s}`; }
}

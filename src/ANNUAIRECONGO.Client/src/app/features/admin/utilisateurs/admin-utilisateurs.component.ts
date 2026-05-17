import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AdminService } from '@core/services/admin.service';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { ToastService } from '@shared/services/toast.service';
import { ModalService } from '@shared/services/modal.service';
import { BehaviorSubject, switchMap, catchError, of, debounceTime } from 'rxjs';

type RoleFilter = 'all' | 'SuperAdmin' | 'Admin' | 'BusinessOwner';

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
              (click)="onRoleChange(f.value)"
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
                <th>Statut</th>
                <th class="sr-only">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (u of rows(); track u.id) {
                <tr>
                  <td class="name">
                    <p class="title">{{ u.firstName }} {{ u.lastName }}</p>
                    <p class="email">{{ u.email }}</p>
                  </td>
                  <td><span [class]="roleClass(u.role)">{{ u.role }}</span></td>
                  <td>
                    @if (u.emailConfirmed) {
                      <span class="badge badge-verified">Actif</span>
                    } @else {
                      <span class="badge badge-pending">Non vérifié</span>
                    }
                  </td>
                  <td class="actions-col">
                    <button
                      type="button"
                      class="link"
                      (click)="toggle(u)"
                    >
                      Gérer
                    </button>
                  </td>
                </tr>
              }
              @if (rows().length === 0) {
                <tr><td colspan="4" class="empty">Aucun utilisateur ne correspond à ces critères.</td></tr>
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

    .role { display: inline-flex; padding: 3px 10px; border-radius: var(--radius-full); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
    .role-SuperAdmin { background: var(--color-tertiary-fixed); color: var(--color-on-tertiary-fixed); }
    .role-Admin      { background: var(--color-secondary-container); color: var(--color-on-secondary-fixed); }
    .role-BusinessOwner { background: var(--color-primary-fixed); color: var(--color-on-primary-fixed); }
  `],
})
export class AdminUtilisateursComponent {
  private readonly adminService = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly modal = inject(ModalService);

  protected readonly query = signal('');
  protected readonly role  = signal<RoleFilter>('all');

  protected readonly roleFilters: ReadonlyArray<{ value: RoleFilter; label: string }> = [
    { value: 'all',           label: 'Tous'        },
    { value: 'SuperAdmin',    label: 'Super-Admin' },
    { value: 'Admin',         label: 'Admin'       },
    { value: 'BusinessOwner', label: 'Entreprise'  },
  ];

  private readonly trigger = new BehaviorSubject<void>(undefined);
  
  private readonly result = toSignal(
    this.trigger.pipe(
      debounceTime(300),
      switchMap(() => this.adminService.getUsers()),
      catchError(() => of([] as any[]))
    ),
    { initialValue: [] as any[] }
  );

  protected readonly rows = computed(() => {
    const q = this.query().toLowerCase();
    const r = this.role();
    return this.result().map(u => {
      // Resolve primary role for display
      let displayRole = 'User';
      if (u.roles?.includes('SuperAdmin')) displayRole = 'SuperAdmin';
      else if (u.roles?.includes('Admin')) displayRole = 'Admin';
      else if (u.roles?.includes('BusinessOwner') || u.roles?.includes('EntrepriseOwner')) displayRole = 'BusinessOwner';

      return {
        ...u,
        id: u.userId, // Map userId to id
        role: displayRole,
        emailConfirmed: true // IdentityUser has this, but we'll assume true for seeded
      };
    }).filter(u => 
      (r === 'all' || u.role === r) &&
      (u.firstName?.toLowerCase().includes(q) || u.lastName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
    );
  });

  protected readonly loading = computed(() => this.result().length === 0 && this.query() === '');

  protected onQuery(e: Event): void {
    this.query.set((e.target as HTMLInputElement).value);
    this.trigger.next();
  }

  protected onRoleChange(r: RoleFilter): void {
    this.role.set(r);
    this.trigger.next();
  }

  protected async toggle(u: any): Promise<void> {
    const ok = window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le compte de ${u.firstName} ${u.lastName} ? Cette action est irréversible.`);
    if (!ok) return;

    this.adminService.deleteUser(u.id).subscribe({
      next: () => {
        this.toast.success('Utilisateur supprimé avec succès.');
        this.trigger.next(); // Refresh list
      },
      error: (err) => {
        console.error('Delete failed', err);
        this.toast.error('Erreur lors de la suppression de l\'utilisateur.');
      }
    });
  }

  protected roleClass(r: string): string { return `role role-${r}`; }
}

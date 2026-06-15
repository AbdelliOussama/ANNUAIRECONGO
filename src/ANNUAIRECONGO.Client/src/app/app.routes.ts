import { Routes } from '@angular/router';
import { authGuard, adminGuard, publicGuard, entrepriseOwnerGuard, espaceGuard } from './core/guards/auth.guard';

/**
 * Annuaire Congo — route table.
 *
 * Layout strategy (audit C8, M3, M4):
 *   ''           → PublicLayout
 *   '/auth/*'    → AuthLayout
 *   '/espace/*'  → EspaceLayout (authGuard)
 *   '/admin/*'   → AdminLayout  (authGuard + adminGuard)
 *
 * Sprint 3 — public/* feature components are now real (accueil, annuaire,
 * fiche, secteurs, tarifs, cartographie, registre, contact, support, mentions,
 * confidentialité, 404, dirigeants, trust-score, rapport-ia, appels-offres).
 *
 * Sprints 4–6 will replace the auth/espace/admin placeholders one by one.
 */
export const routes: Routes = [
  /* ─── Public ──────────────────────────────────────────────────────── */
  {
    path: '',
    loadComponent: () =>
      import('./layout/public/public-layout.component').then((m) => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/public/accueil/accueil.component').then((m) => m.AccueilComponent),
        title: 'Annuaire Congo — Accueil',
      },
      {
        path: 'annuaire',
        loadComponent: () =>
          import('./features/public/annuaire/annuaire-list.component').then((m) => m.AnnuaireListComponent),
        title: 'Annuaire — Entreprises de Congo-Brazzaville',
      },
      {
        path: 'annuaire/:id',
        loadComponent: () =>
          import('./features/public/annuaire/fiche-entreprise.component').then((m) => m.FicheEntrepriseComponent),
        title: 'Fiche entreprise — Annuaire Congo',
      },
      {
        path: 'secteurs',
        loadComponent: () =>
          import('./features/public/secteurs/secteurs.component').then((m) => m.SecteursComponent),
        title: '6 secteurs stratégiques — Annuaire Congo',
      },
      {
        path: 'cartographie',
        loadComponent: () =>
          import('./features/public/cartographie/cartographie.component').then((m) => m.CartographieComponent),
        title: 'Cartographie des entreprises — Annuaire Congo',
      },
      {
        path: 'tarifs',
        loadComponent: () =>
          import('./features/public/tarifs/tarifs.component').then((m) => m.TarifsComponent),
        title: 'Forfaits & Tarifs — Annuaire Congo',
      },
      {
        path: 'registre',
        loadComponent: () =>
          import('./features/public/registre/registre.component').then((m) => m.RegistreComponent),
        title: 'Registre national — Annuaire Congo',
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./features/public/contact/contact.component').then((m) => m.ContactComponent),
        title: 'Nous contacter — Annuaire Congo',
      },
      {
        path: 'support',
        loadComponent: () =>
          import('./features/public/support/support.component').then((m) => m.SupportComponent),
        title: 'Support & Aide — Annuaire Congo',
      },
      {
        path: 'mentions-legales',
        loadComponent: () =>
          import('./features/public/legal/legal-page.component').then((m) => m.LegalPageComponent),
        data: { kind: 'mentions' },
        title: 'Mentions légales — Annuaire Congo',
      },
      {
        path: 'confidentialite',
        loadComponent: () =>
          import('./features/public/legal/legal-page.component').then((m) => m.LegalPageComponent),
        data: { kind: 'confidentialite' },
        title: 'Confidentialité — Annuaire Congo',
      },

      /* Hors-spec — admin-only: redirect to the admin panel equivalent.
         Guards live on the /admin/* parent layout (authGuard + adminGuard),
         so no guard is needed here on the redirect itself. */
      {
        path: 'dirigeants',
        redirectTo: '/admin/dirigeants',
        pathMatch: 'full',
      },
      {
        path: 'trust-score',
        loadComponent: () =>
          import('./features/public/extras/trust-score.component').then((m) => m.TrustScoreComponent),
        title: 'Trust Score — Annuaire Congo',
      },
      {
        path: 'rapport-ia',
        redirectTo: '/admin/rapport-ia',
        pathMatch: 'full',
      },
      {
        path: 'appels-offres',
        loadComponent: () =>
          import('./features/public/extras/appels-offres.component').then((m) => m.AppelsOffresComponent),
        title: 'Appels d\'offres — Annuaire Congo',
      },

      /* 404 — child of PublicLayout so the public chrome stays visible. */
      {
        path: '404',
        loadComponent: () =>
          import('./features/public/not-found/not-found.component').then((m) => m.NotFoundComponent),
        title: 'Page introuvable — Annuaire Congo',
      },
    ],
  },

  /* ─── Auth (placeholders rebuilt in Sprint 4) ─────────────────────── */
  {
    path: 'auth',
    loadComponent: () =>
      import('./layout/auth/auth-layout.component').then((m) => m.AuthLayoutComponent),
    canActivateChild: [publicGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'connexion' },
      {
        path: 'connexion',
        loadComponent: () =>
          import('./features/auth/connexion/connexion.component').then((m) => m.ConnexionComponent),
        title: 'Connexion — Annuaire Congo',
      },
      {
        path: 'inscription',
        loadComponent: () =>
          import('./features/auth/inscription/inscription.component').then((m) => m.InscriptionComponent),
        title: 'Inscription — Annuaire Congo',
      },
      {
        path: 'mot-de-passe-oublie',
        loadComponent: () =>
          import('./features/auth/mot-de-passe-oublie/mot-de-passe-oublie.component').then((m) => m.MotDePasseOublieComponent),
        title: 'Mot de passe oublié — Annuaire Congo',
      },
      {
        path: 'reinitialiser-mot-de-passe',
        loadComponent: () =>
          import('./features/auth/reinitialiser-mot-de-passe/reinitialiser-mot-de-passe.component').then((m) => m.ReinitialiserMotDePasseComponent),
        title: 'Réinitialiser le mot de passe — Annuaire Congo',
      },
      {
        path: 'verification-email',
        loadComponent: () =>
          import('./features/auth/verification-email/verification-email.component').then((m) => m.VerificationEmailComponent),
        title: 'Vérification de l\'adresse e-mail — Annuaire Congo',
      },
    ],
  },

  /* Top-level shortcuts for typical URLs */
  { path: 'connexion',                  redirectTo: 'auth/connexion',                pathMatch: 'full' },
  { path: 'inscription',                redirectTo: 'auth/inscription',              pathMatch: 'full' },
  { path: 'mot-de-passe-oublie',        redirectTo: 'auth/mot-de-passe-oublie',      pathMatch: 'full' },
  { path: 'reinitialiser-mot-de-passe', redirectTo: 'auth/reinitialiser-mot-de-passe', pathMatch: 'full' },
  { path: 'verification-email',         redirectTo: 'auth/verification-email',       pathMatch: 'full' },

  /* ─── Espace entreprise (placeholders rebuilt in Sprint 5) ────────── */
  {
    path: 'espace',
    loadComponent: () =>
      import('./layout/espace/espace-layout.component').then((m) => m.EspaceLayoutComponent),
    canActivate: [espaceGuard],
    canActivateChild: [espaceGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/espace/console/console.component').then((m) => m.EspaceConsoleComponent),
        title: 'Mon espace — Annuaire Congo',
      },
      {
        path: 'fiche/creer',
        canActivate: [entrepriseOwnerGuard],
        loadComponent: () =>
          import('./features/espace/fiche/fiche-creer.component').then((m) => m.FicheCreerComponent),
        title: 'Créer ma fiche — Annuaire Congo',
      },
      {
        path: 'fiche/editer',
        canActivate: [entrepriseOwnerGuard],
        loadComponent: () =>
          import('./features/espace/fiche/fiche-editer.component').then((m) => m.FicheEditerComponent),
        title: 'Modifier ma fiche — Annuaire Congo',
      },
      {
        path: 'fiche/editer/:id',
        canActivate: [entrepriseOwnerGuard],
        loadComponent: () =>
          import('./features/espace/fiche/fiche-editer.component').then((m) => m.FicheEditerComponent),
        title: 'Modifier ma fiche — Annuaire Congo',
      },
      {
        path: 'abonnement',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/espace/abonnement/abonnement.component').then((m) => m.EspaceAbonnementComponent),
        title: 'Mon abonnement — Annuaire Congo',
      },
      {
        path: 'abonnement/historique',
        loadComponent: () =>
          import('./features/espace/abonnement/historique.component').then((m) => m.HistoriquePaiementsComponent),
        title: 'Historique de paiement — Annuaire Congo',
      },
      {
        path: 'abonnement/succes',
        loadComponent: () =>
          import('./features/espace/abonnement/paiement-succes.component').then((m) => m.PaiementSuccesComponent),
        title: 'Paiement validé — Annuaire Congo',
      },
      {
        path: 'abonnement/echec',
        loadComponent: () =>
          import('./features/espace/abonnement/paiement-echec.component').then((m) => m.PaiementEchecComponent),
        title: 'Paiement échoué — Annuaire Congo',
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/espace/notifications/notifications.component').then((m) => m.EspaceNotificationsComponent),
        title: 'Notifications — Annuaire Congo',
      },
      {
        path: 'statistiques',
        canActivate: [entrepriseOwnerGuard],
        loadComponent: () =>
          import('./features/espace/statistiques/statistiques.component').then((m) => m.EspaceStatistiquesComponent),
        title: 'Statistiques — Mon espace',
      },
      {
        path: 'compte',
        loadComponent: () =>
          import('./features/espace/compte/compte.component').then((m) => m.EspaceCompteComponent),
        title: 'Mon compte — Annuaire Congo',
      },
    ],
  },

  /* ─── Admin (placeholders rebuilt in Sprint 6) ───────────────────── */
  {
    path: 'admin',
    loadComponent: () =>
      import('./layout/admin/admin-layout.component').then((m) => m.AdminLayoutComponent),
    canActivate: [authGuard, adminGuard],
    canActivateChild: [authGuard, adminGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
        title: 'Tableau de bord — Admin',
      },
      {
        path: 'statistiques',
        loadComponent: () =>
          import('./features/admin/statistiques/admin-statistiques.component').then((m) => m.AdminStatistiquesComponent),
        title: 'Statistiques — Admin',
      },
      {
        path: 'validation',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/admin/validation/admin-validation-list.component').then((m) => m.AdminValidationListComponent),
        title: 'Validation des fiches — Admin',
      },
      {
        path: 'validation/:id',
        loadComponent: () =>
          import('./features/admin/validation/admin-validation-detail.component').then((m) => m.AdminValidationDetailComponent),
        title: 'Examen de fiche — Admin',
      },
      {
        path: 'entreprises',
        loadComponent: () =>
          import('./features/admin/entreprises/admin-entreprises.component').then((m) => m.AdminEntreprisesComponent),
        title: 'Entreprises — Admin',
      },
      {
        // Must come before :id to avoid being shadowed
        path: 'entreprises/creer',
        loadComponent: () =>
          import('./features/admin/entreprises/admin-create-company.component').then((m) => m.AdminCreateCompanyComponent),
        title: 'Créer une fiche — Admin',
      },
      {
        // Must come before entreprises/:id to avoid :id swallowing "editer"
        path: 'entreprises/:id/editer',
        loadComponent: () =>
          import('./features/admin/entreprises/admin-fiche-editer.component').then((m) => m.AdminFicheEditerComponent),
        title: 'Éditer la fiche — Admin',
      },
      {
        path: 'entreprises/:id',
        loadComponent: () =>
          import('./features/admin/entreprises/admin-company-detail.component').then((m) => m.AdminCompanyDetailComponent),
        title: 'Gestion entreprise — Admin',
      },
      {
        path: 'compte',
        loadComponent: () =>
          import('./features/espace/compte/compte.component').then((m) => m.EspaceCompteComponent),
        title: 'Mon profil — Admin',
      },
      {
        path: 'utilisateurs',
        loadComponent: () =>
          import('./features/admin/utilisateurs/admin-utilisateurs.component').then((m) => m.AdminUtilisateursComponent),
        title: 'Gestion des utilisateurs — Admin',
      },
      {
        path: 'dirigeants',
        loadComponent: () =>
          import('./features/admin/dirigeants/admin-dirigeants.component').then((m) => m.AdminDirigeantsComponent),
        title: 'Dirigeants — Admin',
      },
      {
        path: 'secteurs',
        loadComponent: () =>
          import('./features/admin/secteurs/admin-secteurs.component').then((m) => m.AdminSecteursComponent),
        title: 'Secteurs — Admin',
      },
      {
        path: 'geographie',
        loadComponent: () =>
          import('./features/admin/geographie/admin-geographie.component').then((m) => m.AdminGeographieComponent),
        title: 'Géographie — Admin',
      },
      {
        path: 'forfaits',
        loadComponent: () =>
          import('./features/admin/forfaits/admin-forfaits.component').then((m) => m.AdminForfaitsComponent),
        title: 'Forfaits — Admin',
      },
      {
        path: 'signalements',
        loadComponent: () =>
          import('./features/admin/signalements/admin-reports.component').then((m) => m.AdminReportsComponent),
        title: 'Signalements — Admin',
      },
      {
        path: 'audit',
        loadComponent: () =>
          import('./features/admin/audit/admin-audit.component').then((m) => m.AdminAuditComponent),
        title: 'Journal d\'audit — Admin',
      },
      {
        path: 'parametres',
        loadComponent: () =>
          import('./features/admin/parametres/admin-parametres.component').then((m) => m.AdminParametresComponent),
        title: 'Paramètres plateforme — Admin',
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/admin/notifications/admin-notifications.component').then((m) => m.AdminNotificationsComponent),
        title: 'Notifications — Admin',
      },
      {
        path: 'paiements',
        loadComponent: () =>
          import('./features/admin/abonnements/admin-payments.component').then((m) => m.AdminPaymentsComponent),
        title: 'Validation des paiements — Admin',
      },
      {
        path: 'rapport-ia',
        loadComponent: () =>
          import('./features/public/extras/rapport-ia.component').then((m) => m.RapportIaComponent),
        title: 'Rapports IA — Admin',
      },
    ],
  },

  /* ─── Legacy English-path redirects ────────────────────────────────── */
  { path: 'login',           redirectTo: 'auth/connexion',               pathMatch: 'full' },
  { path: 'register',        redirectTo: 'auth/inscription',             pathMatch: 'full' },
  { path: 'companies',       redirectTo: 'annuaire',                     pathMatch: 'full' },
  { path: 'companies/:id',   redirectTo: 'annuaire/:id',                 pathMatch: 'full' },
  { path: 'regions',         redirectTo: 'cartographie',                 pathMatch: 'full' },
  { path: 'subscription',    redirectTo: 'tarifs',                       pathMatch: 'full' },
  { path: 'payment-history', redirectTo: 'espace/abonnement/historique', pathMatch: 'full' },
  { path: 'dashboard',       redirectTo: 'espace',                       pathMatch: 'full' },
  { path: 'profile',         redirectTo: 'espace/compte',                pathMatch: 'full' },
  { path: 'notifications',   redirectTo: 'espace/notifications',         pathMatch: 'full' },

  /* ─── Catch-all → 404 (kept inside PublicLayout for the chrome) ──── */
  { path: '**', redirectTo: '/404' },
];

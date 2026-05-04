/**
 * Annuaire Congo — French label constants
 * Single source of truth for UI strings during Sprint 0–6.
 *
 * Migration plan: when we move to @ngx-translate, the structure of
 * this object becomes the seed JSON. Keep it flat-ish and consistent.
 */

export const FR = {
  /* ── App identity ── */
  app: {
    name: 'Annuaire Congo',
    tagline: 'La référence digitale de l\'économie congolaise',
    badge: 'Plateforme Nationale Officielle des Entreprises',
  },

  /* ── Navigation ── */
  nav: {
    home: 'Accueil',
    annuaire: 'Annuaire',
    registre: 'Registre',
    secteurs: 'Secteurs',
    cartographie: 'Cartographie',
    tarifs: 'Tarifs',
    contact: 'Contact',
    login: 'Connexion',
    register: 'S\'inscrire',
    logout: 'Se déconnecter',
    dashboard: 'Tableau de bord',
    espace: 'Mon espace',
    admin: 'Administration',
    notifications: 'Notifications',
    profile: 'Mon compte',
    payments: 'Mes paiements',
    subscription: 'Mon abonnement',
    skipToContent: 'Aller au contenu principal',
  },

  /* ── Common CTAs / actions ── */
  actions: {
    search: 'Rechercher',
    filter: 'Filtrer',
    sort: 'Trier',
    apply: 'Appliquer',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    create: 'Créer',
    next: 'Continuer',
    previous: 'Précédent',
    submit: 'Envoyer',
    close: 'Fermer',
    viewMore: 'Voir plus',
    viewAll: 'Tout voir',
    backToHome: 'Retour à l\'accueil',
    contactUs: 'Nous contacter',
    learnMore: 'En savoir plus',
    getStarted: 'Commencer',
    reset: 'Réinitialiser',
    downloadPdf: 'Télécharger le PDF',
    download: 'Télécharger',
    upload: 'Téléverser',
    refresh: 'Actualiser',
    yes: 'Oui',
    no: 'Non',
  },

  /* ── Auth ── */
  auth: {
    loginTitle: 'Connexion',
    loginSubtitle: 'Connectez-vous à votre compte',
    registerTitle: 'Créer mon compte',
    registerSubtitle: 'Étape {step} sur {total} — informations personnelles',
    forgotPasswordTitle: 'Mot de passe oublié',
    forgotPasswordSubtitle: 'Entrez votre adresse e-mail, nous vous enverrons un lien de réinitialisation.',
    resetPasswordTitle: 'Réinitialiser mon mot de passe',
    verifyEmailTitle: 'Vérifiez votre e-mail',
    verifyEmailSubtitle: 'Nous vous avons envoyé un lien de confirmation. Cliquez sur ce lien pour activer votre compte.',
    emailLabel: 'Adresse e-mail',
    emailLabelPro: 'Adresse e-mail professionnelle',
    emailPlaceholder: 'contact@entreprise.cg',
    passwordLabel: 'Mot de passe',
    passwordPlaceholder: 'Votre mot de passe',
    passwordHint: 'Minimum 8 caractères',
    confirmPasswordLabel: 'Confirmer le mot de passe',
    firstNameLabel: 'Prénom',
    lastNameLabel: 'Nom',
    phoneLabel: 'Téléphone',
    phoneHint: 'Format Congo-Brazzaville (+242)',
    cguAcceptance: 'J\'accepte les {cgu} et la {privacy}.',
    cguLabel: 'conditions d\'utilisation',
    privacyLabel: 'politique de confidentialité',
    rememberMe: 'Se souvenir de moi',
    forgotPasswordLink: 'Mot de passe oublié ?',
    noAccount: 'Pas encore de compte ?',
    hasAccount: 'Déjà un compte ?',
    loginAction: 'Se connecter',
    registerAction: 'Créer mon compte',
    sendResetLink: 'Envoyer le lien',
    showPassword: 'Afficher le mot de passe',
    hidePassword: 'Masquer le mot de passe',
    stepperAccount: 'Compte',
    stepperCompany: 'Entreprise',
    stepperVerification: 'Vérification',
  },

  /* ── Form errors ── */
  errors: {
    required: 'Ce champ est obligatoire.',
    email: 'Veuillez entrer une adresse e-mail valide.',
    minLength: 'Minimum {min} caractères.',
    maxLength: 'Maximum {max} caractères.',
    pattern: 'Format invalide.',
    phoneCG: 'Format attendu : +242 0X XX XX XX XX.',
    passwordMismatch: 'Les mots de passe ne correspondent pas.',
    cguRequired: 'Vous devez accepter les CGU pour continuer.',
    network: 'Connexion au serveur impossible. Réessayez.',
    invalidCredentials: 'Adresse e-mail ou mot de passe incorrect.',
    unauthorized: 'Vous n\'êtes pas autorisé à effectuer cette action.',
    notFound: 'Élément introuvable.',
    serverError: 'Une erreur est survenue. Réessayez plus tard.',
    validation: 'Veuillez vérifier les informations saisies.',
  },

  /* ── Toasts ── */
  toast: {
    saved: 'Modifications enregistrées.',
    deleted: 'Élément supprimé.',
    sent: 'Message envoyé.',
    loginSuccess: 'Connexion réussie.',
    registerSuccess: 'Compte créé. Vérifiez votre e-mail.',
    logoutSuccess: 'Déconnexion réussie.',
    paymentSuccess: 'Paiement validé. Votre abonnement est actif.',
    paymentError: 'Le paiement n\'a pas pu être traité.',
    copiedToClipboard: 'Copié dans le presse-papiers.',
  },

  /* ── Empty states ── */
  emptyState: {
    noResults: 'Aucun résultat',
    noResultsHint: 'Essayez d\'élargir vos critères de recherche.',
    noCompanies: 'Aucune entreprise pour le moment.',
    noNotifications: 'Aucune notification.',
    noPayments: 'Aucun paiement enregistré.',
    noFiche: 'Vous n\'avez pas encore de fiche entreprise.',
    createFiche: 'Créer ma fiche',
  },

  /* ── 6 SFD sectors (audit C2 — strict list) ── */
  sectors: {
    maritime:    { name: 'Maritime & Portuaire',     icon: 'directions_boat',  slug: 'maritime' },
    logistique:  { name: 'Logistique & Transport',   icon: 'local_shipping',   slug: 'logistique' },
    douane:      { name: 'Douane & Transit',         icon: 'inventory_2',      slug: 'douane' },
    industrie:   { name: 'Industrie',                icon: 'precision_manufacturing', slug: 'industrie' },
    securite:    { name: 'Sécurité',                 icon: 'security',         slug: 'securite' },
    manutention: { name: 'Manutention & Entreposage', icon: 'forklift',        slug: 'manutention' },
  },

  /* ── Plan names ── */
  plans: {
    free:       'Free',
    basic:      'Basic',
    premium:    'Premium',
    enterprise: 'Enterprise',
    pro:        'Pro',
    mostChosen: 'Le plus choisi',
    perMonth: '/mois',
    perYear: '/an',
    annualSavings: 'Économisez 15% en annuel',
  },

  /* ── Payment methods ── */
  payment: {
    methods: {
      mtnMoMo: 'MTN Mobile Money',
      airtel: 'Airtel Money',
      stripe: 'Carte bancaire (Stripe)',
    },
    secured: 'Paiement sécurisé. Activation immédiate.',
    successTitle: 'Paiement validé',
    failureTitle: 'Paiement échoué',
  },

  /* ── Company status ── */
  companyStatus: {
    draft:    'Brouillon',
    pending:  'En attente de validation',
    active:   'Vérifiée',
    rejected: 'Refusée',
    suspended: 'Suspendue',
  },

  /* ── Misc ── */
  misc: {
    verifiedBadge: 'Vérifiée RCCM',
    premiumBadge: 'Premium',
    proBadge: 'Pro',
    freeBadge: 'Gratuit',
    pendingBadge: 'En attente',
    rejectedBadge: 'Refusée',
    loading: 'Chargement…',
    pageOf: 'Page {current} sur {total}',
    resultsCount: '{count} résultat(s)',
  },

  /* ── Footer ── */
  footer: {
    rights: '© {year} Annuaire Congo. Tous droits réservés.',
    legal: 'Mentions légales',
    privacy: 'Politique de confidentialité',
    contact: 'Contact',
    support: 'Support',
    aboutTitle: 'À propos',
    productTitle: 'Plateforme',
    legalTitle: 'Légal',
  },
} as const;

export type FrConstants = typeof FR;

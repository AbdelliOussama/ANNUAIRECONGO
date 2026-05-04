/**
 * Seed data for the public directory until the backend is wired.
 * Companies are aligned with the SFD's 6 strategic sectors and located in
 * realistic Congo-Brazzaville cities (Pointe-Noire, Brazzaville, Dolisie, Oyo,
 * Ouesso). Audit C1, C2.
 */

import { FR } from '@core/i18n/fr.constants';

export interface MockCompany {
  id: string;
  slug: string;
  name: string;
  sectorSlug: string;
  sectorLabel: string;
  sectorIcon: string;
  description: string;
  longDescription: string;
  city: string;
  region: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  rccm: string;
  niu: string;
  yearFounded: number;
  isVerified: boolean;
  isPremium: boolean;
  plan: 'free' | 'pro' | 'premium';
}

const S = FR.sectors;

export const MOCK_COMPANIES: ReadonlyArray<MockCompany> = [
  {
    id: '1', slug: 'congo-shipping-sa',
    name: 'Congo Shipping SA',
    sectorSlug: S.maritime.slug, sectorLabel: S.maritime.name, sectorIcon: S.maritime.icon,
    description: 'Expert en logistique maritime et transport de conteneurs dans le bassin du Congo depuis 1998.',
    longDescription: 'Congo Shipping SA opère sur le port autonome de Pointe-Noire en tant qu\'agent maritime et opérateur de conteneurs. La société assure la consignation de navires, le transbordement, et l\'organisation du transit pour les chargeurs locaux et internationaux.',
    city: 'Pointe-Noire', region: 'Kouilou',
    address: 'Avenue du Général de Gaulle, Port autonome',
    phone: '+242 06 512 0001', email: 'contact@congoshipping.cg', website: 'https://congoshipping.cg',
    rccm: 'CG-PNR-1998-A-1234', niu: 'P998123456789',
    yearFounded: 1998, isVerified: true, isPremium: true, plan: 'premium',
  },
  {
    id: '2', slug: 'transcongo-logistique',
    name: 'TransCongo Logistique',
    sectorSlug: S.logistique.slug, sectorLabel: S.logistique.name, sectorIcon: S.logistique.icon,
    description: 'Réseau de transport terrestre national couvrant l\'ensemble des départements du territoire.',
    longDescription: 'TransCongo Logistique propose des solutions de transport routier longue distance entre Brazzaville, Pointe-Noire, Oyo et Ouesso. La flotte compte plus de 60 ensembles routiers et un parc de remorques frigorifiques.',
    city: 'Brazzaville', region: 'Brazzaville',
    address: 'Boulevard Alfred Raoul, Bacongo',
    phone: '+242 06 545 0010', email: 'contact@transcongo.cg', website: 'https://transcongo.cg',
    rccm: 'CG-BZV-2005-B-0820', niu: 'P005820000123',
    yearFounded: 2005, isVerified: true, isPremium: false, plan: 'pro',
  },
  {
    id: '3', slug: 'douane-express-sarl',
    name: 'Douane Express SARL',
    sectorSlug: S.douane.slug, sectorLabel: S.douane.name, sectorIcon: S.douane.icon,
    description: 'Commissionnaire agréé en douane, facilitation des échanges et transit international.',
    longDescription: 'Douane Express SARL est commissionnaire agréé auprès de la Direction générale des douanes du Congo. La société accompagne les importateurs et exportateurs sur l\'ensemble des opérations de dédouanement, depuis la déclaration en détail jusqu\'à la mainlevée.',
    city: 'Pointe-Noire', region: 'Kouilou',
    address: 'Avenue Charles de Gaulle, Centre-Ville',
    phone: '+242 06 580 4400', email: 'info@douaneexpress.cg', website: 'https://douaneexpress.cg',
    rccm: 'CG-PNR-2010-A-2255', niu: 'P010225500087',
    yearFounded: 2010, isVerified: true, isPremium: false, plan: 'pro',
  },
  {
    id: '4', slug: 'industria-congo',
    name: 'Industria Congo',
    sectorSlug: S.industrie.slug, sectorLabel: S.industrie.name, sectorIcon: S.industrie.icon,
    description: 'Manufacture de pièces métalliques et transformation industrielle pour les filières locales.',
    longDescription: 'Industria Congo dispose d\'une unité de transformation à Dolisie. La société fournit des pièces métalliques et des équipements industriels pour les acteurs maritimes, miniers et de la construction.',
    city: 'Dolisie', region: 'Niari',
    address: 'Zone industrielle, Route nationale 1',
    phone: '+242 05 442 1717', email: 'contact@industriacg.cg', website: 'https://industriacg.cg',
    rccm: 'CG-DLS-2014-A-0455', niu: 'P014045500900',
    yearFounded: 2014, isVerified: false, isPremium: false, plan: 'free',
  },
  {
    id: '5', slug: 'securite-nationale-protection',
    name: 'SNP — Sécurité Nationale Protection',
    sectorSlug: S.securite.slug, sectorLabel: S.securite.name, sectorIcon: S.securite.icon,
    description: 'Gardiennage, protection rapprochée et systèmes de vidéosurveillance certifiés.',
    longDescription: 'SNP est une société agréée par le Ministère de l\'Intérieur pour les activités de gardiennage et de protection des biens et des personnes. Effectifs : 450 agents formés et certifiés, déploiement national.',
    city: 'Brazzaville', region: 'Brazzaville',
    address: 'Avenue de la Paix, Plateau',
    phone: '+242 06 670 8200', email: 'commercial@snp-congo.cg', website: 'https://snp-congo.cg',
    rccm: 'CG-BZV-2008-B-1110', niu: 'P008111000456',
    yearFounded: 2008, isVerified: true, isPremium: false, plan: 'pro',
  },
  {
    id: '6', slug: 'pointe-noire-manutention',
    name: 'Pointe-Noire Manutention',
    sectorSlug: S.manutention.slug, sectorLabel: S.manutention.name, sectorIcon: S.manutention.icon,
    description: 'Opérations de manutention portuaire, gestion d\'entrepôts sous douane et service au navire.',
    longDescription: 'Pointe-Noire Manutention exploite une plateforme logistique de 18 000 m² adjacente au port. Spécialités : manutention de conteneurs, vrac sec, et service au navire 24/7.',
    city: 'Pointe-Noire', region: 'Kouilou',
    address: 'Quai numéro 4, Port autonome',
    phone: '+242 06 690 0540', email: 'ops@pnmanutention.cg', website: 'https://pnmanutention.cg',
    rccm: 'CG-PNR-2012-A-3322', niu: 'P012332200012',
    yearFounded: 2012, isVerified: true, isPremium: true, plan: 'premium',
  },
  {
    id: '7', slug: 'bassin-maritime-services',
    name: 'Bassin Maritime Services',
    sectorSlug: S.maritime.slug, sectorLabel: S.maritime.name, sectorIcon: S.maritime.icon,
    description: 'Avitaillement, remorquage portuaire et services aux navires de commerce.',
    longDescription: 'Bassin Maritime Services propose une gamme complète de services aux navires : avitaillement, remorquage, soutage et assistance technique en escale.',
    city: 'Pointe-Noire', region: 'Kouilou',
    address: 'Môle nord, Port autonome',
    phone: '+242 06 700 7777', email: 'navire@bassin-maritime.cg', website: 'https://bassin-maritime.cg',
    rccm: 'CG-PNR-2007-A-1980', niu: 'P007198000301',
    yearFounded: 2007, isVerified: true, isPremium: false, plan: 'pro',
  },
  {
    id: '8', slug: 'oyo-fret-express',
    name: 'Oyo Fret Express',
    sectorSlug: S.logistique.slug, sectorLabel: S.logistique.name, sectorIcon: S.logistique.icon,
    description: 'Spécialiste du fret terrestre dans la cuvette nord et le département de la Likouala.',
    longDescription: 'Basée à Oyo, Oyo Fret Express dessert quotidiennement la cuvette nord. Flotte mixte routier / fluvial pour la desserte de Mossaka et Impfondo.',
    city: 'Oyo', region: 'Cuvette',
    address: 'Avenue des Bougainvilliers',
    phone: '+242 05 332 1100', email: 'contact@oyo-fret.cg', website: 'https://oyo-fret.cg',
    rccm: 'CG-OYO-2018-A-0144', niu: 'P018014400123',
    yearFounded: 2018, isVerified: false, isPremium: false, plan: 'free',
  },
  {
    id: '9', slug: 'ouesso-douane-services',
    name: 'Ouesso Douane Services',
    sectorSlug: S.douane.slug, sectorLabel: S.douane.name, sectorIcon: S.douane.icon,
    description: 'Transit transfrontalier vers le Cameroun et la République centrafricaine.',
    longDescription: 'Ouesso Douane Services accompagne les flux import / export à la frontière nord. Bureau secondaire à Brazzaville, équipe bilingue français-anglais.',
    city: 'Ouesso', region: 'Sangha',
    address: 'Poste-frontière de Ouesso',
    phone: '+242 06 880 4422', email: 'transit@ouesso-douane.cg', website: 'https://ouesso-douane.cg',
    rccm: 'CG-OUE-2019-B-0066', niu: 'P019006600188',
    yearFounded: 2019, isVerified: true, isPremium: false, plan: 'pro',
  },
  {
    id: '10', slug: 'manufacture-niari',
    name: 'Manufacture du Niari',
    sectorSlug: S.industrie.slug, sectorLabel: S.industrie.name, sectorIcon: S.industrie.icon,
    description: 'Production agro-industrielle et conditionnement à Dolisie.',
    longDescription: 'Manufacture du Niari produit des conserves alimentaires à partir de filières agricoles locales. Distribution sur l\'ensemble du territoire et exportation régionale.',
    city: 'Dolisie', region: 'Niari',
    address: 'Zone industrielle, Lot 12',
    phone: '+242 05 410 0050', email: 'production@manufacture-niari.cg', website: 'https://manufacture-niari.cg',
    rccm: 'CG-DLS-2011-A-0190', niu: 'P011019000222',
    yearFounded: 2011, isVerified: true, isPremium: false, plan: 'pro',
  },
  {
    id: '11', slug: 'guard-pointe-noire',
    name: 'Guard Pointe-Noire',
    sectorSlug: S.securite.slug, sectorLabel: S.securite.name, sectorIcon: S.securite.icon,
    description: 'Gardiennage industriel pour sites portuaires et plateformes pétrolières.',
    longDescription: 'Guard Pointe-Noire opère sur les sites les plus exigeants du sud du pays : terminaux portuaires, plateformes offshore, dépôts pétroliers. Centre de formation interne.',
    city: 'Pointe-Noire', region: 'Kouilou',
    address: 'Avenue de l\'Industrie, Loandjili',
    phone: '+242 06 555 9090', email: 'commercial@guard-pn.cg', website: 'https://guard-pn.cg',
    rccm: 'CG-PNR-2013-B-0421', niu: 'P013042100045',
    yearFounded: 2013, isVerified: true, isPremium: false, plan: 'pro',
  },
  {
    id: '12', slug: 'entrepots-brazzaville',
    name: 'Entrepôts de Brazzaville',
    sectorSlug: S.manutention.slug, sectorLabel: S.manutention.name, sectorIcon: S.manutention.icon,
    description: 'Stockage classé, location d\'entrepôts et services de cross-docking.',
    longDescription: 'Entrepôts de Brazzaville exploite un parc de 30 000 m² couverts, dont des cellules sous température dirigée. Service complémentaire de cross-docking et gestion de stock externalisée.',
    city: 'Brazzaville', region: 'Brazzaville',
    address: 'Avenue de l\'Aéroport, Maya-Maya',
    phone: '+242 06 412 8000', email: 'reservation@ebr-entrepots.cg', website: 'https://ebr-entrepots.cg',
    rccm: 'CG-BZV-2009-A-0712', niu: 'P009071200334',
    yearFounded: 2009, isVerified: true, isPremium: false, plan: 'pro',
  },
];

export const MOCK_REGIONS = ['Brazzaville', 'Kouilou', 'Niari', 'Cuvette', 'Sangha', 'Pool', 'Plateaux', 'Likouala'];
export const MOCK_CITIES_BY_REGION: Readonly<Record<string, string[]>> = {
  Brazzaville: ['Brazzaville'],
  Kouilou: ['Pointe-Noire', 'Loango', 'Hinda'],
  Niari: ['Dolisie', 'Mossendjo'],
  Cuvette: ['Oyo', 'Owando', 'Mossaka'],
  Sangha: ['Ouesso', 'Sembé'],
  Pool: ['Kinkala'],
  Plateaux: ['Djambala'],
  Likouala: ['Impfondo'],
};

# WorkZen

> Plateforme SaaS Multi-Tenant pour la Gestion des Secrétariats Sociaux Belges

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Status](https://img.shields.io/badge/status-Phase%201-orange.svg)
![TFE](https://img.shields.io/badge/Travail%20de%20Fin%20d%27%C3%89tudes-2025--2027-blue.svg)

## 📋 Table des Matières

- [À Propos](#à-propos)
- [Contexte du Projet](#contexte-du-projet)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Structure de la Documentation](#structure-de-la-documentation)
- [Diagrammes UML](#diagrammes-uml)
- [Acteurs & Cas d'Utilisation](#acteurs--cas-dutilisation)
- [Modèle de Données](#modèle-de-données)
- [Roadmap](#roadmap)
- [Documentation](#documentation)
- [Contribution](#contribution)
- [Licence](#licence)

## 🎯 À Propos

**WorkZen** est une plateforme SaaS multi-tenant conçue pour moderniser la gestion des secrétariats sociaux en Belgique. Elle permet de centraliser la gestion des clients, employés, et la génération automatisée des fiches de paie, tout en offrant une architecture scalable et sécurisée.

### 📚 Travail de Fin d'Études (TFE)

Ce projet est un **Travail de Fin d'Études** développé sur **24 mois** (Juillet 2025 - Juin 2027) pour l'école EPHEC Bruxelles.

**Objectif :** Concevoir et documenter une plateforme SaaS multi-tenant complète, démontrant la maîtrise des principes architecturaux modernes et des bonnes pratiques de conception logicielle.

**Phase 1 (TFE)** : Administration multi-tenant avec gestion des secrétariats et utilisateurs
**Phase 2-3** : Portails métier (Consultant, Client, Employé)

## 📖 Contexte du Projet

Les secrétariats sociaux belges font face à des défis majeurs :
- Gestion manuelle chronophage des fiches de paie
- Systèmes hérités peu performants
- Absence de centralisation des données
- Difficultés de collaboration entre consultants

**WorkZen** répond à ces problématiques en proposant une solution moderne, automatisée et collaborative.

## ✨ Fonctionnalités

### Phase 1 - Administration Multi-Tenant (TFE)

#### 🔐 Rôle SuperAdmin

- **Gestion Globale**
  - Dashboard avec analytics en temps réel
  - Vue d'ensemble de tous les secrétariats
  - Monitoring des métriques (MRR, utilisateurs actifs, croissance)

- **Gestion des Secrétariats**
  - CRUD complet (Créer, Lire, Modifier, Supprimer)
  - Assignation de plans d'abonnement
  - Suivi de l'utilisation par secrétariat

- **Gestion des Utilisateurs**
  - Création d'Admin Secrétariat
  - Modification et désactivation de comptes
  - Vue globale de tous les utilisateurs

- **Facturation & Plans**
  - Configuration des plans (Starter, Pro, Enterprise)
  - Intégration complète avec Stripe
  - Gestion des webhooks de paiement

- **Sécurité & Logs**
  - Authentification 2FA obligatoire (Google Authenticator)
  - Système de logs complet (AuditLog)
  - Traçabilité de toutes les actions

#### 👤 Rôle Admin Secrétariat

- **Dashboard Personnalisé**
  - Vue isolée du secrétariat
  - Métriques d'utilisation (clients, utilisateurs, stockage)
  - Alertes de limite d'utilisation

- **Gestion du Profil**
  - Consultation et modification du profil
  - Changement de mot de passe sécurisé

- **Paramètres Secrétariat**
  - Consultation des informations du secrétariat
  - Vue en lecture seule (modification par SuperAdmin)

- **Gestion de l'Abonnement**
  - Accès au Stripe Customer Portal
  - Upgrade/downgrade de plan
  - Consultation de l'historique de facturation
  - Téléchargement des factures

### 🔜 Phases Futures

#### Phase 2 - Gestion Métier (Post-TFE)
- Rôle Consultant
- Gestion des clients (entreprises)
- Gestion des employés
- Génération automatisée de fiches de paie
- Calendrier ONSS

#### Phase 3 - Portails Utilisateurs
- Portail Client
- Portail Employé
- Consultation des documents
- Gestion des demandes (congés, absences)

## 🏗️ Architecture

### Multi-Tenant avec Isolation des Données

WorkZen utilise une architecture **multi-tenant Row-Level Security (RLS)** pour garantir l'isolation complète des données entre secrétariats.

#### Principe d'Isolation

```
┌─────────────────────────────────────────────────────┐
│                 WorkZen Platform                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  SuperAdmin          →  Vue GLOBALE                  │
│  (SUPER_ADMIN)           Tous les secrétariats      │
│                                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Admin Secrétariat   →  Vue ISOLÉE                   │
│  (SECRETARIAT_ADMIN)     secretariatId = "abc123"   │
│                                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│           PostgreSQL (Données partagées)             │
│        Filtrage automatique par secretariatId        │
│                                                      │
└─────────────────────────────────────────────────────┘
```

#### Avantages de cette Architecture

✅ **Scalabilité optimale** - Un seul schéma de base de données
✅ **Coûts réduits** - Infrastructure partagée
✅ **Maintenance simplifiée** - Déploiement unique
✅ **Isolation sécurisée** - Filtrage systématique par `secretariatId`


## 🛠️ Technologies

### Frontend

| Technologie | Version | Description |
|------------|---------|-------------|
| **Next.js** | 15.x | Framework React avec App Router |
| **React** | 19.x | Bibliothèque UI |
| **TypeScript** | 5.x | Typage statique |
| **Tailwind CSS** | 3.x | Framework CSS utility-first |
| **ShadcnUI** | Latest | Composants UI accessibles |

### Backend

| Technologie | Version | Description |
|------------|---------|-------------|
| **Next.js API Routes** | 15.x | Backend serverless |
| **Prisma ORM** | 5.x | ORM TypeScript-first |
| **PostgreSQL** | 15.x | Base de données relationnelle |
| **Better Auth** | Latest | Authentification sécurisée + 2FA |

### Services Externes

| Service | Usage |
|---------|-------|
| **Stripe** | Paiements et abonnements |
| **Supabase** | Hébergement PostgreSQL |
| **Vercel** | Déploiement et hosting |
| **Resend** | Envoi d'emails transactionnels |

### DevOps & Tooling

- **Turborepo** - Monorepo management
- **ESLint** - Linting JavaScript/TypeScript
- **Prettier** - Formatage de code
- **Husky** - Git hooks
- **Playwright** - Tests E2E
- **Vitest** - Tests unitaires

## 📖 Comment Lire ce Projet

Ce repository contient la **documentation complète** du projet WorkZen pour le TFE. Il est organisé en plusieurs catégories :

### Pour Démarrer
1. Lire [**README.md**](documentation/README.md) - Vue d'ensemble du projet
2. Consulter [**BUSINESS_RULES.md**](documentation/BUSINESS_RULES.md) - Règles métier
3. Examiner [**ARCHITECTURE.md**](documentation/ARCHITECTURE.md) - Architecture technique

### Pour Comprendre les Flux
- Voir les **diagrammes de séquence** dans [`documentation/UML/Sequence/`](documentation/UML/Sequence/)
- Consulter les **cas d'utilisation** dans [`documentation/UML/useCase/`](documentation/UML/useCase/)

### Pour Approfondir
- [API.md](documentation/API.md) - Spécification des APIs
- [DATABASE_SCHEMA.md](documentation/DATABASE_SCHEMA.md) - Modèle de données
- [SECURITY.md](documentation/SECURITY.md) - Stratégie de sécurité

## 📁 Structure de la Documentation

```
TFE/
├── documentation/
│   ├── 📄 Fichiers Principaux
│   │   ├── README.md                      # Vue d'ensemble complète
│   │   ├── ARCHITECTURE.md                # Architecture technique
│   │   ├── API.md                         # Documentation des APIs
│   │   ├── BUSINESS_RULES.md              # Règles métier
│   │   ├── DATABASE_SCHEMA.md             # Modèle de données Prisma
│   │   └── SECURITY.md                    # Stratégie de sécurité
│   │
│   └── 🎨 Diagrammes UML
│       ├── Classes/
│       │   ├── WorkZen-Classes-Global.puml          # Vue globale
│       │   ├── SuperAdmin-Classes.puml              # Entités SuperAdmin
│       │   ├── AdminSecretariat-Classes.puml        # Entités Admin
│       │   ├── Consultant-Classes.puml              # Phase 2
│       │   ├── Client-Classes.puml                  # Phase 3
│       │   └── Employe-Classes.puml                 # Phase 3
│       │
│       ├── Sequence/  (Diagrammes de séquence par rôle)
│       │   ├── SuperAdmin/
│       │   │   ├── UC-01-00-Se-Connecter.puml
│       │   │   ├── UC-01-10-Gerer-Secretariats.puml
│       │   │   ├── UC-01-20-Gerer-Utilisateurs.puml
│       │   │   ├── UC-01-30-Consulter-Dashboard-Global.puml
│       │   │   ├── UC-01-40-Configurer-Systeme.puml
│       │   │   ├── UC-01-50-Consulter-Audit-Logs.puml
│       │   │   ├── UC-01-60-Veille-Legislatives.puml
│       │   │   ├── UC-01-70-Gerer-API-Publique.puml
│       │   │   └── UC-01-80-Configurer-White-Label.puml
│       │   │
│       │   ├── AdminSecretariat/
│       │   │   ├── UC-02-00-S-Inscrire.puml
│       │   │   ├── UC-02-01-Se-Connecter.puml
│       │   │   ├── UC-02-10-Gerer-Personnel.puml
│       │   │   ├── UC-02-20-Gerer-Abonnement.puml
│       │   │   ├── UC-02-30-Gerer-Templates-Documents.puml
│       │   │   ├── UC-02-40-Consulter-Dashboard.puml
│       │   │   ├── UC-02-50-Consulter-Audit-Logs-Secretariat.puml
│       │   │   └── UC-02-60-Exporter-Donnees-RGPD.puml
│       │   │
│       │   ├── Consultant/  (Phase 2)
│       │   │   ├── UC-03-00-Se-Connecter.puml
│       │   │   ├── UC-03-10-Gerer-Clients.puml
│       │   │   ├── UC-03-20-Gerer-Employes-Clients.puml
│       │   │   ├── UC-03-30-Gerer-Fiches-Paie.puml
│       │   │   ├── UC-03-40-Gerer-Conformite-ONSS.puml
│       │   │   ├── UC-03-50-Gerer-Calendrier-Alertes.puml
│       │   │   ├── UC-03-60-Consulter-Dashboard.puml
│       │   │   ├── UC-03-70-Synchroniser-Exact-Online.puml
│       │   │   ├── UC-03-75-Messagerie-Client.puml
│       │   │   ├── UC-03-80-Gerer-Modeles-Documents.puml
│       │   │   └── UC-03-85-Export-Import-Donnees.puml
│       │   │
│       │   ├── Client/  (Phase 3)
│       │   │   ├── UC-04-00-Se-Connecter.puml
│       │   │   ├── UC-04-10-Consulter-Fiches-Paie.puml
│       │   │   ├── UC-04-20-Consulter-Employes.puml
│       │   │   ├── UC-04-30-Consulter-Documents.puml
│       │   │   ├── UC-04-40-Support-Messagerie.puml
│       │   │   ├── UC-04-50-Consulter-Dashboard.puml
│       │   │   ├── UC-04-60-Gerer-Profil-Personnel.puml
│       │   │   ├── UC-04-70-Voir-Analytics-RH.puml
│       │   │   └── UC-04-80-Telecharger-Certificats-C4.puml
│       │   │
│       │   └── Employe/  (Phase 3)
│       │       ├── UC-05-00-Se-Connecter.puml
│       │       ├── UC-05-10-Consulter-Fiche-Paie.puml
│       │       ├── UC-05-20-Consulter-Documents.puml
│       │       ├── UC-05-30-Consulter-Infos-Personnelles.puml
│       │       ├── UC-05-40-Support-FAQ.puml
│       │       ├── UC-05-50-Gerer-Profil-Personnel.puml
│       │       ├── UC-05-60-Demander-Conges.puml
│       │       └── UC-05-70-Configurer-Notifications.puml
│       │
│       └── useCase/
│           └── AdminSecretariat/
│               ├── admin-secretariat-use-cases.puml
│               └── cas utilisation AdminSecretariat.md
│
└── README.md                                     # Ce fichier
```

### 📊 Fichiers de Diagrammes Supplémentaires

- **schéma hiérarchique du saas mutli-tenant.drawio** - Diagramme DrawIO de l'architecture multi-tenant

## 🎨 Diagrammes UML

### Diagrammes de Classes

WorkZen utilise des diagrammes de classes UML pour modéliser les entités :

- **WorkZen-Classes-Global.puml** - Vue globale de toutes les entités
- **SuperAdmin-Classes.puml** - Entités et responsabilités SuperAdmin (Phase 1)
- **AdminSecretariat-Classes.puml** - Entités et responsabilités Admin Secrétariat (Phase 1)
- **Consultant-Classes.puml** - Entités et responsabilités Consultant (Phase 2)
- **Client-Classes.puml** - Entités et responsabilités Client (Phase 3)
- **Employe-Classes.puml** - Entités et responsabilités Employé (Phase 3)

📍 Chemin : [`documentation/UML/Classes/`](documentation/UML/Classes/)

### Diagrammes de Séquence

Chaque cas d'utilisation est documenté avec un diagramme de séquence détaillé montrant les interactions entre acteurs et systèmes.

**SuperAdmin** (9 diagrammes UC-01-00 à UC-01-80)
**Admin Secrétariat** (8 diagrammes UC-02-00 à UC-02-60)
**Consultant** (11 diagrammes UC-03-00 à UC-03-85)
**Client** (9 diagrammes UC-04-00 à UC-04-80)
**Employé** (8 diagrammes UC-05-00 à UC-05-70)

📍 Chemin : [`documentation/UML/Sequence/`](documentation/UML/Sequence/)

## 👥 Acteurs & Cas d'Utilisation

### Phase 1 (TFE) - 2 Rôles Fonctionnels

#### 🔐 SuperAdmin
**Responsabilités :**
- Gestion globale des secrétariats (création, modification, suppression, consultation)
- Gestion des utilisateurs (modification, désactivation, attribution de rôles)
- Analytics et monitoring globaux
- Configuration des plans d'abonnement
- Consultation des logs système
- Gestion de l'authentification 2FA obligatoire (Google Authenticator)

**Cas d'Utilisation :** 9 (UC-01-00 à UC-01-80)
- [UC-01-00] Se connecter
- [UC-01-10] Gérer les secrétariats
- [UC-01-20] Gérer les utilisateurs
- [UC-01-30] Consulter le dashboard global
- [UC-01-40] Configurer le système
- [UC-01-50] Consulter les logs
- [UC-01-60] Veille législative
- [UC-01-70] Gérer l'API publique
- [UC-01-80] Configurer le white-label

#### 👤 Admin Secrétariat
**Responsabilités :**
- Gestion de son profil personnel
- Inscription avec choix du plan
- Gestion des utilisateurs de son secrétariat
- Consultation du dashboard (métriques isolées)
- Gestion de l'abonnement via Stripe
- Consultation de l'historique de facturation

**Cas d'Utilisation :** 8 (UC-02-00 à UC-02-60)
- [UC-02-00] S'inscrire
- [UC-02-01] Se connecter
- [UC-02-10] Gérer le personnel
- [UC-02-20] Gérer l'abonnement
- [UC-02-30] Gérer les templates documents
- [UC-02-40] Consulter le dashboard
- [UC-02-50] Consulter les logs audit
- [UC-02-60] Exporter les données RGPD

### Phase 2 (Post-TFE) - Rôle Consultant
**Cas d'Utilisation :** 11 (UC-03-00 à UC-03-85)

### Phase 3 (Post-TFE) - Rôles Client & Employé
**Cas d'Utilisation :** 17 (UC-04 & UC-05)

## 🗄️ Modèle de Données

Le modèle de données complet est documenté dans [`DATABASE_SCHEMA.md`](documentation/DATABASE_SCHEMA.md).

**Entités principales (Phase 1) :**
- **User** - Utilisateurs du système (SuperAdmin, AdminSecrétariat)
- **Secretariat** - Secrétariat social (tenant)
- **Subscription** - Abonnement Stripe
- **AuditLog** - Logs de traçabilité

**Isolation multi-tenant :**
- Chaque utilisateur est lié à un `secretariatId`
- SuperAdmin : accès global (pas de filtrage)
- AdminSecrétariat : accès isolé à son secrétariat uniquement
- Filtrage systématique au niveau base de données et API

## 🗺️ Roadmap

### ✅ Phase 1 - Administration Multi-Tenant (Juillet 2025 - Juin 2027)

- [ ] Setup Monorepo Turborepo
- [ ] Configuration Next.js 15 + TypeScript
- [ ] Setup Prisma + PostgreSQL
- [ ] Authentification Better Auth + 2FA
- [ ] Interface SuperAdmin complète
- [ ] Interface Admin Secrétariat
- [ ] Intégration Stripe (plans + webhooks)
- [ ] Système de logs complet
- [ ] Tests (>70% coverage)
- [ ] Déploiement production

### 🔜 Phase 2 - Gestion Métier (Post-TFE)

- [ ] Rôle Consultant
- [ ] Gestion des clients (entreprises)
- [ ] Gestion des employés
- [ ] Génération automatisée de fiches de paie
- [ ] Calendrier ONSS
- [ ] Export de documents (PDF, Excel)

### 🔮 Phase 3 - Portails Utilisateurs

- [ ] Portail Client
- [ ] Portail Employé
- [ ] Consultation des fiches de paie
- [ ] Gestion des demandes (congés, absences)
- [ ] Notifications en temps réel


## 📚 Documentation Complète

Tous les documents de spécification sont dans le dossier [`documentation/`](documentation/) :

### Fichiers de Référence
- **[README.md](documentation/README.md)** - Vue complète du projet et tous les acteurs
- **[ARCHITECTURE.md](documentation/ARCHITECTURE.md)** - Architecture technique détaillée
- **[API.md](documentation/API.md)** - Spécification des endpoints API
- **[BUSINESS_RULES.md](documentation/BUSINESS_RULES.md)** - Règles métier
- **[DATABASE_SCHEMA.md](documentation/DATABASE_SCHEMA.md)** - Schéma Prisma et entités
- **[SECURITY.md](documentation/SECURITY.md)** - Stratégie de sécurité et authentification

### Diagrammes
- **Classes UML** - [`documentation/UML/Classes/`](documentation/UML/Classes/)
- **Diagrammes de Séquence** - [`documentation/UML/Sequence/`](documentation/UML/Sequence/)
- **Cas d'Utilisation** - [`documentation/UML/useCase/`](documentation/UML/useCase/)
- **Architecture Multi-Tenant** - `schéma hiérarchique du saas mutli-tenant.drawio`

## 🤝 Contribution

Ce projet est un Travail de Fin d'Études personnel. Les contributions externes ne sont pas acceptées pour le moment.

Cependant, vous pouvez :
- 🐛 Signaler des erreurs ou imprécisions via les [Issues](https://github.com/Adri-2310/TFE/issues)
- 💡 Proposer des améliorations pour la documentation
- ⭐ Donner une étoile si le projet vous inspire

## 📄 Licence

Ce projet est sous licence **MIT**.

---

## 📞 Contact

**Auteur :** Adrien Mertens
**École :** ifosup wavre
**Période :** Juillet 2024 - Juin 2027

---

## 📊 Statistiques du Projet Phase 1

- **Cas d'utilisation :** 25 (9 SuperAdmin + 8 AdminSecrétariat + 8 Consultant)
- **Diagrammes UML :** 15+ (Classes + Séquence)
- **Entités base de données :** 6 principales + 4 optionnelles
- **Méthodes d'authentification :** 3 (Email/Password, Magic Link, OAuth)
- **Plans d'abonnement :** 3 (Starter, Pro, Enterprise)

---

**Développé avec ❤️ pour mon TFE**

*WorkZen - Moderniser la gestion des secrétariats sociaux belges*

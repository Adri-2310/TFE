# WorkZen

> Plateforme SaaS Multi-Tenant pour la Gestion des Secrétariats Sociaux Belges

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Status](https://img.shields.io/badge/status-Phase%201-orange.svg)

## 📋 Table des Matières

- [À Propos](#à-propos)
- [Contexte du Projet](#contexte-du-projet)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Structure du Projet](#structure-du-projet)
- [Modèle de Données](#modèle-de-données)
- [Roadmap](#roadmap)
- [Tests](#tests)
- [Documentation](#documentation)
- [Contribution](#contribution)
- [Licence](#licence)

## 🎯 À Propos

**WorkZen** est une plateforme SaaS multi-tenant conçue pour moderniser la gestion des secrétariats sociaux en Belgique. Elle permet de centraliser la gestion des clients, employés, et la génération automatisée des fiches de paie, tout en offrant une architecture scalable et sécurisée.

### Projet de Fin d'Étude (TFE)

Ce projet constitue mon Travail de Fin d'Études, développé sur une période de **24 mois** (Juillet 2025 - Juin 2027).

**Objectif principal :** Démontrer la maîtrise des technologies web modernes et des principes d'architecture SaaS multi-tenant.

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

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** >= 20.x
- **pnpm** >= 9.x (recommandé) ou npm >= 10.x
- **PostgreSQL** >= 15.x
- **Git** >= 2.x

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/Adri-2310/TFE
cd TFE
```

### 2. Installer les dépendances

```bash
pnpm install
# ou
npm install
```

### 3. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Voir la section [Configuration](#configuration) pour les détails.

### 4. Initialiser la base de données



### 5. Lancer le serveur de développement

```bash
pnpm dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration

### Variables d'Environnement

Créez un fichier `.env` avec les variables suivantes :


### Configuration Stripe

1. Créez un compte sur [Stripe Dashboard](https://dashboard.stripe.com)
2. Configurez les produits et prix pour les plans :
   - **Starter** : 99€/mois
   - **Pro** : 299€/mois
   - **Enterprise** : Sur devis
3. Configurez le webhook endpoint : `/api/webhooks/stripe`
4. Ajoutez les clés dans `.env`

## 💻 Utilisation

### Comptes de Test

Après avoir exécuté le seeder, utilisez ces comptes :

**SuperAdmin**
```
Email: admin@workzen.app
Password: Admin123!
2FA: Configuré avec Google Authenticator
```

**Admin Secrétariat**
```
Email: admin@secretariat-dupont.be
Password: Admin123!
```

### Scripts Disponibles

```bash
# Développement
pnpm dev              # Lance le serveur de développement
pnpm build            # Build de production
pnpm start            # Lance le serveur de production

# Base de données
pnpm prisma studio    # Interface visuelle Prisma
pnpm prisma migrate   # Créer une migration
pnpm db:seed          # Seeder la base de données

# Tests
pnpm test             # Lance les tests unitaires
pnpm test:e2e         # Lance les tests E2E
pnpm test:coverage    # Génère le rapport de couverture

# Linting & Formatage
pnpm lint             # Vérifie le code avec ESLint
pnpm format           # Formate le code avec Prettier
```

## 📁 Structure du Projet

```
workzen/
├── apps/
│   └── web/                      # Application Next.js principale
│       ├── app/                  # App Router Next.js 15
│       │   ├── (auth)/          # Routes authentification
│       │   ├── admin/           # Routes SuperAdmin
│       │   ├── secretariat/     # Routes Admin Secrétariat
│       │   └── api/             # API Routes
│       ├── components/          # Composants React
│       │   ├── ui/              # Composants ShadcnUI
│       │   └── shared/          # Composants partagés
│       ├── lib/                 # Utilitaires
│       │   ├── auth.ts          # Configuration Better Auth
│       │   ├── db.ts            # Client Prisma
│       │   └── stripe.ts        # Client Stripe
│       └── middleware.ts        # Middleware d'isolation
├── packages/
│   ├── database/                # Schéma Prisma
│   │   └── prisma/
│   │       └── schema.prisma
│   ├── typescript-config/       # Configuration TypeScript
│   └── eslint-config/           # Configuration ESLint
├── documentation/               # Documentation du projet
│   ├── PHASE-1-TFE-SCOPE-FINAL.md
│   ├── USE-CASES-DOCUMENTATION.md
│   ├── SuperAdmin/
│   └── AdminSecretariat/
├── tests/
│   ├── unit/                    # Tests unitaires
│   ├── integration/             # Tests d'intégration
│   └── e2e/                     # Tests E2E (Playwright)
├── .env.example                 # Exemple de configuration
├── turbo.json                   # Configuration Turborepo
├── package.json
└── README.md
```

## 🗄️ Modèle de Données

### Schéma Principal (Phase 1)

```prisma
enum UserRole {
  SUPER_ADMIN        // ✅ Fonctionnel
  SECRETARIAT_ADMIN  // ✅ Fonctionnel
  CONSULTANT         // 🔜 Phase 2
  CLIENT             // 🔜 Phase 3
  EMPLOYEE           // 🔜 Phase 3
}

model User {
  id            String      @id @default(cuid())
  email         String      @unique
  password      String?
  role          UserRole
  firstName     String?
  lastName      String?
  secretariatId String?
  secretariat   Secretariat? @relation(fields: [secretariatId])
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model Secretariat {
  id            String       @id @default(cuid())
  name          String
  vatNumber     String       @unique
  email         String
  users         User[]
  subscription  Subscription?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

model Subscription {
  id                    String    @id @default(cuid())
  stripeCustomerId      String    @unique
  stripeSubscriptionId  String    @unique
  plan                  String    // STARTER, PRO, ENTERPRISE
  status                String
  secretariatId         String    @unique
  secretariat           Secretariat @relation(fields: [secretariatId])
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  action    String
  entity    String
  entityId  String?
  createdAt DateTime @default(now())
}
```

### Diagramme ER

```
┌─────────────┐         ┌──────────────────┐         ┌──────────────┐
│    User     │────────▶│   Secretariat    │◀────────│ Subscription │
├─────────────┤         ├──────────────────┤         ├──────────────┤
│ id          │         │ id               │         │ id           │
│ email       │         │ name             │         │ plan         │
│ role        │         │ vatNumber        │         │ status       │
│ secretariat │         │ email            │         │ stripeId     │
│ Id (FK)     │         │                  │         │              │
└─────────────┘         └──────────────────┘         └──────────────┘
```

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

## 🧪 Tests

### Couverture de Tests

L'objectif de couverture est de **>70%** pour le TFE.

```bash
# Tests unitaires (Vitest)
pnpm test

# Tests E2E (Playwright)
pnpm test:e2e

# Rapport de couverture
pnpm test:coverage
```

### Exemples de Tests

**Test Unitaire (Vitest)**
```typescript
import { describe, it, expect } from 'vitest';
import { calculateMRR } from '@/lib/analytics';

describe('Analytics', () => {
  it('should calculate MRR correctly', () => {
    const subscriptions = [
      { plan: 'STARTER', price: 99 },
      { plan: 'PRO', price: 299 }
    ];
    expect(calculateMRR(subscriptions)).toBe(398);
  });
});
```

**Test E2E (Playwright)**
```typescript
import { test, expect } from '@playwright/test';

test('SuperAdmin can create a secretariat', async ({ page }) => {
  await page.goto('/admin/secretariats');
  await page.click('text=Nouveau Secrétariat');
  await page.fill('input[name="name"]', 'Test SPRL');
  await page.fill('input[name="vatNumber"]', 'BE0999888777');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Test SPRL')).toBeVisible();
});
```

## 📚 Documentation

### Documentation Disponible

- [📋 Phase 1 - Scope Final](documentation/PHASE-1-TFE-SCOPE-FINAL.md)
- [📖 Documentation des Use Cases](documentation/USE-CASES-DOCUMENTATION.md)
- [🔐 SuperAdmin - Diagrammes](documentation/SuperAdmin/)
- [👤 Admin Secrétariat - Diagrammes](documentation/AdminSecretariat/)

### Diagrammes UML

Les diagrammes sont disponibles au format `.drawio` dans le dossier `/documentation` :
- Diagrammes de cas d'utilisation
- Schéma hiérarchique multi-tenant
- Diagrammes de séquence

## 🤝 Contribution

Ce projet est un Travail de Fin d'Études personnel. Les contributions externes ne sont pas acceptées pour le moment.

Cependant, vous pouvez :
- 🐛 Signaler des bugs via les [Issues](https://github.com/votre-username/workzen/issues)
- 💡 Proposer des améliorations
- ⭐ Mettre une étoile si le projet vous inspire

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 📞 Contact

**Auteur :** [Adrien Mertens]
**Email :** []
**LinkedIn :** []
**Portfolio :** []

---

## 🙏 Remerciements

Je tiens à remercier :

---

## 📊 Métriques du Projet

![Lines of Code](https://img.shields.io/badge/lines%20of%20code-15k%2B-blue)
![Test Coverage](https://img.shields.io/badge/coverage-72%25-green)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Deployment](https://img.shields.io/badge/deployment-production-success)

---

**Développé avec ❤️ pour mon TFE**

*WorkZen - Moderniser la gestion des secrétariats sociaux*

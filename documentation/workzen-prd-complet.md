# 🧬 WorkZen Secrétariat Social - PRD Complet

**Plateforme SaaS de gestion RH automatisée pour secrétariats sociaux belges**

Stack: Next.js 16 • React 19 • Tailwind 4 • ShadcnUI • Prisma • Stripe • Monorepo Turborepo

---

## 📋 Table des Matières

1. [Vision & Positionnement](#vision)
2. [Stack Technique Monorepo](#stack)
3. [Roadmap Produit](#roadmap)
4. [MVP - Plan de Développement](#mvp)
5. [Roadmap Go-To-Market](#gtm)
6. [Architecture Technique](#architecture)
7. [Modèle de Revenus](#revenus)

---

## 🎯 Vision & Positionnement {#vision}

### Le Problème

Les secrétariats sociaux belges perdent **60% de leur temps** en tâches manuelles répétitives:
- Jonglage entre 5-10 outils différents
- Saisies manuelles sources d'erreurs
- Veille législative complexe (ONSS, DIMONA)
- Portails clients obsolètes
- Impossibilité de scaler sans embaucher

### La Solution

Plateforme SaaS tout-en-un qui automatise l'intégralité du workflow:
✅ Fiches de paie automatisées  
✅ Déclarations ONSS/DIMONA  
✅ Portail client moderne  
✅ Calendrier deadlines intelligent  
✅ Intégrations comptables  

### Proposition de Valeur

| Métrique | Avant | Après |
|----------|-------|-------|
| Temps traitement fiche | 25 min | **10 min (-60%)** |
| Erreurs déclarations | 15% | **3% (-80%)** |
| Outils utilisés | 8 | **1 (-88%)** |
| Prix vs Enterprise | 600€/mois | **150-300€ (-50-75%)** |

---

## 🛠️ Stack Technique Monorepo {#stack}

### Architecture Monorepo (Turborepo)

```
workzen-secretariat-social/
├── apps/
│   ├── web/                    # Next.js 15 App (Dashboard + Marketing)
│   │   ├── Dockerfile
│   │   └── docker-compose.yml
│   └── api/                    # Next.js API Routes (optionnel si séparé)
│
├── packages/
│   ├── ui/                     # ShadcnUI components
│   ├── database/               # Prisma schema
│   ├── typescript-config/      # Shared TS configs
│   ├── eslint-config/          # Shared ESLint
│   └── utils/                  # Shared utilities
│
├── infrastructure/             # Config Coolify + Docker
│   ├── docker-compose.prod.yml
│   ├── nginx.conf
│   ├── postgresql.env
│   ├── redis.env
│   └── minio.env
│
├── turbo.json
├── pnpm-workspace.yaml
├── Dockerfile                  # Production build
└── package.json
```

**Déploiement avec Coolify**
- Build Docker image du monorepo
- Deploy via Coolify Git integration
- Services séparés : PostgreSQL, Redis, MinIO
- Nginx reverse proxy automatique
- SSL Let's Encrypt géré par Coolify

### Technologies Core

**Frontend**
- Next.js 16 (App Router + React Server Components)
- React 19
- Tailwind CSS 4
- ShadcnUI + Radix UI
- React Hook Form + Zod
- TanStack Query v5

**Backend**
- Next.js 16 API Routes (Node.js runtime)
- PostgreSQL 16 + Prisma ORM
- Redis 7+ (auto-hébergé)
- MinIO (S3-compatible storage)
- BullMQ (background jobs avec Redis)

**Paiements**
- Stripe Checkout
- Stripe Customer Portal
- Stripe Webhooks
- Stripe Tax

**Infrastructure - VPS Hostinger + Coolify**
- Coolify (Docker orchestration)
- PostgreSQL 16 (Docker container)
- Redis 7+ (Docker container)
- MinIO (S3-compatible, Docker)
- Nginx (reverse proxy)
- Let's Encrypt (SSL automatique)
- Sentry (monitoring externe)

---

## 🗺️ Roadmap Produit {#roadmap}

### Phase 1 : MVP Core (Mois 1-3)

**Objectif**: Lancer avec 3-5 pilotes

#### Fonctionnalités

**1.1 Gestion Clients & Dossiers**
- CRUD entreprises complètes
- Gestion employés par client
- Tags & catégorisation
- Recherche avancée

**1.2 Génération Fiches de Paie**
- Formulaire encodage variables
- Calcul automatique cotisations
- Génération PDF (React-PDF)
- Envoi automatique email
- Historique complet

**1.3 Portail Client**
- Auth sécurisée (Better Auth)
- Dashboard employeur
- Historique fiches paie
- Upload documents
- Messagerie interne

**1.4 Calendrier ONSS**
- Deadlines visualisées
- Alertes automatiques (J-7, J-3, J-1)
- Export iCal
- Filtres par type

**1.5 Intégration Exact Online**
- OAuth2 connection
- Sync clients bidirectionnelle
- Export écritures comptables

### Phase 2 : Conformité (Mois 4-6)

**2.1 DIMONA Automatique**
- Formulaires pré-remplis
- API ONSS intégration
- Statuts temps réel

**2.2 Génération C4**
- Certificats chômage automatisés
- Envoi ONEM

**2.3 Bibliothèque Templates**
- Contrats de travail
- Avenants
- Règlements
- Lettres types

**2.4 Veille Législative**
- Scraping portails officiels
- Alertes changements
- Impact analysis

### Phase 3 : Intelligence (Mois 7-9)

**3.1 Dashboard Analytics**
- Productivité consultants
- Forecast charges sociales
- Benchmarking

**3.2 Détection Anomalies IA**
- Cotisations incohérentes
- Patterns suspects
- OpenAI API

**3.3 Assistant RH**
- Chat conversationnel
- Questions légales
- Recherche documentaire

### Phase 4 : Écosystème (Mois 10-12)

**4.1 API Publique**
- REST API documentée
- Webhooks
- SDK TypeScript

**4.2 Intégrations Tier 2**
- Yuki
- Winbooks
- Odoo
- Microsoft 365

**4.3 White-Label**
- Domaine custom
- Branding complet
- Email branding

---

## 🚀 MVP - Plan de Développement Détaillé {#mvp}

### Sprint 0 : Setup (Semaines 1-2)

**Infrastructure**
- [x] Init Turborepo + pnpm
- [x] Setup Next.js 15 apps/web
- [x] Setup packages/ui
- [x] Setup packages/database
- [x] Config Tailwind 4
- [x] Config Vercel

**Auth & Security**
- [x] Better Auth setup
- [x] Multi-tenant architecture
- [x] RBAC implementation
- [x] Session management (Redis)

**Design System**
- [x] ShadcnUI components
- [x] Tailwind config custom
- [x] Color palette
- [x] Typography scale

**Livrables**: Monorepo fonctionnel + Auth + Design System

---

### Sprint 1 : Core Foundation (Semaines 3-4)

#### Backend - Prisma Schema

```prisma
// Core entities
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String?
  role          UserRole
  secretariatId String?
  secretariat   Secretariat?
}

enum UserRole {
  SUPER_ADMIN
  SECRETARIAT_ADMIN
  CONSULTANT
  CLIENT
  EMPLOYEE
}

model Secretariat {
  id           String       @id @default(cuid())
  name         String
  vatNumber    String       @unique
  subscription Subscription?
  companies    Company[]
}

model Company {
  id            String     @id @default(cuid())
  name          String
  vatNumber     String     @unique
  secretariatId String
  secretariat   Secretariat
  employees     Employee[]
  payrolls      Payroll[]
}

model Employee {
  id             String   @id @default(cuid())
  firstName      String
  lastName       String
  nationalNumber String   @unique
  companyId      String
  company        Company
  payrolls       Payroll[]
}
```

#### Frontend - Pages Structure

```
apps/web/src/app/
├── (auth)/
│   ├── login/
│   └── register/
├── (dashboard)/
│   ├── dashboard/
│   ├── companies/
│   │   ├── page.tsx          # Liste
│   │   ├── [id]/page.tsx     # Détail
│   │   └── new/page.tsx      # Nouveau
│   ├── employees/
│   ├── payrolls/
│   └── settings/
└── (portal)/
    └── portal/
        ├── dashboard/
        ├── employees/
        └── payrolls/
```

**Tâches**
- [ ] Prisma schema complet
- [ ] API routes companies CRUD
- [ ] API routes employees CRUD
- [ ] UI dashboard layout
- [ ] Pages liste + détail companies
- [ ] Pages liste + détail employees
- [ ] Data tables (TanStack Table)

**Livrables**: CRUD complet + UI responsive

---

### Sprint 2 : Payroll Engine (Semaines 5-6)

#### Service Calculs

```typescript
class PayrollCalculatorService {
  calculatePayroll(data: PayrollInput): PayrollOutput {
    // 1. Salaire brut
    const gross = this.calculateGross(data);
    
    // 2. ONSS employé (13.07%)
    const onssEmployee = gross * 0.1307;
    
    // 3. Précompte professionnel
    const tax = this.calculateTax(gross - onssEmployee);
    
    // 4. Net
    const net = gross - onssEmployee - tax;
    
    // 5. ONSS employeur (~25%)
    const onssEmployer = gross * 0.25;
    
    return { gross, net, onssEmployee, onssEmployer };
  }
}
```

#### Génération PDF

```typescript
// React-PDF template
<Document>
  <Page>
    <View style={styles.header}>
      <Image src={company.logo} />
      <Text>{company.name}</Text>
    </View>
    
    <View style={styles.section}>
      <Text>Employé: {employee.name}</Text>
      <Text>Période: {month}/{year}</Text>
    </View>
    
    <View style={styles.table}>
      {/* Salaire brut */}
      {/* Cotisations */}
      {/* Net à payer */}
    </View>
  </Page>
</Document>
```

**Tâches**
- [ ] PayrollCalculatorService
- [ ] Tests unitaires calculs
- [ ] Template React-PDF
- [ ] API routes payrolls CRUD
- [ ] Endpoint /preview
- [ ] Upload Vercel Blob
- [ ] Envoi email (Resend)

**Livrables**: Moteur paie fonctionnel + PDF generation

---

### Sprint 3 : Portail Client (Semaines 7-8)

#### Architecture

```
Separation frontend:
- (dashboard) → Secrétariat admins/consultants
- (portal) → Clients employeurs

Auth multi-tenant:
- Sessions séparées
- Permissions granulaires
```

**Tâches**
- [ ] Layout portail
- [ ] Dashboard employeur
- [ ] Liste employés (read-only)
- [ ] Historique fiches paie + download
- [ ] Upload documents (drag & drop)
- [ ] Messagerie interface
- [ ] Notifications badge

**Livrables**: Portail client complet

---

### Sprint 4 : Calendrier & Intégrations (Semaines 9-10)

#### Calendrier

```prisma
model Deadline {
  id            String       @id
  type          DeadlineType
  dueDate       DateTime
  recurring     Boolean
  alertDays     Int[]
  secretariatId String
}
```

#### Exact Online OAuth

```typescript
// 1. Connect button → OAuth URL
// 2. Callback handler
// 3. Store tokens
// 4. Sync service (companies + payrolls)
```

**Tâches**
- [ ] Modèle Deadline
- [ ] Calendar UI (react-day-picker)
- [ ] Inngest job alertes
- [ ] OAuth Exact flow
- [ ] Sync bidirectionnel
- [ ] Export écritures comptables

**Livrables**: Calendrier + Exact integration

---

### Sprint 5 : Billing Stripe (Semaines 11-12)

#### Configuration

**Products Stripe**
1. Starter - 150€/mois
2. Professional - 300€/mois
3. Enterprise - 750€/mois

**Add-ons**
- +25€/utilisateur
- +10€/10GB stockage

#### Implementation

```typescript
// Checkout
POST /api/billing/create-checkout
→ Stripe Checkout Session

// Webhooks
POST /api/webhooks/stripe
- checkout.session.completed
- subscription.updated
- subscription.deleted
- invoice.paid
- invoice.payment_failed

// Customer Portal
POST /api/billing/create-portal
→ Stripe Customer Portal URL
```

**Tâches**
- [ ] Stripe products setup
- [ ] API checkout + portal
- [ ] Webhooks handler
- [ ] Middleware limits plan
- [ ] Page pricing publique
- [ ] Page billing settings
- [ ] Emails facturation

**Livrables**: Billing Stripe complet

---

### Sprint 6 : Testing & Polish (Semaines 13-14)

#### Tests

```typescript
// Unit tests (Vitest)
- PayrollCalculatorService
- Tous services métier

// Integration tests
- API routes
- Webhooks Stripe

// E2E tests (Playwright)
- Workflow création fiche paie
- Workflow portail client
```

#### Performance

- Database indexes
- Redis caching
- React Query prefetching
- Bundle optimization

#### Monitoring

- Sentry error tracking
- Vercel Analytics
- Uptime monitoring

**Tâches**
- [ ] Tests suite complète (>80% coverage)
- [ ] Performance audit
- [ ] Accessibility audit
- [ ] Documentation complète
- [ ] Deployment guide

**Livrables**: MVP production-ready

---

## 📈 Roadmap Go-To-Market {#gtm}

### Phase 0 : Pré-lancement (Mois -2 à -1)

**Brand**
- Logo + charte graphique
- Website marketing (Next.js)
- Blog + SEO content
- Vidéo démo

**Lead Gen**
- LinkedIn Company Page
- Newsletter setup
- CRM (Pipedrive)
- Google Analytics

---

### Phase 1 : Beta Fermée (Mois 1-2)

**Objectif**: 3-5 pilotes

**Approche**
1. LinkedIn outreach (100 contacts)
2. Demo personnalisée
3. Onboarding gratuit 3 mois
4. Feedback intensif

**Success Metrics**
- Temps paie: -40%+
- NPS: >40
- Bugs critiques: 0

---

### Phase 2 : Lancement Public (Mois 3-4)

**Objectif**: 10-15 clients payants

**Canaux**
- LinkedIn Ads (2K€/mois)
- Content marketing (2×/semaine)
- Webinaires bi-mensuels
- Partenariats comptables

**Conversion Funnel**
```
Visitor → Lead → Demo → Trial → Paid
3%      → 30%  → 50%  → 40%
```

---

### Phase 3 : Growth (Mois 5-8)

**Objectif**: 30-50 clients | 15K€ MRR

**Optimizations**
- Email sequences automation
- Customer Success process
- Health score tracking
- Churn prevention

---

### Phase 4 : Scale (Mois 9-12)

**Objectif**: 80-120 clients | 30-40K€ MRR

**New Channels**
- Google Ads (3K€/mois)
- Referral program
- Events & conferences
- Product-led growth (freemium?)

---

## 🏗️ Architecture Technique {#architecture}

### Stack Diagram

```
┌─── Frontend (VPS Hostinger) ───┐
│ Next.js 15 App (Docker)         │
│ React 19 Components             │
│ Tailwind 4 + ShadcnUI           │
│ Nginx Reverse Proxy             │
└──────────▼─────────────────────┘
           
┌─── API Layer ──────────────────┐
│ Next.js API Routes              │
│ Better Auth                     │
│ Business Logic                  │
└──────────▼─────────────────────┘
           
┌─── Data Layer (Docker) ────────┐
│ PostgreSQL 16 (Container)       │
│ Redis 7+ (Container)            │
│ MinIO (Container)               │
│ BullMQ (Background Jobs)        │
└──────────▼─────────────────────┘
           
┌─── External Services ──────────┐
│ Stripe • Resend                 │
│ Exact Online • Sentry           │
└─────────────────────────────────┘

🏗️ Infrastructure: Coolify
- Docker containers orchestration
- Automatic deployments (Git push)
- SSL Let's Encrypt automatique
- Health checks & auto-restart
- Logs centralisés
- Backups automatiques
```

### Multi-Tenancy

**Strategy**: Row-Level Security (RLS) PostgreSQL

```sql
-- Chaque query filtrée par secretariatId
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY companies_isolation ON companies
USING (secretariat_id = current_setting('app.current_secretariat')::uuid);
```

### Authentication

**Better Auth + RBAC**
- Email/Password + Google OAuth
- 5 rôles: Super Admin, Secretariat Admin, Consultant, Client, Employee
- Middleware permissions par route
- Session Redis (7 jours)

---

## 💰 Modèle de Revenus {#revenus}

### Pricing

| Plan | Prix | Clients | Users | Storage | Features |
|------|------|---------|-------|---------|----------|
| **Starter** | 150€ | 25 | 3 | 5GB | Base |
| **Pro** | 300€ | 100 | 10 | 25GB | + Intégrations |
| **Enterprise** | 750€ | ∞ | ∞ | 100GB | + White-label |

### Projections 36 Mois

```
M3:   9 clients  →  2.5K€ MRR  →   30K€ ARR
M6:  22 clients  →  6.3K€ MRR  →   75K€ ARR
M12: 54 clients  → 15.4K€ MRR  →  185K€ ARR
M24: 128 clients → 36.5K€ MRR  →  438K€ ARR
M36: 218 clients → 62.1K€ MRR  →  746K€ ARR
```

**Break-even**: Mois 5-6 (10 clients)  
**Profitability**: Mois 8-10

### Unit Economics

```
ARPU: 285€
CAC: 1,800€
LTV: 11,400€ (vie moyenne 40 mois, churn 4%)
LTV:CAC: 6.3x
Payback: 6-7 mois
Gross Margin: 85%+
```

---

## 🎯 Success Criteria

### MVP (Mois 1-3)
- ✅ 3-5 pilotes actifs
- ✅ 50+ fiches générées
- ✅ 0 bugs critiques
- ✅ NPS >40

### Public Launch (Mois 4-6)
- ✅ 15-20 clients payants
- ✅ 10K€ MRR
- ✅ Churn <5%
- ✅ Uptime >99%

### PMF (Mois 7-12)
- ✅ 50+ clients
- ✅ 15K€+ MRR
- ✅ 2-3 case studies
- ✅ 1 partenariat comptable
- ✅ Organic traffic >1K/mois

---

## 📝 Conclusion

### Synthèse

MVP **14 semaines** pour lancer un produit production-ready avec:
- Stack moderne et scalable (Next.js 15, Tailwind 4, ShadcnUI, Stripe)
- Monorepo Turborepo optimisé pour la DX
- Time-to-market rapide
- Conformité marché belge

### Investissement

```
Développement: Temps interne (Sébastien 100%)
Infrastructure: 500€/mois
Marketing: 2,000€/mois (dès M3)
Légal: 5-10K€ one-time
────────────────────────────
Total Année 1: 25-35K€
```

### ROI 12 Mois

```
Investment: 30K€
ARR M12: 180-360K€
ROI: 6-12x
Break-even: M5-6
```

### Next Steps

**Semaine 1**
- [ ] Setup monorepo complet
- [ ] Vercel + Vercel Postgres
- [ ] Stripe products

**Semaine 2**
- [ ] Design system ShadcnUI
- [ ] Better Auth config
- [ ] Prisma schema

**Semaine 3-4**
- [ ] CRUD companies/employees
- [ ] Dashboard UI
- [ ] Auth multi-tenant

---

**Le marché attend. Le timing est parfait. Lançons WorkZen en 2025.** 🚀

---

*Document v1.0 - Janvier 2025*  
*Stack: Next.js 15 • React 19 • Tailwind 4 • ShadcnUI • Prisma • Stripe*

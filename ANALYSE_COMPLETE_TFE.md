# 📊 ANALYSE COMPLÈTE DU PROJET TFE - SocialFlow

**Date:** 2026-07-01  
**Auteur:** Claude Code (Analyse Approfondie)  
**Status:** Analyse en cours - Maquettes en création

---

## 🎯 EXECUTIVE SUMMARY

**SocialFlow** est une plateforme SaaS complète de gestion RH belge destinée aux secrétariats sociaux. Le projet couvre:

- **5 rôles distincts** avec workflows et permissions précis
- **Architecture multi-tenant** stricte (Row-Level Security)
- **Conformité RH belge** (DIMONA, ONSS, C4, paie automatisée)
- **Stack moderne** (Next.js 16, React 19, Tailwind 4, ShadcnUI, Prisma, Stripe)
- **14 semaines MVP** avant lancement public

---

## 🏗️ ARCHITECTURE GLOBALE

### Hiérarchie des 5 Rôles

```
┌─ SuperAdmin (1)
│  └─ Gère config plateforme (Stripe, branding, users, monitoring)
│
├─ Cabinet RH (N clients payants)
│  ├─ Gestion clients/employés
│  ├─ Config customisation (SMTP, templates, branding)
│  └─ Abonnement Stripe + facturation
│
├─ Gestionnaire RH / Consultant (Collaborateurs du cabinet)
│  ├─ Gestion clients assignés (CRUD)
│  ├─ Gestion employés (CRUD)
│  ├─ Création fiches paie (calcul auto Belgique)
│  ├─ Déclarations ONSS/DIMONA
│  └─ Calendrier + alertes
│
├─ Entreprise Cliente (Clients payants du cabinet)
│  ├─ Portail read-only (affichage)
│  ├─ Validation fiches paie
│  ├─ Upload documents
│  └─ Messagerie
│
└─ Salarié/Collaborateur (Employés)
   └─ Accès propre fiche paie + infos contrat
```

### Stack Technique Complet

```
Frontend:
  • Next.js 16 (App Router + React Server Components)
  • React 19
  • Tailwind CSS 4
  • ShadcnUI + Radix UI components
  • React Hook Form + Zod validation
  • TanStack Query v5

Backend:
  • Next.js API Routes (Node.js runtime serverless)
  • Better Auth (3 méthodes: email/password, OAuth Google/Microsoft, Magic Link)
  • Prisma ORM
  • PostgreSQL 16 (Vercel Postgres / Neon)
  • Redis 7+ (Upstash) - sessions, cache, rate limiting
  • BullMQ (background jobs via Redis)

Infrastructure:
  • Vercel (déploiement frontend + API Routes)
  • PostgreSQL (data persistence)
  • Redis (cache + background jobs)
  • Vercel Blob (storage fichiers)
  • Stripe (paiements + subscriptions)
  • Resend (email notifications)
  • Sentry (error tracking)

Intégrations:
  • Stripe - Paiements, subscriptions, webhooks
  • Exact Online OAuth2 - Sync comptable bidirectionnelle
  • ONSS API - Déclarations DIMONA
```

---

## 📱 STRUCTURE DES ÉCRANS (Par Rôle)

### 1️⃣ PAGES PUBLIQUES (Avant authentification)
- **Landing page** - Marketing SocialFlow
- **Login** - Email/Password + OAuth Google/Microsoft
- **Register Cabinet** - Inscription secrétariat
- **Forgot Password** - Réinitialisation MDP

### 2️⃣ SUPERADMIN DASHBOARD
- **KPIs globaux**: MRR, secrétariats actifs, utilisateurs, taux rétention/churn
- **Gestion cabinets**: Liste, stats, suspension/réactivation
- **Gestion utilisateurs**: Reset password, suspendre, 2FA, sessions
- **Config système**: Plans Stripe, branding global, OAuth, logs
- **Audit logs**: Timeline complète avec filtres/export

### 3️⃣ CABINET RH DASHBOARD
- **KPIs cabinet**: Entreprises, gestionnaires, usage quota
- **Gestion clients**: CRUD + tagging + recherche
- **Gestion gestionnaires**: Invitation, assignation entreprises
- **Facturation**: Plan actuel, usage, Customer Portal Stripe
- **Customisation**: SMTP, templates email, branding (logo, couleurs)

### 4️⃣ GESTIONNAIRE RH DASHBOARD
- **Vue d'accueil**: Fiches en attente, prochaines deadlines, alertes
- **Clients assignés**: Liste, filtre, actions rapides
- **Employés du client**: CRUD, archivage soft-delete
- **Générateur fiches paie**: 
  - Formulaire inputs (salaire, heures, primes)
  - Calcul temps réel (ONSS 13.07%, précompte, charges 42%)
  - Aperçu PDF
  - Actions: sauvegarder, envoyer, télécharger
- **Conformité ONSS**: Déclarer DIMONA, vérifier conformité
- **Calendrier**: Deadlines ONSS, alertes J-7/J-3/J-1
- **Messagerie**: Chat avec clients
- **Templates documents**: Contrats, lettres, déclarations (variables)
- **Export/Import**: Excel, CSV, JSON bidirectionnel

### 5️⃣ PORTAIL ENTREPRISE CLIENTE
- **Dashboard simple**: Résumé (employés, fiches, documents)
- **Employés**: Liste read-only
- **Historique fiches paie**: Tableau filtré, download PDF
- **Upload documents**: Drag & drop sécurisé
- **Messagerie**: Chat avec gestionnaire

### 6️⃣ PORTAIL SALARIÉ
- **Dashboard minimal**: Accès propre fiche paie
- **Download PDF**: Accès sécurisé (token 30 min)
- **Infos contrat**: Affichage

---

## 🔐 SÉCURITÉ & ISOLATION MULTI-TENANT

### Authentication Flow
```
User → Login (email/password / OAuth / Magic Link)
  ↓
Better Auth (hash bcrypt, 2FA TOTP optionnel)
  ↓
JWT Token (1h memory + RefreshToken 24h HttpOnly cookie)
  ↓
SessionId Redis + IP/User-Agent verification
  ↓
Access Dashboard (role-based)
```

### Multi-Tenant Isolation (Row-Level Security)
```
Tous les JWT contiennent:
  • userId
  • secretariatId (Cabinet RH)
  • role (SUPER_ADMIN, ADMIN_SECRETARIAT, CONSULTANT, CLIENT, EMPLOYEE)
  • Expiration 1h-24h

Chaque query filtrée automatiquement par secretariatId du token
  → WHERE secretariat_id = current_setting('app.current_secretariat')::uuid

Aucune donnée inter-secretariat accessible
  → Messages d'erreur génériques (sécurité)
  → Vérifications d'autorisation à chaque opération CRUD
```

### Protections Critiques
- **Dernier SuperAdmin protégé** - Impossible de le révoquer
- **Auto-révocation bloquée** - SuperAdmin ≠ modifier son propre rôle
- **2FA obligatoire SuperAdmin** - TOTP 30 sec + retry 3x
- **Blocage après tentatives** - 5 échoues = blocage 15 min
- **Rate limiting** - API throttling par IP + user
- **Tokens jamais loggés** - Masked en audit logs
- **Soft delete RGPD** - archived_at, pas suppression physique

---

## 💰 MODÈLE ÉCONOMIQUE

### Pricing (3 tiers)
| Plan | Prix | Clients | Utilisateurs | Storage | Features |
|------|------|---------|---|---|---|
| **Starter** | 150€/mois | 25 | 3 | 5GB | Core |
| **Pro** | 300€/mois | 100 | 10 | 25GB | + Intégrations |
| **Enterprise** | Custom | ∞ | ∞ | 100GB | + White-label |

### Projections 36 Mois
```
M3 (MVP launch):   9 clients → 2.5K€ MRR → 30K€ ARR
M6 (Public):      22 clients → 6.3K€ MRR → 75K€ ARR
M12:              54 clients → 15.4K€ MRR → 185K€ ARR
M24:             128 clients → 36.5K€ MRR → 438K€ ARR
M36:             218 clients → 62.1K€ MRR → 746K€ ARR

Break-even: M5-6 (10 clients)
Profitability: M8-10
```

### Unit Economics
```
ARPU: 285€
CAC: 1,800€
LTV: 11,400€ (40 mois vie moyenne, 4% churn)
LTV:CAC: 6.3x ✓ (excellent)
Payback: 6-7 mois
Gross Margin: 85%+
```

---

## 🎯 PRIORITÉS & ROADMAP

### Phase 1: MVP Core (M1-3)
**Objectif**: Lancer avec 3-5 pilotes

1. **Gestion Clients & Employés** - CRUD complet
2. **Fiches de paie** - Calcul auto Belgique (ONSS, précompte, net)
3. **PDF Generation** - React-PDF avec branding
4. **Envoi email** - Resend via SMTP cabinet
5. **Portail Entreprise** - Read-only dashboard + download
6. **Calendrier ONSS** - Deadlines + alertes J-7/J-3/J-1
7. **Intégration Exact Online** - Sync clients bidirectionnelle

### Phase 2: Conformité (M4-6)
- DIMONA automatique + API ONSS
- Génération C4 (certificats chômage)
- Bibliothèque templates
- Veille législative scrapin

### Phase 3: Intelligence (M7-9)
- Dashboard analytics (productivité, forecast)
- Détection anomalies IA
- Assistant RH conversationnel

### Phase 4: Écosystème (M10-12)
- API publique + SDK
- White-label complet
- Intégrations Tier 2 (Yuki, Odoo, etc.)

---

## 📊 SPÉCIFICATION FONCTIONNELLE DÉTAILLÉE

### Use Cases Par Rôle

#### SuperAdmin (9 catégories, 50+ use cases)
1. **Authentification**: Login 2FA obligatoire
2. **Gestion cabinets**: CRUD, suspension, facturation
3. **Gestion utilisateurs**: RBAC, reset, suspendre, 2FA
4. **Monitoring**: Dashboard KPIs plateforme
5. **Configuration**: Plans Stripe, paramètres globaux
6. **Logs audit**: Timeline immuable, export, anomalies
7. **Veille législative**: Scraping ONSS/DIMONA, alertes
8. **API Management**: Clés, rate limiting, webhooks
9. **White-label**: Domaines custom, branding par client

#### Cabinet RH (4 catégories, 20+ use cases)
1. **Authentification**: Login sécurisé
2. **Abonnement Stripe**: Plan, usage, Customer Portal
3. **Gestion clients**: CRUD, tagging, recherche
4. **Customisation**: SMTP, templates, branding

#### Gestionnaire RH (10 catégories, 40+ use cases)
1. **Authentification**: Login + JWT
2. **Gestion clients**: CRUD assignés
3. **Gestion employés**: CRUD, archivage
4. **Fiches paie**: Création, calcul, PDF, envoi email
5. **Conformité ONSS**: DIMONA, vérification
6. **Calendrier**: Deadlines, alertes
7. **Dashboard**: KPIs personnalisés
8. **Intégration Exact**: OAuth2, sync bidirectionnelle
9. **Messagerie**: Chat avec clients
10. **Documents**: Templates, export/import

---

## 🗄️ STRUCTURE BASE DE DONNÉES

### Modèles Principaux (Prisma)
```prisma
// Core
User (email, password hash, role, is_active)
Secretariat (name, vatNumber, subscription_status, plan)
Company (name, vatNumber, IBAN, secretariat_id)
Employee (firstName, lastName, NISS, salary, company_id, archived_at)

// Paie
Payroll (employee_id, month, year, brut, ONSS, précompte, net, status)
PayrollFile (payroll_id, PDF file path, storage reference)

// Conformité
DeclarationONSS (employee_id, type, status, numero_dossier, error_detail)
CertificateC4 (employee_id, issued_date, file_path)

// Subscription
Subscription (secretariat_id, plan, stripe_customer_id, stripe_subscription_id, status)
Invoice (subscription_id, amount, status, paid_at)

// OAuth
OAuthToken (secretariat_id, provider, access_token, refresh_token, expires_at)

// Audit
AuditLog (user_id, action, resource, old_value, new_value, timestamp, ip, user_agent)
```

### Contraintes Critiques
- **TVA/NISS immutables** une fois créés (unicité garantie)
- **secretariatId/clientId immutables** (isolation multi-tenant)
- **Soft delete (archived_at)** pour RGPD (pas suppression physique)
- **RLS PostgreSQL** pour isolation automatique
- **Indexes** sur status, created_at, secretariat_id, company_id
- **Rétention logs** 6 mois → archivage (3 ans minimum légal)

---

## 🚀 DÉPLOIEMENT (Vercel)

### Architecture Vercel
```
Frontend: Vercel Edge (Next.js, ShadcnUI, Tailwind)
  ↓ API Routes (Serverless Functions)
  ↓ Prisma ORM (PostgreSQL queries)
  ↓
PostgreSQL: Vercel Postgres / Neon
Redis: Upstash
Blob Storage: Vercel Blob (PDFs, exports)
Email: Resend
Payments: Stripe
Monitoring: Sentry
```

### CI/CD
```
Git push → Vercel auto-deploys
  ├─ Build Next.js
  ├─ Run tests (Vitest)
  ├─ Type check (tsc)
  ├─ Lint (ESLint)
  └─ Deploy to preview → production
```

### Monitoring & Observability
- **Uptime**: Vercel health checks
- **Errors**: Sentry error tracking
- **Performance**: Vercel Analytics
- **Database**: Query logging, slow query alerts
- **API**: Rate limiting, throttling by IP

---

## ✅ CHECKLIST DÉVELOPPEMENT (14 semaines)

### Sprint 0: Setup (Sem 1-2)
- [x] Turborepo + pnpm monorepo
- [x] Next.js 16 + Tailwind 4 + ShadcnUI
- [x] Better Auth + multi-tenant RBAC
- [x] Prisma schema complet

### Sprint 1: Core (Sem 3-4)
- [ ] CRUD companies/employees
- [ ] Dashboard layout
- [ ] Auth pages (login, register, forgot password)

### Sprint 2: Payroll Engine (Sem 5-6)
- [ ] PayrollCalculatorService
- [ ] React-PDF template
- [ ] Tests unitaires calculs (>95% accuracy Belgique)

### Sprint 3: Portail Entreprise (Sem 7-8)
- [ ] Layout portail
- [ ] Dashboard employeur read-only
- [ ] Download fiches + historique

### Sprint 4: Calendrier & Exact (Sem 9-10)
- [ ] Calendrier UI (react-day-picker)
- [ ] Alerts système (email J-7/J-3/J-1)
- [ ] Exact Online OAuth2 flow

### Sprint 5: Billing Stripe (Sem 11-12)
- [ ] Checkout session + portal
- [ ] Webhooks handler (6 events)
- [ ] Plan limits middleware

### Sprint 6: Testing & Polish (Sem 13-14)
- [ ] Unit tests >80% coverage
- [ ] Integration tests API
- [ ] E2E tests Playwright (workflows clés)
- [ ] Performance audit
- [ ] Documentation complète

---

## 📋 RECOMMANDATIONS D'IMPLÉMENTATION

### Priorisation Critique (MVP)
1. **Authentification** - Foundation
2. **CRUD companies/employees** - Data foundation
3. **Fiches paie** - Core business
4. **Portail entreprise** - Client value
5. **Conformité ONSS/DIMONA** - Compliance
6. **Exact Online sync** - Business continuity

### Optimisations Clés
- **Cache Redis** pour KPIs (TTL 10 min)
- **Pagination** pour listes >100 rows
- **Indexes DB** sur secretary_id, company_id, created_at
- **Soft delete** pour RGPD (archived_at timestamps)
- **Rate limiting** via Redis (100 req/min par IP)
- **Background jobs** (BullMQ) pour: email, PDF generation, DIMONA retry

### Équipe & Timeline
- **1 dev full-stack** (Sébastien 100%)
- **14 semaines MVP** (3.5 mois)
- **Go-live**: M3 avec 3-5 pilotes
- **Public launch**: M4 (phase 2)

---

## 🎨 DESIGN SYSTEM

### Couleurs SocialFlow
- **Primaire**: Violet (#7C3AED)
- **Secondaire**: Teal (#14B8A6)
- **Success**: Vert (#10B981)
- **Warning**: Jaune (#F59E0B)
- **Danger**: Rouge (#EF4444)

### Typographie (Tailwind)
- **Headings**: Inter Bold
- **Body**: Inter Regular
- **Code**: JetBrains Mono

### Responsive Breakpoints
- **Mobile**: <640px
- **Tablet**: 640px - 1024px
- **Desktop**: >1024px

### Accessibility (WCAG AA)
- Contrast ratios >4.5:1
- ARIA labels complètes
- Keyboard navigation (Tab, Enter, Escape)
- Focus indicators visibles
- Form validation real-time

---

## 📞 SUPPORT & CONTACT

**Documentation Sources**:
- `SPEC_FINAL.md` - Spécification unique
- `ARCHITECTURE.md` - API endpoints + diagrammes
- `PRD_CLIENT.md` - Cahier des charges
- `PRD_INTERNE.md` - Roadmap 4 phases
- `_uml/` - 220 diagrammes (use cases, workflows, classes)

**Auteur**: Adrien Mertens  
**Version**: 1.0  
**Date**: 2026-07-01  
**Status**: Prêt à développer

---

*Document généré le 2026-07-01. Mise à jour: suivre git commits.*

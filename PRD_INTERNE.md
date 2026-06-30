# PRD INTERNE — SocialFlow

**Roadmap, phases, décisions et notes de développement**  
**Date:** 2026-06-30  
**Propriétaire:** Adrien Mertens  
**Status:** Version 1.0

---

## EXECUTIVE SUMMARY

**Plateforme SaaS multi-tenant de gestion de paie belge pour Cabinets RH.**

- **Target users:** Cabinets RH (100-1000 salariés max)
- **Business model:** SaaS subscription (Starter 99€/Pro 299€/Enterprise custom)
- **Go-to-market:** Direct sales + word of mouth
- **Deployment:** Vercel (cloud-native)
- **Timeline:** 14 semaines MVP → integration → compliance

---

## ROADMAP — 4 PHASES

### PHASE 1: MVP (14 semaines) — CORE FEATURES

**Objectif:** Platform stable, users can manage payroll, Cabinet can send fiches.

**Livérables:**

```
Week 1-2: Foundation
  ✅ Vercel + PostgreSQL + Redis setup
  ✅ Better Auth (3 auth methods)
  ✅ Prisma migrations
  ✅ Stripe integration (checkout)

Week 3-4: Core auth & Cabinet
  ✅ Cabinet registration (Stripe flow)
  ✅ Cabinet SMTP customization
  ✅ Cabinet invite Gestionnaire
  ✅ Dashboard Cabinet (overview)

Week 5-6: Gestionnaire & Entreprise
  ✅ Gestionnaire invitation workflow
  ✅ Gestionnaire portal (fiches management)
  ✅ Entreprise invitation workflow
  ✅ Entreprise admin portal (validation)

Week 7-8: Fiches de paie
  ✅ Create fiche (form + calculations)
  ✅ Workflows (BROUILLON → VALIDATION → VALIDÉE → ENVOYÉE)
  ✅ PDF generation
  ✅ Validation workflow

Week 9-10: Collaborateur & email
  ✅ Collaborateur invitation
  ✅ Collaborateur portal (view-only)
  ✅ Email sending (Cabinet SMTP)
  ✅ Download fiche

Week 11-12: Testing & polish
  ✅ End-to-end testing
  ✅ Performance optimization
  ✅ Security audit (OWASP)
  ✅ UX polish

Week 13-14: Deployment & monitoring
  ✅ Vercel production setup
  ✅ Monitoring (Sentry, Vercel Analytics)
  ✅ Documentation
  ✅ Launch
```

**Scope d'MVP:**
- ✅ 5 rôles (SuperAdmin, Cabinet, Gestionnaire, Entreprise, Collaborateur)
- ✅ 3 auth methods (Magic Link, Password, OAuth)
- ✅ Workflow fiche de paie complet
- ✅ SMTP customization
- ✅ Stripe subscriptions
- ✅ Isolation multi-tenant
- ❌ 2FA (Phase 2)
- ❌ API webhooks (Phase 2)
- ❌ ONSS/DIMONA declarations (Phase 2)
- ❌ White-label portal (Phase 3)

---

### PHASE 2: INTEGRATIONS (4-6 semaines) — APRÈS MVP

**Objectif:** Connect to Belgian legal authorities + advanced features.

**Livérables:**

```
ONSS/DIMONA:
  - Auto-generate ONSS declarations
  - DIMONA worker registrations
  - C4 certificate management
  - Annual tax summaries

API & Webhooks:
  - REST API (for third-party integrations)
  - Stripe webhooks (payment events)
  - Webhook management (retry, logs)

2FA & Security:
  - Email OTP
  - TOTP (Google Authenticator)
  - Backup codes
  - Rate limiting

Notifications:
  - Email notifications (Resend)
  - Webhook events
  - In-app notifications (bell icon)
  - SMS (optional, future)

Data import/export:
  - CSV import (employees, fiches)
  - XML export (legal compliance)
  - JSON export (data portability)
```

---

### PHASE 3: COMPLIANCE & SCALE (3 semaines) — FUTURE

**Objectif:** Full Belgian labor law compliance + scalability.

**Livérables:**

```
Compliance:
  - GDPR/RGPD audit
  - Data retention policies
  - DPA (Data Processing Agreement)
  - Security certification (ISO 27001?)

Advanced features:
  - White-label portal (brand customization)
  - Single Sign-On (SSO/SAML)
  - Advanced reporting (analytics)
  - Payment gateways (other providers)
  - Mobile app (iOS/Android)

Performance:
  - Database optimization
  - Caching strategies
  - CDN for static assets
  - Load testing (1000+ concurrent users)
```

---

### PHASE 4: ECOSYSTEM (ongoing) — FUTURE

**Objectif:** Build ecosystem of integrations.

**Livérables:**

```
Integrations:
  - Accounting software (Sage, Exact Online)
  - HR systems (BambooHR, Workable)
  - Time tracking (Toggl, Clockify)
  - Benefits platforms
  - Insurance providers

Marketplace:
  - Third-party apps
  - Templates library
  - Consulting services
  - Training programs

Community:
  - User forum
  - Documentation wiki
  - Video tutorials
  - Webinars
```

---

## DÉCISIONS ARCHITECTURALES

### 1. Authentication (DÉCIDÉ: 3 méthodes)

**Choix:** Magic Link + Password + OAuth

**Justification:**
- Magic Link: UX fluide (0 friction)
- Password: Fallback classique
- OAuth: Sécurité fédérée + convenience

**Implémentation:** Better Auth library

---

### 2. Deployment (DÉCIDÉ: Vercel)

**Choix:** Vercel (pas Coolify/self-hosted)

**Justification:**
- Next.js natif
- Serverless = zero ops
- Scalabilité auto
- Pricing transparent
- Edge functions pour auth

**Infrastructure:**
```
Vercel (Frontend + API)
├─ PostgreSQL (Vercel Postgres OU Neon)
├─ Redis (Upstash)
└─ Vercel Blob (fichiers)
```

---

### 3. Pricing (DÉCIDÉ: SaaS subscription)

**Plans:**
```
STARTER: 99€/mois
  ├─ 25 entreprises
  ├─ 5 gestionnaires
  └─ 10 GB storage

PRO: 299€/mois
  ├─ 100 entreprises
  ├─ 15 gestionnaires
  └─ 50 GB storage

ENTERPRISE: Custom
  └─ Négociation directe
```

**Modèle:** Monthly recurring, auto-renewal, cancel anytime

**Stripe integration:**
- Subscription management
- Webhook payments
- Billing portal

---

### 4. Multi-tenancy (DÉCIDÉ: Row-level Security)

**Choix:** PostgreSQL RLS + JWT isolation

**Isolation:**
```
Cabinet A ≠ Cabinet B (physiquement isolé)
  ├─ WHERE cabinetId = jwt.cabinetId
  ├─ RLS policies
  └─ Application-level checks (defense-in-depth)
```

---

### 5. Data retention (DÉCIDÉ: 5 ans légal, soft-delete)

**Belgique legal requirement:**
- Fiches de paie: 5 ans minimum
- Contrats: 5 ans
- ONSS: 5 ans

**Implémentation:**
```
Soft-delete (deletedAt):
  ├─ Active: 0-30 jours
  ├─ Archive: 30 jours - 5 ans
  └─ Destroy: après 5 ans
```

---

## RISQUES & MITIGATION

### Risk 1: Data privacy (RGPD)

**Risk:** User data leaked → fines

**Mitigation:**
- ✅ Encryption (SMTP password, JWT secret)
- ✅ RLS PostgreSQL
- ✅ Audit logs
- ✅ DPA avec clients
- 🔄 Phase 3: GDPR audit

---

### Risk 2: Compliance Belgique

**Risk:** Non-compliance avec Belgian labor law → legal issues

**Mitigation:**
- ✅ Fiches format ONSS-standard
- ✅ 5-year retention
- 🔄 Phase 2: ONSS/DIMONA integration
- 🔄 Phase 3: Legal audit

---

### Risk 3: Scalability

**Risk:** Platform crashes under load (1000+ users)

**Mitigation:**
- ✅ Vercel auto-scaling
- ✅ PostgreSQL managed
- ✅ Redis caching
- 🔄 Phase 3: Load testing + optimization

---

### Risk 4: Security breach

**Risk:** Attacker compromises user data

**Mitigation:**
- ✅ JWT + refresh tokens
- ✅ bcrypt passwords
- ✅ HTTPS only
- ✅ Rate limiting
- ✅ Audit logs
- 🔄 Phase 3: Penetration testing

---

## SUCCESS METRICS

### Acquisition

```
Target: 50 Cabinets RH par an (Phase 1)

Metrics:
  - Signups/month
  - MRR (Monthly Recurring Revenue)
  - CAC (Customer Acquisition Cost)
  - Churn rate
```

### Retention

```
Target: <5% monthly churn

Metrics:
  - DAU (Daily Active Users)
  - Retention rate (Day 30, Day 90)
  - NPS (Net Promoter Score)
  - Support tickets/month
```

### Product

```
Metrics:
  - Fiches générées/jour
  - Page load time (<2s)
  - Uptime (>99.9%)
  - Error rate (<0.1%)
```

---

## DEPENDENCIES & BLOCKERS

### External dependencies

```
Stripe:
  ├─ API keys (get immediately)
  └─ Webhook configuration

Google/Microsoft OAuth:
  ├─ Developer apps (set up Week 1)
  └─ Credentials

Vercel:
  ├─ Account (active)
  └─ PostgreSQL add-on

Resend:
  ├─ API key
  └─ Domain verification
```

### Internal blockers

```
Legal review:
  ├─ Data processing agreement
  └─ Privacy policy (Belgium RGPD)

Design:
  ├─ Finalize UI maquettes
  └─ Design system (Tailwind + ShadcnUI)

Testing:
  ├─ E2E test scenarios
  └─ Test data setup
```

---

## NOTES DE DEV

### Architecture decisions

```
✅ DÉCIDÉ:
  - Next.js 16 + React 19 (stable)
  - TypeScript (type safety)
  - Prisma + PostgreSQL (mature)
  - Vercel (zero-ops)
  - Better Auth (battle-tested)

🔄 À DÉCIDER:
  - Testing framework (Vitest vs Jest)
  - API documentation (OpenAPI vs other)
  - Error tracking (Sentry vs Rollbar)
  - Monitoring (Vercel Analytics vs other)
```

### Performance targets

```
Page load: <2 seconds
API response: <500ms (p95)
PDF generation: <5 seconds
Fiche calculation: <1 second
Database query: <100ms (p95)
```

### Testing strategy

```
Unit tests: Controllers, services (>80% coverage)
Integration tests: API endpoints, DB
E2E tests: Critical workflows (signup, fiche, send)
Load tests: 1000+ concurrent users
Security tests: OWASP Top 10
```

---

## PERSONAS & USER STORIES

### Persona 1: Cabinet RH Manager

```
Name: Marie (Cabinet RH XYZ)
Age: 45
Experience: 15 years RH

Goal: Automate payroll management
Pain: Manual Excel spreadsheets, errors, time-consuming

User story:
  "As a Cabinet RH manager, I want to invite gestionnaires
   and automate paie generation, so I can save 20 hours/month"

Acceptance criteria:
  ✅ Upload employee data (CSV)
  ✅ Generate fiches (bulk)
  ✅ Customize templates (branding)
  ✅ Send via own SMTP
```

### Persona 2: Gestionnaire RH

```
Name: Jean (Gestionnaire)
Age: 32
Experience: 5 years payroll

Goal: Manage multiple clients' payroll efficiently
Pain: Switching between systems, manual calculations

User story:
  "As a Gestionnaire, I want to see only my assigned companies,
   so I can focus on my job without confusion"

Acceptance criteria:
  ✅ See assigned companies only
  ✅ Create fiches with auto-calculations
  ✅ Validate before sending
```

### Persona 3: Entreprise Cliente Admin

```
Name: Sarah (HR Admin at ACME)
Age: 38
Experience: 8 years HR

Goal: Manage employee payroll with validation
Pain: Not knowing what's in the fiche, trust Cabinet

User story:
  "As an Entreprise admin, I want to validate fiches before sending,
   so I can ensure accuracy and maintain control"

Acceptance criteria:
  ✅ See fiches in validation
  ✅ Review details
  ✅ Approve or reject with comment
```

---

## NEXT STEPS (IMMEDIATE)

```
1. Code foundation (Week 1)
   [ ] Vercel project setup
   [ ] Database schema (Prisma)
   [ ] Better Auth config
   [ ] Environment variables

2. MVP development (Week 2-12)
   [ ] Follow PHASE 1 deliverables
   [ ] Daily commits
   [ ] Weekly reviews

3. Testing & launch (Week 13-14)
   [ ] Full test coverage
   [ ] Security audit
   [ ] Performance optimization
   [ ] Deploy to production
```

---

**Version:** 1.0  
**Last updated:** 2026-06-30  
**Next review:** 2026-07-30

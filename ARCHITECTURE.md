# ARCHITECTURE — SocialFlow

**Détails techniques, diagrammes et API specification** 
**Date:** 2026-06-30 
**Version:** 1.0

---

## TABLE DES MATIÈRES

1. [Architecture globale](#architecture)
2. [Diagrammes UML](#uml)
3. [Flux de données](#flux)
4. [API REST Endpoints](#api)
5. [Database schema](#database)
6. [Sécurité & Isolation](#securite)
7. [Déploiement Vercel](#deploiement)

---

## ARCHITECTURE GLOBALE {#architecture}

### Stack technique

```
Frontend:
 ├─ Next.js 16 (App Router)
 ├─ React 19
 ├─ Tailwind CSS 4
 ├─ ShadcnUI (components)
 └─ TypeScript

Backend:
 ├─ Next.js API Routes (serverless)
 ├─ Better Auth (3 méthodes auth)
 ├─ Prisma ORM
 └─ TypeScript

Data:
 ├─ PostgreSQL (Vercel Postgres OU Neon)
 ├─ Redis (Upstash)
 ├─ Vercel KV (sessions cache)
 └─ Vercel Blob (fichiers)

External:
 ├─ Stripe (payments + subscriptions)
 ├─ Resend (email notifications)
 ├─ Google OAuth + Microsoft OAuth
 └─ Cabinet SMTP (envoi fiches)
```

### Topologie Vercel

```
┌─ vercel.app (Vercel Edge)
│ ├─ Frontend (Next.js)
│ ├─ API Routes (serverless functions)
│ └─ Middleware (auth, RLS)
│
├─ Database: PostgreSQL (Vercel Postgres / Neon)
├─ Cache: Redis (Upstash)
├─ Files: Vercel Blob
└─ External APIs (Stripe, Google, Microsoft, Resend, Cabinet SMTP)
```

---

## DIAGRAMMES UML {#uml}

### Use Cases par rôle

**220+ diagrammes UML disponibles dans `/documentation/Uml/`:**

- Cas d'utilisation (5 acteurs)
- Diagrammes d'activité (workflows)
- Diagrammes de collaboration (interactions)
- Diagrammes de séquence (détails)
- Modèle de classes (entités)
- Composants (architecture)
- Déploiement (infrastructure)

### Hiérarchie des rôles

```
SuperAdmin (1)
 └─ Gère configuration globale

Cabinet RH (N abonnements)
 ├─ Gestionnaire RH (collaborateurs)
 │ └─ Crée/valide fiches
 └─ Entreprise Cliente (clients)
 └─ Collaborateur (salariés)
```

---

## FLUX DE DONNÉES {#flux}

### Flux d'authentification

```
User → /auth/login
 ├─ Magic Link: email → token 15min → auto-login
 ├─ Password: email + password → JWT + RefreshToken
 └─ OAuth: Google/Microsoft → JWT + RefreshToken

JWT = 1h (memory)
RefreshToken = 24h (HttpOnly secure cookie)
Session timeout = 60min inactivité
```

### Flux de fiche de paie

```
1. BROUILLON (Gestionnaire crée)
 ├─ Import data Collaborateur
 ├─ Calcul ONSS/Précompte/Net
 └─ Génère PDF

2. VALIDATION (Entreprise valide)
 ├─ Vérification chiffres
 └─ Approuve OU rejette

3. VALIDÉE (Cabinet envoie)
 ├─ Via SMTP du Cabinet
 ├─ Email template personnalisé
 └─ Lien download (30 min + persistent login)

4. ENVOYÉE (Collaborateur reçoit)
 └─ Peut télécharger/afficher

5. ARCHIVÉE (après 30j)
 └─ Rétention 5 ans (légal Belgique)
```

### Flux d'invitations

```
Invitation Token (one-time, 7 jours):
 ├─ Email invite
 ├─ Lien: /invitations/accept?token=XXX&email=YYY
 ├─ Formulaire inscription
 ├─ Crée User + Gestionnaire/Entreprise/Collaborateur
 └─ Auto-login

Token hashing (SHA-256) + Redis cache + DB storage
```

---

## API REST ENDPOINTS {#api}

### AUTHENTIFICATION

```
POST /auth/register
 Request: { email, password, firstName, lastName, ... }
 Response: { user, accessToken, refreshToken }
 Errors: 400 (validation), 409 (duplicate email)

POST /auth/login
 Request: { email, password }
 Response: { user, accessToken, refreshToken }
 Errors: 401 (invalid), 429 (rate limit)

POST /auth/magic-link
 Request: { email }
 Response: { message }
 Errors: 404 (user not found)

POST /auth/logout
 Response: { message }
 Errors: 401 (unauthorized)

POST /auth/refresh
 Request: { refreshToken }
 Response: { accessToken }
 Errors: 401 (token expired/invalid)
```

### CABINET RH

```
GET /api/cabinet
 Response: { id, name, plan, usage, ... }
 Auth: Cabinet RH

POST /api/cabinet/gestionnaires/invite
 Request: { email, firstName, lastName, specialite }
 Response: { invitation }
 Auth: Cabinet Admin
 Errors: 400 (invalid), 409 (duplicate)

GET /api/cabinet/gestionnaires
 Response: { gestionnaires[] }
 Auth: Cabinet Admin

POST /api/cabinet/gestionnaires/{id}/assign
 Request: { entreprisesIds[] }
 Response: { gestionnaire }
 Auth: Cabinet Admin

GET /api/cabinet/entreprises
 Response: { entreprises[] }
 Auth: Cabinet Admin

POST /api/cabinet/entreprises
 Request: { name, vatNumber, address, email }
 Response: { entreprise }
 Auth: Cabinet Admin
 Errors: 409 (duplicate VAT)

PUT /api/cabinet/settings/smtp
 Request: { host, port, user, password, fromName, fromEmail }
 Response: { testResult }
 Auth: Cabinet Admin
```

### GESTIONNAIRE RH

```
GET /api/gestionnaire/entreprises
 Response: { entreprises[] } (assignées SEULEMENT)
 Auth: Gestionnaire
 Isolation: WHERE gestionnaire.id IN (jwt.gestionnairesIds)

GET /api/gestionnaire/entreprises/{id}/collaborateurs
 Response: { collaborateurs[] }
 Auth: Gestionnaire (must be assigned)

POST /api/gestionnaire/fiches
 Request: { collaborateurId, mois, annee, ... }
 Response: { fiche }
 Auth: Gestionnaire
 Calc: ONSS, précompte, net (backend)

PUT /api/gestionnaire/fiches/{id}/validate
 Response: { fiche (statut: VALIDATION) }
 Auth: Gestionnaire
```

### ENTREPRISE CLIENTE

```
GET /api/entreprise
 Response: { id, name, collaborateurs[], fiches[] }
 Auth: Entreprise Admin

GET /api/entreprise/collaborateurs
 Response: { collaborateurs[] }
 Auth: Entreprise Admin

POST /api/entreprise/collaborateurs/invite
 Request: { email, firstName, lastName }
 Response: { invitation }
 Auth: Entreprise Admin

PUT /api/fiches/{id}/validate
 Request: { decision: "approve"|"reject" }
 Response: { fiche (statut: VALIDÉE ou BROUILLON) }
 Auth: Entreprise Admin
```

### COLLABORATEUR

```
GET /api/fiches/my-fiches
 Response: { fiches[] (ENVOYÉE, ARCHIVÉE only) }
 Auth: Collaborateur
 Isolation: WHERE collaborateur.id = jwt.collaborateurId

GET /api/fiches/{id}
 Response: { fiche (PDF, HTML) }
 Auth: Collaborateur OU public link (30 min token)

GET /api/fiches/{id}/download
 Response: PDF file
 Auth: Collaborateur OU public link
```

### INVITATIONS

```
GET /invitations/accept
 Params: { token, email }
 Response: HTML form

POST /invitations/accept
 Request: { token, email, firstName, lastName, password, oauthMethod }
 Response: { user, accessToken }
 Errors: 400 (invalid token), 409 (already used)
```

### SUPERADMIN

```
GET /api/admin/cabinets
 Response: { cabinets[] }
 Auth: SuperAdmin
 Filters: status (active/suspended), plan

GET /api/admin/cabinets/{id}
 Response: { cabinet details, usage stats }
 Auth: SuperAdmin

POST /api/admin/cabinets/{id}/suspend
 Request: { reason }
 Response: { cabinet (status: suspended) }
 Auth: SuperAdmin

POST /api/admin/cabinets/{id}/reactivate
 Response: { cabinet (status: active) }
 Auth: SuperAdmin

GET /api/admin/users
 Response: { users[] (all cabinets) }
 Auth: SuperAdmin
 Filters: role, status, cabinetId

POST /api/admin/users/{id}/reset-password
 Request: (empty)
 Response: { message, resetLink }
 Auth: SuperAdmin
 Effect: Send email with password reset (1h TTL)

POST /api/admin/users/{id}/suspend
 Response: { user (status: suspended) }
 Auth: SuperAdmin
 Effect: JWT rejected immediately

POST /api/admin/users/{id}/force-2fa
 Response: { user }
 Auth: SuperAdmin
 Effect: User must configure 2FA at next login

POST /api/admin/users/{id}/revoke-sessions
 Response: { message }
 Auth: SuperAdmin
 Effect: All refresh tokens invalidated, user logged out

DELETE /api/admin/users/{id}
 Response: { user (deleted_at: now) }
 Auth: SuperAdmin
 Effect: Soft-delete, anonymize email

GET /api/admin/audit-logs
 Response: { logs[] }
 Auth: SuperAdmin
 Filters: action, userId, resource, dateRange

GET /api/admin/monitoring
 Response: { uptime, performance, errors }
 Auth: SuperAdmin
```

### WEBHOOKS

```
POST /api/webhooks/stripe
 Header: stripe-signature (verification)
 Body: Stripe event
 Events handled:
   - checkout.session.completed (create subscription)
   - subscription.updated (update plan/usage)
   - subscription.deleted (deactivate cabinet)
   - invoice.paid (log payment)
   - invoice.payment_failed (alert)
 Response: { received: true }

POST /api/webhooks/invitations
 Header: x-invitation-token (verification)
 Body: Invitation event (optional callback)
 Events: accept, reject, expire
 Response: { received: true }
```

### BULK OPERATIONS

```
POST /api/gestionnaire/collaborateurs/import
 Request: CSV file (firstName, lastName, niss, email)
 Response: { imported: 45, skipped: 2, errors: [] }
 Auth: Gestionnaire
 Validation: NISS format, duplicate emails

POST /api/gestionnaire/fiches/bulk-generate
 Request: { collaborateurIds[], mois, annee, variables[] }
 Response: { jobId, status: "queued" }
 Auth: Gestionnaire
 Background: BullMQ job, send email when done

GET /api/gestionnaire/jobs/{jobId}
 Response: { status, progress, result }
 Auth: Gestionnaire
```

### DELETE ENDPOINTS

```
DELETE /api/cabinet/gestionnaires/{id}
 Response: { message }
 Auth: Cabinet Admin
 Effect: Soft-delete gestionnaire

DELETE /api/cabinet/entreprises/{id}
 Response: { message }
 Auth: Cabinet Admin
 Effect: Soft-delete entreprise (keep fiches)

DELETE /api/entreprise/collaborateurs/{id}
 Response: { message }
 Auth: Entreprise Admin
 Effect: Soft-delete collaborateur

DELETE /api/fiches/{id}
 Response: { message }
 Auth: Gestionnaire or Entreprise Admin (owns fiche)
 Effect: Soft-delete fiche
```

### PATCH ENDPOINTS

```
PATCH /api/cabinet/gestionnaires/{id}
 Request: { firstName?, lastName?, specialite? }
 Response: { gestionnaire }
 Auth: Cabinet Admin

PATCH /api/cabinet/entreprises/{id}
 Request: { name?, address?, email? }
 Response: { entreprise }
 Auth: Cabinet Admin

PATCH /api/entreprise/collaborateurs/{id}
 Request: { firstName?, lastName?, email? }
 Response: { collaborateur }
 Auth: Entreprise Admin

PATCH /api/fiches/{id}
 Request: { salaireBrut?, autres_variables? }
 Response: { fiche (recalculated) }
 Auth: Gestionnaire (only BROUILLON state)
```

### ERROR CODES

```
200 OK
201 Created
204 No Content

400 Bad Request (validation error)
401 Unauthorized (missing JWT)
403 Forbidden (insufficient permissions)
404 Not Found
409 Conflict (duplicate, already exists)
422 Unprocessable Entity (invalid data)
429 Too Many Requests (rate limit)

500 Internal Server Error
503 Service Unavailable
```

---

## DATABASE SCHEMA {#database}

### Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ SOCIALFLOW DATABASE SCHEMA (Multi-tenant Architecture)          │
└─────────────────────────────────────────────────────────────────┘

                           USER (Core)
                               │
                ┌──────────────┼──────────────┐
                │              │              │
         OAuthProvider   PasswordReset  TwoFactorSecret
                │              │              │
                └──────────────┴──────────────┘
                               │
                               │ (user_id)
                               │
                           CABINET
                           (cabinetId)
                        │      │      │
            ┌───────────┼──────┼──────┼───────────┐
            │           │      │      │           │
        Gestionnaire  Entreprise  Subscription  EmailTemplate
            │           │
            │           ├─ Collaborateur (1:N)
            │           │      │
            │           │      └─ FichePaie (1:N)
            │           │             │
            │           │      ┌──────┼──────┐
            │           │      │      │      │
            │           │      │   Contrat  Logs
            │           │      │
            │    GestionnaireEntreprise (N:M junction)
            │           │
            └───────────┴─ (assignment)
                        │
                   Entreprise
                        │
                ┌───────┼───────┐
                │       │       │
           Collaborateur FichePaie Contrat


ISOLATION:
  Cabinet A ≠ Cabinet B (filtered on cabinetId)
  Gestionnaire sees only assigned Entreprises (GestionnaireEntreprise)
  Collaborateur sees only own FichePaie (collaborateurId)

SOFT-DELETE:
  All models include deletedAt DateTime? field
  Queries: WHERE deletedAt IS NULL
  Archival: 30 days to 5 years retention
```

### Modèles (Prisma)

**CORRECTION OPUS:** Relations N:M via junction tables

```
User
├─ OAuthProvider[]
├─ PasswordReset[]
├─ TwoFactorSecret[]
└─ AuditLog[]

Cabinet
├─ User[] (users du Cabinet)
├─ Gestionnaire[]
├─ Entreprise[]
└─ EmailTemplate[]

Gestionnaire
├─ GestionnaireEntreprise[] (N:M, pas JSON array)
└─ deletedAt DateTime? (soft-delete)

Entreprise
├─ GestionnaireEntreprise[] (N:M)
├─ Collaborateur[]
├─ FichePaie[]
├─ Contrat[]
└─ deletedAt DateTime? (soft-delete)

Collaborateur
├─ FichePaie[]
├─ Contrat[]
└─ deletedAt DateTime? (soft-delete)

FichePaie
└─ deletedAt DateTime? (soft-delete)

GestionnaireEntreprise (junction table)
├─ gestionnaireId
├─ entrepriseId
└─ @@unique([gestionnaireId, entrepriseId])
```

### Index critiques

```
User(email) — unique, auth
User(cabinetId) — multi-tenant isolation
Gestionnaire(userId) — unique
Gestionnaire(cabinetId) — cabinet queries
Entreprise(cabinetId) — cabinet queries
Entreprise(vatNumber) — validation
Collaborateur(entrepriseId) — query entreprise employees
Collaborateur(niss) — unique dans entreprise
FichePaie(collaborateurId, mois, annee) — unique, archive queries
FichePaie(statut) — workflow queries

RLS PostgreSQL:
 ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES
 TO authenticated, service_role;
```

---

## SÉCURITÉ & ISOLATION {#securite}

### Multi-tenant isolation

```
Cabinet A ≠ Cabinet B (strictement isolées)

JWT contains:
 ├─ userId
 ├─ role
 ├─ cabinetId
 ├─ gestionnairesIds (si Gestionnaire)
 └─ entrepriseId (si Entreprise/Collaborateur)

Middleware check EVERY request:
 WHERE cabinetId = jwt.cabinetId
 AND (role-specific permissions)

RLS PostgreSQL (defense-in-depth):
 SELECT * FROM fiches
 WHERE entreprise.cabinetId = current_user_cabinet_id
```

### Password & encryption

```
Password:
 ├─ Min 12 chars
 ├─ Maj + min + chiffre + spécial
 ├─ Hash: bcrypt (rounds=12)
 └─ Never stored plain text

SMTP password:
 ├─ AES-256-GCM
 ├─ Key = ENV['SMTP_KEY']
 └─ Rotation policy: TBD

JWT secret:
 ├─ Min 256 bits
 ├─ Rotation: TBD
 └─ Stored: ENV['JWT_SECRET']
```

### Token management

```
Access Token (JWT):
 ├─ TTL: 1 heure
 ├─ Storage: Memory (NOT localStorage)
 ├─ Revocation: NA (TTL-based)

Refresh Token:
 ├─ TTL: 24 heures
 ├─ Storage: HttpOnly secure cookie
 ├─ Single-use: rotation on each use
 ├─ Revocation: Redis blacklist (optional, for manual logout)
 └─ Logout everywhere: revoke all refresh tokens

Invitation Token:
 ├─ TTL: 7 jours
 ├─ One-time use: mark accepted
 ├─ Hash: SHA-256 (in DB)
 └─ Storage: Redis cache + DB
```

### Audit & compliance

```
Audit log:
 ├─ What: action (CREATE_USER, FICHE_SENT, etc.)
 ├─ Who: userId
 ├─ When: timestamp
 ├─ Where: resource type + id
 ├─ How: method (POST, PUT, etc.)
 └─ Why: metadata (optional)

Retention:
 ├─ Active logs: 3 ans
 ├─ Archived logs: 1 an
 └─ User deletion: anonymize (email → "DELETED_USER_XXX")

RGPD:
 ├─ Right to be forgotten: soft-delete + anonymize
 ├─ Data export: export all user data
 └─ Data portability: format JSON
```

---

## DÉPLOIEMENT VERCEL {#deploiement}

### Environment variables

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
STRIPE_SECRET=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
RESEND_API_KEY=...
BETTER_AUTH_SECRET=... (min 256 bits)
SMTP_KEY=... (for AES encryption)
```

### CI/CD (GitHub Actions)

```
On push to main:
 1. Lint (eslint, prettier)
 2. Type check (tsc)
 3. Tests (vitest, e2e)
 4. Build (next build)
 5. Deploy Vercel (auto)
```

### Monitoring

```
Vercel Analytics:
 ├─ Web Vitals (CLS, FID, LCP)
 └─ Performance insights

Sentry (errors):
 ├─ Exceptions
 ├─ Performance
 └─ Sessions

Upstash Redis:
 ├─ Latency
 └─ Rate limits
```

---

**Voir `SPEC_FINAL.md` pour workflows détaillés et `_uml/` pour diagrammes complets.**

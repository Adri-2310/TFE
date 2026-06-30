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
│  ├─ Frontend (Next.js)
│  ├─ API Routes (serverless functions)
│  └─ Middleware (auth, RLS)
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
  │  └─ Crée/valide fiches
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

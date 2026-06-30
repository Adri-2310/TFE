# 🎯 SPEC DE CLARIFICATION FINALE v2 — SocialFlow

**Document de référence unique pour implémentation**  
**Date:** 2026-06-30  
**Status:** FINAL (Cabinet RH = outil interne de paie)

---

## 🎯 CLARIFICATION FONDAMENTALE

**SocialFlow = outil de BACK-OFFICE pour Cabinet RH**

- Cabinet RH s'abonne à SocialFlow
- Cabinet RH customise: SMTP, templates, branding
- Cabinet RH importe ses clients (CSV dossiers clients)
- Cabinet RH génère fiches de paie
- Cabinet RH **envoie fiches EN SON NOM** via son SMTP
- **Pas de portail public** (pas de login Entreprise/Collaborateur dans SocialFlow)

---

## 🏗️ MODÈLE DE DOMAINE FINAL

```
┌─ SocialFlow (Plateforme SaaS)
│
├─ SuperAdmin (1)
│  └─ Gère: config Stripe, monitoring plateforme
│
└─ Cabinet RH (N abonnements)
   ├─ Customise: SMTP, templates, branding
   ├─ Importe: dossiers clients (CSV)
   ├─ Crée: Gestionnaires internes (invite par email + token 7j)
   │
   └─ Gestionnaire RH (M par Cabinet)
      ├─ Login: Magic Link + Password + OAuth
      ├─ Gère: dossiers assignés
      ├─ Génère: fiches de paie
      └─ Valide: fiches avant envoi Cabinet
```

**Utilisateurs SocialFlow = Cabinet RH + Gestionnaires RH**  
**Données externes = Dossiers clients (import CSV, pas de login)**

---

## 🔐 AUTHENTIFICATION — 3 MÉTHODES

### **Cabinet RH (AdminSecrétariat)**

**Inscription (first time):**
```
POST /auth/register
  email, password, firstName, lastName
  → Cabinet data (name, VAT, address)
  → Plan Stripe (Starter/Pro/Enterprise)
  → Stripe Checkout
  → Webhook: créer Cabinet + User (CABINET_RH, is_main_admin=true) + SMTP default
```

**Login:**
```
POST /auth/login
  email
  → Magic Link (15 min)
     OR
  email + password → JWT
     OR
  OAuth (Google/Microsoft)
```

### **Gestionnaire RH**

**Invitation (par Cabinet):**
```
Cabinet → POST /api/gestionnaires/invite
  email, firstName, lastName
  → Générer token invite (7j)
  → Email: "Rejoins [Cabinet] sur SocialFlow"
  → Lien: /invitations/accept?token=XXX

Gestionnaire → /invitations/accept
  → Formulaire: firstName, lastName, password, OAuth (opt)
  → Créer User (GESTIONNAIRE_RH)
  → Auto-login
```

**Login (next times):**
```
Magic Link + Password + OAuth (identique Cabinet)
```

### **Tokens & Sessions**

```
ACCESS TOKEN (JWT):
  Duration: 1 heure
  Payload: sub, email, role, cabinetId, dossiersAssignes (array)
  Storage: Memory (NOT localStorage)

REFRESH TOKEN (HttpOnly Secure Cookie):
  Duration: 24 heures
  Rotation: automatic

INVITATION TOKEN:
  Format: 64 bytes crypto-random base64
  TTL: 7 jours
  One-time-use: après acceptation, invalide

SESSION:
  Timeout inactivité: 60 min
  Logout everywhere: revoke refresh token
```

---

## 🚀 DÉPLOIEMENT — VERCEL

```
Frontend:
  - Next.js App Router
  - Vercel hosting
  - Vercel Blob (images, logos)

Backend:
  - Next.js API Routes
  - Better Auth (3 methods)

Data:
  - PostgreSQL (Vercel Postgres OU Neon)
  - Redis (Upstash)
  - Vercel KV (sessions)

External:
  - Stripe (checkout + webhooks)
  - Resend (email invites)
  - Google/Microsoft OAuth
  - Cabinet SMTP (envoi fiches)
```

---

## 📊 SCHÉMA PRISMA — FINAL

```prisma
// ===== AUTH =====
model User {
  id          String  @id @default(cuid())
  email       String  @unique
  firstName   String
  lastName    String
  role        UserRole
  
  cabinetId   String
  cabinet     Cabinet @relation(fields: [cabinetId], references: [id])
  
  isActive    Boolean @default(true)
  createdAt   DateTime @default(now())
  
  gestionnaire Gestionnaire?
  providers   OAuthProvider[]
  auditLogs   AuditLog[]
  
  @@index([cabinetId])
}

enum UserRole {
  SUPER_ADMIN
  CABINET_RH
  GESTIONNAIRE_RH
}

model OAuthProvider {
  id          String @id @default(cuid())
  userId      String
  user        User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  provider    String
  providerUserId String?
  accessToken String? @db.Text
  refreshToken String? @db.Text
  expiresAt   DateTime?
  
  @@unique([userId, provider])
}

// ===== CABINET RH =====
model Cabinet {
  id                    String @id @default(cuid())
  name                  String
  vatNumber             String @unique
  address               String
  city                  String
  zipCode               String
  email                 String
  phone                 String?
  
  stripeCustomerId      String? @unique
  stripeSubscriptionId  String?
  plan                  Plan @default(STARTER)
  status                CabinetStatus @default(ACTIVE)
  
  users                 User[]
  gestionnaires         Gestionnaire[]
  dossiers              DossierClient[]
  templates             EmailTemplate[]
  customization         CabinetCustomization?
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([status])
}

enum Plan {
  STARTER      // 25 dossiers, 5 gestionnaires, 10GB, 99€/mois
  PRO          // 100 dossiers, 15 gestionnaires, 50GB, 299€/mois
  ENTERPRISE   // Illimité, custom
}

enum CabinetStatus {
  ACTIVE
  SUSPENDED
  CANCELED
}

// ===== GESTIONNAIRE RH (utilisateur interne Cabinet) =====
model Gestionnaire {
  id          String  @id @default(cuid())
  userId      String  @unique
  user        User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  cabinetId   String
  cabinet     Cabinet @relation(fields: [cabinetId], references: [id], onDelete: Cascade)
  
  specialite  String?
  dossiersId  String[] // Array de DossierClient IDs assignés
  
  createdAt   DateTime @default(now())
  
  @@unique([userId, cabinetId])
}

// ===== DOSSIER CLIENT (données importées, pas d'utilisateur) =====
model DossierClient {
  id          String  @id @default(cuid())
  name        String
  vatNumber   String
  address     String
  city        String
  zipCode     String
  email       String  // pour envoi fiches
  phone       String?
  
  cabinetId   String
  cabinet     Cabinet @relation(fields: [cabinetId], references: [id], onDelete: Cascade)
  
  gestionnairesId String[] // Array assignés
  
  employes    Employe[]
  fiches      FichePaie[]
  contrats    Contrat[]
  
  createdAt   DateTime @default(now())
  
  @@unique([cabinetId, vatNumber])
}

// ===== EMPLOYE (données salarié, PAS de login) =====
model Employe {
  id          String  @id @default(cuid())
  dossierId   String
  dossier     DossierClient @relation(fields: [dossierId], references: [id], onDelete: Cascade)
  
  firstName   String
  lastName    String
  niss        String  // 11 chiffres belgique
  email       String
  phone       String?
  
  dateEmbauche DateTime
  dateFin     DateTime?
  typeContrat String
  salaireBase Decimal @db.Decimal(10, 2)
  
  fiches      FichePaie[]
  contrat     Contrat?
  
  @@unique([dossierId, niss])
}

// ===== CONTRAT DE TRAVAIL =====
model Contrat {
  id          String  @id @default(cuid())
  employeId   String  @unique
  employe     Employe @relation(fields: [employeId], references: [id], onDelete: Cascade)
  
  dossierId   String
  dossier     DossierClient @relation(fields: [dossierId], references: [id])
  
  type        String
  dateDebut   DateTime
  dateFin     DateTime?
  salaireBase Decimal @db.Decimal(10, 2)
  template    String? @db.Text // HTML contrat personnalisé
  
  createdAt   DateTime @default(now())
}

// ===== FICHES DE PAIE =====
model FichePaie {
  id          String  @id @default(cuid())
  employeId   String
  employe     Employe @relation(fields: [employeId], references: [id], onDelete: Cascade)
  
  dossierId   String
  dossier     DossierClient @relation(fields: [dossierId], references: [id])
  
  mois        Int
  annee       Int
  
  statut      FichePaieStatus @default(BROUILLON)
  
  // CALCULS BELGIQUE
  salaireeBrut Decimal @db.Decimal(10, 2)
  onss        Decimal @db.Decimal(10, 2)      // 13.07%
  precompte   Decimal @db.Decimal(10, 2)      // barème progressif
  chargesPatronales Decimal @db.Decimal(10, 2) // 42%
  salaireNet  Decimal @db.Decimal(10, 2)
  
  pdfUrl      String? // Vercel Blob
  createdBy   String? // user_id
  validatedBy String? // user_id
  
  createdAt   DateTime @default(now())
  
  @@unique([employeId, mois, annee])
  @@index([statut])
}

enum FichePaieStatus {
  BROUILLON    // Gestionnaire crée
  VALIDATION   // En validation
  VALIDÉE      // Cabinet approuve
  ENVOYÉE      // Envoyé au salarié
  ARCHIVÉE     // 5 ans rétention
}

// ===== CUSTOMISATION CABINET (SMTP + Branding) =====
model CabinetCustomization {
  id          String  @id @default(cuid())
  cabinetId   String  @unique
  cabinet     Cabinet @relation(fields: [cabinetId], references: [id], onDelete: Cascade)
  
  // SMTP (Cabinet envoie fiches EN SON NOM)
  smtpHost    String?
  smtpPort    Int?    @default(587)
  smtpUser    String?
  smtpPassword String? // CHIFFRÉ
  smtpFromName String?
  smtpFromEmail String?
  
  // Branding
  logoUrl     String?
  colorPrimary String?
  
  updatedAt   DateTime @updatedAt
}

// ===== EMAIL TEMPLATES =====
model EmailTemplate {
  id          String  @id @default(cuid())
  cabinetId   String
  cabinet     Cabinet @relation(fields: [cabinetId], references: [id], onDelete: Cascade)
  
  type        String
  name        String
  subject     String
  body        String  @db.Text // HTML
  variables   String[]
  
  @@unique([cabinetId, type])
}

// ===== AUDIT LOG =====
model AuditLog {
  id          String  @id @default(cuid())
  userId      String
  user        User    @relation(fields: [userId], references: [id])
  
  action      String
  resourceType String
  resourceId  String?
  cabinetId   String?
  metadata    Json?
  
  createdAt   DateTime @default(now())
  
  @@index([cabinetId])
}
```

---

## 🔄 WORKFLOWS CRITIQUES

### **Workflow 1: Onboarding Cabinet (Stripe)**

```
POST /auth/register
  → Validation email/VAT unique
  → Créer TempRegistration (PENDING, 24h TTL)
  → Stripe Checkout session
  
Utilisateur paie
  → Webhook: checkout.session.completed
    → Créer Cabinet + User (CABINET_RH, is_main_admin=true)
    → Créer CabinetCustomization (SMTP defaults + branding defaults)
    → Créer templates par défaut
    → Audit log: CABINET_CREATED
  → Email bienvenue
```

### **Workflow 2: Cycle Fiche de Paie**

```
1. BROUILLON (Gestionnaire)
   - Récupère données Employe
   - Saisit: salaire, congés, primes
   - Calcule: ONSS 13.07% + précompte belge + charges 42%
   - Génère PDF
   → Statut: BROUILLON

2. VALIDATION (Gestionnaire valide)
   - Revoit les chiffres
   - Click "Valider"
   → Statut: VALIDÉE

3. ENVOYÉE (Cabinet envoie)
   - Click "Envoyer salarié"
   - Utilise SMTP customizé du Cabinet
   - Envoie via EmailTemplate "fiche_paie"
   → Statut: ENVOYÉE

4. ARCHIVÉE (Système)
   - Après 30 jours ENVOYÉE → ARCHIVÉE
   - Rétention: 5 ans minimum (légal Belgique)
   - Après 5 ans: soft-delete
```

---

## ⏰ RÉTENTION LÉGALE BELGIQUE

**FIXÉ:** Toutes les fiches de paie = **5 ans minimum**

```
Fiches: 5 ans en DB, puis soft-delete
Contrats: 5 ans en DB, puis soft-delete
ONSS: 5 ans
Audit logs: 3 ans (actifs) + 1 an (archives)
Messages: 60 jours (soft-delete auto)
```

---

## 💰 PRICING STRIPE — SOURCE UNIQUE

```
STARTER: 99€/mois
  ├─ Dossiers clients: 25
  ├─ Gestionnaires: 5
  ├─ Stockage: 10 GB
  └─ Features: base

PRO: 299€/mois
  ├─ Dossiers clients: 100
  ├─ Gestionnaires: 15
  ├─ Stockage: 50 GB
  └─ Features: base + API webhooks

ENTERPRISE: Custom
  └─ Illimité + white-label
```

---

## 8️⃣ CUSTOMISATION CABINET (SMTP + Templates) {#custom}

### **Cabinet peut customiser:**

1. **SMTP (envoyer fiches EN SON NOM)**
   ```
   settings/smtp:
     - Host (ex: smtp.cabinet.be)
     - Port (587 TLS)
     - User (ex: paie@cabinet.be)
     - Password (chiffré AES-256 en DB)
     - From Name (ex: "Cabinet RH XYZ")
   
   → Fiches envoyées via ce SMTP au lieu de Resend
   ```

2. **Email Templates (personalisé par Cabinet)**
   ```
   settings/templates:
     - Sujet email (ex: "Votre fiche de paie - [mois]")
     - Corps HTML (personnalisable avec variables)
     - Variables possibles: {{employe_nom}}, {{mois}}, {{salary}}, etc.
   
   → Fiches de paie envoyées avec ce template
   ```

3. **Branding (logo + couleurs)**
   ```
   settings/branding:
     - Logo (upload Vercel Blob)
     - Couleur primaire (hex)
     - Utilisé dans emails + PDFs fiches
   ```

---

## ✅ CHECKLIST AVANT DEV

- [ ] Approuver cette SPEC (modèle = Cabinet interne)
- [ ] Schéma Prisma en code
- [ ] Configurer Vercel + PostgreSQL + Redis
- [ ] OAuth Google + Microsoft
- [ ] Stripe (3 plans, webhooks)
- [ ] Resend (emails invites)
- [ ] Better Auth (3 methods)
- [ ] RLS PostgreSQL + middleware
- [ ] Tests: Magic Link + Password + OAuth
- [ ] Webhook Stripe idempotent

---

**SOURCE UNIQUE DE VÉRITÉ** — pas de contradictions. Prêt à dev. ✅

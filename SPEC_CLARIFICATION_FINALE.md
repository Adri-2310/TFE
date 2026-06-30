# 🎯 SPEC DE CLARIFICATION FINALE — SocialFlow

**Document de référence unique pour implémentation**  
**Date:** 2026-06-30  
**Status:** APPROUVÉ (tranch tous les GAPs)

---

## 📋 TABLE DES MATIÈRES

1. [Modèle de domaine canonique](#domaine)
2. [Authentification 3 méthodes](#auth)
3. [Déploiement (Vercel vs Coolify)](#deploy)
4. [Schéma Prisma complet](#schema)
5. [Workflows critiques tranchés](#workflows)
6. [Rétention légale Belgique](#retention)
7. [Pricing Stripe unifié](#pricing)

---

## 🏗️ MODÈLE DE DOMAINE CANONIQUE {#domaine}

### **DÉCISION TRANCHÉE : Utilisez le vocabulaire RBAC**

```
┌─ SocialFlow (Plateforme)
│
├─ SuperAdmin (1)
│  └─ Gère : configuration globale, monitoring, webhooks Stripe
│
├─ Cabinet RH (N abonnements Stripe)
│  ├─ Propriétaire (is_main_admin)
│  ├─ Crée : Gestionnaires RH + Entreprises Clientes
│  ├─ Assigne : Entreprises aux Gestionnaires (1:N par Gestionnaire)
│  └─ Paie : abonnement Stripe + facturation
│
├─ Gestionnaire RH (M par Cabinet, assigné à K Entreprises)
│  ├─ Invité par : Cabinet RH (email + token 7 jours)
│  ├─ Gère SEULEMENT : ses Entreprises Clientes assignées
│  ├─ Crée/Édite : Collaborateurs dans ses Entreprises
│  └─ Génère/Valide : Fiches de paie de ses Entreprises
│
├─ Entreprise Cliente (Z par Cabinet, assignée à 1 Gestionnaire)
│  ├─ Invitée par : Cabinet RH OU Gestionnaire (email + token 7 jours)
│  ├─ Propriétaire : ses données (collaborateurs, paie)
│  ├─ Crée/Édite : ses Collaborateurs
│  └─ Valide/Approuve : ses Fiches de paie
│
└─ Collaborateur (salarié, N par Entreprise)
   ├─ Invité par : Entreprise Cliente OU Gestionnaire
   ├─ Voit : sa fiche de paie + documents personnels (RO)
   └─ Pas d'action : sur données
```

### **Règles strictes d'isolation multi-tenant**

```
Cabinet A ≠ Cabinet B :
  • Gestionnaire A ne voit PAS Entreprise B
  • Entreprise A ne voit PAS Entreprise B
  • Collaborateur A ne voit PAS Collaborateur B

Gestionnaire A assigné à Entreprise 1, 2, 3 :
  • Voit SEULEMENT 1, 2, 3 (pas 4, 5... autres du Cabinet)
  • Édite SEULEMENT 1, 2, 3

Implémentation :
  ✅ Base de données : RLS PostgreSQL + filtrage applicatif (défense en profondeur)
  ✅ Jamais : SELECT sans WHERE cabinetId = $1 ET (gestionnaire assigné OU user.role != GESTIONNAIRE)
  ✅ JWT contient : userId, role, cabinetId, gestionnaire_entreprise_ids (pour cache coté client)
```

### **Tableau de traçabilité : Ancien → Nouveau**

| Ancien (UML) | NOUVEAU (RBAC) | Rôle DB | Commentaire |
|---|---|---|---|
| Secrétariat | **Cabinet RH** | CABINET_RH | Propriétaire abonnement |
| AdminSecrétariat | Cabinet RH (is_main_admin) | CABINET_RH | Premier membre du cabinet |
| Consultant | **Gestionnaire RH** | GESTIONNAIRE_RH | Assigné à K entreprises |
| Client | **Entreprise Cliente** | ENTREPRISE_CLIENTE | Propriétaire données métier |
| Employé | **Collaborateur** | COLLABORATEUR | Salarié, accès RO |

**ACTION IMMÉDIATE:** Renommer tous les UC UML et maquettes avec ce vocabulaire.

---

## 🔐 AUTHENTIFICATION — 3 MÉTHODES {#auth}

### **Principe unifié**

Tous les rôles supportent 3 méthodes d'authentification:
1. **Magic Link** (email → token 15 min) — fluide, pas de MDP à mémoriser
2. **Password** (email + MDP bcrypt) — classique, pour les MDP existants
3. **OAuth 2.0** (Google + Microsoft) — sécurisé, fédéré

Un utilisateur peut lier PLUSIEURS providers sur un compte (email + Google + Microsoft).

### **Détail par rôle**

#### **Cabinet RH (AdminSecrétariat)**

**Inscription (premiere fois):**
```
POST /auth/register
  email, password, firstName, lastName
  → Cabinet RH data (name, VAT, address)
  → Choix plan Stripe (Starter/Pro/Enterprise)
  → Redirect Stripe Checkout
  → Webhook stripe/checkout.session.completed
    → Crée atomiquement: Cabinet + User (role=CABINET_RH, is_main_admin=true) + Provider
  → Email bienvenue (magic link auth OU password reset link)
```

**Login (next times):**
```
POST /auth/login
  email
  → Envoyer magic link (15 min TTL)
    OU
  email + password → vérifier bcrypt → créer session JWT
    OU
  "Continue with Google/Microsoft" → OAuth callback
```

**Password Reset:**
```
POST /auth/forgot-password
  email
  → Générer token reset (1h TTL, single-use)
  → Email avec lien /auth/reset-password?token=XXX
  → User saisit nouveau MDP
  → Hash + valider (min 12 car, maj/min/chiffre/spécial)
  → Invalidate all sessions (logout everywhere) si demandé
```

#### **Gestionnaire RH**

**Invitation (par Cabinet RH):**
```
Cabinet RH → POST /api/gestionnaires/invite
  email, firstName, lastName, spécialité (optional)
  → Générer invitation token (7j TTL)
  → Envoyer email: "Vous êtes invité à rejoindre [Cabinet]"
  → Lien: /invitations/accept?token=XXX&email=YYY
  
Gestionnaire clique lien → /invitations/accept
  → Formulaire : firstName, lastName, password, OAuth (optional)
  → POST /invitations/accept?token=XXX
    → Vérifier token valide + email match
    → Créer User (role=GESTIONNAIRE_RH, is_first_login=true)
    → Créer Provider (credential ou oauth)
    → Marquer invitation utilisée (status=accepted)
    → Email bienvenue
    → Auto-login OU redirect /auth/login
```

**Login (next times):**
```
Même que Cabinet RH (Magic link + Password + OAuth)
```

#### **Entreprise Cliente & Collaborateur**

**Workflow identique à Gestionnaire** (invitation token 7j, puis login par 3 méthodes).

---

### **Tokens & Sessions**

```
ACCESS TOKEN (JWT):
  - Duration: 1 heure
  - Payload: sub, email, role, cabinetId, gestionnaire_entreprise_ids (JSON array)
  - Storage: Memory (NOT localStorage)
  - Sent: Authorization: Bearer XXX

REFRESH TOKEN (HttpOnly Secure Cookie):
  - Duration: 24 heures
  - Rotation: automatic (new refresh token à chaque utilisation)
  - Single-use: après utilisation, old token invalide

SESSION (Redis + JWT):
  - Timeout inactivité: 60 minutes
  - Logout everywhere: 1 click (revoke refresh token)
  - Réassignation gestionnaire: revoke session (force re-login)

INVITATION TOKEN (Single-use):
  - Format: 64 bytes crypto-random base64
  - Storage: DB table invitations + Redis cache (TTL)
  - TTL: 7 jours (Cabinet invite) / 7 jours (Entreprise invite)
  - Hashing: SHA-256 en DB (pas en clair)
  - One-time-use: marquer accepted, invalide après
```

### **2FA (Optionnel, recommandé Cabinet RH)**

```
Cabinet RH peut activer 2FA (pas obligatoire pour MVP):
  - Email OTP (6 chiffres, 10 min TTL)
  - TOTP (Google Authenticator)
  - Backup codes (10 codes 8-chars, one-time use)
```

---

## 🚀 DÉPLOIEMENT {#deploy}

### **DÉCISION TRANCHÉE : Vercel**

**Choix:** Vercel (pas Coolify/auto-hébergé).

**Raisons:**
- Next.js natif sur Vercel
- Infrastructure simple pour MVP
- Pas d'ops burden (PostgreSQL managed possible)
- Scalabilité horizontale automatique

**Architecture Vercel:**

```
Frontend:
  - Next.js App Router (apps/web)
  - Vercel hosting
  - Edge Functions pour auth middleware
  - Vercel Blob Storage (images, documents)

Backend API:
  - Next.js API Routes (/api/*)
  - Vercel Serverless Functions
  - Better Auth (intégré)

Data Layer:
  - PostgreSQL (Vercel Postgres OU Neon)
  - Redis (Upstash)
  - Vercel KV (sessions cache)

External:
  - Stripe (checkout + webhooks)
  - Resend (email)
  - Google OAuth + Microsoft OAuth
  - MinIO OU Vercel Blob (fichiers volumineux)
```

**Environment variables:**
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
STRIPE_SECRET=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
RESEND_API_KEY=...
BETTER_AUTH_SECRET=... (min 256 bits)
```

**Déploiement:**
```
git push origin main
  → Vercel auto-build via webhook GitHub
  → Tests (lint, type-check)
  → Build Next.js
  → Deploy à production
  → SSL automatique (Let's Encrypt)
```

---

## 📊 SCHÉMA PRISMA COMPLET {#schema}

**Entités minimales pour MVP :**

```prisma
// ===== USERS & AUTH =====
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  firstName     String
  lastName      String
  role          UserRole  @default(COLLABORATEUR)
  
  // Relations
  cabinetId     String?
  cabinet       Cabinet?   @relation(fields: [cabinetId], references: [id])
  
  // Auth
  password      String?   // nullable (OAuth only users)
  isActive      Boolean   @default(true)
  isFirstLogin  Boolean   @default(false)
  
  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime? // soft-delete RGPD
  
  // Relations polymorphes
  gestionnaire  Gestionnaire?
  entreprise    Entreprise?
  collaborateur Collaborateur?
  
  providers     OAuthProvider[]
  invitations   Invitation[]
  auditLogs     AuditLog[]
  
  @@index([cabinetId])
  @@index([role])
}

enum UserRole {
  SUPER_ADMIN
  CABINET_RH
  GESTIONNAIRE_RH
  ENTREPRISE_CLIENTE
  COLLABORATEUR
}

model OAuthProvider {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  provider      String    // "google" | "microsoft" | "credential"
  providerUserId String?  // google_id, microsoft_id
  accessToken   String?   @db.Text
  refreshToken  String?   @db.Text
  expiresAt     DateTime?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@unique([userId, provider])
  @@index([provider])
}

// ===== CABINET RH (Abonnement) =====
model Cabinet {
  id            String    @id @default(cuid())
  name          String
  vatNumber     String    @unique
  address       String
  city          String
  zipCode       String
  email         String
  phone         String?
  
  // Stripe
  stripeCustomerId  String?   @unique
  stripeSubscriptionId String?
  plan          Plan      @default(STARTER)
  planUpdatedAt DateTime?
  
  // Status
  status        CabinetStatus @default(ACTIVE)
  canceledAt    DateTime?
  
  // Relations
  users         User[]
  gestionnaires Gestionnaire[]
  entreprises   Entreprise[]
  invitations   Invitation[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([status])
}

enum Plan {
  STARTER      // 25 entreprises, 5 gestionnaires, 10GB, 99€/mois
  PRO          // 100 entreprises, 15 gestionnaires, 50GB, 299€/mois
  ENTERPRISE   // Illimité, custom
}

enum CabinetStatus {
  ACTIVE
  SUSPENDED
  CANCELED
}

// ===== GESTIONNAIRE RH =====
model Gestionnaire {
  id            String    @id @default(cuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  cabinetId     String
  cabinet       Cabinet   @relation(fields: [cabinetId], references: [id], onDelete: Cascade)
  
  specialite    String?   // "Paie", "RH", "Général"
  
  // Relations N:N
  entreprises   Entreprise[]
  collaborateurs Collaborateur[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@unique([userId, cabinetId])
  @@index([cabinetId])
}

// ===== ENTREPRISE CLIENTE =====
model Entreprise {
  id            String    @id @default(cuid())
  name          String
  vatNumber     String
  address       String
  city          String
  zipCode       String
  email         String
  phone         String?
  
  // Propriétaire
  adminUserId   String?
  admin         User?     @relation(fields: [adminUserId], references: [id])
  
  // Cabinet + Gestionnaire
  cabinetId     String
  cabinet       Cabinet   @relation(fields: [cabinetId], references: [id], onDelete: Cascade)
  
  gestionnairesId String[] // Array de Gestionnaire IDs assignés
  gestionnaires Gestionnaire[] // Relation implicite
  
  // Relations
  collaborateurs Collaborateur[]
  fiches        FichePaie[]
  contrats      Contrat[]
  invitations   Invitation[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime? // soft-delete
  
  @@unique([cabinetId, vatNumber])
  @@index([cabinetId])
}

// ===== COLLABORATEUR (Employé) =====
model Collaborateur {
  id            String    @id @default(cuid())
  userId        String?   @unique // nullable si pas encore inscrit
  user          User?     @relation(fields: [userId], references: [id])
  
  entrepriseId  String
  entreprise    Entreprise @relation(fields: [entrepriseId], references: [id], onDelete: Cascade)
  
  firstName     String
  lastName      String
  niss          String    // 11 chiffres belgique
  email         String
  phone         String?
  
  dateEmbauche  DateTime
  dateFin       DateTime? // null si toujours actif
  
  // Contrat
  typeContrat   String    // "CDI", "CDD", "Stage"
  salaireBase   Decimal   @db.Decimal(10, 2)
  
  // Relations
  fiches        FichePaie[]
  contrat       Contrat?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime? // soft-delete
  
  @@unique([entrepriseId, niss])
  @@index([entrepriseId])
}

model Contrat {
  id            String    @id @default(cuid())
  collaborateurId String
  collaborateur Collaborateur @relation(fields: [collaborateurId], references: [id], onDelete: Cascade)
  
  entrepriseId  String
  entreprise    Entreprise @relation(fields: [entrepriseId], references: [id])
  
  type          String    // "CDI", "CDD", "Stage"
  dateDebut     DateTime
  dateFin       DateTime?
  salaireBase   Decimal   @db.Decimal(10, 2)
  
  contenuTemplate String?  @db.Text // HTML contrat
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([collaborateurId])
  @@index([entrepriseId])
}

// ===== FICHES DE PAIE =====
model FichePaie {
  id            String    @id @default(cuid())
  collaborateurId String
  collaborateur Collaborateur @relation(fields: [collaborateurId], references: [id], onDelete: Cascade)
  
  entrepriseId  String
  entreprise    Entreprise @relation(fields: [entrepriseId], references: [id])
  
  mois          Int       // 1-12
  annee         Int       // 2026
  
  // Statut workflow
  statut        FichePaieStatus @default(BROUILLON)
  
  // Calculs (BELGIUM)
  salaireeBrut  Decimal   @db.Decimal(10, 2)
  onss          Decimal   @db.Decimal(10, 2)     // 13.07%
  precompte     Decimal   @db.Decimal(10, 2)     // barème progressif
  chargesPatronales Decimal @db.Decimal(10, 2)   // 42%
  salaireNet    Decimal   @db.Decimal(10, 2)
  
  // Documents
  pdfUrl        String?   // Vercel Blob
  commentaires  String?   @db.Text
  
  createdBy     String?   // gestionnaire_id qui a créé
  validatedBy   String?   // entreprise_id qui a validé
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@unique([collaborateurId, mois, annee])
  @@index([entrepriseId])
  @@index([statut])
}

enum FichePaieStatus {
  BROUILLON    // Gestionnaire crée
  VALIDATION   // En attente validation Entreprise
  VALIDÉE      // Entreprise approuve
  ENVOYÉE      // Collaborateur reçoit
  ARCHIVÉE     // 5 ans, puis suppression
}

// ===== AUDIT LOG =====
model AuditLog {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  
  action        String    // "CREATE_USER", "UPDATE_FICHE", etc.
  resourceType  String    // "user", "entreprise", "fiche_paie"
  resourceId    String?   // ID de la ressource
  
  cabinetId     String?   // Isolation multi-tenant
  
  metadata      Json?     // {old: {}, new: {}}
  ipAddress     String?
  userAgent     String?   @db.Text
  
  createdAt     DateTime  @default(now())
  
  @@index([cabinetId])
  @@index([userId])
  @@index([createdAt])
}

// ===== INVITATIONS =====
model Invitation {
  id            String    @id @default(cuid())
  email         String
  token         String    @unique // SHA-256
  
  role          UserRole
  cabinetId     String
  cabinet       Cabinet   @relation(fields: [cabinetId], references: [id], onDelete: Cascade)
  
  entrepriseId  String?   // null si invite gestionnaire
  
  status        InvitationStatus @default(PENDING)
  createdBy     String
  createdAt     DateTime  @default(now())
  expiresAt     DateTime  // 7 jours
  acceptedAt    DateTime?
  
  @@index([email])
  @@index([cabinetId])
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  EXPIRED
  REJECTED
}

// ===== AUTRES (stub pour MVP) =====
model OnssDeclaration {
  id            String    @id @default(cuid())
  entrepriseId  String
  mois          Int
  annee         Int
  status        String    // "DRAFT", "SUBMITTED", "CONFIRMED"
  createdAt     DateTime  @default(now())
}

model Message {
  id            String    @id @default(cuid())
  fromId        String
  toId          String
  content       String    @db.Text
  createdAt     DateTime  @default(now())
  deletedAt     DateTime? // soft-delete après 60 jours
}
```

---

## 🔄 WORKFLOWS CRITIQUES TRANCHÉS {#workflows}

### **Workflow 1: Cycle de vie Fiche de Paie**

```
1. BROUILLON (Gestionnaire)
   - Gestionnaire récupère données Collaborateur
   - Saisit: salaire, congés, primes, déductions
   - Valide données
   - Calcule: ONSS 13.07% + précompte belge + charges 42%
   - Génère PDF
   - Click "Envoyer à validation"
   → Statut: VALIDATION

2. VALIDATION (Entreprise)
   - Entreprise reçoit notification
   - Revoit les chiffres
   - Click "Approuver" OU "Rejeter avec commentaire"
   → Statut: VALIDÉE (ou back to BROUILLON)

3. VALIDÉE (Gestionnaire)
   - Visible dans dashboard
   - Click "Envoyer au Collaborateur"
   → Statut: ENVOYÉE

4. ENVOYÉE (Collaborateur)
   - Email avec PDF
   - Token de 30 min pour télécharger
   - Collaborateur accède à son portail, voit fiche
   → Statut: ENVOYÉE (archived après 30 jours)

5. ARCHIVAGE (Système)
   - Après 30 jours ENVOYÉE, marquer ARCHIVÉE
   - Garder en BD **5 ans minimum** (Belgique légal)
   - Après 5 ans: soft-delete (deleted_at = date)
```

**Qui peut faire quoi:**
- Gestionnaire: créer, modifier avant VALIDATION
- Entreprise: voir, valider (pas modifier)
- Collaborateur: voir VALIDÉE+ENVOYÉE (RO)
- Cabinet: voir toutes (RO audit)

---

### **Workflow 2: Onboarding Cabinet (Stripe)**

```
1. POST /auth/register
   email, password, firstName, lastName,
   cabinetName, vatNumber, address,
   plan (STARTER|PRO|ENTERPRISE)

2. Validation
   - Email unique ?
   - VAT unique ?
   - Plan existant ?

3. Créer TempRegistration
   {
     email,
     cabinetData,
     selectedPlan,
     status: PENDING,
     expiresAt: NOW() + 24h
   }

4. Stripe Checkout
   POST /stripe/checkout
   → Vercel edge function
   → session = await stripe.checkout.sessions.create({
       customer_email: email,
       line_items: [{
         price: STRIPE_PRICE_ID[plan],
         quantity: 1
       }],
       success_url: /auth/success?session_id={CHECKOUT_SESSION_ID},
       cancel_url: /auth/register?cancelled=true,
       metadata: {
         tempRegistrationId,
         cabinetData: JSON.stringify()
       }
     })
   → redirect session.url (Stripe Checkout page)

5. Utilisateur paie

6. Webhook: stripe/checkout.session.completed
   POST /api/webhooks/stripe
   
   → Vérifier signature avec STRIPE_WEBHOOK_SECRET
   → Récupérer TempRegistration par session.metadata
   → [Alt] Si TempRegistration expiré:
       - Créer nouvelle session Stripe pour remarquer
       - Notifier support
       - Ne PAS créer de compte
   → Créer transaction ATOMIQUE:
       BEGIN;
         1. Créer Cabinet
            {
              name, vatNumber, address, email, phone,
              stripeCustomerId: session.customer,
              stripeSubscriptionId: subscription.id,
              plan,
              status: ACTIVE
            }
         2. Créer User
            {
              email,
              password: hashed,
              firstName, lastName,
              role: CABINET_RH,
              is_main_admin: true,
              cabinetId: (new cabinet)
            }
         3. Créer OAuthProvider
            {
              userId,
              provider: 'credential',
              passwordHash
            }
         4. Créer AuditLog
            {
              action: 'CABINET_CREATED',
              resourceType: 'cabinet',
              cabinetId
            }
       COMMIT;
   → Supprimer TempRegistration
   → Envoyer email bienvenue (magic link auth)

7. GET /auth/success?session_id=XXX
   - Afficher: "Cabinet créé! Vous pouvez maintenant vous connecter"
   - Lien vers login
```

---

### **Workflow 3: Invitation Gestionnaire**

```
Cabinet RH invites Gestionnaire:

1. POST /api/cabinet/gestionnaires/invite
   {
     email: "consultant@example.com",
     firstName, lastName,
     specialite: "Paie" | "RH" | "Général"
   }
   
2. Validation
   - Email unique dans DB ?
   - Cabinet a place (quota Gestionnaires) ?
   
3. Générer invitation
   token = crypto.randomBytes(32).toString('base64')
   hash = sha256(token)
   
   Invitation.create({
     email,
     token: hash,
     role: GESTIONNAIRE_RH,
     cabinetId,
     status: PENDING,
     expiresAt: NOW() + 7*24h
   })
   
4. Email invite
   Sujet: "Vous êtes invité à rejoindre [Cabinet]"
   Corps:
   ```
   Bonjour [firstName],
   
   [Cabinet] vous invite à rejoindre SocialFlow en tant que Gestionnaire.
   
   LIEN: https://socialflow.app/invitations/accept?token=[TOKEN]&email=[EMAIL]
   Valide pendant 7 jours.
   
   (Si cliquer ne fonctionne pas, copier le lien ci-dessus)
   ```

5. Gestionnaire clique lien
   → GET /invitations/accept?token=XXX&email=YYY
   
6. Frontend valide token & affiche formulaire:
   - firstName (pre-filled si dans email)
   - lastName
   - password (min 12 char, maj/min/chiffre/spécial)
   - ☐ Utiliser Google OAuth ? (link after creation)
   
7. POST /invitations/accept
   {
     token,
     email,
     firstName, lastName,
     password,
     oauthMethod: null | "google" | "microsoft"
   }
   
   Backend:
   → Vérifier token valide (exist, not expired, not used)
   → Vérifier email match
   → Créer User
      {
        email,
        firstName, lastName,
        role: GESTIONNAIRE_RH,
        is_first_login: false,
        cabinetId: (from invitation)
      }
   → Créer OAuthProvider (credential OU oauth)
   → Marquer Invitation.status = ACCEPTED
   → Créer AuditLog
   → Email bienvenue
   → Auto-login OU redirect /auth/login

8. Gestionnaire is_first_login:
   - Force change password on first login
   - Setup 2FA (optional but encouraged)
```

---

## ⏰ RÉTENTION LÉGALE BELGIQUE {#retention}

**DÉCISION TRANCHÉE:** Tous les documents sociaux = **5 ans minimum**

```
Fiches de paie:
  - Statut: ENVOYÉE → ARCHIVÉE (30 jours après envoi)
  - Rétention: 5 ans dans la BD
  - Après 5 ans: soft-delete (deleted_at = date)
  - Logs associés: conservés indéfiniment (anonymisés)

Contrats de travail:
  - Rétention: 5 ans minimum
  - Après 5 ans: archivage (soft-delete)

Déclarations ONSS/DIMONA:
  - Rétention: 5 ans minimum

Certificats C4:
  - Rétention: 5 ans minimum

Audit logs:
  - Rétention: 3 ans (logs actifs) + 1 an archivés
  - Après suppression utilisateur: anonymiser (remplacer email par "DELETED_USER_XXXX")

Messages:
  - Rétention: 60 jours
  - Après 60 jours: soft-delete automatique

RGPD Droit à l'oubli:
  - Utilisateur demande suppression → 30 jours de réflexion (RGPD)
  - Après 30 jours: soft-delete + anonymisation
  - Documents liés: conservés legalement (5 ans) mais non-liés au user
```

---

## 💰 PRICING STRIPE UNIFIÉ {#pricing}

**SOURCE UNIQUE DE VÉRITÉ:**

```
PLANS:

┌─ STARTER: 99€/mois
│  ├─ Entreprises Clientes: 25
│  ├─ Gestionnaires RH: 5
│  ├─ Collaborateurs: illimité
│  ├─ Stockage: 10 GB
│  └─ Features: base (fiches, portals, templates)
│
├─ PRO: 299€/mois
│  ├─ Entreprises Clientes: 100
│  ├─ Gestionnaires RH: 15
│  ├─ Collaborateurs: illimité
│  ├─ Stockage: 50 GB
│  └─ Features: base + API webhooks
│
└─ ENTERPRISE: Custom
   ├─ Illimité
   └─ Features: tout + white-label + SSO

QUOTA ENFORCEMENT:

- Starter a 25 entreprises, crée 26ème:
  ✅ SOFT: Warning email + notification dashboard
     "Limite atteinte. Upgrade vers Pro pour ajouter +75 entreprises"
     Fiche est créée mais flag warning=true
  
- Starter a 24/25 entreprises (96%):
  ✅ Pro-active email à Cabinet: "Vous utilisez 96% de votre limite"

- Pro a 100 entreprises, downgrade à Starter (25):
  ✅ GRACE PERIOD: 30 jours avant blocage
  ✅ Entreprises 26-100 marquées archived
  ✅ Données conservées mais inaccessibles
  ✅ Après 30j: blocage total OU auto-upgrade suggestion
```

---

## 🎯 ACTIONS PRIORITAIRES AVANT DEV

**Semaine 1:**

1. ✅ Approuver cette SPEC (valide chaque section)
2. ✅ Mettre à jour tous les UC UML avec nouveau vocabulaire (Gestionnaire, Entreprise, etc.)
3. ✅ Rebranding maquettes (Cabinet RH, Gestionnaire dans les titres/labels)
4. ✅ Créer schéma Prisma (copier du doc ci-dessus)
5. ✅ Configurer Vercel + Stripe + OAuth providers

**Semaine 2:**

6. ✅ Implémenter Better Auth (3 méthodes)
7. ✅ Webhook Stripe checkout
8. ✅ RLS PostgreSQL + middleware isolation
9. ✅ Tests auth (magic link, password, OAuth)

**Alors seulement:** DB + portails + métier

---

**VALIDATION:**
- [ ] Approuvé par Client
- [ ] Approuvé par Dev Team
- [ ] Alignement avec tous les UC UML
- [ ] Schéma Prisma in code

**Document version:** 1.0 — Finale (tranche tous les GAPs critiques)

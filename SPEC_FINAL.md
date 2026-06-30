# 🎯 SPEC FINAL — SocialFlow (Source Unique)

**Compris une bonne fois pour toutes**  
**Date:** 2026-06-30

---

## 🏗️ ARCHITECTURE COMPLETE & FINALE

```
PLATEFORME SOCIALFLOW

┌─ SuperAdmin (1) — Gère la CONFIGURATION GLOBALE de SocialFlow
│  │
│  ├─ STRIPE (Configuration):
│  │  ├─ Crée les plans (Starter/Pro/Enterprise)
│  │  ├─ Fixe les prix (99€/299€/custom)
│  │  ├─ Configure webhook Stripe
│  │  └─ Voit: tous les Cabinets, abonnements, factures globales
│  │
│  ├─ EMAIL GLOBAL (Configuration):
│  │  ├─ SMTP par défaut: Resend (pour invites, alerts système)
│  │  └─ Templates globaux: SocialFlow (invites Gestionnaire, etc.)
│  │
│  ├─ BRANDING GLOBAL (Configuration):
│  │  ├─ Logo SocialFlow (utilisé par défaut si Cabinet ne customise pas)
│  │  ├─ Couleurs SocialFlow (violet, teal - utilisées par défaut)
│  │  └─ Application name: "SocialFlow" (utilisé par défaut)
│  │
│  ├─ OAUTH GLOBAL (Configuration):
│  │  ├─ Google OAuth credentials (pour tous les Cabinets)
│  │  └─ Microsoft OAuth credentials (pour tous les Cabinets)
│  │
│  ├─ MONITORING & ADMIN (Dashboard):
│  │  ├─ Voir tous les Cabinets (liste, stats, usage)
│  │  ├─ Voir status de la plateforme (uptime, performance, DB health)
│  │  ├─ Voir audit logs globaux (toutes les actions, tous les Cabinets)
│  │  ├─ Créer Cabinet manuellement (sans Stripe - test, partenaires)
│  │  ├─ Suspendre/réactiver Cabinet (fraude, non-paiement)
│  │  └─ Voir factures globales
│  │
│  └─ GESTION UTILISATEURS (SuperAdmin only):
│     ├─ Voir TOUS les utilisateurs Cabinet RH & Gestionnaires (tous les Cabinets)
│     ├─ Reset password (forcer utilisateur à créer nouveau MDP)
│     │  → User reçoit email avec lien reset (1h TTL)
│     │
│     ├─ Suspendre/réactiver utilisateur (blocage accès)
│     │  → User ne peut plus login (JWT rejeté)
│     │  → Sessions existantes révoquées
│     │
│     ├─ Forcer 2FA (obliger activation)
│     │  → À next login, user DOIT configurer 2FA (email OTP OU TOTP)
│     │  → Peut pas skiper
│     │
│     ├─ Révoquer sessions (logout immédiat)
│     │  → Tous les tokens refresh = invalides
│     │  → User logout de tous les devices
│     │  → À next login = nouveau token
│     │
│     └─ Supprimer utilisateur (soft-delete + RGPD)
│        → User marqué deleted_at = NOW()
│        → Email remplacé par "DELETED_USER_XXX"
│        → Fiches de paie: conservées (légal 5 ans) mais détachées
│        → Audit logs: anonymisés
│
│  CAS D'USAGE:
│    • Reset password: user oublie, SuperAdmin envoie reset link
│    • Suspendre: user fraudeur ou comportement suspect
│    • Forcer 2FA: Cabinet RH demande 2FA obligatoire pour ses users
│    • Révoquer sessions: user quitte entreprise, logout immédiat
│    • Supprimer: RGPD droit à l'oubli
│
│  ❌ NE VOIT PAS (données client isolées):
│     ├─ Les Entreprises clientes (sauf via audit)
│     ├─ Les fiches de paie
│     ├─ Les salariés
│     └─ Aucune donnée confidentielle client
│
└─ Cabinet RH (N clients payants, abonnement Stripe)
   │
   ├─ AUTHENTICATION:
   │  ├─ Login: Magic Link + Password + OAuth (Google/Microsoft)
   │  └─ Session: 1h access token + 24h refresh token (HttpOnly)
   │
   ├─ ABONNEMENT STRIPE:
   │  ├─ Voit: sa facture, son plan actuel (Starter/Pro/Enterprise)
   │  ├─ Upgrade/Downgrade: via Stripe Portal (billing portal)
   │  └─ Usage: voir stats (entreprises used/quota, gestionnaires, stockage)
   │
   ├─ CUSTOMISATION:
   │  ├─ SMTP: host, port, user, password (chiffré), from_name, from_email
   │  ├─ Templates: sujet/corps personnalisés (avec variables {{cabinet_name}}, {{employe_nom}})
   │  └─ Branding: logo (Vercel Blob), couleur primaire/secondaire
   │
   ├─ GESTION GESTIONNAIRES (internes Cabinet):
   │  ├─ Créer: nom, email, spécialité (Paie/RH/Général)
   │  ├─ Inviter: email + token 7j (one-time use)
   │  ├─ Assigner: à N Entreprises (qui verront SEULEMENT celles assignées)
   │  ├─ Modifier: nom, spécialité, désactiver
   │  ├─ Supprimer: soft-delete (fiches conservées, logs anonymisés)
   │  └─ Reset password: envoyer reset link
   │
   ├─ GESTION ENTREPRISES CLIENTES:
   │  ├─ Créer: nom, VAT, adresse, email
   │  ├─ Inviter: email + token 7j (Admin Entreprise accepte)
   │  ├─ Assigner: à N Gestionnaires (relation N:M)
   │  ├─ Modifier: nom, VAT, adresse
   │  ├─ Supprimer: soft-delete (fiches conservées)
   │  └─ Voit: liste entreprises + statut (active/archived)
   │
   ├─ GESTION FICHES DE PAIE (centralisée Cabinet):
   │  ├─ Voir: toutes les fiches de tous ses Gestionnaires & Entreprises
   │  ├─ Génère/valide: fiches de paie (OU Gestionnaire valide)
   │  ├─ Envoie: fiches via son SMTP customisé EN SON NOM
   │  ├─ Archive: après 30 jours, marquer ARCHIVÉE (soft-delete après 5 ans)
   │  └─ Export: PDF, CSV pour audit
   │
   ├─ GESTION COLLABORATEURS (indirectement):
   │  ├─ Voir: listes (importées via Entreprise OU Gestionnaire)
   │  ├─ Import: CSV dossiers clients (nom, NISS, salaire, date embauche)
   │  └─ NE peut PAS: créer directement (création via Entreprise ou Gestionnaire)
   │
   └─ CRÉE/INVITE: Gestionnaires RH + Entreprises Clientes
      │
      ├─ Gestionnaire RH (assigné à N Entreprises)
      │  ├─ Gère: Entreprises assignées
      │  ├─ Crée: Collaborateurs dans ses Entreprises
      │  ├─ Génère: Fiches de paie
      │  └─ Valide: Fiches avant envoi
      │
      └─ Entreprise Cliente
         │
         ├─ Admin Entreprise (login dans SocialFlow)
         │  ├─ Crée: Collaborateurs (invite par email)
         │  ├─ Valide: Fiches de paie
         │  └─ Accède: portail Entreprise
         │
         └─ Collaborateur (salarié, login SocialFlow)
            ├─ Voit: sa fiche de paie (RO)
            └─ Accède: portail Collaborateur
```

---

## 🔐 AUTHENTIFICATION — 3 MÉTHODES

**Tous les utilisateurs supportent:**
- ✅ Magic Link (15 min)
- ✅ Password (bcrypt)
- ✅ OAuth 2.0 (Google + Microsoft)

### **SuperAdmin**
```
Login direct (email + password OU OAuth)
Pas d'inscription
```

### **Cabinet RH**
```
INSCRIPTION:
  POST /auth/register
    → email, password, firstName, lastName
    → Cabinet data (name, VAT, address)
    → Plan Stripe (Starter/Pro/Enterprise)
    → Stripe Checkout
    → Webhook: crée Cabinet + User (CABINET_RH, is_main_admin=true)

LOGIN:
  Magic Link + Password + OAuth
```

### **Gestionnaire RH**
```
INVITATION (par Cabinet RH):
  Cabinet → POST /api/gestionnaires/invite
    → email, firstName, lastName
    → Générer token invite (7j TTL)
    → Email: "Rejoins [Cabinet] sur SocialFlow"

ACCEPTATION:
  Gestionnaire clique lien → /invitations/accept?token=XXX
    → Formulaire: firstName, lastName, password, OAuth (opt)
    → Crée User (role=GESTIONNAIRE_RH)
    → Auto-login

LOGIN (next times):
  Magic Link + Password + OAuth
```

### **Entreprise Cliente & Collaborateur**
```
INVITATION (par Cabinet OU Gestionnaire):
  Même workflow que Gestionnaire
  
LOGIN:
  Magic Link + Password + OAuth
```

---

## 📊 SCHÉMA PRISMA

```prisma
enum UserRole {
  SUPER_ADMIN
  CABINET_RH
  GESTIONNAIRE_RH
  ENTREPRISE_CLIENTE    // Admin de l'Entreprise
  COLLABORATEUR         // Salarié
}

model User {
  id          String @id @default(cuid())
  email       String @unique
  firstName   String
  lastName    String
  role        UserRole
  
  cabinetId   String?  // null si SuperAdmin
  cabinet     Cabinet? @relation(fields: [cabinetId], references: [id])
  
  // Status
  isActive    Boolean @default(true)          // SuperAdmin peut suspendre
  mustSetup2FA Boolean @default(false)        // SuperAdmin forcer 2FA
  
  // Soft-delete (RGPD)
  deletedAt   DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Polymorphes
  gestionnaire Gestionnaire?
  entreprise  Entreprise?
  collaborateur Collaborateur?
  
  providers   OAuthProvider[]
  auditLogs   AuditLog[]
  resetTokens PasswordReset[]
  twoFactorSecrets TwoFactorSecret[]
}

// ===== PASSWORD RESET =====
model PasswordReset {
  id          String @id @default(cuid())
  userId      String
  user        User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  token       String @unique // SHA-256 hashed
  expiresAt   DateTime
  usedAt      DateTime?
  
  createdAt   DateTime @default(now())
  
  @@index([userId])
}

// ===== TWO FACTOR AUTH =====
model TwoFactorSecret {
  id          String @id @default(cuid())
  userId      String @unique
  user        User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type        String      // "email_otp", "totp"
  secret      String      // Chiffré (seed TOTP OU backup codes JSON)
  isEnabled   Boolean @default(false)
  
  backupCodes String[]    // 10 codes one-time use
  usedCodes   String[]    // codes utilisés
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
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
  
  stripeCustomerId      String? @unique
  stripeSubscriptionId  String?
  plan                  Plan @default(STARTER)
  status                CabinetStatus @default(ACTIVE)
  
  // SMTP (envoyer en son nom)
  smtpHost              String?
  smtpPort              Int?
  smtpUser              String?
  smtpPassword          String? // Chiffré AES-256
  smtpFromName          String? // ex: "Cabinet RH XYZ"
  smtpFromEmail         String? // ex: "paie@cabinet.be"
  
  // Branding & White-Label
  applicationName       String? // ex: "Cabinet RH XYZ" (remplace "SocialFlow" partout)
  logoUrl               String? // Vercel Blob
  colorPrimary          String? // hex: #0F7BA7
  colorSecondary        String? // hex: #10B981
  
  users                 User[]
  gestionnaires         Gestionnaire[]
  entreprises           Entreprise[]
  templates             EmailTemplate[]
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
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
  id          String @id @default(cuid())
  userId      String @unique
  user        User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  cabinetId   String
  cabinet     Cabinet @relation(fields: [cabinetId], references: [id], onDelete: Cascade)
  
  specialite  String?
  
  // N:N Entreprises assignées
  entreprisesId String[]
  
  createdAt   DateTime @default(now())
  
  @@unique([userId, cabinetId])
}

// ===== ENTREPRISE CLIENTE =====
model Entreprise {
  id          String @id @default(cuid())
  
  name        String
  vatNumber   String
  address     String
  city        String
  zipCode     String
  email       String
  phone       String?
  
  cabinetId   String
  cabinet     Cabinet @relation(fields: [cabinetId], references: [id], onDelete: Cascade)
  
  // Admin Entreprise (utilisateur)
  adminUserId String?
  admin       User?   @relation(fields: [adminUserId], references: [id])
  
  // Gestionnaire(s) assigné(s)
  gestionnairesId String[]
  
  collaborateurs Collaborateur[]
  fiches         FichePaie[]
  contrats       Contrat[]
  
  createdAt   DateTime @default(now())
  
  @@unique([cabinetId, vatNumber])
}

// ===== COLLABORATEUR (Salarié) =====
model Collaborateur {
  id          String @id @default(cuid())
  
  userId      String? @unique  // nullable si pas encore inscrit
  user        User?   @relation(fields: [userId], references: [id])
  
  entrepriseId String
  entreprise  Entreprise @relation(fields: [entrepriseId], references: [id], onDelete: Cascade)
  
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
  
  createdAt   DateTime @default(now())
  
  @@unique([entrepriseId, niss])
}

// ===== CONTRAT DE TRAVAIL =====
model Contrat {
  id              String @id @default(cuid())
  collaborateurId String @unique
  collaborateur   Collaborateur @relation(fields: [collaborateurId], references: [id], onDelete: Cascade)
  
  entrepriseId    String
  entreprise      Entreprise @relation(fields: [entrepriseId], references: [id])
  
  type            String
  dateDebut       DateTime
  dateFin         DateTime?
  salaireBase     Decimal @db.Decimal(10, 2)
  template        String? @db.Text
  
  createdAt       DateTime @default(now())
}

// ===== FICHE DE PAIE =====
model FichePaie {
  id              String @id @default(cuid())
  
  collaborateurId String
  collaborateur   Collaborateur @relation(fields: [collaborateurId], references: [id], onDelete: Cascade)
  
  entrepriseId    String
  entreprise      Entreprise @relation(fields: [entrepriseId], references: [id])
  
  mois            Int
  annee           Int
  
  statut          FichePaieStatus @default(BROUILLON)
  
  // CALCULS BELGIQUE
  salaireeBrut    Decimal @db.Decimal(10, 2)
  onss            Decimal @db.Decimal(10, 2)
  precompte       Decimal @db.Decimal(10, 2)
  chargesPatronales Decimal @db.Decimal(10, 2)
  salaireNet      Decimal @db.Decimal(10, 2)
  
  pdfUrl          String?
  createdBy       String?
  validatedBy     String?
  
  createdAt       DateTime @default(now())
  
  @@unique([collaborateurId, mois, annee])
}

enum FichePaieStatus {
  BROUILLON    // Gestionnaire crée
  VALIDATION   // En attente validation Entreprise
  VALIDÉE      // Entreprise approuve
  ENVOYÉE      // Collaborateur reçoit
  ARCHIVÉE     // 5 ans rétention
}

// ===== EMAIL TEMPLATES (par Cabinet) =====
model EmailTemplate {
  id          String @id @default(cuid())
  cabinetId   String
  cabinet     Cabinet @relation(fields: [cabinetId], references: [id], onDelete: Cascade)
  
  type        String
  name        String
  subject     String // ex: "Votre fiche de paie - {{cabinet_name}}"
  body        String @db.Text // HTML avec variables {{cabinet_name}}, {{collaborateur_nom}}, etc.
  variables   String[]
  
  @@unique([cabinetId, type])
}

// VARIABLES DISPONIBLES:
// {{cabinet_name}}        = nom du Cabinet RH
// {{cabinet_email}}       = email du Cabinet
// {{collaborateur_nom}}   = nom du salarié
// {{collaborateur_email}} = email du salarié
// {{mois}}               = mois fiche (ex: "Juin 2026")
// {{salaire_net}}        = salaire net
// {{lien_telechargement}} = lien PDF

// ===== AUDIT LOG =====
model AuditLog {
  id          String @id @default(cuid())
  userId      String
  user        User @relation(fields: [userId], references: [id])
  
  action      String
  resourceType String
  resourceId  String?
  cabinetId   String?
  metadata    Json?
  
  createdAt   DateTime @default(now())
  
  @@index([cabinetId])
}

// ===== OAUTH PROVIDERS =====
model OAuthProvider {
  id              String @id @default(cuid())
  userId          String
  user            User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  provider        String
  providerUserId  String?
  accessToken     String? @db.Text
  refreshToken    String? @db.Text
  expiresAt       DateTime?
  
  @@unique([userId, provider])
}
```

---

## 🔄 WORKFLOWS CLÉS

### **Workflow 1: Cabinet s'abonne (Stripe)**

```
1. Cabinet clique "S'abonner"
2. POST /auth/register
   → email, password, firstName, lastName, Cabinet data (name, VAT)
   → Plan choisi (Starter/Pro/Enterprise)
      (Prix fixé par SuperAdmin, Cabinet ne peut pas changer)
3. Redirect Stripe Checkout
   → Session créée avec Stripe Price ID (défini par SuperAdmin)
4. Cabinet paie via Stripe
5. Webhook stripe/checkout.session.completed
   → Crée atomiquement:
     - Cabinet
       - stripeCustomerId: cust_XXX
       - stripeSubscriptionId: sub_XXX
       - plan: STARTER|PRO|ENTERPRISE
       - status: ACTIVE
     - User (role=CABINET_RH, is_main_admin=true)
     - CabinetCustomization (defaults SocialFlow)
     - EmailTemplate[] (defaults SocialFlow)
6. Email bienvenue (depuis Resend/SMTP global)
7. Cabinet accède au dashboard
   → Peut voir: Factures, Upgrade/Downgrade, Usage stats
```

### **Workflow 2: Cycle Fiche de Paie**

```
1. BROUILLON (Gestionnaire crée)
   - Récupère data Collaborateur
   - Saisit: salaire, congés, primes
   - Calcule: ONSS 13.07% + précompte belge + charges 42%
   - Génère PDF
   - Click "Envoyer à validation"
   → Statut: VALIDATION

2. VALIDATION (Entreprise valide)
   - Admin Entreprise reçoit notification
   - Voit fiche, revoit chiffres
   - Click "Approuver" OU "Rejeter"
   → Statut: VALIDÉE (ou back to BROUILLON)

3. ENVOYÉE (Cabinet envoie)
   - Click "Envoyer au salarié"
   - Email via SMTP du Cabinet
   - Template personnalisé du Cabinet
   → Statut: ENVOYÉE

4. ARCHIVÉE (Système)
   - Après 30j ENVOYÉE → ARCHIVÉE
   - Rétention: 5 ans minimum (Belgique)
   - Soft-delete après 5 ans
```

### **Workflow 3: Invitation Gestionnaire**

```
Cabinet RH → Cabinet/settings/gestionnaires/invite
  email, firstName, lastName
  → Générer token (7j TTL)
  → Email: "Rejoins [Cabinet]"
  
Gestionnaire clique lien
  → POST /invitations/accept?token=XXX
  → Crée User (role=GESTIONNAIRE_RH)
  → Auto-login
```

### **Workflow 4: Invitation Entreprise Cliente**

```
Cabinet RH → Cabinet/settings/entreprises/invite
  email, company name, ...
  → Générer token (7j TTL)
  → Email: "Rejoins [Cabinet]"
  
Entreprise clique lien
  → POST /invitations/accept?token=XXX
  → Crée:
    - Entreprise (dans DB)
    - User (role=ENTREPRISE_CLIENTE, is_admin=true)
  → Auto-login portail Entreprise
```

### **Workflow 5: Invitation Collaborateur**

```
Entreprise → Entreprise/collaborateurs/invite
  email, firstName, lastName
  → Générer token (7j TTL)
  → Email: "Rejoins [Entreprise]"
  
Collaborateur clique lien
  → POST /invitations/accept?token=XXX
  → Crée:
    - Collaborateur (dans Entreprise)
    - User (role=COLLABORATEUR)
  → Auto-login portail Collaborateur
```

---

## 🔒 ISOLATION MULTI-TENANT

```
Cabinet A ≠ Cabinet B:
  • Utilisateurs A ne voient PAS Cabinet B
  • Gestionnaires A ne voient PAS Gestionnaires B
  • Entreprises A ne voient PAS Entreprises B
  • Collaborateurs A ne voient PAS Collaborateurs B

Implémentation:
  ✅ WHERE cabinetId = $1 sur TOUTES les requêtes Cabinet
  ✅ Middleware: vérifier cabinetId JWT vs ressource
  ✅ RLS PostgreSQL (défense en profondeur)
```

---

## ⏰ RÉTENTION LÉGALE BELGIQUE

**FIXÉ: 5 ans minimum**

```
Fiches de paie: 5 ans en DB → soft-delete
Contrats: 5 ans en DB → soft-delete
ONSS: 5 ans
Audit logs: 3 ans (actifs) + 1 an (archives)
Collaborateurs supprimés: anonymisation (RGPD)
```

---

## 💰 PRICING STRIPE (géré par SuperAdmin)

**SuperAdmin configure (une fois):**
```
STARTER: 99€/mois
  ├─ Entreprises: 25
  ├─ Gestionnaires: 5
  └─ Stockage: 10 GB

PRO: 299€/mois
  ├─ Entreprises: 100
  ├─ Gestionnaires: 15
  └─ Stockage: 50 GB

ENTERPRISE: Custom (negotié)
  └─ Illimité
```

**Cabinet RH peut:**
- ✅ Voir ses factures
- ✅ Voir son plan actuel
- ✅ Upgrader/Downgrade (via Stripe Portal)
- ❌ Modifier les prix (SuperAdmin only)
- ❌ Créer nouveau plan (SuperAdmin only)

---

## 🎨 WHITE-LABEL & CUSTOMISATION CABINET

**Cabinet RH peut complètement rebrander SocialFlow en son propre nom**

### **Exemple:**

**SocialFlow Default:**
```
Email sujet: "Votre fiche de paie - SocialFlow"
Email corps: "Bienvenue sur SocialFlow"
Signature: "L'équipe SocialFlow"
Logo: SocialFlow
Couleurs: Violet/Teal SocialFlow
```

**Après customisation par Cabinet RH XYZ:**
```
Email sujet: "Votre fiche de paie - Cabinet RH XYZ"
Email corps: "Bienvenue chez Cabinet RH XYZ"
Signature: "Cabinet RH XYZ - paie@cabinet.be"
Logo: Logo Cabinet RH XYZ
Couleurs: Bleu/Orange Cabinet
```

### **Paramètres Customisables:**

| Paramètre | Default | Cabinet peut changer | Exemple |
|---|---|---|---|
| **applicationName** | "SocialFlow" | ✅ OUI | "Cabinet RH XYZ" |
| **logoUrl** | Logo SF | ✅ OUI | Vercel Blob image |
| **colorPrimary** | #7c3aed | ✅ OUI | #0F7BA7 |
| **smtpFromName** | "SocialFlow" | ✅ OUI | "Cabinet RH XYZ" |
| **smtpFromEmail** | "noreply@sf" | ✅ OUI | "paie@cabinet.be" |
| **emailTemplate** | Template SF | ✅ OUI | HTML personnalisé |

### **Dans l'interface Cabinet:**

```
Settings → Branding & Customisation
  ├─ [ ] Nom application: [Cabinet RH XYZ]
  ├─ [ ] Logo: [upload image]
  ├─ [ ] Couleur primaire: [#0F7BA7]
  ├─ [ ] Couleur secondaire: [#10B981]
  ├─ Settings → SMTP
  │  ├─ [ ] Host: [smtp.cabinet.be]
  │  ├─ [ ] From Name: [Cabinet RH XYZ]
  │  └─ [ ] From Email: [paie@cabinet.be]
  └─ Settings → Email Templates
     ├─ [ ] Sujet: "Votre fiche de paie - {{cabinet_name}}"
     └─ [ ] Corps: [HTML editor avec variables]
```

---

## 🏢 CABINET RH — ANALYSE COMPLÈTE

### **Qui est Cabinet RH?**

```
= Client SaaS qui s'abonne à SocialFlow
= Propriétaire d'un Cabinet de paie/RH
= A ses propres clients externes (Entreprises Clientes)
= Utilise SocialFlow pour gérer la paie de ses clients

Exemples:
  • Cabinet RH "XYZ Consulting" → 50 clients (Entreprises)
  • Cabinet RH "Paie Services Belgique" → 100 clients
```

### **RÔLES & PERMISSIONS CABINET RH**

```
Cabinet RH se divise en 2 niveaux:

NIVEAU 1: Cabinet (propriétaire abonnement)
  ├─ is_main_admin = true (premier user, non révocable)
  ├─ Peut: créer/inviter autres Gestionnaires
  ├─ Peut: voir TOUTES les fiches (audit)
  └─ Peut: customiser SMTP, templates, branding

NIVEAU 2: Gestionnaire RH (collaborateurs Cabinet)
  ├─ Invité par Cabinet (email + token 7j)
  ├─ Assigné à N Entreprises (voit SEULEMENT celles assignées)
  ├─ Génère fiches pour ses Entreprises
  └─ Ne peut PAS: voir fiches d'autres Gestionnaires
```

### **TABLEAU: PERMISSIONS CABINET RH**

| Action | Cabinet Admin | Gestionnaire | Entreprise | Collaborateur |
|---|---|---|---|---|
| **Voir fiches de paie** | ✅ TOUTES | ✅ assignées | ✅ siennes (RO) | ✅ sa fiche (RO) |
| **Créer fiche** | ✅ OUI | ✅ assignées | ❌ NON | ❌ NON |
| **Valider fiche** | ✅ OUI | ✅ assignées | ✅ siennes | ❌ NON |
| **Envoyer fiche** | ✅ OUI | ✅ NON | ✅ OUI | ❌ NON |
| **Créer Gestionnaire** | ✅ OUI | ❌ NON | ❌ NON | ❌ NON |
| **Créer Entreprise** | ✅ OUI | ❌ NON | ❌ NON | ❌ NON |
| **Créer Collaborateur** | ✅ OUI | ✅ OUI | ✅ OUI | ❌ NON |
| **Customiser SMTP** | ✅ OUI | ❌ NON | ❌ NON | ❌ NON |
| **Voir audit logs** | ✅ OUI | ❌ NON | ❌ NON | ❌ NON |
| **Upgrade plan** | ✅ OUI | ❌ NON | ❌ NON | ❌ NON |

### **WORKFLOWS CABINET RH**

#### **Workflow 1: Cabinet crée Gestionnaire**

```
Cabinet Admin → Dashboard → Gestion Gestionnaires → "Inviter"
  Formulaire:
    - email: gestionnaire@example.com
    - firstName, lastName
    - specialite: "Paie" | "RH" | "Général"
  
  Click "Inviter"
    → Générer invitation token (7j TTL, one-time use)
    → Email: "Vous êtes invité à rejoindre [Cabinet] - SocialFlow"
    → Lien: /invitations/accept?token=XXX&email=YYY
    → Audit log: INVITATION_CREATED
  
  Gestionnaire clique lien
    → Formulaire: firstName, lastName, password, OAuth (opt)
    → POST /invitations/accept
    → Crée User (role=GESTIONNAIRE_RH, cabinetId=XXX)
    → Audit log: USER_CREATED, INVITATION_ACCEPTED
    → Auto-login
  
  Cabinet Admin peut:
    ├─ Voir listes Gestionnaires (status: invited, accepted, disabled)
    ├─ Assigner à Entreprises
    ├─ Reset password
    ├─ Désactiver (isActive=false)
    └─ Supprimer (soft-delete)
```

#### **Workflow 2: Cabinet crée Entreprise Cliente**

```
Cabinet Admin → Dashboard → Gestion Entreprises → "Créer"
  Formulaire:
    - name: "Entreprise ACME"
    - vatNumber: "BE0123456789"
    - address, city, zipCode
    - email: contact@acme.be
    - phone (opt)
  
  Click "Créer"
    → POST /cabinet/entreprises/create
    → Créer Entreprise (cabinetId=Cabinet, status=CREATED)
    → Audit log: ENTREPRISE_CREATED
  
  Option A: Cabinet envoie invitation à Admin Entreprise
    → Générer token (7j)
    → Email: "Vous êtes invité à rejoindre SocialFlow - Gestion de paie"
    → Admin Entreprise accepte, crée User (role=ENTREPRISE_CLIENTE)
  
  Option B: Cabinet n'envoie pas invitation
    → Entreprise stockée mais PAS ACTIVE
    → Attendre que Gestionnaire ou Cabinet envoie invitation
  
  Cabinet Admin peut:
    ├─ Assigner Gestionnaires à Entreprise (N:M)
    ├─ Inviter Admin Entreprise
    ├─ Modifier Entreprise (nom, VAT, adresse)
    ├─ Voir fiches de Entreprise
    └─ Archiver/Supprimer
```

#### **Workflow 3: Cabinet (re)configure SMTP**

```
Cabinet Admin → Settings → SMTP & Email
  Formulaire:
    - smtpHost: smtp.cabinet.be
    - smtpPort: 587
    - smtpUser: paie@cabinet.be
    - smtpPassword: [chiffré AES-256]
    - smtpFromName: "Cabinet RH XYZ - Paie"
    - smtpFromEmail: paie@cabinet.be
  
  Click "Tester connexion"
    → Envoyer email test
    → Si OK: "SMTP validé"
    → Si KO: "Erreur connexion SMTP"
  
  Fiches envoyées utilisent ce SMTP
    → Email FROM: "Cabinet RH XYZ - Paie" <paie@cabinet.be>
    → Pas via Resend (SocialFlow global)
```

#### **Workflow 4: Cabinet envoie Fiche de Paie**

```
Cabinet Admin → Fiches → Cherche fiche (VALIDÉE)
  Click "Envoyer"
    → POST /fiches/{id}/send
    → Récupère SMTP du Cabinet
    → Récupère EmailTemplate du Cabinet
    → Génère PDF fiche
    → Envoie email via SMTP Cabinet:
       TO: collaborateur@example.com
       FROM: "Cabinet RH XYZ - Paie" <paie@cabinet.be>
       Subject: "Votre fiche de paie - Juin 2026 - Cabinet RH XYZ"
       Body: "Bonjour {{collaborateur_nom}}, votre fiche paie..."
       Attachment: fiche.pdf
    
    → Statut: VALIDÉE → ENVOYÉE
    → Audit log: FICHE_SENT
    → Après 30 jours: auto-archive
```

### **LIMITATIONS & ISOLATION CABINET RH**

```
Cabinet A ne voit JAMAIS:
  ❌ Cabinets autres
  ❌ Fiches d'autres Cabinets
  ❌ Gestionnaires d'autres Cabinets
  ❌ Données clients d'autres Cabinets

Implémentation:
  ✅ WHERE cabinetId = $1 sur TOUTES requêtes
  ✅ JWT contient cabinetId (vérifié middleware)
  ✅ RLS PostgreSQL (défense en profondeur)

Exemple query bloquée:
  ❌ SELECT * FROM fiches_paie   (pas de WHERE)
  ✅ SELECT * FROM fiches_paie WHERE cabinetId = $1
```

### **QUOTA ENFORCEMENT (par plan)**

```
STARTER (25 entreprises, 5 gestionnaires):
  Cabinet crée 26ème entreprise:
    → Warning: "Limite atteinte. Upgrade vers Pro pour +75 entreprises"
    → Fiche créée mais marquée warning=true
  
  À 96% quota:
    → Email proactif: "Vous utilisez 96% de votre limite"
    → Suggestion: "Upgrade vers Pro"
  
  Downgrade Pro → Starter (100 → 25 entreprises):
    → Grace period: 30 jours
    → Entreprises 26-100 marquées archived
    → Après 30j: blocage total OU auto-upgrade suggestion

PRISMA:
  model Cabinet {
    plan              Plan
    enterprisesUsed   Int
    gestionnairesUsed Int
    storageUsed       Int // GB
  }
```

### **CHECKLIST CABINET RH**

```
Cabinet doit faire AVANT d'utiliser SocialFlow:

1. Configurer abonnement Stripe
   ├─ Choisir plan (Starter/Pro/Enterprise)
   └─ Payer

2. Configurer SMTP du Cabinet
   ├─ Valider connexion
   └─ Envoyer email test

3. Customiser templates/branding (opt)
   ├─ Upload logo
   ├─ Couleur primaire
   └─ Personnaliser email template

4. Inviter Gestionnaires
   ├─ Email + token
   └─ Assigner à Entreprises

5. Créer/inviter Entreprises Clientes
   ├─ Créer entrée
   └─ Inviter Admin Entreprise (opt)

THEN:
  → Cabinet peut commencer à générer fiches
```

---

## ✅ AVANT DE DÉVELOPPER

- [ ] Approuver cette SPEC (modèle = 5 rôles avec portails)
- [ ] Copier schéma Prisma
- [ ] Setup Vercel + PostgreSQL + Redis
- [ ] OAuth Google + Microsoft
- [ ] Stripe (plans + webhooks)
- [ ] Resend (emails)
- [ ] Better Auth (3 methods)
- [ ] Invitations (tokens 7j)
- [ ] Customisation Cabinet (SMTP override)
- [ ] Tests: toutes les authentifications

---

**MAINTENANT C'EST CLAIR & FINAL.** ✅

Prêt à coder? 🚀

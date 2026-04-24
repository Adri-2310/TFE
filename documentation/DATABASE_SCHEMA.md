# 🗄️ Database Schema - WorkZen

**Version:** 1.0  
**Database:** PostgreSQL 16  
**ORM:** Prisma v5+  
**Last Updated:** 2025-04-16

---

## Table des Matières

1. [Prisma Schema Complet](#prisma-schema-complet)
2. [Entités Principales](#entités-principales)
3. [Relations](#relations)
4. [Indexes](#indexes)
5. [Migrations](#migrations)
6. [Performance Tips](#performance-tips)

---

## Prisma Schema Complet

```prisma
// File: packages/database/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============ ENUM TYPES ============

enum UserRole {
  SUPER_ADMIN
  ADMIN_SECRETARIAT
  CONSULTANT
  CLIENT_USER
  EMPLOYEE_USER
}

enum CompanyStatus {
  ACTIF
  INACTIF
  SUSPENDU
  ARCHIVE
}

enum EmployeeStatus {
  ACTIF
  INACTIF
  CONGE
  ARCHIVE
}

enum ContractType {
  CDI
  CDD
  STAGE
  INTERIM
}

enum PaySlipStatus {
  BROUILLON
  VALIDEE
  ENVOYEE
  ARCHIVEE
}

enum AbsenceType {
  VACATION
  MALADIE
  PERSONNEL
  SANS_SOLDE
  ACCIDENT
}

enum AbsenceStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

enum SubscriptionStatus {
  ACTIVE
  TRIALING
  SUSPENDED
  CANCELLED
  PAST_DUE
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
}

enum ComplianceTaskType {
  ONSS_DECLARATION
  DIMONA_SUBMISSION
  C4_CERTIFICATE
  TAX_DOCUMENT
}

enum ComplianceTaskStatus {
  PENDING
  SUBMITTED
  ACCEPTED
  REJECTED
}

enum DeadlineType {
  ONSS
  DIMONA
  C4
  TAX
  SALARY_DEADLINE
}

enum AlertType {
  DEADLINE
  ERROR
  WARNING
  INFO
}

enum NotificationStatus {
  NEW
  READ
  ARCHIVED
}

enum MessageStatus {
  SENT
  DELIVERED
  READ
  FAILED
}

// ============ CORE ENTITIES ============

model User {
  id                    String     @id @default(cuid())
  email                 String     @unique
  motDePasse_hash       String
  prenom                String
  nom                   String
  telephone             String?
  role                  UserRole
  estActif              Boolean    @default(true)
  
  // 2FA
  totp_secret           String?
  totp_enabled          Boolean    @default(false)
  
  // Relations
  secretariat_id        String?
  secretariat           Secretariat?  @relation(fields: [secretariat_id], references: [id], onDelete: SetNull)
  company_id            String?
  company               Company?   @relation("UtilisateurCompany", fields: [company_id], references: [id], onDelete: SetNull)
  
  sessions              Session[]
  auditLogs             AuditLog[]
  loginAttempts         LoginAttempt[]
  messages_sent         Message[]  @relation("MessageSender")
  messages_received     Message[]  @relation("MessageRecipient")
  conversations         Conversation[] @relation("ConversationParticipant")
  notifications         Notification[]
  alertPreferences      AlertPreference[]
  tableauBords          TableauBord[]
  
  dateCreation          DateTime   @default(now())
  dateModification      DateTime   @updatedAt
  
  @@index([email])
  @@index([secretariat_id])
  @@index([company_id])
}

model Secretariat {
  id                    String     @id @default(cuid())
  nom                   String
  adresse               String?
  email                 String?
  telephone             String?
  statut                String     @default("ACTIF")
  
  // Relations
  utilisateurs          User[]
  companies             Company[]
  subscriptions         Subscription[]
  abonnements           Plan[]
  tokens_oauth          OAuthToken[]
  syncs_exact           ExactOnlineSync[]
  echeances             Deadline[]
  documents             Document[]
  auditLogs             AuditLog[]
  journals_evenements   EventLog[]
  tableauBords          TableauBord[]
  
  dateCreation          DateTime   @default(now())
  dateModification      DateTime   @updatedAt
  
  @@index([nom])
}

model Company {
  id                    String     @id @default(cuid())
  secretariat_id        String
  secretariat           Secretariat @relation(fields: [secretariat_id], references: [id], onDelete: Cascade)
  
  nom                   String
  numeroTVA             String
  IBAN                  String?
  adresse               String?
  secteur               String?
  nombreEmployes        Int        @default(0)
  statut                CompanyStatus @default(ACTIF)
  
  // Relations
  consultant_id         String?
  consultant            User?      @relation("ConsultantCompanies", fields: [consultant_id], references: [id])
  
  contacts              PersonneContact[]
  employes              Employee[]
  fichesPaie            PaySlip[]
  contrats              Contract[]
  absences              Absence[]
  documents             Document[]
  
  dateCreation          DateTime   @default(now())
  dateModification      DateTime   @updatedAt
  
  @@unique([secretariat_id, numeroTVA])
  @@index([secretariat_id])
  @@index([numeroTVA])
  @@index([statut])
}

model PersonneContact {
  id                    String     @id @default(cuid())
  company_id            String
  company               Company    @relation(fields: [company_id], references: [id], onDelete: Cascade)
  
  prenom                String
  nom                   String
  email                 String
  telephone             String?
  poste                 String?
  estPrincipal          Boolean    @default(false)
  
  dateCreation          DateTime   @default(now())
  dateModification      DateTime   @updatedAt
  
  @@index([company_id])
  @@index([email])
}

model Employee {
  id                    String     @id @default(cuid())
  company_id            String
  company               Company    @relation(fields: [company_id], references: [id], onDelete: Cascade)
  secretariat_id        String
  consultant_id         String?
  
  numeroNational        String
  prenom                String
  nom                   String
  email                 String?
  salaire               Decimal    @db.Decimal(10, 2)
  typeContrat           ContractType
  dateEmbauche          DateTime
  departement           String?
  statut                EmployeeStatus @default(ACTIF)
  
  // Relations
  user_id               String?
  user                  User?      @relation("EmployeeUser", fields: [user_id], references: [id], onDelete: SetNull)
  
  contracts             Contract[]
  fichesPaie            PaySlip[]
  absences              Absence[]
  
  dateCreation          DateTime   @default(now())
  dateModification      DateTime   @updatedAt
  
  @@unique([secretariat_id, numeroNational])
  @@index([company_id])
  @@index([secretariat_id])
  @@index([statut])
}

model Contract {
  id                    String     @id @default(cuid())
  employee_id           String
  employee              Employee   @relation(fields: [employee_id], references: [id], onDelete: Cascade)
  company_id            String
  company               Company    @relation(fields: [company_id], references: [id], onDelete: Cascade)
  
  typeContrat           ContractType
  dateDebut             DateTime
  dateFin               DateTime?
  tauxHoraire           Decimal    @db.Decimal(10, 2)
  heuresSemaine         Decimal    @db.Decimal(5, 2)
  conditions            String?
  statut                String     @default("ACTIF")
  
  dateCreation          DateTime   @default(now())
  dateModification      DateTime   @updatedAt
  
  @@index([employee_id])
  @@index([company_id])
}

// ============ PAYROLL SYSTEM ============

model PaySlip {
  id                    String     @id @default(cuid())
  employee_id           String
  employee              Employee   @relation(fields: [employee_id], references: [id], onDelete: Cascade)
  company_id            String
  company               Company    @relation(fields: [company_id], references: [id], onDelete: Cascade)
  secretariat_id        String
  consultant_id         String?
  
  periode               String     // Format: YYYY-MM
  salaireBrut           Decimal    @db.Decimal(10, 2)
  heures                Decimal    @db.Decimal(5, 2)
  heuresSupplémentaires Decimal    @db.Decimal(5, 2) @default(0)
  primes                Decimal    @db.Decimal(10, 2) @default(0)
  allocations           Decimal    @db.Decimal(10, 2) @default(0)
  deductions            Decimal    @db.Decimal(10, 2) @default(0)
  
  // Calculated values
  montantBrut           Decimal    @db.Decimal(10, 2)
  cotisationONSS        Decimal    @db.Decimal(10, 2)
  precompte             Decimal    @db.Decimal(10, 2)
  montantNet            Decimal    @db.Decimal(10, 2)
  chargesEmployeur      Decimal    @db.Decimal(10, 2)
  tauxImpot             Decimal    @db.Decimal(5, 2)
  
  // PDF & Email
  cheminPDF             String?
  statut                PaySlipStatus @default(BROUILLON)
  dateEnvoi             DateTime?
  
  // Relations
  details               PayrollDetails?
  documents             Document[]
  
  dateCreation          DateTime   @default(now())
  dateModification      DateTime   @updatedAt
  
  @@unique([employee_id, periode])
  @@index([company_id])
  @@index([secretariat_id])
  @@index([statut])
  @@index([periode])
}

model PayrollDetails {
  id                    String     @id @default(cuid())
  payslip_id            String     @unique
  payslip               PaySlip    @relation(fields: [payslip_id], references: [id], onDelete: Cascade)
  
  salaireBrut           Decimal    @db.Decimal(10, 2)
  heuresTravaillees     Decimal    @db.Decimal(5, 2)
  heuresSupplémentaires Decimal    @db.Decimal(5, 2)
  primes                Decimal    @db.Decimal(10, 2)
  allocations           Decimal    @db.Decimal(10, 2)
  onss                  Decimal    @db.Decimal(10, 2)
  precompte             Decimal    @db.Decimal(10, 2)
  autresDeductions      Decimal    @db.Decimal(10, 2)
  montantNet            Decimal    @db.Decimal(10, 2)
  chargesEmployeur      Decimal    @db.Decimal(10, 2)
  coutTotal             Decimal    @db.Decimal(10, 2)
  
  dateCreation          DateTime   @default(now())
}

model Absence {
  id                    String     @id @default(cuid())
  employee_id           String
  employee              Employee   @relation(fields: [employee_id], references: [id], onDelete: Cascade)
  company_id            String
  company               Company    @relation(fields: [company_id], references: [id], onDelete: Cascade)
  
  dateDebut             DateTime
  dateFin               DateTime
  type                  AbsenceType
  motif                 String?
  statut                AbsenceStatus @default(PENDING)
  
  dateCreation          DateTime   @default(now())
  dateModification      DateTime   @updatedAt
  
  @@index([employee_id])
  @@index([company_id])
  @@index([dateDebut])
}

// ============ DOCUMENTS ============

model Document {
  id                    String     @id @default(cuid())
  secretariat_id        String
  secretariat           Secretariat @relation(fields: [secretariat_id], references: [id], onDelete: Cascade)
  
  nom                   String
  type                  String
  chemin                String
  tailleBytes           Int?
  
  // Relations
  payslip_id            String?
  payslip               PaySlip?   @relation(fields: [payslip_id], references: [id], onDelete: SetNull)
  company_id            String?
  company               Company?   @relation(fields: [company_id], references: [id], onDelete: SetNull)
  
  dateCreation          DateTime   @default(now())
  dateModification      DateTime   @updatedAt
  
  @@index([secretariat_id])
  @@index([type])
}

// ============ SUBSCRIPTION & BILLING ============

model Plan {
  id                    String     @id @default(cuid())
  nom                   String     @unique
  prix                  Decimal    @db.Decimal(10, 2)
  maxEntreprises        Int?
  maxConsultants        Int?
  maxStockage           Int        @default(5) // GB
  fonctionnalites       String[]
  cycleBilling          String     @default("MONTHLY") // MONTHLY, YEARLY
  
  subscriptions         Subscription[]
  
  dateCreation          DateTime   @default(now())
}

model Subscription {
  id                    String     @id @default(cuid())
  secretariat_id        String
  secretariat           Secretariat @relation(fields: [secretariat_id], references: [id], onDelete: Cascade)
  
  plan_id               String
  plan                  Plan       @relation(fields: [plan_id], references: [id])
  
  stripe_subscription_id String?
  statut                SubscriptionStatus @default(ACTIVE)
  
  dateDebut             DateTime   @default(now())
  dateFin               DateTime?
  dateProchainFacturation DateTime?
  
  paiements             Payment[]
  
  dateCreation          DateTime   @default(now())
  dateModification      DateTime   @updatedAt
  
  @@unique([secretariat_id])
  @@index([stripe_subscription_id])
}

model Payment {
  id                    String     @id @default(cuid())
  subscription_id       String
  subscription          Subscription @relation(fields: [subscription_id], references: [id], onDelete: Cascade)
  
  stripe_payment_id     String
  montant               Decimal    @db.Decimal(10, 2)
  statut                PaymentStatus
  datePayment           DateTime?
  numeroFacture         String?
  
  facture               Invoice?
  
  dateCreation          DateTime   @default(now())
  
  @@index([subscription_id])
  @@index([stripe_payment_id])
}

model Invoice {
  id                    String     @id @default(cuid())
  payment_id            String     @unique
  payment               Payment    @relation(fields: [payment_id], references: [id], onDelete: Cascade)
  secretariat_id        String
  
  numeroFacture         String     @unique
  montant               Decimal    @db.Decimal(10, 2)
  dateEcheance          DateTime
  statut                String     @default("SENT")
  
  dateCreation          DateTime   @default(now())
  dateModification      DateTime   @updatedAt
  
  @@index([secretariat_id])
}

// ============ CALENDAR & COMPLIANCE ============

model Deadline {
  id                    String     @id @default(cuid())
  secretariat_id        String
  secretariat           Secretariat @relation(fields: [secretariat_id], references: [id], onDelete: Cascade)
  
  type                  DeadlineType
  dateEcheance          DateTime
  estRecurrente         Boolean    @default(false)
  joursAlerte           Int[]      @default([7, 3, 1])
  description           String?
  statut                String     @default("PENDING")
  
  taches_conformite     ComplianceTask[]
  notifications         Notification[]
  
  dateCreation          DateTime   @default(now())
  dateModification      DateTime   @updatedAt
  
  @@index([secretariat_id])
  @@index([type])
  @@index([dateEcheance])
}

model ComplianceTask {
  id                    String     @id @default(cuid())
  deadline_id           String
  deadline              Deadline   @relation(fields: [deadline_id], references: [id], onDelete: Cascade)
  
  type                  ComplianceTaskType
  statut                ComplianceTaskStatus @default(PENDING)
  reference             String?
  details               Json?
  dateEnvoi             DateTime?
  
  dateCreation          DateTime   @default(now())
  dateModification      DateTime   @updatedAt
  
  @@index([deadline_id])
  @@index([type])
}

// ============ OAUTH INTEGRATIONS ============

model OAuthToken {
  id                    String     @id @default(cuid())
  secretariat_id        String
  secretariat           Secretariat @relation(fields: [secretariat_id], references: [id], onDelete: Cascade)
  
  fournisseur           String     // EXACT_ONLINE, etc.
  jetonAcces            String
  jetonRafraichissement String?
  dateExpiration        DateTime
  portee                String?
  
  dateCreation          DateTime   @default(now())
  dateModification      DateTime   @updatedAt
  
  @@unique([secretariat_id, fournisseur])
  @@index([secretariat_id])
}

model ExactOnlineSync {
  id                    String     @id @default(cuid())
  secretariat_id        String
  secretariat           Secretariat @relation(fields: [secretariat_id], references: [id], onDelete: Cascade)
  
  dateLastSync          DateTime?
  statutSync            String     @default("PENDING") // PENDING, RUNNING, SUCCESS, FAILED
  entreprisesSynced     Int        @default(0)
  paiesSynced           Int        @default(0)
  erreurs               Json?
  
  dateCreation          DateTime   @default(now())
  dateModification      DateTime   @updatedAt
  
  @@unique([secretariat_id])
}

// ============ AUDIT & SECURITY ============

model Session {
  id                    String     @id @default(cuid())
  utilisateur_id        String
  utilisateur           User       @relation(fields: [utilisateur_id], references: [id], onDelete: Cascade)
  
  jeton                 String     @unique
  dateExpiration        DateTime
  adresse_ip            String?
  user_agent            String?
  
  dateCreation          DateTime   @default(now())
  dateLastActivity      DateTime   @updatedAt
  
  @@index([utilisateur_id])
  @@index([jeton])
  @@index([dateExpiration])
}

model AuditLog {
  id                    String     @id @default(cuid())
  utilisateur_id        String?
  utilisateur           User?      @relation(fields: [utilisateur_id], references: [id], onDelete: SetNull)
  secretariat_id        String?
  secretariat           Secretariat? @relation(fields: [secretariat_id], references: [id], onDelete: SetNull)
  
  action                String
  type_entite           String
  entite_id             String?
  changements           Json?
  timestamp             DateTime   @default(now())
  adresse_ip            String?
  details               String?
  
  journaux_evenements   EventLog[]
  
  @@index([utilisateur_id])
  @@index([secretariat_id])
  @@index([type_entite])
  @@index([timestamp])
}

model LoginAttempt {
  id                    String     @id @default(cuid())
  utilisateur_id        String?
  utilisateur           User?      @relation(fields: [utilisateur_id], references: [id], onDelete: SetNull)
  
  email                 String
  statut                String     // SUCCESS, FAILED, 2FA_REQUIRED
  adresse_ip            String
  motif                 String?
  timestamp             DateTime   @default(now())
  
  @@index([email])
  @@index([adresse_ip])
  @@index([timestamp])
}

// ============ MESSAGING ============

model Message {
  id                    String     @id @default(cuid())
  conversation_id       String
  conversation          Conversation @relation(fields: [conversation_id], references: [id], onDelete: Cascade)
  
  expediteur_id         String
  expediteur            User       @relation("MessageSender", fields: [expediteur_id], references: [id], onDelete: Cascade)
  
  contenu               String
  estLu                 Boolean    @default(false)
  dateConsultation      DateTime?
  
  dateCreation          DateTime   @default(now())
  
  @@index([conversation_id])
  @@index([expediteur_id])
}

model Conversation {
  id                    String     @id @default(cuid())
  secretariat_id        String?
  
  sujet                 String?
  dateCreation          DateTime   @default(now())
  dateLastMessage       DateTime   @updatedAt
  
  messages              Message[]
  participants          User[]     @relation("ConversationParticipant")
  
  @@index([secretariat_id])
}

// ============ NOTIFICATIONS ============

model Notification {
  id                    String     @id @default(cuid())
  utilisateur_id        String
  utilisateur           User       @relation(fields: [utilisateur_id], references: [id], onDelete: Cascade)
  
  type                  AlertType
  titre                 String
  message               String
  statut                NotificationStatus @default(NEW)
  
  deadline_id           String?
  deadline              Deadline?  @relation(fields: [deadline_id], references: [id], onDelete: SetNull)
  
  journalNotifications  NotificationLog[]
  
  dateCreation          DateTime   @default(now())
  
  @@index([utilisateur_id])
  @@index([statut])
}

model NotificationLog {
  id                    String     @id @default(cuid())
  notification_id       String
  notification          Notification @relation(fields: [notification_id], references: [id], onDelete: Cascade)
  utilisateur_id        String?
  
  type                  String
  canal                 String     // EMAIL, SMS, IN_APP
  statut                String     // SENT, DELIVERED, FAILED
  dateEnvoi             DateTime   @default(now())
  
  @@index([notification_id])
}

model AlertPreference {
  id                    String     @id @default(cuid())
  utilisateur_id        String     @unique
  utilisateur           User       @relation(fields: [utilisateur_id], references: [id], onDelete: Cascade)
  
  type_alerte           String
  estActivee            Boolean    @default(true)
  canaux                String[]   @default(["IN_APP", "EMAIL"])
  frequence             String     @default("IMMEDIATE")
  
  dateCreation          DateTime   @default(now())
  dateModification      DateTime   @updatedAt
}

// ============ MONITORING ============

model EventLog {
  id                    String     @id @default(cuid())
  niveau                String     // INFO, WARNING, ERROR, CRITICAL
  type_evenement        String
  message               String
  source                String?
  metadata              Json?
  timestamp             DateTime   @default(now())
  
  auditLog_id           String?
  auditLog              AuditLog?  @relation(fields: [auditLog_id], references: [id], onDelete: SetNull)
  
  @@index([niveau])
  @@index([type_evenement])
  @@index([timestamp])
}

model TableauBord {
  id                    String     @id @default(cuid())
  utilisateur_id        String
  utilisateur           User       @relation(fields: [utilisateur_id], references: [id], onDelete: Cascade)
  secretariat_id        String?
  
  periode               String?
  metriques             Json?
  
  alertes               Alerte[]
  
  dateCreation          DateTime   @default(now())
  dateModification      DateTime   @updatedAt
  
  @@unique([utilisateur_id])
}

model Alerte {
  id                    String     @id @default(cuid())
  tableaubord_id        String
  tableaubord           TableauBord @relation(fields: [tableaubord_id], references: [id], onDelete: Cascade)
  
  type                  AlertType
  titre                 String
  message               String
  statut                NotificationStatus @default(NEW)
  
  dateCreation          DateTime   @default(now())
  
  @@index([tableaubord_id])
}
```

---

## Entités Principales

### User
- Hiérarchie des utilisateurs (5 rôles)
- Support 2FA (TOTP)
- Multi-tenant (secretariat_id)

### Company
- Entreprise cliente
- Validation TVA unique par secrétariat
- Nombreux employés

### Employee
- Données RH
- Contrats multiples
- Fiches de paie mensuelles

### PaySlip (Core)
- Calculs automatisés
- Période unique par employé
- PDF + Email

### Subscription
- Plans Stripe
- Statuts (Active, Trial, Suspended, Cancelled)

---

## Relations

```
Secretariat (1) -----> (N) User
Secretariat (1) -----> (N) Company
Secretariat (1) -----> (1) Subscription

Company (1) -----> (N) Employee
Company (1) -----> (N) Contact

Employee (1) -----> (N) PaySlip
Employee (1) -----> (N) Contract
Employee (1) -----> (N) Absence

PaySlip (1) -----> (1) PayrollDetails
PaySlip (1) -----> (1) Document

Subscription (1) -----> (N) Payment
Payment (1) -----> (1) Invoice

Deadline (1) -----> (N) ComplianceTask
Deadline (1) -----> (N) Notification

OAuthToken (1) -----> (1) ExactOnlineSync
```

---

## Indexes

```sql
-- Performance Indexes
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_secretariat_id ON "User"(secretariat_id);

CREATE INDEX idx_company_secretariat_id ON "Company"(secretariat_id);
CREATE INDEX idx_company_numeroTVA ON "Company"(numeroTVA);
CREATE INDEX idx_company_statut ON "Company"(statut);

CREATE INDEX idx_employee_company_id ON "Employee"(company_id);
CREATE INDEX idx_employee_secretariat_id ON "Employee"(secretariat_id);

CREATE INDEX idx_payslip_employee_id ON "PaySlip"(employee_id);
CREATE INDEX idx_payslip_periode ON "PaySlip"(periode);
CREATE INDEX idx_payslip_statut ON "PaySlip"(statut);

CREATE INDEX idx_audit_log_timestamp ON "AuditLog"(timestamp);
CREATE INDEX idx_audit_log_type_entite ON "AuditLog"(type_entite);

CREATE INDEX idx_session_utilisateur_id ON "Session"(utilisateur_id);
CREATE INDEX idx_session_jeton ON "Session"(jeton);

CREATE INDEX idx_deadline_dateEcheance ON "Deadline"(dateEcheance);
CREATE INDEX idx_deadline_type ON "Deadline"(type);

-- Multi-tenant isolation
CREATE INDEX idx_message_conversation_id ON "Message"(conversation_id);
CREATE INDEX idx_notification_utilisateur_id ON "Notification"(utilisateur_id);
```

---

## Migrations

Chaque changement de schéma crée une migration:

```bash
# Create migration
npx prisma migrate dev --name add_new_field

# Apply migrations
npx prisma migrate deploy

# View migrations
npx prisma migrate status
```

---

## Performance Tips

1. **Always filter by secretariat_id** pour isolation multi-tenant
2. **Use indexes** sur fields de recherche fréquente
3. **Batch operations** plutôt que boucles individuelles
4. **Lazy load relations** avec `select` plutôt que `include`
5. **Archive old data** (audit_logs > 1 an, payslips > 7 ans)
6. **Connection pooling** via PgBouncer (max 10 connections/app)

---

**Database Version:** 1.0  
**Last Update:** 2025-04-16

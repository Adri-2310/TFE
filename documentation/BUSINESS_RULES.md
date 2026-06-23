# 📋 Règles Métier - WorkZen

**Version:** 1.0  
**Juridiction:** Belgique (Région Bruxelles)  
**Last Updated:** 2025-04-16

---

## Table des Matières

1. [Gestion des Entreprises](#gestion-des-entreprises)
2. [Gestion des Employés](#gestion-des-employés)
3. [Système de Paie](#système-de-paie)
4. [Conformité Belge](#conformité-belge)
5. [Gestion des Abonnements](#gestion-des-abonnements)
6. [Calendrier & Échéances](#calendrier--échéances)
7. [Règles de Sécurité](#règles-de-sécurité)

---

## Gestion des Entreprises

### Création d'une Entreprise

**Règles:**
- ✅ Numéro TVA **unique par secrétariat** (mais peut être dupliqué entre secrétariats différents)
- ✅ Format TVA obligatoire: `BE##.###.###.###` (exemple: BE0123456789)
- ✅ IBAN **optionnel** mais si fourni, doit être valide (15-18 caractères, conforme IBAN)
- ✅ Adresse **optionnelle** (peut être remplie plus tard)
- ✅ Secteur d'activité peut être NULL
- ✅ Nombre d'employés initialisé à 0 (mis à jour automatiquement)
- ✅ Statut initial: **ACTIF**

**Validation:**
```javascript
// TVA: Must match Belgian format
const tvaRegex = /^BE\d{10}$/;
if (!tvaRegex.test(numeroTVA)) {
  throw new ValidationError('TVA format invalid. Expected: BE##.###.###.###');
}

// IBAN: 15-18 chars, alphanumeric
const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{11,16}$/;
if (IBAN && !ibanRegex.test(IBAN)) {
  throw new ValidationError('IBAN format invalid');
}

// Check TVA uniqueness
const existing = await Company.findOne({
  where: { secretariat_id, numeroTVA }
});
if (existing) {
  throw new ConflictError('TVA already exists in this secretariat');
}
```

### Modification d'une Entreprise

**Champs modifiables:**
- ✅ IBAN
- ✅ Adresse
- ✅ Secteur
- ✅ Nombre d'employés
- ❌ **Numéro TVA (read-only)**
- ❌ **Nom (modifiable mais attention aux doublons potentiels)**

**Règles:**
- Une entreprise archivée **ne peut plus être modifiée**
- Archivage possible si: statut != ARCHIVE ET pas de fiches paie en cours

### Suppression/Archivage

**Règles:**
- ❌ **Suppression physique interdite** (RGPD)
- ✅ **Archivage** possible si:
  - Pas de fiches paie non-complétées
  - Pas d'employés actifs
  - Pas de contrats en cours

---

## Gestion des Employés

### Création d'un Employé

**Champs obligatoires:**
- Numéro national (Belgian National Number: 11 chiffres)
- Prénom
- Nom
- Salaire brut
- Type de contrat (CDI/CDD/STAGE/INTERIM)
- Date d'embauche

**Validations:**
```javascript
// National number: Belgian format (11 digits)
const nationalNumberRegex = /^\d{11}$/;
if (!nationalNumberRegex.test(numeroNational)) {
  throw new ValidationError('National number must be 11 digits');
}

// Uniqueness per secretariat
const existing = await Employee.findOne({
  where: { secretariat_id, numeroNational }
});
if (existing) {
  throw new ConflictError('National number already exists in this secretariat');
}

// Salary must be positive
if (salaire <= 0) {
  throw new ValidationError('Salary must be positive');
}
```

### Statuts des Employés

```
ACTIF
  ↓ (prend congé)
CONGE
  ↓ (retour)
ACTIF
  ↓ (fin contrat CDD)
INACTIF
  ↓ (archivage après 1 an)
ARCHIVE
```

**Règles:**
- Employé ACTIF: peut générer fiches paie
- Employé CONGE: fiches paie avec absence marquée
- Employé INACTIF: pas de nouvelles fiches paie
- Employé ARCHIVE: lectures seules, pas de modifications

### Contrats Employés

**Types de contrats:**
- **CDI** (Contrat à Durée Indéterminée)
  - dateFin = NULL
  - Durée indéfinie
  
- **CDD** (Contrat à Durée Déterminée)
  - Doit avoir dateFin
  - Durée ≤ 24 mois généralement
  
- **STAGE**
  - Durée courte (typiquement 2-3 mois)
  - Pas de cotisations ONSS complètes
  
- **INTERIM**
  - Durée variable
  - Via agence intérim

**Validations:**
```javascript
// CDD/STAGE must have end date
if (['CDD', 'STAGE'].includes(typeContrat) && !dateFin) {
  throw new ValidationError(`${typeContrat} contracts must have an end date`);
}

// End date must be after start date
if (dateFin && dateFin <= dateDebut) {
  throw new ValidationError('End date must be after start date');
}

// Start date should be on or after hire date
if (dateDebut < employee.dateEmbauche) {
  throw new ValidationError('Contract start date cannot be before hire date');
}
```

---

## Système de Paie

### Calcul des Cotisations

**ONSS Employé (13.07%)**
```
ONSS = Salaire Brut × 0.1307

Exemple:
Salaire Brut: 2500€
ONSS: 2500 × 0.1307 = 326.75€
```

**Précompte Professionnel (Progressif)**
```
Le précompte dépend du salaire NET après ONSS:
NET avant précompte = Brut - ONSS

Tranches 2025 (exemple):
- 0 - 1000€: 0%
- 1000 - 1500€: 8%
- 1500 - 2000€: 10%
- 2000€+: 12%

Exemple:
NET avant précompte: 2173.25€ (2500 - 326.75)
Précompte: (1500 - 1000) × 0.08 + (2173.25 - 1500) × 0.10
         = 40 + 67.32 = 107.32€
```

**Charges Employeur (~42%)**
```
Charges Employeur = Salaire Brut × 0.42

Exemple:
Charges: 2500 × 0.42 = 1050€
Coût total pour entreprise: 2500 + 1050 = 3550€
```

**Montant Net**
```
Net = Brut - ONSS - Précompte

Exemple:
Net = 2500 - 326.75 - 107.32 = 2066.93€
```

### Création Fiche de Paie

**Étapes:**

1. **Validation données entrantes**
   - Heures > 0 et < 200/mois
   - Salaire cohérent vs contrat
   - Pas de fiche doublon pour cette période

2. **Calcul automatique**
   - ONSS = 13.07% du brut
   - Précompte = calcul progressif
   - Net = Brut - ONSS - Précompte
   - Charges employeur = 42% du brut

3. **Génération PDF**
   - Template sécurisé
   - Avec tous les calculs visibles
   - Signature numérique optionnelle

4. **Envoi email**
   - Token temporaire (30 minutes)
   - Lien de téléchargement sécurisé
   - À l'employé + à l'entreprise

**Statuts:**
```
BROUILLON (créée, pas encore envoyée)
  ↓
VALIDEE (vérifiée par consultant)
  ↓
ENVOYEE (email envoyé avec PDF)
  ↓
ARCHIVEE (après 7 ans)
```

### Absences & Impact sur Paie

**Types d'absences:**
- **VACATION** (congés payés): Rémunéré normalement
- **MALADIE** (maladie couverte): Allocations chômage (80%)
- **PERSONNEL** (sans solde): Non rémunéré
- **SANS_SOLDE** (congé sans solde): Non rémunéré
- **ACCIDENT** (accident de travail): Indemnité

**Exemple avec absence:**
```
Contrat: 160 heures/mois (40h/semaine)

Cas 1: 1 semaine vacation (40 heures)
- Heures travaillées: 120
- Heures vacation: 40 (payées)
- Salaire: inchangé (vacation payée)

Cas 2: 1 semaine maladie (40 heures)
- Heures travaillées: 120
- Heures maladie: 40 (allocation 80%)
- Salaire: 120 * tauxHoraire + 40 * tauxHoraire * 0.80

Cas 3: 1 semaine sans solde (40 heures)
- Heures travaillées: 120
- Heures non-payées: 40
- Salaire: 120 * tauxHoraire (réduit)
```

---

## Conformité Belge

### ONSS (Office National de Sécurité Sociale)

**Déclaration ONSS Mensuelle:**
- ✅ À faire avant le **28 du mois** pour le mois précédent
- ✅ Contient: Nombre employés, salaires, cotisations
- ✅ Sanction: Amende si retard

**Workflow:**
```
Jour 1: Fiches paie créées
Jour 5: Déclaration générée automatiquement
Jour 20: Alerte "J-8" (deadline ONSS)
Jour 25: Alerte "J-3"
Jour 27: Alerte "J-1" (deadline demain!)
Jour 28: Deadline - Soumission obligatoire
Jour 29: Alerte si non complétée
```

### DIMONA (Déclaration Immédiate de Mise à l'Occupation)

**Règles:**
- ✅ À faire **avant ou le jour de l'embauche**
- ✅ Si non fait: **amende 100-1000€**
- ✅ Via API ONSS
- ✅ Confirmation immédiate

**Données transmises:**
- Données employé (nom, prénom, national number)
- Date début contrat
- Type de contrat
- Salaire

### Certificat C4 (Certificat de Chômage)

**Règles:**
- ✅ Généré automatiquement pour **licenciements**
- ✅ À envoyer à l'ONEM dans les **5 jours**
- ✅ Contient: Raison fin contrat, durée travail, salaires

**Workflow:**
```
Jour 1: Licenciement enregistré
Jour 2: C4 généré automatiquement
Jour 3-5: Envoi ONEM
Jour 6-10: ONEM accusé réception
```

### TVA & Comptabilité

**Régulation:**
- ✅ Fiches paie = écritures comptables
- ✅ Sync automatique avec Exact Online
- ✅ Déclaration TVA mensuelle/trimestrielle (selon CA)

---

## Gestion des Abonnements

### Plans

| Plan | Prix/mois | Entreprises | Utilisateurs | Storage | Intégrations |
|------|-----------|-------------|--------------|---------|--------------|
| **Starter** | 150€ | 25 | 3 | 5GB | Stripe only |
| **Pro** | 300€ | 100 | 10 | 25GB | + Exact Online |
| **Enterprise** | 750€ | ∞ | ∞ | 100GB | + White-label |

### Limites Plan

**Enforcement:**
```javascript
// Check limits before creating resource
const subscription = await Subscription.findActive(secretariat_id);
const planLimits = getPlanLimits(subscription.plan_id);

const companyCount = await Company.count({ where: { secretariat_id } });
if (companyCount >= planLimits.maxEntreprises) {
  throw new PlanLimitError('Company limit reached. Upgrade your plan.');
}
```

### Upgrade/Downgrade

**Règles:**
- ✅ Upgrade: Immédiat, proratisé au prorata temporis
- ✅ Downgrade: À partir de la prochaine période de facturation
- ✅ Si downgrade sous-utilisation: Avertissement utilisateur

**Exemple Upgrade:**
```
Plan actuel: Starter (150€/mois)
Date upgrade: 16/04/2025 (moyen du mois)
Nouvel plan: Pro (300€/mois)

Calcul:
- Jours restants Starter (16-30 avril): 14 jours
- Jours restants Pro (16-30 avril): 14 jours
- Crédit Starter: 150 × (14/30) = 70€
- Coût Pro: 300 × (14/30) = 140€
- Montant: 140 - 70 = 70€

Prochaine facturation: 16/05/2025
```

### Cancellation

**Règles:**
- ✅ Cancellation immédiate
- ✅ Pas de remboursement
- ✅ Données conservées 30 jours (RGPD)
- ✅ Après 30 jours: Suppression

---

## Calendrier & Échéances

### Deadlines Récurrentes

**Types:**
```
ONSS: Mensuel, 28ème jour du mois, alerte J-7/J-3/J-1
DIMONA: À l'embauche + récurrente si contrats spéciaux
C4: Lors de licenciements (non récurrente)
TAX: Annuel ou trimestriel selon secteur
SALARY_DEADLINE: Avant 10ème jour du mois (paie mois N)
```

**Calcul des Deadlines:**
```javascript
// Calculate next ONSS deadline
function getNextONSSDeadline() {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // ONSS deadline: 28th of current month
  const deadline = new Date(currentYear, currentMonth, 28, 23, 59, 59);
  
  // If already past, next month
  if (deadline < today) {
    deadline.setMonth(deadline.getMonth() + 1);
  }
  
  return deadline;
}
```

### Alertes & Notifications

**Règles:**
- ✅ J-7: Premier rappel (email + in-app notification)
- ✅ J-3: Deuxième rappel
- ✅ J-1: Dernier rappel (CRITICAL)
- ✅ J+1: Alerte "deadline dépassée"

---

## Règles de Sécurité

### Permissions par Rôle

**SuperAdmin:**
- ✅ Voir tous les secrétariats
- ✅ Gérer utilisateurs globaux
- ✅ Configuration système
- ❌ Pas d'accès aux données clients

**AdminSecretariat:**
- ✅ Gestion personnel (consultants)
- ✅ Gestion abonnement
- ✅ Dashboard secretariat
- ❌ Pas d'accès données clients finales

**Consultant:**
- ✅ Gestion entreprises (CRUD)
- ✅ Gestion employés
- ✅ Génération fiches paie
- ✅ Conformité ONSS/DIMONA/C4
- ❌ Pas d'accès portail client

**ClientUser:**
- ✅ Voir fiches paie employés
- ✅ Voir liste employés
- ✅ Télécharger documents
- ✅ Messagerie avec consultant
- ❌ Pas d'accès données autres clients

**EmployeeUser:**
- ✅ Voir SA fiche paie
- ✅ Télécharger documents personnels
- ✅ Support FAQ
- ❌ Pas d'accès données autres employés

### Isolation Multi-Tenant

**Règle: JAMAIS de fuite de données entre secrétariats**

```javascript
// TOUJOURS filtrer par secretariat_id
async function getCompanies(secretariat_id) {
  return db.company.findMany({
    where: { secretariat_id } // OBLIGATOIRE
  });
}

// ❌ INTERDIT
async function getCompanies() {
  return db.company.findMany(); // Pas de filtre!
}

// API call
GET /api/companies?secretariat_id=sec_123 // OK
GET /api/companies/comp_456?secretariat_id=sec_123 // Vérifie ownership
```

---

**Business Rules Version:** 1.0  
**Last Update:** 2025-04-16  
**Jurisdiction:** Belgium (Brussels Region)

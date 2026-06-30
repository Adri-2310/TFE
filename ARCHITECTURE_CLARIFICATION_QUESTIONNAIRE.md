# 🏗️ SocialFlow - Clarification Architecture Complète

**Date:** 2026-06-26  
**Objectif:** Finaliser l'architecture avant refactorisation des maquettes

---

## 📋 Instructions

**Comment remplir ce questionnaire:**
1. Lis chaque question attentivement
2. Pour les cases à cocher `[ ]`, mets une croix: `[x]`
3. Pour les champs libre, remplace `___` par ta réponse
4. Pour les choix uniques, garde seulement la/les option(s) sélectionnée(s)
5. Pour les ambigu, ajoute des notes/explications en `// Commentaire`

**Sections:**
- Phase 1: Structure Hiérarchique (4 questions)
- Phase 2: Rôles & Permissions (4 questions)
- Phase 3: Workflows d'Invitation (5 questions)
- Phase 4: Données & Isolation (3 questions)
- Phase 5: Abonnement & Facturation (5 questions)
- Phase 6: Workflows Métier (4 questions)
- Phase 7: Analytics & Reporting (3 questions)
- Phase 8: Sécurité & Conformité (5 questions)
- Phase 9: Cas Limites & Exceptions (5 questions)
- Phase 10: Portails & Interfaces (2 questions)

---

# PHASE 1: STRUCTURE HIÉRARCHIQUE

## Q1.1: Confirmes-tu la structure hiérarchique?

```
Cabinet RH (1 par abonnement Stripe)
├── Gestionnaire RH (N par Cabinet)
│   └── Entreprise Cliente (M par Gestionnaire, assignées)
│       └── Collaborateur (X par Entreprise)
```

- [x] OUI, c'est exactement ça
- [ ] NON, voir commentaire: ___

// Commentaire: ___

---

## Q1.2: Un Gestionnaire RH gère combien d'Entreprises?

- [ ] 1 seule Entreprise Cliente fixe
- [X] Plusieurs Entreprises Clientes assignées (peut changer)
- [ ] Toutes les Entreprises du Cabinet
- [ ] Autre: mais en cas de maladie longue durée du gestionnaire ? 

// Détail: ___

---

## Q1.3: Peut-on réassigner un Gestionnaire d'une Entreprise à une autre?

- [X] Oui, dynamiquement (n'importe quand)
- [ ] Oui, mais seulement au début du mois
- [ ] Oui, mais impact: ___ // (ex: qui reprend fiches paie?)
- [ ] Non, une fois assigné c'est permanent

// Détail: ___

---

## Q1.4: Plusieurs Gestionnaires sur la même Entreprise?

- [X] Non, 1 Gestionnaire = 1 Entreprise (unique)
- [ ] Oui, co-gestion (tous accès complet)
- [ ] Oui, mais rôles différents (lead + backup)
  - Lead peut: ___
  - Backup peut: ___
- [ ] Oui, mais permissions granulaires (détail): ___

// Détail: ___

---

# PHASE 2: RÔLES & PERMISSIONS

## Q2.1: CABINET RH - Quels droits? (Cocher toutes les permissions)

**Gestion Équipe Interne:**
- [X] Créer/Inviter Gestionnaires
- [X] Éditer Gestionnaires (nom, email, permissions)
- [X] Supprimer Gestionnaires
- [X] Assigner Gestionnaires à Entreprises
- [X] Voir tous les Gestionnaires
- [ ] Voir les pairs (autres Cabinet RH)? [ ] OUI [X] NON

**Gestion Entreprises Clientes:**
- [ ] Créer Entreprises Clientes
- [ ] Éditer Entreprises Clientes
- [ ] Supprimer Entreprises Clientes
- [ ] Inviter Entreprises Clientes (bypass Gestionnaire)? [?] OUI [?] NON

**Gestion Données:**
- [ ] Voir données toutes Entreprises
- [ ] Éditer fiches paie d'une Entreprise
- [ ] Créer Collaborateurs
- [ ] Inviter Collaborateurs directement? [ ] OUI [ ] NON
- [ ] Supprimer Collaborateurs
- [ ] Voir/Éditer infos bancaires Collaborateurs? [ ] OUI [ ] NON

**Administratif:**
- [X] Accès Stripe Portal (billing, upgrade plan)? [X] OUI [ ] NON
- [x] Voir analytics globales? [X] OUI [ ] NON
- [ ] Exporter données toutes Entreprises? [ ] OUI [ ] NON
- [ ] Voir audit logs toutes Entreprises? [ ] OUI [ ] NON

**Autre:** ___

// Commentaire: ___

---

## Q2.2: GESTIONNAIRE RH - Quels droits? (Cocher toutes)

**Gestion Entreprises:**
- [X] Créer nouvelles Entreprises Clientes
- [X] Éditer Entreprises assignées (nom, VAT, adresse)
- [X] Supprimer Entreprises assignées
- [X] Inviter Collaborateurs
- [ ] Voir Gestionnaires autres (pairs)? [ ] OUI [ ] NON

**Gestion Données:**
- [ ] Créer Collaborateurs dans Entreprises assignées
- [ ] Éditer Collaborateurs
- [ ] Supprimer Collaborateurs
- [x] Générer fiches paie? [x] OUI [ ] NON
- [x] Éditer fiches paie? [x] OUI [ ] NON
- [ ] Valider fiches paie? [ ] OUI [ ] NON
- [x] Voir données Entreprises assignées seulement? [x] OUI [ ] NON
- [x] Accès analytics Entreprises assignées? [x] OUI [ ] NON
- [x] Exporter données Entreprises assignées? [x] OUI [ ] NON

**Autre:** ___

// Commentaire: ___

---

## Q2.3: ENTREPRISE CLIENTE - Quels droits? (Cocher toutes)

**Self-Service:**
- [x] Voir/Éditer ses infos (VAT, adresse, contact)
- [x] Créer Collaborateurs
- [x] Éditer Collaborateurs
- [x] Supprimer Collaborateurs
- [x] Inviter Collaborateurs soi-même

**Fiches Paie:**
- [x] Voir fiches paie de ses Collaborateurs
- [ ] Peut éditer fiches paie? [ ] OUI [ ] NON
- [x] Télécharger fiches paie (PDF)
- [x] Valider fiches paie? [x] OUI [ ] NON

**Dashboard & Export:**
- [x] Accès dashboard personnel
- [x] Exporter données (RGPD)
- [x] Voir analytics ses Collaborateurs? [x] OUI [ ] NON

**Communication:**
- [x] Messagerie avec Gestionnaire RH
- [ ] Voir Collaborateurs autres (pairs)? [ ] OUI [x] NON

**Autre:** ___

// Commentaire: ___

---

## Q2.4: COLLABORATEUR - Quels droits? (Cocher toutes)

- [x] Voir sa fiche paie personnelle
- [x] Télécharger fiche paie (PDF)
- [x] Éditer ses infos (adresse, banque, etc.)
- [x] Upload documents (certificats, etc.)
- [x] Accès messagerie
- [ ] Voir autres Collaborateurs de son Entreprise
- [x] Exporter ses données personnelles (RGPD)
- [ ] Autre: ___

// Commentaire: ___

---

# PHASE 3: WORKFLOWS D'INVITATION

## Q3.1: CABINET RH - Comment est créé?

- [ ] Signup self-service (landing page + Stripe checkout)
- [ ] Création manuelle par SuperAdmin seulement
- [x] Hybride (auto-signup possible + SuperAdmin peut créer)
- [ ] Autre: ___

// Détail processus: ___

---

## Q3.2: GESTIONNAIRE RH - Workflow d'invitation?

**Qui envoie?**
- [x] Cabinet RH via email invite
- [ ] Lien unique (Better Auth + token)

**Gestionnaire crée compte:**
- [x] Choisit MDÉ (obligatoire)
- [x] Ajoute OAuth après? [x] OUI [ ] NON
- [x] Peut utiliser OAuth directement au lieu de MDÉ? [x] OUI [ ] NON

**Lien Invite:**
- [ ] TTL = ___ jours
- [ ] One-time use? [ ] OUI [ ] NON (réutilisable)
- [x] Après acceptation, lien devient invalide? [x] OUI [ ] NON

// Détail: ___

---

## Q3.3: ENTREPRISE CLIENTE - Qui envoie l'invite?

- [ ] Cabinet RH directement
- [x] Gestionnaire RH assigné
- [ ] Les deux possibles
- [ ] Autre: ___

**Lien Invite:**
- [ ] TTL = ___ jours
- [x] One-time use? [x] OUI [ ] NON

**Entreprise crée compte:**
- [x] Admin Entreprise remplit ses infos
- [x] Choisit MDÉ
- [x] Ajoute OAuth après? [x] OUI [ ] NON

// Détail: ___

---

## Q3.4: COLLABORATEUR - Qui envoie l'invite?

- [x] Entreprise Cliente directement
- [x] Gestionnaire RH
- [ ] Cabinet RH
- [ ] Autre: ___

**Lien Invite:**
- [ ] TTL = ___ jours
- [x] One-time use? [x] OUI [ ] NON

**Collaborateur crée compte:**
- [x] Choisit MDÉ
- [x] Ajoute OAuth après? [x] OUI [ ] NON

// Détail: ___

---

## Q3.5: Email Invitation - Contenu & Branding

**Template Email:**
- [x] Émetteur = "SocialFlow"
- [x] Émetteur = nom du Cabinet RH (branding)
- [x] Émetteur = nom de Gestionnaire RH
- [x] Autre: tous dépend de l'acteur donc pour admin-secrétariat si le superadmin créer son comtpe par téléphonne et non par la page par example bah émetteur "SocialFlow" tu comprends ?

**Contenu:**
- [x] Contient lien unique
- [ ] Contient MDÉ temporaire? [ ] OUI [ ] NON
- [x] Contient instructions
- [x] Branding personnalisé par Cabinet? [x] OUI [ ] NON

**Gestion:**
- [x] Cabinet peut renvoyer invite si expiré? [x] OUI [ ] NON
- [x] Collaborateur peut renvoyer invite? [x] OUI [ ] NON
- [x] Max tentatives avant blocage? 5 et avertissement après 3 (ou pas de limite)

// Commentaire: ___

---

# PHASE 4: DONNÉES & ISOLATION MULTI-TENANT

## Q4.1: Isolation - Règles strictes?

- [x] Cabinet A ne JAMAIS voit Cabinet B? [x] OUI
- [x] Gestionnaire voit SEULEMENT Entreprises assignées? [x] OUI
- [x] Entreprise A ne JAMAIS voit Entreprise B (même Cabinet)? [x] OUI
- [x] Collaborateur voit SEULEMENT ses données? [x] OUI

// Commentaire: donc isolation par user

---

## Q4.2: Données Sensibles - Qui peut voir quoi?

**Complète le tableau (OUI/NON/?)**

| Données | SuperAdmin | Cabinet RH | Gestionnaire | Entreprise | Collaborateur |
|---------|-----------|-----------|--------------|-----------|---------------|
| Fiches paie | AUDIT | RO | OUI | OUI | RO (propre) |
| Salaires (montants) | AUDIT | RO | OUI | OUI | RO (propre) |
| NISS | AUDIT | NON | NON | RO | NON |
| Infos bancaires (IBAN/BIC) | AUDIT | NON | RO | RO | NON |
| Contrats de travail | AUDIT | RO | OUI | OUI | RO (propre) |
| Emails Collaborateurs | AUDIT | OUI | OUI | OUI | NON (propre) |
| Audit logs | OUI | RO | RO (filtré) | RO (filtré) | NON |
| Autres donnés sensibles: Photos/Info personnelles | NON | RO | OUI | OUI | OUI (propre) |

---

## Q4.3: Sécurité Export/Import

- [?] Cross-Cabinet data leak possible? ⚠️ À vérifier via RLS PostgreSQL
- [?] Audit trail pour lecture données sensibles? [ ] OUI [ ] NON
- [?] Encryption at rest pour données sensibles? [ ] OUI [ ] NON
- [?] Encryption en transit? [ ] OUI [ ] NON (HTTPS obligatoire)

// Détail: ___

---

# PHASE 5: ABONNEMENT & FACTURATION

## Q5.1: Confirmes-tu les plans Stripe?

**Starter: 150€/mois**
- [ ] 25 Entreprises Clientes
- [ ] 5 Gestionnaires
- [ ] 20GB stockage
- [ ] Correct? [x] OUI [ ] NON
- [ ] Autre: ___

**Pro: 300€/mois**
- [ ] 100 Entreprises Clientes
- [ ] 15 Gestionnaires
- [ ] 60GB stockage
- [ ] Correct? [x] OUI [ ] NON
- [ ] Autre: ___

**Enterprise: Custom**
- [ ] ∞ Entreprises
- [ ] ∞ Gestionnaires
- [ ] ∞ Stockage
- [ ] Correct? [x] OUI [ ] NON
- [ ] Autre: ___

---

## Q5.2: Quota Enforcement - Comment appliquer les limites?

**Si limite atteinte:**
- [ ] STRICT: Erreur immédiate, impossible créer
- [x] SOFT: Warning (>90%), mais toujours possible
- [x] GRACE: Avertissement 14j, puis blocage
- [ ] Autre: ___

**Exemple Starter limite 25 Entreprises:**
- Si Cabinet a 25 Entreprises et crée 26ème:
  - [ ] Erreur immédiate
  - [x] Warning message
  - [x] Autre: email

// Détail: message notification et mail

---

## Q5.3: Upgrade Plan (Starter → Pro)

- [x] Cabinet peut upgrade via Stripe Portal? [x] OUI [ ] NON
- [?] Proration automatique? [ ] OUI [ ] NON
- [?] Nouveaux quotas actifs immédiatement? [ ] OUI [ ] NON
- [?] Exemple: Stripe charge (___ €) pour upgrade Starter→Pro en cours de mois? [ ] OUI

// Détail: je dirais terminé le mois et activé nouvelle formule le mois suivant

---

## Q5.4: Downgrade Plan (Pro → Starter)

**Pro a 60 Entreprises, downgrade à Starter (25 limit):**

- [ ] BLOCAGE: Erreur jusqu'à suppression Entreprises
- [x] GRACE: 30j avant blocage, avertissements
- [x] AUTO-ARCHIVE: Entreprises 26-60 archivées automatiquement
- [x] Autre: backups en cas de mauvaise manipulation

**Cabinet peut downgrade?**
- [ ] OUI, n'importe quand
- [x] OUI, mais fin de mois
- [ ] NON, impossible
- [ ] Autre: demande peut se faire n'importe quand mais actif a la fin du mois

// Détail: ___

---

## Q5.5: Payment Failure (Carte échouée)

**Si paiement Stripe échoue:**

**Quand est-ce bloqué?**
- [ ] Immédiatement
- [ ] Après 3 tentatives Stripe
- [ ] Après 7 jours
- [x] Après 14 jours
- [x] Autre: mais avertissement avant par mail et notification 

**Qu'est-ce qui est bloqué?**
- [x] Tout (lecture + écriture)
- [ ] Écriture seulement (lecture OK)
- [ ] Création/Invite seulement
- [x] Autre: plus notifaction cause du blocage

**Notifications:**
- [x] Email jour 1 (paiement échoué)? [x] OUI [ ] NON
- [x] Email jour 7 (avant blocage)? [x] OUI [ ] NON
- [ ] SMS aussi? [ ] OUI [ ] NON

// Détail: ___

---

# PHASE 6: WORKFLOWS MÉTIER

## Q6.1: Fiches Paie - Permissions par action

**Complète le tableau:**

| Action | Cabinet | Gestionnaire | Entreprise | Collaborateur |
|--------|---------|--------------|-----------|---------------|
| Créer fiche paie | non | oui |  non | ❌ |
| Éditer fiche paie | non | oui | non | ❌ |
| Valider fiche paie | non | non | oui | ❌ |
| Rejeter fiche paie | non | non | oui | ❌ |
| Télécharger PDF | non | oui | oui | ✅ |
| Envoyer à Collaborateur | non | oui | oui | ❌ |
| Voir historique fiches | non | ✅ | oui | ✅ |

// Commentaire: le cavinet rh gère son cabinet et gestionnaire rh gère ses entreprise et collaborateur

---

## Q6.2: Employees (Collaborateurs) - Qui crée/édite/supprime?

**Créer Employee:**
- [ ] Cabinet seulement
- [ ] Cabinet + Gestionnaire
- [x] Cabinet + Gestionnaire + Entreprise
- [x] Autre: Cabinet ne voit pas les collaborateurs mais entreprise oui et gestionnaire vue complète sur entreprise et collaborateur

**Éditer Employee:**
- [ ] Cabinet seulement
- [x] Gestionnaire assigné
- [ ] Entreprise
- [x] Employee (soi-même)? [x] OUI pour ses données [ ] NON
- [x] Autre: entreprise peut voir les données mais pas de l'employee seulement

**Éditer Contrat:**
- [x] Cabinet seulement
- [ ] Gestionnaire
- [ ] Entreprise
- [ ] Autre: ___

**Supprimer/Archiver Employee:**
- [ ] Cabinet seulement
- [x] Gestionnaire
- [ ] Entreprise
- [ ] Autre: ___

// Détail: ___

---

## Q6.3: Documents

**Upload:**
- [x] Gestionnaire peut upload pour Entreprises assignées? [x] OUI [ ] NON
- [x] Entreprise peut upload propres documents? [x] OUI [ ] NON
- [x] Collaborateur peut upload (certificats, etc.)? [x] OUI [ ] NON

**Suppression:**
- [x] Qui supprime documents? (Cabinet / Gestionnaire / Entreprise / Autre: ___)

**Visualisation:**
- [x] Gestionnaire voit tous documents Entreprises assignées? [ ] OUI [ ] NON
- [x] Collaborateur voit propres documents? [x] OUI [ ] NON

// Détail: ___

---

## Q6.4: Messagerie Interne

**Qui peut envoyer messages à qui?**

- [ ] Cabinet ↔ Gestionnaire? [ ] OUI [ ] NON
- [ ] Cabinet ↔ Entreprise? [ ] OUI [ ] NON
- [x] Gestionnaire ↔ Entreprise? [x] OUI [ ] NON
- [x] Entreprise ↔ Collaborateur? [x] OUI [ ] NON
- [x] Collaborateur ↔ Collaborateur (même Entreprise)? [x] OUI [ ] NON
- [ ] Autre: ___

**Historique:**
- [ ] Messages conservés indéfiniment? [ ] OUI
- [x] Suppression après X jours: 60 jours
- [ ] Peut supprimer propres messages? [ ] OUI [ ] NON

// Détail: ___

---

# PHASE 7: ANALYTICS & REPORTING

## Q7.1: Dashboards - Qui voit quoi?

**Complète le tableau:**

| Dashboard | SuperAdmin | Cabinet RH | Gestionnaire | Entreprise |
|-----------|-----------|--------|--------------|-----------|
| Monitoring plateforme (status, API) | OUI | NON | NON | NON |
| Audit Cabinets (usage, violations) | OUI | NON | NON | NON |
| Productivité Cabinet | NON | OUI | NON | NON |
| Productivité Gestionnaire | NON | OUI (ses gestionn.) | RO (soi-même) | NON |
| Charges sociales | AUDIT | RO (ses entrep.) | RO (ses entrep.) | RO (propre) |
| Benchmark vs autres Cabinets | NON | PARTIAL (anonymisé) | NON | NON |
| KPIs Entreprise | NON | RO (ses entrep.) | RO (ses entrep.) | OUI (propre) |

// Commentaire: SuperAdmin = monitoring plateforme uniquement. Cabinet/Gestionnaire/Entreprise = voir ses propres données

---

## Q7.2: Rapports Exportables

**Qui peut exporter?**
- [x] Cabinet: ___
- [ ] Gestionnaire: ___
- [x] Entreprise: ___
- [ ] Collaborateur: ___

**Formats disponibles:**
- [x] CSV
- [x] PDF
- [?] Excel
- [ ] Autre: ___

**Filtres possibles:**
- [x] Par date
- [x] Par Gestionnaire
- [x] Par Entreprise
- [x] Par Collaborateur
- [ ] Autre: smart filtres

// Détail: ___

---

## Q7.3: Audit Logs - Qui peut voir?

**Accès audit logs:**

| Rôle | Voir tous | Voir ses données | Voir Entreprises assignées |
|------|-----------|------------------|--------------------------|
| SuperAdmin | ✅ | - | - |
| Cabinet | ? | oui | - |
| Gestionnaire | ❌ | oui | oui |
| Entreprise | ❌ | oui | - |
| Collaborateur | ❌ | oui | - |

**Détail actions loggées:**
- [x] Connexions (qui, quand, IP)?
- [x] Modifications fiches paie?
- [x] Modifications employees?
- [x] Uploads documents?
- [ ] Messages?
- [x] Accès données sensibles?
- [x] Exports/Imports?
- [ ] Autres: ___

// Commentaire: ___

---

# PHASE 8: SÉCURITÉ & CONFORMITÉ

## Q8.1: Authentification à Deux Facteurs (2FA)

**Obligation:**
- [ ] Obligatoire tout le monde
- [ ] Obligatoire Cabinet + Gestionnaire
- [ ] Optionnel pour Collaborateur
- [x] Autre: conseil pas obligatoire

**Méthodes:**
- [x] Email (code 6 digits)
- [x] Authenticator (TOTP)
- [ ] SMS
- [x] Autre: ___

**Backup codes:**
- [x] Fournis si 2FA perdu? [x] OUI [ ] NON

// Détail: mais avec sécurité pour confirmé identité

---

## Q8.2: OAuth Optionnel

**Confirmation:**
- [x] OAuth est conseillé mais pas obligatoire? [x] OUI
- [x] Providers disponibles: [x] Google [x] Microsoft [?] Autre: ___

**Combinaison:**
- [x] Possible combiner MDÉ + OAuth sur même compte? [x] OUI [ ] NON
- [x] Si oui: Lien automatique si même email? [x] OUI [ ] NON

// Détail: ___

---

## Q8.3: Sessions

**TTL Session:**
- [x] 8 heures

**Timeout inactivité:**
- [x] 60 minutes

**Refresh Token TTL:**
- [x] 24 heure

**Autre:**
- [x] Remember me (30j)? [x] OUI [ ] NON
- [x] Logout de toutes devices si MDÉ changé? [x] OUI [ ] NON

// Détail: Access token 1h + Refresh token 24j (long session) + Inactivité 60min

---

## Q8.4: RGPD - Droit d'Accès & Oubli

**Droit d'accès:**
- [x] Collaborateur peut télécharger ses données? [x] OUI [ ] NON
- [x] Entreprise peut télécharger ses données? [x] OUI [ ] NON
- [x] Cabinet peut télécharger ses données? [x] OUI [ ] NON
- [x] Format: [x] JSON [x] CSV [x] PDF [ ] Autre: ___

**Right to be forgotten:**
- [ ] Qui peut supprimer compte + données? (Rôle: ___)
- [x] Délai retention après suppression: 60 jours
- [x] Données archivées ou vraiment supprimées? [x] Archivées [ ] Supprimées

**Audit trail:**
- [x] Export audit logs possible? [x] OUI [ ] NON

// Détail: ___

---

## Q8.5: Password Reset & Security

**Password Reset:**
- [ ] Link TTL: ___ heures
- [x] One-time use? [x] OUI [ ] NON
- [x] Notification login d'une autre IP après reset? [x] OUI [ ] NON

**Password Policy:**
- [x] Min length: 12 caractères
- [x] Requires: [x] Majuscules [x] Chiffres [x] Caractères spéciaux
- [x] Password history (ne pas réutiliser): ___ anciens passwords

**Rate limiting:**
- [x] Max tentatives login: 5 avant blocage
- [x] Durée blocage: 5 minutes

// Détail: ___

---

# PHASE 9: CAS LIMITES & EXCEPTIONS

## Q9.1: Gestionnaire Supprimé

**Scénario:** Gestionnaire est supprimé du Cabinet

**Ses Entreprises assignées:**
- [x] Réassignées automatiquement à... (qui? ___)
- [x] Réassignment manuel obligatoire
- [ ] Restent orphelines (aucun Gestionnaire)
- [ ] Autre: ___

**Ses fiches paie en cours:**
- [x] Qui terminent? (Cabinet / Autre Gestionnaire / Bloqué?)

**Ses Collaborateurs:**
- [x] Gardent accès? [x] OUI [ ] NON
- [ ] Supprimés aussi? [x] NON
- [ ] Archivés? [x] NON

// Détail: ___

---

## Q9.2: Entreprise Supprimée

**Scénario:** Cabinet supprime une Entreprise Cliente

**Ses Collaborateurs:**
- [x] Supprimés aussi
- [x] Archivés (conservés, mais inactifs)
- [x] Conservés (orphelins)
- [ ] Autre: ___

**Ses fiches paie:**
- [ ] Supprimées immédiatement
- [x] Archivées indéfiniment (audit trail)
- [x] Supprimées après X jours: 90 jours
- [x] Conservées 7 ans (légal)?

**Ses documents:**
- [ ] Supprimés
- [x] Archivés
- [ ] Autre: ___

// Détail: ___

---

## Q9.3: Changement de Gestionnaire en Cours de Mois

**Scénario:** Entreprise est réassignée d'un Gestionnaire A à Gestionnaire B le 15 du mois

**Fiche paie partielle:**
- [x] Gestionnaire A génère (jours 1-14)
- [x] Gestionnaire B génère (jours 15-30)
- [ ] Un seul génère, proration?
- [ ] Autre: ___

**Qui approuve?**
- [ ] A approve sa partie, B approve sa partie?
- [x] Cabinet approve tout?
- [ ] Autre: ___

**Audit trail:**
- [x] Quoi de loggé? (A a créé jours 1-14, B a créé jours 15-30, etc.)

// Détail: ___

---

## Q9.4: Cabinet Downgrade de Plan

**Scénario:** Cabinet Pro (100 Entreprises) downgrade à Starter (25 Entreprises). Cabinet a 60 Entreprises actuellement.

**Entreprises en excédent (26-60):**
- [x] BLOCAGE: Erreur, impossible downgrade. Cabinet doit réduire.
- [ ] GRACE PERIOD: 30 jours avant blocage. Avertissements quotidiens.
- [ ] AUTO-ARCHIVE: Entreprises 26-60 auto-archivées.
- [ ] Autre: ___

**Pendant grace period:**
- [x] Accès complet? [x] OUI [ ] NON
- [ ] Lecture seulement? [ ] OUI
- [ ] Bloqué? [ ] NON

**Après grace period:**
- [x] Auto-archivage? [x] OUI
- [ ] Suppression? [ ] NON
- [ ] Blocage complet? [ ] NON

// Détail: ___

---

## Q9.5: Invitations Multiples & Expiration

**Même email invité 2 fois:**
- [ ] Nouvelle invite envoie nouveau lien (l'ancien reste valide)
- [x] Nouvelle invite annule l'ancienne
- [ ] Autre: ___

**Invite expirée:**
- [ ] Personne peut relancer invite? (Qui: ___)
- [ ] Lien est définitivement mort?
- [ ] Autre: ___

**Invite acceptée:**
- [x] Lien devient immédiatement inutile? [x] OUI [ ] NON
- [ ] Peut réutiliser pour créer 2e compte? [ ] NON
- [ ] Autre: ___

**Max invites active:**
- [ ] Limit par Cabinet? ___ invitations
- [ ] Limit par Gestionnaire? ___ invitations
- [x] Pas de limite
- [ ] Autre: ___

// Détail: ___

---

# PHASE 10: PORTAILS & INTERFACES

## Q10.1: Combien de portails distincts?

- [x] 1 portail unique (tout le monde)
- [ ] 2 portails:
  - [ ] "Dashboard Admin" (SuperAdmin + Cabinet + Gestionnaire)
  - [ ] "Portal Client" (Entreprise + Collaborateur)
- [ ] 3 portails:
  - [ ] SuperAdmin
  - [ ] Cabinet RH
  - [ ] Client (Entreprise + Collaborateur)
- [ ] 4+ portails (chaque rôle séparé)
- [ ] Autre: ___

**Justification:** ___

---

## Q10.2: Design & Responsive

**Responsive Design:**
- [ ] Desktop seulement
- [x] Desktop + Mobile optimisé (responsive)
- [ ] Desktop + Progressive Web App (PWA)
- [ ] Desktop + App mobile native (iOS/Android)? ← NON (maquettes HTML)
- [ ] Autre: ___

**Navigation:**
- [x] Sidebar (desktop) + Mobile menu (hamburger)
- [ ] Top navbar seulement
- [ ] Autre: ___

// Détail: ___

---

# 📋 RÉSUMÉ - À COMPLÉTER

## Questions Prioritaires (Réponds EN PRIORITÉ)

**Tier 1 (CRITIQUE) - Réponds d'abord:**

- [ ] Q1.1: Structure hiérarchique confirmée?
- [ ] Q1.2: Gestionnaire gère combien Entreprises?
- [ ] Q3: Workflows invitation (qui envoie à qui)?
- [ ] Q2.1/Q2.2/Q2.3/Q2.4: RBAC complet
- [ ] Q5: Quotas et plans Stripe

**Tier 2 (IMPORTANT) - Ensuite:**

- [ ] Q4: Isolation données
- [ ] Q6: Workflows métier (fiches paie, employees)
- [ ] Q8: Sécurité (2FA, RGPD)

**Tier 3 (DÉTAILS) - Finalement:**

- [ ] Q7: Analytics
- [ ] Q9: Edge cases
- [ ] Q10: Portails

---

## Instructions Finales

**Une fois rempli:**

1. Sauvegarde ce fichier rempli
2. Renvoie-le moi
3. Je vais créer:
   - **Architecture Diagram** (ASCII + explications)
   - **RBAC Matrix finale** (permissions par rôle)
   - **Workflows Diagrams** (invitation, auth, métier)
   - **Schema Prisma** (adapted à tes réponses)
   - **Roadmap d'implémentation** (en fonction architecture)

---

**Questions? Besoin de clarifications sur une question?**

Réponds directement en commentaire `// ...` dans la question!

Good luck! 💪🎯

## Cas d'Utilisation Employé

> **Note importante sur le rôle Employé :**
> Le rôle Employé représente le **salarié** d'une entreprise cliente du secrétariat social. L'Employé accède à un portail sécurisé pour consulter ses fiches de paie et ses informations personnelles. L'Employé n'a qu'un accès **en lecture seule** à ses données et ne peut rien modifier.

> **Note importante sur l'accès :**
> Chaque Employé ne peut consulter que **ses propres données** (fiche de paie personnelle, contrat, informations). L'Employé n'a accès qu'à son dossier individuel et ne peut pas voir les informations des autres employés ou de l'entreprise en général.

---

### Catégorie 1 : Authentification

#### UC-05-00 : Se connecter

**Acteur principal :** Employé
**Prérequis :** Compte Employé créé par le Consultant
**Déclencheur :** Employé accède au portail

**Scénario nominal :**
1. Le système affiche le formulaire de connexion
2. L'Employé saisit ses identifiants (email + mot de passe)
3. Le système authentifie l'Employé (via Better Auth)
4. Le système crée une session sécurisée
5. Le système redirige vers le dashboard de l'Employé

**Postconditions :**
- L'Employé est authentifié et accède au portail

---

### Catégorie 2 : Consultation Fiche de Paie

#### UC-05-10 : Consulter fiche de paie

**Acteur principal :** Employé
**Prérequis :** Employé authentifié
**Déclencheur :** Employé accède à "Ma Fiche de Paie"

**Scénario nominal :**
1. Le système affiche l'historique des fiches de paie de l'Employé
2. L'Employé peut :
   - Consulter la liste de ses fiches (par mois/année)
   - Voir les détails de chaque fiche (salaire, charges, net)
   - Consulter les détails ligne par ligne
   - Filtrer par période
3. Les fiches sont générées et archivées par le secrétariat

**Données consultables :**
- Date de la fiche
- Salaire brut
- Détail des retenues (ONSS, impôts, etc.)
- Net à payer
- Charges employeur (informatif)

**Postconditions :**
- L'Employé peut consulter ses fiches de paie

---

### Catégorie 3 : Téléchargement Documents

#### UC-05-20 : Télécharger documents

**Acteur principal :** Employé
**Prérequis :** Employé authentifié
**Déclencheur :** Employé accède à "Mes Documents"

**Scénario nominal :**
1. Le système affiche les documents disponibles
2. L'Employé peut :
   - Consulter la liste de ses documents (fiches de paie, certificats)
   - Télécharger les fiches de paie en PDF
   - Télécharger les certificats (C4, attestations)
   - Télécharger d'autres documents le concernant
3. Les documents sont archivés et sécurisés

**Documents disponibles :**
- Fiches de paie (PDF)
- Certificat C4 (chômage)
- Attestations de travail
- Documents administratifs

**Postconditions :**
- L'Employé peut télécharger ses documents personnels

---

### Catégorie 4 : Informations Personnelles

#### UC-05-30 : Consulter informations personnelles

**Acteur principal :** Employé
**Prérequis :** Employé authentifié
**Déclencheur :** Employé accède à "Mon Dossier" ou "Mes Informations"

**Scénario nominal :**
1. Le système affiche le dossier personnel de l'Employé
2. L'Employé peut consulter :
   - Ses informations personnelles (nom, prénom, adresse)
   - Son numéro de registre national (NISS)
   - Son contrat de travail (type, date, durée)
   - Son statut d'emploi (actif, congé, etc.)
   - Ses coordonnées bancaires (partiellement masquées)
3. Les informations sont en lecture seule

**Données consultables :**
- Identité et coordonnées
- Type et date du contrat
- Salaire de base
- Statut actuel
- Jours de congé disponibles

**Postconditions :**
- L'Employé a une vue d'ensemble de son dossier

---

### Catégorie 5 : Support

#### UC-05-40 : Accéder support

**Acteur principal :** Employé
**Prérequis :** Employé authentifié
**Déclencheur :** Employé accède à "Support" ou "Contact"

**Scénario nominal :**
1. Le système affiche l'interface de support
2. L'Employé peut :
   - Consulter les FAQ
   - Envoyer un message au secrétariat
   - Consulter les réponses précédentes
   - Poser des questions sur sa fiche de paie
   - Signaler une erreur ou anomalie
3. Le secrétariat répond via la plateforme

**Types de demandes :**
- Questions sur la fiche de paie
- Demandes de clarification
- Problèmes administratifs
- Support technique

**Postconditions :**
- L'Employé peut contacter le support

---

## Synthèse des Cas d'Utilisation

| UC ID | Nom | Catégorie | Priorité |
|-------|-----|-----------|----------|
| UC-05-00 | Se connecter | Authentification | 🔴 Critique |
| UC-05-10 | Consulter fiche de paie | Fiche de paie | 🔴 Critique |
| UC-05-20 | Télécharger documents | Documents | 🔴 Critique |
| UC-05-30 | Consulter informations personnelles | Informations | 🟡 Moyenne |
| UC-05-40 | Accéder support | Support | 🟡 Moyenne |

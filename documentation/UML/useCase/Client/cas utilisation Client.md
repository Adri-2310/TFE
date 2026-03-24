## Cas d'Utilisation Client

> **Note importante sur le rôle Client :**
> Le rôle Client représente l'**employeur/entreprise** qui utilise les services du secrétariat social. Le Client accède au portail pour consulter les informations relatives à son entreprise (fiches de paie, employés, documents) mais ne peut pas les modifier. Le Client a une visibilité limitée à **ses propres données** (`clientId`).

> **Note importante sur l'accès :**
> Un représentant de l'entreprise (RH, patron) s'authentifie pour accéder au portail Client. Chaque Client ne voit que ses données (fiches, employés, documents) et ne peut pas accéder aux données d'autres entreprises.

---

### Catégorie 1 : Authentification

#### UC-04-00 : Se connecter

**Acteur principal :** Client (représentant de l'entreprise)
**Prérequis :** Compte Client créé par le secrétariat
**Déclencheur :** Client accède au portail

**Scénario nominal :**
1. Le système affiche le formulaire de connexion
2. Le Client saisit ses identifiants (email + mot de passe)
3. Le système authentifie le Client (via Better Auth)
4. Le système crée une session sécurisée
5. Le système redirige vers le dashboard du Client

**Postconditions :**
- Le Client est authentifié et accède au portail

---

### Catégorie 2 : Consultation Fiches de Paie

#### UC-04-10 : Consulter fiches de paie

**Acteur principal :** Client
**Prérequis :** Client authentifié
**Déclencheur :** Client accède à "Mes Fiches de Paie"

**Scénario nominal :**
1. Le système affiche l'historique des fiches de paie
2. Le Client peut :
   - Consulter la liste des fiches (par période)
   - Télécharger les fiches en PDF
   - Voir les détails (salaires, charges, net à payer)
   - Filtrer par période/employé
3. Les fiches sont générées et archivées par le secrétariat

**Données consultables :**
- Dates des fiches
- Salaire brut, net à payer
- Charges sociales
- Employés concernés

**Postconditions :**
- Le Client peut consulter et télécharger ses fiches de paie

---

### Catégorie 3 : Gestion Employés

#### UC-04-20 : Consulter employés

**Acteur principal :** Client
**Prérequis :** Client authentifié
**Déclencheur :** Client accède à "Mes Employés"

**Scénario nominal :**
1. Le système affiche la liste des employés de l'entreprise
2. Le Client peut :
   - Consulter les informations des employés (nom, fonction, statut)
   - Voir les dernières fiches de paie par employé
   - Filtrer par statut (actif, congé, etc.)
3. Les informations sont en lecture seule pour le Client

**Données consultables :**
- Noms et prénoms des employés
- Postes/fonctions
- Statuts (actif, congé, arrêt maladie)
- Dates d'embauche

**Postconditions :**
- Le Client a une visibilité sur sa masse salariale

---

### Catégorie 4 : Documents & Téléchargement

#### UC-04-30 : Gérer documents

**Acteur principal :** Client
**Prérequis :** Client authentifié
**Déclencheur :** Client accède à "Documents"

**Scénario nominal :**
1. Le système affiche les documents disponibles
2. Le Client peut :
   - Consulter les documents disponibles (déclarations, certificats, etc.)
   - Télécharger les documents (PDF, Excel)
   - Accéder à un historique des documents
3. Les documents sont fournis par le secrétariat

**Documents disponibles :**
- Certificats C4 (chômage)
- Déclarations ONSS
- Attestations de travail
- Documents administratifs

**Postconditions :**
- Le Client accède facilement à ses documents

---

### Catégorie 5 : Support & Messagerie

#### UC-04-40 : Accéder support

**Acteur principal :** Client
**Prérequis :** Client authentifié
**Déclencheur :** Client accède à "Support/Messagerie"

**Scénario nominal :**
1. Le système affiche l'interface de messagerie/support
2. Le Client peut :
   - Envoyer un message au secrétariat
   - Consulter les messages précédents
   - Poser des questions sur ses fiches
   - Signaler des anomalies
3. Le secrétariat répond via la plateforme

**Échanges possibles :**
- Questions sur les fiches de paie
- Demandes de clarification
- Problèmes administratifs
- Support technique

**Postconditions :**
- Le Client peut communiquer avec le secrétariat

---

### Catégorie 6 : Tableau de Bord

#### UC-04-50 : Consulter dashboard

**Acteur principal :** Client
**Prérequis :** Client authentifié
**Déclencheur :** Client se connecte ou clique sur "Accueil"

**Scénario nominal :**
1. Le système affiche un dashboard personnalisé avec :
   - Dernière fiche de paie
   - Nombre d'employés
   - Dernières déclarations ONSS
   - Alertes ou messages du secrétariat
   - Liens rapides aux sections principales
2. Le Client a une vue d'ensemble de sa situation

**Informations affichées :**
- Statut général de l'entreprise
- Derniers documents
- Dernière activité

**Postconditions :**
- Le Client a une vue rapide de son dossier

---

## Synthèse des Cas d'Utilisation

| UC ID | Nom | Catégorie | Priorité |
|-------|-----|-----------|----------|
| UC-04-00 | Se connecter | Authentification | 🔴 Critique |
| UC-04-10 | Consulter fiches de paie | Fiches de paie | 🔴 Critique |
| UC-04-20 | Consulter employés | Gestion employés | 🔴 Critique |
| UC-04-30 | Gérer documents | Documents | 🟡 Moyenne |
| UC-04-40 | Accéder support | Support | 🟡 Moyenne |
| UC-04-50 | Consulter dashboard | Tableau de bord | 🟡 Moyenne |

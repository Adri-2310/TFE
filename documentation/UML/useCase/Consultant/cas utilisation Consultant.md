## Cas d'Utilisation Consultant

> **Note importante sur le rôle Consultant :**
> Le rôle Consultant est attribué aux **collaborateurs/consultants** d'un secrétariat social. Un AdminSecrétariat peut créer des comptes Consultant et leur attribuer des permissions. Tous les Consultants d'un même secrétariat ont accès aux mêmes fonctionnalités opérationnelles. Chaque Consultant ne peut accéder qu'aux données de **son propre secrétariat** (`secretariatId`).

> **Note importante sur les responsabilités :**
> Le Consultant est l'utilisateur opérationnel principal responsable de la gestion quotidienne des clients, employés et fiches de paie. Il exécute les tâches de conformité belge (DIMONA, C4) mais ne gère pas la facturation ni les paramètres système.

---

### Catégorie 1 : Authentification

#### UC-03-00 : Se connecter

**Acteur principal :** Consultant
**Prérequis :** Compte Consultant créé par un AdminSecrétariat
**Déclencheur :** Le Consultant accède à la page de connexion

**Scénario nominal :**
1. Le système affiche le formulaire de connexion
2. Le Consultant saisit ses identifiants (email + mot de passe)
3. Le système authentifie le Consultant (via Better Auth)
4. Le système crée une session sécurisée
5. Le système redirige vers le dashboard du Consultant

**Postconditions :**
- Le Consultant est authentifié et peut accéder à l'application

---

### Catégorie 2 : Gestion des Clients

#### UC-03-10 : Gérer les clients

**Acteur principal :** Consultant
**Prérequis :** Consultant authentifié
**Déclencheur :** Consultant accède à "Mes Clients"

**Scénario nominal :**
1. Le système affiche la liste des clients du secrétariat
2. Le Consultant peut :
   - Consulter la liste des clients (avec filtres, recherche)
   - Créer un nouveau client (formulaire)
   - Modifier les informations d'un client existant
   - Consulter les détails complets d'un client

**Données impliquées :**
- Nom de l'entreprise
- Numéro de TVA
- Adresse, contact
- Nombre d'employés
- Historique de paies

**Postconditions :**
- Les informations clients sont à jour et consultables

---

### Catégorie 3 : Gestion des Employés Clients

#### UC-03-20 : Gérer les employés clients

**Acteur principal :** Consultant
**Prérequis :** Consultant authentifié, client sélectionné
**Déclencheur :** Consultant accède à "Employés" d'un client

**Scénario nominal :**
1. Le système affiche la liste des employés du client
2. Le Consultant peut :
   - Consulter les employés (avec filtres)
   - Créer un nouvel employé (données RH, contrat)
   - Modifier les informations d'un employé (salaire, contrat, statut)
   - Gérer les absences et congés

**Données impliquées :**
- NISS (numéro de registre national)
- Salaire brut, type de contrat
- Dates d'emploi
- Jours d'absence/congés

**Postconditions :**
- Les données RH des employés sont à jour et utilisables pour la paie

---

### Catégorie 4 : Fiches de Paie (CORE BUSINESS)

#### UC-03-30 : Gérer les fiches de paie

**Acteur principal :** Consultant
**Prérequis :** Consultant authentifié, employé avec données complètes
**Déclencheur :** Consultant crée une nouvelle fiche de paie

**Scénario nominal :**
1. Le Consultant encode les variables de paie (heures, primes, absences)
2. Le système calcule automatiquement les rétentions (ONSS, impôts, etc.)
3. Le Consultant prévisualise la fiche de paie
4. Le Consultant génère le PDF
5. Le Consultant envoie par email à l'employé/client
6. Le système archive la fiche

**Données impliquées :**
- Salaire brut, heures travaillées, heures supplémentaires
- Primes, indemnités, retenues
- Calculs ONSS, impôts, net à payer
- Charges employeur

**Postconditions :**
- La fiche de paie est générée, archivée et envoyée

---

### Catégorie 5 : Conformité Belge

#### UC-03-40 : Gérer la conformité ONSS/DIMONA

**Acteur principal :** Consultant
**Prérequis :** Consultant authentifié, données employés complètes
**Déclencheur :** Consultant doit déclarer un employé ou générer un certificat

**Scénario nominal :**
1. Le Consultant accède à la gestion conformité
2. Le Consultant peut :
   - Déclarer DIMONA (déclaration d'emploi à l'ONSS)
   - Générer un certificat C4 (chômage)
   - Suivre le statut des déclarations
3. Le système valide les données avant envoi
4. Le système envoie à l'ONSS via API
5. Le système enregistre les statuts et numéros de dossier

**Données impliquées :**
- NISS, dates d'emploi, type de contrat
- Déclarations ONSS, certificats
- Statuts de conformité

**Postconditions :**
- Les déclarations sont envoyées et tracées auprès de l'ONSS

---

### Catégorie 6 : Calendrier & Alertes

#### UC-03-50 : Gérer calendrier et alertes

**Acteur principal :** Consultant / Système (automatisé)
**Prérequis :** Consultant authentifié
**Déclencheur :** Accès au calendrier ou alertes automatiques

**Scénario nominal :**
1. Le système affiche un calendrier avec les deadlines ONSS
2. Le Consultant visualise les dates limites (couleurs selon urgence)
3. Le Consultant peut filtrer par type de deadline
4. Le système envoie automatiquement des alertes (J-7, J-3, J-1)
5. Les alertes sont visibles dans le dashboard et via email

**Données impliquées :**
- Deadlines ONSS (déclarations, paiements)
- Statuts des tâches (faites/en attente)

**Postconditions :**
- Le Consultant est informé des échéances critiques

---

### Catégorie 7 : Tableau de Bord

#### UC-03-60 : Consulter dashboard

**Acteur principal :** Consultant
**Prérequis :** Consultant authentifié
**Déclencheur :** Consultant se connecte ou clique sur "Accueil"

**Scénario nominal :**
1. Le système affiche un dashboard personnalisé avec :
   - Fiches de paie créées (ce mois)
   - Tâches prioritaires (en brouillon, en attente)
   - Prochaines deadlines ONSS
   - Statistiques (clients, employés, charges sociales)
   - Alertes actives

**Données affichées :**
- KPI du jour
- Tâches urgentes
- Tendances et statistiques

**Postconditions :**
- Le Consultant a une vue d'ensemble de ses activités

---

## Synthèse des Cas d'Utilisation

| UC ID | Nom | Catégorie | Priorité |
|-------|-----|-----------|----------|
| UC-03-00 | Se connecter | Authentification | 🔴 Critique |
| UC-03-10 | Gérer les clients | Gestion clients | 🔴 Critique |
| UC-03-20 | Gérer les employés clients | Gestion employés | 🔴 Critique |
| UC-03-30 | Gérer les fiches de paie | Fiches paie | 🔴 Critique |
| UC-03-40 | Gérer conformité ONSS/DIMONA | Conformité | 🔴 Critique |
| UC-03-50 | Gérer calendrier et alertes | Calendrier | 🟡 Moyenne |
| UC-03-60 | Consulter dashboard | Tableau de bord | 🟡 Moyenne |

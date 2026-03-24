## Cas d'Utilisation Admin Secrétariat

> **Note importante sur le rôle AdminSecrétariat :**
> Le rôle AdminSecrétariat est attribué **automatiquement lors de l'inscription** du propriétaire/patron d'un secrétariat social sur la plateforme. L'AdminSecrétariat peut créer des **Consultants** (utilisateurs) pour son équipe et leur attribuer des permissions. L'AdminSecrétariat gère le personnel (consultants) de son secrétariat social.

> **Note importante sur l'isolation multi-tenant :**
> Chaque AdminSecrétariat ne peut accéder qu'aux données de **son propre secrétariat** (`secretariatId`). L'isolation est garantie au niveau de la base de données et des API.

---

### Catégorie 1 : Authentification

#### UC-02-00 : Se connecter

**Acteur principal :** AdminSecrétariat
**Prérequis :** Compte créé
**Déclencheur :** AdminSecrétariat accède à la page de connexion

**Scénario nominal :**
1. Le système affiche le formulaire de connexion
2. L'AdminSecrétariat saisit ses identifiants
3. Le système authentifie l'utilisateur (via Better Auth)
4. Le système redirige vers le dashboard AdminSecrétariat

**Postconditions :**
- L'AdminSecrétariat est authentifié et accède à son espace

---

### Catégorie 2 : Gestion du Personnel

#### UC-02-10 : Gérer le personnel

**Acteur principal :** AdminSecrétariat
**Prérequis :** AdminSecrétariat authentifié
**Déclencheur :** AdminSecrétariat accède à "Gestion du Personnel"

**Scénario nominal :**
1. Le système affiche la liste du personnel (consultants)
2. L'AdminSecrétariat peut :
   - Consulter les consultants
   - Créer un nouveau consultant (email, rôle)
   - Modifier les informations (permissions, rôles)
   - Attribuer des rôles (Consultant, AdminSecrétariat)
   - Désactiver/Supprimer un utilisateur

**Données impliquées :**
- Prénom, nom, email du consultant
- Rôles et permissions
- Statut du compte

**Postconditions :**
- L'équipe du secrétariat est gérée et mise à jour

---

### Catégorie 3 : Facturation & Abonnements

#### UC-02-20 : Gérer l'abonnement

**Acteur principal :** AdminSecrétariat
**Acteur secondaire :** Stripe
**Prérequis :** AdminSecrétariat authentifié
**Déclencheur :** AdminSecrétariat accède à "Facturation"

**Scénario nominal :**
1. Le système affiche le statut de l'abonnement
2. L'AdminSecrétariat peut :
   - Consulter l'abonnement actuel et son plan
   - Voir les factures (historique)
   - Gérer les méthodes de paiement
   - Changer de plan (upgrade/downgrade)
   - Gérer les paramètres de facturation
3. Le système communique avec Stripe pour les paiements
4. Le système affiche les confirmations et factures

**Données impliquées :**
- Plan actuel (Starter, Pro, Enterprise)
- Dates de facturation
- Méthodes de paiement
- Historique des factures

**Postconditions :**
- L'abonnement est à jour et géré correctement via Stripe

---

### Catégorie 4 : Templates & Documents

#### UC-02-30 : Gérer templates et documents

**Acteur principal :** AdminSecrétariat
**Prérequis :** AdminSecrétariat authentifié
**Déclencheur :** AdminSecrétariat accède à "Templates"

**Scénario nominal :**
1. Le système affiche la bibliothèque de templates
2. L'AdminSecrétariat peut :
   - Consulter les modèles de documents disponibles
   - Gérer les templates de contrats
   - Créer des lettres types personnalisées
   - Modifier les templates existants
3. Les templates sont disponibles pour les consultants

**Données impliquées :**
- Contrats de travail
- Lettres types
- Documents administratifs

**Postconditions :**
- Les templates et documents sont organisés et accessibles

---

### Catégorie 5 : Analytics & Reporting

#### UC-02-40 : Consulter rapports

**Acteur principal :** AdminSecrétariat
**Prérequis :** AdminSecrétariat authentifié
**Déclencheur :** AdminSecrétariat accède à "Rapports"

**Scénario nominal :**
1. Le système affiche un dashboard avec analytics
2. L'AdminSecrétariat peut :
   - Consulter les statistiques (clients, employés, paies)
   - Voir la productivité de son équipe (consultants)
   - Exporter des rapports (PDF, Excel)
   - Visualiser des tendances (mensuelles, trimestrielles)
3. Les données sont filtrables par période

**Données affichées :**
- Nombre de fiches de paie traitées
- Charges sociales totales
- Performance des consultants
- Revenus et statistiques

**Postconditions :**
- L'AdminSecrétariat a une vue complète de son activité

---

## Synthèse des Cas d'Utilisation

| UC ID | Nom | Catégorie | Priorité |
|-------|-----|-----------|----------|
| UC-02-00 | Se connecter | Authentification | 🔴 Critique |
| UC-02-10 | Gérer le personnel | Gestion personnel | 🔴 Critique |
| UC-02-20 | Gérer l'abonnement | Facturation | 🔴 Critique |
| UC-02-30 | Gérer templates et documents | Templates | 🟡 Moyenne |
| UC-02-40 | Consulter rapports | Analytics | 🟡 Moyenne |

## Cas d'Utilisation SuperAdmin

> **Note importante sur le rôle SuperAdmin :**
> Le SuperAdmin est l'administrateur système de la plateforme. Il gère tous les secrétariats sociaux enregistrés, les utilisateurs globaux et la configuration du système. Le SuperAdmin a une visibilité et un contrôle complets sur la plateforme.

> **Note importante sur le scope :**
> Le SuperAdmin ne gère PAS les clients ou employés individuels (c'est le rôle du Consultant). Le SuperAdmin intervient au niveau système et gestion des secrétariats.

---

### Catégorie 1 : Authentification

#### UC-01-00 : Se connecter

**Acteur principal :** SuperAdmin
**Prérequis :** Compte SuperAdmin créé
**Déclencheur :** SuperAdmin accède à la page de connexion

**Scénario nominal :**
1. Le système affiche le formulaire de connexion
2. Le SuperAdmin saisit ses identifiants
3. Le système authentifie le SuperAdmin (via Better Auth)
4. Le système redirige vers le dashboard SuperAdmin

**Postconditions :**
- Le SuperAdmin est authentifié et accède à l'espace d'administration

---

### Catégorie 2 : Gestion des Secrétariats

#### UC-01-10 : Gérer les secrétariats

**Acteur principal :** SuperAdmin
**Prérequis :** SuperAdmin authentifié
**Déclencheur :** SuperAdmin accède à "Gestion des Secrétariats"

**Scénario nominal :**
1. Le système affiche la liste de tous les secrétariats
2. Le SuperAdmin peut :
   - Consulter tous les secrétariats enregistrés
   - Voir les informations détaillées (TVA, contact, plan, statut)
   - Modifier les informations d'un secrétariat
   - Supprimer un secrétariat
   - Consulter les utilisateurs associés à chaque secrétariat

**Données impliquées :**
- Nom du secrétariat, TVA
- Plan d'abonnement, date d'inscription
- Statut (Actif, Suspendu, Fermé)
- Nombre d'utilisateurs et de clients

**Postconditions :**
- Les secrétariats sont gérés et monitorés au niveau système

---

### Catégorie 3 : Gestion des Utilisateurs

#### UC-01-20 : Gérer les utilisateurs

**Acteur principal :** SuperAdmin
**Prérequis :** SuperAdmin authentifié
**Déclencheur :** SuperAdmin accède à "Gestion des Utilisateurs"

**Scénario nominal :**
1. Le système affiche la liste de tous les utilisateurs du système
2. Le SuperAdmin peut :
   - Consulter tous les utilisateurs (tous les rôles)
   - Modifier les informations d'un utilisateur
   - Attribuer ou modifier les rôles (RBAC - Role-Based Access Control)
   - Désactiver/Réactiver un compte
   - Réinitialiser les mots de passe
3. Le système trace toutes les modifications

**Données impliquées :**
- Identité de l'utilisateur (email, nom, prénom)
- Rôles (SuperAdmin, AdminSecrétariat, Consultant, Client, Employé)
- Statut du compte, permissions

**Postconditions :**
- Les utilisateurs sont gérés et contrôlés au niveau système

---

### Catégorie 4 : Analytics & Monitoring

#### UC-01-30 : Consulter analytics et monitoring

**Acteur principal :** SuperAdmin
**Prérequis :** SuperAdmin authentifié
**Déclencheur :** SuperAdmin accède au dashboard global

**Scénario nominal :**
1. Le système affiche un dashboard global avec analytics
2. Le SuperAdmin peut :
   - Consulter le dashboard global (tous les secrétariats)
   - Voir les statistiques par secrétariat (clients, employés, paies)
   - Exporter des rapports globaux
   - Monitorer la santé du système (uptime, erreurs)
   - Voir les tendances d'utilisation
3. Les données sont filtrables par période et secrétariat

**Données affichées :**
- Nombre total de clients, employés, fiches de paie
- Revenus par plan d'abonnement
- Statuts des déclarations ONSS
- Activité par secrétariat
- Performances système

**Postconditions :**
- Le SuperAdmin a une visibilité complète sur la plateforme

---

### Catégorie 5 : Configuration Système

#### UC-01-40 : Configurer le système

**Acteur principal :** SuperAdmin
**Acteur secondaire :** Stripe (paiements)
**Prérequis :** SuperAdmin authentifié
**Déclencheur :** SuperAdmin accède à "Configuration Système"

**Scénario nominal :**
1. Le système affiche les paramètres de configuration
2. Le SuperAdmin peut :
   - Gérer les plans d'abonnement (créer, modifier, tarifs)
   - Configurer les paramètres globaux (pays, devises, etc.)
   - Consulter les logs système (erreurs, accès, modifications)
   - Gérer les intégrations (Stripe, APIs)
   - Configurer les alertes système
3. Le système enregistre toutes les modifications avec audit trail

**Données impliquées :**
- Plans d'abonnement (Starter, Pro, Enterprise)
- Paramètres globaux (config, limites)
- Logs système (erreurs, accès, changements)
- Configurations d'intégration

**Postconditions :**
- Le système est configuré et maintenu correctement au niveau global

---

## Synthèse des Cas d'Utilisation

| UC ID | Nom | Catégorie | Priorité |
|-------|-----|-----------|----------|
| UC-01-00 | Se connecter | Authentification | 🔴 Critique |
| UC-01-10 | Gérer les secrétariats | Gestion secrétariats | 🔴 Critique |
| UC-01-20 | Gérer les utilisateurs | Gestion utilisateurs | 🔴 Critique |
| UC-01-30 | Consulter analytics et monitoring | Analytics | 🟡 Moyenne |
| UC-01-40 | Configurer le système | Configuration | 🔴 Critique |

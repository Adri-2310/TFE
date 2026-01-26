# Documentation Complète - WorkZen Phase 1

**Projet :** WorkZen - Plateforme Multi-Tenant pour Secrétariats Sociaux
**Phase :** Phase 1 (Juillet 2025 - Juin 2027)
**Version :** 1.0
**Date :** Janvier 2026

---

## 📋 Table des Matières

1. [Introduction](#introduction)
2. [Acteurs du Système](#acteurs-du-système)
3. [Documents de Spécification](#documents-de-spécification)
4. [Diagrammes UML](#diagrammes-uml)
5. [Architecture Multi-Tenant](#architecture-multi-tenant)
6. [Système Externe : Stripe](#système-externe--stripe)
7. [Évolution Future](#évolution-future)
8. [Technologies Utilisées](#technologies-utilisées)

---

## Introduction

Ce document présente l'ensemble des cas d'utilisation de la plateforme WorkZen en Phase 1. La plateforme est une solution SaaS multi-tenant destinée aux secrétariats sociaux belges pour gérer leurs clients, employés et générer des fiches de paie.

### Périmètre Phase 1

La Phase 1 se concentre sur **2 rôles fonctionnels** :
- **SuperAdmin** : Administrateur global de la plateforme
- **Admin Secrétariat** : Administrateur d'un secrétariat social spécifique

### Rôles Préparés (Futures Phases)

Les rôles suivants sont préparés au niveau de la base de données mais n'ont pas d'interface fonctionnelle en Phase 1 :
- **Consultant** (Phase 2)
- **Client** (Phase 3)
- **Employé** (Phase 3)

---

## Acteurs du Système

### 1. SuperAdmin

**Description :** Administrateur global de la plateforme WorkZen

**Caractéristiques :**
- **Rôle :** `SUPER_ADMIN`
- **Accès :** Vue globale sur tous les secrétariats et utilisateurs
- **Authentification :** 2FA obligatoire (Google Authenticator)
- **Création :** Via seed/migration au déploiement initial

**Responsabilités :**
- Gestion complète des secrétariats sociaux (modifier, supprimer, consulter)
- Gestion globale des utilisateurs (modifier, désactiver, attribuer rôles)
- Monitoring et analytics globaux
- Configuration des plans d'abonnement
- Configuration des paramètres système
- Consultation des logs système
- Export de rapports globaux
- Traitement des paiements (webhooks Stripe)

**Note importante :** Le SuperAdmin ne crée PAS les secrétariats. Ils s'inscrivent eux-mêmes via le processus d'inscription.

---

### 2. Admin Secrétariat

**Description :** Administrateur d'un secrétariat social spécifique (client de la plateforme)

**Caractéristiques :**
- **Rôle :** `ADMIN_SECRETARIAT`
- **Accès :** Vue isolée limitée à son secrétariat (`secretariatId`)
- **Authentification :** 3 méthodes disponibles (Email/Password, Magic Link, Google OAuth)
- **2FA :** Optionnel (peut être activé)
- **Création :** Attribution automatique du rôle lors de l'inscription

**Responsabilités :**
- Inscription avec choix du plan d'abonnement
- Gestion de son profil personnel
- Consultation du dashboard de son secrétariat
- Gestion des utilisateurs de son secrétariat (créer, modifier, désactiver)
- Création d'autres AdminSecrétariat (employés) pour son équipe
- Gestion de l'abonnement via Stripe Customer Portal
- Consultation de l'historique de facturation

**Note importante :** L'AdminSecrétariat principal (propriétaire) s'inscrit lui-même et peut ensuite créer d'autres AdminSecrétariat (employés) pour son secrétariat.

---

### 3. Stripe (Système Externe)

**Description :** Plateforme de paiement externe

**Caractéristiques :**
- **Type :** Acteur secondaire (système)
- **Rôle :** Gestion des paiements et abonnements

**Services fournis :**
- Traitement des paiements
- Gestion des abonnements (plans Starter, Pro, Enterprise)
- Customer Portal pour les clients
- Webhooks pour synchronisation automatique

---

## Documents de Spécification

### 1. Authentification et Architecture

#### 🔑 **AUTHENTIFICATION-BETTER-AUTH.md**
**Public :** Professeurs, jury de soutenance, évaluateurs techniques

**Contenu :**

**Partie 1 : Présentation de Better Auth**
- Qu'est-ce que Better Auth ?
- Pourquoi Better Auth pour ce projet ?
- Tableau comparatif des fonctionnalités vs besoins du projet

**Partie 2 : Les 3 Méthodes d'Authentification**
- **Méthode 1 : Email + Mot de passe** (avec 2FA obligatoire pour SuperAdmin)
  - Workflow détaillé
  - Configuration 2FA (Google Authenticator)
  - Critères de sécurité du mot de passe
- **Méthode 2 : Magic Link** (lien de connexion par email)
  - Workflow détaillé
  - Contenu de l'email
  - Mesures de sécurité
- **Méthode 3 : Google OAuth** (avec 2FA Google)
  - Workflow de connexion et d'inscription
  - Informations récupérées de Google
  - 4 méthodes de 2FA Google
- Tableau comparatif des 3 méthodes (11 critères)
- Recommandations par profil utilisateur

**Partie 3 : Architecture de la Base de Données**
- Description des 6 tables principales (User, Account, Session, Verification, Secretariat, AuditLog)
- Relations et isolation multi-tenant

**Partie 4 : Configuration et Sécurité**
- Principes de configuration Backend et Frontend
- Protections intégrées (hashing, tokens, rate limiting, CSRF)
- Routes d'authentification automatiques
- Middleware de protection des routes

**Partie 5 : Workflow Complet d'Inscription**
- Processus d'inscription d'un secrétariat social
- Intégration avec Stripe

**Partie 6 : Avantages de Better Auth**
- Gain de temps de développement (3-4 semaines économisées)
- Sécurité renforcée
- Expérience utilisateur améliorée
- Maintenance simplifiée
- Évolutivité

**Note :** Document sans code technique, entièrement conceptuel et explicatif.

**📍 Chemin :** `documentation/AUTHENTIFICATION-BETTER-AUTH.md`

**🔗 Site officiel Better Auth :** https://www.better-auth.com/

---

### 2. Cas d'Utilisation par Rôle

#### 👨‍💼 **SuperAdmin/cas utilisation SuperAdmin.md**
**Public :** Professeurs, analystes fonctionnels

**Contenu :** **14 cas d'utilisation** organisés en 6 catégories

**Catégorie 1 : Gestion des Secrétariats** (UC-01-01 à UC-01-03)
- UC-01-01 : Modifier un secrétariat
- UC-01-02 : Supprimer un secrétariat
- UC-01-03 : Consulter tous les secrétariats

**Catégorie 2 : Gestion des Utilisateurs** (UC-01-04 à UC-01-06)
- UC-01-04 : Modifier un utilisateur (vue globale sur tous les secrétariats)
- UC-01-05 : Désactiver un compte utilisateur
- UC-01-06 : Gérer les rôles utilisateurs (RBAC)

**Catégorie 3 : Analytics et Monitoring** (UC-01-07 à UC-01-10)
- UC-01-07 : Consulter dashboard global
- UC-01-08 : Voir statistiques par secrétariat
- UC-01-09 : Consulter les logs système
- UC-01-10 : Exporter rapports globaux

**Catégorie 4 : Configuration Système** (UC-01-11 à UC-01-12)
- UC-01-11 : Gérer les plans d'abonnement
- UC-01-12 : Configurer les paramètres globaux

**Catégorie 5 : Facturation** (UC-01-13)
- UC-01-13 : Traiter les paiements (webhooks Stripe)

**Catégorie 6 : Authentification** (UC-01-14)
- UC-01-14 : Se connecter (3 méthodes)

**Format de chaque cas d'utilisation :**
- Acteur principal et secondaire
- Prérequis
- Déclencheur
- Scénario nominal (étapes numérotées)
- Scénarios alternatifs
- Postconditions

**Notes importantes :**
- Le SuperAdmin ne crée PAS les secrétariats (auto-inscription)
- Vue globale sur TOUS les utilisateurs de TOUS les secrétariats
- 2FA obligatoire pour connexion Email + Password
- Premier SuperAdmin créé via seed/migration au déploiement

**📍 Chemin :** `documentation/SuperAdmin/cas utilisation SuperAdmin.md`

**📊 Diagramme associé :** `documentation/SuperAdmin/Diagram-SuperAdmin.drawio`

---

#### 🏢 **AdminSecretariat/cas utilisation AdminSecretariat.md**
**Public :** Professeurs, analystes fonctionnels

**Contenu :** **11 cas d'utilisation** organisés en 4 catégories

**Catégorie 1 : Authentification et Dashboard** (UC-02-00 à UC-02-02)
- UC-02-00 : Créer un compte (Inscription)
  - Méthode 1 : Inscription classique (Email + Password)
  - Méthode 2 : Inscription via Google OAuth (infos pré-remplies)
- UC-02-01 : Se connecter (3 méthodes)
  - Méthode 1 : Email + Password
  - Méthode 2 : Magic Link
  - Méthode 3 : Google OAuth
- UC-02-02 : Consulter son dashboard

**Catégorie 2 : Gestion du Profil** (UC-02-03 à UC-02-04)
- UC-02-03 : Voir son profil
- UC-02-04 : Modifier son profil

**Catégorie 3 : Gestion du Secrétariat** (UC-02-05 à UC-02-09)
- UC-02-05 : Voir les paramètres du secrétariat
- UC-02-06 : Voir la liste des utilisateurs de son secrétariat
- UC-02-07 : Créer un utilisateur AdminSecrétariat (Employé)
- UC-02-08 : Modifier un utilisateur de son secrétariat
- UC-02-09 : Désactiver un utilisateur de son secrétariat

**Catégorie 4 : Facturation Stripe** (UC-02-10 à UC-02-11)
- UC-02-10 : Gérer son abonnement (Stripe Customer Portal)
- UC-02-11 : Consulter l'historique de facturation

**Format de chaque cas d'utilisation :**
- Acteur principal et secondaire
- Prérequis
- Déclencheur
- Scénario nominal (étapes numérotées)
- Scénarios alternatifs
- Postconditions

**Notes importantes :**
- Rôle attribué **automatiquement lors de l'inscription**
- L'AdminSecrétariat principal peut créer d'autres AdminSecrétariat (employés) pour son équipe
- Isolation multi-tenant stricte (voit uniquement son secrétariat)
- 2FA optionnel pour connexion Email + Password
- Inscription possible via Google OAuth (plus rapide, infos pré-remplies)

**📍 Chemin :** `documentation/AdminSecretariat/cas utilisation AdminSecretariat.md`

**📊 Diagramme associé :** `documentation/AdminSecretariat/use-cases-admin-secretariat.drawio`

---

## Diagrammes UML

### 1. Diagramme SuperAdmin
**Format :** DrawIO (format XML)
**Outil :** Draw.io (https://app.diagrams.net/)

**Contenu :**
- **Acteur principal :** SuperAdmin
- **Acteur secondaire :** Stripe (système externe)
- **6 groupes de cas d'utilisation :**
  1. Gestion des secrétariats (3 cas)
  2. Gestion des utilisateurs (3 cas)
  3. Analytics & Monitoring (4 cas)
  4. Configuration Système (2 cas)
  5. Facturation (1 cas avec extension vers Stripe)
  6. Authentification (1 cas)
- **Relation "extension"** entre "Gérer les plans d'abonnement" et "Traiter les paiements"

**📍 Chemin :** `documentation/SuperAdmin/Diagram-SuperAdmin.drawio`

---

### 2. Diagramme AdminSecrétariat
**Format :** DrawIO (format XML)
**Outil :** Draw.io (https://app.diagrams.net/)

**Contenu :**
- **Acteur principal :** Admin Secrétariat
- **Acteur secondaire :** Stripe (système externe)
- **5 groupes de cas d'utilisation :**
  1. Authentification (3 cas)
  2. Gestion du Profil (2 cas)
  3. Gestion Utilisateurs (5 cas)
  4. Analytics & Reporting (1 cas)
  5. Facturation & Abonnements (4 cas)
- **Connexion directe** avec le système externe Stripe

**📍 Chemin :** `documentation/AdminSecretariat/use-cases-admin-secretariat.drawio`

---

### 3. Diagramme d'Architecture
**Format :** DrawIO (format XML)

**Contenu :** Schéma hiérarchique du SaaS multi-tenant montrant l'organisation globale de la plateforme.

**📍 Chemin :** `documentation/schéma hiérarchique du saas mutli-tenant.drawio`

---

## Architecture Multi-Tenant

### Principe de l'Architecture Multi-Tenant

**Définition :** Une seule instance de l'application sert plusieurs clients (tenants) avec isolation complète des données.

**Dans ce projet :**
- Chaque secrétariat social est un "tenant"
- Un AdminSecrétariat ne voit QUE les données de son secrétariat
- Le SuperAdmin a une vue globale sur tous les tenants
- Isolation au niveau de la base de données via `secretariatId`

### Avantages

✅ **Coûts réduits** : Infrastructure partagée
✅ **Mises à jour centralisées** : Une seule application à maintenir
✅ **Scalabilité facilitée** : Ajout de nouveaux clients sans redéploiement
✅ **Maintenance simplifiée** : Corrections et améliorations profitent à tous

### Défis

⚠️ **Isolation stricte** : Sécurité critique (filtrage par `secretariatId`)
⚠️ **Performance** : Indexation optimale requise
⚠️ **Complexité des requêtes** : Filtrage systématique par tenant

### Implémentation

**Middleware de protection :**
- Vérification de session automatique
- Injection du `secretariatId` dans les headers de requête
- Filtrage automatique des données selon le secrétariat

**Base de données :**
- Chaque table liée aux données métier contient une colonne `secretariatId`
- Index sur `secretariatId` pour performance
- Row Level Security (RLS) pour isolation

**Exemple de filtrage :**
- AdminSecrétariat : `WHERE secretariatId = {user.secretariatId}`
- SuperAdmin : Pas de filtre (accès global)

---

## Système Externe : Stripe

### Intégration Stripe

Stripe est intégré pour gérer tous les aspects de paiement et d'abonnement de la plateforme.

### Plans d'Abonnement

| Plan | Prix | Clients | Utilisateurs | Stockage |
|------|------|---------|--------------|----------|
| **Starter** | 99€/mois | 25 | 3 | 5 GB |
| **Pro** | 299€/mois | 100 | 10 | 20 GB |
| **Enterprise** | Sur devis | Illimité | Illimité | Illimité |

### Services Stripe Utilisés

**1. Stripe Checkout**
- Page de paiement hébergée par Stripe
- Utilisée lors de l'inscription des secrétariats
- Gestion sécurisée des moyens de paiement
- Support de multiples méthodes de paiement

**2. Stripe Customer Portal**
- Interface client pour gérer l'abonnement
- Changement de plan (upgrade/downgrade)
- Mise à jour du moyen de paiement
- Annulation d'abonnement
- Consultation de l'historique

**3. Webhooks Stripe**
Synchronisation automatique via événements :
- `checkout.session.completed` : Inscription réussie, création du compte
- `payment_intent.succeeded` : Paiement réussi
- `payment_intent.failed` : Paiement échoué
- `customer.subscription.updated` : Abonnement modifié
- `customer.subscription.deleted` : Abonnement annulé
- `invoice.payment_failed` : Échec de paiement récurrent

### Workflow d'Inscription avec Stripe

1. L'utilisateur s'inscrit sur la plateforme
2. Il choisit son plan d'abonnement
3. Redirection vers Stripe Checkout
4. Saisie des informations de paiement
5. Validation du paiement par Stripe
6. Stripe envoie le webhook `checkout.session.completed`
7. Le système crée le secrétariat et l'utilisateur
8. Attribution automatique du rôle AdminSecrétariat
9. Envoi d'email de bienvenue
10. Redirection vers le dashboard

---

## Évolution Future

### Phase 2 (Post-TFE)

**Nouveau rôle :** Consultant

**Fonctionnalités prévues :**
- Gestion des clients (entreprises)
- Gestion des employés
- Génération de fiches de paie
- Calendrier ONSS
- Export de documents
- Statistiques et rapports

**Estimation :** +15 cas d'utilisation

**Impact :**
- Nouvelle catégorie d'utilisateurs
- Nouveaux diagrammes UML
- Extension de l'isolation multi-tenant

---

### Phase 3 (Portail Client)

**Nouveaux rôles :** Client, Employé

**Fonctionnalités prévues :**

**Pour les Clients (Entreprises) :**
- Portail client pour consulter les documents
- Téléchargement des fiches de paie
- Historique des paiements
- Demandes et tickets

**Pour les Employés :**
- Portail employé pour voir les fiches de paie
- Consultation des congés et absences
- Mise à jour des informations personnelles
- Demandes de documents

**Estimation :** +10 cas d'utilisation

**Impact :**
- Interfaces publiques (clients externes)
- Gestion des permissions étendues
- Notifications automatiques

---

## Technologies Utilisées

### Frontend
- **Framework :** Next.js 15 (App Router)
- **UI Library :** React 19
- **Langage :** TypeScript
- **Styling :** Tailwind CSS
- **Components :** ShadcnUI

### Backend
- **API :** Next.js API Routes
- **ORM :** Prisma
- **Authentification :** Better Auth
- **Paiements :** Stripe

### Base de Données
- **SGBD :** PostgreSQL
- **Hébergement :** Supabase / Neon

### Infrastructure
- **Déploiement :** Vercel
- **Monorepo :** Turborepo
- **Version Control :** Git / GitHub

### Sécurité
- **2FA :** Google Authenticator (TOTP)
- **OAuth :** Google OAuth 2.0
- **Protection :** Rate limiting, CSRF, XSS
- **Audit :** Logs complets de toutes les actions

---

## Références et Ressources

### Documentation Officielle
- **Better Auth :** https://www.better-auth.com/docs
- **Stripe :** https://stripe.com/docs
- **Next.js :** https://nextjs.org/docs
- **Prisma :** https://www.prisma.io/docs
- **PostgreSQL :** https://www.postgresql.org/docs/

### Outils
- **Draw.io** (diagrammes UML) : https://app.diagrams.net/
- **Prisma Studio** (GUI base de données) : Accessible via `npx prisma studio`
- **Stripe Dashboard :** https://dashboard.stripe.com/
- **Google Cloud Console :** https://console.cloud.google.com/

---

## Glossaire

| Terme | Définition |
|-------|-----------|
| **Multi-tenant** | Architecture où une instance sert plusieurs clients isolés |
| **Better Auth** | Bibliothèque d'authentification TypeScript moderne |
| **RBAC** | Role-Based Access Control (contrôle d'accès par rôles) |
| **2FA** | Two-Factor Authentication (authentification à deux facteurs) |
| **TOTP** | Time-based One-Time Password (code temporaire à 6 chiffres) |
| **OAuth** | Protocole d'authentification via service tiers |
| **Magic Link** | Lien de connexion unique envoyé par email |
| **Webhook** | Callback HTTP envoyé par un service externe |
| **JWT** | JSON Web Token (token de session sécurisé) |
| **Prisma** | ORM pour TypeScript |
| **UUID** | Universal Unique Identifier (identifiant unique) |
| **Seed** | Données initiales insérées dans la base de données |
| **Middleware** | Couche intermédiaire pour vérifier les permissions |

---

## Statistiques du Projet Phase 1

**Cas d'utilisation totaux :** 25
- SuperAdmin : 14 cas d'utilisation
- AdminSecrétariat : 11 cas d'utilisation

**Tables de base de données :** 6 principales
- User, Account, Session, Verification
- Secretariat, AuditLog

**Méthodes d'authentification :** 3
- Email + Password (avec 2FA)
- Magic Link
- Google OAuth

**Plans d'abonnement :** 3
- Starter, Pro, Enterprise

**Acteurs :** 3
- SuperAdmin, AdminSecrétariat, Stripe

---

**Document créé le :** Janvier 2026
**Dernière mise à jour :** Janvier 2026
**Version :** 1.0
**Auteur :** Équipe WorkZen
**Statut :** ✅ Documentation complète et prête pour présentation académique

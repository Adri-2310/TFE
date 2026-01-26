# Authentification avec Better Auth

## 📚 Vue d'ensemble

### Qu'est-ce que Better Auth ?

**Better Auth** est une bibliothèque d'authentification TypeScript moderne et complète, conçue pour simplifier l'implémentation de systèmes d'authentification complexes dans les applications web.

**Site officiel :** https://www.better-auth.com/

### Pourquoi Better Auth ?

Better Auth a été choisi pour ce projet car il répond parfaitement aux besoins spécifiques de la plateforme multi-tenant :

1. **Support natif de multiples méthodes d'authentification** sans configuration complexe
2. **Architecture multi-tenant** intégrée permettant l'isolation des données par secrétariat
3. **Gestion complète du RBAC** (Role-Based Access Control)
4. **2FA intégré** avec support TOTP (Google Authenticator)
5. **Providers OAuth** (Google, GitHub, etc.) prêts à l'emploi
6. **Session management** sécurisé et performant
7. **TypeScript First** garantissant la sécurité des types

---

## 🎯 Fonctionnalités de Better Auth pour ce Projet

| Besoin du projet | Solution Better Auth | Avantage |
|------------------|---------------------|----------|
| Email + Password | ✅ Natif avec validation | Configuration simple, validation automatique |
| Magic Links | ✅ Plugin `magicLink` | Génération de tokens sécurisés, gestion d'expiration |
| Google OAuth | ✅ Provider Google natif | Intégration OAuth2 simplifiée |
| 2FA SuperAdmin obligatoire | ✅ Plugin `twoFactor` avec TOTP | QR Code automatique, validation intégrée |
| Multi-tenant (isolation par secrétariat) | ✅ Métadonnées utilisateur | Filtrage automatique par `secretariatId` |
| RBAC (SuperAdmin, AdminSecrétariat) | ✅ Gestion des rôles | Vérification de permissions simplifiée |
| Audit logs | ✅ Hooks personnalisables | Traçabilité complète des actions |
| Session sécurisée (JWT) | ✅ Gestion de session intégrée | Tokens sécurisés, expiration automatique |

---

## 🔐 Les 3 Méthodes d'Authentification

La plateforme propose **3 méthodes d'authentification** complémentaires, toutes gérées par Better Auth :

### Méthode 1 : Email + Mot de passe (avec 2FA)

**Description :** Authentification classique avec identifiants. Le 2FA (Google Authenticator) est **obligatoire pour SuperAdmin** et **optionnel pour AdminSecrétariat**.

**Workflow simplifié :**
1. L'utilisateur saisit email et mot de passe
2. Better Auth valide les identifiants
3. Si 2FA activé : Better Auth demande le code à 6 chiffres
4. L'utilisateur saisit le code de Google Authenticator
5. Better Auth valide le code et crée la session

**Caractéristiques :**
- **Sécurité** : ⭐⭐⭐ (avec 2FA) / ⭐⭐ (sans 2FA)
- **2FA SuperAdmin** : Obligatoire (Google Authenticator)
- **2FA AdminSecrétariat** : Optionnel
- **Critères mot de passe** : Minimum 12 caractères, complexité imposée
- **Protection** : 5 tentatives maximum, blocage 15 minutes

**Configuration 2FA (SuperAdmin) :**
1. À la première connexion, Better Auth génère un secret 2FA
2. Affichage d'un QR Code à scanner avec Google Authenticator
3. Google Authenticator génère des codes à 6 chiffres (renouvelés toutes les 30s)
4. À chaque connexion, le code est demandé après l'email/password

---

### Méthode 2 : Magic Link (Lien de connexion par email)

**Description :** Authentification sans mot de passe via un lien unique envoyé par email. Idéal pour une connexion occasionnelle ou rapide.

**Workflow simplifié :**
1. L'utilisateur saisit son email
2. Better Auth génère un token unique sécurisé
3. Better Auth envoie un email avec le lien de connexion
4. L'utilisateur clique sur le lien dans l'email
5. Better Auth valide le token et crée la session

**Caractéristiques :**
- **Sécurité** : ⭐⭐
- **Validité** : 15 minutes
- **Usage** : Unique (le token est détruit après utilisation)
- **Avantage** : Pas de mot de passe à retenir
- **Traçabilité** : Enregistrement de l'IP de demande et d'utilisation

**Contenu de l'email :**
- Bouton "Se connecter maintenant" avec le lien unique
- Information sur la validité (15 minutes)
- Données de sécurité (IP, navigateur)
- Avertissement si non demandé par l'utilisateur

**Cas d'usage recommandés :**
- Connexion occasionnelle
- Appareil non personnel
- Première connexion après inscription
- Utilisateur ayant du mal avec les mots de passe

---

### Méthode 3 : Google OAuth (Authentification Google)

**Description :** Authentification via le compte Google de l'utilisateur avec support du 2FA Google. Permet de se connecter sans créer de mot de passe supplémentaire.

**Workflow simplifié :**
1. L'utilisateur clique sur "Se connecter avec Google"
2. Better Auth redirige vers Google OAuth 2.0
3. L'utilisateur s'authentifie sur Google
4. Si 2FA Google activé : Google demande le code
5. L'utilisateur autorise l'accès (profil, email)
6. Google redirige vers l'application
7. Better Auth récupère les informations (email, nom, photo)
8. Better Auth crée la session

**Caractéristiques :**
- **Sécurité** : ⭐⭐⭐ (2FA Google si activé)
- **Rapidité** : ⚡⚡⚡ (1 clic si déjà connecté à Google)
- **Mot de passe** : Non requis
- **Inscription** : Possible via Google (formulaire pré-rempli)
- **2FA** : Géré automatiquement par Google

**Informations récupérées de Google :**
- Identifiant Google unique
- Email (vérifié)
- Prénom et nom
- Photo de profil

**2FA Google (4 méthodes disponibles) :**
1. **Code SMS** : Code à 6 chiffres par SMS
2. **Google Authenticator** : Code à 6 chiffres généré par l'app
3. **Notification push** : Notification sur le téléphone
4. **Clé de sécurité physique** : Yubikey, Titan, etc.

**Workflow d'inscription via Google :**
1. L'utilisateur clique sur "S'inscrire avec Google"
2. Authentification Google (workflow ci-dessus)
3. Better Auth détecte que l'email n'existe pas (nouveau compte)
4. Affichage du formulaire d'inscription **pré-rempli** (prénom, nom, email)
5. L'utilisateur complète uniquement les informations du secrétariat
6. Redirection vers Stripe pour le paiement
7. Compte créé sans mot de passe (authentification Google uniquement)

**Avantages :**
- Connexion ultra-rapide
- Pas de mot de passe à retenir
- Sécurité déléguée à Google
- Inscription simplifiée (infos pré-remplies)

---

## 📊 Comparaison des 3 Méthodes

### Tableau comparatif détaillé

| Critère | Email + Password | Magic Link | Google OAuth |
|---------|------------------|------------|--------------|
| **Sécurité** | ⭐⭐⭐ (avec 2FA) | ⭐⭐ | ⭐⭐⭐ (2FA Google) |
| **Rapidité** | ⚡⚡ | ⚡ (attente email) | ⚡⚡⚡ |
| **Mot de passe à retenir** | ✅ Oui | ❌ Non | ❌ Non |
| **Nécessite email** | ✅ Oui | ✅✅ Oui (crucial) | ✅ Oui |
| **Nécessite compte Google** | ❌ Non | ❌ Non | ✅ Oui |
| **2FA SuperAdmin** | ✅ Obligatoire | ❌ Non | ✅ Google |
| **2FA AdminSecrétariat** | ❌ Optionnel | ❌ Non | ✅ Google |
| **Peut être utilisé pour inscription** | ✅ Oui | ❌ Non | ✅ Oui |
| **Risque si email compromis** | ⚠️ Moyen | ⚠️⚠️ Élevé | ⚠️ Moyen |
| **Risque si Google compromis** | ❌ Aucun | ❌ Aucun | ⚠️⚠️ Élevé |
| **Dépendance externe** | ❌ Aucune | ❌ Aucune | ✅ Google |

### Recommandations par profil

#### SuperAdmin (Gestionnaire de la plateforme)

**Méthode recommandée :** Email + Password avec 2FA obligatoire

**Raisons :**
- Contrôle total sur l'authentification
- Pas de dépendance à des services externes
- 2FA obligatoire pour sécurité maximale
- Fonctionne même si Google est indisponible
- Adapté à un rôle critique nécessitant haute sécurité

**Alternative acceptable :** Google OAuth (si 2FA activé sur Google)

---

#### AdminSecrétariat (Client)

**Méthode recommandée :** Google OAuth

**Raisons :**
- Simplicité et rapidité (1 clic)
- Pas de mot de passe à retenir
- 2FA automatique si activé sur Google
- Inscription rapide (infos pré-remplies)
- Idéal pour des utilisateurs non techniques
- Améliore l'expérience utilisateur

**Alternatives acceptables :**
- **Email + Password** : Si l'utilisateur préfère ne pas utiliser Google
- **Magic Link** : Pour connexion occasionnelle ou appareil non personnel

---

## 🗄️ Architecture de la Base de Données

Better Auth s'intègre avec Prisma et nécessite plusieurs tables pour fonctionner.

### Tables Better Auth

#### 1. Table User
Stocke les informations des utilisateurs.

**Champs Better Auth standards :**
- Identifiant unique (UUID)
- Nom complet
- Email (unique)
- Email vérifié (boolean)
- Image de profil

**Champs personnalisés pour l'application :**
- Rôle (SUPER_ADMIN ou ADMIN_SECRETARIAT)
- ID du secrétariat (pour isolation multi-tenant)
- Est propriétaire du secrétariat (boolean)
- Compte actif/inactif
- Secret 2FA (pour Google Authenticator)
- 2FA activé (boolean)

**Relations :**
- Un utilisateur peut avoir plusieurs comptes (email + Google)
- Un utilisateur peut avoir plusieurs sessions actives

---

#### 2. Table Account
Gère les comptes d'authentification (credentials, OAuth).

**Fonctionnement :**
- Un utilisateur peut avoir plusieurs "comptes" (ex: email + Google)
- Chaque compte représente une méthode d'authentification
- Stocke les tokens OAuth si applicable

**Champs principaux :**
- ID utilisateur (relation avec User)
- Provider (email, google, etc.)
- ID du compte chez le provider
- Access token et refresh token (OAuth)
- Mot de passe hashé (pour email/password)

---

#### 3. Table Session
Gère les sessions actives des utilisateurs.

**Champs principaux :**
- ID utilisateur
- Token de session (unique)
- Date d'expiration
- Adresse IP
- User-Agent (navigateur)

**Configuration :**
- Expiration : 7 jours par défaut
- Renouvellement automatique : toutes les 24 heures
- Révocation manuelle possible (déconnexion)

---

#### 4. Table Verification
Stocke les tokens de vérification (Magic Links, vérification email).

**Utilisation :**
- Génération de Magic Links (validité 15 minutes)
- Vérification d'email
- Réinitialisation de mot de passe

**Caractéristiques :**
- Token unique par demande
- Usage unique (supprimé après utilisation)
- Expiration automatique

---

#### 5. Table Secretariat
Représente les secrétariats sociaux (multi-tenant).

**Champs principaux :**
- Identifiant unique
- Nom du secrétariat
- Numéro de TVA (unique)
- Plan d'abonnement (STARTER, PRO, ENTERPRISE)
- Informations Stripe (customer ID, subscription ID)
- Statut actif/inactif

**Relation avec Users :**
- Un secrétariat peut avoir plusieurs utilisateurs (AdminSecrétariat)
- Isolation des données via `secretariatId` dans toutes les requêtes

---

#### 6. Table AuditLog
Enregistre toutes les actions sensibles pour traçabilité.

**Actions tracées :**
- Connexions et déconnexions
- Inscriptions
- Modifications d'utilisateurs
- Attribution de rôles
- Modifications de secrétariats
- Actions administratives

**Informations enregistrées :**
- ID utilisateur
- Action effectuée
- Entité concernée (type + ID)
- Détails (JSON)
- Adresse IP
- User-Agent
- Date/heure

---

## ⚙️ Configuration Better Auth

### Backend - Principes de Configuration

Better Auth s'intègre au backend de l'application via un fichier de configuration unique qui centralise tous les paramètres d'authentification.

#### 1. Connexion à la base de données
- Utilise Prisma comme adaptateur
- Connexion PostgreSQL
- Gestion automatique des tables

#### 2. Email et mot de passe
- Activation de l'authentification email/password
- Validation automatique du format email
- Longueur minimale du mot de passe : 12 caractères
- Critères de complexité imposés

#### 3. Providers OAuth
- Configuration Google OAuth (Client ID, Client Secret)
- URL de callback automatique
- Possibilité d'ajouter d'autres providers (GitHub, Microsoft)

#### 4. Plugins

**Plugin Magic Link :**
- Génération automatique de tokens sécurisés
- Gestion de l'expiration (15 minutes)
- Envoi d'email via service externe (SendGrid, Resend, etc.)

**Plugin Two-Factor Authentication (2FA) :**
- Type : TOTP (Time-based One-Time Password)
- Génération de QR Code automatique
- Code à 6 chiffres, valide 30 secondes
- Intégration avec Google Authenticator

#### 5. Configuration des sessions
- Expiration par défaut : 7 jours
- Renouvellement automatique : toutes les 24 heures
- Stockage sécurisé dans la base de données
- Révocation manuelle possible

#### 6. Hooks personnalisés

Better Auth permet d'exécuter du code personnalisé avant ou après certaines actions :

**Hook après connexion :**
- Enregistrement dans les audit logs
- Vérification du 2FA pour SuperAdmin
- Blocage si 2FA non activé (SuperAdmin)

**Hook après inscription :**
- Enregistrement dans les audit logs
- Envoi d'email de bienvenue
- Attribution automatique du rôle

#### 7. Isolation multi-tenant

Better Auth supporte l'isolation multi-tenant via les métadonnées utilisateur :
- Stockage du `secretariatId` dans le profil utilisateur
- Filtrage automatique des requêtes selon le secrétariat
- Middleware vérifiant les permissions d'accès

---

### Frontend - Utilisation de Better Auth

Better Auth fournit un client React permettant aux composants d'interagir facilement avec le système d'authentification.

**Fonctionnalités disponibles :**
- Connexion email/password
- Inscription
- Déconnexion
- Accès à la session utilisateur
- Envoi de Magic Link
- Vérification de Magic Link
- Activation/désactivation 2FA
- Connexion avec Google OAuth

**Hook React principal :**
`useSession()` permet d'accéder à la session utilisateur dans n'importe quel composant et retourne :
- L'utilisateur connecté (ou null)
- Statut (chargement, connecté, déconnecté)
- Fonctions de mise à jour

---

## 🛡️ Sécurité avec Better Auth

### Protections Intégrées

#### 1. Hashing des mots de passe
- Algorithme bcrypt
- Salt automatique
- Jamais stocké en clair

#### 2. Tokens sécurisés
- Magic Links : UUID + hash
- Sessions : JWT sécurisés
- Expiration automatique

#### 3. Rate Limiting
- 5 tentatives de connexion maximum
- Blocage temporaire 15 minutes
- Protection contre force brute

#### 4. Protection CSRF
- Tokens CSRF automatiques
- Validation à chaque requête sensible

#### 5. Validation des entrées
- Format email
- Complexité mot de passe
- Sanitisation des données

#### 6. Audit Logs
- Traçabilité complète
- Enregistrement IP et User-Agent
- Détection d'activités suspectes

---

## 🔌 Routes d'Authentification

Better Auth gère automatiquement toutes les routes d'authentification via un point d'entrée unique :

**Route principale :** `/api/auth/[...all]`

Cette route capture automatiquement toutes les sous-routes :
- `/api/auth/sign-in` - Connexion
- `/api/auth/sign-up` - Inscription
- `/api/auth/sign-out` - Déconnexion
- `/api/auth/callback/google` - Callback Google OAuth
- `/api/auth/magic-link` - Magic Link
- `/api/auth/two-factor/enable` - Activer 2FA
- `/api/auth/two-factor/verify` - Vérifier code 2FA
- `/api/auth/two-factor/disable` - Désactiver 2FA

**Avantage :** Pas besoin de créer manuellement chaque route, Better Auth les gère automatiquement selon la configuration.

---

## 🎯 Intégration avec l'Application

### Middleware de Protection

Le middleware Next.js utilise Better Auth pour protéger les routes et gérer les permissions.

**Fonctionnalités :**
1. Vérification de session automatique
2. Redirection vers login si non connecté
3. Protection des routes SuperAdmin
4. Isolation multi-tenant (ajout du `secretariatId` dans les headers)
5. Exclusion des routes publiques

**Routes protégées :**
- `/dashboard` - Nécessite authentification
- `/superadmin` - Nécessite rôle SuperAdmin
- `/settings` - Nécessite authentification

**Routes publiques :**
- `/` - Page d'accueil
- `/auth/login` - Connexion
- `/auth/register` - Inscription

---

## 📝 Workflow Complet d'Inscription

### Inscription d'un Secrétariat Social

**Étape 1 : Choix de la méthode**
- L'utilisateur peut choisir entre :
  - Inscription classique (Email + Password)
  - Inscription via Google OAuth (plus rapide)

**Étape 2 : Authentification**
- **Si Email + Password :**
  - Saisie : nom, email, mot de passe
  - Better Auth valide les critères
  - Création du compte
- **Si Google OAuth :**
  - Authentification Google
  - Better Auth récupère les infos
  - Formulaire pré-rempli

**Étape 3 : Informations du Secrétariat**
- Nom du secrétariat
- Numéro de TVA
- Adresse
- Choix du plan (Starter, Pro, Enterprise)

**Étape 4 : Paiement Stripe**
- Redirection vers Stripe Checkout
- Saisie des informations de paiement
- Validation du paiement

**Étape 5 : Finalisation**
- Better Auth reçoit le webhook Stripe
- Création du secrétariat dans la base
- Attribution automatique du rôle AdminSecrétariat
- Envoi d'email de bienvenue
- Redirection vers le dashboard

---

## ✅ Avantages de Better Auth pour ce Projet

### 1. Gain de Temps de Développement

**Sans Better Auth :**
- Implémenter manuellement email/password (hashing, validation)
- Implémenter manuellement OAuth (flow complexe)
- Implémenter manuellement 2FA (génération QR Code, validation TOTP)
- Implémenter manuellement Magic Links (tokens, emails)
- Implémenter la gestion de sessions
- Gérer la sécurité (CSRF, rate limiting)

**Avec Better Auth :**
- Configuration en quelques lignes
- Toutes les fonctionnalités prêtes à l'emploi
- Sécurité intégrée

**Estimation :** Économie de **3-4 semaines de développement**

---

### 2. Sécurité Renforcée

- Code testé par la communauté
- Mises à jour de sécurité automatiques
- Best practices implémentées
- Protection contre les vulnérabilités connues

---

### 3. Expérience Utilisateur Améliorée

- Authentification fluide
- Plusieurs méthodes au choix
- 2FA simple à configurer
- Messages d'erreur clairs

---

### 4. Maintenance Simplifiée

- Mises à jour via npm
- Documentation complète
- Support communautaire actif
- Code centralisé

---

### 5. Évolutivité

- Ajout facile de nouveaux providers OAuth
- Support de nouvelles fonctionnalités d'authentification
- Scalabilité native (sessions, multi-tenant)

---

## 📚 Ressources

- **Better Auth Documentation** : https://www.better-auth.com/docs
- **Better Auth GitHub** : https://github.com/better-auth/better-auth
- **Exemples** : https://www.better-auth.com/docs/examples
- **Plugins** : https://www.better-auth.com/docs/plugins

---

**Dernière mise à jour :** 2026-01-26

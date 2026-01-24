# Documentation des Cas d'Utilisation - WorkZen Phase 1

**Projet :** WorkZen - Plateforme Multi-Tenant pour Secrétariats Sociaux
**Phase :** Phase 1 (Juillet 2025 - Juin 2027)
**Version :** 1.0
**Date :** Janvier 2026

---

## Table des Matières

1. [Introduction](#introduction)
2. [Acteurs du Système](#acteurs-du-système)
3. [Vue d'Ensemble des Diagrammes](#vue-densemble-des-diagrammes)
4. [Cas d'Utilisation SuperAdmin](#cas-dutilisation-superadmin)
5. [Cas d'Utilisation Admin Secrétariat](#cas-dutilisation-admin-secrétariat)
6. [Architecture Multi-Tenant](#architecture-multi-tenant)
7. [Système Externe : Stripe](#système-externe--stripe)
8. [Matrice de Traçabilité](#matrice-de-traçabilité)

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
**Rôle :** `SUPER_ADMIN`
**Accès :** Vue globale sur tous les secrétariats et utilisateurs
**Authentification :** 2FA obligatoire (Google Authenticator)

**Responsabilités :**
- Gestion complète des secrétariats sociaux
- Création et gestion des Admin Secrétariat
- Monitoring et analytics globaux
- Configuration des plans d'abonnement
- Consultation des logs système

---

### 2. Admin Secrétariat

**Description :** Administrateur d'un secrétariat social spécifique
**Rôle :** `SECRETARIAT_ADMIN`
**Accès :** Vue isolée limitée à son secrétariat (`secretariatId`)
**Authentification :** Authentification standard

**Responsabilités :**
- Gestion de son profil
- Consultation du dashboard de son secrétariat
- Visualisation des paramètres et utilisateurs de son secrétariat
- Gestion de l'abonnement via Stripe Customer Portal

---

### 3. Stripe (Système Externe)

**Description :** Plateforme de paiement externe
**Type :** Acteur secondaire (système)
**Rôle :** Gestion des paiements et abonnements

**Services fournis :**
- Traitement des paiements
- Gestion des abonnements (plans Starter, Pro, Enterprise)
- Customer Portal pour les clients
- Webhooks pour synchronisation

---

## Vue d'Ensemble des Diagrammes

### Diagrammes Disponibles

1. **`use-cases-general.drawio`**
   - Diagramme général avec tous les acteurs et use cases
   - Vue d'ensemble complète du système Phase 1
   - Inclut les interactions avec Stripe

2. **`use-cases-superadmin.drawio`**
   - Diagramme spécifique au SuperAdmin
   - 12 cas d'utilisation organisés par catégorie
   - Relations avec le système Stripe

3. **`use-cases-admin-secretariat.drawio`**
   - Diagramme spécifique à l'Admin Secrétariat
   - 8 cas d'utilisation avec isolation des données
   - Intégration Stripe Customer Portal

### Code Couleur

- **Bleu clair** (`#dae8fc`) : SuperAdmin
- **Vert clair** (`#d5e8d4`) : Admin Secrétariat
- **Jaune** (`#fff2cc`) : Stripe / Facturation
- **Violet** (`#e1d5e7`) : Gestion Secrétariats
- **Bleu** (`#b1ddf0`) : Gestion Utilisateurs
- **Rose/Rouge** (`#fad9d5`) : Analytics/Monitoring

---

## Cas d'Utilisation SuperAdmin

### Catégorie 1 : Gestion des Secrétariats

#### UC-01-01 : Créer un secrétariat

**Acteur principal :** SuperAdmin
**Prérequis :** SuperAdmin connecté et authentifié
**Déclencheur :** Le SuperAdmin clique sur "Nouveau Secrétariat"

**Scénario nominal :**
1. Le système affiche le formulaire de création
2. Le SuperAdmin remplit les informations :
   - Nom du secrétariat
   - Numéro de TVA (format BE0XXXXXXXXX)
   - Email de contact
   - Adresse
   - Plan d'abonnement initial (Starter/Pro/Enterprise)
3. Le système valide les données
4. Le système crée le secrétariat dans la base de données
5. Le système initialise l'abonnement Stripe
6. Le système affiche un message de confirmation

**Scénario alternatif :**
- **3a.** Le numéro de TVA existe déjà
  - Le système affiche un message d'erreur
  - Le SuperAdmin corrige l'information
  - Retour à l'étape 2

**Postconditions :** Un nouveau secrétariat est créé et visible dans la liste

---

#### UC-01-02 : Modifier un secrétariat

**Acteur principal :** SuperAdmin
**Prérequis :** SuperAdmin connecté, au moins un secrétariat existe
**Déclencheur :** Le SuperAdmin clique sur "Modifier" pour un secrétariat

**Scénario nominal :**
1. Le système affiche le formulaire pré-rempli
2. Le SuperAdmin modifie les informations souhaitées
3. Le système valide les modifications
4. Le système met à jour le secrétariat
5. Le système enregistre l'action dans les logs
6. Le système affiche un message de confirmation

**Postconditions :** Le secrétariat est mis à jour

---

#### UC-01-03 : Supprimer un secrétariat

**Acteur principal :** SuperAdmin
**Prérequis :** SuperAdmin connecté, secrétariat sans utilisateurs actifs
**Déclencheur :** Le SuperAdmin clique sur "Supprimer"

**Scénario nominal :**
1. Le système affiche une modale de confirmation
2. Le SuperAdmin confirme la suppression
3. Le système vérifie qu'aucun utilisateur n'est rattaché
4. Le système annule l'abonnement Stripe
5. Le système archive le secrétariat (soft delete)
6. Le système enregistre l'action dans les logs
7. Le système affiche un message de confirmation

**Scénario alternatif :**
- **3a.** Des utilisateurs sont rattachés
  - Le système affiche un message d'erreur
  - La suppression est annulée

**Postconditions :** Le secrétariat est archivé et n'apparaît plus dans la liste active

---

#### UC-01-04 : Consulter tous les secrétariats

**Acteur principal :** SuperAdmin
**Prérequis :** SuperAdmin connecté
**Déclencheur :** Le SuperAdmin accède à la page "Secrétariats"

**Scénario nominal :**
1. Le système récupère tous les secrétariats actifs
2. Le système affiche la liste avec :
   - Nom
   - TVA
   - Plan d'abonnement
   - Nombre d'utilisateurs
   - Statut de l'abonnement
   - Date de création
3. Le SuperAdmin peut filtrer et rechercher
4. Le SuperAdmin peut exporter la liste (CSV/Excel)

**Postconditions :** La liste des secrétariats est affichée

---

### Catégorie 2 : Gestion des Utilisateurs

#### UC-01-05 : Créer un Admin Secrétariat

**Acteur principal :** SuperAdmin
**Prérequis :** SuperAdmin connecté, au moins un secrétariat existe
**Déclencheur :** Le SuperAdmin clique sur "Nouvel Utilisateur"

**Scénario nominal :**
1. Le système affiche le formulaire de création
2. Le SuperAdmin remplit les informations :
   - Email
   - Prénom et nom
   - Rôle : `SECRETARIAT_ADMIN`
   - Secrétariat de rattachement
3. Le système valide les données (email unique)
4. Le système génère un mot de passe temporaire
5. Le système envoie un email d'invitation
6. Le système crée l'utilisateur
7. Le système enregistre l'action dans les logs

**Scénario alternatif :**
- **3a.** L'email existe déjà
  - Le système affiche un message d'erreur
  - Retour à l'étape 2

**Postconditions :** Un nouvel Admin Secrétariat est créé et peut se connecter

---

#### UC-01-06 : Modifier un utilisateur

**Acteur principal :** SuperAdmin
**Prérequis :** SuperAdmin connecté, utilisateur existe
**Déclencheur :** Le SuperAdmin clique sur "Modifier" pour un utilisateur

**Scénario nominal :**
1. Le système affiche le formulaire pré-rempli
2. Le SuperAdmin modifie les informations :
   - Prénom/nom
   - Email
   - Rôle (si applicable)
   - Secrétariat de rattachement
3. Le système valide les modifications
4. Le système met à jour l'utilisateur
5. Le système enregistre l'action dans les logs
6. Le système envoie une notification à l'utilisateur (si email changé)

**Postconditions :** L'utilisateur est mis à jour

---

#### UC-01-07 : Désactiver un compte

**Acteur principal :** SuperAdmin
**Prérequis :** SuperAdmin connecté, utilisateur actif
**Déclencheur :** Le SuperAdmin clique sur "Désactiver"

**Scénario nominal :**
1. Le système affiche une modale de confirmation
2. Le SuperAdmin confirme la désactivation
3. Le système désactive le compte (soft delete)
4. Le système révoque toutes les sessions actives
5. Le système enregistre l'action dans les logs
6. Le système envoie une notification à l'utilisateur

**Postconditions :** L'utilisateur ne peut plus se connecter

---

### Catégorie 3 : Analytics et Monitoring

#### UC-01-08 : Consulter dashboard global

**Acteur principal :** SuperAdmin
**Prérequis :** SuperAdmin connecté
**Déclencheur :** Le SuperAdmin accède à la page d'accueil

**Scénario nominal :**
1. Le système calcule les métriques globales :
   - Nombre de secrétariats actifs
   - Nombre total d'utilisateurs
   - MRR (Monthly Recurring Revenue)
   - Taux de croissance
2. Le système génère les graphiques :
   - Évolution des inscriptions
   - Répartition par plan
   - Revenus mensuels
3. Le système affiche le dashboard

**Postconditions :** Le dashboard global est affiché avec les métriques en temps réel

---

#### UC-01-09 : Voir stats par secrétariat

**Acteur principal :** SuperAdmin
**Prérequis :** SuperAdmin connecté, secrétariat sélectionné
**Déclencheur :** Le SuperAdmin clique sur "Statistiques" pour un secrétariat

**Scénario nominal :**
1. Le système récupère les données du secrétariat :
   - Nombre d'utilisateurs
   - Plan actuel
   - Utilisation (% des limites)
   - Historique d'utilisation
2. Le système génère les graphiques spécifiques
3. Le système affiche les recommandations (upgrade si proche des limites)

**Postconditions :** Les statistiques détaillées du secrétariat sont affichées

---

#### UC-01-11 : Consulter les logs système

**Acteur principal :** SuperAdmin
**Prérequis :** SuperAdmin connecté
**Déclencheur :** Le SuperAdmin accède à la page "Logs"

**Scénario nominal :**
1. Le système récupère les logs récents (AuditLog)
2. Le système affiche les logs avec :
   - Date/heure
   - Utilisateur
   - Action effectuée
   - Entité concernée
   - Résultat (succès/échec)
3. Le SuperAdmin peut filtrer par :
   - Date
   - Utilisateur
   - Type d'action
   - Secrétariat
4. Le SuperAdmin peut exporter les logs (CSV)

**Postconditions :** Les logs système sont consultables et filtrables

---

### Catégorie 4 : Facturation et Authentification

#### UC-01-10 : Gérer les plans d'abonnement

**Acteur principal :** SuperAdmin
**Acteur secondaire :** Stripe
**Prérequis :** SuperAdmin connecté
**Déclencheur :** Le SuperAdmin accède à la page "Plans"

**Scénario nominal :**
1. Le système affiche les plans disponibles :
   - **Starter** : 25 clients, 3 users, 5 GB
   - **Pro** : 100 clients, 10 users, 20 GB
   - **Enterprise** : Illimité
2. Le SuperAdmin peut modifier les plans (prix, limites)
3. Le système synchronise avec Stripe
4. Le système met à jour les secrétariats concernés

**Intégration Stripe :**
- Création de produits Stripe
- Gestion des prix (récurrents)
- Webhooks pour mises à jour

**Postconditions :** Les plans sont configurés et synchronisés avec Stripe

---

#### UC-01-12 : Se connecter (avec 2FA)

**Acteur principal :** SuperAdmin
**Prérequis :** Compte SuperAdmin existe
**Déclencheur :** Le SuperAdmin accède à la page de login

**Scénario nominal :**
1. Le système affiche le formulaire de connexion
2. Le SuperAdmin saisit email et mot de passe
3. Le système valide les identifiants
4. Le système demande le code 2FA (Google Authenticator)
5. Le SuperAdmin saisit le code 2FA
6. Le système valide le code 2FA
7. Le système crée une session sécurisée
8. Le système redirige vers le dashboard
9. Le système enregistre la connexion dans les logs

**Scénario alternatif :**
- **3a.** Identifiants invalides
  - Le système affiche un message d'erreur générique
  - Limite à 5 tentatives avant blocage temporaire
- **6a.** Code 2FA invalide
  - Le système affiche un message d'erreur
  - Limite à 3 tentatives

**Postconditions :** Le SuperAdmin est connecté et authentifié

---

## Cas d'Utilisation Admin Secrétariat

### Architecture Multi-Tenant

**Principe d'isolation :** Chaque Admin Secrétariat ne voit que les données de son secrétariat grâce au champ `secretariatId`.

**Middleware d'isolation :**
```typescript
// Header injecté : x-secretariat-id
const secretariatId = session.user.secretariatId;

// Toutes les requêtes sont filtrées
const data = await prisma.model.findMany({
  where: { secretariatId }
});
```

---

### Catégorie 1 : Authentification et Dashboard

#### UC-02-01 : Se connecter

**Acteur principal :** Admin Secrétariat
**Prérequis :** Compte Admin Secrétariat existe
**Déclencheur :** L'Admin Secrétariat accède à la page de login

**Scénario nominal :**
1. Le système affiche le formulaire de connexion
2. L'Admin Secrétariat saisit email et mot de passe
3. Le système valide les identifiants
4. Le système récupère le `secretariatId` de l'utilisateur
5. Le système crée une session avec isolation
6. Le système redirige vers le dashboard secrétariat
7. Le système enregistre la connexion dans les logs

**Scénario alternatif :**
- **3a.** Première connexion avec mot de passe temporaire
  - Le système force le changement de mot de passe
  - L'Admin Secrétariat définit un nouveau mot de passe
  - Retour à l'étape 3

**Postconditions :** L'Admin Secrétariat est connecté et voit uniquement son secrétariat

---

#### UC-02-02 : Consulter son dashboard

**Acteur principal :** Admin Secrétariat
**Prérequis :** Admin Secrétariat connecté
**Déclencheur :** L'Admin Secrétariat accède à la page d'accueil

**Scénario nominal :**
1. Le système récupère les données du secrétariat (filtrées par `secretariatId`)
2. Le système affiche les métriques :
   - Plan actuel (Starter/Pro/Enterprise)
   - Utilisation clients (ex: 15/25)
   - Utilisation utilisateurs (ex: 2/3)
   - Utilisation stockage (ex: 2.3 GB / 5 GB)
3. Le système affiche les alertes si proche des limites
4. Le système affiche une section "Prochainement" (Phase 2)

**Postconditions :** Le dashboard avec les métriques isolées est affiché

---

### Catégorie 2 : Gestion du Profil

#### UC-02-03 : Voir son profil

**Acteur principal :** Admin Secrétariat
**Prérequis :** Admin Secrétariat connecté
**Déclencheur :** L'Admin Secrétariat clique sur "Mon Profil"

**Scénario nominal :**
1. Le système récupère les informations de l'utilisateur
2. Le système affiche :
   - Prénom et nom
   - Email
   - Rôle (SECRETARIAT_ADMIN)
   - Secrétariat de rattachement
   - Date de création du compte
   - Dernière connexion

**Postconditions :** Le profil de l'utilisateur est affiché

---

#### UC-02-04 : Modifier son profil

**Acteur principal :** Admin Secrétariat
**Prérequis :** Admin Secrétariat connecté
**Déclencheur :** L'Admin Secrétariat clique sur "Modifier mon profil"

**Scénario nominal :**
1. Le système affiche le formulaire pré-rempli
2. L'Admin Secrétariat modifie :
   - Prénom et nom
   - Email (avec vérification)
   - Mot de passe (optionnel)
3. Le système valide les modifications
4. Le système met à jour le profil
5. Le système enregistre l'action dans les logs
6. Le système affiche un message de confirmation

**Scénario alternatif :**
- **3a.** Changement d'email
  - Le système envoie un email de confirmation
  - L'utilisateur doit valider le nouvel email
  - L'email est mis à jour après validation

**Postconditions :** Le profil est mis à jour

---

### Catégorie 3 : Gestion du Secrétariat

#### UC-02-05 : Voir les paramètres du secrétariat

**Acteur principal :** Admin Secrétariat
**Prérequis :** Admin Secrétariat connecté
**Déclencheur :** L'Admin Secrétariat accède à "Paramètres"

**Scénario nominal :**
1. Le système récupère les informations du secrétariat (filtrées par `secretariatId`)
2. Le système affiche :
   - Nom du secrétariat
   - Numéro de TVA
   - Email de contact
   - Adresse
   - Plan d'abonnement actuel
   - Limites associées
3. L'Admin Secrétariat peut consulter (lecture seule)

**Note :** Modification réservée au SuperAdmin en Phase 1

**Postconditions :** Les paramètres du secrétariat sont affichés

---

#### UC-02-06 : Voir la liste de ses utilisateurs

**Acteur principal :** Admin Secrétariat
**Prérequis :** Admin Secrétariat connecté
**Déclencheur :** L'Admin Secrétariat accède à "Utilisateurs"

**Scénario nominal :**
1. Le système récupère les utilisateurs (filtrés par `secretariatId`)
2. Le système affiche la liste avec :
   - Prénom et nom
   - Email
   - Rôle
   - Statut (actif/inactif)
   - Dernière connexion
3. L'Admin Secrétariat peut consulter (lecture seule)

**Note :** Création d'utilisateurs réservée au SuperAdmin en Phase 1
**Future Phase 2 :** L'Admin Secrétariat pourra créer des Consultants

**Postconditions :** La liste des utilisateurs du secrétariat est affichée

---

### Catégorie 4 : Facturation Stripe

#### UC-02-07 : Gérer son abonnement (Stripe Portal)

**Acteur principal :** Admin Secrétariat
**Acteur secondaire :** Stripe
**Prérequis :** Admin Secrétariat connecté, abonnement actif
**Déclencheur :** L'Admin Secrétariat clique sur "Gérer l'abonnement"

**Scénario nominal :**
1. Le système récupère le `stripeCustomerId` du secrétariat
2. Le système génère une session Stripe Customer Portal
3. Le système redirige vers Stripe Customer Portal
4. L'Admin Secrétariat peut :
   - Changer de plan (upgrade/downgrade)
   - Mettre à jour le moyen de paiement
   - Annuler l'abonnement
5. Stripe traite les modifications
6. Stripe envoie un webhook à WorkZen
7. Le système met à jour l'abonnement dans la base de données
8. L'utilisateur est redirigé vers WorkZen

**Intégration Stripe :**
```typescript
const session = await stripe.billingPortal.sessions.create({
  customer: stripeCustomerId,
  return_url: `${process.env.APP_URL}/secretariat/billing`
});
```

**Postconditions :** L'abonnement est géré via Stripe

---

#### UC-02-08 : Consulter l'historique de facturation

**Acteur principal :** Admin Secrétariat
**Acteur secondaire :** Stripe
**Prérequis :** Admin Secrétariat connecté
**Déclencheur :** L'Admin Secrétariat accède à "Facturation"

**Scénario nominal :**
1. Le système récupère les factures Stripe via API
2. Le système affiche l'historique :
   - Date de facturation
   - Montant
   - Plan
   - Statut (payé/impayé)
   - Télécharger PDF
3. L'Admin Secrétariat peut télécharger les factures

**Intégration Stripe :**
```typescript
const invoices = await stripe.invoices.list({
  customer: stripeCustomerId,
  limit: 12
});
```

**Postconditions :** L'historique de facturation est affiché

---

## Architecture Multi-Tenant

### Principe d'Isolation

WorkZen utilise une architecture **multi-tenant avec isolation au niveau des données** (Row-Level Security).

#### Avantages

✅ **Scalabilité optimale** : Un seul schéma de base de données
✅ **Coûts réduits** : Infrastructure partagée
✅ **Maintenance simplifiée** : Une seule application à déployer
✅ **Isolation sécurisée** : Filtrage systématique par `secretariatId`

#### Implémentation

**1. Middleware Next.js**

```typescript
export async function middleware(request: NextRequest) {
  const session = await getSession();
  const path = request.nextUrl.pathname;

  // Routes SuperAdmin : accès global
  if (path.startsWith('/admin')) {
    if (session?.user.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect('/login');
    }
    return NextResponse.next();
  }

  // Routes Secrétariat : isolation par secretariatId
  if (path.startsWith('/secretariat')) {
    if (session?.user.role !== 'SECRETARIAT_ADMIN') {
      return NextResponse.redirect('/login');
    }

    // Injection du secretariatId
    const headers = new Headers(request.headers);
    headers.set('x-secretariat-id', session.user.secretariatId);

    return NextResponse.next({
      request: { headers }
    });
  }
}
```

**2. API Routes avec Isolation**

```typescript
export async function GET(request: Request) {
  const session = await getSession();

  // SuperAdmin : voit tout
  if (session.user.role === 'SUPER_ADMIN') {
    const data = await prisma.model.findMany();
    return Response.json(data);
  }

  // Admin Secrétariat : voit uniquement son secrétariat
  if (session.user.role === 'SECRETARIAT_ADMIN') {
    const data = await prisma.model.findMany({
      where: { secretariatId: session.user.secretariatId }
    });
    return Response.json(data);
  }

  return new Response('Forbidden', { status: 403 });
}
```

**3. Sécurité des Requêtes**

Chaque requête Prisma pour un Admin Secrétariat **DOIT** inclure le filtre `secretariatId` :

```typescript
// ✅ CORRECT
const users = await prisma.user.findMany({
  where: { secretariatId: session.user.secretariatId }
});

// ❌ INCORRECT - Fuite de données !
const users = await prisma.user.findMany();
```

---

## Système Externe : Stripe

### Intégration Stripe

#### Plans d'Abonnement

| Plan | Prix | Clients | Utilisateurs | Stockage |
|------|------|---------|--------------|----------|
| **Starter** | 99€/mois | 25 | 3 | 5 GB |
| **Pro** | 299€/mois | 100 | 10 | 20 GB |
| **Enterprise** | Sur devis | Illimité | Illimité | Illimité |

#### Flux de Paiement

1. **Création d'un secrétariat**
   - SuperAdmin sélectionne un plan
   - Stripe crée un `Customer`
   - Stripe crée une `Subscription`
   - WorkZen reçoit `stripeCustomerId` et `stripeSubscriptionId`

2. **Gestion de l'abonnement**
   - Admin Secrétariat accède au Stripe Customer Portal
   - Modifications effectuées sur Stripe
   - Stripe envoie des webhooks à WorkZen
   - WorkZen met à jour la base de données

#### Webhooks Stripe

WorkZen écoute les événements suivants :

- `customer.subscription.created` : Nouvel abonnement
- `customer.subscription.updated` : Changement de plan
- `customer.subscription.deleted` : Annulation
- `invoice.paid` : Paiement réussi
- `invoice.payment_failed` : Échec de paiement

**Endpoint webhook :**
```
POST /api/webhooks/stripe
```

**Sécurité :**
- Vérification de la signature Stripe
- Secret webhook configuré dans les variables d'environnement

---

## Matrice de Traçabilité

### SuperAdmin - Fonctionnalités

| Use Case | Nom | Priorité | Statut Phase 1 |
|----------|-----|----------|----------------|
| UC-01-01 | Créer un secrétariat | Haute | ✅ Implémenté |
| UC-01-02 | Modifier un secrétariat | Haute | ✅ Implémenté |
| UC-01-03 | Supprimer un secrétariat | Moyenne | ✅ Implémenté |
| UC-01-04 | Consulter tous les secrétariats | Haute | ✅ Implémenté |
| UC-01-05 | Créer un Admin Secrétariat | Haute | ✅ Implémenté |
| UC-01-06 | Modifier un utilisateur | Haute | ✅ Implémenté |
| UC-01-07 | Désactiver un compte | Moyenne | ✅ Implémenté |
| UC-01-08 | Consulter dashboard global | Haute | ✅ Implémenté |
| UC-01-09 | Voir stats par secrétariat | Moyenne | ✅ Implémenté |
| UC-01-10 | Gérer les plans d'abonnement | Haute | ✅ Implémenté |
| UC-01-11 | Consulter les logs système | Moyenne | ✅ Implémenté |
| UC-01-12 | Se connecter (avec 2FA) | Haute | ✅ Implémenté |

**Total SuperAdmin :** 12 cas d'utilisation

---

### Admin Secrétariat - Fonctionnalités

| Use Case | Nom | Priorité | Statut Phase 1 |
|----------|-----|----------|----------------|
| UC-02-01 | Se connecter | Haute | ✅ Implémenté |
| UC-02-02 | Consulter son dashboard | Haute | ✅ Implémenté |
| UC-02-03 | Voir son profil | Moyenne | ✅ Implémenté |
| UC-02-04 | Modifier son profil | Moyenne | ✅ Implémenté |
| UC-02-05 | Voir les paramètres du secrétariat | Moyenne | ✅ Implémenté |
| UC-02-06 | Voir la liste de ses utilisateurs | Basse | ✅ Implémenté |
| UC-02-07 | Gérer son abonnement (Stripe Portal) | Haute | ✅ Implémenté |
| UC-02-08 | Consulter l'historique de facturation | Moyenne | ✅ Implémenté |

**Total Admin Secrétariat :** 8 cas d'utilisation

---

### Récapitulatif Global

| Acteur | Nombre de Use Cases | Statut |
|--------|---------------------|--------|
| **SuperAdmin** | 12 | ✅ 100% Phase 1 |
| **Admin Secrétariat** | 8 | ✅ 100% Phase 1 |
| **Stripe (Système)** | 2 | ✅ Intégré |
| **TOTAL** | **22** | **✅ Complet** |

---

## Évolution Future

### Phase 2 (Post-TFE)

**Nouveau rôle :** Consultant

**Use Cases prévus :**
- Gestion des clients (entreprises)
- Gestion des employés
- Génération de fiches de paie
- Calendrier ONSS
- Export de documents

**Estimation :** +15 cas d'utilisation

---

### Phase 3 (Portail Client)

**Nouveaux rôles :** Client, Employé

**Use Cases prévus :**
- Portail client pour consulter les documents
- Portail employé pour voir les fiches de paie
- Gestion des demandes (congés, absences)

**Estimation :** +10 cas d'utilisation

---

## Annexes

### Technologies Utilisées

- **Frontend :** Next.js 15, React 19, TypeScript, Tailwind CSS, ShadcnUI
- **Backend :** Next.js API Routes, Prisma ORM
- **Base de données :** PostgreSQL (Supabase)
- **Authentification :** Better Auth (avec 2FA)
- **Paiements :** Stripe
- **Déploiement :** Vercel
- **Monorepo :** Turborepo

### Références

- Documentation Stripe : https://stripe.com/docs
- Next.js : https://nextjs.org/docs
- Prisma : https://www.prisma.io/docs
- Better Auth : https://better-auth.com/docs

---

**Document créé le :** Janvier 2026
**Dernière mise à jour :** Janvier 2026
**Version :** 1.0
**Auteur :** WorkZen Team

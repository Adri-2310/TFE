## Cas d'Utilisation SuperAdmin

### Catégorie 1 : Gestion des Secrétariats

#### UC-01-01 : Modifier un secrétariat

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

#### UC-01-02 : Supprimer un secrétariat

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

#### UC-01-03 : Consulter tous les secrétariats

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

#### UC-01-04 : Modifier un utilisateur

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

#### UC-01-05 : Désactiver un compte

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

#### UC-01-06 : Consulter dashboard global

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

#### UC-01-07 : Voir stats par secrétariat

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

#### UC-01-8 : Consulter les logs système

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

#### UC-01-9 : Gérer les plans d'abonnement

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

#### UC-01-10 : Se connecter (avec 2FA)

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

## Cas d'Utilisation SuperAdmin

> **Note importante sur la création des secrétariats et attribution automatique du rôle :**
> Les secrétariats sociaux ne sont **PAS créés par le SuperAdmin**. Le processus d'inscription fonctionne ainsi :
> 1. Le **propriétaire/patron** d'un secrétariat social s'inscrit sur la plateforme
> 2. Lors de l'inscription, il crée son secrétariat et choisit son plan d'abonnement (Starter, Pro, Enterprise)
> 3. Le système lui attribue **automatiquement le rôle AdminSecrétariat** car c'est le compte principal/patron du secrétariat
> 4. Une fois inscrit, cet AdminSecrétariat principal peut créer d'autres AdminSecrétariat pour son équipe (employés du secrétariat)
>
> Le SuperAdmin intervient uniquement pour :
> - Consulter tous les secrétariats et leurs utilisateurs (vue globale)
> - Modifier des informations si nécessaire
> - Supprimer des secrétariats
> - Attribuer manuellement le rôle AdminSecrétariat à un utilisateur existant (cas exceptionnel)

> **Note importante sur le bootstrap du système (Premier SuperAdmin) :**
> Le **premier SuperAdmin** est créé automatiquement lors du déploiement initial de l'application via une **migration/seed de base de données**. Ce compte SuperAdmin "root" est hardcodé avec des identifiants sécurisés (à modifier lors de la première connexion). Une fois le premier SuperAdmin créé, celui-ci peut créer d'autres SuperAdmin via l'interface (UC-01-06). Cette approche garantit :
> - Qu'il y a toujours au moins un SuperAdmin dans le système
> - Que le système peut démarrer sans intervention manuelle
> - Qu'il est impossible de se retrouver "lock-out" (sans accès)

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
1. Le système affiche la liste de TOUS les utilisateurs (tous secrétariats confondus)
2. Le SuperAdmin peut filtrer par :
    - Secrétariat
    - Rôle (SuperAdmin, AdminSecrétariat)
    - Statut (actif, inactif)
    - Date de création
3. Le SuperAdmin sélectionne un utilisateur
4. Le système affiche le formulaire pré-rempli avec :
    - Prénom/nom
    - Email
    - Rôle actuel
    - Secrétariat de rattachement (si AdminSecrétariat)
    - Date de création
    - Statut du compte
5. Le SuperAdmin modifie les informations souhaitées
6. Le système valide les modifications
7. Le système met à jour l'utilisateur
8. Le système enregistre l'action dans les logs
9. Le système envoie une notification à l'utilisateur (si email changé)

**Scénario alternatif :**
- **6a.** Email déjà utilisé par un autre utilisateur
    - Le système affiche un message d'erreur
    - Le SuperAdmin doit utiliser un autre email
- **6b.** Tentative de changer le secrétariat de rattachement d'un AdminSecrétariat principal (propriétaire)
    - Le système affiche un avertissement
    - Le SuperAdmin peut confirmer ou annuler

**Postconditions :** L'utilisateur est mis à jour et la modification est tracée dans les logs

**Note importante :**
Le SuperAdmin a une vue globale sur **TOUS les utilisateurs de TOUS les secrétariats**, car il gère l'ensemble de la plateforme.

---

#### UC-01-05 : Désactiver un compte utilisateur

**Acteur principal :** SuperAdmin
**Prérequis :** SuperAdmin connecté, utilisateur actif
**Déclencheur :** Le SuperAdmin clique sur "Désactiver" pour un utilisateur

**Scénario nominal :**
1. Le système affiche la liste de TOUS les utilisateurs (tous secrétariats confondus)
2. Le SuperAdmin sélectionne un utilisateur à désactiver
3. Le système affiche une modale de confirmation avec :
    - Informations de l'utilisateur (nom, email, rôle, secrétariat)
    - Impact de la désactivation
    - Champ de saisie pour le motif (optionnel)
4. Le SuperAdmin saisit le motif (optionnel) et confirme la désactivation
5. Le système désactive le compte (soft delete : is_active = false)
6. Le système révoque toutes les sessions actives de l'utilisateur
7. Le système enregistre l'action dans les logs avec le motif
8. Le système envoie une notification à l'utilisateur
9. Le système affiche un message de confirmation

**Scénario alternatif :**
- **5a.** Tentative de désactiver le dernier SuperAdmin actif
    - Le système affiche un message d'erreur : "Impossible de désactiver le dernier SuperAdmin du système"
    - L'opération est annulée
- **5b.** Tentative de se désactiver soi-même (si dernier SuperAdmin)
    - Le système affiche un message d'erreur
    - L'opération est annulée
- **5c.** Désactivation d'un AdminSecrétariat principal (propriétaire du secrétariat)
    - Le système affiche un avertissement : "Cet utilisateur est le propriétaire du secrétariat. La désactivation pourrait impacter la gestion du secrétariat."
    - Le SuperAdmin peut confirmer ou annuler

**Postconditions :**
- L'utilisateur ne peut plus se connecter
- Toutes les sessions actives sont révoquées
- L'action est tracée dans les logs avec horodatage, auteur et motif

**Note importante :**
Le SuperAdmin peut désactiver **n'importe quel utilisateur de n'importe quel secrétariat**, car il a une vue globale sur toute la plateforme. Cependant, des protections existent pour éviter de désactiver le dernier SuperAdmin.

---

#### UC-01-06 : Gérer les rôles utilisateurs (RBAC)

**Acteur principal :** SuperAdmin
**Prérequis :** SuperAdmin connecté
**Déclencheur :** Le SuperAdmin accède à la page "Gestion des Utilisateurs"

**Scénario nominal (Attribuer manuellement le rôle AdminSecrétariat - CAS EXCEPTIONNEL) :**

> **Note :** Ce scénario est **exceptionnel**. Normalement, le rôle AdminSecrétariat est attribué **automatiquement lors de l'inscription** du propriétaire d'un secrétariat. Ce cas d'utilisation intervient uniquement si le SuperAdmin doit manuellement attribuer ce rôle (ex : correction, migration de données, cas spécial).

1. Le système affiche la liste de TOUS les utilisateurs (tous secrétariats confondus)
2. Le SuperAdmin recherche et sélectionne un utilisateur (sans rôle ou avec un rôle différent)
3. Le système affiche les informations de l'utilisateur :
    - Nom, prénom, email
    - Rôle actuel
    - Secrétariat rattaché (si AdminSecrétariat)
    - Date de création
    - Statut du compte
4. Le SuperAdmin clique sur "Attribuer le rôle AdminSecrétariat"
5. Le système affiche un formulaire :
    - Sélection du secrétariat à rattacher (liste déroulante)
    - Type d'AdminSecrétariat :
        - **Principal** (propriétaire du secrétariat)
        - **Secondaire** (employé du secrétariat)
    - Confirmation de l'attribution
6. Le SuperAdmin valide le formulaire
7. Le système attribue le rôle AdminSecrétariat à l'utilisateur
8. Le système rattache l'utilisateur au secrétariat sélectionné
9. Le système enregistre l'action dans les logs (qui, quand, quel secrétariat)
10. Le système envoie une notification à l'utilisateur avec ses nouveaux accès
11. Le système applique immédiatement les nouvelles permissions

**Scénario nominal (Créer un autre SuperAdmin) :**
1. Le système affiche la page "Gestion des SuperAdmin"
2. Le SuperAdmin clique sur "Ajouter un SuperAdmin"
3. Le système affiche un formulaire de création :
    - Email
    - Prénom/Nom
    - Confirmation de l'attribution du rôle SuperAdmin
4. Le SuperAdmin remplit le formulaire
5. Le système valide les données
6. Le système crée le compte utilisateur avec le rôle SuperAdmin
7. Le système envoie un email d'invitation avec lien de configuration du mot de passe
8. Le système enregistre l'action dans les logs (qui a créé quel SuperAdmin)
9. Le système affiche un message de confirmation

**Scénario nominal (Retirer un rôle) :**
1. Le système affiche la liste des utilisateurs avec leurs rôles
2. Le SuperAdmin sélectionne un utilisateur
3. Le SuperAdmin clique sur "Retirer le rôle"
4. Le système affiche une modale de confirmation avec avertissement
5. Le SuperAdmin confirme la révocation
6. Le système vérifie les contraintes de sécurité (voir scénarios alternatifs)
7. Le système révoque le rôle de l'utilisateur
8. Le système révoque toutes les sessions actives de l'utilisateur
9. Le système enregistre l'action dans les logs
10. Le système envoie une notification à l'utilisateur
11. Le système redirige l'utilisateur vers une page d'accueil limitée

**Scénarios alternatifs :**
- **6a.** Tentative de retirer le dernier rôle SuperAdmin du système
    - Le système affiche un message d'erreur : "Impossible de supprimer le dernier SuperAdmin du système"
    - L'opération est annulée
    - Au moins un SuperAdmin doit toujours exister
- **6b.** Tentative de se retirer soi-même le rôle SuperAdmin (si dernier SuperAdmin)
    - Le système affiche un message d'erreur : "Vous ne pouvez pas vous retirer le rôle SuperAdmin car vous êtes le dernier"
    - L'opération est annulée
- **5a.** Email déjà utilisé lors de la création d'un SuperAdmin
    - Le système affiche un message d'erreur
    - Le SuperAdmin doit utiliser un autre email

**Postconditions :**
- L'utilisateur dispose du nouveau rôle et des permissions associées
- Toutes les actions sont tracées dans les logs avec horodatage et auteur
- Les utilisateurs concernés sont notifiés par email

**Note pour Phase 1 - Architecture des rôles :**

Les rôles disponibles en Phase 1 sont uniquement :

1. **SuperAdmin** (Gestionnaire de la plateforme)
   - Accès complet à la plateforme
   - Vue globale sur TOUS les secrétariats et TOUS les utilisateurs
   - Gestion des plans d'abonnement, configuration système, logs
   - Créé via seed/migration au déploiement initial
   - Peut créer d'autres SuperAdmin via l'interface

2. **AdminSecrétariat** (Client = Propriétaire d'un secrétariat social)
   - Attribué **automatiquement lors de l'inscription** du propriétaire d'un secrétariat
   - Gestion d'un secrétariat spécifique (son secrétariat uniquement)
   - Peut créer d'autres AdminSecrétariat pour son équipe (employés)
   - Gère les consultants de son secrétariat (Phase 2)
   - Gère la facturation et l'abonnement de son secrétariat

**Workflow d'inscription d'un secrétariat :**
1. Le propriétaire/patron s'inscrit sur la plateforme
2. Il crée son secrétariat et choisit son plan (Starter, Pro, Enterprise)
3. Le système lui attribue automatiquement le rôle AdminSecrétariat (compte principal)
4. Il peut ensuite créer d'autres AdminSecrétariat pour son équipe

**Les Consultants seront gérés en Phase 2.**

---

### Catégorie 3 : Analytics et Monitoring

#### UC-01-07 : Consulter dashboard global

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

#### UC-01-08 : Voir stats par secrétariat

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

#### UC-01-09 : Consulter les logs système

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

#### UC-01-10 : Exporter rapports globaux

**Acteur principal :** SuperAdmin
**Prérequis :** SuperAdmin connecté, données disponibles
**Déclencheur :** Le SuperAdmin clique sur "Exporter" dans le dashboard ou la section Analytics

**Scénario nominal :**
1. Le système affiche les options d'export :
    - Type de rapport (activité utilisateurs, revenus, croissance, utilisation)
    - Format (CSV, Excel, PDF)
    - Période (7 jours, 30 jours, 90 jours, personnalisée)
    - Filtres optionnels (par secrétariat, par plan, par statut)
2. Le SuperAdmin sélectionne les options souhaitées
3. Le système valide les paramètres
4. Le système génère le rapport avec :
    - Métriques agrégées
    - Graphiques et visualisations
    - Tableaux de données détaillés
    - Horodatage et métadonnées
5. Le système télécharge le fichier
6. Le système enregistre l'export dans les logs

**Scénario alternatif :**
- **3a.** Période trop large (> 1 an)
    - Le système affiche un avertissement
    - Le SuperAdmin peut confirmer ou ajuster
- **4a.** Génération du rapport échoue
    - Le système affiche un message d'erreur
    - Le système propose de réessayer ou de contacter le support

**Postconditions :** Le rapport est généré et téléchargé au format choisi

---

### Catégorie 4 : Configuration Système

#### UC-01-11 : Gérer les plans d'abonnement

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

#### UC-01-12 : Configurer les paramètres globaux

**Acteur principal :** SuperAdmin
**Prérequis :** SuperAdmin connecté
**Déclencheur :** Le SuperAdmin accède à la page "Paramètres Système"

**Scénario nominal :**
1. Le système affiche les sections de configuration :
    - **Sécurité** :
        - Politique de mots de passe (longueur min, complexité)
        - Durée de session (timeout)
        - Tentatives de connexion max
        - Activation 2FA obligatoire
    - **Notifications** :
        - Email SMTP configuration
        - Templates d'emails
        - Notifications automatiques (système)
    - **Limites système** :
        - Taille max upload (par fichier)
        - Quota de stockage par défaut
        - Rate limiting API
    - **Intégrations** :
        - Clés API externes
        - Webhooks système
        - Services tiers (Stripe, SendGrid, etc.)
    - **Maintenance** :
        - Mode maintenance (activer/désactiver)
        - Message de maintenance personnalisé
        - Planification des sauvegardes
2. Le SuperAdmin modifie les paramètres souhaités
3. Le système valide les modifications
4. Le système applique les changements
5. Le système enregistre l'action dans les logs
6. Le système affiche un message de confirmation

**Scénario alternatif :**
- **3a.** Paramètres invalides (ex: timeout trop court)
    - Le système affiche un message d'erreur avec les contraintes
    - Le SuperAdmin doit corriger avant de valider
- **4a.** Application des changements nécessite un redémarrage
    - Le système affiche un avertissement
    - Le SuperAdmin peut planifier le redémarrage

**Postconditions :** Les paramètres système sont mis à jour et appliqués

---

### Catégorie 5 : Facturation

#### UC-01-13 : Traiter les paiements

**Acteur principal :** SuperAdmin (en consultation/intervention)
**Acteur secondaire :** Stripe, AdminSecrétariat
**Prérequis :** SuperAdmin connecté, intégration Stripe active
**Déclencheur :** Événement de paiement (succès, échec, litige) ou consultation manuelle

**Scénario nominal (Consultation) :**
1. Le système affiche le dashboard des paiements :
    - Paiements récents (statut, montant, date)
    - Paiements en échec
    - Litiges en cours
    - Statistiques (taux de succès, MRR, churn)
2. Le SuperAdmin peut filtrer par :
    - Secrétariat
    - Statut (succeeded, failed, pending, disputed)
    - Période
    - Montant
3. Le système affiche les détails de chaque transaction :
    - ID Stripe
    - Secrétariat concerné
    - Plan d'abonnement
    - Montant et devise
    - Méthode de paiement
    - Statut et historique

**Scénario nominal (Traitement automatique via Webhooks) :**
1. Stripe envoie un webhook de paiement
2. Le système vérifie la signature Stripe
3. Le système traite l'événement selon le type :
    - **payment_intent.succeeded** :
        - Met à jour le statut de l'abonnement
        - Génère la facture
        - Envoie une notification au secrétariat
        - Enregistre dans les logs
    - **payment_intent.failed** :
        - Marque le paiement comme échoué
        - Déclenche la politique de relance (3 tentatives)
        - Envoie une notification au secrétariat
        - Alerte le SuperAdmin si échec définitif
    - **invoice.payment_failed** :
        - Suspend l'accès après X tentatives échouées
        - Envoie une notification au secrétariat
        - Crée une alerte pour le SuperAdmin
    - **customer.subscription.deleted** :
        - Archive le secrétariat (soft delete)
        - Révoque les accès
        - Enregistre dans les logs
4. Le système enregistre tous les événements dans l'historique

**Scénario nominal (Intervention manuelle) :**
1. Le SuperAdmin identifie un paiement problématique
2. Le SuperAdmin peut :
    - Forcer une nouvelle tentative de paiement
    - Annuler un paiement en litige
    - Rembourser un paiement (partiel ou total)
    - Réactiver un abonnement suspendu
    - Contacter le secrétariat via le système
3. Le système exécute l'action demandée
4. Le système synchronise avec Stripe
5. Le système enregistre l'intervention dans les logs
6. Le système envoie une notification au secrétariat

**Scénario alternatif :**
- **2a.** Webhook Stripe invalide (signature incorrecte)
    - Le système rejette l'événement
    - Le système enregistre une alerte de sécurité
    - Le SuperAdmin est notifié
- **3a.** Remboursement impossible (délai dépassé)
    - Le système affiche un message d'erreur
    - Le SuperAdmin doit traiter manuellement via Stripe
- **4a.** Échec de synchronisation avec Stripe
    - Le système réessaie automatiquement (3 tentatives)
    - Si échec définitif, alerte le SuperAdmin

**Intégration Stripe :**
- Webhooks : `payment_intent.succeeded`, `payment_intent.failed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.dispute.created`
- API Stripe : Refunds, Payment Intents, Subscriptions management
- Gestion des erreurs réseau et timeouts

**Postconditions :**
- Les paiements sont traités correctement et synchronisés avec Stripe
- Les statuts d'abonnement sont à jour
- Les secrétariats sont notifiés des événements de paiement
- Le SuperAdmin dispose d'une visibilité complète sur les transactions

---

### Catégorie 6 : Authentification

#### UC-01-14 : Se connecter

**Acteur principal :** SuperAdmin
**Acteur secondaire :** Google (pour OAuth), Service Email (pour Magic Link)
**Prérequis :** Compte SuperAdmin existe
**Déclencheur :** Le SuperAdmin accède à la page de login

**Vue d'ensemble :**
Le système propose **3 méthodes d'authentification** au choix :
1. **Email + Mot de passe** (avec 2FA obligatoire pour SuperAdmin)
2. **Magic Link** (lien de connexion envoyé par email)
3. **Google OAuth** (authentification via Google avec 2FA Google)

---

##### Méthode 1 : Email + Mot de passe (avec 2FA)

**Scénario nominal :**
1. Le système affiche le formulaire de connexion avec 3 options
2. Le SuperAdmin sélectionne "Se connecter avec Email/Mot de passe"
3. Le système affiche les champs :
    - Email
    - Mot de passe
    - Bouton "Se connecter"
4. Le SuperAdmin saisit email et mot de passe
5. Le système valide les identifiants
6. Le système vérifie si le 2FA est activé :
    - **Pour SuperAdmin** : 2FA obligatoire (Google Authenticator)
    - Le système demande le code 2FA
7. Le SuperAdmin saisit le code 2FA (6 chiffres)
8. Le système valide le code 2FA
9. Le système crée une session sécurisée (JWT)
10. Le système redirige vers le dashboard SuperAdmin
11. Le système enregistre la connexion dans les logs

**Scénario alternatif :**
- **5a.** Identifiants invalides
    - Le système affiche un message d'erreur générique : "Email ou mot de passe incorrect"
    - Limite à 5 tentatives avant blocage temporaire (15 minutes)
    - Le système enregistre la tentative échouée
- **6a.** 2FA non configuré (première connexion SuperAdmin)
    - Le système redirige vers la page de configuration 2FA
    - Le SuperAdmin scanne le QR Code avec Google Authenticator
    - Le SuperAdmin saisit le code de vérification
    - Le système active le 2FA et continue la connexion
- **8a.** Code 2FA invalide
    - Le système affiche un message d'erreur : "Code 2FA incorrect"
    - Limite à 3 tentatives avant blocage temporaire (5 minutes)
    - Le système enregistre la tentative échouée

**Postconditions :** Le SuperAdmin est connecté et authentifié avec 2FA

---

##### Méthode 2 : Magic Link (Lien de connexion par email)

**Scénario nominal :**
1. Le système affiche le formulaire de connexion avec 3 options
2. Le SuperAdmin sélectionne "Se connecter avec Magic Link"
3. Le système affiche un champ :
    - Email
    - Bouton "Envoyer le lien de connexion"
4. Le SuperAdmin saisit son email
5. Le système valide que l'email existe dans la base de données
6. Le système génère un token de connexion unique :
    - Token aléatoire sécurisé (UUID + hash)
    - Durée de validité : 15 minutes
    - Usage unique (consommé après utilisation)
7. Le système envoie un email contenant :
    - Lien de connexion : `https://plateforme.com/auth/magic-link?token=xxx`
    - Durée de validité (15 minutes)
    - Avertissement de sécurité
    - Adresse IP de la demande
8. Le système affiche un message : "Un lien de connexion a été envoyé à votre email"
9. Le SuperAdmin ouvre son email et clique sur le lien
10. Le système valide le token :
    - Token existe et n'est pas expiré
    - Token n'a pas déjà été utilisé
11. Le système crée une session sécurisée (JWT)
12. Le système marque le token comme utilisé
13. Le système redirige vers le dashboard SuperAdmin
14. Le système enregistre la connexion dans les logs

**Scénario alternatif :**
- **5a.** Email n'existe pas dans la base de données
    - Le système affiche le même message de succès (sécurité : ne pas révéler si l'email existe)
    - Aucun email n'est envoyé
    - Le système enregistre la tentative
- **6a.** Envoi de l'email échoue
    - Le système réessaie automatiquement (3 tentatives)
    - Si échec définitif, affiche un message d'erreur : "Erreur lors de l'envoi de l'email"
    - Le système alerte les administrateurs
- **10a.** Token expiré (> 15 minutes)
    - Le système affiche un message d'erreur : "Ce lien a expiré. Veuillez demander un nouveau lien."
    - Lien vers la page de connexion
- **10b.** Token déjà utilisé
    - Le système affiche un message d'erreur : "Ce lien a déjà été utilisé"
    - Lien vers la page de connexion
- **10c.** Token invalide (manipulé)
    - Le système affiche un message d'erreur : "Lien invalide"
    - Le système enregistre une alerte de sécurité
    - Lien vers la page de connexion

**Postconditions :** Le SuperAdmin est connecté via Magic Link

**Note de sécurité :**
- Le Magic Link utilise un token unique à usage unique
- Le token expire après 15 minutes
- Le système enregistre l'adresse IP de la demande et de l'utilisation du lien
- Si le 2FA est configuré pour SuperAdmin, il peut être demandé après le clic sur le Magic Link (optionnel)

---

##### Méthode 3 : Google OAuth (Authentification Google)

**Scénario nominal :**
1. Le système affiche le formulaire de connexion avec 3 options
2. Le SuperAdmin clique sur "Se connecter avec Google"
3. Le système redirige vers la page d'authentification Google OAuth 2.0
4. Google affiche la page de connexion :
    - Sélection du compte Google
    - Ou connexion avec email/mot de passe Google
5. Le SuperAdmin sélectionne son compte Google ou se connecte
6. **Google demande le 2FA Google** (si activé sur le compte Google) :
    - Code SMS
    - Google Authenticator
    - Clé de sécurité physique
    - Notification push Google
7. Le SuperAdmin valide le 2FA Google
8. Google demande l'autorisation d'accès :
    - Profil (nom, prénom)
    - Email
9. Le SuperAdmin accepte
10. Google redirige vers l'application avec un code d'autorisation
11. Le système échange le code contre un access token Google
12. Le système récupère les informations du profil Google :
    - Email
    - Nom
    - Prénom
    - Photo de profil (optionnel)
13. Le système vérifie si l'email existe dans la base de données
14. Le système crée une session sécurisée (JWT)
15. Le système enregistre la connexion dans les logs avec :
    - Méthode : Google OAuth
    - Email Google
    - Date/heure
    - Adresse IP
16. Le système redirige vers le dashboard SuperAdmin

**Scénario alternatif :**
- **7a.** Le SuperAdmin annule l'authentification Google
    - Google redirige vers l'application avec un paramètre d'erreur
    - Le système affiche un message : "Authentification annulée"
    - Retour à la page de connexion
- **9a.** Le SuperAdmin refuse l'autorisation d'accès
    - Google redirige avec un paramètre d'erreur
    - Le système affiche un message : "Autorisation refusée. Nous avons besoin de votre email pour vous connecter."
    - Retour à la page de connexion
- **13a.** Email Google n'existe pas dans la base de données (nouveau compte)
    - Le système affiche un message d'erreur : "Aucun compte n'est associé à cet email Google. Veuillez vous inscrire d'abord."
    - Lien vers la page d'inscription (si applicable)
    - **Note :** Pour les SuperAdmin, le compte doit être créé manuellement ou via seed
- **11a.** Erreur lors de l'échange du code (problème réseau, token expiré)
    - Le système affiche un message d'erreur : "Erreur lors de l'authentification Google. Veuillez réessayer."
    - Le système enregistre l'erreur dans les logs
    - Retour à la page de connexion

**Postconditions :** Le SuperAdmin est connecté via Google OAuth avec 2FA Google

**Note importante :**
- Le 2FA est géré par Google (pas par l'application)
- Si l'utilisateur a activé le 2FA sur son compte Google, Google le demandera automatiquement
- L'application n'a pas besoin de gérer le 2FA pour les connexions Google OAuth
- Le SuperAdmin doit avoir activé le 2FA sur son compte Google pour une sécurité maximale

---

**Postconditions générales (toutes méthodes) :**
- Le SuperAdmin est connecté et authentifié
- Une session sécurisée est créée (JWT avec expiration)
- La connexion est enregistrée dans les logs avec la méthode utilisée
- Le SuperAdmin a accès à son dashboard

**Comparaison des 3 méthodes :**

| Critère | Email + Password | Magic Link | Google OAuth |
|---------|------------------|------------|--------------|
| Sécurité | ⭐⭐⭐ (avec 2FA) | ⭐⭐ | ⭐⭐⭐ (2FA Google) |
| Rapidité | ⚡⚡ | ⚡ (attente email) | ⚡⚡⚡ |
| Pas de mot de passe à retenir | ❌ | ✅ | ✅ |
| Nécessite email | ✅ | ✅✅ | ✅ |
| 2FA obligatoire SuperAdmin | ✅ (App) | ❌* | ✅ (Google) |

*Le 2FA peut être ajouté optionnellement après le clic sur le Magic Link

---

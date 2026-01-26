## Cas d'Utilisation Admin Secrétariat

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

**Postconditions :** L'historique de facturation est affiché

---
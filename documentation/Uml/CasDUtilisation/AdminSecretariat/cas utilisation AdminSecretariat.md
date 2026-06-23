## Cas d'Utilisation Admin Secrétariat

> **Note importante sur le rôle AdminSecretariat :**
> Le rôle AdminSecretariat est attribué **automatiquement lors de l'inscription** du propriétaire/patron d'un secrétariat social sur la plateforme. L'AdminSecretariat peut créer des **consultants** (utilisateurs de son équipe) pour son équipe et leur attribuer des permissions. L'AdminSecretariat gère le personnel (consultants) de son secrétariat social.

> **Note importante sur l'isolation multi-tenant :**
> Chaque AdminSecretariat ne peut accéder qu'aux données de **son propre secrétariat** (`secretariatId`). L'isolation est garantie au niveau de la base de données et des API.

---

### Catégorie 1 : Authentification

#### UC-02-00 : S'inscrire et créer un compte avec abonnement

**Acteur principal :** Utilisateur (futur AdminSecretariat)
**Acteurs secondaires :** Better Auth, Google OAuth 2.0, Stripe, Stripe Webhooks, Email Service
**Prérequis :** Aucun
**Déclencheur :** Utilisateur accède à /auth/register

**Scénario nominal :**

**Phase 1 - Sélection de la méthode d'authentification:**
1. Le système affiche le formulaire d'inscription
2. L'utilisateur choisit la méthode:
   - **Méthode A**: Email + Password
   - **Méthode B**: Google OAuth
3. L'utilisateur remplit ses informations personnelles:
   - Nom complet
   - Numéro de téléphone
4. L'utilisateur clique "Suivant"

**Phase 2 - Informations du secrétariat:**
1. Le système affiche le formulaire du secrétariat
2. L'utilisateur saisit:
   - Nom du secrétariat
   - Numéro TVA (unique)
   - Adresse complète
   - Secteur d'activité
3. Le système vérifie l'unicité du numéro TVA
   - **[Alt 1]** Si TVA déjà utilisée: Erreur "Ce numéro TVA existe déjà"
   - Sinon: Continuer
4. L'utilisateur clique "Suivant"

**Phase 3 - Choix du plan d'abonnement:**
1. Le système affiche les 3 plans disponibles:
   - Starter: 99€/mois (25 clients, 3 utilisateurs, 5GB)
   - Pro: 299€/mois (100 clients, 10 utilisateurs, 20GB)
   - Enterprise: Sur devis (illimité)
2. L'utilisateur sélectionne un plan
3. L'utilisateur clique "S'inscrire et payer"

**Phase 4 - Validation et redirection vers Stripe:**
1. Le système valide toutes les données
2. Le système crée une session Stripe Checkout avec:
   - Email client
   - Plan sélectionné
   - Métadonnées (données utilisateur et secrétariat)
3. Le système stocke les données temporaires (TempRegistration avec status PENDING, expiresAt = NOW() + 24h)
4. Le système démarre un job asynchrone pour nettoyer les TempRegistration expirées (après 24h)
5. Le système redirige l'utilisateur vers Stripe Checkout

**Phase 5 - Paiement sur Stripe:**
1. Stripe affiche le formulaire de paiement sécurisé
2. L'utilisateur saisit les détails de sa carte
3. L'utilisateur valide le paiement
4. Stripe traite le paiement
   - **[Alt 2]** Si paiement refusé: 
     - Stripe affiche "Carte refusée"
     - L'utilisateur peut réessayer avec une autre carte
   - Sinon: Continuer
5. Stripe crée automatiquement:
   - Customer Stripe
   - Subscription active

**Phase 6 - Webhook Stripe (Création du compte):**
1. Stripe envoie un webhook `checkout.session.completed`
2. Le système vérifie la signature Stripe (whsec_***)
3. Le système récupère les données temporaires (TempRegistration)
4. **[Alt 6]** Si TempRegistration expirée (>24h): Erreur 400 "Session d'inscription expirée. Recommencez l'inscription"
5. Le système crée la transaction atomique (ACID):
   - Crée le secrétariat avec:
     - Données complètes
     - stripe_customer_id
     - stripe_subscription_id
     - Plan (STARTER/PRO/ENTERPRISE)
     - Status = ACTIVE
   - Crée l'utilisateur (UNE SEULE Account par email) avec:
     - Email, nom, téléphone
     - Rôle = ADMIN_SECRETARIAT
     - is_main_admin = true (propriétaire)
     - is_active = true
     - secretariatId lié
   - Crée le provider correspondant à la méthode choisie:
     - **[Alt 3A]** Si méthode Google OAuth:
       - Crée Account Provider avec providerId='google'
       - Stocke: google_id (sub), access_token, refresh_token
       - **Important**: Account peut avoir MULTIPLE providers (Gmail ET Email+Password)
     - **[Alt 3B]** Si méthode Email+Password:
       - Crée Account Provider avec providerId='credential'
       - Stocke: password hashé (bcrypt 12 rounds)
       - Validation: Min 12 caractères, 1 maj, 1 min, 1 chiffre, 1 spécial
6. Le système enregistre l'action en audit (REGISTRATION_SUCCESS)
7. Le système supprime les données temporaires (TempRegistration)
8. Le système envoie un email de bienvenue avec lien de connexion
9. Le système retourne 200 OK

**Phase 7 - Confirmation et redirection:**
1. Stripe redirige vers /auth/success?session_id={sessionId}
2. L'utilisateur accède à la page de succès
3. Le système vérifie que le compte est créé
4. Le système affiche: "Compte créé avec succès! Vous pouvez maintenant vous connecter"
5. L'utilisateur clique "Se connecter"
6. L'utilisateur est redirigé vers /auth/login

**Alternatives:**

**Alt 1 - TVA déjà utilisée:**
- Le système détecte qu'un secrétariat avec ce TVA existe
- Le système retourne 409 Conflict "Cet numéro TVA existe déjà"
- Le formulaire affiche le message d'erreur et permet de corriger

**Alt 2 - Paiement refusé:**
- Stripe refuse la carte (solde insuffisant, fraude, etc.)
- Stripe affiche le message d'erreur
- L'utilisateur peut réessayer avec une autre carte
- La session Stripe reste valide (complètement)

**Alt 3A - Méthode Google OAuth:**
- Lors de la création du compte, le système crée un Account Provider pour Google
- Stocke: google_id (sub), access_token, refresh_token
- Évite de stocker le mot de passe local

**Alt 3B - Méthode Email + Password:**
- Lors de la création du compte, le système crée un Account Provider pour credential
- Hash: bcrypt avec 12 rounds (très sécurisé)
- Validation du mot de passe: Min 12 caractères, 1 maj, 1 min, 1 chiffre, 1 spécial

**Alt 6 - TempRegistration expirée:**
- Si l'utilisateur tarde plus de 24h avant de valider le paiement Stripe
- TempRegistration est automatiquement supprimée
- Utilisateur reçoit: "Session d'inscription expirée. Recommencez l'inscription"
- Doit recommencer le processus (nouvelle session Stripe Checkout)

**Postconditions:**
- L'utilisateur est enregistré en tant que AdminSecretariat
- Le secrétariat social est créé et actif
- L'abonnement Stripe est actif
- Un email de bienvenue est envoyé
- L'audit enregistre la création (REGISTRATION_SUCCESS)
- Les données temporaires sont supprimées
- L'utilisateur peut se connecter via /auth/login

---

#### UC-02-01 : Se connecter

**Acteur principal :** AdminSecretariat
**Acteurs secondaires :** Better Auth, Google OAuth 2.0, Email Service
**Prérequis :** Compte créé
**Déclencheur :** AdminSecretariat accède à la page de connexion

**Scénario nominal (Magic Link):**
1. Le système affiche le formulaire de connexion
2. L'AdminSecretariat sélectionne "Magic Link"
3. L'AdminSecretariat saisit son email
4. Le système génère un token unique (UUID + hash)
5. Le système envoie un lien magique par email (valide 15 min)
6. L'AdminSecretariat clique sur le lien dans son email
7. Le système valide le token et crée une session
8. Le système redirige vers le dashboard AdminSecretariat

**Scénario alternatif (Google OAuth 2.0):**
1. L'AdminSecretariat clique sur "Se connecter avec Google"
2. Le système initie l'OAuth avec protection CSRF (state) et PKCE
3. L'AdminSecretariat s'authentifie auprès de Google
4. **[Alt A]** Si 2FA Google est activé:
   - Google demande 2FA (Google Prompt, Authenticator, SMS, Clé de sécurité)
   - L'AdminSecretariat valide le 2FA
   - **[Alt A1]** Si 2FA invalide: L'AdminSecretariat réessaye
5. L'AdminSecretariat autorise SocialFlow à accéder à son profil
6. Google redirige vers le callback avec le code d'autorisation
7. Le système valide le code et récupère le token
8. **[Alt B]** Si le compte OAuth n'existe pas: Le système le lie automatiquement
9. **[Alt B1]** Si le compte OAuth existe déjà: Le système met à jour les tokens
10. Le système crée une session sécurisée (7 jours)
11. Le système redirige vers le dashboard AdminSecretariat

**Alternatives (Magic Link):**
- **Alt 1 - Utilisateur introuvable**: Le système retourne 200 OK (sécurité par obscurité) avec message "Si l'email existe, vous recevrez un lien"
- **Alt 1.1 - Utilisateur inactif/désactivé**: L'utilisateur existe mais is_active = false. Le système retourne 200 OK (sécurité) mais ne crée pas de token. Message identique: "Si l'email existe, vous recevrez un lien"
- **Alt 2 - Token invalide/expiré/utilisé/IP différente**: Le système affiche "Ce lien n'est plus valide. Demandez un nouveau lien" 
  - **Raisons possibles**: Expiration >15min, réutilisation du token, IP client différente (sécurité), token invalide
  - **Note**: Token stocké en Redis avec TTL 15min et IP client originale
- **Alt 3 - Email non reçu**: L'AdminSecretariat peut demander un nouveau lien magique (renvoi du lien)

**Alternatives (Google OAuth):**
- **Alt 4 - 2FA Google activé**: Google demande validation 2FA supplémentaire (Google Prompt, Authenticator, SMS, Clé de sécurité)
- **Alt 4.1 - 2FA invalide**: L'AdminSecretariat réessaye la validation 2FA
- **Alt 5 - Provider Google nouveau (premier lien OAuth)**: Le système détecte que google_id n'existe pas. Crée un nouveau Account Provider 'google' et lie au compte existant. Stocke: google_id, access_token, refresh_token
- **Alt 5.1 - Provider Google existant (déjà lié)**: Le système détecte que google_id existe. Met à jour les tokens existants (access_token, refresh_token)
- **Alt 6 - PKCE state invalide/expiré**: Le système retourne erreur "État invalide - Réessayez la connexion" (state valide 10 min)
- **Alt 7 - Email non vérifié sur Google**: Le système retourne 403 "Email non vérifié sur Google"
- **Alt 8 - Compte inexistant (email Google non enregistré)**: Le système retourne 404 "Aucun compte avec cet email. Inscrivez-vous d'abord"

**Postconditions :**
- L'AdminSecretariat est authentifié et accède à son espace
- Une entrée audit est créée (LOGIN_SUCCESS_MAGIC_LINK ou LOGIN_SUCCESS_OAUTH)

---

### Catégorie 2 : Gestion du Personnel

#### UC-02-10 : Gérer le personnel

**Acteur principal :** AdminSecretariat
**Acteurs secondaires :** Email Service, AuditLog
**Prérequis :** AdminSecretariat authentifié
**Déclencheur :** AdminSecretariat accède à "Gestion du Personnel" (/dashboard/users)

**Scénario nominal :**
1. Le système affiche la liste du personnel (consultants du secrétariat)
2. L'AdminSecretariat clique sur "Ajouter un utilisateur"
3. Le système affiche le formulaire de création
4. L'AdminSecretariat saisit:
   - Email du nouvel utilisateur
   - Nom complet
   - Numéro de téléphone
5. L'AdminSecretariat clique "Créer l'utilisateur"
6. Le système vérifie les permissions (authentification et rôle AdminSecretariat)
7. Le système vérifie les limites du plan:
   - Starter: 3 utilisateurs max
   - Pro: 10 utilisateurs max
   - Enterprise: Illimité
8. Le système vérifie l'unicité de l'email
9. Le système génère un mot de passe temporaire (16 caractères, aléatoire)
10. Le système crée l'utilisateur avec rôle CONSULTANT et flag is_first_login=true
11. Le système envoie un email d'invitation avec les identifiants temporaires
12. Le système enregistre l'action en audit (CREATE_USER)
13. Le système affiche confirmation: "Utilisateur créé. Email d'invitation envoyé."

**Alternatives :**
- **Alt 1 - Utilisateur non authentifié**: Le système retourne 401 Unauthorized et redirige vers /auth/login
- **Alt 2 - Utilisateur non AdminSecretariat**: Le système retourne 403 Forbidden "Accès non autorisé" (seul AdminSecretariat peut créer des utilisateurs)
- **Alt 3 - Limite d'utilisateurs atteinte**: Le système retourne 400 "Limite d'utilisateurs atteinte pour votre plan. Passez au plan supérieur (Starter→Pro: +7 utilisateurs; Pro→Enterprise: Illimité)"
- **Alt 4 - Email déjà utilisé**: Le système retourne 409 Conflict "Cet email est déjà utilisé"
- **Alt 5 - Données de l'utilisateur invalides**: Le système retourne 400 avec détails des erreurs (email mal formé, nom vide, téléphone invalide)
- **Alt 6 - Email non reçu**: Le nouvel utilisateur peut demander un nouveau lien d'invitation

**Action A - Consulter les consultants:**
1. L'AdminSecretariat clique sur "Voir les consultants"
2. Le système affiche liste paginée avec:
   - Email, nom complet
   - Rôle (CONSULTANT)
   - Statut (Actif/Inactif)
   - Date de création, dernière connexion
3. L'AdminSecretariat peut rechercher/filtrer par email ou nom

**Action B - Modifier les informations d'un consultant:**
1. L'AdminSecretariat clique sur un consultant
2. L'AdminSecretariat clique "Modifier"
3. Le système affiche formulaire avec:
   - Nom complet (modifiable)
   - Email (lecture seule)
   - Téléphone (modifiable)
4. L'AdminSecretariat modifie et clique "Enregistrer"
5. Le système valide les données
6. Le système met à jour l'utilisateur
7. Le système enregistre l'action en audit (UPDATE_USER)

**Action C - Désactiver/Réactiver un consultant:**
1. L'AdminSecretariat clique sur un consultant
2. L'AdminSecretariat clique "Désactiver" (si actif) ou "Réactiver" (si inactif)
3. Le système affiche confirmation: "Êtes-vous sûr?"
4. L'AdminSecretariat confirme
5. Le système marque is_active = false/true
6. **[Alt C1]** Si désactivation: Révoque toutes les sessions du consultant (déconnexion forcée)
7. Le système enregistre l'action en audit (DEACTIVATE_USER ou REACTIVATE_USER)
8. Le système affiche confirmation

**Action D - Réinitialiser mot de passe d'un consultant:**
1. L'AdminSecretariat clique sur un consultant
2. L'AdminSecretariat clique "Réinitialiser mot de passe"
3. Le système génère un lien de réinitialisation (UUID + hash, valide 15 min)
4. Le système envoie email au consultant avec le lien
5. Le système enregistre l'action en audit (PASSWORD_RESET_REQUESTED)
6. Le système affiche confirmation: "Lien de réinitialisation envoyé"
7. Le consultant reçoit l'email et clique le lien
8. Le consultant saisit son nouveau mot de passe
9. Le système valide et stocke le nouveau hash (bcrypt 12 rounds)
10. Le système enregistre l'action en audit (PASSWORD_RESET_COMPLETED)
11. Le consultant peut se reconnecter avec le nouveau mot de passe

**Postconditions :**
- L'utilisateur est créé et en attente d'activation (première connexion)
- Un email d'invitation est envoyé
- Une entrée audit CREATE_USER est enregistrée
- Le nouvel utilisateur doit changer son mot de passe à la première connexion

---

### Catégorie 3 : Facturation & Abonnements

#### UC-02-20 : Gérer l'abonnement

**Acteur principal :** AdminSecretariat
**Acteurs secondaires :** Stripe, Stripe Customer Portal, Stripe Webhooks
**Prérequis :** AdminSecretariat authentifié, Abonnement actif
**Déclencheur :** AdminSecretariat accède à "Facturation" (/dashboard/billing)

**Scénario nominal :**
1. L'AdminSecretariat accède à /dashboard/billing
2. Le système vérifie les permissions:
   - **[Alt A - Utilisateur non AdminSecretariat]**: Erreur 403 "Accès non autorisé. Seul l'administrateur principal peut gérer l'abonnement"
   - **[Alt B - Utilisateur non authentifié]**: Redirection vers /auth/login
3. Le système récupère les infos d'abonnement du secrétariat
4. Le système affiche:
   - Plan actuel (Starter/Pro/Enterprise)
   - Prix du mois
   - Prochaine date de facturation
   - Statut (Actif/Annulé/Annulation en cours)
   - Avertissement si annulation en cours: "Accès jusqu'au {date_fin}"
5. L'AdminSecretariat clique "Gérer mon abonnement"
6. Le système vérifie la présence de stripe_customer_id
   - **[Alt C - Pas de stripe_customer_id]**: Erreur 400 "Aucun abonnement actif"
7. Le système crée une session Stripe Customer Portal sécurisée
8. L'AdminSecretariat accède au Portal de Stripe (redirection sécurisée)
9. L'AdminSecretariat effectue les actions souhaitées (voir alternatives A-D)
10. Stripe envoie webhook (customer.subscription.updated ou customer.updated)
11. Le système traite le webhook et met à jour la base de données
12. L'AdminSecretariat retourne automatiquement vers /dashboard/billing
13. Le système affiche les informations mises à jour

**Alternative A - Changement de plan (Upgrade/Downgrade):**
1. L'AdminSecretariat clique "Changer de plan"
2. Stripe affiche les plans disponibles avec prix
3. L'AdminSecretariat sélectionne le nouveau plan
4. Stripe calcule et affiche le prorata:
   - Upgrade: Charge immédiate du prorata
   - Downgrade: Crédit pour le prochain mois
5. L'AdminSecretariat confirme le changement
6. Stripe applique immédiatement la modification
7. Stripe déclenche webhook customer.subscription.updated
8. Le système met à jour:
   - Le plan dans la base de données
   - Les nouvelles limites (clients, utilisateurs, stockage)
   - La date de mise à jour (plan_updated_at)
9. Le système enregistre l'action en audit (SUBSCRIPTION_UPDATED)
10. Stripe affiche confirmation: "Plan mis à jour! Nouvelles limites actives immédiatement"

**Alternative B - Mise à jour de la méthode de paiement:**
1. L'AdminSecretariat clique "Mettre à jour carte"
2. Stripe affiche un formulaire de carte sécurisé (Stripe Elements)
3. L'AdminSecretariat saisit les détails de la nouvelle carte
4. Stripe valide la carte
5. Stripe remplace la carte par défaut
6. Stripe déclenche webhook customer.updated
7. Le système met à jour payment_method_updated_at
8. Stripe affiche confirmation: "Carte mise à jour avec succès"

**Alternative C - Annulation de l'abonnement:**
1. L'AdminSecretariat clique "Annuler l'abonnement"
2. Stripe affiche une modal de confirmation
3. L'AdminSecretariat confirme l'annulation
4. Stripe annule avec at_period_end=true (accès jusqu'à fin période)
5. Stripe déclenche webhook customer.subscription.updated
6. Le système met à jour:
   - Statut = CANCELING
   - cancel_at_period_end = true
   - subscription_ends_at = date de fin
7. Stripe affiche: "Abonnement annulé. Accès jusqu'au {date}"
8. L'AdminSecretariat garde accès jusqu'à la fin de la période payée

**Alternative D - Voir l'historique des factures:**
1. L'AdminSecretariat clique "Factures"
2. Stripe affiche la liste chronologique des factures
3. L'AdminSecretariat peut télécharger chaque facture en PDF

**IMPORTANT - Autorisation d'accès:**
```
Seul l'AdminSecretariat ayant is_main_admin = true peut accéder au Customer Portal.
Chaque AdminSecretariat accède UNIQUEMENT à son propre abonnement (isolation multi-tenant).
SuperAdmin gère la configuration Stripe AU NIVEAU PLATEFORME (UC-01-40), pas les abonnements clients.
```

**Alternatives (erreurs):**
- **Alt A - Utilisateur non AdminSecretariat**: Erreur 403 "Accès non autorisé. Seul l'administrateur principal peut gérer l'abonnement"
- **Alt B - Utilisateur non authentifié**: Redirection vers /auth/login (401)
- **Alt C - Pas de stripe_customer_id**: Erreur 400 "Aucun abonnement actif"
- **Alt D - Carte bancaire refusée (lors d'un prorata)**: Stripe affiche erreur de paiement et propose une autre carte

**Limites par plan:**
| Plan | Clients | Utilisateurs (consultants) | Stockage | Prix |
|------|---------|--------------|----------|------|
| Starter | 25 | 3 | 5 GB | 99€/mois |
| Pro | 100 | 10 | 20 GB | 299€/mois |
| Enterprise | Illimité | Illimité | Illimité | Sur devis |

**Postconditions :**
- L'abonnement est à jour et synchronisé
- Les webhooks Stripe sont traités correctement
- L'audit enregistre tous les changements
- Les limites d'utilisation sont ajustées
- Aucune donnée bancaire n'est stockée (PCI-DSS compliant)

---

### Catégorie 4 : Templates & Documents

#### UC-02-30 : Gérer templates et documents

**Acteur principal :** AdminSecretariat
**Acteurs secondaires :** Email Service (envoi de templates), AuditLog
**Prérequis :** AdminSecretariat authentifié
**Déclencheur :** AdminSecretariat accède à "Templates" (/dashboard/templates)

**Scénario nominal :**
1. Le système affiche la bibliothèque de templates du secrétariat
2. L'AdminSecretariat consulte les templates disponibles:
   - Contrats de travail (CDI, CDD, Stage)
   - Lettres types (Rupture, Modification, Réintégration)
   - Documents administratifs (Fiche de paie, Attestation)
3. L'AdminSecretariat peut gérer les templates:
   - **Consulter**: Prévisualiser le contenu du template
   - **Créer**: Ajouter un nouveau template personnalisé
   - **Modifier**: Éditer le contenu et les variables
   - **Dupliquer**: Créer une copie d'un template existant
   - **Archiver/Supprimer**: Désactiver ou supprimer un template
4. L'AdminSecretariat peut ajouter des variables de fusion:
   - {{employee_name}}, {{company_name}}, {{salary}}, {{start_date}}, etc.
5. Les templates modifiés sont disponibles immédiatement pour les consultants
6. Le système enregistre toutes les modifications en audit

**Alternative A - Création de nouveau template:**
1. L'AdminSecretariat clique "Créer un template"
2. L'AdminSecretariat saisit:
   - Nom du template
   - Catégorie (Contrat, Lettre, Document)
   - Contenu (rich text editor avec variables disponibles)
   - Étiquettes (tags)
3. L'AdminSecretariat aperçoit le template avec les variables
4. L'AdminSecretariat clique "Enregistrer"
5. Le système valide le contenu
6. Le système crée le template et l'associe au secrétariat
7. L'AdminSecretariat peut immédiatement l'utiliser

**Alternative B - Modification d'un template existant:**
1. L'AdminSecretariat clique sur un template
2. L'AdminSecretariat clique "Modifier"
3. L'AdminSecretariat édite le contenu
4. L'AdminSecretariat prévisualise les changements
5. L'AdminSecretariat clique "Enregistrer"
6. Le système met à jour le template
7. Tous les futurs documents créés utilisent la nouvelle version

**Alternative C - Dupliquer un template:**
1. L'AdminSecretariat clique sur un template existant
2. L'AdminSecretariat clique "Dupliquer"
3. Le système crée une copie avec suffix " (copie)"
4. La nouvelle copie est disponible immédiatement dans la bibliothèque
5. L'AdminSecretariat peut modifier la copie indépendamment

**Alternative D - Archiver/Supprimer un template:**
1. L'AdminSecretariat clique sur un template
2. L'AdminSecretariat clique "Archiver" ou "Supprimer"
3. **[Alt D1]** Archiver (soft delete):
   - Le template est marqué archived=true
   - N'apparaît plus dans les templates actifs
   - Récupérable via option "Afficher les archivés"
4. **[Alt D2]** Supprimer (hard delete):
   - Suppression définitive (si aucun document ne l'utilise)
   - **[Alt D2a]** Si documents existent: Erreur "Impossible de supprimer. Documents existants l'utilisent."
5. Le système enregistre l'action en audit (ARCHIVE_TEMPLATE ou DELETE_TEMPLATE)

**Alternatives (erreurs):**
- **Alt E - Template introuvable**: Le système retourne 404 "Template n'existe pas"
- **Alt E1 - Contenu invalide ou vide**: Le système retourne 400 "Le contenu du template ne peut pas être vide"
- **Alt E2 - Nom déjà utilisé**: Le système retourne 409 Conflict "Un template avec ce nom existe déjà"
- **Alt F - Espace de stockage insuffisant**: Si stockage >95%, création impossible. Retourne 400 "Espace de stockage insuffisant. Libérez de l'espace ou augmentez le plan"

**Postconditions :**
- Les templates et documents sont organisés et accessibles
- Les modifications sont disponibles immédiatement pour les consultants
- L'audit enregistre toutes les actions (CREATE, UPDATE, DELETE, ARCHIVE)

---

### Catégorie 5 : Analytics & Reporting

#### UC-02-40 : Consulter le dashboard

**Acteur principal :** AdminSecretariat
**Acteurs secondaires :** Cache Service (optimisation), Database (requêtes parallèles)
**Prérequis :** AdminSecretariat authentifié, Session valide
**Déclencheur :** AdminSecretariat accède à "Dashboard" (/dashboard) ou "Rapports"

**Scénario nominal :**
1. L'AdminSecretariat accède à /dashboard
2. Le système vérifie la session et les permissions
3. Le système récupère les données du secrétariat (avec cache TTL 5 min):
   - Nom, TVA, adresse
   - Plan actuel (Starter/Pro/Enterprise)
   - Statut (ACTIVE/SUSPENDED/CANCELED)
   - Limites (clients, utilisateurs, stockage)
4. Le système récupère les statistiques en requêtes parallèles:
   - **Nombre d'utilisateurs actifs**: COUNT(User WHERE secretariatId = ?)
   - **Nombre de clients**: COUNT(Client WHERE secretariatId = ?)
   - **Espace de stockage utilisé**: SUM(Document.file_size)
   - **Prochaine facturation**: next_billing_date, payment_status
5. Le système calcule les pourcentages d'utilisation
6. Le système détermine les alertes (si limites >80%)
7. Le système récupère les 10 activités récentes (AuditLog)
8. Le système récupère les notifications non lues
9. Le système affiche le dashboard complet avec KPIs et graphiques

**Alternative A - Session invalide ou expirée:**
1. Le système détecte que la session a expiré
2. Le système redirige vers /auth/login
3. L'AdminSecretariat doit se reconnecter

**Alternative B - Utilisateur inactif/désactivé:**
1. Le système détecte que l'utilisateur est marqué is_active = false
2. Le système retourne 403 Forbidden
3. L'AdminSecretariat reçoit: "Compte désactivé. Contactez votre administrateur"

**Alternative C - Cache miss/expiration:**
1. Si les données ne sont pas en cache ou TTL expiré
2. Le système requête la base de données
3. Le système stocke les résultats en cache (TTL: 5 minutes)

**Components du dashboard:**

**1. En-tête:**
- Logo + Nom du secrétariat
- Plan actuel avec badge couleur (Starter=bleu, Pro=vert, Enterprise=gold)
- Bouton "Gérer abonnement"

**2. KPIs (Cartes avec barres de progression):**
- **Utilisateurs**: Current/Limit (ex: 2/3 = 66%) - Couleur verte si <80%, orange si 80-90%, rouge si >90%
- **Clients**: Current/Limit (ex: 20/25 = 80%)
- **Stockage**: Used/Limit en GB (ex: 4.5/5 GB = 90%) ⚠️
- **Facturation**: Prochaine date de facturation (ex: 15/02/2026)

**3. Graphiques:**
- **Évolution mensuelle des clients**: Graphique en courbe (6 derniers mois)
- **Utilisation du stockage**: Pie chart par catégorie (Contrats, Fiches de paie, Documents)

**4. Activités récentes:**
- **Timeline** des 10 dernières actions audit
- Filtrable par type d'action (CREATE_USER, UPDATE_PROFILE, BILLING_PORTAL_ACCESS, etc.)
- Affiche: Type, Date/Heure, Utilisateur, Détails

**5. Notifications/Alertes:**
- Badge avec nombre de non-lues
- Liste déroulante avec types:
  - ⚠️ Limite de stockage atteinte (>90%)
  - 🔔 Paiement à venir (dans 3 jours)
  - ✅ Nouvel utilisateur créé
  - 🆕 Plan mis à jour
  - ❌ Échec de paiement
- Bouton "Marquer comme lu" pour chaque

**6. Actions rapides (boutons):**
- "Ajouter un utilisateur"
- "Voir les factures"
- "Gérer mon abonnement"

**Alternative D - Alertes critiques:**
Si des seuils sont dépassés:
- **Utilisateurs**: 100% → "Limite atteinte! Passez au plan supérieur pour ajouter d'utilisateurs"
- **Stockage**: >95% → "Stockage presque plein! Libérez de l'espace ou augmentez le plan"
- **Paiement**: Échec → "⚠️ Dernier paiement a échoué. Mettez à jour votre carte de paiement"

**Postconditions :**
- L'AdminSecretariat a une vue complète et à jour de son activité
- Les alertes le guident vers les actions urgentes
- Les données sont cachées pour optimiser les performances
- Toutes les consultations sont enregistrées en audit (implicitement via logs)

---

### Catégorie 6 : Audit & Compliance

#### UC-02-50 : Consulter les logs d'audit du secrétariat

**Acteur principal :** AdminSecretariat
**Acteurs secondaires :** AuditLog Service, Cache Service
**Prérequis :** AdminSecretariat authentifié
**Déclencheur :** AdminSecretariat accède à "Audit Logs" (/dashboard/audit-logs)

**Scénario nominal :**

**Phase 1 - Accès et vérification:**
1. L'AdminSecretariat accède à /dashboard/audit-logs
2. Le système vérifie les permissions (authentifié + rôle ADMIN_SECRETARIAT)
3. **[Alt 1]** Si pas AdminSecretariat: Erreur 403 "Accès non autorisé"
4. Le système charge les logs UNIQUEMENT du secrétariat (WHERE secretariatId = ?)

**Phase 2 - Affichage des logs (paginated):**
1. Le système récupère les logs du secrétariat avec pagination (page=1, limit=50)
2. Le système affiche timeline chronologique (DESC par timestamp) avec:
   - **Type d'action**: CREATE_USER, UPDATE_USER, DEACTIVATE_USER, BILLING_PORTAL_ACCESS, UPDATE_PROFILE, etc.
   - **Timestamp**: Date/Heure précise
   - **Utilisateur**: Email du consultant ou AdminSecretariat qui a fait l'action
   - **Détails**: Quoi a changé (ex: "Consultant John créé", "Plan changé Starter→Pro", "Utilisateur désactivé")
   - **Statut**: SUCCESS ou ERROR
   - **IP + User-Agent**: Informations techniques
3. Le système affiche les 50 derniers logs
4. **[Alt 2]** Si BD indisponible: Erreur 503 "Audit logs indisponibles"

**Phase 3 - Filtrage:**
1. L'AdminSecretariat peut filtrer par:
   - **Type d'action** (dropdown): CREATE_USER, UPDATE_USER, DELETE_USER, BILLING_*, etc.
   - **Utilisateur** (search): Email du consultant
   - **Période** (date range): From/To
   - **Niveau** (optionnel): SUCCESS / ERROR
2. Le système applique filtres et affiche résultats
3. Les filtres sont persistés en URL (shareable links)

**Phase 4 - Consultation détails:**
1. L'AdminSecretariat clique sur un log
2. Le système affiche:
   - Type action complet
   - Timestamp précis
   - Utilisateur (email, nom)
   - Détails: Ancien → Nouveau (si applicable)
   - Métadonnées: IP, User-Agent, Session ID

**Alternative A - Export des logs:**
1. L'AdminSecretariat clique "Exporter"
2. Le système propose:
   - **CSV**: Format tabulaire
   - **PDF**: Rapport formaté avec logo secrétariat
3. L'AdminSecretariat sélectionne période et format
4. Le système génère et télécharge le fichier
5. **Note**: Fichier contient UNIQUEMENT les logs du secrétariat

**Alternative B - Recherche texte:**
1. L'AdminSecretariat saisit terme dans "Chercher"
2. Le système cherche dans:
   - Email utilisateur
   - Type d'action
   - Détails messages
3. Résultats en temps réel

**Protections critiques:**

**Protection 1 - Isolation stricte:**
- L'AdminSecretariat voit UNIQUEMENT les logs DE SON SECRÉTARIAT
- Impossible de voir logs d'autres secrétariats
- Filtre systématique: WHERE secretariatId = ? (au niveau base de données)

**Protection 2 - Immutabilité:**
- Les logs NE PEUVENT PAS être modifiés (append-only)
- Les logs sont archivés après 6 mois (RGPD)
- Impossible de supprimer un log

**Protection 3 - Sensibilité:**
- Les mots de passe NE SONT PAS loggés
- Les tokens d'accès sont masqués
- Les données financières sont masquées (***XXX)

**Alternatives (erreurs):**
- **Alt 1 - Pas AdminSecretariat**: Erreur 403 "Accès non autorisé"
- **Alt 2 - BD indisponible**: Erreur 503 "Audit logs indisponibles"
- **Alt 3 - Trop de résultats**: Si >10k, limiter et afficher message "Affinez votre recherche"

**Postconditions :**
- L'AdminSecretariat a une traçabilité complète des actions dans son secrétariat
- Les logs sont consultables et exportables
- L'isolation multi-tenant est garantie
- La compliance légale est assurée

---

### Catégorie 7 : Données & Importation

#### UC-02-70 : Importer données (Employés, Contrats, Paie)

**Acteur principal :** AdminSecretariat
**Acteurs secondaires :** File Upload Service, Data Validation Service, Transformation Service, Database, Email Service
**Prérequis :** AdminSecretariat authentifié
**Déclencheur :** AdminSecretariat accède à "Importer Données" (/dashboard/import-data)

**Scénario nominal :**

**Phase 1 - Accès et sélection du type d'import:**
1. L'AdminSecretariat accède à /dashboard/import-data
2. Le système affiche les types d'import disponibles:
   - **Employés**: Création/Modification employés en masse
   - **Contrats**: Création/Modification contrats de travail
   - **Salaires de base**: Import des salaires initiaux
   - **Cotisations**: Configuration des cotisations patronales
   - **Configurations ONSS**: Paramètres ONSS spécifiques
3. L'AdminSecretariat sélectionne le type d'import
4. Le système affiche template CSV/Excel avec colonnes attendues

**Phase 2 - Upload du fichier:**
1. L'AdminSecretariat télécharge le fichier (CSV ou Excel)
2. Le système accepte:
   - Format: CSV (UTF-8), Excel (.xlsx)
   - Taille max: 50 MB
   - **[Alt 1]** Si format invalide: Erreur "Format non supporté. CSV ou Excel uniquement"
   - **[Alt 2]** Si taille >50MB: Erreur "Fichier trop volumineux. Max 50 MB"
3. Le système charge le fichier temporairement
4. Le système affiche: "Fichier chargé. Analyse en cours..."

**Phase 3 - Validation de structure:**
1. Le système valide structure du fichier:
   - **Vérification en-têtes**: Colonnes obligatoires présentes?
   - **Encodage**: UTF-8 valide?
   - **Délimiteurs**: Virgule, point-virgule détectés?
   - **Lignes vides**: Silencieuses ou erreur?
2. **[Alt 3]** Si structure invalide: Afficher rapport détaillé
   - Erreurs par ligne
   - Colonnes manquantes
   - Option pour corriger et réuploader
3. **[Alt 4]** Si structure valide: Afficher résumé
   - Nombre lignes détectées
   - Mapping colonnes
   - Option pour ajuster mapping (si colonnes mal nommées)

**Phase 4 - Validation des données métier:**
1. Le système valide chaque ligne:

   **Pour Employés:**
   - NISS (format belgique: 13 chiffres)
   - Email valide
   - Nom complet non vide
   - Dates valides (embauche, naissance)
   - Rôle valide (CDI, CDD, Stage, etc.)

   **Pour Contrats:**
   - Employé NISS doit exister
   - Type contrat valide
   - Dates cohérentes (début ≤ fin ou fin >= début)
   - Référence unique

   **Pour Salaires:**
   - Montants positifs
   - Devise valide (EUR)
   - Effetif à partir d'une date valide

   **Pour Cotisations:**
   - Pourcentages entre 0-100%
   - Code ONSS valide
   - Entreprise/Employé référencé existe

2. Le système génère rapport validation avec:
   - ✅ Lignes valides (count)
   - ⚠️ Avertissements (duplicates potentiels)
   - ❌ Erreurs critiques avec détails ligne
3. **[Alt 5]** Si erreurs critiques: Arrêt du processus
   - Afficher liste erreurs
   - Permettre télécharger rapport d'erreurs
   - Option corriger et réuploader
4. **[Alt 6]** Si seulement avertissements: Afficher rapport
   - Exemple: "Employé NISS XXX déjà existe (sera mis à jour)"
   - Demander confirmation avant import

**Phase 5 - Prévisualisation avant import:**
1. Le système affiche aperçu des données:
   - Tableau résumé: 10 premières lignes
   - Champs importants mis en évidence
   - Indicateurs de changement (nouveau vs mise à jour)
2. L'AdminSecretariat peut:
   - Valider et continuer l'import
   - Retourner modifier le fichier
   - Annuler l'opération

**Phase 6 - Import des données:**
1. L'AdminSecretariat clique "Importer"
2. Le système affiche barre de progression
3. Le système effectue import transactionnel (ACID):
   - Transformation données (normalisation, calculs)
   - Insertion en base de données (batch insert)
   - Création relations (employé → contrat → salaire)
4. **[Alt 7]** Si erreur durant import:
   - Rollback transaction (annulation complète)
   - Rapport d'erreur détaillé
   - Aucune donnée partiellement importée

**Phase 7 - Confirmation et rapports:**
1. Import réussi: Afficher résumé
   - "X employés créés, Y mis à jour"
   - "Z contrats créés, W mis à jour"
   - Durée de l'import
2. Boutons rapides:
   - "Voir les nouvelles données"
   - "Importer un autre type"
   - "Retour au dashboard"
3. Email reçu par AdminSecretariat:
   - Résumé de l'import
   - Lien vers rapport détaillé
4. Rapport complet disponible pour 30 jours:
   - Téléchargeable en PDF
   - Consultable via historique imports

**Alternative A - Mise à jour d'employés existants:**
1. Si NISS (employé) déjà existe dans système:
2. Le système détecte doublon et marque comme "Mise à jour"
3. Affiche ancien vs nouveau dans prévisualisation
4. AdminSecretariat confirme les changements
5. Données mises à jour (soft update avec audit trail)

**Alternative B - Dupliquer un import précédent:**
1. AdminSecretariat clique "Utiliser import précédent"
2. Système affiche historique des 10 derniers imports
3. AdminSecretariat sélectionne un modèle
4. Système pré-charge structure et mappings
5. AdminSecretariat télécharge nouveau fichier avec même structure

**Alternative C - Import planifié/récurrent:**
1. AdminSecretariat clique "Programmer import"
2. Paramètres: 
   - Type d'import
   - Fréquence (hebdo, mensuel)
   - Jour/Heure
3. Système attend fichier à la date/heure planifiée
4. Fichier envoyé via email automatiquement
5. Import exécuté sans intervention

**Validations critiques (par type):**

| Type | Validations | Format | Max lignes |
|------|------------|--------|-----------|
| Employés | NISS (13 car), Email, Nom | CSV/Excel | 5000 |
| Contrats | NISS existe, Dates valides | CSV/Excel | 10000 |
| Salaires | Montants >0, Devise EUR | CSV/Excel | 50000 |
| Cotisations | % entre 0-100, Code ONSS | CSV/Excel | 1000 |
| Configs ONSS | Code valide, Entreprise existe | CSV/Excel | 500 |

**Protections:**
- ✅ **Transactionnel**: Tout ou rien (no partial imports)
- ✅ **Audit trail**: Chaque ligne importée tracée
- ✅ **Isolation**: Seulement données du secrétariat
- ✅ **Backup**: Snapshot avant import pour rollback manuel
- ✅ **Validation stricte**: Aucune donnée invalide acceptée

**Alternatives (erreurs):**
- **Alt 1 - Format invalide**: Erreur 400 "CSV ou Excel uniquement"
- **Alt 2 - Fichier trop volumineux**: Erreur 413 "Max 50 MB"
- **Alt 3 - Structure invalide**: Afficher colonnes manquantes
- **Alt 4 - Données invalides**: Rapport détaillé ligne par ligne
- **Alt 5 - Erreurs critiques**: Import bloqué, correction requise
- **Alt 6 - Service indisponible**: Erreur 503 "Service indisponible. Réessayez plus tard"
- **Alt 7 - Erreur transaction**: Rollback complet, aucune donnée modifiée

**Postconditions:**
- Données importées et validées
- Audit trail complet de chaque import
- Rapports générés et accessibles
- Email de confirmation envoyé
- Données disponibles immédiatement dans système

---

### Catégorie 8 : Données & RGPD

#### UC-02-60 : Exporter données (RGPD - Droit à la portabilité)

**Acteur principal :** AdminSecretariat
**Acteurs secondaires :** Data Export Service, Storage Service, Email Service, AuditLog
**Prérequis :** AdminSecretariat authentifié
**Déclencheur :** AdminSecretariat accède à "Exporter mes données" (/dashboard/data-export)

**Scénario nominal :**

**Phase 1 - Demande d'export:**
1. L'AdminSecretariat accède à /dashboard/data-export
2. Le système affiche options:
   - Scope: "Tous les secrétariat données" ou "Données spécifiques"
   - Format: CSV, JSON, XML
   - Inclure: Documents (Y/N), Audit logs (Y/N), Fichiers attachés (Y/N)
3. L'AdminSecretariat clique "Générer export"
4. Le système affiche: "Préparation en cours... (peut prendre 5-15 min)"

**Phase 2 - Génération de l'export (asynchrone):**
1. Le système lance job BullMQ pour exporter les données
2. Exporte:
   - **Users**: Email, nom, rôle, permissions, dates (CREATE, UPDATE, DELETE si soft-deleted)
   - **Secrétariat**: TVA, adresse, contact, plan, dates importantes
   - **Clients (Entreprises)**: TVA, nom, adresse, contacts, données associées
   - **Employés**: NISS (masqué), noms, contrats, absences
   - **Fiches de paie**: Complètes avec calculs, PDF
   - **Documents**: Fichiers attachés (.zip si volumineux)
   - **Logs d'audit**: Toutes les modifications
   - **Metadata**: Export date, format, version schema
3. Formate selon le choix (CSV, JSON, XML)
4. Chiffre l'archive (AES-256) avec mot de passe unique
5. Stocke temporairement en S3 (expiration 7 jours)

**Phase 3 - Livraison:**
1. L'AdminSecretariat reçoit email: "Votre export de données est prêt"
2. Lien sécurisé dans email (valide 7 jours)
3. L'AdminSecretariat clique et télécharge le fichier .zip chiffré
4. Mot de passe fourni séparément (SMS ou email selon config)
5. Après téléchargement, fichier supprimé du serveur

**Alternative A - Suppression de données (Right to be forgotten):**
1. L'AdminSecretariat clique "Demander suppression"
2. Affichage modal: "Êtes-vous sûr? Cette action est irréversible."
3. L'AdminSecretariat doit saisir "DELETE" pour confirmer
4. Le système planifie suppression (soft-delete) après 30 jours (droit de rétractation RGPD)
5. Email de confirmation avec option d'annuler avant 30 jours
6. **[Alt A1]** Si annulation: Suppression annulée, données restaurées
7. **[Alt A2]** Après 30j: Soft-delete appliqué, données inaccessibles

**Alternative B - Rectification de données:**
1. L'AdminSecretariat peut demander correction:
   - Erreur dans les données? Contacter support
   - Le système enregistre demande de rectification
   - Support vérifie et corrige dans 48h
   - Historique changement enregistré en audit

**Protections RGPD :**
- ✅ **Chiffrement**: AES-256 pour archives
- ✅ **Mot de passe**: Fourni séparément (SMS/email)
- ✅ **Expiration**: Fichier supprimé après 7 jours
- ✅ **Audit trail**: Qui a demandé l'export, quand, résultat
- ✅ **Format lisible**: CSV/JSON/XML (pas propriétaire)
- ✅ **Droit d'accès**: Peut télécharger ses propres données
- ✅ **Droit à l'oubli**: Soft-delete après 30 jours
- ✅ **Rectification**: Peut demander correction

**Restrictions :**
- ❌ AdminSecretariat ne peut exporter que ses données (pas autres secrétariats)
- ✅ SuperAdmin peut exporter ANY secrétariat (compliance checks)

**Alternatives (erreurs):**
- **Alt 1 - Export trop volumineux**: Si >500MB → Notifier et offrir découpe par mois
- **Alt 2 - Service indisponible**: Si export échoue → Email avec option retry
- **Alt A1 - Annulation suppression**: Dans les 30 jours → Données restaurées
- **Alt A2 - Suppression complète**: Après 30j → Soft-delete permanent (RGPD compliant)

**Postconditions :**
- Archive exportée et sécurisée
- Téléchargement possible pendant 7 jours
- Audit logs complets
- Droit RGPD respecté (portabilité, oubli, rectification)

---

## ⚡ **POINTS CLÉS IMPORTANTS**

### Isolation Multi-Tenant
- Chaque AdminSecretariat n'accède qu'aux données de SON secrétariat (`secretariatId`)
- Customer Portal Stripe: UNIQUEMENT accessible par AdminSecretariat is_main_admin
- Les consultants sont liés à UN seul secrétariat

### Sécurité Authentification
- Magic Link: Token valide 15 min, vérifie IP client, stocké en Redis
- Google OAuth: PKCE + State, support multi-provider (Gmail ET Email+Password sur 1 compte)
- Tous les credentials hashés avec bcrypt 12 rounds

### Gestion Abonnement
- Stripe Customer Portal: Gestion par AdminSecretariat (1 portal par secrétariat)
- SuperAdmin gère configuration Stripe AU NIVEAU PLATEFORME (UC-01-40 Section C)
- Soft delete: Données conservées, marquées deleted_at, inaccessibles
- at_period_end=true: Continuité de service jusqu'à fin de période




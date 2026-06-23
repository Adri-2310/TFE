## Cas d'Utilisation SuperAdmin

> **Note importante sur le rôle SuperAdmin :**
> Le SuperAdmin est l'administrateur système de la plateforme. Il gère tous les secrétariats sociaux enregistrés, les utilisateurs globaux et la configuration du système. Le SuperAdmin a une visibilité et un contrôle complets sur la plateforme.

> **Note importante sur le scope :**
> Le SuperAdmin ne gère PAS les clients ou employés individuels (c'est le rôle du Consultant). Le SuperAdmin intervient au niveau système et gestion des secrétariats.

---

### Catégorie 1 : Authentification

#### UC-01-00 : Se connecter avec 2FA obligatoire

**Acteur principal :** SuperAdmin
**Acteurs secondaires :** Better Auth, Google Authenticator
**Prérequis :** Compte SuperAdmin créé, 2FA activé obligatoirement
**Déclencheur :** SuperAdmin accède à /auth/login

**Scénario nominal (Phase 1 - Authentification):**
1. Le système affiche le formulaire de connexion
2. Le SuperAdmin sélectionne "Email + Password"
3. Le SuperAdmin saisit email et mot de passe
4. Le système vérifie les identifiants avec bcrypt
5. **[Alt 1]** Si identifiants invalides: Erreur 401, incrémente compteur tentatives
   - Max 5 tentatives échouées
   - Après 5 échecs: Compte bloqué 15 minutes
6. Si identifiants valides: Continuer vers Phase 2

**Scénario nominal (Phase 2 - Validation 2FA obligatoire):**
1. Le système vérifie que 2FA est activé
2. **[Alt 2]** Si 2FA non activé: Erreur 403 "2FA obligatoire pour SuperAdmin"
3. Le système demande le code 2FA
4. Le SuperAdmin ouvre Google Authenticator
5. Le SuperAdmin saisit le code TOTP (6 chiffres)
6. Le système génère le code TOTP attendu avec le secret stocké
7. Le système compare code saisi vs code généré
8. **[Alt 3]** Si code invalide/expiré:
   - Erreur 401 "Code invalide"
   - Code TOTP valide 30 secondes
   - Fenêtre de tolérance: ±1 période (±30 sec)
9. Si code valide: Continuer vers Phase 3

**Scénario nominal (Phase 3 - Création de session):**
1. Le système génère un token de session unique (UUID)
2. Le système crée la session en base de données avec:
   - userId, token, expiresAt (7 jours), ip, userAgent
3. Le système enregistre l'action en audit (LOGIN_SUCCESS_2FA)
4. Le système retourne le token de session
5. L'interface stocke le token en cookie (httpOnly, secure, sameSite)
6. Le système redirige vers /superadmin/dashboard

**Alternatives :**
- **Alt 1 - Identifiants invalides**: Compteur tentatives (max 5), blocage 15 min après 5 échecs
- **Alt 2 - 2FA non activé**: Impossible pour SuperAdmin, erreur 403 avec message "Activez 2FA d'abord"
- **Alt 3 - Code 2FA invalide/expiré**: Erreur 401 "Code invalide", fenêtre ±1 période (30 sec)

**Postconditions :**
- Le SuperAdmin est authentifié avec 2FA validé
- Une session valide 7 jours est créée
- L'accès au dashboard SuperAdmin est autorisé
- Une entrée audit LOGIN_SUCCESS_2FA est enregistrée

---

### Catégorie 2 : Gestion des Secrétariats

#### UC-01-10 : Gérer les secrétariats (Consulter, Modifier, Supprimer)

**Acteur principal :** SuperAdmin
**Acteurs secondaires :** Stripe, Email Service, AuditLog
**Prérequis :** SuperAdmin authentifié
**Déclencheur :** SuperAdmin accède à "Gestion des Secrétariats"

**Scénario nominal - Consultation:**
1. Le système affiche la liste de tous les secrétariats
2. Le système affiche pour chaque secrétariat:
   - Nom, numéro TVA
   - Plan d'abonnement (Starter/Pro/Enterprise)
   - Statut (ACTIVE/SUSPENDED/CANCELED/DELETED)
   - Nombre d'utilisateurs actifs
   - Nombre de clients
   - Date d'inscription, prochaine facturation
3. Le SuperAdmin peut rechercher/filtrer les secrétariats
4. Le SuperAdmin sélectionne un secrétariat pour voir détails ou actions

**Alternative A - Modifier un secrétariat:**
1. Le SuperAdmin clique "Modifier" sur un secrétariat
2. Le système récupère les données complètes du secrétariat
3. Le SuperAdmin peut modifier:
   - Nom du secrétariat
   - Numéro TVA (avec vérification unicité)
   - Adresse complète (rue, code postal, ville)
   - Téléphone, secteur d'activité
4. Le SuperAdmin valide les modifications
5. Le système valide les données (format TVA, email, téléphone)
6. **[Alt A1]** Si données invalides: Erreur 400 avec détail des erreurs
7. Le système met à jour les informations en base
8. Le système enregistre l'action en audit (UPDATE_SECRETARIAT)
9. Le SuperAdmin reçoit confirmation "Secrétariat modifié"

**Restrictions de modification:**
- ❌ Le SuperAdmin NE PEUT PAS modifier: Plan, stripe_customer_id, stripe_subscription_id (gérés par Stripe)

**Alternative B - Supprimer un secrétariat (5 phases):**

**Phase 1 - Demande de suppression:**
1. Le SuperAdmin clique "Supprimer" sur un secrétariat
2. Le système affiche modal de confirmation: "Êtes-vous sûr? Cette action est irréversible"
3. Le SuperAdmin confirme la suppression

**Phase 2 - Vérifications de sécurité:**
1. Le système vérifie la permission SuperAdmin
2. **[Alt B1]** Si pas SuperAdmin: Erreur 403 "Accès non autorisé"
3. Le système récupère les données du secrétariat
4. **[Alt B2]** Si secrétariat inexistant: Erreur 404 "Secrétariat n'existe pas"

**Phase 3 - Vérification utilisateurs actifs:**
1. Le système compte les utilisateurs actifs du secrétariat
2. **[Alt B3]** Si utilisateurs actifs > 0:
   - Erreur 400 "Désactivez d'abord tous les utilisateurs"
   - Le SuperAdmin doit désactiver les utilisateurs avant suppression
3. Si aucun utilisateur actif: Continuer

**Phase 4 - Annulation Stripe et Soft Delete:**
1. **[Alt B4]** Si secrétariat a stripe_subscription_id:
   - Le système appelle Stripe API pour annuler l'abonnement (DELETE /subscriptions/{id})
   - Stripe annule immédiatement (at_period_end: false)
   - Stripe enverra webhook customer.subscription.deleted (traité en arrière-plan)
2. Le système marque le secrétariat en soft delete:
   - UPDATE Secretariat SET deleted_at = NOW(), status = 'DELETED'
   - UPDATE User SET is_active = false, deleted_at = NOW() (utilisateurs du secrétariat)
   - DELETE FROM Session (révoque toutes les sessions des utilisateurs)
3. Le système enregistre l'action en audit (DELETE_SECRETARIAT)

**Phase 5 - Notification:**
1. Le système envoie email au propriétaire du secrétariat: "Votre compte a été supprimé"
2. Le système affiche confirmation: "Secrétariat supprimé avec succès"

**Important - Soft Delete:**
- Les données restent en base de données (conforme RGPD)
- Les données sont marquées comme supprimées (deleted_at)
- Les données sont inaccessibles aux utilisateurs
- Le secrétariat ne peut pas être restauré (soft delete irréversible)

**Alternatives:**
- **Alt A1 - Données invalides (modification)**: Erreur 400 avec détails des erreurs de validation
- **Alt B1 - Pas SuperAdmin (suppression)**: Erreur 403 "Accès non autorisé"
- **Alt B2 - Secrétariat inexistant**: Erreur 404 "Secrétariat n'existe pas"
- **Alt B3 - Utilisateurs actifs**: Erreur 400 "Désactivez d'abord tous les utilisateurs"
- **Alt B4 - Annulation Stripe**: Si stripe_subscription_id existe, annuler abonnement via Stripe API

**Postconditions :**
- Les secrétariats sont consultés, modifiés ou supprimés
- Les modifications et suppressions sont enregistrées en audit
- L'abonnement Stripe est annulé si applicable
- Les données supprimées sont marquées deleted_at mais conservées

---

### Catégorie 3 : Gestion des Utilisateurs

#### UC-01-20 : Gérer les rôles et utilisateurs (RBAC)

**Acteur principal :** SuperAdmin
**Acteurs secondaires :** Session Manager, AuditLog
**Prérequis :** SuperAdmin authentifié
**Déclencheur :** SuperAdmin accède à "Gestion des Utilisateurs"

**Scénario nominal - Consultation:**
1. Le système affiche la liste de tous les utilisateurs du système
2. Le système affiche pour chaque utilisateur:
   - Email, nom complet
   - Rôle actuel (SUPER_ADMIN, ADMIN_SECRETARIAT, CONSULTANT, CLIENT, EMPLOYEE)
   - Statut (actif/inactif)
   - Secrétariat associé (si applicable)
   - Date de création, dernière connexion
3. Le SuperAdmin peut rechercher/filtrer les utilisateurs
4. Le SuperAdmin sélectionne un utilisateur pour voir détails ou modifier rôle

**Scénario nominal - Attribuer/Modifier un rôle (5 phases):**

**Phase 1 - Sélection:**
1. Le SuperAdmin clique "Modifier rôle" sur un utilisateur
2. Le système affiche modal "Gérer les rôles"
3. Le système affiche une liste déroulante des rôles disponibles:
   - SUPER_ADMIN
   - ADMIN_SECRETARIAT
   - CONSULTANT (Phase 2, visibilité secrétariat)
   - CLIENT (Phase 3, client utilisateur)
   - EMPLOYEE (Phase 3, employé utilisateur)

**Phase 2 - Vérification utilisateur:**
1. Le SuperAdmin sélectionne le nouveau rôle
2. Le SuperAdmin clique "Enregistrer"
3. Le système récupère les données de l'utilisateur cible
4. **[Alt 1]** Si utilisateur introuvable: Erreur 404 "Utilisateur n'existe pas"

**Phase 3 - Protections (CRITIQUES):**

**Protection 1 - Dernier SuperAdmin:**
1. Le système vérifie si c'est une tentative de révocation du dernier SuperAdmin
2. Le système compte les SuperAdmins actifs: `COUNT(*) WHERE role = 'SUPER_ADMIN' AND is_active = true`
3. **[Alt 2]** Si count = 1 ET c'est le dernier:
   - Erreur 400 "Impossible de révoquer le dernier SuperAdmin"
   - Garantit qu'il reste toujours au moins 1 SuperAdmin

**Protection 2 - Auto-révocation:**
1. Le système compare userId de la cible avec userId du demandeur
2. **[Alt 3]** Si SuperAdmin essaie de modifier son propre rôle:
   - Erreur 403 "Impossible de modifier votre propre rôle"
   - Message: "Demandez à un autre SuperAdmin"

**Phase 4 - Mise à jour du rôle:**
1. Le système met à jour le rôle de l'utilisateur:
   - UPDATE User SET role = '{NOUVEAU_ROLE}', updatedAt = NOW()
2. Le système RÉVOQUE toutes les sessions actives de l'utilisateur:
   - DELETE FROM Session WHERE userId = {userId}
   - **Objectif**: Forcer la reconnexion avec le nouveau rôle
3. Le système enregistre l'action en audit (CHANGE_USER_ROLE):
   - oldRole, newRole, targetUserEmail, timestamp

**Phase 5 - Confirmation:**
1. Le système affiche confirmation: "Rôle modifié avec succès"
2. L'utilisateur doit se reconnecter pour que le nouveau rôle soit actif

**Actions supplémentaires:**
- **Consulter**: Voir les informations détaillées d'un utilisateur
- **Désactiver/Réactiver**: Marquer is_active = false/true (sans supprimer)
- **Réinitialiser mot de passe**: Envoyer lien de réinitialisation (credential users seulement)

**Alternatives:**
- **Alt 1 - Utilisateur inexistant**: Erreur 404 "Utilisateur n'existe pas"
- **Alt 2 - Dernier SuperAdmin**: Erreur 400 "Impossible de révoquer le dernier SuperAdmin" (protection système)
- **Alt 3 - Auto-révocation**: Erreur 403 "Impossible de modifier votre propre rôle"

**Rôles disponibles:**
| Rôle | Description | Portée |
|------|-------------|--------|
| SUPER_ADMIN | Administrateur système (complet) | Plateforme entière |
| ADMIN_SECRETARIAT | Gestionnaire d'un secrétariat | Son secrétariat uniquement |
| CONSULTANT | Employé du secrétariat | Son secrétariat uniquement |
| CLIENT | Entreprise cliente | Ses données uniquement |
| EMPLOYEE | Employé d'une entreprise | Ses fiches de paie |

**Postconditions :**
- Le rôle de l'utilisateur est modifié
- Les sessions actives sont révoquées (force reconnexion)
- L'action est enregistrée en audit avec détails
- Au moins 1 SuperAdmin existe toujours
- L'utilisateur doit se reconnecter avec le nouveau rôle

---

### Catégorie 4 : Analytics & Monitoring

#### UC-01-30 : Consulter le dashboard global

**Acteur principal :** SuperAdmin
**Acteurs secondaires :** Cache Service, Analytics Engine, Database
**Prérequis :** SuperAdmin authentifié
**Déclencheur :** SuperAdmin accède au /superadmin/dashboard

**Scénario nominal (4 phases):**

**Phase 1 - Vérification d'accès:**
1. Le système vérifie la session du SuperAdmin
2. **[Alt 1]** Si pas SuperAdmin: Erreur 403 (redirection vers /dashboard)
3. Si SuperAdmin valide: Continuer

**Phase 2 - Métriques globales de la plateforme (requêtes parallèles):**
1. Le système cherche les métriques en cache (TTL: 10 minutes)
2. **[Cache miss ou expiré]** → Calcule les métriques:
   - **Nombre total de secrétariats actifs**: COUNT(*) FROM Secretariat WHERE status = 'ACTIVE'
   - **Nombre total d'utilisateurs actifs**: COUNT(*) FROM User WHERE is_active = true
   - **MRR (Monthly Recurring Revenue)**: SUM selon le plan (Starter 99€, Pro 299€)
   - **Nouveaux secrétariats ce mois**: COUNT WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
   - **Secrétariats churned ce mois**: COUNT WHERE status = 'CANCELED' AND deleted_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
3. Le système calcule les taux:
   - **Taux de croissance MRR**: ((MRR_current - MRR_previous) / MRR_previous) * 100
   - **Taux de churn**: (churned / total_active) * 100
   - **Taux de rétention**: 100 - churn_rate
4. Le système stocke les résultats en cache (TTL: 10 min)
5. Le système retourne au UI

**Phase 3 - Répartition par plan:**
1. Le système récupère la distribution des plans:
   - SELECT plan, COUNT(*) as count, SUM(revenu) FROM Secretariat
   - Starter: 30 secrétariats (2970€/mois)
   - Pro: 18 secrétariats (5382€/mois)
   - Enterprise: 2 secrétariats (sur devis)
2. Le système affiche pie chart ou tableau de répartition

**Phase 4 - Liste des secrétariats (paginated):**
1. Le système récupère la liste avec pagination:
   - Paramètres: page=1, limit=10, sort=created_at, order=desc
   - Affiche: Nom, TVA, plan, statut, nombre d'utilisateurs, prochaine facturation
2. Le système affiche les 10 derniers secrétariats

**Affichage du Dashboard SuperAdmin:**

**KPIs (Cartes):**
- MRR (Monthly Recurring Revenue): 15000€ (tendance: +12.5% ce mois)
- Secrétariats actifs: 50
- Utilisateurs totaux: 175
- Taux de rétention: 95%
- Taux de churn: 5%
- Nouveaux secrétariats ce mois: 3
- Croissance MRR: +12.5%

**Graphiques:**
- Courbe MRR (derniers 6 mois)
- Distribution par plan (Pie chart: Starter vs Pro vs Enterprise)
- Taux de churn/rétention (Bar chart comparatif)

**Tableau:**
- Liste des 10 derniers secrétariats avec:
  - Nom, TVA, plan, statut, users, billing_date
  - Actions: Voir détails, modifier, supprimer

**Alternative A - Filtrage et export (optionnel):**
1. Le SuperAdmin peut filtrer par période (mois, trimestre, année)
2. Le SuperAdmin peut exporter les rapports (PDF, Excel)
3. Le SuperAdmin peut filtrer par plan ou statut

**Alternatives:**
- **Alt 1 - Pas SuperAdmin**: Erreur 403 "Accès non autorisé" (redirection vers /dashboard)
- **Alt 2 - Base de données indisponible**: Erreur 500 "Données indisponibles. Impossible charger les métriques"
- **Alt 3 - Erreur lors du calcul des métriques**: Affiche warning "Certaines métriques indisponibles" + données partielles
- **Alt 4 - Service Cache indisponible**: Recalcule les métriques en direct (plus lent, TTL ignoré)

**Métriques détaillées:**

| Métrique | Description | Formule |
|----------|-------------|---------|
| MRR | Monthly Recurring Revenue | SUM(plan_price) for active subscriptions |
| Croissance MRR | % augmentation vs mois précédent | ((MRR_current - MRR_previous) / MRR_previous) * 100 |
| Churn | Secrétariats supprimés ce mois | COUNT(canceled_this_month) / COUNT(total) * 100 |
| Rétention | Inverse du churn | 100 - churn_rate |
| Croissance | Nouveaux secrétariats ce mois | COUNT(created_this_month) |

**Optimisations:**
- Cache TTL 10 minutes pour les métriques globales
- Requêtes parallèles en base de données
- Pagination pour les listes longues
- Index sur status, created_at, is_active

**Postconditions :**
- Le SuperAdmin a une visibilité complète sur la plateforme
- Les données sont cachées et optimisées (TTL 10 min)
- Les tableaux de bord affichent les tendances clés
- L'exportation de rapports est disponible

---

### Catégorie 5 : Configuration Système

#### UC-01-40 : Configurer le système et gérer les intégrations

**Acteur principal :** SuperAdmin
**Acteurs secondaires :** Stripe (paiements), Email Service, AuditLog
**Prérequis :** SuperAdmin authentifié
**Déclencheur :** SuperAdmin accède à "Configuration Système"

**Scénario nominal:**
1. Le système affiche l'écran de configuration système
2. Le SuperAdmin accède à plusieurs sections:

**Section A - Gestion des plans d'abonnement:**
1. Le SuperAdmin consulte la liste des plans actuels (Starter, Pro, Enterprise)
2. Pour chaque plan, affichage:
   - Nom du plan
   - Prix mensuel (€)
   - Limites (clients, utilisateurs, stockage)
   - Description
3. Le SuperAdmin peut:
   - **Créer un nouveau plan**: Saisit nom, prix, limites, description
   - **Modifier un plan**: Ajuste prix, limites, description
   - **Désactiver un plan**: Marque comme inactif pour nouveaux clients
4. Le système valide les données (prix > 0, limites positives)
5. Le système enregistre modifications en audit

**Section B - Paramètres globaux:**
1. Le SuperAdmin peut configurer:
   - **Devise par défaut**: EUR/USD/autres
   - **Pays**: Basé ONSS (Belgique), taxes, TVA
   - **Langue par défaut**: FR/NL/EN
   - **Timezone**: Europe/Brussels
   - **Limites système**: Taille max fichier, etc.
2. Le SuperAdmin valide et enregistre

**Section C - Intégrations (Configuration Stripe AU NIVEAU PLATEFORME):**

**IMPORTANT**: Ce section gère la configuration GLOBALE de Stripe pour toute la plateforme.
Les AdminSecretariat gèrent leurs abonnements individuels via UC-02-20 (Customer Portal par client).
SuperAdmin gère UNIQUEMENT la configuration/intégration Stripe, pas les abonnements clients.

1. **Stripe Admin Dashboard**: 
   - Affiche: Clés API (sk_live_***, pk_live_***) - stockées de façon sécurisée en vault
   - Affiche: Webhook secret (whsec_***)
   - Permet de tester la connexion (appelle Stripe API)
   - Affiche historique de TOUS les webhooks (succès/échecs/retries)
   - Permet de modifier les clés (si renouvellement/rotation)
   - **NE PEUT PAS**: Voir abonnements individuels (c'est le Customer Portal pour chaque AdminSecretariat)
2. **Email Service**:
   - Configure l'adresse expéditeur
   - Templates d'email (inscription, bienvenue, etc.)
   - Affiche l'historique des emails envoyés (global)

**Section D - Logs système:**
1. Le SuperAdmin peut consulter les logs:
   - **AuditLog**: Toutes les modifications (CREATE_USER, UPDATE_PROFILE, DELETE_SECRETARIAT, etc.)
   - **Erreurs système**: 500, timeouts, exceptions
   - **Accès refusés**: 401, 403
   - **Webhooks Stripe**: Succès et échecs de traitement
2. Affichage avec filtres:
   - Par type d'action
   - Par utilisateur
   - Par période
   - Par niveau de sévérité
3. Export des logs (CSV/JSON)

**Section E - Alertes système:**
1. Le SuperAdmin peut configurer les seuils d'alerte:
   - **Santé système**: CPU, mémoire, disque
   - **Taux d'erreur**: Alerte si > X% d'erreurs
   - **Paiement échoué**: Alerte immédiate
   - **Capacité**: Alerte si >80% stockage utilisé
2. Le SuperAdmin configure les destinataires (email)
3. Le SuperAdmin teste les notifications

**Audit trail:**
- Toutes les modifications de configuration sont enregistrées
- Affiche: Qui a modifié, quand, ancien vs nouveau valeur

**Protections critiques:**

**Protection 1 - Validation des limites plans:**
1. Le système vérifie la cohérence des limites:
   - Starter < Pro < Enterprise (pour chaque limite: clients, utilisateurs, stockage)
   - **[Alt P1]** Si Starter ≥ Pro: Erreur 400 "Les limites doivent être croissantes (Starter < Pro < Enterprise)"

**Protection 2 - Changement de devise global:**
1. Avant de modifier la devise, le système affiche modal d'avertissement:
   - "Attention! Cette action affectera TOUS les secrétariats et les factures futures"
2. Le SuperAdmin doit cocher: "✓ Je comprends l'impact global"
3. **[Alt P2]** Si refus: Cancellation, pas de modification

**Protection 3 - Test obligatoire après changement Stripe:**
1. Après modification des clés Stripe, test automatique:
   - Appelle Stripe API avec les nouvelles clés
   - **[Alt P3]** Si test échoue: Rollback des clés (restaure version précédente), Erreur 400 "Clés Stripe invalides. Modifications annulées"

**Alternatives (erreurs):**
- **Alt 1 - Données de configuration invalides**: Retourne 400 avec détails (prix ≤ 0, limites négatives, format invalide)
- **Alt 2 - Plan inexistant (modification)**: Retourne 404 "Plan n'existe pas"
- **Alt 3 - Stripe API inaccessible**: Test connexion échoue, Retourne 503 "Service Stripe indisponible. Vérifiez les clés et reconnectez-vous"
- **Alt 4 - Email Service indisponible**: Impossible d'envoyer email test, Retourne 503 "Service Email indisponible"
- **Alt 5 - Configuration verrouillée**: Une autre modification est en cours, Retourne 409 Conflict "Configuration actuellement modifiée par un autre administrateur"
- **Alt 6 - Logs système indisponibles**: Pas d'accès à la base de données d'audit, Retourne 503 "Audit logs indisponibles"
- **Alt 7 - Permissions insuffisantes**: L'utilisateur n'est pas SuperAdmin, Retourne 403 "Accès non autorisé"

**Postconditions :**
- Le système est configuré au niveau global
- Les plans d'abonnement reflètent la stratégie de pricing (validés et cohérents)
- Les intégrations Stripe sont fonctionnelles et testées
- Les logs système sont consultables et archivés
- Les alertes sont configurées pour monitorer la santé
- Toutes les modifications sont enregistrées en audit avec ancien/nouveau valeurs

---

### Catégorie 6 : Audit & Compliance

#### UC-01-50 : Consulter les logs d'audit et événements système

**Acteur principal :** SuperAdmin
**Acteurs secondaires :** AuditLog Service, Cache Service
**Prérequis :** SuperAdmin authentifié
**Déclencheur :** SuperAdmin accède à "Audit Logs" (/superadmin/audit-logs)

**Scénario nominal :**

**Phase 1 - Accès et vérification:**
1. Le SuperAdmin accède à /superadmin/audit-logs
2. Le système vérifie les permissions (rôle = SUPER_ADMIN)
3. **[Alt 1]** Si pas SuperAdmin: Erreur 403 "Accès non autorisé"
4. Le système affiche l'interface de consultation

**Phase 2 - Affichage des logs (paginated):**
1. Le système récupère les logs en base (avec pagination: page=1, limit=50)
2. Le système affiche timeline chronologique (DESC par timestamp) avec:
   - **Type d'action**: CREATE_USER, UPDATE_SECRETARIAT, DELETE_USER, CHANGE_USER_ROLE, BILLING_PORTAL_ACCESS, STRIPE_WEBHOOK, LOGIN_SUCCESS_2FA, etc.
   - **Timestamp**: Date/Heure précise avec timezone
   - **Utilisateur**: Email + nom de l'utilisateur qui a déclenché l'action
   - **Ressource**: Quoi a été modifié (ex: Secretariat "ACME SARL", User "consultant@acme.be")
   - **Ancien vs Nouveau**: Avant/après (ex: Status: ACTIVE → DELETED)
   - **IP + User-Agent**: Pour sécurité
   - **Statut**: SUCCESS ou ERROR (si erreur, affiche le message)
3. Le système affiche les 50 derniers logs
4. **[Alt 2]** Si BD indisponible: Erreur 503 "Audit logs indisponibles"

**Phase 3 - Filtrage avancé:**
1. Le SuperAdmin peut filtrer par:
   - **Type d'action** (dropdown multi-select): CREATE_*, UPDATE_*, DELETE_*, LOGIN_*, BILLING_*
   - **Utilisateur** (search): Email ou nom utilisateur
   - **Période** (date range): From/To
   - **Niveau de sévérité** (optionnel): SUCCESS / WARNING / ERROR
   - **Ressource** (search): Secretariat, User, Client, etc.
2. Le système applique tous les filtres en requête (AND logic)
3. Le système affiche les résultats filtrés

**Phase 4 - Consultation détails:**
1. Le SuperAdmin clique sur une ligne log
2. Le système affiche modal/panel avec tous les détails:
   - Type action complet
   - Timestamp précis
   - Utilisateur (email, nom, rôle)
   - Ressource modifiée (ID, nom)
   - Ancien valeurs (JSON pretty-print si applicable)
   - Nouvelles valeurs (JSON pretty-print si applicable)
   - Détails techniques: IP, User-Agent, Session ID
   - Stack trace si erreur

**Alternative A - Export des logs:**
1. Le SuperAdmin clique "Exporter"
2. Le système propose formats:
   - **CSV**: Fichier tabulaire (Type, Timestamp, Utilisateur, Ressource, Ancien, Nouveau)
   - **JSON**: Format brut pour intégration
   - **PDF**: Rapport formaté
3. Le SuperAdmin sélectionne format et période
4. Le système génère et télécharge le fichier
5. **[Alt A1]** Si >10k rows: Avertissement "Fichier volumineux, exportation en cours..."
6. Le système archive en S3 pendant 7 jours (RGPD)

**Alternative B - Recherche texte global:**
1. Le SuperAdmin saisit texte dans "Chercher"
2. Le système cherche dans:
   - Type d'action
   - Email utilisateur
   - Nom ressource
   - Messages d'erreur
3. Le système affiche résultats en temps réel (debounce 500ms)

**Alternative C - Voir statistiques d'audit:**
1. Le SuperAdmin clique "Statistiques"
2. Le système affiche:
   - **Nombre total logs**: Par exemple 45,234
   - **Distribution par type**: Pie chart (CREATE: 30%, UPDATE: 40%, DELETE: 5%, LOGIN: 20%)
   - **Erreurs ce mois**: COUNT WHERE status = 'ERROR'
   - **Utilisateurs les plus actifs**: Top 10 (email + count actions)
   - **Ressources plus modifiées**: Top 10 (ex: Secretariat "ACME SARL": 1,234 modifications)
3. Le système génère depuis cache (TTL: 1h)

**Alternative D - Alertes anomalies (optionnel):**
1. Le système détecte automatiquement:
   - **Plusieurs DELETE** en courte période (>5 en 5 min) → Anomalie possible
   - **Login échoués en cascade** (>10 en 1h sur même IP) → Tentative brute force
   - **Changements de rôle massif** (>3 en 1h) → Modification suspecte
2. Le système crée AuditAlert avec severity (WARNING, CRITICAL)
3. Le SuperAdmin voit badge "⚠️ 2 anomalies détectées" sur le dashboard

**Protections critiques:**

**Protection 1 - Immutabilité des logs:**
- Les logs d'audit NE PEUVENT PAS être modifiés (append-only)
- Les logs supprimés sont marqués `archived_at` après 6 mois (RGPD)
- **Raison**: Compliance - impossible de couvrir les traces

**Protection 2 - Accès limité:**
- Seul SuperAdmin accède aux logs globaux
- AdminSecretariat voit les logs DE SON SECRÉTARIAT (UC-02-50)
- Les consultants n'ont PAS accès aux logs

**Protection 3 - Sensibilité:**
- Les mots de passe hashés NE SONT PAS loggés en clair
- Les tokens d'accès NE SONT PAS loggés complètement (masked)
- Les données financières sont loggées mais masquées (***XXX)

**Alternatives (erreurs):**
- **Alt 1 - Pas SuperAdmin**: Erreur 403 "Accès non autorisé"
- **Alt 2 - BD indisponible**: Erreur 503 "Audit logs indisponibles"
- **Alt 3 - Recherche trop large**: Si >100k résultats, limiter et avertir "Trop de résultats, affinez votre recherche"
- **Alt 4 - Export échoue**: Erreur 503 "Export impossible, réessayez"

**Postconditions :**
- Le SuperAdmin a une traçabilité complète de toutes les actions
- Les anomalies sont détectées automatiquement
- Les exports sont disponibles pour audit externe
- La conformité légale est assurée (logs immuables)
- Les données sensibles sont masquées

---

### Catégorie 7 : Veille Législative

#### UC-01-60 : Veille législative automatisée

**Acteur principal :** SuperAdmin
**Acteurs secondaires :** Web Scraper Service, ONSS/DIMONA APIs, Notification Service, AuditLog
**Prérequis :** SuperAdmin authentifié
**Déclencheur :** Accès à "Veille Législative" (/superadmin/legislative-watch) ou planifié quotidiennement (02:00 AM)

**Scénario nominal :**

**Phase 1 - Configuration sources:**
1. Le SuperAdmin accède à /superadmin/legislative-watch
2. Le système affiche sources à scraper:
   - ☑️ Portail ONSS (www.onss.be)
   - ☑️ Portail DIMONA (www.dimona.be)
   - ☑️ Bulletin officiel Belgique
   - ☑️ Autres sources (configurable)
3. Pour chaque source:
   - Fréquence scraping (quotidien, hebdomadaire)
   - Mots-clés à monitorer (paie, cotisations, déclarations, etc.)
   - Notification si changement détecté

**Phase 2 - Scraping automatisé (planifié 02:00 AM):**
1. Le système lance scraping de chaque source
2. Extrait les textes légaux
3. Compare avec version précédente
4. **[Alt 1]** Si changement détecté:
   - Analyse impact (payroll calculation? declaration rules?)
   - Génère résumé automatique (IA/NLP)
   - Crée alerte avec niveau sévérité (INFO, WARNING, CRITICAL)
   - Envoie notification email SuperAdmin

**Phase 3 - Alertes et gestion:**
1. Le SuperAdmin voit liste des alertes:
   - Date détection
   - Source (ONSS, DIMONA, etc.)
   - Titre changement
   - Résumé du changement
   - Impact estimé (Payroll, Declarations, Compliance)
   - Lien document original
2. Le SuperAdmin peut:
   - Marquer comme "Vu"
   - Ajouter note/action
   - Partager aux AdminSecretariat
   - Créer task "À vérifier"

**Alternative A - Import manuel:**
1. Le SuperAdmin peut importer manuellement un changement légal
2. Saisit: Source, titre, description, impact, effective date
3. Le système crée l'alerte
4. Notifie AdminSecretariat si impact payroll

**Alternative B - Notifications aux AdminSecretariat:**
1. Le SuperAdmin clique "Notifier secrétariats"
2. Sélectionne les secrétariats concernés
3. Le système envoie email résumé avec impact
4. AdminSecretariat reçoit: "Changement législatif détecté: X. Action requise: Y"

**Protections :**
- ✅ Scraping de sources officielles uniquement
- ✅ Alertes non-intrusive (email, pas de popup)
- ✅ Audit logs de tous les changements détectés
- ✅ Historique des alertes conservé (3 ans)

**Postconditions :**
- Veille active sur sources légales
- Alertes envoyées en temps opportun
- AdminSecretariat notifiés des impacts
- Historique complet conservé

---

### Catégorie 8 : API & Intégrations

#### UC-01-70 : Gérer API publique et intégrations externes

**Acteur principal :** SuperAdmin
**Acteurs secondaires :** API Gateway, Rate Limiter, AuditLog
**Prérequis :** SuperAdmin authentifié
**Déclencheur :** SuperAdmin accède à "API Management" (/superadmin/api-management)

**Scénario nominal :**

**Phase 1 - Gestion des clés API:**
1. Le SuperAdmin accède à /superadmin/api-management
2. Le système affiche liste des clients API (secrétariats, partenaires, intégrateurs)
3. Pour chaque client:
   - Nom client
   - Clé API (masquée, format: sk_live_***)
   - Secret (jamais affiché, seulement pour génération)
   - Scopes/permissions (list, read_payslips, write_declarations, etc.)
   - Rate limit (ex: 100 requêtes/min)
   - Status (ACTIVE, SUSPENDED, REVOKED)
   - Date création, dernière utilisation

**Phase 2 - Créer nouvelle clé API:**
1. Le SuperAdmin clique "Générer clé API"
2. Saisit:
   - Nom client/intégrateur
   - Scopes autorisés (multi-select):
     - read:companies
     - read:employees
     - read:payslips
     - write:payslips
     - read:declarations
     - write:declarations
     - webhooks:manage
   - Rate limit (requêtes/min)
   - Expiration (optionnel): 30j, 90j, 1 an, infini
   - Env (production, sandbox)
3. Le système génère:
   - **API Key**: sk_live_xxxxx (32 chars)
   - **Secret**: sk_secret_xxxxx (pour authentification)
4. SuperAdmin reçoit clé une seule fois (copy/paste, puis masquée)
5. Email de confirmation envoyé au client

**Alternative A - Rotation de clés:**
1. Le SuperAdmin clique "Révoquer et générer nouvelle"
2. Génère nouvelle clé
3. Ancienne clé révoquée immédiatement
4. Client notifié pour mettre à jour

**Alternative B - Gérer rate limiting:**
1. Le SuperAdmin ajuste rate limit d'un client
2. Ex: 100 → 500 requêtes/min
3. Change appliqué immédiatement
4. Logs: "Rate limit changed from X to Y"

**Alternative C - Suspendre/Réactiver API:**
1. Le SuperAdmin peut suspendre une clé (temporaire)
   - Raison: abuse détecté, client en arrêt de paiement, etc.
   - Toutes requêtes retournent 403 Forbidden
   - Client notifié
2. Peut réactiver ultérieurement

**Phase 3 - Monitoring et webhooks:**
1. Le SuperAdmin voit statistiques API:
   - Nombre appels par jour (graphique 30j)
   - Erreurs (4xx, 5xx)
   - Top endpoints appelés
   - Clients les plus actifs
2. Le SuperAdmin peut configurer webhooks:
   - Events: payslip.created, payslip.sent, declaration.submitted
   - URL callback client
   - Retry policy (3x avec backoff)
   - Signature HMAC-SHA256 pour sécurité

**Protections :**
- ✅ Clés jamais loggées en clair (masked)
- ✅ Secrets jamais affichés (génération unique)
- ✅ Rate limiting pour prévenir abuse
- ✅ HMAC signatures pour webhooks
- ✅ Audit logs de tous les accès API
- ✅ Revocation immédiate possible

**Postconditions :**
- API keys gérées et sécurisées
- Rate limiting appliqué
- Webhooks configurés
- Audit logs complets

---

### Catégorie 9 : White-Label

#### UC-01-80 : Configurer White-label et branding personnalisé

**Acteur principal :** SuperAdmin
**Acteurs secondaires :** Storage Service, Email Service, AuditLog
**Prérequis :** SuperAdmin authentifié
**Déclencheur :** SuperAdmin accède à "White-label" (/superadmin/white-label)

**Scénario nominal :**

**Phase 1 - Configuration branding par client:**
1. Le SuperAdmin accède à /superadmin/white-label
2. Sélectionne un secrétariat (AdminSecretariat) à personnaliser
3. Le système affiche sections de configuration:
   - Domaine custom
   - Logo & couleurs
   - Emails
   - Interface

**Phase 2 - Domaine custom:**
1. Le SuperAdmin saisit domaine personnalisé:
   - Ex: "paie.acmesecretal.be" au lieu de "workzen.be/secretariat/123"
2. Le système:
   - Vérifie disponibilité du domaine
   - Crée certificat SSL automatiquement (Let's Encrypt)
   - Configure DNS (CNAME)
   - Redirige requêtes vers instance WorkZen (proxy transparent)
3. Test de validité après 24h (DNS propagation)

**Alternative A - Logo & couleurs:**
1. Le SuperAdmin uploads:
   - Logo client (max 2MB, PNG/JPG)
   - Couleur primaire (hex: #006699)
   - Couleur secondaire
   - Favicon
2. Le système:
   - Redimensionne logo (pour header, email, PDF)
   - Applique couleurs aux éléments UI (boutons, liens, headers)
   - Génère PDF avec branding
   - Envoie preview au SuperAdmin

**Alternative B - Emails personnalisés:**
1. Le SuperAdmin peut customiser emails:
   - Nom expéditeur: "Paie ACME" au lieu de "WorkZen"
   - Adresse email: paie@acmesecretal.be (au lieu de noreply@workzen.be)
   - Signature/footer emails
   - Template html avec logo
2. Tous les emails clients utilisent ce branding

**Alternative C - Interface & textes:**
1. Le SuperAdmin peut modifier:
   - Titre application: "ACME Paie" au lieu de "WorkZen"
   - Textes légaux/mentions
   - FAQ/Help center URL
   - Support email/tel
2. Interface reste fonctionnelle, branding appliqué

**Protections :**
- ✅ SSL certificate automatique (Let's Encrypt)
- ✅ DNS validation avant activation
- ✅ Domaine peut revenir à workzen.be si contrat fin
- ✅ Audit logs de tous les changements branding
- ✅ Backup/rollback possible

**Restrictions :**
- ❌ Impossible de modifier fonctionnalités core
- ❌ Logo doit respecter limites (transparence, format)
- ✅ Support technique reste WorkZen (confidentiel)

**Postconditions :**
- Domaine custom actif avec SSL
- Branding appliqué uniformément
- Emails envoyés avec branding client
- Interface personnalisée
- AdminSecretariat voit "sa" marque

---

## ⚡ **POINTS CLÉS IMPORTANTS**

### Visibilité Complète
- SuperAdmin a accès à TOUS les secrétariats, utilisateurs et configurations
- Dashboard global avec métriques de la plateforme (MRR, churn, rétention)
- Cache TTL 10 min pour optimiser les performances

### Protections Critiques
1. **Authentification 2FA obligatoire** (TOTP 30 sec)
2. **Dernier SuperAdmin protégé** (impossible de le révoquer)
3. **Auto-révocation bloquée** (SuperAdmin ne peut pas modifier son propre rôle)
4. **Cohérence limites plans** (Starter < Pro < Enterprise)
5. **Test automatique Stripe** (rollback si les clés sont invalides)
6. **Confirmation changement devise** (impact global sur tous les secrétariats)

### Gestion Stripe
- **SuperAdmin**: Configuration plateforme (UC-01-40 Section C) - Clés API, test connexion, webhooks globaux
- **AdminSecretariat**: Gestion abonnement client (UC-02-20) - Customer Portal par secrétariat
- **Soft delete**: Données conservées (RGPD), marquées deleted_at, revocation des sessions

### Audit & Compliance
- Toutes les actions tracées avec userId, timestamp, ancien/nouveau valeurs
- Webhooks Stripe traités de façon sécurisée (signature whsec vérifiée)
- Logs système consultables et exportables (CSV/JSON)


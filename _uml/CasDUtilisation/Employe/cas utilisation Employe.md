## Cas d'Utilisation Employé

> **Note importante sur le rôle Employé :**
> Le rôle Employé représente le **salarié** d'une entreprise cliente du secrétariat social. L'Employé accède à un portail sécurisé pour consulter **ses propres fiches de paie** et ses **informations personnelles uniquement**. L'Employé n'a qu'un accès **en lecture seule** à ses données et ne peut rien modifier.

> **Note importante sur l'accès :**
> Chaque Employé ne peut consulter que **ses propres données** (fiche de paie personnelle, contrat, documents, informations). L'Employé n'a accès qu'à son dossier individuel et ne peut pas voir les informations des autres employés, des autres fiches, ou de l'entreprise en général. **Stricte isolation par employee_id**.

---

### Catégorie 1 : Authentification

#### UC-05-00 : Se connecter

**Acteur principal :** Employé (salarié)
**Acteurs secondaires :** Better Auth, Email Service, AuditLog
**Prérequis :** Compte Employé actif créé par un Consultant
**Déclencheur :** Employé accède à /login

**Scénario nominal :**
1. Le système affiche le formulaire de connexion
2. L'Employé saisit email et mot de passe
3. Le système valide le format email et champs non vides
4. **[Alt 1]** Si format invalide: Erreur 400 "Format invalide"
5. Le système récupère le compte Employé par email
6. **[Alt 2]** Si compte inexistant: Erreur 401 "Email ou mot de passe incorrect" (message générique)
7. Le système hash le mot de passe et compare
8. **[Alt 3]** Si mot de passe incorrect:
   - Incrémenter compteur tentatives échouées
   - Si >= 5: Bloquer compte 15 minutes
   - Erreur 401 "Email ou mot de passe incorrect"
9. Le système vérifie le statut du compte (ACTIF)
10. **[Alt 4]** Si compte BLOQUE ou INACTIF: Erreur 403 "Compte désactivé"
11. Le système génère JWT token (8h expiration, employee_id, role = EMPLOYEE)
12. Le système crée session en Redis avec IP et user-agent
13. Le système enregistre log audit: "LOGIN_SUCCESS_EMPLOYEE" (timestamp, IP)
14. Le système charge dashboard de l'Employé
15. L'utilisateur est redirigé vers /dashboard

**Alternatives :**
- **Alt 1 - Format invalide**: Email ou champs non remplis → Erreur 400 "Veuillez remplir tous les champs"
- **Alt 2 - Compte inexistant**: Email n'existe pas → Erreur 401 "Email ou mot de passe incorrect"
- **Alt 3 - Mot de passe incorrect**: Mauvaise comparaison bcrypt → Incrémenter compteur, blocage après 5
- **Alt 4 - Compte désactivé**: Status = BLOQUE ou INACTIF → Erreur 403 "Compte désactivé"
- **Alt 5 - Service indisponible**: Erreur base de données → Erreur 503 "Service d'authentification DOWN"

**Postconditions :**
- Employé authentifié avec JWT token valide
- Session créée en Redis avec IP et user-agent
- Audit log enregistré (LOGIN_SUCCESS_EMPLOYEE)
- Accès au dashboard en lecture seule

---

### Catégorie 2 : Consultation Fiche de Paie

#### UC-05-10 : Consulter fiche de paie (Consulter, Filtrer, Télécharger)

**Acteur principal :** Employé
**Acteurs secondaires :** Modèle, AuditLog
**Prérequis :** Employé authentifié avec token JWT valide
**Déclencheur :** Employé accède à "Ma Fiche de Paie"

**Scénario nominal - Consultation :**
1. Le système récupère toutes les fiches de paie de l'Employé (employee_id du token, period complète)
2. Le système affiche tableau fiches (période, salaire brut, ONSS, précompte, net, statut)
3. **[Alt 1]** Si BD indisponible: Erreur 500 "Impossible charger fiches de paie"

**Alternative A - Consulter détails fiche :**
1. L'Employé clique sur fiche de paie pour détails
2. Le système récupère fiche complète (brut, ONSS, précompte, charges, net, détails ligne par ligne)
3. **[Alt A1]** Si fiche inexistante: Erreur 404 "Fiche inexistante"
4. Le système affiche détails complets :
   - Salaire brut
   - Retenues (ONSS %, précompte professionnel %)
   - Charges employeur (informatif, non déductible du salaire)
   - Net à payer
5. Le système affiche calcul transparent (formules)

**Alternative B - Filtrer fiches :**
1. L'Employé peut filtrer par :
   - **Période** (mois/année)
   - **Statut** (envoyée, brouillon)
2. Le système applique filtres et affiche fiches correspondantes

**Alternative C - Télécharger PDF :**
1. L'Employé clique "Télécharger PDF"
2. Le système génère lien sécurisé avec token temporaire (30 minutes)
3. **[Alt C1]** Si PDF inaccessible: Erreur 404 "PDF non disponible"
4. L'Employé télécharge fiche en PDF
5. **[Alt C2]** Si erreur téléchargement: Erreur 500 "Impossible télécharger"
6. Le système enregistre log audit : "PAYSLIP_DOWNLOADED" (période, timestamp)

**Restrictions :**
- ❌ L'Employé NE PEUT PAS modifier fiches (lecture seule)
- ❌ L'Employé NE PEUT PAS supprimer fiches
- ❌ L'Employé NE PEUT PAS voir fiches des autres employés
- ✅ L'Employé PEUT consulter et télécharger ses propres fiches

**Alternatives :**
- **Alt 1 - BD indisponible**: Erreur 500 "Impossible charger fiches"
- **Alt A1 - Fiche inexistante**: Introuvable ou supprimée → Erreur 404 "Fiche inexistante"
- **Alt C1 - PDF inaccessible**: PDF non stocké ou expiré → Erreur 404 "PDF non disponible"
- **Alt C2 - Erreur téléchargement**: Erreur storage → Erreur 500 "Impossible télécharger"

**Postconditions :**
- Fiches consultées et téléchargées avec succès
- Accès restreint aux propres fiches de l'Employé (employee_id garanti)
- Liens PDF sécurisés avec token temporaire 30 minutes
- Audit logs enregistrés (consultation et téléchargements)

---

### Catégorie 3 : Téléchargement Documents

#### UC-05-20 : Consulter et télécharger documents (Consulter, Filtrer, Télécharger)

**Acteur principal :** Employé
**Acteurs secondaires :** Modèle, Storage Service, AuditLog
**Prérequis :** Employé authentifié avec token JWT valide
**Déclencheur :** Employé accède à "Mes Documents"

**Scénario nominal - Consultation :**
1. Le système récupère tous documents personnels de l'Employé (employee_id)
2. Le système affiche tableau documents (type, date création, statut, taille)
3. **[Alt 1]** Si BD indisponible: Erreur 500 "Impossible charger documents"

**Types de documents affichés :**
- **Fiches de paie** : ses propres fiches de paie (PDF)
- **Certificat C4** : si employé terminé (PDF)
- **Attestations de travail** : sur demande du client (PDF)
- **Documents administratifs** : notices, guides (PDF)

**Alternative A - Filtrer documents :**
1. L'Employé peut filtrer par :
   - **Type** (fiche de paie, certificat, attestation)
   - **Période** (par année/mois)
2. Le système applique filtres et affiche documents correspondants

**Alternative B - Télécharger document :**
1. L'Employé clique "Télécharger"
2. Le système génère lien sécurisé avec token temporaire (30 minutes)
3. **[Alt B1]** Si document inaccessible: Erreur 404 "Document non disponible"
4. L'Employé télécharge document en PDF
5. **[Alt B2]** Si erreur téléchargement: Erreur 500 "Impossible télécharger"
6. Le système enregistre log audit : "DOCUMENT_DOWNLOADED" (type, timestamp)

**Alternative C - Consulter historique :**
1. L'Employé consulte "Mes Documents" avec tri chronologique
2. Le système affiche tous documents avec dates (plus récents d'abord)
3. L'Employé peut voir liste complète (pagination 20 par page)

**Restrictions :**
- ❌ L'Employé NE PEUT PAS supprimer documents
- ❌ L'Employé NE PEUT PAS modifier documents
- ❌ L'Employé NE PEUT PAS voir documents des autres employés
- ✅ L'Employé PEUT consulter et télécharger ses propres documents

**Alternatives :**
- **Alt 1 - BD indisponible**: Erreur 500 "Impossible charger documents"
- **Alt B1 - Document inaccessible**: Supprimé ou storage erreur → Erreur 404 "Document non disponible"
- **Alt B2 - Erreur téléchargement**: Erreur lecture storage → Erreur 500 "Impossible télécharger"

**Postconditions :**
- Documents consultés et téléchargés avec succès
- Liens PDF sécurisés avec token temporaire 30 minutes
- Accès restreint aux documents de l'Employé (employee_id garanti)
- Audit logs enregistrés (téléchargements)
- Historique documents visible et filtrable

---

### Catégorie 4 : Informations Personnelles

#### UC-05-30 : Consulter informations personnelles (Consulter dossier)

**Acteur principal :** Employé
**Acteurs secondaires :** Modèle, AuditLog
**Prérequis :** Employé authentifié avec token JWT valide
**Déclencheur :** Employé accède à "Mon Dossier" ou "Mes Informations"

**Scénario nominal :**
1. Le système récupère le dossier personnel de l'Employé (employee_id)
2. **[Alt 1]** Si BD indisponible: Erreur 500 "Impossible charger dossier"
3. Le système affiche dossier personnel avec sections :

**Section 1 - Informations personnelles (visibles) :**
- Nom complet
- Adresse personnelle
- Email personnel
- Téléphone

**Section 2 - Données emploi (visibles) :**
- Numéro NISS (masqué partiellement : XX.XX.02.****)
- Type de contrat (CDI, CDD, stages, etc.)
- Date d'embauche
- Statut actuel (ACTIF, en congé, arrêt maladie, TERMINE)
- Salaire de base mensuel (brut)
- Poste/Fonction

**Section 3 - Congés (visibles) :**
- Jours de congé légaux restants (année courante)
- Jours de congé pris (année courante)
- Jours de congé disponibles

**Section 4 - Données sensibles (MASQUÉES ou NON affichées) :**
- ❌ Coordonnées bancaires complètes (non affichées)
- ❌ Numéro de sécurité sociale complet (masqué)
- ❌ Historique salaires détaillé (voir fiches de paie à la place)

4. Le système enregistre log audit : "EMPLOYEE_FILE_VIEWED" (timestamp)
5. L'Employé clique "Retour" ou "Rafraîchir" pour données à jour

**Restrictions :**
- ❌ L'Employé NE PEUT PAS modifier ses informations personnelles
- ❌ L'Employé NE PEUT PAS modifier contrat ou statut
- ❌ L'Employé NE PEUT PAS voir informations d'autres employés
- ✅ L'Employé PEUT consulter son propre dossier
- ✅ Données sensibles masquées (NISS, coordonnées bancaires)

**Alternatives :**
- **Alt 1 - BD indisponible**: Erreur 500 "Impossible charger dossier"
- **Alt 2 - Dossier inexistant**: Compte supprimé ou anomalie → Erreur 404 "Dossier inexistant"

**Postconditions :**
- Dossier personnel consulté avec succès
- Données sensibles masquées (NISS partiellement)
- Coordonnées bancaires non affichées
- Accès restreint au dossier de l'Employé (employee_id garanti)
- Audit logs enregistrés (consultation dossier)

---

### Catégorie 5 : Support

#### UC-05-40 : Accéder support et FAQ (Consulter, Envoyer message)

**Acteur principal :** Employé
**Acteurs secondaires :** Modèle, Email Service, AuditLog
**Prérequis :** Employé authentifié avec token JWT valide
**Déclencheur :** Employé accède à "Support" ou "Contact"

**Scénario nominal - Consulter FAQ :**
1. Le système affiche FAQ (questions fréquentes sur fiches de paie, congés, contrat)
2. L'Employé peut filtrer FAQ par catégorie
3. **[Alt 1]** Si BD indisponible: Erreur 500 "Impossible charger FAQ"

**Alternative A - Envoyer message :**
1. L'Employé clique "Envoyer message au support"
2. Le système affiche formulaire (sujet, message)
3. L'Employé remplit et clique "Envoyer"
4. Le système valide message non vide
5. **[Alt A1]** Si message vide: Erreur 400 "Veuillez entrer un message"
6. Le système crée message en transaction (employee_id, sujet, contenu, timestamp)
7. Le système envoie notification email au secrétariat
8. **[Alt A2]** Si email service DOWN: Message créé, email non envoyé, Avertissement
9. Le système INSERT log audit : "SUPPORT_MESSAGE_SENT" (sujet, timestamp)
10. L'Employé reçoit confirmation "Message envoyé ✓"

**Alternative B - Consulter messages :**
1. L'Employé consulte "Mes messages"
2. Le système affiche historique conversation (ordre chronologique)
3. Le système affiche réponses du secrétariat
4. L'Employé peut répondre dans la même conversation

**Types de questions supportées :**
- "Pourquoi mon net est-il inférieur au mois précédent?"
- "Comment sont calculés mes retenues ONSS?"
- "Combien de jours de congé me reste-t-il?"
- "Je n'ai pas reçu ma fiche de paie"
- "Comment accéder au certificat C4?"
- "Où trouver mes documents?"
- Autres questions/anomalies

**Restrictions :**
- ❌ L'Employé NE PEUT PAS supprimer messages
- ❌ L'Employé NE PEUT PAS modifier messages
- ✅ L'Employé PEUT envoyer et consulter ses messages
- ✅ Temps de réponse cible : 24-48 heures

**Alternatives :**
- **Alt 1 - BD indisponible**: Erreur 500 "Impossible charger FAQ"
- **Alt A1 - Message vide**: Champ vide → Erreur 400 "Veuillez entrer un message"
- **Alt A2 - Email service DOWN**: Email notification échoue → Message créé, Avertissement

**Postconditions :**
- FAQ consultée avec succès
- Messages consultés et envoyés avec succès
- Notification email envoyée au secrétariat (si service OK)
- Conversation tracée et archivée
- Audit logs enregistrés (messages envoyés/lus)

---

### Catégorie 6 : Gestion Profil

#### UC-05-50 : Gérer profil personnel

**Acteur principal :** Employé
**Acteurs secondaires :** Email Service, AuditLog
**Prérequis :** Employé authentifié
**Déclencheur :** Employé clique sur "Paramètres" ou "Mon profil"

**Scénario nominal :**

**Phase 1 - Accès aux paramètres:**
1. L'Employé accède à /dashboard/settings
2. Le système affiche onglets:
   - Informations personnelles
   - Mot de passe
   - Préférences notifications

**Phase 2 - Modifier informations:**
1. L'Employé peut modifier:
   - Adresse personnelle
   - Numéro de téléphone
   - Email (avec confirmation)
   - Langue interface (FR/NL/EN)
2. L'Employé clique "Enregistrer"
3. Confirmation: "Informations mises à jour ✓"

**Alternative A - Changer mot de passe:**
1. L'Employé saisit: ancien mot de passe + nouveau (2x)
2. Le système valide (ancien = correct, nouveau ≠ ancien)
3. Tous les tokens révoqués (force reconnexion)
4. Email de confirmation envoyé

**Alternative B - Ajouter photo de profil:**
1. L'Employé clique "Ajouter photo"
2. Upload image (max 5MB, JPG/PNG)
3. Le système redimensionne pour avatar
4. Photo visible sur profil et messages

**Protections :**
- ✅ Mot de passe ancien vérifié
- ✅ Tokens révoqués après changement

**Postconditions :**
- Profil mis à jour
- Audit logs enregistrés

---

### Catégorie 7 : Congés & Absences

#### UC-05-60 : Demander congés et absences

**Acteur principal :** Employé
**Acteurs secondaires :** Consultant, Notification Service, AuditLog
**Prérequis :** Employé authentifié
**Déclencheur :** Employé accède à "Demander congés" (/dashboard/leave-requests)

**Scénario nominal :**

**Phase 1 - Voir disponibilités:**
1. L'Employé accède à /dashboard/leave-requests
2. Le système affiche:
   - Jours de congé légaux restants (année)
   - Jours pris ce mois
   - Calendrier avec dates de congé approuvées
3. L'Employé peut voir historique demandes antérieures

**Phase 2 - Créer nouvelle demande:**
1. L'Employé clique "Demander congés"
2. Saisit:
   - **Type**: Vacation, Maladie, Autre
   - **Date début**: Sélecteur calendrier
   - **Date fin**: Sélecteur calendrier
   - **Nombre jours**: Calculé automatiquement
   - **Commentaire** (optionnel): Ex: "Congés annuels"
3. Le système valide:
   - Dates valides (début < fin)
   - Jours disponibles suffisants
   - Pas de double réservation
4. Le système crée demande avec status = "PENDING"
5. Notification envoyée au Consultant pour validation
6. L'Employé voit: "Demande envoyée, en attente d'approbation"

**Alternative A - Annuler demande:**
1. L'Employé clique "Annuler" sur demande PENDING
2. Le système supprime la demande
3. Notification au Consultant (si approuvée avant)
4. Jours libérés

**Alternative B - Voir historique:**
1. L'Employé clique "Historique"
2. Le système affiche:
   - Toutes demandes (PENDING, APPROVED, REJECTED)
   - Dates, raison, statut
   - Qui a approuvé/rejeté et quand

**Protections :**
- ✅ Validation jours disponibles
- ✅ Consultant doit valider
- ✅ Pas de double réservation
- ✅ Immuabilité après approbation

**Restrictions:**
- ❌ Employé NE PEUT PAS approuver sa propre demande
- ✅ Demande redevient PENDING si Consultant rejette

**Postconditions :**
- Demande créée et en attente
- Consultant notifié
- Historique enregistré

---

### Catégorie 8 : Notifications

#### UC-05-70 : Configurer notifications et préférences

**Acteur principal :** Employé
**Acteurs secondaires :** Email Service, Notification Service
**Prérequis :** Employé authentifié
**Déclencheur :** Employé clique sur "Notifications" dans paramètres

**Scénario nominal :**

**Phase 1 - Accès aux préférences:**
1. L'Employé accède à /dashboard/settings/notifications
2. Le système affiche toggles pour:
   - ☑️ Email nouvelle fiche de paie reçue (défaut: ON)
   - ☑️ Alertes anomalies salaire (défaut: ON)
   - ☑️ Rappel documents importants (défaut: ON)
   - ☑️ Messages du secrétariat (défaut: ON)
   - ☑️ Notifications in-app (défaut: ON)
   - ☑️ SMS notifications (optionnel) (défaut: OFF)

**Phase 2 - Configurer fréquence:**
1. L'Employé peut configurer pour notifications email:
   - **Immédiat**: À chaque événement
   - **Quotidien**: Résumé 1x par jour (08:00)
   - **Hebdomadaire**: Résumé 1x par semaine (lundi)
   - **Désactivé**: Pas de notification
2. Sauvegarde automatique

**Alternative A - Configuration SMS:**
1. L'Employé peut activer SMS pour:
   - Nouvelle fiche reçue
   - Alertes urgentes seulement
2. Vérifie numéro par OTP (One-Time Password)
3. SMS envoyés en complément email

**Alternative B - Tester notification:**
1. L'Employé clique "Envoyer test"
2. Le système envoie email test
3. Employé reçoit: "Ceci est un test de notification"
4. Vérifie que le format est OK

**Protections :**
- ✅ Consentement RGPD (utilisateur choisit)
- ✅ Opt-out facile (toggles)
- ✅ Validation numéro SMS
- ✅ Audit logs des modifications

**Restrictions :**
- ❌ Impossible de désactiver toutes les notifications
- ✅ Au minimum 1 canal (email ou in-app)

**Postconditions :**
- Préférences sauvegardées
- Notifications futures respectent les paramètres
- Audit logs enregistrés

---

## ⚡ **POINTS CLÉS IMPORTANTS**

### Isolation Stricte par Employé
- **Chaque Employé** accède uniquement à **ses propres données** (`employee_id` dans JWT)
- **JWT token** contient : `employee_id`, `clientId`, `role = EMPLOYEE`, expiration 8 heures
- **Toutes les requêtes** filtrées par `employee_id` du token
- **Aucune donnée inter-employé** accessible, même en erreur
- **Employé ne voit pas** fiches d'autres employés, données d'autres dossiers

### Portail Lecture Seule (Employé)
- **L'Employé ne peut RIEN modifier** : fiches, informations, documents
- **Toutes les créations** effectuées par le Consultant (crée fiche, gère employé)
- **Employé = Consultation seulement** : voir sa fiche, ses documents, son dossier
- **Aucun droit d'écriture** : pas de création, modification, suppression

### Traçabilité Audit Complète
- **Tous les accès** enregistrés :
  - Qui : `employee_id`
  - Quoi : Action (LOGIN, PAYSLIP_VIEWED, DOCUMENT_DOWNLOADED, SUPPORT_MESSAGE_SENT)
  - Quand : `timestamp`
  - Contexte : `employee_id` (toujours)
- **Logs persistes** long-terme (RGPD 3 ans)
- **Events loggues** temps réel (monitoring)

### Sécurité Authentification
- **Token JWT 8 heures** avec refresh automatique
- **sessionId Redis** avec IP et user-agent verification
- **Logout révoque immédiatement**
- **Tentatives login** : max 5, blocage 15 min après
- **Tous les accès tracés** en audit

### Protection Données Sensibles
- **NISS masqué partiellement** : "XX.XX.02.****" (4 derniers chiffres cachés)
- **Coordonnées bancaires** : complètement non affichées
- **Salaire net** : visible (c'est la paie de l'Employé)
- **Salaire brut** : visible sur fiches

### Sécurité Documents
- **PDF stocké sécurisé** (storage, pas accessible publiquement)
- **Lien téléchargement token temporaire** (30 minutes)
- **Après 30 min** : lien expiré, besoin nouveau téléchargement
- **Audit logs** : qui télécharge quoi, quand

### Sécurité Messagerie
- **Messages cryptés** en transit (HTTPS)
- **Historique conservé** (traçabilité)
- **Temps réponse cible** : 24-48 heures
- **Notification email** au secrétariat (si service OK)

---

## Synthèse des Cas d'Utilisation

| UC ID | Nom | Acteurs Secondaires | Priorité | Complexité |
|-------|-----|----------|----------|-----------|
| UC-05-00 | Se connecter | Better Auth, Email Service, AuditLog | Critique | Moyenne |
| UC-05-10 | Consulter fiche de paie (Consulter, Filtrer, Télécharger) | Modèle, AuditLog | Critique | Basse |
| UC-05-20 | Consulter et télécharger documents (Consulter, Filtrer) | Modèle, Storage Service, AuditLog | Critique | Basse |
| UC-05-30 | Consulter informations personnelles (Consulter dossier) | Modèle, AuditLog | Critique | Basse |
| UC-05-40 | Accéder support et FAQ (Consulter, Envoyer message) | Modèle, Email Service, AuditLog | Moyenne | Basse |
| UC-05-50 | Gérer profil personnel (Infos, Mot de passe, Photo) | Email Service, AuditLog | Basse | Basse |
| UC-05-60 | Demander congés/absences (Créer, Valider, Historique) | Consultant, Notification Service, AuditLog | Moyenne | Moyenne |
| UC-05-70 | Configurer notifications (Préférences, Email/SMS) | Email Service, Notification Service, AuditLog | Basse | Basse |

## Cas d'Utilisation Consultant

> **Note importante sur le rôle Consultant :**
> Le rôle Consultant est attribué aux **collaborateurs/consultants** d'un secrétariat social. Un AdminSecretariat peut créer des comptes Consultant et leur attribuer des permissions. Tous les Consultants d'un même secrétariat ont accès aux mêmes fonctionnalités opérationnelles. Chaque Consultant ne peut accéder qu'aux données de **son propre secrétariat** (`secretariatId`).

> **Note importante sur les responsabilités :**
> Le Consultant est l'utilisateur opérationnel principal responsable de la gestion quotidienne des clients, employés et fiches de paie. Il exécute les tâches de conformité belge (DIMONA, C4) mais ne gère pas la facturation ni les paramètres système. Tous les accès aux données sont tracés via logs d'audit pour conformité et monitoring.

---

### Catégorie 1 : Authentification

#### UC-03-00 : Se connecter

**Acteur principal :** Consultant
**Acteurs secondaires :** Better Auth, Email Service, AuditLog
**Prérequis :** Compte Consultant actif créé par un AdminSecretariat
**Déclencheur :** Consultant accède à /login

**Scénario nominal :**
1. Le système affiche le formulaire de connexion
2. Le Consultant saisit email et mot de passe
3. Le système valide le format email et champs non vides
4. **[Alt 1]** Si format invalide: Erreur 400, message "Format invalide"
5. Le système récupère le compte Consultant par email
6. **[Alt 2]** Si compte inexistant: Erreur 401, message générique "Email ou mot de passe incorrect"
7. Le système hash le mot de passe et compare
8. **[Alt 3]** Si mot de passe incorrect:
   - Incrémenter compteur tentatives échouées (cache)
   - Si compteur >= 5: Bloquer compte 15 minutes
   - Erreur 401 "Email ou mot de passe incorrect"
   - **[Alt 3a]** Si compte bloqué: Erreur 429 "Trop de tentatives, essayez dans 15 minutes"
9. Le système vérifie le statut du compte (ACTIF)
10. **[Alt 4]** Si compte BLOQUE ou INACTIF: Erreur 403 "Compte désactivé par administrateur"
11. Le système génère JWT token (8h expiration, secretariatId, consultant_id, role = CONSULTANT)
12. Le système crée session en Redis avec IP et user-agent
13. Le système enregistre log audit: "LOGIN_SUCCESS_CONSULTANT" (timestamp, IP, user-agent)
14. Le système charge dashboard du Consultant
15. L'utilisateur est redirigé vers /dashboard

**Alternatives :**
- **Alt 1 - Format invalide**: Email ou champs non remplis → Erreur 400 "Veuillez remplir tous les champs"
- **Alt 2 - Compte inexistant**: Email n'existe pas → Erreur 401 "Email ou mot de passe incorrect" (message générique par sécurité)
- **Alt 3 - Mot de passe incorrect**: Mauvaise comparaison bcrypt → Incrémenter compteur, Erreur 401 (avec blogage après 5 tentatives)
- **Alt 3a - Compte bloqué**: >= 5 tentatives échouées → Erreur 429 "Trop de tentatives, ressayez dans 15 minutes"
- **Alt 4 - Compte désactivé**: Status = BLOQUE ou INACTIF → Erreur 403 "Compte désactivé par administrateur"
- **Alt 5 - Service indisponible**: Erreur base de données → Erreur 503 "Service d'authentification indisponible"
- **Alt 6 - Erreur chargement dashboard**: Données partiellement manquantes → Erreur 500 "Impossible charger dashboard"

**Postconditions :**
- Consultant authentifié avec JWT token valide
- Session créée en Redis avec IP et user-agent
- Audit log enregistré (LOGIN_SUCCESS_CONSULTANT)
- Accès au dashboard et toutes les fonctionnalités du secrétariat

---

### Catégorie 2 : Gestion des Clients

#### UC-03-10 : Gérer les clients (Consulter, Créer, Modifier)

**Acteur principal :** Consultant
**Acteurs secondaires :** Modèle, AuditLog
**Prérequis :** Consultant authentifié avec token JWT valide
**Déclencheur :** Consultant accède à "Mes Clients"

**Scénario nominal - Consultation :**
1. Le système récupère tous les clients du secrétariat (secretariatId du token)
2. Le système affiche tableau clients (nom, TVA, nb employés, date création, statut)
3. Le Consultant peut filtrer/rechercher par nom ou TVA
4. **[Alt 1]** Si BD indisponible: Erreur 500 "Impossible charger clients"

**Alternative A - Créer un client :**
1. Le Consultant clique "Ajouter Client"
2. Le système affiche formulaire (nom, TVA, IBAN, adresse, contact email)
3. Le Consultant remplit et clique "Créer"
4. Le système valide format TVA (Belgique standard) et IBAN (IBAN Belgique)
5. **[Alt A1]** Si format invalide: Erreur 400 "Format TVA/IBAN incorrect"
6. Le système vérifie TVA unique (pas doublon dans ce secretariat)
7. **[Alt A2]** Si TVA en doublon: Erreur 409 "Ce client existe déjà"
8. Le système crée client en transaction (nom, TVA, IBAN, secretariatId, consultant_id)
9. Le système INSERT log modification + INSERT log audit (CREATE_CLIENT)
10. Le Consultant reçoit confirmation "Client créé ✓"

**Alternative B - Modifier un client :**
1. Le Consultant clique sur client existant
2. Le système récupère données complètes du client
3. **[Alt B1]** Si client inexistant: Erreur 404 "Client inexistant"
4. Le système affiche fiche détails avec lien "Modifier"
5. Le Consultant clique "Modifier"
6. Le système affiche formulaire pré-rempli
7. Le Consultant modifie champs (nom, adresse, etc.) et clique "Sauvegarder"
8. Le système valide formats si TVA/IBAN modifiés
9. **[Alt B2]** Si format invalide: Erreur 400 "Format TVA/IBAN incorrect"
10. Le système UPDATE client en transaction (détecte concurrent modifications via version/timestamp)
11. **[Alt B3]** Si concurrent write détecté: Erreur 409 "Données modifiées par un autre consultant, rafraîchissez"
12. Le système INSERT log modification (champs modifiés, old/new values)
13. Le système INSERT log audit (UPDATE_CLIENT)
14. Le Consultant reçoit confirmation "Modifications sauvegardées ✓"

**Restrictions de modification :**
- ❌ Le Consultant NE PEUT PAS modifier: secretariatId, TVA (immutable une fois créée), consultant_id_creator
- ✅ Le Consultant PEUT modifier: Nom, IBAN, adresse, contact email

**Alternatives :**
- **Alt 1 - BD indisponible**: Erreur 500 "Impossible charger clients"
- **Alt A1 - Format invalide**: TVA ou IBAN mal formatés → Erreur 400 "Format TVA/IBAN incorrect"
- **Alt A2 - TVA en doublon**: TVA existe déjà → Erreur 409 "Ce client existe déjà"
- **Alt B1 - Client inexistant**: Client supprimé ou inexistant → Erreur 404 "Client inexistant"
- **Alt B2 - Format invalide (modification)**: TVA/IBAN mal formatés → Erreur 400 "Format TVA/IBAN incorrect"
- **Alt B3 - Concurrent write**: Autre consultant modifie simultanement → Erreur 409 "Données modifiées, ressayez"

**Postconditions :**
- Clients consultés, créés ou modifiés avec succès
- secretariatId immutable (isolation multi-tenant garantie)
- Tous les changements enregistrés en audit trail avec old/new values
- TVA immutable après création (business rule)

---

### Catégorie 3 : Gestion des Employés Clients

#### UC-03-20 : Gérer les employés clients (Consulter, Créer, Modifier, Désactiver)

**Acteur principal :** Consultant
**Acteurs secondaires :** Modèle, AuditLog
**Prérequis :** Consultant authentifié avec token JWT valide
**Déclencheur :** Consultant accède à "Employés du Client"

**Scénario nominal - Consultation :**
1. Le système récupère tous les employés du client (archived_at IS NULL, clientId + secretariatId)
2. Le système affiche tableau (nom, NISS, poste, salaire brut, date création)
3. Le Consultant peut filtrer/rechercher par nom ou NISS
4. **[Alt 1]** Si BD indisponible: Erreur 500 "Impossible charger employés"

**Alternative A - Créer un employé :**
1. Le Consultant clique "Ajouter Employé"
2. Le système affiche formulaire (nom, NISS, poste, salaire brut, type contrat, date embauche)
3. Le Consultant remplit et clique "Créer"
4. Le système valide format NISS (11 chiffres Belgique) et salaire > 0
5. **[Alt A1]** Si NISS invalide: Erreur 400 "Format NISS incorrect"
6. **[Alt A2]** Si salaire invalide: Erreur 400 "Salaire doit être > 0"
7. Le système vérifie NISS unique dans ce client
8. **[Alt A3]** Si NISS en doublon: Erreur 409 "Cet employé existe déjà"
9. Le système crée employé en transaction (NISS, client_id, secretariat_id, consultant_id)
10. Le système INSERT log modification + INSERT log audit (CREATE_EMPLOYEE)
11. Le Consultant reçoit confirmation "Employé créé ✓"

**Alternative B - Modifier un employé :**
1. Le Consultant clique sur employé existant
2. Le système récupère données complètes (NISS, salaire, contrat, historique)
3. **[Alt B1]** Si employé inexistant ou archivé: Erreur 404 "Employé inexistant"
4. Le Consultant clique "Modifier Salaire"
5. Le système affiche formulaire modification avec salaire actuel
6. Le Consultant change montant et clique "Sauvegarder"
7. Le système valide nouveau salaire > 0
8. **[Alt B2]** Si salaire invalide: Erreur 400 "Salaire invalide"
9. Le système UPDATE employé en transaction (detect concurrent modifications)
10. **[Alt B3]** Si concurrent write: Erreur 409 "Données modifiées, ressayez"
11. Le système INSERT log modification (ancien/nouveau salaire)
12. Le système INSERT log audit (UPDATE_EMPLOYEE)
13. Le Consultant reçoit confirmation "Modifications sauvegardées ✓"

**Alternative C - Désactiver/Réactiver employé :**
1. Le Consultant clique "Désactiver" ou "Réactiver" sur employé
2. Le système affiche modal confirmation avec avertissements
3. Le Consultant confirme
4. Le système UPDATE employé:
   - archived_at = NOW() (désactivation - soft delete)
   - OU archived_at = NULL (réactivation)
5. Le système INSERT log audit (ARCHIVE_EMPLOYEE ou RESTORE_EMPLOYEE)
6. Le Consultant reçoit confirmation "Employé désactivé/réactivé ✓"

**Restrictions de modification :**
- ❌ Le Consultant NE PEUT PAS modifier: NISS (immutable), clientId, secretariatId, consultant_id_creator
- ✅ Le Consultant PEUT modifier: Nom, poste, salaire, type contrat, adresse, contact

**Pattern Soft Delete :**
- Les employés archivés restent en base de données (RGPD compliant)
- Marqués avec `archived_at = NOW()`, excluded des requêtes par défaut
- Récupérables via "Réactiver" pendant 90 jours avant purge définitive
- Préservés dans audit trail pour conformité légale

**Alternatives :**
- **Alt 1 - BD indisponible**: Erreur 500 "Impossible charger employés"
- **Alt A1 - NISS invalide**: Format incorrect (< 11 chiffres) → Erreur 400 "Format NISS incorrect"
- **Alt A2 - Salaire invalide**: Négatif ou null → Erreur 400 "Salaire doit être > 0"
- **Alt A3 - NISS en doublon**: NISS existe déjà → Erreur 409 "Cet employé existe déjà"
- **Alt B1 - Employé inexistant**: Supprimé ou inexistant → Erreur 404 "Employé inexistant"
- **Alt B2 - Salaire invalide (modification)**: Négatif ou format invalide → Erreur 400 "Salaire invalide"
- **Alt B3 - Concurrent write**: Autre consultant modifie simultanement → Erreur 409 "Données modifiées, ressayez"

**Postconditions :**
- Employés consultés, créés ou modifiés avec succès
- NISS immutable (business rule, unicité garantie)
- Soft delete conserve audit trail (RGPD compliant)
- Tous les changements tracés avec old/new values
- Isolation multi-tenant garantie (secretariatId immutable)

---

### Catégorie 4 : Fiches de Paie (CORE BUSINESS)

#### UC-03-30 : Gérer les fiches de paie (Créer, Calculer, Archiver, Envoyer)

**Acteur principal :** Consultant
**Acteurs secondaires :** Modèle, PDF Generator, Email Service, AuditLog
**Prérequis :** Consultant authentifié, employé actif avec données complètes (NISS, salaire, contrat)
**Déclencheur :** Consultant accède à "Créer Fiche Paie"

**Scénario nominal (4 phases) :**

**Phase 1 - Préparation des données :**
1. Le Consultant accède à "Créer Fiche Paie"
2. Le système récupère données employé (salaire brut, horaires contrat, absences)
3. **[Alt 1]** Si employé inexistant ou archivé: Erreur 404 "Employé inexistant"
4. Le système affiche formulaire pré-rempli avec variables paie (heures, primes, indemnités, déductions)
5. Le Consultant encode variables paie et clique "Calculer"
6. Le système valide données entrees (heures > 0, montants positifs)
7. **[Alt 2]** Si données invalides: Erreur 400 "Données invalides, vérifiez vos entrées"

**Phase 2 - Calculs automatiques (CONFORMITÉ BELGIQUE) :**
1. Le système calcule automatiquement :
   - **Salaire brut** = base + heures_sup + primes + indemnités - déductions
   - **ONSS (13.07%)** = brut * 0.1307
   - **Précompte professionnel (progressif)**: Selon barème fiscal belgique par revenu
   - **Charges employeur (42%)** = brut * 0.42
   - **Net à payer** = brut - ONSS - précompte_professionnel
2. **[Alt 3]** Si erreur calcul: Erreur 500 "Erreur lors du calcul des rétentions"
3. Le système vérifie pas de fiche existante pour cette période (employee_id + year/month)
4. **[Alt 4]** Si fiche existe: Erreur 409 "Fiche déjà créée pour janvier 2024, modifiez la précédente"
5. Le système affiche résumé détaillé (brut, ONSS, précompte, net, charges employeur)

**Phase 3 - Génération PDF et archivage :**
1. Le Consultant clique "Générer PDF"
2. Le système génère PDF fiche de paie avec tous calculs
3. **[Alt 5]** Si erreur génération PDF: Erreur 500 "Impossible générer PDF, ressayez"
4. Le système crée fiche en transaction (employee_id, periode, brut, ONSS, précompte, net, charges, consultant_id, secretariat_id)
5. Le système INSERT log modification + INSERT log audit (CREATE_PAYSLIP)
6. Le système stocke PDF en storage sécurisé avec référence fiche_paie_id
7. Le Consultant reçoit confirmation "Fiche créée ✓"

**Phase 4 - Envoi email :**
1. Le Consultant clique "Envoyer par Email"
2. Le système vérifie emails présents (employé + client)
3. **[Alt 6]** Si emails manquants: Erreur 400 "Emails manquants, complétez les profils"
4. Le système génère lien sécurisé avec token temporaire (30 minutes) pour télécharger PDF
5. Le système envoie email au consultant avec PDF en pièce jointe + lien sécurisé
6. **[Alt 7]** Si service email indisponible: Erreur 503 "Email service indisponible, ressayez plus tard"
7. Le système UPDATE fiche statut = ENVOYEE
8. Le système INSERT log audit (SEND_PAYSLIP_EMAIL)
9. Le Consultant reçoit confirmation "Fiche envoyée par email ✓"

**Détails Calculs Belgique :**

| Élément | Formule | Exemple (brut 2500€) |
|---------|---------|-----|
| Salaire brut | Base + heures_sup + primes - déductions | 2500€ |
| ONSS salarié | Brut × 13.07% | 326.75€ |
| Précompte professionnel | Barème fiscal progressif | ~280€ (approx) |
| Charges employeur | Brut × 42% | 1050€ |
| Net à payer | Brut - ONSS - Précompte | 1893.25€ |

**Alternatives :**
- **Alt 1 - Employé inexistant**: Archivé ou introuvable → Erreur 404 "Employé inexistant"
- **Alt 2 - Données invalides**: Heures négatives ou format invalide → Erreur 400 "Données invalides"
- **Alt 3 - Erreur calcul**: Exception dans formule → Erreur 500 "Erreur lors du calcul"
- **Alt 4 - Fiche doublon**: Existe pour la même période → Erreur 409 "Fiche déjà créée pour cette période"
- **Alt 5 - Erreur PDF**: Echec génération → Erreur 500 "Impossible générer PDF, ressayez"
- **Alt 6 - Emails manquants**: Employé ou client email non configurchins → Erreur 400 "Emails manquants"
- **Alt 7 - Service email DOWN**: Service email indisponible → Erreur 503 "Email service indisponible"

**Protections critiques :**

**Protection 1 - Validation données complètes :**
- Consultant doit fournir heures/primes valides (> 0)
- Système vérifie pas de fiche dupliquée pour même période

**Protection 2 - Calculs conformité Belgique :**
- ONSS 13.07% appliqué automatiquement (non modifiable)
- Précompte professionnel selon barème fiscal officiel
- Charges employeur 42% appliquées

**Protection 3 - Sécurité archivage :**
- PDF stocké en storage sécurisé (pas accessible publiquement)
- Lien email avec token temporaire 30 minutes
- Fiche marquée ENVOYEE après envoi

**Postconditions :**
- Fiche de paie créée, calculée correctement, archivée sécurisée
- PDF généré et envoyé par email avec accès sécurisé (token 30min)
- Tous les calculs conformes Belgique (ONSS 13.07%, précompte fiscal, charges 42%)
- Audit logs enregistrés avec calculs détaillés
- Fiche marquée ENVOYEE et tracée

---

### Catégorie 5 : Conformité Belge

#### UC-03-40 : Gérer la conformité ONSS/DIMONA (Déclarer, Vérifier)

**Acteur principal :** Consultant
**Acteurs secondaires :** Modèle, ONSS API, AuditLog
**Prérequis :** Consultant authentifié, employé avec données complètes (NISS, date embauche)
**Déclencheur :** Consultant doit déclarer nouvel employé ou vérifier conformité

**Scénario nominal - Déclarer DIMONA (3 phases) :**

**Phase 1 - Préparation :**
1. Le Consultant accède à "Conformité ONSS"
2. Le système affiche tableau déclarations (statut: à jour, en retard, non faites)
3. Le Consultant clique "Déclarer Nouvel Employé"
4. Le système affiche sélecteur employés sans déclaration DIMONA
5. Le Consultant sélectionne employé et clique "Préparer DIMONA"
6. Le système vérifie données complètes (NISS, date embauche, salaire)
7. **[Alt 1]** Si données incomplètes: Erreur 400 "Complétez les données employé avant DIMONA"
8. Le système récupère infos employé complètes

**Phase 2 - Formatage et validation :**
1. Le système formate données pour API ONSS:
   - Validation somme de contrôle NISS
   - Format dates standard (YYYY-MM-DD)
   - Montants en 2 décimales
   - Création structure DIMONA JSON
2. **[Alt 2]** Si format invalide: Erreur 400 "Format données invalide, vérifiez"
3. Le système affiche résumé DIMONA (employé, NISS, date embauche, salaire)
4. Le Consultant clique "Envoyer à l'ONSS"

**Phase 3 - Envoi API ONSS :**
1. Le système envoie DIMONA via API ONSS (avec signature + token d'authentification)
2. Le système implémente retry logic (3 tentatives, backoff exponentiel: 1s, 2s, 4s)
3. **[Alt 3]** Si API ONSS indisponible après 3 tentatives: Erreur 503 "API ONSS indisponible, ressayez plus tard"
4. API ONSS traite et retourne réponse
5. **[Alt 4]** Si DIMONA rejetée (format ONSS invalide): Erreur 422 "DIMONA rejetée - [detail erreur]"
6. Si DIMONA acceptée: ONSS retourne numéro de dossier (ex: ABC123)
7. Le système enregistre confirmation:
   - UPDATE declaration_onss statut = ACCEPTE, numero_dossier = ABC123
   - INSERT log modification + INSERT log audit (SUBMIT_DIMONA)
8. Le Consultant reçoit confirmation "DIMONA envoyée - Numéro: ABC123 ✓"

**Scénario nominal - Vérifier Conformité :**
1. Le Consultant clique "Vérifier Conformité"
2. Le système récupère tous employés actifs + leurs déclarations ONSS
3. Le système analyse:
   - **Tous employés actifs ont DIMONA?** ✓/✗
   - **Pas de déclarations expirées (> 3 ans)?** ✓/✗
   - **Employés terminés ont certificat C4?** ✓/✗
4. Le système génère rapport conformité:
   - % conformité global (ex: 95%)
   - Liste non-conformités détectées
   - Alertes critiques (rouge: employé pas déclaré)
   - Recommandations (jaune: attention, bleu: info)
5. Le Consultant reçoit rapport avec code couleur (vert=OK, jaune=attention, rouge=critique)

**Alternatives :**
- **Alt 1 - Données incomplètes**: NISS ou date embauche manquants → Erreur 400 "Complétez les données avant DIMONA"
- **Alt 2 - Format invalide**: Somme contrôle NISS fausse, format invalide → Erreur 400 "Format données invalide"
- **Alt 3 - API ONSS DOWN**: 3 tentatives échouées → Erreur 503 "API ONSS indisponible, ressayez plus tard"
- **Alt 4 - DIMONA rejetée**: API ONSS refuse pour raison métier → Erreur 422 "DIMONA rejetée - [détail]"
- **Alt 5 - Employé inexistant**: Archivé ou supprimé → Erreur 404 "Employé inexistant"
- **Alt 6 - Doublon DIMONA**: Déclaration existe pour cet employé → Erreur 409 "Déclaration déjà effectuée"

**Protections critiques :**

**Protection 1 - Validation complétude données :**
- NISS, date embauche, salaire obligatoires avant API call
- Somme contrôle NISS vérifiée

**Protection 2 - Retry logic ONSS :**
- 3 tentatives avec backoff exponentiel (1s, 2s, 4s)
- Transient failures gérées automatiquement
- Erreurs permanentes rejetées avec détail

**Protection 3 - Traçabilité DIMONA :**
- Numéro dossier ONSS enregistré immédiatement
- Logs audit avec statut ACCEPTE/REJETE
- Changements de statut tracés

**Postconditions :**
- DIMONA déclarées et confirmées auprès ONSS
- Numéros de dossier enregistrés pour suivi
- Conformité vérifiable et rapportable
- Audit logs complets (déclaration, statut, numéro dossier)
- Certificats C4 disponibles pour employés terminés

---

### Catégorie 6 : Calendrier & Alertes

#### UC-03-50 : Gérer calendrier et alertes (Consulter, Créer, Modifier)

**Acteur principal :** Consultant / Système (automatisé pour notifications)
**Acteurs secondaires :** Modèle, Notification Service, AuditLog
**Prérequis :** Consultant authentifié
**Déclencheur :** Consultant accède à "Calendrier" OU système crée alertes automatiques

**Scénario nominal - Consulter Calendrier :**
1. Le système récupère événements importants du secrétariat (ONSS deadlines, paies, fiches)
2. Le système affiche calendrier avec événements colorés :
   - **Rouge** = Urgent (deadline < 7 jours)
   - **Jaune** = Attention (deadline dans 7-14 jours)
   - **Bleu** = Information (deadline > 14 jours)
3. Le Consultant peut filtrer par type d'événement
4. Le Consultant visualise dates limites ONSS, paies prévues, tâches

**Alternative A - Créer une alerte :**
1. Le Consultant clique "Créer Alerte"
2. Le système affiche formulaire (type alerte, date cible, délai rappel en jours)
3. Le Consultant crée alerte : "Paie mensuelle 25 mars" avec rappel 3 jours avant
4. Le système valide paramètres (date valide, délai > 0, type dans enum)
5. **[Alt A1]** Si paramètres invalides: Erreur 400 "Paramètres invalides"
6. Le système crée alerte en transaction (consultant_id, type, date_cible, delai_rappel, secretariat_id)
7. Le système INSERT log modification + INSERT log audit (CREATE_ALERT)
8. Le système configure notification auprès du service (envoie email délai_rappel jours avant)
9. **[Alt A2]** Si service notifications DOWN: Alerte créée mais notification non programmée, Avertissement affiché
10. Le Consultant reçoit confirmation "Alerte créée ✓"

**Alternative B - Modifier une alerte :**
1. Le Consultant clique sur alerte existante
2. Le système récupère détails (type, date, délai, statut)
3. **[Alt B1]** Si alerte inexistante: Erreur 404 "Alerte inexistante"
4. Le Consultant clique "Modifier"
5. Le système affiche formulaire pré-rempli
6. Le Consultant change délai de 3 à 5 jours et clique "Sauvegarder"
7. Le système valide modifications (date valide, délai > 0)
8. Le système UPDATE alerte en transaction (détecte concurrent modifications)
9. **[Alt B2]** Si concurrent write: Erreur 409 "Données modifiées, ressayez"
10. Le système INSERT log modification (ancien/nouveau délai)
11. Le système INSERT log audit (UPDATE_ALERT)
12. Le système reconfigure notification (délai_rappel = 5 jours maintenant)
13. Le Consultant reçoit confirmation "Modifications sauvegardées ✓"

**Scénario nominal - Consulter Mes Alertes :**
1. Le Consultant clique "Mes Alertes"
2. Le système récupère alertes prochaines 30 jours (consultant_id, date >= NOW(), date <= NOW() + 30 jours)
3. Le système affiche liste triée chronologiquement avec statuts :
   - **Pas déclenchée** : Alerte future
   - **Déclenchée** : Notification envoyée, en attente action
   - **Complétée** : Tâche marquée comme faite
4. Le Consultant peut cliquer alerte pour détails ou marquer comme complétée

**Alternatives :**
- **Alt 1 - BD indisponible**: Erreur 500 "Impossible charger calendrier"
- **Alt A1 - Paramètres invalides**: Délai <= 0 ou date invalide → Erreur 400 "Paramètres invalides"
- **Alt A2 - Service notifications DOWN**: Notification Service indisponible → Alerte créée, Avertissement "Notification non programmée"
- **Alt B1 - Alerte inexistante**: Supprimée ou introuvable → Erreur 404 "Alerte inexistante"
- **Alt B2 - Concurrent write**: Autre consultant modifie simultanement → Erreur 409 "Données modifiées, ressayez"

**Postconditions :**
- Calendrier consulté avec tous événements et alertes
- Alertes créées/modifiées avec succès
- Notifications programmées et envoyées automatiquement
- Consultant informé des échéances critiques 7 jours avant
- Audit logs enregistrés avec tous détails alertes

---

### Catégorie 7 : Tableau de Bord

#### UC-03-60 : Consulter dashboard (Accueil)

**Acteur principal :** Consultant
**Acteurs secondaires :** Modèle, Controleur, AuditLog
**Prérequis :** Consultant authentifié, au moins un client/employé présent
**Déclencheur :** Consultant se connecte ou clique sur "Dashboard"

**Scénario nominal (4 phases) :**

**Phase 1 - Chargement parallèle des données :**
1. Le système charge en parallèle :
   - Statistiques : nb clients, nb employés, nb fiches ce mois
   - Fiches en cours : statut brouillon, en cours
   - Alertes actives : triées par urgence
   - Tâches prioritaires : DIMONA à faire, C4 à générer, fiches en retard
2. **[Alt 1]** Si BD indisponible: Affiche message "Impossible charger dashboard", données partielles
3. **[Alt 2]** Si performance lente (> 5sec): Affiche spinner, puis données progressivement

**Phase 2 - Calcul KPIs personnalisés :**
1. Le système calcule KPIs du Consultant :
   - **Fiches créées ce mois** : COUNT(fiches WHERE consultant_id AND created_at >= START_OF_MONTH)
   - **Taux conformité** : (employees_declared_ONSS / total_active_employees) * 100
   - **Total charges sociales ce mois** : SUM(charges_employeur) for all payslips
   - **Paies en retard** : COUNT(payslips WHERE status != ENVOYEE AND created_at < DATE_SUB(NOW(), 5 DAYS))
2. Le système vérifie seuils alertes :
   - Conformité < 80% → Alerte ROUGE
   - Fiches en retard > 3j → Alerte ORANGE
   - Deadlines ONSS < 7j → Alerte JAUNE
3. **[Alt 3]** Si erreur calcul KPIs: Affiche KPIs partielles, Avertissement "Certains KPIs indisponibles"

**Phase 3 - Affichage Dashboard :**
1. Le système affiche dashboard complet avec :
   - Widgets statistiques (clients, fiches, conformité, alertes)
   - KPIs calculés avec tendances (↑ ↓ →)
   - Alertes colorées (rouge/orange/jaune)
   - Liens rapides (créer client, créer fiche, déclarer DIMONA)
2. Le Consultant peut cliquer widget "Fiches à traiter" pour voir détails
3. Le système affiche liste fiches incomplètes avec priorités
4. Le Consultant peut consulter "Mes Clients" avec mini-stats (nb employés, nb fiches, conformité)
5. **[Alt 4]** Si aucun client: Vue affiche message "Aucun client, créez-en un pour démarrer" + bouton "Créer client"
6. **[Alt 5]** Si aucune fiche ce mois: Widget affiche "0 fiches ce mois"

**Phase 4 - Rafraîchissement :**
1. Le Consultant peut cliquer "Rafraîchir" dashboard
2. Le système recharge toutes données à jour
3. Le système recalcule KPIs avec chiffres actuels
4. Vue affiche dashboard mis à jour

**KPIs Détaillés :**

| KPI | Formule | Seuil Alerte |
|-----|---------|-------------|
| Fiches créées ce mois | COUNT(payslips WHERE consultant_id, mois courant) | Info (jaune si < 5) |
| Taux conformité | (employees_declared / total_active) * 100 | < 80% = ROUGE |
| Charges sociales ce mois | SUM(charges_employeur) | Info |
| Paies en retard | COUNT(payslips NOT sent, age > 5 days) | > 0 = ORANGE |
| Prochains DIMONA | Deadlines ONSS non déclarés | < 7 jours = JAUNE |

**Alternatives :**
- **Alt 1 - BD indisponible**: Certains appels échouent → Affiche message "Impossible charger dashboard", données partielles OK
- **Alt 2 - Performance lente**: > 5 secondes → Affiche spinner, données chargent progressivement
- **Alt 3 - Erreur calcul KPIs**: Exception dans agrégation → Affiche KPIs partielles, Avertissement
- **Alt 4 - Aucun client**: Modèle retourne empty list → Vue affiche "Aucun client, créez-en un"
- **Alt 5 - Aucune fiche ce mois**: Modèle retourne empty list → Widget affiche "0 fiches ce mois"

**Postconditions :**
- Dashboard affiché avec données actualisées
- Stats en temps réel (délai < 5 secondes acceptable)
- Alertes visibles avec code couleur (rouge/orange/jaune)
- KPIs calculés correctement avec formules métier
- Navigation fluide vers actions (créer client, fiche, déclarer DIMONA)
- Audit logs enregistrés (vue dashboard consultée)

---

## ⚡ **POINTS CLÉS IMPORTANTS**

### Isolation Multi-Tenant Stricte
- **Chaque Consultant** accède uniquement aux données de **son secrétariat** (`secretariatId` dans JWT)
- **JWT token** contient : `consultant_id`, `secretariatId`, `role = CONSULTANT`, expiration 8 heures
- **Toutes les requêtes** filtrées par `secretariatId` du token (jamais de paramètre utilisateur)
- **Aucune donnée inter-secretariat** accessible, même en erreur (messages génériques)
- **Vérifications d'autorisation** effectuées à chaque opération CRUD

### Traçabilité Audit Complète
- **Tous les changements** enregistrés :
  - Qui : `consultant_id`
  - Quoi : Opération (CREATE_CLIENT, UPDATE_EMPLOYEE, SUBMIT_DIMONA, etc.)
  - Quand : `timestamp` précis
  - Avant/Après : `old_value` et `new_value` pour modifications
  - Contexte : `secretariatId`, `clientId`, `employeeId`, etc.
- **Logs persistes** en BD long-terme pour conformité RGPD (3 ans)
- **Events loggues** en temps réel pour monitoring opérationnel

### Pattern Soft Delete (RGPD Compliant)
- **Les employés archivés ne sont jamais supprimés physiquement**
- **Marqués avec `archived_at = NOW()`** timestamp pour traçabilité
- **Exclu des requêtes par défaut** (filtre `archived_at IS NULL`) mais reste en audit trail
- **Récupérables pendant 90 jours** avant purge définitive (maintenance job)
- **Conforme RGPD** : données conservées, marquées, inaccessibles

### Sécurité Authentification Consultant
- **Token JWT 8 heures d'expiration** avec refresh automatique
- **sessionId stocké en Redis** avec IP et user-agent verification
- **Logout révoque immédiatement** la session (pas juste le JWT, DELETE FROM session)
- **Tentatives login échouées tracées** :
  - Max 5 tentatives avant blocage
  - Blocage 15 minutes en cache
  - Chaque tentative loggée en audit

### Conformité Belgique (Fiches Paie)
- **Calculs automatiques, non modifiables** :
  - ONSS : 13.07% du brut (salarié)
  - Précompte professionnel : barème fiscal progressif
  - Charges employeur : 42% du brut
  - Net à payer : brut - ONSS - précompte
- **DIMONA soumises à API ONSS** :
  - Signature et validation somme de contrôle
  - Retry logic (3 tentatives, backoff 1s/2s/4s)
  - Numéro dossier enregistré pour suivi
- **Certificats C4** disponibles pour employés terminés
- **PDF fiche stocké sécurisé**, accès via lien token 30 minutes

### Conformité Belgique (DIMONA/ONSS)
- **Validation complètude données** avant API call (NISS, date embauche, salaire)
- **Format DIMONA conforme ONSS** (somme contrôle, dates, montants)
- **Traçabilité DIMONA** : numéro dossier, statut ACCEPTE/REJETE, logs d'erreur
- **Vérification conformité globale** : tous employés actifs déclarés ?

### Gestion Clients & Employés
- **TVA immutable** une fois créée (business rule : unicité garantie)
- **NISS immutable** une fois créé (numéro registre national)
- **secretariatId & clientId immutables** (sécurité multi-tenant)
- **Soft delete pour employés** (archived_at, pas suppression physique)
- **Validation format** : TVA Belgique, NISS 11 chiffres, IBAN Belgique

### Gestion Alertes
- **Alertes créables et modifiables** par le Consultant
- **Notifications programmées** : email à délai_rappel jours avant
- **Code couleur** : Rouge (urgent < 7j), Jaune (attention 7-14j), Bleu (info > 14j)
- **Fallback** : alerte créée même si notification service DOWN

### Dashboard KPIs
- **KPIs personnalisés au Consultant** :
  - Fiches créées ce mois
  - Taux conformité (% employés déclarés / total)
  - Charges sociales ce mois
  - Paies en retard
- **Seuils d'alerte** :
  - Conformité < 80% : Alerte ROUGE
  - Fiches en retard > 3 jours : Alerte ORANGE
  - Deadlines ONSS < 7 jours : Alerte JAUNE
- **Affichage progressif** : stats d'abord, KPIs après (performance)

---

### Catégorie 8 : Intégration Comptable

#### UC-03-70 : Synchroniser avec Exact Online (OAuth2, Sync, Export)

**Acteur principal :** Consultant
**Acteurs secondaires :** Modèle, Exact Online API, OAuthToken Manager, ExactOnlineSync Service, AuditLog
**Prérequis :** Consultant authentifié, secrétariat sans connexion Exact Online existante
**Déclencheur :** Consultant clique "Connecter Exact Online" dans paramètres

**Scénario nominal (4 phases) :**

**Phase 1 - Initiation OAuth2 :**
1. Le Consultant accède à "Paramètres" → "Intégrations Comptables"
2. Le système affiche bouton "Connecter Exact Online"
3. Le Consultant clique "Autoriser Exact Online"
4. Le système génère URL OAuth2 avec :
   - `client_id` WorkZen (enregistré chez Exact)
   - `redirect_uri` = https://api.workzen.be/callback/exact-online
   - `scope` = companies, payroll, invoices, general_ledger
5. **[Alt 1]** Si URL generation échoue: Erreur 500 "Impossible générer lien, ressayez"
6. Le système redirige le Consultant vers page login Exact Online (popup ou new tab)

**Phase 2 - Authentification & Consentement :**
1. Le Consultant se connecte à son compte Exact Online (ou scanne 2FA)
2. Exact Online affiche écran permissions : "WorkZen demande accès à :"
   - Companies et clients
   - Fiches paie et payrolls
   - Écritures comptables
   - Factures et documents
3. Le Consultant clique "Autoriser"
4. **[Alt 2]** Si Consultant refuse: Exact Online redirige vers error page, session cancellée
5. Exact Online redirige callback URL avec `authorization_code`

**Phase 3 - Token Exchange :**
1. Le système reçoit callback avec `code` + `state`
2. Le système valide `state` pour sécurité CSRF (match session state)
3. **[Alt 3]** Si state invalide: Erreur 403 "Authentification compromise, ressayez"
4. Le système échange `code` pour tokens :
   - POST https://api.exactonline.com/oauth2/token
   - Body: client_id, client_secret, code, redirect_uri
5. **[Alt 4]** Si API Exact indisponible: Erreur 503 "API Exact Online indisponible, ressayez"
6. Exact Online retourne `access_token`, `refresh_token`, `expires_in` (3600s)
7. Le système stocke OAuthToken en BD :
   - `accessToken` = token d'accès
   - `refreshToken` = refresh_token (pour renouvellement après expiration)
   - `expiresAt` = NOW() + 3600 secondes
   - `secretariat_id` = du consultant
   - `provider` = "EXACT_ONLINE"
8. **[Alt 5]** Si BD indisponible: Erreur 500 "Impossible sauvegarder tokens"
9. Le système lance première sync FULL (voir Phase 4)

**Phase 4 - Synchronisation Initiale (FULL) :**
1. Le système démarre ExactOnlineSync service
2. Le système récupère liste clients depuis Exact Online :
   - GET https://api.exactonline.com/api/v1/companies
   - Authorization: Bearer {accessToken}
3. **[Alt 6]** Si Exact API DOWN: Erreur 503 "Sync échouée, ressayez plus tard"
4. Le système compare clients Exact vs clients WorkZen (par TVA, unicité per secretariat) :
   - **Nouveau client en Exact** : CRÉE dans WorkZen (sync bidirectionnelle)
   - **Client existe dans WorkZen** : UPDATE si données différentes
   - **Client en WorkZen absent d'Exact** : Pas touché (permet PULL seul si souhaité)
5. Pour chaque client synced :
   - Récupère payrolls/salaries depuis Exact
   - Compare avec fiches paie WorkZen
   - Marque comme synced avec timestamp
6. Le système INSERT ExactOnlineSync record :
   - `dateLastSync` = NOW()
   - `statutSync` = "SUCCESS"
   - `companiesSynced` = nombre clients synced
   - `payrollsSynced` = nombre fiches synced
7. Le système enregistre log audit: "Sync Exact Online complétée - [X clients, Y payrolls]"
8. **[Alt 7]** Si erreur partielle (ex: 1 client rejete): Status PARTIAL_SUCCESS, détail erreurs enregistré
9. Le Consultant reçoit notification : "✓ Exact Online connecté! [X clients, Y payrolls synced]"

**Scénario nominal - Sync Bidirectionnelle (Planifiée) :**
1. Le système configure sync quotidienne 02:00 AM (via BullMQ)
2. Tous les jours à 02:00, le système :
   - Récupère les tokens valides pour tous les secrétariats
   - **[Avant] Si token expiré** : Appelle refresh_token endpoint automatiquement
   - Récupère incremental changes depuis Exact (MODIFIED_AT > lastSync)
   - **[Export]** : Envoie fiches paie WorkZen créées ce jour vers Exact comme écritures comptables
   - Marque sync comme complétée
3. **[Alt 8]** Si refresh_token échoue: Marque account comme "Auth_EXPIRED", notifie Consultant

**Alternative A - Déconnecter Exact Online :**
1. Le Consultant clique "Déconnecter Exact Online"
2. Le système affiche modal confirmation "Êtes-vous sûr? Les données resteront synchronisées."
3. Le Consultant confirme
4. Le système :
   - Révoque token auprès d'Exact Online API
   - DELETE OAuthToken de BD
   - Marque ExactOnlineSync.status = "DISCONNECTED"
   - INSERT log audit: "Exact Online disconnected"
5. Le Consultant reçoit confirmation "Exact Online déconnecté ✓"

**Alternative B - Sync Manuelle :**
1. Le Consultant clique "Forcer Sync Maintenant"
2. Le système affiche spinner avec "Synchronisation en cours..."
3. Le système lance sync FULL (comme Phase 4)
4. Après completion, affiche résumé "X clients, Y payrolls synced"
5. Le Consultant peut télécharger rapport sync (PDF) avec détails changements

**Détails Techniques - Refresh Token :**
```
Si token expiré lors de sync plannifiée:
1. Système détecte token.expiresAt < NOW()
2. POST https://api.exactonline.com/oauth2/token
   - client_id, client_secret, refresh_token, grant_type="refresh_token"
3. Exact retourne nouveau access_token + refresh_token
4. UPDATE OAuthToken avec nouveaux values
5. Retry opération initiale
6. [Alt 8] Si refresh échoue: Marque comme "Auth_EXPIRED", notifie consultant
```

**Détails Techniques - Export Écritures Comptables :**
```
Après chaque fiche paie créée:
- Si OAuthToken valide (access_token not expired) :
  - Construit écriture comptable (salaire brut, ONSS, précompte, net)
  - POST vers Exact Online General Ledger API
  - Références : client_id, employee_name, period, amounts
  - Statut : "DRAFT" (consultant valide manuellement en Exact si needed)
- Si OAuthToken invalide/absent :
  - Enqueue pour retry automatique après token refresh
```

**Protections Critiques :**

**Protection 1 - Sécurité OAuth :**
- `state` parameter vérifié pour CSRF prevention
- `code` valide une seule fois (prevents replay attacks)
- Tokens stockés chiffrés en BD (never logged)
- `client_secret` jamais exposé client-side

**Protection 2 - Sync Idempotence :**
- Clients matchés par TVA (unique per secretariat)
- Sync timestamps permettent incremental updates
- Pas de doublons même si sync relancée

**Protection 3 - Token Refresh Automatique :**
- Refresh automatique avant expiration (30 min avant)
- Fallback : marque comme "Auth_EXPIRED", notifie user
- Pas de retry infini (max 3 tentatives)

**Protection 4 - Audit & Traçabilité :**
- Tous tokens interactions loggées (connexion, refresh, expiration)
- Sync logs détaillés (clients créés, modifiés, erreurs)
- Export écritures tracées avec références paies

**Alternatives :**
- **Alt 1 - URL generation échoue**: Configuration Exact incomplète → Erreur 500 "Impossible générer lien"
- **Alt 2 - Consultant refuse auth**: Annulation → Redirect error page, aucune donnée partagée
- **Alt 3 - State invalide**: Tentative CSRF ou session expired → Erreur 403 "Authentification compromise"
- **Alt 4 - API Exact DOWN**: Service indisponible → Erreur 503 "API Exact indisponible, ressayez"
- **Alt 5 - BD DOWN**: Impossible sauvegarder tokens → Erreur 500 "Sauvegarder tokens échoué"
- **Alt 6 - Exact API DOWN pendant sync**: Retry automatique 3x → Erreur 503 si toutes échouent
- **Alt 7 - Sync partielle**: Certains clients rejetés → Status PARTIAL_SUCCESS, détails listés
- **Alt 8 - Refresh token échoue**: Token expiré, user doit reconnecter → Status Auth_EXPIRED

**Postconditions :**
- OAuthToken stocké en BD avec accès_token valide
- Sync initiale complétée (clients créés/updated)
- Sync planifiée (02:00 AM quotidien) configurée
- Export écritures automatique pour nouvelles fiches paie
- Audit logs complets de toutes opérations
- Consultant recevra notifications sync automatiques
- Déconnexion possible à tout moment

---

### Catégorie 8 : Messagerie et Support

#### UC-03-75 : Messagerie client et support

**Acteur principal :** Consultant
**Acteurs secondaires :** Client, Email Service, Notification Service, AuditLog
**Prérequis :** Consultant authentifié
**Déclencheur :** Consultant accède à "Messagerie" (/dashboard/messages)

**Scénario nominal :**

**Phase 1 - Accès à la messagerie:**
1. Le Consultant accède à /dashboard/messages
2. Le système affiche la liste des conversations (triées par date)
3. Le système affiche pour chaque conversation:
   - Client associé (nom entreprise)
   - Dernier message (preview texte)
   - Date dernier message
   - Badge "Non lus" si applicable
   - Nombre de messages

**Phase 2 - Ouvrir une conversation:**
1. Le Consultant clique sur une conversation
2. Le système affiche le thread complet (ordre chronologique)
3. Pour chaque message:
   - Auteur (Consultant ou Client)
   - Timestamp
   - Contenu texte
   - Attachements (s'il y a)
   - Statut lecture (lus/non lus)

**Phase 3 - Envoyer un message:**
1. Le Consultant saisit son message dans le champ texte
2. Le Consultant peut attacher des documents (max 10MB, formats: PDF, DOC, XLS, JPG, PNG)
3. Le Consultant clique "Envoyer"
4. Le système valide le message (non vide)
5. Le système crée le message en BD
6. Le système envoie notification au Client par email
7. Le Client reçoit: "Nouveau message de [Consultant]: [Preview message]"
8. Le Consultant voit message immédiatement dans le thread

**Alternative A - Créer nouvelle conversation:**
1. Le Consultant clique "Nouvelle conversation"
2. Le système affiche formulaire:
   - Client (dropdown de ses clients)
   - Sujet
   - Message initial
3. Le Consultant remplit et clique "Créer"
4. Le système crée la conversation et le premier message
5. Le Client reçoit notification

**Alternative B - Archiver conversation:**
1. Le Consultant clique "Archiver"
2. Le système marque la conversation archived=true
3. N'apparaît plus dans la liste active (accessible via "Voir archivées")

**Alternative C - Rechercher messages:**
1. Le Consultant saisit terme dans search
2. Le système cherche dans:
   - Contenu messages
   - Sujets conversations
   - Noms clients
3. Résultats affichés instantanément

**Protections :**
- ✅ Consultant voit UNIQUEMENT ses conversations
- ✅ Messages immuables (pas de modification/suppression)
- ✅ Attachements scannés antivirus avant stockage
- ✅ Notifications email avec lien temporaire (24h)

**Postconditions :**
- Messages stockés et consultables
- Client notifié par email
- Conversation archivable
- Traçabilité complète en audit

---

### Catégorie 9 : Gestion Documents et Modèles

#### UC-03-80 : Gérer modèles de documents

**Acteur principal :** Consultant (ou AdminSecretariat pour créer templates du secrétariat)
**Acteurs secondaires :** AdminSecretariat, Modèle, AuditLog
**Prérequis :** Consultant authentifié
**Déclencheur :** Consultant accède à "Modèles Documents" (/dashboard/templates)

**Scénario nominal :**

**Phase 1 - Consultation des templates:**
1. Le Consultant accède à /dashboard/templates
2. Le système affiche la bibliothèque de templates du secrétariat:
   - Templates globaux (créés par AdminSecretariat)
   - Templates consultants personnels (créés par ce consultant)
3. Pour chaque template:
   - Nom, catégorie, date création, créateur
   - Preview (première 100 caractères)
   - Nombre d'utilisation

**Phase 2 - Utiliser un template:**
1. Le Consultant sélectionne un template pour un employé
2. Le système affiche prévisualisation avec variables
3. Le Consultant peut saisir les variables:
   - {{employee_name}}, {{salary}}, {{start_date}}, {{position}}, etc.
4. Le système génère document avec remplissage variables
5. Le Consultant peut télécharger ou envoyer au client par email

**Alternative A - Créer un template personnel:**
1. Le Consultant clique "Créer template"
2. Saisit:
   - Nom du template
   - Catégorie (Contrat, Lettre, Document, Déclaration)
   - Contenu (rich text editor)
   - Ajoute variables via boutons {{var}}
3. Le Consultant clique "Enregistrer"
4. Template devient accessible pour ce consultant

**Alternative B - Utiliser template du secrétariat:**
1. AdminSecretariat crée templates globaux (UC-02-30)
2. Tous les consultants du secrétariat accèdent à ces templates
3. Templates du secrétariat ne peuvent PAS être modifiés par consultants
4. Les consultants peuvent créer versions personnelles (dupliquer)

**Alternative C - Dupliquer un template:**
1. Le Consultant clique "Dupliquer"
2. Crée copie avec suffix " (Ma copie)"
3. Copie devient template personnel modifiable

**Protections :**
- ✅ Templates du secrétariat: Lecture seule pour consultants
- ✅ Templates personnels: Modifiables par leur créateur
- ✅ Variables disponibles listées (autocomplete)
- ✅ Pas d'accès cross-secretariat aux templates

**Postconditions :**
- Document généré avec variables remplacées
- Template accessible pour future utilisation
- Historique utilisation enregistré

---

### Catégorie 10 : Data Management

#### UC-03-85 : Exporter/Importer données clients

**Acteur principal :** Consultant
**Acteurs secondaires :** Data Export Service, Storage Service, Validation Engine, AuditLog
**Prérequis :** Consultant authentifié
**Déclencheur :** Consultant accède à "Import/Export" (/dashboard/data-management)

**Scénario nominal - Export:**

**Phase 1 - Sélection et configuration:**
1. Le Consultant accède à /dashboard/data-management
2. Clique "Exporter données"
3. Sélectionne scope:
   - **Clients**: Tous ou sélection (multi-select)
   - **Employés**: Inclure oui/non
   - **Fiches paie**: Inclure oui/non
   - **Historique**: Période (derniers 3 mois, 6 mois, 1 an, tout)
4. Sélectionne format:
   - **Excel**: .xlsx avec onglets (Clients, Employés, Fiches, Déclarations)
   - **CSV**: Format tabulaire (facilité import autre système)
   - **JSON**: Format structuré (API, automatisation)

**Phase 2 - Génération:**
1. Le système crée export asynchrone (BullMQ job)
2. Formate données avec:
   - En-têtes explicites (TVA, Nom Client, Email, etc.)
   - Validation cohérence (montants, NISS format)
   - Masquage sensibilité (NISS partialisé: XX.XX.02.****)
3. Chiffre l'archive (AES-256) optionnellement
4. Stocke temporairement en S3 (expiration 7 jours)

**Phase 3 - Téléchargement:**
1. Le Consultant reçoit notification: "Export prêt"
2. Clique pour télécharger fichier (.xlsx, .csv, ou .json)
3. Fichier supprimé du serveur après téléchargement
4. Audit log: "DATA_EXPORTED" (scope, format, timestamp)

**Alternative A - Import données:**
1. Le Consultant clique "Importer données"
2. Upload fichier (Excel .xlsx, CSV .csv, JSON .json)
3. **[Alt A1]** Si format invalide: Erreur "Format non supporté. Utilisez Excel/CSV/JSON"
4. Le système valide:
   - Structure fichier (colonnes attendues)
   - Format données (emails, TVA, NISS)
   - Doublons (TVA client existant?)
5. **[Alt A2]** Si validation échoue: Affiche erreurs ligne par ligne
6. Saisit mapping colonnes (si format custom)
7. Clique "Importer"

**Phase 4 - Traitement import:**
1. Le système lance import asynchrone
2. Pour chaque ligne:
   - Valide données
   - **[Alt A3]** Si données invalides: Enregistre erreur, passe à la suivante
   - Crée ou met à jour client/employé
   - Enregistre changements en audit
3. Après completion, affiche résumé:
   - "X clients créés, Y mis à jour, Z erreurs"
   - Génère rapport erreurs (PDF/CSV)
   - Email au Consultant avec résumé

**Alternative B - Migration par batch:**
1. Le Consultant importe 500+ employés (ex: depuis ancien système)
2. Upload fichier volumineux (.xlsx 10MB+)
3. Le système:
   - Découpe en chunks (100 lignes/chunk)
   - Lance jobs parallèles (BullMQ avec concurrence 5)
   - Progress bar en temps réel
   - Pause/Resume possible
4. Après completion: Email avec statistiques

**Protections :**
- ✅ Validation stricte avant import (no garbage data)
- ✅ Chiffrement optionnel (AES-256)
- ✅ Audit trail complet (qui exporte/importe quoi quand)
- ✅ Pas de doublons (TVA checking)
- ✅ Données sensibles masquées en export (NISS)
- ✅ Rollback possible si erreurs détectées
- ✅ Isolation par secrétariat (impossible exporter autre secrétariat)

**Restrictions :**
- ❌ Consultant NE PEUT PAS exporter clients d'autres consultants
- ✅ AdminSecretariat PEUT exporter tous ses clients (gestion globale)

**Alternatives (erreurs):**
- **Alt A1 - Format invalide**: .doc, .txt, etc. → Erreur "Format non supporté"
- **Alt A2 - Validation échoue**: Affiche tableau erreurs avec ligne/colonne/raison
- **Alt A3 - Ligne invalide**: Enregistre skip, continue import resto
- **Alt B - Import volumineux échoue**: BullMQ retry 3x, si toujours fail → rapport erreur

**Postconditions :**
- Données exportées en format choisi
- Données importées et validées
- Audit logs complets
- Rapport disponible pour consultation

---

## Synthèse des Cas d'Utilisation

| UC ID | Nom | Acteurs Secondaires | Priorité | Complexité |
|-------|-----|----------|----------|-----------|
| UC-03-00 | Se connecter | Better Auth, Email Service, AuditLog | Critique | Moyenne |
| UC-03-10 | Gérer les clients (Consulter, Créer, Modifier) | Modèle, AuditLog | Critique | Moyenne |
| UC-03-20 | Gérer les employés clients (Consulter, Créer, Modifier, Désactiver) | Modèle, AuditLog | Critique | Moyenne |
| UC-03-30 | Gérer les fiches de paie (Créer, Calculer, Archiver, Envoyer) | Modèle, PDF Generator, Email Service, AuditLog | Critique | Élevée |
| UC-03-40 | Gérer la conformité ONSS/DIMONA (Déclarer, Vérifier) | Modèle, ONSS API, AuditLog | Critique | Élevée |
| UC-03-50 | Gérer calendrier et alertes (Consulter, Créer, Modifier) | Modèle, Notification Service, AuditLog | Moyenne | Basse |
| UC-03-60 | Consulter dashboard (Accueil) | Modèle, Controleur, AuditLog | Moyenne | Élevée |
| UC-03-70 | Synchroniser avec Exact Online (OAuth2, Sync, Export) | Modèle, Exact Online API, OAuthToken Manager, ExactOnlineSync Service, AuditLog | Critique | Élevée |
| UC-03-75 | Messagerie client et support (Chat, Attachements, Notifications) | Client, Email Service, Notification Service, AuditLog | Moyenne | Moyenne |
| UC-03-80 | Gérer modèles de documents (CRUD, Variables, Fusion) | AdminSecretariat, Modèle, AuditLog | Moyenne | Moyenne |
| UC-03-85 | Exporter/Importer données clients (Excel, CSV, JSON) | Data Export Service, Storage Service, Validation Engine, AuditLog | Moyenne | Moyenne |

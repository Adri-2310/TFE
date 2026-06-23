## Cas d'Utilisation Client

> **Note importante sur le rôle Client :**
> Le rôle Client représente l'**employeur/entreprise** qui utilise les services du secrétariat social. Un représentant de l'entreprise (RH, patron) s'authentifie pour accéder au portail Client. Le Client accède au portail pour consulter les informations relatives à son entreprise (fiches de paie, employés, documents) en **lecture seule**. Le Client a une visibilité limitée à **ses propres données** (`clientId`).

> **Note importante sur l'accès :**
> Chaque Client ne voit que ses données (fiches, employés, documents) et ne peut pas accéder aux données d'autres entreprises. Le Client n'a **aucun droit de modification** : toutes les opérations (création fiches, déclarations ONSS, etc.) sont effectuées par le Consultant. Le Client est un portail en **lecture seule**.

---

### Catégorie 1 : Authentification

#### UC-04-00 : Se connecter

**Acteur principal :** Client (représentant de l'entreprise : RH, patron, comptable)
**Acteurs secondaires :** Better Auth, Email Service, AuditLog
**Prérequis :** Compte Client actif créé par un Consultant
**Déclencheur :** Client accède à /login

**Scénario nominal :**
1. Le système affiche le formulaire de connexion
2. Le Client saisit email et mot de passe
3. Le système valide le format email et champs non vides
4. **[Alt 1]** Si format invalide: Erreur 400 "Format invalide"
5. Le système récupère le compte Client par email
6. **[Alt 2]** Si compte inexistant: Erreur 401 "Email ou mot de passe incorrect" (message générique)
7. Le système hash le mot de passe et compare
8. **[Alt 3]** Si mot de passe incorrect:
   - Incrémenter compteur tentatives échouées
   - Si >= 5: Bloquer compte 15 minutes
   - Erreur 401 "Email ou mot de passe incorrect"
9. Le système vérifie le statut du compte (ACTIF)
10. **[Alt 4]** Si compte BLOQUE ou INACTIF: Erreur 403 "Compte désactivé par secrétariat"
11. Le système génère JWT token (8h expiration, clientId, role = CLIENT)
12. Le système crée session en Redis avec IP et user-agent
13. Le système enregistre log audit: "LOGIN_SUCCESS_CLIENT" (timestamp, IP)
14. Le système charge dashboard du Client
15. L'utilisateur est redirigé vers /dashboard

**Alternatives :**
- **Alt 1 - Format invalide**: Email ou champs non remplis → Erreur 400 "Veuillez remplir tous les champs"
- **Alt 2 - Compte inexistant**: Email n'existe pas → Erreur 401 "Email ou mot de passe incorrect"
- **Alt 3 - Mot de passe incorrect**: Mauvaise comparaison bcrypt → Incrémenter compteur, blocage après 5 tentatives
- **Alt 4 - Compte désactivé**: Status = BLOQUE ou INACTIF → Erreur 403 "Compte désactivé par secrétariat"
- **Alt 5 - Service indisponible**: Erreur base de données → Erreur 503 "Service d'authentification indisponible"

**Postconditions :**
- Client authentifié avec JWT token valide
- Session créée en Redis avec IP et user-agent
- Audit log enregistré (LOGIN_SUCCESS_CLIENT)
- Accès au dashboard en lecture seule

---

### Catégorie 2 : Consultation Fiches de Paie

#### UC-04-10 : Consulter fiches de paie (Consulter, Filtrer, Télécharger)

**Acteur principal :** Client
**Acteurs secondaires :** Modèle, AuditLog
**Prérequis :** Client authentifié avec token JWT valide
**Déclencheur :** Client accède à "Mes Fiches de Paie"

**Scénario nominal - Consultation :**
1. Le système récupère toutes les fiches de paie du Client (clientId du token, période complète)
2. Le système affiche tableau fiches (période, nb employés, salaire brut, net total, statut envoi)
3. **[Alt 1]** Si BD indisponible: Erreur 500 "Impossible charger fiches de paie"

**Alternative A - Consulter détails fiche :**
1. Le Client clique sur fiche de paie pour détails
2. Le système récupère fiche complète (brut, ONSS, précompte, charges, net, employés concernés)
3. **[Alt A1]** Si fiche inexistante: Erreur 404 "Fiche inexistante"
4. Le système affiche détails ligne par ligne (salaire brut, retenues, net, charges employeur)
5. Le système affiche liste employés concernés par cette fiche

**Alternative B - Filtrer fiches :**
1. Le Client peut filtrer par :
   - **Période** (mois/année)
   - **Statut** (envoyée, brouillon, archivée)
   - **Employé** (sélection dans liste)
2. Le système applique filtres et affiche fiches correspondantes

**Alternative C - Télécharger PDF :**
1. Le Client clique "Télécharger PDF"
2. Le système génère lien sécurisé avec token temporaire (30 minutes)
3. **[Alt C1]** Si PDF inaccessible: Erreur 404 "PDF non disponible"
4. Le Client télécharge fiche en PDF
5. **[Alt C2]** Si erreur téléchargement: Erreur 500 "Impossible télécharger, réessayez"

**Restrictions :**
- ❌ Le Client NE PEUT PAS modifier fiches (lecture seule)
- ❌ Le Client NE PEUT PAS supprimer fiches
- ✅ Le Client PEUT consulter et télécharger fiches

**Alternatives :**
- **Alt 1 - BD indisponible**: Erreur 500 "Impossible charger fiches"
- **Alt A1 - Fiche inexistante**: Supprimée ou inexistante → Erreur 404 "Fiche inexistante"
- **Alt C1 - PDF inaccessible**: PDF non stocké ou expiré → Erreur 404 "PDF non disponible"
- **Alt C2 - Erreur téléchargement**: Erreur lors de lecture storage → Erreur 500 "Impossible télécharger"

**Postconditions :**
- Fiches consultées et téléchargées avec succès
- Accès restreint aux propres fiches du Client (clientId garanti)
- Audit logs enregistrés (consultation des fiches)
- Liens PDF sécurisés avec token temporaire 30 minutes

---

### Catégorie 3 : Consultation Employés

#### UC-04-20 : Consulter employés (Consulter, Filtrer, Voir historique)

**Acteur principal :** Client
**Acteurs secondaires :** Modèle, AuditLog
**Prérequis :** Client authentifié avec token JWT valide
**Déclencheur :** Client accède à "Mes Employés"

**Scénario nominal - Consultation :**
1. Le système récupère tous employés actifs du Client (clientId, archived_at IS NULL)
2. Le système affiche tableau (nom, poste, statut, salaire brut, date embauche, nb fiches)
3. **[Alt 1]** Si BD indisponible: Erreur 500 "Impossible charger employés"

**Alternative A - Détails employé :**
1. Le Client clique sur employé pour détails
2. Le système récupère infos complètes (NISS, poste, statut, salaire, contrat, dates)
3. **[Alt A1]** Si employé inexistant ou archivé: Erreur 404 "Employé inexistant"
4. Le système affiche fiche employé (informations visibles : poste, statut, salaire de base)
5. Le système affiche historique fiches paie (dernières 12 mois)

**Alternative B - Filtrer employés :**
1. Le Client peut filtrer par :
   - **Statut** (actif, en congé, arrêt maladie, terminé)
   - **Poste/Fonction** (sélection)
   - **Période embauche** (par année)
2. Le système applique filtres et affiche employés correspondants

**Alternative C - Voir historique paies :**
1. Le Client clique "Historique paies" d'un employé
2. Le système affiche dernières fiches de paie (12 derniers mois ou plus)
3. Le système affiche : date, salaire brut, net, charges
4. Le Client peut télécharger chaque fiche individuellement

**Restrictions :**
- ❌ Le Client NE PEUT PAS consulter données sensibles (NISS affiché partiellement****)
- ❌ Le Client NE PEUT PAS modifier informations employés
- ❌ Le Client NE PEUT PAS voir données d'autres clients
- ✅ Le Client PEUT consulter statut et fiches paie

**Restrictions Données Sensibles :**
- NISS affiché partiellement : "XX.XX.02.***" (4 derniers chiffres cachés)
- Coordonnées bancaires : non affichées
- Adresse personnelle : non affichée

**Alternatives :**
- **Alt 1 - BD indisponible**: Erreur 500 "Impossible charger employés"
- **Alt A1 - Employé inexistant**: Archivé ou introuvable → Erreur 404 "Employé inexistant"

**Postconditions :**
- Employés consultés avec succès
- Données sensibles masquées (NISS partiellement)
- Accès restreint aux employés du Client (clientId garanti)
- Historique fiches visible pour chaque employé
- Audit logs enregistrés (consultation employés)

---

### Catégorie 4 : Consultation Documents

#### UC-04-30 : Consulter documents (Consulter, Télécharger, Archiver)

**Acteur principal :** Client
**Acteurs secondaires :** Modèle, Storage Service, AuditLog
**Prérequis :** Client authentifié avec token JWT valide
**Déclencheur :** Client accède à "Documents"

**Scénario nominal - Consultation :**
1. Le système récupère tous documents du Client (clientId, archived = false)
2. Le système affiche tableau documents (type, date création, statut, taille)
3. **[Alt 1]** Si BD indisponible: Erreur 500 "Impossible charger documents"

**Types de documents affichés :**
- **Fiches de paie** : générées par Consultant (PDF)
- **Certificats C4** : pour employés terminés (PDF)
- **Déclarations ONSS** : confirmations DIMONA (PDF)
- **Attestations de travail** : sur demande (PDF)
- **Documents administratifs** : notices, guides (PDF)

**Alternative A - Filtrer documents :**
1. Le Client peut filtrer par :
   - **Type** (fiche de paie, certificat, déclaration, attestation)
   - **Période** (par année/mois)
   - **Employé** (documents concernant un employé spécifique)
2. Le système applique filtres et affiche documents correspondants

**Alternative B - Télécharger document :**
1. Le Client clique "Télécharger"
2. Le système génère lien sécurisé avec token temporaire (30 minutes)
3. **[Alt B1]** Si document inaccessible: Erreur 404 "Document non disponible"
4. Le Client télécharge document en PDF
5. **[Alt B2]** Si erreur téléchargement: Erreur 500 "Impossible télécharger"
6. Le système enregistre log audit : "DOCUMENT_DOWNLOADED" (type, timestamp)

**Alternative C - Consulter historique :**
1. Le Client consulte "Mes Documents" avec tri chronologique
2. Le système affiche tous documents avec dates (plus récents d'abord)
3. Le Client peut voir liste complète (pagination 20 par page)

**Restrictions :**
- ❌ Le Client NE PEUT PAS supprimer documents
- ❌ Le Client NE PEUT PAS modifier documents
- ✅ Le Client PEUT consulter et télécharger documents
- ✅ Accès restreint aux documents du Client

**Alternatives :**
- **Alt 1 - BD indisponible**: Erreur 500 "Impossible charger documents"
- **Alt B1 - Document inaccessible**: Supprimé ou storage erreur → Erreur 404 "Document non disponible"
- **Alt B2 - Erreur téléchargement**: Erreur lecture storage → Erreur 500 "Impossible télécharger"

**Postcéditions :**
- Documents consultés et téléchargés avec succès
- Liens PDF sécurisés avec token temporaire 30 minutes
- Accès restreint aux documents du Client (clientId garanti)
- Audit logs enregistrés (téléchargements de documents)
- Historique documents visible et filtrable

---

### Catégorie 5 : Support & Messagerie

#### UC-04-40 : Accéder support et messagerie (Consulter, Envoyer, Recevoir)

**Acteur principal :** Client
**Acteurs secondaires :** Modèle, Email Service, AuditLog
**Prérequis :** Client authentifié avec token JWT valide
**Déclencheur :** Client accède à "Support" ou "Messagerie"

**Scénario nominal - Consulter messages :**
1. Le système récupère tous messages du Client (clientId, conversation history)
2. Le système affiche liste conversations (dernier message, date, statut lu/non lu)
3. **[Alt 1]** Si BD indisponible: Erreur 500 "Impossible charger messages"

**Alternative A - Envoyer message :**
1. Le Client clique "Nouveau message"
2. Le système affiche formulaire (sujet, message, type: question/anomalie/autre)
3. Le Client remplit et clique "Envoyer"
4. Le système valide message non vide
5. **[Alt A1]** Si message vide: Erreur 400 "Veuillez entrer un message"
6. Le système crée message en transaction (clientId, sujet, contenu, timestamp)
7. Le système envoie notification email au secrétariat
8. **[Alt A2]** Si email service DOWN: Message créé, email non envoyé, Avertissement
9. Le système INSERT log audit : "SUPPORT_MESSAGE_SENT" (sujet, timestamp)
10. Le Client reçoit confirmation "Message envoyé ✓"

**Alternative B - Consulter conversation :**
1. Le Client clique sur conversation
2. Le système affiche historique messages (ordre chronologique)
3. Le système affiche réponses du secrétariat
4. Le Client peut répondre dans la même conversation

**Alternative C - Marquer comme lu :**
1. Le Client clique "Marquer comme lu"
2. Le système UPDATE message statut = LU
3. Le système enregistre log (consultation message)

**Types de demandes supportées :**
- **Questions sur fiches de paie**: "Pourquoi mon salaire net est réduit ce mois?"
- **Demandes clarification**: "Comment est calculé le précompte?"
- **Anomalies**: "Je n'ai pas reçu ma fiche de paie de mars"
- **Support technique**: "Je n'arrive pas à télécharger le document"
- **Autres**: Messages libres

**Restrictions :**
- ❌ Le Client NE PEUT PAS supprimer messages
- ❌ Le Client NE PEUT PAS modifier messages
- ✅ Le Client PEUT envoyer et consulter messages
- ✅ Temps de réponse cible : 24-48 heures

**Alternatives :**
- **Alt 1 - BD indisponible**: Erreur 500 "Impossible charger messages"
- **Alt A1 - Message vide**: Champ vide → Erreur 400 "Veuillez entrer un message"
- **Alt A2 - Email service DOWN**: Email notification échoue → Message créé, Avertissement "Notification non envoyée"

**Postcéditions :**
- Messages consultés et envoyés avec succès
- Notification email envoyée au secrétariat (si service OK)
- Conversation tracée et archivée
- Audit logs enregistrés (messages envoyés/lus)
- Statut messages visible (lu/non lu)

---

### Catégorie 6 : Tableau de Bord

#### UC-04-50 : Consulter dashboard (Accueil)

**Acteur principal :** Client
**Acteurs secondaires :** Modèle, Controleur, AuditLog
**Prérequis :** Client authentifié
**Déclencheur :** Client se connecte ou clique sur "Dashboard"

**Scénario nominal :**
1. Le système charge en parallèle :
   - Fiche paie la plus récente
   - Nombre total employés (actifs)
   - Dernière déclaration ONSS
   - Messages non lus du secrétariat
   - Alertes ou notifications importantes
2. **[Alt 1]** Si BD indisponible: Affiche message, données partielles OK
3. Le système calcule KPIs simples du Client :
   - Nb employés actifs
   - Dernière paie : date et montant net total
   - Statut conformité ONSS (déclaré: oui/non)
   - Messages en attente de réponse
4. Le système affiche dashboard avec widgets :
   - Widget "Dernière fiche" : date, salaire brut, net
   - Widget "Employés" : nombre actif
   - Widget "Conformité" : statut ONSS (vert/jaune/rouge)
   - Widget "Messages" : nb messages non lus
   - Liens rapides : "Mes fiches", "Mes employés", "Documents", "Support"
5. **[Alt 2]** Si pas de fiches: Affiche "Aucune fiche de paie encore générée"
6. Client peut cliquer "Rafraîchir" pour données à jour

**Affichage KPIs Client :**

| KPI | Affichage | Seuil Alerte |
|-----|-----------|---|
| Employés actifs | Nombre entier | Info |
| Dernière fiche | Date + Montant net | Alerte si > 30j |
| Conformité ONSS | Vert (OK) / Jaune (attention) / Rouge (critique) | < 100% = Jaune |
| Messages non lus | Nombre + Badge rouge | > 0 = Badge visible |

**Restrictions :**
- ❌ Le Client NE PEUT PAS modifier dashboard
- ✅ Le Client PEUT rafraîchir données
- ✅ Affichage personnalisé par Client (clientId)

**Alternatives :**
- **Alt 1 - BD indisponible**: Certains widgets vides → Affiche message "Données partiellement indisponibles"
- **Alt 2 - Pas de fiches**: Aucune paie générée encore → Affiche "Aucune fiche de paie"

**Postcéditions :**
- Dashboard affiché avec données actualisées
- KPIs Client affichés (employés, fiches, conformité)
- Liens rapides vers actions principales
- Audit logs enregistrés (dashboard consulté)
- Accès restreint au dashboard du Client (clientId garanti)

---

### Catégorie 7 : Gestion Profil

#### UC-04-60 : Gérer profil personnel

**Acteur principal :** Client
**Acteurs secondaires :** Email Service, AuditLog
**Prérequis :** Client authentifié
**Déclencheur :** Client clique sur "Paramètres" ou "Mon profil"

**Scénario nominal :**

**Phase 1 - Accès aux paramètres:**
1. Le Client accède à /dashboard/settings
2. Le système affiche onglets:
   - Informations personnelles
   - Mot de passe
   - Préférences notifications
   - Sécurité

**Phase 2 - Modifier informations personnelles:**
1. Le Client peut modifier:
   - Nom complet
   - Numéro de téléphone
   - Email (avec confirmation)
   - Langue de l'interface (FR/NL/EN)
2. Le Client clique "Enregistrer"
3. Le système valide et sauvegarde
4. Confirmation: "Informations mises à jour ✓"

**Alternative A - Changer mot de passe:**
1. Le Client clique "Changer mot de passe"
2. Saisit: ancien mot de passe + nouveau (2x confirmation)
3. Le système valide (ancien = correct, nouveau ≠ ancien, respect critères)
4. Le système hash nouveau avec bcrypt
5. Tous les tokens sont révoqués (force reconnexion)
6. Email de confirmation envoyé

**Alternative B - Préférences notifications:**
1. Le Client peut activer/désactiver:
   - Email nouvelle fiche de paie reçue
   - Alertes conformité ONSS
   - Messages du secrétariat
   - Alertes anomalies
2. Sauvegarde automatique

**Alternative C - Authentification 2FA (optionnel):**
1. Le Client peut activer 2FA optionnel
2. Scanne QR code avec Google Authenticator
3. Valide avec code 6 chiffres
4. Client peut générer codes de secours (10 codes)
5. À la prochaine connexion, 2FA demandé

**Protections :**
- ✅ Mot de passe ancien vérifié avant changement
- ✅ Tous les tokens révoqués après changement mot de passe
- ✅ Email de confirmation pour changement email
- ✅ Authentification requise pour modification

**Postconditions :**
- Profil mis à jour
- Notifications ajustées selon préférences
- Audit logs enregistrés

---

### Catégorie 8 : Analytics & Statistiques RH

#### UC-04-70 : Voir analytics et statistiques RH

**Acteur principal :** Client
**Acteurs secondaires :** Analytics Engine, Cache Service, Database
**Prérequis :** Client authentifié
**Déclencheur :** Client accède à "Statistiques RH" ou "Analytics" (/dashboard/analytics)

**Scénario nominal :**

**Phase 1 - Accès au dashboard analytics:**
1. Le Client accède à /dashboard/analytics
2. Le système calcule les statistiques (avec cache TTL 1h):
   - **Coûts RH mensuels**: Somme fiches paie du mois (brut + charges employeur)
   - **Coûts par employé**: Breakdown individual
   - **Évolution coûts**: Courbe 6 derniers mois
   - **Moyenne salaire**: Moyen et médian
   - **Charges employeur**: % du brut

**Phase 2 - Dashboard principal:**
1. Le système affiche KPIs:
   - **Coût total RH ce mois**: €X,XXX (brut + charges)
   - **Coût moyen par employé**: €X,XXX
   - **Nombre d'employés**: Actifs vs inactifs
   - **Charges employeur**: XX% du brut (13.07% ONSS + autre)
   - **Prévision annuelle**: Basée sur tendance

2. Graphiques:
   - **Courbe coûts**: 6 derniers mois
   - **Pie chart**: Distribution coûts par employé
   - **Bar chart**: Comparaison mois à mois

**Alternative A - Filtrer par période:**
1. Le Client sélectionne période:
   - Mois spécifique
   - Trimestre
   - Année
2. Le système recalcule les statistiques
3. Graphiques mis à jour

**Alternative B - Exporter rapport:**
1. Le Client clique "Exporter"
2. Formats disponibles:
   - **PDF**: Rapport formaté avec graphiques
   - **Excel**: Données tabulaires détaillées
   - **CSV**: Format brut
3. Le système génère et télécharge le fichier

**Alternative C - Voir détails par employé:**
1. Le Client clique "Breakdown par employé"
2. Le système affiche tableau:
   - Nom employé
   - Coût brut mensuel
   - Charges employeur
   - Coût total
   - Évolution vs mois précédent (% changement)
3. Le Client peut trier par colonne

**Prévisions (optionnel):**
1. Si tendance stable: Affiche prévision annuelle
2. Formule: Moyenne 6 derniers mois × 12
3. Note: "Basée sur données historiques, peut varier"

**Protections :**
- ✅ Isolation stricte (données du Client uniquement)
- ✅ Cache 1h (pas de recalcul constant)
- ✅ Données masquées pour employés individuels (voir Consultant pour détails)
- ✅ Audit logs (qui accède aux statistiques)

**Restrictions :**
- ❌ Client NE PEUT PAS voir détails salaire individuals (confidentiel)
- ✅ Client PEUT voir coûts agrégés et tendances

**Postconditions :**
- Statistiques affichées avec graphiques
- Export disponible (PDF/Excel/CSV)
- Données cachées pour performance
- Audit logs enregistrés

---

### Catégorie 9 : Conformité & Certificats

#### UC-04-80 : Télécharger certificats C4

**Acteur principal :** Client
**Acteurs secondaires :** Modèle, Storage Service, PDF Generator, AuditLog
**Prérequis :** Client authentifié
**Déclencheur :** Client accède à "Certificats C4" ou depuis page employé

**Scénario nominal :**

**Phase 1 - Liste certificats disponibles:**
1. Le Client accède à /dashboard/c4-certificates
2. Le système affiche les employés qui ont des certificats C4:
   - Employés dont le contrat est TERMINÉ
   - Employés qui ont demandé C4
3. Pour chaque certificat:
   - Nom employé
   - Période concernée
   - Date de génération
   - Statut (Disponible, En cours, Généré)

**Phase 2 - Télécharger certificat C4:**
1. Le Client clique "Télécharger"
2. Le système génère ou récupère le PDF du certificat C4
3. **[Alt A]** Si certificat pas encore généré: "Certificat en cours de génération, réessayez dans quelques minutes"
4. Le système crée lien temporaire (30 minutes, token sécurisé)
5. Le Client télécharge PDF
6. Le système enregistre audit: "C4_CERTIFICATE_DOWNLOADED" (employé, période, timestamp)

**Alternative A - Générer certificat manquant:**
1. Le Client clique "Générer"
2. Le Consultant (du secrétariat) doit valider la génération
3. Le système crée notification audit pour Consultant
4. Le Consultant génère dans UC-03-40
5. Certificat disponible après ~24h

**Alternative B - Accéder depuis fiche employé:**
1. Le Client consulte un employé (UC-04-20)
2. Si employé a contrat TERMINÉ: bouton "Télécharger C4"
3. Même flow que Phase 2

**Détails Certificats C4:**
- **Document officiel** pour chômage (délivré par secrétariat)
- **Contient**: Nom employé, dates emploi, raison fin contrat, numéro dossier ONSS
- **Obligatoire** pour demande allocations chômage
- **Format**: PDF standard, image ou document word

**Protections :**
- ✅ Certificat disponible UNIQUEMENT si employé lié au Client
- ✅ Lien temporaire 30 minutes (sécurité)
- ✅ Audit logs complets (qui télécharge quoi quand)
- ✅ Impossible de télécharger certificats d'autres clients

**Restrictions :**
- ❌ Client NE PEUT PAS générer certificats (Consultant le fait)
- ✅ Client PEUT consulter et télécharger ses certificats

**Alternatives (erreurs):**
- **Alt 1 - Pas de certificats**: "Aucun certificat C4 disponible" 
- **Alt 2 - Lien expiré**: "Lien expiré, cliquez pour régénérer"
- **Alt 3 - Employé inexistant**: Erreur 404

**Postconditions :**
- Certificat C4 téléchargé avec succès
- Lien sécurisé avec expiration
- Audit logs enregistrés
- Client peut générer demande allocations chômage

---

## ⚡ **POINTS CLÉS IMPORTANTS**

### Isolation Multi-Tenant Stricte (Client)
- **Chaque Client** accède uniquement aux données de **son entreprise** (`clientId` dans JWT)
- **JWT token** contient : `client_id`, `clientId`, `role = CLIENT`, expiration 8 heures
- **Toutes les requêtes** filtrées par `clientId` du token (jamais de paramètre utilisateur)
- **Aucune donnée inter-client** accessible, même en erreur (messages génériques)

### Portail Lecture Seule (Client)
- **Le Client ne peut RIEN modifier** : fiches, employés, documents, paramètres
- **Toutes les opérations CRUD** effectuées par le Consultant (crée fiches, gère employés)
- **Client = Consultation seulement** : visualiser fiches, employés, documents, conformité
- **Aucun droit d'écriture** : pas de création, modification, suppression

### Traçabilité Audit Complète
- **Tous les accès** enregistrés :
  - Qui : `client_id`
  - Quoi : Action (LOGIN_SUCCESS_CLIENT, PAYSLIP_VIEWED, DOCUMENT_DOWNLOADED, etc.)
  - Quand : `timestamp` précis
  - Contexte : `clientId` (toujours, même implicite)
- **Logs persistes** en BD long-terme pour conformité RGPD (3 ans)
- **Events loggues** en temps réel pour monitoring

### Sécurité Authentification Client
- **Token JWT 8 heures d'expiration** avec refresh automatique
- **sessionId stocké en Redis** avec IP et user-agent verification
- **Logout révoque immédiatement** la session (DELETE FROM session)
- **Tentatives login échouées tracées** :
  - Max 5 tentatives avant blocage
  - Blocage 15 minutes en cache
  - Chaque tentative loggée en audit

### Protection Données Sensibles
- **NISS masqué partiellement** : "XX.XX.02.****" (4 derniers chiffres cachés)
- **Coordonnées bancaires** : non affichées
- **Adresse personnelle** : non affichée
- **Salaire net** : visible (c'est la paie du Client)

### Sécurité Documents
- **PDF stocké sécurisé** en storage (pas accessible publiquement)
- **Lien téléchargement avec token temporaire** (30 minutes)
- **Après 30 min** : lien expiré, nécessite nouveau téléchargement
- **Audit logs** : traçabilité qui télécharge quoi et quand

### Sécurité Messagerie
- **Messages cryptés** en transit (HTTPS)
- **Historique conservé** pour traçabilité
- **Temps réponse cible** : 24-48 heures
- **Notification email** au secrétariat à chaque message Client

---

## Synthèse des Cas d'Utilisation

| UC ID | Nom | Acteurs Secondaires | Priorité | Complexité |
|-------|-----|----------|----------|-----------|
| UC-04-00 | Se connecter | Better Auth, Email Service, AuditLog | Critique | Moyenne |
| UC-04-10 | Consulter fiches de paie (Consulter, Filtrer, Télécharger) | Modèle, AuditLog | Critique | Moyenne |
| UC-04-20 | Consulter employés (Consulter, Filtrer, Historique) | Modèle, AuditLog | Critique | Moyenne |
| UC-04-30 | Consulter documents (Consulter, Télécharger) | Modèle, Storage Service, AuditLog | Moyenne | Basse |
| UC-04-40 | Accéder support et messagerie (Consulter, Envoyer) | Modèle, Email Service, AuditLog | Moyenne | Basse |
| UC-04-50 | Consulter dashboard (Accueil) | Modèle, Controleur, AuditLog | Moyenne | Moyenne |
| UC-04-60 | Gérer profil personnel (Infos, Mot de passe, Notifications) | Email Service, AuditLog | Basse | Basse |
| UC-04-70 | Voir analytics et statistiques RH (KPIs, Graphiques, Export) | Analytics Engine, Cache Service, AuditLog | Moyenne | Moyenne |
| UC-04-80 | Télécharger certificats C4 (Consulter, Télécharger) | Storage Service, PDF Generator, AuditLog | Moyenne | Basse |


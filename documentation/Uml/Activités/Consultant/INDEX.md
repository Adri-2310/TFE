# 📊 Diagrammes d'Activités - Consultant
## Processus Métier Principal (Paie & Conformité)

---

## 📋 UC vs AC Mapping

| UC | Titre | AC | Statut |
|----|-------|----|----|
| UC-03-00 | Se connecter | AC-Connexion | ✅ Créé |
| UC-03-10 | Gérer clients | AC-23 | ✅ Créé |
| UC-03-20 | Gérer employés clients | *(À créer)* | ⚠️ |
| UC-03-30 | Gérer fiches paie | AC-01 | ✅ Créé |
| UC-03-40 | Gérer conformité ONSS | AC-02 | ✅ Créé |
| UC-03-50 | Gérer alertes | *(À créer)* | ⚠️ |
| UC-03-60 | Dashboard | AC-10 | ✅ Créé |
| UC-03-70 | Sync Exact Online | AC-08 | ✅ Créé |
| UC-03-75 | Support & Messagerie | AC-06, AC-07 | ✅ Créés |
| UC-03-80 | Templates documents | AC-09 | ✅ Créé |
| UC-03-85 | Export/Import données | *(À créer)* | ⚠️ |

---

## ✅ Diagrammes Existants

### AC-01: Génération Fiche de Paie
**UC** : UC-03-30 | **Fichier** : `AC-01-Workflow-Generer-FichePaie.puml` | **Statut** : ✅ CORE BUSINESS

### AC-02: Export ONSS
**UC** : UC-03-40 | **Fichier** : `AC-02-Workflow-Export-ONSS.puml` | **Statut** : ✅ CORE BUSINESS

### AC-06: Support Tickets
**UC** : UC-03-75 | **Fichier** : `AC-06-Workflow-Support-Tickets.puml` | **Statut** : ✅ Business

### AC-07: Messagerie Client
**UC** : UC-03-75 | **Fichier** : `AC-07-Workflow-Messagerie-Client.puml` | **Statut** : ✅ Business

### AC-08: Sync Exact Online
**UC** : UC-03-70 | **Fichier** : `AC-08-Workflow-Sync-Exact-Online.puml` | **Statut** : ✅ Business

### AC-09: Gestion Documents
**UC** : UC-03-80 | **Fichier** : `AC-09-Workflow-Gestion-Documents.puml` | **Statut** : ✅ Support (copie)

### AC-10: Dashboard
**UC** : UC-03-60 | **Fichier** : `AC-10-Workflow-Dashboard-Reporting.puml` | **Statut** : ✅ Support (copie)

### AC-Connexion: Connexion Consultant
**UC** : UC-03-00 | **Fichier** : `/Activities/Consultant/AC-Connexion-Consultant.puml` | **Créé** : ✅ PHASE 1
**Processus** :
- Authentification email/mot de passe
- Validation format email
- Blocage compte après N tentatives
- Vérification 2FA si activé
- Récupération clients assignés et permissions
- Génération JWT token, session

### AC-23: Gérer Clients
**UC** : UC-03-10 | **Fichier** : `AC-23-Workflow-Gerer-Clients.puml` | **Créé** : ✅ PHASE 1
**Processus** :
- Ajouter, modifier, consulter clients
- Validation TVA unique
- Paramètres paie et conformité
- Gérer accès clients (archiver/restaurer)
- Gestion assignation consultant

### AC-24: Gérer Employés Clients
**UC** : UC-03-20 | **Fichier** : `AC-24-Workflow-Gerer-Employes.puml` | **Créé** : ✅ PHASE 2
**Processus** :
- Ajouter, modifier, consulter employés
- Gestion contrats (CDI, CDD, Interim)
- Configuration cotisations ONSS
- Suspension/Réactivation/Termination
- Génération certificat travail

---

## 🔴 À CRÉER (Priorité)

### Gérer Alertes (MOYEN)
UC-03-50 : Configuration & suivi alertes

### Export/Import (MOYEN)
UC-03-85 : Export/Import données clients

---

## 📊 Couverture

| Métrique | Valeur |
|----------|--------|
| **UC Total** | 13 |
| **AC Créés** | 10 |
| **AC Copies** | 2 (AC-09, AC-10) |
| **AC À Créer** | 3 |
| **Couverture** | 76.9% ✅ |
| **Autonomie** | ✅ 100% (tous fichiers locaux) |

**CORE BUSINESS** : 2/2 ✅ (Paie & ONSS)

---

**Rapport** : 25 mai 2026
**Priorité** : 🟢 PHASE 2 (3 UC HAUTE complétées)

# 📊 Diagrammes d'Activités - AdminSecretariat
## Processus de Gestion Secrétariat

---

## 📋 UC vs AC Mapping

| UC | Titre | AC | Statut |
|----|-------|----|----|
| UC-02-00 | S'inscrire | AC-04 | ✅ Créé |
| UC-02-10 | Gérer personnel | AC-19 | ✅ Créé |
| UC-02-20 | Gérer abonnement | AC-20 | ✅ Créé |
| UC-02-30 | Templates documents | AC-09 | ✅ Créé |
| UC-02-40 | Consulter dashboard | AC-10 | ✅ Créé |
| UC-02-50 | Audit logs | *(À créer)* | ⚠️ |
| UC-02-60 | Exporter données RGPD | AC-05 | ✅ Créé |
| UC-02-70 | Importer données | AC-03 | ✅ Créé |

---

## ✅ Diagrammes Existants

### AC-03: Import Données
**UC** : UC-02-70 | **Fichier** : `AC-03-Workflow-Import-Donnees.puml`

### AC-04: Authentification & Inscription
**UC** : UC-02-00 | **Fichier** : `AC-04-Workflow-Authentification-Inscription.puml`

### AC-05: RGPD Export Données
**UC** : UC-02-60 | **Fichier** : `AC-05-Workflow-RGPD-Export-Donnees.puml`

### AC-09: Gestion Documents & Templates
**UC** : UC-02-30 | **Fichier** : `AC-09-Workflow-Gestion-Documents.puml`

### AC-10: Dashboard & Reporting
**UC** : UC-02-40 | **Fichier** : `AC-10-Workflow-Dashboard-Reporting.puml`

### AC-19: Gérer Personnel
**UC** : UC-02-10 | **Fichier** : `/Activities/AdminSecretariat/AC-19-Workflow-Gerer-Personnel.puml` | **Créé** : ✅ PHASE 1
**Processus** :
- Créer, modifier, consulter consultants
- Assigner permissions et accès UC
- Gérer clients assignés
- Désactiver/Réactiver consultants
- Réinitialiser mot de passe

### AC-20: Gérer Abonnement
**UC** : UC-02-20 | **Fichier** : `/Activities/AdminSecretariat/AC-20-Workflow-Gerer-Abonnement.puml` | **Créé** : ✅ PHASE 1
**Processus** :
- Afficher plan actuel et features
- Consulter historique factures
- Changer plan d'abonnement
- Accéder Stripe Customer Portal
- Mettre à jour méthode paiement

---

## 🔴 À CRÉER (Priorité MOYEN)

### AC-21: Audit Logs Secrétariat
UC-02-50 : Consultation logs du secrétariat
- Filtrer par type/utilisateur/période
- Afficher détails
- Export

---

## 📊 Couverture

| Métrique | Valeur |
|----------|--------|
| **UC Total** | 8 |
| **AC Créés** | 7 |
| **AC À Créer** | 1 |
| **Couverture** | 87.5% ✅ |

---

**Rapport** : 25 mai 2026
**Priorité** : 🟢 HAUTE (2 AC PHASE 1 complétée)

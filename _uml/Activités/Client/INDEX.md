# 📊 Diagrammes d'Activités - Client
## Processus Consultation & Support

---

## 📋 UC vs AC Mapping

| UC | Titre | AC | Statut |
|----|-------|----|----|
| UC-04-00 | Se connecter | AC-27 | ✅ **CRÉÉ** |
| UC-04-10 | Consulter fiches paie | *(À créer)* | ⚠️ |
| UC-04-20 | Consulter employés | *(À créer)* | ⚠️ |
| UC-04-30 | Gérer documents | *(À créer)* | ⚠️ |
| UC-04-40 | Support | AC-06 | ✅ Créé |
| UC-04-50 | Dashboard | AC-10 | ✅ Créé |
| UC-04-60 | Gérer profil | *(À créer)* | ⚠️ |
| UC-04-70 | Analytics RH | *(À créer)* | ⚠️ |
| UC-04-80 | Certificats C4 | *(À créer)* | ⚠️ |

---

## ✅ Diagrammes Existants

### AC-06: Support Tickets
**UC** : UC-04-40 | **Fichier** : `AC-06-Workflow-Support-Tickets.puml` | **Statut** : ✅ (copie)

### AC-10: Dashboard
**UC** : UC-04-50 | **Fichier** : `AC-10-Workflow-Dashboard-Reporting.puml` | **Statut** : ✅ (copie)

### AC-27: Connexion Client
**UC** : UC-04-00 | **Fichier** : `/Activities/Client/AC-27-Workflow-Connexion-Client.puml`

---

### AC-28: Consulter Fiches Paie
**UC** : UC-04-10 | **Fichier** : `AC-28-Workflow-Consulter-FichesPaie.puml` | **Créé** : ✅ PHASE 2
**Processus** :
- Afficher historique fiches paie
- Filtrer par mois/période
- Consulter détails brut, net, cotisations
- Télécharger/Imprimer/Envoyer par email
- Afficher résumé annuel

### AC-29: Consulter Employés
**UC** : UC-04-20 | **Fichier** : `AC-29-Workflow-Consulter-Employes.puml` | **Créé** : ✅ PHASE 2
**Processus** :
- Afficher liste employés
- Filtrer par statut/contrat
- Consulter détails employés
- Accès fiches paie employés
- Consulter documents/absences
- Afficher solde congés

---

## 🔴 À CRÉER

### Gérer Documents (MOYEN)
UC-04-30 : Consulter & télécharger documents

### Gérer Profil (MOYEN)
UC-04-60 : Modifier informations personnelles

### Analytics RH (MOYEN)
UC-04-70 : Graphiques et statistiques RH

### Certificats C4 (FAIBLE)
UC-04-80 : Télécharger certificats C4 chômage

---

## 📊 Couverture

| Métrique | Valeur |
|----------|--------|
| **UC Total** | 9 |
| **AC Créés** | 3 (AC-27, AC-28, AC-29) |
| **AC Copies** | 2 (AC-06, AC-10) |
| **AC À Créer** | 4 |
| **Couverture** | 55.6% ✅ |
| **Autonomie** | ✅ 100% (tous fichiers locaux) |

---

**Rapport** : 25 mai 2026
**Priorité** : 🟢 PHASE 2 (2 UC HAUTE complétées)

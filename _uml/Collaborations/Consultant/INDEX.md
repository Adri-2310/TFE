# Diagrammes de Collaboration - Consultant

## 📋 Aperçu
Diagrammes de collaboration pour les cas d'utilisation du **Consultant** (consultant RH/Paie).

---

## 📁 Fichiers

### SC-02: Génération Fiche de Paie
- **Fichier**: `SC-02-Generer-FichePaie.puml`
- **Description**: Processus complet de génération et envoi de fiches de paie
- **Acteurs**: Consultant, Service Paie, Service Calcul
- **Flux**: Sélection → Calcul → Génération PDF → Envoi emails

### SC-05: Gestion Paie
- **Fichier**: `SC-05-Gestion-Paie.puml`
- **Description**: Vérification et génération des fiches de paie (Consultant)
- **Acteurs**: Consultant, Service Paie, Service Calcul
- **Flux**: Sélection mois → Vérification → Correction → Génération → Export

### SC-07: Validation ONSS
- **Fichier**: `SC-07-Validation-ONSS.puml`
- **Description**: Validation et export des déclarations ONSS
- **Acteurs**: Consultant, Service ONSS, Service Validation
- **Flux**: Sélection → Validation NISS/DIMONA → Génération XML → Export

### SC-12: Support aux Clients
- **Fichier**: `SC-12-Support-Consultant.puml`
- **Description**: Gestion des tickets support formels avec FAQ
- **Acteurs**: Consultant, Client, Service Tickets
- **Flux**: Création ticket → Consultation FAQ → Réponse → Clôture / Suivi → Évaluation

### SC-25: Connexion Consultant
- **Fichier**: `SC-25-Connexion-Consultant.puml`
- **Description**: Authentification et accès au système Consultant
- **Acteurs**: Consultant, Service Authentification
- **Flux**: Connexion → Validation credentials → Accès tableau de bord

### SC-26: Gérer Clients
- **Fichier**: `SC-26-Gerer-Clients.puml`
- **Description**: CRUD des clients avec profils et contrats
- **Acteurs**: Consultant, Service Clients
- **Flux**: Création → Consultation → Modification → Clôture

### SC-27: Gérer Employés
- **Fichier**: `SC-27-Gerer-Employes.puml`
- **Description**: Gestion des fiches employés et contrats
- **Acteurs**: Consultant, Service Employés
- **Flux**: Création → Modification → Contrats → Termination

### SC-28: Gérer Alertes
- **Fichier**: `SC-28-Gerer-Alertes.puml`
- **Description**: Configuration et suivi des alertes système
- **Acteurs**: Consultant, Service Alertes
- **Flux**: Configuration → Notification → Suivi → Résolution

### SC-29: Dashboard Consultant
- **Fichier**: `SC-29-Dashboard-Consultant.puml`
- **Description**: Tableau de bord personnalisé du Consultant
- **Acteurs**: Consultant, Service Statistiques
- **Flux**: Accès dashboard → Statistiques → Graphiques → Export

### SC-30: Synchronisation Exact Online
- **Fichier**: `SC-30-Sync-Exact.puml`
- **Description**: Synchronisation comptabilité avec Exact Online
- **Acteurs**: Consultant, Service Sync, API Exact
- **Flux**: Initialisation → Synchronisation → Validation → Erreurs

### SC-31: Messagerie Client
- **Fichier**: `SC-31-Messagerie.puml`
- **Description**: Communication directe et informelle avec clients
- **Acteurs**: Consultant, Client, Service Messages
- **Flux**: Réception message → Consultation → Réponse → Notification

### SC-32: Templates Documents
- **Fichier**: `SC-32-Templates-Documents.puml`
- **Description**: Gestion des modèles de documents
- **Acteurs**: Consultant, Service Templates
- **Flux**: Création → Modification → Publication → Utilisation

### SC-33: Export & Import Données
- **Fichier**: `SC-33-Export-Import.puml`
- **Description**: Export et import de données consolidées
- **Acteurs**: Consultant, Service Import/Export
- **Flux**: Sélection données → Validation → Export → Archivage

---

## 🔗 Relations avec d'autres diagrammes

| Diagramme | Type | Référence |
|-----------|------|-----------|
| Cas d'utilisation | UC-03-10 | Génération Fiche Paie |
| Cas d'utilisation | UC-03-15 | Gestion Paie |
| Cas d'utilisation | UC-03-40 | Validation ONSS |
| Cas d'utilisation | UC-03-30 | Support Clients |
| Cas d'utilisation | UC-03-05 | Connexion Consultant |
| Cas d'utilisation | UC-03-20 | Gérer Clients |
| Cas d'utilisation | UC-03-35 | Gérer Employés |
| Cas d'utilisation | UC-03-45 | Gérer Alertes |
| Cas d'utilisation | UC-03-50 | Dashboard Consultant |
| Cas d'utilisation | UC-03-55 | Sync Exact Online |
| Cas d'utilisation | UC-03-60 | Messagerie |
| Cas d'utilisation | UC-03-65 | Templates Documents |
| Cas d'utilisation | UC-03-70 | Export/Import |
| Classe | Consultant-Classes.puml | Entités et services |
| Package | Consultant-Package-Diagram.puml | Architecture packages |
| Séquence | UC-03-*.puml | Détails interactions |

---

## ✅ Statut
- ✓ Tous les diagrammes en français
- ✓ Cohérence vérifiée avec cas d'utilisation
- ✓ Services et interactions documentés
- ✓ SC-05 déplacé de AdminSecretariat
- ✓ SC-12 et SC-31 clarifiés (Support vs Messagerie)
- ✓ Prêts pour utilisation

# Diagrammes de Collaboration - AdminSecretariat

## 📋 Aperçu
Diagrammes de collaboration pour les cas d'utilisation de **l'AdminSecretariat** (administrateur de secrétariat).

---

## 📁 Fichiers

### SC-02: Dashboard AdminSecretariat
- **Fichier**: `SC-02-Dashboard-AdminSecretariat.puml`
- **Description**: Tableau de bord avec statistiques, alertes et rapports
- **Acteurs**: AdminSecretariat, Service Statistiques, Service Alertes
- **Flux**: Accès dashboard → Statistiques → Alertes → Rapports → Export

### SC-04: Configuration Secrétariat
- **Fichier**: `SC-04-Configuration-Secretariat.puml`
- **Description**: Configuration des paramètres secrétariat et White-Label
- **Acteurs**: AdminSecretariat, Service Secrétariat, Service Paramètres
- **Flux**: Configuration → Paramètres → Clés API → Abonnement

### SC-06: Import Données
- **Fichier**: `SC-06-Import-Donnees.puml`
- **Description**: Import et validation des données paie depuis CSV
- **Acteurs**: AdminSecretariat, Service Import, Service Validation
- **Flux**: Upload → Validation structure → Validation données → Transformation → Import

### SC-10: Gestion Documents
- **Fichier**: `SC-10-Gestion-Documents.puml`
- **Description**: Upload, modification et suppression de documents sécurisés
- **Acteurs**: AdminSecretariat, Service Documents, Service Stockage
- **Flux**: Upload → Stockage → Versioning → Modification → Suppression

### SC-13: Gestion Personnel
- **Fichier**: `SC-13-Gestion-Personnel.puml`
- **Description**: CRUD employés et contrats avec validation NISS
- **Acteurs**: AdminSecretariat, Service Employés, Service Contrats
- **Flux**: Création → Validation NISS → Contrat → Modification → Termination

### SC-50: Audit Logs
- **Fichier**: `SC-50-Audit-Logs.puml`
- **Description**: Consultation des logs d'audit du secrétariat avec filtrage et export
- **Acteurs**: AdminSecretariat, AuditLog Service, Cache Service, Storage Service, Email Service
- **Flux**: Accès → Récupération logs → Affichage → Filtrage → Consultation détails → Export optionnel

### SC-51: Export RGPD
- **Fichier**: `SC-51-Export-RGPD.puml`
- **Description**: Export des données (RGPD - Droit à la portabilité) avec chiffrement et droit à l'oubli
- **Acteurs**: AdminSecretariat, Data Export Service, Encryption Service, Storage Service (S3), Email Service, Job Queue
- **Flux**: Demande export → Génération asynchrone → Chiffrement AES-256 → Stockage S3 → Livraison sécurisée → Alternative: Suppression planifiée (30j)

---

## 🔗 Relations avec d'autres diagrammes

| Diagramme | Type | Référence |
|-----------|------|-----------|
| Cas d'utilisation | UC-02-00 | Gestion Personnel |
| Cas d'utilisation | UC-02-02 | Inscription (SC-22) |
| Cas d'utilisation | UC-02-20 | Abonnement |
| Cas d'utilisation | UC-02-30 | Configuration Secrétariat |
| Cas d'utilisation | UC-02-40 | Dashboard AdminSecretariat |
| Cas d'utilisation | UC-02-50 | Audit Logs (SC-50) |
| Cas d'utilisation | UC-02-60 | Export RGPD (SC-51) |
| Classe | AdminSecretariat-Classes.puml | Entités et services |
| Package | AdminSecretariat-Package-Diagram.puml | Architecture packages |
| Séquence | UC-02-*.puml | Détails interactions |

---

## ✅ Statut
- ✓ Tous les diagrammes en français
- ✓ Cohérence vérifiée avec cas d'utilisation
- ✓ Services et interactions documentés
- ✓ Prêts pour utilisation

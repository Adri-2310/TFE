# Diagrammes de Collaboration - SuperAdmin

## 📋 Aperçu
Diagrammes de collaboration pour les cas d'utilisation du **SuperAdmin** (administrateur système global).

---

## 📁 Fichiers

### SC-01: Authentification SuperAdmin
- **Fichier**: `SC-01-Authentification-SuperAdmin.puml`
- **Description**: Processus complet de connexion avec validation 2FA
- **Acteurs**: SuperAdmin, Service Auth, Session Manager
- **Flux**: Saisie → Validation → MFA → Session → Dashboard

### SC-03: Gestion des Utilisateurs
- **Fichier**: `SC-03-Gestion-Utilisateurs.puml`
- **Description**: CRUD d'utilisateurs avec assignation de rôles RBAC
- **Acteurs**: SuperAdmin, Service Utilisateurs, Service RBAC
- **Flux**: Création → Attribution rôles → Modification → Désactivation

### SC-14: Gestion RGPD & Conformité Données
- **Fichier**: `SC-14-Gestion-Donnees.puml`
- **Description**: Gestion des droits d'accès, suppressions et audits RGPD
- **Acteurs**: SuperAdmin, Service RGPD, Service Audit, Service Sécurité
- **Flux**: Droit d'accès → Collecte → Anonymisation → Export / Suppression → Audit

### SC-15: Gérer Secrétariats
- **Fichier**: `SC-15-Gerer-Secretariats.puml`
- **Description**: Administration des comptes secrétariat et leurs configurations
- **Acteurs**: SuperAdmin, Service Secrétariat
- **Flux**: Création → Configuration → Modification → Suspension/Activation

### SC-16: Dashboard Global
- **Fichier**: `SC-16-Dashboard-Global.puml`
- **Description**: Vue globale du système avec statistiques et alertes critiques
- **Acteurs**: SuperAdmin, Service Statistiques
- **Flux**: Accès dashboard → Statistiques globales → Alertes → Rapports

### SC-17: Configuration Système
- **Fichier**: `SC-17-Configuration-Systeme.puml`
- **Description**: Paramètres globaux, thèmes, langue, séquences numérotation
- **Acteurs**: SuperAdmin, Service Configuration
- **Flux**: Accès paramètres → Modification → Validation → Application

### SC-18: Audit & Logs
- **Fichier**: `SC-18-Audit-Logs.puml`
- **Description**: Consultation et génération de logs d'audit avec filtres avancés
- **Acteurs**: SuperAdmin, Service Audit
- **Flux**: Consultation → Filtrage → Recherche → Export → Archivage

### SC-19: Veille Législative
- **Fichier**: `SC-19-Veille-Legislatives.puml`
- **Description**: Suivi des mises à jour législatives et notifications
- **Acteurs**: SuperAdmin, Service Législatif
- **Flux**: Abonnement → Notification → Consultation → Validation → Déploiement

### SC-20: Gestion API
- **Fichier**: `SC-20-Gerer-API.puml`
- **Description**: Création et gestion des clés API pour intégrations externes
- **Acteurs**: SuperAdmin, Service API
- **Flux**: Création clé → Attribution permissions → Monitoring → Révocation

### SC-21: White-Label Management
- **Fichier**: `SC-21-White-Label.puml`
- **Description**: Configuration du branding et personnalisation pour clients
- **Acteurs**: SuperAdmin, Service Customization
- **Flux**: Paramètres branding → Logo/Couleurs → Domaines custom → Application

---

## 🔗 Relations avec d'autres diagrammes

| Diagramme | Type | Référence |
|-----------|------|-----------|
| Cas d'utilisation | UC-01-00 | Authentification SuperAdmin |
| Cas d'utilisation | UC-01-20 | Gestion Utilisateurs |
| Cas d'utilisation | UC-01-50 | Gérer RGPD & Conformité |
| Cas d'utilisation | UC-01-10 | Gérer Secrétariats |
| Cas d'utilisation | UC-01-30 | Dashboard Global |
| Cas d'utilisation | UC-01-40 | Configuration Système |
| Cas d'utilisation | UC-01-50 | Audit & Logs |
| Cas d'utilisation | UC-01-60 | Veille Législative |
| Cas d'utilisation | UC-01-70 | Gestion API |
| Cas d'utilisation | UC-01-80 | White-Label |
| Classe | SuperAdmin-Classes.puml | Entités et services |
| Package | SuperAdmin-Package-Diagram.puml | Architecture packages |
| Séquence | UC-01-*.puml | Détails interactions |

---

## ✅ Statut
- ✓ Tous les diagrammes en français
- ✓ Cohérence vérifiée avec cas d'utilisation
- ✓ Services et interactions documentés
- ✓ SC-14 mappé à UC-01-04, 05, 06
- ✓ Prêts pour utilisation

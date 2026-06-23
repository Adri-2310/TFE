# Diagrammes de Collaboration - Employe

## 📋 Aperçu
Diagrammes de collaboration pour les cas d'utilisation de l'**Employe** (employé d'une entreprise cliente).

---

## 📁 Fichiers

### SC-08: Consultation Fiche de Paie
- **Fichier**: `SC-08-Consultation-FichePaie.puml`
- **Description**: Visualisation et téléchargement de fiches de paie avec masquage de données sensibles
- **Acteurs**: Employe, Service Paie, Service Sécurité
- **Flux**: Connexion → Consultation → Sélection → Téléchargement → Historique

### SC-09: Demande de Congés
- **Fichier**: `SC-09-Demande-Conges.puml`
- **Description**: Demande de congés avec workflow d'approbation par service
- **Acteurs**: Employe, Service Congés, Service Approbation
- **Flux**: Accès → Remplissage → Soumission → Approbation/Rejet → Vérification statut

---

## 🔗 Relations avec d'autres diagrammes

| Diagramme | Type | Référence |
|-----------|------|-----------|
| Cas d'utilisation | UC-05-10 | Consulter Fiche Paie |
| Cas d'utilisation | UC-05-60 | Demander Congés |
| Classe | Employe-Classes.puml | Entités et services |
| Package | Employe-Package-Diagram.puml | Architecture packages |
| Séquence | UC-05-*.puml | Détails interactions |

---

## ✅ Statut
- ✓ Tous les diagrammes en français
- ✓ Cohérence vérifiée avec cas d'utilisation
- ✓ Services et interactions documentés
- ✓ Prêts pour utilisation

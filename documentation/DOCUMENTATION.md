# Documentation des Cas d'Utilisation - WorkZen Phase 1

**Projet :** WorkZen - Plateforme Multi-Tenant pour Secrétariats Sociaux
**Phase :** Phase 1 (Juillet 2025 - Juin 2027)
**Version :** 1.0
**Date :** Janvier 2026

---

## Table des Matières

1. [Introduction](#introduction)
2. [Acteurs du Système](#acteurs-du-système)
3. [Vue d'Ensemble des Diagrammes](#vue-densemble-des-diagrammes)
4. [Cas d'Utilisation SuperAdmin](#cas-dutilisation-superadmin)
5. [Cas d'Utilisation Admin Secrétariat](#cas-dutilisation-admin-secrétariat)
6. [Architecture Multi-Tenant](#architecture-multi-tenant)
7. [Système Externe : Stripe](#système-externe--stripe)
8. [Matrice de Traçabilité](#matrice-de-traçabilité)

---

## Introduction

Ce document présente l'ensemble des cas d'utilisation de la plateforme WorkZen en Phase 1. La plateforme est une solution SaaS multi-tenant destinée aux secrétariats sociaux belges pour gérer leurs clients, employés et générer des fiches de paie.

### Périmètre Phase 1

La Phase 1 se concentre sur **2 rôles fonctionnels** :
- **SuperAdmin** : Administrateur global de la plateforme
- **Admin Secrétariat** : Administrateur d'un secrétariat social spécifique

### Rôles Préparés (Futures Phases)

Les rôles suivants sont préparés au niveau de la base de données mais n'ont pas d'interface fonctionnelle en Phase 1 :
- **Consultant** (Phase 2)
- **Client** (Phase 3)
- **Employé** (Phase 3)

---

## Acteurs du Système

### 1. SuperAdmin

**Description :** Administrateur global de la plateforme WorkZen
**Rôle :** `SUPER_ADMIN`
**Accès :** Vue globale sur tous les secrétariats et utilisateurs
**Authentification :** 2FA obligatoire (Google Authenticator)

**Responsabilités :**
- Gestion complète des secrétariats sociaux
- Création et gestion des Admin Secrétariat
- Monitoring et analytics globaux
- Configuration des plans d'abonnement
- Consultation des logs système

---

### 2. Admin Secrétariat

**Description :** Administrateur d'un secrétariat social spécifique
**Rôle :** `SECRETARIAT_ADMIN`
**Accès :** Vue isolée limitée à son secrétariat (`secretariatId`)
**Authentification :** Authentification standard

**Responsabilités :**
- Gestion de son profil
- Consultation du dashboard de son secrétariat
- Visualisation des paramètres et utilisateurs de son secrétariat
- Gestion de l'abonnement via Stripe Customer Portal

---

### 3. Stripe (Système Externe)

**Description :** Plateforme de paiement externe
**Type :** Acteur secondaire (système)
**Rôle :** Gestion des paiements et abonnements

**Services fournis :**
- Traitement des paiements
- Gestion des abonnements (plans Starter, Pro, Enterprise)
- Customer Portal pour les clients
- Webhooks pour synchronisation

---

## Vue d'Ensemble des Diagrammes

### Diagrammes Disponibles

1.**`use-cases-superadmin.drawio`**
   - Diagramme spécifique au SuperAdmin
   - 15 cas d'utilisation organisés par catégorie
   - Relations avec le système Stripe

2.**`use-cases-admin-secretariat.drawio`**
   - Diagramme spécifique à l'Admin Secrétariat
   - 14 cas d'utilisation avec isolation des données
   - Intégration Stripe Customer Portal

---

## Système Externe : Stripe

### Intégration Stripe

#### Plans d'Abonnement

| Plan | Prix | Clients | Utilisateurs | Stockage |
|------|------|---------|--------------|----------|
| **Starter** | 99€/mois | 25 | 3 | 5 GB |
| **Pro** | 299€/mois | 100 | 10 | 20 GB |
| **Enterprise** | Sur devis | Illimité | Illimité | Illimité |

---

## Évolution Future

### Phase 2 (Post-TFE)

**Nouveau rôle :** Consultant

**Use Cases prévus :**
- Gestion des clients (entreprises)
- Gestion des employés
- Génération de fiches de paie
- Calendrier ONSS
- Export de documents

**Estimation :** +15 cas d'utilisation

---

### Phase 3 (Portail Client)

**Nouveaux rôles :** Client, Employé

**Use Cases prévus :**
- Portail client pour consulter les documents
- Portail employé pour voir les fiches de paie
- Gestion des demandes (congés, absences)

**Estimation :** +10 cas d'utilisation

---

## Annexes

### Technologies Utilisées

- **Frontend :** Next.js 15, React 19, TypeScript, Tailwind CSS, ShadcnUI
- **Backend :** Next.js API Routes, Prisma ORM
- **Base de données :** PostgreSQL (Supabase)
- **Authentification :** Better Auth (avec 2FA)
- **Paiements :** Stripe
- **Déploiement :** Vercel
- **Monorepo :** Turborepo

### Références

- Documentation Stripe : https://stripe.com/docs
- Next.js : https://nextjs.org/docs
- Prisma : https://www.prisma.io/docs
- Better Auth : https://better-auth.com/docs

---

**Document créé le :** Janvier 2026
**Dernière mise à jour :** Janvier 2026
**Version :** 1.0
**Auteur :** WorkZen Team

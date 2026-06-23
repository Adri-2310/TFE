# 🎨 Maquettes SocialFlow - Présentation Client

**Version :** 1.0  
**Date :** Juin 2025  
**Thème :** Light Mode (Dark Mode en développement)  
**Framework :** Tailwind CSS 3 + HTML5

---

## 📋 Table des matières

1. [Palette de couleurs](#palette)
2. [Pages créées](#pages)
3. [Comment utiliser](#utilisation)
4. [Détails par page](#détails)

---

## 🎨 Palette de couleurs {#palette}

| Élément | Couleur | Hex | Usage |
|---------|---------|-----|-------|
| **Primaire** | Bleu calmant | `#0F7BA7` | Boutons principaux, headers, highlights |
| **Secondaire** | Vert confiance | `#10B981` | États positifs, succès, confirmations |
| **Accent** | Orange chaleureux | `#F97316` | CTAs, alertes, notifications |
| **Danger** | Rouge doux | `#EF4444` | Suppression, erreurs critiques |
| **Warning** | Ambre | `#F59E0B` | Avertissements, suspensions |
| **Light BG** | Blanc/Gris très clair | `#FFFFFF` / `#F9FAFB` | Fonds |
| **Dark BG** | Gris foncé | `#1E293B` / `#0F172A` | Dark mode (futur) |

---

## 📄 Pages créées {#pages}

### ✅ Phase 1 - Pages prioritaires

| # | Page | Fichier | Rôle | Statut |
|---|------|---------|------|--------|
| 1 | Landing Page | `01-landing-page.html` | Visite publique | ✅ Prête |
| 2 | Login | `02-login.html` | Connexion SuperAdmin | ✅ Prête |
| 3 | Register | `03-register.html` | Inscription Admin Secrétariat | ✅ Prête |
| 4 | Logout | `04-logout.html` | Déconnexion | ✅ Prête |
| 5 | Dashboard SuperAdmin | `05-dashboard-superadmin.html` | Vue d'ensemble admin | ✅ Prête |
| 6 | Gestion Secrétariats | `06-gestion-secretariats.html` | CRUD secrétariats | ✅ Prête |

### 🔜 Phase 2 - À créer

- Gestion Utilisateurs
- Logs d'Audit
- Configuration Système
- Gestion API
- Veille Législative
- White-label
- Portails Consultant, Client, Employé

---

## 🚀 Comment utiliser {#utilisation}

### Option 1 : Visualiser directement
```bash
# Ouvrir dans le navigateur
open documentation/maquettes/01-landing-page.html
```

### Option 2 : Convertir en PNG pour présentation client
```bash
# Avec Puppeteer (Node.js)
npx puppeteer --screenshot documentation/maquettes/01-landing-page.html

# Avec Playwright
npx playwright codegen documentation/maquettes/01-landing-page.html

# Avec Chrome (manuel)
1. Ouvrir le fichier HTML dans Chrome
2. Outils de dev (F12) → Imprimer (Ctrl+P)
3. Enregistrer en PDF/PNG
```

### Option 3 : Intégrer dans Figma/XD
```bash
# Copier le code HTML et utiliser :
# - Figma : File → Import (via plugin HTML)
# - Adobe XD : File → Open (drag & drop HTML)
# - Ou exporter screenshot du navigateur
```

### Option 4 : Utiliser comme base de développement
```bash
# Tous les fichiers sont prêts à être :
# - Copiés dans le projet Next.js
# - Convertis en composants React
# - Adaptés à Shadcn/UI + TweakCN
```

---

## 📊 Détails par page {#détails}

### 1️⃣ Landing Page
**Fichier :** `01-landing-page.html`

**Contenu :**
- Navigation header avec boutons Login/Register
- Hero section avec gradient sombre + preview dashboard
- Stats temps réel (2400+ employés, 99.9% uptime, ISO 27001)
- 6 cartes de fonctionnalités avec icônes SVG
- Section sécurité avec badges (AES-256, RGPD, ISO 27001, SLA)
- Grille tarifaire 3 plans (Starter, Pro populaire, Enterprise)
- Footer complet avec liens légaux

**Sécurité intégrée :**
- Aucune donnée sensible affichée
- Lien vers mentions légales/RGPD
- CTA "Demander démo" (destiné à formulaire)

**Responsive :**
- ✅ Mobile (< 640px)
- ✅ Tablet (640px - 1024px)
- ✅ Desktop (> 1024px)

---

### 2️⃣ Login
**Fichier :** `02-login.html`

**Contenu :**
- Split screen 50/50 (gauche : marketing + quote, droite : formulaire)
- Email + Password (avec toggle visibility)
- Badge "2FA conseillé" avec lien vers setup
- Bouton SSO Google Workspace
- Lien "Mot de passe oublié"
- Footer sécurité (TLS 1.3, ISO 27001, Hébergement EU)

**Sécurité intégrée :**
- Aucun stockage en localStorage côté client (code illustration)
- Badge audit trail mentionné en footer
- Toggle password loggé côté serveur
- Rate limiting simulé (3 tentatives restantes)

**States :**
- Default (vide)
- Filled (données saisies)
- Loading (bouton spinner)
- Error (message générique)
- Success (redirect)

---

### 3️⃣ Register
**Fichier :** `03-register.html`

**Contenu :**
- Stepper 3 étapes (Step 1 → 2 → 3)
  - **Étape 1** : Nom, Email, Password (force indicator), Confirm Password
  - **Étape 2** : Nom secrétariat, TVA, Sélection plan
  - **Étape 3** : Récapitulatif + checkbox RGPD/DPA + checkbox conditions

**Sécurité intégrée :**
- Force du mot de passe (barre colorée rouge → vert)
- Email masqué dans le récapitulatif
- Checkbox DPA RGPD obligatoire et distincte
- Indication "MFA sera disponible après inscription"
- Validation côté client (illustration)

**Points clés :**
- Indicateur de progression visuellement clair
- Boutons Back/Next actifs/inactifs selon validation
- Récapitulatif complet avant soumission

---

### 4️⃣ Logout
**Fichier :** `04-logout.html`

**Contenu :**
- Animation SVG check (stroke animation CSS)
- Message de succès "Déconnexion réussie"
- Résumé session : durée, device, timestamp, email masqué (a****@example.com)
- Notice audit trail avec shield icon
- Deux CTAs : "Se reconnecter" ou "Retour accueil"

**Sécurité intégrée :**
- Confirmation de suppression des données sensibles
- Indication audit trail loggé
- Temps de session affiché (transparence)
- Pas de possibilité de "back" vers données précédentes

**Animation :**
- Check SVG avec stroke-dashoffset CSS
- Fade-in séquentiels des sections

---

### 5️⃣ Dashboard SuperAdmin
**Fichier :** `05-dashboard-superadmin.html`

**Contenu :**
- **Sidebar fixe gauche** : Navigation complète (Dashboard, Secrétariats, Utilisateurs, Logs, Config, API, Veille, White-label)
- **Header** : Logo SocialFlow + Alerte législative banner orange
- **KPIs cards (4)** :
  - Secrétariats actifs : 47
  - Utilisateurs totaux : 3,241
  - Incidents critiques : 2
  - Uptime système : 99.97%
- **Graphique barres CSS** : Activité juin 2025 (jours vs requêtes)
- **Feed d'activité** : 8 événements temps réel (icônes colorées, timestamp masqué pour sécurité)
- **Tableau secrétariats récents** : 5 derniers avec statut + plan + nb utilisateurs
- **Jauges système** : CPU 34%, RAM 77%, Stockage 47%

**Sécurité intégrée :**
- Montants masqués (stripe****)
- Seul le SuperAdmin accède à cette vue
- Logs audit de chaque consultation du dashboard
- Aucune clé API visible
- Données en temps réel mais mise à jour côté serveur

**Navigation :**
- Sidebar toujours visible (links vers autres pages)
- Breadcrumb : Dashboard > Accueil
- Mode dark (toggle future)

---

### 6️⃣ Gestion Secrétariats (CRUD)
**Fichier :** `06-gestion-secretariats.html`

**Contenu :**

**Barre de recherche et filtres :**
- Champ recherche texte (nom secrétariat)
- Dropdown Statut (Tous, Actif, Essai, Suspendu)
- Dropdown Plan (Tous, Starter, Pro, Enterprise)
- Bouton "Réinitialiser filtres"
- Bouton "+ Nouveau secrétariat" (CTA primaire)

**Tableau principal :**
- Colonnes : Checkbox, Nom, Plan, Statut (badge), Nb utilisateurs, Date création, Actions
- Rows surlignable au hover
- Rows suspendu : fond rouge léger, texte strikethrough
- Pagination : Pages numérotées 1-5, "Suivant", etc.
- Export CSV button

**4 Modals interactives :**

#### Modal 1 : Détail secrétariat
- Infos légales (TVA, siège social masqué partiellement)
- Usage stats (nb fiches paie ce mois, stockage utilisé)
- Audit trail des 5 dernières actions
- Boutons : Éditer, Suspendre, Supprimer, Fermer

#### Modal 2 : Édition
- Champ Nom (éditable)
- Champ Plan (sélecteur)
- Toggle "Actif/Inactif"
- Textarea notes internes
- Boutons : Sauvegarder, Annuler
- Confirmation si changement plan (impact facturation)

#### Modal 3 : Suspension
- Alert rouge "Suspension du secrétariat"
- Dropdown motif obligatoire (Dépassement quota, Impaiement, Violation CGU, Autre)
- Textarea motif détaillé
- Checkbox "Notifier le client par email"
- Boutons : Confirmer suspension, Annuler

#### Modal 4 : Suppression
- Alert danger rouge "Suppression définitive"
- Message : "Cette action est irréversible"
- Info : "Tous les secrétariats seront perdus"
- Champ texte "Confirmez en saisissant : NOMSECRÉTARIAT"
- Bouton "Supprimer" activé uniquement si exact match
- Bouton "Annuler"

**Sécurité intégrée :**
- Email masqué (a****@example.com)
- Montants Stripe masqués (stripe****)
- Soft delete avant suppression physique (suspendre d'abord)
- Double confirmation (confirmation + re-saisie du nom)
- Toutes les actions loggées dans l'audit trail

---

## 🔒 Considérations de sécurité appliquées

### Masquage de données
- ✅ Emails : `a****@example.com`
- ✅ Montants Stripe : `stripe****` (toggle pour révéler, loggé)
- ✅ Clés API : `sk_live****` (masqué par défaut)
- ✅ Tokens : Jamais affichés

### Audit Trail
- ✅ Toutes les actions critiques loggées (IP, user, timestamp, device)
- ✅ Confirmation avant suppression / suspension
- ✅ Soft delete avant suppression physique
- ✅ Notification utilisateur avant actions irréversibles

### Sécurité UI/UX
- ✅ Rate limiting visuel (tentatives restantes)
- ✅ MFA conseillé (badge sur login)
- ✅ Authentification SSO Google/Microsoft
- ✅ Session timeout clairement indiqué
- ✅ Pas de données sensibles dans les URLs
- ✅ Formulaires sans auto-save (prévient fuites)

### RGPD
- ✅ Droit à l'oubli (bouton anonymisation)
- ✅ Portabilité des données (export avant suppression)
- ✅ Consentement explicite (DPA, conditions)
- ✅ Rétention configurée (UC-01-40)
- ✅ Transparence audit trail

---

## 📦 Prochaines étapes

### Pour le client
1. ✅ Visualiser les maquettes (fichiers HTML ouverts dans navigateur)
2. ✅ Convertir en PDF/PNG pour présentation deck
3. ⏳ Feedback sur layout, couleurs, fonctionnalités
4. ⏳ Approbation avant développement

### Pour le développement
1. ⏳ Adapter à Next.js + TypeScript
2. ⏳ Intégrer Shadcn/UI + TweakCN customization
3. ⏳ Créer les 6 pages manquantes (Utilisateurs, Logs, Config, etc.)
4. ⏳ Ajouter Dark Mode
5. ⏳ Intégrer backend API + authentification

### Pour les portails futurs
- AdminSecretariat (maquettes similaires, périmètre limité)
- Consultant, Client, Employé (portails métier)

---

## 📞 Support

**Questions sur les maquettes ?**
- Couleurs : Modifiables facilement (chercher `#0F7BA7`, etc. dans le HTML)
- Layout : Responsive dès maintenant, adapté mobile/tablet/desktop
- Composants : Basés sur Shadcn/UI patterns, prêts à être convertis en React

**Pour convertir en PNG pour le client :**
```bash
# Chrome DevTools → F12 → Imprimer (Ctrl+P)
# → Destination : Enregistrer en PDF/PNG
```

---

**Créé avec ❤️ pour SocialFlow**  
*Maquettes modernes, sécurisées, RGPD-compliant*

# SocialFlow — Maquettes interactives (Phase 1)

Prototype HTML/Tailwind autonome pour la plateforme SaaS de gestion de la paie
(secrétariats sociaux / cabinets RH belges).

## Comment ouvrir

Ouvrez **`index.html`** dans un navigateur (double-clic). C'est le hub de
navigation vers tous les écrans. Aucune installation, aucun serveur : chaque
fichier charge Tailwind, les icônes Lucide et les polices via CDN.

> Une connexion internet est requise (CDN Tailwind + Lucide + Google Fonts).

## Stack de la maquette

- **Tailwind CSS** (CDN) configuré aux couleurs de marque : violet `brand` + teal.
- **Lucide** pour les icônes.
- **JavaScript vanilla** pour simuler l'interactivité (aucun build).
- **`assets/theme.js`** : config Tailwind partagée + gestion du mode clair/sombre
  (persisté en `localStorage`, respecte la préférence système).

Les maquettes reproduisent l'intention visuelle du futur front réel
(Next.js 16 + React 19 + Tailwind 4 + ShadcnUI) : mêmes couleurs, mêmes
composants (Card, Table, Dialog, Tabs, Badge, Progress, Toast…), pour une
transition 1:1 vers l'implémentation.

## Écrans livrés

| # | Fichier | Rôle | Contenu |
|---|---------|------|---------|
| 01 | `01-landing.html` | Public | Hero, features, rôles, tarifs, FAQ, CTA |
| 02 | `02-auth.html` | Public | Login / Register cabinet / Mot de passe oublié |
| 03 | `03-dashboard-superadmin.html` | SuperAdmin | Monitoring, cabinets, audit |
| 04 | `04-dashboard-cabinet.html` | Cabinet RH | KPIs, clients, gestionnaires, facturation |

---

### 01 — Landing page
- **Flux utilisateur** : le prospect découvre la valeur → clique « Essai gratuit » → `02-auth.html#register`.
- **Composants** : navbar sticky, hero avec aperçu produit, bandeau de confiance, grille de features, cartes de rôles, grille de tarifs, accordéon FAQ, CTA final, footer.
- **Interactions** : menu mobile, switch tarif mensuel/annuel (recalcule les prix), accordéon FAQ, toggle thème, smooth scroll sur les ancres.

### 02 — Authentification
- **Flux utilisateur** : connexion → dashboard ; ou création de cabinet → dashboard ; ou récupération de mot de passe.
- **Composants** : split-screen (panneau de marque + formulaire), boutons OAuth Google/Microsoft, inputs à icône, jauge de robustesse du mot de passe.
- **Interactions** : bascule des vues via ancres (`#login`, `#register`, `#forgot`), afficher/masquer le mot de passe, validation e-mail en direct, jauge de robustesse, soumission simulée (redirige vers le dashboard cabinet).

### 03 — Dashboard SuperAdmin
- **Flux utilisateur** : supervise la santé plateforme → filtre les cabinets → suspend/réactive un cabinet → consulte l'audit.
- **Composants** : app-shell (sidebar + topbar), 4 cartes KPI, barres de santé système (Progress), répartition des plans, table filtrable, modale de confirmation, toast, journal d'audit.
- **Interactions** : recherche live + filtre par statut sur la table, ouverture de la modale de suspension + confirmation (met à jour la ligne + toast), réactivation, toggle thème, sidebar mobile.

### 04 — Dashboard Cabinet RH
- **Flux utilisateur** : consulte ses KPIs → gère entreprises clientes → gère gestionnaires → suit son abonnement Stripe.
- **Composants** : app-shell, 4 cartes KPI, système d'onglets (Entreprises / Gestionnaires / Facturation), table entreprises avec tags de secteur et états de paie, cartes gestionnaires, carte plan + jauges d'usage, historique de factures, modale de création.
- **Interactions** : navigation par onglets, recherche live sur les entreprises, modale « Nouvelle entreprise » (ajoute une ligne + toast), invitation gestionnaire, actions facturation, toggle thème, sidebar mobile.

---

## Accessibilité & responsive

- Contrastes conformes **WCAG AA**, `aria-label` sur les boutons d'icône, focus visibles.
- **Mobile-first** : sidebar coulissante sur mobile, grilles adaptatives, tables scrollables.
- **Mode clair + sombre** sur tous les écrans (bouton soleil/lune, préférence mémorisée).

## Phase 2 (à venir)
Dashboard Gestionnaire · Formulaire fiche de paie (calcul temps réel + PDF) · Portail entreprise cliente.

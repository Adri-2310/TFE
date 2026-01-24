# Phase 1 TFE - Scope Final Révisé

**Période :** Juillet 2025 - Juin 2027
**Objectif :** Plateforme d'administration multi-tenant avec 2 rôles fonctionnels

---

## 🎯 Scope Définitif Phase 1

### Rôles Fonctionnels (Actifs dans le TFE)

#### 1. SuperAdmin ✅
- Dashboard global avec analytics
- CRUD secrétariats sociaux
- CRUD utilisateurs (SuperAdmin + Admin Secrétariat uniquement)
- Gestion des plans d'abonnement (Stripe)
- Configuration système
- Logs et monitoring

#### 2. Admin Secrétariat ✅
- Dashboard secrétariat (vue isolée)
- Voir son profil
- Paramètres de son secrétariat
- Liste de ses utilisateurs (lecture seule)
- Gérer son abonnement (Stripe Customer Portal)

### Rôles Préparés (Tables DB + enum, pas d'interface)

#### 3. Consultant 🔜 Phase 2
- Modèle User avec `role: CONSULTANT` existe
- Pas d'interface fonctionnelle
- Middleware redirige vers "Coming in Phase 2"

#### 4. Client 🔜 Phase 3
- Modèle User avec `role: CLIENT` existe
- Pas d'interface fonctionnelle

#### 5. Employé 🔜 Phase 3
- Modèle User avec `role: EMPLOYEE` existe
- Pas d'interface fonctionnelle

---

## 📊 Architecture Multi-Tenant

### Isolation des données

```typescript
// Middleware d'isolation
export async function middleware(request: NextRequest) {
  const session = await getSession();
  const path = request.nextUrl.pathname;

  // Routes SuperAdmin : accès global
  if (path.startsWith('/admin')) {
    if (session?.user.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect('/login');
    }
    // Pas de filtre secretariatId
    return NextResponse.next();
  }

  // Routes Secrétariat : isolation par secretariatId
  if (path.startsWith('/secretariat')) {
    if (session?.user.role !== 'SECRETARIAT_ADMIN') {
      return NextResponse.redirect('/login');
    }

    // Injecter le secretariatId dans les headers
    const headers = new Headers(request.headers);
    headers.set('x-secretariat-id', session.user.secretariatId);

    return NextResponse.next({
      request: {
        headers,
      },
    });
  }

  // Routes Phase 2/3 : pas encore disponibles
  if (path.startsWith('/consultant') ||
      path.startsWith('/portal') ||
      path.startsWith('/employee')) {
    return new Response('Available in Phase 2/3', { status: 503 });
  }

  return NextResponse.next();
}
```

### Requêtes avec isolation

```typescript
// API Route pour Admin Secrétariat
export async function GET(request: Request) {
  const session = await getSession();

  // SuperAdmin : voit tout
  if (session.user.role === 'SUPER_ADMIN') {
    const users = await prisma.user.findMany();
    return Response.json(users);
  }

  // Admin Secrétariat : voit uniquement son secrétariat
  if (session.user.role === 'SECRETARIAT_ADMIN') {
    const users = await prisma.user.findMany({
      where: {
        secretariatId: session.user.secretariatId,
      },
    });
    return Response.json(users);
  }

  return new Response('Forbidden', { status: 403 });
}
```

---

## 🗂️ Modèle de Données Phase 1

```prisma
// Modèles IMPLÉMENTÉS Phase 1
enum UserRole {
  SUPER_ADMIN        // ✅ Fonctionnel
  SECRETARIAT_ADMIN  // ✅ Fonctionnel
  CONSULTANT         // 🔜 Phase 2
  CLIENT             // 🔜 Phase 3
  EMPLOYEE           // 🔜 Phase 3
}

model User {
  id            String      @id @default(cuid())
  email         String      @unique
  password      String?
  role          UserRole
  firstName     String?
  lastName      String?

  secretariatId String?
  secretariat   Secretariat? @relation(fields: [secretariatId], references: [id])

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model Secretariat {
  id            String       @id @default(cuid())
  name          String
  vatNumber     String       @unique
  email         String

  users         User[]
  subscription  Subscription?

  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

model Subscription {
  id                    String    @id @default(cuid())

  stripeCustomerId      String    @unique
  stripeSubscriptionId  String    @unique
  plan                  String    // STARTER, PRO, ENTERPRISE
  status                String

  secretariatId         String    @unique
  secretariat           Secretariat @relation(fields: [secretariatId], references: [id])

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

model AuditLog {
  id            String   @id @default(cuid())
  userId        String?
  action        String
  entity        String
  entityId      String?

  createdAt     DateTime @default(now())
}

// Modèles PRÉPARÉS (pas utilisés Phase 1)
model Company {
  id              String      @id @default(cuid())
  name            String
  vatNumber       String      @unique

  secretariatId   String
  secretariat     Secretariat @relation(fields: [secretariatId], references: [id])

  // Relations Phase 2
  employees       Employee[]
  payrolls        Payroll[]

  createdAt       DateTime    @default(now())
}

model Employee {
  // À implémenter Phase 2
}

model Payroll {
  // À implémenter Phase 2
}
```

---

## 🖥️ Interfaces Phase 1

### Interface SuperAdmin

```
┌──────────────────────────────────────────────────────┐
│  WORKZEN ADMIN                  [Super Admin ▼]      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  🏠 Dashboard Global                                 │
│                                                      │
│  🏢 Secrétariats                                     │
│     • Liste                                          │
│     • Créer nouveau                                  │
│     • Voir détails / Modifier / Supprimer           │
│                                                      │
│  👥 Utilisateurs                                     │
│     • Liste (SuperAdmin + Admin Secrétariat)         │
│     • Créer nouveau                                  │
│     • Modifier / Désactiver                          │
│                                                      │
│  📊 Analytics                                        │
│     • Dashboard global                               │
│     • Stats par secrétariat                          │
│     • Export rapports                                │
│                                                      │
│  💰 Plans & Facturation                              │
│     • Gérer les plans                                │
│     • Stripe configuration                           │
│                                                      │
│  ⚙️ Configuration                                    │
│     • Paramètres globaux                             │
│     • Email settings                                 │
│                                                      │
│  📋 Logs                                             │
│     • Logs système                                   │
│     • Logs sécurité                                  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Interface Admin Secrétariat

```
┌──────────────────────────────────────────────────────┐
│  WORKZEN - Secrétariat Dupont   [Marc Dupont ▼]     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  🏠 Dashboard                                        │
│                                                      │
│  📊 Mon Secrétariat                                  │
│  ┌────────────────────────────────────────────────┐ │
│  │ Plan : Starter                                 │ │
│  │ Clients : 0 / 25                              │ │
│  │ Utilisateurs : 1 / 3                          │ │
│  │ Stockage : 0.0 GB / 5 GB                      │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  👤 Mon Profil                                       │
│     • Voir / Modifier mes informations               │
│                                                      │
│  ⚙️ Paramètres                                       │
│     • Informations secrétariat                       │
│     • Coordonnées                                    │
│                                                      │
│  👥 Utilisateurs                                     │
│     • Voir la liste (lecture seule)                  │
│     • (Création réservée au SuperAdmin Phase 1)      │
│                                                      │
│  💳 Mon Abonnement                                   │
│     • Plan actuel : Starter                          │
│     • [Gérer l'abonnement] → Stripe Portal          │
│     • Historique factures                            │
│                                                      │
│  🔜 Prochainement                                    │
│  ┌────────────────────────────────────────────────┐ │
│  │ Ces fonctionnalités seront disponibles         │ │
│  │ dans la Phase 2 (post-TFE) :                  │ │
│  │                                                │ │
│  │ • 🏢 Gestion des clients                       │ │
│  │ • 👨‍💼 Gestion des employés                      │ │
│  │ • 💰 Génération de fiches de paie              │ │
│  │ • 📅 Calendrier ONSS                           │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 🎬 Scénario de Démo TFE

### Partie 1 : SuperAdmin (8 min)

1. **Login SuperAdmin**
   - Email : admin@workzen.app
   - 2FA (Google Authenticator)

2. **Dashboard Global**
   - 5 secrétariats actifs
   - 12 utilisateurs (7 SuperAdmin, 5 Admin Secrétariat)
   - 850€ MRR
   - Graphiques évolution

3. **Créer un secrétariat**
   - Nouveau client : "Paie Plus SPRL"
   - TVA : BE0999888777
   - Plan : Starter
   - Email : contact@paieplus.be

4. **Créer l'Admin Secrétariat**
   - Email : admin@paieplus.be
   - Nom : Sophie Martin
   - Rôle : SECRETARIAT_ADMIN
   - Rattachement : Paie Plus SPRL

5. **Analytics**
   - Stats détaillées Secrétariat Dupont
   - Usage : 78% clients, 80% users
   - Proposition upgrade vers Pro

6. **Logs**
   - Dernières actions
   - Tentatives de connexion
   - Changements de rôle

### Partie 2 : Multi-Tenant (5 min)

7. **Déconnexion SuperAdmin**

8. **Login Admin Secrétariat**
   - Email : admin@paieplus.be
   - Password temporaire (reçu par email)

9. **Dashboard Secrétariat**
   - Vue isolée : ne voit QUE son secrétariat
   - Plan Starter
   - Limites : 0/25 clients, 1/3 users

10. **Gérer abonnement**
    - Clic sur "Gérer l'abonnement"
    - Redirection vers Stripe Customer Portal
    - Peut upgrade, voir factures, etc.

11. **Section "Prochainement"**
    - Montrer que l'interface est prête pour Phase 2
    - Les fonctionnalités métier arriveront après le TFE

### Partie 3 : Questions Jury (2 min)

**Q : "Pourquoi n'y a-t-il pas les consultants ?"**
> "L'architecture est prête. Les modèles existent, l'isolation fonctionne.
> La Phase 2 ajoutera les interfaces métier (gestion clients, paies).
> J'ai préféré avoir 2 rôles pleinement fonctionnels plutôt que 5 rôles
> incomplets."

**Q : "C'est vraiment multi-tenant ?"**
> "Oui, chaque Admin Secrétariat voit uniquement ses données.
> L'isolation se fait via secretariatId dans toutes les requêtes.
> Le SuperAdmin, lui, a une vue globale."

---

## 📝 Contenu du Rapport TFE

### Chapitre : Analyse - Use Cases

#### UC-01 : SuperAdmin

**Liste des use cases SuperAdmin :**
1. UC-01-01 : Créer un secrétariat ✅
2. UC-01-02 : Modifier un secrétariat ✅
3. UC-01-03 : Supprimer un secrétariat ✅
4. UC-01-04 : Consulter tous les secrétariats ✅
5. UC-01-05 : Créer un Admin Secrétariat ✅
6. UC-01-06 : Modifier un utilisateur ✅
7. UC-01-07 : Désactiver un compte ✅
8. UC-01-08 : Consulter dashboard global ✅
9. UC-01-09 : Voir stats par secrétariat ✅
10. UC-01-10 : Gérer les plans d'abonnement ✅
11. UC-01-11 : Consulter les logs système ✅
12. UC-01-12 : Se connecter (avec 2FA) ✅

#### UC-02 : Admin Secrétariat

**Liste des use cases Admin Secrétariat :**
1. UC-02-01 : Se connecter ✅
2. UC-02-02 : Consulter son dashboard ✅
3. UC-02-03 : Voir son profil ✅
4. UC-02-04 : Modifier son profil ✅
5. UC-02-05 : Voir les paramètres du secrétariat ✅
6. UC-02-06 : Voir la liste de ses utilisateurs ✅
7. UC-02-07 : Gérer son abonnement (Stripe Portal) ✅
8. UC-02-08 : Consulter l'historique de facturation ✅

### Chapitre : Conception - Architecture Multi-Tenant

**Justification du choix :**
> "J'ai choisi une architecture multi-tenant avec isolation au niveau
> des données (Row-Level Security) plutôt qu'une base de données par
> secrétariat. Ce choix permet :
>
> - Une scalabilité optimale (un seul schéma DB)
> - Des coûts d'infrastructure réduits
> - Une maintenance simplifiée
> - Une isolation sécurisée via secretariatId
>
> Le SuperAdmin a une vue globale, tandis que chaque Admin Secrétariat
> ne voit que ses propres données. Cette isolation est garantie par
> des middlewares et des WHERE clauses systématiques."

---

## ✅ Checklist de Développement

### Mois 1-3 (Juil-Sept 2025)
- [ ] Setup monorepo Turborepo
- [ ] Configuration Next.js 15
- [ ] Setup Prisma + PostgreSQL
- [ ] Better Auth installation
- [ ] Page login/logout
- [ ] Middleware de protection
- [ ] Layout SuperAdmin
- [ ] Dashboard global (basique)

### Mois 4-6 (Oct-Déc 2025)
- [ ] CRUD Secrétariats (frontend + API)
- [ ] CRUD Utilisateurs (SuperAdmin + Admin Secrétariat)
- [ ] Intégration Stripe (plans + checkout)
- [ ] Webhooks Stripe
- [ ] Tests unitaires (>50% coverage)

### Mois 7-9 (Jan-Mars 2026)
- [ ] Analytics global (graphiques)
- [ ] Stats par secrétariat
- [ ] Layout Admin Secrétariat
- [ ] Dashboard secrétariat (basique)
- [ ] Profil utilisateur
- [ ] Paramètres secrétariat

### Mois 10-12 (Avr-Juin 2026)
- [ ] Système de logs complet
- [ ] Interface Stripe Customer Portal
- [ ] Tests d'intégration
- [ ] UI/UX polish
- [ ] Tests E2E (Playwright)

### Mois 13-18 (Juil-Déc 2026)
- [ ] Optimisations performance
- [ ] Refactoring code
- [ ] Documentation technique
- [ ] Tests de charge
- [ ] Déploiement production
- [ ] Tests utilisateurs

### Mois 19-24 (Jan-Juin 2027)
- [ ] Corrections bugs
- [ ] Version finale code
- [ ] Rédaction rapport TFE
- [ ] Préparation présentation
- [ ] Répétitions démo
- [ ] RENDU TFE ✅

---

## 🎯 Métriques de Succès TFE

### Fonctionnalités (40%)
- ✅ 2 rôles pleinement fonctionnels
- ✅ Multi-tenant avec isolation
- ✅ Authentification sécurisée (Better Auth + 2FA)
- ✅ Facturation Stripe opérationnelle
- ✅ Analytics en temps réel
- ✅ Interface moderne (ShadcnUI)

### Qualité du Code (30%)
- ✅ Tests coverage >70%
- ✅ TypeScript strict
- ✅ ESLint 0 erreurs
- ✅ Architecture clean
- ✅ Documentation complète

### Rapport & Présentation (30%)
- ✅ Rapport 100-150 pages
- ✅ Diagrammes UML complets
- ✅ Démo live fonctionnelle
- ✅ Justifications techniques solides

---

*Document créé pour WorkZen TFE - Phase 1 Révisée*
*Scope : SuperAdmin + Admin Secrétariat (2 rôles fonctionnels)*

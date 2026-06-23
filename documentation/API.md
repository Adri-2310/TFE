# 📡 API Documentation - WorkZen

**Version:** 1.0  
**Last Updated:** 2025-04-16  
**Base URL:** `https://api.workzen.be/api`

---

## Table des Matières

1. [Authentication](#authentication)
2. [Entreprises](#entreprises)
3. [Employés](#employés)
4. [Fiches de Paie](#fiches-de-paie)
5. [Documents](#documents)
6. [Abonnement](#abonnement)
7. [Échéances & Conformité](#échéances--conformité)
8. [Messagerie](#messagerie)
9. [Webhooks](#webhooks)
10. [Erreurs](#erreurs)

---

## Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "consultant@workzen.be",
  "password": "SecurePassword123"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "consultant@workzen.be",
    "role": "CONSULTANT",
    "secretariat_id": "sec_456"
  },
  "expiresIn": 28800
}
```

### Login avec 2FA (SuperAdmin)
```http
POST /auth/login-2fa
Content-Type: application/json

{
  "email": "admin@workzen.be",
  "password": "SecurePassword123"
}
```

**Response 200:**
```json
{
  "requires_2fa": true,
  "session_id": "temp_session_789"
}
```

### Vérifier Code 2FA
```http
POST /auth/verify-2fa
Content-Type: application/json

{
  "session_id": "temp_session_789",
  "totp_code": "123456"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 28800
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "message": "Déconnecté avec succès"
}
```

### Refresh Token
```http
POST /auth/refresh
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 28800
}
```

---

## Entreprises

### Lister les Entreprises
```http
GET /companies?page=1&limit=10&status=ACTIF
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "company_123",
      "nom": "Acme Inc",
      "numeroTVA": "BE0123456789",
      "IBAN": "BE89370400440532013000",
      "adresse": "123 Rue de la Paix, 1000 Bruxelles",
      "secteur": "Informatique",
      "nombreEmployes": 15,
      "statut": "ACTIF",
      "consultant_id": "user_456",
      "dateCreation": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "pages": 5
  }
}
```

### Créer une Entreprise
```http
POST /companies
Authorization: Bearer {token}
Content-Type: application/json

{
  "nom": "TechCorp Belgium",
  "numeroTVA": "BE0987654321",
  "IBAN": "BE89370400440532013001",
  "adresse": "456 Avenue du Progrès, 2000 Anvers",
  "secteur": "Télécommunications",
  "nombreEmployes": 25
}
```

**Response 201:**
```json
{
  "id": "company_789",
  "nom": "TechCorp Belgium",
  "numeroTVA": "BE0987654321",
  "IBAN": "BE89370400440532013001",
  "adresse": "456 Avenue du Progrès, 2000 Anvers",
  "secteur": "Télécommunications",
  "nombreEmployes": 25,
  "statut": "ACTIF",
  "dateCreation": "2025-04-16T14:20:00Z"
}
```

### Obtenir une Entreprise
```http
GET /companies/{company_id}
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": "company_123",
  "nom": "Acme Inc",
  "numeroTVA": "BE0123456789",
  "IBAN": "BE89370400440532013000",
  "adresse": "123 Rue de la Paix, 1000 Bruxelles",
  "secteur": "Informatique",
  "nombreEmployes": 15,
  "statut": "ACTIF",
  "contacts": [
    {
      "id": "contact_123",
      "prenom": "Jean",
      "nom": "Dupont",
      "email": "jean@acmeinc.be",
      "poste": "Directeur RH",
      "estPrincipal": true
    }
  ],
  "employesTotal": 15,
  "fichesPaieRecentes": 3
}
```

### Mettre à Jour une Entreprise
```http
PUT /companies/{company_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "IBAN": "BE89370400440532013002",
  "adresse": "789 Boulevard de la République, 1000 Bruxelles",
  "nombreEmployes": 18
}
```

**Response 200:**
```json
{
  "id": "company_123",
  "nom": "Acme Inc",
  "numeroTVA": "BE0123456789",
  "IBAN": "BE89370400440532013002",
  "adresse": "789 Boulevard de la République, 1000 Bruxelles",
  "nombreEmployes": 18,
  "dateModification": "2025-04-16T15:45:00Z"
}
```

### Supprimer une Entreprise
```http
DELETE /companies/{company_id}
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "message": "Entreprise supprimée avec succès"
}
```

---

## Employés

### Lister les Employés d'une Entreprise
```http
GET /companies/{company_id}/employees?status=ACTIF
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "employee_123",
      "numeroNational": "85010112345",
      "prenom": "Marc",
      "nom": "Martin",
      "email": "marc.martin@acmeinc.be",
      "salaire": 2500.00,
      "typeContrat": "CDI",
      "dateEmbauche": "2023-06-01",
      "departement": "IT",
      "statut": "ACTIF",
      "contrat": {
        "id": "contract_123",
        "typeContrat": "CDI",
        "dateDebut": "2023-06-01",
        "dateFin": null,
        "tauxHoraire": 20.50,
        "heuresSemaine": 40
      }
    }
  ],
  "total": 15
}
```

### Créer un Employé
```http
POST /companies/{company_id}/employees
Authorization: Bearer {token}
Content-Type: application/json

{
  "numeroNational": "90050198765",
  "prenom": "Sophie",
  "nom": "Bernard",
  "email": "sophie.bernard@acmeinc.be",
  "salaire": 3000.00,
  "typeContrat": "CDI",
  "dateEmbauche": "2025-05-01",
  "departement": "Ressources Humaines"
}
```

**Response 201:**
```json
{
  "id": "employee_789",
  "numeroNational": "90050198765",
  "prenom": "Sophie",
  "nom": "Bernard",
  "email": "sophie.bernard@acmeinc.be",
  "salaire": 3000.00,
  "typeContrat": "CDI",
  "dateEmbauche": "2025-05-01",
  "statut": "ACTIF",
  "dateCreation": "2025-04-16T16:00:00Z"
}
```

### Obtenir un Employé
```http
GET /companies/{company_id}/employees/{employee_id}
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": "employee_123",
  "numeroNational": "85010112345",
  "prenom": "Marc",
  "nom": "Martin",
  "email": "marc.martin@acmeinc.be",
  "salaire": 2500.00,
  "typeContrat": "CDI",
  "dateEmbauche": "2023-06-01",
  "departement": "IT",
  "statut": "ACTIF",
  "contrat": { /* détails contrat */ },
  "fichesPaie": [
    {
      "id": "payslip_123",
      "periode": "2025-04",
      "statut": "ENVOYEE",
      "montantNet": 1850.50
    }
  ],
  "absences": [
    {
      "id": "absence_123",
      "type": "VACATION",
      "dateDebut": "2025-04-20",
      "dateFin": "2025-04-27",
      "statut": "APPROVED"
    }
  ]
}
```

### Mettre à Jour un Employé
```http
PUT /companies/{company_id}/employees/{employee_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "m.martin@acmeinc.be",
  "salaire": 2600.00,
  "departement": "Développement"
}
```

**Response 200:**
```json
{
  "id": "employee_123",
  "prenom": "Marc",
  "nom": "Martin",
  "email": "m.martin@acmeinc.be",
  "salaire": 2600.00,
  "departement": "Développement",
  "dateModification": "2025-04-16T16:15:00Z"
}
```

### Archiver un Employé
```http
PUT /companies/{company_id}/employees/{employee_id}/archive
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": "employee_123",
  "statut": "ARCHIVE",
  "dateArchivage": "2025-04-16T16:20:00Z"
}
```

---

## Fiches de Paie

### Lister les Fiches de Paie
```http
GET /payslips?company_id=company_123&period=2025-04&status=ENVOYEE
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "payslip_123",
      "employee_id": "employee_123",
      "entreprise": "Acme Inc",
      "employe": "Marc Martin",
      "periode": "2025-04",
      "salaireBrut": 2500.00,
      "montantBrut": 2500.00,
      "cotisationONSS": 326.75,
      "precompte": 375.00,
      "montantNet": 1798.25,
      "chargesEmployeur": 1050.00,
      "statut": "ENVOYEE",
      "dateEnvoi": "2025-04-01T09:30:00Z",
      "dateCreation": "2025-03-31T14:20:00Z"
    }
  ],
  "total": 15
}
```

### Créer une Fiche de Paie
```http
POST /payslips
Authorization: Bearer {token}
Content-Type: application/json

{
  "employee_id": "employee_123",
  "company_id": "company_123",
  "periode": "2025-04",
  "salaireBrut": 2500.00,
  "heures": 160,
  "heuresSupplémentaires": 5,
  "primes": 0.00,
  "deductions": 50.00
}
```

**Response 201:**
```json
{
  "id": "payslip_456",
  "employee_id": "employee_123",
  "periode": "2025-04",
  "statut": "BROUILLON",
  "montantBrut": 2500.00,
  "cotisationONSS": 326.75,
  "precompte": 375.00,
  "montantNet": 1798.25,
  "chargesEmployeur": 1050.00,
  "details": {
    "salaireBrut": 2500.00,
    "heuresTravaillees": 160,
    "heuresSupplémentaires": 5,
    "primes": 0.00,
    "allocations": 0.00,
    "onss": 326.75,
    "precompte": 375.00,
    "autresDeductions": 50.00,
    "montantNet": 1798.25,
    "chargesEmployeur": 1050.00,
    "coutTotal": 3550.00
  },
  "dateCreation": "2025-04-16T14:30:00Z"
}
```

### Obtenir une Fiche de Paie
```http
GET /payslips/{payslip_id}
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": "payslip_123",
  "employee_id": "employee_123",
  "employe": {
    "id": "employee_123",
    "prenom": "Marc",
    "nom": "Martin",
    "numeroNational": "85010112345"
  },
  "periode": "2025-04",
  "statut": "ENVOYEE",
  "montantBrut": 2500.00,
  "cotisationONSS": 326.75,
  "precompte": 375.00,
  "montantNet": 1798.25,
  "chargesEmployeur": 1050.00,
  "details": { /* détails complets */ },
  "pdf": {
    "url": "/payslips/payslip_123/pdf",
    "token": "temp_token_expires_30min"
  },
  "dateCreation": "2025-03-31T14:20:00Z",
  "dateEnvoi": "2025-04-01T09:30:00Z"
}
```

### Télécharger PDF Fiche de Paie
```http
GET /payslips/{payslip_id}/pdf?token=temp_token_expires_30min
```

**Response 200:** (application/pdf)
```
[Binary PDF content]
```

### Envoyer Fiche de Paie par Email
```http
POST /payslips/{payslip_id}/send-email
Authorization: Bearer {token}
Content-Type: application/json

{
  "destinataires": [
    "marc.martin@acmeinc.be",
    "rh@acmeinc.be"
  ]
}
```

**Response 200:**
```json
{
  "id": "payslip_123",
  "statut": "ENVOYEE",
  "dateEnvoi": "2025-04-16T14:45:00Z",
  "destinataires": [
    {
      "email": "marc.martin@acmeinc.be",
      "statut": "SENT"
    },
    {
      "email": "rh@acmeinc.be",
      "statut": "SENT"
    }
  ]
}
```

### Valider une Fiche de Paie
```http
PUT /payslips/{payslip_id}/validate
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": "payslip_123",
  "statut": "VALIDEE",
  "dateValidation": "2025-04-16T15:00:00Z"
}
```

---

## Documents

### Lister les Documents
```http
GET /documents?company_id=company_123&type=PAYSLIP
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "doc_123",
      "nom": "Fiche_Paie_Marc_Martin_2025_04.pdf",
      "type": "PAYSLIP",
      "chemin": "/documents/payslips/doc_123.pdf",
      "dateCreation": "2025-04-01T09:30:00Z",
      "tailleBytes": 125432
    }
  ],
  "total": 42
}
```

### Télécharger un Document
```http
GET /documents/{doc_id}/download
Authorization: Bearer {token}
```

**Response 200:** (application/octet-stream)
```
[Binary file content]
```

### Partager un Document
```http
POST /documents/{doc_id}/share
Authorization: Bearer {token}
Content-Type: application/json

{
  "utilisateur_ids": ["user_456", "user_789"],
  "duree_jours": 7
}
```

**Response 200:**
```json
{
  "id": "doc_123",
  "partages": [
    {
      "utilisateur_id": "user_456",
      "lien_temporaire": "https://workzen.be/documents/share/token_abc123",
      "expiration": "2025-04-23T14:50:00Z"
    }
  ]
}
```

---

## Abonnement

### Obtenir l'Abonnement Courant
```http
GET /subscription
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": "sub_123",
  "plan": {
    "id": "plan_pro",
    "nom": "Professional",
    "prix": 300.00,
    "maxEntreprises": 100,
    "maxConsultants": 10,
    "maxStockage": 25,
    "fonctionnalites": [
      "Companies CRUD",
      "Payroll Generation",
      "Exact Online Sync",
      "Compliance Tasks"
    ],
    "cycleBilling": "MONTHLY"
  },
  "statut": "ACTIF",
  "dateDebut": "2025-01-15T10:30:00Z",
  "dateProchainFacturation": "2025-05-15T10:30:00Z",
  "stripe_subscription_id": "sub_abc123xyz"
}
```

### Créer une Session Checkout Stripe
```http
POST /billing/create-checkout
Authorization: Bearer {token}
Content-Type: application/json

{
  "plan_id": "plan_pro",
  "success_url": "https://workzen.be/dashboard/billing?success=true",
  "cancel_url": "https://workzen.be/dashboard/billing?cancel=true"
}
```

**Response 200:**
```json
{
  "sessionId": "cs_test_abc123xyz",
  "url": "https://checkout.stripe.com/pay/cs_test_abc123xyz"
}
```

### Accéder au Customer Portal Stripe
```http
POST /billing/create-portal
Authorization: Bearer {token}
Content-Type: application/json

{
  "return_url": "https://workzen.be/dashboard/billing"
}
```

**Response 200:**
```json
{
  "url": "https://billing.stripe.com/session/abc123xyz"
}
```

### Annuler l'Abonnement
```http
POST /subscription/cancel
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": "sub_123",
  "statut": "CANCELLED",
  "dateCancellation": "2025-04-16T16:30:00Z",
  "raison": "Cancellation requested by user"
}
```

---

## Échéances & Conformité

### Lister les Échéances
```http
GET /deadlines?type=ONSS&status=PENDING
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "deadline_123",
      "type": "ONSS",
      "dateEcheance": "2025-04-28T23:59:00Z",
      "estRecurrente": true,
      "joursAlerte": [7, 3, 1],
      "description": "Déclaration ONSS - Avril 2025",
      "statut": "PENDING",
      "jours_restants": 12
    }
  ],
  "total": 8
}
```

### Créer une Échéance
```http
POST /deadlines
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "DIMONA",
  "dateEcheance": "2025-05-28T23:59:00Z",
  "estRecurrente": true,
  "joursAlerte": [7, 3, 1],
  "description": "Déclaration DIMONA - Mai 2025"
}
```

**Response 201:**
```json
{
  "id": "deadline_456",
  "type": "DIMONA",
  "dateEcheance": "2025-05-28T23:59:00Z",
  "estRecurrente": true,
  "joursAlerte": [7, 3, 1],
  "statut": "PENDING",
  "dateCreation": "2025-04-16T17:00:00Z"
}
```

### Lister les Tâches de Conformité
```http
GET /compliance-tasks?deadline_id=deadline_123
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "task_123",
      "type": "ONSS_DECLARATION",
      "statut": "SUBMITTED",
      "reference": "ONSS-2025-04-001",
      "dateEnvoi": "2025-04-28T10:30:00Z",
      "details": {
        "nombreEmployes": 15,
        "montantTotal": 125000.00
      }
    }
  ],
  "total": 1
}
```

### Soumettre une Tâche de Conformité
```http
POST /compliance-tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "deadline_id": "deadline_123",
  "type": "C4_CERTIFICATE",
  "details": {
    "employe_ids": ["employee_123", "employee_456"]
  }
}
```

**Response 201:**
```json
{
  "id": "task_456",
  "deadline_id": "deadline_123",
  "type": "C4_CERTIFICATE",
  "statut": "SUBMITTED",
  "reference": "C4-2025-04-002",
  "dateEnvoi": "2025-04-16T17:15:00Z"
}
```

---

## Messagerie

### Lister les Messages
```http
GET /messages?conversation_id=conv_123
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "msg_123",
      "expediteur": {
        "id": "user_456",
        "nom": "Jean Dupont",
        "role": "CONSULTANT"
      },
      "contenu": "Les fiches de paie d'avril sont prêtes à l'envoi.",
      "estLu": true,
      "dateCreation": "2025-04-16T14:00:00Z",
      "pieces_jointes": [
        {
          "document_id": "doc_123",
          "nom": "Rapport_Paie_Avril.pdf"
        }
      ]
    }
  ],
  "total": 24
}
```

### Envoyer un Message
```http
POST /messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "conversation_id": "conv_123",
  "contenu": "OK, je vais valider les fiches.",
  "piece_jointe_ids": []
}
```

**Response 201:**
```json
{
  "id": "msg_456",
  "conversation_id": "conv_123",
  "expediteur_id": "user_789",
  "contenu": "OK, je vais valider les fiches.",
  "estLu": false,
  "dateCreation": "2025-04-16T14:30:00Z"
}
```

### Marquer un Message comme Lu
```http
PUT /messages/{message_id}/mark-read
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": "msg_123",
  "estLu": true,
  "dateConsultation": "2025-04-16T15:00:00Z"
}
```

---

## Webhooks

### Webhook Stripe - Paiement Réussi
```http
POST /webhooks/stripe
Content-Type: application/json
Stripe-Signature: t=1234567890,v1=abc123...

{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_abc123xyz",
      "payment_status": "paid",
      "customer": "cus_abc123xyz",
      "subscription": "sub_abc123xyz"
    }
  }
}
```

**Response 200:**
```json
{
  "received": true
}
```

### Webhook Stripe - Abonnement Modifié
```http
POST /webhooks/stripe
Content-Type: application/json

{
  "type": "customer.subscription.updated",
  "data": {
    "object": {
      "id": "sub_abc123xyz",
      "items": {
        "data": [
          {
            "price": {
              "product": "prod_pro"
            }
          }
        ]
      },
      "status": "active"
    }
  }
}
```

**Response 200:**
```json
{
  "received": true
}
```

### Webhook Stripe - Paiement Échoué
```http
POST /webhooks/stripe
Content-Type: application/json

{
  "type": "invoice.payment_failed",
  "data": {
    "object": {
      "id": "in_abc123xyz",
      "subscription": "sub_abc123xyz",
      "customer": "cus_abc123xyz"
    }
  }
}
```

**Response 200:**
```json
{
  "received": true
}
```

---

## Erreurs

### Format d'Erreur Standard
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "numeroTVA",
        "message": "Invalid TVA format. Expected: BE##.###.###.###"
      }
    ]
  }
}
```

### Codes d'Erreur Courants

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_CREDENTIALS` | 401 | Email ou mot de passe incorrect |
| `UNAUTHORIZED` | 401 | Token absent ou expiré |
| `FORBIDDEN` | 403 | Accès refusé (permissions insuffisantes) |
| `NOT_FOUND` | 404 | Ressource introuvable |
| `VALIDATION_ERROR` | 400 | Erreur de validation des données |
| `CONFLICT` | 409 | Ressource déjà existante (ex: TVA doublon) |
| `RATE_LIMIT` | 429 | Trop de requêtes (rate limit atteint) |
| `SERVER_ERROR` | 500 | Erreur interne serveur |

### Exemples d'Erreurs

**Erreur 401 - Unauthorized:**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

**Erreur 403 - Forbidden:**
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to access this resource"
  }
}
```

**Erreur 409 - TVA déjà existe:**
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "TVA number already exists for this secretariat"
  }
}
```

**Erreur 429 - Rate Limited:**
```json
{
  "error": {
    "code": "RATE_LIMIT",
    "message": "Too many requests. Retry after 60 seconds"
  }
}
```

---

## Pagination

Tous les endpoints retournant une liste supportent la pagination:

```
GET /companies?page=2&limit=20&sort=dateCreation&order=desc
```

**Response:**
```json
{
  "data": [ /* items */ ],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 142,
    "pages": 8,
    "hasNextPage": true,
    "hasPreviousPage": true
  }
}
```

---

## Rate Limiting

- **Limite:** 1000 requêtes par heure par utilisateur
- **Header:** `X-RateLimit-Remaining: 999`
- **Reset:** `X-RateLimit-Reset: 1629907200`

---

## Versioning

Version API: **1.0**  
L'API supporte le versioning via header:

```
GET /companies
Accept-API-Version: 1.0
```

---

**Document updated:** 2025-04-16  
**Maintainers:** Team WorkZen

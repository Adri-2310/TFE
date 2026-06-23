# 🏗️ Architecture Technique - WorkZen

**Version:** 1.0  
**Last Updated:** 2025-04-16

---

## Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Stack Technologique](#stack-technologique)
3. [Architecture Layers](#architecture-layers)
4. [Multi-Tenancy](#multi-tenancy)
5. [Sécurité](#sécurité)
6. [Communication Asynchrone](#communication-asynchrone)
7. [Intégrations Externes](#intégrations-externes)
8. [Déploiement](#déploiement)
9. [Scalabilité](#scalabilité)
10. [Patterns & Best Practices](#patterns--best-practices)

---

## Vue d'Ensemble

WorkZen est une **plateforme SaaS multi-locataire** (multi-tenant) conçue pour les secrétariats sociaux belges.

**Architecture générale:**
```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 15)                │
│                  React 19 + Tailwind 4 + ShadcnUI           │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTPS
┌────────────────▼────────────────────────────────────────────┐
│                    API Layer (Next.js Routes)                │
│         Business Logic + Service Layer + Middleware          │
└────────────────┬────────────────────────────────────────────┘
                 │
     ┌───────────┼───────────┐
     │           │           │
┌────▼─────┐ ┌──▼────┐ ┌───▼──────┐
│PostgreSQL│ │Redis  │ │MinIO(S3) │
└──────────┘ └───────┘ └──────────┘

External Services:
├─ Stripe (Payments)
├─ Exact Online (Accounting)
├─ Resend (Email)
├─ Sentry (Monitoring)
└─ Google Authenticator (2FA)
```

---

## Stack Technologique

### Frontend
- **Next.js 15** - Framework React/SSR
- **React 19** - UI Components
- **Tailwind CSS 4** - Styling
- **ShadcnUI** - Component Library
- **React Hook Form** - Form Management
- **Zod** - Schema Validation
- **TanStack Query v5** - Data Fetching
- **Zustand** - State Management

### Backend
- **Next.js 15 API Routes** - Serverless Functions (Node.js)
- **Better Auth** - Authentication & RBAC
- **Prisma ORM** - Database Access
- **PostgreSQL 16** - Primary Database
- **Redis 7+** - Session Storage & Caching
- **BullMQ** - Job Queue
- **MinIO** - S3-Compatible Storage

### Infrastructure
- **Coolify** - Docker Orchestration & Deployment
- **Docker** - Containerization
- **Nginx** - Reverse Proxy
- **Let's Encrypt** - SSL/TLS Certificates
- **VPS Hostinger** - Cloud Hosting

### Payment & Integrations
- **Stripe** - Payment Processing
- **Exact Online** - Accounting Integration
- **Resend** - Email Service
- **Sentry** - Error Tracking & Monitoring

---

## Architecture Layers

### 1. **Presentation Layer** (Frontend)
```
apps/web/src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── companies/
│   │   ├── employees/
│   │   ├── payrolls/
│   │   ├── deadlines/
│   │   ├── messages/
│   │   └── settings/
│   └── (portal)/
│       └── portal/
│           ├── dashboard/
│           ├── payslips/
│           └── documents/
├── components/
│   ├── ui/               # ShadcnUI Components
│   ├── forms/            # Form Components
│   ├── layouts/          # Layout Components
│   └── shared/           # Shared Components
├── hooks/                # Custom React Hooks
├── lib/                  # Utilities & Helpers
└── styles/               # Global Styles
```

**Responsabilités:**
- Rendering UI components
- User interactions (forms, buttons, etc.)
- Client-side data fetching (React Query)
- Local state management (Zustand)
- Form validation (Zod + React Hook Form)

---

### 2. **Application Layer** (API Routes & Services)
```
apps/web/src/app/api/
├── auth/
│   ├── login/           → Authentication service
│   ├── logout/
│   ├── refresh/
│   ├── verify-2fa/
│   └── route.ts
├── companies/
│   ├── route.ts         → List & Create
│   ├── [id]/route.ts    → Get, Update, Delete
│   └── [id]/employees/  → Nested resource
├── payrolls/
│   ├── route.ts
│   ├── [id]/route.ts
│   ├── [id]/pdf/        → PDF generation
│   └── [id]/send-email/ → Email sending
├── billing/
│   ├── create-checkout/
│   ├── create-portal/
│   └── webhooks/stripe/
├── deadlines/
├── compliance-tasks/
├── messages/
└── middleware.ts        → Auth, logging, error handling
```

**Services (Business Logic):**
```
src/services/
├── PayrollService/
│   ├── calculatePayroll()
│   ├── calculateONSS()
│   ├── calculatePrecompte()
│   ├── generatePDF()
│   └── sendByEmail()
├── ComplianceService/
│   ├── generateDIMONA()
│   ├── generateC4()
│   └── trackStatus()
├── CompanyService/
│   ├── createCompany()
│   ├── validateTVA()
│   ├── validateIBAN()
│   └── syncWithExactOnline()
├── AuthService/
│   ├── authenticate()
│   ├── verify2FA()
│   ├── createSession()
│   └── revokeToken()
├── StripeService/
│   ├── createCheckoutSession()
│   ├── handleWebhooks()
│   └── createCustomerPortal()
└── ExactOnlineService/
    ├── getOAuthURL()
    ├── exchangeCode()
    └── syncData()
```

**Responsabilités:**
- Request validation
- Business logic execution
- Database queries (via Prisma repositories)
- External API calls
- Error handling & logging
- Response formatting

---

### 3. **Domain Layer** (Business Rules & Entities)
```
src/domain/
├── entities/
│   ├── User.ts
│   ├── Company.ts
│   ├── Employee.ts
│   ├── PaySlip.ts
│   ├── Deadline.ts
│   ├── Subscription.ts
│   └── ...
├── repositories/
│   ├── UserRepository.ts
│   ├── CompanyRepository.ts
│   ├── PaySlipRepository.ts
│   └── ...
├── validators/
│   ├── TVAValidator.ts
│   ├── IBANValidator.ts
│   ├── PayrollValidator.ts
│   └── ...
└── value-objects/
    ├── Money.ts
    ├── Email.ts
    ├── VAT.ts
    └── ...
```

**Responsabilités:**
- Business rule enforcement
- Entity validation
- Domain logic (ONSS calculations, etc.)
- Data integrity
- Type safety

---

### 4. **Data Layer** (Database & Repositories)
```
packages/database/
├── prisma/
│   ├── schema.prisma    # Data model
│   └── migrations/      # Schema changes
├── repositories/
│   ├── UserRepository.ts
│   ├── CompanyRepository.ts
│   ├── PaySlipRepository.ts
│   ├── AuditLogRepository.ts
│   └── ...
└── seeds/              # Test data
```

**Responsabilités:**
- Database queries (Prisma)
- Data persistence
- Transaction management
- Query optimization
- Database migrations

---

## Multi-Tenancy

**Strategy:** Row-Level Security (RLS) PostgreSQL

### Principle
Chaque secrétariat (secretariat_id) voit UNIQUEMENT ses données.

### Implementation

**1. Schema Design:**
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  secretariat_id UUID NOT NULL REFERENCES secretariats(id),
  nom VARCHAR NOT NULL,
  -- ... autres champs
  CONSTRAINT company_isolation UNIQUE (secretariat_id, numeroTVA)
);

-- Index pour performance
CREATE INDEX idx_companies_secretariat_id ON companies(secretariat_id);
```

**2. Row-Level Security:**
```sql
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY companies_isolation ON companies
USING (secretariat_id = current_setting('app.current_secretariat')::uuid)
WITH CHECK (secretariat_id = current_setting('app.current_secretariat')::uuid);
```

**3. Application Middleware:**
```typescript
export async function authMiddleware(req: NextRequest) {
  const token = extractToken(req);
  const user = verifyToken(token);
  
  // Set secretariat context
  req.headers.set('app.current_secretariat', user.secretariat_id);
  
  return NextResponse.next(req);
}
```

**4. Repository Pattern:**
```typescript
class CompanyRepository {
  async findById(id: string, secretariat_id: string) {
    return db.company.findUnique({
      where: { 
        id,
        secretariat_id // Always filter by secretariat
      }
    });
  }
  
  async findAll(secretariat_id: string) {
    return db.company.findMany({
      where: { secretariat_id }
    });
  }
}
```

---

## Sécurité

### Authentication
- **Better Auth** pour auth centralisée
- Email/Password + Google OAuth
- 2FA **obligatoire** pour SuperAdmin (TOTP)
- JWT tokens avec expiration 8h
- Session Redis avec expiration 7 jours

### Authorization
- RBAC (Role-Based Access Control)
- 5 rôles: SuperAdmin, AdminSecretariat, Consultant, ClientUser, EmployeeUser
- Permission middleware par route

### Data Protection
- HTTPS/TLS everywhere
- JWT tokens (no session cookies)
- CORS policies strictes
- Rate limiting (1000 req/h par user)
- Input validation (Zod schemas)
- SQL injection prevention (Prisma)
- XSS protection (React)
- CSRF tokens sur POST/PUT/DELETE

### Password Security
- Hashing: bcrypt (min 12 rounds)
- Min requirements: 8 chars, 1 uppercase, 1 number, 1 special
- Brute force protection (max 5 attempts/10min)

### Sensitive Data
- **PDF files:** MinIO encryption + temporary access tokens (30 min)
- **Credit cards:** Stripe tokenization (no CC storage)
- **Personal data:** GDPR encryption
- **Audit logs:** Immutable, 7 years retention

### 2FA Implementation
```typescript
// TOTP (Time-based One-Time Password)
const secret = speakeasy.generateSecret({
  name: 'WorkZen',
  issuer: 'WorkZen'
});

// Verification
const verified = speakeasy.totp.verify({
  secret: user.totp_secret,
  encoding: 'base32',
  token: userInput,
  window: 1 // Allow ±30 seconds
});
```

---

## Communication Asynchrone

### BullMQ Job Queue

**Use Cases:**
```typescript
// Email sending (async)
await emailQueue.add('send-payslip-email', {
  payslip_id: 'ps_123',
  recipient_ids: ['emp_1', 'emp_2']
}, {
  delay: 5000, // 5 sec delay
  attempts: 3,  // Retry 3 times
  backoff: { type: 'exponential', delay: 2000 }
});

// PDF generation (long-running)
await pdfQueue.add('generate-payslip-pdf', {
  payslip_id: 'ps_123'
}, {
  timeout: 30000 // 30 sec timeout
});

// Sync with Exact Online
await syncQueue.add('sync-exact-online', {
  secretariat_id: 'sec_123',
  companies: ['company_1', 'company_2']
}, {
  repeat: { cron: '0 2 * * *' } // Daily at 2am
});

// Deadline alerts
await alertQueue.add('check-deadlines', {}, {
  repeat: { cron: '0 9 * * *' } // Daily at 9am
});
```

**Job Processors:**
```typescript
// Email Queue
emailQueue.process('send-payslip-email', async (job) => {
  const { payslip_id, recipient_ids } = job.data;
  
  const payslip = await db.payslip.findUnique({ where: { id: payslip_id } });
  const pdfUrl = generateTemporaryURL(payslip.pdf_path, 30); // 30 min token
  
  for (const recipient_id of recipient_ids) {
    await sendEmail({
      to: recipient.email,
      subject: `Fiche de paie - ${payslip.periode}`,
      template: 'payslip-email',
      variables: { payslip, pdfUrl }
    });
  }
  
  await db.payslip.update({
    where: { id: payslip_id },
    data: { 
      statut: 'ENVOYEE',
      dateEnvoi: new Date()
    }
  });
});

// PDF Queue
pdfQueue.process('generate-payslip-pdf', async (job) => {
  const { payslip_id } = job.data;
  const payslip = await db.payslip.findUnique({
    where: { id: payslip_id },
    include: { employee: true, company: true }
  });
  
  const pdf = await generatePDF({
    template: 'payslip',
    data: payslip
  });
  
  const filePath = await uploadToMinIO(pdf, `payslips/${payslip_id}.pdf`);
  
  await db.payslip.update({
    where: { id: payslip_id },
    data: { pdf_path: filePath }
  });
});
```

---

## Intégrations Externes

### Stripe Integration

**Webhooks Support:**
- `checkout.session.completed` → Create subscription
- `customer.subscription.updated` → Update plan
- `customer.subscription.deleted` → Cancel subscription
- `invoice.payment_failed` → Retry & alert

**Implementation:**
```typescript
export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();
  
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
  
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    // ...
  }
  
  return NextResponse.json({ received: true });
}
```

### Exact Online Integration

**OAuth 2.0 Flow:**
```
1. User clicks "Connect Exact Online"
   ↓
2. Redirect to Exact OAuth URL
   ↓
3. User authorizes WorkZen
   ↓
4. Callback with auth code
   ↓
5. Exchange code for access token
   ↓
6. Store token + start sync
```

**Implementation:**
```typescript
// Step 1: Get OAuth URL
const oauthUrl = `https://start.exactonline.com/api/oauth2/auth?
  client_id=${process.env.EXACT_CLIENT_ID}&
  redirect_uri=${process.env.EXACT_REDIRECT_URI}&
  response_type=code`;

// Step 2: Handle callback
const code = req.query.code;
const tokens = await exactOnline.exchangeCode(code);

// Step 3: Store token
await db.oauthToken.create({
  data: {
    secretariat_id,
    provider: 'EXACT_ONLINE',
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: new Date(Date.now() + tokens.expires_in * 1000)
  }
});

// Step 4: Sync data
await syncQueue.add('sync-exact-online', {
  secretariat_id,
  syncType: 'FULL' // FULL or INCREMENTAL
});
```

---

## Déploiement

### Docker Containerization

**Production Build:**
```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy monorepo
COPY pnpm-lock.yaml .
COPY package.json .
COPY packages packages
COPY apps apps

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build
RUN pnpm turbo build

# Runtime
FROM node:20-alpine
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages ./packages
COPY --from=base /app/apps ./apps
COPY --from=base /app/.next ./.next

EXPOSE 3000
CMD ["pnpm", "start"]
```

### Coolify Deployment

**Services:**
```yaml
version: '3.8'

services:
  app:
    image: workzen:latest
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://...
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: workzen
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  minio:
    image: minio/minio
    environment:
      MINIO_ROOT_USER: ${MINIO_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
    ports:
      - "9000:9000"

  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl

volumes:
  postgres_data:
```

---

## Scalabilité

### Horizontal Scaling
- **Stateless API:** Deployable on multiple instances
- **Load Balancer:** Nginx distributes traffic
- **Session Storage:** Redis (shared across instances)
- **Database:** PostgreSQL replicas possible

### Performance Optimization
- **Caching:** Redis for sessions, query results
- **CDN:** Cloudflare for static assets
- **Database Indexes:** On frequently queried fields
- **Query Optimization:** N+1 prevention, batch operations
- **Code Splitting:** React lazy loading

### Database Scaling
- **Read Replicas:** For analytics queries
- **Connection Pooling:** PgBouncer (max 10 connections/app)
- **Partitioning:** Large tables by date (audit_logs, payslips)

---

## Patterns & Best Practices

### 1. Repository Pattern
```typescript
interface ICompanyRepository {
  findById(id: string, secretariat_id: string): Promise<Company>;
  findAll(secretariat_id: string): Promise<Company[]>;
  create(data: CreateCompanyInput, secretariat_id: string): Promise<Company>;
  update(id: string, data: UpdateCompanyInput): Promise<Company>;
  delete(id: string): Promise<void>;
}

class CompanyRepository implements ICompanyRepository {
  constructor(private db: PrismaClient) {}
  
  async findById(id: string, secretariat_id: string) {
    return this.db.company.findUnique({
      where: { id, secretariat_id }
    });
  }
  // ...
}
```

### 2. Service Layer
```typescript
class PayrollService {
  constructor(
    private companyRepo: ICompanyRepository,
    private employeeRepo: IEmployeeRepository,
    private payslipRepo: IPayslipRepository
  ) {}
  
  async generatePayslip(input: PayslipInput) {
    // Validate
    const company = await this.companyRepo.findById(input.company_id);
    const employee = await this.employeeRepo.findById(input.employee_id);
    
    // Calculate
    const details = this.calculatePayroll(employee, input);
    
    // Persist
    return this.payslipRepo.create({ ...input, ...details });
  }
  
  private calculatePayroll(employee, input) {
    const gross = this.calculateGross(employee, input);
    const onss = gross * 0.1307;
    const precompte = this.calculatePrecompte(gross - onss);
    const net = gross - onss - precompte;
    
    return { gross, onss, precompte, net };
  }
}
```

### 3. Error Handling
```typescript
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: any
  ) {
    super(message);
  }
}

export function errorHandler(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message, details: error.details } },
      { status: error.status }
    );
  }
  
  // Unknown error
  return NextResponse.json(
    { error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
    { status: 500 }
  );
}
```

### 4. Validation
```typescript
import { z } from 'zod';

const CreatePayslipSchema = z.object({
  employee_id: z.string().uuid(),
  company_id: z.string().uuid(),
  periode: z.string().regex(/^\d{4}-\d{2}$/),
  salaireBrut: z.number().positive(),
  heures: z.number().min(0).max(200)
});

type CreatePayslipInput = z.infer<typeof CreatePayslipSchema>;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const input = CreatePayslipSchema.parse(body);
  
  // ...
}
```

---

**Document Version:** 1.0  
**Last Update:** 2025-04-16  
**Team:** WorkZen Engineering

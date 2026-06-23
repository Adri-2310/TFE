# 🔒 Sécurité & Compliance - WorkZen

**Version:** 1.0  
**Classification:** CONFIDENTIAL  
**Last Updated:** 2025-04-16

---

## Table des Matières

1. [Authentication & Authorization](#authentication--authorization)
2. [Data Protection](#data-protection)
3. [API Security](#api-security)
4. [Infrastructure Security](#infrastructure-security)
5. [Compliance](#compliance)
6. [Incident Response](#incident-response)
7. [Security Checklist](#security-checklist)

---

## Authentication & Authorization

### Authentication Methods

#### 1. Email/Password
```typescript
// Registration
POST /auth/register
{
  "email": "user@workzen.be",
  "password": "SecurePassword123!",
  "prenom": "Jean",
  "nom": "Dupont"
}

// Validation rules
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
// Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char

// Hashing
const hashedPassword = await bcrypt.hash(password, 12); // 12 rounds
```

#### 2. Google OAuth
```typescript
// Redirect to Google
GET /auth/google
  → https://accounts.google.com/o/oauth2/v2/auth?...

// Callback
GET /auth/google/callback?code={auth_code}
  → Validate code
  → Exchange for access token
  → Create/update user
  → Set session
```

#### 3. 2FA (TOTP) - Mandatory for SuperAdmin
```typescript
// Setup 2FA
POST /auth/2fa/setup
Response: {
  "qrCode": "data:image/png;base64,...",
  "secret": "JBSWY3DPEBLW64TMMQ======"
}

// User scans QR with Google Authenticator/Authy
// Verify TOTP
POST /auth/2fa/verify
{
  "totp_code": "123456"
}

// Implementation
const verified = speakeasy.totp.verify({
  secret: user.totp_secret,
  encoding: 'base32',
  token: userInput,
  window: 1 // Allow ±30 seconds
});

if (!verified) {
  throw new Error('Invalid TOTP code');
}
```

### JWT Tokens

```typescript
// Token Generation
const token = jwt.sign(
  {
    sub: user.id,
    email: user.email,
    role: user.role,
    secretariat_id: user.secretariat_id,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (8 * 3600) // 8 hours
  },
  process.env.JWT_SECRET,
  {
    algorithm: 'HS256',
    issuer: 'workzen',
    audience: 'workzen-api'
  }
);

// Token Verification
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'workzen',
      audience: 'workzen-api'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token expired');
    }
    throw new UnauthorizedError('Invalid token');
  }
}

// Header format
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Session Management

```typescript
// Session Storage (Redis)
class SessionManager {
  async createSession(userId, ipAddress, userAgent) {
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await redis.setex(
      `session:${sessionId}`,
      7 * 24 * 60 * 60, // 7 days TTL
      JSON.stringify({
        userId,
        ipAddress,
        userAgent,
        createdAt: new Date(),
        lastActivityAt: new Date()
      })
    );
    
    return sessionId;
  }
  
  async validateSession(sessionId, ipAddress) {
    const session = await redis.get(`session:${sessionId}`);
    if (!session) {
      throw new UnauthorizedError('Session not found');
    }
    
    const data = JSON.parse(session);
    
    // IP validation (optional: allow some variation)
    if (data.ipAddress !== ipAddress) {
      // Could be VPN/proxy, log but allow (or enforce strict)
      logger.warn('Session IP mismatch', { sessionId, expected: data.ipAddress, got: ipAddress });
    }
    
    // Update activity
    data.lastActivityAt = new Date();
    await redis.setex(`session:${sessionId}`, 7 * 24 * 60 * 60, JSON.stringify(data));
    
    return data;
  }
}

// Session expiration
function sessionExpiresIn(createdAt) {
  const now = Date.now();
  const expiresAt = createdAt + (7 * 24 * 60 * 60 * 1000);
  return Math.max(0, Math.floor((expiresAt - now) / 1000));
}
```

### Authorization (RBAC)

```typescript
// Middleware
async function authMiddleware(req, res, next) {
  const token = extractToken(req);
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    req.secretariat_id = decoded.secretariat_id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Authorization decorator
function authorize(allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }
    next();
  };
}

// Usage
router.post(
  '/companies',
  authMiddleware,
  authorize(['CONSULTANT', 'ADMIN_SECRETARIAT']),
  createCompanyHandler
);
```

---

## Data Protection

### Encryption

#### At Rest
```typescript
// MinIO (S3-compatible) encryption
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: 9000,
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});

// Upload with encryption
async function uploadPDF(filePath, objectName) {
  const fileStream = fs.createReadStream(filePath);
  const metaData = {
    'Content-Type': 'application/pdf',
    'X-Amz-Server-Side-Encryption': 'AES256'
  };
  
  await minioClient.putObject(
    'payslips',
    objectName,
    fileStream,
    fileSize,
    metaData
  );
}

// Download with temporary token
async function getTemporaryURL(objectName, expiresIn = 1800) { // 30 min default
  return await minioClient.presignedGetObject(
    'payslips',
    objectName,
    expiresIn
  );
}
```

#### In Transit
```typescript
// HTTPS/TLS 1.3
// All traffic must be encrypted

// Nginx config
server {
  listen 443 ssl http2;
  ssl_certificate /etc/letsencrypt/live/api.workzen.be/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.workzen.be/privkey.pem;
  ssl_protocols TLSv1.3 TLSv1.2;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;
  
  # Force HTTPS
  if ($scheme != "https") {
    return 301 https://$server_name$request_uri;
  }
}
```

### Password Security

```typescript
class PasswordService {
  // Validation
  static validatePassword(password) {
    const rules = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[@$!%*?&]/.test(password)
    };
    
    const allValid = Object.values(rules).every(Boolean);
    if (!allValid) {
      throw new ValidationError('Password does not meet requirements', rules);
    }
    
    return true;
  }
  
  // Hashing
  static async hashPassword(password) {
    return await bcrypt.hash(password, 12); // 12 rounds
  }
  
  // Verification
  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }
  
  // Password history (prevent reuse)
  static async validateNotRecentlyUsed(userId, password, lastNPasswords = 5) {
    const user = await User.findById(userId).include({
      passwordHistory: {
        take: lastNPasswords,
        orderBy: { createdAt: 'desc' }
      }
    });
    
    for (const history of user.passwordHistory) {
      if (await bcrypt.compare(password, history.hash)) {
        throw new ValidationError(
          `Cannot reuse one of your last ${lastNPasswords} passwords`
        );
      }
    }
  }
}
```

### Sensitive Data Handling

**Personal Data (GDPR):**
```typescript
// Mark sensitive fields
class Employee {
  id: string;
  numeroNational: string; // @Sensitive
  email: string;          // @Sensitive
  salaire: number;        // @Sensitive
  // ...
}

// Automatic masking in logs
function sanitizeForLogging(data) {
  const sensitiveFields = ['numeroNational', 'email', 'password', 'salaire'];
  const sanitized = { ...data };
  
  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '***REDACTED***';
    }
  });
  
  return sanitized;
}

// Encryption for sensitive fields
async function saveEmployee(data) {
  const encrypted = {
    ...data,
    numeroNational: await encrypt(data.numeroNational),
    email: await encrypt(data.email),
    salaire: await encrypt(data.salaire)
  };
  
  return db.employee.create({ data: encrypted });
}
```

### GDPR Compliance

```typescript
// Right to be forgotten
async function deleteUserData(userId) {
  // 1. Delete personal data
  await User.delete({ where: { id: userId } });
  
  // 2. Anonymize audit logs
  await AuditLog.updateMany(
    { where: { userId } },
    { data: { userId: null, user: null } }
  );
  
  // 3. Keep only legal-required data (invoices, compliance docs)
  // 4. Anonymize employee records (if applicable)
  
  // 5. Delete from external services (Stripe, Exact Online)
  await stripe.customers.del(user.stripeCustomerId);
  
  // 6. Log deletion for audit trail
  logger.info('User deleted', { userId, timestamp: new Date() });
}

// Data export
async function exportUserData(userId) {
  const user = await User.findById(userId);
  const companies = await Company.findMany({
    where: { secretariat_id: user.secretariat_id }
  });
  const auditLogs = await AuditLog.findMany({
    where: { userId }
  });
  
  return {
    user,
    companies,
    auditLogs,
    exportedAt: new Date()
  };
}
```

---

## API Security

### Input Validation

```typescript
import { z } from 'zod';

const CreateCompanySchema = z.object({
  nom: z.string().min(2).max(255),
  numeroTVA: z.string().regex(/^BE\d{10}$/),
  IBAN: z.string().regex(/^[A-Z]{2}\d{2}[A-Z0-9]{11,16}$/).optional(),
  adresse: z.string().max(500).optional(),
  secteur: z.string().max(100).optional()
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  try {
    const validated = CreateCompanySchema.parse(body);
    // Process validated data
  } catch (error) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.issues },
      { status: 400 }
    );
  }
}
```

### Rate Limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(1000, '1 h'), // 1000 req/hour
  analytics: true,
  prefix: 'ratelimit'
});

export async function ratelimitMiddleware(req: NextRequest) {
  const ip = req.ip || 'unknown';
  
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);
  
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toString());
  
  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  return response;
}
```

### CORS Policy

```typescript
// Next.js middleware
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'https://workzen.be',
    'https://app.workzen.be',
    'https://admin.workzen.be'
  ];
  
  if (allowedOrigins.includes(origin)) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*'
};
```

### SQL Injection Prevention (Prisma)

```typescript
// ✅ SAFE - Prisma parameterizes queries
const user = await db.user.findUnique({
  where: { email: userInput } // Parameterized
});

// ❌ DANGEROUS - Raw SQL (if used)
const user = await db.$queryRaw(`
  SELECT * FROM User WHERE email = '${userInput}' -- VULNERABLE!
`);

// ✅ SAFE - Parameterized raw SQL
const user = await db.$queryRaw`
  SELECT * FROM User WHERE email = ${userInput}
`;
```

### XSS Prevention

```typescript
// React automatically escapes content
const Component = ({ userName }) => (
  <div>Welcome, {userName}</div>
  // If userName = "<script>alert('xss')</script>"
  // React renders it as literal text, not HTML
);

// Sanitization for rich content
import DOMPurify from 'dompurify';

const sanitizedHTML = DOMPurify.sanitize(userProvidedHTML, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
  ALLOWED_ATTR: []
});
```

### CSRF Protection

```typescript
// Tokens for state-changing operations
import { generateToken, verifyToken } from '@/lib/csrf';

// GET - Return form with CSRF token
export async function GET(req: NextRequest) {
  const csrfToken = await generateToken();
  return NextResponse.json({ csrfToken });
}

// POST - Verify CSRF token
export async function POST(req: NextRequest) {
  const { csrfToken, ...data } = await req.json();
  
  if (!await verifyToken(csrfToken)) {
    return NextResponse.json(
      { error: 'CSRF validation failed' },
      { status: 403 }
    );
  }
  
  // Process request
}
```

---

## Infrastructure Security

### Network Security

```yaml
# Firewall rules (UFW)
- Allow: SSH (22) - restricted IPs only
- Allow: HTTP (80) - redirect to HTTPS
- Allow: HTTPS (443) - all
- Allow: PostgreSQL (5432) - internal only
- Allow: Redis (6379) - internal only
- Allow: MinIO (9000) - internal only
- Deny: Everything else

# Nginx reverse proxy
- Rate limiting
- Request size limits
- Header validation
- SSL/TLS enforcement
```

### Database Security

```sql
-- Row-Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY companies_isolation ON companies
  USING (secretariat_id = current_setting('app.current_secretariat')::uuid)
  WITH CHECK (secretariat_id = current_setting('app.current_secretariat')::uuid);

-- User permissions
CREATE ROLE app_user WITH LOGIN ENCRYPTED PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE workzen TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

-- Audit logging
CREATE TABLE audit_log_immutable (
  id UUID PRIMARY KEY,
  action VARCHAR NOT NULL,
  table_name VARCHAR NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
) WITH (
  fillfactor = 100 -- Immutable: no updates
);
```

### Container Security

```dockerfile
# Use minimal base image
FROM node:20-alpine AS base

# Don't run as root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Multi-stage build
FROM base AS builder
COPY --chown=nextjs:nodejs . .
RUN npm ci && npm run build

FROM base AS runner
USER nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next /app/.next

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

EXPOSE 3000
CMD ["npm", "start"]
```

---

## Compliance

### Standards & Certifications

- ✅ **GDPR** (EU Data Protection)
- ✅ **Belgian Law** (Privacy, Employment)
- ✅ **ONSS Compliance** (Social Security)
- ✅ **ISO 27001** (Information Security) - Target
- ✅ **SOC 2 Type II** - Target

### Data Retention

| Data Type | Retention | Notes |
|-----------|-----------|-------|
| PaySlips | 7 years | Belgian law requirement |
| Audit Logs | 7 years | Compliance, immutable storage |
| Personal Data | Until deletion | GDPR right to be forgotten |
| Temporary Tokens | 30 minutes | PDF access tokens |
| Sessions | 7 days | Redis TTL |
| Login Attempts | 90 days | Security investigation |
| Invoices | 10 years | Tax requirement |

### Backup & Disaster Recovery

```bash
# Daily backup (PostgreSQL)
0 2 * * * pg_dump -U postgres workzen > /backups/workzen_$(date +\%Y\%m\%d).sql

# Weekly backup (encrypted, offsite)
0 3 * * 0 tar czf /backups/workzen_week.tar.gz /backups/workzen_*.sql && \
  gpg --encrypt /backups/workzen_week.tar.gz && \
  aws s3 cp /backups/workzen_week.tar.gz.gpg s3://backup-bucket/

# MinIO backup
mc mirror minio/payslips s3/payslips-backup

# RTO (Recovery Time Objective): 1 hour
# RPO (Recovery Point Objective): 24 hours
```

---

## Incident Response

### Breach Notification

**72-hour requirement (GDPR):**

```
1. Detect incident
   ↓ (within 1 hour)
2. Isolate affected systems
   ↓ (within 1 hour)
3. Investigate scope & impact
   ↓ (within 24 hours)
4. Notify DPA (if > threshold)
   ↓ (within 72 hours)
5. Notify affected users
```

### Security Logging

```typescript
// All security events logged
class SecurityLogger {
  logAuthenticationAttempt(email, success, ipAddress) {
    logger.info('Authentication attempt', {
      email,
      success,
      ipAddress,
      timestamp: new Date()
    });
  }
  
  logAccessDenied(userId, resource, reason) {
    logger.warn('Access denied', {
      userId,
      resource,
      reason,
      timestamp: new Date()
    });
  }
  
  logDataExport(userId, dataType, count) {
    logger.info('Data exported', {
      userId,
      dataType,
      count,
      timestamp: new Date()
    });
  }
  
  logSecurityEvent(event, severity, details) {
    logger.error('Security event', {
      event,
      severity,
      details,
      timestamp: new Date()
    });
  }
}
```

---

## Security Checklist

- [ ] HTTPS/TLS 1.3 enabled everywhere
- [ ] JWT tokens with short expiration (8h)
- [ ] 2FA mandatory for SuperAdmin
- [ ] Password hashing with bcrypt (12 rounds)
- [ ] Rate limiting (1000 req/hour)
- [ ] Input validation (Zod schemas)
- [ ] CORS policy restrictive
- [ ] SQL injection prevention (Prisma parameterization)
- [ ] XSS protection (React escaping)
- [ ] CSRF tokens on state-changing operations
- [ ] Row-Level Security (PostgreSQL)
- [ ] Encryption at rest (MinIO, AES256)
- [ ] Encryption in transit (HTTPS)
- [ ] API key rotation (quarterly)
- [ ] Database backups (daily, encrypted)
- [ ] Penetration testing (annual)
- [ ] Dependency scanning (Dependabot)
- [ ] Security headers (CSP, HSTS, X-Frame-Options)
- [ ] Audit logging (immutable)
- [ ] Incident response plan

---

**Security Document Version:** 1.0  
**Last Review:** 2025-04-16  
**Next Review:** 2025-10-16  
**Classification:** CONFIDENTIAL

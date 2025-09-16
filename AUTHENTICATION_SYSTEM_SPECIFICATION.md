# NusantaraX Authentication System - Complete Implementation Specification

## Project Overview
This document provides a complete specification for implementing a role-based authentication system with manual and OAuth registration/login for the NusantaraX project.

## System Architecture

```mermaid
graph TB
    A[Frontend - Next.js] --> B[Backend API - NestJS]
    B --> C[PostgreSQL Database]
    B --> D[Resend Email Service]
    B --> E[OAuth Providers]
    
    E --> F[GitHub OAuth]
    E --> G[Google OAuth]
    
    subgraph "Authentication Flow"
        H[Registration] --> I[Email Verification]
        I --> J[Account Activation]
        K[Login] --> L[JWT Token]
        L --> M[HTTP-Only Cookie]
    end
```

## Configuration Files

### Frontend Environment (.env.local)
```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_API_URL_PROD=https://api.nusantarax.web.id

# Application Configuration
NEXT_PUBLIC_APP_NAME=NusantaraX
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL_PROD=https://nusantarax.web.id
```

### Backend Environment (.env) - Additional Required Variables
```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Cookie Configuration
COOKIE_SECRET=your-cookie-secret-key-minimum-32-characters

# Application URLs
FRONTEND_URL=http://localhost:3000
FRONTEND_URL_PROD=https://nusantarax.web.id
BACKEND_URL=http://localhost:4000
BACKEND_URL_PROD=https://api.nusantarax.web.id

# Email Verification
EMAIL_VERIFICATION_EXPIRY=24h
PASSWORD_RESET_EXPIRY=1h

# OAuth Configuration (Backend Only)
# GitHub OAuth - Callback: http://localhost:4000/api/auth/github/callback
GITHUB_CLIENT_ID=Ov23liHe2pySmBDCp5p6
GITHUB_CLIENT_SECRET=9d0f589867b9d39584952f683054657c92efa5bd

# Google OAuth - Callback: http://localhost:4000/api/auth/google/callback
GOOGLE_CLIENT_ID=156276926690-l7vcbj6pg5d70579g8g0mt907peihc5l.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Resend Configuration
RESEND_API_KEY=re_F6p7LRHJ_PGFoCZ757w8V47X9S7zneBNq
EMAIL_FROM=noreply@nusantarax.web.id

# Database
DATABASE_URL=postgresql://postgres.jddprxvislcohnbexwnx:nusantaraxproduction$gacoreuy2025@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

## Database Schema (Prisma)

### User Model
```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  password        String?   // Nullable for OAuth-only users
  fullName        String
  role            Role      @default(USER)
  
  // Email verification
  emailVerified   Boolean   @default(false)
  emailVerificationToken String? @unique
  emailVerificationExpires DateTime?
  
  // Password reset
  passwordResetToken String? @unique
  passwordResetExpires DateTime?
  
  // OAuth providers
  providers       UserProvider[]
  
  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  lastLoginAt     DateTime?
  
  @@map("users")
}

model UserProvider {
  id         String   @id @default(cuid())
  userId     String
  provider   Provider @default(LOCAL)
  providerId String?  // OAuth provider user ID
  
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@unique([userId, provider])
  @@map("user_providers")
}

enum Role {
  USER
  ADMIN
}

enum Provider {
  LOCAL
  GITHUB
  GOOGLE
}
```

## Backend Implementation

### Project Structure
```
backend/
├── src/
│   ├── auth/
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   ├── forgot-password.dto.ts
│   │   │   └── reset-password.dto.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── local-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── optional-auth.guard.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── local.strategy.ts
│   │   │   ├── github.strategy.ts
│   │   │   └── google.strategy.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   └── types/
│   │       └── auth.types.ts
│   ├── users/
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   └── dto/
│   │       └── user.dto.ts
│   ├── email/
│   │   ├── email.service.ts
│   │   ├── email.module.ts
│   │   └── templates/
│   │       ├── email-verification.template.ts
│   │       └── password-reset.template.ts
│   └── prisma/
│       ├── prisma.service.ts
│       └── prisma.module.ts
```

### Main Configuration (main.ts)
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Security
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));
  
  // Cookie parser
  app.use(cookieParser(configService.get('COOKIE_SECRET')));
  
  // CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://nusantarax.web.id'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  await app.listen(4000);
}
bootstrap();
```

### HTTP-Only Cookie Configuration
```typescript
// Cookie settings for development and production
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  domain: process.env.NODE_ENV === 'production' ? '.nusantarax.web.id' : undefined,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};
```

## Authentication Endpoints

### Manual Authentication Endpoints
```typescript
// POST /api/auth/register
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}

// POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

// POST /api/auth/forgot-password
{
  "email": "john@example.com"
}

// POST /api/auth/reset-password
{
  "token": "reset-token-from-email",
  "password": "NewSecurePassword123!",
  "confirmPassword": "NewSecurePassword123!"
}

// POST /api/auth/verify-email
{
  "token": "verification-token-from-email"
}
```

### OAuth Endpoints (Backend Handled)
```typescript
// GET /api/auth/github
// Initiates GitHub OAuth flow - redirects to GitHub

// GET /api/auth/github/callback
// Handles GitHub OAuth callback
// Sets HTTP-only cookie and redirects to frontend

// GET /api/auth/google
// Initiates Google OAuth flow - redirects to Google

// GET /api/auth/google/callback  
// Handles Google OAuth callback
// Sets HTTP-only cookie and redirects to frontend
```

### User Management Endpoints
```typescript
// GET /api/auth/me
// Returns current authenticated user

// POST /api/auth/logout
// Clears authentication cookies

// GET /api/auth/refresh
// Refreshes access token

// GET /api/auth/resend-verification
// Resends email verification (requires auth)
```

## Frontend Implementation

### Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ForgotPasswordForm.tsx
│   │   │   ├── ResetPasswordForm.tsx
│   │   │   ├── OAuthButtons.tsx
│   │   │   └── AuthModal.tsx
│   │   └── ui/ (existing Shadcn components)
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useApi.ts
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── utils.ts (existing)
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx
│   │   │   └── verify-email/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx (protected route)
│   │   ├── admin/
│   │   │   └── page.tsx (admin only)
│   │   ├── page.tsx (landing page)
│   │   └── layout.tsx
│   └── types/
│       ├── auth.types.ts
│       └── user.types.ts
```

### OAuth Integration (Frontend)
```typescript
// OAuth buttons redirect to backend OAuth endpoints
const handleOAuthLogin = (provider: 'github' | 'google') => {
  // Direct redirect to backend OAuth endpoints
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/${provider}`;
};

// OAuth buttons component
<Button 
  onClick={() => handleOAuthLogin('github')}
  variant="outline"
  className="w-full"
>
  <GitHubIcon className="mr-2" />
  Continue with GitHub
</Button>

<Button 
  onClick={() => handleOAuthLogin('google')}
  variant="outline" 
  className="w-full"
>
  <GoogleIcon className="mr-2" />
  Continue with Google
</Button>
```

## Authentication Flow Diagrams

### Manual Registration Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant E as Email Service
    participant D as Database
    
    U->>F: Fill registration form
    F->>F: Validate form data
    F->>B: POST /api/auth/register
    B->>B: Validate input
    B->>B: Hash password
    B->>D: Create user (emailVerified: false)
    B->>B: Generate verification token
    B->>E: Send verification email
    B->>F: Success response
    F->>U: Show "Check your email" message
    
    Note over U,E: User clicks email link
    U->>F: GET /verify-email?token=...
    F->>B: POST /api/auth/verify-email
    B->>D: Update emailVerified: true
    B->>F: Success response
    F->>U: Redirect to login with success message
```

### OAuth Registration/Login Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant O as OAuth Provider
    participant D as Database
    
    U->>F: Click "Login with GitHub/Google"
    F->>B: Redirect to GET /api/auth/github
    B->>O: Redirect to OAuth provider
    O->>U: Show OAuth consent screen
    U->>O: Grant permission
    O->>B: GET /api/auth/github/callback?code=...
    B->>O: Exchange code for user data
    O->>B: Return user profile
    B->>D: Find or create user (emailVerified: true)
    B->>B: Generate JWT tokens
    B->>F: Set HTTP-only cookies + redirect to dashboard
    F->>U: User logged in successfully
```

### Password Reset Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant E as Email Service
    participant D as Database
    
    U->>F: Enter email for password reset
    F->>B: POST /api/auth/forgot-password
    B->>D: Find user by email
    B->>B: Generate reset token
    B->>D: Save token with expiry
    B->>E: Send password reset email
    B->>F: Success response
    F->>U: Show "Check your email" message
    
    Note over U,E: User clicks reset link
    U->>F: GET /reset-password?token=...
    F->>F: Show reset password form
    U->>F: Enter new password
    F->>B: POST /api/auth/reset-password
    B->>B: Validate token & expiry
    B->>B: Hash new password
    B->>D: Update user password & clear token
    B->>F: Success response
    F->>U: Redirect to login with success message
```

## Security Best Practices

### HTTP-Only Cookies
```typescript
// Secure cookie configuration
const cookieConfig = {
  httpOnly: true,                    // Prevents XSS attacks
  secure: NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict',               // CSRF protection
  domain: '.nusantarax.web.id',     // Production domain
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};
```

### Password Security
```typescript
// Argon2 hashing with secure defaults
import * as argon2 from 'argon2';

// Hash password
const hashedPassword = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 3,
  parallelism: 1,
});

// Verify password
const isValidPassword = await argon2.verify(hashedPassword, password);
```

### JWT Token Security
```typescript
// JWT configuration
{
  secret: process.env.JWT_SECRET, // Minimum 32 characters
  signOptions: {
    expiresIn: '15m',           // Short access token expiry
    issuer: 'nusantarax-api',
    audience: 'nusantarax-app',
  }
}
```

## Required Dependencies

### Backend (Already Installed)
- @nestjs/jwt
- @nestjs/passport
- passport
- passport-local
- passport-jwt
- passport-github2
- passport-google-oauth20
- argon2
- cookie-parser
- helmet
- class-validator
- class-transformer
- resend
- @prisma/client
- prisma

### Frontend (Already Installed)
- axios
- react-icons (for OAuth provider icons)
- framer-motion (for animations)
- sonner (for notifications)

## Implementation Priority

1. **Backend Core Setup** - Database schema, main.ts configuration
2. **Authentication Services** - JWT, email, password hashing
3. **OAuth Strategies** - GitHub and Google integration  
4. **API Endpoints** - All auth endpoints with validation
5. **Frontend Setup** - Environment config, API client
6. **UI Components** - Landing page, navbar, auth forms
7. **Authentication Context** - React context and hooks
8. **Protected Routes** - Route guards and role-based access
9. **Testing & Refinement** - End-to-end testing and bug fixes

## Notes

- All OAuth configuration and secrets remain on the backend
- Frontend only knows backend API URLs
- OAuth callbacks are handled entirely by backend
- HTTP-only cookies provide secure authentication
- Email verification is required for manual registration
- OAuth users are automatically email-verified
- Role-based access control supports USER and ADMIN roles
- Production-ready security configurations included
# Plano: Implementar Sistema de Autenticação Completo

## Objetivo
Expandir o sistema de autenticação existente (JWT + Passport) com features essenciais de segurança e UX.

## Features a Implementar

| # | Feature | Prioridade | Dependência |
|---|---------|------------|-------------|
| 1 | Hook `useSession()` | Alta | Nenhuma |
| 2 | Refresh Tokens | Alta | Nenhuma |
| 3 | Proteção CSRF | Alta | Nenhuma |
| 4 | Verificação de Email | Média | Serviço de email |
| 5 | Recuperação de Senha | Média | Serviço de email |
| 6 | OAuth (Google, Apple) | Baixa | Credenciais OAuth |

---

## 1. Hook `useSession()` no Frontend

**Objetivo:** Saber se o usuário está logado em qualquer componente.

### Arquivos a Criar/Modificar

- `apps/web/hooks/use-session.ts` - **CRIAR** - Hook principal
- `apps/web/lib/api.ts` - Adicionar rota `/me`
- `apps/api/src/modules/users/controllers/get-current-user.controller.ts` - **CRIAR** - Endpoint `/me`

### Implementação

**Backend - GET /me:**
```typescript
@Controller('/me')
export class GetCurrentUserController {
  @Get()
  async handle(@CurrentUser() user: UserPayload) {
    return { user };
  }
}
```

**Frontend - useSession:**
```typescript
export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: () => api<User>('/me'),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
```

---

## 2. Refresh Tokens

**Objetivo:** Manter usuário logado sem pedir senha frequentemente.

### Estratégia
- Access Token: curta duração (15 min)
- Refresh Token: longa duração (7 dias), armazenado em cookie httpOnly separado

### Arquivos a Criar/Modificar

**Backend:**
- `apps/api/src/modules/auth/controllers/refresh-token.controller.ts` - **CRIAR**
- `apps/api/src/modules/auth/use-cases/refresh-token.usecase.ts` - **CRIAR**
- `apps/api/src/modules/auth/controllers/authenticate.controller.ts` - Gerar refresh token
- `packages/database/prisma/schema.prisma` - Adicionar tabela `RefreshToken`

**Frontend:**
- `apps/web/lib/api.ts` - Interceptor para refresh automático

### Schema do Refresh Token
```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@map("refresh_tokens")
}
```

### Fluxo
```
1. Login → access_token (15min) + refresh_token (7d) em cookies
2. Request falha com 401
3. Frontend chama POST /auth/refresh
4. Backend valida refresh_token, gera novo access_token
5. Request original é retentada
```

---

## 3. Proteção CSRF

**Objetivo:** Prevenir ataques Cross-Site Request Forgery.

### Estratégia
- Gerar token CSRF no login
- Enviar em header `X-CSRF-Token` nas requests
- Validar no backend para rotas mutáveis (POST, PUT, DELETE)

### Arquivos a Criar/Modificar

**Backend:**
- `apps/api/src/infra/auth/csrf.guard.ts` - **CRIAR**
- `apps/api/src/modules/auth/controllers/authenticate.controller.ts` - Gerar CSRF token

**Frontend:**
- `apps/web/lib/api.ts` - Incluir header CSRF
- `apps/web/hooks/use-session.ts` - Armazenar CSRF token

---

## 4. Verificação de Email

**Objetivo:** Confirmar que o email pertence ao usuário.

### Arquivos a Criar/Modificar

**Backend:**
- `apps/api/src/modules/auth/controllers/verify-email.controller.ts` - **CRIAR**
- `apps/api/src/modules/auth/controllers/resend-verification.controller.ts` - **CRIAR**
- `apps/api/src/modules/auth/use-cases/verify-email.usecase.ts` - **CRIAR**
- `apps/api/src/infra/mail/mail.module.ts` - **CRIAR** - Serviço de email (Resend)
- `packages/database/prisma/schema.prisma` - Campo `emailVerified` no User

**Frontend:**
- `apps/web/app/verify-email/page.tsx` - **CRIAR**

### Fluxo
```
1. Registro → envia email com link /verify-email?token=xxx
2. Usuário clica no link
3. Backend valida token, marca emailVerified = true
```

---

## 5. Recuperação de Senha

**Objetivo:** Permitir reset de senha via email.

### Arquivos a Criar/Modificar

**Backend:**
- `apps/api/src/modules/auth/controllers/forgot-password.controller.ts` - **CRIAR**
- `apps/api/src/modules/auth/controllers/reset-password.controller.ts` - **CRIAR**
- `apps/api/src/modules/auth/use-cases/forgot-password.usecase.ts` - **CRIAR**
- `apps/api/src/modules/auth/use-cases/reset-password.usecase.ts` - **CRIAR**
- `packages/database/prisma/schema.prisma` - Tabela `PasswordResetToken`

**Frontend:**
- `apps/web/app/forgot-password/page.tsx` - **CRIAR**
- `apps/web/app/reset-password/page.tsx` - **CRIAR**

### Schema
```prisma
model PasswordResetToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())

  @@map("password_reset_tokens")
}
```

---

## 6. OAuth (Google, Apple)

**Objetivo:** Login social.

### Arquivos a Criar/Modificar

**Backend:**
- `apps/api/src/modules/auth/controllers/oauth-google.controller.ts` - **CRIAR**
- `apps/api/src/modules/auth/controllers/oauth-apple.controller.ts` - **CRIAR**
- `apps/api/src/modules/auth/use-cases/oauth-login.usecase.ts` - **CRIAR**
- `packages/database/prisma/schema.prisma` - Tabela `OAuthAccount`

**Frontend:**
- `apps/web/components/login-form.tsx` - Conectar botões OAuth
- `apps/web/app/auth/callback/google/page.tsx` - **CRIAR**
- `apps/web/app/auth/callback/apple/page.tsx` - **CRIAR**

### Schema
```prisma
model OAuthAccount {
  id          String @id @default(uuid())
  provider    String // "google" | "apple"
  providerId  String
  userId      String
  user        User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerId])
  @@map("oauth_accounts")
}
```

---

## Ordem de Implementação Recomendada

### Fase 1 - Essencial (pode fazer agora)
1. **useSession()** - Permite proteger rotas no frontend
2. **Refresh Tokens** - Melhora UX, usuário não precisa relogar sempre
3. **Proteção CSRF** - Segurança básica

### Fase 2 - Email (Resend)
4. Configurar Resend (instalar pacote, API key)
5. **Verificação de Email**
6. **Recuperação de Senha**

### Fase 3 - OAuth (requer credenciais)
7. Configurar Google Cloud Console
8. Configurar Apple Developer
9. **OAuth Google e Apple**

---

## Configurações de Ambiente Necessárias

```env
# JWT (já existe)
JWT_PRIVATE_KEY=...
JWT_PUBLIC_KEY=...

# Novos
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Email - Resend (Fase 2)
RESEND_API_KEY=re_xxxxxxxxxxxxx
MAIL_FROM=noreply@seudominio.com

# OAuth (Fase 3)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
APPLE_CLIENT_ID=...
APPLE_CLIENT_SECRET=...
```

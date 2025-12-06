# Plano: Implementar Autenticação e RBAC

## Resumo
Implementar sistema completo de autenticação JWT com RBAC (USER/ADMIN), seguindo os padrões do projeto de exemplo "05-nest-clean" da Rocketseat, adaptado para Fastify.

**Decisões de Design:**
- ✅ Manter Fastify (não Express)
- ✅ Usar roles USER/ADMIN (não STUDENT/INSTRUCTOR)
- ✅ Usar exceções para erros (não Either pattern)
- ✅ Criar ZodValidationPipe para validação nos controllers

---

## 1. Instalar Dependências

```bash
pnpm --filter api add bcryptjs
pnpm --filter api add -D @types/bcryptjs
```

---

## 2. Atualizar Schema Prisma

**Arquivo:** `packages/database/prisma/schema.prisma`

```prisma
enum UserRole {
  USER
  ADMIN
}

model User {
  id        String    @id @default(uuid())
  email     String    @unique
  name      String?
  password  String                    // NOVO
  role      UserRole  @default(USER)  // NOVO
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  @@map("users")
}
```

**Ação:** Executar `pnpm --filter @workspace/database db:migrate`

---

## 3. Criar ZodValidationPipe

**Arquivo:** `apps/api/src/shared/pipes/zod-validation.pipe.ts`

```typescript
import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(result.error.format());
    }
    return result.data;
  }
}
```

---

## 4. Criar Interfaces de Cryptography

**Pasta:** `apps/api/src/shared/cryptography/`

| Arquivo | Conteúdo |
|---------|----------|
| `hash-generator.ts` | `export abstract class HashGenerator { abstract hash(plain: string): Promise<string> }` |
| `hash-comparer.ts` | `export abstract class HashComparer { abstract compare(plain: string, hash: string): Promise<boolean> }` |
| `encrypter.ts` | `export abstract class Encrypter { abstract encrypt(payload: Record<string, unknown>): Promise<string> }` |

---

## 5. Criar Implementações de Cryptography

**Pasta:** `apps/api/src/infra/cryptography/`

### 5.1 bcrypt-hasher.ts
```typescript
import { hash, compare } from 'bcryptjs';
import { HashComparer } from '@/shared/cryptography/hash-comparer';
import { HashGenerator } from '@/shared/cryptography/hash-generator';

export class BcryptHasher implements HashGenerator, HashComparer {
  private HASH_SALT_LENGTH = 8;

  hash(plain: string): Promise<string> {
    return hash(plain, this.HASH_SALT_LENGTH);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash);
  }
}
```

### 5.2 jwt-encrypter.ts
```typescript
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Encrypter } from '@/shared/cryptography/encrypter';

@Injectable()
export class JwtEncrypter implements Encrypter {
  constructor(private jwtService: JwtService) {}

  encrypt(payload: Record<string, unknown>): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
```

### 5.3 cryptography.module.ts
```typescript
@Module({
  providers: [
    { provide: Encrypter, useClass: JwtEncrypter },
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
  ],
  exports: [Encrypter, HashComparer, HashGenerator],
})
export class CryptographyModule {}
```

---

## 6. Atualizar User Entity e Repository

### 6.1 User Entity
**Arquivo:** `apps/api/src/modules/users/entities/user.entity.ts`

Adicionar:
```typescript
password: string;
role: 'USER' | 'ADMIN';
```

### 6.2 Users Repository Interface
**Arquivo:** `apps/api/src/modules/users/repositories/users.repository.ts`

Adicionar método:
```typescript
findByEmail(email: string): Promise<User | null>;
```

### 6.3 Prisma Users Repository
**Arquivo:** `apps/api/src/modules/users/repositories/prisma-users.repository.ts`

Implementar `findByEmail`:
```typescript
async findByEmail(email: string): Promise<User | null> {
  const user = await this.prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  return new User(user);
}
```

---

## 7. Criar Erros de Auth

**Pasta:** `apps/api/src/modules/auth/errors/`

| Arquivo | Descrição |
|---------|-----------|
| `user-already-exists.error.ts` | `ConflictException` - email já existe |
| `wrong-credentials.error.ts` | `UnauthorizedException` - credenciais inválidas |

---

## 8. Criar Use Cases de Auth

**Pasta:** `apps/api/src/modules/auth/use-cases/`

### 8.1 register-user.usecase.ts
```typescript
@Injectable()
export class RegisterUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({ name, email, password }) {
    const existingUser = await this.usersRepository.findByEmail(email);
    if (existingUser) throw new UserAlreadyExistsError(email);

    const hashedPassword = await this.hashGenerator.hash(password);
    const user = new User({ name, email, password: hashedPassword, role: 'USER' });

    return this.usersRepository.create(user);
  }
}
```

### 8.2 authenticate-user.usecase.ts
```typescript
@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashComparer: HashComparer,
    private encrypter: Encrypter,
  ) {}

  async execute({ email, password }) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) throw new WrongCredentialsError();

    const isValid = await this.hashComparer.compare(password, user.password);
    if (!isValid) throw new WrongCredentialsError();

    const accessToken = await this.encrypter.encrypt({
      sub: user.id,
      role: user.role
    });

    return { accessToken };
  }
}
```

---

## 9. Criar Controllers de Auth

**Pasta:** `apps/api/src/modules/auth/controllers/`

### 9.1 create-account.controller.ts
- Rota: `POST /accounts`
- Decorator: `@Public()`
- Validação: ZodValidationPipe com schema (name, email, password)
- Retorno: 201 Created

### 9.2 authenticate.controller.ts
- Rota: `POST /sessions`
- Decorator: `@Public()`
- Validação: ZodValidationPipe com schema (email, password)
- Retorno: `{ access_token: string }`

---

## 10. Implementar RBAC

### 10.1 Atualizar JWT Payload
**Arquivo:** `apps/api/src/infra/auth/jwt.strategy.ts`

```typescript
const tokenPayloadSchema = z.object({
  sub: z.string().uuid(),
  role: z.enum(['USER', 'ADMIN']),
});

export type UserPayload = z.infer<typeof tokenPayloadSchema>;
```

### 10.2 Criar Decorator @Roles
**Arquivo:** `apps/api/src/infra/auth/roles.decorator.ts`

```typescript
export const ROLES_KEY = 'roles';
export const Roles = (...roles: ('USER' | 'ADMIN')[]) =>
  SetMetadata(ROLES_KEY, roles);
```

### 10.3 Criar RolesGuard
**Arquivo:** `apps/api/src/infra/auth/roles.guard.ts`

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

### 10.4 Registrar RolesGuard
**Arquivo:** `apps/api/src/infra/auth/auth.module.ts`

Adicionar após JwtAuthGuard:
```typescript
{ provide: APP_GUARD, useClass: RolesGuard }
```

---

## 11. Criar Auth Module

**Arquivo:** `apps/api/src/modules/auth/auth.module.ts`

```typescript
@Module({
  imports: [CryptographyModule, UsersModule],
  controllers: [CreateAccountController, AuthenticateController],
  providers: [RegisterUserUseCase, AuthenticateUserUseCase],
})
export class AuthModule {}
```

---

## 12. Atualizar app.module.ts

Importar `AuthModule`.

---

## Ordem de Execução

1. Instalar bcryptjs
2. Atualizar schema Prisma + migração
3. Criar ZodValidationPipe
4. Criar interfaces de cryptography
5. Criar implementações de cryptography
6. Atualizar User entity
7. Atualizar UsersRepository (interface + implementação)
8. Criar erros de auth
9. Criar use cases de auth
10. Criar controllers de auth
11. Implementar RBAC (decorator + guard)
12. Atualizar JWT strategy com role
13. Criar auth.module.ts
14. Atualizar app.module.ts
15. Testar endpoints

---

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `apps/api/src/shared/pipes/zod-validation.pipe.ts` | Pipe de validação Zod |
| `apps/api/src/shared/cryptography/hash-generator.ts` | Interface |
| `apps/api/src/shared/cryptography/hash-comparer.ts` | Interface |
| `apps/api/src/shared/cryptography/encrypter.ts` | Interface |
| `apps/api/src/infra/cryptography/bcrypt-hasher.ts` | Implementação bcrypt |
| `apps/api/src/infra/cryptography/jwt-encrypter.ts` | Implementação JWT |
| `apps/api/src/infra/cryptography/cryptography.module.ts` | Módulo NestJS |
| `apps/api/src/modules/auth/errors/user-already-exists.error.ts` | Erro 409 |
| `apps/api/src/modules/auth/errors/wrong-credentials.error.ts` | Erro 401 |
| `apps/api/src/modules/auth/use-cases/register-user.usecase.ts` | Use case registro |
| `apps/api/src/modules/auth/use-cases/authenticate-user.usecase.ts` | Use case login |
| `apps/api/src/modules/auth/controllers/create-account.controller.ts` | POST /accounts |
| `apps/api/src/modules/auth/controllers/authenticate.controller.ts` | POST /sessions |
| `apps/api/src/modules/auth/auth.module.ts` | Módulo auth |
| `apps/api/src/infra/auth/roles.decorator.ts` | @Roles decorator |
| `apps/api/src/infra/auth/roles.guard.ts` | Guard de RBAC |

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `packages/database/prisma/schema.prisma` | Adicionar password, role, enum |
| `apps/api/src/modules/users/entities/user.entity.ts` | Adicionar password, role |
| `apps/api/src/modules/users/repositories/users.repository.ts` | Adicionar findByEmail |
| `apps/api/src/modules/users/repositories/prisma-users.repository.ts` | Implementar findByEmail |
| `apps/api/src/infra/auth/jwt.strategy.ts` | Adicionar role ao payload |
| `apps/api/src/infra/auth/auth.module.ts` | Registrar RolesGuard |
| `apps/api/src/app.module.ts` | Importar AuthModule |

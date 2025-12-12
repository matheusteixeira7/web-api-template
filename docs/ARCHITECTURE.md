# Arquitetura do HealthSync

Este documento descreve a arquitetura da aplicação HealthSync, explicando em detalhes cada decisão arquitetural e os padrões de design utilizados.

## Sumário

1. [Introdução](#1-introdução)
2. [Estrutura do Monorepo](#2-estrutura-do-monorepo)
3. [Arquitetura em Camadas (Clean Architecture)](#3-arquitetura-em-camadas-clean-architecture)
4. [Padrões de Design](#4-padrões-de-design)
   - [4.1 Facade Pattern](#41-facade-pattern)
   - [4.2 Repository Pattern](#42-repository-pattern)
   - [4.3 Use Case Pattern](#43-use-case-pattern)
   - [4.4 Entity Pattern](#44-entity-pattern)
   - [4.5 DTO Pattern](#45-dto-pattern)
   - [4.6 Controller Pattern](#46-controller-pattern)
   - [4.7 Application Service Pattern](#47-application-service-pattern)
5. [Injeção de Dependência](#5-injeção-de-dependência)
6. [Autenticação e Autorização](#6-autenticação-e-autorização)
7. [Estrutura de um Módulo](#7-estrutura-de-um-módulo)
8. [Fluxo de Requisição](#8-fluxo-de-requisição)
9. [Packages Compartilhados](#9-packages-compartilhados)
10. [Convenções e Boas Práticas](#10-convenções-e-boas-práticas)

---

## 1. Introdução

### O que é o HealthSync?

HealthSync é uma plataforma SaaS para agendamento e gestão de clínicas de pequeno e médio porte no Brasil. As principais funcionalidades incluem:

- Agendamento multi-profissional
- Gestão de pacientes
- Confirmações automáticas via WhatsApp
- Link público de agendamento
- Dashboard em tempo real
- Gestão de assinaturas e faturamento

### Tecnologias Utilizadas

| Camada | Tecnologia |
|--------|------------|
| **Backend** | NestJS + Fastify |
| **Frontend** | Next.js 15 + React 19 |
| **Banco de Dados** | PostgreSQL + Prisma ORM |
| **Monorepo** | pnpm + Turborepo |
| **UI Components** | shadcn/ui + Tailwind CSS |
| **Autenticação** | JWT (RS256) + OAuth |

---

## 2. Estrutura do Monorepo

O projeto utiliza **pnpm workspaces** com **Turborepo** para orquestração de builds.

```
healthsync/
├── apps/
│   ├── api/                    # Backend NestJS + Fastify (porta 3333)
│   └── web/                    # Frontend Next.js (porta 3000)
│
├── packages/
│   ├── database/               # Prisma ORM + tipos gerados
│   ├── ui/                     # Componentes React compartilhados
│   ├── eslint-config/          # Configurações ESLint
│   └── typescript-config/      # Configurações TypeScript
│
├── turbo.json                  # Configuração Turborepo
├── pnpm-workspace.yaml         # Definição do workspace
└── package.json                # Scripts raiz
```

### Como os Packages são Compartilhados

Os packages são referenciados usando o protocolo `workspace:*`:

```json
{
  "dependencies": {
    "@workspace/database": "workspace:*",
    "@workspace/ui": "workspace:*"
  }
}
```

O Turborepo garante a ordem de build correta através de dependências:

```json
{
  "build": {
    "dependsOn": ["^build", "^db:generate"]
  }
}
```

---

## 3. Arquitetura em Camadas (Clean Architecture)

A API segue os princípios de **Clean Architecture**, organizando o código em 4 camadas:

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE INFRAESTRUTURA                 │
│  (Database, Auth, Cryptography, Mail, Environment)          │
│                        apps/api/src/infra/                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE APLICAÇÃO                      │
│  (Application Services - orquestração transacional)         │
│                    apps/api/src/application/                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     CAMADA DE DOMÍNIO                       │
│  (Modules: Auth, Users, Clinics - lógica de negócio)        │
│                     apps/api/src/modules/                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    RECURSOS COMPARTILHADOS                  │
│  (Pipes, Errors, Types, Public APIs)                        │
│                      apps/api/src/shared/                   │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 Camada de Infraestrutura (`infra/`)

Responsável pela integração com serviços externos e frameworks:

| Diretório | Responsabilidade |
|-----------|------------------|
| `database/` | PrismaService - wrapper do cliente Prisma |
| `auth/` | JWT Strategy, Guards, Decorators |
| `cryptography/` | Hash e encriptação (Bcrypt, JWT) |
| `mail/` | Envio de emails (Resend API) |
| `env/` | Validação de variáveis de ambiente |

### 3.2 Camada de Aplicação (`application/`)

Contém **Application Services** para operações que:
- Atravessam múltiplos módulos
- Requerem transações atômicas
- Precisam de orquestração complexa

### 3.3 Camada de Domínio (`modules/`)

Cada módulo representa um domínio de negócio auto-contido:
- `auth/` - Autenticação e registro
- `users/` - Gestão de usuários
- `clinics/` - Gestão de clínicas

### 3.4 Recursos Compartilhados (`shared/`)

Código reutilizável entre módulos:
- `pipes/` - Validation pipes (Zod)
- `errors/` - Classes de erro customizadas
- `public-api/` - Interfaces de comunicação entre módulos
- `core/` - Entidades base e tipos utilitários

---

## 4. Padrões de Design

### 4.1 Facade Pattern

#### Problema que Resolve

Evita acoplamento direto entre módulos, criando uma interface explícita de comunicação.

#### Diagrama

```
┌──────────────────┐         ┌──────────────────┐
│   ClinicsModule  │         │   UsersModule    │
│                  │         │                  │
│  ┌────────────┐  │         │  ┌────────────┐  │
│  │ClinicsFacade│ │ ──────► │  │ UsersFacade │ │
│  └────────────┘  │ UsersApi │  └────────────┘  │
│        │         │         │        │         │
│        ▼         │         │        ▼         │
│  ┌────────────┐  │         │  ┌────────────┐  │
│  │  Use Cases │  │         │  │  Use Cases │  │
│  └────────────┘  │         │  └────────────┘  │
│        │         │         │        │         │
│        ▼         │         │        ▼         │
│  ┌────────────┐  │         │  ┌────────────┐  │
│  │ Repository │  │         │  │ Repository │  │
│  └────────────┘  │         │  └────────────┘  │
└──────────────────┘         └──────────────────┘
```

#### Implementação

**1. Interface pública (contrato):**

```typescript
// shared/public-api/interface/users-api.interface.ts

export interface UsersApi {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  createUser(data: CreateUserData): Promise<User>;
  updateUser(user: User): Promise<User>;
}

// Symbol token para injeção de dependência
export const UsersApi = Symbol('UsersApi');
```

**2. Implementação da Facade:**

```typescript
// modules/users/public-api/facade/users.facade.ts

@Injectable()
export class UsersFacade implements UsersApi {
  constructor(
    private readonly findUserUseCase: FindUserUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}

  // Facade DELEGA para Use Cases - não contém lógica de negócio
  async findById(id: string): Promise<User | null> {
    return this.findUserUseCase.findById(id);
  }

  async createUser(data: CreateUserData): Promise<User> {
    return this.createUserUseCase.createUser(data);
  }
}
```

**3. Configuração no módulo:**

```typescript
// modules/users/users.module.ts

@Module({
  providers: [
    UsersFacade,
    { provide: UsersApi, useExisting: UsersFacade }, // Binding Symbol → Facade
  ],
  exports: [
    UsersApi, // ✅ Exporta apenas a interface (Symbol)
    // UsersFacade,     ❌ Não exportar implementação
    // UsersRepository, ❌ NUNCA exportar repositories
  ],
})
export class UsersModule {}
```

**4. Uso em outro módulo:**

```typescript
// modules/clinics/clinics.facade.ts

@Injectable()
export class ClinicsFacade {
  constructor(
    @Inject(UsersApi) private readonly usersApi: UsersApi, // Injeção via Symbol
  ) {}

  async verifyUserBelongsToClinic(userId: string, clinicId: string) {
    const user = await this.usersApi.findById(userId);
    return user?.clinicId === clinicId;
  }
}
```

#### Quando Usar

| Situação | Usar Facade? |
|----------|--------------|
| Comunicação entre módulos | ✅ Sim |
| Operações dentro do mesmo módulo | ❌ Não - use Use Cases |
| Testes unitários | ✅ Sim - facilita mocking |
| Futuro microserviços | ✅ Sim - trocar Facade por HTTP Client |

#### Como o Symbol Token Funciona

Ao ver código como este nos use cases:

```typescript
@Inject(UsersApi) private readonly usersApi: UsersApi
```

Pode parecer que a Facade não está sendo usada, mas **está**. O NestJS resolve o Symbol `UsersApi` para a classe `UsersFacade` através do binding:

```typescript
{ provide: UsersApi, useExisting: UsersFacade }
```

Então `this.usersApi.findById()` na verdade chama `UsersFacade.findById()`.

**Por que usar `usersApi` ao invés de `usersFacade`?**

A nomenclatura é intencional:
1. **Desacoplamento**: O consumidor conhece apenas a interface (`UsersApi`), não a implementação (`UsersFacade`)
2. **Testabilidade**: Facilita mockar nos testes - basta fornecer qualquer objeto que implemente `UsersApi`
3. **Preparação para microserviços**: Futuramente, você pode trocar `UsersFacade` por `UsersHttpClient` sem alterar os consumidores

**Exemplo de resolução:**

```
Use Case injeta: @Inject(UsersApi)
        ↓
NestJS resolve: { provide: UsersApi, useExisting: UsersFacade }
        ↓
Instância real: UsersFacade
        ↓
Chamada: this.usersApi.findById() → UsersFacade.findById()
```

---

### 4.2 Repository Pattern

#### Problema que Resolve

Abstrai o acesso a dados, permitindo trocar a implementação (ex: Prisma → TypeORM) sem afetar a lógica de negócio.

#### Diagrama

```
┌─────────────────────────────────────────────────────────┐
│                      Use Case                           │
│                         │                               │
│                         ▼                               │
│              ┌─────────────────────┐                    │
│              │  UsersRepository    │  ← Interface       │
│              │     (abstract)      │    abstrata        │
│              └─────────────────────┘                    │
│                         │                               │
│                         │ implementa                    │
│                         ▼                               │
│              ┌─────────────────────┐                    │
│              │PrismaUsersRepository│  ← Implementação   │
│              │    (concrete)       │    concreta        │
│              └─────────────────────┘                    │
│                         │                               │
│                         ▼                               │
│              ┌─────────────────────┐                    │
│              │    PrismaService    │  ← Banco de dados  │
│              └─────────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

#### Implementação

**1. Classe abstrata (interface):**

```typescript
// modules/users/repositories/users.repository.ts

export abstract class UsersRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract create(data: User): Promise<User>;
  abstract save(user: User): Promise<User>;
  abstract mapToEntity(user: PrismaUser): User;
}
```

**2. Implementação concreta (Prisma):**

```typescript
// modules/users/repositories/prisma-users-repository.ts

@Injectable()
export class PrismaUsersRepository extends UsersRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
    });

    return user ? this.mapToEntity(user) : null;
  }

  async create(data: User): Promise<User> {
    const createdUser = await this.prisma.client.user.create({
      data: {
        id: data.id,
        email: data.email,
        clinicId: data.clinicId,
        name: data.name,
        password: data.password,
        role: data.role,
        emailVerified: data.emailVerified,
      },
    });

    return this.mapToEntity(createdUser);
  }

  // Mapeia Prisma Model → Domain Entity
  mapToEntity(user: PrismaUser): User {
    return new User({
      id: user.id,
      email: user.email,
      clinicId: user.clinicId,
      name: user.name || '',
      password: user.password,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    });
  }
}
```

**3. Binding no módulo:**

```typescript
@Module({
  providers: [
    { provide: UsersRepository, useClass: PrismaUsersRepository },
  ],
})
export class UsersModule {}
```

#### Responsabilidades do Repository

| Deve Fazer | Não Deve Fazer |
|------------|----------------|
| CRUD básico | Lógica de negócio |
| Queries complexas | Validações |
| Mapeamento Entity ↔ ORM | Cálculos |
| Paginação | Regras de domínio |

---

### 4.3 Use Case Pattern

#### Problema que Resolve

Encapsula uma única operação de negócio, seguindo o princípio de responsabilidade única (SRP).

#### Estrutura

```typescript
// modules/users/use-cases/create-user.usecase.ts

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    email,
    name,
    password,
    clinicId,
  }: CreateUserInputDto): Promise<CreateUserResponseDto> {
    // 1. Criar entidade de domínio
    const userEntity = new User({
      email,
      name,
      password,
      clinicId,
    });

    // 2. Persistir via repository
    const createdUser = await this.usersRepository.create(userEntity);

    // 3. Retornar resposta formatada
    const { password: _, ...userWithoutPassword } = createdUser;

    return {
      user: userWithoutPassword,
    };
  }
}
```

#### Características

- **Um Use Case = Uma operação** (criar usuário, autenticar, resetar senha)
- **Injectable** via NestJS DI
- **Usa Repositories** para acesso a dados
- **Pode conter validações** de negócio
- **Chamado por** Controllers ou Facades

---

### 4.4 Entity Pattern

#### Problema que Resolve

Representa um objeto de domínio com identidade única, encapsulando dados e comportamentos.

#### Classe Base

```typescript
// shared/core/default.entity.ts

export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export abstract class DefaultEntity {
  readonly id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
```

#### Implementação

```typescript
// modules/users/entities/user.entity.ts

export type UserRole = 'USER' | 'ADMIN';

export class User {
  id: string;
  email: string;
  clinicId: string;
  name: string;
  password: string | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(
    data: WithOptional<
      User,
      'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'role' | 'emailVerified'
    >,
  ) {
    Object.assign(this, {
      ...data,
      id: data.id ? data.id : randomUUID(),        // Gera UUID se não fornecido
      role: data.role || 'USER',                   // Default: USER
      emailVerified: data.emailVerified || false,  // Default: não verificado
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      deletedAt: data.deletedAt,
    });
  }
}
```

#### Características

| Característica | Descrição |
|----------------|-----------|
| UUID automático | Gerado no construtor se não fornecido |
| Valores padrão | Role, emailVerified, timestamps |
| Soft delete | Campo `deletedAt` para exclusão lógica |
| Type-safe | `WithOptional` garante tipos corretos |

---

### 4.5 DTO Pattern

#### Problema que Resolve

Define contratos de entrada/saída, separando a representação de dados da lógica de domínio.

#### Implementação com Zod

```typescript
// modules/users/dto/create-user.dto.ts

import { z } from 'zod';
import type { User } from '../entities/user.entity';

// Schema de validação
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
  clinicId: z.string().uuid(),
});

// Tipo inferido do schema
export type CreateUserInputDto = z.infer<typeof createUserSchema>;

// Tipos de resposta
export type UserWithoutPassword = Omit<User, 'password'>;

export interface CreateUserResponseDto {
  user: UserWithoutPassword;
}
```

#### Validation Pipe

```typescript
// shared/pipes/zod-validation.pipe.ts

export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException(result.error.format());
    }

    return result.data;
  }
}
```

#### Benefícios

- **Validação em runtime** com Zod
- **Inferência de tipos** com TypeScript
- **Mensagens de erro** estruturadas
- **Documentação implícita** do contrato

---

### 4.6 Controller Pattern

#### Problema que Resolve

Recebe requisições HTTP, valida entrada, delega para Use Cases e retorna respostas.

#### Implementação

```typescript
// modules/auth/controllers/create-account.controller.ts

const createAccountBodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: passwordSchema,
});

type CreateAccountBody = z.infer<typeof createAccountBodySchema>;

@Controller('/accounts')
@Public()  // Decorator: endpoint público (sem auth)
export class CreateAccountController {
  constructor(private registerUser: RegisterUserUseCase) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createAccountBodySchema))  // Validação Zod
  async handle(@Body() body: CreateAccountBody) {
    const { name, email, password } = body;

    await this.registerUser.execute({
      name,
      email,
      password,
    });
  }
}
```

#### Fluxo do Controller

```
HTTP Request
     │
     ▼
┌─────────────────┐
│   Decorators    │  @Public(), @Roles('ADMIN')
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validation     │  ZodValidationPipe
│    Pipe         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Controller    │  Extrai dados, chama Use Case
│    Method       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Use Case     │  Executa lógica de negócio
└────────┬────────┘
         │
         ▼
HTTP Response
```

---

### 4.7 Application Service Pattern

#### Problema que Resolve

Orquestra operações que atravessam múltiplos módulos com garantia de atomicidade (transações).

#### Quando Usar

| Situação | Usar Application Service? |
|----------|---------------------------|
| Operação em múltiplos módulos + transação | ✅ Sim |
| Consulta simples entre módulos | ❌ Use Facades |
| Operação em um único módulo | ❌ Use Cases |
| Operação sem necessidade de transação | ❌ Use Facades |

#### Implementação

```typescript
// application/services/register-user-application.service.ts

@Injectable()
export class RegisterUserApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: RegisterUserInput): Promise<User> {
    // Transação atômica - tudo ou nada
    return await this.prisma.client.$transaction(async (tx) => {
      // 1. Criar clínica
      const clinicRecord = await tx.clinic.create({
        data: {
          name: input.clinicName,
          timezone: 'America/Sao_Paulo',
          isSetupComplete: false,
        },
      });

      // 2. Criar usuário vinculado à clínica
      const userRecord = await tx.user.create({
        data: {
          email: input.email,
          name: input.name,
          password: input.hashedPassword,
          clinicId: clinicRecord.id,
          role: 'ADMIN',
          emailVerified: input.emailVerified,
        },
      });

      // 3. Mapear para entidade de domínio
      return new User({
        id: userRecord.id,
        email: userRecord.email,
        name: userRecord.name,
        password: userRecord.password,
        clinicId: userRecord.clinicId,
        role: userRecord.role as 'ADMIN' | 'USER',
        emailVerified: userRecord.emailVerified,
        createdAt: userRecord.createdAt,
        updatedAt: userRecord.updatedAt,
        deletedAt: userRecord.deletedAt,
      });
    });
  }
}
```

#### Trade-off

- **Prós**: Garante consistência, operação atômica
- **Contras**: Bypassa repositories (acesso direto ao Prisma)

---

## 5. Injeção de Dependência

O NestJS gerencia toda a injeção de dependência. Existem 4 estratégias utilizadas:

### 5.1 Class-based DI (mais comum)

```typescript
@Module({
  providers: [
    CreateUserUseCase,                                        // Classe direta
    { provide: UsersRepository, useClass: PrismaUsersRepository }, // Abstract → Concrete
  ],
})
```

### 5.2 Symbol Token DI (para Facades)

```typescript
// Evita colisões de nomes e permite polimorfismo
@Module({
  providers: [
    UsersFacade,
    { provide: UsersApi, useExisting: UsersFacade }, // Symbol → Classe
  ],
  exports: [UsersApi],
})

// Uso
constructor(@Inject(UsersApi) private usersApi: UsersApi) {}
```

### 5.3 Factory Pattern DI

```typescript
// Para inicialização complexa
{
  provide: JwtEncrypter,
  inject: [EnvService],
  useFactory: (env: EnvService) => {
    const privateKey = env.get('JWT_PRIVATE_KEY');
    return new JwtEncrypter({
      privateKey: Buffer.from(privateKey, 'base64'),
      expiresIn: '15m',
    });
  },
}
```

### 5.4 Global Modules

```typescript
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
```

Módulos globais: `DatabaseModule`, `CryptographyModule`, `InfraAuthModule`

---

## 6. Autenticação e Autorização

### JWT Strategy (RS256)

```typescript
// infra/auth/jwt.strategy.ts

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: EnvService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractTokenFromCookieOrHeader,  // Cookie ou Header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: Buffer.from(config.get('JWT_PUBLIC_KEY'), 'base64'),
      algorithms: ['RS256'],  // Algoritmo assimétrico
    });
  }

  validate(payload: UserPayload) {
    return tokenPayloadSchema.parse(payload);  // Valida com Zod
  }
}
```

### Chain de Guards

```
Request
   │
   ▼
┌──────────────┐
│ JwtAuthGuard │  Valida JWT (pula se @Public)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  RolesGuard  │  Verifica roles (@Roles('ADMIN'))
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  CsrfGuard   │  Valida CSRF token
└──────┬───────┘
       │
       ▼
   Controller
```

### Decorators Customizados

| Decorator | Função |
|-----------|--------|
| `@Public()` | Pula autenticação JWT |
| `@CurrentUser()` | Injeta usuário autenticado |
| `@Roles('ADMIN')` | Requer role específica |

---

## 7. Estrutura de um Módulo

Exemplo completo do módulo Users:

```
modules/users/
├── users.module.ts              # Definição do módulo NestJS
│
├── controllers/                 # Endpoints HTTP
│   ├── users.controller.ts
│   └── get-current-user.controller.ts
│
├── use-cases/                   # Lógica de negócio
│   ├── create-user.usecase.ts
│   ├── find-user.usecase.ts
│   ├── update-password.usecase.ts
│   └── verify-email.usecase.ts
│
├── entities/                    # Modelos de domínio
│   └── user.entity.ts
│
├── repositories/                # Acesso a dados
│   ├── users.repository.ts      # Interface abstrata
│   └── prisma-users-repository.ts  # Implementação Prisma
│
├── dto/                         # Data Transfer Objects
│   └── create-user.dto.ts
│
└── public-api/                  # API pública (para outros módulos)
    └── facade/
        └── users.facade.ts
```

### Configuração do Módulo

```typescript
// modules/users/users.module.ts

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController, GetCurrentUserController],
  providers: [
    // Repository (interno)
    { provide: UsersRepository, useClass: PrismaUsersRepository },

    // Use Cases (internos)
    FindUserUseCase,
    CreateUserUseCase,
    VerifyEmailUseCase,
    UpdatePasswordUseCase,

    // Facade (público via Symbol)
    UsersFacade,
    { provide: UsersApi, useExisting: UsersFacade },
  ],
  exports: [
    UsersApi, // ✅ Apenas a interface pública
  ],
})
export class UsersModule {}
```

---

## 8. Fluxo de Requisição

### Exemplo: Registro de Usuário

```
POST /accounts
     │
     ▼
┌─────────────────────────────────────┐
│     CreateAccountController          │
│  - Valida body com Zod              │
│  - Extrai: name, email, password     │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│      RegisterUserUseCase             │
│  - Verifica se usuário existe        │
│  - Hash da senha                     │
│  - Delega para Application Service   │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  RegisterUserApplicationService      │
│  - Inicia transação Prisma           │
│  - Cria Clinic                       │
│  - Cria User vinculado               │
│  - Retorna User entity               │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│      RegisterUserUseCase             │
│  - Envia email de verificação        │
│  - Retorna User                      │
└────────────────┬────────────────────┘
                 │
                 ▼
         HTTP 201 Created
```

---

## 9. Packages Compartilhados

### 9.1 @workspace/database

```typescript
// Importação
import { prisma, User } from '@workspace/database';

// Uso
const user = await prisma.user.findUnique({ where: { id } });
```

**Características:**
- Singleton Pattern com cache global
- PostgreSQL + Prisma ORM
- Tipos gerados automaticamente

### 9.2 @workspace/ui

```typescript
// Importação de componentes
import { Button } from '@workspace/ui/components/button';
import { Field, FieldLabel, FieldError } from '@workspace/ui/components/field';

// Importação de utilitários
import { cn } from '@workspace/ui/lib/utils';
```

**Características:**
- 53+ componentes React
- Baseado em shadcn/ui + Radix
- Tailwind CSS + CVA para variantes

### 9.3 @workspace/eslint-config

- `base.js` - Configuração base (ESLint + TypeScript + Prettier)
- `next.js` - Para apps Next.js
- `react-internal.js` - Para packages React

### 9.4 @workspace/typescript-config

- `base.json` - Configuração base
- `nestjs.json` - Para NestJS (CommonJS, decorators)
- `nextjs.json` - Para Next.js
- `react-library.json` - Para packages React

---

## 10. Convenções e Boas Práticas

### Nomenclatura de Arquivos

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Controller | `*.controller.ts` | `create-account.controller.ts` |
| Use Case | `*.usecase.ts` | `register-user.usecase.ts` |
| Repository | `*.repository.ts` | `users.repository.ts` |
| Entity | `*.entity.ts` | `user.entity.ts` |
| DTO | `*.dto.ts` | `create-user.dto.ts` |
| Facade | `*.facade.ts` | `users.facade.ts` |
| Module | `*.module.ts` | `users.module.ts` |

### Organização de Imports

```typescript
// 1. Imports do NestJS/Node
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

// 2. Imports de packages externos
import { z } from 'zod';

// 3. Imports internos (usando path alias @/)
import { PrismaService } from '@/infra/database/prisma.service';
import { UsersRepository } from '@/modules/users/repositories/users.repository';

// 4. Imports relativos
import { User } from '../entities/user.entity';
```

### Tratamento de Erros

```typescript
// Erros customizados
export class UserAlreadyExistsError extends ConflictException {
  constructor(identifier: string) {
    super(`User "${identifier}" already exists.`);
  }
}

export class ResourceNotFoundError extends Error {
  constructor() {
    super('Resource not found.');
  }
}

// Uso no Use Case
async execute(input: Input) {
  const existingUser = await this.usersRepository.findByEmail(input.email);

  if (existingUser) {
    throw new UserAlreadyExistsError(input.email);
  }

  // ...
}
```

### Regras Gerais

1. **Facade é delegação** - Não contém lógica de negócio
2. **Repository é interno** - Nunca exportar para outros módulos
3. **Use Case é único** - Uma operação por classe
4. **Entity é rica** - Pode ter comportamentos (métodos)
5. **DTO é imutável** - Apenas dados, sem comportamento

---

## Grafo de Dependências

```
                          ┌─────────────┐
                          │  AppModule  │
                          └──────┬──────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│  AuthModule   │       │  UsersModule  │       │ ClinicsModule │
└───────┬───────┘       └───────┬───────┘       └───────┬───────┘
        │                       │                       │
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Global Modules       │
                    │  - DatabaseModule     │
                    │  - CryptographyModule │
                    │  - InfraAuthModule    │
                    └───────────────────────┘
```

---

## Resumo

| Padrão | Localização | Responsabilidade |
|--------|-------------|------------------|
| **Facade** | `public-api/facade/` | Interface pública do módulo |
| **Repository** | `repositories/` | Abstração de acesso a dados |
| **Use Case** | `use-cases/` | Lógica de negócio única |
| **Entity** | `entities/` | Modelo de domínio |
| **DTO** | `dto/` | Contratos de entrada/saída |
| **Controller** | `controllers/` | Endpoints HTTP |
| **Application Service** | `application/services/` | Orquestração transacional |

Esta arquitetura é projetada para ser **manutenível**, **testável** e **escalável**, permitindo evolução para microserviços no futuro através da substituição de Facades por HTTP Clients.

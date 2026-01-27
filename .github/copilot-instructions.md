# BandBooster Frontend - Copilot Instructions

## Project Overview
IELTS practice platform built with **Next.js 16+, React 19, TanStack Query, Tailwind CSS v4, and Framer Motion**. Uses pnpm for package management.

## Architecture: Domain-Driven Design

### Domain Structure (`src/domains/{feature}/`)
Each domain is a self-contained module with strict layering:
```
domains/{feature}/
├── api/
│   ├── {feature}.api.ts      # API client functions
│   ├── {feature}.contract.ts # DTOs matching backend (snake_case)
│   └── {feature}.mapper.ts   # DTO ↔ Domain transformations
├── models/
│   └── domain.ts             # Domain models (camelCase, readonly)
├── queries/
│   └── {feature}.queries.ts  # TanStack Query hooks
├── components/               # Feature-specific components
└── index.ts                  # Public API barrel export
```

**Key Pattern**: Always transform snake_case DTOs from backend to camelCase domain models via mappers. Example from [auth.mapper.ts](src/domains/auth/api/auth.mapper.ts):
```typescript
export function mapUserDTOToDomain(dto: UserDTO): User {
  return {
    firstName: dto.first_name,  // snake_case → camelCase
    isVerified: dto.is_verified,
    // ... readonly domain properties
  };
}
```

### Adding New Features
1. Create domain folder with api/, models/, queries/, components/
2. Define DTOs in `contract.ts` matching backend exactly
3. Create mapper functions for DTO ↔ Domain transformations
4. Build TanStack Query hooks in `queries.ts`
5. Export public API through `index.ts`

## Component Conventions

### UI Components (`src/components/ui/`)
- Use `"use client"` directive for client components
- Implement variant patterns via object maps:
```typescript
const buttonVariants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
} as const;
```
- Use `cn()` utility from `@/lib/utils` for class merging (clsx + tailwind-merge)
- Support `animated` prop pattern for Framer Motion variants

### Import Aliases
Use `@/` path alias pointing to `src/`:
```typescript
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { authApi } from "@/domains/auth";
```

## Styling System

### CSS Variables (Tailwind v4)
Defined in [globals.css](src/app/globals.css) with dark mode via `.dark` class:
- Surfaces: `--surface`, `--surface-elevated`
- Text: `--text-primary`, `--text-secondary`, `--text-muted`
- Primary (sky blue): `--primary-500` through `--primary-900`
- Accent (purple): `--accent-500` through `--accent-900`

### Design Tokens
Reference [styles/tokens.ts](src/styles/tokens.ts) for color scales and spacing.

## State Management

### TanStack Query Patterns
Query keys follow factory pattern in [auth.queries.ts](src/domains/auth/queries/auth.queries.ts):
```typescript
export const authQueryKeys = {
  all: ['auth'] as const,
  user: () => [...authQueryKeys.all, 'user'] as const,
  session: () => [...authQueryKeys.all, 'session'] as const,
};
```

### Auth Context
`AuthProvider` in [AuthProvider.tsx](src/domains/auth/components/AuthProvider.tsx) manages:
- Token storage in localStorage (`access_token`, `refresh_token`)
- User state hydration and refresh
- Redirect on logout

## IELTS Practice Components

### Question Types (`domains/practice/components/exam/question-types/`)
Factory pattern with `QuestionTypeFactory` auto-detecting:
- MCQ, MCMA, TFNG, YNNG (multiple choice variants)
- SA, SC, SUC, NC, TC, FC, FCC (completion types)
- MH, MI, MF, ML, DL (matching/diagram types)

## Development Commands
```bash
pnpm dev      # Start dev server
pnpm build    # Production build
pnpm lint     # ESLint
```

## API Integration
- Base URL: `NEXT_PUBLIC_API_URL` env variable
- Auth: Bearer token in `Authorization` header
- Always handle `window === undefined` for SSR safety

## File Naming
- Components: PascalCase (`AuthProvider.tsx`)
- Utilities/hooks: camelCase (`auth.queries.ts`)
- Contracts/types: camelCase with `.contract.ts`, `.domain.ts` suffixes

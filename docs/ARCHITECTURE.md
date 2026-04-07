# Architecture

## Overview

MyFundingTrade is a proprietary trading (prop trading) evaluation and funding platform. Traders purchase challenge evaluations, prove their trading skills under defined risk rules, and receive funded accounts with profit-sharing.

## System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        Nginx Reverse Proxy                      │
│          (myfundingtrade.com / portal.* / admin.* / api.*)      │
└───────┬──────────┬──────────────┬──────────────┬───────────────┘
        │          │              │              │
   ┌────▼───┐ ┌───▼────┐  ┌─────▼────┐  ┌─────▼────┐
   │  Web   │ │ Portal │  │  Admin   │  │   API    │
   │:3000   │ │:3001   │  │:3002     │  │:4000     │
   │Next.js │ │Next.js │  │Next.js   │  │NestJS    │
   └────────┘ └────────┘  └──────────┘  └────┬─────┘
                                              │
                                    ┌─────────┴─────────┐
                                    │                   │
                               ┌────▼────┐        ┌────▼────┐
                               │PostgreSQL│        │  Redis  │
                               │  :5432   │        │  :6379  │
                               └──────────┘        └─────────┘
```

## Apps

| App      | Purpose                    | Port |
|----------|----------------------------|------|
| `web`    | Public marketing site      | 3000 |
| `portal` | Trader dashboard           | 3001 |
| `admin`  | Internal admin panel       | 3002 |
| `api`    | Backend REST API           | 4000 |

## Shared Packages

| Package  | Purpose                              |
|----------|--------------------------------------|
| `ui`     | Design system (Button, Card, Input)  |
| `config` | Shared ESLint, TSConfig, Prettier    |
| `types`  | Shared DTOs, interfaces, enums       |
| `utils`  | Shared formatting/string helpers     |

## Key Design Decisions

1. **Monorepo with Turborepo** — single source of truth, atomic changes across apps.
2. **Next.js standalone output** — minimal Docker images with no dev dependencies.
3. **Prisma ORM** — type-safe database access with migration support.
4. **NestJS modular architecture** — each domain (auth, users, challenges) is an isolated module.
5. **Tailwind CSS v4** — utility-first CSS with the new CSS-native configuration.
6. **Dark theme by default** — trading platforms are usually dark-themed for extended screen time.

# Vela

> A decentralized SocialFi platform built on Stellar and Soroban. Create posts, follow creators, tip with any token, and join community pools — all on-chain. Your profile, social graph, and revenue belong to you, not a platform.

[![CI](https://github.com/ijayabby/vela-social/actions/workflows/ci.yml/badge.svg)](https://github.com/ijayabby/vela-social/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Telegram](https://img.shields.io/badge/Telegram-Join-blue?logo=telegram)](https://t.me/+13csp8G4ccRhY2Zk)
[![Built on Stellar](https://img.shields.io/badge/Built%20on-Stellar-black?logo=stellar)](https://stellar.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Status](#project-status)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Vela is an open-source SocialFi protocol that combines social networking with on-chain financial primitives. Built on the Stellar blockchain using Soroban smart contracts, it gives creators direct ownership of their audience, content, and revenue — without relying on centralized intermediaries.

The protocol supports creator profiles, on-chain follow graphs, posts, token tipping, community investment pools, end-to-end encrypted DMs, a mini app ecosystem, and on-chain governance — all governed by the community.

---

## Features

| Feature | Description |
|---|---|
| **On-chain Profiles** | Create and own your identity on Stellar |
| **Social Graph** | Follow/unfollow backed by Soroban contract state |
| **Posts & Feed** | Publish content with real-time WebSocket updates |
| **Token Tipping** | Tip creators with any Stellar token, instantly |
| **Community Pools** | Stake and earn yield while supporting creators |
| **Governance** | On-chain proposals and voting for protocol decisions |
| **E2EE Direct Messages** | Encrypted DMs with on-chain key publishing |
| **Mini Apps** | Third-party apps embedded inside Vela via a bridge API |
| **Analytics Oracle** | Signed, verifiable creator analytics submitted on-chain |
| **Moderation** | Decentralized content moderation primitives |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  Soroban Smart Contract  (packages/contracts)                    │
│  Profiles · Posts · Tips · Pools · Governance · Moderation       │
└────────────┬───────────────────────┬─────────────────────────────┘
             │ contract calls (XDR)  │ events (Stellar RPC)
             ▼                       ▼
┌───────────────────────┐  ┌──────────────────────────────────────┐
│  SDK (packages/sdk)   │  │  Indexer (services/indexer)          │
│  VelaClient          │  │  PostgreSQL · full-text search API   │
│  TransactionQueue     │  └──────────────────────────────────────┘
└───────────┬───────────┘                  │  REST / WebSocket
            │                              ▼
            │             ┌─────────────────────────────────────────┐
            └────────────►│  Web (apps/web) · Mobile (apps/mobile)  │
                          │  Next.js 15 · Expo / React Native       │
                          └─────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Rust — Soroban (Stellar) |
| SDK | TypeScript — `VelaClient` |
| Web App | Next.js 15, React 19, Tailwind CSS v4 |
| Mobile | Expo / React Native |
| Indexer | Node.js, PostgreSQL, WebSocket |
| DM Relay | Node.js — E2EE relay server |
| Analytics Oracle | Node.js — Ed25519 attestations |
| Monorepo | pnpm workspaces + Turborepo |

---

## Project Status

| Package | Status |
|---|---|
| `packages/contracts` | ✅ Core social + DeFi primitives, unit tested |
| `packages/sdk` | ✅ Typed contract client |
| `apps/web` | ✅ Next.js web frontend |
| `apps/mobile` | ✅ Expo / React Native mobile app |
| `services/indexer` | ✅ Off-chain event indexer |
| `services/dm-relay` | ✅ E2EE direct-message relay |
| `services/analytics-oracle` | ✅ On-chain analytics oracle |
| `examples/mini-apps` | ✅ Example mini apps available |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) >= 20
- [pnpm](https://pnpm.io) >= 9
- [Rust](https://rustup.rs) + `wasm32v1-none` target (for contract builds)
- [Docker](https://docker.com) + Compose v2 (for indexer + migrations)

### Installation

```bash
# Clone the repository
git clone https://github.com/ijayabby/vela-social.git
cd vela-social

# Install dependencies
pnpm install
```

### Running Locally

```bash
# Web frontend — http://localhost:3000
pnpm --filter apps-web dev

# Mobile app
pnpm --filter mobile start      # press 'a' Android · 'i' iOS

# Indexer (requires PostgreSQL)
cd services/indexer
cp .env.example .env            # set DATABASE_URL and SOROBAN_RPC_URL
pnpm dev

# Contract build + tests
pnpm --filter contracts build
pnpm --filter contracts test
```

> **No backend?** The web app includes a mock data fallback for local development. The feed and following tabs work without the indexer running.

---

## Environment Variables

Create a `.env.local` file inside `apps/web/` with the following:

```env
# Stellar / Soroban
NEXT_PUBLIC_CONTRACT_ID=          # Deployed Soroban contract address
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015

# Indexer
NEXT_PUBLIC_INDEXER_URL=http://localhost:3001

# App
NEXT_PUBLIC_WEB_URL=http://localhost:3000
```

For the indexer, copy and fill `services/indexer/.env.example`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/vela
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
CONTRACT_ID=
```

---

## Testing

```bash
# Smart contract unit tests
pnpm --filter contracts test

# SDK unit tests
pnpm --filter vela-sdk test

# Indexer migration tests (requires Docker)
bash tests/migrations/test-migrations.sh

# Web app E2E tests
pnpm --filter apps-web test:e2e
```

---

## Documentation

| Document | Description |
|---|---|
| [System Architecture](./docs/ARCHITECTURE.md) | Component overview and data flows |
| [Design System](./docs/design/README.md) | UI/UX specifications and brand identity |
| [Mobile Developer Guide](./docs/mobile/DEVELOPER_GUIDE.md) | Expo setup, simulators, EAS builds |
| [Indexer Design](./docs/indexer/INDEXER_DESIGN.md) | Event indexing strategy and search API |
| [Indexer Migrations](./services/indexer/migrations/README.md) | Migration authoring rules and testing |
| [Mini Apps Developer Guide](./docs/mini-apps/DEVELOPER_GUIDE.md) | Build and submit a Vela mini app |
| [Mini Apps Bridge API](./docs/mini-apps/BRIDGE_API.md) | Bridge method reference |
| [Security Policy](./SECURITY.md) | Vulnerability disclosure guidance |

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for environment setup, branch conventions, and the PR process.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a PR against `main`

---

## License

[MIT](./LICENSE) © Vela Contributors

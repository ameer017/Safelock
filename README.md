# 🛡️ Cartridge

**Save smarter. Spend wiser. Build discipline. — The decentralized contingency plan you can't cheat.**

A decentralized contingency platform for savings, transfers, and swaps with time-locked discipline, built with Next.js, TypeScript, and Turborepo.

## 🎯 What is Cartridge?

Cartridge is a Web3-native savings and contingency platform that empowers users to build financial discipline through:

- **Time-locked savings** with smart contracts that prevent early withdrawals
- **Instant cross-border transfers** via human-readable addresses (ENS)
- **Seamless token swapping** within the platform
- **Penalty-based incentives** that reward disciplined savers

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

This is a monorepo managed by Turborepo with the following structure:

- `apps/web` - Next.js application with embedded UI components and utilities
- `apps/hardhat` - Smart contract development environment

## 📋 Available Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Lint all packages and apps
- `pnpm type-check` - Run TypeScript type checking

### Smart Contract Scripts

- `pnpm contracts:compile` - Compile smart contracts
- `pnpm contracts:test` - Run smart contract tests
- `pnpm contracts:deploy` - Deploy contracts to local network
- `pnpm contracts:deploy:alfajores` - Deploy to Celo Alfajores testnet
- `pnpm contracts:deploy:celo` - Deploy to Celo mainnet

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Smart Contracts**: Hardhat with Viem
- **Monorepo**: Turborepo
- **Package Manager**: PNPM

## 📚 Documentation

- [Project Milestones](./milestone.md) - Detailed development timeline and goals
- [Next.js Documentation](https://nextjs.org/docs)
- [Celo Documentation](https://docs.celo.org/)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

## 🎯 Development Goals

Cartridge aims to solve key problems in personal finance:
- **Low savings culture** - Providing structured, time-locked savings mechanisms
- **Impulse withdrawals** - Implementing penalty systems that encourage discipline
- **Trust issues** - Building on decentralized, transparent smart contracts
- **Cross-border inefficiency** - Enabling instant, low-cost international transfers

## 🔒 Security & Transparency

All funds are managed by audited smart contracts with no centralized custodians. The platform operates on Ethereum's decentralized network, ensuring transparency and security for all users.

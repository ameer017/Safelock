# 🛡️ SafeLock

**Save smarter. Spend wiser. Build discipline. — The decentralized contingency plan you can't cheat.**

A decentralized contingency platform for savings with time-locked discipline, built with Next.js, TypeScript, and Turborepo.

## 🎯 What is SafeLock?

SafeLock is a Web3-native savings and contingency platform that empowers users to build financial discipline through:

- **Time-locked savings** with smart contracts that prevent early withdrawals
- **Penalty-based incentives** that reward disciplined savers
- **Decentralized security** with no centralized custodians

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

- `apps/web` - Next.js application with UI components and wallet integration
- `apps/contracts` - Smart contract development environment with Hardhat

## 📋 Available Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Lint all packages and apps
- `pnpm type-check` - Run TypeScript type checking
- `pnpm clean` - Clean build artifacts

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
- **Smart Contracts**: Hardhat with Solidity
- **Blockchain**: Celo Network
- **Monorepo**: Turborepo
- **Package Manager**: PNPM

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Celo Documentation](https://docs.celo.org/)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

## 🎯 Development Goals

SafeLock aims to solve key problems in personal finance:
- **Low savings culture** - Providing structured, time-locked savings mechanisms
- **Impulse withdrawals** - Implementing penalty systems that encourage discipline
- **Trust issues** - Building on decentralized, transparent smart contracts
- **Financial discipline** - Creating incentives for long-term savings habits

## 🔒 Security & Transparency

All funds are managed by smart contracts with no centralized custodians. The platform operates on the Celo network, ensuring transparency and security for all users.

## 🚧 Development Status

This project is currently in active development. The smart contract foundation has been established with the SafeLock contract system.

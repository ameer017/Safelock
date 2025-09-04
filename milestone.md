# 🛡️ Cartridge Project Milestones

## 📛 Project Name
**Cartridge** — A decentralized contingency platform for savings, transfers, and swaps with time-locked discipline.

## 📝 Description
Cartridge is a Web3-native savings and contingency platform where users can:
- Save money with time-locked smart contracts
- Send/receive funds instantly via human-readable addresses
- Face penalties for early withdrawals to encourage financial discipline
- **Register user accounts with unique usernames**
- **Manage profiles and account settings**
- **Emergency account deactivation with full fund recovery**

This creates a decentralized safety net that blends the security of DeFi with the accountability of traditional "fixed deposit" savings schemes.

## ❌ Problem Statement
- **Low savings culture**: Many people lack structured systems to save consistently
- **Impulse withdrawals**: Even when people save, they dip into funds too early, breaking their goals
- **Lack of trust in custodians**: Traditional banks or apps that offer locked savings are centralized, opaque, and prone to misuse
- **Cross-border inefficiency**: Sending/receiving money across countries is slow and costly

## ✅ Solution Statement
Cartridge solves this by building a decentralized, transparent, and disciplined financial layer:
- **Time-locked savings smart contracts**: Users set savings goals (e.g., 6 months) and can't withdraw early without penalty
- **Penalty → Pool Incentives**: Early withdrawal penalties are redistributed to other savers, rewarding discipline
- **Decentralized, no custodian**: All funds are managed by smart contracts, not middlemen
- **User registration system**: Unique usernames and profile management for better user experience
- **Emergency exit mechanism**: Account deactivation returns all funds immediately, regardless of lock status

## 🎯 Mission
To empower individuals and communities to build financial discipline and resilience using decentralized technology, ensuring savings and remittances are secure, borderless, and transparent.

## 🕒 Development Timeline (4 Weeks)

### Week 1: Smart Contract Foundation
- [x] Smart contract design → savings lock, penalty logic
- [x] **User registration and profile management system**
- [x] **Emergency account deactivation functionality**
- [ ] Deploy basic contracts on Celo testnet (Alfajores cUSD)
- [ ] Set up development environment and testing framework

### Week 2: Frontend Foundation
- [ ] Frontend scaffold: wallet connect, savings dashboard
- [ ] Basic UI components and layout structure
- [ ] **Enhanced Wallet Integration**: Improve RainbowKit configuration and add additional wallet support
- [ ] **User Registration UI**: Create registration form with username validation
- [ ] **Profile Management**: User profile editing and display components
- [ ] **Account Deactivation**: Emergency exit interface with confirmation

### Week 3: Core Features Implementation
- [ ] Start basic testing + bug fixes
- [ ] Integration testing between contracts and frontend
- [ ] **Contract Integration**: Implement contract interactions using Wagmi hooks and utilities
- [ ] **Enhanced Wallet Support**: Add support for additional wallet providers
- [ ] **User Authentication Flow**: Connect wallet → check registration → register if needed
- [ ] **Profile Integration**: Display user info and savings data together

### Week 4: Polish & Launch Preparation
- [ ] Full UI/UX polish
- [ ] Write documentation + prepare launch demo
- [ ] Deploy final contracts
- [ ] **Analytics Dashboard Setup**: Configure contract management and analytics
- [ ] **User Experience Testing**: Test registration, profile updates, and deactivation flows
- [ ] Security audit and final testing
- [ ] Prepare launch materials

## 🏷️ Tagline
**"Save smarter. Spend wiser. Build discipline. — The decentralized contingency plan you can't cheat."**

## 🚀 Success Metrics
- [ ] Smart contracts deployed and tested on testnet
- [ ] Frontend application with core functionality
- [ ] Working savings lock mechanism with penalty system
- [ ] **User registration system with unique usernames**
- [ ] **Profile management and account settings**
- [ ] **Emergency account deactivation with full fund recovery**
- [ ] Complete documentation and deployment guide

## 🔧 Technical Requirements
- **Blockchain**: Celo (Alfajores cUSD testnet for development)
- **Smart Contracts**: Solidity with Hardhat
- **Frontend**: Next.js with TypeScript
- **Wallet Integration**: RainbowKit + Wagmi for wallet connections and Web3 interactions
- **Web3 Infrastructure**: Wagmi for contract interactions, wallet connections, and dashboard analytics
- **User Management**: Frontend-based profile storage with blockchain username validation
- **Emergency Features**: Smart contract emergency exit with full fund recovery

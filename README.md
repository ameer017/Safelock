# Cartridge - Celo Token Wallet Browser Extension

A developer-first Celo token wallet browser extension that supports both mainnet and testnet (testnet by default). Built with modern web technologies and a focus on developer experience, security, and extensibility.

## 🚀 Features

- **Multi-Network Support**: Celo mainnet and testnet (Alfajores)
- **Developer-First**: Built with developers in mind, featuring debugging tools and APIs
- **Secure**: Industry-standard encryption and security practices
- **Extensible**: Plugin architecture for custom functionality
- **Modern UI**: Clean, responsive interface with theme support
- **dApp Integration**: Seamless integration with Celo dApps

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript
- **Build Tool**: Webpack 5
- **State Management**: Zustand
- **Blockchain**: Celo SDK, Ethers.js
- **Testing**: Jest, React Testing Library
- **Code Quality**: ESLint, Prettier
- **Extension**: Chrome Extension Manifest V3

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- Chrome/Chromium browser for development

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/cartridge-wallet/cartridge.git
cd cartridge
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Development Mode

```bash
npm run dev
```

This will start the development build with hot reloading.

### 4. Load Extension in Browser

1. Open Chrome/Chromium
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist/` folder from the project

### 5. Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── background/          # Service worker (background script)
├── popup/              # Extension popup interface
├── content/            # Content script for dApp integration
├── options/            # Extension settings page
├── components/         # Reusable React components
├── services/           # Business logic and API services
├── store/              # State management (Zustand)
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── constants/          # Application constants
├── hooks/              # Custom React hooks
└── manifest.json       # Extension manifest
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Individual component and function testing
- **Integration Tests**: Service and API integration testing
- **E2E Tests**: End-to-end user flow testing

## 🔧 Development

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check
```

### Available Scripts

- `npm run dev` - Development build with watch mode
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run test` - Run test suite
- `npm run lint` - Lint code
- `npm run format` - Format code
- `npm run clean` - Clean build directory
- `npm run extension:load` - Build and prepare for loading

## 🔐 Security

### Key Security Features

- **Secure Storage**: Encrypted local storage for sensitive data
- **Private Key Management**: Secure handling of private keys
- **Transaction Validation**: Comprehensive transaction validation
- **Phishing Protection**: Built-in phishing detection
- **Auto-lock**: Automatic wallet locking for security

### Security Best Practices

- Never log sensitive information
- Use secure random number generation
- Validate all user inputs
- Implement proper error handling
- Regular security audits

## 🌐 Network Configuration

### Supported Networks

- **Mainnet**: Celo mainnet (Chain ID: 42220)
- **Testnet**: Alfajores testnet (Chain ID: 44787)
- **Baklava**: Baklava testnet (Chain ID: 62320)

### Network Endpoints

- Mainnet RPC: `https://forno.celo.org`
- Alfajores Testnet RPC: `https://alfajores-forno.celo-testnet.org`
- Baklava Testnet RPC: `https://baklava-forno.celo-testnet.org`

### Supported Tokens

Cartridge supports a comprehensive list of tokens across all networks:

**Mainnet Tokens:**

- CELO (Native), cUSD, cEUR, cREAL, eXOF, cKES, PUSO, cCOP, cGHS, USDT, USDC, USDGLO

**Alfajores Testnet Tokens:**

- CELO (Native), cUSD, cEUR, cREAL, eXOF, cKES, PUSO, cCOP, cGHS, USDC

**Baklava Testnet Tokens:**

- CELO (Native), cUSD, cEUR

## 🔌 dApp Integration

### Provider API

Cartridge provides a Web3 provider for dApp integration:

```javascript
// Check if Cartridge is available
if (window.cartridge) {
  // Request account access
  const accounts = await window.cartridge.requestAccounts();

  // Send transaction
  const txHash = await window.cartridge.sendTransaction({
    to: '0x...',
    value: '0x...',
    gasLimit: '0x5208',
  });
}
```

### Supported Methods

- `eth_requestAccounts` - Request account access
- `eth_accounts` - Get connected accounts
- `eth_sendTransaction` - Send transaction
- `personal_sign` - Sign message
- `net_version` - Get network version
- `wallet_switchEthereumChain` - Switch networks

## 🎨 UI/UX

### Design System

- **Colors**: Consistent color palette with theme support
- **Typography**: Modern, readable fonts
- **Components**: Reusable UI components
- **Responsive**: Works on different screen sizes
- **Accessibility**: WCAG 2.1 AA compliant

### Themes

- **Light**: Default light theme
- **Dark**: Dark theme for low-light environments
- **System**: Follows system preference

## 📚 Documentation

### API Documentation

- [Extension API](./docs/api.md)
- [Provider API](./docs/provider.md)
- [Security Guide](./docs/security.md)
- [Development Guide](./docs/development.md)

### Examples

- [Basic Integration](./examples/basic-integration.md)
- [Transaction Handling](./examples/transactions.md)
- [Custom Components](./examples/components.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards

- Follow TypeScript best practices
- Write comprehensive tests
- Use meaningful commit messages
- Follow the existing code style
- Document new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check the docs folder
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join our GitHub Discussions
- **Discord**: Join our Discord community

### Common Issues

- **Extension not loading**: Check browser console for errors
- **Build failures**: Ensure Node.js version is >= 18
- **Test failures**: Run `npm run clean` and reinstall dependencies

## 🗺️ Roadmap

See our [Milestones](./milestone.md) for detailed development roadmap.

### Upcoming Features

- [ ] Multi-account support
- [ ] Hardware wallet integration
- [ ] DeFi protocol integration
- [ ] Mobile companion app
- [ ] Advanced developer tools

## 🙏 Acknowledgments

- Celo Foundation for the Celo blockchain
- MetaMask team for inspiration
- Open source community for tools and libraries

---

**Built with ❤️ for the Celo ecosystem**

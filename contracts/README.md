# Fan Token Campaign Contracts

Smart contracts for deploying Fan Token campaigns on Chiliz Chain with leaderboard and reward claiming functionality.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16
- A Chiliz Chain testnet account with some CHZ tokens
- PSG Fan Tokens (for testing)

### One-Command Setup

```bash
# 1. Set up environment
cp .env.example .env
# Edit .env and add your private key

# 2. Deploy contracts and configure everything
pnpm run setup
```

That's it! The setup script will:
- Deploy the CampaignFactory contract to Chiliz Chain
- Generate backend configuration files
- Create frontend contract configurations
- Verify PSG token support

## 📋 Manual Setup

If you prefer manual setup:

```bash
# 1. Install dependencies
npm install

# 2. Compile contracts
npm run compile

# 3. Deploy to Chiliz testnet
npm run deploy

# 4. For local development
npm run dev
```

## 🏗️ Contract Architecture

### CampaignFactory.sol
- **Purpose**: Main factory contract that creates individual campaign contracts
- **Features**:
  - Creates campaign contracts for completed campaigns
  - Manages PSG token validation
  - Handles contract registry

### CampaignRewards.sol
- **Purpose**: Individual campaign contract for reward distribution
- **Features**:
  - Stores final leaderboard on-chain
  - Manages token distribution
  - Allows users to claim rewards
  - Provides leaderboard queries

### Supported Tokens
- **PSG Unwrapped**: `0xb0Fa395a3386800658B9617F90e834E2CeC76Dd3`
- **PSG Wrapped**: `0x6D124526a5948Cb82BB5B531Bf9989D8aB34C899`

## 🔧 Environment Configuration

### Required Variables
```env
# Your private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Optional: Custom RPC (defaults to Ankr)
CHILIZ_RPC_URL=https://rpc.ankr.com/chiliz
CHILIZ_CHAIN_ID=88882
```

### Get Testnet CHZ
Visit the [Chiliz Faucet](https://faucet.chiliz.com) to get testnet CHZ tokens.

## 🎯 Usage

### Deploy a Campaign
The contracts are automatically deployed when campaigns are completed through the backend API:

```bash
POST /api/campaigns/:id/complete-blockchain
Headers: x-evm-address: <admin_address>
```

### Query Campaign Info
```bash
GET /api/campaigns/:id/contract-address
GET /api/campaigns/:id/claimable/:userAddress
```

### Claim Rewards
Users can claim rewards directly from the campaign contract using a Web3 wallet.

## 📊 Network Information

- **Network**: Chiliz Chain
- **Chain ID**: 88882
- **RPC URL**: https://rpc.ankr.com/chiliz
- **Explorer**: https://testnet.chiliscan.com
- **Faucet**: https://faucet.chiliz.com

## 🔍 Contract Verification

After deployment, contracts are automatically verified on the Chiliz block explorer. You can view them at:
- Factory: `https://testnet.chiliscan.com/address/{FACTORY_ADDRESS}`
- Campaigns: `https://testnet.chiliscan.com/address/{CAMPAIGN_ADDRESS}`

## 🛠️ Development Commands

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to Chiliz testnet
npm run deploy

# Deploy to local network
npm run deploy:local

# Complete development setup
npm run setup

# Start local Hardhat node
npm run node
```

## 📁 Generated Files

After running setup, the following files are created:

- `deployment.json` - Contract deployment information
- `../app/backend/.env.contracts` - Backend environment variables
- `../app/frontend/src/config/contracts.ts` - Frontend contract configuration

## 🏆 Fan Token Integration

The contracts only support PSG Fan Tokens on Chiliz Chain:
- Validates token addresses before deployment
- Handles reward distribution in PSG tokens
- Provides balance and allowance checks

## 📖 API Integration

The contracts integrate with the existing campaign API:

### Backend Services
- `services/web3.ts` - Web3 service for blockchain interactions
- `services/blockchain-campaign.ts` - Campaign blockchain integration
- `controllers/campaign.controller.ts` - API endpoints

### Frontend Integration
- Network switching support with Privy
- Contract address configuration
- User reward claiming interface

## 🔐 Security Notes

- Private keys are used for deployment and admin operations
- Only PSG tokens are supported for security
- Contract addresses are hardcoded for testnet
- Emergency withdrawal functions for admins

## 📝 License

This project is part of the Fan Leaderboard application and follows the same license terms.

## 🤝 Contributing

This is a hackathon project. For production use, consider:
- Multi-signature wallet integration
- Gas optimization
- Additional token support
- Advanced security audits

---

**Happy building! 🚀** 
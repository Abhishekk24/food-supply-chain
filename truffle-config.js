const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {
  plugins: ['truffle-plugin-verify'],
  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY
  },
  networks: {
    sepolia: {
      provider: () => new HDWalletProvider({
        mnemonic: {
          phrase: process.env.MNEMONIC
        },
        providerOrUrl: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
        addressIndex: 0
      }),
      network_id: 11155111, // Sepolia's network ID
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    }
  },
  compilers: {
    solc: {
      version: "0.8.20",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};
require("dotenv").config();
const { OWNER_PRIVATE_KEY, RPC_Endpoints } = process.env;
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
    sepolia: {
      provider: () => new HDWalletProvider(OWNER_PRIVATE_KEY, RPC_Endpoints),
      network_id: 11155111,
    },
  },
  mocha: {
    // timeout: 100000
  },
  compilers: {
    solc: {
      version: "0.8.13",
    },
  },
};

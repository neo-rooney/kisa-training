require("dotenv").config();
const { OWNER_PRIVATE_KEY } = process.env;

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545/",
      accounts: [OWNER_PRIVATE_KEY!],
    },
  },
  solidity: "0.8.24",
};

export default config;

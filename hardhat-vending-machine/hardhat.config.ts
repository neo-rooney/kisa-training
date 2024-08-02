import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  networks: {
    local: {
      url: "http://127.0.0.1:7545/",
      accounts: [
        "0xecffef981f0ffad39cb7b15ae9ba4197f5390cbe74dced527babf0e7f4c12686",
      ],
    },
  },
  solidity: "0.8.24",
};

export default config;
